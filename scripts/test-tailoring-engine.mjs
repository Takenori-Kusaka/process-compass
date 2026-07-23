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
assert(constraints.length === 3, '禁止事項は3件のはず');
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
  assert.equal(r.profile['gate:g-req-agree'].params.contractual, true, '要件合意は検収対応');
  assert.equal(r.profile['gate:g-release'].params.contractual, true);
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

console.log('\nすべてのシナリオ検証に合格しました');
