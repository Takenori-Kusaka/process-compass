// config.mjs の補助関数の確認。 node tmp/fix2-g3a/unit.mjs
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": [], "fixes": ["#284", "#285"]}
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { TPL, checker } from './lib.mjs';

// 元は ../tpl/scripts/gate/config.mjs(組C の直し。その前は file:///E:/... の絶対パス)。対象のテンプレートは run.mjs が作業の場所に写したもの
const m = await import(pathToFileURL(path.join(TPL, 'scripts/gate/config.mjs')).href);

const { check, done, fixes } = checker();
fixes(["K55", "K62", "K65"]);
// 元は ok / FAIL の行に得た値を続けて出した。移した版は、得た値と期待値を詳細(-v か、落ちたとき)に出す
const eq = (label, got, want) => check(label, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)} / want ${JSON.stringify(want)}`);

for (const [n, rejected] of [
  ['山田 太郎', false],
  ['John Smith', false],
  ['Ai Tanaka', false],
  ['Abbott', false],
  ['Talbot', false],
  ['Claude (AI)', true],
  ['Reviewer-Agent (gpt-9)', true],
  ['dependabot[bot]', true],
  ['田中AI', true],
  ['田中ＡＩ', true],
  ['Ａｇｅｎｔ 太郎', true],
  ['ｃｌａｕｄｅ', true],
  ['クロード', true],
  ['ｸﾛｰﾄﾞ', true],
  ['コパイロット', true],
  ['レビューエージェント', true],
  ['Сlaude', false], // キリル文字。機械で閉じない限界
  ['自動レビュー担当', false], // 役職名。機械で閉じない限界
  ['山田 太郎 2世', false],
]) {
  eq(`aiName ${n}`, m.aiNameReason(n) !== null, rejected);
}

const cfg = {
  people: [
    { id: 'p1', name: '山田 太郎', accounts: ['Yamada-Taro', '@yamada-sub'] },
    { id: 'p2', name: '佐藤 花子', external: true, accounts: [] },
  ],
  seats: [
    { role: 'biz-approver', name: '事業決裁者', accountable: '山田 太郎' },
    { role: 'value-owner', name: '価値責任者', accountable: '佐藤 花子' },
  ],
};
eq('account → person(大文字と小文字を区別しない)', m.findPersonByAccount(cfg, 'yamada-taro')?.id, 'p1');
eq('account → person(先頭の @)', m.findPersonByAccount(cfg, 'yamada-sub')?.id, 'p1');
eq('account 対応なし', m.findPersonByAccount(cfg, 'someone'), null);
eq('全角の空白の氏名も同じ人', m.personKey(cfg, '山田　太郎'), 'p1');
eq('roster ok', m.rosterProblems(cfg), []);
eq('roster: bot のアカウント', m.rosterProblems({ people: [{ id: 'a', name: '山田', accounts: ['github-actions[bot]'] }] }).length, 1);
eq('roster: 重複するアカウント', m.rosterProblems({ people: [{ id: 'a', name: '山田', accounts: ['x'] }, { id: 'b', name: '佐藤', accounts: ['X'] }] }).length, 1);
eq('決定者の席の既定', m.structureDeciderSeat(cfg), 'biz-approver');
eq('決定者の席(governance)', m.structureDeciderSeat({ ...cfg, governance: { structureDecider: 'value-owner' } }), 'value-owner');
eq('決定者の席(不正な値は既定へ)', m.structureDeciderSeat({ ...cfg, governance: { structureDecider: 'nobody' } }), 'biz-approver');
eq('決定できる人', [...m.allowedDeciders({ ...cfg, governance: { structureDecider: 'value-owner' } }, null)], ['p2']);

// 要約値の連鎖
eq('canonical: キーの並びに依らない', m.canonicalJson({ b: 1, a: [{ d: 1, c: 2 }] }), m.canonicalJson({ a: [{ c: 2, d: 1 }], b: 1 }));
const c = { schemaVersion: 0, configured: true, answers: { x: 1 }, changeLog: [{ kind: 'init', date: 'd' }] };
m.sealChangeLog(c);
eq('seal: 最初の記録', [c.changeLog[0].prevHash, c.changeLog[0].stateHash === m.configDigest(c), c.schemaVersion], [null, true, 1]);
eq('chain ok', m.chainProblems(c), { legacy: false, problems: [] });
c.changeLog.push({ kind: 'mode', date: 'd2' });
c.answers.x = 2;
m.sealChangeLog(c);
eq('chain ok(2件)', m.chainProblems(c).problems, []);
const tampered = JSON.parse(JSON.stringify(c));
tampered.answers.x = 3;
eq('構成の書き換えを検出', m.chainProblems(tampered).problems.length, 1);
const cut = JSON.parse(JSON.stringify(c));
cut.changeLog.pop();
eq('切り詰めを検出(構成が最後の記録と一致しない)', m.chainProblems(cut).problems.length, 1);
const swapped = JSON.parse(JSON.stringify(c));
swapped.changeLog[0].date = 'other';
eq('記録の差し替えを検出', m.chainProblems(swapped).problems.length, 1);
eq('legacy', m.chainProblems({ configured: true, changeLog: [{ kind: 'init' }] }).legacy, true);
// 旧い構成からの移行
const legacy = { schemaVersion: 0, configured: true, answers: {}, changeLog: [{ kind: 'init', date: 'a' }, { kind: 'mode', date: 'b' }, { kind: 'settings', date: 'c' }] };
m.sealChangeLog(legacy);
eq('移行: 起点の印と連鎖', [legacy.changeLog[2].chainStart, m.chainProblems(legacy).problems.length], [true, 0]);
const legacyEdit = JSON.parse(JSON.stringify(legacy));
legacyEdit.changeLog[0].date = 'z';
eq('移行: 連鎖より前の記録の書き換えを検出', m.chainProblems(legacyEdit).problems.length, 1);

// 基底ブランチとの比較
const base = JSON.parse(JSON.stringify(c));
eq('base: 変更なし', m.baseChainProblems(base, c), []);
eq('base: 未設定の基底は比べない', m.baseChainProblems({ configured: false }, c), []);
eq('base: 構成が変わり、追記なし', m.baseChainProblems(base, tampered).length, 1);
const appended = JSON.parse(JSON.stringify(c));
appended.answers.x = 9;
appended.changeLog.push({ kind: 'axis', date: 'd3' });
m.sealChangeLog(appended);
eq('base: 追記つきの変更は通る', m.baseChainProblems(base, appended), []);
eq('base: 切り詰め', m.baseChainProblems(base, cut).length >= 1, true);
eq('base: 未設定へ戻す', m.baseChainProblems(base, { configured: false }).length, 1);

// 即時通知
const log = {
  changeLog: [
    { kind: 'init', notice: null },
    { kind: 'headcount', date: '2026-10-01', notice: { to: null, at: null, reasons: ['人数の境界の通過'] } },
    { kind: 'mode', date: '2026-10-02', notice: { to: '山田', at: '2026-10-02', reasons: ['運用形態の変更'] } },
    { kind: 'performer', date: '2026-10-03', notice: { to: null, at: null, reasons: ['x'] } },
    { kind: 'notice', noticeFor: 1, notice: { to: '山田', at: '2026-10-04', reasons: [] } },
  ],
};
eq('pendingNotices', m.pendingNotices(log).map((p) => p.index), [3]);

// 委任の規則と変更種別
const dcfg = {
  people: [{ id: 'a', name: '山田' }],
  seats: [
    { role: 'biz-approver', name: '事業決裁者', accountable: '山田' },
    { role: 'ai-maintainer', name: 'AI維持管理者', accountable: '山田' },
    { role: 'dev-verifier', name: '開発者', accountable: '山田', mode: 'delegated', performer: { model: 'm' }, qualification: { confirmedAt: 'x', performedBy: 'a', approvedBy: 'b', cases: 'c', result: 'd', performer: { model: 'm' } } },
  ],
  governance: { structureDecider: 'biz-approver', catalogRegistrar: 'biz-approver' },
  delegation: { allowed: true, changeTypes: [{ id: '表示文言', registeredBy: '山田', registeredAt: '2026-10-01', basis: { detection: { rejectionRate: 'd1', duplicationRate: 'd2', reworkRate: 'd3' }, rollback: 'r', tests: 't' } }], protectedPaths: ['src/core/**'], rules: [{ id: 'DR-1', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/**'], decidedBy: '山田', reason: 'r', approvedBy: '山田' }] },
};
eq('規則: 登録済みの変更種別', m.delegationRuleProblems(dcfg.delegation.rules[0], dcfg), []);
eq('規則: 未登録の変更種別', m.delegationRuleProblems({ ...dcfg.delegation.rules[0], changeType: 'なんでも' }, dcfg).length, 1);
eq('規則: config を渡さなければ形式だけ', m.delegationRuleProblems({ ...dcfg.delegation.rules[0], changeType: 'なんでも' }), []);
eq('変更種別: 登録者が決定者', m.changeTypeProblems(dcfg), []);
eq('変更種別: 登録者が決定者でない', m.changeTypeProblems({ ...dcfg, people: [...dcfg.people, { id: 'b', name: '佐藤' }], delegation: { ...dcfg.delegation, changeTypes: [{ id: 'x', registeredBy: '佐藤', registeredAt: '2026-10-01', basis: { detection: { rejectionRate: 'd1', duplicationRate: 'd2', reworkRate: 'd3' }, rollback: 'r', tests: 't' } }] } }).length, 1);
eq('変更種別: b4 なら名簿の人でよい', m.changeTypeProblems({ ...dcfg, governance: { ...dcfg.governance, catalogRegistrar: 'b4' }, people: [...dcfg.people, { id: 'b', name: '佐藤' }], delegation: { ...dcfg.delegation, changeTypes: [{ id: 'x', registeredBy: '佐藤', registeredAt: '2026-10-01', basis: { detection: { rejectionRate: 'd1', duplicationRate: 'd2', reworkRate: 'd3' }, rollback: 'r', tests: 't' } }] } }), []);
eq('変更種別: 日付なし', m.changeTypeProblems({ ...dcfg, delegation: { ...dcfg.delegation, changeTypes: [{ id: 'x', registeredBy: '山田' }] } }).length, 1);
eq('classify: 範囲内', m.classifyDelegation(dcfg, ['src/i18n/ja.json']).rule, 'DR-1');
eq('classify: 確約範囲・コア指定に触れる', m.classifyDelegation(dcfg, ['src/core/a.js']).rule, null);
eq('classify: 未登録の種別の規則は該当しない', m.classifyDelegation({ ...dcfg, delegation: { ...dcfg.delegation, changeTypes: [] } }, ['src/i18n/ja.json']).rule, null);
eq('classify: 承認の無い規則は該当しない', m.classifyDelegation({ ...dcfg, delegation: { ...dcfg.delegation, rules: [{ ...dcfg.delegation.rules[0], approvedBy: null }] } }, ['src/i18n/ja.json']).rule, null);
eq('classify: 決定した者の無い規則は該当しない', m.classifyDelegation({ ...dcfg, delegation: { ...dcfg.delegation, rules: [{ ...dcfg.delegation.rules[0], decidedBy: null }] } }, ['src/i18n/ja.json']).rule, null);
eq('出荷できない状態の理由(人数の減少)', m.belowMinimumStaffing({ 'q-team-size': 'size-1-2', 'q-criticality': 'cl1' }).includes('体制が3名を割った'), true);
eq('出荷できない状態の理由(区分の上昇)', m.belowMinimumStaffing({ 'q-team-size': 'size-1-2', 'q-criticality': 'cl1' }, 'criticality').includes('1〜2名の体制のまま'), true);
eq('outagePeriods', m.outagePeriods({ changeLog: [{ kind: 'outage', outage: { from: 'a', to: null, handling: 'human' } }, { kind: 'mode' }, { kind: 'outage', outage: { from: 'a', to: 'b', handling: 'stop', closes: 0 } }, { kind: 'outage', outage: { from: 'c', to: null, handling: 'stop' } }] }).map((x) => [x.from, x.to, x.handling, x.ongoing]), [['a', 'b', 'stop', false], ['c', null, 'stop', true]]);
eq('適合性確認: 失効', m.qualificationProblems({ qualification: { lapsed: { reason: '適合性確認の承認者が離脱したため失効' } } }).length, 1);

// 第3巡(K55・K62・K65)
eq('変更種別: 登録の根拠(basis)が無い', m.changeTypeProblems({ ...dcfg, delegation: { ...dcfg.delegation, changeTypes: [{ id: 'x', registeredBy: '山田', registeredAt: '2026-10-01' }] } }).some((p) => p.includes('登録の根拠(basis)がない')), true);
eq('変更種別: basis の一部が空', m.changeTypeProblems({ ...dcfg, delegation: { ...dcfg.delegation, changeTypes: [{ id: 'x', registeredBy: '山田', registeredAt: '2026-10-01', basis: { detection: { rejectionRate: 'd1', duplicationRate: 'd2', reworkRate: 'd3' }, rollback: '', tests: 't' } }] } }).length, 1);
eq('classify: basis の無い変更種別の規則は該当しない', m.classifyDelegation({ ...dcfg, delegation: { ...dcfg.delegation, changeTypes: [{ id: '表示文言', registeredBy: '山田', registeredAt: '2026-10-01' }] } }, ['src/i18n/ja.json']).rule, null);
eq('isRealDay: 2026-02-31 は無い', m.isRealDay('2026-02-31'), false);
eq('isRealDay: 2028-02-29 はある', m.isRealDay('2028-02-29'), true);
eq('isRealDay: 形式違い', m.isRealDay('2026/10/01'), false);
const rr = { answers: { 'q-team-size': 'size-1-2', 'q-external-reviewer': 'reviewer-no' }, people: [{ id: 'a', name: '山田' }, { id: 'x', name: '外山', external: true }], seats: [{ role: 'dev-verifier', accountable: '山田' }, { role: 'independent-reviewer', accountable: '外山' }] };
eq('answersRosterProblems: 回答は確認者なし、席は外部の確認者', m.answersRosterProblems(rr).length, 1);
eq('answersRosterProblems: 席が本人なら矛盾なし', m.answersRosterProblems({ ...rr, seats: [{ role: 'dev-verifier', accountable: '山田' }, { role: 'independent-reviewer', accountable: '山田' }] }), []);
eq('isAppointer: external と appointer の両方', [m.isAppointer({ people: [{ id: 'o', name: '任命', external: true, appointer: true }] }, '任命'), m.isAppointer({ people: [{ id: 'o', name: '任命', appointer: true }] }, '任命')], [true, false]);
eq('rosterProblems: appointer は external を要する', m.rosterProblems({ people: [{ id: 'o', name: '任命', appointer: true }] }).length, 1);
eq('g6Established', [m.g6Established({ gates: { g6: { state: 'required' } }, unmet: [] }), m.g6Established({ gates: { g6: { state: 'unmet' } }, unmet: [{ gate: 'g6' }] })], [true, false]);
eq('SIGNED_DIRECTIONS', m.SIGNED_DIRECTIONS, ['loosen', 'appoint']);
eq('configIntegrityProblems: 未設定は空', m.configIntegrityProblems({ configured: false }), []);

done();
