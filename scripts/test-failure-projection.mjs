// 困りごと起点の投影表の検査(check-failure-projection.mjs)の変異試験(Issue #456 / ADR-0266)
//
// 検査が既知の違反で落ちることを確かめる。実物の表を1か所ずつ壊し、条件 (a)〜(g) のそれぞれが検出されることと、
// 適合する実物が通ることを確かめる。
//
//   node scripts/test-failure-projection.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProjection, loadMarks, readMarks, splitParts, TARGET } from './check-failure-projection.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const text = fs.readFileSync(path.join(ROOT, 'src/content/docs', TARGET), 'utf8');
const marks = loadMarks();

let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`  ok ${name}`); }
const run = (t = text, m = marks) => checkProjection(t, m);
const detects = (problems, re) => assert.ok(problems.some((p) => re.test(p)), `検出されない: ${re}\n${problems.join('\n')}`);
/** 表の中だけの置換(1回) */
function mutate(from, to) {
  const s = text.indexOf('<!-- failure-projection:start -->'); const e = text.indexOf('<!-- failure-projection:end -->');
  const table = text.slice(s, e);
  assert.ok(table.includes(from), `試験の前提: 表に「${from}」がある`);
  return text.slice(0, s) + table.replace(from, to) + text.slice(e);
}
const withMark = (id, over) => new Map([...marks, [id, { ...marks.get(id), ...over }]]);

test('対照: 実物の表は通る', () => assert.deepEqual(run(), []));
test('マークの読み: state と check を読む', () => {
  const m = readMarks(['<!-- impl IMPL-9999 target=x state=undelivered check=manual plan=adopter note="a" -->']);
  assert.deepEqual(m.get('IMPL-9999'), { state: 'undelivered', check: 'manual' });
});
test('区分の分割: 括弧の中の「/」で分けない', () => assert.deepEqual(splitParts('人(a/b)/ 開示'), ['人(a/b)', '開示']));
test('囲みが無ければ落ちる', () => detects(run(text.replace('<!-- failure-projection:end -->', '')), /囲み/));
test('(a) 見出しの列が違えば落ちる', () => detects(run(mutate('| 困りごと | 止める場所 |', '| 困りごと | 止める所 |')), /\(a\)/));
test('(a) 列の数が違えば落ちる', () => detects(run(mutate('| AI の作業量を、人が確かめきれない |', '| 余分 | AI の作業量を、人が確かめきれない |')), /7個/));
test('(b) 実在しない IMPL を引くと落ちる', () => detects(run(mutate('IMPL-0682', 'IMPL-9998')), /\(b\).*IMPL-9998/));
test('(c) 語彙の外の区分は落ちる', () => detects(run(mutate('/ 人(G-6 基準1・2)/ 開示', '/ 半自動(G-6 基準1・2)/ 開示')), /\(c\)/));
test('(d) 未達の升に state=delivered の IMPL があると落ちる', () => detects(run(text, withMark('IMPL-0512', { state: 'delivered' })), /\(d\).*IMPL-0512/));
test('(d) 区分の外に state=undelivered の IMPL があると落ちる', () => detects(run(text, withMark('IMPL-0682', { state: 'undelivered' })), /\(d\).*IMPL-0682/));
test('(e) 機械が止める に check=machine の IMPL が無いと落ちる', () => detects(run(text, withMark('IMPL-0142', { check: 'manual' })), /\(e\)/));
test('(e) 機械が止める に state=delivered の IMPL が無いと落ちる', () => detects(run(text, withMark('IMPL-0474', { state: 'undelivered' })), /\(e\)/));
test('(f) 最も弱い止め方が導かれる値と違えば落ちる', () => detects(run(mutate('開示: 人のレビューが全行を', '人: 人のレビューが全行を')), /\(f\) 行1/));
test('(f) 最も弱い止め方の先頭の値が無ければ落ちる', () => detects(run(mutate('人: 機械検査で確かめられない', '機械検査で確かめられない')), /\(f\) 行2/));
test('(g) 審議中の行に日付が無いと落ちる', () => detects(run(mutate('審議中(#457、2026-11-27 時点)', '審議中(#457)')), /\(g\) 行4/));
test('(g) 審議中の行に番号が無いと落ちる', () => detects(run(mutate('審議中(#457、2026-11-27 時点)', '審議中(2026-11-27 時点)')), /\(g\) 行4/));
test('(g) 審議中でない行の表示が「—」でないと落ちる', () => detects(run(mutate('| G-5 基準1〜8、G-6 基準1・2、', '| G-5 基準1〜8、G-6 基準1・2、').replace(/(H\.9 問2・6 \| )—/, '$1審議中(#454、2026-11-27 時点)')), /\(g\) 行1/));
console.log(`${passed} 件の試験が通りました`);
