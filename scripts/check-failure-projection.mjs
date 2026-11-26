#!/usr/bin/env node
// 困りごと起点の投影表の表記の整合の検査(Issue #456 / ADR-0266)
//
// 附属書H H.3「困りごとから、止める場所と証跡へ引く」の表は、投影である。区分(止め方)は人が書く。
// 本スクリプトは、決定可能な条件だけを確かめる。困りごとと条項の対応の正しさ、行の網羅、
// 「機械が示し人が止める」と「人」の別、審議中の Issue が open かは確かめない(EV-0357 で開示する)。
//
// 検査する条件(表は <!-- failure-projection:start --> と <!-- failure-projection:end --> の間):
//   (a) 見出しの列が定めた7列である
//   (b) 表の中の IMPL-NNNN が、標準の本文のマーク(<!-- impl IMPL-NNNN ... -->。囲みのコードと規約の例は除く)に実在する(台帳でなくマークを読む)。仮番号(IMPL-TBD-…)は違反
//   (c) 区分の列を「/」で分けた各部分が、6値のいずれかで始まり、値の直後が括弧・コロン・行末である
//   (d) 「未達」の部分は IMPL を1つ以上持ち、すべて state=undelivered。区分の列で引いた state=undelivered の IMPL は「未達」の部分にある
//   (e) 「機械が止める」の部分は、state=delivered かつ check=machine の IMPL を1つ以上持つ(必要条件)
//   (f) 最も弱い止め方の列の先頭の値が、区分の列の値のうち最も弱いものと一致する
//   (g) 区分に「審議中」がある行は、審議中の表示が「#番号」と「審議中(#番号、YYYY-MM-DD 時点)」の形。無い行は「—」
//
//   node scripts/check-failure-projection.mjs   (npm run lint:refs の一部)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MARK_RE, maskFences } from './lib/impl-inventory.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'src/content/docs');
export const TARGET = 'phase4-process-design/assurance-case.md';

