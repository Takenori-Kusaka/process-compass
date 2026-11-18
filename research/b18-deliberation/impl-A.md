# 束 B18 (a) 第1群 実装 A(単位0〜3)の記録

作成 2026-11-18。入力は `ruling-a1.md` の §2・§3・§4・§7。`gate-g5.yml` は触っていない。template は push していない(ブランチ `b18-328` に積んだ)。

## コミット

| 単位 | 本体 | template | bundle |
| --- | --- | --- | --- |
| 0 ADR-0200 | 4fc24db7 | なし | なし |
| 1 0972・0767 | 9debffaf | 05a5311 | `tmp/bundles/template-b18-a-1.bundle` |
| 2 0567・0610 | e2362449 | 1130028 | `tmp/bundles/template-b18-a-2.bundle` |
| 3 0211 | 393c643c | f091643 | `tmp/bundles/template-b18-a-3.bundle` |

bundle の置き場は `E:/Github/process-compass/tmp/bundles/`。範囲は `origin/main..b18-328`。

## 単位ごとの変更

### 単位0 ADR-0200

- `src/content/docs/adr/0200-b18-first-group-adopter-record-conventions.md` を §2.6 の 5 点で起草した。根拠水準マーク EV-0322(E0)を足し、`npm run evidence:write` で台帳を再生成した
- 検査: `lint:evidence`・`lint:text` が通った

### 単位1 IMPL-0972・IMPL-0767(`check-pr.mjs`)

- 0972: `decisionG3Reach` を新設し、`analyzePr` の判断記録の要否の節の末尾で呼ぶ。トレーラ ADR が指す判断記録ごとに、(i) 基底の `docs/gates/*.md` の G-3 通過の記録、(ii) 判断記録を入れた PR(基底に在れば最後に変えた PR、この PR で足したなら `pr.reviews`)の名簿の人・AI の名義でない者の承認、のどちらかを求める。S0 は注意。state=delivered check=machine
- 0767: `reductionRejudgeProblems` を新設し、`analyzePr` の節 7c で呼ぶ。基底の D-0 節16 の「区分の引き下げの根拠」が引く F-NNN の受入基準の節が基底と先頭で一致せず、先頭の「判定日」が基底より後でないとき失敗。降ろし先を `process-change-skill` から `pr-checks` に改めた(マーク側の target。`impl-targets.yaml` は変更なし)。state=delivered check=machine
- 試験: `test-check-pr.mjs` に `IMPL-0972:ng`(3 場面)・`:ok`(2 場面)と S0 の場面、`IMPL-0767:ng`(1)・`:ok`(3)を足した。既存の `IMPL-0384:ok` の場面は、判断記録を入れた PR に名簿の人の承認(`reviews`)を足して期待を保った(0972 が到達を求めるため。fixture が過去の決定を固定していた例)

### 単位2 IMPL-0567・IMPL-0610(`check-pr.mjs`)

- `exceptionFor` に印の読み(内容の先頭 `ファストトラック(短縮: <ゲート>)`、NFKC)を足した。括弧の中が G-4・G-5・認証・認可・データ保全を名指す行を拒む(0567)。印の行で、基底の台帳に印を持ち ID が異なり `isClosedState` が偽の行があれば拒む(0610 制約1)。区分・欄は足していない
- 例外承認が対応づいたときの注意に「印の無い行は見分けられない(ADR-0200)」を足した(§2.5 の開示)
- 様式 `templates/03-debt-ledger.md` のファストトラックの節と `.claude/skills/gate/reference/exception-paths.md` に印の書き方を足した
- 0610 は 1 つのマークのまま state=delivered check=machine とし、制約3 は機械で閉じない旨と確かめる者を note に書いた
- 試験: `IMPL-0567:ng`(2)・`:ok`(2)、`IMPL-0610:ng`(1)・`:ok`(1)

### 単位3 IMPL-0211(`roster-ids.mjs`・`check-pr.mjs`)

