#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseSpdx} from './lib/import-spdx.mjs';
import {table} from './lib/format.mjs';
export const readCommands=['projects','releases','release','components','review-queue','notices','overdue','compliance','changes','where-used','activity'];
export const commands=[...readCommands,'add-project','review-project','import','review-component','add-task','close-task','sign-off','export','draft-attribution','draft-review','weekly-review','help'];
const specs={
 projects:[],releases:[],release:['release'],components:['release'],'review-queue':[],notices:[],overdue:[],compliance:['release'],changes:['release','against'],'where-used':['name'],activity:[],
 'add-project':['name','owner','purpose','review-due'],'review-project':['project','review-due','reason'],
 import:['file','project','version','target-date','distribution'],
 'review-component':['component','release','decision','reason','evidence','valid-until','license-file','copyright-file','notice-status','notice-file','modified','change-notice'],
 'add-task':['release','title','owner','due'],'close-task':['task','resolution'],'sign-off':['release','reason'],
 export:['out'],'draft-attribution':['release'],'draft-review':['release'],'weekly-review':[],help:[]
};
const mutations=new Set(['add-project','review-project','import','review-component','add-task','close-task','sign-off']);
function args(argv){
 const [cmd='help',...rest]=argv;if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}; use help`);
 const flags={};const positional=[];
 for(const token of rest){
  if(!token.startsWith('--')){positional.push(token);continue;}
  const [k,...v]=token.slice(2).split('=');if(k in flags)throw Error(`Duplicate flag --${k}`);
  const bool=['json','dry-run'].includes(k);
  if(![...specs[cmd],'json',...(mutations.has(cmd)?['actor','dry-run']:[])].includes(k))throw Error(`Unknown flag --${k} for ${cmd}`);
  if(bool&&v.length)throw Error(`--${k} takes no value`);
  if(!bool&&(!v.length||!v.join('=').trim()))throw Error(`--${k}=VALUE is required`);
  flags[k]=bool?true:v.join('=');
 }
 if(cmd==='import'?(positional.length!==1||positional[0]!=='fossa'):positional.length>0)throw Error(cmd==='import'?'Use import fossa --file=export.spdx.json ...':'Unexpected positional argument');
 return {cmd,f:flags};
}
const need=(f,k)=>{if(typeof f[k]!=='string'||!f[k].trim())throw Error(`--${k}=VALUE is required`);return f[k].trim();};
function date(s,label){if(!/^\d{4}-\d\d-\d\d$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`${label} needs a valid YYYY-MM-DD date`);return s;}
const today=()=>new Date().toISOString().slice(0,10);
function fileText(name){const file=path.resolve(name);if(fs.statSync(file).size>20*1024*1024)throw Error('Input exceeds 20 MB');return fs.readFileSync(file,'utf8');}
function newFile(dir,name,body){const out=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir);fs.mkdirSync(out,{recursive:true,mode:0o700});const file=path.join(out,name);fs.writeFileSync(file,body,{flag:'wx',mode:0o600});return file;}
async function match(db,kind,needle,release=null){
 const queries={projects:'select id,name from projects order by name',releases:"select r.id,p.name||' / '||r.version as name from releases r join projects p on p.id=r.project_id order by name",components:'select c.id,c.name||\' @ \'||c.version as name from components c where ($1::uuid is null or c.release_id=$1) order by name',tasks:'select id,title as name from tasks order by title'};
 const rows=await db.query(queries[kind],kind==='components'?[release]:[]);const q=needle.toLowerCase();
 const exact=rows.filter(r=>r.id.toLowerCase()===q||r.name.toLowerCase()===q);
 const hits=exact.length?exact:rows.filter(r=>r.id.toLowerCase().startsWith(q)||r.name.toLowerCase().includes(q));
 if(hits.length!==1)throw Error(`${hits.length?'Ambiguous':'No match'} ${kind}: ${needle}. Candidates: ${(hits.length?hits:rows).map(x=>`${x.name} [${x.id}]`).join('; ')}`);
 return hits[0];
}
async function lockedRelease(db,id){await db.query('select id from releases where id=$1 for update',[id]);}
async function audit(db,actor,action,id,detail){await db.query('insert into audit_events(actor,action,entity_id,detail) values($1,$2,$3,$4)',[actor,action,id,JSON.stringify(detail)]);}
async function read(db,cmd,f){
 const rel=async()=> (await match(db,'releases',need(f,'release'))).id;
 if(cmd==='projects')return db.query('select p.id,p.name,p.owner,p.review_due,count(r.id)::int releases from projects p left join releases r on r.project_id=p.id group by p.id order by p.name');
 if(cmd==='releases')return db.query('select project,version,owner,target_date,components,blocked_components,open_tasks,readiness from release_readiness order by target_date,project');
 if(cmd==='release'){const id=await rel();return {release:await db.query('select * from release_readiness where id=$1',[id]),components:await db.query('select id,name,version,effective_license,decision,blockers from component_checks where release_id=$1 order by name',[id]),tasks:await db.query('select * from tasks where release_id=$1 order by due',[id]),signoffs:await db.query('select * from signoffs where release_id=$1 order by created_at',[id])};}
 if(cmd==='components')return db.query('select id,project,release,name,version,effective_license,reviewer,valid_until from component_checks where ($1::uuid is null or release_id=$1) order by project,release,name',[f.release?await rel():null]);
 if(cmd==='review-queue')return db.query('select project,release,name,effective_license,owner,blockers from component_checks where cardinality(blockers)>0 order by project,release,name');
 if(cmd==='notices')return db.query("select project,release,name,effective_license,blockers from component_checks where blockers && array['LICENSE_TEXT_MISSING','COPYRIGHT_MISSING','APACHE_NOTICE_UNVERIFIED','CHANGE_NOTICE_MISSING'] order by project,release,name");
 if(cmd==='overdue')return db.query("select project,release,title,owner,due,days_overdue from task_queue where status='open' and due<current_date order by due,title");
 if(cmd==='compliance'){
  const id=f.release?await rel():null;
  return {releases:await db.query('select project,version,readiness,blockers from release_readiness where ($1::uuid is null or id=$1) order by project,version',[id]),components:await db.query('select project,release,name,effective_license,blockers from component_checks where cardinality(blockers)>0 and ($1::uuid is null or release_id=$1) order by project,release,name',[id])};
 }
 if(cmd==='where-used'){const q=need(f,'name').toLowerCase();return (await db.query('select project,release,name,version,effective_license,owner,blockers from component_checks order by project,release,name')).filter(r=>r.name.toLowerCase().includes(q));}
 if(cmd==='activity')return db.query('select actor,action,entity_id,detail,created_at from audit_events order by created_at desc,id limit 100');
 if(cmd==='changes'){
  const to=await rel(),from=(await match(db,'releases',need(f,'against'))).id;
  const rs=await db.query('select project_id from releases where id=any($1::uuid[])',[[to,from]]);
  if(rs.length!==2||new Set(rs.map(x=>x.project_id)).size!==1)throw Error('Compare two distinct releases from the same project');
  const rows=await db.query('select release_id,name,version,effective_license from component_checks where release_id=any($1::uuid[]) order by name,version',[[to,from]]);
  const names=[...new Set(rows.map(x=>x.name))];
  return names.map(name=>{const versions=id=>rows.filter(x=>x.name===name&&x.release_id===id).map(x=>`${x.version} [${x.effective_license}]`).sort().join('; ');const before=versions(from),after=versions(to);return {name,before,after,change:!before?'added':!after?'removed':before===after?'unchanged':'changed'};}).filter(x=>x.change!=='unchanged');
 }
 throw Error(`No read handler for ${cmd}`);
}
async function mutate(db,cmd,f){
 const actor=need(f,'actor');let result,id;
 if(cmd==='add-project'){
  const d=date(need(f,'review-due'),'review-due');
  [result]=await db.query('insert into projects(name,owner,purpose,review_due) values($1,$2,$3,$4) returning *',[need(f,'name'),need(f,'owner'),need(f,'purpose'),d]);id=result.id;
 }else if(cmd==='review-project'){
  id=(await match(db,'projects',need(f,'project'))).id;const d=date(need(f,'review-due'),'review-due');if(d<today())throw Error('New project review date is in the past');need(f,'reason');
  [result]=await db.query('update projects set review_due=$1 where id=$2 returning *',[d,id]);
 }else if(cmd==='import'){
  const text=fileText(need(f,'file')),parsed=parseSpdx(text),pid=(await match(db,'projects',need(f,'project'))).id;
  await db.query('select id from projects where id=$1 for update',[pid]);
  const version=need(f,'version'),target=date(need(f,'target-date'),'target-date'),distribution=need(f,'distribution');
  if(!['internal','binary','source','service'].includes(distribution))throw Error('distribution must be internal, binary, source or service');
  const [old]=await db.query('select * from releases where project_id=$1 and version=$2',[pid,version]);
  if(old){if(old.source_sha256!==parsed.hash||old.target_date!==target||old.distribution!==distribution)throw Error('Release already has different content or settings; import a new version');return {id:old.id,skipped:true,components:parsed.components.length};}
  const [r]=await db.query('insert into releases(project_id,version,target_date,distribution,namespace,source_sha256,source_created,source_document,created_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id',[pid,version,target,distribution,parsed.namespace,parsed.hash,parsed.source_created,JSON.stringify(parsed.doc),actor]);id=r.id;
  for(const c of parsed.components)await db.query('insert into components(release_id,source_id,name,version,declared_license,concluded_license,copyright_text,supplier,purl) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,c.source_id,c.name,c.version,c.declared_license,c.concluded_license,c.copyright_text,c.supplier,c.purl]);
  result={id,components:parsed.components.length,source_sha256:parsed.hash,source_created:parsed.source_created,unmapped:'Full source retained. Relationships, files, snippets and extracted licence texts stay in the source document; they are not evaluated.'};
 }else if(cmd==='review-component'){
  const rid=f.release?(await match(db,'releases',f.release)).id:null;id=(await match(db,'components',need(f,'component'),rid)).id;
  const [c]=await db.query('select * from component_checks where id=$1',[id]);await lockedRelease(db,c.release_id);
  const decision=need(f,'decision');if(!['approved','rejected'].includes(decision))throw Error('decision must be approved or rejected');
  const reason=need(f,'reason'),evidence=need(f,'evidence');
  const modified=need(f,'modified');if(!['yes','no'].includes(modified))throw Error('modified must be yes or no');
  const notice=f['notice-status']||'unverified';if(!['unverified','absent','included'].includes(notice))throw Error('Invalid notice-status');
  const copyright=f['copyright-file']?fileText(f['copyright-file']).trim():c.copyright_text;
  const license=f['license-file']?fileText(f['license-file']).trim():'';
  const noticeText=f['notice-file']?fileText(f['notice-file']).trim():'';
  const valid=f['valid-until']?date(f['valid-until'],'valid-until'):null;
  if(decision==='approved'){
   if(!['MIT','Apache-2.0','BSD-3-Clause'].includes(c.effective_license))throw Error('Manual licence rule required; unsupported or compound licences cannot be approved by this base');
   if(!valid||valid<today())throw Error('Approval needs a nonexpired valid-until date');
   if(!license||!copyright?.trim()||['NOASSERTION','NONE'].includes(copyright.trim()))throw Error('Approval needs licence text and verified copyright evidence');
   if(c.effective_license==='Apache-2.0'&&(notice==='unverified'||(notice==='included'&&!noticeText)))throw Error('Apache approval needs verified notice-status and any notice text');
   if(modified==='yes'&&!f['change-notice']?.trim())throw Error('Modified packages need a change-notice');
  }
  [result]=await db.query('insert into reviews(component_id,decision,actor,reason,evidence,license_text,copyright_text,notice_status,notice_text,modified,change_notice,valid_until) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id,component_id,decision,actor,valid_until',[id,decision,actor,reason,evidence,license,copyright,notice,noticeText,modified==='yes',f['change-notice']||'',valid]);
 }else if(cmd==='add-task'){
  const rid=(await match(db,'releases',need(f,'release'))).id;await lockedRelease(db,rid);
  [result]=await db.query('insert into tasks(release_id,title,owner,due) values($1,$2,$3,$4) returning *',[rid,need(f,'title'),need(f,'owner'),date(need(f,'due'),'due')]);id=result.id;
 }else if(cmd==='close-task'){
  id=(await match(db,'tasks',need(f,'task'))).id;
  const [t]=await db.query('select * from tasks where id=$1',[id]);await lockedRelease(db,t.release_id);
  [result]=await db.query("update tasks set status='closed',resolution=$1 where id=$2 and status='open' returning *",[need(f,'resolution'),id]);if(!result)throw Error('Task already closed');
 }else if(cmd==='sign-off'){
  id=(await match(db,'releases',need(f,'release'))).id;await lockedRelease(db,id);
  const [r]=await db.query('select * from release_readiness where id=$1',[id]);
  if(r.blockers.length)throw Error(`Sign-off refused: ${r.blockers.join(', ')}`);
  if(r.created_by.toLowerCase()===actor.toLowerCase())throw Error('Release reviewer must differ from importer');
  [result]=await db.query('insert into signoffs(release_id,actor,reason,review_fingerprint) values($1,$2,$3,$4) returning id,release_id,actor',[id,actor,need(f,'reason'),r.review_fingerprint]);
 }else throw Error(`No mutation handler ${cmd}`);
 const detail={...f};delete detail.actor;delete detail.json;delete detail['dry-run'];
 await audit(db,actor,cmd,id,detail);return result;
}
export async function dispatch(db,argv){
 const {cmd,f}=args(argv);
 if(cmd==='help')return {commands,syntax:'npm run licenses -- COMMAND --flag=value [--json]',options:specs,mutation:'All database writes need --actor and accept --dry-run. import requires the positional vendor fossa. Release selector: project / version or id prefix. Read help and docs/replace-fossa.md.'};
 if(readCommands.includes(cmd))return read(db,cmd,f);
 if(mutations.has(cmd)){
  await db.exec('BEGIN');try{const result=await mutate(db,cmd,f);await db.exec(f['dry-run']?'ROLLBACK':'COMMIT');return f['dry-run']?{dry_run:true,result}:result;}catch(e){await db.exec('ROLLBACK');throw e;}
 }
 if(cmd==='export'){
  const out=path.resolve(need(f,'out'));const data={format:'license-review-backup-v1',exported_at:new Date().toISOString()};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of ['projects','releases','components','reviews','tasks','signoffs','audit_events'])data[t]=await db.query(`select * from ${t} order by id`);}finally{await db.exec('ROLLBACK');}
  fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return {file:out,counts:Object.fromEntries(Object.entries(data).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]))};
 }
 const stamp=`${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID().slice(0,8)}`;
 if(cmd==='weekly-review'){
  const data={releases:await read(db,'releases',{}),reviews:await read(db,'review-queue',{}),overdue:await read(db,'overdue',{})};
  const body=`# Weekly licence review\n\nDraft only. Nothing sent. Fictional records if demo data is loaded.\n\n${formatResult(data)}\n`;
  return {file:newFile('drafts',`weekly-review-${stamp}.md`,body),...data};
 }
 const id=(await match(db,'releases',need(f,'release'))).id;
 const [r]=await db.query('select * from release_readiness where id=$1',[id]);
 if(cmd==='draft-review'){
  const data=await read(db,'release',{release:id});return {file:newFile('drafts',`release-review-${stamp}.md`,`# Release review: ${r.project} ${r.version}\n\nDraft only. Nothing sent.\n\n${formatResult(data)}\n`)};
 }
 if(cmd==='draft-attribution'){
  const cs=await db.query('select c.name,c.version,c.effective_license,c.blockers,rv.license_text,rv.copyright_text,rv.notice_text,rv.change_notice from component_checks c left join reviews rv on rv.id=c.review_id where c.release_id=$1 order by c.name,c.version',[id]);
  const body=`# Attribution draft: ${r.project} ${r.version}\n\nDRAFT. Nothing sent. Status: ${r.readiness}. Release blockers: ${r.blockers.join(', ')||'none'}. A person must verify completeness and distribution obligations before use.\n\n`+cs.map(c=>`## ${c.name} ${c.version}\n\nLicence: ${c.effective_license}\nChecks: ${c.blockers.join(', ')||'recorded evidence complete'}\n\n${c.copyright_text||'[COPYRIGHT NOT VERIFIED]'}\n\n${c.license_text||'[LICENCE TEXT NOT RECORDED]'}\n\n${c.notice_text||''}\n\n${c.change_notice||''}`).join('\n\n');
  return {file:newFile('drafts',`attribution-${stamp}.md`,body),readiness:r.readiness};
 }
 throw Error(`Unhandled command ${cmd}`);
}
export function formatResult(value){
 if(Array.isArray(value)){
  if(!value.length)return '  (none)';
  if(typeof value[0]!=='object')return value.join(', ');
  return table(value.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,v instanceof Date?v.toISOString():Array.isArray(v)?v.join(', '):v&&typeof v==='object'?JSON.stringify(v):v]))),Object.keys(value[0]).map(key=>({key,label:key.replaceAll('_',' '),width:key==='blockers'?90:key==='detail'?100:50})));
 }
 if(value&&typeof value==='object')return Object.entries(value).map(([key,v])=>`${key}\n${typeof v==='object'?formatResult(v):String(v)}`).join('\n\n');
 return String(value??'');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const argv=process.argv.slice(2);args(argv);db=await getDb();const result=await dispatch(db,argv);console.log(argv.includes('--json')?JSON.stringify(result,null,2):formatResult(result));}
 catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
