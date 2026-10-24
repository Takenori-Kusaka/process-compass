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
  console.log('ペルソナ1(2名・PoC) OK');
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
