// 判定基準の書き戻し(lib/gate-criteria-yaml.mjs)の往復の試験(Issue #326 の項目)
//
// 基準が YAML の記号(`[ ] , : #` と引用符)を含んでも、書き戻した結果を YAML パーサが読み戻し、
// 元の文と一致することを確かめる。以前の書き戻しは素の文字列を並べるだけで、
// 記号を含む基準で YAML を壊した。
//
//   node scripts/test-gate-criteria-yaml.mjs   (npm run test:criteria)
import assert from 'node:assert/strict';
import YAML from 'yaml';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

test('criteria の行を持たないゲートへ書いても、次のゲートの行を書き換えない(突合 R-6)', () => {
  const text = 'gates:\n  - id: g-a\n    label: A\n  - id: g-b\n    criteria: [旧3]\n';
  assert.equal(writeCriteria(text, 'g-a', ['新']), text);
});

test('行末が CRLF の yaml にも書く(突合 R-6)', () => {
  const crlf = BASE.replace(/\n/g, '\r\n');
  assert.deepEqual(readYamlCriteria(writeCriteria(crlf, 'g-a', ['新1', '新2']))['g-a'], ['新1', '新2']);
});

// 検査本体の結線(突合 R-3): yaml の文だけを変えた写しで check-gate-criteria.mjs を起動し、文の一致の比較が働くことを確かめる。
// 比較の行を無効にすると、この試験が落ちる
test('検査本体: yaml の判定基準の文が第4章とずれると落ちる', () => {
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crit-'));
  try {
    const src = fs.readFileSync(path.join(ROOT, 'src/data/processes/integrated.yaml'), 'utf8');
    const first = YAML.parse(src).gates.find((g) => g.id === 'g-ci').criteria[0];
    assert.ok(src.includes(first), '前提: 基準1 が素の文字列で在る');
    const file = path.join(dir, 'integrated.yaml');
    fs.writeFileSync(file, src.replace(first, () => `${first}(改ざん)`));
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/check-gate-criteria.mjs')], { encoding: 'utf8', env: { ...process.env, GATE_CRITERIA_YAML: file } });
    assert.equal(r.status, 1);
    assert.match(`${r.stdout}${r.stderr}`, /G-5\(g-ci\): 判定基準 1 の文が一致しません/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log(`判定基準の書き戻しの試験: ${passed}件通過`);
