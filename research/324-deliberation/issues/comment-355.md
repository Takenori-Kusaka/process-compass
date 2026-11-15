#324(実装マークの節の棚卸し、ADR-0140)で、領域の合う降りていない規定の実装マーク 14 件が仮に #324 を名指していたため、本 Issue へ付け替えます(実装マークの `issue=` を 355 へ改めます)。条文は変えていません。

## 足す範囲
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0963 | phase4-process-design/assurance-case:875 | evidence-aggregation | 対外の文書で、範囲・根拠・証拠を伴わない「品質を保証する」、結果の約束や契約上の担保を生む表現、「独立検証済み」「第三者レビュー済み」「規格に適合」「AI がレビューしたので検証済み」、手法の名との併用・互換・準拠の… |
| IMPL-0787 | phase4-process-design/deliverable-templates:737 | evidence-aggregation | 返却目安の期限を過ぎた未返却の行と失効の行を記録の欠落として扱うこと、期限を延ばすときは行を書き換えず新しい行で承認し直すこと。 |
| IMPL-0612 | phase4-process-design/exception-escalation:205 | evidence-aggregation | 7.4 の乱用を防ぐ制約5のうち、ファストトラックの発生率・回収完了率・適用後の欠陥発生率を継続して測定すること(会議体へ報告するふるまいは会議の議事にしか現れず、制度設計として扱う。 |
| IMPL-0667 | phase4-process-design/exception-escalation:567 | evidence-aggregation | 7.7.5 要求事項4。 |
| IMPL-0622 | phase4-process-design/exception-escalation:579 | evidence-aggregation | 7.7.6 の案件に関与していない者による点検。 |
| IMPL-0628 | phase4-process-design/exception-escalation:789 | evidence-aggregation | 7.9.4 の制限された状態での例外決裁。 |
| IMPL-0669 | phase4-process-design/exception-escalation:809 | evidence-aggregation | 7.9.5 要求事項5のうち、行使した件数と残りの件数を数えること。 |
| IMPL-0687 | phase4-process-design/gate-criteria:1662 | evidence-aggregation | 基準9 の記載の欠落のうち、集約が欠落として出すかを確かめていないもの。 |
| IMPL-0584 | phase4-process-design/gate-criteria:2309 | evidence-aggregation | レビュアあたりの依頼件数の分布・レビュアごとの応答時間の分布・差し戻し率のレビュア間の差を出す集計と、自動推薦を導入するときの偏りの計測。 |
| IMPL-0853 | phase4-process-design/overview:483 | evidence-aggregation | フェーズ5・6 の頁が示す手段に従ったことを、それだけで適合の主張の根拠に数えないこと。 |
| IMPL-0638 | phase4-process-design/roles-responsibilities:143 | evidence-aggregation | 暫定任命の期間中は、当該ロールの判定を単独で確定させず確認済みの者の併記を求めること。 |
| IMPL-0655 | phase4-process-design/roles-responsibilities:901 | evidence-aggregation | 3.6 の、委譲しても結果責任(A)は価値責任者に残ること、委任で移るのは判定の時点であり判定の主体と結果責任は席の責任者に残ること。 |
| IMPL-0717 | phase4-process-design/roles-responsibilities:1887 | evidence-aggregation | 3.12.8 要求事項3 のうち、提供者との契約で入出力の学習利用の有無を確認し記録すること。 |
| IMPL-0837 | phase4-process-design/tailoring-guide:644 | evidence-aggregation | 規制業の規制当局向けエビデンスと AI 関与範囲の明記(軸C)。 |

## 受け入れ条件の案(追加分)
- [ ] 上表のマークごとに、降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(解決の方法は前提にしない。採用者に委ねる扱いは審議で決める)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
