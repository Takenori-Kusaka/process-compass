// 準拠テンプレートの様式が、標準の第6章の必須欄を持っているかを検査する。
//
//   node scripts/check-template-fields.mjs
//
// 正本は標準の第6章です。テンプレートの様式は標準の部分集合と定めており(ADR-0040)、
// 全文の一致は求めません。求めるのは、対応表(src/data/template-fields.yaml)に
// 登録した必須欄が存在することだけです。
//
// 検査は2方向で行います。
//   1. 標準 → 対応表     : standard の文字列が標準の本文に実在するか
//   2. 対応表 → テンプレート: template の文字列がテンプレートの様式に存在するか
//
// 1 を欠くと、対応表が古い欄名を保持したまま通ります。標準で欄名を変えたときに
// 対応表の更新を強制するのが 1 の役目です。
//
// submodule(template/)を初期化していない環境では、1 を実施したうえで、検査を失敗させます。
// 入力が無いために 2 を実施できないことを、通過として扱わないためです(Issue #293 / ADR-0077)。
// 取得: git submodule update --init --recursive

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { missingInputs, describeMissing } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(ROOT, 'template');
const STANDARD = path.join(ROOT, 'src/content/docs/phase4-process-design/deliverable-templates.md');

const spec = YAML.parse(fs.readFileSync(path.join(ROOT, 'src/data/template-fields.yaml'), 'utf8'));
const standardText = fs.readFileSync(STANDARD, 'utf8');
const missing = missingInputs(ROOT, ['template', 'template/process.config.json']);
const templateReady = missing.length === 0;

const problems = [];
let checked = 0;
let omitted = 0;

for (const form of spec.forms ?? []) {
  const filePath = path.join(TEMPLATE, form.file);
  const body = templateReady && fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;

  if (templateReady && body === null) {
    problems.push(`${form.name}: ${form.file} がありません`);
    continue;
  }

  for (const field of form.fields ?? []) {
    checked += 1;

    // 方向1: 標準の本文に実在するか
    if (!standardText.includes(field.standard)) {
      problems.push(
        `${form.name}: 「${field.standard}」が標準の第6章に見つかりません。\n` +
          `  標準側で欄名を変えた場合は src/data/template-fields.yaml を更新してください`
      );
      continue;
    }

    if (field.omit) {
      omitted += 1;
      continue;
    }

    // 方向2: テンプレートの様式に存在するか
    if (body !== null && !body.includes(field.template)) {
      problems.push(
        `${form.name}: 「${field.template}」が ${form.file} にありません。\n` +
          `  対応する標準の記述: 「${field.standard}」\n` +
          `  落とすと決めた場合は src/data/template-fields.yaml の当該欄へ omit: <理由> を書いてください`
      );
    }
  }
}

if (!templateReady) {
  problems.push(describeMissing('対応表 → テンプレートの方向', missing));
}

if (problems.length > 0) {
  console.error('必須欄の検査に失敗しました:\n');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\n規約: src/content/docs/adr/0040-template-forms-as-subset-of-standard.md');
  process.exit(1);
}

console.log(
  `必須欄の検査: ${spec.forms.length}様式 / ${checked}欄` +
    (omitted > 0 ? `(うち省略として登録 ${omitted}欄)` : '')
);
