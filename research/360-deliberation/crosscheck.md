# #360 独立の突合(実装を見ていない文脈による)

- 日付: 2026-11-12
- 入力: `decision.md` の「重の裁定」(H-1〜H-10)、`tmp/360-diff-standard.patch`、`tmp/360-diff-template.patch`、worktree の現在のファイル。調査・会議体の意見のファイルは読んでいない
- 実行で確かめたこと: 次の試験をすべて終了コード 0 で流した。test-check-pr(ok 206)、test-coverage-scope(ok 65。go がある環境のため構文木の場面も流れた)、test-base-judge-workflow(127)、test-aggregate-records(129)、test-guard-bash(69)、test-plan-trace(35)、test-adapter(54)、test-records、test-records-history、test-stack-coverage、test-init-g5。`node scripts/check-impl.mjs` も 0
- 追加で、scratchpad の小さなスクリプトから `weakeningFindings`・`hostingWriteOf` を直接呼んで探った(X-1・X-2・X-7)

## 総括

裁定 H-1〜H-10 の各項は、差分に対応する実装・本文・実装マークがある。重大度「高」に当たる所見(裁定と逆の実装、delivered の表示が事実に反するもの)は見つけていない。採用済みの ADR(0085・0121・0078・0089)の本文は差分に含まれない。責任者・承認者の欄に AI の名前は書かれていない(ADR-0124 は「承認者と承認日は未記入」)。第4章 G-5「検査対象が存在しない場合の扱い」とは、none・undetermined だけを通知で通し、言語のアダプタの未実施を失敗にする形で整合している。5.8.5 の後の段落の「検出を G-5 の合否に使ってはならない」とは、IMPL-0489 だけを試験の失敗の扱いの強制として分ける H-3 の裁定どおりで、ほかの検出・差・マージの後の検出は合否に使っていない。

ただし、IMPL-0489(delivered・machine。G-5 の失敗)に、誤検出で落とす経路と、黙って通す経路が1つずつある(X-1・X-2)。H-10 で直したはずの「go は実施しない」の記述が、採用者向けの README に残っている(X-3)。ラベルを前提にした記述も、公開の頁に残っている(X-4・X-5)。

## 所見

### X-1 重大度: 中 — 検証の弱体化の検出が ASCII 以外のパスを読めず、strict=True の xfail を G-5 の失敗にする

