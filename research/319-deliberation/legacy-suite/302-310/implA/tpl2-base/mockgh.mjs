// 出荷の集約の gh を模擬する(試験用)。MOCK_G5 が空なら gate-g5 の結果の記録なし、値があればその結論
import cp from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
const orig = cp.execFileSync;
cp.execFileSync = (cmd, args, opts) => {
  if (cmd !== 'gh') return orig(cmd, args, opts);
  if (args[0] === 'pr' && args[1] === 'view') {
    const head = orig('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const g5 = process.env.MOCK_G5 ? [{ name: 'gate-g5', conclusion: process.env.MOCK_G5 }] : [];
    return JSON.stringify({ number: Number(args[2]), title: 'feat: c', author: { login: 'acct-1' }, reviews: [], statusCheckRollup: g5, body: '## 作成を指示した者\n\n山田 太郎\n\n## リスク区分\n\nR3\n', mergeCommit: { oid: head }, commits: [{ oid: head }] });
  }
  return '[]';
};
syncBuiltinESMExports();
