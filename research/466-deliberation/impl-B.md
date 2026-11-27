# 段 B(template): 委任の経路を通れる形にする — 実装の結果

- 日付: 2026-11-28。template のブランチ `d4-466`(段 A の aaa320e の上)。本体・参照は触っていない。push していない
- prep の 01〜04 は `git apply` が通ったので取り込み、裁定に合わせて直した。条項(章・節)以外の ADR 番号・Issue 番号は、足した文・試験の名に入れていない

## 決定ごと(変えた所・prep から変えた所)

- **D3・D7(止めずに全件を事後に確かめる/翌月末で止める)** `autonomy.mjs` の `autonomyState`。`records.postHoc` が読めたときだけ、判定不能(窓の全変更または手戻り率の母数が 30 未満)で止めず、その月の定めを全件にする。渡されない入力は従来どおり止める。`POST_HOC_GRACE_MONTHS` は外し、月 m の 2 か月後の月初(翌月末の次)から止める。通常の月にも当て、種類ごと(`Delegated:` の規則 ID → `delegation.rules[].changeType`)に数える。読めない(浅い取得・席の責任者が名簿に無い)ときは新しい停止で止める(Q1)。1〜2 名は席の責任者本人の記録も数える
- **共通のモジュール(Q2 (i))** 新 `post-hoc-confirmation.mjs`: `samplingMonthly`・`samplingMonthlyText`(`aggregate-evidence.mjs` から移し、同名で再 export)・`requiredCount`・`derivePostHoc`(純粋)・`readPostHocRecords`(git)。`readAutonomyRecords` が `postHoc` を常に渡す。`readRejectionRecords` は G-6 の様式の本文 `g6Forms` を返す。集約は種類ごとに数え、`fullMonths` を委任の判定から受ける
- **D4(変更単位の手戻り)** `reworkTargetsOf` は取り消し(`This reverts commit`)だけ。`Fixes:` は外した(Q6)。`reworkCount`・`readReworkRecords` は prep のまま。試験で `Fixes:` を印に数えないことを固定
- **D6(0% の母数)** `count` に `judged`(窓の中の、承認・差し戻し・事後の確認の記録のいずれかがある変更)。`judged` が 30 未満の窓の 0% は新状態「検知は働いていない」で、止めず、全件の確認へも倒さない。判定不能(全変更 30 未満)は従来どおり全件の確認へ。承認の記録を読めないとき(`judged = null`)は全変更で数え、止める側へ倒す
- **D8(同時保有)** `review-queue.mjs`: 有効なときだけ該当の PR を同時保有数から除く。**催促(0681・0979)からは除かない**(Q4: 失敗した PR が別の所で見えることを確かめていないため)。prep から変更。yml に `statuses: read` を足した
- **D5(`/process-init`)** 手順 6b。prep の文から番号を外し、通常の月の定め・低量の種類の窓の手引きを足した。README・`mode.md`(演習を取り消しの実績に数える読み)・`settings.md`(窓を長くする手引き)
- 表示: 「記録の件数が揃っている」(確認が行われたとは書かない)

## 足した出力の文(全文)

- 停止の種類の名: 「適用の条件の欠落(事後の確認の記録の件数が翌月末までに定めに満たない)」
- 停止の理由: 「事後の確認の記録の件数が、翌月の末までに定めに満たなかった: <月>(事後へ移した変更 n 件・記録 k 件・定め r 件[。判定の材料が揃っていない月のため全件]) … 。記録の件数が揃うと、判定を待たずに戻る(確認の中身は機械で確かめていない)」
- 読めない: 「事後の確認の記録を読めない(<理由>)。事後の確認の記録の件数を確かめられないため、判定できないものとして止める」
- 0%: 「0% の継続の検知は働いていない(G-6 を判定した変更が N 件で、最小標本数 30 件に満たない。止めず、全件の確認へも倒さない。働かせるには観測の窓を長くする)」
- 表示(集約): 「事後の確認の記録の件数が定めに満たない月: … 。翌月の末までに埋まらない月がある種類は、委任の判定が止める」/「…満たない月はありません(記録の件数が揃っていることを示すだけで、確認が行われたことは示さない)」

## 試験(どの決定の置き換えか)

