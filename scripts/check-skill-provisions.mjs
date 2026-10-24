#!/usr/bin/env node
// 準拠テンプレートのスキルの文の検査(Issue #310 / ADR-0064)
//
// スキルの文のうち、要求と禁止の文末を持つものに、本標準の所在か「テンプレート独自」の印があることを確かめる。
// 標準を改めても、スキルの文へ届く経路が無かった(#300 の決定が2件、スキルに改訂前のまま残った)。
// npm run check から呼ばれ、検出時は終了コード 1 で失敗する。
//
// 対象の文(template/.claude/skills/ の .md と、template/CLAUDE.md の構成依存部分(生成区間)の外。コードブロックの外):
//   1. 文末が要求・禁止の形の行   〜なければなりません/〜なければならない/〜てはなりません/〜てはならない/〜ないでください
//      (依頼の形「〜ないでください」は #314 / ADR-0084 決定5 で足した。書き直した後に同じ形が印なしで戻ることを防ぐ)
//   2. 禁止を列挙する節の項目      見出しに「〜てはならない」「禁止事項」を含む節の、箇条書きと表の行
//
// 印(対象の行に書く。2 の項目は、節の見出しの行か、見出しの直後の行に書いた印でも足りる):
//   <!-- 根拠: 標準 第5章 5.8.5 -->            本標準の所在。複数は「、」で区切る
//   <!-- テンプレート独自: 理由 -->            本標準に対応する規定が無い文。理由を書く
//
// 所在として書ける形(実在を確かめる):
//   第N章 a.b / 第N章 a.b.c     その章に、番号で始まる見出しがある
//   第4章 G-N                   第4章に、そのゲートの見出しがある
//   第N章「節の名前」            その章に、名前を含む見出しがある
//   附属書X / 附属書X X.n / 附属書X「節の名前」   規定の附属書に限る。参考の附属書は根拠にならない
//   IMPL-NNNN                   その実装マークが標準本文にある
//
// 検査しないこと: 引いた節の内容と、スキルの文が合っているか。標準の要求をスキルが落としていること。
// 平叙の否定(〜しない)と太字の否定(**〜しない**)で書いた規則。件数だけを出力する(限界の表に出す)。
// この検査は文の所在の追跡であり、AI がその文に従うことを示さない。振る舞いの評価(複数回の試行)は CI に課さない。
// 書式と運用は community/implementation-marking.md「準拠テンプレートのスキルの文」による。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { requireInputs } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'src/content/docs');
const SKILLS = path.join(ROOT, 'template/.claude/skills');
const CLAUDE_MD = path.join(ROOT, 'template/CLAUDE.md');
// CLAUDE.md の構成依存部分(生成区間)。区間の中は構成から生成され、check-process-rules が構成との一致を確かめる
const GEN_START = '<!-- generated:process-rules start -->';
const GEN_END = '<!-- generated:process-rules end -->';

// 入力(template/)が無ければ失敗させる。飛ばさない(Issue #293 / ADR-0077)
requireInputs(ROOT, ['template', 'template/.claude/skills'], 'スキルの文の検査');

const reg = YAML.parse(readFileSync(path.join(ROOT, 'src/data/provision-forms.yaml'), 'utf8'));
const chapterPage = Object.fromEntries(reg.documents.filter((d) => d.chapter).map((d) => [String(d.chapter), d.page]));
const annexDoc = Object.fromEntries(reg.documents.filter((d) => d.annex).map((d) => [d.annex, d]));

const headingCache = new Map();
function headings(page) {
  if (!headingCache.has(page)) {
    const file = path.join(DOCS, `${page}.md`);
    const hs = existsSync(file)
      ? readFileSync(file, 'utf8').split(/\r?\n/).map((l) => /^#{2,6}\s+(.+?)\s*$/.exec(l)?.[1]).filter(Boolean)
      : [];
    headingCache.set(page, hs);
  }
  return headingCache.get(page);
}

let implIds = null;
function implExists(id) {
  if (!implIds) {
    implIds = new Set();
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.mdx?$/.test(e.name) && e.name !== 'implementation-ledger.md') {
          for (const m of readFileSync(p, 'utf8').matchAll(/<!--\s*impl\s+(IMPL-\d{4})\s/g)) implIds.add(m[1]);
        }
      }
    };
    walk(DOCS);
  }
  return implIds.has(id);
}

