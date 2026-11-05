// #373: 安全重要度の判定の記録と確認の経路を固定する(ADR-0113)。
//   - 初期化の回答は仮の判定。D-0 節16 の判定の欄と判定者の記名がそろうまで、D-0 の検査が失敗し、/pit が人の判断待ちに出す(決定4)
//   - G-1 を通過済みの旧い構成は、遡って止めない(移行。research/373-deliberation/implementation.md)
//   - 確認者の欠落は未達として出し、CL0 で規制業でない案件は欠落に数えない。F.2 の Q1 が「はい」で段3 が欠ければ欠落(決定2)
//   - 区分を下げる変化点は、引き下げの根拠の記録と、根拠が引く ADR・機能仕様が実在するときだけ受け付ける(決定3・決定4)
//   node scripts/regress/run.mjs --only cl-judgment
// @regress {"now": "2026-10-01T12:00:00Z", "workspaces": ["cl373"], "fixes": ["#373"]}
import { workspace, checker, NAMES, SEATS, TODAY, rosterAccount, clRecord, fill } from './lib.mjs';

const { check, refused, accepted, fixes, done } = checker();

const W = workspace('cl373');
const { git, write, read, cfg, gen, change, run, checkD0, resetTo } = W;
// 場面ごとに初期化の前の状態へ戻す(集約の場面がコミットを足すため、作業ツリーの取り消しだけでは戻らない)
git('tag', 'cl-start');
const reset = () => resetTo('cl-start');
const PEOPLE = NAMES.slice(0, 3).map((name, i) => ({ id: `p${i + 1}`, name, accounts: [rosterAccount(`acct-${i + 1}`)] }));
// 事業決裁者(D-0 表1「体制と運用形態」の決定者)は山田。佐藤が独立レビュア、鈴木が出荷判定者
const SEATS3 = Object.fromEntries(SEATS.map((s) => [s, { accountable: { 'independent-reviewer': NAMES[1], 'qa-gatekeeper': NAMES[2], 'ai-ops': NAMES[2] }[s] ?? NAMES[0] }]));
/** 3名・MVP で初期化し、名簿と席を埋め、D-0 を承認する。record が偽なら節16 を様式のまま残す */
const init = (cl, { record = true } = {}) => {
  reset();
  write('answers.json', { 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp', 'q-quality': 'quality-standard', 'q-criticality': cl, 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free' });
  const r = gen('--answers', 'answers.json', '--stack', 'node');
  W.d0('1.0');
  const f = fill(W, PEOPLE, SEATS3);
  if (!record) write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^## 16\. 安全重要度の判定の記録[\s\S]*$/m, read('templates/00-d0-governance.md').match(/^## 16\. 安全重要度の判定の記録[\s\S]*$/m)[0]));
  return { ok: r.ok && f.ok, out: `${r.out}\n${f.out}` };
};
const next = () => {
  const r = run('node', ['scripts/gate/next.mjs', '--json', '--offline']);
  try {
    return JSON.parse(r.out.slice(r.out.indexOf('{')));
  } catch {
    return { project: [], notes: [], raw: r.out };
  }
};
const setRecord = (opts) => write('docs/D-0-governance.md', clRecord(read('docs/D-0-governance.md'), { judge: NAMES[0], ...opts }));
const errLines = (out) => out.split('\n').filter((l) => /::error::/.test(l)).join('\n');

