## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(`state=undelivered`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「スキル(spec-write・implement)と常駐の指示(CLAUDE.md)」に当たるものを、この Issue へまとめて送ります。実装マークの `issue=` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(21 件)
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0907 | phase4-process-design/assurance-case:378 | claude-md-resident | H.4 の「生成と同じセッション・作業領域・認証情報で行った確認を、検出の層にも独立した確認にも数えない」。 |
| IMPL-0819 | phase4-process-design/deliverable-templates:2186 | implement-skill | コア機能とリスク区分 R1 の変更で、実装の方針を人が自分の言葉で記述し(段階1)、その後に AI の生成結果を参照し(段階2)、方針との相違を記録する(段階3)こと。 |
| IMPL-0936 | phase4-process-design/ears-guide:52 | spec-write-skill | AI が起案した受入基準を1件ずつ5つの型のどれに当たるかに分類し、どれにも当てはまらない基準は曖昧語が残っているとして書き直すこと。 |
| IMPL-0937 | phase4-process-design/ears-guide:53 | spec-write-skill | 各基準の動作に測定可能な値(時間・件数・率・表示文言)を入れ、値が決められない場合はその場で価値責任者が決めて後回しにしないこと(未確定事項を責任者と期限を付けて残したまま G-2 を通さないことは、/spec-wr… |
| IMPL-0938 | phase4-process-design/ears-guide:54 | spec-write-skill | 正常系1本につき、望まない挙動(Unwanted)の型の基準を最低1本書くこと。 |
| IMPL-0939 | phase4-process-design/ears-guide:55 | spec-write-skill | 仕上げに AI へ受入基準をテストコードのテスト名に変換させ、変換できない基準が残っていれば手順1 に戻ること。 |
| IMPL-0941 | phase4-process-design/ears-guide:87 | spec-write-skill | G-2 提出前のセルフチェックに固有の部分(5項目のうち5つの型での記述と曖昧語ゼロは IMPL-0935 と G-2 のマークが追い、測定可能な値は IMPL-0937、正常系に対応する異常系は IMPL-0938… |
| IMPL-0942 | phase4-process-design/ears-guide:88 | feature-spec-template | 正常系に対応する異常系の基準を書けない場合に、その事実と理由を受入基準の節に書くこと。 |
| IMPL-0579 | phase4-process-design/gate-criteria:2074 | implement-skill | 一括整形やリネームを、実質的な変更と別の変更単位に分けること。 |
| IMPL-0580 | phase4-process-design/gate-criteria:2145 | implement-skill | 緩和根拠に数えられる手段を表の「認める」手段(リスクスコア・変異テスト等・構造差分)に限ること。 |
| IMPL-0593 | phase4-process-design/human-ai-boundary:85 | claude-md | 不変条件のうち、不変条件2(本番環境への反映の承認は人間の記名)。 |
| IMPL-0971 | phase4-process-design/lifecycle:605 | claude-md-resident | 2.10.2 要求事項3: 見積りの精度を根拠として確約範囲の上限を引き上げないこと。 |
| IMPL-0646 | phase4-process-design/roles-responsibilities:555 | claude-md-resident | 3.5.1 の、同じロールの中で複数の実行主体を並行して走らせるとき、実行主体ごとに作業ツリーを分け、同一の作業ディレクトリで並行して実行しないこと。 |
| IMPL-0975 | phase4-process-design/roles-responsibilities:819 | claude-md-resident | 3.5.5 要求事項8: ラベルが付いていても、判定者は検査の結果などの事実を自ら確かめ、ラベルを事実の代わりにしないこと。 |
| IMPL-0711 | phase4-process-design/roles-responsibilities:1763 | claude-md-resident | 3.12.3 要求事項13 のうち、正解の草案を作る AI へ評価の対象のモデルの出力を渡さないこと、確定する者に確定の前に評価の対象のモデルの出力を示さないこと、草案の一覧を一括で承認する記名と抜き取りで確かめた残… |
| IMPL-0918 | phase4-process-design/safety-verification:112 | claude-md-resident | AI が安全機能そのものを実現する場合(推論結果が制御出力になる)を本附属書の対象外とし、適用規格の特定から専門部門と行うこと。 |
| IMPL-0921 | phase4-process-design/safety-verification:129 | implement-skill | 自己修正ループの反復で自動検証が合格へ転じた場合に、その合格をもって修正の完了としないこと(安全関連部)。 |
| IMPL-0922 | phase4-process-design/safety-verification:139 | implement-skill | 安全関連部で、反復の末に合格へ転じた変更を、反復の記録を添えて仕様へ戻し、要求3の4条件を改めて満たすこと。 |
| IMPL-0929 | phase4-process-design/safety-verification:227 | implement-skill | AI に故障挿入の試験項目を生成させるときの順序のうち、人間が上表の項目と対象に固有の安全要求から期待する挙動を先に書くこと、生成された項目を上表との突合と境界値の観点で人間が点検すること、不足を人間が補うこと(生成… |
| IMPL-0932 | phase4-process-design/safety-verification:264 | implement-skill | 生成された試験が境界値を検査しているかを人間が別途点検し、ミューテーション試験のスコアだけで十分性を判定しないこと。 |
| IMPL-0749 | phase4-process-design/tailoring-guide:640 | claude-md-resident | 軸C の、高のコア機能の設計判断を AI 単独で行わせない制約(人の判断を必須にする)。 |

## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
- [ ] 準拠テンプレート(`template/`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の `npm run check` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は `template/` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
