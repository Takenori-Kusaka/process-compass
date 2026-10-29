// 第2巡で足した場面(K15・K16・K33・K37〜K40・K42)。
//   sh tmp/fix2-g3a/fresh.sh n && node tmp/fix2-g3a/new.mjs
import fs from 'node:fs';
import path from 'node:path';
import { workspace, checker, BASE, NAMES, APPOINTER, fill, BASIS, TODAY } from './lib.mjs';

const W = workspace('n');
const { DIR, run, git, write, read, cfg, gen, change, contract, checkD0, checkRules, resetTo, commit, d0, d0Version } = W;
const { check, refused, accepted, done } = checker();
// 第3巡(K65): 発効日は未来を受け付けず、最後の記録より前も受け付けない。実行日にそろえる
const DAY = TODAY;
const seat = (role) => cfg().seats.find((s) => s.role === role);
const last = () => cfg().changeLog.at(-1);
const allChecks = () => contract().ok && checkD0().ok && checkRules().ok;
const why = () => [contract(), checkD0(), checkRules()].filter((r) => !r.ok).map((r) => r.out).join('\n');

// ================================================================== 1人 + AI(場面1)
write('answers.json', { ...BASE, 'q-team-size': 'size-1-2', 'q-biz-phase': 'mvp', 'q-external-reviewer': 'reviewer-no' });
check('初期化(1名・MVP・CL0)', gen('--answers', 'answers.json', '--stack', 'node').ok);
check('初期化ではカバレッジの下限を雛形から引き継がない(ci-strict = 90)', cfg().ci.coverageThreshold === 90 && cfg().ci.derivedCoverageThreshold === 90, JSON.stringify(cfg().ci));
d0('1.0');
const P1 = { model: 'claude-fable-5-1', instructions: 'CLAUDE.md v1', permissions: 'dev-token' };
const SOLO = Object.fromEntries(['biz-approver', 'value-owner', 'tech-lead', 'dev-verifier', 'independent-reviewer', 'qa-gatekeeper', 'context-owner', 'ai-maintainer', 'ai-ops'].map((r) => [r, { accountable: '山田 太郎' }]));
SOLO['dev-verifier'] = { accountable: '山田 太郎', performer: P1, fallback: 'human' };
const solo = change({ kind: 'accountable', date: DAY, summary: '1人+AI。全席の責任者を同一人物にする', people: [{ id: 'p1', name: '山田 太郎', accounts: ['yamada-taro'] }], seats: SOLO, decidedBy: '山田 太郎', reason: '初期の設定' });
// 第3巡(K60): 兼務の逸脱は選択の余地がないため記名を求めないが、席の責任者の初回の記入は任免であり、1人体制に限り本人の記名と理由で受け付ける
accepted('1人で全席を兼ねる宣言(兼務は選択の余地がない。初回の記入は本人の記名)', solo, '逸脱の発生');
check('向きは「任免の決定」(人は減っていない)。逸脱は記録される', last().direction === 'appoint' && cfg().deviations.some((d) => d.separationId === 'sep-maintainer-ops'), last().direction);
check('全検査(1名)', allChecks(), why());
commit('chore: solo');
git('tag', 'solo');

