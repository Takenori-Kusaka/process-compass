// ADR の状態の行の後継参照の検査(Issue #326 の項目)
//
//   node scripts/check-adr-links.mjs   (npm run lint:refs に含む)
//
// 旧い ADR の状態の行が「置き換え(→ ADR-N …)」と後継を指すとき、ADR-N のステータスの節に
// 旧い ADR の番号があることを確かめる(adr/index.md の運用ルール5)。判定は scripts/lib/adr-links.mjs。
// 順方向だけを検査する。逆向きの欠落(後継が「置き換えます」と書き、旧い側が語彙の形で後継を書いていない)は
// 検出できない。旧い様式が混在し、偽陽性が多いためである。

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { forwardProblems } from './lib/adr-links.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'src/content/docs/adr');

const adrs = new Map();
for (const f of readdirSync(DIR)) {
  const n = /^(\d{4})-.*\.md$/.exec(f)?.[1];
  if (n) adrs.set(n, readFileSync(path.join(DIR, f), 'utf8'));
}

const problems = forwardProblems(adrs);
if (problems.length) {
  console.error('ADR の後継参照の検査で問題が見つかりました:\n');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`ADR の後継参照: ${adrs.size} 件を検査(状態の行の「置き換え(→ ADR-N)」の順方向。逆向きは検査しない)`);
