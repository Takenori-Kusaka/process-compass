#!/usr/bin/env node
// 根拠水準マークの検査と台帳生成(Issue #156)
//
// src/content/docs/ 配下の Markdown / MDX から根拠水準マークを収集し、
// 書式・識別子の重複・期限の形式を検査する。npm run check から呼ばれ、
// 検出時は終了コード 1 で失敗する。
//
// マークの書式(規約: community/evidence-marking.md):
//
//   :::caution[暫定 EV-0001 / 見直し 2027-08]
//   **対象**: 何が暫定なのか
//   **根拠の水準**: E0(なし)
//   **差し替え条件**: 何が得られたら確定させるか
//
//   (補足の本文。省略可)
//   :::
//
// オプション:
//   --write     台帳ページ(community/evidence-ledger.md)を再生成する
//   --expired   期限を過ぎたマークだけを Markdown で標準出力へ書き出す
//   --strict    期限超過も失敗として扱う(定期実行用)

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';

const DOCS_ROOT = 'src/content/docs';
const LEDGER_PATH = `${DOCS_ROOT}/community/evidence-ledger.md`;
const BASE_PATH = '/process-compass';

const LEVELS = {
  E0: 'なし',
  E1: '間接',
  E2: '単一事例',
};

const OPEN_RE = /^:::caution\[暫定 (EV-\d{4}) \/ 見直し (\d{4})-(\d{2})\]\s*$/;
const OPEN_LOOSE_RE = /^:::caution\[暫定/;
const FIELD_RE = /^\*\*(対象|根拠の水準|差し替え条件|根拠とした事例)\*\*:\s*(.+?)。?\s*$/;
const LEVEL_VALUE_RE = /^(E[012])\(([^)]+)\)$/;

const args = new Set(process.argv.slice(2));
const errors = [];
const marks = [];

/** src/content/docs/a/b.md -> /process-compass/a/b/ */
function toUrl(file) {
  const rel = file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
  const slug = rel.replace(/\/index$/, '').replace(/^index$/, '');
  return slug ? `${BASE_PATH}/${slug}/` : `${BASE_PATH}/`;
}

