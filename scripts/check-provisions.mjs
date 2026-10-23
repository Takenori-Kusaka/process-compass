#!/usr/bin/env node
// 規定の表現形式の検査(Issue #310 / ADR-0063)
//
// 第1章 1.5(附属書の種別)と 1.7(規定の表現形式・表の升の語・同じ事項は1か所)を、機械で確かめられる範囲で検査する。
// npm run check から呼ばれ、検出時は終了コード 1 で失敗する。
//
// 検査すること:
//   1. 附属書の種別の宣言      各附属書の表題と、第1章 1.5 の表の「種別」が、登録簿と一致する
//   2. 規定の文書(本文8章と規定の附属書)
//        - 依頼の形(〜ください)と「〜すべき」の文末
//        - 廃した升の語(省略可・任意・どちらでもよい)。「省略可」は地の文でも検出する
//        - 参考の附属書を「による」で引く箇所
//   3. 参考の附属書            要求・禁止の文末(〜なければなりません/〜てはなりません)と、実装マーク
//   4. 廃した言い回し          登録簿の句が、公開ドキュメント・規則データ・準拠テンプレートに残っていない
//
// 検査しないこと(機械で判定できない):
//   - 「〜できます」が許容か能力か
//   - 平叙の動詞文が要求か説明か
//   - 言い回しを変えた写し(登録した句しか探さない)
//
// 除外:
//   - コードブロック(``` で囲まれた範囲)
//   - 行に `<!-- provision-ok: 理由 -->` がある行(2・3 の検査)
//   - 行に `retired-ok: 理由` がある行(4 の検査。Markdown は HTML コメント、YAML・スクリプトはコメントの中に書く)
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

// --- 2・3. 文末と升の語 --------------------------------------------------------
for (const d of docs) {
  const rel = `${DOCS}/${d.page}.md`;
  if (!existsSync(path.join(ROOT, rel))) continue;
  const raw = read(rel);
  const masked = maskFences(raw);
  masked.forEach((line0, i) => {
    if (!line0) return;
    if (hasMark(line0, 'provision-ok')) return;
    const n = i + 1;

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

// --- 4. 廃した言い回し ---------------------------------------------------------
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
