# Issue #353 実装の記録(2026-11-15)

実装の担当による。裁定は `decision.md`、文案は `decision-draft.md` 5〜9 章。template は触れていない。push・Issue へのコメントはしていない。独立の突合は未実施。

## 1. 入れた所在

すべて `src/content/docs/` 配下。

| ファイル | 節 | 内容 |
| --- | --- | --- |
| `phase4-process-design/overview.md` | 1.4 用語の表 | 適用の表明・逸脱・適合の主張・逸脱を伴う適合の主張の4行(5.1) |
| 同 | 1.10.1 | 例外承認の表示の項を1つ(5.2) |
| 同 | 1.10.2 | 表の併記する事項3行、箇条書き7項(5.3)、IMPL-0573、EV-0266 |
| `phase4-process-design/exception-escalation.md` | 7.3 | 記録の表の「状態」(失効の定義)、箇条書き5項(5.5)、IMPL-0574、EV-0267 |
| `phase4-process-design/gate-criteria.md` | G-7 基準5 | 対応づく条件の表の 2(5.6) |
| `phase4-process-design/deliverable-templates.md` | テンプレ3 | 区分「例外」の箇条書き1項(5.7)。欄は変えていない |
| `phase4-process-design/tailoring-guide.md` | 第8章(1023 行) | 箇条書き1項の差し替え(5.8)。1122 行付近は変えていない |
| `phase4-process-design/assurance-case.md` | H.8 | 文の型3行(5.4)。条件の欄は変えていない |
| `adr/0134-exception-approval-is-not-deviation-and-lapses-after-due-date.md` | 新規 | ADR-0134(5.9)。`adr/index.md` は一覧を持たない(自動生成)ため変えていない |
| `data/impl-inventory.yaml` | 1.10.2 の登録 | IMPL-0573 を登録(`lint:impl` が求めた) |
| `community/evidence-ledger.md`・`implementation-ledger.md` | 自動生成 | `evidence:write`・`impl:write` で再生成 |

見出しは足していない。「(適用: …)」は変えていない。

## 2. 振った番号

作業ツリー全体の最大(IMPL-0572、EV-0265。EV-99xx は試験の固定値で除外)の次から振った。

- IMPL-0573: 1.10.2。件数の併記(issue=354、undelivered、manual)
- IMPL-0574: 7.3。期限の比較と失効の記録の欠落への計上(issue=355、undelivered、manual)。7.3 の末尾に置いた
- EV-0266: 1.10.2(併記の定め。E1)。見直し 2027-05
- EV-0267: 7.3(失効の定め。E0)。見直し 2027-05
- ADR-0134

他の束(b1〜b4)が同じ番号を使う可能性がある。push の前に origin/main の最大と突き合わせ、必要なら付け直す。

## 3. 実行した検査

作業ツリーの `template/` は未初期化。`node_modules` は b4 のものへ結合した(追跡外)。template を要する検査は、b5 を scratchpad へ複製し、b4 の template(126e643)を載せて流した。b5 の `template/` は触れていない。

| 検査 | 結果 |
| --- | --- |
| `lint:text` | 合格(助詞の重複2件を直した) |
| `lint:evidence` | 合格(255 件。最初は「根拠の水準」の欄に説明を続けて不合格。説明を欄の外へ出した) |
| `lint:scope` | 合格(差分なし。`scope:write` も変更なし) |
| `lint:refs` | 合格 |
| `lint:tone`・`lint:dekimasu`・`lint:ci`・`lint:stage-table`・`lint:citations` | 合格 |
| `test:provisions` | 63/63 合格 |
| `lint:provisions`(複製側) | 違反なし |
| `test:template`(複製側。乖離の検査) | 「一致しています」。本文だけを先に入れても落ちないことを実行で確認した |
| `test:fields`(複製側) | 合格(11 件) |
| `lint:registry`(複製側) | 合格 |
| `lint:impl`(複製側) | 台帳と一致。登録簿の欠け(IMPL-0573)は直して通った。残る1件は「template の `evidence-manifest.mjs` が降ろし先の登録簿に無い」で、b4 の template が b5 の参照より新しいことに依る。本件と無関係 |
| `lint:impl`(b5 の作業ツリー) | template 未初期化に依る IMPL-0517・0520 の2件のみ。本件と無関係 |

