// #288 第3巡 残り: (A) 記録を1字変えると verify が不一致、(B) 演習の報告と退出の予行の記録のコミットが欠落にならない、
// (C) D-0 節9 の役割名の代理者を候補に数えない。
// 元は research/319-deliberation/legacy-suite/fix288-r3/scen3.mjs(12 場面)。#378 で移した(research/378-deliberation/decision.md)。
// 元は scen2.mjs の後の状態で流した。ここでは a〜g の後に、scen.mjs の状態を変える節(i・q・j)と scen2.mjs の状態を変える段
// (記録の生成と人が書く欄の記入)を、判定せずに再生してから場面へ入る(裁定 R-1。lib-r3.mjs の scenSteps・verifySteps)。
// 区分の下限の規則は逆算した入力(INPUT_ORIGIN.riskFloor)で、対照 f は規則の無い採用者で記録が「10 / 11」になることを固定する。
//   node scripts/regress/run.mjs --only r3-succession
// @regress {"now": "2026-10-07T12:00:00Z", "workspaces": ["r3c", "r3f"], "fixes": ["#288"]}
import { adopter, trialSteps, writeCriteria, scenSteps, verifySteps, check, done, fixes, pre, quiet, TRIAL } from './lib-r3.mjs';

const A = adopter('r3c');
const T = trialSteps(A);
scenSteps(A, T, quiet);
verifySteps(A, quiet);
const { W, trial, records, agg, commit, prCommit } = A;
const { git, write, read } = W;
// 集約の範囲の始点は、元と同じく、この段の始めの HEAD とする(元の段0 の PR は作らない)
const base = git('rev-parse', 'HEAD').out.trim();
const riskInput = [{ by: '標準 G-5', on: '2026-11-11', what: '区分の下限の規則(src/auth/** は R1)を足した(lib-r3.mjs INPUT_ORIGIN.riskFloor)', without: '場面集 #6 が「止まらなかった」になり、記録が「10 / 11」。置き換える「11 / 11」が無く [前提] で止まる(対照 f で固定)' }];

// ---------------------------------------------------------------- (A) 記録を手で1字変えると不一致。人の欄を埋めると一致(補足 S25)
fixes(['ADR-0057 決定11']);
{
  const r0 = trial('run');
  const file = `${TRIAL}/${records().at(-1)}`;
  commit('docs(adoption-trial): 記録');
  let r = trial('verify', file);
  check('A: 出力したままの記録は一致', r0.ok && r.ok, r.out);
  const t = read(file);
  pre('r3c: A 記録の節6 に「11 / 11」がある', t.includes('11 / 11'), t.split('## 6.')[1]?.slice(0, 800));
  const i = t.indexOf('11 / 11');
  write(file, t.slice(0, i) + '10 / 11' + t.slice(i + '11 / 11'.length));
  r = trial('verify', file);
  check('A: 節6 の「11 / 11」を「10 / 11」に変えると不一致', !r.ok && r.out.includes('本文(人が書く欄を除く): 不一致'), r.out, { inputs: riskInput });
  git('checkout', '-q', '--', file);
  let x = A.m(read(file), '| 実施者(氏名と席。席に就く予定の人) | <人が書く> | 要件② |', '| 実施者(氏名と席。席に就く予定の人) | 審査 花子(独立レビュア) | 要件② |', '記録の節0 の実施者');
  x = A.m(x, '| 同上 | <人が書く> | <YYYY-MM-DD> |', '| 同上 | 山本 健一(情報システム部長) | 2027-03-31 |', '記録の節9 の「同上」の行の受容者・期限');
  write(file, x);
  r = trial('verify', file);
  check('A: 実施者と節9 の受容者・期限を埋めても一致', r.ok, r.out);
  commit('docs(adoption-trial): 実施者と受容者を記入');
}

// ---------------------------------------------------------------- (B) 演習の報告と退出の予行の記録を記録だけのコミットで入れる → 欠落にならない。基準集合は PR(補足 S23)
fixes(['ADR-0057 決定11', '標準 G-7']);
{
  write('docs/drills/e-2026-10-06.md', '# 類型E 人へ戻す演習(2026-10-06)\n\n2回目。R2 以下の変更 3 件をマージした。\n');
  const ex = JSON.parse(read('docs/exit-rehearsal.json'));
  ex.rehearsals.push({ model: 'claude-sonnet-5-5', provider: 'Anthropic', alternative: { provider: 'OpenAI', model: 'gpt-5' }, at: '2026-10-06', baseline: 'docs/eval-baseline/cases.json', diff: 'docs/drills/f-2026-10-05.md', approvedBy: '開発 一郎' });
  write('docs/exit-rehearsal.json', ex);
  const recOnly = commit('docs(drills): 演習の報告と退出の予行の記録');
  const cases = JSON.parse(read('docs/eval-baseline/cases.json'));
  cases.cases.push({ id: 'B-13', spec: 'F-001', expect: '追加の既知の入出力' });
  write('docs/eval-baseline/cases.json', cases);
  prCommit('test(eval-baseline): 基準集合を1件足す', { risk: 'R3', confirmer: null });
  const g = agg('B: 出荷の集約', base);
  const gaps = g.ev.gaps ?? [];
  const hit = gaps.filter((y) => y.includes(recOnly.slice(0, 8)) || /docs\/drills|exit-rehearsal/.test(y));
  check('B: 演習の報告と退出の予行の記録だけのコミットは欠落にならない', g.ev.gaps !== undefined && hit.length === 0, hit.join('\n') || g.out.slice(-1500));
  check('B: 記録の置き場に docs/drills/** と docs/exit-rehearsal.json が入る', g.report.includes('docs/drills/**') && g.report.includes('docs/exit-rehearsal.json'), g.report.match(/記録の置き場.*$/m)?.[0]);
  const ro = g.report.match(/記録だけのコミット (\d+) 件/);
  // 元の名前は「B: 記録だけのコミットに数える(${ro?.[1]} 件)」。件数は観測に残す
  check('B: 記録だけのコミットに数える', ro && Number(ro[1]) >= 3, g.report.match(/PR を経ていないコミット.*$/m)?.[0], { observed: ro?.[1] });
  cases.cases.push({ id: 'B-14', spec: 'F-001', expect: '対照' });
  write('docs/eval-baseline/cases.json', cases);
  write('docs/drills/e-2026-10-07.md', '# 類型E(対照)\n');
  const mixed = commit('docs(drills): 演習の報告(基準集合を混ぜた対照)');
  const g2 = agg('B(対照): 出荷の集約', base);
  check('B(対照): 基準集合を記録だけのコミットに混ぜると欠落になる', (g2.ev.gaps ?? []).some((y) => y.includes(mixed.slice(0, 7)) && y.includes('docs/eval-baseline/cases.json')), (g2.ev.gaps ?? []).join('\n'));
  git('reset', '-q', '--hard', 'HEAD~1');
}

