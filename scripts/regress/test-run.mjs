#!/usr/bin/env node
// 回帰の試験の実行役(run.mjs)と補助(suite/lib.mjs)の振る舞いの試験(#319 裁定 R-2.5・R-2.6・R-4・R-6)。
//
//   node scripts/regress/test-run.mjs   (npm run test:regress が先に流す)
//
// 作った場面のスクリプトを run.mjs --suite で流し、次を確かめる。実行役が黙って通る故障(失敗を終了コードへ渡さない、
// 印が何も見ていない)を、スイートの通過の出力からは見分けられないためである。
//   - 終了コード: 通る場面だけなら 0、落ちる場面・場面の外の中断・場面の記録の無いスクリプトがあれば 1
//   - 作業の場所: os.tmpdir() の下に作り、作業ツリーの外である
//   - 落ちることを期待する印: 印のとおりに落ちれば通る。予期せず通る・別の理由で落ちる・見直しの時期を過ぎる・欄が欠けるは失敗
//   - 根に従属する場面: 根が印のとおりに落ちている間の失敗は通る。根が落ちているのに通れば失敗
//   - 期待値を改めた記録(changed)の欄が欠ければ失敗
//   - 拒否の照合: 語は拒否の理由の1件の中で、拒否の対象は差分の節の中で照合する
//   - 印は拒否の理由の集合で照合する。期待した理由に別の理由が加わったら失敗(§8 X-4)。観測で照合する印もある
//   - 印の見直しの月は 01〜12 で、付けた日から 6 か月以内(§8 X-11)
//   - 宣言した場面の一覧と実行した場面が一致しなければ失敗(§8 X-3)。宣言が無くても失敗
//   - 固定する決定に、決定(ADR の決定・K 番号・標準の条項)を含まない場面は失敗(§8 X-1)
//   - 作業用の複製の最上位が複製そのものでなければ、複製を作る段で止める(§8 X-16)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unfrozenIn, unfrozenClockUses } from './lib/unfrozen-clock.mjs';
import { fresh, sceneListDiff } from './run.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const LIB = pathToFileURL(path.join(HERE, 'suite', 'lib.mjs')).href;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pit-regress-test-'));
const suite = path.join(tmp, 'suite');
fs.mkdirSync(suite);

