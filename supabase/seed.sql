insert into projects(id,name,owner,purpose,review_due) values
('10000000-0000-4000-8000-000000000001','Harbour Dispatch','Rina Patel','Delivery scheduling for fictional customers',current_date+30),
('10000000-0000-4000-8000-000000000002','Harbour Analytics','Alex Chen','Fictional reporting package',current_date-8)
on conflict do nothing;
insert into releases(id,project_id,version,target_date,distribution,namespace,source_sha256,source_created,source_document,created_by) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','2.0',current_date+5,'binary','https://example.invalid/sbom/dispatch-2',repeat('a',64),current_timestamp-interval '2 days','{"demo":true}','Demo importer'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','1.9',current_date-40,'binary','https://example.invalid/sbom/dispatch-1',repeat('b',64),current_timestamp-interval '42 days','{"demo":true}','Demo importer'),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','1.0',current_date-2,'service','https://example.invalid/sbom/analytics-1',repeat('c',64),current_timestamp-interval '3 days','{"demo":true}','Demo importer')
on conflict do nothing;
-- Fictional package identities and evidence, not claims about real packages.
insert into components(id,release_id,source_id,name,version,declared_license,concluded_license,copyright_text,supplier,purl) values
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','SPDXRef-route','demo-route-kit','2.1','MIT','NOASSERTION','Copyright 2026 Demo Route Authors','Organization: Fictional Route Works','pkg:npm/demo-route-kit@2.1'),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','SPDXRef-export','demo-export-kit','1.0','Apache-2.0','NOASSERTION','NOASSERTION','Organization: Fictional Export Works','pkg:npm/demo-export-kit@1.0'),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','SPDXRef-archive','demo-archive-kit','3.0','GPL-3.0-only','NOASSERTION','NOASSERTION','NOASSERTION',''),
('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002','SPDXRef-route','demo-route-kit','2.0','MIT','NOASSERTION','Copyright 2026 Demo Route Authors','Organization: Fictional Route Works','pkg:npm/demo-route-kit@2.0'),
('30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000003','SPDXRef-route','demo-route-kit','2.1','MIT','NOASSERTION','Copyright 2026 Demo Route Authors','Organization: Fictional Route Works','pkg:npm/demo-route-kit@2.1'),
('30000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003','SPDXRef-chart','demo-chart-kit','1.0','NOASSERTION','NOASSERTION','NOASSERTION','NOASSERTION','')
on conflict do nothing;
insert into reviews(id,component_id,decision,actor,reason,evidence,license_text,copyright_text,valid_until) values
('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','approved','Demo reviewer','Synthetic demo review only','fixtures/demo-evidence.txt','Synthetic demo licence text. Not for distribution.','Copyright 2026 Demo Route Authors',current_date+60),
('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000005','approved','Demo reviewer','Expired synthetic review','fixtures/demo-evidence.txt','Synthetic demo licence text. Not for distribution.','Copyright 2026 Demo Route Authors',current_date-2)
on conflict do nothing;
insert into tasks(id,release_id,title,owner,due) values
('50000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Obtain upstream notice and modification record','Rina Patel',current_date-3),
('50000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','Find the chart package licence evidence','Alex Chen',current_date-6)
on conflict do nothing;
