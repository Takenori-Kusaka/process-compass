// #288 第2巡: 導入前の検証の1コマンド(adoption-trial.mjs)を、採用者の小さなリポジトリで通す。
//   sh fresh.sh ua2 && node trial.mjs [-v]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { check, done, setup } from './lib288.mjs';
import { NAMES, TODAY, HERE } from './lib.mjs';

const { W } = setup('ua2', 3);
const { run, git, write, read, commit, change } = W;
const DIR = W.DIR;
const trial = (...args) => run('node', ['scripts/gate/adoption-trial.mjs', ...args]);
const TRIAL = 'docs/adoption-trial';
const listRecords = () => (fs.existsSync(path.join(DIR, TRIAL)) ? fs.readdirSync(path.join(DIR, TRIAL)).filter((f) => /^record-.*\.md$/.test(f)) : []);

// ---------------------------------------------------------------- 1. 基準が無ければ実行しない
let r = trial('run');
check('基準が無い → 実行しない(終了コード 1、init を案内)', !r.ok && r.out.includes('criteria.md がありません') && r.out.includes('要件①'), r.out);
check('基準が無い → 記録を出さない', listRecords().length === 0, listRecords().join());

r = trial('init');
check('init が様式を写す', r.ok && fs.existsSync(path.join(DIR, `${TRIAL}/criteria.md`)), r.out);
r = trial('run');
check('様式のまま(未記入・未コミット) → 実行しない', !r.ok && r.out.includes('未記入') && r.out.includes('コミットされていない'), r.out);

