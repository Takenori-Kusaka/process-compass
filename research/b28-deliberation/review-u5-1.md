# 束 B28 U5 独立の突合(1巡目・全体)

突合 2026-11-20。実装した者とは別の文脈で見た。対象は template `c782596..d9d680f` と本体 `4a5a2e54..be517a7b`(graphify-out・research を除く)。基準は intake-2.md §1.4・§1.5 項目7・§3、ruling-fix2.md M2-1、ruling-u5-returns.md、第7章 7.9.4・7.9.5。`impl-u5.md` は所見を書き終えてから読んだ(末尾で突き合わせる)。直していない。

## 実行の環境

- LF の複製: `git -C template -c core.autocrlf=false archive d9d680f | tar -x` を scratchpad の `u5r1`・`u5r1b` へ展開した(package.json が無く、node_modules のリンクは張っていない)。node v26.13.0(Windows)
- 4つの試験はすべて通った: test-check-pr「284 場面と付随の確認が、期待と一致」・test-exception-expiry「91/91 合格」・test-aggregate-records「223 件が期待と一致」・test-aggregate-wiring「全 64 件通過」
- 陰性の確認は、置換を1つ当てて関係する試験を流し、元に戻すスクリプト(scratchpad の `mut.cjs`)で行った
- analyzePr の直接の観察は、test-check-pr.mjs の複製(`test-check-pr.probe.mjs`)の 7.9.5 の節に、観察用の場面 P0〜P8 を差し込んで流した

## 陰性の確認の結果

| # | 壊した所 | 結果 |
| --- | --- | --- |
| a | `stageQuotaFindings` の `prior >= quota` を `>` へ | 落ちた(test-check-pr 1件・test-exception-expiry 1件) |
| b | check-pr の `if (refill) result.errors.push(refill)` を外す | 落ちた(test-check-pr 1件) |
| c1 | `stageQuotaUse` の `!startIds.has(x.id)` を外す | test-check-pr・test-exception-expiry は**通る**。test-aggregate-records の「IMPL-0630:共有」1件だけが落ちた |
| c2 | check-pr の節 3b で startIds を作らない | 落ちた(test-check-pr「次のステージ移行ゲートの通過の後は累計が 0」) |
| c3 | 集約(aggregate-evidence.mjs 4637〜4645 行)で startIds を作らない | **落ちない**(test-aggregate-records・test-aggregate-wiring とも exit 0) → 所見 H-2 |
| d1 | analyzePr を旧い内蔵の作り方へ戻す(同値の式) | 通る(同値なので期待どおり) |
| d2 | `changeListBetween` の numstat を `--no-renames` へ | 落ちた(M2-1:共有) |
| d3 | analyzePr の kind を状態から作らない | 落ちた(M2-1:共有) |
| d4 | `measureCommitSize` の状態の対応を空の Map にする | **落ちない**(test-check-pr exit 0) → 所見 H-1 |
| e | 節 3 の `['ci','task','guard']` から `ci` を外す | 落ちた(既存の1件と IMPL-0836:ng ci.mutationThreshold) |
| f | `|| (stack && f === \`adapters/${stack}.json\`)` を外す | 落ちた(IMPL-0836:ng phases.mutation・phases.regulatory の2件) |
| g | この PR の承認の数え方を常に2名以上にする | 落ちた(IMPL-0630 の3件) |

## analyzePr の直接の観察

