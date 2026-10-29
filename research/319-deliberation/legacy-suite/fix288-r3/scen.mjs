// 288 第3巡: 指摘 1〜10 の各場面を、採用者のリポジトリ(adopter/。trial.mjs all の後の状態)で確かめる。
//   node scen.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'adopter');
const TPL = path.resolve(HERE, '../../template');
const OUT = path.join(HERE, 'out');
const MOCK = path.join(HERE, 'mockgh.mjs');
fs.writeFileSync(
  MOCK,
  `import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { syncBuiltinESMExports } from 'node:module';
const orig = cp.execFileSync;
const DIR = process.env.PIT_PRS ?? '';
cp.execFileSync = (cmd, args, opts) => {
  if (cmd !== 'gh') return orig(cmd, args, opts);
  if (args[0] === 'pr' && args[1] === 'view') {
    const f = path.join(DIR, args[2] + '.json');
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
    const e = new Error('no pull requests found'); e.stderr = 'no pull requests found'; throw e;
  }
  return '[]';
};
syncBuiltinESMExports();
`
);
const PRS = path.join(DIR, '.git', 'prs');
let bad = 0;
const check = (label, cond, detail = '') => {
  if (!cond) bad++;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${label}`);
  if (!cond && detail) console.log(String(detail).split('\n').slice(0, 25).map((l) => `       ${l.slice(0, 300)}`).join('\n'));
};
const env = { ...process.env, GITHUB_BASE_REF: '', GITHUB_REPOSITORY: 'tokai-seiki/inspection-scheduler', PIT_PRS: PRS, PATH: `${path.resolve(HERE, '../fix288-tpl2/fakebin')}:${process.env.PATH}` };
const run = (cmd, args, { save = null } = {}) => {
  const r = spawnSync(cmd, args, { cwd: DIR, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (save) fs.writeFileSync(path.join(OUT, save), `$ ${cmd} ${args.join(' ')}\nexit ${r.status}\n\n${out}`);
  return { ok: r.status === 0, out, code: r.status };
};
const git = (...a) => run('git', a);
const trial = (save, ...a) => run('node', ['scripts/gate/adoption-trial.mjs', ...a], { save });
const agg = (save, from) => {
  const r = run('node', ['--import', `file:///${MOCK.replace(/\\/g, '/')}`, 'scripts/gate/aggregate-evidence.mjs', '--from', from, '--to', 'HEAD'], { save });
  return { ...r, ev: JSON.parse(read('evidence/evidence.json')), report: read('evidence/quality-report.md'), ext: read('evidence/assurance-disclosure.external.md') };
};
const write = (rel, t) => {
  fs.mkdirSync(path.dirname(path.join(DIR, rel)), { recursive: true });
  fs.writeFileSync(path.join(DIR, rel), typeof t === 'string' ? t : JSON.stringify(t, null, 2) + '\n');
};
const read = (rel) => fs.readFileSync(path.join(DIR, rel), 'utf8').replace(/\r\n/g, '\n');
const commit = (msg) => {
  git('add', '-A');
  git('commit', '-q', '-m', msg);
  return git('rev-parse', 'HEAD').out.trim();
};
const prJson = (num, title, hash, { author = 'dev-ichiro', reviewer = 'shinsa-hanako', risk = 'R2', confirmer = '審査 花子', instructor = '開発 一郎', summary = '挙動要約: 差分を読み、自分で確かめた' } = {}) =>
  fs.writeFileSync(
    path.join(PRS, `${num}.json`),
    JSON.stringify({ number: num, title, author: { login: author }, reviews: reviewer ? [{ author: { login: reviewer }, state: 'APPROVED', body: summary }] : [], statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }], body: `## 検証方法と結果\n\ng5-local が通過\n\n## 作成を指示した者\n\n${instructor}\n\n## リスク区分\n\n${risk}\n${confirmer ? `\n確定した者: ${confirmer}\n` : ''}\n## トレーラ\n\nSpec: F-001\n`, mergeCommit: { oid: hash }, commits: [{ oid: hash, messageHeadline: title }], labels: [] })
  );
let prNo = Math.max(1, ...fs.readdirSync(PRS).map((f) => Number(f.replace('.json', '')) || 0));
const prCommit = (msg, opts) => {
  prNo += 1;
  const h = commit(`${msg} (#${prNo})`);
  prJson(prNo, msg, h, opts);
  return h;
};
const TRIAL = 'docs/adoption-trial';
const records = () => fs.readdirSync(path.join(DIR, TRIAL)).filter((f) => /^record-.*\.md$/.test(f)).sort();
const pad = (n) => String(n).padStart(2, '0');
const stampOf = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
const pr2 = git('log', '--format=%H', '--grep', '(#2)').out.trim().split('\n').at(-1);

