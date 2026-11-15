# #326 独立の突合(2巡目)の所見への直し(2026-11-16)

対象: `09-reconciliation-2.md` の S-1・S-2。議長の裁定は S-1 を直し、S-2 を開示で閉じる。これが最後の巡であり、この直しに独立の突合は掛けない。template と pit-crew は変えていない。

| # | 結果 | 所在 | 確かめた結果 |
| --- | --- | --- | --- |
| S-1 中 | 直した | `scripts/test-claim-terms.mjs`、`scripts/test-adr-links.mjs`(検査本体を一時の木へ写して子の工程で起動する試験を、各1件足した) | 下記の突然変異で確認した |
| S-2 低 | 開示で閉じた(直さない) | `scripts/check-claim-terms.mjs` ヘッダの「検査しないこと」 | 同じ節に同じ見出しの表が複数あるときは最初の表だけを読む、と書いた |

## 試験の形

検査のスクリプトに環境変数の差し替えを足さず、検査・lib・必要な文書を一時の木へ写して、写しを改変して起動する。
- claim-terms: H.8「使ってよい表現」の表の本文行から1語を消し、exit 1 と「H.8 … 語」の所見の文を照合する
- adr-links: 後継の側に旧番号が無い対(9998 → 9999)を足し、exit 1 と所見の文を照合する

## 確かめた結果

| 変異(検査本体の一時的な無効化) | 試験 | 戻した後 |
| --- | --- | --- |
| `check-claim-terms.mjs` の `if (t1 && t2) problems.push(...)` をコメントにした | test-claim-terms が exit 1 で落ちた | exit 0(8件通過) |
| `check-adr-links.mjs` の `forwardProblems(adrs)` を空の配列に替えた | test-adr-links が exit 1 で落ちた | exit 0(8件通過) |

戻した後、`git diff` で検査のスクリプトに残る差分は S-2 のヘッダ2行だけ(変異の印は 0 件)。lint:refs の各検査(check-section-refs ほか)は exit 0。両試験は `package.json` の `lint:refs`(`check` に含む)に結線済みで、`check-ci-wiring` は通る。

## 採らなかった案

- S-1(b): `CLAIM_TERMS_DOCS` などの環境変数による文書の所在の差し替え。写しを作る形のほうが、検査の既定の挙動に触れない
- S-2: 一致する見出しが2つ以上あれば落とす機械の検査。今の本文では起きず、意図的な編集が要るため、開示で閉じた

## 流した検査

test-claim-terms、test-adr-links、check-claim-terms、check-adr-links、check-section-refs、check-ci-wiring。回帰の全量と `npm run check` の全体は流していない。