- 所在: `template/scripts/gate/check-pr.mjs:1984`(`git(['diff', '-U0', '-M', mergeBase, HEADREF])`)、`:2101` `parseUnifiedDiff`
- 事実: 差分を `core.quotePath=false` を付けずに取っている。ASCII 以外を含むパスは、git が `+++ "b/tests/test_\346\227\245\346\234\254.py"` の形で引用符に包む。`parseUnifiedDiff` は引用符を戻さず、ファイル名を `"b/tests/...` のまま返す。手で組んだ差分で確かめると、`@pytest.mark.xfail(strict=True)` を持つ新しいテスト `tests/test_日本.py` について、`atHead` が本文を読めず(空の行になる)、`strictErrors` に「strict=True が無く、構成にも xfail_strict = true が無い」が出た。G-5(pr-rules)が誤って失敗する。注釈 `pit-in: known-failure` も「無い」と表示され、新しいテストのファイルの一覧にも引用符つきの名前が出る。coverage-check の側は、同じ欠陥を突合 X-5(#296)で直している(`-c core.quotePath=false` と `unquoteGitPath`)
- 求める直し: 弱体化の検出の差分も `-c core.quotePath=false` で取り、`unquoteGitPath` 相当で戻す。ASCII 以外のパスのテストに strict=True の xfail を足す場面(通る)を、試験の適合の側へ足す

### X-2 重大度: 中 — IMPL-0489 は、`pytest.mark.xfail` の字面だけを見る。別名の xfail は失敗にならず、一覧にも出ない。そのことが開示されていない

- 所在: `template/scripts/gate/check-pr.mjs:2067`(`XFAIL_MARKS` の `/\bpytest\.mark\.xfail\b/`)、`src/content/docs/phase4-process-design/human-ai-boundary.md:1087`(IMPL-0489 の note)
- 事実: `from pytest import mark` と `@mark.xfail` の組み合わせで足すと、`xfails`・`strictErrors` のどちらも空になった(scratchpad で確かめた)。`xfail = pytest.mark.xfail` のような別名も同じ形になる。strict の無い xfail が、G-5 の失敗にも、G-6 の一覧にもならずに通る。IMPL-0489 の note は「pytest の xfail の付与で…失敗させる」と書くだけで、字面の照合であることを開示していない。限界の文 `WEAKENING_LIMIT` が挙げるのは「別名を経た skip」と「自前の検証・印」だけである。本文の表の「拾わない形」も「採用者独自の印」までで、pytest 自身の印の別名は含まない
- 求める直し: 次の2つのどちらかを採る。(a) `mark.xfail` の別名(`from pytest import mark`・`import pytest as pt`)まで照合を広げる。(b) IMPL-0489 の note、本文の表の「拾わない形」、限界の文に「別名を経た xfail(`@mark.xfail` など)は拾わない」を書く。(a) を採っても (b) の開示は要る。構成の `xfail_strict` は閾値・除外設定のファイル(`pyproject.toml#tool.pytest` ほか)に入っており、同時変更の検査で守られている。この点は問題にしない

### X-3 重大度: 中 — H-10 で偽になった「go では基準3 を『実施しない』と記録する」の文が、準拠テンプレートの README に残る

- 所在: `template/README.md:50`
- 事実: 「node では G-5 の test ジョブが失敗し、go では G-5 基準3 を『実施しない』と記録するため、黙っては外れないからです」が残っている。H-10 は、preflight.mjs・generate-profile.mjs・node.json・フェーズ5「テンプレートリポジトリ」の同じ文を改めた。README だけが漏れている。採用者が最初に読む文書が、ADR-0124 決定1 と逆の扱いを述べている
- 求める直し: フェーズ5 の頁と同じ文(node・python・go では、被覆の記録が出なければ基準3 が未実施として失敗する)へ改める

### X-4 重大度: 中 — フェーズ5「エージェントの操作の統制」が、弱体化の検出を「まだ降りていません」と書き、「ラベルにとどめ」の扱いも残す

- 所在: `src/content/docs/phase5-implementation/agent-trace-control.md:69`・`:72`・`:74`・`:83`・`:124`
- 事実: 74 行目に「アサーションの削除と `skip` 相当の付与の検出とラベルは、まだ降りていません」とある。IMPL-0204 は delivered・machine になったため、この文は実装の事実と逆である。69・72・83・124 行目は、検出を「ラベル」として扱う。H-7 A は「ラベルは付けない」「機械の検出の一覧」と裁定し、5.8.5 の後の段落にも「ラベルではなく一覧で示す」を足した。その本文とも食い違う
- 求める直し: 74 行目を、降りた範囲(IMPL-0204・0486・0488・0489)と降りていない範囲(IMPL-0487・0490)の記述へ改める。ほかの行の「ラベル」を「機械の検出の一覧」へ改める

### X-5 重大度: 低 — 「機械の検出が付けたラベル」の語が、第4章の附属書と EV-0175 に残る

- 所在: `src/content/docs/phase4-process-design/developer-guide.md:87`・`:123`、`src/content/docs/phase4-process-design/human-ai-boundary.md:1131`(EV-0175 の差し替え条件の「機械の検出のラベル」「ラベルの確認を省いた変更」「ラベルを合否へ近づける」)
- 事実: H-7 A は、本文の語と /human-verify 順4 の語を「機械の検出の一覧」へ改めると裁定した。差分が改めたのは 5.8.6 の1か所と /human-verify だけである。ADR-0124 の「影響」は「第5章 5.8.5・5.8.6 の『ラベル』を改めた」と書くが、上の箇所は残っている
- 求める直し: 語を「機械の検出の一覧」へ揃える。EV-0175 の本文は根拠水準のマークの中の文であり、識別子は変えずに語だけを改める

### X-6 重大度: 低 — impl-inventory の note に、IMPL-0248 を「降りていない」とする記述が残る

- 所在: `src/data/impl-inventory.yaml:1000`
- 事実: 同じ節の ids に IMPL-0491 を足したのに、note は「既定ブランチ以外へ取り込むマージをしないことは IMPL-0248(降りていない)」のままである。IMPL-0248 は、主題をマージの後の検出に改め、delivered・machine になった
- 求める直し: note を、IMPL-0248(マージの後の検出)・IMPL-0254(人の手順)・IMPL-0255(フックの拒否)・IMPL-0491(降りていない経路)の別に改める

### X-7 重大度: 低 — IMPL-0255 の「gh pr merge の各形」を拒否するという記述は、gh の別名の経路を拾わない

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:2098`(IMPL-0255 の note)、`template/.claude/hooks/guard-bash.mjs:182`
- 事実: `gh alias set m "pr merge" && gh m 1` を `hostingWriteOf` で見ると null(通す)が返った。`npx gh pr merge 1` も null だった。`command`・`env`・絶対パス・`-R`・`xargs` の形は拒否した。権限設定の ask `Bash(gh pr merge:*)` も、別名の形には当たらない。フックは抑止の層であり、この経路は IMPL-0491(スクリプトから API を呼ぶ経路)と同じ種類の取りこぼしである
- 求める直し: `gh alias set` で `pr merge`・`api` を含む別名を作る操作を拒否するか、IMPL-0255 の note と IMPL-0491 の note に「gh の別名を経た形は拾わない」と書く

### X-8 重大度: 低 — 新しく生成する python・go の構成の既定を changed に変えたことは、裁定に明記がない

- 所在: `template/scripts/gate/coverage-check.mjs:81`(`derivedCoverageScope` が `coverageDetail` の有無に従う)、ADR-0124 の「影響」の最後から2つ目の箇条
- 事実: python・go のアダプタに `coverageDetail` を足したため、新しく生成する構成の測る範囲の既定が whole から changed へ変わった。go では、CI に go が要るという新しい条件が付く。H-1 と H-7 D は、変更の範囲を測る部品を降ろすことは裁定している。しかし、生成の既定を変えることには触れていない。ADR-0124 の「影響」と、test-coverage-scope の改めた期待値には書かれている。既存の構成は変えていないため、採用者に黙って課す失敗ではない
- 求める直し: 議長の追加の裁定(H-10 の形)として decision.md に記録する。node と同じ扱いにした理由も添える

### X-9 重大度: 低 — ADR-0124 の「採らなかった案」に、裁定が退けた案の一部が載っていない

- 所在: `src/content/docs/adr/0124-unmeasured-coverage-merge-control-and-detection-scope.md` の「採らなかった案」
- 事実: 載っていない案は次の4つ。H-2 の「条項の観測の単位を push された記録に改める案」、H-3 の「照合できない枠組みを scheduled にする案」、H-6 の「IMPL-0102 を adopter とする案」、H-6 の「not-imposed への移行だけで済ませる案」。decision.md には記録されているため、記録そのものは欠けていない。ただし、公開の ADR の読み手は、これらを「書かれていない」と「課さないと決めた」の区別なしに読むことになる
- 求める直し: 上の4案を、理由とともに表へ足す

### X-10 重大度: 低 — IMPL-0259 の go の構文木の場面は、go の無い環境では「未確認」と出して通る

- 所在: `template/scripts/gate/test-coverage-scope.mjs` の go の節(`goVersion.status !== 0` で「未確認」と出す分岐)
- 事実: 違反と適合の対(27.27% で落ちる・100% で通る)は、go がある場合だけ流れる。CI(`gate-g5.yml` の ubuntu-latest)には go が入っているため、通常は流れる。go の無い手元の環境では、delivered・machine の根拠の試験が流れないまま終了コード 0 で終わる。「未確認」と出す開示はある
- 求める直し: CI では go の無いことを失敗にする(例: 環境変数 `CI` があれば失敗に数える)。または、IMPL-0259 の note に「go の構文木の場面は go のある環境でだけ試験する」と書く

## 項目ごとの突き合わせ(過不足)

| 裁定 | 実装の所在 | 突合 |
| --- | --- | --- |
| H-1 | coverage-check.mjs(go-coverprofile・未実施の失敗)、_go-stmt-lines/main.go、go.json(誤った note を削除)、ADR-0124 決定1 と影響の表、IMPL-0259・0495、EV-0246 | 一致。go の全体の割合が `go tool cover -func` の合計と一致することは試験が固定している。猶予は置いていない |
| H-2 | IMPL-0486(delivered)・0487(undelivered・#361)、check-pr の 4c | 一致 |
| H-3 | IMPL-0488・0489(delivered)・0490(adopter・ADR-0124)、ADR-0124 決定3 の表 | 一致。ただし X-1・X-2 |
| H-4 | 本文の「課さない」、IMPL-0248(evidence-aggregation へ移し、3値)、IMPL-0254(rulesets-readme・manual)、record-copy の default_branch | 一致。ルールセットは広げていない(ADR-0078 決定3 を維持)。ただし X-6 |
| H-5 | IMPL-0255(guard-bash-hook)・0491(#358)、フックの試験。`--base` の付け替えを通すこと | 一致。ただし X-7 |
| H-6 | 本文の「課さない」、IMPL-0102(process-change-skill・manual)、settings.md の手順、IMPL-0494 | 一致 |
| H-7 | A: IMPL-0204 と PR テンプレートの表。A': IMPL-0205 と readPlanTargets。C: IMPL-0253・0155・0492・0493 と ai-review-record.mjs・許す形の一覧。D: python。IMPL-0479 は #361 へ | 一致。ただし X-4・X-5 |
| H-8 | rulesets と rulesets-readme の id の分離、check-impl の重複の検査(コミット a5cca3f)、IMPL-0496、試験の読み込みの CRLF の揃え | 一致 |
| H-9 | 合否に使うのは IMPL-0489 だけ。offDefault は warn だけで gaps へ入れない | 一致 |
| H-10 | pytest.xfail( の失敗、preflight・generate-profile・node.json・フェーズ5 の改め、IMPL-0254 の manual | README が漏れている(X-3) |
