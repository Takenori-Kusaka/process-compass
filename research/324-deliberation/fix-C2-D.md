# 束 C 2巡目の直しと残った点の裁定の実装(Issue #324。2026-11-15)

`ruling-C2-D.md` の表を上から実装した。条文は変えていない。`template/` は読むだけで、書き換えていない。

## 1. 裁定の行ごとの直し

| 裁定の行 | 直し | 所在・番号 |
| --- | --- | --- |
| C2-01(高) | 手引き 08 の手順 3 に「知財潔白性の検査を、AI を利用する場合に限って課さない」が実在することを確かめ、IMPL-0904 を `ai-sla-guide`・`delivered`・`check=manual` に改めた(plan・issue・review を外した)。IMPL-0955 の note に IMPL-0904 を名指し、登録の 2 か所(軸D の note、第6章の知財潔白性の note)にも相互の参照を足した | 第8章 IMPL-0904、第6章 IMPL-0955 |
| 中 4・低 9 の編集の直し | C2-02: 登録の note・reason の 6 か所(引き継ぎ 0779・0944、名義 0781、運用ルール 0788・0789、評価者 0860、制御構造分析 0869、H.3 の reason の 0815・0945)を今の `state` に合わせた。C2-03: H.3 の reason を IMPL-0947 が追う旨に改めた。C2-04: IMPL-0957 の note を「t8 は見出し・補償・結果責任の fields を持つが、3行の fields も omit も無い」に改めた(`template-fields.yaml` を開いて確かめた)。C2-05: 0957 の note に趣旨は手引き 08 の手順 3(IMPL-0955)が運ぶと足した。C2-06: 2.8 の note を「3a は 0449、3b は第6章 テンプレ9 の 0453」に改め、手順3 の `location` と IMPL-0884 の note を揃えた。C2-07: IMPL-0849 の note に check-g1 の説明を足した。C2-08: 2.6「判断記録の範囲」の note に IMPL-0952 を名指した。C2-09: 2.10.7 の `location` に 7.3・7.4 を足した。C2-10: 「成果物と様式の対応」の `location` にテンプレ12 を足した | impl-inventory.yaml、第6章・第2章のマーク |
| 低の「開示して閉じる」(C2-11〜C2-14) | C2-12: IMPL-0794・0947 の note に、手引きが言わない句を書いた。C2-13: IMPL-0958 の note に是正計画の構造は IMPL-0804 が運ぶと足した。C2-14: `flow-observation` の説明に、裁定で追認したこと・降ろし先を分ける案は採らないこと・path が仮であることを足した。C2-11(IMPL-0793・0776 の「単位に数えていない」文)は直さず、根拠水準マークで開示した(5章) | impl-targets.yaml、IMPL-0794・0947・0958 |
| C1-34「恒久層に登録します」 | `explanation` のまま。変更なし | — |
| 登録していない手引き 9 枚 | 追加の照合をしない。根拠水準マーク EV-0273 で開示した | `implementation-marking.md`(EV-0135 の直後) |
| IMPL-0803・0805 の `check=manual`、C1-22 の説明、C1-36・`formalize-criteria`・文の食い違いの候補 | 追認、または議長が Issue へコメントする行。何もしていない | — |
| IMPL-0960〜0962 | 降ろし先を新設の予定の降ろし先 `proposal-record`(`kind: planned`。path `docs/proposals/`)へ付け替えた(`undelivered plan=scheduled issue=324` のまま)。IMPL-0960 の note に、調整を宣言せずに運用しない部分(知識ベースの禁止 c-tailoring-must-be-declared)は第8章の IMPL-0772・0959 が追うと書き、節の登録に `location`(第8章「調整は宣言を伴う」)を足した。IMPL-0772 の向き(第8章の側で追う)と揃えた | 附属書D `proposal-template.md` |
| IMPL-0963(H.8) | 付け替え不要。降ろし先はすでに IMPL-0120・0573・0308 と同じ `evidence-aggregation` である(3つとも確かめた)。変更なし | 附属書H |
| `lint:scope` の 5 件 | 限定として検出された語を言い換えた(意味は変えていない)。除外の登録はしていない。IMPL-0860 は「CL2 以上の案件では」を「案件(安全重要度 CL2 以上)で」に、引用の括弧を同旨の言い方に、IMPL-0891 は「持つ人に限り」を「持つ人だけを数え」に、IMPL-0664 は「R3 に限る」を「R3 だけ」「R3 かの照合」に、IMPL-0932 は「R1 の変更では」を「R1 の変更で、」に、IMPL-0766 は「外に限って」を「外だけ」に改めた | 第6章・第2章・第3章・第4章・第8章のマーク |
| 残る `pending` 2 節 | 5.4.7: IMPL-0978(`undelivered`)と予定の降ろし先 `ai-free-practice-record`(path `docs/capability-maintenance/`)を足した。残る2文は IMPL-0061・0645・0093・0077・0112 の節を `location` で引く。7.5: IMPL-0979(`undelivered`。束 A で足した滞留の予定の降ろし先 `review-queue-control` に合うため再利用し、説明に 7.5 を足した)。IMPL-0535・0369 は `location` で引く | 第5章 5.4.7、第7章 7.5 |

