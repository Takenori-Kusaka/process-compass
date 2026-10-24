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
  baselineDigest,
  markAttrProblems,
  machineTestProblems,
  parentTestWired,
  templateTestWired,
  undeliveredRank,
  overdueCount,
  untracedProblems,
  OVERDUE_PREFIX,
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
  '<!-- impl IMPL-0002 target=claude-md state=delivered check=manual note="見本の表" -->',
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
  '### 手続の表',
  '',
  '| # | 手続 |',
  '| --- | --- |',
  '| 1 | 報告する |',
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
  proc: key('1.3 節C > 手続の表'),
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
    { key: K.proc, status: 'pending' },
    { key: K.gate, status: 'kb' },
  ];
}
/** 基準線は凍結の時点で未棚卸しだった節だけ(突合 X-2) */
const BASE = [K.formB, K.proc];
const run = (entries, opts = {}) =>
  checkInventory({
    sections: opts.sections ?? sections,
    entries,
    baseline: opts.baseline ?? BASE,
    baselineDigest: opts.digest ?? baselineDigest(BASE),
    ledgerIds: opts.ledgerIds ?? ledgerIds,
    baseEntries: opts.baseEntries ?? null,
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
test('番号つきの表の行を、見出しの語でなく構造(1列目が「#」・行が番号)で読む', () => {
  assert.deepEqual(sections.find((s) => s.key === K.table).rows, ['要求事項1', '要求事項2']);
  assert.deepEqual(sections.find((s) => s.key === K.proc).rows, ['手続1']);
  assert.deepEqual(numberedRows(['| # | 行わないこと |', '| --- | --- |', '| 1 | x |', '| 2 | y |']), ['行わないこと1', '行わないこと2']);
  assert.deepEqual(numberedRows(['| 項目 | 内容 |', '| --- | --- |', '| 1 | x |']), []);
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
  fails(run(e), /基準線に無い節を「未棚卸し」で登録しています/);
});
test('棚卸し済みの節は基準線に入らず、未棚卸しへ戻すと落ちる(基準線の側)', () => {
  const e = goodEntries();
  e[1] = { key: K.child, status: 'pending' };
  fails(run(e), /基準線に無い節を「未棚卸し」で登録しています/);
});
test('基準線へ鍵を足すと、凍結の要約と食い違って落ちる', () => {
  const grown = [...BASE, K.lead];
  const e = goodEntries();
  e[0] = { key: K.lead, status: 'pending' };
  fails(run(e, { baseline: grown }), /凍結の時点から変わっています/);
});
test('基準線の鍵を入れ替える(改名した節の鍵へ置換する)と落ちる', () => {
  fails(run(goodEntries(), { baseline: [K.formB, key('1.3 節C > 改名した節')] }), /凍結の時点から変わっています/);
});
test('基準線から鍵を外すと落ちる', () => {
  fails(run(goodEntries(), { baseline: [K.formB] }), /凍結の時点から変わっています/);
});
test('節が消えた基準線の鍵は無視する(失敗にしない)', () => {
  const gone = [...BASE, key('9.9 消えた節')];
  assert.deepEqual(run(goodEntries(), { baseline: gone, digest: baselineDigest(gone) }), []);
});
test('比較の基点で棚卸し済みだった節を、未棚卸しへ戻すと落ちる', () => {
  const baseEntries = goodEntries().map((x) => (x.key === K.formB ? { key: K.formB, status: 'none' } : x));
  fails(run(goodEntries(), { baseEntries }), /「未棚卸し」へ戻しています/);
});
test('比較の基点が無ければ、戻したことを確かめない(基点の無い環境の限界)', () => {
  assert.deepEqual(run(goodEntries(), { baseEntries: null }), []);
});
test('「マーク済み」の節の中にマークが無い', () => {
  const e = goodEntries();
  e[4] = { key: K.formC, status: 'marked', ids: ['IMPL-0001'] };
  const errors = run(e);
  fails(errors, /節の中に実装マークがありません/);
  fails(errors, /挙げた識別子 IMPL-0001 が節の中にありません/);
});
test('「マーク済み」に他の節の識別子を挙げる', () => {
  const e = goodEntries();
  e[1].ids = ['IMPL-0001', 'IMPL-0002'];
  fails(run(e), /挙げた識別子 IMPL-0002 が節の中にありません/);
});
test('「マーク済み」の所在・行の所在に当たる節が無い', () => {
  const e = goodEntries();
  e[1].location = [key('9.9 無い節')];
  fails(run(e), /所在 .*9\.9 無い節 に当たる節がありません/);
  const f = goodEntries();
  f[2].rows['要求事項1'].location = [key('9.8 無い節')];
  fails(run(f), /行 要求事項1 の所在 .* に当たる節がありません/);
});
test('「マーク済み」の所在は、実在する節なら通る', () => {
  const e = goodEntries();
  e[1].location = [K.formC];
  assert.deepEqual(run(e), []);
});
test('「未棚卸し」の節では、番号つきの表の行の区分を求めない', () => {
  assert(!run(goodEntries()).some((x) => x.includes('手続1')));
});

console.log('マークの書式と台帳');
test('コードブロックの中のマークを見つける(外のマークは見つけない)', () => {
  assert.deepEqual(marksInFences(DOC.split('\n')), [30]);
  assert.deepEqual(marksInFences(['<!-- impl IMPL-0001 target=x state=delivered note="y" -->']), []);
});
test('字下げのコードブロック(4字以上の字下げ)のマークを見つける', () => {
  assert.deepEqual(marksInFences(['本文', '', '    <!-- impl IMPL-0001 target=x state=delivered note="y" -->']), [3]);
  assert.deepEqual(marksInFences(['\t<!-- impl IMPL-0001 target=x state=delivered note="y" -->']), [1]);
});
test('行内のバッククォートの中のマークを見つける', () => {
  assert.deepEqual(marksInFences(['書式は `<!-- impl IMPL-0001 target=x state=delivered note="y" -->` です']), [1]);
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

console.log('検査の手段・計画・逆向きの追跡(#314 / ADR-0084)');
const ok = (a) => markAttrProblems({ target: 't', state: 'delivered', note: 'n', ...a });
test('check を欠くマークを落とす', () => {
  assert(ok({}).some((x) => /check がありません/.test(x)));
});
test('不正な check の値を落とす(陽性の対照)', () => {
  assert(ok({ check: 'auto' }).some((x) => /check が不正です: auto/.test(x)));
  assert(ok({ check: 'Machine' }).some((x) => /check が不正です/.test(x)));
  assert.deepEqual(ok({ check: 'manual' }), []);
});
test('check=machine は test= を要する。test= は machine だけに書く', () => {
  assert(ok({ check: 'machine' }).some((x) => /test= がありません/.test(x)));
  assert.deepEqual(ok({ check: 'machine', test: 'x.mjs' }), []);
  assert(ok({ check: 'manual', test: 'x.mjs' }).some((x) => /machine のマークだけ/.test(x)));
});
test('check=presence は注記に規則を運ぶ単位を要する', () => {
  assert(ok({ check: 'presence', note: '節の見出しを確かめる' }).some((x) => /単位/.test(x)));
  assert(ok({ check: 'presence', note: '単位: 節' }).some((x) => /単位/.test(x)));
  for (const u of ['欄', 'キー', '行', 'ファイル']) assert.deepEqual(ok({ check: 'presence', note: `x(単位: ${u})` }), []);
});
test('state=undelivered は plan を要し、scheduled は issue と review、adopter は decision を要する', () => {
  const u = (a) => markAttrProblems({ target: 't', state: 'undelivered', check: 'manual', note: 'n', ...a });
  assert(u({}).some((x) => /plan がありません/.test(x)));
  assert(u({ plan: 'later' }).some((x) => /plan が不正です/.test(x)));
  assert(u({ plan: 'scheduled', review: '2027-04' }).some((x) => /issue=/.test(x)));
  assert(u({ plan: 'scheduled', issue: '314', review: '2027-13' }).some((x) => /review=YYYY-MM/.test(x)));
  assert.deepEqual(u({ plan: 'scheduled', issue: '314', review: '2027-04' }), []);
  assert(u({ plan: 'adopter' }).some((x) => /decision=/.test(x)));
  assert.deepEqual(u({ plan: 'adopter', decision: 'ADR-0084' }), []);
});
test('採用者が実装するにできない節では plan=adopter を落とす', () => {
  const a = { target: 't', state: 'undelivered', check: 'manual', note: 'n', plan: 'adopter', decision: 'ADR-0084' };
  assert(markAttrProblems(a, { noAdopter: true }).some((x) => /採用者が実装する」にできません/.test(x)));
  assert.deepEqual(markAttrProblems({ ...a, plan: 'scheduled', issue: '1', review: '2027-01', decision: undefined }, { noAdopter: true }), []);
});
test('plan などは state=delivered に書けない', () => {
  assert(ok({ check: 'manual', plan: 'scheduled' }).some((x) => /state=undelivered のマークだけ/.test(x)));
});
test('machine の試験は ng と ok の目印を要し、集約から実行される', () => {
  const files = { 'a.mjs': '// IMPL-0001:ng x\n// IMPL-0001:ok y\n', 'b.mjs': '// IMPL-0001:ng だけ\n', 'c.mjs': '// IMPL-00011:ng IMPL-00011:ok\n' };
  const env = (wired = null) => ({ exists: (f) => f in files, read: (f) => files[f], wired: () => wired });
  assert.deepEqual(machineTestProblems('IMPL-0001', 'a.mjs', env()), []);
  assert(machineTestProblems('IMPL-0001', 'b.mjs', env()).some((x) => /IMPL-0001:ok/.test(x)));
  assert(machineTestProblems('IMPL-0001', 'c.mjs', env()).length === 2, '番号の前方一致で目印に数えない');
  assert(machineTestProblems('IMPL-0001', 'z.mjs', env()).some((x) => /ありません/.test(x)));
  assert(machineTestProblems('IMPL-0001', 'a.mjs', env('結線なし')).includes('結線なし'));
});
test('親の試験は package.json の check から npm run で辿れる', () => {
  const scripts = { check: 'npm run a && npm run b', a: 'node x.mjs', b: 'npm run c', c: 'node scripts/t.mjs --flag', d: 'node scripts/u.mjs' };
  assert.equal(parentTestWired(scripts, 'scripts/t.mjs'), null);
  assert.match(parentTestWired(scripts, 'scripts/u.mjs'), /check から実行されていません/);
  assert.match(parentTestWired(scripts, 'scripts/t'), /check から実行されていません/);
});
test('テンプレートの試験は、集約が合否に使うジョブの run: から実行される', () => {
  const jobs = new Map([['contract', '    steps:\n      - run: node scripts/gate/test-a.mjs\n'], ['loose', '      - run: node scripts/gate/test-b.mjs\n']]);
  const eff = new Set(['contract']);
  assert.equal(templateTestWired(jobs, eff, 'template/scripts/gate/test-a.mjs'), null);
  assert.match(templateTestWired(jobs, eff, 'template/scripts/gate/test-b.mjs'), /合否に使われていません/);
  assert.match(templateTestWired(jobs, eff, 'template/scripts/gate/test-c.mjs'), /run: から実行されていません/);
});
test('降りていない規定の順序: 採用者が実装するにできない → G-7・G-8・R1 → その他', () => {
  const rank = (m, na = false) => undeliveredRank(m, () => na);
  assert.equal(rank({ note: 'G-7 の記録' }, true), 1);
  assert.equal(rank({ note: 'G-8 の成立' }), 2);
  assert.equal(rank({ note: 'R1 の決定' }), 2);
  assert.equal(rank({ note: 'その他' }), 3);
});
test('見直しの年月を過ぎた件数は scheduled だけを数える', () => {
  const rows = [
    { plan: 'scheduled', review: '2026-09' },
    { plan: 'scheduled', review: '2026-10' },
    { plan: 'adopter', decision: 'ADR-0084' },
  ];
  assert.equal(overdueCount(rows, '2026-10'), 1);
  assert.equal(overdueCount(rows, '2026-11'), 2);
});
test('台帳: 降ろし先の種別で書き分け、列の見出しに「(予定)」を書かない', () => {
  const rows = [
    { id: 'IMPL-0001', note: 'a', target: 'p', plan: 'scheduled' },
    { id: 'IMPL-0002', note: 'b', target: 'f', plan: 'adopter' },
  ];
  const out = renderUndelivered(rows, (t) => t, () => 'x', { kindOf: (t) => (t === 'p' ? 'planned' : 'template-file'), planOf: (m) => m.plan, overdue: 1, month: '2026-10' }).join('\n');
  assert.match(out, /\| 識別子 \| 規定 \| 降ろし先 \| 計画 \| 記載箇所 \|/);
  assert.doesNotMatch(out, /降ろし先\(予定\) \|/);
  assert.match(out, /\| p\(予定の置き場\) \| scheduled \|/);
  assert.match(out, /\| f \| adopter \|/);
  assert.match(out, /「予定」の 1 件/);
  assert.match(out, /実在する 1 件/);
  assert(out.split('\n').some((l) => l.startsWith(OVERDUE_PREFIX) && /1件/.test(l)));
});
test('逆向きの追跡: 登録簿にも除外の一覧にも無いファイルを落とす', () => {
  const files = ['scripts/gate/a.mjs', 'scripts/gate/b.mjs', 'scripts/gate/c.mjs'];
  const traced = new Set(['scripts/gate/a.mjs']);
  const exempt = [{ path: 'scripts/gate/b.mjs', reason: 'library', why: '部品' }];
  const p = untracedProblems(files, traced, exempt);
  assert.equal(p.length, 1);
  assert.match(p[0], /scripts\/gate\/c\.mjs/);
  assert.deepEqual(untracedProblems(files.slice(0, 2), traced, exempt), []);
  assert(untracedProblems(files.slice(0, 2), traced, [{ path: 'scripts/gate/b.mjs', reason: 'other', why: 'x' }]).some((x) => /理由の区分が不正/.test(x)));
  assert(untracedProblems(files.slice(0, 2), traced, [{ path: 'scripts/gate/b.mjs', reason: 'infra', why: '' }]).some((x) => /理由\(why\)が空/.test(x)));
  assert(untracedProblems(files.slice(0, 2), traced, [...exempt, { path: 'scripts/gate/gone.mjs', reason: 'infra', why: 'x' }]).some((x) => /テンプレートにありません/.test(x)));
});

console.log(`\n実装マークの検査の試験: ${passed}件 合格`);
