# 束 D4 の再開: template の段 A〜D1 の戻しと、段 F1 を受けた裁定

- 日付: 2026-11-28。作業ツリーは d4r(前の作業ツリー d4 は 02:01 ごろ消えた)。本体のブランチ `Takenori-Kusaka/d4` の 11 コミットは、`origin/main`(40d9861b)の上へ載せ直した(番号の衝突は無い)
- template のブランチ `d4-466`(基点 c8d4e27)は push されておらず、作業ツリーごと失われた。戻した手順と、記録との照合の結果を残す

## 1. 戻したもの

| 段 | 材料 | 戻した先のコミット | 照合 |
| --- | --- | --- | --- |
| A・B・C | `tmp/466-recover/stageC-tree`(前の作業役の一時置き場の写し) | f5b895e(3 段を 1 コミットにまとめた。元の 7 コミットの境は戻せない) | 下の §2 |
| D1(fixture の直し) | `tmp/466-recover/scratch/trial-466/t`(段 F1 が段 D1 の先端 40bf76e を `git archive` で取り出したもの) | b959b7b | `test-roster-conditions` 77 件 |
| D1(本体) | 同上 | 5d17d2b | 下の §2 |

- `trial-466/t` と `stageC-tree` の差は、`impl-D1.md` §1・§4 が挙げるファイルだけだった(`autonomy.mjs`・`post-hoc-confirmation.mjs`・`detection-values.mjs`・`check-delegation.mjs`・`review-queue.mjs` ほか段 A〜C だけのファイルは一致)。写しは段 C の先端と同じだったと判断した
- 戻した木は `trial-466/t` と全ファイルで一致する(改行の違いを除く)。段 D1 は、手順のやり直しではなく取り出しの写しから戻した。`scratch/` の `block-core-approval.mjs` などの手順は使っていない

## 2. 記録との照合(Windows・node 26。関係の試験だけ)

| 試験 | 記録(impl-A〜D1) | 今回 |
| --- | --- | --- |
| test-record-independence | 9(PR の経路 2 件は Windows で読み飛ばし) | 9 |
| test-check-delegation | 83 場面 | 83 場面 |
| test-review-queue | 62 | 62(不具合の直しの後は 64) |
| test-aggregate-records | 226 | 226 |
| test-delegation-wiring | 27 | 27 |
| test-assurance-period | 31 | 31 |
| test-direct-commit-rules | 11 | 11 |
| test-aggregate-drift / wiring | 46 / 65 | 46 / 65 |
| test-next-records / flow-observation | 157 / 33 | 157 / 33 |
| test-check-pr | 372 ok・NG 0 | ok 372(338 場面と付随) |
| test-control-approval | 73 | 73 |
| test-roster-rules / roster-conditions | 232 / 77 | 232 / 77 |
| test-material-attribution / tailoring-declaration | 61 / 16 | 61 / 16 |

- 出力の文の照合: `impl-A.md`〜`impl-C.md` が全文で挙げる文(「…より後に足された G-6 の判定記録は、独立した人の確認に数えない」「適用の条件の欠落(事後の確認の記録の件数が翌月末までに定めに満たない)」「0% の継続の検知は働いていない」「定めていない値が…」「止めていない。この事故の後に…」「事故の警告は働いていない」)が写しにある。外したと記録にある名(`POST_HOC_GRACE_MONTHS`・`DEFAULT_LOAD_LIMIT`・`SAMPLING_DEFAULT_CAP`・`REVIEW_LOAD_LIMIT`・`autonomy.mjs` の `MIN_SAMPLE`)は無い。`stop('第1区分'` は 6 か所(理解保持者 5・`incident()` 1)で `impl-C.md` §5 と一致
- 食い違い: 見つからなかった。足した行に ADR 番号・Issue 番号・research への参照は無い

## 3. 段 F1 の結果を受けた裁定(議長。`ruling.md` §12 の続き)

1. **S1 の承認(方式 β)は残す。案 D へ退かない**。段 F1 は、検査の側(必須にする `gate-g5-base` が、コア機能に触れない PR で成功し、触れる PR で失敗し、パスが未宣言なら全 PR に承認を求める)を実機で確かめた。確かめられなかったのは、承認数 0 のルールセットをホスティングが受け付けるかと、実際に取り込める・取り込めないかである。原因は、試験用リポジトリの条件(private・無償のプラン)ではルールセットもブランチ保護も使えないことで、案の欠陥ではない。公開の試験用リポジトリは許されていない(指揮役の指示 2026-11-28)
   - 閉じ方: 実装マークは `state=undelivered` のまま表示し、確かめた範囲と確かめていない範囲を note に書く。本文は「準拠テンプレートはこう動く」と書かない
   - 採らない案: 案 D へ退く(検査の側は動いた。退く根拠が出ていない)/公開のリポジトリで確かめる(許しの条件の外)/確かめた範囲だけで delivered にする(表示と実態が食い違う)
2. **private・無償のプランでは、ルールセットに頼る強制がそもそも使えない**(S1 の承認数 0 も、ほかの構成の承認数 1 も同じ)。この束では template の文を変えない。既存の実環境の確認(`adoption-trial.mjs env-check`)が「ブランチ保護の適用」を未確認として出し続けるので、採用者には見える。範囲の外の発見として、報告に書く
3. **`risk-label` のジョブの 403**(段 F1 §4-1)は、まとまり 1 で直した(template 4224756)。一次判定のラベルはコミットのステータスを使わないので、その経路ではステータスを読まない形にした。権限(`statuses: read`)は足さない(最小の権限)。試験 2 件を足した(ステータスを呼ばずに整える・一次判定の経路はステータスを読まない指定で呼ぶ)。実機では確かめていない(試験用リポジトリは削除済み)
4. **gate-contract のジョブの `git merge` の失敗**(段 F1 §4-3)は、`impl-D1.md` §4 の `test-adoption` の WSL での停止(c8d4e27 の素の版でも同じ)と同じ形で、この束の変更に依らない環境の差と見る。この束では直さない。回帰の全量で、素の版との差が無いことを確かめる

## 4. 失わないための手当て

- template のコミットのたびに、bundle を作業ツリーの外(`E:/Github/process-compass/tmp/466-recover/bundles/`)へ退避している: `466-tpl-ABC-1`・`466-tpl-D1-1`・`466-tpl-D1-2`・`466-tpl-fix-1`(いずれも基点 c8d4e27)
- 本体は段ごとにコミットする
