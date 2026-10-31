import {createHash} from 'node:crypto';
export const sha256=s=>createHash('sha256').update(s).digest('hex');
const string=(v,label,required=false)=>{if(v===undefined&&!required)return '';if(typeof v!=='string'||(required&&!v.trim()))throw Error(`${label} must be ${required?'nonempty ':''}text`);return v;};
export function parseSpdx(text){
 const doc=JSON.parse(text);
 if(!doc||!['SPDX-2.2','SPDX-2.3'].includes(doc.spdxVersion))throw Error('Expected SPDX 2.2 or 2.3 JSON; other formats need mapping');
 string(doc.documentNamespace,'documentNamespace',true);
 if(!/^https?:\/\//.test(doc.documentNamespace))throw Error('documentNamespace must be an HTTP(S) URI');
 const created=doc.creationInfo?.created;
 if(typeof created!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(created)||!Number.isFinite(Date.parse(created)))throw Error('creationInfo.created needs a UTC timestamp');
 if(new Date(created).toISOString().slice(0,10)!==created.slice(0,10))throw Error('Source timestamp needs a valid calendar date');
 if(Date.parse(created)>Date.now()+300000)throw Error('Source timestamp is in the future');
 if(!Array.isArray(doc.packages)||!doc.packages.length)throw Error('SPDX packages must be a nonempty array');
 const seen=new Set();
 const components=doc.packages.map((p,i)=>{
  if(!p||typeof p!=='object')throw Error(`Invalid package ${i+1}`);
  const source_id=string(p.SPDXID,'Package SPDXID',true);
  if(!/^SPDXRef-[A-Za-z0-9.-]+$/.test(source_id)||seen.has(source_id))throw Error('Package SPDXID must be valid and unique');seen.add(source_id);
  if(p.externalRefs!==undefined&&!Array.isArray(p.externalRefs))throw Error('externalRefs must be an array');
  const purl=(p.externalRefs||[]).find(x=>x.referenceType==='purl')?.referenceLocator;
  return {source_id,name:string(p.name,'Package name',true),version:string(p.versionInfo,'versionInfo'),declared_license:string(p.licenseDeclared,'licenseDeclared')||'NOASSERTION',concluded_license:string(p.licenseConcluded,'licenseConcluded')||'NOASSERTION',copyright_text:string(p.copyrightText,'copyrightText'),supplier:string(p.supplier,'supplier'),purl:string(purl,'purl')};
 });
 return {doc,components,namespace:doc.documentNamespace,source_created:created,hash:sha256(text)};
}
