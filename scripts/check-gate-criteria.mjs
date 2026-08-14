// 判定基準の正本を第4章の本文と定め、機械可読の複製との乖離を検出する(#238)。
//
//   node scripts/check-gate-criteria.mjs           検査のみ
//   node scripts/check-gate-criteria.mjs --write   src/data/processes/integrated.yaml を書き戻す
//
// 正本は src/content/docs/phase4-process-design/gate-criteria.md の判定基準表です。
// integrated.yaml の gates[].criteria は生成物であり、手で編集しません(ADR-0048)。
//
// 本検査が降ろすのは判定基準の表だけです。表の外にある規範(G-3 の「事業影響を金額で
// 定量化しない」など)は降りません。降りていないことを KB 側で明示します。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'src/content/docs/phase4-process-design/gate-criteria.md');
const TARGET = path.join(ROOT, 'src/data/processes/integrated.yaml');

// 第4章のゲート見出し → integrated.yaml の gate id
const GATE_IDS = {
  'G-1': 'g-plan-approval',
  'G-2': 'g-req-agree',
  'G-3': 'g-tech-design',
  'G-4': 'g-spec-cycle',
  'G-5': 'g-ci',
  'G-6': 'g-indep-review',
  'G-7': 'g-ship',
  'G-8': 'g-release',
};

/** コードブロックを除去する。表の抽出が記入例に引っかからないようにする */
function stripCodeBlocks(text) {
  return text.replace(/^```[\s\S]*?^```$/gm, '');
}

/**
 * `### G-N ...` 見出し配下の最初の「| # | 判定基準 |」表から、判定基準の列を取る。
 * G-1 は前提条件の表を先に持つため、ヘッダ行の2列目で判別する。
 */
function extractCriteria(text) {
  const body = stripCodeBlocks(text);
  const out = {};
  const heads = [...body.matchAll(/^### (G-\d)\s(.*)$/gm)];

  for (let i = 0; i < heads.length; i += 1) {
    const gate = heads[i][1];
    const start = heads[i].index + heads[i][0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : body.length;
    const section = body.slice(start, end);

    const criteria = [];
    let inTable = false;
    for (const line of section.split(/\r?\n/)) {
      const cells = line.trim().startsWith('|')
        ? line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
        : null;

      if (!cells) {
        if (inTable) break; // 表が途切れたら、その表で終わり
        continue;
      }
      if (!inTable) {
        // ヘッダ行の判別。「判定基準」の表だけを採る(前提条件の表は採らない)
        if (cells[1] === '判定基準') inTable = true;
        continue;
      }
      if (cells.every((c) => /^-+$/.test(c) || c === '')) continue; // 区切り行
      if (!/^\d+$/.test(cells[0])) continue;
      criteria.push(cells[1].replace(/\*\*/g, ''));
    }
    if (criteria.length > 0) out[gate] = criteria;
  }
  return out;
}

/** integrated.yaml の gates[].criteria を、id をキーに読む(簡易パーサ) */
function readYamlCriteria(text) {
  const out = {};
  const re = /^\s*- id: (g-[a-z0-9-]+)$/gm;
  const heads = [...text.matchAll(re)];
  for (let i = 0; i < heads.length; i += 1) {
    const id = heads[i][1];
    const start = heads[i].index;
    const end = i + 1 < heads.length ? heads[i + 1].index : text.length;
    const block = text.slice(start, end);
    const m = /criteria: \[(.*?)\]/s.exec(block);
    if (m) out[id] = m[1].split(',').map((s) => s.trim()).filter(Boolean);
  }
  return out;
}

const sourceText = fs.readFileSync(SOURCE, 'utf8');
const targetText = fs.readFileSync(TARGET, 'utf8');
const fromSource = extractCriteria(sourceText);
const fromYaml = readYamlCriteria(targetText);

const problems = [];
let checked = 0;

for (const [gate, id] of Object.entries(GATE_IDS)) {
  const want = fromSource[gate];
  if (!want) {
    problems.push(`${gate}: 第4章に判定基準の表が見つかりません`);
    continue;
  }
  checked += want.length;
  const have = fromYaml[id];
  if (!have) {
    problems.push(`${gate}(${id}): integrated.yaml に criteria がありません`);
    continue;
  }
  if (have.length !== want.length) {
    problems.push(
      `${gate}(${id}): 判定基準の件数が一致しません。第4章 ${want.length}件 / yaml ${have.length}件\n` +
        `  不足: ${want.filter((w) => !have.some((h) => h.includes(w.slice(0, 8)))).join(' / ') || '(順序または表現の差)'}`,
    );
  }
}

if (process.argv.includes('--write')) {
  let next = targetText;
  for (const [gate, id] of Object.entries(GATE_IDS)) {
    const want = fromSource[gate];
    if (!want) continue;
    const re = new RegExp(`(- id: ${id}\\n[\\s\\S]*?criteria: )\\[.*?\\]`, '');
    next = next.replace(re, `$1[${want.join(', ')}]`);
  }
  if (next !== targetText) {
    fs.writeFileSync(TARGET, next);
    console.log(`更新: src/data/processes/integrated.yaml`);
  }
  console.log(`判定基準の複製: ${Object.keys(GATE_IDS).length}ゲート / ${checked}件`);
  process.exit(0);
}

// 3方向目: 配布した KB が判定基準を実際に運んでいるか。
// 生成器が criteria を出さなくなっても、KB と YAML の突合だけでは検出できない。
// 「配る仕組みがあること」と「配っていること」は別である。
const KB = path.join(ROOT, 'template/scripts/vendor/tailoring-kb.json');
if (fs.existsSync(KB)) {
  const kb = JSON.parse(fs.readFileSync(KB, 'utf8'));
  const kbTotal = (kb.gates ?? []).reduce((n, g) => n + (g.criteria?.length ?? 0), 0);
  if (kbTotal !== checked) {
    problems.push(
      `配布した知識ベースの判定基準が ${kbTotal}件です。標準の第4章は ${checked}件です。\n` +
        `  'npm run template:kb' を実行してください。件数が合わない場合、生成器が criteria を出していません`,
    );
  }
  if (!kb.source?.commit) {
    problems.push('配布した知識ベースに生成元の版(source.commit)がありません');
  }
  for (const g of kb.gates ?? []) {
    if (g.criteriaComplete !== false) {
      problems.push(
        `${g.label}: 知識ベースの criteriaComplete が false ではありません。` +
          `表の外にある規範は降りないため、完全な配送として見せてはなりません(ADR-0048 決定3)`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error('判定基準の複製の検査で乖離を検出しました:\n');
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    '\n正本は第4章の判定基準表です。' +
      "'node scripts/check-gate-criteria.mjs --write' で書き戻してください",
  );
  console.error('規約: src/content/docs/adr/0048-gate-criteria-source-of-truth.md');
  process.exit(1);
}

console.log(`判定基準の複製: ${Object.keys(GATE_IDS).length}ゲート / ${checked}件(一致)`);