/** コードブロック(``` / ````)の中身を空行へ置換し、行番号を保ったまま対象外にする */
function maskFences(lines) {
  const masked = [...lines];
  let fence = null;
  for (let i = 0; i < masked.length; i++) {
    const m = /^\s*(`{3,})/.exec(masked[i]);
    if (fence === null && m) {
      fence = m[1];
      masked[i] = '';
      continue;
    }
    if (fence !== null) {
      if (m && m[1].length >= fence.length) fence = null;
      masked[i] = '';
    }
  }
  return masked;
}

function collect(file) {
  const lines = maskFences(readFileSync(file, 'utf8').split(/\r?\n/));
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!OPEN_LOOSE_RE.test(line)) continue;

    const open = OPEN_RE.exec(line);
    if (!open) {
      errors.push(`${file}:${i + 1} マークの見出しが書式に合致しません: ${line.trim()}`);
      errors.push(`  期待する書式: :::caution[暫定 EV-0001 / 見直し 2027-08]`);
      continue;
    }

    const [, id, year, month] = open;
    if (Number(month) < 1 || Number(month) > 12) {
      errors.push(`${file}:${i + 1} ${id} の見直し期限の月が不正です: ${year}-${month}`);
      continue;
    }

    // 閉じ位置を探す
    let end = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (/^:::\s*$/.test(lines[j])) {
        end = j;
        break;
      }
    }
    if (end === -1) {
      errors.push(`${file}:${i + 1} ${id} のマークが閉じられていません`);
      continue;
    }

    const fields = {};
    for (let j = i + 1; j < end; j++) {
      const m = FIELD_RE.exec(lines[j]);
      if (m) fields[m[1]] = m[2];
    }

    for (const key of ['対象', '根拠の水準', '差し替え条件']) {
      if (!fields[key]) {
        errors.push(`${file}:${i + 1} ${id} に必須項目 **${key}** がありません`);
      }
    }

    let level = null;
    if (fields['根拠の水準']) {
      const lv = LEVEL_VALUE_RE.exec(fields['根拠の水準']);
      if (!lv) {
        errors.push(
          `${file}:${i + 1} ${id} の根拠の水準が書式に合致しません: ${fields['根拠の水準']}`,
        );
      } else if (!LEVELS[lv[1]]) {
        errors.push(`${file}:${i + 1} ${id} の根拠の水準が未定義です: ${lv[1]}`);
      } else if (LEVELS[lv[1]] !== lv[2]) {
        errors.push(
          `${file}:${i + 1} ${id} の根拠の水準の呼称が定義と異なります: ` +
            `${lv[1]}(${lv[2]}) — 定義は ${lv[1]}(${LEVELS[lv[1]]})`,
        );
      } else {
        level = lv[1];
      }
    }

    marks.push({
      id,
      file,
      line: i + 1,
      url: toUrl(file),
      review: `${year}-${month}`,
      level,
      target: fields['対象'] ?? '',
      condition: fields['差し替え条件'] ?? '',
      // 任意項目。同じ事例から複数のマークが出ている場合に、台帳で識別できるようにする(ADR-0045)
      source: fields['根拠とした事例'] ?? '',
    });

    i = end;
  }
}

function renderLedger(rows) {
  const out = [];
  out.push('| 識別子 | 対象 | 根拠 | 根拠とした事例 | 見直し | 差し替え条件 | 記載箇所 |');
  out.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const m of rows) {
    const level = m.level ? `${m.level}(${LEVELS[m.level]})` : '-';
    const page = m.file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
    const source = m.source || '未記載';
    out.push(
      `| ${m.id} | ${m.target} | ${level} | ${source} | ${m.review} | ${m.condition} | [${page}](${m.url}) |`,
    );
  }
  return out.join('\n');
}

function replaceBlock(text, body) {
  const start = '<!-- evidence-ledger:start -->';
  const end = '<!-- evidence-ledger:end -->';
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si === -1 || ei === -1) {
    throw new Error(`${LEDGER_PATH} に ${start} / ${end} がありません`);
  }
  return `${text.slice(0, si + start.length)}\n\n${body}\n\n${text.slice(ei)}`;
}

// --- 実行 ---

const files = [];
for await (const f of glob(`${DOCS_ROOT}/**/*.{md,mdx}`)) {
  const norm = f.replace(/\\/g, '/');
  if (norm.endsWith('community/evidence-ledger.md')) continue;
  files.push(norm);
}
files.sort();
for (const f of files) collect(f);

const seen = new Map();
for (const m of marks) {
  if (seen.has(m.id)) {
    errors.push(`${m.file}:${m.line} 識別子 ${m.id} が重複しています(既出: ${seen.get(m.id)})`);
  } else {
    seen.set(m.id, `${m.file}:${m.line}`);
  }
}

marks.sort((a, b) => (a.review === b.review ? a.id.localeCompare(b.id) : a.review.localeCompare(b.review)));

const now = new Date();
const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const expired = marks.filter((m) => m.review <= thisMonth);

if (args.has('--expired')) {
  if (expired.length > 0) {
    console.log('| 識別子 | 対象 | 見直し | 差し替え条件 | 記載箇所 |');
    console.log('| --- | --- | --- | --- | --- |');
    for (const m of expired) {
      console.log(`| ${m.id} | ${m.target} | ${m.review} | ${m.condition} | ${m.file}:${m.line} |`);
    }
  }
  process.exit(0);
}

const ledgerBody = renderLedger(marks);
const ledgerText = readFileSync(LEDGER_PATH, 'utf8');
const nextText = replaceBlock(ledgerText, ledgerBody);

if (args.has('--write')) {
  if (nextText !== ledgerText) {
    writeFileSync(LEDGER_PATH, nextText);
    console.log(`更新: ${LEDGER_PATH}`);
  } else {
    console.log(`変更なし: ${LEDGER_PATH}`);
  }
} else if (nextText !== ledgerText) {
  errors.push(
    `${LEDGER_PATH} が最新ではありません。'node scripts/check-evidence.mjs --write' を実行してください`,
  );
}

if (errors.length > 0) {
  console.error('根拠水準マークの検査で問題が見つかりました:\n');
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n規約: ${DOCS_ROOT}/community/evidence-marking.md`);
  process.exit(1);
}

console.log(`根拠水準マーク: ${marks.length}件(期限到来: ${expired.length}件)`);
if (expired.length > 0) {
  for (const m of expired) {
    console.log(`  期限到来 ${m.id} (${m.review}) ${m.file}:${m.line} — ${m.target}`);
  }
  if (args.has('--strict')) {
    console.error('\n期限を過ぎたマークがあります。棚卸しの Issue を起票してください。');
    process.exit(1);
  }
}
