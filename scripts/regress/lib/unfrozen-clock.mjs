// 止まらない時計を使う箇所を探す(#319 裁定 R-3、§8 X-14)。
//
// 回帰の試験は NODE_OPTIONS=--import で Date を差し替えて時計を止める(lib/clock.mjs)。Intl.DateTimeFormat の
// format() / formatToParts() を引数なしで呼ぶと、仕様上、差し替える前の %Date.now% を読むため、時計が止まらない。
// テンプレートのスクリプトがこの形を使わないことを、run.mjs が走らせる前に確かめる(使えば止める)。
//
// 受け手によらず、引数なしの `.format()` と `.formatToParts()` をすべて検出する。受け手が Intl.DateTimeFormat かは、
// 変数を経た呼び出し(`const f = new Intl.DateTimeFormat(); f.format()`)や入れ子の括弧を含む引数で、字面からは決められないため
// (突合 X-14)。Intl でない受け手の誤検出は、除外の表 UNFROZEN_EXEMPT へ、ファイルと理由をつけて登録する。
import fs from 'node:fs';
import path from 'node:path';

export const UNFROZEN = /\.\s*(?:format|formatToParts)\(\s*\)/g;

/** 誤検出の除外(テンプレートの中の相対パス → 理由)。理由の無い登録はしない */
export const UNFROZEN_EXEMPT = {};

/** 文の中の該当箇所(前後の文脈つき) */
export function unfrozenIn(text) {
  const s = String(text);
  return [...s.matchAll(UNFROZEN)].map((m) => s.slice(Math.max(0, m.index - 60), m.index + m[0].length).replace(/\s+/g, ' ').trim());
}

/** 止まらない時計を使う箇所(引数なしの format / formatToParts) */
export function unfrozenClockUses(dir, exempt = UNFROZEN_EXEMPT) {
  const hits = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(mjs|cjs|js)$/.test(e.name)) {
        const rel = path.relative(dir, p).split(path.sep).join('/');
        if (exempt[rel]) continue;
        for (const m of unfrozenIn(fs.readFileSync(p, 'utf8'))) hits.push(`${rel}: ${m.slice(-120)}`);
      }
    }
  };
  walk(dir);
  return hits;
}
