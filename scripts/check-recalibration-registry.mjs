// 能力依存の定数の登録簿の整合を検査する(#295 / ADR-0058 決定6)。
//
//   node scripts/check-recalibration-registry.mjs
//
// 標準 第6章 metrics.md の登録簿の表と、準拠テンプレートの機械可読版(template/scripts/gate/recalibration-registry.json)が、
// ID・定数の名称・依拠する前提・「能力に依るか」で一致することを確かめる。担っている保証は、表の側が説明を足せるため、
// JSON の文が表のセルに含まれることだけを見る。template/ が未初期化なら飛ばす。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_FILE = path.join(ROOT, 'template/scripts/gate/recalibration-registry.json');
const DOC = path.join(ROOT, 'src/content/docs/phase6-operation/metrics.md');

if (!fs.existsSync(JSON_FILE)) {
  console.log('template/ が未初期化のため、登録簿の整合の検査を飛ばします');
  process.exit(0);
}

const registry = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
const text = fs.readFileSync(DOC, 'utf8').replace(/\r\n/g, '\n');
const strip = (s) => s.replace(/\*\*/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();
const rows = new Map();
for (const line of text.split('\n')) {
  const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  if (/^RC-\d+$/.test(cells[0] ?? '') && cells.length >= 5) rows.set(cells[0], { name: strip(cells[1]), assumption: strip(cells[2]), guarantee: strip(cells[3]), depends: strip(cells[4]) });
}

const problems = [];
for (const c of registry.constants) {
  const r = rows.get(c.id);
  if (!r) {
    problems.push(`${c.id}: metrics.md の登録簿の表に行が無い`);
    continue;
  }
  if (r.name !== c.name) problems.push(`${c.id}: 定数の名称が違う(表「${r.name}」/ JSON「${c.name}」)`);
  if (r.assumption !== c.assumption) problems.push(`${c.id}: 依拠する前提が違う(表「${r.assumption}」/ JSON「${c.assumption}」)`);
  if (!r.guarantee.includes(c.guarantee)) problems.push(`${c.id}: 担っている保証が表のセルに含まれない(JSON「${c.guarantee}」/ 表「${r.guarantee}」)`);
  const tableDepends = r.depends === '依る';
  if (r.depends !== '依る' && r.depends !== '依らない') problems.push(`${c.id}: 「能力に依るか」が「依る」「依らない」のいずれでもない(${r.depends})`);
  else if (tableDepends !== c.capabilityDependent) problems.push(`${c.id}: 能力に依るかが違う(表「${r.depends}」/ JSON ${c.capabilityDependent})`);
}
for (const id of rows.keys()) if (!registry.constants.some((c) => c.id === id)) problems.push(`${id}: 表にあるが JSON に無い`);

if (problems.length) {
  console.error('能力依存の定数の登録簿が、標準の表とテンプレートの JSON で一致しません:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`能力依存の定数の登録簿: 表と JSON が一致(${registry.constants.length} 件)`);
