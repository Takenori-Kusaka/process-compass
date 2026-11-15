# 束 D 独立の突合 1巡目の直し(Issue #324。2026-11-15)

`ruling-D1.md` のとおり、`crosscheck-D1.md` の所見 42 件を直した。「高」7 件と「中」19 件は全件。条文は変えていない。`template/` は読むだけ(実物を開いて確かめた)。採番は IMPL-0959〜0977(0958 まで使用済み)。

## 1. 所見ごとの直し

| 所見 | 直し | マーク・所在 |
| --- | --- | --- |
| D-F01(高) | 附属書D の4節を規定として扱う。第8章に提案書へ調整の宣言を含める定めのマークを足し、附属書D「提案書テンプレート」は `none / elsewhere`(第8章へ)。知識ベースの禁止 `c-tailoring-must-be-declared` は `template/scripts/vendor/tailoring-kb.json` にデータとして在るが、`generate-profile.mjs` の `checkConstraints` は検査せず構成にも出さない。提案書の様式も検査も準拠テンプレートに無い(vendor 以外に「提案書」「c-tailoring」の語が 0 件)ため `undelivered`。`tailoring-kb` の `delivered` は採らない | IMPL-0959(第8章 調整は宣言を伴う。profile-generator)。附属書D の冒頭・提案の戦略・使わない表現は IMPL-0960・0961・0962(evidence-aggregation。undelivered) |
| D-F02(中) | D-F01 と同じ裁定。H.8 も同じ扱い | IMPL-0963(H.8) |
| D-F03(中) | IMPL-0930 の note を知識ベースの規則 r-e-cl3 の注記にだけ在る旨に改めた。IMPL-0763 の note を IMPL-0930・0931 を指す形に改めた | IMPL-0930、IMPL-0763 |
| D-F04(中) | IMPL-0920 を「行ごとに4条件を満たしたことを示す記録」に限り、追跡・規約・試験は G-5、レビューは G-6(IMPL-0080・0344)が運ぶと note に書いた | IMPL-0920 |
| D-F05(中) | 降ろし先を `claude-md-resident` に改めた。`template/CLAUDE.md` の「一律で AI に委譲できない領域」と `claude-md-resident.json` を開き、この場合を名指す行が無いことを確かめた。`undelivered` のまま | IMPL-0918 |
| D-F06(中) | 降ろし先を `autonomy-derivation` に揃え、CL3 は IMPL-0762・0765 で降り、降りていないのは CL2 の安全関連部だけと note に書いた。IMPL-0594 を引いた。CL2 の L2 上限と F.3 の L1 固定の食い違いは 3章の「文の矛盾の候補」へ | IMPL-0919 |
| D-F07〜F10(低) | IMPL-0929(IMPL-0183 を引用)、IMPL-0924・0925(F.4 の注記と F.5 の表の1句)、IMPL-0937(/spec-write 手順6)、IMPL-0941(固有の部分に絞り番号で引く)の note を直した | IMPL-0929・0924・0925・0937・0941 |
| D-F11(低) | 直さない。`issue=324` は #324 を閉じる前の付け替え(`decision.md` 2章 #5)の対象に数える。領域の合う open の Issue は見つからない | — |
| D-F12(低) | 附属書B の登録の note を「準拠テンプレートに 0 件。語は `src/data/processes/integrated.yaml` のタスクの識別子」に改めた | impl-inventory.yaml(ears-guide#書き方の手順) |
| D-H01(中) | H.1「切り離された検証」・H.6「独立性の表示の例」・H.11・H.1「AI の関与を前提にした保証の根拠」を `none / elsewhere` に改め、location を書いた。H.9 は `explanation` のまま(3章) | impl-inventory.yaml |
| D-H02(中) | IMPL-0905 を「集約の出力を2値で出し等級にしない」に限った。組織が書く文書の中間の語は IMPL-0963 が追うと note に書いた | IMPL-0905 |
| D-H03(中) | 「エージェントを分けただけ」を名指すマークが無かったため追加。役割名の付与は IMPL-0639(3.4.2)を location と note に足した。準拠テンプレートの `CLAUDE.md` に系統の行はあるがエージェント分離の行は無い | IMPL-0966(claude-md-resident。undelivered) |
| D-H04(中) | 条件1 の行に 3.4.2 と G-7「保証の開示」を location に足し、IMPL-0685・0639・0641 の番号を理由に書いた | impl-inventory.yaml |
| D-H05(中) | 「導出は機械的な集約に限る」は `template/CLAUDE.md` の「保証の主張の成立判定と単一障害点の一覧は機械の出力。要約・評価を足さない」(`claude-md-resident.json`)と `gates/G-8.md` 手順2 が運ぶため `delivered`。後の2文は第6章「決裁制度への提示」の IMPL-0950(undelivered)を location に | IMPL-0967 |
| D-H06・H07(低) | 「組織の外へ渡すとき」に IMPL-0757(軸D)を location と note に足した。項目5・7 に G-7「保証の開示」「停止の申し立ての保留」を足した | impl-inventory.yaml |
| D-H08(低) | 3名未満の同一人物の離脱の D-0 への記録は第1章 1.10.2「列挙に無い離脱」の節のマークが追うと location に書いた。ただし H.5 の行から D-0 への記録を直接名指すマークは確かめられていない(未確認として残る) | impl-inventory.yaml |
| D-H09(低) | IMPL-0563 の主語(事業決裁者)と H.12 の文の主語(上申を受領する品質保証部門)の違いを note に書いた | impl-inventory.yaml |
| D-H10(低) | 「判定・承認に使わない」を「検出の層に数えない」と読み替える旨を H.4 の note に書いた | impl-inventory.yaml |
| D-H11(低) | `aggregate-evidence.mjs` の `machineFields`(instructors.unresolved)、`g6Unmet`・`reviewerIsDeveloper` と `person.external` の分岐、挙動要約の最低限の形の判定を開いて確かめ、IMPL-0908 の note に足した | IMPL-0908 |
| D-H12(低) | 直さない。冒頭が課さない明記、H.12 が IMPL-0911 で禁止として扱うが、理由が IMPL-0911 を引くので食い違いではない | — |
| D-O01(高) | H.3 の観点を `marked` に改め、観点で確かめる義務と観点13・14 の実施者の限定を `internal-audit-record` の `undelivered` とした。抽出の対象の選定だけを ADR-0116 決定6 の制度設計として残し、ADR の本文は変えていない | IMPL-0964 |
| D-O02(高) | 7.7.9 要求事項6 を `marked` に改め、`06-project-brief.md` の「見積りの記録」の注意に在る旨の `delivered` を足した | IMPL-0968(project-brief-template) |
| D-O03(高) | G-6 条件2 を `marked` に改め、AI の担い手に書かせない側は権限設定と `CLAUDE.md` が拒むため `delivered`、別の人に書かせない側は `undelivered`(内部監査の抜き取り) | IMPL-0973(agent-settings)・0974(internal-audit-record) |
| D-O04(高) | 2.10.1 を `marked`(60% 以内・分けていない要求を SC-M にしない)。2.10.2 の行1・行2 は IMPL-0373 に紐づけ、note に「実測なし。確約範囲を置かない」と「60%以内」を足した | IMPL-0970(delivered)。IMPL-0373 |
| D-O05(高) | 7.7.1 の配賦の時点を 2.4 の IMPL-0846 が追う旨に改め、location に 2.4 を足した。検証費用の内訳の明示は、様式に区分も欄も無いため `undelivered` | IMPL-0969(project-brief-template) |
| D-O06(高) | 2.6 要求事項4 を `marked` に改め、`check-pr.mjs` に G-3 の判定記録への到達を拒む処理が無いため `undelivered` | IMPL-0972(pr-checks) |
| D-O07(中) | 3.5.5 要求事項8 を IMPL-0918 と同じ裁定(試し c だけで規定。`CLAUDE.md` と `gate/SKILL.md` にラベルを事実の代わりにしない行が無い)で `undelivered` | IMPL-0975(claude-md-resident) |
| D-O08(中) | 3.12.12 の行5 から IMPL-0372 を外し、`recalibration.mjs` と `docs/calibration-register.md` の列「移した先」を開いて確かめ、要求事項4・5 を名指す `delivered` を足した | IMPL-0976(process-change-skill) |
| D-O09(中) | H.12「時点ごとに行うこと」を `marked`(location 付き)に改めた。「G-8 の記録を書いた後に集約し直す」は `gates/G-8.md` が運ぶため `delivered`。第4章に正本が無い点は 3章の候補 | IMPL-0965(gate-skill) |
| D-O10(中) | 閾値の行1 を、5事項の欄が様式に無いため `undelivered` | IMPL-0977(project-brief-template) |
| D-O11(中) | 2.10.3 を `none / elsewhere`。2.10.2 行3 は D-O07 と揃えて `undelivered` | IMPL-0971(claude-md-resident) |
| D-O12(中) | H.8 を `marked`。1.10.2〜1.10.4 の再掲は IMPL-0120・0573・0308 が追うと note と location に書いた | IMPL-0963 |
| D-O13(中) | 5.6.3 を `none / elsewhere`(7.9.6)とし、判別の主体と措置の範囲を文ごとに理由へ書いた | impl-inventory.yaml |
| D-O14(中) | 1.2 を `none / elsewhere`(第8章の調整の宣言と禁止事項6) | impl-inventory.yaml |
| D-O15(中) | 3.4 の要件1・4 を IMPL-0901 に紐づけて `marked`。要件2・3 は制度設計のまま(note に書いた) | impl-inventory.yaml |
| D-O16(低) | 直さない。IMPL-0001 の AI維持管理者 × AI運用担当者、3.11.8 の location の 3.12 の行、IMPL-0028 の「調整軸」の名指しは、各マークの note の読み直しを要する。登録の判断を変えない補足で、表示の食い違いではない。#324 の次の巡へ | — |
| D-O17(低) | 直さない。5.7.6・2.3 は区分が合っており、理由の書き直しだけ。同上 | — |
| D-O18(低) | 2.10(節の導入)を `none / not-imposed` に改めた | impl-inventory.yaml |
| D-O19(低) | 事後監査の手続の note に、「確認すること」と「所見の追跡」は IMPL-0964、「当事者に選ばせない」は ADR-0116 決定6 と IMPL-0552・0690 が同じ違反を検知すると書いた | impl-inventory.yaml |
| 意見4 | H.9 は `explanation` のまま。読まなかった 8 問(問2・3・4・5・9・12・13・17)を根拠水準マークで開示した | EV-0272(H.9 の冒頭) |

## 2. 足した・改めたマーク

- 足した 19 件: IMPL-0959〜0977。`undelivered` 13 件(0959・0960・0961・0962・0963・0964・0966・0969・0971・0972・0974・0975・0977)、`delivered` 6 件(0965・0967・0968・0970・0973・0976)。`internal-audit-record`(planned)を降ろし先にするのは 0964・0974。
- 改めた note・target: IMPL-0763・0905・0908・0918(target 変更)・0919(target 変更)・0920・0924・0925・0929・0930・0937・0941。
- 新しい `planned` の降ろし先は足していない。登録済みの `internal-audit-record`・`claude-md-resident`・`project-brief-template` ほかを使った。
- 根拠水準マーク: EV-0272(H.9)。`npm run evidence:write` で台帳を再生成した。

## 3. 編集の指摘と補足の候補

- **`formalize-criteria`(附属書B の題)**: 準拠テンプレートに無い名で、`integrated.yaml` のタスクの識別子。条文は変えず、編集の指摘として議長が既存の open の Issue へ寄せる。
- **H.1 条件4 の補足の候補**(矛盾は無い): (1) H.1 の体制ごとの表が2名体制にだけ「別の自然人」と書くため、1名・3名未満の兼務との関係を H.5 まで読まないと分からない。(2) 条件4 は「出荷判定(G-7)を記名した人」と書くが、委任の期間の開示では G-7 を変更ごとに行わず、実装は席の責任者で代える。条文に読み替えが無い。
- **文の矛盾の候補**: 第8章 軸E と知識ベース `r-e-cl2` は CL2 の安全関連部の上限を L2 とし、F.3 要求1 は L1 に固定する(D-F06)。
- **正本の置き場の候補**: 「G-8 の記録を書いた後に集約し直す」は、第4章に正本の節が無く、H.12 の行が規定の置き場になっている(IMPL-0965)。

## 4. 検査の結果

- `lint:impl`・`test:impl`(56 件)・`lint:refs`・`lint:provisions` は終了コード 0。変えた 9 頁の textlint は違反なし(作業ツリーの `node_modules` に textlint が無かったため、スクラッチへ導入して同じ `.textlintrc.json` で実行した)。
- `lint:scope` は終了コード 1 のまま。5 件(deliverable-templates 1880、lifecycle 432、roles-responsibilities 1059、safety-verification 264、tailoring-guide 1163)。直前のコミット HEAD のクリーンな複製でも同じ失敗を確かめた(HEAD では safety-verification の 127 も出ていた。IMPL-0919 の note の書き直しで消えた)。本件の変更が原因ではなく、束 C・F の直しに属する。議長の裁定を要する。
- 登録簿に残る `pending` の節は 2 節: 7.5 判定の滞留に対する措置、5.4.7 能力維持措置。
- 事故の報告: `lint:scope` の比較に作った git worktree をスクラッチで `git worktree remove --force` したところ、`node_modules` の接合(junction)をたどり、b5 の `node_modules` の実体である b4 の `node_modules` を空にした。b4 で `npm ci`(ロックファイルどおり)を実行して復旧し、4 つの検査が通ることを確かめた。他の作業ツリーが一時的に検査を実行できなかった可能性がある。

## 5. 確かめきれていない点

- D-H08: H.5 の行から、3名未満の同一人物の離脱の D-0 への記録を直接名指すマークは確かめていない。
- D-O16・D-O17: 直していない(上表)。
- IMPL-0960〜0963 の降ろし先は `evidence-aggregation`(対外の表明の語を集約の出力が確かめる IMPL-0308 に最も近い)。提案書は集約の範囲に入らないため、降ろし先は暫定の当てはめで、議長が置き場を決める。
