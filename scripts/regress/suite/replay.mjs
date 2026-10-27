// 再検証(tmp/reverify-scenarios/)の入力を、そのまま現在の実装へ流す。指摘された場面が直っていることを確かめる。
//   sh tmp/fix2-g3a/fresh.sh r && node tmp/fix2-g3a/replay.mjs
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["r"], "fixes": ["#284", "#285"]}
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, FIXTURES, APPOINTER, BASIS, TODAY } from './lib.mjs';

const W = workspace('r');
const { DIR, run, git, write, read, cfg, gen, contract, checkD0, checkRules, resetTo, commit, d0 } = W;
const { check, refused, accepted, done, fixes } = checker();
// 入力は構成管理の下(fixtures/replay-in。元は E:/Github/process-compass/tmp/reverify-scenarios/in)。24 件を手を加えずに写した
const IN = path.join(FIXTURES, 'replay-in');
const input = (name) => JSON.parse(fs.readFileSync(path.join(IN, `${name}.json`), 'utf8'));
// 第3巡で入力へ足すもの(入力の意図は変えない):
//   - K65: 未来の日付を受け付けない。実行日より後の日付は、実行日へ寄せる
//   - K60: 席の責任者の任免は決定者の記名を要する。記名の無い入力へ、変更前の決定者(山田)の記名を足す
//   - K55: 変更種別の登録の根拠(basis)を足す
const clampDates = (v) =>
  Array.isArray(v)
    ? v.map(clampDates)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clampDates(x)]))
      : typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && v > TODAY
        ? TODAY
        : v;
const third = (c, signer = '山田 太郎') => {
  const out = clampDates(c);
  const appoints = Object.values(out.seats ?? {}).some((x) => x && 'accountable' in x);
  if (appoints && !out.decidedBy) Object.assign(out, { decidedBy: signer, reason: '(第3巡: 任免の記名を足した)' });
  if (out.delegation?.changeTypes) out.delegation.changeTypes = out.delegation.changeTypes.map((t) => ({ basis: BASIS, ...t }));
  return out;
};
const apply = (name, patch = null, dry = false) => {
  const c = third(input(name));
  write('change.json', patch ? patch(c) : c);
  return gen('--change', 'change.json', ...(dry ? ['--dry-run'] : []));
};
const seat = (role) => cfg().seats.find((s) => s.role === role);
const last = () => cfg().changeLog.at(-1);
const edit = (fn) => {
  const c = cfg();
  fn(c);
  write('process.config.json', JSON.stringify(c, null, 2) + '\n');
};
const regen = () => gen('--answers', 'process.config.json');

// ---------------------------------------------------------------- w/s1(1人 + AI)
fixes(["K60", "K62", "K70", "K65"]);
write('answers.json', input('a-solo'));
check('s1: 初期化(a-solo)', gen('--answers', 'answers.json', '--stack', 'node').ok);
check('既存の不具合: 初期化で「較正引き継ぎ 80%」が出ない。下限は導出値の 90', cfg().ci.coverageThreshold === 90);
d0('1.0');
// 第3巡(K60): 1人体制の初回の記入は、本人の記名と理由で受け付ける
refused('s1: s1-acc(1人で全席。記名なし)', apply('s1-acc', ({ decidedBy, reason, ...c }) => c), '任免');
accepted('s1: s1-acc(1人で全席。本人の記名)', apply('s1-acc'));
check('s1: 全検査', contract().ok && checkD0().ok && checkRules().ok, contract().out + checkD0().out);
commit('s1');
git('tag', 's1');

// 14-7: 1人体制の回答を reviewer-yes にし、独立レビュアの席を架空の人へ(手で編集)
edit((c) => {
  c.answers['q-external-reviewer'] = 'reviewer-yes';
  c.people.push({ id: 'x', name: '架空 花子', external: true });
  c.seats.find((s) => s.role === 'independent-reviewer').accountable = '架空 花子';
});
refused('14-7: 手で編集 → 再生成', regen(), '一致しません');
check('14-7: 契約検査が落ちる', !contract().ok && contract().out.includes('書き換えられています'));
resetTo('s1');

