// 試験用: gh を模擬する。gh pr view <n> は $MOCK_PRS/<n>.json を返し、ほかは空の配列を返す。GitHub へ問い合わせない
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { syncBuiltinESMExports } from 'node:module';

const orig = cp.execFileSync;
const log = process.env.MOCK_GH_LOG;
cp.execFileSync = (cmd, args, opts) => {
  if (cmd !== 'gh') return orig(cmd, args, opts);
  if (log) fs.appendFileSync(log, `gh ${args.join(' ')}\n`);
  if (args[0] === 'pr' && args[1] === 'view') {
    const f = path.join(process.env.MOCK_PRS ?? '', `${args[2]}.json`);
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
    const e = new Error('no pull requests found');
    e.stderr = `no pull requests found for ${args[2]}`;
    throw e;
  }
  return '[]';
};
syncBuiltinESMExports();
