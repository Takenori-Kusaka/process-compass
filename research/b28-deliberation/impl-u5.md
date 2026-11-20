# 束 B28 U5 実装の記録

実装 2026-11-20。単位 U5(IMPL-0630 の枠の拒否と補充・IMPL-0836 の項目7・ruling-fix2 の M2-1)。

## 変えたもの

| ファイル | 要点 |
| --- | --- |
| template `scripts/gate/exception-expiry.mjs` | `quotaOfBrief`(枠の読み。`exceptionQuotaText` も同じ関数)・`isStageGatePass`/`latestStageGatePass`・`stageQuotaUse`(累計。`restrictedStateExceptions` に始点の台帳との差を足す)・`stageQuotaFindings`(この PR の行が 7.9.4 に当たり、この PR を除く行使が枠以上なら errors。読めないものは notices)・`quotaRefillProblem`(枠を増やす変更にステージ移行ゲートの通過が無ければ問題)。IMPL-0996 の `unjudgedGateExceptions` と閾値割れの 7.3 は触っていない |
| template `scripts/gate/aggregate-evidence.mjs` | 項目7 の累計を `latestStageGatePass`・`stageQuotaUse` へ呼び替え。表示の文は変えていない |
| template `scripts/gate/check-pr.mjs` | 節 3b を新設(枠の拒否と補充)。`statusMapOf`・`changesOf` を新設し、`changeListBetween`・`measureCommitSize`・`analyzePr` の3か所が同じ `changesOf` を通る(M2-1)。`analyzePr` の戻りに `changes`・`exceptionQuota` を足した。過去の行の PR は `hosting.pullOf`・`pullFilesOf`、コミットは git から求める |
| template `scripts/gate/material-attribution.mjs` | `ghHosting`・`fixedHosting` に `pullFilesOf`(変更ファイル。rename は新旧の名) |
| template `templates/06-project-brief.md` と profiles 3複製 | 行の名を「例外の枠(7.9.4 の制限された状態での例外決裁。事業ステージあたり)」へ補った(編集の指摘)。`includes('例外の枠')` で読むため機械の読みは変わらない。`src/data/template-fields.yaml` に当該行の登録は無く、変更不要。`npm run test:fields` は通る |
| 本体 `exception-escalation.md` | IMPL-0630 を delivered・machine(test-check-pr)へ。note に要求事項4 は manual、累計は下限、過去の PR の承認の数え方が集約と異なる、ADR-0217 の影響の節が事実でなくなった旨。IMPL-0629 の行の名を合わせた |
| 本体 `gate-criteria.md` | IMPL-0202 の note の「規則集は範囲外」を、段のコマンド・閾値は同じ検査に数える、規則集は採用者の登録だけが掛かる、へ |
| 本体 `tailoring-guide.md` | IMPL-0836 を delivered・machine(test-check-pr)へ(下の「議長へ返す点」1)。note の「降りていない」を外し、規則集の限界(adopter)を書いた |
| 本体 `assurance-case.md` | IMPL-1029 の note の M2-1 の開示を、共通の `changesOf` と一致を固定する試験があることへ改めた |
| 台帳 | `npm run impl:write` |

項目7(基準値と除外設定の変更)の現物: 段のコマンドはアダプタ `adapters/<stack>.json`、閾値は構成 `ci` にあり、どちらも既存の検査(`isThreshold`・`keys=['ci','task','guard']`)が既に数えていた。コードは変えず、試験で固定した。規則集のファイルは所在を機械が知らないため、採用者が `thresholdFiles` へ登録した分だけが掛かる。

## 足した試験と陰性の確認

試験は、実装を一度壊して落ちることを実行で見た(壊して試験を流し、戻した)。

| 試験 | 壊した実装 | 落ちた試験 |
| --- | --- | --- |
| test-check-pr: IMPL-0630:ng 枠 1・行使 1 | check-pr が `q.errors` を積まない | 当該1件。unit は通る |
| 同上 | `prior >= quota` を `>` へ | check-pr 1件、exception-expiry 1件 |
| test-check-pr: IMPL-0630:ng 枠を増やす(1→2) | 補充の失敗を積まない | 当該1件 |
| 同上 | `stagePassInPr` を常に真 | 当該1件 |
| test-check-pr: IMPL-0630:ok 範囲に触れない行 | 範囲に触れたかを常に真 | 当該1件 |
| test-check-pr: IMPL-0630:ok 過去の PR を読めない | 「確定できない」の注意を出さない | check-pr 1件、exception-expiry 1件 |
| test-check-pr: IMPL-0630:ok 次のステージ移行ゲートの後 | 最新でなく最初の通過を取る | check-pr 1件、exception-expiry 1件 |
| test-aggregate-records: IMPL-0630:共有 | 累計が始点の台帳を引かない | 当該1件(check-pr 側は行を先に外すため落ちず、集約と共有する試験で捕まる) |
| test-check-pr: IMPL-0836:ng ci.mutationThreshold | `keys` から `ci` を外す | 当該1件 |
| test-check-pr: M2-1 | `analyzePr` の変更の一覧を別の作り方にする | 当該1件 |
| test-exception-expiry: ghHosting.pullFilesOf | `previous_filename` を外す | 当該1件 |

