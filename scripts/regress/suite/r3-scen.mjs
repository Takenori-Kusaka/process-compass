// #288 第3巡: 指摘 1〜10 の各場面を、採用者のリポジトリ(導入前の検証を a〜g まで流した後の状態)で確かめる。
// 元は research/319-deliberation/legacy-suite/fix288-r3/scen.mjs(27 場面)。#378 で移した(research/378-deliberation/decision.md)。
// 元の段0(テンプレートの更新を PR で取り込む)は、作業用の複製がいまのテンプレートから作られ、取り込む差分が無いため作らない。
// 逆算した入力の対照(裁定 R-4): n は AI の担い手を置かない採用者(元の setup.mjs の席)、t は層1 の育成の担当に名簿の氏名。
// 宣言の時刻 2026-10-07 は #288 第3巡の判定の日。q1(類型E の 2026-10-09 が未来)と j4(測定時点 2026-10-07)はこの時刻に依る。
//   node scripts/regress/run.mjs --only r3-scen
// @regress {"now": "2026-10-07T12:00:00Z", "workspaces": ["r3a", "r3n"], "fixes": ["#288"]}
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { adopter, trialSteps, scenSteps, check, done, fixes, pre, TRIAL } from './lib-r3.mjs';
import { POLICY, CYCLE } from './lib288.mjs';

fixes(['ADR-0057 決定11']);
const A = adopter('r3a');
const T = trialSteps(A);
const { W, trial, agg, records, DIR, product } = A;
const { run, git, write, read } = W;
const pad = (n) => String(n).padStart(2, '0');
const stampOf = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

// ---------------------------------------------------------------- h. 同じ秒の記録があれば止まる(指摘4。補足 S19)。状態を残さない
fixes(['ADR-0057 決定11']);
{
  run('node', ['-e', '0']); // 論理の時計を1つ進め、試験のプロセスの時刻を次の子と同じ刻みにそろえる
  const now = new Date(Date.now() + 1000);
  const stamps = [0, 1000, 2000].map((d) => stampOf(new Date(now.getTime() + d)));
  for (const s of stamps) write(`${TRIAL}/runs/${s}.json`, { startedAt: 'placeholder', state: 'running' });
  const before = records().length;
  const r = trial('run');
  check('h: 同じ時刻の記録(予約)があれば、上書きせずに止まる', !r.ok && r.out.includes('既にあります') && records().length === before, r.out);
  for (const s of stamps) fs.rmSync(path.join(DIR, `${TRIAL}/runs/${s}.json`), { force: true });
  // 同じ秒に始まった2つの実行: 一方だけが記録を書く。論理の時計の同じ時刻を2つの子へ渡す。
  // 元は実時間で流したため「別の秒に始まった(両方が書く)」の分岐も通した。いまは2つの子が必ず同じ秒に始まるので、その分岐を許さない
  // (許すと、予約の排他を外した変異でも通った。research/378-deliberation/survey.md 3.5)
  run('node', ['-e', '0']);
  const at = new Date(Date.now() + 1000).toISOString();
  const env = { ...process.env, GITHUB_BASE_REF: '', ...A.env, REGRESS_NOW: at, GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: at };
  const spawnRun = () => spawn(process.execPath, ['scripts/gate/adoption-trial.mjs', 'run'], { cwd: DIR, env, stdio: ['ignore', 'pipe', 'pipe'] });
  const wait = (p) =>
    new Promise((res) => {
      let out = '';
      p.stdout.on('data', (d) => (out += d));
      p.stderr.on('data', (d) => (out += d));
      p.on('close', (code) => res({ code, out }));
    });
  const [ra, rb] = await Promise.all([wait(spawnRun()), wait(spawnRun())]);
  run('node', ['-e', '0']);
  const okCount = [ra, rb].filter((x) => x.code === 0).length;
  const stopped = [ra, rb].filter((x) => x.code !== 0 && x.out.includes('既にあります')).length;
  const after = records().length;
  const sameSecond = okCount === 1 && stopped === 1 && after === before + 1;
  check('h: 同時に始めた2つの実行は、一方だけが記録を書く', sameSecond, ra.out + rb.out, {
    observed: `成功 ${okCount} / 既にありますで止まった ${stopped} / 記録の増加 ${after - before}`,
    changed: [{ by: 'ADR-0089 決定5', on: '2026-11-11', from: "名前「h: 同時に始めた2つの実行は、一方だけが記録を書く(同じ秒: ${sameSecond} / 別の秒に始まった: ${differentSecond})」、条件 sameSecond || differentSecond(differentSecond = okCount === 2 && after === before + 2)" }],
  });
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd', TRIAL, 'evidence');
}

