// 判定基準の書き戻し(lib/gate-criteria-yaml.mjs)の往復の試験(Issue #326 の項目)
//
// 基準が YAML の記号(`[ ] , : #` と引用符)を含んでも、書き戻した結果を YAML パーサが読み戻し、
// 元の文と一致することを確かめる。以前の書き戻しは素の文字列を並べるだけで、
// 記号を含む基準で YAML を壊した。
//
//   node scripts/test-gate-criteria-yaml.mjs   (npm run test:criteria)
import assert from 'node:assert/strict';
import YAML from 'yaml';
import { readYamlCriteria, writeCriteria, formatCriterion } from './lib/gate-criteria-yaml.mjs';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const BASE = [
  'gates:',
  '  - id: g-a',
  '    label: A',
  '    criteria: [旧1, 旧2]',
  '    href: /x/',
  '  - id: g-b',
  '    label: B',
  '    criteria: [旧3]',
  '',
].join('\n');

const SYMBOLS = [
  '投資対効果が [事業基準] を満たす',
  'かつ: 確認済み #1',
  'a, b を分ける',
  '"引用" と \\ を含む',
  '{波括弧} と ? - 記号',
  '- 先頭がハイフン',
  '#先頭がシャープ',
  '末尾がコロン:',
  '記号なしの基準である。範囲を超える場合(行数ではない)は、確かめる',
];

test('素の基準は引用せずに書く(現行の 45 件の書式を変えない)', () => {
  for (const c of ['受入基準が検証可能な形式で書かれている', '1タスク=1レビュー単位', '範囲を超える見込みのタスクは、関心事が1つ(行数ではない)']) {
    assert.equal(formatCriterion(c), c);
  }
});

test('記号を含む基準は、書き戻して YAML パーサで読み戻すと元の文に一致する', () => {
  const next = writeCriteria(BASE, 'g-a', SYMBOLS);
  const got = readYamlCriteria(next);
  assert.deepEqual(got['g-a'], SYMBOLS);
  assert.deepEqual(got['g-b'], ['旧3'], '隣のゲートを巻き込まない');
});

test('置換は最初の ] で止まらず、criteria の行全体を置き換える', () => {
  const next = writeCriteria(BASE, 'g-a', ['[x] と [y]']);
  assert.equal(next.split('\n').filter((l) => l.includes('criteria:')).length, 2);
  assert.deepEqual(readYamlCriteria(next)['g-a'], ['[x] と [y]']);
  assert.doesNotThrow(() => YAML.parse(next));
});

test('置換文字列の特殊記号($& など)を含む基準もそのまま書く', () => {
  const c = '費用は $& と $1 を含む';
  assert.deepEqual(readYamlCriteria(writeCriteria(BASE, 'g-b', [c]))['g-b'], [c]);
});

test('書き戻しは冪等である(2回目の差分が 0)', () => {
  const once = writeCriteria(BASE, 'g-a', SYMBOLS);
  assert.equal(writeCriteria(once, 'g-a', SYMBOLS), once);
});

console.log(`判定基準の書き戻しの試験: ${passed}件通過`);
