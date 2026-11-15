// scope-exempt.yaml の登録の検査(#326)
//
// 登録は「この節の限定は規範の適用範囲ではない」という人の判断の記録である。節が改名・削除され、
// どの見出しの免除にも当たらなくなった登録は、免除として働かない残骸になる。
// 機械で決まるのは、登録の形(page・heading・reason の非空)と、登録が実際に使われたかだけである。
// reason の意味(なぜ注記が要らないか)は、自由な文のため検査しない。

import { isReason } from './exempt-marks.mjs';

/** 登録の鍵。page#heading */
export const exemptKey = (e) => `${e?.page}#${e?.heading}`;

/**
 * 登録の問題を文の配列で返す(空なら適合)。
 * entries: scope-exempt.yaml の exempt の配列 / used: 免除として働いた鍵の Set
 */
export function exemptProblems(entries, used) {
  const problems = [];
  const seen = new Set();
  for (const e of entries ?? []) {
    const key = exemptKey(e);
    if (typeof e?.page !== 'string' || !e.page || typeof e?.heading !== 'string' || !e.heading) {
      problems.push(`scope-exempt.yaml: page と heading が必要です(${JSON.stringify(e)})`);
      continue;
    }
    if (!isReason(e.reason)) problems.push(`scope-exempt.yaml: 「${key}」に reason がありません。なぜ適用範囲の注記が要らないかを書いてください`);
    if (seen.has(key)) problems.push(`scope-exempt.yaml: 「${key}」が重複しています`);
    seen.add(key);
    if (!used.has(key)) {
      problems.push(
        `scope-exempt.yaml: 「${key}」は、どの節の免除にも当たっていません。見出しの改名・削除、または限定の語が無くなった可能性があります。登録を消すか、見出しに合わせて直してください`
      );
    }
  }
  return problems;
}