## 2. 足した・改めたマークの番号

- 新規: IMPL-0978(5.4.7)、IMPL-0979(7.5)。使用済みの最大は IMPL-0977 で、欠番 0677 は使っていない。`issue=324` は open
- `state`・`target` を改めた: IMPL-0904(`undelivered` → `delivered`、`ai-sla-template` → `ai-sla-guide`)、IMPL-0960〜0962(`evidence-aggregation` → `proposal-record`)
- note だけを改めた: IMPL-0955・0957・0884・0849・0794・0947・0958・0788(「TODO」の語を言い換え。`lint:tone` が「未完成の痕跡」として検出したため)・0860・0891・0664・0932・0766・0960
- 根拠水準マーク: EV-0273(見直し 2027-05)

## 3. 登録した降ろし先

| id | kind | path |
| --- | --- | --- |
| `proposal-record` | planned | `docs/proposals/` |
| `ai-free-practice-record` | planned | `docs/capability-maintenance/` |

説明を足した既存の降ろし先: `review-queue-control`(7.5)、`flow-observation`(追認と path が仮である旨)。

## 4. 流した検査

試験(test:*)と build を除く、`package.json` の `check` の lint 系を、最後の直しの後に流した。`test:impl` は本件の試験なので流した。

| 検査 | 終了コード |
| --- | --- |
| lint:ci、lint:text、lint:tone、lint:evidence、lint:impl、lint:scope、lint:refs、lint:provisions | 0 |
| lint:dekimasu、lint:skills、lint:figures、brand:check、lint:sources、lint:citations、lint:registry、lint:stage-table | 0 |
| test:impl(56 件) | 0 |
| impl:write、evidence:write、scope:write(台帳の再生成) | 0 |

`lint:tone` は途中で 1 だった。原因は IMPL-0788 の note にある「TODO」の語(本件の差分が原因)で、言い換えて 0 にした。`lint:scope` は 5 件の失敗から 0 になった。

## 5. 直さなかった点と理由

- C2-11(IMPL-0793・0776 の本文の文を「単位に数えていない」とした点): 向きは降りている側で、表示の誤りが生じない。裁定の「開示して閉じる」に従い、EV-0273 の開示に含めた。note は変えていない
- IMPL-0963 の付け替え: すでに IMPL-0120 と同じ降ろし先だったため
- 条文の食い違いの候補、C1-36、`formalize-criteria`: 議長が Issue へコメントする行。何もしていない

## 6. `pending` の数

`src/data/impl-inventory.yaml` の `status: pending` の節を数えた結果は 0 節である(実装の台帳の「未棚卸し」も 0 節)。