| 場面 | 出力(7.9 の errors / notices / exceptionQuota) | 裁定との照合 |
| --- | --- | --- |
| P0 枠 1・行使 1(#5)・この PR の行が 7.9.4 | error「枠を使い切っています(枠 1・行使 1)」、`{quota:1, used:1, thisHit:true}` | 合う(§1.4 の ng) |
| P2 枠に触れない PR(この PR の行なし。制限の範囲に触れる) | 何も出ない。`{quota:null, used:null, thisHit:false}` | 合う。全 PR を新しく落とさない |
| P3 この PR が企画書の枠の行を消し、7.9.4 の行を足す | notice「件数として読めない。枠の検査をしない(行使 1 件)」で通る | 所見 M-2 |
| P4 fork 相当(レビュー読めず・ホスティングなし) | notice「確定できない。枠の検査をしない」で通る | 合う(拒まない) |
| P5 過去の #5 に古い版への APPROVED 2件 | P0 と同じく拒否(行使 1) | 承認を多く数える向きの偏りは、この fixture の形では現れなかった(レビューの形が `normalizeReviews` の読みと合っていない可能性がある)。偏りの有無は実機で確かめていない |
| P6 この PR の行の対象を `PR #<番号>` でなくコミットの16進で書く | 何も出ない | 所見 L-1 |
| P7b この PR で枠を 0 に下げる | error「枠 0・行使 1」 | 合う(減らす変更は補充でない) |
| P1 / P8 既存の `docs/gates/sg-1.md` に空行を足し、枠を 1→2(P8 は 5)に増やす | 補充の失敗が出ない。P8 は「枠 5・行使 1・残り 4」で通る | 所見 M-1 |

## 所見

### H-1(高)M2-1 の一致の固定が measureCommitSize に及ばない。IMPL-1029 の note が実態より強い

- 所在: template `scripts/gate/check-pr.mjs` 1667 行(`measureCommitSize` の `changesOf(all, statusMapOf(...))`)、test-check-pr.mjs の「M2-1:共有」、本体 `assurance-case.md` IMPL-1029 の note
- 根拠: d4(measureCommitSize の状態の対応を空にして、add・delete を modify と数えさせる)で test-check-pr が exit 0。M2-1 の試験は `analyzePr` の `result.changes` と `changeListBetween` だけを比べる
- note は「check-pr 自身(`measureCommitSize` と PR の検査)と同じ `changesOf` を通る。一致は test-check-pr.mjs が、add・modify・delete・rename を含む変更で固定する」と書く。共通の関数を通ることは事実だが、measureCommitSize が通ることを固定する試験は無い
- 直しの向き: measureCommitSize の変更の一覧(または riskFloorOf へ渡る kind)を changeListBetween と比べる場面を足す。足さないなら、note の「固定する」の範囲を analyzePr と changeListBetween に限る

### H-2(高)集約の項目7 の累計をステージ移行ゲートの通過で区切る所に、落ちる試験が無い

- 所在: template `scripts/gate/aggregate-evidence.mjs` 4637〜4648 行(U5 が `latestStageGatePass`・`stageQuotaUse` へ組み替えた区画)。IMPL-0669(delivered・machine・test=test-aggregate-records)
- 根拠: c3(startIds を作らない。累計が全期間の行になる)で test-aggregate-records・test-aggregate-wiring とも exit 0。test-aggregate-records の「IMPL-0630:共有」は関数 `stageQuotaUse` を直接呼ぶだけで、集約の入口(isMain の区画)で台帳を読む所を通らない
- U5 はこの区画を組み替え、裁定(§1.4)は「集約は挙動を変えない」とする。変えていないことを確かめる試験が無い。U5 の前から同じ欠けがあったかは確かめていない(c782596 で同じ変異は流していない)
- 直しの向き: 集約の入口を通す fixture(ステージ移行ゲートの通過の記録と、その時点の台帳にある 7.9.4 の行)で、項目7 の「行使」の数を固定する。test-aggregate-wiring に入口の場面があればそこへ足す

### M-1(中)枠の補充の検査が、既存のステージ移行ゲートの記録の書き換えで通る

- 所在: check-pr.mjs 節 3b の `stagePassInPr`(`all.some((e) => /^docs\/gates\/.+\.md$/.test(e.path) && isStageGatePass(recordFromForm(atHead(e.path) ...)))`)
- 根拠: P1・P8。基底に在る `sg-1.md` に空行を足すだけで「この変更にステージ移行ゲートの通過の記録がある」と扱われ、枠を増やせた。P8 では同じ PR の 7.9.4 の行も「残り 4」で通った
- IMPL-0630 の note の「同じ変更へ入るステージ移行ゲートの通過の記録」は、新しい通過を読み手に想わせる。実態は「通過の結果を持つ記録のファイルに触れる変更」
- 新しい記録かどうか(基底に無いファイル、または基底の最新の通過より後の判定日時)は決定可能で、機械で閉じられる
- 直しの向き: `stagePassInPr` を「基底に無い記録のファイル(atBase が null)で、通過の結果を持つ」に限る。限らないなら note に「既存の記録の書き換えも通過の記録に数える」と開示する

### M-2(中)枠を head の企画書から読むため、同じ PR が枠の行を消す・読めない値にすると拒否が外れる

- 所在: check-pr.mjs 節 3b の `briefText: briefAtHead ?? briefAtBase ?? ''`、`quotaRefillProblem`(h が null なら比べない)
- 根拠: P3。7.9.4 の行を足す PR が企画書の枠の行を消すと、notice「読めない」で通った。枠を増やす向き(M-1 と組む P8)も head の値で数える
- 「読めない枠は注意で通す」は裁定(draft の扱い)どおりだが、読めなくするのが当の PR である場面まで拒否を外す形は、要求事項3 の拒否を同じ PR で無効にできる。基底で読めた枠を head で読めなくする変更は決定可能に検出できる
- 直しの向き: 枠の数は基底(policyPoint か mergeBase)の企画書から読む。または、基底で読めた枠を head で読めなくする変更を補充と同じく失敗にする。採らないなら note に「同じ PR が枠の行を書き換えると検査が外れる」と開示する

### L-1(低)この PR の行は対象の欄に `PR #<番号>` と書いたものだけを見る

- 所在: `stageQuotaFindings` の `refersThis`
- 根拠: P6。対象をコミットの16進で書いた行(この PR の 7.9.4 の決裁)は、拒否の対象にならない(集約の表示では後に数えられうる)
- 直しの向き: note に「この PR の行は対象の欄の `PR #<番号>` で見分ける」と書く(様式の書き方の約束の開示。新しい義務は課さない)

### L-2(低)過去の行がコミットを名指すとき、check-pr と集約で単位の作り方が違う

- 所在: check-pr.mjs 節 3b の `pastUnitOf`(コミットは `by: []`、どのコミットでも作る)と aggregate-evidence.mjs 4058 行(`directProduct` のコミットだけを単位にする)
- 根拠(コードの読み。実行で確かめていない): PR のマージのコミットの16進を名指す行は、集約では単位が見つからず数えられないが、check-pr では制限の範囲に触れていれば行使に数える。集約の表示より check-pr の累計が多くなり、表示で残りがあるのに G-5 が拒む場面がありうる(拒む向きの偏り)
- note の「数え方は集約の項目7 の表示と同じ関数(stageQuotaUse)」は関数については事実だが、入力の単位は同じでない。過去の PR の承認の偏り(開示済み)と逆の向きである
- 直しの向き: note に開示するか、check-pr のコミットの単位をマージのコミットでないものに限る

### L-3(低)IMPL-0630 の test= の試験だけでは、共有の関数の区切りの壊れを捕まえない

- 根拠: c1。test-check-pr・test-exception-expiry は通り、test-aggregate-records だけが落ちる。check-pr は始点の台帳の行を先に外すため、関数の中の区切りに頼っていない
- 回帰全量では捕まるので欠けではない。マークの test= が1本であることの注意として記す。直しは任意

### L-4(低・編集)check-pr.mjs に「--- 3b.」の見出しが2つある

- 所在: 1889 行(7.9.5 の枠)と 1988 行(統制の設定の陰性の確認)。新しい節は 3a より前に置かれている
- 直しの向き: 番号を付け直す

## 確かめて問題の無かった点

- 4つの試験が通る(上記)。陰性の確認 a・b・c2・e・f・g は落ちる。(f)アダプタの段のコマンドの変更を数える分岐を外すと IMPL-0836 の ng 2件が落ちた(実装の担当は確かめていない点)
- 入口: gate-g5.yml の「PR の検査」(567 行)が `GH_TOKEN`・`PR_REVIEWS` を渡して check-pr.mjs を起動し、3060 行が `ghHosting(GITHUB_REPOSITORY)` を `hostingLookup` へ入れる。`pullOf`・`pullFilesOf` は本番の経路で使われる。試験は analyzePr を通す(CLI の起動と gh の実機の呼び出しは試験していない。impl-u5 の開示どおり)
- 全 PR を新しく落とさない: 節 3b の重い処理は、台帳に区分「例外」の行があり構成が設定済みのときだけ走る。この PR を対象とする行が無ければ `stageQuotaFindings` は何も出さず、過去の PR のホスティングも引かない(P2)。読めないもの(過去の PR・枠・累計・この PR のレビュー・fork)は注意で通る(P3・P4、test-exception-expiry の ok)。補充の検査は「数値が無い状態から初めて書く」「減らす」を通す。採用者への新しい義務は、枠を超える 7.9.4 の決裁が G-5 で止まることだけで、裁定(§1.4)どおり
- ADR-0217 決定2: 印の無い 7.9.4 の行を数える(test の ng が印なしの行で落とす)。見分けは `restrictedStateExceptions` と同じ関数
- 様式 06 と profiles の3複製の行の名の補いは、`includes('例外の枠')` で読むため読みが変わらない。`src/data/template-fields.yaml` に当該行の登録は無い
- suite の固定: test-aggregate-records 646〜672 行・test-aggregate-wiring の「止めない」の文の期待は変わっていない(集約の表示の文は不変。ruling-u5-returns 6 のとおり)
- 表示と実態(裁定 1・2 で「突合で見てもらう」とされた点)
  - IMPL-0836: note は「採用者が規則集のファイルを thresholdFiles へ登録した場合に限り、同じ検査に掛かる。登録しない規則集の変更は掛からず、登録は採用者の責務である(adopter。機械は登録の有無を確かめない)」と書き、試験「IMPL-0836:限界」が登録しないファイル(`scripts/regulatory-check.sh`)が掛からないことを固定している。delivered・machine の範囲(段のコマンド・構成の ci)は e・f の陰性の確認で裏づいた。実態より強くは読めないと判断する。ただし段のコマンドが呼ぶ道具の側の設定(例: 変異試験の道具の設定ファイルの閾値)も、登録しなければ掛からない。note の「規則集」に限った書き方で読み手が道具の設定ファイルを想わない恐れは小さいと見て、所見にしない
  - IMPL-0630: 過去の PR の承認の偏り(行使を少なく数えうる)と要求事項4 の manual は note に開示されている。M-1・M-2・L-1・L-2 は note の外にある
- 所有者の方針: 条文(7.9.5 の表)は変えていない。変更は impl の note だけで、手順を条文へ書いていない。新しい欄・印は足していない
- この PR の承認は実行の時点のレビューで数える。レビューの後は G-5 の再実行に頼る(gate-g5.yml 23〜26 行の既存の扱いと同じ)
- 移行の注意(README の項)は ruling-u5-returns 3 で「直しの段で足す」とされ、まだ無い。直しの段の残り作業として確かめた

## impl-u5.md との食い違い

1. impl は「M2-1: analyzePr の変更の一覧を別の作り方にする → 当該1件が落ちる」とし、IMPL-1029 の note は measureCommitSize も含めて固定と書く。measureCommitSize の側(d4)は落ちない(H-1)
2. impl は集約の区画を「呼び替え。表示の文は変えていない」とするが、集約の入口の区切り(c3)の陰性の確認は無い。共有の試験は関数を直接呼ぶ(H-2)
3. impl は「`stagePassInPr` を常に真 → 落ちる」を確かめたが、既存の記録の書き換えで真になる場面(M-1)は見ていない
4. impl は「コマンドの変更を数える既存の分岐を壊す確認は行っていない」とする。本突合の f で、IMPL-0836 の ng 2件が落ちることを確かめた(食い違いではなく補い)
5. impl の「議長へ返す点」2(承認を多く数える向き)は、P5 の fixture では偏りが現れなかった。偏りがあるという note の記述は、実機の確認の無い推論のまま残る
