# #467 独立の突合 1 巡目の所見の直し(2026-11-27)

- 入力: `verify-01.md`(V-01〜V-20)、`ruling.md`。直す前の先頭は、本体 4f91b5ef、template e68d92b
- 新しい義務・欄・様式・人の記入は足していない。template の追加行に ADR 番号・research・「転記」は無い

## 所見ごとの直し

| 番号 | 直した所在と要点 |
| --- | --- |
| V-01 | `generate-profile.mjs` の `renderProfileMd` に、G-6 が省略・未達のとき「G-6 を経ない変更」の節を足した(役割カードの 1 行は残し、ですます調へ)。ADR 影響の記載を実態へ。`test-roster-rules.mjs` に 5 場面(プロファイル 2 構成・有効な構成で出ない・役割カード)。regress に生成文を固定する期待値は無かった |
| V-02 | IMPL-1061 を `plan=scheduled issue=464 review=2027-05` に。note は「降ろす予定。それまで欄にはトレーラが正本である旨だけ」。ADR 決定3 を合わせた。`impl:write`・`issues:snapshot`(#464 が写しに無かったため。他 7 件の Issue も写しに入った) |
| V-03 | 様式 07 の文: `/pit` は機能ごとの段階を出す、トレーラ無しの取り込みは未取り込みに見える、そのとき「完了」と書くと「不明」。ADR の限界へ同旨 |
| V-04 | 様式 07 に「実装中はブランチの有無。標準の着手とずれることがある」。標準 `deliverable-templates.md` は「導いてよく…。ただし着手の定義は前項(Draft PR の作成)による」。ADR に「残るリスク」の 1 行 |
| V-05 | 様式 10 と補助ファイルの「AI の担い手が…起こした起案」を「様式の初期値(起案)」へ。初期値のままの行は空と同じに扱う(AS-0 にしない)を足した。標準 1667 行付近に当該の文言は無く、直さなかった |
| V-06 | ADR 2 か所を「第6章」へ。`ruling.md` 末尾に訂正の 1 行 |
| V-07 | 採らない案に O-1 (b) の行を足した |
| V-08 | 「計画済みの 2 件目以降の変更で約 4 割、新機能の最初の変更で約 2.5 割(…引き直す前の近似)」へ。新しい EV-0368(E0)を付けた。`evidence:write` |
| V-09 | 原文(`gh issue view 467 --json comments` の Q467-1)どおりに引いた。ADR のほかの鉤括弧の引用は無い |
| V-10 | `check-d0.mjs` を読んで確認(目印あり: 食い違いは問題。目印なし: 注意のみ)。IMPL-0310 の note をその趣旨へ |
| V-11 | `pr-workflow.md`: 「(G-6 を適用する構成で)」と限定し、省略・未達では記録が無い旨を足した |
| V-12 | PR 様式の文を体言止めへ。役割カードの 2 文をですます調へ |
| V-13 | `seatsByPerson` の比較を `personKey`(名簿で id へ正規化)で行う。`test-loosening-decider.mjs` に場面 1 件(id と氏名の書き分けを拒否しない) |
| V-14 | `template-fields.yaml` の余分な空行 2 か所を削除 |
| V-15 | 「写し・転記に当たる記録」を「写しに当たる記録」へ(ADR-0106 の固有の語「転記の確認」は残した) |
| V-16 | ADR ステータスを「独立の突合(2 巡)」へ。`impl-body.md` の「33 行」を実数 30 行へ(O-1 (b) を足した後) |
| V-17 | `tailoring-kb.json` を HEAD の blob で書き戻し、`git add` で改行の差を解消。`git -C template status` は清浄 |
| V-18 | `next.mjs` の機能ごとの実装段を `taskProgressStep` へ切り出し(併存時だけ段の判定を続ける)、「不明」を detail に併記して段の判定を続ける。`test-plan-trace.mjs` に 4 場面(実装中・実装前・不明のみ・不明なし) |
| V-19 | 「この行」を「層1 の版の行」へ |
| V-20 | `implement/SKILL.md` に「残した項目4・6・7 は、機械が止めない面への促しとして置く」を添えた |

## 流した試験(すべて合格)

- template: `test-roster-rules`(221 件)、`test-loosening-decider`、`test-plan-trace`(43/43)、`test-next-records`(157)、`test-edition-end`(103)、`test-init-g5`(208)、`test-trial-checklist`(28)
- 本体: `test:fields`、`lint:refs`、`lint:impl`、`lint:evidence`、`lint:scope`、`impl:issues -- --issue 467`(0 件)、`test:impl`、`test:template`、textlint(変更した md)
- 流していない: `npm run check` の全量・regress の全量

## コミット

- template(`d4-467`): 88c2a76(1 個。bundle は `tmp/d4-467-template.bundle` を更新)
- 本体: 先頭の 1 個(`git log -1`。template の参照を 88c2a76 へ進め、本ファイルを含む)

## 2 巡目の突合が見る差分

- template: `git -C template diff e68d92b..d4-467`(88c2a76 のみ)
- 本体: `git diff 4f91b5ef..HEAD`(ADR-0271、標準 3 ファイル、IMPL-1061、台帳 2 本、`issue-index.tsv`、research の訂正)
- 見てほしい点: `taskProgressStep` の切り出しが挙動を変えていないか、「G-6 を経ない変更」の節の置き場所(未達の節の後)
