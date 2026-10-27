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
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unfrozenIn, unfrozenClockUses } from './lib/unfrozen-clock.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const LIB = pathToFileURL(path.join(HERE, 'suite', 'lib.mjs')).href;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pit-regress-test-'));
const suite = path.join(tmp, 'suite');
fs.mkdirSync(suite);

const HEAD = (fixes = '["#319"]') => `// @regress {"now": "2026-10-01T12:00:00Z", "fixes": ${fixes}}\nimport { checker, reasons, sectionOf } from '${LIB}';\nconst { check, refused, accepted, done } = checker();\n`;
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
  kfOk: `${HEAD()}const KF = { issue: '#319', match: '記名を受け付けられません', review: '2099-12' };\naccepted('根', { ok: false, out: '[エラー] 記名を受け付けられません: x' }, { knownFailure: KF });\ncheck('連鎖', false, '', { dependsOn: '根 → 反映' });\ndone();\n`,
  kfUnexpectedPass: `${HEAD()}accepted('根', { ok: true, out: '' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', review: '2099-12' } });\ndone();\n`,
  kfOtherReason: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 別の理由\\n記名を受け付けられません(理由の外)' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', review: '2099-12' } });\ndone();\n`,
  kfOverdue: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', review: '2026-01' } });\ndone();\n`,
  kfMissing: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません' } });\ndone();\n`,
  depPassWhileRootFails: `${HEAD()}accepted('根', { ok: false, out: '[エラー] 記名を受け付けられません' }, { knownFailure: { issue: '#319', match: '記名を受け付けられません', review: '2099-12' } });\ncheck('連鎖', true, '', { dependsOn: '根 → 反映' });\ndone();\n`,
  depNoRoot: `${HEAD()}check('連鎖', false, '', { dependsOn: '無い根' });\ndone();\n`,
  changedOk: `${HEAD()}check('改めた', true, '', { changed: [{ by: 'ADR-0088 決定5', on: '2026-10-24', from: '旧い期待' }] });\ndone();\n`,
  changedBad: `${HEAD()}check('改めた', true, '', { changed: [{ by: 'ADR-0088 決定5', from: '旧い期待' }] });\ndone();\n`,
};
for (const [name, body] of Object.entries(scripts)) fs.writeFileSync(path.join(suite, `${name}.mjs`), body);

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
  const ok = run('pass,kfOk,changedOk');
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
    ['depPassWhileRootFails', '根が落ちているのに連鎖が通った'],
    ['depNoRoot', '従属する根が無い'],
    ['changedBad', 'changed の日付が無い'],
  ]) {
    test(`${why}なら終了コード 1`, () => {
      const r = run(only);
      assert.equal(r.status, 1, r.text);
      assert.ok(r.summary.errors.some((e) => e.startsWith(`${only}:`)), JSON.stringify(r.summary.errors));
    });
  }
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
  test('Intl: 引数なしの format()・formatToParts() を見つけ、日付を渡す形は見つけない', () => {
    assert.equal(unfrozenIn("new Intl.DateTimeFormat().format()").length, 1);
    assert.equal(unfrozenIn("Intl.DateTimeFormat('ja-JP', { timeZone: tz() }).formatToParts( )").length, 1);
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
