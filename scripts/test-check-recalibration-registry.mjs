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
const docText = fs.readFileSync(path.join(ROOT, 'src/content/docs/phase4-process-design/roles-responsibilities.md'), 'utf8');

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}
const clone = () => JSON.parse(JSON.stringify(registry));
const find = (r, id) => r.constants.find((c) => c.id === id);
const implIds = new Set(fs.readFileSync(path.join(ROOT, 'src/content/docs/community/implementation-ledger.md'), 'utf8').match(/IMPL-\d+/g) ?? []);
const adrIds = new Set(fs.readdirSync(path.join(ROOT, 'src/content/docs/adr')).map((f) => f.match(/^(\d{4})-/)?.[1]).filter(Boolean));
const run = (over = {}) => checkRegistry({ registry: over.registry ?? registry, docText: over.docText ?? docText, config: over.config ?? config, implIds, adrIds });
const setCell = (id, text) => docText.split(/\r?\n/).map((l) => (l.startsWith(`| ${id} |`) ? l.replace(/\|[^|]*\|\s*$/, `| ${text} |`) : l)).join('\n');
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

test('変異: 能力に依る行の「超過・未達のときの扱い」が空なら検出する', () => {
  const blank = (id) => docText.split(/\r?\n/).map((l) => (l.startsWith(`| ${id} |`) ? l.replace(/\|[^|]*\|\s*$/, '|  |') : l)).join('\n');
  detects(run({ docText: blank('RC-04') }), /RC-04: 「超過・未達のときの扱い」の列が空/);
  // 能力に依らない行は空でもよい
  assert.deepEqual(run({ docText: blank('RC-09') }), []);
});

test('変異: 記号だけのセル・対象外・引用の欠落・見出しの欠落を検出する', () => {
  const setCell = (id, text) => docText.split(/\r?\n/).map((l) => (l.startsWith(`| ${id} |`) ? l.replace(/\|[^|]*\|\s*$/, `| ${text} |`) : l)).join('\n');
  detects(run({ docText: setCell('RC-04', '-') }), /RC-04: 「超過・未達のときの扱い」の列が空/);
  detects(run({ docText: setCell('RC-04', '対象外(能力に依らない)。第4章') }), /RC-04: .*「対象外\(能力に依らない\)」とある/);
  detects(run({ docText: setCell('RC-04', '止めない') }), /RC-04: .*条項.*引いていない/);
  const doc = docText.replace('| 超過・未達のときの扱い |', '| 備考 |');
  assert.notEqual(doc, docText);
  detects(run({ docText: doc }), /見出しの6列目が「超過・未達のときの扱い」でない/);
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
  detects(run({ docText: doc }), /RC-08: 第3章 3\.12\.12 の登録簿の表に行が無い/);
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

test('変異: 正しい文の「委任の対象外」は誤検出しない。定型の「対象外(能力に依らない)」は検出する', () => {
  assert.deepEqual(run({ docText: setCell('RC-01', '超えた変更は委任の対象外とする(IMPL-0741)') }), []);
  detects(run({ docText: setCell('RC-01', '対象外(能力に依らない)。IMPL-0741') }), /RC-01: .*「対象外\(能力に依らない\)」とある/);
});

test('変異: 引いた IMPL・ADR の番号が実在しなければ検出する', () => {
  detects(run({ docText: setCell('RC-01', '規模の確認を求める(IMPL-9741)') }), /RC-01: 引いた IMPL-9741 が実装の台帳に無い/);
  detects(run({ docText: setCell('RC-03', '理由を記録する(ADR-0998)') }), /RC-03: 引いた ADR-0998 が決定の記録に無い/);
});

console.log(`登録簿の整合の検査の変異試験: ${passed} 件が期待と一致しました`);
