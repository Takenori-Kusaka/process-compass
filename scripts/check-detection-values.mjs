// 検知・知らせ・抜き取りの値の列挙の検査(第1章 1.7.7 の例外が及ぶ値の範囲)
//
//   node scripts/check-detection-values.mjs
//
// 1.7.7 の例外(参考の値も既定値も置かず、定めていない値は一覧に出す)は、src/data/detection-values.yaml が
// 挙げる値だけに及ぶ。本文の列挙・構成の欄の根・準拠テンプレートの読み取りが、この一覧と食い違わないことを確かめる。
// 検査するのは決定可能な条件(名の一致・存在・集合の包含)だけである。例外の対象とすべきかの判断は確かめない。
// 判定は checkDetectionValues(純関数)に置き、scripts/test-check-detection-values.mjs が変異試験で固定する。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { requireInputs } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIST_FILE = path.join(ROOT, 'src/data/detection-values.yaml');
const OVERVIEW = path.join(ROOT, 'src/content/docs/phase4-process-design/overview.md');
const READER = path.join(ROOT, 'template/scripts/gate/detection-values.mjs');

/** 1.7.7 の本文から、「次の5つの検知・知らせ・抜き取りの値は、この箇条の外とする」の列挙を取り出す */
export function listedInOverview(text) {
  const m = text.match(/次の(\d+)つの検知・知らせ・抜き取りの値は、この箇条の外とする\*\*。([^。]+)。/);
  if (!m) return null;
  return { count: Number(m[1]), names: m[2].replace(/である$/, '').split('、').map((x) => x.trim()) };
}

export function checkDetectionValues({ list, overviewText, readerSource }) {
  const problems = [];
  const values = Array.isArray(list?.values) ? list.values : [];
  const roots = Array.isArray(list?.allowedConfigRoots) ? list.allowedConfigRoots : [];
  if (!values.length) problems.push('detection-values.yaml: values が空');
  const names = values.map((v) => v?.name);
  const listed = listedInOverview(overviewText);
  if (!listed) problems.push('第1章 1.7.7: 5つの値の列挙(「次の N つの検知・知らせ・抜き取りの値は、この箇条の外とする」)が見つからない');
  else {
    if (listed.count !== values.length) problems.push(`第1章 1.7.7: 列挙の数(${listed.count})が一覧の件数(${values.length})と違う`);
    if (JSON.stringify(listed.names) !== JSON.stringify(names)) problems.push(`第1章 1.7.7: 列挙(${listed.names.join('、')})が一覧(${names.join('、')})と違う(名と順)`);
  }
  for (const v of values) {
    if (typeof v?.configKey !== 'string' || !v.configKey) { problems.push(`${v?.name}: configKey が無い`); continue; }
    if (!roots.some((r) => v.configKey === r || v.configKey.startsWith(`${r}.`))) problems.push(`${v.name}: 構成の欄 ${v.configKey} が許す根(${roots.join('、')})の外`);
    const last = v.configKey.split('.').pop();
    if (!readerSource.includes(last)) problems.push(`${v.name}: 準拠テンプレートの読み取りが ${last} を読んでいない`);
  }
  if (new Set(names).size !== names.length) problems.push('detection-values.yaml: 名が重複している');
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  requireInputs(ROOT, ['template/scripts/gate/detection-values.mjs'], '検知の値の列挙の検査');
  const problems = checkDetectionValues({
    list: YAML.parse(fs.readFileSync(LIST_FILE, 'utf8')),
    overviewText: fs.readFileSync(OVERVIEW, 'utf8'),
    readerSource: fs.readFileSync(READER, 'utf8'),
  });
  if (problems.length) {
    console.error('検知の値の列挙の検査で問題が見つかりました:\n' + problems.map((p) => `  ${p}`).join('\n'));
    process.exit(1);
  }
  console.log('検知の値の列挙: 本文・一覧・準拠テンプレートの読み取りが一致しています');
}
