// 検知の値の列挙の検査(check-detection-values.mjs)の変異試験
//
// 実物の一覧・本文・読み取りを読み、1か所ずつ壊して、それぞれが検出されることを確かめる。
//
//   node scripts/test-check-detection-values.mjs   (npm run test:detection-values)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { checkDetectionValues } from './check-detection-values.mjs';
import { requireInputs } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
requireInputs(ROOT, ['template/scripts/gate/detection-values.mjs'], '検知の値の列挙の検査の試験');
const list = YAML.parse(fs.readFileSync(path.join(ROOT, 'src/data/detection-values.yaml'), 'utf8'));
const overviewText = fs.readFileSync(path.join(ROOT, 'src/content/docs/phase4-process-design/overview.md'), 'utf8');
const readerSource = fs.readFileSync(path.join(ROOT, 'template/scripts/gate/detection-values.mjs'), 'utf8');
const base = { list, overviewText, readerSource };
const clone = (x) => JSON.parse(JSON.stringify(x));

let passed = 0;
const t = (name, fn) => { fn(); passed += 1; console.log(`  ok ${name}`); };

t('実物は一致する', () => assert.deepEqual(checkDetectionValues(base), []));
t('本文の列挙から 1 つ欠けると落ちる', () => {
  const text = overviewText.replace('、手戻り率の基準値である。この5つは', 'である。この5つは');
  assert.ok(checkDetectionValues({ ...base, overviewText: text }).length > 0);
});
t('一覧へ権限の値を足すと(根の外・件数の食い違い)落ちる', () => {
  const l = clone(list);
  l.values.push({ name: '金額区分の境界額', configKey: 'authority.amountBoundary' });
  const p = checkDetectionValues({ ...base, list: l });
  assert.ok(p.some((x) => x.includes('許す根')));
  assert.ok(p.some((x) => x.includes('件数')));
});
t('名の順が違うと落ちる', () => {
  const l = clone(list);
  l.values.reverse();
  assert.ok(checkDetectionValues({ ...base, list: l }).length > 0);
});
t('準拠テンプレートの読み取りが欄を読まないと落ちる', () => {
  assert.ok(checkDetectionValues({ ...base, readerSource: readerSource.replaceAll('loadLimit', 'x') }).some((x) => x.includes('loadLimit')));
});
t('本文に列挙が無いと落ちる', () => {
  assert.ok(checkDetectionValues({ ...base, overviewText: 'なし' }).some((x) => x.includes('見つからない')));
});
console.log(`検知の値の列挙の試験: ${passed}件通過`);
