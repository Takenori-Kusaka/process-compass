const fs=require('fs'),path=require('path');
const root='src/content/docs';
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const out=[];
for(const f of walk(root).filter(f=>/\.mdx?$/.test(f))){
  fs.readFileSync(f,'utf8').split('\n').forEach((l,i)=>{
    const m=l.match(/<!-- impl (IMPL-\d+) (.*?) -->/);
    if(m&&/issue=324\b/.test(m[2])) out.push([m[1],f.replace(root+'/',''),i+1,m[2]]);
  });
}
fs.writeFileSync(process.argv[2],out.map(o=>o.join('\t')).join('\n'));
console.log(out.length);
