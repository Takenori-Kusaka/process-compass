const fs=require('fs');
const cls=new Map(fs.readFileSync('classes.txt','utf8').split('\n').filter(Boolean).map(l=>{const p=l.split('|');return ['IMPL-'+p[0],p]}));
const na=new Set(['IMPL-0598','IMPL-1007','IMPL-0593']);
const marks=fs.readFileSync('marks.tsv','utf8').split('\n').filter(Boolean).map(l=>l.split('\t'));
const miss=marks.filter(m=>!cls.has(m[0])).map(m=>m[0]);
const extra=[...cls.keys()].filter(k=>!marks.some(m=>m[0]===k));
console.log('missing',miss.join(' '),'extra',extra.join(' '),'n',cls.size);
const rows=['IMPL\tissue\tfile:line\t規定の要約\t現target\t案\t理由\t降ろし先の候補'];
const cnt={};
for(const m of marks){const p=cls.get(m[0]);if(!p)continue;
 if(na.has(m[0])&&p[1]==='d')console.log('NOADOPT conflict',m[0]);
 rows.push([m[0],'#'+m[1],m[2],p[2],m[3],p[1],p[3],p[4]].join('\t'));
 const k=m[1]+p[1];cnt[k]=(cnt[k]||0)+1;}
fs.writeFileSync('inventory.tsv',rows.join('\n')+'\n');
const iss=['445','446','447','448','449','450'];
console.log('issue\ta\tb\tc\td\ttotal');
let T={a:0,b:0,c:0,d:0};
for(const i of iss){const r=['a','b','c','d'].map(c=>cnt[i+c]||0);r.forEach((v,j)=>T['abcd'[j]]+=v);console.log('#'+i+'\t'+r.join('\t')+'\t'+r.reduce((x,y)=>x+y));}
console.log('sum',JSON.stringify(T));
