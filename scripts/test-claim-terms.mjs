// 1.10.2 と H.8 の語の存在の検査(lib/claim-terms.mjs)の陽性・陰性対照(Issue #326 の項目)
//
//   node scripts/test-claim-terms.mjs   (npm run lint:refs に含む)
import assert from 'node:assert/strict';
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
  assert.equal(tableText(sectionLines(L, /^### 1\.10\.2\s/)), '| a |');
  assert.equal(sectionLines(L, /^### 9\s/), null);
});
test('文の型が食い違っても、語が在れば通る(限界。ヘッダに開示)', () => {
  assert.deepEqual(termProblems(`${full} 件数は範囲の始点`, `${full} 件数は終点`), []);
});

console.log(`語の存在の試験: ${passed}件通過`);
