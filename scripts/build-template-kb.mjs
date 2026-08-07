// テーラリング知識ベースを、テンプレートリポジトリへ複製できる JSON へ変換する。
//
// テンプレート側(pit-in-template)はゲートのスクリプトを依存パッケージなしで動かすため、
// YAML パーサを持たない。正本は src/data/ の YAML であり、本スクリプトはその符号化を行う。
//
//   node scripts/build-template-kb.mjs            # 既定の出力先へ書き出す
//   node scripts/build-template-kb.mjs --print    # 標準出力へ出す(差分検査で使う)
//   node scripts/build-template-kb.mjs --out <path>
//
// 出力先の既定は template/scripts/vendor/tailoring-kb.json。
// submodule を初期化していない場合は ../pit-in-template/ を試す。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TAILORING_DIR = path.join(ROOT, 'src/data/tailoring');
const PROCESS_FILE = path.join(ROOT, 'src/data/processes/integrated.yaml');

/** rules-*.yaml をファイル名の昇順で読み、規則を1配列へ平坦化する(記載順を保つ) */
function loadRules() {
  const files = fs
    .readdirSync(TAILORING_DIR)
    .filter((f) => f.startsWith('rules-') && f.endsWith('.yaml'))
    .sort();
  const rules = [];
  for (const f of files) {
    const doc = YAML.parse(fs.readFileSync(path.join(TAILORING_DIR, f), 'utf8'));
    for (const r of doc.rules ?? []) rules.push({ ...r, sourceFile: f });
  }
  return rules;
}

function loadYaml(file) {
  return YAML.parse(fs.readFileSync(file, 'utf8'));
}

export function buildKb() {
  const questions = loadYaml(path.join(TAILORING_DIR, 'questions.yaml')).questions;
  const constraints = loadYaml(path.join(TAILORING_DIR, 'constraints.yaml')).constraints;
  const practices = loadYaml(path.join(TAILORING_DIR, 'practices.yaml')).practices;
  const model = loadYaml(PROCESS_FILE);

  // 工程ゲート(G-1〜G-8)のみを取り出す。ステージ移行ゲート(SG-n)はテンプレートの CI では扱わない
  const gates = model.gates
    .filter((g) => /^G-\d$/.test(g.label ?? ''))
    .map((g) => ({ id: g.id, label: g.label, name: g.name, approver: g.approver }));

  const roles = model.roles.map((r) => ({ id: r.id, name: r.name, responsibility: r.responsibility }));

  return {
    schemaVersion: 0,
    note: '自動生成。正本は process-compass の src/data/。手で編集しない',
    questions,
    rules: loadRules(),
    constraints,
    practices,
    gates,
    roles,
  };
}

function defaultOut() {
  const inSubmodule = path.join(ROOT, 'template/scripts/vendor/tailoring-kb.json');
  if (fs.existsSync(path.join(ROOT, 'template'))) return inSubmodule;
  return path.resolve(ROOT, '../pit-in-template/scripts/vendor/tailoring-kb.json');
}

const args = process.argv.slice(2);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const json = JSON.stringify(buildKb(), null, 2) + '\n';
  if (args.includes('--print')) {
    process.stdout.write(json);
  } else {
    const outIdx = args.indexOf('--out');
    const out = outIdx >= 0 ? args[outIdx + 1] : defaultOut();
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, json, 'utf8');
    console.log(`wrote ${out} (${json.length} bytes)`);
  }
}
