// #430 突合 M-2: 出荷の証跡の集約が、AI の担い手の名義を数え方に通すこと(independentConfirmation の名義の印と専用の除外、
// ledgerRowUnbacked の名義の共有に依る帰属、保証の開示の項目1 の件数)を、集約の本体を流して確かめる。
//   node scripts/regress/run.mjs --only performer-account
// @regress {"now": "2026-11-05T03:00:00Z", "workspaces": ["pa1"], "fixes": ["#430"]}
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, NAMES, SEATS, fill, TODAY, BASE, rosterAccount, clRecord } from './lib.mjs';
import { regressAccountId } from '../lib/account-id.mjs';

const { check, done, ghRun, fixes } = checker();
fixes(['ADR-0107 決定3', '標準 G-6', '標準 3.5.3']);

const W = workspace('pa1');
const { git, write, read, gen, commit, cfg } = W;
const tpl = git('rev-parse', 'HEAD').out.trim();
write('answers.json', { 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp', ...BASE });
check('準備: 3名で初期化が通る', gen('--answers', 'answers.json', '--stack', 'node').ok);
fs.rmSync(path.join(W.DIR, 'answers.json'));
write('package-lock.json', '{ "name": "x", "lockfileVersion": 3, "requires": true, "packages": {} }\n');
git('switch', '-q', '-c', 'chore/process-init');
commit('chore: プロセス構成を初期化する');
git('switch', '-q', 'main');
git('merge', '-q', '--squash', 'chore/process-init');
commit('chore: プロセス構成を初期化する (#1)');
const initHash = git('rev-parse', 'HEAD').out.trim();
fs.copyFileSync(path.join(W.DIR, 'templates/00-d0-governance.md'), path.join(W.DIR, 'docs/D-0-governance.md'));
fs.writeFileSync(path.join(W.DIR, 'docs/D-0-governance.md'), read('docs/D-0-governance.md').replace('| 市場・顧客仮説の検証の実施 | | | | | |', '| 市場・顧客仮説の検証の実施 | 価値責任者 | | | | 価値責任者 |'));
gen('--answers', 'process.config.json');
const people = NAMES.slice(0, 3).map((name, i) => ({ id: `p${i + 1}`, name, accounts: [rosterAccount(`acct-${i + 1}`)] }));
const assign = { 'biz-approver': 1, 'value-owner': 0, 'tech-lead': 0, 'dev-verifier': 0, 'independent-reviewer': 1, 'qa-gatekeeper': 2, 'context-owner': 0, 'ai-maintainer': 1, 'ai-ops': 0 };
const f = fill(W, people, Object.fromEntries(SEATS.map((s) => [s, { accountable: NAMES[assign[s]] }])));
check('準備: 3名の任免が通る', f.ok, f.out);
const PERF = { model: 'claude-sonnet-5', instructions: 'v1', permissions: 'default' };
// 開発者の席の担い手は、席の責任者(山田)のアカウントで動く(共有)
const s1 = W.change({ kind: 'performer', date: TODAY, summary: '開発者の席の担い手を宣言する(共有)', seats: { 'dev-verifier': { performer: PERF, performerAccount: { kind: 'shared', person: 'p1' } } }, decidedBy: NAMES[0], reason: '担い手の宣言' });
check('準備: 開発者の席の担い手を、名義の共有として宣言する', s1.ok, s1.out);
// 独立レビュアの席の担い手は、専用のアカウント(AI を示す語を含まない)で動く
const s2 = W.change({ kind: 'performer', date: TODAY, summary: '独立レビュアの席の担い手を宣言する(専用)', seats: { 'independent-reviewer': { performer: PERF, performerAccount: { kind: 'dedicated', account: { login: 'pit-helper', id: regressAccountId('pit-helper') } } } }, decidedBy: NAMES[1], reason: '担い手の宣言' });
check('準備: 独立レビュアの席の担い手を、専用の名義として宣言する(席の責任者の記名)', s2.ok, s2.out);
// #373(ADR-0113 決定1・決定4): 節16 の安全重要度の判定の記録。判定者は事業決裁者の席の責任者(佐藤)
write('docs/D-0-governance.md', clRecord(read('docs/D-0-governance.md'), { judge: NAMES[1] }).replace(/^approver:.*$/m, `approver: ${NAMES[1]}`).replace(/^approved_at:.*$/m, `approved_at: ${TODAY}`).replace(/^approval_scope:.*$/m, 'approval_scope: all').replace(/^next_review:.*$/m, 'next_review: 2027-03-31'));
fs.rmSync(path.join(W.DIR, 'change.json'), { force: true });
commit('docs: 体制と担い手の名義を記入する');

// PR #2: 名義を共有する人(山田)が挙動要約つきで承認した変更。PR #3: 専用のアカウントだけが承認した変更
const prs = path.join(W.DIR, '.git', 'prs');
fs.mkdirSync(prs, { recursive: true });
const pr = (n, file, approver) => {
  git('switch', '-q', '-c', `feature/x${n}`);
  write(file, `export const v${n} = ${n};\n`);
  commit(`feat: x${n}`);
  git('switch', '-q', 'main');
  git('merge', '-q', '--squash', `feature/x${n}`);
  commit(`feat: x${n} (#${n})\n\nSpec: F-001 / Task-1`);
  const h = git('rev-parse', 'HEAD').out.trim();
  fs.writeFileSync(
    path.join(prs, `${n}.json`),
    JSON.stringify({
      number: n,
      title: `feat: x${n}`,
      author: { login: 'acct-3' },
      reviews: [{ author: { login: approver }, state: 'APPROVED', commit: { oid: h }, body: '挙動要約: 境界値の入力で例外を投げずに既定値を返すことを確かめた' }],
      headRefOid: h,
      statusCheckRollup: [{ __typename: 'CheckRun', name: 'gate-g5', status: 'COMPLETED', conclusion: 'SUCCESS' }],
      body: `## 検証方法と結果\n\nnpm test\n\n## 作成を指示した者\n\n${NAMES[2]}\n\n## リスク区分\n\nR3\n\n## トレーラ\n\nSpec: F-001 / Task-1\n`,
      mergeCommit: { oid: h },
      commits: [{ oid: h, messageHeadline: `feat: x${n}` }],
    })
  );
  return h;
};
pr(2, 'src/a.js', 'acct-1');
pr(3, 'src/b.js', 'pit-helper');

// ゲートの判定を対象とする例外承認の行(承認した者は名義を共有する山田)。行を入れた PR の作成者は山田、承認は名義を共有しない佐藤
const LEDGER = '# 技術負債台帳\n\n| ID | 区分 | 対象 | 内容 | 受容した理由 | 顕在化の兆候 | 返却の目安 | 状態 | 記録者 | 承認した者 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
const row = (id) => `| ${id} | 例外 | G-1 P-001 | 共通の通過条件を満たさない | 期限内に整える | 前提の劣化を見落とす | 2026-12-31 まで。回収責任者 ${NAMES[0]} | 未返却 | ${NAMES[0]} | ${NAMES[0]} |\n`;
const mockMaterialPr = (sha, { number, author, approvers }) => {
  fs.writeFileSync(path.join(prs, `pulls-${sha}.json`), JSON.stringify([{ number, merged_at: '2026-11-01T00:00:00Z', merge_commit_sha: sha, head: { sha: `head-${number}` }, user: { login: author } }]));
  fs.writeFileSync(path.join(prs, `reviews-${number}.json`), JSON.stringify(approvers.map((login) => ({ user: { login, type: 'User' }, state: 'APPROVED', commit_id: `head-${number}` }))));
};
write('docs/debt-ledger.md', LEDGER + row('D-001'));
commit('docs: 台帳');
mockMaterialPr(git('rev-parse', 'HEAD').out.trim(), { number: 50, author: 'acct-1', approvers: ['acct-2'] });

const aggregate = () => {
  const r = ghRun(W, '出荷の証跡の集約', 'node', ['scripts/gate/aggregate-evidence.mjs', '--from', tpl, '--to', 'HEAD'], { GITHUB_REPOSITORY: 'example/pa', MOCK_PRS: prs });
  return { r, ev: JSON.parse(read('evidence/evidence.json')), report: fs.existsSync(path.join(W.DIR, 'evidence/quality-report.md')) ? read('evidence/quality-report.md') : '' };
};
let { ev, report } = aggregate();
const ind = ev.assurance?.independence ?? {};
const pa = ind.performerAccounts ?? {};
const prOf = (n) => (ev.prs ?? []).find((p) => p.number === n);
check('G-6(集約): 名義を共有する人の承認は数え、印(sharedApprovers)を付ける', prOf(2)?.g6?.independent?.counted === true && (prOf(2)?.g6?.independent?.sharedApprovers ?? []).includes(NAMES[0]), JSON.stringify(prOf(2)?.g6 ?? ev.prs?.map((p) => p.number)));
check('G-6(集約): 専用と申告したアカウントの承認は、AI を示す語を含まなくても数えない', prOf(3)?.g6?.independent?.counted === false && (prOf(3)?.g6?.independent?.dedicatedApprovals ?? []).length === 1, JSON.stringify(prOf(3)?.g6));
check('保証の開示(項目1): 名義を共有するアカウントの承認の件数を出す', pa.sharedApprovals === 1 && ind.changes?.sharedAccountApprovals === 1 && ind.changes?.dedicatedApprovalChanges === 1, JSON.stringify({ pa, changes: ind.changes }));
check('保証の開示(項目1): 席ごとの名義の状態(共有・専用)を出す', (pa.seats ?? []).some((s) => s.role === 'dev-verifier' && s.kind === 'shared' && s.person === NAMES[0]) && (pa.seats ?? []).some((s) => s.role === 'independent-reviewer' && s.kind === 'dedicated' && s.envConfirmed === false), JSON.stringify(pa.seats));
check('効力を持つ記録(集約): 名義を共有する記名者の行を、名義を共有していない人の帰属の確認で裏づけ、件数に出す', pa.sharedAttribution?.confirmed === 1 && pa.sharedAttribution?.selfAttested === 0 && !(ev.gaps ?? []).some((g) => /D-001/.test(g)), JSON.stringify({ sa: pa.sharedAttribution, gaps: (ev.gaps ?? []).filter((g) => /D-001|例外/.test(g)) }));
check('保証の開示の本文: 名義の行と、名義の照合が無い専用の申告を出す', /AI の担い手の名義/.test(report) && /名義の照合が無い/.test(report), report.split('\n').filter((l) => /名義/.test(l)).join('\n').slice(0, 800));

// 行を入れた PR の承認者が記名者本人だけ(作成者も名義を共有しない佐藤以外)→ 帰属に数えない
write('docs/debt-ledger.md', LEDGER + row('D-002'));
commit('docs: 台帳(D-002)');
mockMaterialPr(git('rev-parse', 'HEAD').out.trim(), { number: 51, author: 'acct-3', approvers: ['acct-1'] });
({ ev } = aggregate());
const rejected = JSON.stringify(ev);
check('効力を持つ記録(集約): 名義を共有する記名者本人の承認だけで入れた行は、帰属に数えない', /D-002[^"]*名義を共有/.test(rejected), (ev.gaps ?? []).join('\n').slice(0, 800));
void initHash;
done();
