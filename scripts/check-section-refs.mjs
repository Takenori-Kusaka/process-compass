#!/usr/bin/env node
// 節番号の参照の検査(ADR-0056 決定9、附属書H H.11)
//
// 附属書H(品質保証の論証)は、既存の条項からの投影である。各主張を支える条項を
// 節番号で引くため、参照先の章が改番されると、論証は実在しない条項を指したまま残る。
// リンクの検査(starlight-links-validator)が確かめるのはページの実在までであり、
// 節番号の実在は確かめない。本スクリプトは、節番号・ゲート・基準・様式・監査観点・
// 問いの番号が、参照先のページに実在することを確かめる。
//
// 検査する形式(対象ページ: SOURCES):
//
//   1. 章の節番号        5.5.4 / 3.12.3 / 7.9     → 第N章のページに、その番号で始まる見出しがある
//   2. ゲート            G-7                      → 第4章に、その番号で始まる見出しがある
//   3. ゲートの基準      G-7 基準9 / G-5 基準1〜8  → 第4章の当該ゲートの判定基準の表に、その番号の行がある
//   4. 様式              テンプレ0 / テンプレ0〜10 → 第6章に、その番号の見出しがある
//   5. 附属書の節        H.6 / F.6 / G.1          → 当該の附属書に、その番号で始まる見出しがある
//   6. 調整軸            軸A〜軸E                  → 第8章に、その軸の見出しがある
//   7. 監査の観点        観点14 / 観点2・3・5      → プロセス内部監査の観点の表に、その番号の行がある
//   8. 問い              問21                     → 附属書H H.9 の表に、その番号の行がある
//   9. 見出しの名前      [第8章](…)「事後監査の手続」/ [第8章「事後監査の手続」](…)
//                                                 → リンク先のページに、その語を含む見出しがある
//  10. 判断記録          ADR-0056                 → その番号の ADR のページがある
//
// 検査しない形式:
//   - リンクを伴わずに名前だけで引いた見出し(「調整は宣言を伴う」など)
//   - 様式の中の表(テンプレ0 表1)、条件の番号(5.5.4 の条件6)、保証の開示の項目番号
//   - ADR の決定の番号(ADR-0054 決定7)、根拠水準マークの番号(lint:evidence が検査する)
//   - 外部の規格の箇条番号(「箇条 8.5.1」の形で書く。本標準の節番号として扱わない)
//   - 参照先の内容が、引いた側の記述と合っているか
//
// 誤検出は、同じ行へ <!-- ref-ok: 理由 --> を書いて除外する。
//
// 引数:
//   ファイルのパス   SOURCES の代わりに、渡したファイルを検査する

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_ROOT = 'src/content/docs';
const BASE_PATH = '/process-compass';
const P4 = 'phase4-process-design';

/** 検査の対象。附属書H と、附属書H を番号で引くページ。附属書I(採用判断の手引き)は回答の根拠を条項で引く */
const SOURCES = [
  `${P4}/assurance-case.md`,
  `${P4}/adoption-guide.md`,
  `${P4}/proposal-template.md`,
  'phase6-operation/process-audit.md',
];

/** 章番号 → ページ */
const CHAPTER = {
  1: `${P4}/overview`,
  2: `${P4}/lifecycle`,
  3: `${P4}/roles-responsibilities`,
  4: `${P4}/gate-criteria`,
  5: `${P4}/human-ai-boundary`,
  6: `${P4}/deliverable-templates`,
  7: `${P4}/exception-escalation`,
  8: `${P4}/tailoring-guide`,
};

/** 附属書の記号 → ページ。節を記号つきの番号(F.6)で持つ附属書だけを登録する */
const ANNEX = {
  E: `${P4}/developer-guide`,
  F: `${P4}/safety-verification`,
  G: `${P4}/executive-projection`,
  H: `${P4}/assurance-case`,
  I: `${P4}/adoption-guide`,
};

const AUDIT_PAGE = 'phase6-operation/process-audit';
const AUDIT_HEADING = /^監査の観点/;
const QUESTION_PAGE = `${P4}/assurance-case`;
const QUESTION_HEADING = /^H\.9\s/;

const OK_RE = /<!--\s*ref-ok:/;

const errors = [];
const counts = {};
const pages = new Map();

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

function resolvePage(page) {
  for (const c of [`${page}.md`, `${page}.mdx`, `${page}/index.md`, `${page}/index.mdx`]) {
    const f = path.join(ROOT, DOCS_ROOT, c);
    if (existsSync(f)) return f;
  }
  return null;
}

