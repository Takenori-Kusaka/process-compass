#!/usr/bin/env node
// 適用範囲の検査と台帳生成(Issue #226)
//
// 条項の適用範囲が本文の途中にしか無いと、目的を持って条文を探す読み手は
// 規範の箇条書きで読むのを止め、限定を落とす。規定が実行層へ降りない破れ(#216)の
// 裏返しであり、結果は過剰適用になる。
//
// 本スクリプトは2つを行う。
//
//   1. 見出しの適用範囲注記を収集し、台帳(community/scope-ledger.md)を生成する
//        ### 5.7.3 選択肢の比較(適用: R1 の決定・例外承認)
//   2. 限定表現を地の文へ置いたまま、見出しにも規範の行にも適用範囲が無い節を検出する
//
// 2 の誤検出は src/data/scope-exempt.yaml へ理由付きで登録する。登録そのものが
// 「この節の限定は規範と同じ行にある」という判断の記録になる。
//
// オプション:
//   --write   台帳ページ(community/scope-ledger.md)を再生成する

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import GithubSlugger from 'github-slugger';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_ROOT = 'src/content/docs';
const LEDGER_PATH = `${DOCS_ROOT}/community/scope-ledger.md`;
const BASE_PATH = '/process-compass';

/** 規範を置く章。解説・調査の章は検出の対象にしない */
const NORMATIVE_DIRS = ['phase4-process-design', 'phase5-implementation', 'phase6-operation'];

/** 見出しの適用範囲注記 */
const SCOPE_RE = /[((]適用:\s*([^))]+)[))]/;

/**
 * 地の文へ置かれた限定表現。
 * 表の行(|)と箇条書き(-)は対象にしない。規範と同じ行に限定があれば読み落とせない。
 */
// 語彙は閉じた集合に保ちます。一般的な「〜のみ」まで広げると、技術文書では
// 大半が適用範囲の限定ではないため、除外の登録が検査を通すためだけの雑音になります(ADR-0049)。
const LIMIT_RE =
  /(R[123]|CL[0-3]|S[012]|コア機能|安全関連ソフトウェア)\s*(の決定|の変更|以上|以下|の案件|)[^。]{0,40}?(では|に限|のみ|場合に)/;

const args = new Set(process.argv.slice(2));
const errors = [];
const warnings = [];
const scopes = [];

const exempt = YAML.parse(readFileSync(path.join(ROOT, 'src/data/scope-exempt.yaml'), 'utf8'));
const EXEMPT = new Set((exempt.exempt ?? []).map((e) => `${e.page}#${e.heading}`));

/** src/content/docs/a/b.md -> /process-compass/a/b/ */
function toUrl(file) {
  const rel = file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');
  const slug = rel.replace(/\/index$/, '').replace(/^index$/, '');
  return slug ? `${BASE_PATH}/${slug}/` : `${BASE_PATH}/`;
}

/** コードブロックの中身を空行へ置換し、行番号を保ったまま対象外にする */
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

/**
 * 適用範囲の判定の単位を分ける。
 *
 * リスク区分(R)は変更ごとに判定する。安全重要度(CL)は案件ごとに確定する。
 * 両者を混ぜて「この案件では適用外」と機械が宣言すると、R1 の変更に対しても
 * 適用外と読める。案件単位で外してよいのは CL の側だけである(ADR-0039)。
 */
// 判定の単位は4つです(ADR-0049)。ステージごと・機能ごとは、案件単位で適用外にできません。
function classify(text) {
  if (/R[123]/.test(text)) return 'per-change';
  if (/コア機能|安全関連ソフトウェア|安全・法規制/.test(text)) return 'per-feature';
  if (/S[012]|ステージ/.test(text)) return 'per-stage';
  if (/CL[0-3]/.test(text)) return 'per-project';
  return 'other';
}

const UNITS = {
  'per-change': '変更ごと',
  'per-feature': '機能ごと',
  'per-stage': 'ステージごと',
  'per-project': '案件ごと',
  other: 'その他',
};

