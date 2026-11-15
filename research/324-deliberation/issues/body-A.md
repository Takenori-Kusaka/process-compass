## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(`state=undelivered`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「ゲート・判定記録の様式とスキル、PR の検査、レビューの待ち行列、予算の上程」に当たるものを、この Issue へまとめて送ります。実装マークの `issue=` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(50 件)
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0801 | phase4-process-design/deliverable-templates:1207 | g1-check | 禁止した一般語のみで書かれた欄と、代替手段の欄に「ない」とのみ書かれた欄を、機械が検査すること。 |
| IMPL-0878 | phase4-process-design/deliverable-templates:1209 | g1-check | 企画書の記述が前案件の記述と同一であることを、機械が検査すること(記述の充足をどう検査するかの表)。 |
| IMPL-0958 | phase4-process-design/deliverable-templates:1348 | gate-skill | 出荷判定(G-7)で、AI-SLA の契約への組み込みの類型として是正計画型と開示義務型を基本とすること。 |
| IMPL-0943 | phase4-process-design/ears-guide:89 | gate-skill | G-2 の判定者が、基準1(検証可能な形式への準拠)の確認で、異常系の基準か、異常条件が見つからない事実の記載のいずれかがあることを確かめること(記載の当否は判定しない)。 |
| IMPL-0603 | phase4-process-design/exception-escalation:88 | gate-skill | 7.3 の対象の限定。 |
| IMPL-0608 | phase4-process-design/exception-escalation:157 | pr-checks | 7.4 の適用できる期日。 |
| IMPL-0567 | phase4-process-design/exception-escalation:174 | pr-checks | 7.4 の限定列挙。 |
| IMPL-0609 | phase4-process-design/exception-escalation:187 | pr-checks | 7.4 の申請書の必須項目(短縮するゲートと検証されないまま残る範囲=ファイル・機能・受入基準の単位、未解決欠陥の一覧と重大度、影響を受ける利用者の範囲、回収に要する見積工数)。 |
| IMPL-0610 | phase4-process-design/exception-escalation:203 | pr-checks | 7.4 の乱用を防ぐ制約1(未回収のファストトラック項目が残る間は同一案件で新たに申請しない)と制約3(適用後の期限内の事後レビュー。 |
| IMPL-0979 | phase4-process-design/exception-escalation:233 | review-queue-control | ゲートの判定期限の超過を検出して、代理を指名する者(D-0 表3 の記名)へ通知し、代理の判定者の指名を求めること。 |
| IMPL-0613 | phase4-process-design/exception-escalation:278 | next-role | 7.6 の運用の規則。 |
| IMPL-0618 | phase4-process-design/exception-escalation:361 | handoff-reference | エスカレーションレポートの分量の上限(状態3行・原因5行・推奨と決裁事項3行)、事業影響とリカバリ選択肢を表で書くこと、項目1〜4 の草案を AI に生成させてよいこと。 |
| IMPL-0668 | phase4-process-design/exception-escalation:373 | gate-record-template | 7.6 の決裁後のポートフォリオ調整。 |
| IMPL-0569 | phase4-process-design/exception-escalation:396 | budget-escalation | 7.7.1 の消化率の分母。 |
| IMPL-0570 | phase4-process-design/exception-escalation:397 | budget-escalation | 7.7.1 の未測定の報告。 |
| IMPL-0619 | phase4-process-design/exception-escalation:421 | budget-escalation | 7.7.2 の指標の定義。 |
| IMPL-0620 | phase4-process-design/exception-escalation:504 | gate-skill | 7.7.3 の中止の判断の運用。 |
| IMPL-0621 | phase4-process-design/exception-escalation:566 | gate-record-template | 7.7.5 の継続と判定する場合の要求事項1〜3(決定者の記名と継続の理由、不合格の項目ごとの解消の期限と責任者、必達基準を再判定する期限。 |
| IMPL-0623 | phase4-process-design/exception-escalation:594 | gate-record-template | 7.7.7 の中止と判定した場合の要求事項1〜4(生成物・データ・外部契約の扱いを決定と同時に確定すること、要員の再配置先を決定と同時に確定すること、得られた知見を恒久層コンテキストへ登録すること、記録を監査の求めに… |
| IMPL-0630 | phase4-process-design/exception-escalation:808 | pr-checks | 7.9.5 要求事項2〜4。 |
| IMPL-0534 | phase4-process-design/gate-criteria:47 | gate-skill | 前提が崩れていることを理由に判定を停止せず、可視化して受容の決裁を求めること。 |
| IMPL-0536 | phase4-process-design/gate-criteria:59 | gate-skill | 単独判定。 |
| IMPL-0549 | phase4-process-design/gate-criteria:1147 | gate-skill | 案件の判定者へ法的評価を求めないこと。 |
| IMPL-0547 | phase4-process-design/gate-criteria:1165 | gate-skill | 秘匿情報を検出した場合の手順1〜3(当該の資格情報の無効化をコードの修正より先に行う / 無効化の完了を確認して参照方法を秘匿情報の管理機構へ置き換える / 履歴に残った値を無効化済みとして台帳へ記録する)。 |
| IMPL-0576 | phase4-process-design/gate-criteria:1956 | gate-skill-g6 | 規範(レビュアーが変更の意図・影響範囲・正しさの根拠を、判定に耐える負荷で確認できること)と、代理指標を満たしても規範を満たさない場合は差し戻すこと。 |
| IMPL-0577 | phase4-process-design/gate-criteria:2028 | pr-checks | 機械的な変換の類型(変換が決定論的・テストが正しさを検出できる・部分的に取り消せる、の3点)を満たす変更だけを行数の算定から外すこと、満たさない変更をこの類型として扱わないこと。 |
| IMPL-0680 | phase4-process-design/gate-criteria:2278 | review-queue-control | レビュー依頼を個人へ指名し、チーム宛てのままにしないこと。 |
| IMPL-0681 | phase4-process-design/gate-criteria:2297 | review-queue-control | 滞留したときの措置。 |
| IMPL-0682 | phase4-process-design/gate-criteria:2334 | review-queue-control | 流入を絞る制御1・2。 |
| IMPL-0953 | phase4-process-design/lifecycle:121 | gate-skill | ステージ移行ゲート(SG-0・SG-1)の実証に、AI が顧客を模して生成した出力を数えないこと。 |
| IMPL-0972 | phase4-process-design/lifecycle:219 | pr-checks | 2.6 要求事項4: 識別を持つ変更は、取り込む前に、その判断記録の G-3 の判定記録を要すること。 |
| IMPL-0884 | phase4-process-design/lifecycle:322 | gate-entry-workflow | 立ち上げの順序(案件の登録、D-0 の作成、D-0 の承認、安全重要度の判定の記録、安全リスクアセスメント、企画書、G-1)を入れ替えないこと。 |
| IMPL-0849 | phase4-process-design/lifecycle:345 | g1-check | 安全リスクアセスメントの適用条件に該当し、かつ SR4 の危険源が残っている案件で、G-1 の審議を開始させないこと。 |
| IMPL-0951 | phase4-process-design/lifecycle:348 | gate-entry-workflow | D-0 の次回レビュー期日を超過している案件で、ステージ移行ゲート(SG)の判定を開始させないこと。 |
| IMPL-0831 | phase4-process-design/roles-responsibilities:639 | gate-record-template | 3.5.2「支援と判定の分離」の、兼務のまま実施する場合に兼務の事実と判定時に支援へ関与した範囲を判定記録へ明記することと、兼務のまま実施したことを独立性の確保として扱わないこと。 |
| IMPL-0650 | phase4-process-design/roles-responsibilities:686 | gate-skill | 3.5.3「入力の分離」の、人の確認者が注意を狭める情報(レビューパッケージの注意喚起部)を、仕様との突合(パス1)を終える前に開いてはならないこと。 |
| IMPL-0652 | phase4-process-design/roles-responsibilities:790 | gate-skill-g6 | 3.5.4 帰結3 の前半。 |
| IMPL-0657 | phase4-process-design/roles-responsibilities:964 | gate-record-template | 3.7.3 の、すべての会議体が継続・中止・保留・差し戻しの4値のいずれかで判定し、判定を保留したまま次回へ持ち越さないこと。 |
| IMPL-0658 | phase4-process-design/roles-responsibilities:967 | gate-record-template | 3.7.3 の、判定と同時に確定させる事項(継続は次段階の予算・要員・期間・スコープ3層・次回判定日、中止は資産の扱い・要員の再配置先・記録の保管、保留は解除条件と再判定の期限、差し戻しは満たすべき条件と再提出の期限)。 |
| IMPL-0702 | phase4-process-design/roles-responsibilities:1171 | gate-record-template | 3.8.3 の、各決定について起案・意見・決定を分けて記録し、決定者を1名とし、意見の数によって決定を導かないこと。 |
| IMPL-0705 | phase4-process-design/roles-responsibilities:1210 | gate-record-template | 3.9.2 の持ち回り決議。 |
| IMPL-0930 | phase4-process-design/safety-verification:245 | g5-adapter | AI に試験を書かせる工程で、行や分岐の網羅率ではなくミューテーションスコアの閾値を通過条件にすること。 |
| IMPL-0931 | phase4-process-design/safety-verification:258 | g5-adapter | ミューテーション試験を CI に組み込むこと。 |
| IMPL-0835 | phase4-process-design/tailoring-guide:471 | gate-skill-g6 | AI の確認を通過したことを理由に人の確認を減らさず、合否条件にも入れないこと。 |
| IMPL-0745 | phase4-process-design/tailoring-guide:525 | gate-skill | 事業ステージを PoC から MVP へ切り替えるとき、省略したゲートを適用へ戻しコア指定をやり直すことを、企画承認(G-1)の条件に含めること。 |
| IMPL-0836 | phase4-process-design/tailoring-guide:642 | g5-adapter | 規制業の規制要件の自動チェックの追加(軸C)。 |
| IMPL-0838 | phase4-process-design/tailoring-guide:646 | gate-skill | 高の出荷判定への限定的な抜き取り確認の追加(軸C)。 |
| IMPL-0761 | phase4-process-design/tailoring-guide:1139 | gate-skill | CL2 以上の安全適合性の検証記録(附属書F F.7)を出荷判定(G-7)の判定基準にすること。 |
| IMPL-0763 | phase4-process-design/tailoring-guide:1141 | g5-adapter | CL3 の CI の必須チェックに故障挿入試験とミューテーション試験を加えること。 |
| IMPL-0771 | phase4-process-design/tailoring-guide:1337 | gate-contract | 差し戻し基準(判定基準の表)を持たないゲートを作らないこと(テーラリングの禁止事項3)。 |

## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
- [ ] 準拠テンプレート(`template/`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の `npm run check` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は `template/` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
