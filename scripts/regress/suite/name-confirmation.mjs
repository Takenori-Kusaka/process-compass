// #375 の追加の裁定 AR-1〜AR-3: 氏名の確認の記名者の資格(類B)の例外を初回の記入に限ること(ADR-0111 決定2)と、
// 1名の体制に2人目を足す変化点の確認待ち(ADR-0111 決定5)を固定する。
// 入力は #375 の独立の突合(research/375-deliberation/crosscheck.md の E1b・E2・E3b・E4c・E5a〜E5e)に当たる。
//   node scripts/regress/run.mjs --only name-confirmation
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["nc375"], "fixes": ["#375"]}
import { workspace, checker, BASE, APPOINTER, TODAY, rosterAccount } from './lib.mjs';

const { check, refused, accepted, fixes, done } = checker();
fixes(['ADR-0111 決定2', 'ADR-0079 決定7', '標準 3.13.3']);

const W = workspace('nc375');
const { git, write, cfg, gen, change, contract } = W;
const reset = () => {
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd');
};
const init = (size) => {
  reset();
  write('answers.json', { ...BASE, 'q-team-size': size, 'q-biz-phase': 'mvp', ...(size === 'size-1-2' ? { 'q-external-reviewer': 'reviewer-yes' } : {}) });
  const r = gen('--answers', 'answers.json', '--stack', 'node');
  W.d0('1.0');
  return r;
};
const PEOPLE3 = [
  { id: 'yamada', name: '山田 太郎', accounts: [rosterAccount('yamada-taro')] },
  { id: 'sato', name: '佐藤 花子', accounts: [rosterAccount('sato-hanako')] },
  { id: 'suzuki', name: '鈴木 一郎', accounts: [rosterAccount('suzuki-ichiro')] },
  APPOINTER,
];
const SEATS3 = {
  'biz-approver': { accountable: '山田 太郎' },
  'value-owner': { accountable: '山田 太郎' },
  'tech-lead': { accountable: '山田 太郎' },
  'dev-verifier': { accountable: '山田 太郎' },
  'independent-reviewer': { accountable: '佐藤 花子' },
  'qa-gatekeeper': { accountable: '鈴木 一郎' },
  'context-owner': { accountable: '山田 太郎' },
  'ai-maintainer': { accountable: '山田 太郎' },
  'ai-ops': { accountable: '鈴木 一郎' },
};
const DUPONT = { id: 'dupont', name: 'Claude Dupont', accounts: [rosterAccount('cdupont')], nameConfirmed: true };
const GEMINI = { id: 'gsato', name: 'Gemini Sato', accounts: [rosterAccount('gsato')], nameConfirmed: true };
const TAKAHASHI = { id: 'takahashi', name: '高橋 次郎', accounts: [rosterAccount('takahashi-jiro')] };
const ALL = (name) => Object.fromEntries(Object.keys(SEATS3).map((k) => [k, { accountable: name }]));
const first = (o) => change({ kind: 'accountable', date: TODAY, summary: '初回の記入', people: [...PEOPLE3, DUPONT], seats: SEATS3, decidedBy: '山田 太郎', reason: '初期の体制を記入する', ...o });

// ---------------------------------------------------------------- AR-1 初回の記入の例外(3名・MVP・CL0)
check('初回の記入: 準備(初期化)', init('size-3-9').ok);
accepted('初回の記入: 同じ変化点で記入する決定者(山田)の記名で、Dupont の氏名の確認を数える', first(), '名義の機械検査を人が上書きした: Claude Dupont');
check('初回の記入: 確認の記録が残る', JSON.stringify(cfg().changeLog.at(-1).nameConfirmations) === JSON.stringify([{ id: 'dupont' }]));
check('初回の記入(本人): 準備', init('size-3-9').ok);
refused('初回の記入でも、2名以上の名簿で本人の記名による確認', first({ seats: { ...SEATS3, 'biz-approver': { accountable: 'Claude Dupont' } }, decidedBy: 'Claude Dupont' }), 'Claude Dupont の氏名の確認を、本人の記名では確定できません');
check('初回の記入(相互): 準備', init('size-3-9').ok);
refused(
  '初回の記入でも、AI を示す語を含む名義どうしの確認',
  first({ people: [...PEOPLE3, DUPONT, GEMINI], seats: { ...SEATS3, 'biz-approver': { accountable: 'Gemini Sato' } }, decidedBy: 'Gemini Sato' }),
  'Gemini Sato の氏名の確認を、本人の記名では確定できません'
);
// 境界: 外部の人だけが前の名簿にいる、初回の記入でない変化点(席を記入しない)
check('初回の記入の境界: 準備(初期化)', init('size-3-9').ok);
accepted('初回の記入の境界: 準備(組織上の任命権者だけを名簿へ)', change({ kind: 'accountable', date: TODAY, summary: '任命権者', people: [APPOINTER] }));
refused(
  '初回の記入の境界: 外部の人だけが前の名簿にいる変化点で、同じ変化点で足した人の確認',
  change({ kind: 'accountable', date: TODAY, summary: '高橋と Dupont', people: [APPOINTER, TAKAHASHI, DUPONT], decidedBy: '高橋 次郎', reason: '氏名を確認した' }),
  '記名者 "高橋 次郎" は、この変化点で名簿へ足した人です'
);

