#!/usr/bin/env node
// 第8章 軸B の表の升と、テーラリングエンジンの出力の突合(Issue #374 / ADR-0112 決定2・決定3)。
//
//   node scripts/check-stage-table.mjs   (npm run lint:stage-table。npm run check に含む)
//
// 升は「テーラリングの規則が定める結果」であり(第1章 1.7.3)、軸の間の優先により最終の状態は導出の出力を正とする
// (第8章「軸の間の優先」)。規則を変えたときに升が黙ってずれることを止める。条件の本体は scripts/lib/stage-table.mjs。
// 実行のたびに、違反と適合の対(IMPL-0447)を先に確かめてから、本物の表を検査する。

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import YAML from 'yaml';
import { readTableAfterHeading, stageTableProblems, emptySimplified, simplifiedCellProblem } from './lib/stage-table.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/tailoring');
const PAGE = 'src/content/docs/phase4-process-design/tailoring-guide.md';
const HEADING = '## 軸B: 事業ステージによる調整';

const load = (f) => YAML.parse(readFileSync(path.join(DATA, f), 'utf8'));
const kb = {
  questions: load('questions.yaml').questions,
  rules: readdirSync(DATA)
    .filter((f) => f.startsWith('rules-'))
    .sort()
    .flatMap((f) => load(f).rules),
};
const text = readFileSync(path.join(ROOT, PAGE), 'utf8');
const table = readTableAfterHeading(text, HEADING);
if (!table || !table.rows.length) {
  console.error(`${PAGE}: 見出し「${HEADING}」の直下に表がありません`);
  process.exit(1);
}

// --- 違反と適合の対(検査が食い違いを捉える力を持つこと) ---------------------------------
const replaceCell = (gate, col, cell) => ({
  ...table,
  rows: table.rows.map((r) => (r.label.includes(`(${gate})`) ? { ...r, cells: r.cells.map((c, i) => (i === col ? cell : c)) } : r)),
});
// IMPL-0447:ng 旧い升(S1 の G-7「簡略(CL1 以上は適用)」)は、エンジンの出力(適用)と食い違い、中身の無い簡略として出る
const oldS1 = stageTableProblems(replaceCell('G-7', 1, '簡略(CL1 以上は適用)'), kb);
assert(oldS1.some((p) => /出荷判定\(G-7\).*升は「簡略」/.test(p)), `S1 の G-7 の旧い升を検出する: ${oldS1.join(' / ')}`);
assert(oldS1.some((p) => /減らすものの限定が無い/.test(p)), '中身の無い簡略を検出する');
// 上書きの条件を書き落とした升(S0 の G-7 の品質「高」以上)は、エンジンが適用へ戻す条件の欠けとして出る
const noQuality = stageTableProblems(replaceCell('G-7', 0, '省略(CL1 以上は適用)'), kb);
assert(noQuality.some((p) => /quality-high の構成でエンジンは「適用」へ戻すが、升の括弧にその条件が無い/.test(p)), `上書きの条件の欠けを検出する: ${noQuality.join(' / ')}`);
// 戻らない条件を書いた升(S0 の G-1 に CL1 以上を書く)は、書いた条件で戻らない食い違いとして出る
const wrongCond = stageTableProblems(replaceCell('G-1', 0, '簡略(1枚企画書。CL1 以上は適用)'), kb);
assert(wrongCond.some((p) => /cl1 を上書きの条件に書くが/.test(p)), `書いた条件で戻らない升を検出する: ${wrongCond.join(' / ')}`);
// 範囲の限定の上書きを書き落とした升(S1 の G-6)
const noScope = stageTableProblems(replaceCell('G-6', 1, '適用(コア機能)'), kb);
assert(noScope.some((p) => /cl1 の構成でエンジンは全変更へ戻すが/.test(p)), `範囲の上書きの条件の欠けを検出する: ${noScope.join(' / ')}`);
// 範囲の限定(コア機能)を書き落とした升(S1 の G-6 を「適用」だけにする。突合 X-1)
const noCore = stageTableProblems(replaceCell('G-6', 1, '適用'), kb);
assert(noCore.some((p) => /範囲をコア機能に限るが、升の括弧に限定「コア機能」が無い/.test(p)), `範囲の限定の書き落としを検出する: ${noCore.join(' / ')}`);
assert.equal(emptySimplified('簡略'), true, '括弧の無い簡略は中身が無い');
// 表記の揺れで読めない「簡略」の升を止める(突合 X-4)
for (const c of ['簡略化', '簡略(1枚企画書)。', '**簡略化**']) assert.equal(simplifiedCellProblem(c), 'unreadable', `読めない簡略の升を止める: ${c}`);
assert.equal(simplifiedCellProblem('簡略(CL1 以上は適用)'), 'empty', '中身の無い簡略を止める');
assert.equal(simplifiedCellProblem('簡略(1枚企画書)'), null, '限定のある簡略は通る(揺れの検査)');
// IMPL-0447:ok 本物の表と規則データは一致する。中身のある簡略(1枚企画書)は通る
assert.equal(emptySimplified('簡略(1枚企画書)'), false, '限定のある簡略は通る');
const problems = stageTableProblems(table, kb);
if (problems.length) {
  console.error(`第8章 軸B の表の升とエンジンの出力の突合: ${problems.length} 件の食い違い(${PAGE})`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('升は規則が定める結果です(第1章 1.7.3)。最終の状態は導出の出力を正とします(第8章「軸の間の優先」)。升か規則データのどちらが誤りかを決めて直してください');
  process.exit(1);
}
console.log(`第8章 軸B の表の升とエンジンの出力の突合: ゲートの行 ${table.rows.filter((r) => /\(G-\d\)/.test(r.label)).length} 行 × 4 ステージ、上書きの条件(CL1〜CL3・品質「高」・規制業)で一致`);
