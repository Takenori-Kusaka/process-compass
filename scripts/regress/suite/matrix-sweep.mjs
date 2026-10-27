// 1) 人数・ステージ・CL の組合せで、初期化 → 検査 → D-0 → 席の記入 → 検査 → 再生成 を回す。
// 2) 回答の全組合せで、初期化 → 契約検査 → CLAUDE.md の検査 が通ることを確かめる(--sweep)。
//
// #319 で移したときに足したこと(裁定 R-1.1。matrix.mjs はこのスクリプトへ統合した):
//   - 期待値: 組合せごとの観測(向き・未達・逸脱・下限・各検査の合否)を expected/matrix-sweep.json と比べる。
//     元は合否だけを見て観測を出すだけで、#318 で 3 行(2名 × poc・mvp・growth の向きと下限)が変わっても合格のままだった(品質保証 Q8)。
//     期待値は p302(テンプレート ec8ecd6)での観測。期待値を改めるときは、改める根拠となる決定を引く(裁定 R-4)。
//     出力を期待値へ写すモードは作らない
//   - 分割: --sweep --shard i/N で全組合せを N 個に分けて並列に流す(裁定 R-6 の並列化)
// @regress {"now": "2026-10-01T12:00:00Z", "fixes": ["#284", "#285"], "runs": [{"name": "matrix-sweep", "workspaces": ["m2"]}, {"name": "matrix-sweep.sweep-1", "args": ["--sweep", "--shard", "1/4"], "workspaces": ["m2"]}, {"name": "matrix-sweep.sweep-2", "args": ["--sweep", "--shard", "2/4"], "workspaces": ["m2"]}, {"name": "matrix-sweep.sweep-3", "args": ["--sweep", "--shard", "3/4"], "workspaces": ["m2"]}, {"name": "matrix-sweep.sweep-4", "args": ["--sweep", "--shard", "4/4"], "workspaces": ["m2"]}]}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { workspace, checker, NAMES, SEATS, APPOINTER, fill, TODAY } from './lib.mjs';

const { check, fixes, done } = checker();
fixes(['K60', 'K62', 'K65']);
const EXPECTED = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'expected', 'matrix-sweep.json'), 'utf8'));
/** 観測を期待値と比べる場面。元の合否(ok)と、観測が期待値と一致することの両方を要する */
const scene = (group, tag, ok, observed, detail = '') => {
  const want = EXPECTED[group]?.[tag];
  const same = want === observed;
  const changed = EXPECTED.changed?.[tag];
  return check(tag, ok && same, `${want === undefined ? '期待値が無い' : same ? '' : `期待 ${want}`}\n観測 ${observed}\n${detail}`.trim(), { observed, ...(group === 'rows' && changed ? { changed } : {}) });
};
const shardArg = process.argv.includes('--shard') ? process.argv[process.argv.indexOf('--shard') + 1] : '1/1';
const [shardNo, shardOf] = shardArg.split('/').map(Number);

const W = workspace('m2');
const { DIR, run, git, write, cfg, gen, change, contract, checkD0, checkRules, d0 } = W;
const reset = () => {
  git('checkout', '-q', '--', '.');
  git('clean', '-qfd');
};

/** 人数ごとの席の割り当て(氏名の添字)。並びは SEATS */
const ASSIGN = {
  1: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [0, 0, 0, 0, 1, 0, 0, 0, 1],
  3: [0, 0, 0, 0, 1, 2, 0, 0, 2],
  5: [0, 1, 2, 2, 3, 4, 1, 2, 4],
  15: [0, 1, 2, 3, 4, 5, 6, 7, 8],
};
const SIZE = { 1: 'size-1-2', 2: 'size-1-2', 3: 'size-3-9', 5: 'size-3-9', 15: 'size-10plus' };
const roster = (n) => NAMES.slice(0, n).map((name, i) => ({ id: `p${i + 1}`, name, accounts: [`acct-${i + 1}`] }));