// ---------------------------------------------------------------- AR-2 確認待ち(1〜2名・MVP・CL0)
fixes(['ADR-0111 決定5', 'ADR-0079 決定7']);
check('確認待ち: 準備(初期化)', init('size-1-2').ok);
accepted('確認待ち: 準備(1名の体制。本人の記名による確認)', change({ kind: 'accountable', date: TODAY, summary: '1名', people: [DUPONT], seats: ALL('Claude Dupont'), decidedBy: 'Claude Dupont', reason: '初期の体制を記入する' }));
accepted(
  '確認待ち: 2人目を足す変化点を受け付け、確認待ちと次の手順を案内する',
  change({ kind: 'accountable', date: TODAY, summary: '高橋が加わった', people: [DUPONT, TAKAHASHI], seats: { 'independent-reviewer': { accountable: '高橋 次郎' } }, decidedBy: 'Claude Dupont', reason: '確認者を置く' }),
  '[確認待ち] Claude Dupont の氏名の確認',
  '本人以外の名簿の人'
);
const pending = contract();
check('確認待ちのままでは、契約検査が欠落として落とす', !pending.ok && pending.out.includes('Claude Dupont の氏名の確認(nameConfirmed)は確認待ちです'), pending.out);
check('確認待ちの印は構成へ書かない', cfg().nameConfirmPending === undefined);
accepted('確認待ち: 次の変化点で、足した2人目(高橋)が記名して確認する', change({ kind: 'accountable', date: TODAY, summary: 'Dupont の氏名を確認', people: [DUPONT, TAKAHASHI], decidedBy: '高橋 次郎', reason: '氏名を確認した' }), '名義の機械検査を人が上書きした: Claude Dupont');
const resolved = contract();
check('確認した後は、契約検査が確認待ちを出さない', resolved.ok && !resolved.out.includes('確認待ち'), resolved.out);

// ---------------------------------------------------------------- AR-4・AR-5(追加の裁定 2。再確認 Y-1・Y-2)
fixes(['ADR-0111 決定6', 'ADR-0111 決定5']);
const PF = { model: 'claude-fable-5-1', instructions: 'CLAUDE.md@v1', permissions: 'tok-dev' };
const BASIS2 = { detection: { rejectionRate: 'docs/metrics/q3.md(差し戻しの件数から算出)', reworkRate: 'docs/metrics/q3.md(14日以内の書き換えの行数から算出)' }, rollback: 'docs/rollback/2026-09.md(文言の取り消しを3回実行)', tests: 'tests/i18n/*.spec.ts が全キーの表示を確かめる' };
const DTYPES = [{ id: '表示文言', registeredBy: 'Claude Dupont', registeredAt: '2026-09-30', basis: BASIS2 }];
const DRULE = { id: 'DR-001', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: 'Claude Dupont', decidedAt: '2026-09-30', reason: '文言のレビュー待ちを無くす' };
const DQ = { confirmedAt: '2026-09-30', performedBy: 'Claude Dupont', approvedBy: 'Claude Dupont', cases: '注入事例10件', result: '9/10', performer: PF };
check('AR-4: 準備(初期化)', init('size-1-2').ok);
accepted('AR-4: 準備(1名の体制)', change({ kind: 'accountable', date: TODAY, summary: '1名', people: [DUPONT], seats: ALL('Claude Dupont'), decidedBy: 'Claude Dupont', reason: '初期の体制を記入する' }));
accepted('AR-4: 準備(本人が委任の規則を決めて承認し、変更種別を登録し、委任にする)', change({ kind: 'mode', date: TODAY, summary: '委任', seats: { 'dev-verifier': { mode: 'delegated', performer: PF, fallback: 'human', qualification: DQ } }, delegation: { rules: [DRULE], changeTypes: DTYPES }, ruleApprovedBy: 'Claude Dupont', decidedBy: 'Claude Dupont', reason: '委任する' }));
accepted('AR-4: 2人目を足す(確認待ち)', change({ kind: 'accountable', date: TODAY, summary: '高橋が加わった', people: [DUPONT, TAKAHASHI], decidedBy: 'Claude Dupont', reason: '2人目' }), '[確認待ち]');
accepted('AR-4: 確認待ちを解く変化点で、既存の規則と変更種別を照らし直さない', change({ kind: 'accountable', date: TODAY, summary: 'Dupont の氏名を確認', people: [DUPONT, TAKAHASHI], decidedBy: '高橋 次郎', reason: '氏名を確認した' }));
check(
  'AR-4: 規則・変更種別・委任の席が保たれる',
  cfg().delegation.rules.some((r) => r.id === 'DR-001') && cfg().delegation.changeTypes.some((t) => t.registeredBy === 'Claude Dupont') && cfg().seats.find((s) => s.role === 'dev-verifier').mode === 'delegated'
);
check('AR-5: 準備(初期化)', init('size-1-2').ok);
accepted('AR-5: 準備(1名の体制)', change({ kind: 'accountable', date: TODAY, summary: '1名', people: [DUPONT], seats: ALL('Claude Dupont'), decidedBy: 'Claude Dupont', reason: '初期の体制を記入する' }));
refused('AR-5: 確認待ちになる本人が記名した、他の人の氏名の確認', change({ kind: 'accountable', date: TODAY, summary: 'Gemini を足す', people: [DUPONT, GEMINI], decidedBy: 'Claude Dupont', reason: '2人目' }), '記名者 "Claude Dupont" は、この変化点で氏名の確認が確認待ちになる本人です');

done();
