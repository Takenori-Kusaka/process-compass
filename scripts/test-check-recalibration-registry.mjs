// 能力依存の定数の登録簿の整合の検査(check-recalibration-registry.mjs)の変異試験(Issue #296 / ADR-0079)
//
// 検査が既知の食い違いで落ちることを確かめる。検査が黙って通る故障(何も見ていない状態)を、通過の表示からは
// 見分けられないためである。実物の表・JSON・構成を読み、1か所ずつ壊して、それぞれが検出されることを確かめる。
//
//   node scripts/test-check-recalibration-registry.mjs   (npm run test:registry)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRegistry, expandIds } from './check-recalibration-registry.mjs';
import { requireInputs } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
requireInputs(ROOT, ['template/scripts/gate/recalibration-registry.json', 'template/process.config.json'], '登録簿の整合の検査の変異試験');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'template/scripts/gate/recalibration-registry.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'template/process.config.json'), 'utf8'));
const docText = fs.readFileSync(path.join(ROOT, 'src/content/docs/phase6-operation/metrics.md'), 'utf8');

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}
const clone = () => JSON.parse(JSON.stringify(registry));
const find = (r, id) => r.constants.find((c) => c.id === id);
const run = (over = {}) => checkRegistry({ registry: over.registry ?? registry, docText: over.docText ?? docText, config: over.config ?? config });
const detects = (problems, re) => assert.ok(problems.some((p) => re.test(p)), `検出されない: ${re}\n${problems.join('\n')}`);

test('対照: 実物の表・JSON・構成は一致する', () => assert.deepEqual(run(), []));

test('展開: 範囲と列挙を ID へ展開する', () => {
  assert.deepEqual(expandIds('RC-09〜RC-12'), ['RC-09', 'RC-10', 'RC-11', 'RC-12']);
  assert.deepEqual(expandIds('RC-01・RC-02・RC-04'), ['RC-01', 'RC-02', 'RC-04']);
});

test('変異: 名称の食い違いを検出する', () => {
  const r = clone();
  find(r, 'RC-05').name = '自己修復の反復上限 3回';
  detects(run({ registry: r }), /RC-05: 定数の名称が違う/);
});

test('変異: 依拠する前提の食い違いを検出する', () => {
  const r = clone();
  find(r, 'RC-01').assumption = '別の前提';
  detects(run({ registry: r }), /RC-01: 依拠する前提が違う/);
});

test('変異: 表のセルに含まれない保証を検出する', () => {
  const r = clone();
  find(r, 'RC-02').guarantee = '表に無い保証';
  detects(run({ registry: r }), /RC-02: 担っている保証が表のセルに含まれない/);
});

test('変異: 能力に依るかの食い違いを検出する', () => {
  const r = clone();
  find(r, 'RC-12').capabilityDependent = true;
  const p = run({ registry: r });
  detects(p, /RC-12: 能力に依るかが違う/);
  detects(p, /要求事項4 の「能力に依らない」周期・窓.*一致しない/);
});

test('変異: JSON から行を落とすと検出する', () => {
  const r = clone();
  r.constants = r.constants.filter((c) => c.id !== 'RC-11');
  detects(run({ registry: r }), /RC-11: 表にあるが JSON に無い/);
});

test('変異: 表から行を落とすと検出する', () => {
  const doc = docText.replace(/^\| RC-08 \|.*\n/m, '');
  assert.notEqual(doc, docText);
  detects(run({ docText: doc }), /RC-08: metrics\.md の登録簿の表に行が無い/);
});

test('変異: noRelaxByCapability を外すと検出する(要求事項4 の人の帯域に由来する定数)', () => {
  const r = clone();
  delete find(r, 'RC-04').noRelaxByCapability;
  detects(run({ registry: r }), /人の帯域に由来する定数.*noRelaxByCapability: true.*一致しない/);
});

test('変異: 列挙に無い定数へ noRelaxByCapability を足すと検出する', () => {
  const r = clone();
  find(r, 'RC-03').noRelaxByCapability = true;
  detects(run({ registry: r }), /人の帯域に由来する定数.*一致しない/);
});

test('変異: 要求事項4 の能力に依らない範囲を狭めると検出する', () => {
  const doc = docText.replace('「能力に依らない」と登録した周期・窓(RC-09〜RC-12)', '「能力に依らない」と登録した周期・窓(RC-09〜RC-11)');
  assert.notEqual(doc, docText);
  detects(run({ docText: doc }), /要求事項4 の「能力に依らない」周期・窓.*一致しない/);
});

test('変異: 要求事項4 が登録簿に無い ID を挙げると検出する', () => {
  const doc = docText.replace('人の帯域に由来する定数(RC-01・RC-02・RC-04)', '人の帯域に由来する定数(RC-01・RC-02・RC-04・RC-99)');
  assert.notEqual(doc, docText);
  const p = run({ docText: doc });
  detects(p, /RC-99 が登録簿の表に無い/);
});

test('変異: 構成に無い configKey を検出する', () => {
  const r = clone();
  find(r, 'RC-05').configKey = 'task.selfHealMaxIterations / task.noSuchKey';
  detects(run({ registry: r }), /RC-05: configKey の "task\.noSuchKey" が、テンプレートの process\.config\.json に無い/);
});

test('変異: キーの形でない configKey を検出する', () => {
  const r = clone();
  find(r, 'RC-06').configKey = 'coverage threshold';
  detects(run({ registry: r }), /RC-06: configKey の "coverage threshold" は構成のキーの形/);
});

test('変異: 要求事項4 の行が読めなければ検出する', () => {
  const doc = docText.replace(/^\| 4 \| 「能力に依らない」.*\n/m, '');
  assert.notEqual(doc, docText);
  detects(run({ docText: doc }), /要求事項4.*を読めない/);
});

console.log(`登録簿の整合の検査の変異試験: ${passed} 件が期待と一致しました`);
