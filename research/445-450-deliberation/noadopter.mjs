import {readFileSync} from 'fs';
import YAML from 'yaml';
import {sectionKeyMatches} from '../../scripts/lib/impl-inventory.mjs';
const inv=YAML.parse(readFileSync('src/data/impl-inventory.yaml','utf8'));
const secs=inv.sections??inv.entries??Object.values(inv).find(Array.isArray);
const na=(YAML.parse(readFileSync('src/data/impl-no-adopter.yaml','utf8')).sections).map(x=>x.key);
const ms=new Map();
for(const s of secs){for(const id of (s.ids??s.marks??[]))ms.set(id,s.key);}
const lines=readFileSync('research/445-450-deliberation/marks.tsv','utf8').split('\n').filter(Boolean);
const out=[];
for(const l of lines){const id=l.split('\t')[0];const k=ms.get(id)??'';out.push(id+'\t'+(sectionKeyMatches(na,k)?'NOADOPT':'ok')+'\t'+k);}
console.log(out.filter(x=>x.includes('NOADOPT')).join('\n'));
console.log('missing',out.filter(x=>x.endsWith('\t')).length,'noadopt',out.filter(x=>x.includes('NOADOPT')).length);
