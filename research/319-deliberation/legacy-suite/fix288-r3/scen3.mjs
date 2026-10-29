// 288 第3巡 残り: (A) 記録を1字変えると verify が不一致、(B) 演習の報告と退出の予行の記録のコミットが欠落にならない、
// (C) D-0 節9 の役割名の代理者を候補に数えない。採用者のリポジトリ(adopter/。scen2.mjs の後の状態)で確かめる。
//   node scen3.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'adopter');
const TPL = path.resolve(HERE, '../../template');
const OUT = path.join(HERE, 'out');
const MOCK = path.join(HERE, 'mockgh.mjs');
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
const prJson = (num, title, hash) =>
  fs.writeFileSync(
    path.join(PRS, `${num}.json`),
    JSON.stringify({ number: num, title, author: { login: 'dev-ichiro' }, reviews: [{ author: { login: 'shinsa-hanako' }, state: 'APPROVED', body: '挙動要約: 差分を読み、自分で確かめた' }], statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }], body: `## 検証方法と結果\n\ng5-local が通過\n\n## 作成を指示した者\n\n開発 一郎\n\n## リスク区分\n\nR3\n\n## トレーラ\n\nSpec: F-001\n`, mergeCommit: { oid: hash }, commits: [{ oid: hash, messageHeadline: title }], labels: [] })
  );
let prNo = Math.max(1, ...fs.readdirSync(PRS).map((f) => Number(f.replace('.json', '')) || 0));
const prCommit = (msg) => {
  prNo += 1;
  const h = commit(`${msg} (#${prNo})`);
  prJson(prNo, msg, h);
  return h;
};
const TRIAL = 'docs/adoption-trial';
const records = () => fs.readdirSync(path.join(DIR, TRIAL)).filter((f) => /^record-.*\.md$/.test(f)).sort();

// テンプレートの更新を PR で取り込む
for (const f of ['adoption-trial.mjs', 'aggregate-evidence.mjs', 'org-assurance.mjs', 'verification-trace.mjs']) fs.copyFileSync(path.join(TPL, 'scripts/gate', f), path.join(DIR, 'scripts/gate', f));
if (git('status', '--porcelain').out.trim()) prCommit('chore: テンプレートの更新(scripts/gate)を取り込む');
const base = git('rev-parse', 'HEAD').out.trim();

// ---------------------------------------------------------------- (A) 記録を手で1字変えると不一致。人の欄を埋めると一致
{
  const r0 = trial('a3-run.out', 'run');
  const file = `${TRIAL}/${records().at(-1)}`;
  commit('docs(adoption-trial): 記録');
  let r = trial('a3-verify.out', 'verify', file);
  check('A: 出力したままの記録は一致', r0.ok && r.ok, r.out);
  const t = read(file);
  const i = t.indexOf('11 / 11');
  write(file, t.slice(0, i) + '10 / 11' + t.slice(i + '11 / 11'.length));
  r = trial('a3-verify-1char.out', 'verify', file);
  check('A: 節6 の「11 / 11」を「10 / 11」に変えると不一致', !r.ok && r.out.includes('本文(人が書く欄を除く): 不一致'), r.out);
  git('checkout', '-q', '--', file);
  write(file, read(file).replace('| 実施者(氏名と席。席に就く予定の人) | <人が書く> | 要件② |', '| 実施者(氏名と席。席に就く予定の人) | 審査 花子(独立レビュア) | 要件② |').replace('| 同上 | <人が書く> | <YYYY-MM-DD> |', '| 同上 | 山本 健一(情報システム部長) | 2027-03-31 |'));
  r = trial('a3-verify-human.out', 'verify', file);
  check('A: 実施者と節9 の受容者・期限を埋めても一致', r.ok, r.out);
  commit('docs(adoption-trial): 実施者と受容者を記入');
}

