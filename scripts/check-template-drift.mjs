// テンプレートリポジトリへ複製した資産と、複製元の乖離を検出する。
//
//   node scripts/check-template-drift.mjs
//
// 正本は本リポジトリの src/ 側です。複製を先に書き換えても、検査は一致を求めます。
// テーラリングの判定ロジックが2箇所へ分かれ、標準の改訂がテンプレートへ伝わらなくなる
// 状態を防ぐための検査です。
//
// submodule(template/)を初期化していない環境では、検査を飛ばします。
// クローン直後に npm run check が失敗する構成にしないためです。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildKb } from './build-template-kb.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE = path.join(ROOT, 'template');

if (!fs.existsSync(path.join(TEMPLATE, 'process.config.json'))) {
  console.log('template/ が未初期化のため、複製の検査を飛ばします');
  console.log('  初期化: git submodule update --init --recursive');
  process.exit(0);
}

const problems = [];

/** 1. テーラリングエンジンの本文が一致するか */
const engineSrc = path.join(ROOT, 'src/lib/tailoring-engine.mjs');
const engineDst = path.join(TEMPLATE, 'scripts/vendor/tailoring-engine.mjs');

const norm = (s) => s.replace(/\r\n/g, '\n');

if (!fs.existsSync(engineDst)) {
  problems.push('template/scripts/vendor/tailoring-engine.mjs がありません');
} else if (norm(fs.readFileSync(engineSrc, 'utf8')) !== norm(fs.readFileSync(engineDst, 'utf8'))) {
  problems.push(
    'テーラリングエンジンが複製元と一致しません。' +
      'cp src/lib/tailoring-engine.mjs template/scripts/vendor/tailoring-engine.mjs'
  );
}

/** 2. 知識ベースが最新の YAML から生成されたものか */
const kbDst = path.join(TEMPLATE, 'scripts/vendor/tailoring-kb.json');
if (!fs.existsSync(kbDst)) {
  problems.push('template/scripts/vendor/tailoring-kb.json がありません');
} else {
  const expected = JSON.stringify(buildKb(), null, 2) + '\n';
  const actual = fs.readFileSync(kbDst, 'utf8');
  if (norm(expected) !== norm(actual)) {
    problems.push(
      '知識ベースが複製元の YAML と一致しません。node scripts/build-template-kb.mjs を実行してください'
    );
  }
}

/** 3. テンプレートが参照するゲートの識別子が、参照モデルと一致するか */
const kb = buildKb();
const keys = kb.gates.map((g) => g.label.replace('-', '').toLowerCase());
const cfg = JSON.parse(fs.readFileSync(path.join(TEMPLATE, 'process.config.json'), 'utf8'));
for (const k of keys) {
  if (!cfg.gates[k]) problems.push(`template/process.config.json に ${k} の定義がありません`);
}
for (const k of Object.keys(cfg.gates)) {
  if (!keys.includes(k)) problems.push(`template/process.config.json の ${k} は参照モデルに存在しません`);
}

if (problems.length) {
  console.error('複製の検査で乖離を検出しました:');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  console.error('正本は本リポジトリの src/ 側です。変更は必ず複製元から行ってください');
  process.exit(1);
}

console.log('複製の検査: 一致しています');
