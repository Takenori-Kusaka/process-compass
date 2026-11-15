// scope-exempt.yaml の登録の検査(lib/scope-exempt.mjs)の陽性・陰性対照(Issue #326 の項目)
//
//   node scripts/test-scope-exempt.mjs   (npm run lint:scope に含む)
import assert from 'node:assert/strict';
import { exemptProblems } from './lib/scope-exempt.mjs';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const e = (heading, reason = '限定の否定であり、限定ではない') => ({ page: 'p/a', heading, reason });

test('使われた登録で reason があれば適合', () => {
  assert.deepEqual(exemptProblems([e('見出し1')], new Set(['p/a#見出し1'])), []);
});
test('使われなかった登録(見出しの改名後の残骸)は落ちる', () => {
  const p = exemptProblems([e('旧い見出し')], new Set());
  assert.equal(p.length, 1);
  assert.match(p[0], /免除にも当たっていません/);
});
test('reason が空・記号だけ・無い登録は落ちる', () => {
  for (const reason of [undefined, '', '-', '  ']) {
    const p = exemptProblems([{ page: 'p/a', heading: 'h', reason }], new Set(['p/a#h']));
    assert.equal(p.length, 1, JSON.stringify(reason));
    assert.match(p[0], /reason/);
  }
});
test('page か heading が無い登録は落ちる', () => {
  assert.equal(exemptProblems([{ heading: 'h', reason: '理由' }], new Set()).length, 1);
  assert.equal(exemptProblems([{ page: 'p/a', reason: '理由' }], new Set()).length, 1);
});
test('重複した登録は落ちる', () => {
  const p = exemptProblems([e('h'), e('h')], new Set(['p/a#h']));
  assert.equal(p.length, 1);
  assert.match(p[0], /重複/);
});
test('登録が無ければ適合', () => {
  assert.deepEqual(exemptProblems(undefined, new Set()), []);
});

console.log(`scope-exempt の試験: ${passed}件通過`);
