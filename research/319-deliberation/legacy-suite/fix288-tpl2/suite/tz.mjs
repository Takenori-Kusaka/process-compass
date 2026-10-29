// スクリプトが自動で書く日付は、手元の時刻帯の日付で書く(協定世界時の日付で書かない)。
//   sh tmp/fix2-g3a/fresh.sh z && node tmp/fix2-g3a/tz.mjs
//
// 時刻を固定する手段は持たない。代わりに、互いに 25 時間離れた2つの時刻帯(UTC+14 と UTC-11)で実行する。
// どの瞬間でも、この2つの時刻帯の日付は異なる。両方で「その時刻帯の日付」が書かれていれば、
// 協定世界時の日付を書いていないことが確かめられる。日本時間(UTC+9)でも同じ確認をする。
import { workspace, checker, BASE, APPOINTER, BASIS } from './lib.mjs';

const { run, write, cfg, git, resetTo, commit, d0 } = workspace('z');
const { check, done } = checker();

const dayIn = (timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const gen = (tz, ...args) => run('node', ['scripts/init/generate-profile.mjs', ...args], { TZ: tz });
const change = (tz, c) => {
  write('change.json', c);
  return gen(tz, '--change', 'change.json');
};
const PEOPLE = [
  { id: 'a', name: '山田 太郎' },
  { id: 'b', name: '佐藤 花子' },
  { id: 'c', name: '鈴木 一郎' },
  APPOINTER,
];
const SEATS = { 'biz-approver': { accountable: 'a' }, 'value-owner': { accountable: 'a' }, 'tech-lead': { accountable: 'a' }, 'dev-verifier': { accountable: 'b' }, 'independent-reviewer': { accountable: 'c' }, 'qa-gatekeeper': { accountable: 'c' }, 'context-owner': { accountable: 'a' }, 'ai-maintainer': { accountable: 'a' }, 'ai-ops': { accountable: 'c' } };
const P = { model: 'm-1', instructions: 'i', permissions: 'p' };

check('2つの時刻帯の日付は、この瞬間に異なる(前提)', dayIn('Pacific/Kiritimati') !== dayIn('Pacific/Pago_Pago'), `${dayIn('Pacific/Kiritimati')} / ${dayIn('Pacific/Pago_Pago')}`);
git('tag', 'tpl');

for (const [tz, offset] of [
  ['Pacific/Kiritimati', '+14:00'],
  ['Pacific/Pago_Pago', '-11:00'],
  ['Asia/Tokyo', '+09:00'],
]) {
  resetTo('tpl');
  const day = dayIn(tz);
  const utcDay = new Date().toISOString().slice(0, 10);
  write('answers.json', { ...BASE, 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp', 'q-criticality': 'cl1' });
  check(`${tz}: 初期化`, gen(tz, '--answers', 'answers.json', '--stack', 'node').ok);
  let c = cfg();
  check(
    `${tz}: 生成日時と最初の記録が、手元の時刻帯(${offset})の ${day}${day !== utcDay ? `。協定世界時の日付(${utcDay})と異なる` : ''}`,
    c.generatedAt.startsWith(day) && c.generatedAt.endsWith(offset) && String(c.changeLog[0].date).startsWith(day) && c.changeLog[0].at.endsWith(offset),
    JSON.stringify([c.generatedAt, c.changeLog[0].date, c.changeLog[0].at])
  );
  // 委任の席を作る(発効日を書かない入力。日付はスクリプトが書く)
  // 第3巡(K65): D-0 が無い状態では変化点を適用しない。(K60) 全席が未記入の3名体制は、名簿を先に置き、任命権者の記名で席を埋める
  d0('1.0');
  check(`${tz}: 名簿`, change(tz, { kind: 'accountable', summary: '名簿', people: PEOPLE }).ok);
  check(`${tz}: 席の記入(任命権者の記名)`, change(tz, { kind: 'accountable', summary: '3名', seats: SEATS, decidedBy: APPOINTER.name, reason: '組織が任命した' }).ok);
  // CL0 へ下げるのは決定。以後の場面のために日付つきで反映する
  write('docs/gates/x.md', '# 記録\n');
  check(`${tz}: 区分を下げる(記名つき)`, change(tz, { kind: 'axis', summary: 'CL0', answers: { 'q-criticality': 'cl0' }, decidedBy: 'a', reason: '設計で帰結を下げた' }).ok);
  const dlg = change(tz, {
    kind: 'mode',
    summary: '委任',
    seats: { 'dev-verifier': { mode: 'delegated', performer: P, fallback: 'human', qualification: { confirmedAt: '2026-09-01', performedBy: 'a', approvedBy: 'b', cases: 'x', result: 'x', performer: P } } },
    delegation: { rules: [{ id: 'DR-1', seat: 'dev-verifier', changeType: '表示文言', paths: ['src/i18n/**'], decidedBy: 'b', decidedAt: '2026-09-01', reason: 'r' }], changeTypes: [{ id: '表示文言', registeredBy: 'a', registeredAt: '2026-09-01', basis: BASIS }] },
    ruleApprovedBy: 'a',
    decidedBy: 'b',
    reason: 'r',
  });
  c = cfg();
  const last = c.changeLog.at(-1);
  check(
    `${tz}: 変化点の記録の日付(date)・時刻(at)・規則の承認日(approvedAt)が、手元の ${day}`,
    dlg.ok && last.date === day && last.at.startsWith(day) && last.at.endsWith(offset) && c.delegation.rules[0].approvedAt === day,
    dlg.out.split('\n').slice(-6).join('\n') + JSON.stringify([last.date, last.at, c.delegation.rules[0].approvedAt])
  );
  // 席の責任者の交代で、承認が失効する(失効日)。続けて、安全重要度を上げて人が減る(出荷できない状態の発生日)
  const swap = change(tz, { kind: 'accountable', summary: '交代', people: [...PEOPLE, { id: 'd', name: '高橋 次郎' }], seats: { 'dev-verifier': { accountable: 'd' } }, decidedBy: 'a', reason: '高橋へ' });
  c = cfg();
  check(`${tz}: 承認の失効日(lapsed.at)が、手元の ${day}`, swap.ok && c.seats.find((s) => s.role === 'dev-verifier').qualification.lapsed?.at === day, JSON.stringify(c.seats.find((s) => s.role === 'dev-verifier').qualification));
  check(`${tz}: 安全重要度を上げる`, change(tz, { kind: 'axis', summary: 'CL1', answers: { 'q-criticality': 'cl1' } }).ok);
  const shrink = change(tz, { kind: 'headcount', summary: '2名へ', answers: { 'q-team-size': 'size-1-2', 'q-external-reviewer': 'reviewer-yes' }, people: [PEOPLE[0], PEOPLE[2]], seats: { 'dev-verifier': { accountable: 'a' } }, decidedBy: 'a', reason: '山田が引き取る' });
  c = cfg();
  check(`${tz}: 出荷できない状態の発生日(shipBlocked.since)が、手元の ${day}`, shrink.ok && c.shipBlocked?.since === day, shrink.out.split('\n').slice(-5).join('\n') + JSON.stringify(c.shipBlocked));
  check(`${tz}: 契約検査(要約値の連鎖は保たれる)`, run('node', ['scripts/gate/verify-gate-contract.mjs'], { TZ: tz }).ok, run('node', ['scripts/gate/verify-gate-contract.mjs'], { TZ: tz }).out);
  // 別の時刻帯で再生成しても、既存の記録と構成は書き換わらない
  const before = JSON.stringify(c);
  const other = tz === 'Asia/Tokyo' ? 'Pacific/Pago_Pago' : 'Asia/Tokyo';
  check(`${tz}: 別の時刻帯(${other})で再生成しても、既存の記録は書き換わらない`, gen(other, '--answers', 'process.config.json').ok && JSON.stringify(cfg()) === before);
  commit(tz);
}
done();
