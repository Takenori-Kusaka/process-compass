# 束 B20 段 F4(独立の突合 2巡目の所見 R2-01〜R2-07 の直し)

裁定: `b20-round2-ruling.md`。所見の原文: `b20-review-round2.md`。新しい EV・IMPL・ADR の番号は使っていない。

## 直しと対の試験

| 所見 | 直し | 対の試験と、直す前に落ちたことの確認 |
| --- | --- | --- |
| R2-01 | `src/data/impl-untraced.yaml` へ `scripts/gate/e2e-fixture.mjs` を `reason: infra` で登録 | 直す前: `npm run lint:impl` が exit 1(「逆向きの追跡…e2e-fixture.mjs」)。直した後: exit 0 |
| R2-02 | `aggregate-evidence.mjs` の `instructorIdsOfTarget` の `commits.find` を `trailers.find` へ | `test-aggregate-wiring.mjs` に IMPL-1008 の 2 場面(作者本人の延長は欠落/別人の延長は欠落にならない)。直す前: `WIRING_ONLY=1008 node scripts/gate/test-aggregate-wiring.mjs` が NG 2 件(「指示者と照合できない延長 1 件」が出て、本人の延長も別人の延長も unverified)。直した後: 全 2 件通過 |
| R2-03 | `cl-judgment.mjs` に `f2Q1OfParsed(p)`(食い違いは null)を足し、`readF2Q1Text`・`check-safety-record.mjs`・`clJudgmentState` の 3 か所が使う | `test-safety-record.mjs`(行が「いいえ」「はい」の食い違いなら適用として扱う)と `test-cl-judgment.mjs`(食い違いで f2q1 が null、同じ値の 2 行は false)。直す前: 両方 NG 1 件。直した後: 77 件・134 件一致 |
| R2-04 | 下記 | 下記 |
| R2-05 | 下記の一覧 | 下記の一覧 |
| R2-06 | ADR-0218 の description・決定2・影響、`tailoring-guide.md` の IMPL-0738 の note を「G-3 は導き直すので開示から消せない。G-6 の未達の手書きの消去は集約では防がず契約検査が落とす」へ | 文言のみ。`lint:impl`・`lint:provisions` 通過。台帳を `impl:write` で再生成 |
| R2-07 | `test-aggregate-records.mjs` 752 行の注釈を「人の確認の未達を集約の欠落に数える。G-3 は開示だけ」へ | 注釈のみ |
| 足場の除外の文言 | `research/444-verification/chair-ruling-0506.md` へ追記(実装の形「未追跡で大きさ 0 の通常ファイルか文字特殊ファイル」を正とする。git は空のディレクトリを数えない) | 文言のみ |

## R2-04 の分岐

先に確かめた結果、様式 D-0(`templates/00-d0-governance.md` 597 行)は「はい / いいえ で始める。Q1 の答えと理由」と書き、既存の試験(`いいえ。人はいない`・`いいえ(制御を持たない)`)と試験の足場(`Q1_NO = 'いいえ。人身への危害は生じない'`)も「いいえ」の後の記入を認めている。よって完全一致の案は採れず、裁定の第2の分岐を採った。

- 認めている形(「いいえ」の直後が終わり・空白・句読点・括弧・コロンで、列挙した語を含まない)だけを「いいえ」と読む。これは現行の実装のままで、コードは変えていない
- 語の列挙は足さない(裁定どおり)。IMPL-0919 の note(`safety-verification.md`)に、列挙の外の留保(未確定・暫定・要確認など)を付けた「いいえ」は機械では落ちないことと、「確かめる者: 判定者と確認者(判定の記録を書くとき)」を開示した。併せて、IMPL-1007 の検査と判定の状態も同じ読みで、F.2 の行が食い違うときは適用として扱うことを note に足した(R2-03)

## R2-05 の変異の一覧

変異は、`template/` を一時の写し(スクラッチの `mut/`)へ複製し、写しの側だけに入れた。実装のファイルは壊していない。実行は `scratchpad/mutate.mjs`(`MID=m07 node mutate.mjs` の形)。

| 番号 | 壊した箇所 | 足した試験 | 結果 |
| --- | --- | --- | --- |
| m01 | `derivedUnmet(config)` を `config.unmet` へ戻す | wiring 0738: 手書き `unmet: []` でも `evidence.unmet` に g3 が残り、「未達のゲート」の表の行 `\| G-3 …` が出る | 落ちた |
| m03 | 併記の記録の `inRange` を常に真 | wiring 0638: 併記のない G-3 が範囲の外(`--from mid`)なら出荷を止めない | 落ちた |
| m04 | `copyJudgementsInRange` から `judgeOk` の絞りを外す | wiring 0523: 席の責任者本人の G-3 は範囲の判定に 1 件数え、名簿の別の人の G-3 は 0 件・`g24.notJudge` に出る | 落ちた |
| m06 | 延長の本人の照合(`verdict === 'self'`)を消す | wiring 1008(R2-02 の場面): 作者本人の延長は欠落 | 落ちた |
| m07 | 指標の `inRange` を渡さない | wiring 0612(新): 印のある 3 行のうち範囲に対応づくのは 1 行と出る | 落ちた |
| m11 | 開始の `assets === 'dirty'` を引き継がない | `test-agent-run-record.mjs`: 開始が dirty の実行は、変更をコミットに含めても `assets=dirty` を引き継ぐ | 落ちた |

## 完了の条件

`lint:impl`・`lint:evidence`・`lint:refs`・`lint:provisions` は exit 0。`test-aggregate-wiring`(61 件)・`test-delegation-wiring`(27 件)・`test-aggregate-records`(214 件)・`test-safety-record`(77 件)・`test-cl-judgment`(134 件)・`test-agent-run-record`(26 件)が通過。回帰の全量と `npm run check` は流していない。

## 残った点

- 開示で閉じる点(裁定どおり): macOS・ネイティブの Linux・ネイティブの Windows での隔離とトレーラ、GitHub の実機での `refs/pull/N/head` の取得とスタック型 PR。根拠水準マークと Issue を閉じるコメントでの開示は、この段では行っていない
- 文字特殊ファイルの分岐は Windows では再現できない(WSL2 の記録のみ)
- Windows の bash では、コマンドの中の `\\n` が半分に潰れる。試験の追記は Edit で行った
