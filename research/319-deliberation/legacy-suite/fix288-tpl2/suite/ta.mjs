// #288 第2巡: 導入前の検証の1コマンド(scripts/gate/adoption-trial.mjs)を、テンプレートの複製に小さな採用者のリポジトリ
// (Node の小さな機能と、採用者が書いた合否の基準)を足して実行する。
//   sh fresh.sh ua && sh fresh.sh ut && node ta.mjs [-v]
import fs from 'node:fs';
import path from 'node:path';
import { check, done, setup } from './lib288.mjs';
import { workspace, NAMES, TODAY, BASE } from './lib.mjs';

const { W } = setup('ua', 3);
const { run, git, write, read, commit } = W;
const trial = (...args) => run('node', ['scripts/gate/adoption-trial.mjs', ...args]);

// 採用者のコード(Node の小さな機能)・受入基準・テスト
write('package.json', JSON.stringify({ name: 'invite', version: '1.0.0', type: 'module', scripts: { test: 'node --test' } }, null, 2) + '\n');
write('src/invite.js', [
  'export function canRevoke(user, invite) {',
  '  if (!user) return false;',
  '  return user.id === invite.ownerId || user.role === "admin";',
  '}',
  '',
  'export function isExpired(invite, now = Date.now()) {',
  '  return invite.expiresAt <= now;',
  '}',
  '',
  'export function label(invite, now = Date.now()) {',
  '  return isExpired(invite, now) ? "失効" : "有効";',
  '}',
  '',
].join('\n'));
write('tests/invite.test.js', "// F-001/AC-1 QC-01\nimport { test } from 'node:test';\n");
fs.mkdirSync(path.join(W.DIR, 'specs/F-001'), { recursive: true });
write('specs/F-001/spec.md', '# F-001 招待\n\n## 受入基準\n\n| # | 型 | 受入基準 |\n| --- | --- | --- |\n| 1 | イベント駆動 | 権限の無い利用者が取り消しを実行した場合、システムは拒否しなければならない(QC-01) |\n');
// 後継の暫定任命を1席置き、組織継続の側の状態(場面11 の受容の対象)を作る
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(`| 独立レビュア | 代理 太郎 | 全部 | 確認済み | ${TODAY} |`, '| 独立レビュア | 代理 太郎 | 全部 | 暫定任命 | |'));
commit('feat: 招待の取り消し');
let ch = W.change({ kind: 'settings', summary: '区分の下限の規則', settings: { riskFloor: { rules: [{ id: 'auth', paths: ['src/auth/**'], floor: 'R1', why: '認証・認可' }] } } });
check('採用者: 区分の下限の規則を置く', ch.ok, ch.out.slice(-400));
fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
commit('chore: 区分の下限の規則');

// ---------------------------------------------------------------- 基準の記入が無ければ実行しない
let r = trial('run');
check('基準のファイルが無い → 実行しない(要件①)', !r.ok && r.out.includes('criteria.md がありません') && r.out.includes('要件①'), r.out);
r = trial('init');
check('init で合否の基準の様式を写す', r.ok && fs.existsSync(path.join(W.DIR, 'docs/adoption-trial/criteria.md')), r.out);
r = trial('run');
check('基準が様式のまま(未記入) → 実行しない', !r.ok && r.out.includes('記入者が未記入') && r.out.includes('が未記入'), r.out);
const criteria = (writer = NAMES[1], at = `${TODAY} 00:00`) =>
  read('docs/adoption-trial/criteria.md')
    .replace(/^\| 適用候補 \| .*$/m, '| 適用候補 | 招待サービス(開発部) |')
    .replace(/^\| 記入日時 \| .*$/m, `| 記入日時 | ${at} |`)
    .replace(/^\| 記入者 \| .*$/m, `| 記入者 | ${writer} |`)
    .replace(/^\| 欠陥注入: 人の層の検出率の下限 \| .*$/m, '| 欠陥注入: 人の層の検出率の下限 | 60% |')
    .replace(/^\| 欠陥注入: AI の層の扱い[^|]*\| .*$/m, '| 欠陥注入: AI の層の扱い(下限、または「検出の層に数えない」) | 検出の層に数えない |')
    .replace(/^\| 場面集: [^|]*\| .*$/m, '| 場面集: 止まるべき11場面のうち止まる数 | 11 |')
    .replace(/^\| 類型E: [^|]*\| .*$/m, '| 類型E: 人へ戻したときに処理できる量の下限 | 1週 5件 |')
    .replace(/^\| 類型F: [^|]*\| .*$/m, '| 類型F: 別の提供者での差分の許容の範囲 | 基準集合の失敗の増加が 2 件以内 |');
