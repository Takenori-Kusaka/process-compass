# #321 との統合: 識別子の振り直し

作業ブランチ work/289〜work/346(旧基点 `46b056f`)を、#321 を取り込んだ `origin/main` の上へ載せ替えたときの識別子の写像です。スタックの全ファイルとコミットのメッセージ(本リポジトリと準拠テンプレートの両方)に適用しました。

## 写像の規則

- 系列ごとに、旧基点での最大値(baseMax)と `origin/main` での最大値(mainMax)を求め、差(offset = mainMax − baseMax)だけ、baseMax を超えるスタックの識別子をずらす
- ADR はファイル名と `sidebar.order` も同じだけずらす
- main の ADR-0070(`0070-gate-record-medium-and-field-sources.md`)の本文は変えない。スタックの旧 ADR-0070 は ADR-0071 になる

| 系列 | baseMax | mainMax | offset | スタックの範囲(旧 → 新) |
| --- | --- | --- | --- | --- |
| ADR | 0069 | 0070 | +1 | 0070〜0089 → 0071〜0090 |
| EV | 0108 | 0119 | +11 | 0110〜0173 → 0121〜0184 |
| IMPL | 0123 | 0129 | +6 | 0124〜0345 → 0130〜0351 |
| SRC | 0639 | 0639 | 0 | 変更なし |
| FND | 0276 | 0276 | 0 | 変更なし |

- スタックは EV-0109 を使っていない。このため EV-0120 は欠番になる(識別子は再利用しない)
- CR・CMMC・S0・SG など、main に無い系列は変えない

## ADR のファイル名

| 旧 | 新 |
| --- | --- |
| 0070-structure-of-principles-decisions-and-gate-records | 0071-structure-of-principles-decisions-and-gate-records |
| 0071-document-volume-is-not-a-metric | 0072-document-volume-is-not-a-metric |
| 0072-corrective-action-by-impact-and-control-effectiveness | 0073-corrective-action-by-impact-and-control-effectiveness |
| 0073-no-cap-on-inspection-apparatus | 0074-no-cap-on-inspection-apparatus |
| 0074-acceptance-criteria-coverage-premises-and-ai-findings | 0075-acceptance-criteria-coverage-premises-and-ai-findings |
| 0075-inventory-of-implementation-marking-targets | 0076-inventory-of-implementation-marking-targets |
| 0076-repository-ci-wiring-and-distribution | 0077-repository-ci-wiring-and-distribution |
| 0077-rejudge-on-change-and-irreversible-operation | 0078-rejudge-on-change-and-irreversible-operation |
| 0078-coverage-scope-approval-binding-self-heal | 0079-coverage-scope-approval-binding-self-heal |
| 0079-method-neutrality-and-relation-to-existing-methods | 0080-method-neutrality-and-relation-to-existing-methods |
| 0080-autonomy-downgrade-delivered-as-registration-stop | 0081-autonomy-downgrade-delivered-as-registration-stop |
| 0081-seat-combination-boundaries-and-lane-mapping | 0082-seat-combination-boundaries-and-lane-mapping |
| 0082-standard-edition-end-of-application-and-deviation | 0083-standard-edition-end-of-application-and-deviation |
| 0083-check-strength-plans-and-resident-rules | 0084-check-strength-plans-and-resident-rules |
| 0084-adoption-into-existing-repositories | 0085-adoption-into-existing-repositories |
| 0085-guide-pages-and-remaining-verbal-forms | 0086-guide-pages-and-remaining-verbal-forms |
| 0086-outsourcing-gate-placement-enforcement-ownership-and-authority-sources | 0087-outsourcing-gate-placement-enforcement-ownership-and-authority-sources |
| 0087-organizational-distance-steps-and-cl1-stage-relaxation | 0088-organizational-distance-steps-and-cl1-stage-relaxation |
| 0088-regression-suite-under-version-control | 0089-regression-suite-under-version-control |
| 0089-job-token-and-deploy-credential-binding | 0090-job-token-and-deploy-credential-binding |

## 振り直さなかったもの

- 旧基点の同じファイルと一字一句同じ行。スタック以前からある記述であり、スタックの識別子を指していない。例: `research/302-310-deliberation/implementation-B.md` の「次の空き番号」の記述、`research/sources/SRC-0548.yaml` が引用する「ADR-0123」
- `src/data/issue-index.tsv`。GitHub の Issue の写しであり、本リポジトリの側で書き換えない。GitHub の Issue #368・#369 の題名は IMPL-0325・IMPL-0327 を含む。振り直しの後の番号は IMPL-0331・IMPL-0333 である。題名の更新は GitHub の側の作業として残す(本統合では GitHub に触れていない)
- JIS の規格番号(JIS X 0160 など)。識別子ではない
- 系列の名を持たない4桁の数は、文脈(同じ行の識別子、表の列の名、ADR のファイル名の形)で系列を決め、決められない 428 件は1件ずつ確かめた

## コミットの識別子

- 準拠テンプレートと本リポジトリのコミットが互いの SHA を引く箇所(メッセージ、実装記録、`template/scripts/vendor/tailoring-kb.json` の `commit`)は、書き換えた後の SHA へ置き換えた