// ---------------------------------------------------------------- 中6: 1人 → 2人
// 第3巡(K62): 回答(確認者なし)と席(別の人)の矛盾は拒否する。拒否の文に直し方を出す
const s2b = apply('s2b');
refused('s2b: 席だけを書く(回答は変えない) → 回答と名簿の矛盾として拒否', s2b, '回答を reviewer-yes へ改めます');
resetTo('s1');
accepted('s2c: 回答 reviewer-yes を足す', apply('s2c'), '未達の解消');
commit('s2');
git('tag', 's2');

// 重大3(sx-1): 2名で誰も離脱していないのに reviewer-no へ
// 第3巡(K62): 回答を確認者なしへ改めるなら、独立レビュアの席も戻す(回答と席の矛盾を作らない)
const sx1Seat = (c) => ({ ...c, seats: { 'independent-reviewer': { accountable: '山田 太郎' } } });
const sx1 = apply('sx-1', ({ decidedBy, reason, ...c }) => sx1Seat(c));
refused('sx-1: 記名なしでは通らない(「発生」として通さない)', sx1, '決定した者の記名');
check('sx-1: 構成は変わっていない', git('status', '--porcelain', 'process.config.json').out.trim() === '');
const sx1dry = apply('sx-1', ({ decidedBy, reason, ...c }) => sx1Seat(c), true);
check('sx-1: dry-run は緩める向きとして出す', sx1dry.out.includes('独立レビューを置かない決定である') && !sx1dry.out.includes('[即時反映]'), sx1dry.out);

// 空席(s3c): 席を空欄にして人が抜ける
const s3c = apply('s3c');
// 第4巡(K70): 名簿に確認できる人が残らないため、G-6 は未達へ即時に反映する(「判定できる人がいない」の表示ではなく未達の発生)
accepted('s3c: 席を空欄にして人が抜ける', s3c, '未達の発生: G-6 独立レビュー', '[即時反映]');
resetTo('s2');
// s3b: 離脱。席は山田が引き取る(発生)
// 第3巡(K60): 席を引き取るのは後任の任命(決定)。離脱による G-6 の未達は発生として残る
refused('s3b: 佐藤が離脱し、席を山田が引き取る(記名なし)', apply('s3b', ({ decidedBy, reason, ...c }) => c), '任免');
accepted('s3b: 同(決定者の記名)', apply('s3b'), '未達の発生: G-6 独立レビュー');
check('s3b: 向きは任免の決定。G-6 の未達は発生として残る', last().direction === 'appoint' && last().arising.some((a) => a.includes('G-6')));

// ---------------------------------------------------------------- w/s4(3〜9名)
fixes(["K55", "K60", "K38", "K37", "K42", "ADR-0066"]);
resetTo('s1');
git('checkout', '-q', '-b', 'team', 'HEAD~1');
git('clean', '-qfd');
write('answers.json', input('a-3'));
check('s4: 初期化(a-3)', gen('--answers', 'answers.json', '--stack', 'node').ok, gen('--answers', 'answers.json', '--stack', 'node', '--dry-run').out);
d0('1.0');
// 第3巡(K60): 全席が未記入の3名体制は、名簿(組織上の任命権者を含む)を先に置き、任命権者の記名で席を埋める
accepted('s4: s4-acc3 の名簿', apply('s4-acc3', ({ seats, decidedBy, reason, ...c }) => ({ ...c, people: [...c.people, APPOINTER] })));
accepted('s4: s4-acc3 の席(任命権者の記名)', apply('s4-acc3', (c) => ({ ...c, people: [...c.people, APPOINTER], decidedBy: APPOINTER.name, reason: '組織が任命した' })));
accepted('s4: s4-5(3名 → 5名)', apply('s4-5'));
commit('s4-5');
git('tag', 's4-5');
// 中7: 5 → 15
const s415 = apply('s4-15');
accepted('s4-15: 差分にレビューの方式と出荷判定者の方式が出る', s415, 'reviewMode: internal-separated → internal-plus-core-external', 'approverMode: named-concurrent → dedicated-qa', '分離必須とする');
commit('s4-15');
git('tag', 's4-15');
refused('s4y: 15名で価値責任者 = 技術判断者', apply('s4y'), '兼務禁止に抵触します');
const back5 = apply('s4-back5');
accepted('s4-back5: 15 → 5(離脱)', back5);
check('s4-back5: 差分に方式の変化が出る', back5.out.includes('reviewMode') && back5.out.includes('approverMode'), back5.out);
commit('s4');
git('tag', 's4');
refused('s4x1: 名簿だけ15名(回答は 3〜9名のまま)', apply('s4x1'), '10名の境界');
check('s4: 全検査', contract().ok && checkD0().ok && checkRules().ok, contract().out + checkD0().out);
console.log(`   (s4 の席: ${cfg().seats.map((s) => `${s.role}=${s.accountable}`).join(' ')})`);