// ---------------------------------------------------------------- (B) 演習の報告と退出の予行の記録を記録だけのコミットで入れる → 欠落にならない。基準集合は PR
{
  write('docs/drills/e-2026-10-06.md', '# 類型E 人へ戻す演習(2026-10-06)\n\n2回目。R2 以下の変更 3 件をマージした。\n');
  const ex = JSON.parse(read('docs/exit-rehearsal.json'));
  ex.rehearsals.push({ model: 'claude-sonnet-5-5', provider: 'Anthropic', alternative: { provider: 'OpenAI', model: 'gpt-5' }, at: '2026-10-06', baseline: 'docs/eval-baseline/cases.json', diff: 'docs/drills/f-2026-10-05.md', approvedBy: '開発 一郎' });
  write('docs/exit-rehearsal.json', ex);
  const recOnly = commit('docs(drills): 演習の報告と退出の予行の記録');
  // 基準集合の変更は PR で入れる
  const cases = JSON.parse(read('docs/eval-baseline/cases.json'));
  cases.cases.push({ id: 'B-13', spec: 'F-001', expect: '追加の既知の入出力' });
  write('docs/eval-baseline/cases.json', cases);
  prCommit('test(eval-baseline): 基準集合を1件足す');
  const g = agg('b3-agg.out', base);
  const hit = g.ev.gaps.filter((x) => x.includes(recOnly.slice(0, 8)) || /docs\/drills|exit-rehearsal/.test(x));
  check('B: 演習の報告と退出の予行の記録だけのコミットは欠落にならない', hit.length === 0, hit.join('\n'));
  check('B: 記録の置き場に docs/drills/** と docs/exit-rehearsal.json が入る', g.report.includes('docs/drills/**') && g.report.includes('docs/exit-rehearsal.json'), g.report.match(/記録の置き場.*$/m)?.[0]);
  const ro = g.report.match(/記録だけのコミット (\d+) 件/);
  check(`B: 記録だけのコミットに数える(${ro?.[1]} 件)`, ro && Number(ro[1]) >= 3, '');
  // 対照: 基準集合を記録だけのコミットに混ぜると欠落になる
  cases.cases.push({ id: 'B-14', spec: 'F-001', expect: '対照' });
  write('docs/eval-baseline/cases.json', cases);
  write('docs/drills/e-2026-10-07.md', '# 類型E(対照)\n');
  const mixed = commit('docs(drills): 演習の報告(基準集合を混ぜた対照)');
  const g2 = agg('b3-agg-mixed.out', base);
  check('B(対照): 基準集合を記録だけのコミットに混ぜると欠落になる', g2.ev.gaps.some((x) => x.includes(mixed.slice(0, 7)) && x.includes('docs/eval-baseline/cases.json')), g2.ev.gaps.join('\n'));
  git('reset', '-q', '--hard', 'HEAD~1');
}

// ---------------------------------------------------------------- (C) D-0 節9 の代理者が役割名 → 候補に数えない。名簿の氏名 → 数える
{
  const g = agg('c3-agg-role.out', base);
  const qa = g.ev.assurance.continuity.successors.find((s) => s.seat === '出荷判定者');
  check('C: 役割名「品質保証部 課長」の代理者は候補に数えない(理由つき)', qa && qa.counted === 0 && qa.vacant === true && qa.candidates.some((c) => c.name === '品質保証部 課長' && c.counted === false && /名簿/.test(c.why) && /役割名/.test(c.why)), JSON.stringify(qa));
  check('C: 品質レポートに数えなかった候補と理由が出る', /後継不在の席: 出荷判定者\(確認済みで周期内の候補 0 名 < 最低数 1 名\(数えなかった候補: 品質保証部 課長: .*名簿/.test(g.report), g.report.match(/後継不在の席: 出荷判定者.*$/m)?.[0]);
  check('C: 外部向けは件数だけ(役割名も氏名も出さない)', /後継不在の席: 出荷判定者\(確認済みで周期内の候補 0 名 < 最低数 1 名\(数えなかった候補あり。氏名は出さない\)\)/.test(g.ext), g.ext.match(/後継不在の席: 出荷判定者.*$/m)?.[0]);
  // 名簿の人(審査 花子)に書き換える → 数える
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace('| 出荷判定者 | 品質保証部 課長 | 全部 | 確認済み | 2026-09-26 |', '| 出荷判定者 | 審査 花子 | 全部 | 確認済み | 2026-09-26 |'));
  commit('docs(D-0): 出荷判定者の代理者を名簿の人に');
  const g2 = agg('c3-agg-name.out', base);
  const qa2 = g2.ev.assurance.continuity.successors.find((s) => s.seat === '出荷判定者');
  check('C: 名簿の人の氏名なら候補に数える', qa2 && qa2.counted === 1 && qa2.vacant === false, JSON.stringify(qa2));
  // 名簿に無い氏名 → 数えない
  write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace('| 出荷判定者 | 審査 花子 | 全部 | 確認済み | 2026-09-26 |', '| 出荷判定者 | 外部 太郎 | 全部 | 確認済み | 2026-09-26 |'));
  commit('docs(D-0): 出荷判定者の代理者を名簿に無い人に');
  const g3 = agg('c3-agg-unknown.out', base);
  const qa3 = g3.ev.assurance.continuity.successors.find((s) => s.seat === '出荷判定者');
  check('C: 名簿に無い名義は候補に数えない', qa3 && qa3.counted === 0 && qa3.candidates[0].why.includes('名簿'), JSON.stringify(qa3));
  git('reset', '-q', '--hard', 'HEAD~2');
}

console.log(bad ? `${bad} FAILED` : 'all ok');
process.exit(bad ? 1 : 0);
