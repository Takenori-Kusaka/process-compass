# 独立の突合 1巡目の所見の直し: #340(ADR-0170)

- 日付: 2026-11-17。対象は review-round1.md の中2・低6。検査は lint:impl・lint:refs・lint:scope・lint:evidence が終了コード 0、変えた md の textlint を通した
- 議長の裁定の意味を変える直しは無い。直さなかった所見は無い

| 所見 | 扱い | 理由と所在 |
| --- | --- | --- |
| 中-1 表が無い L1 の案件 | 直した | 条件7 の値と 5.4.5 の段落を「作成または再評価したテンプレ9」へ。L1 で表が無いときは L2 への引き上げが適用条件4 に当たるので、判定の時点で作成する旨を1文足した(新しい義務ではなく既存の適用条件4 の時点の明示。軽の扱い)。`human-ai-boundary.md` 条件7 の行・段落・IMPL-1013 の note、`roles-responsibilities.md` 3.12.10 の段落、ADR-0170 決定3 |
| 中-2 impl-inventory 条件1〜6 の elsewhere | 直した | 条件5 の所在を 5.4.7 へ。条件1〜4・6 は、名指すマークが在る節が無いので `org-design` へ移し、reason に IMPL-0289・ADR-0081 決定6 を書いた。区分は実装の段の推定で、登録者の判断に属する(ここに記録する)。`src/data/impl-inventory.yaml` 5.4.5 の rows |
| 低-1 附属書H 往復の箇条 | 直した | L2 の範囲は条件7 による旨と IMPL-1013 の `undelivered`・manual を足した。`assurance-case.md` 482 行 |
| 低-2 観点23 の監査の方法 | 直した | 条件7 の記録の有無を見る。内容が停止を強制するかは確かめない。`assurance-case.md` 279 行 |
| 低-3 ADR-0170 の adopter の理由 | 直した | 決定4 に IMPL-1013 を採用者に委ねる理由と求めることを足した |
| 低-4 IMPL-0519 の旧い語 | 直した | 「AI自律レベルを L1 より上へ上げず、E3 を解禁しない」へ。`roles-responsibilities.md` IMPL-0519 の note |
| 低-5 EV-0312 の第1文 | 直した | 「確認できませんでした(無いと確かめたのではありません)」の形へ。`human-ai-boundary.md` EV-0312 |
| 低-6 テンプレ9 の注意の引き方 | 直した(編集の指摘) | 「RRS1・RRS2 に数えない記載と同じ」と引いた。`human-ai-boundary.md` 5.4.5 の段落 |

台帳(implementation-ledger)は `npm run impl:write` で再生成した。evidence・scope の台帳は変更なし。
