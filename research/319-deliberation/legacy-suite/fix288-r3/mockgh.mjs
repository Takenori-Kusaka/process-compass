import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { syncBuiltinESMExports } from 'node:module';
const orig = cp.execFileSync;
const DIR = process.env.PIT_PRS ?? '';
cp.execFileSync = (cmd, args, opts) => {
  if (cmd !== 'gh') return orig(cmd, args, opts);
  if (args[0] === 'pr' && args[1] === 'view') {
    const f = path.join(DIR, args[2] + '.json');
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
    const e = new Error('no pull requests found'); e.stderr = 'no pull requests found'; throw e;
  }
  return '[]';
};
syncBuiltinESMExports();
