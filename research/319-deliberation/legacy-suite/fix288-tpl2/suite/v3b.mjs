// 第3巡: 1人・2名の体制と、構成の整合の検査(t1-solo-delegate・b3・b6・s14b・K50 の 1〜2名・K51 の事象5・6)。
//   sh tmp/fix3-h3a/fresh.sh v2 && node tmp/fix3-h3a/v3b.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { workspace, checker, BASE, APPOINTER, BASIS, TODAY } from './lib.mjs';

const W = workspace('v2');
const { DIR, run, git, write, read, cfg, gen, change, contract, checkD0, checkRules, resetTo, commit, d0 } = W;
const { check, refused, accepted, done } = checker();
const last = () => cfg().changeLog.at(-1);
const seat = (role) => cfg().seats.find((s) => s.role === role);
const DAY = TODAY;
const SEATS9 = ['biz-approver', 'value-owner', 'tech-lead', 'dev-verifier', 'independent-reviewer', 'qa-gatekeeper', 'context-owner', 'ai-maintainer', 'ai-ops'];
const all = (who) => Object.fromEntries(SEATS9.map((r) => [r, { accountable: who }]));
const P = { model: 'claude-fable-5-1', instructions: 'CLAUDE.md v1', permissions: 'dev-token' };
const PR = { ...P, permissions: 'review-token' };
const Q = (performer) => ({ confirmedAt: '2026-09-25', performedBy: '山田 太郎', approvedBy: '山田 太郎', cases: 'docs/q.md', result: '10/10', performer });

// ------------------------------------------------------------------ 1人体制
write('answers.json', { ...BASE, 'q-team-size': 'size-1-2', 'q-biz-phase': 'mvp', 'q-external-reviewer': 'reviewer-no' });
check('初期化(1人)', gen('--answers', 'answers.json', '--stack', 'node').ok);
d0('1.0');
refused('K60 1人体制の初回の記入(記名なし)', change({ kind: 'accountable', date: DAY, summary: '1人', people: [{ id: 'p1', name: '山田 太郎', accounts: ['yamada'] }], seats: all('山田 太郎') }), '任免');
const solo = change({ kind: 'accountable', date: DAY, summary: '1人', people: [{ id: 'p1', name: '山田 太郎', accounts: ['yamada'] }], seats: all('山田 太郎'), decidedBy: '山田 太郎', reason: '初期の設定' });
accepted('K60 1人体制の初回の記入(本人の記名と理由)', solo);
check('K50 1人体制: 出荷判定者 × 事業決裁者は逸脱として記録', cfg().deviations.some((d) => d.separationId === 'sep-shipping-business' && /異議を書く者と、残存リスクを受容する者が同一/.test(d.reason)), JSON.stringify(cfg().deviations.map((d) => d.separationId ?? d.gate)));
check('契約検査(1人)', contract().ok, contract().out);
check('D-0 の検査(1人)', checkD0().ok, checkD0().out);
commit('chore: solo');
git('tag', 'solo');

// t1-solo-delegate: 1人で運用形態を変える。通知する者と通知先が同一
const types = [{ id: '表示文言', registeredBy: '山田 太郎', registeredAt: DAY, basis: BASIS }];
const t1 = change({
  kind: 'mode',
  date: DAY,
  summary: '1人体制で開発者と独立レビュアの席を委任',
  seats: {
    'dev-verifier': { mode: 'delegated', performer: P, fallback: 'human', qualification: Q(P) },
    'independent-reviewer': { mode: 'delegated', performer: PR, fallback: 'human', qualification: Q(PR) },
  },
  delegation: {
    changeTypes: types,
    protectedPaths: [],
    rules: [
      { id: 'DR-001', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: '山田 太郎', reason: 'r' },
      { id: 'DR-002', seat: 'independent-reviewer', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: '山田 太郎', reason: 'r' },
    ],
  },
  decidedBy: '山田 太郎',
  reason: '事後監査',
  ruleApprovedBy: '山田 太郎',
});
accepted('t1-solo-delegate 反映', t1, '通知する者と通知先が同一');
check('K51 通知する者と通知先が同一 → 自動で記録(self)', last().notice?.self === true && last().notice.to === '山田 太郎' && last().notice.at === DAY, JSON.stringify(last().notice));
check('K51 未記録の即時通知は無い', !/即時通知が未記録/.test(contract().out), contract().out);
check('D-0 の改訂履歴に「通知する者と通知先が同一」', read('docs/D-0-governance.md').includes('通知する者と通知先が同一'));
resetTo('solo');
accepted('qaNotice を定める', change({ kind: 'accountable', date: DAY, summary: '部門', governance: { qaNotice: '品質保証部' } }));
accepted('1人 + 部門の通知先: 運用形態の変更(通知日なし)', change({ kind: 'mode', date: DAY, summary: 'x', seats: { 'dev-verifier': { mode: 'human' } } }), '品質保証部門の通知先');
check('K51 部門の通知先を定めていれば、自分への通知を省いても部門へ送った日が要る(未記録)', last().notice?.self === true && last().notice.at === null && /即時通知が未記録/.test(contract().out), JSON.stringify(last().notice));
resetTo('solo');

