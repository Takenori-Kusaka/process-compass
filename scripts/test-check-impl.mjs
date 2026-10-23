// 実装マークの検査(check-impl.mjs)の陽性対照(Issue #292 / ADR-0076)
//
// 検査が既知の違反で落ちることを確かめる。検査が黙って通る故障(何も見ていない状態)を、
// 台帳の件数からは見分けられないためである。対象は scripts/lib/impl-inventory.mjs の純粋な関数。
//
//   node scripts/test-check-impl.mjs   (npm run test:impl)
import assert from 'node:assert/strict';
import {
  parseSections,
  checkInventory,
  marksInFences,
  numberedRows,
  plannedProblem,
  renderUndelivered,
} from './lib/impl-inventory.mjs';

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const PAGE = 'phase4-process-design/sample';
const DOC = [
  '---',
  'title: 見本',
  '---',
  '',
  '頁の冒頭の本文。',
  '',
  '## 1.1 節A',
  '',
  '### 1.1.1 子(適用: R1 の変更)',
  '',
  '規定の文。',
  '',
  '<!-- impl IMPL-0001 target=claude-md state=delivered check=manual note="見本" -->',
  '',
  '### 1.1.2 要求の表',
  '',
  '| # | 要求事項 |',
  '| --- | --- |',
  '| 1 | 一つ目 |',
  '| 2 | 二つ目 |',
  '',
  '## 1.2 節B',
  '',
  '### 様式',
  '',
  '```markdown',
  '## コードブロックの中の見出しは節にしない',
  '<!-- impl IMPL-0009 target=claude-md state=delivered note="ブロック内" -->',
  '```',
  '',
  '## 1.3 節C',
  '',
  '### 様式',
  '',
  '別の親の下の同じ見出し。',
  '',
  '### G-9 見本のゲート',
  '',
  '| # | 判定基準 | 確認方法 |',
  '| --- | --- | --- |',
  '| 1 | 基準 | 方法 |',
].join('\n');

const sections = parseSections(PAGE, DOC);
const key = (t) => `${PAGE}#${t}`;
const K = {
  lead: key('(冒頭)'),
  child: key('1.1 節A > 1.1.1 子'),
  table: key('1.1 節A > 1.1.2 要求の表'),
  formB: key('1.2 節B > 様式'),
  formC: key('1.3 節C > 様式'),
  gate: key('1.3 節C > G-9 見本のゲート'),
};
const ALL = Object.values(K);
const ledgerIds = new Set(['IMPL-0001', 'IMPL-0002']);

/** 正しい登録簿。各試験はここから1点だけ壊す */
function goodEntries() {
  return [
    { key: K.lead, status: 'none', category: 'explanation', reason: '頁の目的の文' },
    { key: K.child, status: 'marked', ids: ['IMPL-0001'] },
    {
      key: K.table,
      status: 'marked',
      ids: ['IMPL-0002'],
      rows: {
        要求事項1: { status: 'marked', ids: ['IMPL-0002'] },
        要求事項2: { status: 'none', category: 'not-imposed', reason: '許容の規定' },
      },
    },
    { key: K.formB, status: 'pending' },
    { key: K.formC, status: 'none', category: 'elsewhere', reason: '所在は別の節', location: K.child },
    { key: K.gate, status: 'kb' },
  ];
}
const run = (entries, opts = {}) =>
  checkInventory({
    sections: opts.sections ?? sections,
    entries,
    baseline: opts.baseline ?? ALL,
    baselineSize: opts.baselineSize ?? ALL.length,
    ledgerIds: opts.ledgerIds ?? ledgerIds,
  });
const fails = (errors, re) => assert(errors.some((e) => re.test(e)), `期待した失敗 ${re} が出ない: ${JSON.stringify(errors)}`);

console.log('節の区切りと鍵');
test('適用範囲の注記を外し、見出しの経路を鍵にする', () => {
  assert.deepEqual(sections.map((s) => s.key).sort(), [...ALL].sort());
});
test('同じ見出しでも親が違えば別の鍵になる(第6章の重複見出し)', () => {
  assert.notEqual(K.formB, K.formC);
});
test('本文の無い見出し(直後に下位の見出しが来る)は節に数えない', () => {
  assert(!sections.some((s) => s.key === key('1.1 節A')));
});
test('コードブロックの中の見出しとマークを読まない', () => {
  assert(!sections.some((s) => s.key.includes('コードブロックの中')));
  assert.deepEqual(sections.find((s) => s.key === K.formB).marks, []);
});
test('番号つきの要求事項の表の行を読む', () => {
  assert.deepEqual(sections.find((s) => s.key === K.table).rows, ['要求事項1', '要求事項2']);
  assert.deepEqual(numberedRows(['| # | 判定基準 |', '| --- | --- |', '| 1 | x |']), []);
});

console.log('陰性(正しい登録簿は通る)');
test('正しい登録簿で失敗が無い', () => {
  assert.deepEqual(run(goodEntries()), []);
});