// ---------------------------------------------------------------- 0. テンプレートの更新(patch-trial2 以降)を取り込む(PR として)
for (const f of ['adoption-trial.mjs', 'aggregate-evidence.mjs', 'org-assurance.mjs', 'verification-trace.mjs']) fs.copyFileSync(path.join(TPL, 'scripts/gate', f), path.join(DIR, 'scripts/gate', f));
if (git('status', '--porcelain').out.trim()) prCommit('chore: テンプレートの更新(scripts/gate)を取り込む', { risk: 'R3', confirmer: null });

// ---------------------------------------------------------------- h. 同じ秒の記録があれば止まる(指摘4)
{
  const now = new Date();
  const s1 = stampOf(now);
  const s2 = stampOf(new Date(now.getTime() + 1000));
  const s3 = stampOf(new Date(now.getTime() + 2000));
  for (const s of [s1, s2, s3]) write(`${TRIAL}/runs/${s}.json`, { startedAt: 'placeholder', state: 'running' });
  const before = records().length;
  const r = trial('h-run-same-second.out', 'run');
  check('h: 同じ時刻の記録(予約)があれば、上書きせずに止まる', !r.ok && r.out.includes('既にあります') && records().length === before, r.out);
  for (const s of [s1, s2, s3]) fs.rmSync(path.join(DIR, `${TRIAL}/runs/${s}.json`), { force: true });
  // 同じ秒に始まった2つの実行: 一方だけが記録を書く
  const spawnRun = () => spawn(process.execPath, ['scripts/gate/adoption-trial.mjs', 'run'], { cwd: DIR, env, stdio: ['ignore', 'pipe', 'pipe'] });
  const a = spawnRun();
  const b = spawnRun();
  const wait = (p) =>
    new Promise((res) => {
      let out = '';
      p.stdout.on('data', (d) => (out += d));
      p.stderr.on('data', (d) => (out += d));
      p.on('close', (code) => res({ code, out }));
    });
  const [ra, rb] = await Promise.all([wait(a), wait(b)]);
  const okCount = [ra, rb].filter((x) => x.code === 0).length;
  const stopped = [ra, rb].filter((x) => x.code !== 0 && x.out.includes('既にあります')).length;
  const after = records().length;
  const sameSecond = okCount === 1 && stopped === 1 && after === before + 1;
  const differentSecond = okCount === 2 && after === before + 2;
  check(`h: 同時に始めた2つの実行は、一方だけが記録を書く(同じ秒: ${sameSecond} / 別の秒に始まった: ${differentSecond})`, sameSecond || differentSecond, ra.out + rb.out);
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd', TRIAL, 'evidence');
}

// ---------------------------------------------------------------- i. 注入者=見つける者の層は未測定(指摘1)
{
  const manifest = path.join(HERE, 'injection-manifest.json');
  const same = path.join(HERE, 'findings-same.json');
  let r = trial('i-tally-same.out', 'tally', '--manifest', manifest, '--human', same);
  const seeded = JSON.parse(read('evidence/seeded-errors.json'));
  check('i: tally は人の層を blind:false で書き、検出数を測定値として書かない', r.ok && seeded.human.blind === false && seeded.human.detected === undefined && Array.isArray(seeded.human.blindProblems) && seeded.human.blindProblems[0].includes('同じ') && typeof seeded.ai.detected === 'number', JSON.stringify(seeded));
  check('i: tally の出力が、人の層を未測定と言う', r.out.includes('人の層 未測定') && r.out.includes('blind:false'), r.out);
  commit('docs(adoption-trial): 集計(注入者が見つける者の記録。検証のため)');
  r = trial('i-run-same.out', 'run');
  const rec = read(`${TRIAL}/${records().at(-1)}`);
  check('i: 記録の節2 は人の層の検出数を「未測定」と出す', r.ok && /\| 品証 三郎 \|[^\n]*\| \*\*未測定\*\*\(目隠しを確かめられない\) \| 2 \|/.test(rec) && rec.includes('人の層: 見つける者が注入した者と同じ'), rec.split('\n').slice(28, 36).join('\n'));
  check('i: 記録の節6 の人の層は「測定なし」(基準と比べない)', /\| 欠陥注入: 人の層の検出率の下限 \|[^\n]*\| 測定なし[^|]*\| 人が照合する \|/.test(rec), rec);
  commit('docs(adoption-trial): 記録(検証のため)');
  const g = agg('i-agg-same.out', pr2);
  check('i: 出荷の集約の項目6 は人の層を未測定(目隠しを確かめられない)として扱い、理由を出す', typeof g.ev.assurance.detection.human === 'string' && g.ev.assurance.detection.human.startsWith('未測定(目隠しを確かめられない') && g.ev.assurance.detection.human.includes('同じ') && g.report.includes('- 人の層(欠陥注入): 未測定(目隠しを確かめられない'), g.ev.assurance.detection.human);
  check('i: AI の層は測定値のまま(率と件数)', g.report.includes('- AI の層(欠陥注入): 検出率 50%(検出 2 件 / 注入 4 件。測定時点 '), g.report.match(/- AI の層.*$/m)?.[0]);
  check('i: 組織の外へ渡す形の人の層は measuring:false', g.ev.assurance.detectionExternal.human.measuring === false, JSON.stringify(g.ev.assurance.detectionExternal));
  // 戻す(本来の tally)
  r = trial('i-tally-proper.out', 'tally', '--manifest', manifest);
  check('i: 本来の tally(別の人)は測定値を書く', r.ok && JSON.parse(read('evidence/seeded-errors.json')).human.detected === 3, r.out);
  commit('docs(adoption-trial): 集計(戻す)');
}