// 重大2(s11-4)
refused('s11-4: 3名以上で独立レビュア = 開発者', apply('s11-4'), '兼務禁止に抵触します');
refused('s11-t: 3名以上で出荷判定者 = 開発者(既存の拒否)', apply('s11-t'), '兼務禁止に抵触します');

// 中4(s5-7c): 全域の規則だけを先に登録する
refused('s5-7c: 規則だけを先に登録(全域)', apply('s5-7c'), '全域');
// 中8(s6-6): 適合性確認の実施者が AI の名義
if (fs.existsSync(path.join(IN, 's6-6.json'))) refused('s6-6: 適合性確認の実施者に AI の名義', apply('s6-6'), '適合性確認');

// s5: 開発者の席を委任(変更種別の登録が要る)
refused('s5-3: 変更種別を登録していない規則', apply('s5-3'), '登録されていない');
write('change.json', { kind: 'mode', date: TODAY, summary: '変更種別を登録し、確約範囲・コア指定なしと宣言する', delegation: { changeTypes: [{ id: '表示文言', registeredBy: '山田 太郎', registeredAt: TODAY, basis: BASIS }], protectedPaths: [] }, decidedBy: '山田 太郎', reason: '確約した範囲とコア指定は無い' });
accepted('変更種別の登録と、確約範囲・コア指定の宣言(事業決裁者の席の責任者の記名)', gen('--change', 'change.json'));
const s53 = apply('s5-3');
console.log(`   (s5-3 + 登録: ${s53.ok ? '反映' : '拒否'} ${s53.out.split('\n').filter((l) => /エラー|^  - |承認待ち/.test(l)).join(' | ').slice(0, 400)})`);
// 中10(s5-4a): 承認だけを書いた変化点
if (s53.ok) {
  const a = apply('s5-4a');
  check('s5-4a: 承認が入った変化点で、保持していた宣言(s5-3)が有効になる。再宣言を要求しない', a.ok && a.out.includes('[委任を有効化]') && seat('dev-verifier').mode === 'delegated', a.out);
  check('s5-4a: samePersonAsDecider は真(規則の決定者も承認者も佐藤)。宣言した時点の決定者が記録に残る', last().ruleApproval?.samePersonAsDecider === true && last().decidedBy === '佐藤 花子', JSON.stringify(last().ruleApproval));
  commit('s5');
  git('tag', 's5');
  if (seat('dev-verifier').mode === 'delegated') {
    // 中4(s5-7a): 既存の規則を全域へ
    refused('s5-7a: 既存の規則の範囲を全域へ(席の指定なし)', apply('s5-7a'), '全域');
    // 中9(s7-4 / s7-4b)
    const a74 = apply('s7-4');
    accepted('s7-4: 版の変更 + 再確認(記名なし)', a74, '委任 → 協働');
    check('s7-4: 委任は維持されない', seat('dev-verifier').mode === 'collab');
    resetTo('s5');
    const b74 = apply('s7-4b');
    accepted('s7-4b: 旧い確認記録の使い回し', b74, '[無効]');
    check('s7-4b: 協働へ下がり、確認の記録は残らない', seat('dev-verifier').mode === 'collab' && seat('dev-verifier').qualification === null);
    resetTo('s5');
  }
}