let bad = 0;
const rows = [];
if (!process.argv.includes('--sweep')) {
  for (const n of [1, 2, 3, 5, 15]) {
    for (const phase of ['poc', 'mvp', 'growth']) {
      for (const cl of ['cl0', 'cl1']) {
        reset();
        const answers = { 'q-team-size': SIZE[n], 'q-biz-phase': phase, 'q-quality': 'quality-standard', 'q-criticality': cl, 'q-dev-form': 'inhouse', 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free' };
        if (n <= 2) answers['q-external-reviewer'] = n === 1 ? 'reviewer-no' : 'reviewer-yes';
        write('answers.json', answers);
        const tag = `${n}名 ${phase} ${cl}`;
        const init = gen('--answers', 'answers.json', '--stack', 'node');
        if (!init.ok) {
          const expected = n <= 2 && cl !== 'cl0';
          if (!expected) bad++;
          scene('rows', tag, expected, `初期化を拒否(${expected ? '不変条件。想定どおり' : init.out.split('\n')[0]})`);
          continue;
        }
        const c1 = contract();
        const r1 = checkRules();
        d0('1.0');
        // 第3巡(K60): 1人体制は本人の記名で初回の記入。2名以上は名簿(組織上の任命権者を含む)を先に置き、任命権者の記名で席を埋める
        const seats = Object.fromEntries(SEATS.map((s, i) => [s, { accountable: NAMES[ASSIGN[n][i]] }]));
        // 2名は、1人体制の初回の記入(本人の記名)から始め、2人目の任命と兼務の決定を決定者(1人目)の記名で出す。
        // 任命権者の記名では、席の責任者でも決定者でもないため、兼務(緩める向き)を決定できない
        const signer = n <= 2 ? NAMES[0] : APPOINTER.name;
        const solo = Object.fromEntries(SEATS.map((s) => [s, { accountable: NAMES[0] }]));
        const pre =
          n === 1
            ? { ok: true }
            : n === 2
              ? change({ kind: 'accountable', date: TODAY, summary: '1人目', people: roster(1), seats: solo, decidedBy: NAMES[0], reason: '初期の設定' })
              : change({ kind: 'accountable', date: TODAY, summary: `${n}名の名簿`, people: [...roster(n), APPOINTER] });
        const chg = { kind: 'accountable', date: TODAY, summary: `${n}名で全席を宣言`, ...(n <= 2 ? { people: roster(n) } : {}), seats, decidedBy: signer, reason: '初期の体制' };
        const dry = pre.ok ? change(chg, true) : pre;
        const ch = pre.ok ? change(chg) : pre;
        const c2 = contract();
        const d = checkD0();
        const r2 = checkRules();
        const rg = gen('--answers', 'process.config.json');
        const same = git('status', '--porcelain').out.split('\n').filter((l) => l && !/answers\.json|change\.json|docs\/|\?\?/.test(l) && /process\.config\.json|CLAUDE\.md|PROCESS-PROFILE\.md/.test(l));
        const before = fs.readFileSync(path.join(DIR, 'process.config.json'), 'utf8');
        const rg2 = gen('--answers', 'process.config.json');
        const stable = before === fs.readFileSync(path.join(DIR, 'process.config.json'), 'utf8');
        const c3 = contract();
        const c = cfg();
        const ok = c1.ok && r1.ok && dry.ok && ch.ok && c2.ok && d.ok && r2.ok && rg.ok && rg2.ok && stable && c3.ok;
        if (!ok) bad++;
        const observed = (
          `契約(初期)${c1.ok ? '○' : '×'} 規則${r1.ok ? '○' : '×'} dry${dry.ok ? '○' : '×'} 変化点${ch.ok ? '○' : '×'} 契約(記入後)${c2.ok ? '○' : '×'} D-0${d.ok ? '○' : '×'} 規則${r2.ok ? '○' : '×'} 再生成${rg.ok && rg2.ok && stable ? '○' : '×'} 契約(再生成後)${c3.ok ? '○' : '×'}` +
            ` | 向き ${c.changeLog.at(-1).direction} 未達 ${c.unmet.map((u) => u.gate).join(',') || '-'} 逸脱 ${c.deviations.map((x) => x.gate ?? x.separationId).join(',') || '-'} 下限 ${c.ci.coverageThreshold}`
        );
        const why = [];
        if (!ok) for (const [k, v] of Object.entries({ c1, r1, dry, ch, c2, d, r2, rg, rg2, c3 })) if (!v.ok) why.push(`[${k}] ${v.out.trim().split('\n').slice(-6).join('\n     ')}`);
        scene('rows', tag, ok, observed, why.join('\n'));
        void same;
      }
    }
  }
  reset();
  void rows;
  void bad;
  done();
}

// ---------------------------------------------------------------- 全組合せ
let total = 0;
let index = 0;
let rejected = 0;
let blocked = 0;
const failures = [];
for (const size of ['size-1-2', 'size-3-9', 'size-10plus'])
  for (const phase of ['poc', 'mvp', 'growth', 'stable'])
    for (const quality of ['quality-standard', 'quality-high', 'quality-regulated'])
      for (const cl of ['cl0', 'cl1', 'cl2', 'cl3'])
        for (const form of ['inhouse', 'vendor'])
          for (const rv of size === 'size-1-2' ? ['reviewer-no', 'reviewer-yes'] : [null])
            for (const stack of ['node', 'undetermined']) {
              if (index++ % shardOf !== shardNo - 1) continue;
              reset();
              const a = { 'q-team-size': size, 'q-biz-phase': phase, 'q-quality': quality, 'q-criticality': cl, 'q-dev-form': form, 'q-existing-gates': 'gates-none', 'q-ai-constraint': 'ai-free' };
              if (rv) a['q-external-reviewer'] = rv;
              write('answers.json', a);
              total++;
              const tag = [size, phase, quality, cl, form, rv ?? '-', stack].join(' ');
              const init = gen('--answers', 'answers.json', '--stack', stack);
              if (!init.ok) {
                const expected = size === 'size-1-2' && (cl !== 'cl0' || quality === 'quality-regulated');
                if (!expected) {
                  failures.push(`${tag}: 初期化 ${init.out.split('\n')[0]}`);
                  scene('sweep', tag, false, `初期化を拒否(${init.out.split('\n')[0]})`);
                  continue;
                }
                rejected++;
                // 3名で初期化し、名簿を記入してから、1人が離脱して 1〜2名になる。拒否せず、出荷できない状態として反映されること
                write('answers.json', { ...a, 'q-team-size': 'size-3-9', 'q-external-reviewer': undefined });
                const init3 = gen('--answers', 'answers.json', '--stack', stack);
                const g6Before = ['required', 'simplified'].includes(cfg().gates.g6.state);
                // 第3巡(K65): D-0 が無い状態では変化点を適用しない。(K60) 3名の席は任命権者の記名で埋める
                d0('1.0');
                const filled = fill(W, roster(3), Object.fromEntries(SEATS.map((s, i) => [s, { accountable: NAMES[ASSIGN[3][i]] }])), { summary: '3名' });
                const ch = change({
                  kind: 'headcount',
                  date: TODAY,
                  summary: '3名を割った',
                  answers: { 'q-team-size': 'size-1-2', 'q-external-reviewer': rv },
                  people: roster(2),
                  // 第3巡(K60): 離脱は発生(記名なし)。空いた席(出荷判定者・AI運用担当者)の後任は、別の変化点の決定である。
                  // 確認者なしと回答する場合は、独立レビュアの席も開発者へ戻す(回答と席の矛盾を作らない。K62)
                  seats: { 'qa-gatekeeper': { accountable: null }, 'ai-ops': { accountable: null }, ...(rv === 'reviewer-no' ? { 'independent-reviewer': { accountable: NAMES[0] } } : {}) },
                  // G-6 を適用していない構成(PoC など)では、独立レビュアの席の移し替えは統制を下げないが、任免ではある。決定者の記名で出す
                  ...(rv === 'reviewer-no' && !g6Before ? { decidedBy: NAMES[0], reason: '独立レビュアの席を引き取る' } : {}),
                });
                const c0 = cfg();
                const c = contract();
                const r = checkRules();
                blocked++;
                // 2名が残り、確認者なしと回答して独立レビューが下がる場合は、独立レビューを置かない決定であり、
                // 記名を要する(拒否される)。独立レビューが下がらない構成(変更前から適用していない PoC、
                // 安全重要度の規則が適用を維持する構成)では、下げる変更ではないため通る
                const refusedAsDecision = !ch.ok && rv === 'reviewer-no' && g6Before && ch.out.includes('決定した者の記名') && ch.out.includes('独立レビューを置かない決定');
                // 第3巡: 任免を同じ入力に含む場合、向きは「任免の決定」(出荷できない状態の発生は arising の一覧に残る)
                const reflected = ch.ok && c0.shipBlocked && ['arising', 'appoint'].includes(c0.changeLog.at(-1).direction) && c0.changeLog.at(-1).arising.some((x) => x.includes('出荷できない状態')) && c.ok && r.ok;
                const okBlocked = init3.ok && filled.ok && (refusedAsDecision || reflected);
                if (!okBlocked) {
                  failures.push(`${tag}: 3名を割る変化点 init3=${init3.ok} fill=${filled.ok} change=${ch.ok} shipBlocked=${Boolean(c0.shipBlocked)} 契約=${c.ok} 規則=${r.ok}\n   ${(ch.ok ? c.out : ch.out).trim().split('\n').slice(-4).join('\n   ')}`);
                }
                scene(
                  'sweep',
                  tag,
                  okBlocked,
                  `初期化を拒否(不変条件) → 3名で初期化${init3.ok ? '○' : '×'} 記入${filled.ok ? '○' : '×'} 3名を割る変化点${ch.ok ? '○' : '×'}${refusedAsDecision ? '(独立レビューを置かない決定の記名を要する)' : ''}` +
                    ` 出荷できない${c0.shipBlocked ? '○' : '×'} 向き ${ch.ok ? c0.changeLog.at(-1).direction : '-'} 契約${c.ok ? '○' : '×'} 規則${r.ok ? '○' : '×'}`,
                  (ch.ok ? c.out : ch.out).trim().split('\n').slice(-4).join('\n')
                );
                continue;
              }
              const c = contract();
              const r = checkRules();
              const rg = gen('--answers', 'process.config.json');
              if (!c.ok) failures.push(`${tag}: 契約検査\n   ${c.out.trim().split('\n').filter((l) => l.includes('error')).join('\n   ')}`);
              if (!r.ok) failures.push(`${tag}: CLAUDE.md の検査`);
              if (!rg.ok) failures.push(`${tag}: 再生成\n   ${rg.out.trim().split('\n').slice(0, 4).join('\n   ')}`);
              const cc = cfg();
              scene(
                'sweep',
                tag,
                c.ok && r.ok && rg.ok,
                `契約${c.ok ? '○' : '×'} 規則${r.ok ? '○' : '×'} 再生成${rg.ok ? '○' : '×'} | 未達 ${cc.unmet.map((u) => u.gate).join(',') || '-'} 逸脱 ${cc.deviations.map((x) => x.gate ?? x.separationId).join(',') || '-'} 下限 ${cc.ci.coverageThreshold}`,
                [c.ok ? '' : c.out.trim().split('\n').filter((l) => l.includes('error')).join('\n'), rg.ok ? '' : rg.out.trim().split('\n').slice(0, 4).join('\n')].filter(Boolean).join('\n')
              );
            }
reset();
console.log(`組合せ ${total} 件(分割 ${shardArg}) / 初期化の拒否(不変条件) ${rejected} 件 / うち、3名を割る変化点を確かめた ${blocked} 件 / 失敗 ${failures.length} 件`);
done();
