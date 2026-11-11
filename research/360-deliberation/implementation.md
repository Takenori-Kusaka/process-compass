# 実装の記録(#360)

- 裁定: `decision.md` の「重の裁定」H-1〜H-10 と、独立の突合への裁定
- 番号: ADR-0124、EV-0246・EV-0247、IMPL-0486〜0496(取り込みの際に付け直すことがある)
- 準拠テンプレート: ブランチ wip-360(push していない。コミットのたびに bundle を作った)

## 標準の側

| 所在 | 変えたこと |
| --- | --- |
| `adr/0124-unmeasured-coverage-merge-control-and-detection-scope.md`(新) | ADR-0085 決定2 の go の句と ADR-0121 のステータスの表の限定を置き換える。決定1〜6、採らなかった案、落ちうる検査と直し方の表 |
| 第4章 `gate-criteria.md` 基準3 | 測らない通過の禁止、言語ごとの表、EV-0246。IMPL-0259 を delivered、IMPL-0495・0496 を足した。IMPL-0479 を #361 へ寄せた |
| 第4章 担保水準 L2 | 採点の稼働の機械の検証を課さない旨。IMPL-0102 の主題を人の確認へ改めた(process-change-skill・manual)。IMPL-0494 |
| 第4章 積み重ねた変更とゲート | 拒否の設定を課さない旨とマージの後の検出。IMPL-0248(evidence-aggregation・machine)、IMPL-0254(rulesets-readme・manual)、IMPL-0255(guard-bash-hook・machine)、IMPL-0491(#358) |
| 第5章 `human-ai-boundary.md` 5.8.5・5.8.6 | 検出の範囲の表、印の注釈の書式、EV-0247、「ラベル」の語を「一覧」へ。IMPL-0204・0205 を delivered、IMPL-0486〜0490 |
| 附属書H `assurance-case.md` H.4 | 入力の記録の降ろし方。IMPL-0253・0155 を delivered、IMPL-0492(#358)・0493(adopter) |
| フェーズ5 `stacked-pr.md`・`template-repository.md`・`agent-trace-control.md`、`developer-guide.md` | 偽になった記述(ask で人へ戻る、go は実施しない、検出は降りていない、ラベル)を改めた |
| `src/data/impl-targets.yaml` | id `rulesets` の二重定義を `rulesets-readme` と `rulesets` に分けた。ai-review-workflow に checker ai-review-record |
| `scripts/check-impl.mjs` | 降ろし先の id の重複を失敗にする |
| `src/data/impl-inventory.yaml` | 新しいマークの登録と note |
| 台帳 | `evidence:write`・`impl:write`・`scope:write`・`template:kb` で再生成 |

## 準拠テンプレートの側(wip-360)

| コミット | 内容 |
| --- | --- |
| ed42a02 | check-pr(弱体化の検出の拡張、期待値の改めの表、IMPL-0486・0488・0489・0205・0494)、verification-trace(計画の対象パス)、aggregate-evidence(中間の層へのマージの検出)、record-copy(default_branch)、rulesets/README、ai-review(入力の記録・契約・欠落の表示)と ai-review-record.mjs・base-judge の許す形、coverage-check(python・go の変更の範囲、go の全体、記録の無い言語のアダプタの失敗、python の全体からテストを除く)と _go-stmt-lines、アダプタ、契約検査、スキルの文書、PR の様式、試験 |
| a08820e | ai-review の記録の手順の Node の版の固定(test-gate-node の指摘) |
| aee9b86 | 独立の突合への対応(X-1・X-2・X-3・X-7・X-10) |
| 720373b | 知識ベースの複製の版 |

## 確かめた検査

- Windows(node v26.13.0): `npm run check` の各段。結果は下の「検査の結果」に記録する
- 担当ごとの試験: test-check-pr 179 場面、test-plan-trace 35、test-coverage-scope 65、test-adapter 54、test-stack-coverage 47、test-base-judge-workflow 127、test-gate-node 22、test-aggregate-records 129、test-guard-bash 69、test-direct-commit-rules 11 ほか、すべて期待と一致
- go(go1.26.0)のある環境で、go の構文木の場面を実際に流した
- 独立の突合: 重大度「高」0件。中4件・低6件を直した(`crosscheck.md`、裁定は `decision.md`)

## 検査の結果

- Windows(node v26.13.0、本体 0375607・テンプレート 720373b): npm run check の 30 段のうち 28 段が通過。落ちたのは test:template-suite と test:regress
  - test:template-suite で落ちたのは test-g5-aggregate(既知の CRLF)と test-discouraged-evidence の2件。後者は試験が D-0 の様式の表を LF の改行で照合しており、CRLF で取り出した Windows でだけ落ちる。本件では様式も試験も変えていない。LF の写しでは通る(下)
  - test:regress は既知の Windows の失敗
- WSL(Ubuntu 24.04、node v26.13.1、LF の写し。本体 0375607・テンプレート 720373b): test:regress と test:template-suite を通常と TZ=UTC で流し、4つとも終了コード 0
- 最初の WSL の実行は既定の node v18 で r3 の3組が落ちた。package.json の engines(>=26)を満たさないためで、node v26 で流し直して通った

## 残ること

- IMPL-0487(失敗が解消したことの確認)・IMPL-0479(複数のアダプタ)は #361、IMPL-0491・IMPL-0492 は #358 で扱う
- 準拠テンプレートの変更(強制層)は、AI維持管理者の承認待ち。承認者・承認日は未記入
- 実機(GitHub Actions)での確認はしていない: ai-review の新しい手順と成果物の保持、gate-g5-base の要約への一覧の出力、record-copy の default_branch
