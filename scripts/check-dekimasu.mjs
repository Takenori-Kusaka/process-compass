#!/usr/bin/env node
// 文末の肯定の「できます/できる」の登録簿の検査(#366 / ADR-0117)
//
//   node scripts/check-dekimasu.mjs   (npm run lint:dekimasu)
//
// 規定の文書(src/data/provision-forms.yaml の documents のうち kind: normative)の、文末が「できます/できる」の文が、
// 区分を付けて登録簿 src/data/dekimasu-registry.yaml にあるかを確かめる。登録簿に無い文と、本文から消えた登録で失敗する。
// 機械は、許容か能力かを判定しない。区分の当否は、登録の差分を人が読んで確かめる(第1章 1.7.4)。
// 条件の本体と試験は scripts/lib/dekimasu.mjs・scripts/test-dekimasu.mjs にある。

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { checkDekimasu } from './lib/dekimasu.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = 'src/content/docs';
const REGISTRY = 'src/data/dekimasu-registry.yaml';

const forms = YAML.parse(readFileSync(path.join(ROOT, 'src/data/provision-forms.yaml'), 'utf8'));
const pages = {};
for (const d of forms.documents ?? []) {
  if (d.kind !== 'normative') continue;
  pages[d.page] = readFileSync(path.join(ROOT, DOCS, `${d.page}.md`), 'utf8').split(/\r?\n/);
}
const registry = YAML.parse(readFileSync(path.join(ROOT, REGISTRY), 'utf8'));
const { problems, found, registered } = checkDekimasu(registry, pages);

if (problems.length) {
  console.error(`文末の「できます/できる」の登録簿の検査: ${problems.length} 件の問題`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error(`登録簿は ${REGISTRY}。書式は community/provision-forms.md「文末の『できます』の登録簿」による`);
  process.exit(1);
}
console.log(`文末の「できます/できる」の登録簿: 規定の文書 ${Object.keys(pages).length} 頁の ${found} 文が、登録 ${registered} 件のいずれかに当たる`);