// 印の日付は実行した日から作る(見直しの時期の判定は実時間による。固定の日付は時期を過ぎて試験が腐る)
const ON = new Date().toISOString().slice(0, 10);
const REVIEW = (() => {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 7);
})();
const KFD = `on: '${ON}', review: '${REVIEW}'`;
const HEAD = (fixes = '["#319", "K65"]') => `// @regress {"now": "2026-10-01T12:00:00Z", "fixes": ${fixes}}\nimport { checker, reasons, sectionOf } from '${LIB}';\nconst { check, refused, accepted, done } = checker();\n`;
const REFUSAL = `## 統制を緩める向きの変更(決定した者の記名と理由を要する)\\n\\n- 回答 q-biz-phase: mvp → poc(ステージ移行ゲート(SG)の判定による)\\n\\n## 残作業\\n\\n- ステージ移行ゲート(SG)の判定による\\n\\n[エラー] 統制を緩める向きの変更を含みます。決定した者の記名(decidedBy)と理由(reason)が要ります\\n  - 内訳の行`;
const scripts = {
  pass: `${HEAD()}check('通る', true);\nrefused('理由で照合', { ok: false, out: "${REFUSAL}" }, '決定した者の記名', { section: { heading: '統制を緩める向きの変更', words: ['ステージ移行ゲート(SG)の判定による'] } });\nrefused('内訳の行も理由の1件', { ok: false, out: "${REFUSAL}" }, '統制を緩める', '内訳の行');\naccepted('反映', { ok: true, out: 'x' });\ndone();\n`,
  fail: `${HEAD()}check('落ちる', false, 'detail');\ndone();\n`,
  crash: `${HEAD()}check('通る', true);\nthrow new Error('場面の外の中断');\n`,
  empty: `${HEAD()}done();\n`,
  // 語が理由の外(差分の節・残作業)にしかない拒否は、照合で落ちる(元のスイートは出力の全体で照合して通した)
  wordOutside: `${HEAD()}refused('語が理由の外', { ok: false, out: "${REFUSAL}" }, 'ステージ移行ゲート(SG)の判定による');\ndone();\n`,
  // 節の照合は、見出しで区切った節の中だけを見る(残作業の節の同じ語では通らない)
  sectionMiss: `${HEAD()}refused('別の節の同じ語', { ok: false, out: "${REFUSAL.replace('mvp → poc(ステージ移行ゲート(SG)の判定による)', 'mvp → poc')}" }, '決定した者の記名', { section: { heading: '統制を緩める向きの変更', words: ['ステージ移行ゲート(SG)の判定による'] } });\ndone();\n`,
  kfOk: `${HEAD()}const KF = { issue: '#319', match: '記名を受け付けられません', ${KFD} };\naccepted('根', { ok: false, out: '[エラー] 記名を受け付けられません: x' }, { knownFailure: KF });\ncheck('連鎖', false, '', { dependsOn: '根 → 反映' });\ndone();\n`,
  kfUnexpectedPass: `${HEAD()}accepted('根', { ok: true, out: '' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', ${KFD} } });\ndone();\n`,
  kfOtherReason: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 別の理由\\n記名を受け付けられません(理由の外)' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', ${KFD} } });\ndone();\n`,
  kfOverdue: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', on: '2025-12-01', review: '2026-01' } });\ndone();\n`,
  kfMissing: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません' } });\ndone();\n`,
  depPassWhileRootFails: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', ${KFD} } });\ncheck('連鎖', true, '', { dependsOn: '根 → 反映' });\ndone();\n`,
  depNoRoot: `${HEAD()}check('連鎖', false, '', { dependsOn: '無い根' });\ndone();\n`,
  // 期待した理由に別の理由が加わった拒否(突合 X-4 の kfExtra)
  kfExtra: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません: x\\n[エラー] 新しい別の拒否' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', ${KFD} } });\ndone();\n`,
  kfTwoOk: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 理由A\\n[エラー] 理由B' }, { knownFailure: { issue: '#319', match: ['理由B', '理由A'], ${KFD} } });\ndone();\n`,
  kfObservedOk: `${HEAD()}check('向き', false, '', { observed: 'loosen', knownFailure: { issue: '#319', observed: 'loosen', ${KFD} } });\ndone();\n`,
  kfObservedOther: `${HEAD()}check('向き', false, '', { observed: 'arising', knownFailure: { issue: '#319', observed: 'loosen', ${KFD} } });\ndone();\n`,
  kfBadMonth: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', on: '${ON}', review: '2026-99' } });\ndone();\n`,
  kfFarReview: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', on: '${ON}', review: '9999-12' } });\ndone();\n`,
  kfNoOn: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', review: '2027-01' } });\ndone();\n`,
  // 途中で done() を呼び、後の場面を流さない(突合 X-3 の earlyExit)
  earlyExit: `${HEAD()}check('一つ目', true);\nif (process.env.REGRESS_NOW) done();\ncheck('二つ目', true);\ndone();\n`,
  issueOnly: `${HEAD('["#319"]')}check('Issue だけ', true);\ndone();\n`,
  changedOk: `${HEAD()}check('改めた', true, '', { changed: [{ by: 'ADR-0088 決定5', on: '2026-10-24', from: '旧い期待' }] });\ndone();\n`,
  changedBad: `${HEAD()}check('改めた', true, '', { changed: [{ by: 'ADR-0088 決定5', from: '旧い期待' }] });\ndone();\n`,
};
for (const [name, body] of Object.entries(scripts)) fs.writeFileSync(path.join(suite, `${name}.mjs`), body);
// 場面の一覧の宣言(§8 X-3)。run.mjs は SUITE の隣の expected/scenes/<名>.txt を読む
const scenesDir = path.join(tmp, 'expected', 'scenes');
fs.mkdirSync(scenesDir, { recursive: true });
const declare = (name, labels) => fs.writeFileSync(path.join(scenesDir, `${name}.txt`), `# test\n${labels.join('\n')}\n`);
declare('pass', ['通る', '理由で照合 → 拒否', '内訳の行も理由の1件 → 拒否', '反映 → 反映']);
declare('kfOk', ['根 → 反映', '連鎖']);
declare('changedOk', ['改めた']);
declare('kfTwoOk', ['根 → 反映']);
declare('kfObservedOk', ['向き']);
declare('earlyExit', ['一つ目', '二つ目']);
declare('issueOnly', ['Issue だけ']);

