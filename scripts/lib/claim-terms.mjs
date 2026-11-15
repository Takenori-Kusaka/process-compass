// 1.10.2 と H.8 の語の存在の検査(#326)
//
// 第1章 1.10.2(適用の表明と適合の主張)の表と、附属書H H.8 の「対外的に使う表現」の表は、
// 同じ件数の句と主張の名を持つ。一方だけ直すと、対外の文の型が条件とずれる(#353 は manual で確かめた)。
//
// 機械で閉じるのは、所定の語が両方の表に出ることだけである。文の型が一致しているか(語順・件数の数え方・
// 言い換え)は、自由な文の意味であり、この検査は保証しない。人が確かめる(ADR-0134)。
// 語の集合は、検査を足した時点の本文から導いた。定義を新設するものではない。

/** 両方の表に出ているべき語。2026-11-15 時点の 1.10.2 の表と H.8 の表の両方に出ている語 */
export const CLAIM_TERMS = [
  '適用の表明',
  '適合の主張',
  '逸脱を伴う適合の主張',
  '未達のゲートの件数',
  '記録の欠落の件数',
  '逸脱と列挙に無い離脱',
  '例外承認の件数',
  '未回収',
  '独立した人の確認を経ない出荷',
  '作業中の版',
];

/** 節の見出し行から、同じ階層以上の次の見出しの手前までの行 */
export function sectionLines(lines, headingRe) {
  const s = lines.findIndex((l) => headingRe.test(l));
  if (s < 0) return null;
  const level = /^#+/.exec(lines[s])[0].length;
  const e = lines.findIndex((l, i) => i > s && new RegExp(`^#{1,${level}}\\s`).test(l));
  return lines.slice(s + 1, e < 0 ? undefined : e);
}

/** 節の中の表の行(| で始まる行)をつなげた文 */
export const tableText = (sectionLinesArr) => sectionLinesArr.filter((l) => l.startsWith('|')).join('\n');

/**
 * 問題の文の配列を返す(空なら適合)。
 * a: 1.10.2 の表の文 / b: H.8 の表の文
 */
export function termProblems(a, b, terms = CLAIM_TERMS) {
  const problems = [];
  for (const t of terms) {
    if (!a.includes(t)) problems.push(`第1章 1.10.2 の表に「${t}」がありません`);
    if (!b.includes(t)) problems.push(`附属書H H.8 の表に「${t}」がありません`);
  }
  return problems;
}
