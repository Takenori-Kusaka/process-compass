#!/usr/bin/env node
// 回帰の試験が固定すると主張する決定の実在を確かめる(#319 裁定 R-1.4・R-4。lint:refs の拡張)。
//
//   node scripts/regress/check-fixes.mjs
//
// 読むもの: scripts/regress/suite/*.mjs の
//   - 先頭の宣言 `// @regress {...}` の fixes
//   - 節の宣言 fixes([...]) と、場面の引数の fixes: [...]
//   - 場面の名前(文字列)に書かれた K 番号(場面の fixes に自動で加わるため)
//   - 期待値を改めた記録 changed: [{ by: ... }] の by
//   - 落ちることを期待する印 knownFailure: { issue: ... } の issue
// 確かめること:
//   - 識別子の実在(形ごとの確かめ方は scripts/lib/decision-refs.mjs。ADR の決定は「## 決定」の節の見出しの番号で、
//     Issue は版管理の下の一覧の写しで確かめる。§8 X-1)
//   - changed の by は、決定(ADR の決定・K 番号・標準の条項)を1つ以上含む。Issue だけの by は通さない
//     (期待値を改める根拠は決定でなければならない。§8 X-1 が裁定 R-4 の「決定・Issue」を狭めた)
//   - knownFailure の issue は Issue の番号(#NNN)
// 確かめないこと: 場面が、引いた決定の中身を本当に確かめているか(人が PR の差分で確かめる)。
// 場面ごとの fixes が決定を1つ以上含むこと(Issue は追加としてだけ書ける)は、実行の結果から run.mjs が確かめる。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { problemOf, isDecision, idsInBy } from '../lib/decision-refs.mjs';

export { problemOf };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUITE = path.join(HERE, 'suite');

const found = new Map();
const problems = [];
const addBy = (by, where) => {
  const list = idsInBy(by);
  if (!list.some(isDecision)) problems.push(`changed の by「${by}」が決定(ADR-NNNN 決定N・KNN・標準 X.Y)を含まない(${where})`);
  for (const id of list) add(id, where);
};
const add = (id, where) => {
  if (!found.has(id)) found.set(id, []);
  found.get(id).push(where);
};
const ids = (text) => [...text.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2]);
for (const file of fs.readdirSync(SUITE).filter((f) => f.endsWith('.mjs'))) {
  const lines = fs.readFileSync(path.join(SUITE, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    const decl = /^\/\/ @regress (\{.*\})$/.exec(line);
    if (decl) for (const id of JSON.parse(decl[1]).fixes ?? []) add(id, at);
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const m of line.matchAll(/\bfixes(?:\(|:\s*)\[([^\]]*)\]/g)) for (const id of ids(m[1])) add(id, at);
    for (const m of line.matchAll(/\bby:\s*'([^']+)'/g)) addBy(m[1], at);
    for (const m of line.matchAll(/\bissue:\s*'([^']+)'/g)) {
      if (!/^#\d+$/.test(m[1])) problems.push(`knownFailure の issue「${m[1]}」が Issue の番号(#NNN)でない(${at})`);
      add(m[1], at);
    }
    for (const m of line.matchAll(/(['`])((?:(?!\1).)*)\1/g)) for (const k of m[2].match(/(?<![A-Za-z0-9])K\d{1,2}(?![0-9])/g) ?? []) add(k, at);
  });
}
// 期待値のファイル(expected/*.json)の changed の by
const EXPECTED = path.join(HERE, 'expected');
for (const file of fs.existsSync(EXPECTED) ? fs.readdirSync(EXPECTED).filter((f) => f.endsWith('.json')) : []) {
  const doc = JSON.parse(fs.readFileSync(path.join(EXPECTED, file), 'utf8'));
  for (const [tag, list] of Object.entries(doc.changed ?? {})) for (const c of list) addBy(c.by, `expected/${file}: ${tag}`);
  for (const [tag, kf] of Object.entries(doc.knownFailure ?? {})) {
    if (!/^#\d+$/.test(kf.issue ?? '')) problems.push(`knownFailure の issue「${kf.issue}」が Issue の番号(#NNN)でない(expected/${file}: ${tag})`);
    else add(kf.issue, `expected/${file}: ${tag}`);
  }
}
for (const [id, where] of [...found].sort()) {
  const p = problemOf(id);
  if (p) problems.push(`${id}: ${p}(${where.slice(0, 3).join(', ')}${where.length > 3 ? ` ほか ${where.length - 3}` : ''})`);
}
if (problems.length) {
  console.error(`回帰の試験の fixes・changed・knownFailure が指す決定の実在:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`回帰の試験が引く決定: ${found.size} 件(ADR・K 番号・Issue)がすべて実在する`);
