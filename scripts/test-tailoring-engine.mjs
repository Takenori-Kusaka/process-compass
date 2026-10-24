// テーラリングエンジンの検証スクリプト(npm run test:engine)
// 1. 規則の target id が integrated.yaml / practices.yaml に実在するかの参照整合性チェック
// 2. 要件定義の3ペルソナ+限界ケースのシナリオ検証
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { evaluate, visibleQuestions } from '../src/lib/tailoring-engine.mjs';

const DATA = 'src/data/tailoring';
const load = (p) => parse(readFileSync(p, 'utf-8'));

const questions = load(join(DATA, 'questions.yaml')).questions;
const practices = load(join(DATA, 'practices.yaml')).practices;
const constraints = load(join(DATA, 'constraints.yaml')).constraints;
const rules = readdirSync(DATA)
  .filter((f) => f.startsWith('rules-'))
  .sort()
  .flatMap((f) => load(join(DATA, f)).rules);
const integrated = load('src/data/processes/integrated.yaml');

// --- 1. 参照整合性 ---------------------------------------------------------
const knownIds = {
  gate: new Set(integrated.gates.map((g) => g.id)),
  role: new Set(integrated.roles.map((r) => r.id)),
  phase: new Set(integrated.phases.map((p) => p.id)),
  activity: new Set(integrated.phases.flatMap((p) => p.activities.map((a) => a.id))),
  practice: new Set(practices.map((p) => p.id)),
};
const optionIds = new Set(questions.flatMap((q) => q.options.map((o) => `${q.id}:${o.id}`)));

for (const rule of rules) {
  for (const [qid, opts] of Object.entries(rule.when)) {
    for (const o of opts) {
      assert(optionIds.has(`${qid}:${o}`), `${rule.id}: 条件 ${qid}=${o} が questions.yaml にない`);
    }
  }
  for (const adj of rule.adjustments) {
    const { type, id } = adj.target;
    if (type === 'process') continue;
    assert(knownIds[type]?.has(id), `${rule.id}: 対象 ${type}:${id} が定義に存在しない`);
    if (adj.action === 'merge-into') {
      assert(knownIds[type].has(adj.value), `${rule.id}: 統合先 ${adj.value} が存在しない`);
    }
  }
}
assert(constraints.length === 9, '禁止事項は9件のはず(第8章「テーラリングの禁止事項」と同数)');
console.log(`参照整合性 OK(規則 ${rules.length} 件・質問 ${questions.length} 問)`);

const kb = { questions, rules };