/** ページの見出しと行を読む。見出しは { level, text, line } */
function load(page) {
  if (pages.has(page)) return pages.get(page);
  const file = resolvePage(page);
  if (!file) {
    pages.set(page, null);
    return null;
  }
  const lines = maskFences(readFileSync(file, 'utf8').split(/\r?\n/));
  const headings = [];
  for (let i = 0; i < lines.length; i++) {
    const h = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[i]);
    if (h) headings.push({ level: h[1].length, text: h[2], line: i });
  }
  const loaded = { lines, headings };
  pages.set(page, loaded);
  return loaded;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasHeadingStarting(page, prefix) {
  const p = load(page);
  if (!p) return false;
  const re = new RegExp(`^${esc(prefix)}(?![\\d.])`);
  return p.headings.some((h) => re.test(h.text));
}

function hasHeadingContaining(page, text) {
  const p = load(page);
  return !!p && p.headings.some((h) => h.text.includes(text));
}

/**
 * 見出しの節にある表から、先頭の列の番号を集める。
 * header を渡すと、見出し行がそれに合う最初の表だけを読む(G-1 は前提条件の表が先にある)。
 * 渡さなければ、節にあるすべての表を読む。
 */
function tableNumbers(page, headingRe, header) {
  const p = load(page);
  if (!p) return null;
  const h = p.headings.find((x) => headingRe.test(x.text));
  if (!h) return null;
  const next = p.headings.find((x) => x.line > h.line && x.level <= h.level);
  const end = next ? next.line : p.lines.length;
  const nums = new Set();
  let inTable = false;
  let reading = !header;
  for (let i = h.line + 1; i < end; i++) {
    const line = p.lines[i];
    if (!line.startsWith('|')) {
      if (inTable && header && reading) break;
      inTable = false;
      continue;
    }
    if (!inTable) {
      inTable = true;
      if (header) reading = header.test(line);
    }
    const row = /^\|\s*(\d+)\s*\|/.exec(line);
    if (reading && row) nums.add(Number(row[1]));
  }
  return nums;
}

/** 「1〜8」「5・7」「2・3・5」を番号の列へ展開する */
function expand(first, rest) {
  const out = [Number(first)];
  const re = /([・〜])\s*(\d+)/g;
  let m;
  while ((m = re.exec(rest ?? ''))) {
    const n = Number(m[2]);
    if (m[1] === '〜') for (let k = out[out.length - 1] + 1; k <= n; k++) out.push(k);
    else out.push(n);
  }
  return out;
}

const adrNumbers = new Set(
  readdirSync(path.join(ROOT, DOCS_ROOT, 'adr'))
    .map((f) => /^(\d{4})-/.exec(f)?.[1])
    .filter(Boolean)
);