// b3: 回答は確認者なし、名簿に架空の外部の確認者を席へ
refused(
  'b3 回答 reviewer-no のまま、外部の確認者を独立レビュアの席へ',
  change({ kind: 'accountable', date: DAY, summary: '外部', people: [{ id: 'p1', name: '山田 太郎', accounts: ['yamada'] }, { id: 'x', name: '外山 健', external: true }], seats: { 'independent-reviewer': { accountable: '外山 健' } }, decidedBy: '山田 太郎', reason: 'r' }),
  'reviewer-no',
  '外部の確認者'
);
// 手で書き換えた構成(連鎖が壊れる)。契約検査と、集約が呼ぶ整合の検査の両方で検出する
const hand = (fn) => {
  const c = cfg();
  fn(c);
  write('process.config.json', JSON.stringify(c, null, 2) + '\n');
};
hand((c) => {
  c.people.push({ id: 'x', name: '外山 健', external: true, accounts: [] });
  c.seats.find((s) => s.role === 'independent-reviewer').accountable = '外山 健';
});
check('b3 手で外部の確認者を書いた構成 → 契約検査が矛盾と連鎖の不一致を出す', !contract().ok && /reviewer-no/.test(contract().out) && /変化点の記録を経ずに/.test(contract().out), contract().out);
const cfgMod = await import(pathToFileURL(path.join(DIR, 'scripts/gate/config.mjs')).href);
const integ = cfgMod.configIntegrityProblems(cfg());
check('K62 configIntegrityProblems が矛盾と書き換えを返す(集約が呼ぶ)', integ.some((p) => /reviewer-no/.test(p)) && integ.some((p) => /変化点の記録を経ずに/.test(p)), integ.join('\n'));
resetTo('solo');
// b6: 手で下限を下げる
hand((c) => {
  c.ci.coverageThreshold = 10;
  c.task.maxChangedLines = 99999;
});
check('b6 手での書き換え → configIntegrityProblems が検出', cfgMod.configIntegrityProblems(cfg()).some((p) => /変化点の記録を経ずに/.test(p)));
resetTo('solo');
check('K62 整合した構成では configIntegrityProblems は空', cfgMod.configIntegrityProblems(cfg()).length === 0, cfgMod.configIntegrityProblems(cfg()).join('\n'));

// s14b: PR を経ない体制で main へ直接コミットした書き換えを、push の直前のコミットとの比較で検出する
hand((c) => {
  c.ci.coverageThreshold = 10;
});
commit('chore: 手で下限を下げた');
const vs = run('node', ['scripts/gate/verify-gate-contract.mjs', '--base', 'HEAD~1']);
check('K62 push の直前のコミット(HEAD~1)と比べる契約検査が書き換えを検出', !vs.ok && /changeLog への追記がありません|変化点の記録を経ずに/.test(vs.out), vs.out);
resetTo('solo');
const wf = read('.github/workflows/gate-g5.yml');
check('K62 gate-g5.yml が既定ブランチへの push で契約検査を実行し、直前のコミットと比べる', /push:\n\s+branches: \[main\]/.test(wf) && /--base "\$BEFORE"/.test(wf));

// ------------------------------------------------------------------ 2名(相互の確認)。事象5・事象6
accepted('2人目が加わる(相互の確認。決定者の記名)', change({ kind: 'headcount', date: DAY, summary: '2名', answers: { 'q-external-reviewer': 'reviewer-yes' }, people: [{ id: 'p1', name: '山田 太郎', accounts: ['yamada'] }, { id: 'p2', name: '佐藤 花子', accounts: ['sato'] }], seats: { 'independent-reviewer': { accountable: '佐藤 花子' }, 'ai-ops': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '2人目' }));
check('2名で G-6 が成立', cfgMod.g6Established(cfg()), JSON.stringify(cfg().gates.g6));
commit('chore: duo');
git('tag', 'duo');
const t5 = change({ kind: 'accountable', date: DAY, summary: '確認者を置かない', answers: { 'q-external-reviewer': 'reviewer-no' }, seats: { 'independent-reviewer': { accountable: '山田 太郎' } }, decidedBy: '山田 太郎', reason: '佐藤も指示に関与する' });
accepted('2名のまま G-6 を未達へ(決定)', t5);
check('K51 事象5: G-6 が成立から未達へ → 即時通知の対象', last().notice?.reasons?.some((r) => r.startsWith('独立レビュー(G-6)')), JSON.stringify(last().notice));
resetTo('duo');
accepted('出荷判定者を佐藤へ(決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '出荷判定者を佐藤へ', seats: { 'qa-gatekeeper': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '分ける' }));
check('K51 事象6: 前任者(山田)は通知する者でもあり、新任(佐藤)とは別人 → 自動では記録しない', last().notice?.reasons?.includes('出荷判定者の席の責任者の交代') && !last().notice.self && last().notice.also?.[0]?.to === '山田 太郎', JSON.stringify(last().notice));
commit('chore: qa sato');
accepted('佐藤が離脱(出荷判定者の席が空く。記名なし)', change({ kind: 'headcount', date: DAY, summary: '佐藤が離脱', answers: { 'q-external-reviewer': 'reviewer-no' }, people: [{ id: 'p1', name: '山田 太郎', accounts: ['yamada'] }], seats: { 'independent-reviewer': { accountable: null }, 'ai-ops': { accountable: null }, 'qa-gatekeeper': { accountable: null } } }));
check('K51 前任者が離脱 → 通知先は D-0 表1 の決定者(山田)。通知する者(文脈オーナー=山田)と同一 → 自動で記録', last().notice?.self === true && last().notice.to === '山田 太郎', JSON.stringify(last().notice));
resetTo('duo');
// K50: 2名で出荷判定者を事業決裁者と同じ人にする(1〜2名は逸脱。別の人を置けるので決定)
const k50 = change({ kind: 'accountable', date: DAY, summary: '出荷判定者は山田のまま', seats: {} });
check('K50 2名: 出荷判定者 × 事業決裁者(山田)は逸脱として記録され続ける', cfg().deviations.some((d) => d.separationId === 'sep-shipping-business'), JSON.stringify(cfg().deviations.map((d) => d.separationId ?? d.gate)));

done();