const run = (only) => {
  const out = path.join(tmp, `out-${only}`);
  const r = spawnSync(process.execPath, [path.join(HERE, 'run.mjs'), '--suite', suite, '--only', only, '--kb', 'keep', '--jobs', '1', '--out', out], { encoding: 'utf8', cwd: REPO });
  const summary = fs.existsSync(path.join(out, 'summary.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'summary.json'), 'utf8')) : null;
  return { status: r.status, text: `${r.stdout}${r.stderr}`, summary, out };
};

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok ${name}`);
};

try {
  const ok = run('pass,kfOk,changedOk,kfTwoOk,kfObservedOk');
  test('通る場面・印のとおりに落ちる根と従属する連鎖・形の揃った changed だけなら終了コード 0', () => {
    assert.equal(ok.status, 0, ok.text);
    assert.deepEqual(ok.summary.errors, []);
    assert.equal(ok.summary.runs.find((x) => x.name === 'kfOk').knownFailure, 2);
  });
  test('作業の場所は os.tmpdir() の下で、作業ツリーの外', () => {
    const m = /作業の場所 (\S+)/.exec(ok.text);
    assert.ok(m, ok.text);
    const root = fs.realpathSync(os.tmpdir());
    assert.ok(path.resolve(m[1]).startsWith(root) || path.resolve(m[1]).startsWith(os.tmpdir()), m[1]);
    assert.ok(path.relative(REPO, m[1]).startsWith('..'), m[1]);
  });
  test('期待値を改めた場面の一覧を書く', () => {
    assert.match(fs.readFileSync(path.join(ok.out, 'changed.md'), 'utf8'), /\| changedOk \| 改めた \| ADR-0088 決定5 \| 2026-10-24 \| 旧い期待 \|/);
  });
  for (const [only, why] of [
    ['fail', '落ちる場面'],
    ['crash', '場面の外の中断'],
    ['empty', '場面の記録が無い'],
    ['wordOutside', '語が拒否の理由の外にしかない'],
    ['sectionMiss', '差分の節に語が無い(別の節にだけある)'],
    ['kfUnexpectedPass', '印の場面が予期せず通った'],
    ['kfOtherReason', '印の場面が別の理由で落ちた(語が理由の外)'],
    ['kfOverdue', '印の見直しの時期を過ぎた'],
    ['kfMissing', '印の欄が欠けた'],
    ['kfExtra', '印の場面に、期待した理由と別の理由が加わった'],
    ['kfObservedOther', '観測で照合する印の場面が、別の観測で落ちた'],
    ['kfBadMonth', '印の見直しの月が 01〜12 でない'],
    ['kfFarReview', '印の見直しの時期が、付けた日から 6 か月を超える'],
    ['kfNoOn', '印に付けた日(on)が無い'],
    ['earlyExit', '宣言した場面が実行されずに消えた(途中の done)'],
    ['issueOnly', '固定する決定が Issue だけ'],
    ['depPassWhileRootFails', '根が落ちているのに連鎖が通った'],
    ['depNoRoot', '従属する根が無い'],
    ['changedBad', 'changed の日付が無い'],
  ]) {
    test(`${why}なら終了コード 1`, () => {
      const r = run(only);
      assert.equal(r.status, 1, r.text);
      assert.ok(r.summary.errors.some((e) => e.startsWith(`${only}:`)), JSON.stringify(r.summary.errors));
      const want = { earlyExit: '宣言した場面が実行されなかった', issueOnly: '決定(ADR-NNNN 決定N' }[only];
      if (want) assert.ok(r.summary.errors.some((e) => e.includes(want)), JSON.stringify(r.summary.errors));
      const log = { kfExtra: '拒否の理由が 2 件', kfBadMonth: '01〜12', kfFarReview: '6 か月以内', kfNoOn: 'on(印を付けた日)', kfObservedOther: '期待と別の観測' }[only];
      if (log) assert.ok(fs.readFileSync(path.join(r.out, `${only}.log`), 'utf8').includes(log), fs.readFileSync(path.join(r.out, `${only}.log`), 'utf8'));
    });
  }
  test('宣言した場面の一覧が無ければ終了コード 1', () => {
    fs.rmSync(path.join(scenesDir, 'changedOk.txt'));
    const r = run('changedOk');
    assert.equal(r.status, 1, r.text);
    assert.ok(r.summary.errors.some((e) => e.includes('場面の一覧の宣言が無い')), JSON.stringify(r.summary.errors));
    declare('changedOk', ['改めた']);
  });
  test('宣言に無い場面が増えても終了コード 1', () => {
    declare('kfObservedOk', []);
    const r = run('kfObservedOk');
    assert.equal(r.status, 1, r.text);
    assert.ok(r.summary.errors.some((e) => e.includes('宣言に無い場面')), JSON.stringify(r.summary.errors));
    declare('kfObservedOk', ['向き']);
  });
  test('場面の一覧の差は多重集合で数える(同じ名前の場面の数の違いも差になる)', () => {
    assert.deepEqual(sceneListDiff(['a', 'a', 'b'], ['a', 'b']), { missing: ['a'], extra: [] });
    assert.deepEqual(sceneListDiff(['a'], ['a', 'a']), { missing: [], extra: ['a'] });
  });
  test('作業用の複製の最上位が複製そのものでなければ止める(GIT_DIR・GIT_WORK_TREE を外へ向けた複製)', () => {
    const outer = path.join(tmp, 'outer');
    fs.mkdirSync(outer);
    spawnSync('git', ['init', '-q', outer]);
    const src = path.join(tmp, 'src-tpl');
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, 'a.txt'), 'a');
    const env = { ...process.env, GIT_DIR: path.join(outer, '.git'), GIT_WORK_TREE: outer };
    assert.throws(() => fresh(src, path.join(tmp, 'ws-outer'), env), /最上位が作業用の複製でない/);
    // 外へ向けない複製は作れる
    const clean = { ...process.env };
    for (const k of Object.keys(clean)) if (k.startsWith('GIT_')) delete clean[k];
    fresh(src, path.join(tmp, 'ws-ok'), { ...clean, GIT_CONFIG_GLOBAL: path.join(tmp, 'gitconfig-empty'), GIT_CONFIG_NOSYSTEM: '1' });
    assert.ok(fs.existsSync(path.join(tmp, 'ws-ok', '.git')));
  });
  test('落ちる場面と通る場面を混ぜても終了コード 1', () => {
    assert.equal(run('pass,fail').status, 1);
  });
  test('Intl: 引数なしの format() は止めた時計を読まない(検査が要る理由)', () => {
    const r = spawnSync(process.execPath, ['-e', "const f=new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'UTC'});process.stdout.write(f.format()+' '+f.format(new Date()))"], {
      encoding: 'utf8',
      env: { ...process.env, TZ: 'UTC', REGRESS_NOW: '2001-01-01T00:00:00Z', NODE_OPTIONS: `--import "${pathToFileURL(path.join(HERE, 'lib', 'clock.mjs')).href}"` },
    });
    const [noArg, withDate] = r.stdout.trim().split(' ');
    assert.equal(withDate, '2001', r.stdout + r.stderr);
    assert.notEqual(noArg, '2001', r.stdout);
  });
  test('Intl: 引数なしの format()・formatToParts() を受け手によらず見つけ、日付を渡す形は見つけない', () => {
    assert.equal(unfrozenIn("new Intl.DateTimeFormat().format()").length, 1);
    assert.equal(unfrozenIn("Intl.DateTimeFormat('ja-JP', { timeZone: tz() }).formatToParts( )").length, 1);
    // 突合 X-14: 変数を経た呼び出しと、2段の括弧を含む引数
    assert.equal(unfrozenIn("const f = new Intl.DateTimeFormat('en'); f.format()").length, 1);
    assert.equal(unfrozenIn("new Intl.DateTimeFormat('ja', { timeZone: pick(a(b)) }).format()").length, 1);
    assert.equal(unfrozenIn("new Intl.DateTimeFormat('ja-JP').format(new Date())").length, 0);
    assert.equal(unfrozenIn("new Intl.DateTimeFormat().resolvedOptions().timeZone").length, 0);
  });
  test('Intl: テンプレートのスクリプトは引数なしの format() を使わない', () => {
    assert.deepEqual(unfrozenClockUses(path.join(REPO, 'template')), []);
  });
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`回帰の試験の実行役の試験: ${passed} 件 合格`);
