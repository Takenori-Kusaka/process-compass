// 時計に関わる決定を、時刻を明示した場面で確かめる(#319 裁定 R-3)。
//
// 移したスイートは、論理の時計(lib/clock.mjs)のもとで流れるので、実時間でしか起きない事象(実行が日付の境をまたぐ、
// next_review を過ぎる)を偶然には踏まない。ここでは、それらを時刻を指定した場面として置く。
//   - 時計が子プロセスと git に届くこと(この試験の前提)
//   - 日付の境(K65): 境の前は翌日の発効日を未来として拒否し、境の後は前日の発効日を、最後の記録より前として拒否する。
//     #319 の調査で matrix-sweep --sweep が UTC 0 時をまたいで 68 件落ちた事象(スイートの TODAY の 1 回計算)を、決定の側から固定する
//   - D-0 の next_review の経過: 過ぎる前の日は「過ぎています」と出さず、過ぎた後は D-0 の検査が落ちる
// confirmedAt(確認日が発効日より後・同じ日)は v3 の t7-4-future・t7-4-yamada が、宣言した時刻のもとで確かめる。
// 時刻帯は tz が確かめる。
// @regress {"now": "2026-10-01T23:59:00Z", "workspaces": ["c", "c0"], "fixes": ["#319"]}
import { workspace, checker, BASE, APPOINTER } from './lib.mjs';

const W = workspace('c');
const { run, write, cfg, gen, change, d0, commit } = W;
const { check, refused, accepted, fixes, done } = checker();
const at = (iso) => ({ REGRESS_NOW: iso });
const changeAt = (iso, c) => {
  write('change.json', c);
  return run('node', ['scripts/init/generate-profile.mjs', '--change', 'change.json'], at(iso));
};
const PEOPLE = [{ id: 'a', name: '山田 太郎' }, { id: 'b', name: '佐藤 花子' }, { id: 'c', name: '鈴木 一郎' }, APPOINTER];

// ---------------------------------------------------------------- 前提: 時計が届く
// 試験を流す経路の時計そのものを確かめる(#319 §8 X-1。固定する決定は ADR-0089 決定5)
fixes(['ADR-0089 決定5']);
const child = run('node', ['-e', 'process.stdout.write(new Date().toISOString() + " " + Date.now())'], at('2026-10-01T23:59:30Z'));
check('時計: 子プロセスの new Date() と Date.now() は、渡した時刻を返す', child.ok && child.out === `2026-10-01T23:59:30.000Z ${Date.parse('2026-10-01T23:59:30Z')}`, child.out);
// git の確認は別の作業用の複製で行う(初期化の前のコミットは、#315 の事前点検が既存の資産に数える)
const G = workspace('c0');
G.write('probe.txt', 'x\n');
G.git('add', '-A');
G.run('git', ['commit', '-q', '-m', 'probe'], at('2026-10-01T23:59:31Z'));
const ct = G.git('log', '-1', '--format=%cI %aI').out.trim();
check('時計: git のコミットの時刻(作成・取り込み)は、渡した時刻になる', ct === '2026-10-01T23:59:31Z 2026-10-01T23:59:31Z' || ct === '2026-10-01T23:59:31+00:00 2026-10-01T23:59:31+00:00', ct);

// ---------------------------------------------------------------- 日付の境(K65)
fixes(['K65']);
// 初期化の事前点検(#315)への調整は、run.mjs の fresh() が作業用の複製に入れる(suite/adjust.mjs が確かめる)
write('answers.json', { ...BASE, 'q-team-size': 'size-3-9', 'q-biz-phase': 'mvp' });
check('境の前(23:59): 初期化の記録の日付は 2026-10-01', gen('--answers', 'answers.json', '--stack', 'node').ok && cfg().changeLog[0].date === '2026-10-01', JSON.stringify(cfg().changeLog?.[0]));
d0('1.0');
gen('--answers', 'process.config.json');
commit('chore: 初期化と D-0');
refused('境の前(23:59): 翌日(2026-10-02)の発効日', change({ kind: 'accountable', date: '2026-10-02', summary: '名簿', people: PEOPLE }), '未来の日付');

// ---------------------------------------------------------------- next_review の経過(D-0 の検査)
fixes(['標準 2.8', '#319']);
const before = run('node', ['scripts/gate/check-d0.mjs'], at('2027-03-30T12:00:00Z'));
check('next_review(2027-03-31)の前日は「過ぎています」と出さない', !before.out.includes('が過ぎています'), before.out);
const after = run('node', ['scripts/gate/check-d0.mjs'], at('2027-04-01T00:00:01Z'));
check('next_review(2027-03-31)を過ぎると、D-0 の検査が落ちる', !after.ok && after.out.includes('next_review 2027-03-31 が過ぎています'), after.out);

// ---------------------------------------------------------------- 境の後(K65)。ここからは翌日の時刻だけを使う
fixes(['K65']);
const next = changeAt('2026-10-02T00:00:01Z', { kind: 'accountable', summary: '名簿', people: PEOPLE });
accepted('境の後(00:00): 発効日を書かない変化点', next);
check('境の後(00:00): スクリプトが書く日付は翌日(2026-10-02)', cfg().changeLog.at(-1).date === '2026-10-02', JSON.stringify(cfg().changeLog.at(-1)));
const stale = changeAt('2026-10-02T00:00:02Z', { kind: 'schedule-only', date: '2026-10-01', summary: '前日の日付で書いた変化点' });
refused('境の後(00:00): 前日(2026-10-01)の発効日 — 実行が日付の境をまたいだときの形', stale, '最後の変化点の記録の日付(2026-10-02)より前');

done();