// 重大1(14-3 / 14-4 / 14-8)
resetTo('s4');
edit((c) => {
  const s = c.seats.find((x) => x.role === 'dev-verifier');
  s.mode = 'delegated';
  s.performer = { model: 'm', instructions: 'i', permissions: 'p' };
  s.fallback = 'human';
  s.qualification = { confirmedAt: '2026-10-01', performedBy: '佐藤 花子', approvedBy: '佐藤 花子', cases: 'x', result: 'x', performer: s.performer };
  c.delegation.rules = [{ id: 'DR-1', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/**'], decidedBy: '佐藤 花子', reason: 'x', approvedBy: '佐藤 花子' }];
});
refused('14-3: 手で委任を一式書き込む → 再生成', regen(), '一致しません');
check('14-3: 契約検査が落ちる', !contract().ok && contract().out.includes('書き換えられています'), contract().out);
resetTo('s4');
edit((c) => {
  c.answers['q-biz-phase'] = 'poc';
});
refused('14-4: answers を手で PoC へ → 再生成', regen(), '一致しません');
check('14-4: 書き換えた直後の契約検査が落ちる', !contract().ok && contract().out.includes('書き換えられています'));
resetTo('s4');
edit((c) => {
  c.changeLog = c.changeLog.slice(0, 1);
});
check('14-8: changeLog を先頭1件へ切り詰める → 契約検査が落ちる', !contract().ok, contract().out);
resetTo('s4');
// 検出されていた経路を壊していないこと
write('other.json', { ...input('a-3'), 'q-biz-phase': 'poc' });
refused('14-5: 別の回答ファイルでの再生成(既存の検出)', gen('--answers', 'other.json'), '回答が異なります');
write('CLAUDE.md', read('CLAUDE.md').replace('- 有効なゲート: ', '- 有効なゲート(書き換えた): '));
check('14-9: CLAUDE.md の生成区間の書き換え(既存の検出)', !checkRules().ok);
resetTo('s4');
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: 9.9'));
check('14-10: D-0 だけの改訂(既存の検出)', !checkD0().ok && checkD0().out.includes('一致しません'));
resetTo('s4');

// 中11(sx-5): D-0 を改訂せずに変化点を適用する
const v = read('docs/D-0-governance.md').match(/^version:\s*(.+)$/m)[1];
const sx5 = apply('sx-5');
console.log(`   (sx-5: ${sx5.ok ? '反映' : '拒否'} 版 ${v} → ${read('docs/D-0-governance.md').match(/^version:\s*(.+)$/m)[1]})`);
check('sx-5: 適用後も D-0 の検査が通る(生成区間と版が追随する)', !sx5.ok || (checkD0().ok && contract().ok), checkD0().out);

// 入力値(X-4)
write('change.json', { kind: 'axis', answers: { 'q-team-size': 'size-100' } });
refused('X-4: 回答値 size-100(dry-run)', gen('--change', 'change.json', '--dry-run'), '不正です');
write('change.json', { kind: 'mode', seats: { 'dev-verifier': { mode: 'autonomous' } } });
refused('X-4: 運用形態 autonomous(dry-run)', gen('--change', 'change.json', '--dry-run'), '不正です');
// 名義(6-2)
for (const [name, ok] of [['クロード', false], ['Ａｇｅｎｔ 太郎', false], ['Сlaude', true], ['自動レビュー担当', true]]) {
  write('change.json', { kind: 'accountable', people: [...cfg().people, { id: 'zz', name }] });
  const r = gen('--change', 'change.json', '--dry-run');
  check(`名義 "${name}" は${ok ? '通る(機械で閉じない限界。開示する)' : '拒否される'}`, ok ? r.ok : !r.ok && r.out.includes('名簿'), r.out);
}
done();
