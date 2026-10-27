// 既存の場面(第1巡の検証 tmp/fix-f3/scenarios.mjs)を、第2巡の決定(K13〜K43)に合わせて引き継いだもの。
//   sh tmp/fix2-g3a/fresh.sh s && node tmp/fix2-g3a/scenarios.mjs
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["s"], "fixes": ["#284", "#285"]}
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, BASE, APPOINTER, fill, BASIS, TODAY } from './lib.mjs';

const W = workspace('s');
const { DIR, run, git, write, read, cfg, gen, change, contract, checkD0, checkRules, resetTo, commit, d0, d0Version } = W;
const { check, refused, accepted, done, fixes } = checker();

const P = { model: 'claude-fable-5-1', instructions: 'CLAUDE.md@v1', permissions: 'tok-dev' };
// 適合性確認: 実施は AI維持管理者の席の責任者(山田)、承認は当該の席の責任者
const Q = (approvedBy = '山田 太郎', o = {}) => ({ confirmedAt: '2026-09-30', performedBy: '山田 太郎', approvedBy, cases: '注入事例10件', result: '9/10', performer: P, ...o });
const PEOPLE3 = [
  { id: 'yamada', name: '山田 太郎', accounts: ['yamada-taro'] },
  { id: 'sato', name: '佐藤 花子', accounts: ['sato-hanako'] },
  { id: 'suzuki', name: '鈴木 一郎', accounts: ['suzuki-ichiro'] },
  // 第3巡(K60): 組織上の任命権者。全席が未記入の体制の初回の記入を記名する(体制の外)
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
const TYPES = [{ id: '表示文言', registeredBy: '鈴木 一郎', registeredAt: '2026-09-30', basis: BASIS }];
const RULE = (o = {}) => ({ id: 'DR-001', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: '山田 太郎', decidedAt: '2026-09-30', reason: '文言のレビュー待ちを無くす', ...o });
const RULE_R = (o = {}) => ({ id: 'DR-002', seat: 'independent-reviewer', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: '佐藤 花子', decidedAt: '2026-09-30', reason: '文言は事後の抜き取りで確かめる', ...o });
const DELEGATE_DEV = { mode: 'delegated', performer: P, fallback: 'human', qualification: Q() };
const DAY = TODAY;

// ------------------------------------------------------------------ 3名・MVP・CL0 の基準点
fixes(["K60"]);
write('answers.json', { ...BASE, 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp' });
check('初期化(3名・MVP・CL0)', gen('--answers', 'answers.json', '--stack', 'node').ok);
check('契約検査(初期化の直後)', contract().ok, contract().out);
check('初期化の記録が要約値を持つ', Boolean(cfg().changeLog[0].stateHash) && cfg().changeLog[0].prevHash === null && cfg().schemaVersion === 1);
d0('1.0');
// 第3巡(K60): 初回の記入は、事業決裁者の席に記入する人(山田)の記名と理由で、1回の変化点として受け付ける
accepted('名簿と全席の責任者を記入(初回の記入。山田の記名)', fill(W, PEOPLE3, SEATS3, { date: DAY, summary: '3名体制' }));
check('契約検査(記入後)', contract().ok, contract().out);
check('D-0 の検査(生成区間が構成と一致)', checkD0().ok, checkD0().out);
check('D-0 の節1 に責任者と名簿が出る', read('docs/D-0-governance.md').includes('| 独立レビュア | 佐藤 花子 |') && read('docs/D-0-governance.md').includes('sato-hanako'));
// 第3巡: 名簿の変化点(最初の追随。版を上げない)と、席の記入の変化点(版を上げる)の2つになった
check('D-0 の版は、D-0 の作成直後の変化点(初回の記入。1回)では上げない(最初の追随)', d0Version() === '1.0' && cfg().d0Version === '1.0', `${d0Version()} / ${cfg().d0Version}`);
commit('chore: 3名体制');
git('tag', 'base3');

// ------------------------------------------------------------------ 3. AI の名義
// #319 §8 X-5: 元は ADR-0028(未達と省略の区別)を引いていた。名義を定めるのは ADR-0054 決定1(責任者は記名の自然人)と
// ADR-0055 決定3(いずれの記名も AI の名義を受け付けない)
fixes(['ADR-0054 決定1', 'ADR-0055 決定3']);
refused('責任者に AI の名義', change({ kind: 'accountable', seats: { 'tech-lead': { accountable: 'Claude (AI)' } } }), 'AI');
refused('責任者に名簿に無い名義', change({ kind: 'accountable', seats: { 'tech-lead': { accountable: '高橋 次郎' } } }), '名簿');
refused('名簿へ AI の名義を足す', change({ kind: 'accountable', people: [...PEOPLE3, { id: 'rev', name: 'Reviewer-Agent (gpt-9)', external: true }], seats: { 'independent-reviewer': { accountable: 'Reviewer-Agent (gpt-9)' } } }), 'agent');
refused('名簿へ全角の AI の名義を足す(正規化)', change({ kind: 'accountable', people: [...PEOPLE3, { id: 'x', name: '田中ＡＩ' }] }), 'AI の表記');
refused('名簿へ片仮名の読みの名義を足す', change({ kind: 'accountable', people: [...PEOPLE3, { id: 'x', name: 'クロード' }] }), 'モデル名');
refused('責任者に担い手の識別と同じ文字列', change({ kind: 'accountable', people: [...PEOPLE3, { id: 'x', name: 'tok-dev' }], seats: { 'dev-verifier': { accountable: 'tok-dev', performer: P } } }), '担い手の識別');
refused(
  '緩める向きの決定者に AI の名義',
  change({ kind: 'mode', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE()], changeTypes: TYPES }, decidedBy: 'Claude Fable 5.1', reason: 'r' }),
  '決定した者の記名を受け付けられません'
);
refused(
  '適合性確認の承認者に AI の名義',
  change({ kind: 'mode', seats: { 'dev-verifier': { ...DELEGATE_DEV, qualification: Q('Claude Fable 5.1') } }, delegation: { rules: [RULE()], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }),
  '開発者(検証者) を 委任 にできません'
);
check('拒否のあと、構成は変わっていない', git('status', '--porcelain', 'process.config.json').out.trim() === '');

// ------------------------------------------------------------------ 5a. 委任の規則 / 4. 決定者 / 11. 上限
fixes(["K12", "K13", "K32", "K40"]);
refused('全域の委任(**)', change({ kind: 'mode', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE({ paths: ['**'] })], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '全域');
refused('ルート直下全体の委任(*)', change({ kind: 'mode', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE({ paths: ['*'] })], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '全域');
refused('変更種別のない規則', change({ kind: 'mode', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE({ changeType: undefined })], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '変更種別');
refused('標準変更カタログに登録していない変更種別の規則', change({ kind: 'mode', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE()] }, decidedBy: '山田 太郎', reason: 'r' }), '登録されていない');
refused(
  '決定者が席の責任者でも事業決裁者でもない',
  change({ kind: 'mode', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE()], changeTypes: TYPES }, decidedBy: '佐藤 花子', reason: 'r' }),
  '決定できるのは'
);
refused('出荷判定者を委任に', change({ kind: 'mode', seats: { 'qa-gatekeeper': { mode: 'delegated' } }, decidedBy: '山田 太郎', reason: 'r' }), '協働までは宣言できます');
refused('事業決裁者を協働に', change({ kind: 'mode', seats: { 'biz-approver': { mode: 'collab' } }, decidedBy: '山田 太郎', reason: 'r' }), '人確定に限ります');
refused('AI維持管理者 × AI運用担当者の兼務(3名以上)', change({ kind: 'accountable', seats: { 'ai-ops': { accountable: '山田 太郎' } } }), '兼務禁止に抵触します');

// 中4: 規則の検査は、席の運用形態の同時指定に依らない(s5-7a / s5-7c)
refused('全域の規則だけを先に登録する(席は委任にしない)', change({ kind: 'mode', delegation: { rules: [RULE({ paths: ['**'] })], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: '先に登録' }), '全域');
refused('AI の名義を決定者にした規則だけを登録する', change({ kind: 'mode', delegation: { rules: [RULE({ decidedBy: 'Claude Fable 5.1' })], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: '先に登録' }), '決定した者の記名を受け付けられない');
refused('任意の文字列の変更種別の規則', change({ kind: 'mode', delegation: { rules: [RULE({ changeType: 'なんでも' })], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '登録されていない');
refused('変更種別の登録者に AI の名義', change({ kind: 'mode', delegation: { changeTypes: [{ id: '表示文言', registeredBy: 'Claude Fable 5.1', registeredAt: DAY }] } }), 'AI の名義');
refused('変更種別の登録者が名簿に無い', change({ kind: 'mode', delegation: { changeTypes: [{ id: '表示文言', registeredBy: '高橋 次郎', registeredAt: DAY }] } }), '名簿');
check('拒否のあと、構成は変わっていない(2)', git('status', '--porcelain', 'process.config.json').out.trim() === '');

// 中8: 適合性確認の実施者は AI維持管理者の席の責任者、承認者は当該の席の責任者
refused('適合性確認の実施者が AI維持管理者の席の責任者でない', change({ kind: 'mode', seats: { 'dev-verifier': { ...DELEGATE_DEV, qualification: Q('山田 太郎', { performedBy: '佐藤 花子' }) } }, delegation: { rules: [RULE()], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '実施は AI維持管理者が行う');
refused('適合性確認の承認者が当該の席の責任者でない', change({ kind: 'mode', seats: { 'dev-verifier': { ...DELEGATE_DEV, qualification: Q('鈴木 一郎') } }, delegation: { rules: [RULE()], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '承認は席の責任者が行う');
refused('適合性確認の実施者が名簿に無い', change({ kind: 'mode', seats: { 'dev-verifier': { ...DELEGATE_DEV, qualification: Q('山田 太郎', { performedBy: '誰か' }) } }, delegation: { rules: [RULE()], changeTypes: TYPES }, decidedBy: '山田 太郎', reason: 'r' }), '名簿');

const okDelegate = { kind: 'mode', date: DAY, summary: '開発者の席を表示文言に限り委任', seats: { 'dev-verifier': DELEGATE_DEV }, delegation: { rules: [RULE()], changeTypes: TYPES } };
const dry = change(okDelegate, true);
check('委任(記名なし)の dry-run は [要記名] を出す', dry.ok && dry.out.includes('[要記名]') && dry.out.includes('[承認待ち]'), dry.out);
refused('委任(記名なし)の本実行', change(okDelegate), '決定した者の記名');
// K12: 規則の追加は統制の弱化。AI維持管理者の承認が無いあいだ、委任は有効にならない
const pend = change({ ...okDelegate, decidedBy: '山田 太郎', reason: '文言のレビュー待ちを無くす' });
accepted('委任(席の責任者が記名。規則の承認なし)', pend, '[承認待ち]', 'state:needs-platform');
check('担い手を初めて宣言する変化点は、即時通知の対象にしない', cfg().changeLog.at(-1).notice === null);
check('承認待ちのあいだ、席は協働のまま', cfg().seats.find((x) => x.role === 'dev-verifier').mode === 'collab' && cfg().delegation.rules[0].approvedBy === null);
check('変更種別の登録が残る', cfg().delegation.changeTypes[0].id === '表示文言' && cfg().delegation.changeTypes[0].registeredBy === '鈴木 一郎');
check('契約検査(承認待ち)', contract().ok && contract().out.includes('AI維持管理者の承認がありません'), contract().out);
check('D-0 の検査(承認待ち)', checkD0().ok, checkD0().out);
refused('規則の承認者が AI維持管理者の席の責任者でない', change({ kind: 'mode', seats: { 'dev-verifier': { mode: 'delegated' } }, ruleApprovedBy: '佐藤 花子', decidedBy: '山田 太郎', reason: 'r' }), 'AI維持管理者の席の責任者ではありません');
refused('規則の承認者に AI の名義', change({ kind: 'mode', seats: { 'dev-verifier': { mode: 'delegated' } }, ruleApprovedBy: 'Claude Fable 5.1', decidedBy: '山田 太郎', reason: 'r' }), '規則の承認者の記名を受け付けられません');

// 中10: 承認待ちのあいだ、宣言した意図(委任)と決定者を保持する。AI維持管理者の承認が入った変化点で有効にする
check('承認待ちのあいだ、宣言と決定者を保持する', cfg().seats.find((x) => x.role === 'dev-verifier').intent?.decidedBy === '山田 太郎' && pend.out.includes('[宣言を保持]') && pend.out.includes('承認待ちのあいだは協働として動きます'), JSON.stringify(cfg().seats.find((x) => x.role === 'dev-verifier').intent));
check('D-0 の節12 に、宣言済み・承認待ちと出る', read('docs/D-0-governance.md').includes('協働(委任を宣言済み。規則の承認待ち。決定: 山田 太郎)'));
const onlyApproval = change({ kind: 'mode', date: DAY, summary: '規則を承認する(席の運用形態は指定しない)', ruleApprovedBy: '山田 太郎', notice: { to: '鈴木 一郎', at: DAY } });
accepted('規則の承認だけの変化点で、委任が有効になる(再宣言を要求しない)', onlyApproval, '[委任を有効化]', '決定済み: 山田 太郎');
check('席は委任。宣言した時点の決定者と理由が記録に残る', cfg().seats.find((x) => x.role === 'dev-verifier').mode === 'delegated' && !cfg().seats.find((x) => x.role === 'dev-verifier').intent && cfg().changeLog.at(-1).direction === 'loosen' && cfg().changeLog.at(-1).decidedBy === '山田 太郎' && cfg().changeLog.at(-1).intentApplied[0].seat === 'dev-verifier', JSON.stringify(cfg().changeLog.at(-1)).slice(0, 600));
check('samePersonAsDecider は、規則を決定した者と比べる', cfg().changeLog.at(-1).ruleApproval.samePersonAsDecider === true, JSON.stringify(cfg().changeLog.at(-1).ruleApproval));
check('通知先と通知日が記録される', cfg().changeLog.at(-1).notice.to === '鈴木 一郎' && cfg().changeLog.at(-1).notice.at === DAY && cfg().changeLog.at(-1).notice.reasons.includes('運用形態の変更'), JSON.stringify(cfg().changeLog.at(-1).notice));
check('契約検査(委任後)', contract().ok, contract().out);
check('CLAUDE.md の構成依存部分', checkRules().ok, checkRules().out);
check('D-0 の検査(委任後)', checkD0().ok, checkD0().out);
check('席が委任になった', cfg().seats.find((s) => s.role === 'dev-verifier').mode === 'delegated');
check('D-0 の節12 に委任の範囲が出る', read('docs/D-0-governance.md').includes('| 開発者(検証者) | claude-fable-5-1 / CLAUDE.md@v1 / tok-dev | 委任 | `DR-001` |'), read('docs/D-0-governance.md').split('\n').filter((l) => l.includes('開発者(検証者)')).join('\n'));
check('D-0 の版が上がっている', d0Version() !== '1.0' && String(cfg().d0Version) === d0Version(), `${d0Version()} / ${cfg().d0Version}`);
commit('chore: 委任');
git('tag', 'delegated');

// ------------------------------------------------------------------ 5c. 範囲を狭める / 広げる
fixes(["K12", "K61"]);
accepted('委任の範囲を狭める(記名なし・即時)', change({ kind: 'mode', date: DAY, summary: '範囲を ja に狭める', delegation: { rules: [RULE({ paths: ['src/i18n/ja/**'] })] } }), '範囲を狭める');
check('向きは「厳しくする」', cfg().changeLog.at(-1).direction === 'tighten');
check('狭めた規則は承認を引き継ぎ、委任のまま', cfg().delegation.rules[0].approvedBy === '山田 太郎' && cfg().seats.find((x) => x.role === 'dev-verifier').mode === 'delegated');
const widenNoApproval = change({ kind: 'mode', date: DAY, summary: '範囲を広げる', delegation: { rules: [RULE({ paths: ['src/**'] })] }, decidedBy: '山田 太郎', reason: 'r' });
accepted('範囲を広げる(決定の記名あり・規則の承認なし)', widenNoApproval, 'state:needs-platform');
// 第3巡(K61): 承認済みの範囲は有効なまま残し、広げた部分だけを承認待ちにする(以前は規則全体が承認待ちになり、席が協働へ落ちた)
check('広げた部分だけが承認待ち。承認済みの範囲(ja)は有効で、席は委任のまま', cfg().delegation.rules[0].approvedBy === '山田 太郎' && JSON.stringify(cfg().delegation.rules[0].paths) === '["src/i18n/ja/**"]' && cfg().delegation.rules[0].pendingChange?.paths?.[0] === 'src/**' && cfg().seats.find((x) => x.role === 'dev-verifier').mode === 'delegated', JSON.stringify(cfg().delegation.rules[0]));
refused('委任の範囲を広げる(記名なし)', change({ kind: 'mode', delegation: { rules: [RULE({ paths: ['src/**', 'docs/**'] })] } }), '決定した者の記名');
accepted('広げた部分の承認だけで、拡大が反映される', change({ kind: 'mode', date: DAY, summary: '広げた規則を承認', ruleApprovedBy: '山田 太郎' }), '[拡大を反映]');
check('拡大が反映され、向きは緩める(決定者は拡大を宣言した者)', JSON.stringify(cfg().delegation.rules[0].paths) === '["src/**"]' && !cfg().delegation.rules[0].pendingChange && cfg().changeLog.at(-1).direction === 'loosen' && cfg().changeLog.at(-1).decidedBy === '山田 太郎');
resetTo('delegated');

// 追加4: 未承認の規則を足しても、承認済みの既存の規則による委任は協働へ落ちない
const RULE3 = RULE({ id: 'DR-003', paths: ['docs/help/**'], reason: 'ヘルプの文言' });
const addRule = change({ kind: 'mode', date: DAY, summary: '規則を足す(承認待ち)', delegation: { rules: [RULE(), RULE3] }, decidedBy: '山田 太郎', reason: 'ヘルプの文言も委任する' });
accepted('未承認の規則を足す', addRule, '[承認待ち] 委任の規則 DR-003', '承認済みの既存の規則の範囲で委任のまま');
check('席は委任のまま。足した規則だけが承認待ち', cfg().seats.find((x) => x.role === 'dev-verifier').mode === 'delegated' && cfg().delegation.rules.find((r) => r.id === 'DR-003').approvedBy === null && cfg().delegation.rules.find((r) => r.id === 'DR-001').approvedBy === '山田 太郎');
check('契約検査は通し、承認待ちの規則を注意で出す', contract().ok && contract().out.includes('委任の規則 DR-003: AI維持管理者の承認がありません'), contract().out);
check('D-0 の検査(未承認の規則を足した後)', checkD0().ok && read('docs/D-0-governance.md').includes('**未承認**(この規則では委任は働かない)'), checkD0().out);
const cls = run('node', ['--input-type=module', '-e', "import { classifyDelegation, loadConfig } from './scripts/gate/config.mjs'; const c = loadConfig(); console.log(JSON.stringify([classifyDelegation(c, ['src/i18n/ja.json']).rule, classifyDelegation(c, ['docs/help/a.md']).rule]));"]);
check('該当の判定: 承認済みの規則の範囲は該当、未承認の規則の範囲は該当しない', cls.out.trim() === '["DR-001",null]', cls.out);
accepted('足した規則を承認する', change({ kind: 'mode', date: DAY, summary: 'DR-003 を承認', ruleApprovedBy: '山田 太郎' }));
check('承認後は両方の規則が有効', run('node', ['--input-type=module', '-e', "import { classifyDelegation, loadConfig } from './scripts/gate/config.mjs'; console.log(classifyDelegation(loadConfig(), ['docs/help/a.md']).rule);"]).out.trim() === 'DR-003');
resetTo('delegated');

// 確約範囲とコア指定のパス
check('確約範囲・コア指定のパスは、宣言するまで構成にキーが無い(未宣言)', !('protectedPaths' in cfg().delegation) && contract().out.includes('未宣言'), contract().out);
// 追加1: --delegation は、証跡の集約・PR 上の判定と同じ結論を出す(未宣言では該当しない)
write('src/i18n/ja.json', '{}\n');
const dlg0 = contract('--delegation', '--base', 'delegated');
check('--delegation: 確約範囲・コア指定が未宣言の構成では該当しない(トレーラを書かせない)', !dlg0.ok && dlg0.out.includes('未登録') && dlg0.out.includes('トレーラ Delegated: は書きません') && !dlg0.out.includes('を書いてください'), dlg0.out);
fs.rmSync(path.join(DIR, 'src'), { recursive: true, force: true });
refused('確約範囲・コア指定のパスを宣言する(記名なし)', change({ kind: 'mode', delegation: { protectedPaths: [] } }), '決定した者の記名');
refused('同(事業決裁者でない者の記名)', change({ kind: 'mode', delegation: { protectedPaths: [] }, decidedBy: '佐藤 花子', reason: 'r' }), '決定できるのは');
accepted('同(事業決裁者の席の責任者の記名)', change({ kind: 'mode', date: DAY, summary: '確約範囲・コア指定なしと宣言', delegation: { protectedPaths: [] }, decidedBy: '山田 太郎', reason: '確約した範囲とコア指定は無い' }), '宣言する(なし)');
check('宣言後は空の配列を持つ', Array.isArray(cfg().delegation.protectedPaths) && !contract().out.includes('未宣言'));
commit('chore: 確約範囲・コア指定なしと宣言');
git('tag', 'declared');
write('src/i18n/ja.json', '{}\n');
const dlg1 = contract('--delegation', '--base', 'declared');
check('--delegation: 宣言後は該当。開発者の席だけの委任は、独立レビュアの事前の承認でマージする、と出る', dlg1.ok && dlg1.out.includes('Delegated: DR-001') && dlg1.out.includes('開発者の席の委任に該当します') && dlg1.out.includes('現在のブランチ保護のままマージできます') && !dlg1.out.includes('人の承認を待ちます'), dlg1.out);
write('src/app.js', '//\n');
const dlg2 = contract('--delegation', '--base', 'declared');
check('--delegation: 規則の対象外のファイルを含む変更は該当しない', !dlg2.ok && dlg2.out.includes('対象外'), dlg2.out);
fs.rmSync(path.join(DIR, 'src'), { recursive: true, force: true });
accepted('確約範囲・コア指定のパスを足す(厳しくする向き・記名なし)', change({ kind: 'mode', date: DAY, summary: 'コア指定を登録', delegation: { protectedPaths: ['src/core/**'] } }), '確約範囲・コア指定のパス: 追加');
refused('確約範囲・コア指定のパスを外す(記名なし)', change({ kind: 'mode', delegation: { protectedPaths: [] } }), '決定した者の記名');
resetTo('delegated');

// ------------------------------------------------------------------ 独立レビュアの席の委任
fixes(["K13"]);
accepted(
  '独立レビュアの席を委任(席の責任者が記名)',
  change({ kind: 'mode', date: DAY, summary: '独立レビュアの席を委任', seats: { 'independent-reviewer': { mode: 'delegated', performer: P, fallback: 'human', qualification: Q('佐藤 花子') } }, delegation: { rules: [RULE(), RULE_R()] }, ruleApprovedBy: '山田 太郎', decidedBy: '佐藤 花子', reason: '文言は事後の抜き取りで確かめる' })
);
check('samePersonAsDecider は偽(決定者は佐藤、承認者は山田)', cfg().changeLog.at(-1).ruleApproval.samePersonAsDecider === false);
check('契約検査(両席の委任)', contract().ok, contract().out);
commit('chore: 独立レビュアの席を委任');
git('tag', 'both');
accepted('独立レビュアの席を協働へ戻す(記名なし・即時)', change({ kind: 'mode', date: DAY, summary: '協働へ戻す', seats: { 'independent-reviewer': { mode: 'collab' } } }), '厳しくする向き');

// ------------------------------------------------------------------ 8. 安全重要度が上がる
fixes(["K5"]);
resetTo('both');
const up = change({ kind: 'axis', date: DAY, summary: '個人データを扱う機能を足す', answers: { 'q-criticality': 'cl1' } });
accepted('安全重要度 CL0 → CL1(記名なし・即時)', up, '委任 → 協働', '全件確認し直す');
check('委任が協働へ下がった', cfg().seats.every((s) => s.mode !== 'delegated') && cfg().delegation.allowed === false);
check('契約検査(CL1)', contract().ok, contract().out);
check('D-0 の検査(CL1)', checkD0().ok, checkD0().out);

// ------------------------------------------------------------------ 9. AI が使えない期間
fixes(["K5", "K15"]);
resetTo('both');
accepted('AI が使えない期間(人へ戻した)', change({ kind: 'outage', summary: '提供者の障害', outage: { from: '2026-09-28', to: '2026-09-30', handling: 'human' } }), '構成の変更なし');
check('構成は変わらず changeLog に残る', cfg().changeLog.at(-1).kind === 'outage' && cfg().changeLog.at(-1).result === 'no-change' && cfg().seats.find((s) => s.role === 'dev-verifier').mode === 'delegated');
check('D-0 の版は上げない(構成の変更なし)', d0Version() === String(JSON.parse(git('show', 'both:process.config.json').out).d0Version));
accepted('AI が使えない期間(一時的に切り替えた)', change({ kind: 'outage', summary: '別の提供者へ切り替えた', outage: { from: '2026-09-30', handling: 'human', switched: true } }), '委任 → 協働');
check('切り替えの間、委任を協働へ下げる', cfg().seats.every((s) => s.mode !== 'delegated'));
refused('outage で構成を変える入力', change({ kind: 'outage', outage: { from: '2026-10-03', handling: 'stop' }, answers: { 'q-biz-phase': 'poc' } }), '構成を変えられません');
refused('outage の扱いが不正', change({ kind: 'outage', outage: { from: '2026-10-03', handling: 'ignore' } }), 'handling');
refused('outage の期間が逆', change({ kind: 'outage', outage: { from: '2026-10-03', to: '2026-10-01', handling: 'stop' } }), '期間が逆');
check('契約検査(outage 後)', contract().ok, contract().out);
check('D-0 の改訂履歴に期間が出る', read('docs/D-0-governance.md').includes('AI が使えない期間: 2026-09-28 〜 2026-09-30'));
// 追加3: 継続中の期間を、後から閉じる
const openIdx = cfg().changeLog.length - 1;
check('開始だけを記録した期間は「継続中」と出る', cfg().changeLog[openIdx].outage.to === null && read('docs/D-0-governance.md').includes('AI が使えない期間: 2026-09-30 〜 継続中'));
refused('継続中でない記録を閉じる', change({ kind: 'outage', summary: 'x', outage: { closes: openIdx - 1, to: '2026-10-02' } }), '継続中の「AI が使えない期間」の記録の添字ではありません');
refused('終了日が開始日より前', change({ kind: 'outage', summary: 'x', outage: { closes: openIdx, to: '2026-09-01' } }), '期間が逆');
refused('閉じる入力に終了日が無い', change({ kind: 'outage', summary: 'x', outage: { closes: openIdx } }), '終了日');
accepted('継続中の期間を後から閉じる', change({ kind: 'outage', summary: '提供が戻った', outage: { closes: openIdx, to: '2026-10-02' } }), '構成の変更なし');
check('開始の記録は書き換えず、終了日を持つ記録が足される', cfg().changeLog[openIdx].outage.to === null && cfg().changeLog.at(-1).outage.closes === openIdx && cfg().changeLog.at(-1).outage.to === '2026-10-02' && cfg().changeLog.at(-1).outage.handling === 'human');
check('閉じた後は「継続中」と出ない。契約検査と D-0 の検査が通る', read('docs/D-0-governance.md').includes('AI が使えない期間: 2026-09-30 〜 2026-10-02') && !read('docs/D-0-governance.md').includes('〜 継続中') && contract().ok && checkD0().ok, checkD0().out + contract().out);
const periods = run('node', ['--input-type=module', '-e', "import { outagePeriods, loadConfig } from './scripts/gate/config.mjs'; console.log(JSON.stringify(outagePeriods(loadConfig()).map((p) => [p.from, p.to, p.ongoing])));"]);
check('outagePeriods は、閉じた期間を1件として返す', periods.out.trim() === '[["2026-09-28","2026-09-30",false],["2026-09-30","2026-10-02",false]]', periods.out);
refused('閉じた期間をもう一度閉じる', change({ kind: 'outage', summary: 'x', outage: { closes: openIdx, to: '2026-10-03' } }), '継続中の記録はありません');

// ------------------------------------------------------------------ 15. 納期だけの変更
fixes(["K5"]);
resetTo('base3');
accepted('納期だけの変更', change({ kind: 'schedule-only', summary: '納期を2週間前倒し' }), '構成の変更なし');
check('「構成の変更なし」が記録される', cfg().changeLog.at(-1).result === 'no-change' && read('docs/D-0-governance.md').includes('納期だけの変更(変化点に数えない)。構成の変更なし'));
refused('納期だけの変更で構成を変える', change({ kind: 'schedule-only', answers: { 'q-biz-phase': 'poc' } }), '納期だけの変更では構成を変えられません');

// ------------------------------------------------------------------ 10. 変化点を経ない再生成
fixes(["K37"]);
resetTo('base3');
const before = cfg();
const regen0 = gen('--answers', 'process.config.json');
check('再生成(構成を変えない)は通り、構成は1バイトも変わらない', regen0.ok && git('status', '--porcelain', 'process.config.json').out.trim() === '', regen0.out);
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: 1.2'));
const regen = gen('--answers', 'process.config.json');
check('再生成で D-0 の版を進めない', regen.ok && cfg().d0Version === before.d0Version && cfg().changeLog.length === before.changeLog.length && regen.out.includes('版を進めません'), regen.out);
check('D-0 の検査は版のずれを検出する', !checkD0().ok);

// ------------------------------------------------------------------ 7. 人の離脱(3名 → 2名 → 1名)
fixes(["K5", "K15", "K39", "K51", "K60"]);
resetTo('base3');
const to2 = change({
  kind: 'headcount',
  date: DAY,
  summary: '鈴木が離任し、2名になった',
  answers: { 'q-team-size': 'size-1-2', 'q-external-reviewer': 'reviewer-yes' },
  people: PEOPLE3.slice(0, 2),
  // 第3巡(K60): 離脱は発生(記名なし)。後任の任命は決定であり、別の変化点で決定者の記名を要する
  seats: { 'qa-gatekeeper': { accountable: null }, 'ai-ops': { accountable: null } },
});
accepted('3名 → 2名(記名なし・即時)', to2, '逸脱の発生: G-7 出荷判定', '[即時反映]', '[即時通知]');
check('向きは「未達・逸脱の発生」', cfg().changeLog.at(-1).direction === 'arising' && cfg().deviations.some((d) => d.gate === 'g7'));
accepted('空いた席へ後任を置く(決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '出荷判定者と AI運用担当者', seats: { 'qa-gatekeeper': { accountable: '山田 太郎' }, 'ai-ops': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '2名で分担する' }), '任免');
check('K50 2名: 出荷判定者 × 事業決裁者(山田)は逸脱として記録', cfg().deviations.some((d) => d.separationId === 'sep-shipping-business'));
check('G-6 は相互の確認で成立したまま', cfg().gates.g6.state === 'required');
// 第3巡(K51): 出荷判定者(鈴木)が離脱して席が空いたため、通知先は D-0 表1 の決定者(山田)。通知する者(文脈オーナー=山田)と
// 同一人物なので、自分への通知の入力を求めず「通知する者と通知先が同一」と記録する(以前は未記入として残った)
check('即時通知の対象(人数の境界の通過・出荷判定者の交代)。通知する者と通知先が同一として自動で記録', cfg().changeLog.at(-2).notice?.reasons.includes('人数の境界の通過') && cfg().changeLog.at(-2).notice.reasons.includes('出荷判定者の席の責任者の交代') && cfg().changeLog.at(-2).notice.self === true && cfg().changeLog.at(-2).notice.to === '山田 太郎', JSON.stringify(cfg().changeLog.at(-2).notice));
check('契約検査(2名)は通し、未記入の通知は無い', contract().ok && !contract().out.includes('即時通知が未記録'), contract().out);
check('D-0 の検査(2名)', checkD0().ok, checkD0().out);
check('D-0 の版が上がり、改訂履歴に「決定なし(発生)」が出る', d0Version() === '1.2' && read('docs/D-0-governance.md').includes('決定なし(発生)'), d0Version());
commit('chore: 2名');
git('tag', 'two');

// K15: 後から通知を記録する(過去の記録は書き換えない)。通知の対象として、承認権限の一時制限の発動を使う
accepted('承認権限の一時制限の発動を記録する(通知は未記入)', change({ kind: 'notice', date: DAY, summary: '注入欠陥を連続2回見逃した', event: 'restriction' }), '[即時通知]');
check('一時制限の発動が、未記入の通知として残る', contract().out.includes('即時通知が未記録') && cfg().changeLog.at(-1).notice.reasons[0].includes('7.9'), contract().out);
const idx = cfg().changeLog.length - 1;
refused('通知先が出荷判定者の席の責任者でない', change({ kind: 'notice', summary: '通知した', noticeFor: idx, notice: { to: '佐藤 花子', at: DAY } }), '出荷判定者の席の責任者');
refused('通知の対象でない記録を指す', change({ kind: 'notice', summary: '通知した', noticeFor: 0, notice: { to: '山田 太郎', at: DAY } }), '即時通知の記録が済んでいない変化点の添字ではありません');
accepted('通知を後から記録する(種別 notice)', change({ kind: 'notice', date: DAY, summary: '出荷判定者の席の責任者へ知らせた', noticeFor: idx, notice: { to: '山田 太郎', at: DAY } }), '構成の変更なし');
check('過去の記録は変わらず、未記入の通知が無くなる', !contract().out.includes('即時通知が未記録') && contract().ok && read('docs/D-0-governance.md').includes('山田 太郎 / 2026-10-01'), contract().out);
resetTo('two');

const to1 = change({
  kind: 'accountable',
  date: DAY,
  summary: '佐藤が離任し、1名になった',
  people: PEOPLE3.slice(0, 1),
  seats: { 'independent-reviewer': { accountable: '山田 太郎' }, 'ai-ops': { accountable: '山田 太郎' } },
  // 第3巡(K60): 空いた席を残った人が引き取るのは後任の任命であり、決定者(山田)の記名を要する
  decidedBy: '山田 太郎',
  reason: '1名で全席を兼ねる',
});
accepted('2名 → 1名(記名なし・即時)', to1, '未達の発生: G-6 独立レビュー', '逸脱の発生', '[即時反映]');
// 第3巡: 離脱と後任の任命を同じ入力で出したため、向きは「任免の決定」(発生は arising の一覧に残る)
check('G-6 が未達になり、承認の強制が外れる', cfg().gates.g6.state === 'unmet' && cfg().review.requiredApprovals === 0 && cfg().changeLog.at(-1).direction === 'appoint' && cfg().changeLog.at(-1).arising.some((a) => a.includes('G-6')));
check('AI維持管理者 × AI運用担当者は逸脱として記録', cfg().deviations.some((d) => d.separationId === 'sep-maintainer-ops'));
check('代償措置(ci-strict)に合わせて、較正していないカバレッジの下限が 80 → 90 へ上がる', cfg().ci.coverageThreshold === 90 && cfg().ci.derivedCoverageThreshold === 90 && to1.out.includes('カバレッジの下限: 80% → 90%'), JSON.stringify(cfg().ci));
check('契約検査(1名)', contract().ok, contract().out);
check('D-0 の検査(1名)', checkD0().ok, checkD0().out);
commit('chore: 1名');
git('tag', 'one');

// 調達先の記入(構成を直接は書かない。種別 settings の変化点として記録される)
const src = run('node', ['scripts/init/set-review-sourcing.mjs', '--gate', 'g6', '--sourcing', 'コミュニティレビュー']);
check('調達先の記入は変化点の記録を経る', src.ok && cfg().unmet[0].reviewSourcing === 'コミュニティレビュー' && cfg().changeLog.at(-1).kind === 'settings' && contract().ok, src.out + contract().out);
check('個別の値の変更は D-0 の改訂履歴へ出さない(体制の変化点ではない)', checkD0().ok && !read('docs/D-0-governance.md').includes('調達先を記入した'), checkD0().out);
check('AI を示す調達先を拒否する', !run('node', ['scripts/init/set-review-sourcing.mjs', '--gate', 'g6', '--sourcing', 'Reviewer-Agent (gpt-9)']).ok);
check('セルフテスト', run('node', ['scripts/init/set-review-sourcing.mjs', '--test']).ok);

// 外部の確認者を置く(1名 + 外部)
accepted(
  '外部の確認者を置く',
  change({ kind: 'accountable', date: DAY, summary: '外部の確認者を置いた', answers: { 'q-external-reviewer': 'reviewer-yes' }, people: [PEOPLE3[0], { id: 'ext', name: '高橋 次郎', external: true, accounts: ['takahashi-j'] }], seats: { 'independent-reviewer': { accountable: '高橋 次郎' } }, decidedBy: '山田 太郎', reason: '外部の確認者と取り決めた' }),
  '未達の解消'
);
check('G-6 が成立し、外部の確認者は人数に数えない', cfg().gates.g6.state === 'required' && contract().ok, contract().out);
commit('chore: 外部の確認者');
// 外部の確認者が名簿から外れる(席の責任者が名簿から外れた = 発生)
const extLeft = change({ kind: 'accountable', date: DAY, summary: '外部の確認者との取り決めが終わった', people: [PEOPLE3[0]], seats: { 'independent-reviewer': { accountable: '山田 太郎' } }, decidedBy: '山田 太郎', reason: '席を引き取る' });
accepted('外部の確認者が名簿から外れ、席を本人が引き取る(引き取りは決定者の記名)', extLeft, '未達の発生: G-6 独立レビュー');
check('向きは任免の決定。G-6 の未達は発生として残る', cfg().changeLog.at(-1).direction === 'appoint' && cfg().changeLog.at(-1).arising.some((a) => a.includes('G-6')));

// ------------------------------------------------------------------ 4. ステージを前へ戻す
fixes(["K5", "K12"]);
resetTo('base3');
// 照合を2つに分けた(#319 裁定 7.5 J-5): 拒否の理由は記名の欠け。SG の判定による変更であることは、差分の「統制を緩める向きの変更」の節で確かめる
refused('ステージを前へ戻す(記名なし)', change({ kind: 'axis', answers: { 'q-biz-phase': 'poc' } }), '決定した者の記名', { section: { heading: '統制を緩める向きの変更', words: ['ステージ移行ゲート(SG)の判定による'] } });
write('change2.json', { kind: 'accountable', date: DAY, summary: '事業決裁者を佐藤に', seats: { 'biz-approver': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '事業の決裁を移す' });
check('事業決裁者を佐藤へ', gen('--change', 'change2.json').ok);
refused('ステージを前へ戻す(事業決裁者でない者の記名)', change({ kind: 'axis', answers: { 'q-biz-phase': 'poc' }, decidedBy: '山田 太郎', reason: '仮説が崩れた' }), '事業決裁者の席の責任者');
refused('ステージを前へ戻す(SG の判定記録の所在なし)', change({ kind: 'axis', answers: { 'q-biz-phase': 'poc' }, decidedBy: '佐藤 花子', reason: '仮説が崩れた' }), 'sgRecord');
refused('ステージを前へ戻す(SG の判定記録が実在しない)', change({ kind: 'axis', answers: { 'q-biz-phase': 'poc' }, decidedBy: '佐藤 花子', reason: '仮説が崩れた', sgRecord: 'どこかにある' }), '実在する判定記録');
refused('ステージを前へ戻す(SG の判定記録がリポジトリの外)', change({ kind: 'axis', answers: { 'q-biz-phase': 'poc' }, decidedBy: '佐藤 花子', reason: '仮説が崩れた', sgRecord: '../../../../CLAUDE.md' }), '実在する判定記録');
write('docs/gates/sg0-2026-10-01.md', '# SG-0 判定記録\n');
accepted('ステージを前へ戻す(事業決裁者の席の責任者の記名)', change({ kind: 'axis', date: DAY, summary: 'PoC へ戻す', answers: { 'q-biz-phase': 'poc' }, decidedBy: '佐藤 花子', reason: '仮説が崩れた', sgRecord: 'docs/gates/sg0-2026-10-01.md' }), 'ステージ移行ゲート(SG)の判定による');
check('契約検査(PoC へ戻した後)', contract().ok, contract().out);
check('D-0 の検査(PoC へ戻した後)', checkD0().ok, checkD0().out);

// ------------------------------------------------------------------ 名簿と回答のずれ(起票されない離脱)
fixes(["K39", "K62"]);
resetTo('base3');
refused('名簿から1名を外す(回答は3名以上のまま)', change({ kind: 'accountable', summary: '鈴木が離任', people: PEOPLE3.slice(0, 2), seats: { 'qa-gatekeeper': { accountable: '佐藤 花子' }, 'ai-ops': { accountable: '佐藤 花子' } } }), '3名以上のまま');

// ------------------------------------------------------------------ E. CL1 以上で3名を割る
fixes(["K5", "K50"]);
resetTo('base3');
accepted('安全重要度を CL1 へ上げる(3名)', change({ kind: 'axis', date: DAY, summary: '個人データを扱う', answers: { 'q-criticality': 'cl1' } }));
check('3名・CL1 は出荷できる構成', cfg().shipBlocked === null && contract().ok);
commit('chore: CL1');
const blockedChange = change({
  kind: 'headcount',
  date: DAY,
  summary: '鈴木が離任し、2名になった',
  answers: { 'q-team-size': 'size-1-2', 'q-external-reviewer': 'reviewer-yes' },
  people: PEOPLE3.slice(0, 2),
  seats: { 'qa-gatekeeper': { accountable: null }, 'ai-ops': { accountable: null } },
});
accepted('CL1 で3名 → 2名(拒否せず反映)', blockedChange, '[出荷不可]', '出荷できない状態の発生', '出荷できない(第5章 5.5.7、ADR-0028)');
check('構成に shipBlocked が立つ(記名なし・向きは発生)', cfg().shipBlocked?.reason && cfg().shipBlocked.since && cfg().changeLog.at(-1).direction === 'arising' && cfg().answers['q-team-size'] === 'size-1-2', JSON.stringify(cfg().shipBlocked));
const sbContract = contract();
check('契約検査は通し、出荷できない状態を表示する', sbContract.ok && sbContract.out.includes('出荷できない状態です'), sbContract.out);
check('D-0 の検査も表示する', checkD0().out.includes('出荷できない状態です'));
check('構成書と CLAUDE.md にも出る', read('PROCESS-PROFILE.md').includes('## 出荷できない状態') && read('CLAUDE.md').includes('**出荷できない状態**') && checkRules().ok);
commit('chore: 2名(CL1)');
const since = cfg().shipBlocked.since;
const regenSb = gen('--answers', 'process.config.json');
check('再生成しても shipBlocked と発生日を保つ', regenSb.ok && cfg().shipBlocked?.since === since, regenSb.out);
const lifted = change({
  kind: 'headcount',
  date: DAY,
  summary: '高橋が加わり、3名へ戻った',
  answers: { 'q-team-size': 'size-3-9' },
  people: [...PEOPLE3.slice(0, 2), { id: 'takahashi', name: '高橋 次郎' }],
  seats: { 'qa-gatekeeper': { accountable: '高橋 次郎' }, 'ai-ops': { accountable: '佐藤 花子' } },
  decidedBy: '山田 太郎',
  reason: '高橋を出荷判定者に',
});
accepted('3名以上へ戻す変化点で解除', lifted, '出荷できない状態の解消');
check('shipBlocked が消え、契約検査が通る', cfg().shipBlocked === null && contract().ok, contract().out);

// ------------------------------------------------------------------ F. 名義の機械検査の上書き
// #319 §8 X-5: 元は ADR-0028 を引いていた。名義の機械検査と人の確認(nameConfirmed)を定めるのは ADR-0054 決定1・
// ADR-0079 決定7(確認は本人以外の記名に限る)と #296 の付記
fixes(['ADR-0054 決定1', 'ADR-0079 決定7', '#296']);
resetTo('base3');
const CLAUDE_D = { id: 'dupont', name: 'Claude Dupont' };
refused('AI を示す語を含む氏名(確認なし)', change({ kind: 'accountable', people: [...PEOPLE3, CLAUDE_D], seats: { 'tech-lead': { accountable: 'Claude Dupont' } } }), 'nameConfirmed');
const overridden = change({ kind: 'accountable', date: DAY, summary: 'Dupont が加わった', people: [...PEOPLE3, { ...CLAUDE_D, nameConfirmed: true }], seats: { 'tech-lead': { accountable: 'Claude Dupont' } }, decidedBy: '山田 太郎', reason: '技術判断者を任命' });
// #319 裁定 R-2.5・7.5 J-1: 同じ変化点で名簿へ足して確認し任命すると、いまのテンプレートは拒否する(p302 では受け付けた)。
// 回帰か決定かを人が決めるまで、元の期待(反映)のまま、厳格な「落ちることを期待する」印を付ける。Issue は起票まで #319 を仮に置く
const J1 = { issue: '#319', match: '記名を受け付けられません: 技術判断者(Tech Lead) の責任者: "Claude Dupont"', on: '2026-10-27', review: '2026-12' };
const J1_ROOT = 'AI を示す語を含む氏名(人が確認した旨あり) → 反映';
accepted('AI を示す語を含む氏名(人が確認した旨あり)', overridden, '名義の機械検査を人が上書きした: Claude Dupont', { knownFailure: J1 });
const ovContract = contract();
check('契約検査・構成書に上書きが表示される', ovContract.ok && ovContract.out.includes('名義の機械検査を人が上書きした: Claude Dupont') && read('PROCESS-PROFILE.md').includes('名義の機械検査を人が上書きした: Claude Dupont'), ovContract.out, { dependsOn: J1_ROOT });
check('changeLog に上書きした氏名が残る', (cfg().changeLog.at(-1).nameOverrides ?? []).includes('Claude Dupont'), '', { dependsOn: J1_ROOT });
refused('担い手の識別と同じ文字列は上書きできない', change({ kind: 'accountable', people: [...PEOPLE3, { id: 'x', name: 'tok-dev', nameConfirmed: true }], seats: { 'dev-verifier': { accountable: 'tok-dev', performer: P } } }), '担い手の識別');
refused('名簿に無い名義は上書きできない', change({ kind: 'accountable', seats: { 'tech-lead': { accountable: 'Gemini Sato' } } }), '名簿');

// ------------------------------------------------------------------ アカウント(K13 の入力)
fixes(["K13", "K67", "K74"]);
resetTo('base3');
refused('アカウントに bot', change({ kind: 'accountable', people: [PEOPLE3[0], PEOPLE3[1], { ...PEOPLE3[2], accounts: ['dependabot[bot]'] }] }), 'bot');
refused('アカウントの重複(1つのアカウントを2人へ)', change({ kind: 'accountable', people: [PEOPLE3[0], { ...PEOPLE3[1], accounts: ['Yamada-Taro'] }, PEOPLE3[2]] }), '重複');
refused('アカウントが配列でない', change({ kind: 'accountable', people: [{ ...PEOPLE3[0], accounts: 'yamada-taro' }, PEOPLE3[1], PEOPLE3[2]] }), '配列');
// 第4巡(K67): アカウントだけの変更は同じ人の表記の変更で、記名と理由を要する。山田は決定者本人のため、本人以外の席の責任者が記名する
refused('アカウントを足す(記名なし)', change({ kind: 'accountable', date: DAY, summary: '山田の副アカウント', people: [{ ...PEOPLE3[0], accounts: ['yamada-taro', 'yamada-sub'] }, PEOPLE3[1], PEOPLE3[2]] }), '表記の変更');
refused('アカウントを足す(決定者本人の記名)', change({ kind: 'accountable', date: DAY, summary: '山田の副アカウント', people: [{ ...PEOPLE3[0], accounts: ['yamada-taro', 'yamada-sub'] }, PEOPLE3[1], PEOPLE3[2]], decidedBy: '山田 太郎', reason: '副アカウント' }), '決定者本人の行');
accepted('アカウントを足す', change({ kind: 'accountable', date: DAY, summary: '山田の副アカウント', people: [{ ...PEOPLE3[0], accounts: ['yamada-taro', 'yamada-sub'] }, PEOPLE3[1], PEOPLE3[2]], decidedBy: '佐藤 花子', reason: '副アカウント' }), 'のアカウント');
check('アカウントの追加は「構成の変更あり」で、D-0 の名簿にも出る', cfg().people[0].accounts.length === 2 && checkD0().ok && read('docs/D-0-governance.md').includes('yamada-taro, yamada-sub'), checkD0().out);

// ------------------------------------------------------------------ 指示資産の版の照合
fixes(["K40"]);
resetTo('base3');
const digest = contract('--instructions-digest').out.trim();
const P2 = { ...P, instructions: `CLAUDE.md@${digest}` };
accepted('委任(指示資産の版を識別子で申告)', change({ kind: 'mode', date: DAY, seats: { 'dev-verifier': { ...DELEGATE_DEV, performer: P2, qualification: { ...Q(), performer: P2 } } }, delegation: { rules: [RULE()], changeTypes: TYPES }, ruleApprovedBy: '山田 太郎', decidedBy: '山田 太郎', reason: 'r' }));
check('契約検査(識別子が一致)', contract().ok, contract().out);
fs.appendFileSync(path.join(DIR, '.claude/skills/implement/SKILL.md'), '\n<!-- 変更 -->\n');
const drift = contract();
check('指示資産を変えると契約検査が落ちる', !drift.ok && drift.out.includes('実ファイル'), drift.out);

resetTo('base3');
done();
