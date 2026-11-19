# 束 B28 U4b の実装の記録(集約の段 mutation・regulatory と skipped を通さない式)

実装 2026-11-20。裁定は `ruling-1.md` §1.1・§2、`ruling-u4a-returns.md` 2〜4、`326-deliberation/b26-ruling-6-9.md` 2.4(項目9 b・c)、`b26-live-check.md`(式)。

## template(ブランチ b28)
- `.github/workflows/gate-g5.yml`: 集約の needs に `mutation`・`regulatory`。集約の手順は env へ各ジョブの結果を出し、構成済みなら基準・規則の10ジョブが success でなければ失敗(skipped を通さない)。例外は pr-rules が PR 以外の契機で skipped の場合だけ。live-check の式のとおり
- `scripts/gate/g5-aggregate.mjs`: `G5_RULE_JOBS` へ mutation・regulatory。`successCheckedJobs` を足し、`aggregateFindings` が「env の R_* と手順の組が同じジョブを指す」「success を求める行がある」ことを不備として検査する。契約検査(verify-gate-contract.mjs)は aggregateFindings を使うので、needs から段を外すと契約検査が落ちる(test-init-g5 が固定)
- `scripts/gate/mutation-stage.mjs`(`mutationThresholdNote`)・`aggregate-evidence.mjs`: 構成に ci.mutationThreshold が無いこと(型が不正も)を注意の1行で機械検査の表へ出す。数値で在れば出さない
- `scripts/gate/g5-local.mjs`: 裁定3。g5-local は段 mutation・regulatory を呼ばない。何もしない裁定だが、冒頭の「実行しないもの」に段を足した(コメントだけ。挙動は不変)
- 試験: test-g5-aggregate(52 件。集約の手順のシェルを実際に流し、skipped・failure・cancelled・success を確かめる。needs・組・success の行を外す陰性。変数が別ジョブを指す取り違え)、test-adapter(121 件。注意の有無)、test-init-g5(needs の写しを更新)。IMPL-0930 の ok と ng の目印を閾値の合否の試験へ付け直し、規制業の段の試験は IMPL-0836 とした
- 陰性の実行確認: 旧い gate-g5.yml(HEAD の U4a 時点)を LF の複製に戻すと test-g5-aggregate が 23 件 NG、新しいものでは 52 件一致

## 本体
- IMPL-0763・0930: `delivered`・`check=machine`・`test=template/scripts/gate/test-adapter.mjs` へ
- IMPL-0836: 集約の skipped の文を「降ろした」に改め、降りていないのは規則集の変更の扱い(U5)と明記。undelivered のまま
- IMPL-0931: skipped の文を改め、降りていないのは閾値割れの 7.3(U6)だけと明記。undelivered のまま
- IMPL-1029: 裁定2のとおり、push の経路でトレーラが落ちた場合の開示(manual。G-6 の判定者)を note に足した。新しい根拠水準マークは足していない。undelivered のまま(U6)
- 全ての note に、実物の gate-g5.yml の GitHub 上での通しは行っていない(式の観測は縮約版)ことを開示した
- 台帳: `npm run impl:write`。lint:impl・lint:refs・lint:evidence・lint:scope・test:fields・check-impl-plan-issues・textlint 通過

## 試験の結果(関係するものだけ。回帰の全量は流していない)
- LF の複製(git archive)で test-g5-aggregate 52 件・test-adapter 121 件・test-aggregate-wiring 61 件・test-push-trigger 27 件・test-context-refs 通過
- 作業ツリーで test-init-g5 182 件・test-adoption 123 件・test-aggregate-wiring 61 件
- 注: git の無い複製では test-adoption が 1 件、test-init-g5 が数件 NG になる。git ls-files に依る偽の落ちで、作業ツリーでは通る

## 裁定4: test-aggregate-wiring の 1 件 NG(IMPL-0925 の TBD)
- 再現しなかった。U4a の 2 つのコミット(d73ab93・63a02aa)の LF の複製、U4b の作業ツリー、U4b の先頭の複製で、全て 61 件通過(作業ツリーは複数回)
- この検査(envProblem)は様式09 を読まず、U4a が変えたファイルに依らない。U4a の時点の NG は、再実行の間の作業ツリーの途中の状態(kb の再生成中など)か未特定の偽の落ちと見る。原因は断定できない。再び出たら、その時の `git status` と出力の全文を残す

## 議長へ返す点
- なし。範囲外の指示(autonomy.mjs・org-assurance.mjs とその試験は B29 が触る)に従い、触っていない

## 残り
- U5(check-pr.mjs の例外の枠。ci.mutationThreshold・段のコマンドの変更の扱い)・U6(exception-expiry.mjs・閾値割れの 7.3)
- graphify-out の変更を origin/main の版へ戻すのは push の準備(裁定5)。この単位は graphify を流していない
- 番号(IMPL・EV・ADR)は push の直前に最大と照らす
