// 能力依存の定数の登録簿の整合を検査する(#295 / ADR-0058 決定6、#296 / ADR-0079)。
//
//   node scripts/check-recalibration-registry.mjs
//
// 標準 第3章 3.12.12 の登録簿の表(#316 でフェーズ6 の metrics.md から本文へ移した)と、準拠テンプレートの機械可読版(template/scripts/gate/recalibration-registry.json)が、
// ID・定数の名称・依拠する前提・「能力に依るか」で一致することを確かめる。担っている保証は、表の側が説明を足せるため、
// JSON の文が表のセルに含まれることだけを見る。
//
// 加えて(#296 L-9):
//   - 要求事項4 が挙げる「能力に依らない」周期・窓の ID の集合と、JSON の capabilityDependent: false の集合の一致
//   - 要求事項4 が挙げる「人の帯域に由来する定数」の ID の集合と、JSON の noRelaxByCapability: true の集合の一致
//   - configKey(「 / 」区切り)の各キーが、テンプレートの process.config.json に実在すること
// template/ が未初期化なら失敗させる(Issue #293 / ADR-0077)。
//
// 判定は checkRegistry(純関数)に置き、scripts/test-check-recalibration-registry.mjs が変異試験で固定する。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { requireInputs } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_FILE = path.join(ROOT, 'template/scripts/gate/recalibration-registry.json');
const CONFIG_FILE = path.join(ROOT, 'template/process.config.json');
const DOC = path.join(ROOT, 'src/content/docs/phase4-process-design/roles-responsibilities.md');

const strip = (s) => s.replace(/\*\*/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();
const pad = (n) => `RC-${String(n).padStart(2, '0')}`;

/** 「RC-09〜RC-12」「RC-01・RC-02・RC-04」のような列挙を ID の配列へ展開する */
export function expandIds(text) {
  const out = [];
  for (const part of String(text ?? '').split(/[・、,]/)) {
    const range = part.match(/RC-(\d+)\s*〜\s*(?:RC-)?(\d+)/);
    if (range) {
      for (let i = Number(range[1]); i <= Number(range[2]); i++) out.push(pad(i));
      continue;
    }
    const one = part.match(/RC-(\d+)/);
    if (one) out.push(pad(Number(one[1])));
  }
  return [...new Set(out)].sort();
}

/** 表の行(RC-NN)と要求事項4 の列挙を読む */
export function parseDoc(text) {
  const rows = new Map();
  let requirement4 = null;
  for (const line of String(text).replace(/\r\n/g, '\n').split('\n')) {
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (/^RC-\d+$/.test(cells[0] ?? '') && cells.length >= 5) rows.set(cells[0], { name: strip(cells[1]), assumption: strip(cells[2]), guarantee: strip(cells[3]), depends: strip(cells[4]) });
    if (cells[0] === '4' && /能力に依らない/.test(cells[1] ?? '')) requirement4 = cells[1];
  }
  let notDependent = null;
  let noRelax = null;
  if (requirement4) {
    const nd = requirement4.match(/「能力に依らない」と登録した周期・窓(([^)]*))/);
    const nr = requirement4.match(/人の帯域に由来する定数(([^)]*))/);
    notDependent = nd ? expandIds(nd[1]) : null;
    noRelax = nr ? expandIds(nr[1]) : null;
  }
  return { rows, requirement4, notDependent, noRelax };
}

const getPath = (obj, key) => key.split('.').reduce((o, k) => (o === null || o === undefined ? undefined : o[k]), obj);

/**
 * 登録簿の整合の検査(純関数)。problems の配列を返す。
 * registry: JSON の内容。docText: 第3章の本文。config: テンプレートの process.config.json の内容
 */
