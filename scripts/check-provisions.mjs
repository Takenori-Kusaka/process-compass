#!/usr/bin/env node
// 規定の表現形式の検査(Issue #310 / ADR-0063)
//
// 第1章 1.5(附属書の種別)と 1.7(規定の表現形式・表の升の語・同じ事項は1か所)を、機械で確かめられる範囲で検査する。
// npm run check から呼ばれ、検出時は終了コード 1 で失敗する。
//
// 検査すること(番号は community/provision-forms.md の「検査の一覧」の表と同じ。#316 突合 X-18):
//   1. 附属書の種別の宣言      各附属書の表題と、第1章 1.5 の表の「種別」が、登録簿と一致する
//   2. 規定の文末              規定の文書(本文8章と規定の附属書)の依頼の形(〜ください)と「〜すべき」の文末
//   3. 表の升の語              規定の文書の廃した升の語(省略可・任意・どちらでもよい ほか)。「省略可」は地の文でも検出する
//   4. 附属書の引き方          規定の文書が参考の附属書を「による」で引く箇所
//   5. 参考の附属書            要求・禁止の文末(〜なければなりません/〜てはなりません)と、実装マーク
//   6. 廃した言い回し          登録簿の句が、公開ドキュメント・規則データ・準拠テンプレートに残っていない
//   7. 能力の否定の文末(#316 / ADR-0086)   規定の文書の文末の「〜できません/〜できない」
//   8. 手引きの頁(#316 / ADR-0086)         フェーズ5・6 の頁の、第1章 1.8 が列挙した文末で、同じ文の中に本文の所在が無いもの。
//                                          実装マーク。条項番号に似た独自の節番号(見出しの「4.1」など)
//   9. 手引きへの委任(#316)                規定の文書が、フェーズ5・6 を「〜による/〜に規定/〜に定め/〜が正本」で引く箇所
//  10. 章の引用(#316)                      「第N章 X.Y」の X が N でない引用と、リンク先が第N章の頁でない引用
//  11. 禁止事項の番号(#316 / ADR-0086)     「禁止事項N」を、一覧の所在(5.8.5 の / テーラリングの)で修飾せずに引く箇所
//  12. 注記の中の要求(#316 突合 X-13)      規定の文書の注記(:::note)の中の要求・禁止の文末(〜なければなりません/〜てはなりません)
//
// 検査しないこと(機械で判定できない):
//   - 「〜できます」が許容か能力か
//   - 平叙の動詞文が要求か説明か
//   - 言い回しを変えた写し(登録した句しか探さない)
//
// 除外:
//   - コードブロック(``` で囲まれた範囲)
//   - 行に `<!-- provision-ok: 理由 -->` がある行(2〜5・7〜12 の検査)
//   - 行に `retired-ok: 理由` がある行(6 の検査。Markdown は HTML コメント、YAML・スクリプトはコメントの中に書く)
//   理由の無い印は無効とする。
//
// 登録簿は src/data/provision-forms.yaml。書式と運用は community/provision-forms.md による。

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { missingInputs, INIT_HINT } from './lib/inputs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = 'src/content/docs';
const REGISTRY = 'src/data/provision-forms.yaml';
const reg = YAML.parse(readFileSync(path.join(ROOT, REGISTRY), 'utf8'));

const KIND_LABEL = { normative: '規定', informative: '参考' };
const violations = [];
const report = (file, line, category, text, hint) => violations.push({ file, line, category, text, hint });

const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8').split(/\r?\n/);

