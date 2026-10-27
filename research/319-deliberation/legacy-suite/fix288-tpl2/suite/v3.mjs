// 第3巡の検証(tmp/verify3-scenarios)の指摘を、同じ意図の入力で確かめる(K50・K51・K55・K60・K61・K62・K64・K65)。
//   sh tmp/fix3-h3a/fresh.sh v && node tmp/fix3-h3a/v3.mjs
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, BASE, APPOINTER, fill, BASIS, TODAY } from './lib.mjs';

const W = workspace('v');
const { DIR, run, git, write, read, cfg, gen, change, contract, checkD0, checkRules, resetTo, commit, d0, d0Version } = W;
const { check, refused, accepted, done } = checker();
const last = () => cfg().changeLog.at(-1);
const seat = (role) => cfg().seats.find((s) => s.role === role);

const PDEV = { model: 'claude-fable-5-1', instructions: 'CLAUDE.md v1', permissions: 'dev-token' };
const PEOPLE = [
  { id: 'a', name: '山田 太郎' },
  { id: 'b', name: '佐藤 花子' },
  { id: 'c', name: '鈴木 一郎' },
  { id: 'd', name: '高橋 次郎' },
  { id: 'e', name: '田中 三郎' },
  APPOINTER,
];
// s4: 山田=事業決裁・価値・文脈・AI運用、佐藤=技術・開発・AI維持管理、鈴木=独立レビュア・出荷判定
const SEATS = {
  'biz-approver': { accountable: 'a' },
  'value-owner': { accountable: 'a' },
  'context-owner': { accountable: 'a' },
  'ai-ops': { accountable: 'a' },
  'tech-lead': { accountable: 'b' },
  'dev-verifier': { accountable: 'b' },
  'ai-maintainer': { accountable: 'b' },
  'independent-reviewer': { accountable: 'c' },
  'qa-gatekeeper': { accountable: 'c' },
};
const RULE = { id: 'DR-001', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/i18n/**'], excludePaths: [], decidedBy: '佐藤 花子', decidedAt: '2026-10-01', reason: '既存のテストで検出でき、取り消しの実績がある' };
const QUAL = { confirmedAt: '2026-09-20', performedBy: '佐藤 花子', approvedBy: '佐藤 花子', cases: 'docs/qualification/dev.md', result: '20 件中 19 件を再現', performer: PDEV };
const DAY = TODAY;

// ------------------------------------------------------------------ 土台 s4
write('answers.json', { ...BASE, 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp' });
check('初期化', gen('--answers', 'answers.json', '--stack', 'node').ok);
check('K65 初期化の記録の date は日付だけ(時刻は at)', /^\d{4}-\d{2}-\d{2}$/.test(cfg().changeLog[0].date) && /T/.test(cfg().changeLog[0].at), JSON.stringify(cfg().changeLog[0].date));
refused('K65 D-0 が無いまま変化点を適用しない', change({ kind: 'accountable', date: DAY, summary: '名簿', people: PEOPLE }), 'D-0 体制図(docs/D-0-governance.md)がありません');
d0('1.0');
// 全席が未記入の体制で、任命権者の記名なしに席を埋める
commit('chore: D-0');
git('tag', 'blank');
// 4名体制の初回の記入(H3b の報告の場面): 初期化の直後、全席が未記入の状態から、名簿と全席を1回の変化点で記入する
const P4 = PEOPLE.slice(0, 4);
const S4 = { ...SEATS, 'independent-reviewer': { accountable: 'c' }, 'qa-gatekeeper': { accountable: 'd' } };
refused('K60 4名の初回の記入(記名なし)', change({ kind: 'accountable', date: DAY, summary: '4名', people: P4, seats: S4 }), '任免', '記名');
refused('K60 4名の初回の記入(決定者の席に記入しない人=佐藤の記名)', change({ kind: 'accountable', date: DAY, summary: '4名', people: P4, seats: S4, decidedBy: '佐藤 花子', reason: 'r' }), '初回の記入は、この変化点で D-0 表1「体制と運用形態」の決定者の席に記入する人の記名');
const first4 = change({ kind: 'accountable', date: DAY, summary: '4名', people: P4, seats: S4, decidedBy: '山田 太郎', reason: '初期の体制を記入する' });
accepted('K60 4名の初回の記入(事業決裁者の席に記入する山田の記名と理由。1回の変化点)', first4, '任免');
check('K60 4名: 記録は1件、向きは任免の決定、決定者は山田', cfg().changeLog.length === 2 && last().direction === 'appoint' && last().decidedBy === '山田 太郎', JSON.stringify(cfg().changeLog.map((e) => [e.kind, e.direction, e.decidedBy])));
check('K60 4名: 全検査', contract().ok && checkD0().ok && checkRules().ok, contract().out + checkD0().out);
accepted('K60 初回の後の席の変更は、変更前の決定者(山田)の記名で通る', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'tech-lead': { accountable: 'd' } }, decidedBy: '山田 太郎', reason: 'r' }));
refused('同(新任に替えた席の人の記名は不可)', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'tech-lead': { accountable: 'c' } }, decidedBy: '鈴木 一郎', reason: 'r' }), '変更前の D-0 表1');
// 全員が離脱して全席が空いた状態は、初回の記入に当たらない(任命権者の記名に限る)
resetTo('blank');
// 以下の土台(s4)は、任命権者の経路で作る(任命権者の記名の場面を確かめるため)
check('名簿を置く(席の記入なし。記名は要らない)', change({ kind: 'accountable', date: DAY, summary: '名簿', people: PEOPLE }).ok);
refused('K60 全席未記入から、記名なしで席を埋める', change({ kind: 'accountable', date: DAY, summary: '席', seats: SEATS }), '任免', '記名');
accepted('K60 組織上の任命権者の記名で席を埋める', change({ kind: 'accountable', date: DAY, summary: '席', seats: SEATS, decidedBy: APPOINTER.name, reason: '組織が任命した' }), '任免');
check('K60 記録: 向き appoint・決定者・任命権者の印', last().direction === 'appoint' && last().decidedBy === APPOINTER.name && last().appointerSigned === true, JSON.stringify(last()));
check('K60 D-0 の改訂履歴に「組織上の任命権者の記名で行った」', read('docs/D-0-governance.md').includes('組織上の任命権者の記名で行った'));
// #288 第5巡 J: 承認者は D-0 の承認権限者(表1「体制と運用形態」の決定者=事業決裁者の席の責任者)に固定し、変化点の決定者は last_change_decided_by へ(旧: approver に決定者の氏名)
{
  const bizAcc = seat('biz-approver')?.accountable;
  const bizName = (cfg().people.find((p) => p.id === bizAcc || p.name === bizAcc) ?? {}).name ?? bizAcc;
  const d0t = read('docs/D-0-governance.md');
  check('K65/J D-0 の承認者は承認権限者(事業決裁者の席の責任者)、承認日は変化点の日付、最後の変化点の決定者は任命権者', new RegExp(`^approver: ${bizName}$`, 'm').test(d0t) && new RegExp(`^approved_at: ${DAY}$`, 'm').test(d0t) && /^last_change_decided_by: 組織 任命者$/m.test(d0t), d0t.slice(0, 300));
}
check('契約検査', contract().ok, contract().out);
check('D-0 の検査', checkD0().ok, checkD0().out);
check('CLAUDE.md の検査', checkRules().ok, checkRules().out);
check('K65 CLAUDE.md に「不可逆4操作」が残っていない', !read('CLAUDE.md').includes('不可逆4操作') && read('CLAUDE.md').includes('取り消せない時間帯'));
commit('chore: s4');
git('tag', 's4');

// ------------------------------------------------------------------ 重大1: 任免の記名(tx-1・tx-2・tx-4)
refused('tx-1 事業決裁者を田中へ(記名なし)', change({ kind: 'accountable', date: DAY, summary: '事業決裁者を田中へ', seats: { 'biz-approver': { accountable: '田中 三郎' } } }), '任免', '変更前の D-0 表1');
refused('tx-1b 同(田中本人の記名)', change({ kind: 'accountable', date: DAY, summary: '事業決裁者を田中へ', seats: { 'biz-approver': { accountable: '田中 三郎' } }, decidedBy: '田中 三郎', reason: 'r' }), '自分の任命を自分の記名で確定することはできません');
refused('tx-2 田中の記名で PoC へ戻す(任命は通っていない)', change({ kind: 'axis', date: DAY, summary: 'PoC へ', answers: { 'q-biz-phase': 'poc' }, decidedBy: '田中 三郎', reason: 'x', sgRecord: 'README.md' }), '決定できるのは');
refused('tx-4 独立レビュアと出荷判定者を田中へ(記名なし)', change({ kind: 'accountable', date: DAY, summary: '交代', seats: { 'independent-reviewer': { accountable: '田中 三郎' }, 'qa-gatekeeper': { accountable: '田中 三郎' } } }), '任免');
const tx4 = change({ kind: 'accountable', date: DAY, summary: '交代', seats: { 'independent-reviewer': { accountable: '田中 三郎' }, 'qa-gatekeeper': { accountable: '田中 三郎' } }, decidedBy: '山田 太郎', reason: '鈴木を別案件へ' });
accepted('tx-4 同(前任の決定者の記名)', tx4, '任免');
check('K51 出荷判定者の交代は即時通知の対象。前任者(鈴木)へも通知する', last().notice?.reasons?.includes('出荷判定者の席の責任者の交代') && last().notice.also?.some((x) => x.to === '鈴木 一郎' && x.role === 'predecessor'), JSON.stringify(last().notice));
check('K65 差分と通知は氏名で出る(名簿の id を出さない)', /責任者 鈴木 一郎 → 田中 三郎/.test(tx4.out) && !/責任者 c → e/.test(tx4.out), tx4.out);
accepted('通知を記録(to は新任の出荷判定者)', change({ kind: 'notice', summary: '通知', noticeFor: cfg().changeLog.length - 1, notice: { to: '田中 三郎', at: DAY } }));
check('D-0 の改訂履歴に前任者への通知が出る', read('docs/D-0-governance.md').includes('鈴木 一郎(前任者)'));
check('契約検査(tx-4 の後)', contract().ok, contract().out);
resetTo('s4');
const tx1 = change({ kind: 'accountable', date: DAY, summary: '事業決裁者を田中へ', seats: { 'biz-approver': { accountable: '田中 三郎' } }, decidedBy: '山田 太郎', reason: '事業部の再編' });
accepted('tx-1c 前任の決定者(山田)の記名で事業決裁者を田中へ', tx1, '任免');
accepted('以後、田中は決定者として緩める向きを決定できる', change({ kind: 'settings', date: DAY, summary: 'カバレッジ', settings: { ci: { coverageThreshold: 70 } }, decidedBy: '田中 三郎', reason: '較正' }));
resetTo('s4');
// 決定者が離脱した後の任命: 任命権者の記名に限る。同じ変化点で足した任命権者は記名できない
accepted('事業決裁者(山田)が離脱(席は空く。記名なし)', change({ kind: 'accountable', date: DAY, summary: '山田が離脱', people: PEOPLE.filter((p) => p.id !== 'a'), seats: { 'biz-approver': { accountable: null }, 'value-owner': { accountable: null }, 'context-owner': { accountable: null }, 'ai-ops': { accountable: null } } }), '席が空く');
refused('決定者の席が空いた後、新任者の記名で自分を任命', change({ kind: 'accountable', date: DAY, summary: '田中を事業決裁者へ', seats: { 'biz-approver': { accountable: '田中 三郎' } }, decidedBy: '田中 三郎', reason: 'r' }), '組織上の任命権者');
accepted('任命権者の記名で任命', change({ kind: 'accountable', date: DAY, summary: '田中を事業決裁者へ', seats: { 'biz-approver': { accountable: '田中 三郎' }, 'value-owner': { accountable: '田中 三郎' }, 'context-owner': { accountable: '田中 三郎' }, 'ai-ops': { accountable: '田中 三郎' } }, decidedBy: APPOINTER.name, reason: '事業部長が任命' }));
check('任命権者の記名の印', last().appointerSigned === true);
resetTo('s4');
refused('任命権者を席の責任者にしない', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'tech-lead': { accountable: APPOINTER.name } }, decidedBy: '山田 太郎', reason: 'r' }), '任命権者を席の責任者にしない');
refused('決定者が残っている間、任命権者を名簿へ足すのは決定者の記名を要する', change({ kind: 'accountable', date: DAY, summary: 'x', people: [...PEOPLE, { id: 'o2', name: '別部 長', external: true, appointer: true }] }), '組織上の任命権者として置く');

// ------------------------------------------------------------------ K50 出荷判定者 × 事業決裁者
refused('K50 3名以上で出荷判定者を事業決裁者(山田)へ', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'qa-gatekeeper': { accountable: '山田 太郎' } }, decidedBy: '山田 太郎', reason: 'r' }), '兼務禁止に抵触します', '品質保証(出荷判定者) × 事業決裁者');

// ------------------------------------------------------------------ 土台 s5(開発者の席を委任)
const TYPES = [{ id: '表示文言', registeredBy: '山田 太郎', registeredAt: DAY, basis: BASIS }];
refused('K55 登録の根拠(basis)の無い変更種別', change({ kind: 'mode', date: DAY, summary: '種別', delegation: { changeTypes: [{ id: '表示文言', registeredBy: '山田 太郎', registeredAt: DAY }], protectedPaths: ['src/core/**'] }, decidedBy: '山田 太郎', reason: 'r' }), '登録の根拠(basis)がない', 'detection');
refused('K55 basis の一部が空', change({ kind: 'mode', date: DAY, summary: '種別', delegation: { changeTypes: [{ id: '表示文言', registeredBy: '山田 太郎', registeredAt: DAY, basis: { ...BASIS, rollback: ' ' } }], protectedPaths: ['src/core/**'] }, decidedBy: '山田 太郎', reason: 'r' }), 'rollback');
refused('K65 登録日が暦に無い(2026-02-31)', change({ kind: 'mode', date: DAY, summary: '種別', delegation: { changeTypes: [{ ...TYPES[0], registeredAt: '2026-02-31' }] }, decidedBy: '山田 太郎', reason: 'r' }), '実在する日付');
const reg = change({ kind: 'mode', date: DAY, summary: '種別と確約範囲', delegation: { changeTypes: TYPES, protectedPaths: ['src/core/**'] }, decidedBy: '山田 太郎', reason: '確約範囲はコア' });
accepted('K55 basis つきで登録(B-4 の既定。案内が出る)', reg, 'B-4 の構成員かどうかは確かめません', 'catalogRegistrar');
accepted(
  '開発者の席を委任(佐藤)',
  change({ kind: 'mode', date: DAY, summary: '委任', seats: { 'dev-verifier': { mode: 'delegated', performer: PDEV, fallback: 'human', qualification: QUAL } }, delegation: { rules: [RULE] }, decidedBy: '佐藤 花子', reason: '文言', ruleApprovedBy: '佐藤 花子' })
);
check('s5: 開発者の席は委任', seat('dev-verifier').mode === 'delegated', JSON.stringify(seat('dev-verifier')));
check('契約検査(s5)', contract().ok, contract().out);
check('D-0 の検査(s5)', checkD0().ok, checkD0().out);
commit('chore: s5');
git('tag', 's5');

// ------------------------------------------------------------------ 中2: AI維持管理者の交代(t7b-4 → t7b-6)
accepted('t7b-4 AI維持管理者を田中へ(前任の決定者の記名)', change({ kind: 'accountable', date: DAY, summary: 'AI維持管理者を田中へ', seats: { 'ai-maintainer': { accountable: 'e' } }, decidedBy: '山田 太郎', reason: '佐藤の負荷' }), '承認待ちへ戻る');
check('K61 規則は承認待ち(前任の承認を記録として残す)', cfg().delegation.rules[0].approvedBy === null && cfg().delegation.rules[0].lapsedApproval?.approvedBy === '佐藤 花子', JSON.stringify(cfg().delegation.rules[0]));
check('K61 席は協働。委任の宣言を保持', seat('dev-verifier').mode === 'collab' && seat('dev-verifier').intent?.heldFor === 'approval-returned', JSON.stringify(seat('dev-verifier')));
check('契約検査(承認待ち)', contract().ok, contract().out);
const t7b6 = change({ kind: 'mode', date: DAY, summary: '新しい AI維持管理者が規則を承認し直す', ruleApprovedBy: '田中 三郎' });
accepted('t7b-6 新任の AI維持管理者が ruleApprovedBy だけで承認し直す(規則を消さない)', t7b6, '[委任を有効化]');
check('K61 委任へ戻る。向き loosen、決定者は宣言時の者(佐藤)', seat('dev-verifier').mode === 'delegated' && last().direction === 'loosen' && last().decidedBy === '佐藤 花子' && cfg().delegation.rules[0].approvedBy === '田中 三郎', JSON.stringify(last()));
check('契約検査(承認し直し)', contract().ok, contract().out);
check('D-0 の検査(承認し直し)', checkD0().ok, checkD0().out);
resetTo('s5');
accepted('交代と承認し直しを1つの入力で(t7c 相当)', change({ kind: 'accountable', date: DAY, summary: 'AI維持管理者を田中へ', seats: { 'ai-maintainer': { accountable: 'e' } }, decidedBy: '山田 太郎', reason: '佐藤の負荷', ruleApprovedBy: '田中 三郎' }));
check('同: 委任のまま', seat('dev-verifier').mode === 'delegated' && cfg().delegation.rules[0].approvedBy === '田中 三郎', JSON.stringify(seat('dev-verifier')));
resetTo('s5');

// ------------------------------------------------------------------ 中3・中4: 開発者の席の責任者の交代と引き継ぎ(t7b-3 / t7b-2 / t7e)
refused('t7b-3 佐藤が離脱し、同じ入力で後任を置く(記名なし)', change({ kind: 'accountable', date: DAY, summary: '佐藤が離脱し後任', people: PEOPLE.filter((p) => p.id !== 'b'), seats: { 'dev-verifier': { accountable: 'd' }, 'tech-lead': { accountable: 'd' }, 'ai-maintainer': { accountable: 'e' } } }), '任免', '離脱(席を空ける)だけなら、記名なしで反映できます');
accepted('t7b-3a 離脱だけ(記名なし)', change({ kind: 'accountable', date: DAY, summary: '佐藤が離脱', people: PEOPLE.filter((p) => p.id !== 'b'), seats: { 'dev-verifier': { accountable: null }, 'tech-lead': { accountable: null }, 'ai-maintainer': { accountable: null } } }), '席が空く');
accepted('t7b-3b 後任を任命(決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '後任', seats: { 'dev-verifier': { accountable: 'd' }, 'tech-lead': { accountable: 'd' }, 'ai-maintainer': { accountable: 'e' } }, decidedBy: '山田 太郎', reason: '後任' }));
const skillOld = change({ kind: 'mode', date: DAY, summary: '旧い例', seats: { 'dev-verifier': { mode: 'delegated', qualification: { approvedBy: '高橋 次郎' } } }, decidedBy: '高橋 次郎', reason: 'r' });
refused('t7b-2 旧い例(承認し直しだけ)は、規則の記名が前任のまま → 拒否文に takeover の案内', skillOld, 'takeover');
const take = change({ kind: 'mode', date: DAY, summary: '高橋が開発者の席の委任を引き継ぐ', takeover: 'dev-verifier', decidedBy: '高橋 次郎', reason: '記録と規則を確かめた', ruleApprovedBy: '田中 三郎' });
accepted('K61 引き継ぎを1つの入力で(takeover + 新任の AI維持管理者の承認)', take);
check('K61 規則の記名が高橋へ、前任の記名を残す。承認は田中', cfg().delegation.rules[0].decidedBy === '高橋 次郎' && cfg().delegation.rules[0].priorDecision?.decidedBy === '佐藤 花子' && cfg().delegation.rules[0].approvedBy === '田中 三郎', JSON.stringify(cfg().delegation.rules[0]));
check('K61 実施者(佐藤)が名簿に無くても、適合性確認の記録は有効。承認者は高橋', seat('dev-verifier').qualification.performedBy === '佐藤 花子' && seat('dev-verifier').qualification.approvedBy === '高橋 次郎' && seat('dev-verifier').mode === 'delegated', JSON.stringify(seat('dev-verifier')));
check('契約検査(引き継ぎ後)', contract().ok, contract().out);
check('D-0 の検査(引き継ぎ後)', checkD0().ok, checkD0().out);
refused('takeover の記名が席の責任者でない', change({ kind: 'mode', date: DAY, summary: 'x', takeover: 'dev-verifier', decidedBy: '山田 太郎', reason: 'r' }), '引き継ぎを記名できるのは');
resetTo('s5');

// ------------------------------------------------------------------ 軽: 範囲を広げたとき(t5-5b)
const widen = change({ kind: 'mode', date: DAY, summary: '範囲を広げる', delegation: { rules: [{ ...RULE, paths: ['src/i18n/**', 'src/ui/**'] }] }, decidedBy: '佐藤 花子', reason: 'UI の文言も' });
accepted('t5-5b 範囲を広げる(承認なし)', widen, '[拡大は承認待ち]');
check('K61 承認済みの範囲は有効なまま。席は委任のまま。広げた部分は pendingChange', seat('dev-verifier').mode === 'delegated' && JSON.stringify(cfg().delegation.rules[0].paths) === '["src/i18n/**"]' && cfg().delegation.rules[0].approvedBy === '佐藤 花子' && cfg().delegation.rules[0].pendingChange?.paths?.includes('src/ui/**'), JSON.stringify(cfg().delegation.rules[0]));
check('契約検査(拡大を保持)', contract().ok, contract().out);
check('D-0 の検査(拡大を保持)', checkD0().ok, checkD0().out);
const approveWiden = change({ kind: 'mode', date: DAY, summary: '拡大を承認', ruleApprovedBy: '佐藤 花子' });
accepted('承認で拡大を反映(承認だけの変化点)', approveWiden, '[拡大を反映]');
check('K65 承認だけの変化点で委任が広がる → 向き loosen、決定者は宣言した者', JSON.stringify(cfg().delegation.rules[0].paths) === '["src/i18n/**","src/ui/**"]' && !cfg().delegation.rules[0].pendingChange && last().direction === 'loosen' && last().decidedBy === '佐藤 花子', JSON.stringify(last()));
resetTo('s5');

// ------------------------------------------------------------------ 軽: 規則の警告(t5-13・t5-25)
const t513 = change({ kind: 'mode', date: DAY, summary: '確約範囲と重なる規則', delegation: { rules: [RULE, { ...RULE, id: 'DR-005', paths: ['src/core/i18n/**'] }] }, decidedBy: '佐藤 花子', reason: 'x', ruleApprovedBy: '佐藤 花子' });
accepted('t5-13 確約範囲の内側を指す規則 → 警告', t513, '[警告]', '確約範囲・コア指定のパスに重なります');
resetTo('s5');
const t525 = change({ kind: 'mode', date: DAY, summary: '強制層', delegation: { rules: [RULE, { ...RULE, id: 'DR-9', paths: ['.github/**', 'scripts/gate/**'] }] }, decidedBy: '佐藤 花子', reason: 'x', ruleApprovedBy: '佐藤 花子' });
accepted('t5-25 強制層を指す規則 → 警告', t525, '[警告]', '強制層・構成の正本・判定の記録に当たります');
resetTo('s5');

// ------------------------------------------------------------------ 軽: 条件4 の記名(t7-4-yamada)
const P2 = { ...PDEV, model: 'claude-fable-5-2' };
const t74 = change({ kind: 'performer', date: DAY, summary: '事業決裁者が記名', seats: { 'dev-verifier': { performer: P2, qualification: { ...QUAL, confirmedAt: '2026-10-01', performer: P2 } } }, decidedBy: '山田 太郎', reason: 'x' });
check('t7-4-yamada 条件4 を事業決裁者が記名 → 協働へ下がる', t74.ok && seat('dev-verifier').mode === 'collab' && /この席の責任者でない/.test(t74.out), t74.out);
resetTo('s5');
refused('t7-4-future 確認日が発効日より後', change({ kind: 'performer', date: DAY, summary: 'x', seats: { 'dev-verifier': { performer: P2, qualification: { ...QUAL, confirmedAt: '2026-12-01', performer: P2 } } }, decidedBy: '佐藤 花子', reason: 'x' }), '発効日');

// ------------------------------------------------------------------ 軽: 日付(td-2〜5)
refused('td-2 存在しない日付', change({ kind: 'schedule-only', date: '2026-02-31', summary: 'x' }), '暦に実在する日付');
refused('td-3 最後の記録より前の日付', change({ kind: 'schedule-only', date: '1999-01-01', summary: 'x' }), '最後の変化点の記録の日付');
refused('td-4 未来の日付', change({ kind: 'schedule-only', date: '2099-12-31', summary: 'x' }), '未来の日付');
accepted('通知の対象の変化点(運用形態の変更)を通知なしで適用', change({ kind: 'mode', date: DAY, summary: '協働へ', seats: { 'dev-verifier': { mode: 'collab' } } }));
const idx = cfg().changeLog.length - 1;
refused('td-5 通知日が変化点より前', change({ kind: 'notice', summary: 'x', noticeFor: idx, notice: { to: '鈴木 一郎', at: '2020-01-01' } }), '変化点の日付');
refused('td-5b 通知日が未来', change({ kind: 'notice', summary: 'x', noticeFor: idx, notice: { to: '鈴木 一郎', at: '2099-01-01' } }), '未来の日付');
resetTo('s5');

// ------------------------------------------------------------------ 軽: sgRecord(t10-5)
write('docs/gates/SG-2026-10-01.md', '| ゲート | SG |\n');
commit('docs: sg');
accepted('growth へ進める', change({ kind: 'axis', date: DAY, summary: 'growth', answers: { 'q-biz-phase': 'growth' } }));
refused('t10-5 sgRecord が README(docs/gates/ の外)', change({ kind: 'axis', date: DAY, summary: 'MVP へ戻す', answers: { 'q-biz-phase': 'mvp' }, decidedBy: '山田 太郎', reason: 'r', sgRecord: 'README.md' }), 'docs/gates/ 配下');
accepted('sgRecord が docs/gates/ の判定記録', change({ kind: 'axis', date: DAY, summary: 'MVP へ戻す', answers: { 'q-biz-phase': 'mvp' }, decidedBy: '山田 太郎', reason: 'r', sgRecord: 'docs/gates/SG-2026-10-01.md' }));
resetTo('s5');

// ------------------------------------------------------------------ 軽: D-0 の版(s15b)
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: 0.1'));
refused('s15b D-0 の版を手で下げた状態で変化点', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'tech-lead': { accountable: 'd' } }, decidedBy: '山田 太郎', reason: 'r' }), '版を下げる変更は受け付けません');
resetTo('s5');
refused('s15b d0Version で版を下げる', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'tech-lead': { accountable: 'd' } }, decidedBy: '山田 太郎', reason: 'r', d0Version: '0.5' }), '版を下げる');
fs.rmSync(path.join(DIR, 'docs/D-0-governance.md'));
refused('s15b D-0 を消したまま変化点', change({ kind: 'accountable', date: DAY, summary: 'x', seats: { 'tech-lead': { accountable: 'd' } }, decidedBy: '山田 太郎', reason: 'r' }), 'D-0 体制図(docs/D-0-governance.md)がありません');
resetTo('s5');
accepted('厳しくする向きの変化点(決定を要しない)で版が上がる', change({ kind: 'mode', date: DAY, summary: '協働へ', seats: { 'dev-verifier': { mode: 'collab' } }, notice: { to: '鈴木 一郎', at: DAY } }));
check('K65/J 決定を要しない変化点では、最後の変化点の決定者の欄にその旨(承認者は承認権限者のまま)', /^last_change_decided_by: 決定を要しない変化点/m.test(read('docs/D-0-governance.md')) && !/^approver: 決定を要しない変化点/m.test(read('docs/D-0-governance.md')), read('docs/D-0-governance.md').slice(0, 250));
check('D-0 の検査(承認者の欄を生成)', checkD0().ok, checkD0().out);
resetTo('s5');

// ------------------------------------------------------------------ K51 品質保証部門の通知先
accepted('qaNotice を定める(厳しくする向き。記名なし)', change({ kind: 'accountable', date: DAY, summary: '部門の通知先', governance: { qaNotice: '品質保証部 qa@example.com' } }));
accepted('運用形態の変更(通知の入力あり)', change({ kind: 'mode', date: DAY, summary: '協働へ', seats: { 'dev-verifier': { mode: 'collab' } }, notice: { to: '鈴木 一郎', at: DAY } }));
check('K51 部門の通知先が also に入る', last().notice?.also?.some((x) => x.role === 'qa-dept' && x.to.startsWith('品質保証部')), JSON.stringify(last().notice));
refused('qaNotice に空文字', change({ kind: 'accountable', date: DAY, summary: 'x', governance: { qaNotice: ' ' } }), 'qaNotice');
refused('K60 決定者の席を変える(記名なし)', change({ kind: 'accountable', date: DAY, summary: 'x', governance: { structureDecider: 'value-owner' } }), '決定者の変更');
resetTo('s5');

// ------------------------------------------------------------------ 中6(K63 の案内の側): 独立レビュアの席だけを委任
const PREV = { ...PDEV, permissions: 'review-token' };
accepted(
  '独立レビュアの席を委任し、開発者の席を協働へ戻す(s13c 相当)',
  change({
    kind: 'mode',
    date: DAY,
    summary: '独立レビュアの席だけ委任',
    seats: { 'dev-verifier': { mode: 'collab' }, 'independent-reviewer': { mode: 'delegated', performer: PREV, fallback: 'human', qualification: { ...QUAL, performer: PREV, approvedBy: '鈴木 一郎' } } },
    delegation: { rules: [RULE, { ...RULE, id: 'DR-002', seat: 'independent-reviewer', decidedBy: '鈴木 一郎', reason: '文言は事後に抜き取る' }] },
    decidedBy: '鈴木 一郎',
    reason: '文言は事後に抜き取る',
    ruleApprovedBy: '佐藤 花子',
    notice: { to: '鈴木 一郎', at: DAY },
  })
);
commit('chore: s13c');
git('tag', 's13c');
write('src/i18n/ja.json', '{}\n');
const d13 = contract('--delegation', '--base', 's13c');
check(
  'K63 --delegation: 開発者の席の規則に当たらない変更は「開発者の席は協働。検証は人」と出し、「人の記入を要求しません」と出さない',
  d13.ok && d13.out.includes('開発者の席の規則には該当しません') && d13.out.includes('開発者の席の責任者の承認が無い変更は') && !d13.out.includes('人の記入を要求しません'),
  d13.out
);
fs.rmSync(path.join(DIR, 'src'), { recursive: true, force: true });
resetTo('s5');
write('src/i18n/ja.json', '{}\n');
const d5 = contract('--delegation', '--base', 's5');
check('K63 --delegation: 開発者の席の規則に当たる変更は、担い手が検証欄を書くと出す', d5.ok && d5.out.includes('開発者の席の規則に該当します') && d5.out.includes('担い手の記載でよい'), d5.out);
fs.rmSync(path.join(DIR, 'src'), { recursive: true, force: true });
resetTo('s5');
check('契約検査(最後に s5)', contract().ok, contract().out);

done();