write('docs/adoption-trial/criteria.md', criteria('Claude'));
r = trial('run');
check('記入者が AI の名義 → 実行しない', !r.ok && r.out.includes('AI の名義'), r.out);
write('docs/adoption-trial/criteria.md', criteria());
r = trial('run');
check('基準をコミットしていない → 実行しない(実行の前に記録した証拠が無い)', !r.ok && r.out.includes('コミットされていない'), r.out);
commit('docs: 導入前の検証の合否の基準');
write('docs/adoption-trial/criteria.md', read('docs/adoption-trial/criteria.md').replace('| 60% |', '| 30% |'));
r = trial('run');
check('コミットの後に基準を書き換えた → 実行しない', !r.ok && r.out.includes('コミットの後の変更'), r.out);
git('stash', '-q');
git('stash', 'drop', '-q');
write('docs/adoption-trial/criteria.md', criteria(NAMES[1], '2099-01-01 00:00'));
commit('docs: 未来の記入日時');
r = trial('run');
check('記入日時がコミットより後 → 実行しない', !r.ok && r.out.includes('より後'), r.out);
write('docs/adoption-trial/criteria.md', criteria());
commit('docs: 合否の基準を直す');

// ---------------------------------------------------------------- 目隠しの欠陥注入(要件③)
const priv = path.join(W.DIR, '..', 'ua-private');
fs.mkdirSync(priv, { recursive: true });
const manifest = { injector: NAMES[2], injectedAt: TODAY, injections: [{ id: 'I-1', file: 'src/invite.js', line: 2, type: '境界値' }, { id: 'I-2', file: 'src/invite.js', line: 3, type: '権限' }, { id: 'I-3', file: 'src/invite.js', line: 7, type: '境界値' }] };
fs.writeFileSync(path.join(priv, 'manifest.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(W.DIR, 'manifest-in-repo.json'), JSON.stringify(manifest));
r = trial('seal', '--manifest', 'manifest-in-repo.json');
check('注入の記録がリポジトリの中 → 封じない(目隠しにならない)', !r.ok && r.out.includes('リポジトリの中'), r.out);
fs.rmSync(path.join(W.DIR, 'manifest-in-repo.json'));
r = trial('seal', '--manifest', path.join(priv, 'manifest.json'));
const sealRec = JSON.parse(read('docs/adoption-trial/injection-seal.json'));
check('seal: 要約値だけを残し、件数と位置を残さない', r.ok && sealRec.digest && !JSON.stringify(sealRec).includes('src/invite.js') && sealRec.injections === undefined, JSON.stringify(sealRec));
commit('docs: 欠陥注入を封じる');
write('docs/adoption-trial/findings-human.json', JSON.stringify({ finder: NAMES[0], findings: [{ file: 'src/invite.js', line: 3, note: '権限の判定' }, { file: 'src/invite.js', line: 7, note: '境界の <=' }, { file: 'src/invite.js', line: 11, note: '誤検出' }] }));
write('docs/adoption-trial/findings-ai.json', JSON.stringify({ finder: 'AI レビュー(model-a-1)', findings: [{ file: 'src/invite.js', line: 2, note: '空の利用者' }] }));
commit('docs: 見つける者の記録');
const tampered = { ...manifest, injections: manifest.injections.slice(0, 2) };
fs.writeFileSync(path.join(priv, 'tampered.json'), JSON.stringify(tampered, null, 2));
r = trial('tally', '--manifest', path.join(priv, 'tampered.json'));
check('tally: 封じた後に書き換えた注入の記録は照合しない', !r.ok && r.out.includes('一致しません'), r.out);
r = trial('tally', '--manifest', path.join(priv, 'manifest.json'));
const seeded = JSON.parse(read('evidence/seeded-errors.json'));
const result = JSON.parse(read('docs/adoption-trial/injection-result.json'));
check('tally: 人の層 2/3・AI の層 1/3 を、既存の seeded-errors.json へ層ごとに書く', r.ok && seeded.human.seeded === 3 && seeded.human.detected === 2 && seeded.ai.detected === 1 && result.layers.human.falsePositives === 1, JSON.stringify(seeded));
check('tally: 類型の内訳と見逃した類型を残す', result.typeBreakdown['境界値'] === 2 && result.layers.human.missedTypes.includes('境界値'), JSON.stringify(result));
commit('docs: 欠陥注入の集計');
// 類型E・F の演習の記録
write('docs/adoption-trial/drills.json', JSON.stringify({ drills: [{ type: 'E', at: TODAY, result: '1週 6件(AI を止めた1週の実測)', judgement: 'docs/drills/2026-10-e.md(独立レビュアの AI を使わない判定 3 件)', record: 'docs/drills/2026-10-e.md' }, { type: 'F', at: TODAY, provider: 'ProvA', alternative: 'ProvB', result: '基準集合の失敗の増加 1 件', judgement: 'docs/drills/2026-10-f.md', record: 'docs/drills/2026-10-f.md' }] }));
commit('docs: 演習の記録');

// ---------------------------------------------------------------- 実行
r = trial('run', '--keep');
const recFile = fs.readdirSync(path.join(W.DIR, 'docs/adoption-trial')).find((f) => /^record-.*\.md$/.test(f));
const rec = recFile ? read(`docs/adoption-trial/${recFile}`) : '';
check('run: 附属書I の「導入前の検証の記録」の様式(節1〜9)を出す', r.ok && ['## 1. 合否の基準', '## 2. 欠陥注入', '## 3. 場面集の結果', '## 4. 演習', '## 5. 成立判定', '## 6. 判定', '## 7. 再実行の手順', '## 8. 根拠の水準', '## 9. 範囲を限って受容する残余リスク'].every((h) => rec.includes(h)), r.out + rec.slice(0, 1500));
const sceneRows = rec.split('\n').filter((l) => /^\| (\d|1[01]) \| /.test(l));
check('run: 場面集11件をすべて実行し、止まったかを出す', sceneRows.length === 11, sceneRows.join('\n'));
const notStopped = sceneRows.filter((l) => !l.includes('| 止まった:'));
check('run: 採用者の構成(区分の下限の規則・層1・D-0 を記入済み)で11場面すべてが止まる', notStopped.length === 0, notStopped.join('\n') + '\n' + r.out.slice(-1500));
check('run: 欠陥注入の結果(人の層 66.7%)を基準 60% と照合する', /\| 欠陥注入: 人の層の検出率の下限 \| 60% \| 66\.7% \| 基準を満たす \|/.test(rec), rec.split('## 6.')[1]?.slice(0, 1200));
check('run: 演習の記録(類型E・F)を取り込む', rec.includes('| E |') && rec.includes('| F |'), rec.split('## 4.')[1]?.slice(0, 600));
check('run: 1件の測定(E2)として根拠の水準を表示し、採用者の環境の証拠でない旨は出さない', rec.includes('1件の測定である(E2 単一事例)') && !rec.includes('採用者の環境の証拠ではない'), '');
check('run: 基準のコミットの時刻と記入者を記録する', rec.includes(`記入者: ${NAMES[1]}`) && rec.includes('基準のコミット:'), '');
check('run: 採用者のリポジトリを書き換えない(書くのは docs/adoption-trial/ と evidence/ だけ)', !git('status', '--porcelain').out.split('\n').filter(Boolean).some((l) => !/docs\/adoption-trial\/|evidence\//.test(l)), git('status', '--porcelain').out);
fs.writeFileSync(path.join(W.DIR, '..', 'ta-record.md'), rec);
commit('docs: 導入前の検証の記録');

// 実行の後に基準を改めた記録は、採用の証拠に数えない
write('docs/adoption-trial/criteria.md', read('docs/adoption-trial/criteria.md').replace('| 60% |', '| 50% |').replace(/^\| 記入日時 \| .*$/m, `| 記入日時 | ${TODAY} 00:01 |`));
commit('docs: 基準を改める');
r = trial('run');
const rec2File = fs.readdirSync(path.join(W.DIR, 'docs/adoption-trial')).filter((f) => /^record-.*\.md$/.test(f)).sort().at(-1);
const rec2 = read(`docs/adoption-trial/${rec2File}`);
check('実行の後に基準を改めた → 記録に「採用の証拠に数えない」と出す', rec2.includes('採用の証拠に数えない') || (rec2File === recFile && r.out.includes('採用の証拠に数えない')), rec2.slice(0, 600) + r.out.slice(-500));

// ---------------------------------------------------------------- テンプレートそのもので実行した場合
{
  const T = workspace('ut');
  T.write('answers.json', { 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp', ...BASE });
  T.gen('--answers', 'answers.json', '--stack', 'node');
  fs.rmSync(path.join(T.DIR, 'answers.json'));
  T.run('node', ['scripts/gate/adoption-trial.mjs', 'init']);
  T.write('docs/adoption-trial/criteria.md', T.read('docs/adoption-trial/criteria.md').replace(/^\| 記入日時 \| .*$/m, `| 記入日時 | ${TODAY} 00:00 |`).replace(/^\| 記入者 \| .*$/m, '| 記入者 | 作者 一郎 |').replace(/^\| ([^|]+) \| <例: ([^>]+)> \|$/gm, '| $1 | $2 |'));
  T.commit('chore: 初期化と基準');
  const rt = T.run('node', ['scripts/gate/adoption-trial.mjs', 'run']);
  const f = fs.readdirSync(path.join(T.DIR, 'docs/adoption-trial')).find((x) => /^record-.*\.md$/.test(x));
  const t = f ? T.read(`docs/adoption-trial/${f}`) : '';
  check('テンプレートそのもので実行 → 記録に「採用者の環境の証拠ではない」と出し、合格の記録にしない', rt.ok && t.includes('採用者の環境の証拠ではない') && t.includes('自己評価(E0)と同じ扱い'), rt.out.slice(-800) + t.slice(0, 600));
}

done();
