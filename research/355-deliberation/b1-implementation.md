# #355 束1 実装の記録

- 日付: 2026-11-17。指示の正本は `b1-decision.md` の 4 章と、それを上書きする 7 章
- template: ブランチ `b8-355-b1`(`b6-355-b4` の 8839c80 から)。本体: ブランチ `Takenori-Kusaka/b8`。どちらも push していない

## コミット

| 場所 | コミット | 内容 |
| --- | --- | --- |
| template | 44a7be5 | 様式 `05-handover.md` へ「### 障害時の連絡先」(表と「エスカレーション順序」の行)を足す。0043 の検査より先の別コミット |
| template | 77a78af | `handover-items.mjs` 新設、集約の基準4、`check-decisions.mjs` の事業影響の5欄、試験2本、`gate-g5.yml` の結線、G-3・G-7・05 の補助ファイル、`02-adr.md` の手引き |
| template | fce6447 | 試験の目印を IMPL-0985 へ付け直す |
| 本体 | 237576e | template の参照、`template-fields.yaml` t5 の対(障害時の連絡先・エスカレーション順序)、`impl-untraced.yaml` |
| 本体 | f30aaa6 | `gate-criteria.md`(基準4 の記録・IMPL-0043/0042/0132 の改め・IMPL-0985/0986・EV-0282/0283)、`ci-gates.md`、ADR-0138、`impl-inventory.yaml` |
| 本体 | f2732c6 | 実装・根拠水準の台帳の再生成 |

bundle: `E:/Github/process-compass/tmp/bundles/template-b8-355-b1-01.bundle`(44a7be5)、`-02`(77a78af)、`-03`(fce6447)。

## 使った番号(仮。push の前に議長が付け直す)

- IMPL-0985(旧 NEW1。基準4 の未記入の検出、machine)、IMPL-0986(旧 NEW2。前の記録との一致、`undelivered check=manual plan=scheduled issue=355 review=2027-02`)
- EV-0282(旧 NEW1。基準4 の未記入の方式)、EV-0283(旧 NEW2。幅・「なし」の語形・初期の文との一致)。旧 NEW3(一致の所見)は、7 章で所見を実装しないため起こしていない
- ADR-0138(sidebar order 138)

## 7 章に従って行わなかったこと

- 「前の記録との一致」の所見の出力と、その試験
- G-3 の表の 4 行目(人の列)の直し(標準の表は「検査する」のまま)。template の `G-3.md` では、4 行目だけを「機械ではなく判定者が読んで確かめる(実装は無い)」と書いた(template 側は実態を書く文書であり、標準の表ではない)
- IMPL-0986 の note に、指示の文言(定義が標準に無く、全部を置き換える判断記録は正当に同じ影響を書くため、一致を失敗にする式を置けない)を入れた

## 実装で判断したこと

- `handoverItems(text, initialText)` は `{ items, compared }` を返す(指示の「3項目ごとの配列」を、`compared` を載せるため包んだ)
- 「—」「-」だけのセルと、値が空の箇条書き(「- 欄名:」だけ)は、未記入に数える(指示は空欄と `<…>` だけ。ダッシュは `check-decisions` の「空」の定義に揃えた)
- 「### 障害時の連絡先」を足した結果、節5 の障害対処の表が連絡先の節に入らないよう、直後に「### 事象と対処」を置いた
- 集約の品質レポートへ、引き継ぎ文書の 3 項目の行と、判断記録の事業影響の欄の行(欠落に数えない)を足した
- `test-decisions.mjs` の `adr()` は変えていない。既存の場面は `checkDecisions` だけを呼ぶため、事業影響の節を足さなくても通る。新しい場面は `impactSection()` を別に持つ(旧い様式を節なしで通す決定の有無は、独立の突合で ADR-0071 を確かめる)
- `ci-gates.md`: 「基準3・4・8」を「基準3・8」と「基準4 の完備」に分け、マークの範囲を「IMPL-0042、IMPL-0044〜0047」へ。「文書の有無だけ」の語は ledger の旧 note にだけ残っていた(台帳は再生成済み)

## 通した試験

- template(node 26.13): `test-handover-items.mjs`(22 件)、`test-decisions.mjs`(58 件)、`check-decisions.mjs`(0 件)、`test-aggregate-drift`・`test-aggregate-records`・`test-assurance-period`・`test-adoption`・`test-direct-commit-rules` は全件一致
- `test-g5-aggregate.mjs` は 4/23 が NG。Windows の CRLF による偽の FAIL(指示により判定に使わない)。`test-g5-missing.mjs` は出力に要約行が無く判定していない
- 本体: `template:kb`・`impl:write`・`evidence:write`・`scope:write`・`lint:refs`・`lint:impl`・`lint:evidence`・`lint:ci`・`lint:tone`・`lint:scope`・`lint:provisions`・`lint:dekimasu`・`lint:skills`・`test:fields`・`lint:text`(textlint)がすべて終了コード 0。`npm run check` の全量は流していない

## 壊して確かめた結果(複製で。(4) は 7 章で外れた)

| 壊し方 | 落ちた場面 |
| --- | --- |
| (1) 集約の `gaps.push` の行(`handoverGapText` を欠落へ入れる行)を消す | `test-handover-items.mjs` が 3 件 NG: 「白紙の様式のまま → 3項目の未記入の文が出る」「監視だけ記入 → 残り2項目の文が出る」「見出しを『4. モニタリング』へ改めた文書 → 置き場がありません」。`test-decisions.mjs` は影響を受けない(58 件一致) |
| (2) 初期セルの比較を外す(`handover-items.mjs` の `initial.has` と `check-decisions.mjs` の `isEmptyCell` の初期の文の比較) | `test-handover-items.mjs` が 4 件 NG(静的確認の白紙の様式 3 項目・監視だけ記入・集約の白紙・監視だけ記入)。`test-decisions.mjs` が 1 件 NG(「白紙の様式の写しは、事業影響の5欄すべてが空として落ちる」) |
| (3) 事業影響の節が無い記録を読み飛ばす(`fieldProblems` の節なしを空配列にする) | `test-decisions.mjs` が 1 件 NG(「事業影響の節が無い記録」)。`test-handover-items.mjs` は影響を受けない |

## 確かめていないこと・やり残し

- #355 へのコメント(規約の `presence` の定義の直しと 103 件の棚卸し、0042 の束2 への申し送り、一致を失敗にする案/所見にする案/課さない案を重の審議へ残したこと、IMPL-0986 の新設、template の push の注記)は投稿していない。議長が行う
- 独立の突合(4.3 の観点と ADR-0084 L177 との関係)は未実施
- `aggregate-evidence.mjs` L2403〜2559(例外の行の突合)を読んでいない。IMPL-0042 の note の「区分『例外』の行の PR・コミットとの突合だけ」は、2 委員の記述と決定の指示の文によるもので、実装は未確認
- IMPL-0043 の降ろし先 `gate-skill` の補助ファイル `gates/G-7.md` の実在を追う検査の有無は、`lint:impl` が通ったことだけ確かめた(ADR-0087 決定4 の 3 方向検査が「### 障害時の連絡先」をどう扱うかは `test:fields` が通ったことだけ)
- 実際の採用者の文書・判断記録での偽の欠落/偽の失敗の量は測っていない(EV-0282・EV-0283 で開示)
- 本体の `npm run check` 全量と、template 全量の回帰は push の前に議長が 1 回流す