const toHalf = (s) => s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));

/** 所在の1件を確かめる。問題があれば文字列、無ければ null */
function locatorProblem(raw) {
  const loc = toHalf(raw.trim()).replace(/^標準\s*/, '');
  if (!loc) return '所在が空です';
  let m = /^(IMPL-\d{4})$/.exec(loc);
  if (m) return implExists(m[1]) ? null : `${m[1]} が標準本文にありません`;

  m = /^第(\d)章\s*(.*)$/.exec(loc);
  if (m) {
    const page = chapterPage[m[1]];
    if (!page) return `第${m[1]}章 がありません`;
    const rest = m[2].trim();
    if (!rest) return null;
    const hs = headings(page);
    let r = /^(G-\d)(?:\s.*)?$/.exec(rest);
    if (r) return hs.some((h) => h.startsWith(`${r[1]} `)) ? null : `第${m[1]}章 に ${r[1]} の見出しがありません`;
    r = /^(\d+(?:\.\d+){1,2})(?:\s.*)?$/.exec(rest);
    if (r) return hs.some((h) => h.startsWith(`${r[1]} `)) ? null : `第${m[1]}章 に ${r[1]} で始まる見出しがありません`;
    r = /^「([^」]+)」/.exec(rest);
    if (r) return hs.some((h) => h.includes(r[1])) ? null : `第${m[1]}章 に「${r[1]}」を含む見出しがありません`;
    return `所在の形を読めません: ${raw.trim()}`;
  }

  m = /^附属書\s*([A-Z])\s*(.*)$/.exec(loc);
  if (m) {
    const d = annexDoc[m[1]];
    if (!d) return `附属書${m[1]} がありません`;
    if (d.kind !== 'normative') return `附属書${m[1]} は参考です。参考の附属書は根拠になりません(第1章 1.5)。本文か規定の附属書の所在を書いてください`;
    const rest = m[2].trim();
    if (!rest) return null;
    const hs = headings(d.page);
    let r = /^([A-Z]\.\d+(?:\.\d+)?)(?:\s.*)?$/.exec(rest);
    if (r) return hs.some((h) => h.startsWith(`${r[1]} `)) ? null : `附属書${m[1]} に ${r[1]} で始まる見出しがありません`;
    r = /^「([^」]+)」/.exec(rest);
    if (r) return hs.some((h) => h.includes(r[1])) ? null : `附属書${m[1]} に「${r[1]}」を含む見出しがありません`;
    return `所在の形を読めません: ${raw.trim()}`;
  }
  return `所在の形を読めません: ${raw.trim()}(第N章 a.b / 第4章 G-N / 第N章「節名」/ 附属書X X.n / IMPL-NNNN)`;
}

const RE_SOURCE = /<!--\s*根拠\s*[::]\s*(.*?)\s*-->/;
const RE_LOCAL = /<!--\s*テンプレート独自\s*(?:[::]\s*(.*?))?\s*-->/;
const END = String.raw`(?=\*{0,2}\s*(?:。|$|\||[))」]))`;
const RE_SHALL = new RegExp(`(?:なければなりません|なければならない|[てで]はなりません|[てで]はならない|ないで(?:ください|下さい))${END}`);
// 範囲の外の否定(件数だけを出す)。太字の否定と、平叙の否定の文末
const RE_BOLD_NEG = /\*\*[^*]*ない\*\*/;
const RE_PLAIN_NEG = new RegExp(`ない${END}`);
const RE_PROHIBITION_HEADING = /[てで]はならない|禁止事項/;

