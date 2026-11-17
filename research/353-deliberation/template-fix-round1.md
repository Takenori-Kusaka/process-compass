# #353 template の7項目 独立の突合 1巡目の所見の直し(2026-11-17)

裁定は `template-fix-round1-ruling.md`、所見は `template-review-round1.md`。直しの担当による。

| 所見 | 結果 | 所在 |
| --- | --- | --- |
| H-1(高) | 直した。名指された行は、対象が元の行と一致し、元の行より後に足され(識別の番号が大きい、または始点の台帳に無い)、有効で期限内のときだけ承認し直しに数える。新しい行と判定した行は元の行として外さない。テンプレ3 の欄は足していない | `exception-expiry.mjs` の `reapproverOf`・`reapprovedIds`。試験: 相互の名指し・付け足しの名指し・元の行より前の行・連鎖・旧い様式、集約の通し |
| M-1 | 直した。閉じた値は「返却済み」で始まる値と「取り下げ」だけ。他は未回収として数え、期限で比べ、閉じた値でない旨を欠落の文に出す | `isClosedState`・`isUnclosedState`・`lapsedGapText` |
| M-2 | 直した。期限の比較に使う行(欠落・対応づけ・ゲートの判定の行)を、範囲の終点のコミットの台帳で読む。`--to` を HEAD より前にした通しを足した | `aggregate-evidence.mjs` の `exceptionRows`・`exceptionStartIds` |
| M-3 | 直した。`ship-evidence.yml` の2か所と `G-7.md` で `--exception-day` に判定の日を渡す。出力(`claim.exceptions.daySource`・品質レポート)に突合の日の出どころを記録する。ci-gates.md の条件2 の表は戻し、条件の表の外の箇条を実装の事実として1つにした。実装の記録の「本文を変えていない」を実態へ直した | ci-gates.md・`template-implementation.md` |
| M-4 | 直した。gate-g5.yml を LF に戻し、足した2行だけの差分にした | `.github/workflows/gate-g5.yml` |
| M-5 | 開示した。品質レポートの句と IMPL-0573 の note に「対応づく経路の件数は試験で確かめていない」と添えた。CI の Linux の場面は #353 へのコメントで残す(下記) | `aggregate-evidence.mjs`・overview.md |
| L-1 | 直した。CLAUDE.md の生成区間に、数えた日と技術負債台帳の所在を足した | `generate-profile.mjs` |
| L-2 | 直した。読めない `--today` は注記で知らせる。時計の既定を使ったときは出どころに「実行の時計」と出す | `next.mjs`・`daySource` |
| L-3 | 直した。返却の目安に日付が複数あるとき「まで」の直前の日付を期限とする(無ければ最初の日付) | `config.mjs` の `dueDayOf` |
| L-4 | 追認した。終点の台帳から消えた始点の行を未回収に数える・範囲で足して取り下げた行を範囲に数える・期限が読めない有効の行を `undatedDue` に分ける、の3点は、安全か開示の側の実装の読みとして議長が追認した。本文へは足さない | 本ファイル |
| L-5 | 直した。後者の行を「状態が有効の例外」とし、「未回収」が失効を含む旨を添えた | `aggregate-evidence.mjs` |

## 2巡目に見る点

H-1・M-1 は同じ関数の直し。連鎖(D-001 → D-002 → D-003)で、期限を過ぎた中間の行(D-002)を名指す最初の行(D-001)は、有効で期限内の行を名指していないため数える。これは安全の側の読み。

## CI の Linux の場面(#353 へのコメント案)

偽の gh を置き、台帳の行を入れた変更の帰属が名簿に対応づく1件の場面で、`withoutIndependentConfirmation` が 1 になることを確かめる試験を足す。Windows では偽の gh を置けないため、この直しでは足していない。