console.log('陽性対照(既知の違反で落ちる)');
test('登録の無い節', () => {
  fails(run(goodEntries().filter((e) => e.key !== K.lead)), /登録の無い節があります/);
});
test('消えた鍵(見出しを改めた・節が消えた)', () => {
  fails(run([...goodEntries(), { key: key('1.9 消えた節'), status: 'pending' }]), /鍵に当たる節がありません/);
});
test('鍵の重複', () => {
  fails(run([...goodEntries(), { key: K.lead, status: 'pending' }]), /鍵が重複しています/);
});
test('節の経路が一意にならない', () => {
  fails(run(goodEntries(), { sections: [...sections, sections[0]] }), /節の鍵が一意になりません/);
});
test('挙げた識別子が台帳に無い', () => {
  const e = goodEntries();
  e[1].ids = ['IMPL-0001', 'IMPL-9999'];
  fails(run(e), /IMPL-9999 が台帳にありません/);
});
test('節の中のマークが登録に挙がっていない', () => {
  const e = goodEntries();
  e[1].ids = ['IMPL-0002'];
  fails(run(e), /節の中のマーク IMPL-0001 が登録に挙がっていません/);
});
test('「対象にしない」の節にマークがある', () => {
  const e = goodEntries();
  e[1] = { key: K.child, status: 'none', category: 'explanation', reason: '説明' };
  fails(run(e), /「対象にしない」の節に実装マークがあります/);
});
test('「対象にしない」の理由の区分が閉じた語彙の外', () => {
  const e = goodEntries();
  e[0].category = 'misc';
  fails(run(e), /理由の区分が不正です/);
});
test('「対象にしない」の理由が空', () => {
  const e = goodEntries();
  e[0].reason = ' ';
  fails(run(e), /理由が空です/);
});
test('「所在は他節」に所在が無い・所在の節が無い', () => {
  const e = goodEntries();
  delete e[4].location;
  fails(run(e), /所在\(location\)が要ります/);
  e[4].location = key('9.9 無い節');
  fails(run(e), /所在 .* に当たる節がありません/);
});
test('区分が閉じた語彙の外', () => {
  const e = goodEntries();
  e[0] = { key: K.lead, status: 'done' };
  fails(run(e), /区分が不正です/);
});
test('「マーク済み」に識別子が無い', () => {
  const e = goodEntries();
  e[5] = { key: K.gate, status: 'marked', ids: [] };
  fails(run(e), /識別子がありません/);
});
test('番号つきの表の行の区分が欠けている・余っている', () => {
  const e = goodEntries();
  delete e[2].rows['要求事項2'];
  e[2].rows['要求事項3'] = { status: 'marked', ids: ['IMPL-0002'] };
  const errors = run(e);
  fails(errors, /行 要求事項2 の区分がありません/);
  fails(errors, /行 要求事項3 が節の表にありません/);
});
test('「判定基準の表」の節に判定基準の表が無い', () => {
  const e = goodEntries();
  e[1] = { key: K.child, status: 'kb', ids: ['IMPL-0001'] };
  fails(run(e), /節に判定基準の表がありません/);
});
test('基準線に無い節を「未棚卸し」で登録する(変えた節を登録し直す経路)', () => {
  const e = goodEntries();
  e[0] = { key: K.lead, status: 'pending' };
  fails(run(e, { baseline: ALL.filter((k) => k !== K.lead) }), /基準線に無い節を「未棚卸し」で登録しています/);
});
test('基準線が凍結時の件数を超えて増える', () => {
  fails(run(goodEntries(), { baselineSize: ALL.length - 1 }), /凍結時の .* 件を超えています/);
});
test('基準線に消えた鍵が残る', () => {
  fails(run(goodEntries(), { baseline: [...ALL, key('9.9 無い節')], baselineSize: 99 }), /基準線の鍵に当たる節がありません/);
});

console.log('マークの書式と台帳');
test('コードブロックの中のマークを見つける(外のマークは見つけない)', () => {
  assert.deepEqual(marksInFences(DOC.split('\n')), [28]);
  assert.deepEqual(marksInFences(['<!-- impl IMPL-0001 target=x state=delivered note="y" -->']), []);
});
test('予定の降ろし先は state=undelivered だけが使える', () => {
  const planned = { id: 'p', kind: 'planned' };
  assert.match(plannedProblem(planned, 'delivered'), /予定\(planned\)/);
  assert.equal(plannedProblem(planned, 'undelivered'), null);
  assert.equal(plannedProblem({ id: 't', kind: 'template-file' }, 'delivered'), null);
});
test('降りていない規定が 0 件でも、台帳に節と件数の行を出す', () => {
  const out = renderUndelivered([], (t) => t, () => '').join('\n');
  assert.match(out, /### 降りていない規定/);
  assert.match(out, /降りていない規定: \*\*0件\*\*/);
  assert.match(out, /合否にも警戒の条件にも使いません/);
});

console.log(`\n実装マークの検査の試験: ${passed}件 合格`);
