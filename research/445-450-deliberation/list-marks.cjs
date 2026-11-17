const fs=require('fs'),path=require('path');
const root='src/content/docs';
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
const out=[];
for(const f of walk(root).filter(f=>/\.mdx?$/.test(f))){
  fs.readFileSync(f,'utf8').split('\n').forEach((l,i)=>{
    const m=l.match(/<!-- impl (IMPL-\d+) (.*?) -->/);
    const iss=m&&m[2].match(/issue=(\d+)/);
    if(m&&/state=undelivered/.test(m[2])&&iss&&+iss[1]>=445&&+iss[1]<=450){
      const g=k=>{const r=m[2].match(new RegExp(k+String.fromCharCode(61)+"(\"([^\"]*)\"|[^ ]+)"));return r?(r[2]??r[1]):''};
      out.push([m[1],iss[1],f.split(path.sep).join("/").replace(root+'/','').replace(/\.mdx?$/,'')+':'+(i+1),g('target'),g('check'),g('plan'),g('review'),g('note')]);
    }
  });
}
out.sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0]));
fs.writeFileSync(process.argv[2],out.map(o=>o.join('\t')).join('\n'));
console.log(out.length);
