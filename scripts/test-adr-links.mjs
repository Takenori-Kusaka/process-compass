// ADR の後継参照の検査(lib/adr-links.mjs)の陽性・陰性対照(Issue #326 の項目)
//
//   node scripts/test-adr-links.mjs   (npm run lint:refs に含む)
import assert from 'node:assert/strict';
import { forwardProblems, successorsIn, statusSection } from './lib/adr-links.mjs';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const adr = (status) => `---\ntitle: x\n---\n\n## ステータス\n\n${status}\n\n## コンテキスト\n\n本文\n`;

test('状態の行の後継(複数・リンク形式・入れ子の括弧)を読む', () => {
  assert.deepEqual(successorsIn('採用(2026-08-06)。一部置き換え(→ ADR-0020 の決定2・決定4): 説明'), ['0020']);
  assert.deepEqual(successorsIn('一部置き換え(→ ADR-0058 の決定1、→ ADR-0072 の決定3)'), ['0058', '0072']);
  assert.deepEqual(successorsIn('一部置き換え(→ [ADR-0086](/process-compass/adr/0086-x/)の決定1)。続き'), ['0086']);
  assert.deepEqual(successorsIn('採用(2026-08-06)'), []);
});
test('ステータスの節だけを読む', () => {
  assert.match(statusSection(adr('採用')), /採用/);
});
test('後継の側に旧 ADR の番号があれば適合', () => {
  const m = new Map([
    ['0017', adr('採用。一部置き換え(→ ADR-0020 の決定2)')],
    ['0020', adr('採用。ADR-0017 の決定2 を置き換えます。')],
  ]);
  assert.deepEqual(forwardProblems(m), []);
});
test('後継の側に旧 ADR の番号が無ければ落ちる(元の欠け)', () => {
  const m = new Map([
    ['0017', adr('採用。一部置き換え(→ ADR-0020 の決定2)')],
    ['0020', adr('採用(2026-08-06)')],
  ]);
  const p = forwardProblems(m);
  assert.equal(p.length, 1);
  assert.match(p[0], /ADR-0020 のステータスの節に ADR-0017 がありません/);
});
test('後継のページが無ければ落ちる', () => {
  assert.equal(forwardProblems(new Map([['0017', adr('一部置き換え(→ ADR-0099 の決定1)')]])).length, 1);
});
test('本文(ステータスの外)に番号があるだけでは適合にならない', () => {
  const m = new Map([
    ['0017', adr('一部置き換え(→ ADR-0020 の決定2)')],
    ['0020', `${adr('採用')}\nADR-0017 に触れる本文\n`],
  ]);
  assert.equal(forwardProblems(m).length, 1);
});
test('逆向きの欠落は検出しない(限界。ヘッダに開示)', () => {
  const m = new Map([
    ['0017', adr('採用')],
    ['0020', adr('採用。ADR-0017 の決定2 を置き換えます。')],
  ]);
  assert.deepEqual(forwardProblems(m), []);
});

console.log(`ADR の後継参照の試験: ${passed}件通過`);
