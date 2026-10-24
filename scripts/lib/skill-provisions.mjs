// 準拠テンプレートのスキルの文の走査(Issue #310 / ADR-0064。#314 で共有の部品にした)
//
// scripts/check-skill-provisions.mjs(検査)と scripts/check-impl.mjs(台帳へ範囲の外の否定の件数を書き出す。
// #314 の突合 X-15)が使う。対象の文・印・所在の形は check-skill-provisions.mjs の冒頭が正本。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

// CLAUDE.md の構成依存部分(生成区間)。区間の中は構成から生成され、check-process-rules が構成との一致を確かめる
export const GEN_START = '<!-- generated:process-rules start -->';
export const GEN_END = '<!-- generated:process-rules end -->';

/**
 * スキルの文を走査する。root はリポジトリの直下。
 * 返すのは { files, errors, stats }。stats は { targets, source, local, boldNeg, plainNeg }
 */
export function scanSkillProvisions(root) {
  const DOCS = path.join(root, 'src/content/docs');
  const SKILLS = path.join(root, 'template/.claude/skills');
  const CLAUDE_MD = path.join(root, 'template/CLAUDE.md');
  const reg = YAML.parse(readFileSync(path.join(root, 'src/data/provision-forms.yaml'), 'utf8'));
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

  const errors0 = [];
  const files = [];
  walk(SKILLS, files);
  files.sort();
  if (existsSync(CLAUDE_MD)) files.push(CLAUDE_MD);
  else errors0.push('template/CLAUDE.md がありません');

  const errors = [...errors0];
  const stats = { targets: 0, source: 0, local: 0, boldNeg: 0, plainNeg: 0 };

  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/');
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
  return { files, errors, stats };
}
