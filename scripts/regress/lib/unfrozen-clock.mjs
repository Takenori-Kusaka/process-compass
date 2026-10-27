// 止まらない時計を使う箇所を探す(#319 裁定 R-3)。
//
// 回帰の試験は NODE_OPTIONS=--import で Date を差し替えて時計を止める(lib/clock.mjs)。Intl.DateTimeFormat の
// format() / formatToParts() を引数なしで呼ぶと、仕様上、差し替える前の %Date.now% を読むため、時計が止まらない。
// テンプレートのスクリプトがこの形を使わないことを、run.mjs が走らせる前に確かめる(使えば止める)。
import fs from 'node:fs';
import path from 'node:path';

export const UNFROZEN = /DateTimeFormat\((?:[^()]|\([^()]*\))*\)\s*\.\s*(?:format|formatToParts)\(\s*\)/g;

/** 文の中の該当箇所 */
export function unfrozenIn(text) {
  return [...String(text).matchAll(UNFROZEN)].map((m) => m[0]);
}

/** 止まらない時計を使う箇所(引数なしの Intl.DateTimeFormat の format / formatToParts) */
export function unfrozenClockUses(dir) {
  const hits = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(mjs|cjs|js)$/.test(e.name)) {
        const text = fs.readFileSync(p, 'utf8');
        for (const m of unfrozenIn(text)) hits.push(`${path.relative(dir, p)}: ${m.slice(0, 120)}`);
      }
    }
  };
  walk(dir);
  return hits;
}

