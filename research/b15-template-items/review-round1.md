# 束 B15 独立の突合 1巡目

作成 2026-11-18。担当: 独立の突合(実装を見ていない別の文脈)。所見を書くだけで、何も直していない。

- 対象: 本体 `git diff 8a314f2e..HEAD`(6ed061ef まで)、template `git -C template diff d871f25..main`(4da885e まで)
- 照らした裁定: `research/b15-template-items/intake.md`、`research/332-deliberation/decision.md` 争点1-1〜1-3、`research/447-deliberation/owner-answer-21.md`(回答 21・22)
- 流した試験: 本体 test-kb-ancestry(4件)、check-gate-criteria、check-template-drift、lint:impl、test:impl、lint:scope、lint:refs、lint:evidence、test:plan-issues(いずれも通過)。template test-roster-rules(197件)、test-edition-end(87件)、test-g5-missing(関数の対は通過。集約の通しは Windows では読み飛ばされた)。実行で確かめるため、使い捨てのスクリプトで buildConfig を呼んだ(F-1)
- 件数: **高 1、中 3、低 7**

## 高

### F-1 IMPL-0988: 価値責任者が G-7 を判定する構成で、出荷判定者の席(qa-gatekeeper)だけを見て D-1 を外している。表示と実態が食い違う

- 所在: `template/scripts/gate/config.mjs:503-514`(`shippingSeparatedFromDevLine`)、`template/scripts/init/generate-profile.mjs:561-562`(detectDeviations)、`:601-605`(buildRoles)、`:915-917`(g7.approver)、`template/scripts/gate/verify-gate-contract.mjs:392-394`、試験 `template/scripts/gate/test-roster-rules.mjs:137-138`(ok の側)。標準 `src/content/docs/phase4-process-design/tailoring-guide.md:266`(IMPL-0988 delivered・machine)
- 事実: `approverMode` が `value-owner-merged` の構成では、buildRoles が G-7 を qa-gatekeeper から外して value-owner へ移す。判定者の表示も「価値責任者(出荷判定者を兼務。代償措置つきの逸脱)」になる。新しい条件は、G-7 を判定しない qa-gatekeeper の席の責任者を、開発者・独立レビュアの席と比べている
- 実行で確かめたこと: 試験の ok の入力と同じ構成(size-1-2、value-owner=a、dev-verifier=a、independent-reviewer=x(外部)、qa-gatekeeper=b)で buildConfig を呼んだ。結果は `approverMode: value-owner-merged`、`gates.g7.approver` が「価値責任者(出荷判定者を兼務。代償措置つきの逸脱)」、value-owner の gatesOwned に g7 があり、notes が「G-7 を兼務する(代償措置つきの逸脱…)」だった。それでも `deviations` は空だった。G-7 を判定するのは価値責任者 a で、a は開発者の席の責任者でもある。D-1 が出るべき構成である
- 意味: (1) 構成の中で、判定者の表示は「逸脱」と言い、逸脱の一覧は空である。(2) 落とすのは表示を落とす側の誤りである。intake §2 の 16 は、この向きを「適合の主張の信頼を損なう」ため避けると裁定した。(3) 契約検査(verify-gate-contract)も同じ条件で D-1 の記録を求めなくなる。(4) test-roster-rules の ok の対は、この誤りを正解として固定している
- 裁定との突き合わせ: intake 順 2 は「value-owner-merged で、出荷判定者の席の責任者が開発者・独立レビュアの席の責任者と同一でないと確かめられたときだけ D-1 を出さない」と書く。value-owner-merged では出荷判定者の務めが価値責任者へ移る。そのため「出荷判定者の席」を qa-gatekeeper と読むか、G-7 を実際に判定する席と読むかが、裁定の文では決まっていない。実装は前者を採った。採ると、G-7 の判定者と比べる席が食い違う。どちらの読みにするか(qa-gatekeeper を別の人に置いたときに approverMode を value-owner-merged のままにするか)は、裁定で決める必要がある
- 重大度の理由: 表示と実態の食い違いであり、delivered・machine の表示と、試験が固定した正解が実態と食い違う。巡の数に関わらず直す類である

