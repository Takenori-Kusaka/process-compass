## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(`state=undelivered`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「安全適合性の検証記録・安全リスクアセスメント・附属書F・安全重要度ごとの制約」に当たるものを、この Issue へまとめて送ります。実装マークの `issue=` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(17 件)
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0914 | phase4-process-design/safety-verification:32 | safety-verification-record | 安全度の指標(PL/PLr・SIL・ASIL)を「PLr/SIL」のように並べて書かないこと。 |
| IMPL-0916 | phase4-process-design/safety-verification:87 | safety-verification-record | 機械類の制御の安全関連ソフトウェアを、組込ソフトウェアと応用ソフトウェアの2種に分けること。 |
| IMPL-0917 | phase4-process-design/safety-verification:99 | safety-verification-record | 最上位の安全度水準では、機械安全の規格による簡略化された手順を使わず、汎用の機能安全規格によるソフトウェア要求を適用すること。 |
| IMPL-0919 | phase4-process-design/safety-verification:127 | autonomy-derivation | 安全関連部に AI の支援を用いる場合に、AI自律レベルを L1 に固定し、引き上げの判定の対象としないこと。 |
| IMPL-0920 | phase4-process-design/safety-verification:128 | safety-verification-record | 安全関連部の生成された各行が、要求へ追跡でき、コーディング規約に適合し、独立した担当者のレビューを受け、決定論的な試験で検証されている(4条件)こと。 |
| IMPL-0923 | phase4-process-design/safety-verification:143 | safety-verification-record | 実行時に不変条件を確認する構成を採る場合に、その確認を保護方策の一部として F.5 の故障挿入試験の対象にすること。 |
| IMPL-0924 | phase4-process-design/safety-verification:173 | safety-verification-record | 検証手法を、リスク区分と安全関連部ごとの推奨度(HR・R)に従って適用すること。 |
| IMPL-0925 | phase4-process-design/safety-verification:193 | safety-verification-record | 本番稼働中の安全関連システムへ故障を挿入しないこと。 |
| IMPL-0926 | phase4-process-design/safety-verification:209 | safety-verification-record | 安全関連部で、最小限の試験項目(監視タイマの不応答、監視タイマの早すぎる応答、入力の境界値と範囲外の値、入力の欠落と滞留、メモリまたは変数の破壊、処理順序の誤り、安全状態からの復帰の7項目)を試験すること。 |
| IMPL-0927 | phase4-process-design/safety-verification:213 | safety-verification-record | 最小限の試験項目のうち、項目2(監視タイマの早すぎる応答)を省かないこと。 |
| IMPL-0928 | phase4-process-design/safety-verification:214 | safety-verification-record | 監視の実装が単純な形式(時間窓を持たない監視タイマ)である場合に、その旨と診断能力の限界を記録すること。 |
| IMPL-0933 | phase4-process-design/safety-verification:279 | safety-verification-record | 安全関連部の検証の記録項目(安全関連部の切り分けの範囲と根拠、適用規格と安全度水準とその特定の根拠、適用した手法、故障挿入の結果、AI の利用のモデルの版・指示の保存場所・テスト生成の分離の段階)を、ゲート判定記録(… |
| IMPL-0934 | phase4-process-design/safety-verification:283 | safety-verification-record | 適用しなかった HR の項目について理由を書かない記録を、不完全な記録として差し戻すこと。 |
| IMPL-0759 | phase4-process-design/tailoring-guide:1012 | d0-template | 構成要素ごとに安全重要度を判定し、最も高い区分をシステム全体の区分とすること。 |
| IMPL-0760 | phase4-process-design/tailoring-guide:1138 | profile-generator | CL1 以上の AI 生成箇所の追跡(成果物のどの箇所を AI が生成し誰が承認したかを箇所の単位で辿れる状態)。 |
| IMPL-0764 | phase4-process-design/tailoring-guide:1142 | profile-generator | 案件の安全重要度ごとのテスト生成の分離の段階(CL2 は最強〈段2 以上〉、CL3 は最強〈段3 以上〉)。 |
| IMPL-0766 | phase4-process-design/tailoring-guide:1163 | profile-generator | 「適用範囲を安全関連部の外へ限定する」扱い(CL3 の案件で、安全関連部の外だけ L2 以上を認める)。 |

## 条文の食い違いの候補
- CL2 の AI 自律レベルの上限が、第8章 軸E の表(L2)と附属書F F.3 要求1(L1 固定)で食い違う。安全に当たるので重の審議で決める。#324 では条文を変えていない

## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
- [ ] 準拠テンプレート(`template/`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の `npm run check` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は `template/` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
