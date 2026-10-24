#!/usr/bin/env node
// 第1章 1.3 の参照文書の版と出典台帳の対応を検査する(Issue #313 / ADR-0083 決定4)
//
// 検査すること:
//   1. 1.3 の節にある規格の呼び名(ISO・IEC・JIS ほか)に、発行年が付いていること(版の無い引用をしない)
//   2. 1.3 の表の各行に、出典台帳の識別子(SRC-NNNN)が書かれ、そのカードが在ること
//   3. 表の行が引く版の呼び名(例: ISO 9001:2015)が、その行の引くカードの題名に含まれること
//      (表の外の注記の呼び名は、台帳のいずれかのカードの題名に含まれること)
//   4. 規格の呼び名を持たず、版を「第N版」で示す文書(ガイドライン)は、その版がその行のカードの題名に含まれること
//
// 検査しないこと: 1.3 の外の本文の引用。機械は、引用がどの版を指すつもりかを判定できないため、
// 本文の引用は版の発行ごとの棚卸し(community/standard-editions.md)で人が確かめる。

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OVERVIEW = path.join(ROOT, 'src/content/docs/phase4-process-design/overview.md');
const SOURCES = path.join(ROOT, 'research/sources');

// 規格の呼び名。発行年(:YYYY)と追補(/AMD1:2015)を任意で拾う
const DESIGNATION =
  /\b(ISO\/IEC\/IEEE|ISO\/IEC TR|ISO\/IEC|ISO|IEC|JIS [A-Z])\s?([0-9]{3,5}(?:-[0-9]+)?)(:[0-9]{4})?((?:\/AMD[0-9]+:[0-9]{4})*)/g;

function loadCards() {
  const cards = new Map();
  for (const f of readdirSync(SOURCES)) {
    if (!/^SRC-\d{4}\.yaml$/.test(f)) continue;
    const c = YAML.parse(readFileSync(path.join(SOURCES, f), 'utf8'));
    cards.set(c.id, c);
  }
  return cards;
}

