# #379 実装の記録

- 日付: 2026-11-05
- 入力: `decision.md`(裁定)、`council-01-drafter.md`(起案)
- 番号: ADR-0109(`adr/0109-records-detect-not-prevent.md`)、EV-0224〜0227、IMPL-0432〜0442。起案の仮置きの番号とは対応を組み直した(下表)

## IMPL の割り当て(本実装 ← 起案の仮置き)

| 本実装 | 状態 | 内容 | 起案の仮置き |
| --- | --- | --- | --- |
| IMPL-0353(改め) | delivered / machine | 置き場の要求(記録を残さずには書き換えられない場所)。ルールセットの雛形の検査 | IMPL-0353 |
| IMPL-0128(改め) | delivered / machine | 様式の帰属。署名の無い author の一致を数えない。ホスティングの検証 | IMPL-0128・0436 |
| IMPL-0432 | delivered / machine | 履歴の走査(変更・削除・名前の変更、マージより前の写し、衝突の記録) | IMPL-0432 |
| IMPL-0433 | delivered / machine | 先頭の固定と祖先関係 | IMPL-0435 |
| IMPL-0434 | delivered / machine | 規制業・CL2 以上の署名の無い書き込み | (裁定 R-1 の4。起案に無い) |
| IMPL-0435 | delivered / machine | 写しとホスティングの突合、G-6 を突合を通った写しで数える | IMPL-0433 |
| IMPL-0436 | delivered / machine | mergeRecordSources と G-7 基準5 の向き | IMPL-0434 |
| IMPL-0437 | delivered / manual | record-copy.yml の衝突 | IMPL-0438 |
| IMPL-0438 | delivered / machine | 成立条件4 の帰属 | IMPL-0437 |
| IMPL-0439 | delivered / machine | 保証の開示の項目1 の定型の文と件数(内・外) | IMPL-0440 |
| IMPL-0440 | delivered / machine | 委任の判定が数える差し戻しの帰属(autonomy) | IMPL-0439 |
| IMPL-0441 | delivered / machine | roster-ids の提案をホスティングで照合した値に限る | IMPL-0441 |
| IMPL-0442 | delivered / manual | 誤検出の対策(.gitattributes・.prettierignore・guard.json の appendOnlyPatterns) | (裁定 R-1 の現場の提案) |

undelivered で残したもの: なし(裁定の範囲は降ろした。限界は各 IMPL の note に書いた)。

## 標準の側(実装済み)

- gate-criteria.md「判定記録を基底ブランチへ入れる操作」: 効力を持つ記録の表と段落、判定記録の帰属の裏づけ(弱い裏づけの文を削除)、委任の判定が数える差し戻し、置き場の要求・訂正・主体を限れない・CI の成果物は置き場に当たらない・誤検出の対策・採らない形。EV-0185 削除、EV-0224・0226・0227 追加
- 「判定の成立」: 名簿の識別子の提案をホスティングで照合した値に限る文。IMPL-0426 の note を改めた
- G-6 条件5 の箇条(欄の区分・G-6 の数え方・写しの取り出しの衝突)、EV-0225、IMPL-0126・0354 の note
- G-7 基準5 の向き、保証の開示の項目1(表の欄と要求の箇条2つ)、成立条件4 の箇条
- overview.md 1.4「効力を持つ記録」、human-ai-boundary.md 5.4.6 の差し戻し率の分子、ci-gates.md(:637 の帰属、置き場の箇条、写しの突合、EV-0119 の本文)
- ADR-0109 新設、ADR-0070 のステータスに一部置き換えを追記
- impl-targets.yaml(record-copy-workflow の説明)、impl-inventory.yaml(3節の ids と note)

## 準拠テンプレートの変更(実装済み)

