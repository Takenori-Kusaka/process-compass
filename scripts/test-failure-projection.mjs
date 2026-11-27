// 困りごと起点の投影表の検査(check-failure-projection.mjs)の変異試験(Issue #456 / ADR-0266)
//
// 検査が既知の違反で落ちることを確かめる。実物の表を1か所ずつ壊し、条件 (a)〜(g) のそれぞれが検出されることと、
// 適合する実物が通ることを確かめる。
// 注意: 試験は実物の表の文字列を前提に壊す。行を改めるときは、本試験の前提の文字列も直す。審議中の行の試験は、実物の行11 から作った土台(deliberatingBase)で行う
//
//   node scripts/test-failure-projection.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkProjection, loadMarks, markSources, readMarks, splitParts, TARGET } from './check-failure-projection.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const text = fs.readFileSync(path.join(ROOT, 'src/content/docs', TARGET), 'utf8');
const marks = loadMarks();

let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`  ok ${name}`); }
const run = (t = text, m = marks) => checkProjection(t, m);
const detects = (problems, re) => assert.ok(problems.some((p) => re.test(p)), `検出されない: ${re}\n${problems.join('\n')}`);
/** 表の中だけの置換(1回) */
function mutateIn(base, from, to) {
  const s = base.indexOf('<!-- failure-projection:start -->'); const e = base.indexOf('<!-- failure-projection:end -->');
  const table = base.slice(s, e);
  assert.ok(table.includes(from), `試験の前提: 表に「${from}」がある`);
  return base.slice(0, s) + table.replace(from, to) + base.slice(e);
}
const mutate = (from, to) => mutateIn(text, from, to);
// 審議中の行の試験の土台。実物の表に審議中の行が無い間も (g) を試せるように、行11(仕様そのものが誤っている)を正しい形の審議中の行にする
const DELIB = '審議中(#455、2026-11-27 時点)';
const deliberatingBase = mutateIn(mutate('| 無い | 開示 | 開示:', '| 無い | 審議中 / 開示 | 開示:'), '| H.2、H.11 | — |', `| H.2、H.11 | ${DELIB} |`);
const mutateDelib = (to) => mutateIn(deliberatingBase, DELIB, to);
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
test('(c) 値の前方一致(人工知能が止める)は落ちる', () => detects(run(mutate('/ 人(G-6 基準1・2)/ 開示', '/ 人工知能が止める(G-6 基準1・2)/ 開示')), /\(c\)/));
test('(d) 未達の部分に IMPL が無いと落ちる', () => detects(run(mutate('未達(IMPL-1061。複数コミットを1つにまとめるマージで、途中のコミットの生成の条件が既定ブランチに残らないと読める。EV-0367。IMPL-0512。実行の記録そのものの保持。採用者)', '未達(実行の記録そのものの保持。採用者)')), /\(d\).*IMPL が無い/));
test('(b) 仮番号の IMPL は落ちる', () => detects(run(mutate('IMPL-0512。実行の記録そのものの保持。採用者', 'IMPL-TBD-457-1。実行の記録そのものの保持。採用者')), /\(b\).*仮番号/));
test('(g) 土台: 正しい形の審議中の行は通る', () => assert.deepEqual(run(deliberatingBase), []));
test('(g) 審議中の表示が定めた形でないと落ちる', () => detects(run(mutateDelib('審議中(#455、2026-11-27 時点 参考)')), /\(g\) 行11/));
test('マークの読み: 囲みのコードの中の例を読まない', () => {
  const m = readMarks(['```\n<!-- impl IMPL-9997 target=x state=delivered note="a" -->\n```']);
  assert.equal(m.has('IMPL-9997'), false);
});
test('マークの読み: 規約と台帳を読むファイルから除く', () => {
  const sep = path.sep;
  const files = [`a${sep}x.md`, `a${sep}community${sep}implementation-marking.md`, `a${sep}community${sep}implementation-ledger.md`];
  assert.deepEqual(markSources(files), [`a${sep}x.md`]);
});
test('(b) 仮番号の別の形(小文字・全角ハイフン・下線・3桁・5桁)は落ちる', () => {
  for (const w of ['impl-tbd-1', 'IMPL‐TBD', 'IMPL_TBD', 'IMPL-045', 'IMPL-04870'])
    detects(run(mutate('IMPL-0512。実行の記録そのものの保持。採用者', `IMPL-0512。${w}。実行の記録そのものの保持。採用者`)), /\(b\)/);
});
test('(g) 審議中の表示の日付が実在しないと落ちる', () => detects(run(mutateDelib('審議中(#455、2026-13-45 時点)')), /\(g\) 行11/));
test('(g) 審議中の行に日付が無いと落ちる', () => detects(run(mutateDelib('審議中(#455)')), /\(g\) 行11/));
test('(g) 審議中の行に番号が無いと落ちる', () => detects(run(mutateDelib('審議中(2026-11-27 時点)')), /\(g\) 行11/));
test('(g) 審議中でない行の表示が「—」でないと落ちる', () => detects(run(mutate('| G-5 基準1〜8、G-6 基準1・2、', '| G-5 基準1〜8、G-6 基準1・2、').replace(/(H\.9 問2・6 \| )—/, '$1審議中(#454、2026-11-27 時点)')), /\(g\) 行1/));
console.log(`${passed} 件の試験が通りました`);
