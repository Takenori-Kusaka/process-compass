# 束 B 独立の突合 1巡目の直し 第3章 roles-responsibilities(Issue #324。2026-11-15)

裁定は `ruling-B1.md`、所見は `crosscheck-B1.md` の第3章分(B3-01〜29)。条文は変えていない。`template/` は読んだだけ。

## 1. 所見ごとの直し

| 所見 | 直し | マーク |
| --- | --- | --- |
| B3-01 | IMPL-0730 を `delivered`(`generate-profile.mjs` の `departure`・`g6Forced`、試験 `test-loosening-decider.mjs`)へ。納期の要求は第8章 IMPL-0733(`kinds/schedule-only.md`)が追うと note に書き、重ねて数えない | 0730 改 |
| B3-02 | IMPL-0723 を `delivered`(`candidates`・`invalidatedChecks`)へ。候補は席と運用形態の変化から導くだけで、仕掛かりの成果物との照合は無いと note に書く | 0723 改 |
| B3-03 | IMPL-0725 を `delivered`(`lapsedApproval`・`ruleApprovedBy`)へ | 0725 改 |
| B3-04 | 分けた。登録する者の記名・AI の名義の拒否・計測できる検知条件(`changeTypeProblems`・`missingBasis`)を新 IMPL-0823(`delivered`)へ。IMPL-0664 は R3 に限る属性と削除・縮小の即時適用だけの `undelivered` に絞る。IMPL-0699 の note を 0823 へ | 0823 新、0664・0699 改 |
| B3-05 | 分けた。CLAUDE.md と次の一手の追随を新 IMPL-0824(`delivered`、`claude-md`。`check-process-rules.mjs`・`check-d0.mjs`・`next.mjs --role`)へ。IMPL-0651 は PROCESS-PROFILE.md の追随だけの `undelivered`(`check-process-rules.mjs`・`verify-gate-contract.mjs` に検査が見つからなかった) | 0824 新、0651 改 |
| B3-06 | 分けた。SG・棚卸しの判定記録の4値の欄(`04-gate-record.md` 節「AI の利用の評価」の「判定」)を新 IMPL-0825(`delivered`・presence・単位は欄)へ。IMPL-0657 は他の会議体の判定の記録、保留の持ち越し禁止、併合で移した側の不判定に絞る | 0825 新、0657 改 |
| B3-07 | IMPL-0724 を `delivered`(残作業の文。`kinds/axis.md`)へ。実施の照合は無いと note に書く。IMPL-0600(第5章)との揃えは 3 章の申し送りに挙げた | 0724 改 |
| B3-08 | 3.12.5 を `marked` にし、行ごとに登録。要求事項1・2 は新 IMPL-0826(`ai-runtime-connection`)、4 は新 0827(`model-quality-monitor`)、5 は新 0828(`agent-run-record`)。3・6 は第5章 5.5.7 の IMPL-0693 と D-0 の IMPL-0029 を `location`。箇条書きの追い先は D-0 の IMPL-0029・0056 と 3.13.4 の IMPL-0726・0729 を note に | 0826〜0828 新 |
| B3-09 | 3.5.3「文脈の分離が成立する条件」の分離する対象3 を新 IMPL-0829(`d0-template`・`undelivered`)で `marked` へ。D-0 の名義の列は席の責任者との共有で、担い手どうしの共有の離脱の欄は無い。3.5.1 の理由に追い先を書き、`location` に当節を足した | 0829 新 |
| B3-10 | 3.10.2 を `marked` にし、新 IMPL-0830(`pre-review-automation`・`undelivered`。短縮をファストトラックに限る照合。第7章 7.4 の IMPL-0608〜0612 は名指さない)。`location` に 3.10.5(IMPL-0214)を足した | 0830 新 |
| B3-11 | 3.4 の `org-design` の理由を書き直した(監査担当の要件・監査記録の表示の定めを含めて明示し、探した場所と H.3 と同じ扱い ADR-0116 決定6 を書いた)。**降ろし先は決めていない**(後述 2章の裁定が要る点) | 理由のみ |
| B3-12 | 支援と判定の分離を `marked`。要求事項1 は `elsewhere`(3.5 の IMPL-0001)、2・3 は制度設計(探した場所つき)。判定記録への明記は新 IMPL-0831(`gate-record-template`・`undelivered`。判定記録の様式に欄が無い) | 0831 新 |
| B3-13 | 3.10.7 を `marked`。議題の限定を新 IMPL-0832(`committee-agenda`・`undelivered`)。黙読・読み上げ禁止・判定の後の実行は note で制度設計と名指し | 0832 新 |
| B3-14 | 3.12.7 に `location`(7.7.4 の IMPL-0370)と新 IMPL-0833(`ai-runtime-connection`・`undelivered`。上限の強制と提供者の上限を数えない定め)。G-1 の上限到達時の扱いの記録は企画書の様式に欄が見つからず(IMPL-0371 は閾値の記名)、0833 の note に挙げた | 0833 新 |
| B3-15 | IMPL-0707 を `committee-agenda`・`issue=324` へ。`committee-agenda` の名と説明を、3.10.7・3.9.4 の指標の集計まで広げた(本件で足した予定の降ろし先の範囲の定め直し) | 0707 改 |
| B3-16 | 予定の降ろし先を足した。`instruction-asset-inventory`(IMPL-0708)、`control-rollout`(IMPL-0718) | 0708・0718 改 |
| B3-17 | IMPL-0645 の note を、受容は D-0 節15 と `org-assurance.mjs` が運ぶ(マークは追わない)、残りは台帳への登録と離脱の算入、に絞った | 0645 改 |
| B3-18 | 議長の読みとして、降りていない側に倒した。IMPL-0647 は `undelivered` のまま、判定記録の様式の欄(確認した項目など)と `gates/G-7.md` の突合の手順が在ること、無いのは例外の条件として突合の記録を照らす検査だけであることを note に書く。欄の存在で足りるとする案は採らない(迷ったら降りていない側) | 0647 改 |
| B3-19 | 付け替え: IMPL-0655 → `evidence-aggregation`、0709 → `config-change-log`、0717 → `evidence-aggregation`(IMPL-0065 と同じ)。IMPL-0715 は降ろし先を決められないため note に「棚卸し・通知・着手の期限の置き場は登録に無く、仮の置き場」と開示し、後述の裁定が要る点に挙げた | 0655・0709・0717・0715 改 |
| B3-20 | 3.4.1 の要求事項5 の行と「有効期間を置く理由」の理由に、IMPL-0070 が追うのは判断を担う4席の周期だけと書き、IMPL-0636 の note に残りの席の有効期間を足した | 0636 改 |
| B3-21 | 3.11.2 の `location` に第4章 G-5「統制の設定の変更の承認」と第8章 軸D「強制層の変更の承認と、所有する組織の同意」を足した | — |
| B3-22 | 3.12.10 要求事項5 を `marked`(新 IMPL-0834。`autonomy-derivation`・`undelivered`。`autonomy.mjs` は登録の時点で停止条件を強制できる環境かを照らさない)。「準拠テンプレートは自律水準を構成に持たない」は消した。3.12.12 要求事項4・5 は再評価の記録(IMPL-0103・0372)で `marked`。3.5.5 要求事項8 は制度設計のまま、探した場所(判定記録の様式の欄、`next.mjs`)と試しの結果を書いた | 0834 新 |
| B3-23 | IMPL-0661 の note から制度設計の事項の文を外した(登録の note にある) | 0661 改 |
| B3-24 | 3.11.1 は `elsewhere`(3.5 の IMPL-0001)。3.11.8 は `elsewhere` にして `location`(3.11.4・3.11.5・3.11.6) | — |
| B3-25 | 3.10.6 の理由に探した場所を足した。「停止したときの扱い」は緩和の文を IMPL-0274 の note へ追わせた | — |
| B3-26 | 3.13.3 の note の節名を直し(IMPL-0114 は 3.5 の節、IMPL-0637 は暫定任命の節)、`location` に 3.5 と暫定任命の節を足した | — |
| B3-27 | note を実物に合わせた: IMPL-0722(AI の名義の記名の拒否は `nameProblems` が運ぶ。IMPL-0735 と同じ所在)、0726(0723 は追う対象になった)、0729(`outagePeriods`)、0643(`model-adoption.mjs` は導入の記録を読む。席の確認との照合が無い)、0652(CLAUDE.md と G-6.md の近い文は在るが、代償措置として記録し未達を解消に数えない文は無い)。3.12.10 の登録の note は IMPL-0280 を `delivered` と改めた | — |
| B3-28 | IMPL-0642 の note に、日付と再確認の期日は表の列でなく生成区間の出力が運ぶことを書いた | 0642 改 |
| B3-29 | `config.mjs` の `stepCeiling` を開いて確かめた(入力は席と名簿の所属だけで、承認者の人数を使わない)。IMPL-0653 を `delivered` へ | 0653 改 |

