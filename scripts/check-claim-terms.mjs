// 1.10.2 と H.8 の語の存在の検査(Issue #326 の項目)
//
//   node scripts/check-claim-terms.mjs   (npm run lint:refs に含む)
//
// 所定の語(scripts/lib/claim-terms.mjs の CLAIM_TERMS)が、第1章 1.10.2 の表と附属書H H.8 の表の
// 両方に出ることを確かめる。
//
// 保証しないこと: 文の型の一致。語順、件数の数え方、言い換え、述べる条件の一致は、機械の検査では閉じない。
// 一致は人が確かめる(ADR-0134)。この検査を足した後も、その事実は変わらない。

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLAIM_TERMS, sectionLines, tableText, termProblems } from './lib/claim-terms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(ROOT, 'src/content/docs/phase4-process-design', p), 'utf8').split(/\r?\n/);

const s1 = sectionLines(read('overview.md'), /^### 1\.10\.2\s/);
const s2 = sectionLines(read('assurance-case.md'), /^## H\.8\s/);
const problems = [];
if (!s1) problems.push('第1章に 1.10.2 の見出しがありません');
if (!s2) problems.push('附属書H に H.8 の見出しがありません');
if (s1 && s2) problems.push(...termProblems(tableText(s1), tableText(s2)));

if (problems.length) {
  console.error('1.10.2 と H.8 の語の存在の検査で問題が見つかりました:\n');
  for (const p of problems) console.error(`  ${p}`);
  console.error('\n文の型の一致は、この検査では保証しません。人が確かめてください(ADR-0134)');
  process.exit(1);
}
console.log(`1.10.2 と H.8 の語の存在: ${CLAIM_TERMS.length} 語が両方の表にある(文の型の一致は検査しない)`);