- records.mjs: addedCommitOf、scanRecordsHistory、classifyRecordsHistory、isAncestorCommit、recordsRulesetProblems、CONFLICTS_DIR。recordAttribution は裏づけに数えない(表示だけ)
- material-attribution.mjs: ghHosting に commitOf・pullOf・headRef。fixedHosting に commitOf・pullOf
- aggregate-evidence.mjs: mergeRecordSources(基底の複製を正)、reconcileCopy(REST・識別子で対応づけ)、G-6 を突合を通った写しで数える、帰属の承認者をホスティングの記録から読む、formAttribution(introducedBacking で照らす)、履歴の走査・先頭の固定・署名の要否の欠落、衝突の記録、成立条件4(unbackedSignerForms。同一人物・兼務の理由を先に出す)、項目1 の定型の文と件数、evidence/records-head.json、PR_FIELDS に headRefName
- ship-evidence.yml: docs/records/heads/ へ先頭を残す。verify で記録した先頭が記録用ブランチの履歴にあることを確かめる
- record-copy.yml: 既存の写しと不変の欄(マージの時刻までのレビュー)を比べ、一致で成功・食い違いで衝突を records/conflicts/ へ追記して失敗。初期化で .gitattributes を置く
- autonomy.mjs: attributeRejection。readRejectionRecords に config・hosting(既定は gh)
- roster-ids.mjs: 写しの値は gh api users/<login> で照合したものだけ提案
- generate-profile.mjs: :2841 のコメントを ADR-0106 決定6 に揃えた。guard.json に appendOnlyPatterns
- guard-write.mjs: appendOnlyPatterns(既にあるファイルの編集を拒否。新しいファイルは拒否しない)
- preflight.mjs: TEMPLATE_TOP に .gitattributes・.prettierignore
- .gitattributes・.prettierignore(新設)、rulesets/README.md、skills/gate/reference/recording.md
- 試験: test-records-history.mjs(新設。gate-g5.yml と g5-local.mjs に結線)。test-records・test-aggregate-records・test-check-delegation・test-roster-ids を改めた。fixtures/records/api/pr-14.rest.json(新設)
- 回帰の試験の材料: scripts/regress/suite/t288.mjs(条件4 の記名の場面。記録を入れる PR を G-7 の記名者も承認する)

## 裁定と食い違う・判断した点