// ---------------------------------------------------------------- 仮の判定と G-1 の前提条件(決定4)
fixes(['ADR-0113 決定4', 'ADR-0113 決定1', '標準 2.8']);
check('仮の判定: 準備(3名・MVP・CL0。節16 は様式のまま)', init('cl0', { record: false }).ok);
refused('仮の判定: 節16 が様式のままの D-0 は、D-0 の検査が失敗する', checkD0(), '初期化の回答 q-criticality は仮の判定です');
{
  const j = next();
  const stage = (j.project ?? []).find((s) => /安全重要度の判定の記録と記名が無い/.test(s.stage ?? ''));
  check('仮の判定: /pit は判定の記録と記名が無いことを人の判断待ちに出す', Boolean(stage) && stage.kind === 'human-wait', JSON.stringify(j.project ?? j.raw).slice(0, 1500));
}
setRecord({});
check('仮の判定: 判定の欄と判定者(D-0 表1 の決定者)の記名を書くと、D-0 の検査が通る', checkD0().ok, checkD0().out);
// 議長の裁定 J-12・X-2: 判定者の記名は、記録を入れたコミットの時点の決定者と照らす(自己申告の判定日では決まらない)
fixes(['ADR-0113 決定1', 'ADR-0111 決定6']);
setRecord({ judge: NAMES[1] });
refused('仮の判定: まだコミットしていない記録の判定者が、現在の決定者でなければ D-0 の検査が失敗する', checkD0(), '記録の時点(未コミット。現在の構成)', '決定者(山田 太郎)ではありません');
git('add', '-A');
git('commit', '-q', '-m', 'docs: 佐藤が判定者として記名した記録');
refused('仮の判定: 記録を入れたコミットの時点で決定者でなかった人(佐藤)の記名は、D-0 の検査が失敗する', checkD0(), '記録を入れたコミット', '決定者(山田 太郎)ではありません');
fixes(['ADR-0113 決定4', 'ADR-0113 決定1', '標準 2.8']);
setRecord({ judge: 'Claude' });
refused('仮の判定: 判定者に AI の名義を書いた記録は、D-0 の検査が失敗する', checkD0(), '安全重要度の判定の判定者の記名を受け付けられません');
setRecord({ confirmer: NAMES[0], step: '段1', basis: '別の自然人', confirmedAt: '2026-09-30' });
refused('仮の判定: 確認者が判定者と同じ人なら、D-0 の検査が失敗する', checkD0(), '判定者と同じ人です');
setRecord({ cls: 'CL1' });
refused('仮の判定: 記録の区分(CL1)より構成の回答(CL0)が低ければ、D-0 の検査が失敗する', checkD0(), '食い違います');

// ---------------------------------------------------------------- 旧い構成(移行)
fixes(['ADR-0113 決定4', '標準 2.8']);
// 旧い構成は、G-1 の判定日時と、判定記録を入れたコミットの時刻の両方が境界(2026-11-05)より前の構成。止めた時計(2026-10-01)の
// コミットは境界の前にある。緩い扱いは CL0 で規制業でなく F.2 の Q1 が「いいえ」の案件に限る(議長の裁定 X-1・X-3)
const G1_FORM = '# ゲート判定記録\n\n| 項目 | 値 |\n| --- | --- |\n| ゲート | G-1 企画承認 |\n| 対象 | P-001 |\n| 判定者 | 山田 太郎 |\n| 判定日時 | 2026-09-01 10:00 |\n| 結果 | 通過 |\n';
check('旧い構成: 準備(CL0。判定者の欄を空にした記録)', init('cl0').ok);
setRecord({ judge: '' });
write('docs/gates/g1-P-001-2026-09-01.md', G1_FORM);
refused('旧い構成: G-1 の判定記録をまだコミットしていなければ旧い構成に数えず、D-0 の検査が失敗する', checkD0(), '初期化の回答 q-criticality は仮の判定です');
git('add', '-A');
git('commit', '-q', '-m', 'docs: G-1 の判定記録');
{
  const r = checkD0();
  check('旧い構成: 判定の記録を求める前に G-1 を通過済みの CL0・F.2「いいえ」なら、判定の記録の不備で D-0 の検査を失敗させず注意にする', r.ok && /旧い構成のため、遡って失敗させません/.test(r.out) && !/安全重要度の判定/.test(errLines(r.out)), r.out);
}
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^\| 附属書F F\.2 の回答 \| .*\|$/m, '| 附属書F F.2 の回答 | はい。搬送機の停止を制御する |'));
refused('旧い構成: F.2 の Q1 が「はい」なら旧い構成でも緩い扱いに当たらず、D-0 の検査が失敗する', checkD0(), '初期化の回答 q-criticality は仮の判定です');
{
  git('add', '-A');
  git('commit', '-q', '-m', 'docs: fixture');
  const a = run('node', ['scripts/gate/aggregate-evidence.mjs']);
  check('旧い構成: F.2 の Q1 が「はい」の旧い構成で判定者の記名が欠ければ、出荷の集約が欠落に数える(記録を消して止めを外す経路を塞ぐ)', a.out.split('\n').some((l) => /::error::安全重要度の判定の確認/.test(l) && /判定者本人が書ける欠落/.test(l)), a.out.split('\n').slice(-12).join('\n'));
}

