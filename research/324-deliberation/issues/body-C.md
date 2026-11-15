## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(`state=undelivered`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「準拠テンプレートに記録の置き場が無い規定」に当たるものを、この Issue へまとめて送ります。実装マークの `issue=` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(36 件)
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0964 | phase4-process-design/assurance-case:292 | internal-audit-record | 内部監査が、記録の存在ではなく記録の内容と実態の一致を、本節の観点で確かめること。 |
| IMPL-0683 | phase4-process-design/gate-criteria:1194 | ip-allowlist-operation | 許可リストの運用のうち、暫定の許可に必ず期限を付すことと、期限を超過した暫定の許可を失効させ基準5で再び停止すること(申請・暫定の許可・恒久の可否の手続の表の行を含む)。 |
| IMPL-0974 | phase4-process-design/gate-criteria:1372 | internal-audit-record | G-6 条件2 のうち、承認レビューの本文を、承認者本人でない別の人に書かせないこと。 |
| IMPL-0978 | phase4-process-design/human-ai-boundary:311 | ai-free-practice-record | L2 以上を適用する範囲で、対象領域について AI エージェントを用いずに実装または調査する機会を、定められた頻度で確保すること。 |
| IMPL-0882 | phase4-process-design/lifecycle:289 | context-transfer-record | 部門間移管。 |
| IMPL-0883 | phase4-process-design/lifecycle:320 | project-registration-record | 案件の登録。 |
| IMPL-0885 | phase4-process-design/lifecycle:364 | context-transfer-record | コンテキスト移管ゲートの適用。 |
| IMPL-0886 | phase4-process-design/lifecycle:372 | context-transfer-record | 移管の成立の定義。 |
| IMPL-0887 | phase4-process-design/lifecycle:390 | context-transfer-record | 3つのゲートの判定。 |
| IMPL-0888 | phase4-process-design/lifecycle:401 | context-transfer-record | 予告期間の数え方。 |
| IMPL-0889 | phase4-process-design/lifecycle:428 | context-transfer-record | H-1 の欠落の棚卸し。 |
| IMPL-0890 | phase4-process-design/lifecycle:430 | context-transfer-record | コア機能ごとの理解保持者数を数え、理解保持者が1名の機能を、交代の前に2名以上へ増やすこと。 |
| IMPL-0892 | phase4-process-design/lifecycle:442 | context-transfer-record | H-2 の書き戻しの進め方。 |
| IMPL-0893 | phase4-process-design/lifecycle:468 | context-transfer-record | 予告期間に応じた H-2 の期限と範囲(20営業日以上は交代日の10営業日前まで全部、10〜19は5営業日前まで全部、5〜9は前営業日まで上位2類型、5未満は交代前に置かず全部を交代後へ繰り越す)。 |
| IMPL-0894 | phase4-process-design/lifecycle:483 | context-transfer-record | 短い予告のときの書き戻しの優先順位(組織的文脈、運用上の勘所、設計の背景と制約、却下した選択肢)を入れ替えないこと。 |
| IMPL-0895 | phase4-process-design/lifecycle:498 | context-transfer-record | H-1 の記録の必須欄(交代の通知日・交代日・予告期間の営業日・前任者の関与の延長)と機械検査(空でないこと、交代日が通知日以降であること、予告期間が通知日と交代日からの導出値と一致すること、予告期間が10営業日未満… |
| IMPL-0896 | phase4-process-design/lifecycle:519 | context-transfer-record | H-3 の理解の実証。 |
| IMPL-0897 | phase4-process-design/lifecycle:530 | context-transfer-record | 準備段階の AI の利用。 |
| IMPL-0898 | phase4-process-design/lifecycle:542 | context-transfer-record | H-3 が期限内に合格しない場合。 |
| IMPL-0960 | phase4-process-design/proposal-template:16 | proposal-record | 提案書を、組織として品質を保証すると言える形で書くこと(品質を保証する主体は本標準でなく本標準を適用する組織)。 |
| IMPL-0961 | phase4-process-design/proposal-template:24 | proposal-record | 提案書で、変える点を小さく見せず、出荷判定の手続は変わらないと説明しないこと(変更は4点で、3点目は出荷判定の規程の改定を要する)。 |
| IMPL-0962 | phase4-process-design/proposal-template:133 | proposal-record | 提案書で、範囲・根拠・証拠を伴わない「品質を保証する」、「独立検証済み」「第三者レビュー済み」「規格に適合」、「AI がレビューしたので検証済み」などを使わず、「第三者レビュー」の語を第1章 1.4 の定義の範囲に限… |
| IMPL-0901 | phase4-process-design/roles-responsibilities:97 | internal-audit-record | 3.4 の監査担当の要件を満たす担い手を置けないときに、他チーム・他部門への委託、外部への委託、チーム間の相互の監査のいずれを選んだかの事実を監査記録へ明記すること(相互の監査では同一期間に相互を監査しない)と、要件… |
| IMPL-0665 | phase4-process-design/roles-responsibilities:1068 | committee-agenda | 3.7.5 と 3.7.4 の、会議体は決定する事項に列挙した事項のみを議題とし(列挙外の事項を議題としない)、判定を要しない報告のみの議題を定例の議題としないこと。 |
| IMPL-0707 | phase4-process-design/roles-responsibilities:1232 | committee-agenda | 3.9.4 の会議体の健全性指標(上程から判定までの日数、中止・差し戻しの比率、報告のみの議題の比率、持ち回り決議の比率、標準変更カタログの登録件数)の継続計測。 |
| IMPL-0832 | phase4-process-design/roles-responsibilities:1347 | committee-agenda | 3.10.7 の、判定当日の議題を未解決論点と高リスク事項に限り、事前レビュー期間で解決した事項を再度扱わないこと(判定資料の未解決論点の一覧(3.10.3 の記載事項2)に議題を照らす)。 |
| IMPL-0568 | phase4-process-design/roles-responsibilities:1685 | ai-runtime-connection | 3.12.2 の接続経路の限定。 |
| IMPL-0708 | phase4-process-design/roles-responsibilities:1760 | instruction-asset-inventory | 3.12.3 要求事項6。 |
| IMPL-0712 | phase4-process-design/roles-responsibilities:1793 | model-quality-monitor | 3.12.4 の、可用性の監視(応答の成否・遅延・レート制限への到達。 |
| IMPL-0713 | phase4-process-design/roles-responsibilities:1794 | model-quality-monitor | 3.12.4 の、採点者の識別が変わった後の監視の結果を変わる前の基準値と比べないことと、正解を改めたとき(3.12.3 の要求事項16)に改めた正解で現行のモデルを測り直すこと。 |
| IMPL-0826 | phase4-process-design/roles-responsibilities:1809 | ai-runtime-connection | 3.12.5 要求事項1・2。 |
| IMPL-0827 | phase4-process-design/roles-responsibilities:1810 | model-quality-monitor | 3.12.5 要求事項4。 |
| IMPL-0715 | phase4-process-design/roles-responsibilities:1857 | deprecation-inventory | 3.12.6 の、廃止予定の一覧を四半期ごとに棚卸しして影響する案件へ通知することと、回帰評価・差分の修正・展開に要する期間を差し引いた着手の期限を定めること。 |
| IMPL-0833 | phase4-process-design/roles-responsibilities:1868 | ai-runtime-connection | 3.12.7 の、接続経路の上でチーム単位の上限を設定して消費の前に強制することと、提供者が課す利用上限を組織が設定した上限に数えないこと。 |
| IMPL-0716 | phase4-process-design/roles-responsibilities:1886 | ai-runtime-connection | 3.12.8 要求事項2。 |
| IMPL-0718 | phase4-process-design/roles-responsibilities:1905 | control-rollout | 3.12.9 の、全社の統制の更新を、検査ルールの更新・警告として先行導入・猶予期間・必須検査へ昇格の順で開発組織の CI に反映すること(猶予期間なしの昇格の禁止、猶予の長さを統制の緊急度で定めること、昇格の予定日… |

## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
- [ ] 準拠テンプレート(`template/`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の `npm run check` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は `template/` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
