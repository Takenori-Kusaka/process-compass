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
// 確かめること(識別子の形ごと):
//   - ADR-NNNN       src/content/docs/adr/NNNN-*.md がある
//   - ADR-NNNN 決定N そのうえで、ADR の本文に「決定N」がある
//   - KNN            research/phase4-standard/284-285-fix-spec*.md に見出し「KNN 」がある(#284・#285 の会議体の決定)
//   - #NNN           research/ か src/content/docs/ のどこかに #NNN の記載がある(Issue の一覧を手元に持たないため、
//                    記載の有無で代える。GitHub への問い合わせはしない)
// 確かめないこと: 場面が、引いた決定の中身を本当に確かめているか(人が PR の差分で確かめる)。
// 場面ごとに fixes が空でないことは、実行の結果から run.mjs が確かめる。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { problemOf } from '../lib/decision-refs.mjs';

export { problemOf };

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUITE = path.join(HERE, 'suite');

const found = new Map();
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
    for (const m of line.matchAll(/\bby:\s*'([^']+)'/g)) add(m[1], at);
    for (const m of line.matchAll(/\bissue:\s*'([^']+)'/g)) add(m[1], at);
    for (const m of line.matchAll(/(['`])((?:(?!\1).)*)\1/g)) for (const k of m[2].match(/(?<![A-Za-z0-9])K\d{1,2}(?![0-9])/g) ?? []) add(k, at);
  });
}
// 期待値のファイル(expected/*.json)の changed の by
const EXPECTED = path.join(HERE, 'expected');
for (const file of fs.existsSync(EXPECTED) ? fs.readdirSync(EXPECTED).filter((f) => f.endsWith('.json')) : []) {
  const doc = JSON.parse(fs.readFileSync(path.join(EXPECTED, file), 'utf8'));
  for (const [tag, list] of Object.entries(doc.changed ?? {})) for (const c of list) add(c.by, `expected/${file}: ${tag}`);
}
const problems = [];
for (const [id, where] of [...found].sort()) {
  const p = problemOf(id);
  if (p) problems.push(`${id}: ${p}(${where.slice(0, 3).join(', ')}${where.length > 3 ? ` ほか ${where.length - 3}` : ''})`);
}
if (problems.length) {
  console.error(`回帰の試験の fixes・changed・knownFailure が指す決定の実在:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`回帰の試験が引く決定: ${found.size} 件(ADR・K 番号・Issue)がすべて実在する`);