function collect(file) {
  const lines = maskFences(readFileSync(file, 'utf8').split(/\r?\n/));
  const slugger = new GithubSlugger();
  const normative = NORMATIVE_DIRS.some((d) => file.includes(`${DOCS_ROOT}/${d}/`));
  const page = file.replace(/\\/g, '/').replace(`${DOCS_ROOT}/`, '').replace(/\.mdx?$/, '');

  let heading = null;
  let slug = null;
  let flagged = false;

  const flush = () => {
    flagged = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const h = /^(#{2,4})\s+(.+?)\s*$/.exec(lines[i]);
    if (h) {
      flush();
      heading = h[2];
      slug = slugger.slug(heading);
      const m = SCOPE_RE.exec(heading);
      if (m) {
        const range = m[1].trim();
        scopes.push({
          page,
          heading,
          title: heading.replace(SCOPE_RE, '').trim(),
          range,
          unit: classify(range),
          url: `${toUrl(file)}#${slug}`,
          line: i + 1,
        });
      }
      continue;
    }
    if (!normative || !heading || flagged) continue;
    if (SCOPE_RE.test(heading)) continue;

    const body = lines[i].trim();
    if (!body || body.startsWith('|') || body.startsWith('-') || body.startsWith('>')) continue;
    if (!LIMIT_RE.test(body)) continue;
    if (EXEMPT.has(`${page}#${heading}`)) continue;

    flagged = true;
    warnings.push(
      `${file}:${i + 1} 「${heading}」の地の文に限定があります。見出しへ(適用: …)を併記するか、` +
        `限定を規範と同じ行へ書いてください。該当しない場合は src/data/scope-exempt.yaml へ登録してください\n` +
        `      ${body.slice(0, 70)}`
    );
  }
}

function renderLedger(rows) {
  const out = [];
  out.push('| 条項 | 適用範囲 | 判定の単位 | 記載箇所 |');
  out.push('| --- | --- | --- | --- |');
  for (const s of rows) {
    out.push(`| ${s.title} | ${s.range} | ${UNITS[s.unit]} | [${s.page}](${s.url}) |`);
  }
  return out.join('\n');
}

function replaceBlock(text, body) {
  const start = '<!-- scope-ledger:start -->';
  const end = '<!-- scope-ledger:end -->';
  const si = text.indexOf(start);
  const ei = text.indexOf(end);
  if (si === -1 || ei === -1) throw new Error(`${LEDGER_PATH} に ${start} / ${end} がありません`);
  return `${text.slice(0, si + start.length)}\n\n${body}\n\n${text.slice(ei)}`;
}

/** 台帳を機械可読の形でも出す。テンプレートへは build-template-kb.mjs が運ぶ */
export function buildScopes() {
  return scopes.map((s) => ({ page: s.page, title: s.title, range: s.range, unit: s.unit, source: s.url }));
}

// --- 実行 ---

const files = [];
for await (const f of glob(`${DOCS_ROOT}/**/*.{md,mdx}`)) {
  const norm = f.replace(/\\/g, '/');
  if (norm.endsWith('community/scope-ledger.md')) continue;
  if (norm.endsWith('community/scope-marking.md')) continue;
  files.push(norm);
}
files.sort();
for (const f of files) collect(f);

scopes.sort((a, b) => a.page.localeCompare(b.page) || a.line - b.line);

const ledgerText = readFileSync(LEDGER_PATH, 'utf8');
const nextText = replaceBlock(ledgerText, renderLedger(scopes));

if (args.has('--write')) {
  if (nextText !== ledgerText) {
    writeFileSync(LEDGER_PATH, nextText);
    console.log(`更新: ${LEDGER_PATH}`);
  } else {
    console.log(`変更なし: ${LEDGER_PATH}`);
  }
} else if (nextText !== ledgerText) {
  errors.push(`${LEDGER_PATH} が最新ではありません。'npm run scope:write' を実行してください`);
}

for (const w of warnings) errors.push(w);

if (errors.length > 0) {
  console.error('適用範囲の検査で問題が見つかりました:\n');
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n規約: ${DOCS_ROOT}/community/scope-marking.md`);
  process.exit(1);
}

const perChange = scopes.filter((s) => s.unit === 'per-change').length;
console.log(`適用範囲の注記: ${scopes.length}件(変更ごとに判定: ${perChange}件)`);