// ---------------------------------------------------------------- 確認の未達と出荷(決定2)
fixes(['ADR-0113 決定2', 'ADR-0113 決定1']);
const aggregate = () => {
  git('add', '-A');
  git('commit', '-q', '--allow-empty', '-m', 'docs: fixture');
  return run('node', ['scripts/gate/aggregate-evidence.mjs']);
};
const clGap = (out) => out.split('\n').some((l) => /::error::安全重要度の判定の確認/.test(l));
check('確認: 準備(CL0)', init('cl0').ok);
{
  const a = aggregate();
  check('確認: CL0 で確認者が未達なら、出荷の集約は未達と出し、欠落に数えない', !clGap(a.out) && /未達: 安全重要度の判定の確認/.test(a.out), a.out.split('\n').slice(-12).join('\n'));
}
setRecord({ confirmer: NAMES[1], step: '段2', basis: '直属の上長が異なる', confirmedAt: '2026-09-30' });
write('docs/D-0-governance.md', read('docs/D-0-governance.md').replace(/^\| 附属書F F\.2 の回答 \| .*\|$/m, '| 附属書F F.2 の回答 | はい。搬送機の停止を制御する。安全関連部は停止の監視 |'));
{
  const a = aggregate();
  check('確認: F.2 の Q1 が「はい」で段3 の確認が欠ければ、CL0 でも欠落に数える(G-8 の受容で代えない)', clGap(a.out) && /G-8 の受容で代えない/.test(a.out), a.out.split('\n').slice(-12).join('\n'));
}
setRecord({ confirmer: NAMES[1], step: '段1', basis: '判定者と別の自然人', confirmedAt: '2026-09-30' });
{
  const a = aggregate();
  check('確認: 判定者と別の名簿の人が求める段(CL0 は段1)で確かめれば、未達を出さない', !clGap(a.out) && !/未達: 安全重要度の判定の確認/.test(a.out), a.out.split('\n').slice(-12).join('\n'));
}

// ---------------------------------------------------------------- 区分を下げる変化点(決定3・決定4)
fixes(['ADR-0113 決定4', 'ADR-0113 決定3']);
{
  const r = init('cl1');
  check('引き下げ: 準備(CL1)', r.ok, r.out);
}
// 判定の記録(CL1)を基底ブランチへ入れ、成立させる。引き下げの根拠を求めるのは、成立した記録の区分を下げる場合に限る(議長の裁定 X-10)
git('add', '-A');
git('commit', '-q', '-m', 'docs: CL1 の判定の記録');
const lower = () => change({ kind: 'axis', date: TODAY, summary: '設計で帰結を下げ、CL0 へ', answers: { 'q-criticality': 'cl0' }, decidedBy: NAMES[0], reason: '送金の確定を保留の後に人が確定する設計にした' });
refused('引き下げ: 引き下げの根拠の記録が無い区分を下げる変化点', lower(), '引き下げの根拠');
check('引き下げ: 拒否した変化点は、構成を書き換えない', cfg().answers['q-criticality'] === 'cl1');
write('docs/D-0-governance.md', clRecord(read('docs/D-0-governance.md'), { judge: NAMES[0] }).replace(/^\| 区分の引き下げの根拠 \| .*\|$/m, '| 区分の引き下げの根拠 | 低減の前 CL1 → 後 CL0。送金の確定を保留の後に人が確定する。ADR-0007、F-012 |'));
refused('引き下げ: 根拠が引く ADR・機能仕様が無ければ拒否する', lower(), 'ADR-0007 が context/decisions/ に無い');
write('context/decisions/0007-reversible-transfer.md', '# ADR-0007: 送金の確定を保留にする\n');
write('specs/F-012/spec.md', '# 機能仕様: 送金\n');
accepted('引き下げ: 根拠の記入と、引く ADR・機能仕様がそろえば受け付ける', lower());
check('引き下げ: 反映の後、構成の回答は CL0', cfg().answers['q-criticality'] === 'cl0');

// 議長の裁定 X-10: 仮の判定(初期化の回答 CL1)から最初の判定の記録(CL0)へ揃えるときは、引き下げの根拠を求めない
fixes(['ADR-0113 決定4']);
check('仮の判定の訂正: 準備(CL1。節16 は様式のまま)', init('cl1', { record: false }).ok);
git('add', '-A');
git('commit', '-q', '-m', 'chore: 仮の判定 CL1');
setRecord({ cls: 'CL0' });
accepted('仮の判定の訂正: 最初の判定の記録(CL0)へ構成の回答を揃える変化点は、引き下げの根拠なしで受け付ける', lower());

done();