/** 行の印を読む。{ kind: 'source'|'local', problems: [] } または null */
function readMark(line) {
  const s = RE_SOURCE.exec(line);
  if (s) {
    const locs = s[1].split(/[、,]/).map((x) => x.trim()).filter(Boolean);
    const problems = locs.length ? locs.map(locatorProblem).filter(Boolean) : ['所在が空です'];
    return { kind: 'source', problems };
  }
  const l = RE_LOCAL.exec(line);
  if (l) return { kind: 'local', problems: (l[1] ?? '').trim() ? [] : ['「テンプレート独自」の印に理由がありません'] };
  return null;
}

function walk(dir, out) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
}

const files = [];
walk(SKILLS, files);
files.sort();
if (existsSync(CLAUDE_MD)) files.push(CLAUDE_MD);
else console.error('template/CLAUDE.md がありません');

const errors = [];
const stats = { targets: 0, source: 0, local: 0, boldNeg: 0, plainNeg: 0 };

for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  if (file === CLAUDE_MD) {
    // 生成区間を空行に置き換える(行番号を保つ)
    const b = lines.indexOf(GEN_START);
    const e = lines.indexOf(GEN_END);
    if (b < 0 || e < b) errors.push(`${rel}: 生成区間の目印(${GEN_START} / ${GEN_END})がありません`);
    else for (let k = b; k <= e; k++) lines[k] = '';
  }
  let fence = null;
  // 禁止を列挙する節。{ level, mark } または null
  let section = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const f = /^\s*(`{3,})/.exec(line);
    if (fence === null && f) {
      fence = f[1];
      continue;
    }
    if (fence !== null) {
      if (f && f[1].length >= fence.length) fence = null;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      if (section && h[1].length <= section.level) section = null;
      if (RE_PROHIBITION_HEADING.test(h[2].replace(/<!--.*?-->/g, ''))) {
        // 節の印: 見出しの行か、見出しの直後(空行を1つ挟んでよい)の行
        const mark = readMark(line) ?? readMark(lines[i + 1] ?? '') ?? (lines[i + 1]?.trim() === '' ? readMark(lines[i + 2] ?? '') : null);
        section = { level: h[1].length, mark };
        if (mark) for (const p of mark.problems) errors.push(`${rel}:${i + 1} 節の印: ${p}`);
      }
      continue;
    }

    const text = line.replace(/<!--.*?-->/g, '');
    const isItem = /^\s*(?:[-*]\s+\S|\|\s*\d+\s*\|)/.test(text);
    const shall = RE_SHALL.test(text);
    const inSection = section !== null && isItem;
    if (!shall && !inSection) {
      if (RE_BOLD_NEG.test(text)) stats.boldNeg++;
      else if (RE_PLAIN_NEG.test(text)) stats.plainNeg++;
      continue;
    }

    stats.targets++;
    const own = readMark(line);
    const mark = own ?? (inSection ? section.mark : null);
    if (!mark) {
      errors.push(
        `${rel}:${i + 1} 要求・禁止の文に、本標準の所在(<!-- 根拠: 標準 第N章 a.b -->)も「テンプレート独自」の印(<!-- テンプレート独自: 理由 -->)もありません: ${text.trim().slice(0, 70)}`
      );
      continue;
    }
    if (own) for (const p of own.problems) errors.push(`${rel}:${i + 1} ${p}`);
    stats[mark.kind]++;
  }
}

if (errors.length) {
  console.error(`スキルの文の検査: ${errors.length} 件の問題があります。\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error('\n規約: src/content/docs/community/implementation-marking.md「準拠テンプレートのスキルの文」');
  process.exit(1);
}
console.log(
  `スキルの文: ${files.length} ファイル(スキルと CLAUDE.md の生成区間の外)、要求・禁止の文 ${stats.targets} 件(本標準の所在つき ${stats.source} 件、テンプレート独自 ${stats.local} 件)`
);
console.log(
  `範囲の外(印を求めない): 太字の否定を含む行 ${stats.boldNeg} 件、平叙の否定で終わる行 ${stats.plainNeg} 件。` +
    'この検査は文の所在の追跡で、AI が従うことを示さない(community/implementation-marking.md「検査の限界」)'
);
