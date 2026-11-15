# #355 束4 独立の突合 2巡目の所見の直し(2026-11-15)

指示: `b4-fix-round2-ruling.md`。所見: `b4-review-round2.md`。template のコミット 26999ff(ブランチ b6-355-b4、先頭は e934457 の次)。bundle: `E:/Github/process-compass/tmp/bundles/template-b6-355-b4-03.bundle`(origin/main..b6-355-b4)。push なし。

## 所見ごとの直し

| 所見 | 直した内容 | 所在 |
| --- | --- | --- |
| R2-01 高 | `notObserved` を `candidateNumbers` のうち `prFetchError` に在る番号だけにした。表示を「件名の番号で PR の記録を取得できず、観測に入らなかったもの N 件(#…。PR でない番号を件名に持つコミットを含みうる)。この2つの観測の母数は…。件名に番号の無いコミットは、PR を経ていないコミットの節に出る」へ。通しに #8(記録だけの PR)と #9(gh は記録を返すが範囲に無い PR を取り消す直接のコミット `Revert "… (#9)"`)を足し、品質レポート・evidence.json・外へ渡す開示に出ないことを固定 | `aggregate-evidence.mjs`(sizeObservation の直前)、`size-observation.mjs` 末尾の行、`test-approval-pace.mjs` |
| R2-02 中 | IMPL-0159 の note を「件名から番号を読めた PR のうち記録を取得できなかったものは番号で開示」「件名に番号の無い PR は件数に出ず、PR を経ていないコミットの節に出る」へ。EV-0271 本文に同じ趣旨を追記 | `human-ai-boundary.md` |
| R2-03 中 | 判定は変えず。表示(品質レポートの行・`size-observation.mjs` の注記)を、実際に除くもの(強制層のスクリプト・ワークフロー・設定ファイル・ロックファイル)の列挙へ改め、「担い手への指示の文書(CLAUDE.md など)・PROCESS-PROFILE.md は標準の定義により文書に数える」と記載。IMPL-0136 の note にも同旨と「当否は #355 へ残した」。試験の期待の文言も更新 | `size-observation.mjs`、`gate-criteria.md`(IMPL-0136 の note)、`test-approval-pace.mjs` |
| R2-04 低 | `isProseDocument` が `.github/PULL_REQUEST_TEMPLATE.md`・`.claude/skills/pit/SKILL.md`・`scripts/gate/README.md` を偽にする試験を足した | `test-check-pr.mjs` |
| R2-05 低 | 通しに記録だけの PR #8 を足し、「読めなかった」に出ないことを固定 | `test-approval-pace.mjs` |
| R2-06 低 | 表示の括弧と IMPL-0136 の note を「文書の置き場の文書・データの拡張子のファイルと直下の *.md。記録だけの PR は数えない」へ | 上と同じ |
| R2-07 低 | 「この節の母数」を「この2つの観測の母数」へ。ADR-0137 の IMPL-0268 の行の括弧を「一発承認率と AI 生成行の短期書き換え率の期間の集計」へ | `size-observation.mjs`、`adr/0137-…md`(その1語だけ) |

台帳 `implementation-ledger.md` は `impl:write` で再生成(IMPL-0136・0159 の note の差分)。`evidence-ledger.md` は変更なし。

## 必須の確認(WSL・node 26。写しで実施。結果)

- 破壊 A(`prFetchError` での絞り込みを外し、`prs`+`recordPrs` に無い番号を出す旧形): test-approval-pace が 2 件落ちた(#7 の表示、#8・#9 が出ない場面)。
- 破壊 B(旧形から `recordPrs` を外す。R2-05 の M7 に当たる): 同じく 2 件落ちた。
- 破壊 M4(`isProseDocument` の `!f.includes('/')` を外す): test-check-pr が 1 件落ちた(強制層の置き場の *.md の場面)。
- 戻した後に再実行はせず、写しは破壊のたびに元ファイルの cp で戻した。写しは削除済み。

## 流した試験(戻し後・コミット内容)

test-assurance-period 37 / test-approval-pace 15 / test-size-observation 19 / test-check-pr 249 / test-aggregate-records 135 / test-direct-commit-rules 11。すべて全通過、失敗 0。既存の期待値は緩めていない(表示の文言を変えたものだけ、新しい文言に合わせた)。個人を特定する値は観測の出力に出していない(場面は #8・#9 の番号だけ)。

## 標準側の検査

`impl:write`・`evidence:write`(260 件)・lint:impl・lint:evidence・lint:scope・lint:refs はいずれも終了コード 0。textlint(変更した 3 ファイル)は 0。junction は作って外した(`rmdir`。b3 の node_modules は無事)。なお junction の無い間は編集の hook の textlint が「No rules found」で失敗した(環境の問題)。

## 指示と違えた点

1. R2-01 で、Issue の番号は出さない旨の指示だったが、**Issue の番号は gh の失敗と区別できない**(所見の案と同じ)ため、出る場合がある。表示に「PR でない番号を件名に持つコミットを含みうる」と明記して開示した。Issue 番号の場面は試験に足していない(出ないことを固定すると偽になる)。
2. `seenPrNumbers`(`prs`+`recordPrs` の集合)を削除した。`prFetchError` に在る番号は `prs`・`recordPrs` に入らないため、絞り込みの後は到達しない条件になり、試験でも落とせない。このため R2-05 の M7 の破壊は、そのままの形では再現できず、同等の「旧形」(破壊 B)で確かめた。
3. R2-03 の「節に書く」は、節の本文には書いていない(第4章の「文書だけの変更」の定義の文を直さない制約のため)。表示・IMPL-0136 の note・コードの注記に書いた。#355 へのコメントは、指示どおり書いていない(議長が残す)。

## 確かめていないこと

回帰の全量、`npm run check` 全体、実機の GitHub での gh の失敗の形(Issue の番号に対する応答が失敗として観測されること)、Windows での通しの試験(SKIP のため。WSL で確認)。