- R-2「ホスティングにあり写しに無いレビュー」: 裁定は書いていない。起案は欠落としたが、所見(マージより前のものは取りこぼしの疑いと書き分け)に留めた
- R-2 の本文・状態: 裁定どおり所見。起案の「変化の記録が無いのに異なれば欠落」(GraphQL の編集の履歴)は裁定に無いため採らなかった(EV-0225 の差し替え条件に残る)
- R-2 の ghost: 裁定どおり欠落にせず照合できなかったものとして件数を出し、そのレビューは G-6 に数えない
- R-3「出荷の PR の作成者」: introducedBacking と同じ関数で照らす。出荷の PR(head が ship/*)の github-actions[bot] のコミットは記名者以外のコミットに数えない(ADR-0109 の反論されうる点)
- R-3「記名者本人の push」: 準拠テンプレートは push の主体を読まない。裏づけの経路にしない(IMPL-0128 の限界)
- R-4: 帰属の確認者を置けない体制の自己申告(introducedBacking の selfAttested)は、差し戻し率に数えない。様式でも判定記録として自己申告に数える
- 誤検出の対策の拒否は「既にあるファイルの編集」に限った(裁定の文言どおり)。新しい様式を草案の文脈が起こす経路(recording.md)を残すため、protectedPatterns ではなく appendOnlyPatterns を新設した
- ship-evidence の verify が比べる写しの欄と集約の比較の範囲は揃えていない(起案の提案。裁定に無い。IMPL-0436 の限界)

## 試験の結果

- 手元(Windows): gate-g5.yml の試験は test-g5-aggregate(4/23 の既知の失敗。ワークフローの文の改行に依る)と test-results(引数を要する)を除いて通過。npm run test:template-suite は test-g5-aggregate の1件だけ落ちる(既知)
- 標準の検査: lint:impl・lint:evidence・lint:scope・lint:refs・lint:provisions・lint:tone・test:fields・test:template・test:impl、textlint 通過
- WSL の回帰(`node scripts/regress/run.mjs --kb keep`): 既定の時刻帯(JST)と TZ=UTC の両方ですべて通過(t288 の条件4 の場面の材料を直した後)
- WSL の gate-g5.yml の試験(test-results を除く。test-g5-aggregate を含む): 既定の時刻帯と TZ=UTC の両方で全件通過。Windows のファイルの実行ビットを落とした新しいリポジトリで流した(同期先の作業ツリーでは、実行ビットと graft の除外が原因で test-adoption・test-context-refs が落ちる。変更に依らない環境の差であることを、変更前の版との比較で確かめた)

## 突合の後の訂正(crosscheck.md の所見ごと)

| 所見 | 扱い | 内容 |
| --- | --- | --- |
| H-1 | 直した | 履歴の走査を `--full-history --diff-merges=first-parent` にし、マージの解決で既存の写しを変えたマージコミットを書き換えとして出す。マージで取り込んだ枝の追加は1件に数える。試験 test-records-history(IMPL-0432:ng の場面を追加) |
| H-2 | 直した | record-copy.yml の比べる欄に state と body を足した(マージの時刻までのレビュー)。集約は G-6 の承認をホスティングの記録の状態で数え(reconcileCopy の stateById → reviewsOfCopy)、写しの状態との食い違いは所見。マージより前に提出され、ホスティングにあり写しに無いレビューは欠落(実装者の「所見に留める」判断を改めた)。マージの後は所見。ホスティングを読めないものは数えない(既存のとおり) |
| H-3 | 直した | 検出(書き換え・マージより前の写し・衝突・署名の無い書き込み・連続しない先頭)を、技術負債台帳の区分「例外」の行で「対象」に検出の識別子を書いた例外承認(exceptionMatch。帰属の照合は既存のとおり)で受け入れ、欠落に数えず保証の開示に件数で出す(IMPL-0443 を新設)。衝突は記録用ブランチの全体からではなく、走査の範囲(前回の出荷の先頭より後。初回は全体)で足されたものだけを数える |
| M-1 | 直した | 出荷の PR で bot のコミットを記名者以外のコミットに数えない扱いを外した。様式の帰属は記録用ブランチで様式を足したコミットを主の経路とし、運ぶ PR は記名者本人の承認だけが裏づく。本文・ADR・EV-0226 の前提・試験を改めた |
| M-2 | 直した | 差し戻しのレビューの帰属に名義の共有を入れた(名義を共有する書き手は、名義を共有していない記名者以外の人の承認が PR に無ければ数えない) |
| M-3 | 直した | 書き手を G-6 の席の責任者に限る規定と実装をやめた。名簿の人・AI の名義でない・書き込みの関係を持つ・PR の作成者でない書き手を数える(承認の数え方と対称)。本文の文を改めた |
| M-4 | 直した | ADR-0109 のステータスの表に ADR-0070 決定6・決定7、ADR-0106 決定1、ADR-0108 決定2(EV-0223 の前提)を足した。ADR-0070・0106・0108 のステータスの節に関係を書いた |
| M-5 | 直した | roster-ids は写しの識別子を源とし、ホスティングの今の値と一致するものだけ提案。食い違う人は提案せず所見。gh を読めない実行は写しから提案し「照合していない」と付ける。本文の文と EV-0223 の本文を改めた |
| M-6 | 直した | ADR-0109「網の外に残る経路」と EV-0224 に、管理者がルールセットを外し前回の先頭より後のコミットだけを作り直す経路を書いた。最初の出荷より前は force push による書き換えに限る旨も書いた |
| M-7 | 直した | 署名の要否を records.mjs の recordsSignatureRequired(構成の回答の規制業・安全重要度)1つにまとめ、集約・開示の文・record-copy.yml・ship-evidence.yml(`node scripts/gate/records.mjs --signature-required`)が使う。変数 RECORDS_SIGNED と records.signed を読まない。ship-evidence は既定ブランチの ruleset が safety・regulated のときも署名つきで作る(既定ブランチの規則の都合で、記録用ブランチの判定とは別) |
| M-8 | 直した | 規則で書き換えを止められない構成を、第1章 1.10.2 の列挙に無い離脱の表に足した。理由: 未達はゲートについての区分で、置き場の性質に当たらない。逸脱は条件と代償措置を定めたものに限るが、本件は定めていない。実装は config.mjs の recordsProtectionState(env-check の所見 recordsBranch)が mismatch のとき claimStatus が列挙に無い離脱に数え、開示の定型の文を「確かめた / 適用されていない / 確かめていない」で出し分ける |
| L-1 | 直した | テンプレートのコメントの ADR-0109 の決定の番号を、決定1〜5 に合わせて直した(26 か所) |
| L-2 | 直さない | IMPL-0438 の限界(集約の本体を通す不成立の場面が回帰に無い)は、note の開示のまま残す。t288 の直しは新しい規則への入力の直し |
| L-3 | 直した | appendOnlyPatterns を records/** に限った。Bash による編集と別の作業木を止めないことを IMPL-0442 の note と rulesets/README に書いた |
| L-4 | 直した | G-6 の欠落の文に、写しで G-6 を数えなかった理由(照合できなかった・食い違いがある)を添えた |
| L-5 | 直さない | マージより前の写しの判定が写しの merged_at に頼る経路は、IMPL-0432 の限界の開示のまま残す(主の防御は突合) |
| L-6 | 直さない | test-g5-aggregate の Windows での失敗は #379 の原因ではない(作業木の改行)。WSL では通る |
| L-7 | 直さない | E:\Github\process-compass\.ignore は触らない |

### 突合の後に確かめたこと

- 標準の検査(lint:impl・evidence・scope・refs・provisions・tone、test:fields・template・impl、textlint)を通した
- 手元の gate-g5.yml の試験は、既知の test-g5-aggregate と test-results を除いて通過。npm run test:template-suite は test-g5-aggregate の1件だけ落ちる(既知)
- WSL: 実行ビットを揃えた新しいリポジトリで gate-g5.yml の試験(test-results を除く。test-g5-aggregate を含む)を既定の時刻帯と TZ=UTC で流し、全件通過。回帰の試験(`node scripts/regress/run.mjs --kb keep`)は JST と TZ=UTC の両方ですべて通過
- 新しい IMPL: IMPL-0443(置き場の検出の例外承認による受け入れ。delivered / machine。試験 test-records-history)