export const START = '<!-- failure-projection:start -->';
export const END = '<!-- failure-projection:end -->';
export const HEADER = ['困りごと', '止める場所', '区分', '最も弱い止め方', '証拠(保証の開示の項目・記録)', '引く条項', '審議中の表示'];
/** 強い順。後ろほど弱い */
export const VALUES = ['機械が止める', '機械が示し人が止める', '人', '未達', '審議中', '開示'];
const IMPL_RE = /IMPL-\d{4}(?!\d)/g;
/** IMPL を含む語のうち、IMPL-NNNN の形でないもの(仮番号 IMPL-TBD-…、大文字小文字・ハイフン・桁数の違いを含む)は、実在しない番号として違反にする */
const IMPL_WORD_RE = /impl(?![a-z])[-_‐-―]?[0-9A-Za-z]*/gi;
const isTentative = (line) => (line.match(IMPL_WORD_RE) ?? []).some((w) => !/^IMPL-\d{4}$/.test(w));
/** 実在する日付か(2026-13-45 を通さない) */
const isRealDate = (ymd) => { const d = new Date(`${ymd}T00:00:00Z`); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === ymd; };
const DELIBERATING_RE = /^審議中[(（]#\d+、\d{4}-\d{2}-\d{2} 時点[)）]$/;

/** 標準の本文の実装マークを読む。Map<IMPL-NNNN, {state, check}> */
export function readMarks(texts) {
  const marks = new Map();
  for (const text of texts) {
    for (const line of maskFences(text.split(/\r?\n/)).masked) {
      const m = MARK_RE.exec(line);
      if (!m) continue;
      marks.set(m[1], { state: /\bstate=(\w+)/.exec(m[2])?.[1], check: /\bcheck=(\w+)/.exec(m[2])?.[1] });
    }
  }
  return marks;
}

function splitCells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

/** 括弧の外の「/」で分ける */
export function splitParts(cell) {
  const parts = []; let depth = 0; let cur = '';
  for (const ch of cell) {
    if ("(（".includes(ch)) depth++;
    if (")）".includes(ch)) depth--;
    if (ch === '/' && depth === 0) { parts.push(cur.trim()); cur = ''; } else cur += ch;
  }
  parts.push(cur.trim());
  return parts;
}

/** 値の直後が、括弧・コロン・行末のいずれかであること(「人工知能が…」を「人」と読まない) */
const valueOf = (part) => VALUES.find((v) => part.startsWith(v) && (part.length === v.length || /^[(（:：]/.test(part.slice(v.length))));

/** @returns {string[]} 違反の一覧 */
export function checkProjection(text, marks) {
  const problems = [];
  const s = text.indexOf(START); const e = text.indexOf(END);
  if (s < 0 || e < 0 || e < s || text.indexOf(START, s + 1) >= 0) return ['表の囲み(start・end)が無いか、1組でない'];
  const lines = text.slice(s + START.length, e).split(/\r?\n/).filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) return ['表の行が無い'];
  const head = splitCells(lines[0]);
  if (head.length !== HEADER.length || head.some((h, i) => h !== HEADER[i])) problems.push(`(a) 見出しの列が定めた7列でない: ${head.join(' / ')}`);
  for (const [i, line] of lines.slice(2).entries()) {
    const n = i + 1; const cells = splitCells(line);
    if (cells.length !== HEADER.length) { problems.push(`行${n}: 列が ${cells.length} 個(7個であること)`); continue; }
    const [, , kubun, weakest, , , deliberating] = cells;
    if (isTentative(line)) problems.push(`(b) 行${n}: 仮番号の IMPL(IMPL-TBD など)が残っている`);
    for (const id of new Set(line.match(IMPL_RE) ?? [])) if (!marks.has(id)) problems.push(`(b) 行${n}: ${id} が標準の本文のマークに無い`);
    const parts = splitParts(kubun); const vals = [];
    for (const p of parts) {
      const v = valueOf(p);
      if (!v) { problems.push(`(c) 行${n}: 区分の部分が6値で始まらない: ${p}`); continue; }
      vals.push(v);
      const ids = p.match(IMPL_RE) ?? [];
      if (v === '未達' && ids.length === 0) problems.push(`(d) 行${n}: 「未達」の部分に IMPL が無い: ${p}`);
      if (v === '未達') for (const id of ids) if (marks.has(id) && marks.get(id).state !== 'undelivered') problems.push(`(d) 行${n}: 「未達」の ${id} が state=undelivered でない(${marks.get(id).state})`);
      if (v === '機械が止める' && !ids.some((id) => marks.get(id)?.state === 'delivered' && marks.get(id)?.check === 'machine')) problems.push(`(e) 行${n}: 「機械が止める」に、state=delivered かつ check=machine の IMPL が無い`);
      if (v !== '未達') for (const id of ids) if (marks.get(id)?.state === 'undelivered') problems.push(`(d) 行${n}: state=undelivered の ${id} が「未達」の部分に無い(${v})`);
    }
    if (vals.length === parts.length && vals.length > 0) {
      const expect = VALUES[Math.max(...vals.map((v) => VALUES.indexOf(v)))];
      const got = /^([^:：]+)[:：]/.exec(weakest)?.[1]?.trim();
      if (got !== expect) problems.push(`(f) 行${n}: 最も弱い止め方の先頭が「${got ?? '(無し)'}」。区分から導く値は「${expect}」`);
      const has = vals.includes('審議中');
      if (has && !(DELIBERATING_RE.test(deliberating) && isRealDate(/\d{4}-\d{2}-\d{2}/.exec(deliberating)[0]))) problems.push(`(g) 行${n}: 区分に「審議中」があるが、審議中の表示が「審議中(#番号、YYYY-MM-DD 時点)」の形でない、または日付が実在しない`);
      if (!has && deliberating !== '—') problems.push(`(g) 行${n}: 区分に「審議中」が無いのに、審議中の表示が「—」でない`);
    }
  }
  return problems;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.md') ? [path.join(dir, d.name)] : []));
}

/** マークを読むファイルの選別。台帳(自動生成)と、書式の例のマークを持つ規約は読まない(check-impl.mjs と同じ) */
export function markSources(files) {
  return files.filter((f) => !f.includes(`${path.sep}community${path.sep}implementation-ledger`) && !f.endsWith(`${path.sep}community${path.sep}implementation-marking.md`));
}

export function loadMarks() {
  return readMarks(markSources(walk(DOCS)).map((f) => fs.readFileSync(f, 'utf8')));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const text = fs.readFileSync(path.join(DOCS, TARGET), 'utf8');
  const problems = checkProjection(text, loadMarks());
  if (problems.length) {
    console.error('投影表(困りごと起点)の表記の整合の違反:');
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  console.log('投影表(困りごと起点): 表記の整合を確認しました');
}