- 直した既存の期待: `test-check-delegation.mjs` の手戻り率(実 git)の母数 n=2→3(手戻り率の母数をタスクだけから変更も足す形へ。ADR-0129 決定3 の置き換え)。表示の語を変えたが `test-aggregate-records.mjs` の既存の期待は落ちなかった
- 足した: 判定不能で止めない/渡さないと止める/読めないと止める/翌月末までは止めない/翌月末で止める/足りたら戻る/標本が足りる窓は全件にしない/通常の月の定め・3 か月続けて健全・低量の種類/0% の検知が働いていない・承認を読めないと止める・判定が届くと止める/1〜2 名・別の人の記録・規則から引けない変更・席が引けない/`Fixes:` を数えない/種類ごとの全件/同時保有(除く・催促は除かない・該当でないものは数える)
- 流した(全件通過。全量は流していない): test-check-delegation 83 場面・test-review-queue 61・test-aggregate-records 225・test-delegation-wiring 27・test-record-independence 9・test-assurance-period 31・test-direct-commit-rules 11・test-aggregate-drift 46・test-aggregate-wiring 65。Windows の node 26。WSL は使っていない

## 議長が決める点

1. **段 A の独立性の条件を、委任の事後の確認の記録に当てなかった**。(a) 「出荷判定より前」は、事後の確認が取り込みの後に行われる定義と衝突する(G-7 の後の確認を数えないと、通常運用で止まる)。(b) 「足し手が判定者と対応づく」は、署名の無い体制・1〜2 名で自己申告が数えられず常に止まる。結果として、偽の記録(他人を判定者とした記録)で件数を満たせる。開示のみ(README・集約の表示に「記録を足した者が判定者本人かは確かめない」と書いた)。当てるなら、署名を要する構成に限る形が考えられる
2. **「G-6 を判定した変更」に承認レビューを宣言行の有無を問わず数えた**(既存の「承認された変更」と同じ。一発承認率と共通)。宣言行つきに絞るか
3. 事後へ移した変更を、集約は「g6PostHoc の PR」、判定は「トレーラ `Delegated:` を持つ変更」で数える。判定のほうが広い(独立した人が事前に承認した変更も含みうる)。止める側に倒れる
4. 罠C は同時保有数の除外までを実装し、催促の除外は退いた(Q4 の条件を実機で確かめるまで)

## 未確認の点(実機で確かめるもの)

- `delegation.yml` の権限・checkout(contents: read・fetch-depth 0)で、記録用ブランチの G-6 の様式を読めるか(`persist-credentials: false` で fetch が通るか)。読めなければ k が少なく数えられ、止める側に倒れる
- review-queue のワークフローの `statuses: read` で `commits/<sha>/statuses` を読めること(固定の応答でだけ確認)
- 実 GitHub での該当の PR の見え方・マージ失敗の PR の見え方
- 判定の `postHoc` の月の導出は、コミットの日付(`%cs`)の月で数える(集約はマージ時刻)。月境界でずれうる

## 段 C へ渡すこと(値の所在。触っていない)

- `MIN_SAMPLE`(`autonomy.mjs` 先頭付近の定数。`count`・`detectionIdle`・判定不能の判定・`reworkAt` が参照)
- `SAMPLING_DEFAULT_CAP = 5`(`post-hoc-confirmation.mjs`。`requiredCount`・`samplingMonthly`・表示文が参照。段 C で未定義を持たせるときはここ)
- `OBSERVATION_WINDOW_DEFAULT`(`config.mjs`)・`DEFAULT_LOAD_LIMIT`(`review-queue.mjs`)
- 基準値未設定の停止(`autonomy.mjs` の手戻り率の分岐 `基準値未設定`)は触っていない
- 事故の警告(第1区分 `autonomyState` の Sev1・Sev2)も触っていない。`autonomyState` の `postHoc` 出力(`months`・`fullMonths`)と `sampledPrs` は段 C の件数にも使える
- 段 C が `autonomy.mjs`・`post-hoc-confirmation.mjs` を直すとき、`test-check-delegation.mjs` の判定不能の節(「判定不能:」「通常の月:」「0% の検知:」)を値の入力で与える形にする

## template のコミット

- 3af737a feat(delegation): 判定不能の間も止めずに全件を事後に確かめ…(autonomy・共通モジュール・集約・試験)
- 8cfeab8 feat(review-queue): …同時保有数から除く
- 0cdfab3 docs(delegation): 委任の案と…(初期化の手順・README・変更の手引き)
- bundle: `tmp/466-tpl-B-3.bundle`(c8d4e27..d4-466。コミットごとの退避は 3 つ目だけ)
