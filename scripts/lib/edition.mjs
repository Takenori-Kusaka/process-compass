// 本標準の版の読み出しと検査(Issue #313 / ADR-0083)。
//
//   node scripts/lib/edition.mjs --label [--commit <sha>]   版の表示(VERSION.md が使う)。既定は HEAD のコミット
//
// 版の名は、発行の時点のコミット(history[0].commit)をビルドしたときだけ付ける(ADR-0083 X-1)。発行の記録を足した
// コミット(差分が edition.yaml と、知識ベースを更新するテンプレートの参照だけ)も、発行の時点のコミットとして扱う。
// それ以外のコミットは作業中の版で、「作業中の版(第N版の後)」または「作業中の版(未発行)」と示す
//
// 正本は src/data/edition.yaml。手続は community/standard-editions.md による。

import { execFileSync } from 'node:child_process';
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
    if (!/^[0-9a-f]{40}$/.test(String(h?.commit ?? ''))) p.push(`history[${i}].commit(発行の時点のコミット。40 桁)がありません。版の名は、このコミットをビルドしたときだけ付く`);
  }
  return p;
}

/** 発行の記録を足すコミットで変わってよい道(発行の時点のコミットとの差分がこれだけなら、発行の時点として扱う) */
export const ISSUE_RECORD_PATHS = ['src/data/edition.yaml', 'template'];

function gitOk(args, cwd = ROOT) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

/** ビルドしたコミットが、発行の時点のコミットに当たるか */
export function isIssuedCommit(commit, issuedCommit, cwd = ROOT) {
  if (!commit || !issuedCommit) return false;
  if (commit === issuedCommit) return true;
  if (gitOk(['merge-base', '--is-ancestor', issuedCommit, commit], cwd) === null) return false;
  const diff = gitOk(['diff', '--name-only', issuedCommit, commit], cwd);
  if (diff === null) return false;
  return diff.split('\n').filter(Boolean).every((f) => ISSUE_RECORD_PATHS.includes(f));
}

/**
 * コミットに当たる版。発行の時点のコミットなら { edition, issuedAt }。それ以外は edition が null で、
 * 最後に発行した版を basedOn に持つ(発行が無ければ null)
 */
export function editionAt(commit, d = readEdition(), cwd = ROOT) {
  if (!d.edition) return { edition: null, issuedAt: null, basedOn: null };
  if (isIssuedCommit(commit, d.history[0]?.commit, cwd)) return { edition: d.edition, issuedAt: d.issuedAt, basedOn: null };
  return { edition: null, issuedAt: null, basedOn: d.edition };
}

export function headCommit() {
  return (gitOk(['rev-parse', 'HEAD']) ?? '').trim() || null;
}

export function editionLabel(commit = headCommit(), d = readEdition(), cwd = ROOT) {
  const e = editionAt(commit, d, cwd);
  if (e.edition) return `${e.edition}(${e.issuedAt} 発行)`;
  return e.basedOn ? `作業中の版(${e.basedOn}の後)` : WORKING_DRAFT;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.argv.includes('--label')) {
  const i = process.argv.indexOf('--commit');
  process.stdout.write(editionLabel(i > 0 ? process.argv[i + 1] : headCommit()));
}