// ---------------------------------------------------------------- q. 類型E の記録の日付を過去にすると数え、D-0 表7 への転記を案内する(指摘5)
{
  const d = JSON.parse(read(`${TRIAL}/drills.json`));
  check('q: 実施日が未来の類型E は数えない(前の記録)', read(`${TRIAL}/${records().at(-1)}`).includes('今日(') && read(`${TRIAL}/${records().at(-1)}`).includes('より後。行っていない演習は数えない'), '');
  d.drills[0].at = '2026-10-05';
  write(`${TRIAL}/drills.json`, d);
  commit('docs(adoption-trial): 演習の実施日を直す');
  const r = trial('q-run-drill.out', 'run');
  const rec = read(`${TRIAL}/${records().at(-1)}`);
  check('q: 類型E を数え、判定の行に結果が出る', r.ok && /\| 類型E: [^\n]*\| 2026-10-05 1週 4件\(R2 以下の変更のマージ\) \| 人が照合する \|/.test(rec), rec.match(/\| 類型E.*$/m)?.[0]);
  check('q: 節4 に D-0 表7 の行「開発者(検証者)」へ転記する値と実測の日を案内する', rec.includes('表7 の行「開発者(検証者)」の「人へ戻したときに処理できる量」に「実測 1週 4件(R2 以下の変更のマージ)(2026-10-05 の類型E の演習)」、「実測の日」に 2026-10-05 と書く'), rec.match(/表7.*$/gm)?.join('\n'));
  check('q: コマンドの出力にも転記の案内が出る', r.out.includes('D-0 表7 の行「開発者(検証者)」へ転記する'), r.out);
  commit('docs(adoption-trial): 記録(演習を数えた)');
  // 転記した後は「実測あり。転記は不要」
  let d0 = read('docs/D-0-governance.md');
  d0 = d0.replace('| 開発者(検証者) | 未確認 | | 新規の機能の追加 |', '| 開発者(検証者) | 実測 1週 4件(2026-10-05 の類型E の演習) | 2026-10-05 | 新規の機能の追加 |');
  write('docs/D-0-governance.md', d0);
  commit('docs(D-0): 表7 の実測を転記する');
  const r2 = trial('q-run-after-transcribe.out', 'run');
  const rec2 = read(`${TRIAL}/${records().at(-1)}`);
  check('q: 転記の後は「実測あり。転記は不要」と出る', r2.ok && rec2.includes('「開発者(検証者)」(扱い 人へ戻す): 実測あり(実測 1週 4件(2026-10-05 の類型E の演習))。転記は不要'), rec2.match(/表7.*$/gm)?.join('\n') + rec2.match(/「開発者.*$/gm)?.join('\n'));
  commit('docs(adoption-trial): 記録(転記の後)');
}