## 2. 足した・改めたマークと降ろし先

- 新設: IMPL-0823〜0834(12件)。`delivered` は 0823・0824・0825。`undelivered` は 0826〜0834(`issue=324`、`plan=scheduled`)。次の番号は 0835
- 降りたと改めたもの: 0722(note のみ)、0723、0724、0725、0730、0653
- 付け替え: 0655、0709、0717、0707、0708、0718
- 足した降ろし先(`kind: planned`): `instruction-asset-inventory`、`control-rollout`。`committee-agenda` の名と説明を広げた
- 台帳 `implementation-ledger.md` は `npm run impl:write` で再生成

## 3. 直さなかった所見

- B3-11: 監査担当の要件・監査記録の表示の定めの降ろし先。内部監査の記録の様式が登録に無く、予定の降ろし先を足せる型(T1・T2・T4・T8)にも当たらない。附属書H H.3(ADR-0116 決定6)と揃えて `org-design` の理由を本文どおりに書き直すところまでにした
- B3-19 のうち IMPL-0715 の降ろし先: 置き場が無い
- B3-18: 読みは決めた(降りていない側)が、議長が別の読みを採るなら `delivered`(presence・欄)へ改める

## 4. 議長の裁定が要る点

1. 監査記録の表示の定め(3.4。選んだ事実の明記、未実施として表示する、同一期間に相互を監査しない)に降ろし先を持たせるか。H.3 と同じ制度設計で閉じてよいか
2. IMPL-0715 の棚卸し・通知・着手の期限の置き場(予定の降ろし先を足すか)
3. IMPL-0647 の読み(上記のとおり降りていない側にした)
4. CL2 の自律レベルの上限(ruling-B1 の事実の確認): 第8章 軸E の表(`tailoring-guide.md`)は CL2 を「L2」、CL3 を「L1(固定)」とし、附属書F F.3 の追加要求1 は「安全関連部に AI の支援を用いる場合」に「AI自律レベルは L1 に固定する」と書く。F.3 の他の要求(4・5)は CL2 と CL3 を分けるのに、要求1 は区分で分けていない。2つの「L」は同じ尺度である(F.3 の要求1 は「引き上げの判定の対象としない」で、第5章の AI自律レベル L1〜L3 を指す。審査の担保水準 L0〜L2 の記号の衝突 #347 による見かけの食い違いではない)。したがって食い違いは実在する。F.3 は安全関連部、表は案件の上限という単位の違いとしても、CL2 の安全関連部で L2(表)と L1(F.3)が並ぶ。条文は変えていない。既存の open の Issue への寄せは議長が行う

## 5. 第8章の担当(次)への申し送り

- IMPL-0733 と 0730 の食い違いは、第3章の側(IMPL-0730 を `delivered` にして、納期の要求は 0733 が追うと書いた)で閉じた。第8章の 0733 は触らなくてよい(B8-08)
- IMPL-0735 は B8-01 で `delivered` にする。IMPL-0722(3.13.3)の note は「第8章の IMPL-0735 と同じ所在」と書いてあり、0735 を `delivered` にすれば揃う
- 第8章「極小規模での事後監査への切替」(B8-10)・「委任・標準変更・L3」(B8-11)の `location` は、IMPL-0664 でなく、登録する者・AI の名義・計測できる検知条件を追う **IMPL-0823**(3.7.4 B-4)と、種別の属性・削除と縮小の即時適用を追う IMPL-0664(`undelivered`)の両方を名指す
- B8-04(IMPL-0773)・B8-12 の `config-seats`・IMPL-0006・IMPL-0772 は第8章の側
- 3.12.5 の `location` に第5章 5.5.7 の IMPL-0693 を足した。第5章の側の変更は無い
- IMPL-0724 を `delivered` にしたので、第5章 5.5.7 の IMPL-0600(同じ規定を「実施を照らす検査は無い」として `undelivered`)の表示と揃えるかを議長が決める(第5章は本担当の範囲外のため触っていない)

## 6. 検査(終了コード)

- `npm run impl:write`: 0
- `npm run lint:impl`: 0(実装マーク 820件、降りていない規定 260件)
- `npm run test:impl`: 0(56件合格)
- `npm run lint:refs`: 0
- `npx textlint`(roles-responsibilities.md): 0
- 回帰の全量は流していない