/** コードブロックを空行へ置換し、行番号を保ったまま検査対象外にする */
function maskFences(lines) {
  const out = [...lines];
  let fence = null;
  for (let i = 0; i < out.length; i++) {
    const m = /^\s*(`{3,})/.exec(out[i]);
    if (fence === null && m) {
      fence = m[1];
      out[i] = '';
      continue;
    }
    if (fence !== null) {
      if (m && m[1].length >= fence.length) fence = null;
      out[i] = '';
    }
  }
  return out;
}

const stripComments = (line) => line.replace(/<!--.*?-->/g, '');
const hasMark = (line, name) => new RegExp(`${name}\\s*[::]\\s*\\S`).test(line);

/** 文末(句点、行末、表の升の終わり、閉じ括弧の前)。太字の閉じを挟んでよい */
const END = String.raw`(?=\*{0,2}\s*(?:。|$|\||[))]))`;
const RE_REQUEST = new RegExp(`ください${END}`);
const RE_SHOULD = new RegExp(`すべき(?:です|である|だ)?${END}`);
const RE_SHALL = new RegExp(`(?:なければなりません|なければならない|[てで]はなりません|[てで]はならない)${END}`);
const RE_IMPL = /<!--\s*impl\s/;
/** 文末の「〜できません/〜できない」(R-2)。文の途中(連体修飾・条件)は対象の外 */
const PAREN_CITE = String.raw`[((](?:\]\([^)]*\)|[^))])*[))]`;
const RE_CANNOT = new RegExp(String.raw`(?:できません|できない)(?:${END}|(?=${PAREN_CITE}\*{0,2}\s*(?:。|$|\|)))`);

const docs = reg.documents ?? [];
const informativeAnnexes = new Set(docs.filter((d) => d.kind === 'informative' && d.annex).map((d) => d.annex));
/** 「附属書X … による」。リンク・節番号・節の名前を挟んでよい */
const RE_BY_ANNEX = /附属書\s*([A-Z])(?:\]\([^)]*\))?(?:\s*[A-Z]\.\d+(?:\.\d+)?)?(?:「[^」]*」)?\s*に?よ(?:る|ります)/g;

const cellWords = reg.retiredCellWords ?? [];
const RE_CELL = cellWords.length ? new RegExp(`^(?:${cellWords.join('|')})(?:[((].*)?$`) : null;
const anywhere = new Set(reg.retiredWordsAnywhere ?? []);

// --- 1. 附属書の種別の宣言 ---------------------------------------------------
const overviewDoc = docs.find((d) => d.chapter === 1);
const overviewLines = overviewDoc ? read(`${DOCS}/${overviewDoc.page}.md`) : [];
for (const d of docs) {
  const rel = `${DOCS}/${d.page}.md`;
  if (!existsSync(path.join(ROOT, rel))) {
    report(REGISTRY, 0, '登録簿', d.page, '登録したページがありません');
    continue;
  }
  if (!d.annex) continue;
  const lines = read(rel);
  const title = lines.find((l) => l.startsWith('title:')) ?? '';
  const want = `附属書${d.annex}(${KIND_LABEL[d.kind]})`;
  if (!title.includes(want)) {
    report(rel, 2, '種別の宣言', title.trim(), `表題に「${want}」と書いてください(第1章 1.5)`);
  }
  const row = overviewLines.find((l) => l.startsWith(`| [附属書${d.annex}]`));
  const cells = row ? row.split('|').map((c) => c.trim()) : [];
  if (!row || cells[2] !== KIND_LABEL[d.kind]) {
    report(`${DOCS}/${overviewDoc?.page}.md`, 0, '種別の宣言', `附属書${d.annex}`, `第1章 1.5 の表の「種別」が「${KIND_LABEL[d.kind]}」ではありません`);
  }
}

// --- 2〜5. 文末・升の語・附属書の引き方・参考の附属書 --------------------------------------------------------
for (const d of docs) {
  const rel = `${DOCS}/${d.page}.md`;
  if (!existsSync(path.join(ROOT, rel))) continue;
  const raw = read(rel);
  const masked = maskFences(raw);
  let inNote = false;
  masked.forEach((line0, i) => {
    if (!line0) return;
    // 12. 注記(:::note)の中の要求・禁止(突合 X-13。1.7.2 は注記を説明に数える)
    if (/^\s*:::note/.test(line0)) inNote = true;
    else if (inNote && /^\s*:::\s*$/.test(line0)) inNote = false;
    if (hasMark(line0, 'provision-ok')) return;
    const n = i + 1;
    if (inNote && d.kind === 'normative') {
      const mm = RE_SHALL.exec(stripComments(line0));
      if (mm) report(rel, n, '注記の中の要求・禁止', line0.slice(Math.max(0, mm.index - 20), mm.index + mm[0].length), '注記は説明であり、要求事項を置けません。注記の外の本文へ出してください(第1章 1.7.2)');
    }

    if (d.kind === 'informative') {
      if (RE_IMPL.test(line0)) {
        report(rel, n, '参考の附属書の実装マーク', line0.trim().slice(0, 60), '実装マークは、規定のある本文か規定の附属書へ置いてください');
      }
      const line = stripComments(line0);
      const m = RE_SHALL.exec(line);
      if (m) {
        report(rel, n, '参考の附属書の要求・禁止', line.slice(Math.max(0, m.index - 20), m.index + m[0].length), '参考の附属書に要求事項と禁止を置けません。本文か規定の附属書へ移し、所在を引いてください(第1章 1.5)');
      }
      return;
    }

    const line = stripComments(line0);
    let m = RE_REQUEST.exec(line);
    if (m) report(rel, n, '依頼の形', line.slice(Math.max(0, m.index - 20), m.index + m[0].length), '規定の文末に「〜ください」を使えません。要求は「〜します」、推奨は「〜することを推奨します」と書いてください(第1章 1.7.1)');
    m = RE_SHOULD.exec(line);
    if (m) report(rel, n, '「すべき」', line.slice(Math.max(0, m.index - 20), m.index + m[0].length), '強さが決まりません。要求か推奨の形で書いてください(第1章 1.7.1)');

    for (const w of anywhere) {
      if (line.includes(w)) report(rel, n, '廃した升の語', w, `「${w}」は使えません。ゲートの状態は 適用・簡略・統合・省略・未達 で書いてください(第1章 1.7.3)`);
    }
    if (RE_CELL && line.trim().startsWith('|')) {
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim().replace(/\*\*/g, ''));
      for (const c of cells) {
        if (RE_CELL.test(c) && ![...anywhere].some((w) => c.startsWith(w))) {
          report(rel, n, '廃した升の語', c.slice(0, 30), '表の升に使えません。許容(組織が選べる)か規定(標準が決めている)かを、第1章 1.7.3 の語で書いてください');
        }
      }
    }
    RE_BY_ANNEX.lastIndex = 0;
    let a;
    while ((a = RE_BY_ANNEX.exec(line))) {
      if (informativeAnnexes.has(a[1])) {
        report(rel, n, '参考の附属書を「による」で引いている', a[0].replace(/\]\([^)]*\)/, ''), `附属書${a[1]} は参考です。「附属書${a[1]} 参照」と書くか、規範を本文へ置いてください(第1章 1.5)`);
      }
    }
  });
}

// --- 7. 能力の否定の文末(R-2) --------------------------------------------------
for (const d of docs) {
  if (d.kind !== 'normative') continue;
  const rel = `${DOCS}/${d.page}.md`;
  if (!existsSync(path.join(ROOT, rel))) continue;
  maskFences(read(rel)).forEach((line0, i) => {
    if (!line0 || hasMark(line0, 'provision-ok')) return;
    const line = stripComments(line0);
    const re = new RegExp(RE_CANNOT.source, 'g');
    let m;
    while ((m = re.exec(line))) {
      report(rel, i + 1, '「できません」の文末', line.slice(Math.max(0, m.index - 24), m.index + m[0].length), '規定の文末に「〜できません/〜できない」を使えません。禁止は「〜しません/〜してはなりません」、可能性・能力の否定は「〜は不可能です/〜する手段がありません」と書いてください(第1章 1.7.1)');
    }
  });
}

// --- 8〜10. 手引きの頁・手引きへの委任・章の引用(R-1) ----------------------------------
const guideDirs = reg.guides?.dirs ?? [];
const chapterPages = Object.fromEntries(docs.filter((d) => d.chapter).map((d) => [d.chapter, d.page]));
const mainPages = docs.filter((d) => d.kind === 'normative').map((d) => d.page);
const RE_MAIN_CITE = new RegExp(
  `(?:/process-compass/(?:${mainPages.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})/|第[1-8]章|附属書\\s*[BDFH])`
);
const RE_GUIDE_LINK = /\]\(\/process-compass\/(?:phase5-implementation|phase6-operation)\/[^)]*\)([^。\n]{0,40})/g;
const RE_DELEGATE = /(?:によ(?:る|ります|り)|に規定|に定め|が正本)/;
const RE_HEADING_NUM = /^#{2,6}\s+\d+(?:\.\d+)+\s/;
/**
 * 手引きの頁に置かない文末(第1章 1.8。突合 X-7): 1.7.1 の表の要求・禁止の形のうち、平叙の動詞文(〜します/〜しません。
 * である調の〜する/〜しない)を除くすべて。〜とします、〜によります、〜を要します、〜を求めます、〜しなければなりません、
 * 〜してはなりません(と、である調の対)。平叙の動詞文は 1.7.2 により手引きの頁では説明として読むので対象の外
 */
const RE_GUIDE_FORBIDDEN = new RegExp(
  `(?:なければなりません|なければならない|[てで]はなりません|[てで]はならない|とします|とする|によります|による|を要します|を要する|を求めます|を求める)${END}`
);
/** 一致した位置を含む文(句点・行頭・表の升の区切りまで)を返す。本文の所在は同じ文の中に限って数える(突合 X-7) */
const sentenceAt = (line, index) => {
  const before = line.slice(0, index);
  const start = Math.max(before.lastIndexOf('。'), before.lastIndexOf('|')) + 1;
  const rest = line.slice(index);
  const endRel = rest.search(/。|\|/);
  return line.slice(start, endRel < 0 ? line.length : index + endRel + 1);
};

const guideFiles = [];
for (const dir of guideDirs) {
  const abs = path.join(ROOT, DOCS, dir);
  if (!existsSync(abs)) {
    report(REGISTRY, 0, '手引きの頁', dir, '登録した手引きの置き場がありません');
    continue;
  }
  for (const e of readdirSync(abs)) if (/\.mdx?$/.test(e)) guideFiles.push(`${DOCS}/${dir}/${e}`);
}
guideFiles.sort();
for (const rel of guideFiles) {
  maskFences(read(rel)).forEach((line0, i) => {
    if (!line0 || hasMark(line0, 'provision-ok')) return;
    const n = i + 1;
    if (RE_IMPL.test(line0)) {
      report(rel, n, '手引きの頁の実装マーク', line0.trim().slice(0, 60), '実装マークは、実装する本文の条項の側へ置き、手引きの頁には所在だけを残してください(第1章 1.8、実装マークの規約)');
    }
    if (RE_HEADING_NUM.test(line0)) {
      report(rel, n, '手引きの頁の節番号', line0.trim().slice(0, 40), '手引きの頁に、条項番号に似た独自の番号を振れません。見出しの名で引いてください(第1章 1.8)');
    }
    const line = stripComments(line0);
    const m = RE_GUIDE_FORBIDDEN.exec(line);
    if (m && !RE_MAIN_CITE.test(sentenceAt(line, m.index))) {
      report(rel, n, '手引きの頁の要求・禁止', line.slice(Math.max(0, m.index - 24), m.index + m[0].length), '手引きの頁は、要求・禁止の文末(第1章 1.8 の列挙)を置けません。本文の要求を述べるときは、同じ文の中で本文の所在を引いてください(第1章 1.8)');
    }
  });
}

for (const d of docs) {
  if (d.kind !== 'normative') continue;
  const rel = `${DOCS}/${d.page}.md`;
  if (!existsSync(path.join(ROOT, rel))) continue;
  maskFences(read(rel)).forEach((line0, i) => {
    if (!line0 || hasMark(line0, 'provision-ok')) return;
    const line = stripComments(line0);
    RE_GUIDE_LINK.lastIndex = 0;
    let g;
    while ((g = RE_GUIDE_LINK.exec(line))) {
      const after = g[1];
      const dm = RE_DELEGATE.exec(after);
      if (dm) {
        report(rel, i + 1, '手引きへの委任', line.slice(Math.max(0, g.index - 20), g.index + g[0].length).replace(/\]\([^)]*\)/, ''), 'フェーズ5・6 の頁は参考(手引き)です。要求事項の内容を委ねられません。内容を本文へ置くか、「〜参照」の形で引いてください(第1章 1.8)');
      }
    }
  });
}

const citeFiles = [...docs.map((d) => `${DOCS}/${d.page}.md`), ...guideFiles].filter((rel) => existsSync(path.join(ROOT, rel)));
const RE_CH_LINK = /\[第([1-8])章\s*([0-9]+)(?:\.[0-9]+)*[^\]]*\]\(\/process-compass\/([^)#]+?)\/?(?:#[^)]*)?\)/g;
const RE_CH_TEXT = /第([1-8])章\s*([0-9]+)\.[0-9]+/g;
for (const rel of citeFiles) {
  maskFences(read(rel)).forEach((line0, i) => {
    if (!line0 || hasMark(line0, 'provision-ok')) return;
    const line = stripComments(line0);
    let c;
    RE_CH_TEXT.lastIndex = 0;
    while ((c = RE_CH_TEXT.exec(line))) {
      if (c[1] !== c[2]) report(rel, i + 1, '章の引用', c[0], `第${c[1]}章の条項の番号は ${c[1]}. で始まります。番号か章を直してください(第1章 1.8)`);
    }
    RE_CH_LINK.lastIndex = 0;
    while ((c = RE_CH_LINK.exec(line))) {
      const want = chapterPages[Number(c[1])];
      if (want && c[3] !== want) report(rel, i + 1, '章の引用', c[0].replace(/\]\([^)]*\)/, ']'), `「第${c[1]}章」の引用のリンク先が第${c[1]}章の頁(${want})ではありません`);
    }
  });
}

// --- 11. 禁止事項の番号(R-6) -----------------------------------------------------
const plist = reg.prohibitionLists ?? {};
const qualifiers = plist.qualifiers ?? [];
const RE_PNUM = /禁止事項\s*[0-9０-９]/g;
const ptargets = [];
const pmissing = missingInputs(ROOT, plist.roots ?? []);
for (const m of pmissing) report(REGISTRY, 0, '検査の入力が無い', m.rel, `禁止事項の番号の置き場 ${m.rel} が${m.why}。取得: ${INIT_HINT}`);
const pExcluded = (rel) => (plist.exclude ?? []).some((x) => rel === x || rel.startsWith(x.endsWith('/') ? x : `${x}/`));
function walkP(rel, out) {
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs) || pExcluded(rel)) return;
  const st = statSync(abs);
  if (st.isFile()) {
    if ((plist.extensions ?? ['.md']).includes(path.extname(rel))) out.push(rel);
    return;
  }
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    walkP(`${rel}/${e.name}`, out);
  }
}
for (const r of plist.roots ?? []) if (!pmissing.some((m) => m.rel === r)) walkP(r, ptargets);
for (const rel of ptargets) {
  read(rel).forEach((line, i) => {
    if (hasMark(line, 'provision-ok')) return;
    RE_PNUM.lastIndex = 0;
    let m;
    while ((m = RE_PNUM.exec(line))) {
      const before = line.slice(Math.max(0, m.index - 12), m.index);
      if (!qualifiers.some((q) => before.endsWith(q))) {
        report(rel, i + 1, '禁止事項の番号', line.slice(Math.max(0, m.index - 16), m.index + m[0].length + 2), `番号は一覧の所在で修飾してください(「${qualifiers.join('」「')}」+ 禁止事項N)。番号の正本は第5章 5.8.5 と第8章「テーラリングの禁止事項」です(第1章 1.7)`);
      }
    }
  });
}

// --- 6. 廃した言い回し ---------------------------------------------------------
const phrases = reg.retiredPhrases ?? [];
const scan = reg.retiredScan ?? {};
const EXT = new Set(scan.extensions ?? ['.md', '.mdx']);
const excluded = (rel) => (scan.exclude ?? []).some((x) => rel === x || rel.startsWith(x.endsWith('/') ? x : `${x}/`));

function walk(rel, out) {
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs)) return;
  const st = statSync(abs);
  if (st.isFile()) {
    if (EXT.has(path.extname(rel)) && !excluded(rel)) out.push(rel);
    return;
  }
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const child = `${rel}/${e.name}`;
    if (excluded(child)) continue;
    if (e.isDirectory()) walk(child, out);
    else if (EXT.has(path.extname(e.name))) out.push(child);
  }
}

// 置き場が無い・空のディレクトリ(初期化していないサブモジュール)なら失敗させる。
// 検査できなかった置き場を、違反なしとして通さない(Issue #293 裁定 J-3 / ADR-0077)
const targets = [];
const missingRoots = missingInputs(ROOT, scan.roots ?? []);
for (const m of missingRoots) {
  report(REGISTRY, 0, '検査の入力が無い', m.rel, `廃した言い回しの置き場 ${m.rel} が${m.why}。検査を実施できないため失敗に数えます。取得: ${INIT_HINT}`);
}
for (const r of scan.roots ?? []) {
  if (missingRoots.some((m) => m.rel === r)) continue;
  walk(r, targets);
}
for (const rel of targets) {
  const lines = read(rel);
  lines.forEach((line, i) => {
    if (hasMark(line, 'retired-ok')) return;
    for (const p of phrases) {
      if (line.includes(p.phrase)) {
        report(rel, i + 1, '廃した言い回し', p.phrase, `${p.by} で廃しました。${p.instead ?? ''}`.trim());
      }
    }
  });
}

// --- 結果 ---------------------------------------------------------------------
const normative = docs.filter((d) => d.kind === 'normative').length;
const informative = docs.filter((d) => d.kind === 'informative').length;
if (violations.length === 0) {
  console.log(
    `規定の表現形式: 違反なし(規定の文書 ${normative}・参考の附属書 ${informative}・廃した言い回し ${phrases.length} 句を ${targets.length} ファイルで検査)`
  );
  process.exit(0);
}

console.error(`規定の表現形式: ${violations.length} 件の違反があります。\n`);
for (const v of violations) {
  console.error(`${v.file}:${v.line}  [${v.category}] "${v.text}"`);
  console.error(`  → ${v.hint}\n`);
}
console.error(`規約: ${DOCS}/community/provision-forms.md`);
console.error('正当な使用は、行に <!-- provision-ok: 理由 -->(文末・升の語)または retired-ok: 理由(廃した言い回し)を書いて除外できます。');
process.exit(1);
