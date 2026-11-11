// #432・#433: 決定者が自分に関わる変更を自分の記名で決められないこと(第3章 3.13.3。裁定 R-1〜R-4)と、
// 発生で入った兼務の鍵・決定待ち・期限(論点1 の 1-A・1-D・1-E)を固定する。
// 入力は #432 の実行による確認(research/432-deliberation/survey-432-1-internal.md の L1a〜L1f・L2a〜L2c)と、
// #433 の確認(research/433-deliberation/survey-433.md の S8・S9・S11・U1)にそろえる。
//   node scripts/regress/run.mjs --only self-decision
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["sd432"], "fixes": ["#432", "#433"]}
import { workspace, checker, NAMES, SEATS, APPOINTER, TODAY, rosterAccount } from './lib.mjs';

const { check, refused, accepted, fixes, done } = checker();
fixes(['標準 3.13.3', '標準 3.5']);

const W = workspace('sd432');
const { git, write, cfg, gen, change, contract } = W;
const reset = () => {
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd');
};
const P = (i) => ({ id: `p${i + 1}`, name: NAMES[i], accounts: [rosterAccount(`acct-${i + 1}`)] });
/** 決定者の別の行(同じ人を新しい id で足す。機械は別の人として扱う) */
const ALT = { id: 'p1b', name: 'ヤマダ タロウ', accounts: [rosterAccount('acct-1b')] };
const X = { id: 'x', name: '高橋 次郎', external: true, accounts: [rosterAccount('acct-x')] };
const seatsOf = (arr) => Object.fromEntries(SEATS.map((s, i) => [s, { accountable: arr[i] === null ? null : arr[i] === 'alt' ? ALT.name : NAMES[arr[i]] }]));
const ALL = (i) => SEATS.map(() => i);
const init = () => {
  reset();
  write('answers.json', { 'q-team-size': 'size-1-2', 'q-biz-phase': 'mvp', 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free', 'q-external-reviewer': 'reviewer-yes' });
  const r = gen('--answers', 'answers.json', '--stack', 'node');
  W.d0('1.0');
  return r;
};
const acc = (summary, people, seats, decidedBy, extra = {}) => ({ kind: 'accountable', date: TODAY, summary, people, seats, ...(decidedBy ? { decidedBy, reason: summary } : {}), ...extra });
const last = () => cfg().changeLog.at(-1);
const rowsOf = (e, re) => (e.diff ?? []).map((l, i) => ({ l, k: e.rowKinds?.[i] })).filter((x) => re.test(x.l));
const SELF = '決定者は、自分に関わる変更を自分の記名で決められません';
const SHIP = 'qa-gatekeeper';
const SHIP_SEP = 'sep-shipping-business';
/** 自己の決定の根拠(D-0 節11「決裁の権限の出所」。突合 X-7)を書く */
const authority = () => write('docs/D-0-governance.md', W.read('docs/D-0-governance.md').replace(/^(\| 決裁の権限の出所 \|)[^\n]*\|\s*$/m, '$1 個人事業主本人(試験) |'));
/** 判定記録(G-1)を基底ブランチの置き場へ書く。期限(最初のゲート判定より前)の確認に使う。when は判定日時(日付だけ、または日付と時刻) */
const gateRecord = (day, when = `${day} 10:00`) =>
  write(
    `docs/gates/g1-test-${day}.md`,
    `# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | G-1 企画承認 |\n| 対象 | 企画書 |\n| 判定者 | ${NAMES[0]} |\n| 判定日時 | ${when} |\n| 結果 | 通過 |\n| 確定の形態 | 人確定 |\n| 参照した D-0 の版 | 1.0 |\n`
  );

// ================================================================ 論点1(発生で入った兼務)
// L1c: 初回の記入で、2名の名簿の全席を1人目(決定者)へ。兼務は決定者が当事者の決定であり、本人の記名では通らない(R-1)
check('L1c 準備: 初期化', init().ok);
refused('L1c 名簿 [1人目, 2人目]、全席 1人目(初回の記入。記名 1人目=決定者・当事者)', change(acc('体制を記入', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0])), SELF);
accepted('L1c 同じ初回の記入。記名 2人目(同じ変化点で記入されるもう1人。突合 X-3)', change(acc('体制を記入', [P(0), P(1)], seatsOf(ALL(0)), NAMES[1])));
check('L1c もう1人の記名で、2組とも緩める行として決定済みになる', rowsOf(last(), /が生じる\(別の人を置ける体制で/).length === 2 && last().decidedBy === NAMES[1] && last().selfDecided !== true, JSON.stringify(last()));

// L1f: 1人体制で兼務が入り(発生)、2人目を名簿へ足すだけ(記名なし)。人を足す反映は止めない。決定待ちの行が出る(1-D)
check('L1f 準備: 初期化', init().ok);
accepted('L1f 名簿 [1人目]、全席 1人目(初回の記入)', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
check('L1f 1人体制の兼務は発生', rowsOf(last(), /の兼務\(当事者の id p1。/).every((x) => x.k === 'arising') && rowsOf(last(), /の兼務\(当事者の id p1。/).length === 2, JSON.stringify(last().diff));
refused('L1f 2人目を名簿へ足すだけ(記名なし。名簿の追加は記名を要する。突合 X-2)', change(acc('2人目を名簿へ', [P(0), P(1)], seatsOf(ALL(0)))), '人の名簿への追加');
accepted('L1f 2人目を名簿へ足すだけ(記名 1人目=決定者。兼務の決定の記名は待たない)', change(acc('2人目を名簿へ', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0])));
{
  const e = last();
  const pending = rowsOf(e, /選択の余地が生じた\(決定待ち/);
  check('L1f 選択の余地が生じた行が2組とも出る(種類 none。兼務の決定ではない)', pending.length === 2 && pending.every((x) => x.k === 'none') && e.direction !== 'loosen', JSON.stringify(e));
}
check('L1f 期限の前(判定記録なし): 契約検査は決定待ちを問題にしない', !/決定待ちです/.test(contract().out), contract().out);
gateRecord(TODAY, TODAY);
{
  const r = contract();
  check('L1f 期限の後(決定待ちのまま記録したゲート判定): 契約検査が記載の欠落として落ちる', !r.ok && /決定待ちです/.test(r.out) && /記載の欠落/.test(r.out), r.out);
}
refused('L1f 出荷判定者 × 事業決裁者の兼務を続ける決定。記名 1人目(決定者・当事者)', change(acc('兼務を続ける', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0], { keepSeparations: [SHIP_SEP] })), SELF);
accepted('L1f 出荷判定者 × 事業決裁者の兼務を続ける決定。記名 2人目(もう1人)', change(acc('兼務を続ける', [P(0), P(1)], seatsOf(ALL(0)), NAMES[1], { keepSeparations: [SHIP_SEP] })));
{
  const e = last();
  const kept = rowsOf(e, /を続ける\(別の人を置ける体制で/);
  check('L1f 続ける決定は緩める行。解いた先の割り当て(新たに生じる兼務)を書く', kept.length === 1 && kept[0].k === 'loosen' && /解いた先の割り当て: .*新たに生じる兼務/.test(kept[0].l) && e.direction === 'loosen', JSON.stringify(e.diff));
}
{
  const r = contract();
  check('L1f 出荷判定者 × 事業決裁者は決定済み。AI の組だけが決定待ちとして残る', /AI運用担当者\(AIOps\) の兼務.*決定待ちです/.test(r.out) && !/事業決裁者 の兼務.*決定待ちです/.test(r.out), r.out);
  check('L1f 決定の後も、成立しない兼務禁止の表示は続く(保証の開示の項目1 の材料)', /成立しない兼務禁止\(列挙に無い離脱。逸脱ではない\)として記録しています: 品質保証/.test(r.out), r.out);
}
refused('L1f 決定待ちでない兼務を keepSeparations に書く(決定済みの組)', change(acc('もう一度', [P(0), P(1)], seatsOf(ALL(0)), NAMES[1], { keepSeparations: [SHIP_SEP] })), '続ける決定ができる兼務ではありません');
accepted('L1f AI の組も続ける決定(記名 2人目)', change(acc('AI の組', [P(0), P(1)], seatsOf(ALL(0)), NAMES[1], { keepSeparations: ['sep-maintainer-ops'] })));
{
  const r = contract();
  check('L1f すべて決定した後も、決定待ちの間に記録した判定は記載の欠落のまま残る(突合 X-5)', !r.ok && /決定待ちの間/.test(r.out) && !/決定待ちです/.test(r.out), r.out);
}
gateRecord('2099-01-02');
check('L1f 決定の後にそのゲートを判定し直すと、欠落が解ける', !/決定待ち/.test(contract().out), contract().out);
// 体制の内が1人へ戻る(2人目の離脱。記名なし)。発生の扱いへ戻る
accepted('L1f 2人目の離脱(記名なし)', change(acc('2人目が離脱', [P(0)], seatsOf(ALL(0)))));
check('L1f 1人へ戻ると「選択の余地が無くなった」の行が出る(発生へ戻す)', rowsOf(last(), /選択の余地が無くなった/).length === 2 && rowsOf(last(), /選択の余地が無くなった/).every((x) => x.k === 'arising'), JSON.stringify(last().diff));
accepted('L1f もう一度2人目を足す(記名 1人目)', change(acc('2人目を再び', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0])));
check('L1f 再び2人になると、決定済みだった兼務も決定待ちへ戻る', rowsOf(last(), /選択の余地が生じた/).length === 2, JSON.stringify(last().diff));

// L1d: 当事者の差し替え。AI の組の両席を2人目へ移すと、旧い兼務の解消と新しい兼務の発生の行が出る(1-A)
check('L1d 準備: 初期化', init().ok);
accepted('L1d 名簿 [1人目]、全席 1人目', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
accepted('L1d 2人目を名簿へ(記名 1人目=決定者)', change(acc('2人目', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0])));
accepted('L1d AI維持管理者・AI運用担当者を両方2人目へ(記名 1人目。当事者は2人目で、決定者でない)', change(acc('AI の席', [P(0), P(1)], seatsOf([0, 0, 0, 0, 0, 0, 0, 1, 1]), NAMES[0])));
{
  const e = last();
  check(
    'L1d 旧い当事者の解消と、新しい当事者の発生(緩める)が出る',
    rowsOf(e, /AI運用担当者\(AIOps\) の兼務\(当事者の id p1。.*が解消する/).length === 1 &&
      rowsOf(e, /AI運用担当者\(AIOps\) の兼務\(当事者の id p2。.*が生じる\(別の人を置ける体制で/).some((x) => x.k === 'loosen'),
    JSON.stringify(e.diff)
  );
}

// L1e: 兼務を解いてから戻す。戻す行は緩める決定で、当事者が決定者なら本人以外が記名する
check('L1e 準備: 初期化', init().ok);
accepted('L1e 名簿 [1人目]、全席 1人目', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
accepted('L1e 2人目を名簿へ、AI運用担当者を2人目へ(兼務を解く。記名 1人目)', change(acc('AI運用', [P(0), P(1)], seatsOf([0, 0, 0, 0, 0, 0, 0, 0, 1]), NAMES[0])));
refused('L1e AI運用担当者を1人目へ戻す(兼務を戻す)。記名 1人目(決定者・当事者)', change(acc('戻す', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0])), SELF);
accepted('L1e 同じ変化点。記名 2人目(もう1人)', change(acc('戻す', [P(0), P(1)], seatsOf(ALL(0)), NAMES[1])));

// L1a: 離脱を経る。任命権者の記名で2人目を全席へ(内側は2人目だけ。発生)、3人目を名簿へ足すと決定待ち
check('L1a 準備: 初期化', init().ok);
accepted('L1a 名簿 [1人目, 任命権者]、全席 1人目', change(acc('1人目', [P(0), APPOINTER], seatsOf(ALL(0)), NAMES[0])));
accepted('L1a 1人目の離脱(全席を空ける)と2人目の追加(追加は任命権者の記名)', change(acc('1人目が離脱', [P(1), APPOINTER], seatsOf(SEATS.map(() => null)), APPOINTER.name)));
accepted('L1a 任命権者の記名で2人目を全席へ', change(acc('後任', [P(1), APPOINTER], seatsOf(ALL(1)), APPOINTER.name)));
check('L1a 内側は2人目だけ: 兼務は発生', rowsOf(last(), /の兼務\(当事者の id p2。.*が生じる$/).length === 2, JSON.stringify(last().diff));
accepted('L1a 3人目を名簿へ足す(記名 2人目=決定者)', change(acc('3人目', [P(1), P(2), APPOINTER], seatsOf(ALL(1)), NAMES[1])));
check('L1a 3人目が入ると決定待ち', rowsOf(last(), /選択の余地が生じた/).length === 2, JSON.stringify(last().diff));
accepted('L1a 任命権者の記名で、出荷判定者 × 事業決裁者を続ける決定', change(acc('続ける', [P(1), P(2), APPOINTER], seatsOf(ALL(1)), APPOINTER.name, { keepSeparations: [SHIP_SEP] })));

// 名簿への追加の記名者(#433 IMPL-0480)
check('追加 準備: 初期化', init().ok);
accepted('追加 名簿 [1人目]、全席 1人目', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
accepted('追加 2人目を名簿へ(記名 1人目=決定者)', change(acc('2人目', [P(0), P(1)], seatsOf(ALL(0)), NAMES[0])));
refused('追加 外部の確認者を名簿へ。記名 2人目(決定者でない)', change(acc('外部の確認者', [P(0), P(1), X], seatsOf(ALL(0)), NAMES[1])), '名簿の変更です');
refused('追加 外部の確認者を名簿へ。記名なし', change(acc('外部の確認者', [P(0), P(1), X], seatsOf(ALL(0)))), '人の名簿への追加');
accepted('追加 外部の確認者を名簿へ。記名 1人目(決定者)', change(acc('外部の確認者', [P(0), P(1), X], seatsOf(ALL(0)), NAMES[0])));

// ================================================================ 論点2(決定者が当事者になる兼務)
// 名簿 [1人目, 2人目, 任命権者]。2人目 = 事業決裁者(決定者)・独立レビュア・AI運用担当者、ほか = 1人目
const l2Base = (tag) => {
  check(`${tag} 準備: 初期化`, init().ok);
  return accepted(`${tag} 準備: 2人目 = 決定者・独立レビュア・AI運用担当者(初回の記入。記名 2人目)`, change(acc('体制を記入', [P(0), P(1), APPOINTER], seatsOf([1, 0, 0, 0, 1, 0, 0, 0, 1]), NAMES[1])));
};
for (const [who, signer, ok] of [
  ['決定者本人(当事者)', NAMES[1], false],
  ['もう1人(前の出荷判定者)', NAMES[0], true],
  ['組織上の任命権者', APPOINTER.name, true],
]) {
  l2Base(`L2a(${who})`);
  const c = acc('出荷判定者', [P(0), P(1), APPOINTER], seatsOf([1, 0, 0, 0, 1, 1, 0, 0, 1]), signer);
  if (ok) accepted(`L2a 決定者が自分を出荷判定者へ。記名 ${who}`, change(c));
  else refused(`L2a 決定者が自分を出荷判定者へ。記名 ${who}`, change(c), SELF);
}
for (const [who, signer, ok] of [
  ['決定者本人(当事者)', NAMES[1], false],
  ['もう1人(前の AI維持管理者)', NAMES[0], true],
]) {
  l2Base(`L2b(${who})`);
  const c = acc('AI維持管理者', [P(0), P(1), APPOINTER], seatsOf([1, 0, 0, 0, 1, 0, 0, 1, 1]), signer);
  if (ok) accepted(`L2b 決定者が自分を AI維持管理者へ。記名 ${who}`, change(c));
  else refused(`L2b 決定者が自分を AI維持管理者へ。記名 ${who}`, change(c), SELF);
}
for (const [who, signer, ok] of [
  ['決定者(当事者でない)', NAMES[1], true],
  ['当事者(決定者でない)', NAMES[0], false],
]) {
  l2Base(`L2c(${who})`);
  const c = acc('AI運用', [P(0), P(1), APPOINTER], seatsOf([1, 0, 0, 0, 1, 0, 0, 0, 0]), signer);
  if (ok) accepted(`L2c 1人目を AI運用担当者へ(1人目に兼務)。記名 ${who}`, change(c));
  else refused(`L2c 1人目を AI運用担当者へ(1人目に兼務)。記名 ${who}`, change(c), '決定できるのは');
}

// ================================================================ #433 の重の部分(本人の行・迂回)
// S8: 2名。決定者(1人目)の氏名の訂正。本人は通らず、もう1人が通る
const twoBase = (tag, people = [P(0), P(1)]) => {
  check(`${tag} 準備: 初期化`, init().ok);
  accepted(`${tag} 準備: 1人目 = 決定者ほか、2人目 = 独立レビュア・出荷判定者・AI運用担当者`, change(acc('体制', people, seatsOf([0, 0, 0, 0, 1, 1, 0, 0, 1]), NAMES[0])));
};
const renamed = (people) => people.map((p) => (p.id === 'p1' ? { ...p, name: '山田 太朗' } : p));
twoBase('S8');
const S8_SEATS = Object.fromEntries(SEATS.map((s, i) => [s, { accountable: [0, 0, 0, 0, 1, 1, 0, 0, 1][i] === 0 ? '山田 太朗' : NAMES[1] }]));
refused('S8 2名: 決定者の氏名の訂正。記名 本人', change(acc('改名', renamed([P(0), P(1)]), S8_SEATS, '山田 太朗')), SELF);
accepted('S8 2名: 同じ変化点。記名 もう1人', change(acc('改名', renamed([P(0), P(1)]), S8_SEATS, NAMES[1])));
// S9: 1名・任命権者なし。本人の記名を自己の決定として受け付ける(行き止まりを解く)
check('S9 準備: 初期化', init().ok);
accepted('S9 準備: 1名', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
// X-7: 自己の決定には、D-0 節11 の「決裁の権限の出所」の記載を求める
refused('S9 1名(任命権者なし): 本人の氏名の訂正。記名 本人(D-0 の決裁の権限の出所が様式のまま)', change(acc('改名', renamed([P(0)]), Object.fromEntries(SEATS.map((s) => [s, { accountable: '山田 太朗' }])), '山田 太朗')), '決裁の権限の出所');
authority();
accepted('S9 1名(任命権者なし): 本人の氏名の訂正。記名 本人(自己の決定)', change(acc('改名', renamed([P(0)]), Object.fromEntries(SEATS.map((s) => [s, { accountable: '山田 太朗' }])), '山田 太朗')));
check('S9 変化点の記録に自己の決定(selfDecided)が残る', last().selfDecided === true, JSON.stringify(last()));
// S11: 1名 + 任命権者。本人は通らず、任命権者が通る
check('S11 準備: 初期化', init().ok);
accepted('S11 準備: 1名 + 任命権者', change(acc('1人目', [P(0), APPOINTER], seatsOf(ALL(0)), NAMES[0])));
refused('S11 1名 + 任命権者: 本人の氏名の訂正。記名 本人', change(acc('改名', renamed([P(0), APPOINTER]), Object.fromEntries(SEATS.map((s) => [s, { accountable: '山田 太朗' }])), '山田 太朗')), SELF);
accepted('S11 同じ変化点。記名 任命権者', change(acc('改名', renamed([P(0), APPOINTER]), Object.fromEntries(SEATS.map((s) => [s, { accountable: '山田 太朗' }])), APPOINTER.name)));
check('S11 任命権者の記名は自己の決定でない', last().selfDecided !== true, JSON.stringify(last()));
// 外部の確認者の経路: 1名 + 外部の確認者(独立レビュアの席)。外部の確認者は本人以外の記名者に数えない
check('外部 準備: 初期化', init().ok);
authority();
accepted('外部 準備: 1名 + 外部の確認者(独立レビュアの席)', change(acc('体制', [P(0), X], Object.fromEntries(SEATS.map((s) => [s, { accountable: s === 'independent-reviewer' ? X.name : NAMES[0] }])), NAMES[0])));
refused('外部 決定者の氏名の訂正。記名 外部の確認者', change(acc('改名', renamed([P(0), X]), Object.fromEntries(SEATS.map((s) => [s, { accountable: s === 'independent-reviewer' ? X.name : '山田 太朗' }])), X.name)), SELF);
accepted('外部 同じ変化点。記名 本人(本人以外に決められる者がいない1名の体制。自己の決定)', change(acc('改名', renamed([P(0), X]), Object.fromEntries(SEATS.map((s) => [s, { accountable: s === 'independent-reviewer' ? X.name : '山田 太朗' }])), '山田 太朗')));
check('外部 変化点の記録に自己の決定が残る', last().selfDecided === true, JSON.stringify(last()));
// U1: 3名の体制。決定者(1人目)の別のアカウントの新しい行を名簿へ足し、決定者の席をその行へ移す。経路を問わず本人以外の記名を要する(c-2)
// 席: 1人目 = 事業決裁者・価値責任者・技術判断者・開発者・文脈オーナー・AI維持管理者、2人目 = 独立レビュア・AI運用担当者、3人目 = 出荷判定者
const U1_BASE = [0, 0, 0, 0, 1, 2, 0, 0, 1];
const U1_PEOPLE = [P(0), P(1), P(2)];
check('U1 準備: 初期化', init().ok);
accepted('U1 準備: 3名の体制(回答 size-3-9)', change(acc('体制', U1_PEOPLE, seatsOf(U1_BASE), NAMES[0], { answers: { 'q-team-size': 'size-3-9' } })));
accepted('U1 1手目: 新しい行を名簿へ足すだけ(記名 本人=決定者)', change(acc('別の行', [...U1_PEOPLE, ALT], seatsOf(U1_BASE), NAMES[0])));
const U1_SEATS = seatsOf(['alt', ...U1_BASE.slice(1)]);
refused('U1 2手目: 決定者の席を新しい行へ。記名 本人(前任の決定者)', change(acc('付け替え', [...U1_PEOPLE, ALT], U1_SEATS, NAMES[0])), SELF);
refused('U1 2手目: 同じ変化点。記名 新しい行(新任の決定者)', change(acc('付け替え', [...U1_PEOPLE, ALT], U1_SEATS, ALT.name)), SELF);
accepted('U1 2手目: 同じ変化点。記名 本人以外の席の責任者(2人目)', change(acc('付け替え', [...U1_PEOPLE, ALT], U1_SEATS, NAMES[1])));
// 正当な交代(2名・任命権者なし): 前任も新任も当事者で、当事者以外に記名できる者がいない。前任の記名を自己の決定として受け付ける(突合 X-1 への裁定)
twoBase('交代');
authority();
refused('交代 2名(任命権者なし): 決定者を2人目へ。記名 新任', change(acc('交代', [P(0), P(1)], seatsOf([1, 0, 0, 0, 1, 1, 0, 0, 1]), NAMES[1])), SELF, '新任の決定者が、自分の任命を自分の記名で確定することはできません');
accepted('交代 2名(任命権者なし): 同じ変化点。記名 前任(自己の決定)', change(acc('交代', [P(0), P(1)], seatsOf([1, 0, 0, 0, 1, 1, 0, 0, 1]), NAMES[0])));
check('交代 変化点の記録に自己の決定が残る', last().selfDecided === true, JSON.stringify(last()));
twoBase('交代(任命権者)', [P(0), P(1), APPOINTER]);
accepted('交代 2名 + 任命権者: 決定者を2人目へ。記名 任命権者', change(acc('交代', [P(0), P(1), APPOINTER], seatsOf([1, 0, 0, 0, 1, 1, 0, 0, 1]), APPOINTER.name)));
// 2手に分けた迂回: 1名の決定者が、自分の別の行を(席を持たない)名簿の人として足し、その行の記名で本人の行を変える
check('2手 準備: 初期化', init().ok);
accepted('2手 準備: 1名', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
accepted('2手 1手目: 別の行を名簿へ足す(記名 本人=決定者)', change(acc('別の行', [P(0), ALT], seatsOf(ALL(0)), NAMES[0])));
refused('2手 2手目(席の移し): 決定者の席を別の行へ。記名 別の行(新任の決定者)', change(acc('付け替え', [P(0), ALT], seatsOf(['alt', 0, 0, 0, 0, 0, 0, 0, 0]), ALT.name)), SELF);
accepted(
  '2手 2手目(表記の変更): 本人の行の氏名を変える。記名 別の行(機械には2名の体制のもう1人に見える。残る迂回)',
  change(acc('改名', renamed([P(0), ALT]), Object.fromEntries(SEATS.map((s) => [s, { accountable: '山田 太朗' }])), ALT.name))
);

// X-4: 同じ根(名簿のアカウントが別の人であることを機械が確かめられない)の残る経路。規則は足さず、EV-0243 で開示する
const ALT_ORG = { id: 'org-alt', name: '組織 別名', external: true, appointer: true, accounts: [rosterAccount('acct-org-alt')] };
check('任命権者の経路 準備: 初期化', init().ok);
accepted('任命権者の経路 準備: 1名', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
accepted('任命権者の経路 1手目: 決定者が自分の別のアカウントを組織上の任命権者として置く(記名 本人=決定者)', change(acc('任命権者', [P(0), ALT_ORG], seatsOf(ALL(0)), NAMES[0])));
accepted(
  '任命権者の経路 2手目: その任命権者の記名で本人の行の氏名を変える(自己の決定と出ない。残る経路)',
  change(acc('改名', renamed([P(0), ALT_ORG]), Object.fromEntries(SEATS.map((s) => [s, { accountable: '山田 太朗' }])), ALT_ORG.name))
);
check('任命権者の経路 記録は自己の決定でない(開示されない)', last().selfDecided !== true, JSON.stringify(last()));
check('兼務の経路 準備: 初期化', init().ok);
accepted('兼務の経路 準備: 1名', change(acc('1人目', [P(0)], seatsOf(ALL(0)), NAMES[0])));
accepted('兼務の経路 1手目: 別の行を名簿へ足す(記名 本人=決定者)。兼務が決定待ちになる', change(acc('別の行', [P(0), ALT], seatsOf(ALL(0)), NAMES[0])));
accepted('兼務の経路 2手目: その行の記名で決定待ちの兼務を続ける決定(当事者以外の決定に見える。残る経路)', change(acc('続ける', [P(0), ALT], seatsOf(ALL(0)), ALT.name, { keepSeparations: [SHIP_SEP, 'sep-maintainer-ops'] })));

// 差し替えの禁止(#433 の a-1): 既存の行の氏名とアカウントの両方を変える変更は、記名者に依らず受け付けない。2回に分けても同じ
twoBase('差し替え');
refused('差し替え 2人目の行の氏名とアカウントを両方変える(記名 決定者)', change(acc('差し替え', [P(0), { id: 'p2', name: NAMES[3], accounts: [rosterAccount('acct-9')] }], seatsOf([0, 0, 0, 0, 3, 3, 0, 0, 3]), NAMES[0])), '差し替えることはできません');
accepted('差し替え 1回目: 2人目の行の氏名だけを変える(記名 決定者)', change(acc('氏名', [P(0), { ...P(1), name: NAMES[3] }], seatsOf([0, 0, 0, 0, 3, 3, 0, 0, 3]), NAMES[0])));
refused('差し替え 2回目: 続けてアカウントも変える(足したときの値と両方が異なる。記名 決定者)', change(acc('アカウント', [P(0), { id: 'p2', name: NAMES[3], accounts: [rosterAccount('acct-9')] }], seatsOf([0, 0, 0, 0, 3, 3, 0, 0, 3]), NAMES[0])), '差し替えることはできません');

done();
