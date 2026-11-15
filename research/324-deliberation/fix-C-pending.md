# 束 C の pending の節の登録(Issue #324。2026-11-15)

裁定 `ruling-C-pending.md` に沿い、第6章と第2章で `pending` に残っていた節をすべて区分した(29 節。うち `pending` のまま残るもの 0)。条文は変えていない。`template/` は読んだだけ。

## 1. 登録した降ろし先(`impl-targets.yaml`)

| id | 種別 | 所在 |
| --- | --- | --- |
| `adr-write-skill` | template-file | `.claude/skills/adr-write/SKILL.md` |
| `ai-sla-guide` | template-file | `.claude/skills/artifact/artifacts/08-ai-sla.md` |
| `safety-risk-assessment-template` | template-file | `templates/09-safety-risk-assessment.md` |
| `context-transfer-record` | planned | `docs/context-transfer/`(部門間移管の移管記録と H-1〜H-3。採用者に委ねるかは未決) |
| `project-registration-record` | planned | `docs/project-registration.md` |

2.10.6 は既存の予定の降ろし先 `flow-observation`(#443)へ当てた。IMPL-0779 は `config-change-log` から `process-change-skill` へ付け替えた(dry-run.md が仕掛かり中の判定を候補に挙げる。引き継ぎと名義の検査は無いので `undelivered` のまま)。

## 2. 節ごとの区分と足したマーク(IMPL-0855〜0899)

`D` は delivered(実物に所在あり)、`U` は undelivered。

第6章
- 判断記録の索引: D 0855(adr-write の「置き換えと廃止」末尾)。IMPL-0139 と合わせて marked
- 契約への組み込み方の3類型: D 0856(08-ai-sla.md の形式の行・レビューの観点)、U 0857(金銭措置型を客観的な量に限る旨は手引きに無い)
- 安全リスクアセスメント > 適用条件: D 0858(更新の契機)・0859(区分の引き下げの根拠を書かない)、U 0860(独立した安全性の評価者が本表を読む。読んだ記録の欄が無い)。既存の 0453・0454 と条件1〜4 の行を marked
- 記号の出所: D 0861(L・E 引き上げの再評価)・0862(SR2 以上の受容は R1)・0863(SR を比較に使わない)
- 手順: D 0864(SR4 の間は運用を開始しない)・0866(新たな危険源の点検)、presence 0865(手順1・3・7 の記入欄)
- 危険源の同定: D 0867(版の記録)、presence 0868(分類外4件と人間の信頼の悪用の行)
- 分析手法: U 0869(様式 09 に故障モード・FMEA の語が無い。handover-08 の「確かめた」を実物で確かめ直し、運ばないと判断した)
- リスク低減の3ステップ: D 0870(順と RRS1)・0871(RRS3 でリスクを下げない)、presence 0872(隔離の対象外の欄)
- テンプレ9(冒頭): D 0873(版の選び方)。軽量版: presence 0874(承認の欄の検査は 0453 を location)。完全版: presence 0875。記入時の注意: D 0876
- レビュープロセスの流れ: U 0877(`pre-review-automation`。提出者の応答の定め)
- 前案件の記述との同一の機械の検査: U 0878(`g1-check`)。`check=machine` は足していない
- IMPL-0779: 降ろし先の付け替えのみ(番号は増えない)

第2章
- 2.6 AI協調ループの構成: D 0879(CLAUDE.md の節「文脈への書き戻し」)・0880(規模の確認の欄)・0881(ルールセットの必須チェック)。handover-09 は「運ぶ置き場が無い」としたが、CLAUDE.md の節と claude-md-resident.json が書き戻しを運ぶと実物で確かめた
- 2.7 部門間移管: U 0882(完了条件1〜5 の行)
- 2.8 案件の立ち上げ手順: U 0883(案件登録記録)・0884(立ち上げの順序)。行は手順1〜5(「3a」「3b」は検査が行の鍵に取らない)
- 2.9.1〜2.9.3・予告期間: U 0885・0886・0887・0888
- 2.9.4: U 0889・0890、D 0891(保持者の数え方。templates/05-handover.md と IMPL-0066)
- 2.9.5・期限と範囲・短い予告・機械検査: U 0892・0893・0894・0895
- 2.9.6(課題1〜4 の行)・2.9.7・2.9.8: U 0896・0897・0898
- 2.10.6: U 0899(`flow-observation`、issue 443)。権限の割当は 7.3・7.6 の節を location に挙げた

`issue=` は 0899 が 443、他は 324(領域の合う open の Issue なし)。

## 3. 残った pending

第1〜8章の `pending`: 第5章 1(human-ai-boundary)・第7章 1(exception-escalation)。ほかに附属書 assurance-case 33・ears-guide 8・proposal-template 8・safety-verification 20(合計 71)。いずれも本件の範囲(第6章・第2章の束 C)の外であり、触れていない。第6章・第2章に残る `pending` は 0。

## 4. 文の食い違いの事実(条文は変えていない。議長が既存の open の Issue へ寄せる)

- レビュープロセスの流れ(第6章): 「コメントは意見であり、反映するかは提出者と判定者が決める。全コメントへの対応義務はない」と書く。第3章 3.10.7 は T-1 に起案者が全意見へ応答するとし、3.10.8 は応答が付いていない意見の比率が 0% を超える状態を警戒サインとする。範囲も、本節は「すべてのレビュー」、3.10 は B-1〜B-4 の上程と工程ゲート。
- 2.8(第2章): 図と「前提条件の統制」の「SR4 が残る間は審議を開始しない」は、G-1 の前提条件の表(行1・行2)に SR4 が無い。「D-0 の次回レビュー期日を超過している案件は SG の判定を開始してはならない」は、G-1 の前提条件の表が D-0 の承認だけを書き、期日の超過を書かない。check-d0.mjs は期日超過を G-1 の審議の停止として扱い、SG は止めない。寄せ先は #327(前提条件の混在)。

## 5. 検査

`npm run impl:write` 済み。`lint:impl` 0・`test:impl` 56 件合格・`lint:refs` 0・`lint:provisions` 0・textlint(lifecycle.md・deliverable-templates.md)0。回帰の全量は流していない。

## 6. 次の担当への注意・開示

- delivered はすべて check=manual か presence で、所在を読んだだけ(実行して確かめていない。note に書いた)。presence 5件(0865・0868・0872・0874・0875)は様式の欄・行の実在までで、中身を拒む検査は無い
- 0881 は checks-only.json で必須チェックを確かめた。team.json など他のルールセットは読んでいない
- 「評価者が本表を読む」(0860)は、迷ったら undelivered 側へ倒す定めに従った