// ---------------------------------------------------------------- i・q・j(状態を変える節。r3-verify・r3-succession は判定せずに再生する)
scenSteps(A, T, check);

// ---------------------------------------------------------------- t(対照): 層1 の育成の担当に名簿の氏名を書けば、外部向けで伏せる(INPUT_ORIGIN.trainer)
fixes(['ADR-0057 決定12', '標準 3.4.3', '標準 G-7']);
{
  write('docs/quality-assurance-policy.md', POLICY({ cycle: { ...CYCLE, trainer: '品証 三郎' } }));
  A.commit('docs(層1): 育成の担当を名簿の人にする(対照)');
  const g = agg('t(対照): 出荷の集約', product);
  const line = g.ext.match(/.*育成の担当.*$/m)?.[0] ?? '';
  check('t(対照・育成の担当に名簿の氏名): 外部向けで氏名を伏せる', line && !line.includes('品証 三郎') && line.includes('氏名は出さない'), line || g.ext.slice(0, 1200));
  git('reset', '-q', '--hard', 'HEAD~1');
}

// ---------------------------------------------------------------- n(対照): AI の担い手を置かない採用者(元の setup.mjs の席の入力。INPUT_ORIGIN.performer)
fixes(['ADR-0057 決定11', '標準 5.6.2', 'ADR-0054 決定9']);
{
  const N = adopter('r3n', { performer: false });
  trialSteps(N);
  const d = JSON.parse(N.W.read(`${TRIAL}/drills.json`));
  d.drills[0].at = '2026-10-05';
  N.W.write(`${TRIAL}/drills.json`, d);
  N.commit('docs(adoption-trial): 演習の実施日を直す');
  const r = N.trial('run');
  const rec = N.W.read(`${TRIAL}/${N.records().at(-1)}`);
  pre('r3n: 類型E を数えた記録が出る', r.ok && /\| 類型E: [^\n]*\| 2026-10-05 1週 4件/.test(rec), rec.match(/\| 類型E.*$/m)?.[0] ?? r.out.slice(-800));
  N.commit('docs(adoption-trial): 記録');
  check('n(対照・AI の担い手なし): 類型E を数えても、D-0 表7 への転記の案内は出ない', !rec.includes('表7 の行「開発者(検証者)」の「人へ戻したときに処理できる量」に') && !r.out.includes('D-0 表7 の行「開発者(検証者)」へ転記する'), rec.split('## 4.')[1]?.slice(0, 1200));
  const g = N.agg('n(対照): 出荷の集約', N.product);
  check('n(対照・AI の担い手なし): AI の層は「未測定(AI の担い手の宣言なし)」', String(g.ev.assurance?.detection?.ai ?? '').includes('AI の担い手の宣言なし'), String(g.ev.assurance?.detection?.ai) + g.out.slice(-800));
  fixes(['ADR-0057 決定12', '標準 3.12.3', 'ADR-0054 決定9']);
  check('n(対照・AI の担い手なし): 依存先「評価用の基準集合」は出ない', Array.isArray(g.ev.assurance?.continuity?.dependencies) && !g.ev.assurance.continuity.dependencies.some((x) => x.kind === '評価用の基準集合'), JSON.stringify(g.ev.assurance?.continuity?.dependencies));
}

done();
