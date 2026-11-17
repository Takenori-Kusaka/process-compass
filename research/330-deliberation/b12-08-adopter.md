# #330 の残り(IMPL-0239・IMPL-0234 を採用者に委ねる)の実装の記録

日付: 2026-11-17。担当: 実装(束 B12)。

- 登録簿 `src/data/impl-no-adopter.yaml` を確かめた。載っている節は human-ai-boundary・exception-escalation・roles-responsibilities と G-5 の知財の2節・G-7 の1節で、IMPL-0239・IMPL-0234 の節(G-5「検査対象が存在しない場合の扱い」)は当たらない。adopter にできる
- `src/content/docs/adr/0166-adopter-decides-no-target-timestamp-and-stack-checker-dependency-failure.md` を新設した(書式は ADR-0165 に倣う。EV-0320 を仮の番号で付けた。push の直前に付け直す)
- `gate-criteria.md` の IMPL-0239・IMPL-0234 を `plan=adopter decision=ADR-0166` へ改め、`issue=` と `review=` を外した。note の末尾の「確かめる者」を採用者の G-5 の設定の責任者へ改めた
- `npm run impl:write`・`npm run evidence:write` を実行した。`npm run impl:issues -- --issue 330` は「0 件。閉じてよい」を返す
- 採らない案(scheduled のまま残す)は ADR-0166 の表に記録した