export function checkRegistry({ registry, docText, config }) {
  const problems = [];
  const { rows, requirement4, notDependent, noRelax } = parseDoc(docText);
  const constants = Array.isArray(registry?.constants) ? registry.constants : [];
  for (const c of constants) {
    const r = rows.get(c.id);
    if (!r) {
      problems.push(`${c.id}: 第3章 3.12.12 の登録簿の表に行が無い`);
      continue;
    }
    if (r.name !== c.name) problems.push(`${c.id}: 定数の名称が違う(表「${r.name}」/ JSON「${c.name}」)`);
    if (r.assumption !== c.assumption) problems.push(`${c.id}: 依拠する前提が違う(表「${r.assumption}」/ JSON「${c.assumption}」)`);
    if (!r.guarantee.includes(c.guarantee)) problems.push(`${c.id}: 担っている保証が表のセルに含まれない(JSON「${c.guarantee}」/ 表「${r.guarantee}」)`);
    if (r.depends !== '依る' && r.depends !== '依らない') problems.push(`${c.id}: 「能力に依るか」が「依る」「依らない」のいずれでもない(${r.depends})`);
    else if ((r.depends === '依る') !== c.capabilityDependent) problems.push(`${c.id}: 能力に依るかが違う(表「${r.depends}」/ JSON ${c.capabilityDependent})`);
    // configKey: null か、「 / 」で区切ったキーのそれぞれがテンプレートの構成に実在する
    if (c.configKey !== null && c.configKey !== undefined) {
      if (typeof c.configKey !== 'string' || !c.configKey.trim()) problems.push(`${c.id}: configKey は null か、構成のキーの文字列で書く`);
      else {
        for (const key of c.configKey.split(' / ').map((k) => k.trim())) {
          if (!/^[A-Za-z][\w]*(\.[A-Za-z][\w]*)+$/.test(key)) problems.push(`${c.id}: configKey の "${key}" は構成のキーの形(a.b)でない`);
          else if (config && getPath(config, key) === undefined) problems.push(`${c.id}: configKey の "${key}" が、テンプレートの process.config.json に無い`);
        }
      }
    }
    if (c.noRelaxByCapability !== undefined && typeof c.noRelaxByCapability !== 'boolean') problems.push(`${c.id}: noRelaxByCapability は真偽値で書く`);
  }
  for (const id of rows.keys()) if (!constants.some((c) => c.id === id)) problems.push(`${id}: 表にあるが JSON に無い`);

  // 要求事項4 の列挙と JSON の区分
  if (!requirement4) problems.push('第3章 3.12.12 の登録簿の要求事項4(能力に依らない定数・人の帯域に由来する定数の列挙)を読めない');
  else {
    const jsonNotDependent = constants.filter((c) => c.capabilityDependent === false).map((c) => c.id).sort();
    const jsonNoRelax = constants.filter((c) => c.noRelaxByCapability === true).map((c) => c.id).sort();
    if (!notDependent) problems.push('要求事項4 から「能力に依らない」と登録した周期・窓の ID を読めない');
    else if (notDependent.join(',') !== jsonNotDependent.join(',')) {
      problems.push(`要求事項4 の「能力に依らない」周期・窓(${notDependent.join('・') || 'なし'})と、JSON の capabilityDependent: false(${jsonNotDependent.join('・') || 'なし'})が一致しない`);
    }
    if (!noRelax) problems.push('要求事項4 から人の帯域に由来する定数の ID を読めない');
    else if (noRelax.join(',') !== jsonNoRelax.join(',')) {
      problems.push(`要求事項4 の人の帯域に由来する定数(${noRelax.join('・') || 'なし'})と、JSON の noRelaxByCapability: true(${jsonNoRelax.join('・') || 'なし'})が一致しない`);
    }
    const unknown = [...(notDependent ?? []), ...(noRelax ?? [])].filter((id) => !rows.has(id));
    if (unknown.length) problems.push(`要求事項4 が挙げる ${[...new Set(unknown)].join('・')} が登録簿の表に無い`);
  }
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  requireInputs(ROOT, ['template', 'template/scripts/gate/recalibration-registry.json', 'template/process.config.json'], '登録簿の整合の検査');
  const registry = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  const docText = fs.readFileSync(DOC, 'utf8');
  const problems = checkRegistry({ registry, docText, config });
  if (problems.length) {
    console.error('能力依存の定数の登録簿が、標準の表とテンプレートの JSON で一致しません:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`能力依存の定数の登録簿: 表と JSON が一致(${registry.constants.length} 件。要求事項4 の区分と configKey を含む)`);
}
