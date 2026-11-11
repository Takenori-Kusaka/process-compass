// #376: 任免と緩める向きの行を1つの変化点に含むとき、記名者はすべての行の要件を満たす1人に限る(ADR-0110 決定2)。
// 満たす者がいない (a)(b) の組を分けずに出すと拒否され、拒否の理由に分け方の案内が出ること、分けると通ることを固定する。
// 変化点の記録に差分の行ごとの種類(rowKinds)が残ること(決定3)と、要約の向きが緩めるであること(決定1)も見る。
// 入力は #376 の実行による確認(research/376-deliberation/survey-376-3-probe.md の S2・S3・追加1)と同じ。
//   node scripts/regress/run.mjs --only mixed-change-point
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["mx376"], "fixes": ["#376"]}
import { workspace, checker, NAMES, SEATS, APPOINTER, TODAY, rosterAccount } from './lib.mjs';

const { check, refused, accepted, fixes, done } = checker();
fixes(['ADR-0110 決定2', '標準 3.13.3']);

const W = workspace('mx376');
const { git, write, cfg, gen, change } = W;
const reset = () => {
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd');
};
const P = (i) => ({ id: `p${i + 1}`, name: NAMES[i], accounts: [rosterAccount(`acct-${i + 1}`)] });
/** 席の並び(SEATS)ごとの人の添字。null は空ける */
const seatsOf = (arr) => Object.fromEntries(SEATS.map((s, i) => [s, { accountable: arr[i] === null ? null : NAMES[arr[i]] }]));
const ALL = (i) => SEATS.map(() => i);
const init = () => {
  reset();
  write('answers.json', { 'q-team-size': 'size-1-2', 'q-biz-phase': 'mvp', 'q-quality': 'quality-standard', 'q-criticality': 'cl0', 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free', 'q-external-reviewer': 'reviewer-yes' });
  const r = gen('--answers', 'answers.json', '--stack', 'node');
  W.d0('1.0');
  return r;
};
/** 案内の語(拒否の理由の1件の中で照合する) */
const HINT = ['すべての行(任免・緩める・名簿の表記の変更)の要件を満たす記名者が、名簿にいません', 'その行を決定できる者(決定者を替えた場合は新しい決定者)が記名して決めます'];
const last = () => cfg().changeLog.at(-1);
const kindOf = (e, re) => e.rowKinds?.[e.diff.findIndex((l) => re.test(l))];

// ---------------------------------------------------------------- (b) 決定者の交代 + 緩める向きの行(2名 mvp cl0)
// 前任の決定者(1人目)が AI維持管理者の席に残らないため、どちらの記名でも全行の要件を満たせない
const B_MIXED = { kind: 'accountable', date: TODAY, summary: '決定者の交代と確認者', people: [P(0), P(1)], seats: seatsOf([1, 0, 0, 0, 1, 0, 0, 1, 1]), reason: '決定者を交代する' };
for (const [who, signer] of [['前任の決定者', NAMES[0]], ['新任の決定者', NAMES[1]]]) {
  check(`(b) 準備: 初期化(記名 ${who})`, init().ok);
  accepted(`(b) 準備: 1人目が全席(初回の記入。記名 ${who})`, change({ kind: 'accountable', date: TODAY, summary: '1人目', people: [P(0)], seats: seatsOf(ALL(0)), decidedBy: NAMES[0], reason: '初期の設定' }));
  refused(`(b) 決定者の交代と、確認者・AI維持管理者の任命(代償措置の終了を生む)を1つの変化点に。記名 ${who}`, change({ ...B_MIXED, decidedBy: signer }), ...HINT);
}
// 分ける: (i) 決定者の交代だけ(前任の記名)→ (ii) 残りの任免と緩める向きの行(新しい決定者の記名)
check('(b) 分ける 準備: 初期化', init().ok);
accepted('(b) 分ける 準備: 1人目が全席(初回の記入)', change({ kind: 'accountable', date: TODAY, summary: '1人目', people: [P(0)], seats: seatsOf(ALL(0)), decidedBy: NAMES[0], reason: '初期の設定' }));
accepted('(b) 分ける1: 決定者の交代だけ(記名 前任の決定者)', change({ kind: 'accountable', date: TODAY, summary: '決定者の交代', people: [P(0), P(1)], seats: seatsOf([1, 0, 0, 0, 0, 0, 0, 0, 0]), decidedBy: NAMES[0], reason: '決定者を交代する' }));
const b1 = last();
check('(b) 分ける1: 向きは任免の決定。緩める向きの行は無い', b1.direction === 'appoint' && Array.isArray(b1.rowKinds) && !b1.rowKinds.includes('loosen'), JSON.stringify({ direction: b1.direction, diff: b1.diff, rowKinds: b1.rowKinds }));
// #432(ADR-0122 決定1): 新しい決定者(2人目)が AI維持管理者と AI運用担当者の両方に就くと決定者が当事者の兼務になり、本人の記名では通らない。AI運用担当者は1人目に残す
accepted('(b) 分ける2: 確認者・AI維持管理者の任命(記名 新しい決定者)', change({ kind: 'accountable', date: TODAY, summary: '確認者', people: [P(0), P(1)], seats: seatsOf([1, 0, 0, 0, 1, 0, 0, 1, 0]), decidedBy: NAMES[1], reason: '確認者を置く' }), { changed: [{ by: 'ADR-0122 決定1・決定3', on: '2026-11-11', from: 'AI運用担当者も2人目へ([1, 0, 0, 0, 1, 0, 0, 1, 1])' }] });
const b2 = last();
check(
  '(b) 分ける2: 向きは緩める。行ごとの種類に任免(独立レビュア)と緩める(代償措置の終了)が残り、下限は 80',
  b2.direction === 'loosen' && b2.rowKinds?.length === b2.diff.length && kindOf(b2, /^独立レビュア.*: 責任者 /) === 'appoint' && kindOf(b2, /^カバレッジの下限: 90% → 80%/) === 'loosen' && cfg().ci.coverageThreshold === 80,
  JSON.stringify({ direction: b2.direction, diff: b2.diff, rowKinds: b2.rowKinds }),
  { fixes: ['ADR-0110 決定1', 'ADR-0110 決定3', '標準 3.13.4'] }
);

// ---------------------------------------------------------------- (a) 任命権者の記名 + 緩める向きの行(2名 mvp cl0。前任の決定者は離脱済み)
const aSetup = (tag) => {
  check(`(a) 準備: 初期化(${tag})`, init().ok);
  // #432(ADR-0122 決定1): 2名の名簿で全席を1人目(決定者)に置くと決定者が当事者の兼務になり、1人目の記名では通らない。1人目と任命権者で記入する
  accepted(`(a) 準備: 名簿 [1人目, 任命権者] で1人目が全席(${tag})`, change({ kind: 'accountable', date: TODAY, summary: '体制を記入', people: [P(0), APPOINTER], seats: seatsOf(ALL(0)), decidedBy: NAMES[0], reason: '初期の体制を記入する' }));
  accepted(`(a) 準備: 1人目の離脱(記名なし。${tag})`, change({ kind: 'accountable', date: TODAY, summary: '1人目が離脱', people: [P(1), APPOINTER], seats: seatsOf(SEATS.map(() => null)) }));
};
aSetup('1つの変化点');
// 出荷判定者も3人目へ置き、緩める向きの行を代償措置の終了の1行に絞る(兼務の行の扱いは #432)
refused(
  '(a) 任命権者の記名で、2人目を決定者ほかへ、3人目を独立レビュア・出荷判定者・AI運用担当者へ(代償措置の終了を生む)を1つの変化点に',
  change({ kind: 'accountable', date: TODAY, summary: '後任の任命と確認者', people: [P(1), P(2), APPOINTER], seats: seatsOf([1, 1, 1, 1, 2, 2, 1, 1, 2]), decidedBy: APPOINTER.name, reason: '前任の離脱に伴う後任の任命' }),
  ...HINT
);
aSetup('分ける');
accepted('(a) 分ける1: 任命権者の記名で2人目を全席へ(緩める向きの行なし)', change({ kind: 'accountable', date: TODAY, summary: '後任の任命', people: [P(1), APPOINTER], seats: seatsOf(ALL(1)), decidedBy: APPOINTER.name, reason: '前任の離脱に伴う後任の任命' }));
const a1 = last();
check('(a) 分ける1: 向きは任免の決定。任命権者の記名として残る', a1.direction === 'appoint' && a1.appointerSigned === true, JSON.stringify({ direction: a1.direction, appointerSigned: a1.appointerSigned }));
accepted('(a) 分ける2: 新しい決定者(2人目)の記名で3人目を独立レビュア・AI運用担当者へ(代償措置の終了を含む)', change({ kind: 'accountable', date: TODAY, summary: '確認者の任命', people: [P(1), P(2), APPOINTER], seats: seatsOf([1, 1, 1, 1, 2, 1, 1, 1, 2]), decidedBy: NAMES[1], reason: '確認者を置く' }));
const a2 = last();
check(
  '(a) 分ける2: 向きは緩める。代償措置の終了は未達を解く変化点の差分に出て、その変化点の記名で決まる(ADR-0088 決定5)',
  a2.direction === 'loosen' && kindOf(a2, /^カバレッジの下限: 90% → 80%/) === 'loosen' && cfg().ci.coverageThreshold === 80 && a2.decidedBy === NAMES[1],
  JSON.stringify({ direction: a2.direction, diff: a2.diff, rowKinds: a2.rowKinds }),
  { fixes: ['ADR-0088 決定5'] }
);
done();
