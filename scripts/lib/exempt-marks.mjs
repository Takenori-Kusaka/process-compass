// 除外の印と、異表記の登録の判定(#438 / ADR-0118)
//
// scripts/check-tone.mjs(tone-ok)、scripts/check-section-refs.mjs(ref-ok)と scripts/check-provisions.mjs(provision-ok・retired-ok・variant-ok、
// 異表記の区画 variantForms)が使う。試験は scripts/test-provisions.mjs(npm run test:provisions)。

/** 行の印 `name: 理由` の理由を返す。印が無ければ null。理由は HTML コメントの閉じ(-->)の前まで */
export function markReason(line, name) {
  const m = new RegExp(`${name}\\s*:\\s*(.*?)\\s*(?:-->|$)`).exec(line);
  return m ? m[1] : null;
}

/** 理由として数えるか。文字(仮名・漢字・英字)か数字を1つ以上含むこと。`-` などの記号だけの理由は数えない(#438 突合 X-1) */
export const isReason = (text) => typeof text === 'string' && /[\p{L}\p{N}]/u.test(text);

/** 理由のある印か。理由の無い印(`<!-- retired-ok: -->`、`<!-- retired-ok: - -->` など)は無効とする */
export const hasMark = (line, name) => isReason(markReason(line, name));

/** HTML コメントの中に書いた印 `<!-- name: 理由 -->` だけを数える(tone-ok・ref-ok) */
export function hasCommentMark(line, name) {
  const m = new RegExp(`<!--\\s*${name}\\s*:\\s*(.*?)\\s*(?:-->|$)`).exec(line);
  return Boolean(m && isReason(m[1]));
}

/** 行末の `<!-- tone-ok: 理由 -->` */
export const hasToneOk = (line) => hasCommentMark(line, 'tone-ok');

/** 行の `<!-- ref-ok: 理由 -->`(lint:refs。#438 突合 X-2) */
export const hasRefOk = (line) => hasCommentMark(line, 'ref-ok');

/** 異表記の正規表現を作る。書けない登録は Error を投げる */
export const variantRegExp = (entry) => new RegExp(entry.variant, 'g');

/**
 * 異表記の登録の項目1つを確かめ、問題の文の配列を返す(空なら適合)。
 * variant・correct・by が無い、正規表現が書けない、自己試験(specs の hit・miss)が無い・合わない、を問題とする。
 * by の決定の実在は呼ぶ側が確かめる
 */
export function variantEntryProblems(entry) {
  const problems = [];
  const label = entry?.variant ?? '(variant 無し)';
  if (!entry?.variant) problems.push(`${label}: variant(異表記の正規表現)がありません`);
  if (!entry?.correct) problems.push(`${label}: correct(正表記)がありません`);
  if (!entry?.by) problems.push(`${label}: by(正表記を決めた決定)がありません`);
  if (!entry?.variant) return problems;
  let re;
  try {
    re = variantRegExp(entry);
  } catch (e) {
    problems.push(`${label}: 正規表現として読めません(${e.message})`);
    return problems;
  }
  const hit = entry.specs?.hit ?? [];
  const miss = entry.specs?.miss ?? [];
  if (hit.length === 0) problems.push(`${label}: 自己試験の hit(検出すべき文)が1つもありません`);
  if (miss.length === 0) problems.push(`${label}: 自己試験の miss(検出してはならない文)が1つもありません`);
  for (const s of hit) {
    re.lastIndex = 0;
    if (!re.test(s)) problems.push(`${label}: 自己試験の hit「${s}」を検出しません`);
  }
  for (const s of miss) {
    re.lastIndex = 0;
    if (re.test(s)) problems.push(`${label}: 自己試験の miss「${s}」を検出します`);
  }
  return problems;
}

/** 行の中の異表記をすべて返す */
export function findVariants(line, entry) {
  const re = variantRegExp(entry);
  return [...line.matchAll(re)].map((m) => m[0]);
}