`npm run check` の全量は流していない(指示による)。

`impl:write` を template 未初期化の b5 で流すと、台帳の走査統計(63/66/151/436)が「—」になる。複製側で再生成した台帳(統計は 63/66/152/435)を b5 へ写した。

## 4. 文案と違えた点・迷った点

- 5.3 の表の各セルは、適用の表明の文を draft のとおり、2つの主張を「(0 件になる)」つきで書いた。H.8 の文の型は draft のとおり
- 5.3 の箇条書きの保証の開示への参照は、附属書H へのリンクを足した。H.8 の逸脱を伴う適合の主張の文の型は、既存の文の末尾へ同じ句を足した(draft のとおり)
- IMPL-0574 は draft が「7.3 または G-7 基準5 の表の直後」としたため、7.3 の足した箇条書きの直後に置いた。7.3 の対象の限定(draft 6 章の3番目)には新しいマークを足していない。`impl-targets.yaml` に例外の経路のスキル(`exception-paths.md`)に当たる降ろし先は無く、既存の IMPL-0011(manual)の範囲に入る。template の分(7 節の4)に載せた
- EV の書式は、「根拠の水準」の欄に水準だけを置く検査がある。draft の「根拠の水準」の説明文は、「差し替え条件」の後の段落へ移した。内容は変えていない
- EV の語尾は、本文の文体(ですます調)に合わせた。ADR-0134 の本文も同じ
- ADR-0134 の「検討した選択肢」は、draft 5.9 の表に、裁定の 3 章の案(案内だけ・期限超過を件数に留める・列挙へ入れる)を統合した。ADR-0134 の影響の節に、template に及ぶ分と上限なしの判断を書いた
- フェーズ5 `ci-gates.md` 580 行の対応づく条件 2 は、G-7 の文の写しではなく現行の実装の説明(「返却済み・取り下げ・失効の記録…は対応づけない」)である。期限の比較は降りていないため、実装が降りるまで変えない(変えると未実装の挙動を書くことになる)。template の分の1に含める
- 1122 行付近は変えていない
- 独立の突合へ渡す問い(draft 9 章)は未実施

## 5. template に及ぶ7項目(本文側の表示)

template は触れていない。指揮役へ ask で上げる(decision.md 5 章)。本文側の表示は次のとおり。

| # | 項目(draft 7 章の文案) | 本文側で表示するマーク |
| --- | --- | --- |
| 1 | `aggregate-evidence.mjs` の例外の対応づけ。期限を突合の日と比べ、有効のまま期限を過ぎた行と失効の行を対応づけず gaps へ出す(日付は引数で渡す) | IMPL-0574(7.3。issue=355) |
| 2 | `claimForRange` の出力。範囲の件数・未回収・期限超過・独立した人の確認を経ない出荷の件数 | IMPL-0573(1.10.2。issue=354) |
| 3 | 表明の様式(IMPL-0120)、PROCESS-PROFILE.md と CLAUDE.md の生成区間、README の文の型へ件数の句 | IMPL-0573 と、既存の IMPL-0120(issue=354) |
| 4 | `.claude/skills/gate/reference/exception-paths.md`。対象は判定基準と条項が名指す事項に限ること、期限超過で効力を失うこと、延長は新しい行で承認し直すこと | 新しいマークは足していない。既存の IMPL-0011(manual。判定者が判定記録を書くとき)の範囲。IMPL-0574 が期限の部分を表示する |
| 5 | `templates/03-debt-ledger.md`。欄は変えず、状態「失効」の意味と期限超過の扱いの注記 | IMPL-0574(7.3) |
| 6 | `next.mjs`。期限を過ぎた未返却の例外の行を注記に出す | IMPL-0574(7.3) |
| 7 | 回帰の場面(期限内・期限超過・失効・再承認の新しい行・範囲をまたぐ行・ゲートの判定を対象とする行) | IMPL-0573・IMPL-0574 の `note=` が試験の不在を表す |

項目 4 と 6 には、専用のマークを足していない。判断が要る場合は、IMPL-0574 の `note=` を拡げるか、降ろし先の登録を足す(独立の突合で判断する)。
