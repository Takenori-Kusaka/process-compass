# #355 束4 template 側の実装の記録(2026-11-15)

template: ブランチ b6-355-b4(1e12ad2 から)、コミット 5378c16、bundle `E:/Github/process-compass/tmp/bundles/template-b6-355-b4-01.bundle`。push していない。

## 先の突合(7章)
- `reviewMinutes`(IMPL-0100)を使う試験は `test-size-observation.mjs` だけで、入力は手書きの数値(`reviewMinutes: 30`)。`approvalMinutes` を gh の偽の応答で通す試験・fixture は 0 件。
- src/content/docs/adr/ の ADR-0047・0058・0072 は「判定完了時間を出す」とだけ述べ、AI 名義の承認を数える挙動を固定する文は無い。
- 結論: 固定されていない。人の承認だけへ直した。議長へ返す事項なし。

## 変えたファイル(template)
- `aggregate-evidence.mjs`: `approvalMinutes(d, humanLogins)`。G-6 の `humanApprovers`(isAiLogin で AI 名義を除いたもの)に居る者の承認だけを数える(定義は二重にしない)。PR の記録に `docOnly`(全パスが `isExcludedFromSize` に当たる)を足した。
- `size-observation.mjs`: `approvalPace`(区間ごとの件数・最小・下位四分位・中央値の 100 行あたりの分、unmeasured、noDenominator、points)と `docOnly`(件数・24/48/96/96超の時間の区間・unmeasured)と、指示書どおりの2つの見出しの表示。
- 新規 `test-assurance-period.mjs`(32 件)、新規 `test-approval-pace.mjs`(9 件・Linux だけ)、`test-size-observation.mjs`(9 → 17 件)。
- `gate-g5.yml`: 新しい2試験を結線。`assurance-period.yml` の冒頭に、試験の範囲と実機の未確認・未検出を書き足した。`task-size.md` に変えた挙動を合わせた。

## 試験の件数(node 26.13.1、WSL)
- 期間: IMPL-0048:ng 7(記録なし3・差し戻し・別の期間・「と」の対象・名簿外の判定者)、:ok 3。period-needed 8、workflow 14。
- 比: IMPL-0159:ok 3・:ng 2、IMPL-0136:ok 2・:ng 1。通しは偽の gh で集約を実際に動かし、evidence.json の `assurance.sizeObservation` と品質レポートと外へ渡す開示を読む。
- 回帰(関係分のみ、全て通過): test-aggregate-records 135、test-direct-commit-rules 11、test-spec-recheck 103、test-aggregate-drift 25、test-g5-missing、test-check-pr 214、test-adoption 69、test-push-trigger 27、test-ship-evidence-steps。

## 破壊の結果(写しで1点ずつ壊し、該当の試験が落ちた)
M1 期間の記録なしの欠落を消す → 5 件落ち / M2 差し戻しの欠落を消す → 1 件 / M3 `if:` を外す → 1 件 / M3b 集約に `|| true` → 1 件 / M4 人の承認だけの絞り込みを外す → 4 件 / M5 比の出力を消す → 6 件 / M6・M7 points に login を足す → 各 2 件 / M8 docOnly を常に false → 1 件 / M9 区間をまとめる → 2 件。すべて落ちた。

## 指示書と違えた点
1. 適合側の欠落の差が 1 になる条件: 記録の「品質保証の対象外として出荷することの受容」に記名(名簿 戊)が要った。「該当なし」だと別の欠落が 1 件足され、差が 0 になる。適合側の記録に記名を入れて差を 1 にした(期間と無関係の欠落を数えない形ではなく、差を作る形)。
2. 適合側の終了コードの対は作れなかった(足場に D-0 などが無く、欠落が 18 件残る)。指示書の許す退路どおり、件数の差で確かめた。
3. `unmeasured` には、承認の時間が取れない場合に加え、規模を読めない PR(size が null)も入れた。指示書は「人の承認なし・記録なし」としか書いていない。
4. 観測の表示に「前回」の語を入れなかった。既存の IMPL-0270:ng が出力中の「前回」を禁じているため(試験を緩めずに文言で避けた)。
5. 見出しは指示書どおり。ただし表示の本文で「ある PR を 100 行あたりに換算した値」を使い、下位四分位は昇順の floor((n-1)×0.25) 番目(既存の中央値と同じ流儀)とした。指示書に求め方の指定は無い。

## 確かめていないこと
- `check-impl.mjs` が `check=manual` のマークの目印(`IMPL-0159:ng/:ok`)をどう扱うかは見ていない(本体側の担当)。試験の目印は通しの場面に付けたが、台帳への影響は未確認。
- 偽の gh の通しは Linux だけ。Windows では SKIP(CI の Linux で動く想定)。実機の GitHub の gh の `reviews[].author.is_bot` の値・`createdAt` の実際の値は確かめていない。
- 承認の「最後の提出」は gh pr view の `reviews`(写しでなく API)から取る。写しだけで対応づけた PR では reviewMinutes は null のまま(従来どおり)。
- 作成から最後の人の承認の起点が Ready 化でなく作成であることは、EV-NEW3 の開示に委ねる(本体側)。
- cron・手動の起動・GITHUB_TOKEN の権限は実機で未確認(試験は集約の論理と手順の結線まで)。
- tailoring-kb.json は触っていない。README・docs に変えた挙動の記述は task-size.md の1行のみ見つけた。