function check(source) {
  // 引数で渡したファイルは、そのままのパスで読む(検査そのものの確認用)
  const file = existsSync(source) ? source : `${DOCS_ROOT}/${source}`;
  const raw = readFileSync(path.resolve(ROOT, file), 'utf8').split(/\r?\n/);
  const lines = maskFences(raw);

  const report = (i, kind, ref, why) => {
    errors.push(`${file}:${i + 1} ${kind}「${ref}」${why}`);
  };
  const count = (kind) => {
    counts[kind] = (counts[kind] ?? 0) + 1;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || OK_RE.test(line)) continue;
    // 見出しそのものは参照ではない
    if (/^#{1,6}\s/.test(line)) continue;

    // 9. リンクに伴う見出しの名前
    const linkRe = /\[([^\]]*)\]\((\/process-compass\/[^)\s#]*)(?:#[^)]*)?\)(「[^」]+」)?/g;
    let m;
    while ((m = linkRe.exec(line))) {
      const page = m[2].replace(`${BASE_PATH}/`, '').replace(/\/$/, '');
      const names = [...m[1].matchAll(/「([^」]+)」/g)].map((x) => x[1]);
      if (m[3]) names.push(m[3].slice(1, -1));
      for (const name of names) {
        count('見出しの名前');
        if (!hasHeadingContaining(page, name)) report(i, '見出しの名前', name, `が ${page} の見出しにありません`);
      }
    }

    // 以降は、リンクの URL・コード・コメントを除いた文で調べる
    const text = line
      .replace(/<!--.*?-->/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/\]\([^)]*\)/g, ']');

    // 3. ゲートの基準(2 より先に調べ、ゲートの実在も兼ねる)
    const critRe = /(?<![A-Za-z])G-(\d)\s*(?:の)?\s*基準\s*(\d+)((?:\s*[・〜]\s*\d+)*)/g;
    while ((m = critRe.exec(text))) {
      const rows = tableNumbers(CHAPTER[4], new RegExp(`^G-${m[1]}(?!\\d)`), /判定基準/);
      for (const n of expand(m[2], m[3])) {
        count('ゲートの基準');
        if (!rows || !rows.has(n)) report(i, 'ゲートの基準', `G-${m[1]} 基準${n}`, 'が第4章の判定基準の表にありません');
      }
    }

    // 2. ゲート
    const gateRe = /(?<![A-Za-z])G-(\d)(?!\d)/g;
    while ((m = gateRe.exec(text))) {
      count('ゲート');
      if (!hasHeadingStarting(CHAPTER[4], `G-${m[1]}`)) report(i, 'ゲート', `G-${m[1]}`, 'が第4章の見出しにありません');
    }

    // 4. 様式
    const tmplRe = /テンプレ\s*(\d+)(?:\s*〜\s*(\d+))?/g;
    while ((m = tmplRe.exec(text))) {
      for (const n of [m[1], m[2]].filter(Boolean)) {
        count('様式');
        const p = load(CHAPTER[6]);
        const found = p?.headings.some((h) => new RegExp(`^テンプレ${n}[::]`).test(h.text));
        if (!found) report(i, '様式', `テンプレ${n}`, 'が第6章の見出しにありません');
      }
    }

    // 5. 附属書の節
    const annexRe = /(?<![A-Za-z0-9.])([A-H])\.(\d{1,2})(?![\d.]|[A-Za-z])/g;
    while ((m = annexRe.exec(text))) {
      const page = ANNEX[m[1]];
      if (!page) continue;
      count('附属書の節');
      if (!hasHeadingStarting(page, `${m[1]}.${m[2]}`)) report(i, '附属書の節', `${m[1]}.${m[2]}`, `が ${page} の見出しにありません`);
    }

    // 6. 調整軸
    const axisRe = /軸\s*([A-Z])(?:\s*[〜・]\s*([A-Z]))?(?![A-Za-z])/g;
    while ((m = axisRe.exec(text))) {
      for (const a of [m[1], m[2]].filter(Boolean)) {
        count('調整軸');
        const p = load(CHAPTER[8]);
        if (!p?.headings.some((h) => new RegExp(`^軸${a}[::]`).test(h.text))) report(i, '調整軸', `軸${a}`, 'が第8章の見出しにありません');
      }
    }

    // 7. 監査の観点
    const viewRe = /観点\s*(\d+)((?:\s*[・〜]\s*\d+)*)/g;
    while ((m = viewRe.exec(text))) {
      const rows = tableNumbers(AUDIT_PAGE, AUDIT_HEADING, /観点/);
      for (const n of expand(m[1], m[2])) {
        count('監査の観点');
        if (!rows || !rows.has(n)) report(i, '監査の観点', `観点${n}`, 'がプロセス内部監査の観点の表にありません');
      }
    }

    // 8. 問い
    const qRe = /問\s*(\d+)((?:\s*[・〜]\s*\d+)*)/g;
    while ((m = qRe.exec(text))) {
      const rows = tableNumbers(QUESTION_PAGE, QUESTION_HEADING);
      for (const n of expand(m[1], m[2])) {
        count('問い');
        if (!rows || !rows.has(n)) report(i, '問い', `問${n}`, 'が附属書H H.9 の表にありません');
      }
    }

    // 10. 判断記録
    const adrRe = /ADR-(\d{4})/g;
    while ((m = adrRe.exec(text))) {
      count('判断記録');
      if (!adrNumbers.has(m[1])) report(i, '判断記録', `ADR-${m[1]}`, 'のページがありません');
    }

    // 1. 章の節番号。外部の規格の箇条番号(「箇条 8.5.1」)は対象にしない
    const secRe = /(?<![A-Za-z0-9.\-])([1-8])\.(\d{1,2})(?:\.(\d{1,2}))?(?![\d.]|[A-Za-z%])/g;
    while ((m = secRe.exec(text))) {
      const before = text.slice(Math.max(0, m.index - 6), m.index);
      if (/箇条\s*$/.test(before)) continue;
      const ref = m[0];
      count('章の節番号');
      if (!hasHeadingStarting(CHAPTER[m[1]], ref)) report(i, '章の節番号', ref, `が第${m[1]}章(${CHAPTER[m[1]]})の見出しにありません`);
    }
  }
}

const given = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const sources = given.length ? given : SOURCES;
for (const s of sources) check(s);

if (errors.length > 0) {
  console.error('節番号の参照の検査で問題が見つかりました:\n');
  for (const e of errors) console.error(`  ${e}`);
  console.error(`\n参照先の見出しを確かめてください。誤検出は、同じ行へ <!-- ref-ok: 理由 --> を書いて除外します`);
  process.exit(1);
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
const detail = Object.entries(counts)
  .map(([k, v]) => `${k} ${v}`)
  .join(' / ');
console.log(`節番号の参照: ${total}件(${detail})。対象 ${sources.length} ページ`);