// ---- 中6: 1人 → 2人
const two = [{ id: 'p1', name: '山田 太郎', accounts: ['yamada-taro'] }, { id: 'p2', name: '佐藤 花子', accounts: ['sato-hanako'] }];
const s2b = change({ kind: 'accountable', date: DAY, summary: '2人目が加わり、独立レビュアの席を任せる(回答は変えない)', people: two, seats: { 'independent-reviewer': { accountable: '佐藤 花子' } } }, true);
// 第3巡(K62): 回答(確認者なし)と席(別の人の確認者)の矛盾は、案内ではなく拒否する。拒否の文に直し方を出す
check('1人 → 2人で席だけを書くと、回答と名簿の矛盾として拒否し、回答を改める案内を出す', !s2b.ok && s2b.out.includes('回答を reviewer-yes へ改めます'), s2b.out);
const s2c = change({ kind: 'accountable', date: DAY, summary: '2人目が加わり、相互の確認で独立レビューを置く', answers: { 'q-external-reviewer': 'reviewer-yes' }, people: two, seats: { 'independent-reviewer': { accountable: '佐藤 花子' }, 'ai-ops': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '佐藤を独立レビュアに任命' });
accepted('1人 → 2人(相互の確認で G-6 が成立。任命は決定者の記名)', s2c, '未達の解消');
check('G-6 が成立し、ブランチ保護が付く', cfg().gates.g6.state === 'required' && cfg().ruleset === 'team' && cfg().review.requiredApprovals === 1);
check('全検査(2名)', allChecks(), why());
commit('chore: two');
git('tag', 'two');

// ---- K39(重大3): 2名で誰も離脱していないのに reviewer-no へ
// 第3巡(K62): 回答を確認者なしへ改めるなら、独立レビュアの席も開発者の席の責任者へ戻す(回答と席の矛盾を作らない)
const noRev = { kind: 'accountable', date: DAY, summary: '確認者を置かないことにする', answers: { 'q-external-reviewer': 'reviewer-no' }, seats: { 'independent-reviewer': { accountable: '山田 太郎' } } };
refused('2名で誰も離脱していないのに reviewer-no へ(記名なし)', change(noRev), '決定した者の記名');
const noRevDry = change(noRev, true);
check('dry-run は「発生」ではなく、緩める向きの決定として出す', noRevDry.out.includes('[要記名]') && noRevDry.out.includes('独立レビューを置かない決定である') && !noRevDry.out.includes('[即時反映]'), noRevDry.out);
refused('同(事業決裁者でない者の記名)', change({ ...noRev, decidedBy: '佐藤 花子', reason: '相手も指示に関与する' }), '決定できるのは');
accepted('同(事業決裁者の席の責任者の記名と理由)', change({ ...noRev, decidedBy: '山田 太郎', reason: '相手も作成の指示に関与するため、相互の確認が成立しない' }), '緩める向き');
check('向きは loosen。記名と理由が残る', last().direction === 'loosen' && last().decidedBy === '山田 太郎' && cfg().gates.g6.state === 'unmet');
resetTo('two');
// 席の入力で同一人物化(人は減っていない)
refused('2名で独立レビュアの席を開発者と同じ人にする(記名なし)', change({ kind: 'accountable', date: DAY, summary: '山田が兼ねる', seats: { 'independent-reviewer': { accountable: '山田 太郎' } } }), '決定した者の記名');
// 2名で、相手が残っているのに AI維持管理者 × AI運用担当者を兼ねる
refused('2名で AI維持管理者 × AI運用担当者を同じ人にする(記名なし)', change({ kind: 'accountable', date: DAY, summary: '山田が兼ねる', seats: { 'ai-ops': { accountable: '山田 太郎' } } }), '決定した者の記名');
// 離脱(2 → 1)は発生
// 第3巡(K60): 席を引き取るのは後任の任命(決定)。離脱による G-6 の未達は発生として残る
refused('2名 → 1名で席を引き取る(記名なし)', change({ kind: 'accountable', date: DAY, summary: '佐藤が離脱した。席は山田が引き取る', people: [two[0]], seats: { 'independent-reviewer': { accountable: '山田 太郎' }, 'ai-ops': { accountable: '山田 太郎' } } }), '任免');
accepted('2名 → 1名(佐藤が離脱。席の引き取りは決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '佐藤が離脱した。席は山田が引き取る', people: [two[0]], seats: { 'independent-reviewer': { accountable: '山田 太郎' }, 'ai-ops': { accountable: '山田 太郎' } }, decidedBy: '山田 太郎', reason: '1名で兼ねる' }), '未達の発生: G-6 独立レビュー', '[即時反映]');
check('向きは任免の決定。G-6 の未達は発生として残る', last().direction === 'appoint' && last().arising.some((a) => a.includes('G-6')));
resetTo('two');
// 席を空欄にして人が抜ける(s03)
const blank = change({ kind: 'accountable', date: DAY, summary: '佐藤が離脱した。後任は未定', people: [two[0]], seats: { 'independent-reviewer': { accountable: null }, 'ai-ops': { accountable: null } } });
// 第4巡(K70): 名簿に確認できる人が残らない離脱は、席を空けたままでも G-6 を未達へ即時に反映する(向きは発生)
accepted('席を空欄にして人が抜ける', blank, '未達の発生: G-6 独立レビュー', '[即時反映]');
check('向きは arising で、G-6 は未達(「適用する」のまま残さない)', last().direction === 'arising' && cfg().gates.g6.state === 'unmet' && last().notice?.reasons?.some((r) => r.startsWith('独立レビュー')));
resetTo('two');

// 出荷できない状態の理由文を、原因で書き分ける(1〜2名の体制のまま、安全重要度が上がった場合)
const cl1 = change({ kind: 'axis', date: DAY, summary: '個人データを扱う機能を足す', answers: { 'q-criticality': 'cl1' } });
accepted('2名の体制のまま安全重要度が上がる → 出荷できない状態。理由文は区分の上昇', cl1, '1〜2名の体制のまま、案件が CL1 以上・規制業になった');
check('原因は criticality。「体制が3名を割った」とは出ない。再生成しても保つ', cfg().shipBlocked.cause === 'criticality' && !cfg().shipBlocked.reason.includes('割った') && gen('--answers', 'process.config.json').ok && contract().ok, contract().out);
resetTo('two');

// ================================================================== K37(重大1): 変化点を経ない書き換え
const edit = (fn) => {
  const c = cfg();
  fn(c);
  write('process.config.json', JSON.stringify(c, null, 2) + '\n');
};
const regen = () => gen('--answers', 'process.config.json');

// 14-3: 委任を一式そろえて手で書き込む
edit((c) => {
  const s = c.seats.find((x) => x.role === 'dev-verifier');
  s.mode = 'delegated';
  s.qualification = { confirmedAt: '2026-10-01', performedBy: '山田 太郎', approvedBy: '山田 太郎', cases: 'x', result: 'x', performer: s.performer };
  c.delegation.changeTypes = [{ id: '表示文言', registeredBy: '山田 太郎', registeredAt: '2026-10-01' }];
  c.delegation.rules = [{ id: 'DR-001', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/**'], decidedBy: '山田 太郎', decidedAt: '2026-10-01', reason: 'r', approvedBy: '山田 太郎', approvedAt: '2026-10-01' }];
});
check('14-3 手で委任を一式書き込む → 契約検査が落ちる', !contract().ok && contract().out.includes('変化点の記録を経ずに書き換えられています'), contract().out);
refused('14-3 そのまま回答ファイルから再生成', regen(), '変化点の記録と、現在の構成が一致しません');
refused('14-3 そのまま次の変化点を出す(手での編集を追認しない)', change({ kind: 'schedule-only', summary: '納期' }), '変化点の記録と、現在の構成が一致しません');
resetTo('two');

// 14-4: answers を手で PoC へ
edit((c) => {
  c.answers['q-biz-phase'] = 'poc';
});
check('14-4 手で PoC へ → 契約検査が落ちる', !contract().ok && contract().out.includes('書き換えられています'), contract().out);
refused('14-4 再生成', regen(), '一致しません');
resetTo('two');

// 14-7: 架空の外部の確認者
resetTo('solo');
edit((c) => {
  c.answers['q-external-reviewer'] = 'reviewer-yes';
  c.people.push({ id: 'ext', name: '高橋 次郎', external: true, accounts: [] });
  c.seats.find((x) => x.role === 'independent-reviewer').accountable = '高橋 次郎';
});
check('14-7 手で架空の外部の確認者を書く → 契約検査が落ちる', !contract().ok && contract().out.includes('書き換えられています'), contract().out);
refused('14-7 再生成', regen(), '一致しません');
resetTo('two');

// 14-8: changeLog の切り詰め・記名の削除
edit((c) => {
  c.changeLog = c.changeLog.slice(0, 1);
});
check('14-8 changeLog を切り詰める → 契約検査が落ちる', !contract().ok, contract().out);
resetTo('two');
edit((c) => {
  c.changeLog = [];
});
check('14-8 changeLog を消す → 契約検査が落ちる', !contract().ok && contract().out.includes('changeLog がありません'), contract().out);
resetTo('two');
edit((c) => {
  c.changeLog[1].summary = '書き換えた';
});
check('14-8 途中の記録を書き換える → 連鎖の不一致', !contract().ok && contract().out.includes('prevHash'), contract().out);
resetTo('two');
edit((c) => {
  for (const e of c.changeLog) {
    delete e.stateHash;
    delete e.prevHash;
  }
  c.schemaVersion = 0;
});
check('要約値を全部外して旧い構成に見せる → 契約検査が落ちる', !contract().ok && contract().out.includes('要約値がありません'), contract().out);
refused('同 → 再生成を受け付けない', regen(), '旧い構成');
check('同 → 基底ブランチとの比較でも落ちる', contract('--base', 'two').out.includes('保たれていません'), contract('--base', 'two').out);
resetTo('two');

// 要約値ごと書き換える改ざん(ローカルの検査の限界)。基底ブランチとの比較で止まる
const tamper = `
import fs from 'node:fs';
import { sealChangeLog, recordDigest } from './scripts/gate/config.mjs';
const c = JSON.parse(fs.readFileSync('process.config.json', 'utf8'));
c.answers['q-biz-phase'] = 'poc';
sealChangeLog(c);
fs.writeFileSync('process.config.json', JSON.stringify(c, null, 2) + '\\n');
`;
write('tamper.mjs', tamper);
run('node', ['tamper.mjs']);
const local = contract();
check('要約値ごと書き換えた構成は、ローカルの連鎖の検査を通る(開示する限界)', !local.out.includes('書き換えられています'), local.out);
const vsBase = contract('--base', 'two');
check('同 → 基底ブランチとの比較で落ちる(記録の書き換え、追記なし)', !vsBase.ok && vsBase.out.includes('保たれていません') && vsBase.out.includes('追記がありません'), vsBase.out);
resetTo('two');
check('基底ブランチを解決できない場合は落ちる', !contract('--base', 'no-such-ref').ok && contract('--base', 'no-such-ref').out.includes('解決できません'));
const envBase = run('node', ['scripts/gate/verify-gate-contract.mjs'], { GITHUB_BASE_REF: 'no-such-branch' });
check('GITHUB_BASE_REF を解決できない場合も落ちる', !envBase.ok && envBase.out.includes('解決できません'), envBase.out);
// 正しい経路(変化点)なら、基底との比較を通る
accepted('変化点を経た変更', change({ kind: 'schedule-only', date: DAY, summary: '納期が早まった' }), '構成の変更なし');
const okBase = contract('--base', 'two');
check('変化点を経た変更は、基底との比較を通る', okBase.ok && okBase.out.includes('追記だけです'), okBase.out);
resetTo('two');

// 再生成: 引数で値を変えられない
refused('再生成で --stack を変える', gen('--answers', 'process.config.json', '--stack', 'python'), '種別 settings');
refused('別の回答ファイルで再生成', (write('a2.json', { ...BASE, 'q-team-size': 'size-1-2', 'q-biz-phase': 'poc', 'q-external-reviewer': 'reviewer-yes' }), gen('--answers', 'a2.json')), '回答が異なります');
check('再生成(何も変えない)は通る', regen().ok && git('status', '--porcelain', 'process.config.json', 'docs/D-0-governance.md', 'CLAUDE.md', 'PROCESS-PROFILE.md').out.trim() === '', git('status', '--porcelain').out);

// 旧い構成(要約値なし)からの移行
edit((c) => {
  for (const e of c.changeLog) {
    delete e.stateHash;
    delete e.prevHash;
  }
  c.schemaVersion = 0;
  delete c.governance;
  for (const p of c.people) delete p.accounts;
});
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/<!-- generated:d0-[a-z]+ (start|end) -->\n/g, ''));
commit('chore: 旧い構成を模す');
git('tag', 'legacy');
check('旧い構成: 契約検査は落ち、移行の手順を示す', !contract().ok && contract().out.includes('/process-change を1回実行すると'), contract().out);
check('旧い構成: D-0 の検査は注意にとどめる', checkD0().ok && checkD0().out.includes('旧い構成のため注意にとどめています'), checkD0().out);
const mig = change({ kind: 'settings', date: DAY, summary: '要約値の連鎖を始める' });
accepted('旧い構成: 最初の /process-change で連鎖を始める', mig, '[連鎖の開始]');
check('連鎖の起点が記録される', last().chainStart === true && Boolean(last().stateHash) && Boolean(last().prevHash) && cfg().schemaVersion === 1 && !cfg().changeLog[0].stateHash, JSON.stringify(last()).slice(-300));
check('移行後: 契約検査が通る', contract().ok, contract().out);
check('移行後: D-0 に目印が無ければ D-0 の検査が落ちる', !checkD0().ok && checkD0().out.includes('生成区間の目印'), checkD0().out);
check('移行後: 基底(旧い構成)との比較を通る(記録は追記だけ)', contract('--base', 'legacy').ok, contract('--base', 'legacy').out);
edit((c) => {
  c.changeLog[0].summary = '旧い記録を書き換えた';
});
check('移行後: 連鎖より前の記録の書き換えも検出する', !contract().ok && contract().out.includes('prevHash'), contract().out);
resetTo('two');

// ================================================================== K42: D-0 の生成区間
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace('| 独立レビュア | 佐藤 花子 |', '| 独立レビュア | 山田 太郎 |'));
check('D-0 の生成区間を手で書き換える → D-0 の検査が落ちる', !checkD0().ok && checkD0().out.includes('生成区間が、構成(process.config.json)と一致しません'), checkD0().out);
check('再生成で区間が戻る', regen().ok && checkD0().ok, checkD0().out);
resetTo('two');
const v0 = d0Version();
accepted('変化点(D-0 を手で改訂しない)', change({ kind: 'accountable', date: DAY, summary: '文脈オーナーを佐藤へ', seats: { 'context-owner': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '文脈の維持を分担する' }));
check('D-0 の版・節1・節13 が変化点で書き換わり、D-0 の検査が通る', d0Version() !== v0 && String(cfg().d0Version) === d0Version() && read('docs/D-0-governance.md').includes('| コンテキストオーナー | 佐藤 花子 |') && read('docs/D-0-governance.md').includes('文脈オーナーを佐藤へ') && checkD0().ok, `${v0} → ${d0Version()}\n${checkD0().out}`);
check('改訂履歴に変更前後の版が出る', read('docs/D-0-governance.md').includes(`| ${v0} → ${d0Version()} |`));
resetTo('two');
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: 2.0'));
accepted('人が先に版を上げていれば、その版を使う', change({ kind: 'accountable', date: DAY, summary: '文脈オーナーを佐藤へ', seats: { 'context-owner': { accountable: '佐藤 花子' } }, decidedBy: '山田 太郎', reason: '文脈の維持を分担する' }));
check('版は 2.0 のまま', d0Version() === '2.0' && String(cfg().d0Version) === '2.0' && checkD0().ok, checkD0().out);
resetTo('two');
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^version:.*$/m, 'version: draft'));
write('process.config.json', read('process.config.json'));
resetTo('two');

// ================================================================== K33: D-0 表1 の2行と、決定者
check('D-0 節3 に2行があり、決定者は構成から書かれる', /\| 体制と運用形態[^|]*\| 事業決裁者 \|/.test(read('docs/D-0-governance.md')) && /\| 標準変更カタログへの登録[^|]*\| 事業決裁者 \|/.test(read('docs/D-0-governance.md')), read('docs/D-0-governance.md').split('\n').filter((l) => /体制と運用形態|標準変更カタログへの登録/.test(l)).join('\n'));
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/(\| 体制と運用形態[^|]*\|)[^|]*\|/, '$1 開発者 |'));
check('D-0 表1 の決定者を手で書き換える → D-0 の検査が落ちる', !checkD0().ok && checkD0().out.includes('governance'), checkD0().out);
resetTo('two');
refused('決定者の席を変える(変更前の決定者でない者の記名)', change({ kind: 'accountable', date: DAY, summary: '決定者を価値責任者へ', seats: { 'value-owner': { accountable: '佐藤 花子' } }, governance: { structureDecider: 'value-owner' }, decidedBy: '佐藤 花子', reason: 'r' }), '変更前の D-0 表1「体制と運用形態」の決定者');
accepted('決定者の席を変える(変更前の決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '決定者を価値責任者へ', seats: { 'value-owner': { accountable: '佐藤 花子' } }, governance: { structureDecider: 'value-owner' }, decidedBy: '山田 太郎', reason: '体制の決定を価値責任者へ移す' }), '緩める向き');
check('D-0 表1 の行が書き換わる', /\| 体制と運用形態[^|]*\| 価値責任者\(Value Owner\) \|/.test(read('docs/D-0-governance.md')) && checkD0().ok, checkD0().out);
refused('以後、緩める向きの決定は新しい決定者に限る(旧い決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '確認者を置かない', answers: { 'q-external-reviewer': 'reviewer-no' }, seats: { 'independent-reviewer': { accountable: '山田 太郎' } }, decidedBy: '山田 太郎', reason: 'r' }), '決定できるのは');
accepted('同(新しい決定者の記名)', change({ kind: 'accountable', date: DAY, summary: '確認者を置かない', answers: { 'q-external-reviewer': 'reviewer-no' }, seats: { 'independent-reviewer': { accountable: '山田 太郎' } }, decidedBy: '佐藤 花子', reason: '相互の確認が成立しない' }));
resetTo('two');
refused('決定者の席が不正', change({ kind: 'accountable', governance: { structureDecider: 'nobody' } }), '席のロール ID ではありません');

// ================================================================== 個別の値(種別 settings)
refused('カバレッジの下限を下げる(記名なし)', change({ kind: 'settings', date: DAY, summary: '下限を下げる', settings: { ci: { coverageThreshold: 70 } } }), '決定した者の記名');
accepted('カバレッジの下限を下げる(AI維持管理者の席の責任者の記名)', change({ kind: 'settings', date: DAY, summary: '下限を実測へ合わせる', settings: { ci: { coverageThreshold: 85 } }, decidedBy: '山田 太郎', reason: '実測に基づく較正' }), 'カバレッジの下限: 90% → 85%');
check('全検査(下限を変えた後)。D-0 の版は上げない', allChecks() && d0Version() === String(JSON.parse(git('show', 'two:process.config.json').out).d0Version), why());
accepted('カバレッジの下限を上げる(記名なし・即時)', change({ kind: 'settings', date: DAY, summary: '下限を上げる', settings: { ci: { coverageThreshold: 95 } } }), '厳しくする向き');
accepted('アダプタを変える', change({ kind: 'settings', date: DAY, summary: 'スタックを python へ', settings: { stack: 'python' } }), 'アダプタ(実装スタック): node → python', '判断記録(ADR)');
refused('存在しないアダプタ', change({ kind: 'settings', settings: { stack: 'cobol' } }), 'adapters/cobol.json');
refused('settings で体制を変える', change({ kind: 'settings', settings: {}, answers: { 'q-biz-phase': 'poc' } }), '体制を変えられません');
refused('強制層の緩和に期限が無い', change({ kind: 'settings', settings: { guard: { enabled: false } } }), '期限');
refused('強制層の緩和(記名なし)', change({ kind: 'settings', settings: { guard: { enabled: false, reviewBy: '2026-12-31', reason: '探索' } } }), '決定した者の記名');
resetTo('two');

// ================================================================== 入力値の検査
refused('回答値が不正', change({ kind: 'axis', answers: { 'q-biz-phase': 'production' } }), '不正です');
refused('質問 ID が不正', change({ kind: 'axis', answers: { 'q-unknown': 'x' } }), '知識ベースにありません');
refused('運用形態の値が不正', change({ kind: 'mode', seats: { 'dev-verifier': { mode: 'auto' } } }), '不正です');
refused('fallback の値が不正', change({ kind: 'mode', seats: { 'dev-verifier': { fallback: 'ignore' } } }), '不正です');
refused('日付が不正', change({ kind: 'accountable', date: '10/10' }), 'YYYY-MM-DD');
refused('席に書けない欄(modeCeiling)', change({ kind: 'mode', seats: { 'qa-gatekeeper': { modeCeiling: 'delegated' } } }), '書けない欄');
refused('初期化の回答値が不正', (write('bad.json', { ...BASE, 'q-team-size': 'size-100', 'q-biz-phase': 'mvp' }), run('node', ['scripts/init/generate-profile.mjs', '--answers', 'bad.json', '--dry-run'])), '不正です');

// ================================================================== 3名以上(K38・中7・中8・中9・K16)
resetTo('solo');
const people = (n) => NAMES.slice(0, n).map((name, i) => ({ id: String.fromCharCode(97 + i), name, accounts: [`acct-${String.fromCharCode(97 + i)}`] }));
const SEATS3 = { 'biz-approver': { accountable: 'a' }, 'value-owner': { accountable: 'a' }, 'tech-lead': { accountable: 'a' }, 'dev-verifier': { accountable: 'b' }, 'independent-reviewer': { accountable: 'c' }, 'qa-gatekeeper': { accountable: 'c' }, 'context-owner': { accountable: 'a' }, 'ai-maintainer': { accountable: 'a' }, 'ai-ops': { accountable: 'c' } };
accepted('1名 → 3名', change({ kind: 'headcount', date: DAY, summary: '3名体制', answers: { 'q-team-size': 'size-3-9' }, people: people(3), seats: SEATS3, decidedBy: '山田 太郎', reason: '3名体制へ' }), '未達の解消');
check('全検査(3名)', allChecks(), why());
commit('chore: 3名');
git('tag', 'three');

// K38(重大2): 3名以上で独立レビュアと開発者を同一人物に
refused('3名で独立レビュア = 開発者(s11b)', change({ kind: 'accountable', date: DAY, summary: '納期が厳しいので独立レビュアを開発者の佐藤が兼ねる', seats: { 'independent-reviewer': { accountable: 'b' } } }), '兼務禁止に抵触します', '開発者(検証者) × 独立レビュア');
refused('同(記名があっても拒否)', change({ kind: 'accountable', date: DAY, summary: '兼ねる', seats: { 'independent-reviewer': { accountable: 'b' } }, decidedBy: 'a', reason: '納期' }), '兼務禁止に抵触します');
refused('3名で出荷判定者 = 開発者', change({ kind: 'accountable', date: DAY, summary: '兼ねる', seats: { 'qa-gatekeeper': { accountable: 'b' } } }), '兼務禁止に抵触します');
edit((c) => {
  c.seats.find((x) => x.role === 'independent-reviewer').accountable = 'b';
});
check('手で同一人物にした構成は契約検査が落ちる(連鎖と兼務禁止)', !contract().ok && contract().out.includes('兼務禁止に抵触'), contract().out);
resetTo('three');

// 中7: 10名の境界
refused('名簿だけ15名(回答は 3〜9名のまま)', change({ kind: 'headcount', date: DAY, summary: '名簿だけ15名', people: people(15) }), '10名の境界');
const to15 = change({ kind: 'headcount', date: DAY, summary: '15名へ', answers: { 'q-team-size': 'size-10plus' }, people: people(15), seats: { 'tech-lead': { accountable: 'd' } }, decidedBy: 'a', reason: '10名以上は分離必須' });
accepted('3名 → 15名', to15, 'の設定 reviewMode: internal-separated → internal-plus-core-external', 'の設定 approverMode: named-concurrent → dedicated-qa', '分離必須とする(10名以上)');
check('全検査(15名)', allChecks(), why());
// #286: 兼務の禁止はロールごとの詳細へ移し、CLAUDE.md へ常駐させない。next.mjs --role が構成から出す
{
  const card = run('node', ['scripts/gate/next.mjs', '--role', 'value-owner']).out;
  check('next.mjs --role に、価値責任者が兼ねてはならない役割として技術判断者が出る', /\*\*価値責任者\(Value Owner\)\*\* が兼ねてはならない役割: .*技術判断者/.test(card), card);
}
commit('chore: 15名');
git('tag', 'fifteen');
refused('15名で価値責任者 = 技術判断者(s4y)', change({ kind: 'accountable', date: DAY, summary: '価値責任者と技術判断者を同一人物にする', seats: { 'tech-lead': { accountable: 'a' } } }), '兼務禁止に抵触します', '価値責任者(Value Owner) × 技術判断者(Tech Lead)', '10名以上の体制では');
refused('15名の名簿が9名へ減ったのに回答は 10名以上のまま', change({ kind: 'headcount', date: DAY, summary: '6名が離脱', people: people(9) }), '10名の境界');
const to9 = change({ kind: 'headcount', date: DAY, summary: '6名が離脱', answers: { 'q-team-size': 'size-3-9' }, people: people(9) });
accepted('15名 → 9名(離脱。記名なし)', to9, '体制の縮小に伴う変化', '分離必須が外れる');
check('向きは arising', last().direction === 'arising');
resetTo('three');

// 委任の準備(3名)
const P = { model: 'claude-fable-5-1', instructions: 'CLAUDE.md v1', permissions: 'dev-token' };
const Q = (o = {}) => ({ confirmedAt: '2026-09-10', performedBy: 'a', approvedBy: 'b', cases: 'docs/qualification/dev-2026-10.md', result: '過去の判定 20 件中 19 件を再現', performer: P, ...o });
const TYPES = [{ id: '表示文言', registeredBy: 'a', registeredAt: DAY, basis: BASIS }];
const RULE = { id: 'DR-001', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: 'b', decidedAt: DAY, reason: '文言のレビュー待ちを無くす' };
accepted('開発者の席を委任', change({ kind: 'mode', date: DAY, summary: '委任', seats: { 'dev-verifier': { mode: 'delegated', performer: P, fallback: 'human', qualification: Q() } }, delegation: { rules: [RULE], changeTypes: TYPES }, ruleApprovedBy: 'a', decidedBy: 'b', reason: '文言のレビュー待ちを無くす', notice: { to: 'c', at: DAY } }));
check('委任になった。全検査', seat('dev-verifier').mode === 'delegated' && allChecks(), why());
commit('chore: 委任');
git('tag', 'delegated');

// 中9: モデルの版の変更と、同じ変化点での再確認(s7-4)
const P2 = { ...P, model: 'claude-fable-5-2' };
const s74 = change({ kind: 'performer', date: DAY, summary: '版の変更と同時に再確認済みと申告', seats: { 'dev-verifier': { performer: P2, qualification: Q({ confirmedAt: '2026-09-20', performer: P2 }) } } });
accepted('7-4 版の変更 + 適合性確認(記名なし) → 協働へ下げる', s74, '委任 → 協働', '新しい識別で委任を続ける決定の、記名と理由が無い');
check('7-4 委任は維持されず、出力が食い違わない(「協働を上限とする」と言いながら委任のまま、にならない)', seat('dev-verifier').mode === 'collab' && last().direction === 'tighten' && !s74.out.includes('再確認まで協働を上限とする'), s74.out);
check('7-4 即時通知の対象(担い手の識別の変更・運用形態の変更)', last().notice.reasons.length === 2, JSON.stringify(last().notice));
check('7-4 確認の記録は残る(記名だけが欠けている)', seat('dev-verifier').qualification?.confirmedAt === '2026-09-20');
accepted('7-4 のあと、席の責任者の記名で委任へ戻す', change({ kind: 'mode', date: DAY, summary: '再確認のうえ委任へ戻す', seats: { 'dev-verifier': { mode: 'delegated' } }, decidedBy: 'b', reason: '新しい版で再確認した' }), '緩める向き');
resetTo('delegated');
const s74signed = change({ kind: 'performer', date: DAY, summary: '版の変更。再確認のうえ委任を維持', seats: { 'dev-verifier': { performer: P2, qualification: Q({ confirmedAt: '2026-09-20', performer: P2 }) } }, decidedBy: 'b', reason: '新しい版で再確認した' });
accepted('7-4 4条件を満たす(新しい識別の確認・旧い記録より後・実施者と承認者・席の責任者の記名) → 委任を維持', s74signed, '再確認のうえ、委任へ戻す決定');
check('委任のまま。向きは loosen。決定者が記録に残る', seat('dev-verifier').mode === 'delegated' && last().direction === 'loosen' && last().decidedBy === 'b');
resetTo('delegated');
// 採用前に確認を済ませておく運用(確認日が変更日より前でも、旧い記録より後なら有効)
const early = change({ kind: 'performer', date: DAY, summary: '採用前に確認を済ませた版へ切り替える', seats: { 'dev-verifier': { performer: P2, qualification: Q({ confirmedAt: '2026-09-15', performer: P2 }) } }, decidedBy: 'b', reason: '採用前に新しい版で確認した' });
accepted('採用前に済ませた確認(確認日は変更日より前、旧い記録より後) + 記名 → 委任を維持', early, '再確認のうえ、委任へ戻す決定');
check('委任のまま', seat('dev-verifier').mode === 'delegated');
resetTo('delegated');
const wrongDecider = change({ kind: 'performer', date: DAY, summary: '版の変更', seats: { 'dev-verifier': { performer: P2, qualification: Q({ confirmedAt: '2026-09-20', performer: P2 }) } }, decidedBy: 'c', reason: 'r' });
accepted('7-4 記名した者が席の責任者でない → 協働へ下げる', wrongDecider, '記名した者(c)が、この席の責任者でない');
check('協働へ下がる', seat('dev-verifier').mode === 'collab');
resetTo('delegated');
const wrongAuthority = change({ kind: 'performer', date: DAY, summary: '版の変更', seats: { 'dev-verifier': { performer: P2, qualification: Q({ confirmedAt: '2026-09-20', performer: P2, approvedBy: 'c' }) } }, decidedBy: 'b', reason: 'r' });
accepted('7-4 承認者が当該の席の責任者でない → 受け付けず、協働へ', wrongAuthority, '[無効]', '承認は席の責任者が行う');
check('協働へ下がり、確認の記録は残らない', seat('dev-verifier').mode === 'collab' && seat('dev-verifier').qualification === null);
resetTo('delegated');
// 7-4b: 旧い確認記録の performer 欄だけを書き換えて出す
const s74b = change({ kind: 'performer', date: DAY, summary: '版の変更。旧い確認記録の performer 欄だけを書き換えて出す', seats: { 'dev-verifier': { performer: P2, qualification: Q({ confirmedAt: '2026-01-01', performer: P2 }) } }, decidedBy: 'b', reason: 'r' });
accepted('7-4b 旧い記録の使い回し(確認日が旧い記録より後でない) → 受け付けず、協働へ', s74b, '[無効]', '旧い記録の確認日(2026-09-10)より後でない');
check('7-4b 確認の記録は残らず、席は協働', seat('dev-verifier').mode === 'collab' && seat('dev-verifier').qualification === null);
resetTo('delegated');
const s74c = change({ kind: 'performer', date: DAY, summary: '版の変更(再確認なし)', seats: { 'dev-verifier': { performer: P2 } } });
accepted('版の変更(再確認なし) → 協働へ', s74c, '適合性確認の失効', '有効な適合性確認の記録が無い');
check('協働へ下がる', seat('dev-verifier').mode === 'collab');
resetTo('delegated');

// K16: 適合性確認を承認した席の責任者(開発者の席の責任者 b)が離脱する。失効するのは承認である
const four = [...people(3), { id: 'd', name: NAMES[3], accounts: ['acct-d'] }];
accepted('4人目が加わる', change({ kind: 'accountable', date: DAY, summary: '4人目', people: four }));
commit('chore: 4名');
git('tag', 'four');
const leave = change({ kind: 'accountable', date: DAY, summary: '佐藤(開発者の席の責任者・適合性確認の承認者)が離脱', people: four.filter((p) => p.id !== 'b'), seats: { 'dev-verifier': { accountable: 'd' } }, decidedBy: 'a', reason: '後任に高橋' });
accepted('適合性確認の承認者が離脱する変化点を止めない(F4)', leave, '適合性確認の承認者が交代したため、承認が失効(記録は有効。新しい責任者の承認を要する)', '委任 → 協働');
check('失効するのは承認。確認の記録(事例と結果)は残り、席は協働', seat('dev-verifier').mode === 'collab' && seat('dev-verifier').qualification.lapsed?.reason.includes('承認が失効') && seat('dev-verifier').qualification.cases === 'docs/qualification/dev-2026-10.md' && contract().ok, contract().out);
check('全検査(承認者の離脱後)', allChecks(), why());
// 新しい責任者が承認し直す(確認の再実施は要しない)。規則も、新しい責任者が確かめて記名し直す
refused('承認し直し(承認者が新しい責任者でない)', change({ kind: 'mode', date: DAY, summary: '承認し直す', seats: { 'dev-verifier': { qualification: { approvedBy: 'a' } } } }), '承認は席の責任者が行う');
refused('承認し直して委任へ戻す(記名なし)', change({ kind: 'mode', date: DAY, summary: '承認し直す', seats: { 'dev-verifier': { mode: 'delegated', qualification: { approvedBy: 'd' } } }, delegation: { rules: [{ ...RULE, decidedBy: 'd' }] } }), '決定した者の記名');
const again = change({ kind: 'mode', date: DAY, summary: '新しい責任者が承認し直し、委任へ戻す', seats: { 'dev-verifier': { mode: 'delegated', qualification: { approvedBy: 'd' } } }, delegation: { rules: [{ ...RULE, decidedBy: 'd' }] }, decidedBy: 'd', reason: '確認の記録を読み、担い手を受け入れる' });
accepted('新しい責任者が承認し直し、記名して委任へ戻す', again, '[承認し直し]', '緩める向き');
check('承認者は新しい責任者。確認の記録は同じもの(再実施していない)。席は委任', seat('dev-verifier').mode === 'delegated' && seat('dev-verifier').qualification.approvedBy === 'd' && !seat('dev-verifier').qualification.lapsed && seat('dev-verifier').qualification.confirmedAt === '2026-09-10' && seat('dev-verifier').qualification.performedBy === 'a', JSON.stringify(seat('dev-verifier').qualification));
check('全検査(承認し直した後)', allChecks(), why());
resetTo('four');
// 離脱を伴わない交代でも、承認は引き継がれない
const swap = change({ kind: 'accountable', date: DAY, summary: '開発者の席の責任者を高橋へ(佐藤は残る)', seats: { 'dev-verifier': { accountable: 'd' } }, decidedBy: 'a', reason: '高橋へ替える' });
accepted('席の責任者の交代(離脱なし)でも、承認が失効する', swap, '承認が失効', '委任 → 協働');
check('席は協働。向きは任免の決定(第3巡 K60。以前は厳しくする)。前の責任者(佐藤)は名簿に残っている', seat('dev-verifier').mode === 'collab' && last().direction === 'appoint' && cfg().people.some((p) => p.id === 'b') && seat('dev-verifier').qualification.lapsed?.reason.includes('承認が失効') && seat('dev-verifier').qualification.cases === 'docs/qualification/dev-2026-10.md');
check('全検査(名簿に残る交代の後)。D-0 に承認の失効が出る', allChecks() && read('docs/D-0-governance.md').includes('承認者が交代したため、承認が失効'), why());
refused('名簿に残る交代: 前の責任者の名義では承認し直せない', change({ kind: 'mode', date: DAY, summary: '承認し直す', seats: { 'dev-verifier': { qualification: { approvedBy: 'b' } } } }), '承認は席の責任者が行う');
const again2 = change({ kind: 'mode', date: DAY, summary: '新しい責任者が承認し直し、委任へ戻す', seats: { 'dev-verifier': { mode: 'delegated', qualification: { approvedBy: 'd' } } }, delegation: { rules: [{ ...RULE, decidedBy: 'd' }] }, decidedBy: 'd', reason: '確認の記録を読み、担い手を受け入れる' });
accepted('名簿に残る交代: 新しい責任者が承認し直し、記名して委任へ戻す', again2, '[承認し直し]', '緩める向き');
check('席は委任。承認者は新しい責任者。確認の記録は再実施していない', seat('dev-verifier').mode === 'delegated' && seat('dev-verifier').qualification.approvedBy === 'd' && seat('dev-verifier').qualification.confirmedAt === '2026-09-10' && allChecks(), why());
resetTo('four');
// 承認だけをし直し、委任へは戻さない(記名なしで通る。席は協働のまま)
change({ kind: 'accountable', date: DAY, summary: '開発者の席の責任者を高橋へ', seats: { 'dev-verifier': { accountable: 'd' } }, decidedBy: 'a', reason: '高橋へ替える' });
const onlyReapprove = change({ kind: 'mode', date: DAY, summary: '承認だけをし直す', seats: { 'dev-verifier': { qualification: { approvedBy: 'd' } } } });
accepted('承認し直すだけでは委任へ戻らない(委任へ戻すのは、記名と理由を要する決定)', onlyReapprove, '[承認し直し]');
check('席は協働のまま。失効の印は消える', seat('dev-verifier').mode === 'collab' && !seat('dev-verifier').qualification.lapsed);
resetTo('delegated');

// 既存の規則が要件を満たさなくなっても、離脱の変化点を止めない(変更種別の登録を消す)
const drop = change({ kind: 'mode', date: DAY, summary: '変更種別の登録を消す', delegation: { changeTypes: [] } });
accepted('変更種別の登録を消す(厳しくする向き)', drop, '[要修正]', '委任 → 協働');
check('席は協働へ下がる', seat('dev-verifier').mode === 'collab');
resetTo('delegated');

done();
