// 1.10.2 と H.8 の語の存在の検査(lib/claim-terms.mjs)の陽性・陰性対照(Issue #326 の項目)
//
//   node scripts/test-claim-terms.mjs   (npm run lint:refs に含む)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLAIM_TERMS, sectionLines, tableText, termProblems } from './lib/claim-terms.mjs';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const full = `| ${CLAIM_TERMS.join(' ')} |`;

test('語が両方にあれば適合', () => assert.deepEqual(termProblems(full, full), []));
test('H.8 側から1語が消えると落ちる(片側だけの修正)', () => {
  const p = termProblems(full, full.replace('未回収', ''));
  assert.equal(p.length, 1);
  assert.match(p[0], /H\.8.*未回収/);
});
test('1.10.2 側から1語が消えると落ちる', () => {
  const p = termProblems(full.replace('作業中の版', ''), full);
  assert.equal(p.length, 1);
  assert.match(p[0], /1\.10\.2.*作業中の版/);
});
test('節の切り出しは次の同階層の見出しまで', () => {
  const L = ['### 1.10.2 x', '| a |', '本文', '### 1.10.3 y', '| b |'];
  assert.equal(tableText(sectionLines(L, /^### 1\.10\.2\s/), 'a'), '| a |');
  assert.equal(sectionLines(L, /^### 9\s/), null);
});
test('見出し行で表を特定する(別の表は読まない。表が無ければ null)', () => {
  const S = ['| 使ってよい表現 | 条件 |', '| --- | --- |', '| x | y |', '', '| 使ってはならない表現 | 理由 |', '| 未回収 | z |'];
  assert.equal(tableText(S, '使ってよい表現'), S.slice(0, 3).join('\n'));
  assert.equal(tableText(S, '使ってはならない表現'), S.slice(4).join('\n'));
  assert.equal(tableText(S, '無い表'), null);
});
// 突合 R-1 の再現: 実物の H.8 の「使ってよい表現」の表だけから語を消す。同じ節の「使ってはならない表現」の表には
// 語が残る。節の全部の表を読む実装では、10 語のうち 5 語で通っていた
const DOCS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/content/docs/phase4-process-design');
const readLines = (p) => readFileSync(path.join(DOCS, p), 'utf8').split(/\r?\n/);
test('実物の H.8: 「使ってよい表現」の表から語を消すと、別の表に語が残っていても全語で落ちる', () => {
  const h8 = sectionLines(readLines('assurance-case.md'), /^## H\.8\s/);
  const a = tableText(sectionLines(readLines('overview.md'), /^### 1\.10\.2\s/), '述べること');
  const allowed = tableText(h8, '使ってよい表現').split('\n');
  assert.deepEqual(termProblems(a, allowed.join('\n')), [], '現行の本文は適合');
  assert.ok(h8.join('\n').includes('| 使ってはならない表現'), '別の表が節にある前提');
  for (const t of CLAIM_TERMS) {
    const mutated = h8.map((l) => (allowed.includes(l) ? l.split(t).join('') : l));
    const p = termProblems(a, tableText(mutated, '使ってよい表現'));
    assert.ok(p.some((x) => x.includes('H.8') && x.includes(`「${t}」`)), `${t} を消しても検出されない`);
  }
});
test('文の型が食い違っても、語が在れば通る(限界。ヘッダに開示)', () => {
  assert.deepEqual(termProblems(`${full} 件数は範囲の始点`, `${full} 件数は終点`), []);
});

console.log(`語の存在の試験: ${passed}件通過`);
