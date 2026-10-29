// 288 第3巡 追加: 記録の要約値と verify を、採用者のリポジトリ(adopter/。scen.mjs の後の状態)で確かめる。
//   node scen2.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'adopter');
const TPL = path.resolve(HERE, '../../template');
const OUT = path.join(HERE, 'out');
let bad = 0;
const check = (label, cond, detail = '') => {
  if (!cond) bad++;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`);
  if (!cond && detail) console.log(String(detail).split('\n').slice(0, 25).map((l) => `       ${l.slice(0, 300)}`).join('\n'));
};
const env = { ...process.env, GITHUB_BASE_REF: '', PATH: `${path.resolve(HERE, '../fix288-tpl2/fakebin')}:${process.env.PATH}` };
const run = (cmd, args, { save = null } = {}) => {
  const r = spawnSync(cmd, args, { cwd: DIR, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (save) fs.writeFileSync(path.join(OUT, save), `$ ${cmd} ${args.join(' ')}\nexit ${r.status}\n\n${out}`);
  return { ok: r.status === 0, out, code: r.status };
};
const git = (...a) => run('git', a);
const trial = (save, ...a) => run('node', ['scripts/gate/adoption-trial.mjs', ...a], { save });
const write = (rel, t) => fs.writeFileSync(path.join(DIR, rel), typeof t === 'string' ? t : JSON.stringify(t, null, 2) + '\n');
const read = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
const commit = (msg) => {
  git('add', '-A');
  git('commit', '-q', '-m', msg);
};
const TRIAL = 'docs/adoption-trial';
const records = () => fs.readdirSync(path.join(DIR, TRIAL)).filter((f) => /^record-.*\.md$/.test(f)).sort();

// テンプレートの更新を取り込む(記録だけでないので、ここでは検証のためのコミットとする)
fs.copyFileSync(path.join(TPL, 'scripts/gate/adoption-trial.mjs'), path.join(DIR, 'scripts/gate/adoption-trial.mjs'));
commit('chore: adoption-trial.mjs を更新(検証のため)');

// 1. run → 節10 の要約値 → verify が一致
let r = trial('v-run.out', 'run');
const rec = records().at(-1);
const file = `${TRIAL}/${rec}`;
let text = read(file);
check('記録の末尾に要約値の節(6 行)がある', r.ok && text.includes('## 10. 要約値') && (text.match(/\| [0-9a-f]{64} \|$/gm) ?? []).length === 6 && /\| 注入の記録\(封じた要約値\) \| ([0-9a-f]{64}|なし) \|/.test(text), text.split('## 10.')[1]);
check('人が書く欄の範囲が印で示される(節0 と節9)', text.includes('<!-- human-fields start cols=2 -->') && text.includes('<!-- human-fields start cols=3,4 -->') && (text.match(/^<!-- human-fields end -->$/gm) ?? []).length === 2, '');
commit('docs(adoption-trial): 記録');
r = trial('v-verify-ok.out', 'verify', file);
check('verify: 出力したままの記録は一致(終了コード 0)', r.ok && r.out.includes('要約値が一致しました'), r.out);

// 2. 人が書く欄(節0 の記入、節9 の受容者・期限)を埋める → 一致のまま
text = read(file)
  .replace('| 実施者(氏名と席。席に就く予定の人) | <人が書く> | 要件② |', '| 実施者(氏名と席。席に就く予定の人) | 審査 花子(独立レビュア)、品証 三郎(出荷判定者) | 要件② |')
  .replace('| 下流の指標の基準値(検証の開発ラインで測った値。指標の名前、値、測定の期間、出所) | <人が書く> | Q10 |', '| 下流の指標の基準値(検証の開発ラインで測った値。指標の名前、値、測定の期間、出所) | 出荷後30日の不具合 0.8 件/月(2026-04〜09。障害管理台帳) | Q10 |')
  .replace('| 検証した構成と開発ライン | <人が書く> | <YYYY-MM-DD> |', '| 検証した構成と開発ライン | 山本 健一(情報システム部長) | 2027-03-31 |');
write(file, text);
r = trial('v-verify-human.out', 'verify', file);
check('verify: 人が書く欄を埋めても一致', r.ok && r.out.includes('要約値が一致しました'), r.out);
commit('docs(adoption-trial): 実施者・基準値・受容者を記入');

// 3. 人が書く欄の外(節3 の結果)を書き換える → 不一致
write(file, read(file).replace('| 止まった: 作成を指示した者だけが承認した R1 の変更を、出荷の集約が欠落にした |', '| 止まった: 自己承認の変更を欠落にした(書き換え) |'));
r = trial('v-verify-tamper.out', 'verify', file);
check('verify: 節3 の結果を書き換えると本文の要約値が不一致(終了コード 1)', !r.ok && r.out.includes('本文(人が書く欄を除く): 不一致') && r.out.includes('記録として数えません'), r.out);
git('checkout', '-q', '--', file);

// 4. 節9 の残余リスクの文(人が書く欄でない列)を書き換える → 不一致
write(file, read(file).replace('| 結果の効果(欠陥の流出が減るか)は未実証 | 検証した構成と開発ライン |', '| 結果の効果は実証済み | 検証した構成と開発ライン |'));
r = trial('v-verify-tamper9.out', 'verify', file);
check('verify: 節9 の受容者・期限以外の列を書き換えると不一致', !r.ok && r.out.includes('本文(人が書く欄を除く): 不一致'), r.out);
git('checkout', '-q', '--', file);

// 5. 実行の記録(runs/<stamp>.json)の場面の結果を書き換える → 場面集の要約値が不一致
const stamp = rec.match(/^record-(\d{8}-\d{6})\.md$/)[1];
const runFile = `${TRIAL}/runs/${stamp}.json`;
const j = JSON.parse(read(runFile));
j.scenes[0].result = '止まらなかった';
write(runFile, j);
r = trial('v-verify-runs.out', 'verify', file);
check('verify: 実行の記録の場面の結果を書き換えると不一致', !r.ok && r.out.includes('場面集の結果: 不一致'), r.out);
git('checkout', '-q', '--', runFile);

// 6. 要約値の行そのもの(合否の基準)を書き換える → コミットから読み直した値と不一致
write(file, read(file).replace(/(\| 合否の基準\(コミット [0-9a-f]+ の docs\/adoption-trial\/criteria\.md\) \| )[0-9a-f]{64}/, '$1' + 'f'.repeat(64)));
r = trial('v-verify-crit.out', 'verify', file);
check('verify: 合否の基準の要約値の行を書き換えると、コミットから読み直した値と不一致', !r.ok && /合否の基準\(コミット [0-9a-f]+ の docs\/adoption-trial\/criteria\.md\): 不一致/.test(r.out), r.out);
git('checkout', '-q', '--', file);

// 7. 構成が後で変わっても、本文は一致し、構成は「現在の状態と違う」の警告(失敗にしない)
write('change.json', { kind: 'settings', summary: '検証のため上限を変える(検証後に戻す)', settings: { task: { maxChangedLines: 300 } }, decidedBy: '審査 花子', reason: '検証' });
r = run('node', ['scripts/init/generate-profile.mjs', '--change', 'change.json']);
fs.rmSync(path.join(DIR, 'change.json'));
check('(前提)構成の変更が通る', r.ok, r.out);
r = trial('v-verify-config.out', 'verify', file);
check('verify: 構成が後で変わっても失敗にせず、現在の状態と違うと警告する', r.ok && r.out.includes('構成: 現在の状態と違う'), r.out);
git('checkout', '-q', '--', '.');
git('clean', '-qfd');

// 8. 要約値の無い古い記録 → verify は「要約値の節が無い」と出して失敗
write(`${TRIAL}/record-20260101-000000.md`, '# 導入前の検証の記録: 旧い様式\n\n## 1. 合否の基準\n');
r = trial('v-verify-old.out', 'verify', `${TRIAL}/record-20260101-000000.md`);
check('verify: 要約値の無い記録は、その旨を出して失敗', !r.ok && r.out.includes('要約値の節'), r.out);
fs.rmSync(path.join(DIR, `${TRIAL}/record-20260101-000000.md`));

console.log(bad ? `${bad} FAILED` : 'all ok');
process.exit(bad ? 1 : 0);
