// 本標準の版の読み出しと検査(Issue #313 / ADR-0083)。
//
//   node scripts/lib/edition.mjs --label   版の表示(VERSION.md が使う)。発行していなければ「作業中の版(未発行)」
//
// 正本は src/data/edition.yaml。手続は community/standard-editions.md による。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const EDITION_FILE = path.join(ROOT, 'src/data/edition.yaml');
export const EDITION_PATTERN = /^第([1-9][0-9]*)版( 修正([1-9][0-9]*))?$/;
export const WORKING_DRAFT = '作業中の版(未発行)';

export function readEdition(file = EDITION_FILE) {
  const d = YAML.parse(fs.readFileSync(file, 'utf8')) ?? {};
  return { edition: d.edition ?? null, issuedAt: d.issuedAt ?? null, history: Array.isArray(d.history) ? d.history : [] };
}

/** 版のデータの問題の一覧 */
export function editionProblems(d) {
  const p = [];
  const isDay = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  if (d.edition === null) {
    if (d.issuedAt !== null) p.push('edition が null(作業中の版)なのに issuedAt があります');
    if (d.history.length) p.push('edition が null なのに history に発行の記録があります');
    return p;
  }
  if (!EDITION_PATTERN.test(String(d.edition))) p.push(`edition "${d.edition}" は「第N版」または「第N版 修正M」で書きます`);
  if (!isDay(d.issuedAt)) p.push('issuedAt(発行日)を YYYY-MM-DD で書きます');
  const top = d.history[0];
  if (!top || top.edition !== d.edition || top.issuedAt !== d.issuedAt) p.push('history の先頭の行が、edition と issuedAt に一致しません。発行は history の1行を伴います');
  for (const [i, h] of d.history.entries()) {
    if (!EDITION_PATTERN.test(String(h?.edition ?? ''))) p.push(`history[${i}].edition の書式が不正です`);
    if (!['N', 'M'].includes(h?.change)) p.push(`history[${i}].change は N(要求を変える改訂)か M(要求を変えない修正)です`);
    if (!h?.citationReview) p.push(`history[${i}].citationReview(引用の棚卸しの記録の所在)がありません`);
  }
  return p;
}

export function editionLabel(d = readEdition()) {
  return d.edition ? `${d.edition}(${d.issuedAt} 発行)` : WORKING_DRAFT;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.argv.includes('--label')) {
  process.stdout.write(editionLabel());
}
