# 束 B11 の載せ直しと番号の付け直し

origin/main(54c143f8)の上へ 22 コミットを rebase した。衝突は implementation-ledger.md だけで、origin 側を取り、`npm run impl:write` で再生成した。template の参照は origin/main の側(4174f630)。

## 付け直しの対応表(旧 → 新)

| 種類 | 旧 | 新 | 理由 |
|---|---|---|---|
| IMPL | IMPL-1003 | IMPL-1006 | origin/main の #354 が 1003〜1005 を使用 |
| IMPL | IMPL-1004 | IMPL-1007 | 同上 |
| IMPL | IMPL-1005 | IMPL-1008 | 同上 |
| IMPL | IMPL-1006 | IMPL-1009 | 連番 |
| IMPL | IMPL-1007 | IMPL-1010 | 連番 |
| IMPL | IMPL-1010 | IMPL-1011 | 連番 |
| IMPL | IMPL-1011 | IMPL-1012 | 連番 |
| SRC | SRC-0780〜0784 | SRC-0760〜0764 | origin/main の最大 0756、B11 の 0757〜0759 の次 |
| EV | EV-0301〜0311 | 変更なし | origin/main の最大は EV-0300。衝突なし |
| ADR | 0157・0158・0159・0161 | 変更なし | origin/main の最大は 0156。衝突なし |

- origin/main 側の IMPL-1003〜1005(overview.md、ADR-0147、impl-inventory.yaml の該当 1 件)は触っていない
- SRC-0757〜0764 の「仮番号」の頭書きと文言を外した
- SRC-0760〜0764 は lint:sources の語彙に合わせた(verification.status を provisional から partial、evidenceKind を語彙内の値、claims に issues と stance を追加)。語彙に無い値は仮番号の間に入っていた

## 留意点

- research/ 配下の B11 の記録(348・355・356 の審議)の IMPL 番号も置き換えた。当時の文脈で origin/main の 1003〜1005 を指す記述があれば、取り違えている可能性が残る(目視は未了)
- 検査: lint:refs・impl・evidence・sources・citations・scope、test:fields、check-template-drift はいずれも通過。回帰の全量は未実行
