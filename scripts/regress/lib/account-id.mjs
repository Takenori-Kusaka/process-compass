// 回帰の試験のアカウントの数値の識別子(process-compass #430 / ADR-0108)。
//
// 準拠テンプレートは、ホスティングの記録(承認・判定・帰属・PR の作成者)を、名簿の数値の識別子(people[].accounts の { login, id })で
// 照合する。ログイン名だけでは数えない。回帰の試験では、名簿とホスティングの代役(lib/bin/gh)が同じ識別子を持つように、
// ログイン名から決まった値を作る(大文字と小文字・先頭の @ を区別しない)。実際のホスティングの値ではない。
// REST(gh api)は書き手の user.id を返すため、代役は REST の応答に識別子を足す。gh pr view の reviews・author は数値の識別子を
// 持たないため、代役はその形には足さない(場面の材料のまま返す)

/** ログイン名から決まる数値の識別子(1000000 以上の整数)。ログイン名が無ければ null */
export function regressAccountId(login) {
  const s = String(login ?? '').normalize('NFKC').trim().replace(/^@/, '').toLowerCase();
  if (!s) return null;
  // FNV-1a(32 ビット)
  let h = 0x811c9dc5;
  for (const ch of s) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 1000000 + (h % 900000000);
}

/** 名簿の要素 { login, id }(場面の名簿に使う) */
export const rosterAccount = (login) => ({ login, id: regressAccountId(login) });
