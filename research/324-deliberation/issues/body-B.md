## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(`state=undelivered`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「体制・構成・委任・D-0 の担当表・変化点の反映・テーラリング」に当たるものを、この Issue へまとめて送ります。実装マークの `issue=` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(41 件)
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0944 | phase4-process-design/deliverable-templates:216 | process-change-skill | 変化点をまたぐ未完了の判定を、変化点の後の体制の判定者(新しい席の責任者)が引き継ぐことの記録と、変化点の前の体制の判定者の名義の判定を変化点の後の判定として受け付けない検査。 |
| IMPL-0624 | phase4-process-design/exception-escalation:666 | autonomy-derivation | 7.7.8 要求事項6。 |
| IMPL-0585 | phase4-process-design/gate-criteria:2350 | config-delegation | 帯域不足を理由に G-6 を省略しないこと。 |
| IMPL-0592 | phase4-process-design/human-ai-boundary:30 | config-roles | 原則2(結果責任は成果物ごとに1名)。 |
| IMPL-0594 | phase4-process-design/human-ai-boundary:122 | autonomy-derivation | リスク区分ごとの最大レベルのうち、R1 は L1・R2 は L2 を変更ごとのリスク区分と照合すること、安全関連部の R1・L1 固定。 |
| IMPL-0595 | phase4-process-design/human-ai-boundary:321 | process-change-skill | 外部の性能指標(ベンチマークのスコア)のみを根拠にレベルを引き上げないこと、自組織の実測値を根拠とすること。 |
| IMPL-0597 | phase4-process-design/human-ai-boundary:494 | config-delegation | 条件4(単独で取り消せ、取り消しを実行した実績がある)と条件6(独立レビュアの席の責任者が事後に抜き取りで確かめる。 |
| IMPL-0598 | phase4-process-design/human-ai-boundary:552 | config-delegation | 人が確定する判断3・4・6と、出荷判定者の停止権の範囲。 |
| IMPL-0599 | phase4-process-design/human-ai-boundary:597 | config-delegation | 席ごとの委任できる範囲と協働で AI が起案できるものの上限の表を、構成が受け付ける値の検査として持つこと。 |
| IMPL-0635 | phase4-process-design/roles-responsibilities:45 | d0-template | 3.2・3.3 の、成果物ごとの結果責任者(A)を担当表(D-0)で1名に定めること。 |
| IMPL-0636 | phase4-process-design/roles-responsibilities:115 | config-seats | 3.4.1 要求事項1〜3 と「確認に用いるもの」。 |
| IMPL-0637 | phase4-process-design/roles-responsibilities:141 | d0-template | 暫定任命の期間を組織が定めること(期間を定めない暫定任命を認めない)と、期間内に確認へ至らない場合に任命を解くか期間の延長を記録して決裁すること。 |
| IMPL-0640 | phase4-process-design/roles-responsibilities:249 | config-seats | 3.4.2 要求事項2・5。 |
| IMPL-0643 | phase4-process-design/roles-responsibilities:255 | config-seats | 3.4.2 の、3.12.3 のモデルの適合性評価を通過していないモデルを、席の単位の適合性確認の対象にしてはならないこと。 |
| IMPL-0900 | phase4-process-design/roles-responsibilities:641 | config-roles | 3.5.2「支援と判定の分離」の要求事項1。 |
| IMPL-0829 | phase4-process-design/roles-responsibilities:671 | d0-template | 3.5.3「文脈の分離が成立する条件」の、全ロールが同一の認証情報(トークン)を共有する構成では強制は成立せず、分離できない場合は権限の分離の不成立を列挙に無い離脱として記録すること。 |
| IMPL-0651 | phase4-process-design/roles-responsibilities:710 | process-profile | 3.5.3 の、実行主体が参照する内容(自ロールと判定ゲート・担ってはならない工程・引き渡し先)が D-0 の改訂に追随しているかを、機械的に検査できること。 |
| IMPL-0654 | phase4-process-design/roles-responsibilities:899 | d0-template | 3.6 の、価値責任者が機能単位の仕様承認(G-4)を機能責任者へ、技術判断者が定型的な技術選定の判定を開発者へ委譲するときは文書(担当表)で行い口頭で行わないこと。 |
| IMPL-0659 | phase4-process-design/roles-responsibilities:984 | d0-template | 3.7.4 B-1 の、決定者(A)を投資決裁者の1名とし(規程を持たない体制は D-0 表1「投資の継続・中止」の決定者、権限の出所を D-0 に記録する)、判定期限を上程から10営業日以内とし、判定記録・配分した… |
| IMPL-0660 | phase4-process-design/roles-responsibilities:999 | d0-template | 3.7.4 B-2 の、決定者(A)を事業決裁者の1名とし、判定期限を上程から5営業日以内とし、判定記録・変更した計画・次回判定日を記録すること。 |
| IMPL-0661 | phase4-process-design/roles-responsibilities:1016 | d0-template | 3.7.4 B-3 の、決定者(A)を技術判断者の1名とし、判定期限を提出から5営業日以内とし、適用条件(S2 スケール、または安全・法規制の対象となる機能)に限って置くこと。 |
| IMPL-0662 | phase4-process-design/roles-responsibilities:1055 | d0-template | 3.7.4 B-4 の、決定者(A)を QA(出荷判定者)の1名とし、重大変更の判定期限を上程から3営業日以内とし、変更を標準変更・通常変更・重大変更の3区分で扱うこと(重大変更は R1。 |
| IMPL-0664 | phase4-process-design/roles-responsibilities:1059 | config-delegation | 3.7.4 B-4 の標準変更カタログの規定のうち、登録できる種別は R3 だけとすること(種別の属性)と、登録からの削除と範囲の縮小を B-4 の定例を待たずに適用することを、準拠テンプレートの検査が運ぶか。 |
| IMPL-0701 | phase4-process-design/roles-responsibilities:1137 | d0-template | 3.8.2 の、決裁者を金額区分とリスク区分の交点で一意に定める既定の割当(リスク × 金額の表)と、記録の無い交点は表の割当によること。 |
| IMPL-0704 | phase4-process-design/roles-responsibilities:1200 | d0-template | 3.9.1 の、判定期限を定例の開催日ではなく上程の受理日から起算すること。 |
| IMPL-0709 | phase4-process-design/roles-responsibilities:1761 | config-change-log | 3.12.3 要求事項10 のうち、評価用の基準集合の範囲を狭める変更を統制を緩める向きの変更として扱うこと(3.13.3)。 |
| IMPL-0714 | phase4-process-design/roles-responsibilities:1856 | d0-template | 3.12.6 の、開発組織で用いるモデルを版を固定して指定すること。 |
| IMPL-0834 | phase4-process-design/roles-responsibilities:1931 | autonomy-derivation | 3.12.10 要求事項5。 |
| IMPL-0980 | phase4-process-design/roles-responsibilities:2037 | process-change-skill | 3.12.12 要求事項5 のうち、判断「外す」の再評価の記録でも、外した後に失わない保証(移した先)を示すこと。 |
| IMPL-0721 | phase4-process-design/roles-responsibilities:2123 | d0-template | 3.13 の、ロールの担当表(誰がどの成果物の A か)を常に最新に保ち空席を作らないことと、担当表の保守が文脈オーナーの責務であること。 |
| IMPL-0959 | phase4-process-design/tailoring-guide:33 | profile-generator | 要求事項2の宣言(外した項目・簡略化した項目と理由)を附属書D の提案書に含めること。 |
| IMPL-0732 | phase4-process-design/tailoring-guide:67 | process-change-skill | 変化点1 の限定。 |
| IMPL-0737 | phase4-process-design/tailoring-guide:109 | process-change-skill | 再実行のたびに、調整は宣言を伴うの4つの要求事項(軸に基づく調整・外した項目の宣言・目的の達成の提示・従う版の宣言)を満たし直すこと。 |
| IMPL-0740 | phase4-process-design/tailoring-guide:302 | config-unmet | 市場・顧客仮説の検証が成立しない場合の未達の宣言(理由・代償措置・調達先の3点)。 |
| IMPL-0840 | phase4-process-design/tailoring-guide:414 | config-delegation | 委任の対象にできる変更の種別を、満たすべき属性(新たな外部呼び出し・データ構造・権限を導入しない)で定めること。 |
| IMPL-0842 | phase4-process-design/tailoring-guide:437 | config-delegation | 委任の条件に反する変更が2期連続で出た場合に、切替を停止してリリース前の判定(協働)へ戻すこと。 |
| IMPL-0841 | phase4-process-design/tailoring-guide:502 | config-delegation | 緊急のセキュリティ修正を登録した変更種別に含めず、7.4 のファストトラックで扱うこと。 |
| IMPL-0839 | phase4-process-design/tailoring-guide:648 | profile-generator | 規制業の AI 生成箇所のトレーサビリティの必須(軸C)。 |
| IMPL-0767 | phase4-process-design/tailoring-guide:1189 | process-change-skill | 設計による区分の引き下げの制約(受入基準の必須制約)を外す変更を、区分の再判定の対象にすること。 |
| IMPL-0768 | phase4-process-design/tailoring-guide:1204 | process-change-skill | 設計による引き下げの対象外とする危害(人体への危害〈不可逆〉・外部へ出た情報・外部との間で確定した取引・第三者の資産や環境への物理的な影響)を、引き下げの根拠に使わないこと。 |
| IMPL-0772 | phase4-process-design/tailoring-guide:1338 | config-deviations | 標準から外した項目を宣言せずに運用しないこと(テーラリングの禁止事項6)。 |

## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
- [ ] 準拠テンプレート(`template/`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の `npm run check` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は `template/` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