- `roster-ids.mjs` に `parseCodeowners`・`codeownersMatch`(gitignore 書式の部分集合)・`codeownersProblems` を新設。`analyzePr` の節 7d で、構成が設定済みのとき基底の `.github/CODEOWNERS` と変更ファイルを照合し、(i) `@OWNER`、(ii) チームだけの行、(iii) 名簿に無い個人、(iv) 型に当たらない変更、(v) ファイルが無い、を失敗にする
- 個人の照合は `findPersonByAccount`(ログイン名)。CODEOWNERS に数値の識別子が無いため
- template の CODEOWNERS の冒頭に、検査の注記と「`@OWNER` のままの PR は落ちる」を書いた
- 試験: `test-check-pr.mjs` に `IMPL-0211:ng`(4)・`:ok`(1)。fixture の基底に `.github/CODEOWNERS`(`* @yamada`)を足した。型の読みの単体は `test-roster-ids.mjs` に 8 件

## IMPL の state

| IMPL | state | check | target |
| --- | --- | --- | --- |
| 0972 | delivered | machine | pr-checks |
| 0767 | delivered | machine | pr-checks(process-change-skill から改め) |
| 0567 | delivered | machine | pr-checks |
| 0610 | delivered | machine | pr-checks |
| 0211 | delivered | machine | pr-checks(マークの target を pre-review-automation から改め) |

0211 の target は、ruling の「置き場: check-pr.mjs」に合わせた。`pre-review-automation` は種別が planned のままで、delivered のマークの降ろし先として実体が無い。

## 流した試験と結果

- `test-check-pr.mjs`: 単位1 後 228 場面、単位2 後 234 場面、単位3 後 239 場面、すべて一致(終了 0)
- `test-roster-ids.mjs`: 60 件一致
- `check-pr` を呼ぶ他の試験(単位3 の後): `test-control-approval`(48/48)・`test-material-records-more`(51)・`test-init-g5`・`test-base-judge-workflow`(127/127)・`test-material-attribution`(58)、すべて終了 0
- 本体: `lint:impl`・`lint:evidence`・`lint:refs`・`lint:text`・`test:fields` が通った。`npm run check` の全量は流していない(push の前に 1 回の方針)。回帰の全量(template の全試験)も流していない

## できなかった点・裁定と実物の食い違い

1. **0972 の記録の置き場**: 裁定は基底の `docs/gates/*.md` を読む。一方 `templates/04-gate-record.md` は G-3 の判定記録を records ブランチの `records/gates/` に置くと書く(`docs/gates/` には出荷の PR が複製する)。裁定どおり `docs/gates/` だけを読み、records ブランチは読まない。G-3 の記録が records ブランチにしか無い案件は、判断記録を入れた PR の承認((ii))で通す形になる。マークの note に書いた。独立の突合で見てほしい
2. **0972 の (ii) の「PR の作成者でない」**: 承認者が PR の作成者本人でないことは見ていない(裁定の条件に無いため)。`introducedBacking` は記名者の席を前提にし、ここでは使えなかったため、名簿の人・AI の名義でない・専用の名義でないことを自前の関数で見る
3. **0211 の「`roster-ids.mjs` で確かめ」**: `roster-ids.mjs` には名簿の照合の関数が無く(提案の生成だけ)、`config.mjs` の `findPersonByAccount` を使った。関数の置き場は裁定どおり `roster-ids.mjs`
4. **0211 の移行の注意**: 準拠テンプレートに CHANGELOG が無いため、CHANGELOG へは書けなかった。CODEOWNERS の冒頭の注記に書いた。移行の注意の置き場は後の束で決める必要がある
5. **0211 の影響**: 基底に CODEOWNERS が無い構成も失敗にした(裁定の (iii) の延長)。採用者の既存のリポジトリで CODEOWNERS を置いていないものが落ちる。この読みの当否を独立の突合で見てほしい
6. **0567 の読み**: 括弧の中の G-4・G-5 は「先頭」に限らず語として含めば拒む(`短縮: G-6, G-5` も拒む)。裁定の「先頭が G-4 または G-5」より広い。認証・認可・データ保全の語は括弧の中だけを見る
7. **0610 の読み**: 台帳の印の行のうち、失効の行も閉じた値でないため「未回収」に数える(`isClosedState` が偽の行すべて)。裁定の文字どおり
8. 様式 03 の標準側(第6章)には足していない。裁定は template の様式 03 の 1 行だけを指す
9. 作業用の一時ファイルは `tmp/work/` に置いた(.gitignore の対象)