export function section13(md) {
  const a = md.indexOf('## 1.3 ');
  const b = md.indexOf('\n## 1.4 ', a);
  if (a < 0 || b < 0) return null;
  return md.slice(a, b);
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

export function checkCitations(md, cards) {
  const problems = [];
  const sec = section13(md);
  if (!sec) return ['第1章に 1.3 の節が見つかりません'];
  if (!sec.includes('本標準には、引用規格はありません')) {
    problems.push('1.3 に「本標準には、引用規格はありません」の文がありません。引用規格を置くなら、この検査と ADR-0083 決定4 を改めてください');
  }
  // 1. 版の無い呼び名
  for (const m of sec.matchAll(DESIGNATION)) {
    if (!m[3]) {
      // 版つきの呼び名の直後の「/ JIS ...」などは別に拾われるので、ここは呼び名そのものだけを見る
      problems.push(`1.3: 「${norm(m[0])}」に発行年がありません(版の無い引用をしない)`);
    }
  }
  // 2〜4. 表の行
  const rows = sec.split('\n').filter((l) => l.startsWith('|') && !/^\|\s*-/.test(l));
  const header = rows.shift();
  if (!header || !header.includes('出典台帳')) {
    problems.push('1.3 の表に「出典台帳」の列がありません');
    return problems;
  }
  const cols = header.split('|').map((c) => c.trim());
  const docCol = cols.indexOf('文書(版)');
  const srcCol = cols.indexOf('出典台帳');
  if (docCol < 0) problems.push('1.3 の表に「文書(版)」の列がありません');
  const tableDesignations = new Set();
  for (const row of rows) {
    const cells = row.split('|').map((c) => c.trim());
    const doc = cells[docCol] ?? '';
    const ids = [...(cells[srcCol] ?? '').matchAll(/SRC-\d{4}/g)].map((m) => m[0]);
    if (ids.length === 0) {
      problems.push(`1.3 の行「${doc}」に出典台帳の識別子がありません`);
      continue;
    }
    const titles = [];
    for (const id of ids) {
      const c = cards.get(id);
      if (!c) problems.push(`1.3 の行「${doc}」が引く ${id} のカードがありません`);
      else titles.push(norm(String(c.title ?? '')));
    }
    for (const m of doc.matchAll(DESIGNATION)) {
      if (!m[3]) continue;
      const d = norm(`${m[1]} ${m[2]}${m[3]}`).replace(/^(ISO\/IEC\/IEEE|ISO\/IEC TR|ISO\/IEC|ISO|IEC) /, '$1 ');
      tableDesignations.add(d);
      const ok = titles.some((t) => t.includes(d) || t.replace(/\s/g, '').includes(d.replace(/\s/g, '')));
      if (!ok) problems.push(`1.3 の行「${doc}」: 版「${d}」を題名に含むカードが、その行の ${ids.join('、')} にありません`);
    }
    // 規格の呼び名を持たない文書(ガイドライン)だけ、「第N版」を版の呼び名として照合する
    const hasDesignation = [...doc.matchAll(DESIGNATION)].some((m) => m[3]);
    for (const m of hasDesignation ? [] : doc.matchAll(/第[0-9.]+版/g)) {
      if (!titles.some((t) => t.includes(m[0]))) {
        problems.push(`1.3 の行「${doc}」: 版「${m[0]}」を題名に含むカードが、その行の ${ids.join('、')} にありません`);
      }
    }
  }
  // 表の外(注記・本文)の版つきの呼び名は、台帳のいずれかのカードにあること
  const allTitles = [...cards.values()].map((c) => norm(String(c.title ?? '')).replace(/\s/g, ''));
  for (const m of sec.matchAll(DESIGNATION)) {
    if (!m[3]) continue;
    const d = norm(`${m[1]} ${m[2]}${m[3]}`);
    if (tableDesignations.has(d)) continue;
    if (!allTitles.some((t) => t.includes(d.replace(/\s/g, '')))) {
      problems.push(`1.3: 版「${d}」を題名に含むカードが出典台帳にありません`);
    }
  }
  return [...new Set(problems)];
}

function selfTest() {
  const cards = new Map([
    ['SRC-0001', { id: 'SRC-0001', title: 'ISO 9001:2015 Quality management systems' }],
    ['SRC-0002', { id: 'SRC-0002', title: 'AI事業者ガイドライン(第1.2版)' }],
  ]);
  const wrap = (body) => `## 1.3 引用規格および参照文書\n\n本標準には、引用規格はありません。\n\n${body}\n\n## 1.4 用語の定義\n`;
  const head = '| 区分 | 文書(版) | 出典台帳 |\n| --- | --- | --- |\n';
  const cases = [
    ['版とカードが揃う', wrap(head + '| a | ISO 9001:2015 | SRC-0001 |\n| b | AI事業者ガイドライン(第1.2版) | SRC-0002 |'), 0],
    ['版が無い', wrap(head + '| a | ISO 9001 | SRC-0001 |'), 1],
    ['カードの版が違う', wrap(head + '| a | ISO 9001:2008 | SRC-0001 |'), 1],
    ['識別子が無い', wrap(head + '| a | ISO 9001:2015 | — |'), 1],
    ['カードが無い', wrap(head + '| a | ISO 9001:2015 | SRC-0009 |'), 1],
    ['ガイドラインの版が違う', wrap(head + '| b | AI事業者ガイドライン(第1.1版) | SRC-0002 |'), 1],
    ['注記の版にカードが無い', wrap(head + '| a | ISO 9001:2015 | SRC-0001 |\n\n例: IEC 61508:2010'), 1],
    ['引用規格が無い旨の文が無い', `## 1.3 x\n\n${head}| a | ISO 9001:2015 | SRC-0001 |\n\n## 1.4 y\n`, 1],
  ];
  let failed = 0;
  for (const [name, md, want] of cases) {
    const got = checkCitations(md, cards).length;
    const ok = want === 0 ? got === 0 : got >= 1;
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'NG  '} ${name}(問題 ${got} 件)`);
  }
  if (failed) {
    console.error(`引用の検査の試験: ${failed} 件が期待と異なります`);
    process.exit(1);
  }
  console.log(`引用の検査の試験: ${cases.length} 件が期待と一致しました`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--self-test')) {
    selfTest();
  } else {
    const problems = checkCitations(readFileSync(OVERVIEW, 'utf8'), loadCards());
    if (problems.length) {
      for (const p of problems) console.error(`::error::${p}`);
      process.exit(1);
    }
    console.log('引用の検査: 第1章 1.3 の版と出典台帳のカードは対応しています');
  }
}