// --- 2. シナリオ検証 -------------------------------------------------------
// ペルソナ1: スタートアップ 2名・PoC(要件定義シナリオ1)
{
  const r = evaluate(kb, {
    'q-team-size': 'size-1-2',
    'q-biz-phase': 'poc',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-yes',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile['gate:g-indep-review'].state, 'omit', 'PoC では独立レビュー省略');
  assert.equal(r.profile['gate:g-ship'].state, 'omit', 'PoC では出荷判定省略');
  assert.equal(r.profile['gate:g-plan-approval'].state, 'simplify');
  assert.equal(r.profile['gate:g-req-agree'].state, 'merged-into:g-spec-cycle');
  assert.equal(r.profile['practice:debt-management'].params.mode, 'record-only');
  assert.equal(r.profile['role:value-owner'].params.canMergeWith, 'tech-lead');
  assert.equal(r.warnings.length, 0, 'このペルソナで衝突は起きないはず');
  // シナリオ1 の主張(src/content/docs/tool/requirements.md)。残るゲートは G-1(簡略)・G-3・G-4・G-5・G-8。
  // 確認者がいる場合、CI 基準は厳格化しない(G-6 の代わりの厳格化は無い。#318 / ADR-0088 決定8)
  for (const gate of ['g-tech-design', 'g-spec-cycle', 'g-ci', 'g-release']) {
    assert(!['omit', 'simplify'].includes(r.profile[`gate:${gate}`]?.state), `シナリオ1: ${gate} は残る`);
  }
  assert.notEqual(r.profile['gate:g-ci']?.state, 'strengthen', 'シナリオ1: 確認者がいる場合、CI 基準は厳格化しない');
  console.log('ペルソナ1(2名・PoC) OK');
}

// ペルソナ1 の変形: 確認者がいない 2名・PoC(シナリオ1 の確認者のいない場合)。
// G-6 は省略ではなく未達(規則のデータは omit で表し、準拠テンプレートが未達として表示する。ADR-0028)。
// CI の厳格化は代償措置であり、未達の解消にも独立レビューの代替にも数えない(ADR-0028 決定6)
{
  const r = evaluate(kb, {
    'q-team-size': 'size-1-2',
    'q-biz-phase': 'poc',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-no',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile['gate:g-indep-review'].state, 'omit');
  assert(r.profile['gate:g-indep-review'].notes.some((n) => n.includes('未達')), 'G-6 の注記は未達として表示すると述べる');
  assert.equal(r.profile['gate:g-ci'].state, 'strengthen', '代償措置として CI 基準を厳格化する');
  assert(r.profile['gate:g-ci'].notes.some((n) => n.includes('代替にも数えない')), '厳格化は独立レビューの代替に数えない');
  assert.equal(r.profile['gate:g-plan-approval'].state, 'simplify', 'G-1 は簡略で残る');
  for (const gate of ['g-tech-design', 'g-release']) {
    assert(!['omit', 'simplify'].includes(r.profile[`gate:${gate}`]?.state), `確認者のいない場合も ${gate} は残る`);
  }
  console.log('ペルソナ1 の変形(2名・PoC・確認者なし) OK');
}

// S0(PoC)で、G-3・G-4・G-5・G-8 に事業ステージの調整が掛からないこと(= 適用)を固定する。
// 第8章 軸B の表は全ゲートの行を持ち、この4つを S0 でも「適用」と定める(第2章 2.5 は軸B を引く)。
// 規則が無いことの結果ではなく、決定として固定する(#310 / ADR-0063)。
for (const size of ['size-1-2', 'size-3-9', 'size-10plus']) {
  const r = evaluate(kb, {
    'q-team-size': size,
    'q-biz-phase': 'poc',
    'q-quality': 'quality-standard',
    'q-criticality': 'cl0',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-yes',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  for (const gate of ['g-tech-design', 'g-spec-cycle', 'g-ci', 'g-release']) {
    const state = r.profile[`gate:${gate}`]?.state;
    assert(
      state === undefined || state === 'require',
      `S0(${size})で ${gate} は適用のはず(第8章 軸B)。実際: ${state}`
    );
    assert(!['omit', 'simplify'].includes(state) && !String(state ?? '').startsWith('merged-into'), `S0(${size})で ${gate} を省略・簡略・統合にしない`);
  }
}
console.log('S0 の G-3・G-4・G-5・G-8 は適用 OK');

// ペルソナ2: 事業会社 8名・グロース・高品質(要件定義シナリオ2)
{
  const r = evaluate(kb, {
    'q-team-size': 'size-3-9',
    'q-biz-phase': 'growth',
    'q-quality': 'quality-high',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-exist',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile['gate:g-ci'].state, 'strengthen');
  assert.equal(r.profile['gate:g-indep-review'].params.coreReviewerCount, 2);
  assert.equal(r.profile['gate:g-indep-review'].params.reviewMode, 'internal-separated');
  assert.equal(r.profile['gate:g-ship'].state, 'strengthen');
  assert.equal(r.profile['practice:debt-management'].params.mode, 'planned-payback');
  // シナリオ2 の主張(src/content/docs/tool/requirements.md)。兼務は推奨ではなく、非推奨として示す(#318)
  assert(r.profile['role:value-owner'].notes.some((n) => n.includes('兼務は非推奨')), 'シナリオ2: 価値責任者と技術判断者の兼務は非推奨');
  console.log('ペルソナ2(8名・グロース・高品質) OK');
}

// ペルソナ3: SIer 15名・安定運用・規制業・受注側(要件定義シナリオ3)
{
  const r = evaluate(kb, {
    'q-team-size': 'size-10plus',
    'q-biz-phase': 'stable',
    'q-quality': 'quality-regulated',
    'q-dev-form': 'vendor',
    'q-existing-gates': 'gates-exist',
    'q-ai-constraint': 'ai-approved-only',
  });
  assert.equal(r.profile['gate:g-req-agree'].params.contractual, true, '要件合意は契約上の確認行為との対応づけの対象');
  assert.equal(r.profile['gate:g-release'].params.contractual, true);
  // 対応づける先を「検収」に固定しない。対応づけるかどうかと先は、締結時に決めて記録する(第8章 軸D、ADR-0069)
  for (const key of ['gate:g-req-agree', 'gate:g-release']) {
    const notes = r.profile[key].notes.join(' / ');
    assert.ok(notes.includes('契約上の確認行為に対応づけるかどうか'), `${key} の注記が、対応づけを締結時に決めると述べる`);
    assert.ok(!notes.includes('検収'), `${key} の注記に「検収」が残っていない`);
  }
  assert.ok(
    r.profile['practice:acceptance'].notes.some((n) => n.includes('契約が成果物の適否を確認する行為を定める場合')),
    '確認の基準の限定は、契約が成果物の適否を確認する行為を定める場合に限る'
  );
  assert.equal(r.profile['gate:g-indep-review'].params.reviewerCount, 2);
  assert.equal(r.profile['gate:g-indep-review'].params.recordFormat, 'audit');
  assert.equal(r.profile['practice:traceability'].params.required, true);
  assert.equal(r.profile['gate:g-ship'].state, 'strengthen');
  // シナリオ3 の主張: 価値責任者を発注側に置くことを契約時に合意する(受注側は価値責任者になれない)
  assert.ok(
    r.profile['role:value-owner'].notes.some((n) => n.includes('価値責任者を発注側に置くことを契約時に合意する')),
    '受注側の構成は、価値責任者を発注側に置く合意を注記する'
  );
  console.log('ペルソナ3(15名・安定運用・規制業・受注側) OK');
}

// 衝突1: PoC(省略)× 高品質(厳格化)→ 品質側が後勝ちし、衝突が記録される
{
  const r = evaluate(kb, {
    'q-team-size': 'size-1-2',
    'q-biz-phase': 'poc',
    'q-quality': 'quality-high',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-yes',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile['gate:g-ship'].state, 'strengthen', '品質(30)が PoC の省略(10)に勝つ');
  assert(r.warnings.some((w) => w.target === 'gate:g-ship'), '衝突が警告として残る');
  console.log('衝突1(PoC×高品質: 後勝ち+警告) OK');
}

// 衝突2: 2名・規制業・外部レビュアなし → 成立しない組み合わせが警告で可視化される
{
  const r = evaluate(kb, {
    'q-team-size': 'size-1-2',
    'q-biz-phase': 'mvp',
    'q-quality': 'quality-regulated',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-no',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile['gate:g-indep-review'].state, 'omit', '限界ケース(40)が最終的に勝つ');
  assert(
    r.warnings.some((w) => w.target.startsWith('gate:g-indep-review')),
    '規制要求との衝突が警告される'
  );
  console.log('衝突2(規制業×レビュアなし: 警告で可視化) OK');
}

// 衝突3(#63): 2名・PoC・外部レビュアなし → 同一アクションの重複と
// 同順位の省略×設定は警告を出さず、省略ゲートに設定の残骸が残らない
{
  const r = evaluate(kb, {
    'q-team-size': 'size-1-2',
    'q-biz-phase': 'poc',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-no',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile['gate:g-ship'].state, 'omit');
  assert.equal(
    r.profile['gate:g-ship'].params.approverMode,
    undefined,
    '省略された出荷判定に判定者設定が残らない'
  );
  assert(
    !r.profile['gate:g-ship'].notes.some((n) => n.includes('価値責任者が兼ねる')),
    '省略された出荷判定に矛盾するメモが残らない'
  );
  assert(
    !r.warnings.some((w) => w.message.includes('「omit」を') && w.message.includes('「omit」で')),
    '同一アクションの重複は警告しない'
  );
  console.log('衝突3(同一結論・同順位の静かな解決) OK');
}

// 条件付き質問: 3名以上なら外部レビュア質問は非表示で、回答が来ても無視される
{
  const answers = {
    'q-team-size': 'size-3-9',
    'q-external-reviewer': 'reviewer-no', // 画面上は出ない質問への残骸回答
    'q-biz-phase': 'growth',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  };
  const vis = visibleQuestions(questions, answers);
  assert(!vis.some((q) => q.id === 'q-external-reviewer'), '外部レビュア質問は非表示');
  const r = evaluate(kb, answers);
  assert(!r.matchedRuleIds.includes('r-s-no-external-reviewer'), '残骸回答は規則に効かない');
  console.log('条件付き質問の無効化 OK');
}

// AI利用不可: AIロールが外れ、外殻はそのまま機能する
{
  const r = evaluate(kb, {
    'q-team-size': 'size-3-9',
    'q-biz-phase': 'stable',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-exist',
    'q-ai-constraint': 'ai-unavailable',
  });
  assert.equal(r.profile['role:ai-agent'].state, 'omit');
  assert.equal(r.profile.process.params.aiLoop, 'disabled');
  console.log('AI利用不可(ループ無効化) OK');
}

// 安全重要度1: CL3(生命重要)は人員不足による独立レビュー省略に勝ち、衝突が可視化される
{
  const r = evaluate(kb, {
    'q-team-size': 'size-1-2',
    'q-biz-phase': 'mvp',
    'q-quality': 'quality-standard',
    'q-criticality': 'cl3',
    'q-dev-form': 'inhouse',
    'q-external-reviewer': 'reviewer-no',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(r.profile.process.params.maxAutonomyLevel, 'L1', 'CL3 は自律度を L1 に固定');
  assert.equal(
    r.profile['gate:g-indep-review'].params.reviewerCount,
    2,
    '省略(40)より安全(50)が優先し、レビュア2名の要求が残る'
  );
  assert(
    r.warnings.some((w) => w.target.startsWith('gate:g-indep-review')),
    '人員不足と安全要求の衝突が警告として残る'
  );
  console.log('安全重要度1(CL3×レビュアなし: 安全側が優先+警告) OK');
}

// 安全重要度2: CL2 は安全成果物を必須化し、CL0 では何も追加されない
{
  const base = {
    'q-team-size': 'size-3-9',
    'q-biz-phase': 'growth',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-exist',
    'q-ai-constraint': 'ai-free',
  };
  const cl2 = evaluate(kb, { ...base, 'q-criticality': 'cl2' });
  assert.equal(cl2.profile['gate:g-plan-approval'].params.safetyRiskAssessment, 'required');
  assert.equal(cl2.profile['gate:g-ship'].params.safetyVerificationRecord, 'required');
  assert.equal(cl2.profile.process.params.maxAutonomyLevel, 'L2');
  assert.equal(cl2.profile['practice:traceability'].params.required, true, 'CL1 の要求を包含する');

  const cl0 = evaluate(kb, { ...base, 'q-criticality': 'cl0' });
  assert.equal(
    cl0.profile['gate:g-plan-approval']?.params?.safetyRiskAssessment,
    undefined,
    'CL0 では安全成果物を追加しない'
  );
  assert.equal(cl0.profile.process?.params?.maxAutonomyLevel, undefined);
  console.log('安全重要度2(CL2 は入れ子で加算・CL0 は無加算) OK');
}

// S0 の独立レビュー(G-6): 標準品質・CL0 は省略、CL1 以上は S0 でも適用(#302 / ADR-0065 決定1・3)。
// 規則 r-e-cl1 の set(優先度 50)が、r-b-poc の omit(優先度 10)を取り消して対象を復活させる
for (const size of ['size-3-9', 'size-10plus']) {
  const base = {
    'q-team-size': size,
    'q-biz-phase': 'poc',
    'q-quality': 'quality-standard',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  };
  // IMPL-0109:ok 標準品質・CL0 の S0 は、独立レビューの省略がそのまま効く(対照)
  const cl0 = evaluate(kb, { ...base, 'q-criticality': 'cl0' });
  assert.equal(cl0.profile['gate:g-indep-review'].state, 'omit', `S0・標準品質・CL0(${size})は独立レビューを省略`);
  assert.equal(cl0.profile['gate:g-ship'].state, 'omit', `S0・標準品質・CL0(${size})は出荷判定を省略`);
  // IMPL-0109:ng CL1 以上の S0 で独立レビューを省略する入力は、r-e-cl1 が省略を取り消す(省略のままなら落ちる)
  for (const cl of ['cl1', 'cl2', 'cl3']) {
    const r = evaluate(kb, { ...base, 'q-criticality': cl });
    const state = r.profile['gate:g-indep-review']?.state;
    assert.equal(state, 'standard', `S0・${cl.toUpperCase()}(${size})は独立レビューを適用する(軸B の省略を適用しない)。実際: ${state}`);
    assert(
      r.warnings.some((w) => w.target === 'gate:g-indep-review' && w.winner === 'r-e-cl1'),
      `S0・${cl.toUpperCase()}(${size}): 省略の取り消しが警告として残る`
    );
  }
}
console.log('S0 の G-6(CL0 は省略、CL1 以上は適用) OK');

// 事業ステージ × 安全重要度の全升で、G-6 の状態と範囲・G-7 の状態を固定する(#318 / ADR-0088 決定4)。
// CL1 以上では、軸B による G-6・G-7 の緩和(省略・簡略・範囲の限定)を、どのステージでも適用しない。
// CL2・CL3 の S0 の G-7 の復帰は、r-e-cl2 の set の副作用ではなく、r-e-cl1 の restore の決定による。
// 厳格化(S2 の安定運用・CL3・品質「高」)は restore で下がらない
{
  const PHASES = ['poc', 'mvp', 'growth', 'stable'];
  const CLS = ['cl0', 'cl1', 'cl2', 'cl3'];
  const expectG7 = (phase, cl) =>
    cl === 'cl3' || phase === 'stable' ? 'strengthen' : cl !== 'cl0' ? 'standard' : { poc: 'omit', mvp: 'simplify', growth: 'standard' }[phase];
  const expectG6 = (phase, cl) => (phase === 'poc' && cl === 'cl0' ? 'omit' : 'standard');
  const expectScope = (phase, cl) => (cl !== 'cl0' ? 'all' : phase === 'mvp' ? 'core-only' : undefined);
  /** 全升を調べ、期待と食い違う升を返す(空なら全升が期待どおり) */
  const matrixProblems = (k, size, reviewer = undefined) => {
    const out = [];
    for (const phase of PHASES) {
      for (const cl of CLS) {
        const r = evaluate(k, {
          'q-team-size': size,
          ...(reviewer ? { 'q-external-reviewer': reviewer } : {}),
          'q-biz-phase': phase,
          'q-quality': 'quality-standard',
          'q-criticality': cl,
          'q-dev-form': 'inhouse',
          'q-existing-gates': 'gates-none',
          'q-ai-constraint': 'ai-free',
        });
        const g6 = r.profile['gate:g-indep-review'];
        const g7 = r.profile['gate:g-ship'];
        const at = `${size}${reviewer ? `・${reviewer}` : ''}・${phase}・${cl}`;
        // 1〜2名の体制で CL1 以上は、構成そのものを認めない(第8章 軸E・ADR-0028)。期待は「認めない組み合わせ」の注記
        if (size === 'size-1-2' && cl !== 'cl0') {
          if (!(r.profile['process']?.notes ?? []).some((n) => /認めない/.test(n ?? ''))) out.push(`${at}: 認めない組み合わせの注記が無い`);
          continue;
        }
        // 確認者を置けない 1〜2名の CL0 は、どのステージでも G-6 を適用しない(準拠テンプレートは未達として表示する)
        if (reviewer === 'reviewer-no') {
          if (g6?.state !== 'omit') out.push(`${at}: G-6 ${g6?.state}(期待 omit。未達として表示する)`);
          if ((g7?.state ?? 'standard') !== expectG7(phase, cl)) out.push(`${at}: G-7 ${g7?.state}(期待 ${expectG7(phase, cl)})`);
          continue;
        }
        if ((g6?.state ?? 'standard') !== expectG6(phase, cl)) out.push(`${at}: G-6 ${g6?.state}(期待 ${expectG6(phase, cl)})`);
        if (g6?.params?.scope !== expectScope(phase, cl)) out.push(`${at}: G-6 の範囲 ${g6?.params?.scope}(期待 ${expectScope(phase, cl)})`);
        if ((g7?.state ?? 'standard') !== expectG7(phase, cl)) out.push(`${at}: G-7 ${g7?.state}(期待 ${expectG7(phase, cl)})`);
        // 適用へ戻したゲートが、省略の前に決まっていた設定を失わない(G-6 のレビューの方式、G-7 の判定者の方式)
        if (expectG6(phase, cl) !== 'omit' && !g6?.params?.reviewMode) out.push(`${at}: G-6 のレビューの方式が無い`);
        if (expectG7(phase, cl) !== 'omit' && !g7?.params?.approverMode) out.push(`${at}: G-7 の判定者の方式が無い`);
      }
    }
    return out;
  };
  for (const [size, reviewer] of [['size-1-2', 'reviewer-yes'], ['size-1-2', 'reviewer-no'], ['size-3-9'], ['size-10plus']]) {
    // IMPL-0345:ok 規則データのとおりなら、全升が期待どおり(CL1 以上は G-6 を全変更、G-7 を適用。厳格化は下がらない。1〜2名の CL1 以上は認めない注記)
    assert.deepEqual(matrixProblems(kb, size, reviewer), [], `全升の G-6・G-7(${size}${reviewer ? `・${reviewer}` : ''})`);
  }
  // IMPL-0345:ng r-e-cl1 から G-7 の restore と G-6 の範囲の設定を外した規則では、CL1 以上の S0・S1 の升が食い違いとして出る
  const weakened = {
    questions,
    rules: rules.map((r) =>
      r.id === 'r-e-cl1'
        ? { ...r, adjustments: r.adjustments.filter((a) => a.action !== 'restore' && a.param !== 'scope') }
        : r
    ),
  };
  const found = matrixProblems(weakened, 'size-3-9');
  assert(found.some((p) => p.includes('poc・cl1: G-7 omit')), `CL1・S0 の G-7 の省略を検出する: ${found.join(' / ')}`);
  assert(found.some((p) => p.includes('mvp・cl1: G-7 simplify')), 'CL1・S1 の G-7 の簡略を検出する');
  assert(found.some((p) => p.includes('mvp・cl2: G-6 の範囲 core-only')), 'CL2・S1 の G-6 のコア機能への限定を検出する');
  // r-e-cl1 の restore が G-7 の省略・簡略を取り消したことを、警告として残す(r-e-cl2 の副作用ではない)
  const s0cl2 = evaluate(kb, {
    'q-team-size': 'size-3-9',
    'q-biz-phase': 'poc',
    'q-quality': 'quality-standard',
    'q-criticality': 'cl2',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert(s0cl2.warnings.some((w) => w.target === 'gate:g-ship' && w.winner === 'r-e-cl1'), 'S0・CL2 の G-7 の復帰は r-e-cl1 の決定');
  // 品質「高」の厳格化(優先度 30)は、restore(優先度 50)で標準へ下がらない
  const highCl1 = evaluate(kb, {
    'q-team-size': 'size-3-9',
    'q-biz-phase': 'poc',
    'q-quality': 'quality-high',
    'q-criticality': 'cl1',
    'q-dev-form': 'inhouse',
    'q-existing-gates': 'gates-none',
    'q-ai-constraint': 'ai-free',
  });
  assert.equal(highCl1.profile['gate:g-ship'].state, 'strengthen', '品質「高」の G-7 の厳格化は restore で下がらない');
}
console.log('事業ステージ × 安全重要度の全升(G-6 の状態と範囲・G-7) OK');

// restore と設定の復帰の細部(#318 突合 X-8・X-9)。合成の規則で、提案ロジックの文(低い優先度の省略を取り消す)と一致させる
{
  const q = [{ id: 'q1', axis: 'A', text: 'x', options: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }] }];
  const G = { type: 'gate', id: 'g-ship' };
  const mk = (rules) => ({ questions: q, rules: rules.map((r) => ({ when: { q1: ['a'] }, reason: 'r', source: 's', ...r })) });
  // X-9: 同じ優先度の restore は、省略を取り消さない(同じ優先度では構造操作を優先する既存の規則と揃える)
  const same = evaluate(mk([
    { id: 'omit10', priority: 10, adjustments: [{ target: G, action: 'omit', note: 'o' }] },
    { id: 'restore10', priority: 10, adjustments: [{ target: G, action: 'restore', note: 'r' }] },
  ]), { q1: 'a' });
  assert.equal(same.profile['gate:g-ship'].state, 'omit', '同じ優先度の restore は省略を取り消さない');
  const higher = evaluate(mk([
    { id: 'omit10', priority: 10, adjustments: [{ target: G, action: 'omit', note: 'o' }] },
    { id: 'restore20', priority: 20, adjustments: [{ target: G, action: 'restore', note: 'r' }] },
  ]), { q1: 'a' });
  assert.equal(higher.profile['gate:g-ship'].state, 'standard', '高い優先度の restore は省略を取り消す');
  // X-8: 省略 A が無効化した設定は、A を上書きした省略 B が取り消されたときにも戻る
  const chain = evaluate(mk([
    { id: 'set10', priority: 10, adjustments: [{ target: G, action: 'set', param: 'approverMode', value: 'qa', note: 's' }] },
    { id: 'omitA', priority: 10, adjustments: [{ target: G, action: 'omit', note: 'a' }] },
    { id: 'omitB', priority: 40, adjustments: [{ target: G, action: 'omit', note: 'b' }] },
    { id: 'restore50', priority: 50, adjustments: [{ target: G, action: 'restore', note: 'r' }] },
  ]), { q1: 'a' });
  assert.equal(chain.profile['gate:g-ship'].state, 'standard', '省略の連鎖を取り消すと適用へ戻る');
  assert.equal(chain.profile['gate:g-ship'].params.approverMode, 'qa', '上書きされた省略が無効化した設定も戻る');
}
console.log('restore の優先度と、上書きされた省略の設定の復帰 OK');



// 最小体制は3名(#304 / ADR-0066 決定4)。本文(第3章 3.5)の「最小体制は3名」を、兼務禁止の組から総当たりで導く。
// 席を n 名へ割り当てる全通りを調べ、人の単位の兼務禁止(unit: context を除く)をすべて満たす最小の n を求める
{
  const seats = integrated.roles.map((r) => r.id).filter((id) => integrated.separations.some((s) => (s.roles ?? []).includes(id)));
  const pairs = integrated.separations.filter((s) => s.unit !== 'context' && Array.isArray(s.roles) && s.roles.length === 2).map((s) => s.roles);
  const minimum = (ps) => {
    for (let n = 1; n <= seats.length; n++) {
      const total = n ** seats.length;
      for (let k = 0; k < total; k++) {
        const who = {};
        let x = k;
        for (const s of seats) {
          who[s] = x % n;
          x = Math.floor(x / n);
        }
        if (ps.every(([p, q]) => who[p] !== who[q])) return n;
      }
    }
    return null;
  };
  assert.equal(minimum(pairs), 3, '兼務禁止の組をすべて満たす最小の人数は3名のはず(第3章 3.5)');
  // 3名を導くのは、開発者・独立レビュア・出荷判定者の3席が互いに兼ねられないことである
  const trio = ['dev-verifier', 'independent-reviewer', 'qa-gatekeeper'];
  for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) {
    assert(
      pairs.some((p) => p.includes(trio[a]) && p.includes(trio[b])),
      `${trio[a]} × ${trio[b]} の兼務禁止が規則データにあるはず`
    );
  }
  // 独立レビュア × 出荷判定者を欠くと、2名で満たせてしまう(本文の「3名」が規則から導けなくなる)
  const without = pairs.filter((p) => !(p.includes('independent-reviewer') && p.includes('qa-gatekeeper')));
  assert.equal(minimum(without), 2, '独立レビュア × 出荷判定者を欠くと最小は2名になる(この組が3名の根拠である)');
  console.log('最小体制は3名(兼務禁止の組から導出) OK');
}

console.log('\nすべてのシナリオ検証に合格しました');