// ---------------------------------------------------------------- j. 記録をコミットした後の出荷の集約(指摘8)、項目6・区分の出所(指摘2)、基準集合(指摘6)、外部向け(指摘10)、テストのファイル(指摘9)
{
  // 次の出荷: 製品の変更の PR と G-6 の判定記録
  write('src/inspection.js', read('src/inspection.js') + '\nexport const SCHEMA_VERSION = 2;\n');
  const h = prCommit('feat(F-001): スキーマの版を公開する', { risk: 'R2', confirmer: '審査 花子' });
  const d0v = JSON.parse(read('process.config.json')).d0Version;
  write('docs/gates/g6-pr-next.md', `# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | G-6 独立レビュー |\n| 対象 | PR #${prNo} |\n| 判定者 | 審査 花子 |\n| 判定日時 | 2026-10-07 10:00 |\n| 結果 | 通過 |\n| 確定の形態 | 人確定 |\n| 参照した D-0 の版 | ${d0v} |\n| 変更のリスク区分 | R2 |\n| リスク区分を確定した者 | 審査 花子 |\n| 期限内か | はい |\n\n## 挙動要約\n\n差分を読み、定数の公開だけであることを確かめた。\n`);
  commit('docs(gates): G-6 の判定記録');
  const g = agg('j-agg-next.out', pr2);
  const trialGaps = g.ev.gaps.filter((x) => /adoption-trial/.test(x));
  check('j: 導入前の検証の記録のコミットは、出荷の集約で欠落にならない(記録だけのコミット)', trialGaps.length === 0, trialGaps.join('\n'));
  const ro = g.report.match(/記録だけのコミット (\d+) 件/);
  check(`j: 記録だけのコミットの件数が出る(${ro?.[1]} 件)`, ro && Number(ro[1]) >= 8, g.report.match(/PR を経ていないコミット.*$/m)?.[0]);
  check('j: 記録の置き場に docs/adoption-trial/** が入る', g.report.includes('docs/adoption-trial/**'), g.report.match(/記録の置き場.*$/m)?.[0]);
  console.log(`       (j: 出荷の集約の欠落 ${g.ev.gaps.length} 件: ${g.ev.gaps.map((x) => x.slice(0, 60)).join(' / ')})`);
  // 指摘2: 項目6 を率と件数で出す
  const h6 = g.report.match(/- 人の層\(欠陥注入\): .*$/m)?.[0] ?? '';
  check('j: 項目6 の人の層は率と件数(生の JSON を印字しない)', h6.includes('検出率 75%(検出 3 件 / 注入 4 件。測定時点 2026-10-07') && !h6.includes('{"seeded"') && h6.includes('見逃した類型 入力の検査'), h6);
  // 指摘2: 区分の出所
  const src = g.report.match(/- リスク区分の出所: .*$/m)?.[0] ?? '';
  check('j: 区分の出所は PR 本文の確定者も数え、「記名は無い」と「確定者あり」が同時に出ない', src.includes('PR 本文の「確定した者」の記名') && !src.includes('記名は無い') && g.ev.assurance.changes.riskConfirmation.confirmed >= 1, src);
  // 指摘6: 起案=承認は承認に数えない
  const bs = g.ev.assurance.continuity.dependencies.find((d) => d.kind === '評価用の基準集合');
  check('j: 基準集合の範囲の承認は、起案と承認が同一人物なら承認に数えず、その旨を出す', bs && bs.scopeApproved === false && bs.scopeWhy.some((w) => w.includes('同一人物') && w.includes('要求事項10')), JSON.stringify(bs));
  check('j: 品質レポートに理由が出る', g.report.includes('範囲の承認(AI運用担当者の起案・技術判断者の記名): **なし**(起案した者と承認した者が同一人物'), g.report.match(/評価用の基準集合.*$/m)?.[0]);
  // 指摘10: 外部向け
  check('j: 外部向け: 役割名「品質保証部 課長」を氏名として伏せない', g.ext.includes('品質保証部 課長(QA の候補)'), g.ext.match(/育成の担当.*$/m)?.[0]);
  check('j: 外部向け: 名簿の氏名は伏せる', !/開発 一郎|審査 花子|品証 三郎|山本 健一/.test(g.ext), g.ext.match(/.*(開発 一郎|審査 花子|品証 三郎|山本 健一).*$/m)?.[0]);
  const succ = g.ext.match(/後継不在の席: .*$/m)?.[0] ?? '';
  check('j: 外部向け: 「候補 0 名 < 最低数 1 名(数えなかった候補あり。氏名は出さない)」の書式', succ.includes('候補 0 名 < 最低数 1 名(数えなかった候補あり。氏名は出さない))。'), succ);
  check('j: 外部向け: 項目6 は値を出さない', !g.ext.includes('検出率 75%') && g.ext.includes('測定している事実'), '');
  // 指摘9: テストのファイルは拡張子で絞る
  const r = run('node', ['-e', "import('./scripts/gate/verification-trace.mjs').then(m => console.log(JSON.stringify(m.testFiles())))"]);
  const files = JSON.parse(r.out.trim().split('\n').at(-1));
  check('j: tests/README.md はテストのファイルに数えない', !files.some((f) => /README\.md$/.test(f)) && files.some((f) => /\.test\.(m?js|ts)$/.test(f)), JSON.stringify(files));
}

console.log(bad ? `${bad} FAILED` : 'all ok');
process.exit(bad ? 1 : 0);
