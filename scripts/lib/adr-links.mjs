// ADR の状態の行の「(→ ADR-N)」から、後継の側の参照を確かめる(#326)
//
// adr/index.md の運用ルール5は、置き換える側と置き換えられた側が互いを指す状態を求める。
// ここで機械に閉じるのは順方向だけである。旧い側の状態の行が「置き換え(→ ADR-N …)」の語彙の形のとき、
// N のステータスの節にその旧 ADR の番号が現れること。
//
// 検査しないこと(機械で閉じない。ヘッダに開示):
//   - 逆向き。後継の側が「置き換えます」と書いても、旧い側が語彙の形で後継を書いていない欠落は検出しない。
//     旧い様式(表形式・「補い、または一部置き換え」など)が混在し、偽陽性が多い(調査: 候補 91 件)
//   - 後継の側の記述が、置き換える決定の番号まで合っているか

/** ステータスの節の本文を返す。無ければ null */
export function statusSection(text) {
  const m = /^## ステータス\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
  return m ? m[1] : null;
}

/** 状態の行の「置き換え(→ ADR-N …)」の括弧から、後継の ADR 番号(4桁の文字列)を集める */
export function successorsIn(status) {
  const out = new Set();
  // 括弧の中にリンクの括弧が入れ子になる形を許す
  const groupRe = /置き換え[(（]((?:[^()（）]|\([^()]*\))*)[)）]/g;
  let g;
  while ((g = groupRe.exec(status))) {
    for (const m of g[1].matchAll(/→\s*\[?ADR-(\d{4})/g)) out.add(m[1]);
  }
  return [...out];
}

/**
 * adrs: Map(番号 4桁 → ファイルの全文)。問題の文の配列を返す(空なら適合)
 */
export function forwardProblems(adrs) {
  const problems = [];
  for (const [num, text] of adrs) {
    const status = statusSection(text);
    if (status === null) continue;
    for (const next of successorsIn(status)) {
      if (next === num) continue;
      if (!adrs.has(next)) {
        problems.push(`ADR-${num}: 状態の行が後継 ADR-${next} を指しますが、そのページがありません`);
        continue;
      }
      const theirs = statusSection(adrs.get(next));
      if (theirs === null || !theirs.includes(`ADR-${num}`)) {
        problems.push(
          `ADR-${num}: 状態の行が後継 ADR-${next} を指しますが、ADR-${next} のステータスの節に ADR-${num} がありません。` +
            `adr/index.md の運用ルール5に従い、後継のステータスの節へ置き換える旧 ADR と決定の番号を足してください`
        );
      }
    }
  }
  return problems;
}