// 採用者(人)が基準を書く
const fill = (writtenAt, writer = NAMES[1]) =>
  write(
    `${TRIAL}/criteria.md`,
    read(`${TRIAL}/criteria.md`)
      .replace(/^\| 適用候補 \| .*$/m, '| 適用候補 | 招待サービス(ua2) |')
      .replace(/^\| 記入日時 \| .*$/m, `| 記入日時 | ${writtenAt} |`)
      .replace(/^\| 記入者 \| .*$/m, `| 記入者 | ${writer} |`)
      .replace(/^\| 欠陥注入: 人の層の検出率の下限 \| .*$/m, '| 欠陥注入: 人の層の検出率の下限 | 60% |')
      .replace(/^\| 実環境の統制の確認\(.*$/m, '| 実環境の統制の確認(ルールセットの適用・PR のレビューの取得・ship-evidence の成果物の取得) | 3 項目とも確認済み(この試験では env-check を行わない) |')
      .replace(/^\| 欠陥注入: AI の層の扱い.*$/m, '| 欠陥注入: AI の層の扱い(下限、または「検出の層に数えない」) | 検出の層に数えない |')
      .replace(/^\| 場面集: .*$/m, '| 場面集: 止まるべき11場面のうち止まる数 | 11 |')
      .replace(/^\| 類型E: .*$/m, '| 類型E: 人へ戻したときに処理できる量の下限 | 1週 5件 |')
      .replace(/^\| 類型F: .*$/m, '| 類型F: 別の提供者での差分の許容の範囲 | 失敗の増加 2 件以内 |')
  );
fill(`${TODAY} 09:00`, 'Claude');
commit('docs: 合否の基準(AI の名義)');
r = trial('run');
check('記入者が AI の名義 → 実行しない', !r.ok && r.out.includes('AI の名義'), r.out);

fill('2099-01-01 09:00');
commit('docs: 合否の基準(記入日時が未来)');
r = trial('run');
check('記入日時がコミットより後 → 実行しない', !r.ok && r.out.includes('より後'), r.out);

fill(`${TODAY} 09:00`);
commit('docs: 合否の基準');
fill(`${TODAY} 09:01`);
r = trial('run');
check('コミットの後に書き換えた → 実行しない', !r.ok && r.out.includes('コミットの後の変更'), r.out);
git('checkout', '-q', '--', `${TRIAL}/criteria.md`);

// ---------------------------------------------------------------- 2. 製品のコードが無いリポジトリでの実行
r = trial('run');
check('基準を満たせば実行する(製品のコードなし)', r.ok, r.out.slice(-1500));
let recs = listRecords();
let rec = recs.length ? read(`${TRIAL}/${recs.at(-1)}`) : '';
check('製品のコードが無い → 「採用者の環境の証拠ではない」と出す', rec.includes('採用者の環境の証拠ではない') && r.out.includes('採用者の環境の証拠ではない'), rec.slice(0, 600));

// ---------------------------------------------------------------- 3. 採用者のリポジトリ(製品のコード・テスト・受入基準・区分の下限)
for (const f of fs.readdirSync(path.join(DIR, TRIAL))) if (!/^criteria\.md$/.test(f)) fs.rmSync(path.join(DIR, TRIAL, f), { recursive: true, force: true });
write('src/invite.js', "export function cancelInvite(user, invite) {\n  if (!user.isOwner) throw new Error('forbidden');\n  invite.cancelled = true;\n  return invite;\n}\n");
write('tests/invite.test.js', "// F-001/AC-1 QC-01\nimport { test } from 'node:test';\nimport assert from 'node:assert';\nimport { cancelInvite } from '../src/invite.js';\ntest('403', () => { assert.throws(() => cancelInvite({ isOwner: false }, {})); });\n");
fs.mkdirSync(path.join(DIR, 'specs/F-001'), { recursive: true });
write('specs/F-001/spec.md', '# F-001 招待\n\n## 受入基準\n\n| # | 型 | 受入基準 |\n| --- | --- | --- |\n| 1 | イベント駆動 | 権限の無い利用者が取り消しを実行した場合、システムは 403 を返さなければならない(QC-01) |\n');
let ch = change({ kind: 'settings', summary: '区分の下限の規則を置く', settings: { riskFloor: { rules: [{ id: 'auth', paths: ['src/auth/**'], floor: 'R1', why: '認証・認可' }] } } });
check('区分の下限の規則を置く', ch.ok, ch.out.slice(-600));
fs.rmSync(path.join(DIR, 'change.json'), { force: true });
commit('feat: 招待の取り消し');
r = trial('run');
check('採用者のリポジトリで実行が通る', r.ok, r.out.slice(-2000));
recs = listRecords();
rec = recs.length ? read(`${TRIAL}/${recs.at(-1)}`) : '';
check('記録が附属書I の様式(節0〜9。第3巡で節0 と見出しの記入者の注記を足した)で出る', ['## 0. 採用者が記入する欄', '## 1. 合否の基準', '## 2. 欠陥注入', '## 3. 場面集の結果', '## 4. 演習', '## 5. 成立判定', '## 6. 判定(基準との照合', '## 7. 再実行の手順', '## 8. 根拠の水準', '## 9. 範囲を限って受容する残余リスク'].every((h) => rec.includes(h)), rec.slice(0, 400));
check('製品のコードがあれば「採用者の環境の証拠ではない」と出さない', !rec.includes('採用者の環境の証拠ではない'), '');
const sceneRows = rec.split('\n').filter((l) => /^\| \d+ \| /.test(l));
const stopped = sceneRows.filter((l) => / \| 止まった: /.test(l)).length;
console.log(sceneRows.map((l) => '       ' + l.slice(0, 220)).join('\n'));
check('場面集11件がすべて「止まった」', sceneRows.length === 11 && stopped === 11, `止まった ${stopped} / ${sceneRows.length}`);
check('基準の照合の表に場面集の結果が出る', rec.includes('| 場面集: 止まるべき11場面のうち止まる数 | 11 | 11 / 11 | 基準を満たす |'), rec.split('## 6.')[1]?.slice(0, 800));
check('成立判定: 層1 が有効で D-0 表4 に空欄なし', rec.includes('層1: 有効') && rec.includes('D-0 表4 の空欄: なし') && rec.includes('| 成立判定: 層1・D-0 の全行記入で成立条件1 が成立する | 成立 | 成立'), rec.split('## 5.')[1]?.slice(0, 600));
check('欠陥注入の記録が無ければ「確かめていない」', rec.includes('記録なし(seal と tally を実行していない)'), '');
check('採用者のリポジトリを書き換えない(記録と実行の記録以外)', git('status', '--porcelain').out.split('\n').filter((l) => l.trim() && !l.includes('docs/adoption-trial/')).length === 0, git('status', '--porcelain').out);
const runsBefore = fs.readdirSync(path.join(DIR, `${TRIAL}/runs`)).length;
commit('docs: 導入前の検証の記録');

// ---------------------------------------------------------------- 4. 目隠しの欠陥注入(seal → tally)
const manifestIn = path.join(DIR, 'manifest.json');
const manifestOut = path.join(HERE, 'w', 'ua2-manifest.json');
const manifest = { injector: NAMES[0], injections: [{ file: 'src/invite.js', line: 2, type: '権限' }, { file: 'src/invite.js', line: 3, type: '状態' }] };
fs.writeFileSync(manifestIn, JSON.stringify(manifest));
r = trial('seal', '--manifest', manifestIn);
check('注入の記録がリポジトリの中 → 封じない', !r.ok && r.out.includes('リポジトリの中'), r.out);
fs.rmSync(manifestIn);
fs.writeFileSync(manifestOut, JSON.stringify(manifest));
r = trial('seal', '--manifest', manifestOut);
check('リポジトリの外の注入の記録を封じる(要約値だけ)', r.ok && fs.existsSync(path.join(DIR, `${TRIAL}/injection-seal.json`)) && !read(`${TRIAL}/injection-seal.json`).includes('invite.js'), r.out);
commit('docs: 注入を封じる');
write(`${TRIAL}/findings-human.json`, JSON.stringify({ finder: NAMES[2], findings: [{ file: 'src/invite.js', line: 2, note: '権限の確認が抜けている' }, { file: 'src/invite.js', line: 40, note: '誤検出' }] }));
write(`${TRIAL}/findings-ai.json`, JSON.stringify({ finder: 'Claude', findings: [{ file: 'src/invite.js', line: 3, note: '状態' }] }));
commit('docs: 見つける者の記録');
fs.writeFileSync(manifestOut, JSON.stringify({ ...manifest, injections: manifest.injections.slice(0, 1) }));
r = trial('tally', '--manifest', manifestOut);
check('封じた後に書き換えた注入の記録 → 数えない', !r.ok && r.out.includes('一致しません'), r.out);
fs.writeFileSync(manifestOut, JSON.stringify(manifest));
r = trial('tally', '--manifest', manifestOut);
check('tally が人の層と AI の層を分けて数える(人 1/2、AI 1/2)', r.ok && r.out.includes('人の層 1 件') && r.out.includes('AI の層 1 件'), r.out);
const seeded = JSON.parse(read('docs/adoption-trial/seeded-errors.json'));
check('docs/adoption-trial/seeded-errors.json(記録の置き場)へ層ごとに書く(288 第4巡 B: evidence/ は .gitignore で CI に届かない)', seeded.human?.seeded === 2 && seeded.human?.detected === 1 && seeded.ai?.detected === 1, JSON.stringify(seeded));
commit('docs: 集計');
r = trial('run');
recs = listRecords();
rec = read(`${TRIAL}/${recs.at(-1)}`);
check('再実行で欠陥注入の表が出る(注入2・人1・AI1・見逃した類型)', rec.includes(`| ${NAMES[0]} | ${NAMES[2]} / Claude | 2 | 権限 1 / 状態 1 | 1 | 1 |`) && rec.includes('見逃した欠陥の類型: 人の層 状態 / AI の層 権限'), rec.split('## 2.')[1]?.slice(0, 800));
check('人の層の検出率 50% は基準 60% を満たさないと出す', rec.includes('| 欠陥注入: 人の層の検出率の下限 | 60% | 50% | **基準を満たさない** |'), rec.split('## 6.')[1]?.slice(0, 800));
check('AI の層は「検出の層に数えない」の基準で基準を満たす', rec.includes('| 検出の層に数えない | 50% | 基準を満たす |'), rec.split('## 6.')[1]?.slice(0, 800));

// ---------------------------------------------------------------- 5. 実行の後に基準を改めたら、採用の証拠に数えない
fill(`${TODAY} 23:00`);
write(`${TRIAL}/criteria.md`, read(`${TRIAL}/criteria.md`).replace('| 60% |', '| 40% |'));
commit('docs: 基準を緩める');
// コミットの時刻は記入日時より後でなければならない。記入日時を過去の日付で書き直す
write(`${TRIAL}/criteria.md`, read(`${TRIAL}/criteria.md`).replace(`${TODAY} 23:00`, '2026-01-01 09:00'));
commit('docs: 基準を緩める(日時)');
r = trial('run');
recs = listRecords();
rec = read(`${TRIAL}/${recs.at(-1)}`);
check('以前の実行の後に基準を改めた記録は「採用の証拠に数えない」と出す', r.ok && rec.includes('採用の証拠に数えない') && r.out.includes('採用の証拠に数えない'), rec.slice(0, 500) + r.out.slice(-500));

// ---------------------------------------------------------------- 6. 演習の記録
write(`${TRIAL}/drills.json`, JSON.stringify({ drills: [{ type: 'E', at: TODAY, result: '1週 6件', judgement: 'docs/drills/e-1.md', record: 'docs/drills/e-1.md' }, { type: 'F', at: TODAY, provider: 'ProvA', alternative: 'ProvB', result: '失敗の増加 1 件', judgement: 'docs/drills/f-1.md' }, { type: 'E', at: 'いつか', result: '', judgement: '' }] }));
commit('docs: 演習の記録');
r = trial('run');
recs = listRecords();
rec = read(`${TRIAL}/${recs.at(-1)}`);
check('演習の記録を取り込み、不備のある行は「数えない」と出す', rec.includes(`| E | ${TODAY} | 1週 6件 | docs/drills/e-1.md |`) && rec.includes(`| F | ${TODAY} | 失敗の増加 1 件 |`) && rec.includes('**数えない**') && rec.includes('at(実施日)が日付でない'), rec.split('## 4.')[1]?.slice(0, 800));
check('類型E・F は数で比べられないため「人が照合する」', rec.includes('| 類型E: 人へ戻したときに処理できる量の下限 | 1週 5件 | ') && rec.includes('人が照合する'), rec.split('## 6.')[1]?.slice(0, 800));

// ---------------------------------------------------------------- 7. 止まるべきでない場面の確認: 層1 を無効にすると成立判定が不成立
write('docs/quality-assurance-policy.md', read('docs/quality-assurance-policy.md').replace('| (必須)停止の申し立ての解除(第7章 7.11) | | 事業決裁者 | — |', '| (必須)停止の申し立ての解除(第7章 7.11) | | | — |'));
commit('docs: 層1 の必須行を空欄に');
r = trial('run');
recs = listRecords();
rec = read(`${TRIAL}/${recs.at(-1)}`);
check('層1 の必須行が空欄 → 成立判定が不成立、空欄の行を出す', rec.includes('層1 の必須行の空欄: あり(停止の申し立ての解除)') && rec.includes('| 成立 | 不成立 | **基準を満たさない** |'), rec.split('## 5.')[1]?.slice(0, 800));
git('reset', '-q', '--hard', 'HEAD~1');

// ---------------------------------------------------------------- 8. next.mjs の案内
git('reset', '-q', '--hard', 'base288');
git('clean', '-qfd');
let nx = run('node', ['scripts/gate/next.mjs']);
check('next.mjs: 記録が無ければ導入前の検証を案内する(init から)', nx.out.includes('導入前の検証の記録が無い') && nx.out.includes('adoption-trial.mjs init'), nx.out.slice(-1200));
write(`${TRIAL}/criteria.md`, '# 基準\n');
nx = run('node', ['scripts/gate/next.mjs']);
check('next.mjs: 基準があれば run を案内する', nx.out.includes('合否の基準を採用者が書いてコミットした後に') && nx.out.includes('adoption-trial.mjs run'), nx.out.slice(-1200));
write(`${TRIAL}/record-x.md`, '# 記録\n');
nx = run('node', ['scripts/gate/next.mjs']);
check('next.mjs: 記録が1件あれば案内しない', !nx.out.includes('導入前の検証の記録が無い'), nx.out.slice(-1200));
git('reset', '-q', '--hard', 'base288');
git('clean', '-qfd');

done();
