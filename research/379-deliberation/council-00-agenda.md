# 会議体の議題(#379 記録用ブランチ records の写しを、書き込み権限を持つ者とジョブが書き換えられる)

入力: Issue #379、`survey-379-1-internal.md`(内部)、`survey-379-2-external.md`(外部)。前段の決定 ADR-0070・0090・0106・0107・0108。

## 前提として確かめた事実(要旨)

- 第4章本文には「書き換えられない場所」の文言はもう無く、残るのは EV-0185・IMPL-0353・ADR-0070 決定5。本文 :127 と ci-gates.md:637 は「署名の無い push は author の一致による弱い裏づけ」と書く
- 効力を持つ記録は records を読まない設計(ADR-0106 の a1 却下、#428)
- 写しは書き換えうるのに、集約の G-6 は写しを API より優先して数える。API との差(reconcileCopy)は所見止まりで欠落にならず、user.id・commit_id・author_association を比べない
- 突合の向きが逆: mergeRecordSources と G-7 基準5 は records を正とし、出荷の後に records だけを書き換えると、強制層の下の基底の複製が「人が書き換えた記録」と判定される
- ship-evidence の verify は「複製と records の先頭の一致」だけを見る。records の中身とホスティングの記録の一致、records の履歴、書き込んだ主体を見ない
- record-copy.yml は同じ PR の写しが既にあると警告だけで終わる。マージの前に偽の写しを置けば本物と入れ替わる経路(推論)
- 様式の帰属(recordAttribution)は、署名の確認を手元の %G? に頼り、author だけを照らし、署名なしの author の一致を backed にする。効力を持つ記録の側(introducedBacking)はホスティングの検証と committer・author を求め、強さが揃わない
- records は force push と削除が止まり、履歴は追記だけ。既存ファイルの変更・削除は git の履歴で機械的に列挙できる(走査の実装は無い)。誰が書き換えたかは、検証された署名か push の記録でしか人に結び付かない
- 効力を持つ記録の列挙に無いのに効くもの: autonomy.mjs が読む records の G-6 差し戻しの記録(委任の判定に効く)、roster-ids の提案
- 外部: ルールセットの Restrict updates で push を bypass の主体だけに限れる(個人所有で App の bypass が通るかは未確認)。GITHUB_TOKEN は特定のワークフローに絞れない。Restrict file paths は public で使えない。admin はルールセットを外せるため、防止ではなく検出まで。防止には外部の WORM か透明性ログが要る。SLSA Source L2 は履歴の不変までで内容の追記専用を求めない。21 CFR 11.10(e)「Record changes shall not obscure previously recorded information」(FDA は執行を見合わせ)。NIST AU-9・AU-10。git の文書は author・committer の名を認証に効かないと書く

## R-1 要求の形(防止か検出か)

- 問い: 写しと様式の置き場の要求を、「書き換えられない」から「記録を残さずに書き換えられない」(書き換えと追記を機械が検出する)へ改めるか。防止を求めるか。外部の WORM・透明性ログを求めるか

## R-2 写しと API の突合の向きと、G-6 の数え方

- 問い: 写しとホスティングの記録(API)が食い違うとき、どちらを正とするか。食い違いを欠落にするか。比べる欄。出荷の後の records の書き換え

## R-3 様式の帰属(署名の無い author の一致)

- 問い: 署名の無い author の一致を、判定記録の帰属の裏づけに数えるか(候補 b)。本文 :127 の「弱い裏づけ」の扱い。署名の検証を手元の %G? でなくホスティングの検証で行うか

## R-4 写しの先取りと、効力を持つ記録の列挙の漏れ

- 問い: record-copy の先取りの経路をどう塞ぐか。records の G-6 差し戻しの記録(委任の判定に効く)を効力を持つ記録に加えるか

## R-5 開示と記録

- 問い: 書き込みの主体を限れないというホスティングの制約を保証の開示に出すか(候補 c)。新しい ADR、EV-0185・IMPL-0353 の扱い、EV・IMPL、採らない案