## 中

### F-2 採用済み ADR-0179 の本文(決定3・課さないと決めたこと・選択肢の表)を書き換えている

- 所在: `src/content/docs/adr/0179-ai-free-practice-record-and-overdue-disclosure.md:22`、`:31`、`:55-58`(コミット 1c0a78dc)
- 事実: ステータスは「採用(2026-11-17)」のままで、本文の決定3 を改めた。`adr/index.md:21` の規則4 は、採用後に書き換えてよいのはステータスの節だけと定める。ADR-0179 は origin/main(6f6bdde9)にまだ無い(未公開)ため、公開された記録の改ざんにはならない。ただし、リポジトリの上では採用済みの ADR の本文の改変である
- 対案: ステータスの節で「所有者の回答 21 で決定3 を一部置き換える」と宣言し、新しい ADR を立てる。あるいは、未公開の間は「提案」として扱う旨を記録する。owner-answer-21.md の「ADR-0179: 決定3 を改め」は所有者の指示だが、規則4 との関係は記録されていない

### F-3 5.4.5 の読みの固定(登録の判定の時点で条件2〜7 を照らす)が、実行層への降ろしの表示を持たない

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md:177`。`src/data/impl-inventory.yaml:3137-3141`(5.4.5 の行。マークは IMPL-1013 だけ)
- 事実: 新しい箇条は、登録の判定者(B-4、または D-0 の決定の権限を持つ人)が登録の時点で条件2〜7 を照らすことを書く。「新しい義務ではない」とするが、文は判定者の挙動を縛る。条件2〜4・5 を登録の経路で照らすことを追う実装マークは無い。棚卸しの note も更新されていない。準拠テンプレートの登録の判定の記録に、条件2〜7 の照らしの欄があるかは確かめていない(5.4.7 の記録の表示は IMPL-1022 が別に追う)
- 意味: 規定が降りているか降りていないかを、台帳から読めない(#222 の「降りていない規定は表示し続ける」に照らして欠け)。manual・adopter のどちらかで、マークか棚卸しの理由が要る

### F-4 IMPL-0987: 強制層の変更(record-copy.yml の権限の追加)の承認が記録されていないまま delivered とした。裁定の表の順序とも違う

- 所在: `template/.github/workflows/record-copy.yml:58-59`(`actions: read` の追加)、`src/content/docs/phase4-process-design/gate-criteria.md:863`、`research/b15-template-items/impl-02.md`(順 6)
- 事実: intake §2 の 7 は「強制層の変更なので、AI維持管理者の承認を経る」とし、順 6 の表は「§4 の実機の確認の後に delivered」と書く。一方、§4 は「実機の結果を待たずに集約の検出(順 6)を入れ、契機の削除だけを後に回す」と書き、表と §4 が食い違っている。実装は §4 に従い、EV-0325 で開示した。承認は impl-02 に「所有者が出す」とあるだけで、出た記録は無い
- 求めること: push の前に、所有者の承認(AI維持管理者として)を記録する。intake の表と §4 のどちらを採ったかを記録する

## 低

### F-5 EV-0325 と EV-0285 が同じ未確認の事実を二重に開示している

- `gate-criteria.md:866`(EV-0325)と `phase5-implementation/ci-gates.md:144`(EV-0285)。どちらも「成功した手動の起動がルールセットの必須チェックを満たすか」の実機の記録を差し替え条件にし、見直しはどちらも 2027-03。番号の重なりは無い(EV-0324・0325 は各1か所)。片方がもう片方を参照しないため、片方だけを差し替えると他方が残る

### F-6 `g5TriggerVerdict` が pull_request_target を通過に数えるが、`g5RunsOf` の照会では pull_request_target の実行を拾えない

- `template/scripts/gate/aggregate-evidence.mjs:376`・`:1575-1582`。pull_request_target の実行の head_sha は基底ブランチの先端であり、PR の head では引けない。いまの gate-g5.yml は pull_request だけを使う(`.github/workflows/gate-g5.yml:18`)ので、実害は無い。採用者が契機を pull_request_target に変えると、成功が unverified に落ちる(通過に数えない側へ倒れる)。`per_page=100` で次の頁を読まない点も同じ向き

### F-7 IMPL-0987 の集約の通し(ng の2件)は Windows では読み飛ばされる

- `template/scripts/gate/test-g5-missing.mjs:62`(CAN_E2E)。関数の対は Windows でも通る。impl-02 は WSL で通したと記録している。CI の Linux で通るかは push の後の CI でしか確かめられない

### F-8 test-kb-ancestry に浅い clone の場合の試験が無い

- `scripts/lib/inputs.mjs:104` の分岐(浅い clone を失敗にする)を試験が通らない(`scripts/test-kb-ancestry.mjs`)。「git のリポジトリでない」の試験は os.tmpdir() が git の作業ツリーの外にあることを前提にしている

### F-9 IMPL-0959 の ok の側(「なし」)は、実際の構成では出ない入力で確かめている

- `template/scripts/gate/test-edition-end.mjs` の「調整が何も無い構成は「なし」と出す」は、全ゲートを required にし、profile を空にした作り物の入力で確かめる。impl-02 も、実際の構成ではほぼ出ないと記録した。check=manual なので表示との食い違いは無いが、「なし」の分岐の意味は薄い

### F-10 #347 の語の揃えが、gate の補助ファイルに残っている

- `template/.claude/skills/gate/gates/G-1.md:11` が「本番到達・L2 以上」のまま(「AI自律レベル」が無い)。intake は templates/09 だけを確かめた。B16(手引きの文書)の範囲で拾う

### F-11 知識ベースの確認(観点5)は合格だが、rebase で再び落ちる

- `template/scripts/vendor/tailoring-kb.json` の source.commit 7e54b722 は本体の HEAD の祖先である(check-gate-criteria 通過)。`build-template-kb.mjs --print` の結果との差は source.commit の行だけだった。7e54b722 の後に変わった本文(gate-criteria.md・tailoring-guide.md・台帳)は、知識ベースの中身に影響しない。origin/main が push の前に進んで rebase すると、7e54b722 が履歴から外れる。#332 の検査が落とすので、そのときは再生成と template の再コミットが要る(設計どおり)

## 合格とした観点

- 1(#332): 争点1-1〜1-3 と一致している。条文は足していない。検査は配る側だけで、`--kb` の配布のジョブは従来の GITHUB_SHA の一致のまま。履歴を読めない・オブジェクトが無い場合は失敗にする(入力が無いことを一致として扱わない)。ADR-0157 の追記はステータスの節の中にある
- 1(#447): 5.4.5・5.5.4・5.4.7 の文は、回答 21・22 の範囲内にある(F-2・F-3 を除く)
- 1(B15 順 0・1・3・4・5): ADR-0184・IMPL-0303/0715/0718/1024・見出し・help・IMPL-0278(D-0 の作成前と変化点の受け付けでは出さない)・0760/0839(manual)・0959(manual、承認者を書かない)は intake のとおり。裁定に無い新しい義務は見つからなかった
- 2: delivered・machine の 0278・0988・0987 は、test= の試験が実在し、`IMPL-NNNN:ng/ok` の対を持つ(0988 は F-1 のとおり ok の正解そのものが誤り)
- 6: 本体・template の差分に AI の名義の追加は無い。0959 の節は承認者を書かず、決裁者が記名すると案内する
- 7: EV-0324(ADR-0184)と EV-0325(gate-criteria)は各1か所で、番号の重なりは無い(F-5 は内容の重なり)