IMPL-0836 の phases.mutation・phases.regulatory・thresholdFiles 登録の3件は、既存の実装が数えているので壊す対象が無い(既存の検査の固定)。コマンドの変更を数える既存の分岐(`adapters/<stack>.json`)を壊す確認は、この単位では行っていない。

常に通る試験の点検: 「IMPL-0836:限界」(登録しない規則集は掛からない)は限界の記述を固定する対で、単独では実装を壊しても落ちない。note の「登録は採用者の責務」が事実であることを見る目的で置いた。

結果: test-check-pr 284 場面一致(Windows の作業ツリー)・test-exception-expiry 91/91・test-aggregate-records 223 件・test-aggregate-wiring 全 64 件・test-material-attribution 58 件。`npm run impl:write`・`lint:impl`・`lint:refs`・`lint:scope`・`lint:evidence`・`test:fields`・textlint は通る。回帰の全量 `npm run check` は流していない。

入口: gate-g5.yml の「PR の検査」が `GH_TOKEN` と `PR_REVIEWS` を渡し `check-pr.mjs` を実行する。試験は `analyzePr`(CLI の `main` が呼ぶ同じ関数)を通す。CLI の起動そのものと、gh による `pullFilesOf` の実機の呼び出しは試験していない(`ghHosting` の `run` を差した単体と stub のみ)。

## マークの state の変更

| マーク | 前 | 後 |
| --- | --- | --- |
| IMPL-0630 | undelivered・manual | delivered・machine(test-check-pr) |
| IMPL-0836 | undelivered・manual | delivered・machine(test-check-pr)。議長へ返す点 1 |
| IMPL-0202・IMPL-0629・IMPL-1029 | note の改めのみ(state は変えない) | |

## 差分の範囲

- template: `c782596..d9d680f`
- 本体: `4a5a2e54..` 本記録を含む最終コミット(`git log` を参照)

## U6 へ回した点

- 変更なし(IMPL-0996 の `unjudgedGateExceptions` と閾値割れの 7.3 は触れていない)。

## 議長へ返す点

1. **IMPL-0836 を delivered にしたこと**。意図は intake-2 §1.5(U5 の後)に従った。ただし規則集のファイルの変更は、採用者が `thresholdFiles` へ登録した分だけが掛かる(adopter)。機械は登録の有無を確かめない。段のコマンドと閾値は既存の検査が数える。「規則集の変更を G-5 の基準値の変更として扱う」を機械の保証と読ませないため note で開示した。undelivered(adopter)へ寄せるかは決めてほしい。
2. **過去の PR の承認の数え方**。check-pr は過去の PR の承認を「作成者以外の APPROVED の人数」で数え、集約の独立した人の確認(版の束縛・AI の名義の除外)と同じではない。承認を多く数える向きなので、行使を少なく数える。note で開示した。集約と同じ数え方に揃えるには過去の PR の全コミットの情報が要る。
3. **CHANGELOG(移行の注意)**。intake-2 §3 は「枠を超える 7.9.4 の決裁は G-5 で止まる」を U5 の note と CHANGELOG に書くとする。template にも本体にも CHANGELOG のファイルが無い。note には書いた。CHANGELOG の置き場は決めてほしい。
4. **ADR-0217 の影響の節**。「止めるのは 7.9.4 の行の欠落だけ」は事実でなくなった。採用済みで書き換えない。IMPL-0630 の note に書いた。
5. **要求事項4(事後レビュー)** は機械で確かめない(manual)。裁定どおり。
6. **集約の表示の文**(exceptionQuotaText の「止めない」)は変えていない。拒否が G-5 にあることを表示に足すかは任意。足すなら test-aggregate-records・test-aggregate-wiring の固定の期待を改める。
7. 台帳の本体の細部: `IMPL-0669` の note の「拒否は IMPL-0630」は今は事実になった。文はそのまま通る。
