import fs from 'node:fs';
let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>{
  const out = { stdin: JSON.parse(s||'{}'), envSession: process.env.CLAUDE_CODE_SESSION_ID ?? null, at: new Date().toISOString() };
  fs.appendFileSync(process.argv[2], JSON.stringify(out)+'\n');
});