// ---------------------------------------------------------------- (C) D-0 節9 の代理者が役割名 → 候補に数えない。名簿の氏名 → 数える(第3章 3.4.3)
fixes(['ADR-0057 決定12', '標準 3.4.3']);
{
  const g = agg('C: 出荷の集約(役割名)', base);
  const qa = g.ev.assurance?.continuity?.successors?.find((s) => s.seat === '出荷判定者');
  check('C: 役割名「品質保証部 課長」の代理者は候補に数えない(理由つき)', qa && qa.counted === 0 && qa.vacant === true && qa.candidates.some((c) => c.name === '品質保証部 課長' && c.counted === false && /名簿/.test(c.why) && /役割名/.test(c.why)), JSON.stringify(qa));
  check('C: 品質レポートに数えなかった候補と理由が出る', /後継不在の席: 出荷判定者\(確認済みで周期内の候補 0 名 < 最低数 1 名\(数えなかった候補: 品質保証部 課長: .*名簿/.test(g.report), g.report.match(/後継不在の席: 出荷判定者.*$/m)?.[0]);
  check('C: 外部向けは件数だけ(役割名も氏名も出さない)', /後継不在の席: 出荷判定者\(確認済みで周期内の候補 0 名 < 最低数 1 名\(数えなかった候補あり。氏名は出さない\)\)/.test(g.ext), g.ext.match(/後継不在の席: 出荷判定者.*$/m)?.[0]);
  write('docs/D-0-governance.md', A.m(read('docs/D-0-governance.md'), '| 出荷判定者 | 品質保証部 課長 | 全部 | 確認済み | 2026-09-26 |', '| 出荷判定者 | 審査 花子 | 全部 | 確認済み | 2026-09-26 |', 'D-0 節9 の出荷判定者の代理者(名簿の人)'));
  commit('docs(D-0): 出荷判定者の代理者を名簿の人に');
  const g2 = agg('C: 出荷の集約(名簿の人)', base);
  const qa2 = g2.ev.assurance?.continuity?.successors?.find((s) => s.seat === '出荷判定者');
  check('C: 名簿の人の氏名なら候補に数える', qa2 && qa2.counted === 1 && qa2.vacant === false, JSON.stringify(qa2));
  write('docs/D-0-governance.md', A.m(read('docs/D-0-governance.md'), '| 出荷判定者 | 審査 花子 | 全部 | 確認済み | 2026-09-26 |', '| 出荷判定者 | 外部 太郎 | 全部 | 確認済み | 2026-09-26 |', 'D-0 節9 の出荷判定者の代理者(名簿に無い人)'));
  commit('docs(D-0): 出荷判定者の代理者を名簿に無い人に');
  const g3 = agg('C: 出荷の集約(名簿に無い人)', base);
  const qa3 = g3.ev.assurance?.continuity?.successors?.find((s) => s.seat === '出荷判定者');
  check('C: 名簿に無い名義は候補に数えない', qa3 && qa3.counted === 0 && qa3.candidates[0].why.includes('名簿'), JSON.stringify(qa3));
  git('reset', '-q', '--hard', 'HEAD~2');
}

// ---------------------------------------------------------------- f(対照): 区分の下限の規則の無い採用者では、場面集 #6 が止まらず、記録が「10 / 11」
fixes(['ADR-0057 決定11', '標準 G-5']);
{
  const F = adopter('r3f', { riskFloor: false });
  writeCriteria(F);
  const r = F.trial('run');
  const rec = F.records().length ? F.W.read(`${TRIAL}/${F.records().at(-1)}`) : '';
  check('f(対照・区分の下限の規則なし): 場面集 #6 は「止まらなかった」、記録の節6 は「10 / 11」', r.ok && /^\| 6 \| [^\n]*\*\*止まらなかった\*\*: 区分の下限の規則/m.test(rec) && rec.includes('| 10 / 11 |') && !rec.includes('11 / 11'), rec.split('## 3.')[1]?.slice(0, 1500) ?? r.out.slice(-1500));
}

done();
