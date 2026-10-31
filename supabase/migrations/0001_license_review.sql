create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=clock_timestamp(); return new; end $$;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'Append-only record: add a new record instead'; end $$;
create table projects (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), owner text not null,
 purpose text not null, review_due date not null, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create unique index project_name on projects(lower(name));
create table releases (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects, version text not null,
 target_date date not null, distribution text not null check(distribution in ('internal','binary','source','service')),
 namespace text not null, source_sha256 text not null check(length(source_sha256)=64), source_created timestamptz not null,
 source_document jsonb not null, created_by text not null, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(),
 unique(project_id,version)
);
create table components (
 id uuid primary key default gen_random_uuid(), release_id uuid not null references releases, source_id text not null,
 name text not null, version text not null default '', declared_license text not null, concluded_license text not null,
 copyright_text text not null default '', supplier text not null default '', purl text not null default '',
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp(), unique(release_id,source_id)
);
create table reviews (
 id uuid primary key default gen_random_uuid(), component_id uuid not null references components,
 decision text not null check(decision in ('approved','rejected')), actor text not null, reason text not null, evidence text not null,
 license_text text not null default '', copyright_text text not null default '', notice_status text not null default 'unverified' check(notice_status in ('unverified','absent','included')),
 notice_text text not null default '', modified boolean not null default false, change_notice text not null default '', valid_until date,
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create index reviews_component on reviews(component_id,created_at desc);
create table tasks (
 id uuid primary key default gen_random_uuid(), release_id uuid not null references releases, title text not null, owner text not null,
 due date not null, status text not null default 'open' check(status in ('open','closed')), resolution text not null default '',
 created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create table signoffs (
 id uuid primary key default gen_random_uuid(), release_id uuid not null references releases, actor text not null, reason text not null,
 review_fingerprint text not null, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), actor text not null, action text not null, entity_id uuid not null,
 detail jsonb not null, created_at timestamptz not null default clock_timestamp(), updated_at timestamptz not null default clock_timestamp()
);
-- All component checks are review evidence checks, never a legal certification.
create view component_checks as
select c.*, p.name as project, r.version as release, p.owner, rv.id as review_id, rv.actor as reviewer, rv.decision, rv.valid_until,
 coalesce(nullif(c.concluded_license,'NOASSERTION'),nullif(c.declared_license,'NOASSERTION'),'NOASSERTION') as effective_license,
 array_remove(array[
 case when coalesce(nullif(c.concluded_license,'NOASSERTION'),nullif(c.declared_license,'NOASSERTION'),'NOASSERTION') not in ('MIT','Apache-2.0','BSD-3-Clause') then 'MANUAL_LICENSE_REVIEW' end,
 case when rv.id is null or rv.decision <> 'approved' then 'REVIEW_NOT_APPROVED' end,
 case when rv.valid_until is null or rv.valid_until < current_date then 'REVIEW_EXPIRED_OR_UNDATED' end,
 case when trim(coalesce(rv.evidence,''))='' then 'EVIDENCE_MISSING' end,
 case when trim(coalesce(rv.license_text,''))='' then 'LICENSE_TEXT_MISSING' end,
 case when trim(coalesce(rv.copyright_text,'')) in ('','NOASSERTION','NONE') then 'COPYRIGHT_MISSING' end,
 case when coalesce(nullif(c.concluded_license,'NOASSERTION'),c.declared_license)='Apache-2.0' and (rv.notice_status is null or rv.notice_status='unverified' or (rv.notice_status='included' and trim(rv.notice_text)='')) then 'APACHE_NOTICE_UNVERIFIED' end,
 case when rv.modified and trim(rv.change_notice)='' then 'CHANGE_NOTICE_MISSING' end
 ],null) as blockers
from components c join releases r on r.id=c.release_id join projects p on p.id=r.project_id
left join lateral(select * from reviews x where x.component_id=c.id order by x.created_at desc,x.id desc limit 1) rv on true;
create view release_readiness as
select z.*, case when cardinality(z.blockers)>0 then 'blocked' when z.signed_fingerprint=z.review_fingerprint then 'approved' else 'ready for sign-off' end as readiness
from (
 select r.id,p.name as project,p.owner,r.version,r.target_date,r.distribution,r.source_created,r.created_by,
 (select count(*)::int from components c where c.release_id=r.id) as components,
 (select count(*)::int from component_checks c where c.release_id=r.id and cardinality(c.blockers)>0) as blocked_components,
 (select count(*)::int from tasks t where t.release_id=r.id and t.status='open') as open_tasks,
 coalesce((select string_agg(coalesce(c.review_id::text,'pending'),',' order by c.id) from component_checks c where c.release_id=r.id),'') as review_fingerprint,
 s.review_fingerprint as signed_fingerprint,s.actor as signed_by,
 array_remove(array[
 case when not exists(select 1 from components c where c.release_id=r.id) then 'EMPTY_INVENTORY' end,
 case when exists(select 1 from component_checks c where c.release_id=r.id and cardinality(c.blockers)>0) then 'COMPONENT_REVIEW_BLOCKED' end,
 case when exists(select 1 from tasks t where t.release_id=r.id and t.status='open') then 'OPEN_TASKS' end,
 case when p.review_due < current_date then 'PROJECT_REVIEW_OVERDUE' end,
 case when r.source_created < current_timestamp - interval '30 days' then 'INVENTORY_OLDER_THAN_30_DAYS' end
 ],null) as blockers
 from releases r join projects p on p.id=r.project_id
 left join lateral(select * from signoffs s where s.release_id=r.id order by s.created_at desc,s.id desc limit 1) s on true
) z;
create view task_queue as
select t.id,p.name as project,r.version as release,t.title,t.owner,t.due,(current_date-t.due) as days_overdue,t.status,t.resolution
from tasks t join releases r on r.id=t.release_id join projects p on p.id=r.project_id;
do $$ declare t text; begin
 foreach t in array array['projects','releases','components','reviews','tasks','signoffs','audit_events'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
 foreach t in array array['releases','components','reviews','signoffs','audit_events'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_record()',t);
 end loop;
end $$;
revoke all on component_checks,release_readiness,task_queue from public;
