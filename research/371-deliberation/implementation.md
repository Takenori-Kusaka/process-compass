# #371 の実装の記録

裁定 `decision.md`(末尾の「実機の確認を受けた追加の裁定」AR-1〜AR-3 を含む)のとおりに実装する。実施日: 2026-11-05。本体と template はどちらも `git pull` で最新(本体 749ec89、template a93d0f5)を確かめてから着手した。番号は main の最大値(ADR-0114、EV-0232、IMPL-0454)から振った: ADR-0115、EV-0233、IMPL-0455〜0461。

## 進捗

- [x] 入力を読んだ(decision・agenda・survey-371-1-internal・probe-371・council-01-drafter、本体と template の CLAUDE.md、#373 の implementation.md)
- [x] 準拠テンプレートの実装(2 節)
- [x] 標準の本文・ADR-0115・EV-0233・IMPL(1 節)
- [x] 台帳と知識ベースの再生成(impl:write・evidence:write・scope:write・template:kb)
- [x] 検査(4 節)
- [x] コミット(本体はコミットまで。template は pit-in-template の main へ push し、submodule の参照を進めた)

## 0. 裁定に無い判断(実装の段で決めたもの。報告の対象)

| # | 判断 | 理由 |
| --- | --- | --- |
| J-1 | 基底から読む判定は、新しいワークフロー `gate-g5-base.yml`(ジョブの名前 `gate-g5-base`)で行い、既存の `gate-g5.yml` の `pr-rules` は PR の側に残した。必須チェックは `gate-g5` と `gate-g5-base` の2つにした | 裁定は「pr-rules 等を基底から読む」とする。`gate-g5.yml` から `pr-rules` を外すと、契約検査(IMPL-0142。集約の needs に pr-rules を要する)と既存の試験・回帰の場面が崩れる。PR の側の `pr-rules` は早い指摘として残り、害は無い(結果は信頼しないデータ)。統制の設定を変えない PR は判定のコードを変えられないため、PR の側の結果も同じ判定のコードで作られる |
| J-2 | 契約検査(`verify-gate-contract.mjs`)・テスト・静的解析ほかは PR の側のまま。基底から読む判定に入れたのは `check-pr.mjs`(PR 単位の検査と承認の照合)だけ | 契約検査は作業ツリーの定義を読む作りで、基底から PR をデータとして読む形への改修が大きい。統制の設定を変える PR は承認を要するため、PR の側で動く契約検査が書き換えられても、取り込みには AI維持管理者の承認が要る。裁定の「pr-rules 等」の「等」に契約検査を含めるかは、裁定が明示していない |
| J-3 | 承認を求める「統制の設定の変更」は、陰性の確認(3b)の対象と違い、基底に無いファイルの追加と削除も数える(`controlTouchedOf`)。依存の更新の bot の PR も対象にした | 新しいワークフローの追加(同じ名前のジョブ。E-3)を数えないと、承認を経ずに必須の検査を偽装する経路が残る。bot の PR はワークフローの action を更新するため、統制の設定の変更に当たる。**既存の採用者は、Dependabot がワークフローを更新する PR にも AI維持管理者の承認が要るようになる** |
| J-4 | 席の責任者が PR の作成者である場合(名簿に別の人がいる体制)は、別の名簿の人の承認(帰属の確認)で成立させた | 裁定 R-3 は1名の体制だけを書く。本人は自分の PR を承認できないため、2名以上の体制で AI維持管理者が作った変更を通す形が要る。ADR-0106 決定4 の (B)(記名者が作成者なら記名者以外の人の承認)と同じ形を使った。**名義を共有する AI の担い手が席の責任者のアカウントで PR を作った場合、別の人の承認で通る**(申告の無い共有は検出しない。既存の限界と同じ) |
| J-5 | 出荷の証跡の集約は、ADR-0115 の採用日(2026-11-05)より前にマージした変更の承認の欠けを欠落に数えず、別の件数で開示する。マージの時刻を読めない変更は採用日の後に数える | 規定の前に取り込んだ変更へ、後から承認のレビューを付ける手段が無い。境を置かないと、既存の採用者の出荷の範囲が急に止まる。#373 の採用日の境(`CL_RECORD_REQUIRED_SINCE`)と同じ型である |
| J-6 | env-check の3値の記録(`baseJudge`)は、全体の成否(`allOk`)と9項目に入れず、別の欄にした。`integrationId` の文を「区別されない。適合の手段に数えない」へ改めた | 裁定は3値の記録を求めるが、項目の4値に混ぜると、既存の採用者の env-check が「不一致」で未確認に倒れ、出荷の集約の項目4 が変わる。設定の値であり運用の有効性に代えないため、所見(findings)と同じ扱いにした |
| J-7 | IMPL-0459(record-copy の契機)を delivered にした | 前提(閉じた PR が PR の側の定義で動く E-5、`pull_request_target` が既定ブランチの定義で動く E-15)は実機で確かめた。ただし `pull_request_target` の `closed` で写しが置かれること、`gate-g5-base.yml` そのものの動作は、実機で動かしていない(確かめたのは同じ構造の確認用のワークフロー)。依頼の「実機で確かめた部分だけを delivered」の読み方で結果が変わるため、報告する |
| J-8 | IMPL-0460(E-7 の本題・E-12・E-13 に依る部分)の計画を `issue=371` にした | 後継の Issue が無い。#371 を閉じる前に、IMPL-0340 と IMPL-0460 の `issue=` を後継の Issue へ付け替える必要がある(implementation-marking.md「Issue を閉じる者は、その Issue を issue= に持つマークが 0 件であることを確かめてから閉じる」) |
| J-9 | 第1章 1.4 の用語の表に「判定のコード」を足した | 裁定は語の定義を求め、置き場を書いていない。G-5 の節の定義に加え、5.5.4 からも引くため、用語の表に置いた |
| J-10 | 第5章 5.5.4 には、判定の規則に判定のコードを含むことと G-5 への参照だけを足した。委任の判定が入力に読む `gate-g5` の真正性は変えていない | 起案の委員(R-2 理由4)は委任の判定の入力の真正性を指摘したが、裁定は 5.5.4 の改め方を書いていない。下の「申し送り」に置いた |

- 依頼の「ファイルの書き換えは Write または Edit で行う」に1か所反した。`aggregate-evidence.mjs` のコメントの IMPL の範囲を sed で直した(1行)。以後は Edit で行った

## 1. 標準の本文

| ファイル | 変えたこと |
| --- | --- |
| `phase4-process-design/gate-criteria.md` | G-5 に「判定のコードの読み元」(判定のコードの語、基底から読む要求、check run の形に限る、同じ名前・同じ送り手で出せる構成は外せない形に当たらない、送り手の固定を手段に数えない、手段の例、書き込みの権限を持つ処理を基底の定義で動かす、課さないと決めたこと)と「統制の設定の変更の承認(適用: 統制の設定を変える変更)」(本人の承認のレビュー、数値の識別子、本文の記名を数えない、向きに依らない、照らす場所2つ、作成者が席の責任者の場合、1名の体制の自己申告、満たせない構成の未達と env-check の3値、手段の例、push のパスの制限・マージのキューを手段に数えない)を新設した。EV-0233、IMPL-0455〜0460。「検査を外す変更の記録」に、受け入れはレビューで成立し記名を承認に数えないことを足し、IMPL-0143 の注記を改めた。効力を持つ記録の表に承認の記録を足した。G-7「保証の開示」の項目1 の箇条2つ(IMPL-0461)と記載の欠落の行を足した |
| `phase4-process-design/overview.md` | 1.4 の用語の表に「判定のコード」、効力を持つ記録の列挙に承認の記録を足した |
| `phase4-process-design/roles-responsibilities.md` | 3.11.2 の承認権限に、本人の承認のレビューで成立し本文の記名を数えないことを足した |
| `phase4-process-design/human-ai-boundary.md` | 5.5.4 の条件2 の箇条に、判定の規則が判定のコードを含むことと G-5 への参照を足した。5.5.7 の「規則そのものの変更の承認」に、統制の設定の変更として承認のレビューを要することを足した |
| `phase4-process-design/tailoring-guide.md` | 軸D に事前の同意の形(所有する組織が置くホスティングの規則と指名した者のレビュー、構成へ写さない、この形で確かめられない同意は未達)を足し、IMPL-0340 の注記を改めた(undelivered のまま) |
| `phase4-process-design/assurance-case.md` | H.6 の項目1 に、判定のコードの読み元の層と承認の内訳、出所を足した |
| `phase5-implementation/ci-gates.md`・`template-repository.md` | `gate-g5-base` と `record-copy` の契機、env-check の3値と送り手の固定の扱い(手引き。マークなし) |
| `adr/0115-g5-judgment-code-from-base-and-control-change-approval.md` | 新設。Issue 本文の誤り(IMPL-0334 → IMPL-0340、ADR-0086 → ADR-0087)、実機の確認の結果と確かめていない項目、採らなかった案、所有者の承認待ちの事項 |
| `adr/0087-...md` | ステータスの節にだけ、ADR-0115 が補った旨を追記した |
| `src/data/impl-targets.yaml` | 降ろし先 `gate-g5-base-workflow` を足し、`record-copy-workflow` の説明に契機を足した |
| `src/data/impl-inventory.yaml` | 新しい2節を marked(IMPL-0455・0459 / IMPL-0456・0457・0458・0460)で登録した |
| 台帳 | `impl:write`・`evidence:write`・`scope:write`・`template:kb` で再生成した |

### 実装マーク

| IMPL | 降ろし先 | 状態 | 何か |
| --- | --- | --- | --- |
| 0455 | gate-g5-base-workflow | delivered・machine | 基底から読む判定のワークフロー(定義の静的な試験) |
| 0456 | gate-g5-base-workflow | delivered・machine | PR の時点の承認の照合(check-pr 3c) |
| 0457 | evidence-aggregation | delivered・machine | 出荷の証跡の集約の照合と欠落 |
| 0458 | adoption-trial | delivered・machine | env-check の3値 |
| 0459 | record-copy-workflow | delivered・machine | record-copy を基底の定義で動かす(J-7) |
| 0460 | gate-g5-base-workflow | undelivered・manual(scheduled #371、見直し 2027-05) | 別のアカウントの承認(E-13)、コード所有者の基底の評価(E-7 の本題)、フォーク(E-12) |
| 0461 | evidence-aggregation | delivered・manual | 保証の開示の項目1 の行(出力の文は試験で固定していない) |
| 0340 | pr-checks | undelivered のまま | 注記を改めた(事前の同意の形を定め、機械は確かめない) |
| 0143 | pr-checks | delivered のまま | 注記に、記名を承認に数えないことを足した |

## 2. 準拠テンプレート template/

| ファイル | 変えたこと |
| --- | --- |
| `.github/workflows/gate-g5-base.yml` | 新設。`pull_request_target`、checkout は既定ブランチ(`persist-credentials: false`、submodule なし)、PR の先頭は `git fetch` だけ(認証は取得の間だけ環境変数のヘッダ)、権限は contents・pull-requests・issues の read だけ、秘密情報なし、結果はジョブ `gate-g5-base` の check run。`check-pr.mjs --head refs/remotes/pr/head --require-control-approval` を既定ブランチのコードで呼ぶ。PR の題名・本文は環境変数で渡す。PR へコメントを書かない |
| `.github/workflows/record-copy.yml` | 契機を `pull_request_target: closed` へ、checkout を既定ブランチへ(AR-2)。60 行目の誤ったコメントを直した。記録用ブランチへの push のため checkout の資格情報は残す(PR のコードは取り出さない) |
| `.github/workflows/gate-g5.yml` | 冒頭の注記と、contract のジョブに新しい試験2つを足した |
| `.github/rulesets/{checks-only,team,safety,regulated}.json`・`README.md` | 必須チェックに `gate-g5-base` を足し、README に節「必須チェック gate-g5-base」を足した |
| `scripts/gate/check-pr.mjs` | `CONTROL_FILES` に `.github/actions/**`・`.github/gate-node-version`。`controlTouchedOf`。`analyzePr` の `head`(PR の先頭を git の内容として読む。作業ツリーを読まない)と `requireControlApproval`(3c)。CLI の `--head`(取得した先頭とイベントの先頭の一致を確かめる)と `--require-control-approval` |
| `scripts/gate/material-attribution.mjs` | `controlApprovalBacking`(ADR-0106 の (A) と同じ書き手の条件、書き手ごとの最後の状態、名義の共有、作成者が席の責任者の場合、1名の体制の自己申告)と `CONTROL_APPROVAL_REQUIRED_SINCE` |
| `scripts/gate/aggregate-evidence.mjs` | `controlApprovalSummary`(承認の無い変更を欠落、自己申告と採用日より前は件数)。PR ごとの統制の設定のファイル。保証の開示の項目1 に3行(判定のコードの読み元の層、env-check の3値、承認の内訳)。evidence の `assurance.controls` |
| `scripts/gate/adoption-trial.mjs` | env-check に `baseJudge`(3値)。`integrationId` の文を改めた |
| `scripts/gate/org-assurance.mjs` | `baseJudgeOf`・`BASE_JUDGE_TEXT`。`readEnvCheck` が `baseJudge` を返す |
| `scripts/gate/verify-gate-contract.mjs` | ルールセットの必須チェックに `gate-g5-base` が無ければ失敗させる |
| `scripts/gate/preflight.mjs` | テンプレートのワークフローの一覧に `gate-g5-base.yml` |
| `scripts/gate/test-control-approval.mjs` | 新設(31 件)。承認の照合(本人の承認・無い・他の人・失効・識別子の食い違い・取り下げ・書き手以外の編集・席が無い・作成者が本人・1名の体制・bot)、CONTROL_FILES の追加、`--head`(作業ツリーは既定ブランチのまま PR の差分を読む)、強制層の変更で承認が無ければ落ちる、本文の記名だけでは落ちる、`.github/actions/**`・`.github/gate-node-version`・新しいワークフローの追加、PR の側の判定では照らさない、集約の欠落・自己申告・採用日 |
| `scripts/gate/test-base-judge-workflow.mjs` | 新設(19 件)。`gate-g5-base.yml` の静的な検査(契機・checkout の ref・資格情報・作業ツリーの切り替え・手元の action・依存の導入・秘密情報・permissions が read だけ・statuses なし・ジョブの名前・式展開・`--head`/`--require-control-approval`)と変異10種の検出。`record-copy.yml` の契機・checkout・merged の条件・コメント。ルールセットの雛形4本 |
| `scripts/gate/test-env-check.mjs` | 3値の場面(満たす / 必須でない / ワークフローが無い / pull_request で動く / 規則を読めない / 旧い記録) |
| `CLAUDE.md`・`.claude/skills/gate/gates/G-5.md` | 承認がレビューで成立し本文の記名を数えないこと、AI は承認のレビューを出さないこと、`gate-g5-base` |

- GitHub Security Lab「Preventing pwn requests」の注意への対応: PR のコードを checkout しない(作業ツリーは既定ブランチ。PR は fetch して git show・git diff で読む)、PR の側の手元の action・依存の導入・アダプタを使わない、題名・本文は環境変数で渡す、権限は read だけで秘密情報を使わない、資格情報を作業ツリーに残さない
- コミットのトレーラは `Spec: setup` と `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

### 既存の採用者への影響

- **ワークフローの変更**: `gate-g5-base.yml` が増える。`record-copy.yml` の契機が `pull_request` から `pull_request_target` へ変わる(マージした PR の写しの取り出しは同じ。閉じただけの PR では動かない)。どちらも強制層の変更であり、取り込む PR は AI維持管理者の承認を要する(取り込む前の旧い判定のコードでは照らされない)
- **ルールセットの雛形の変更**: 4本の必須チェックに `gate-g5-base` が増える。**適用し直すのは人**(`gh api -X PUT repos/<owner>/<name>/rulesets/<id> --input .github/rulesets/<ファイル>`)。適用し直すまで `gate-g5-base` は必須にならず、env-check が「満たさない」、保証の開示の項目1 に未達と出る。契約検査(verify-gate-contract)は、G-6 を適用する構成で雛形の JSON に `gate-g5-base` が無ければ失敗する(雛形を取り込めば満たす)
- **承認の要求**: 取り込んだ後、統制の設定(ワークフロー・検査のスクリプト・アダプタ・ルールセット・フック・権限・CODEOWNERS・`.github/actions/**`・`.github/gate-node-version`・閾値)を変える PR は、AI維持管理者が本人のアカウントで出す承認のレビューが無ければ `gate-g5-base` が落ちる。承認の後に `gate-g5-base` の実行を再実行する。Dependabot のワークフローの更新も対象(J-3)
- **名簿**: AI維持管理者の席の責任者の名簿に数値の識別子(`people[].accounts[].id`)が無い構成は、承認を照らせず落ちる。席が空の構成も落ちる
- **1名の体制**: 作成者が席の責任者本人で名簿に別の人がいなければ、自己申告として通り、集約が件数を出す
- **出荷**: 採用日(2026-11-05)より後にマージした統制の設定の変更に承認が無ければ、出荷の証跡の集約が欠落に数える(J-5)

### 所有者の承認待ちの事項

本件の準拠テンプレートの変更は、強制層の変更である。ADR-0115 決定3 により、AI維持管理者が本人のアカウントで承認する必要がある。pit-in-template の `main` へ直接 push したため、この承認を経ていない。AI維持管理者の席の責任者(所有者)の承認を待つ事項として記す。名簿・承認者の欄は人が書くため、ここには書かない。

## 3. #369 への条件の申し送り(呼び手がコメントする材料)

- **基底から読む型の所在**: 準拠テンプレートの `.github/workflows/gate-g5-base.yml`(`pull_request_target`、既定ブランチを checkout、PR の先頭は `git fetch origin +refs/pull/N/head` だけ、`check-pr.mjs --head` が git の内容として読む、権限は read だけ、結果は check run)。定義の静的な試験は `scripts/gate/test-base-judge-workflow.mjs`(関数 `baseJudgeWorkflowProblems` を写して使える)。標準の規定は第4章 G-5「判定のコードの読み元」、ADR-0115 決定1・2
- **AI レビューへの当てはめ**: AI レビューは PR のコードを実行しない判定に入るため、この型の上で、指示(`.claude/**` など)を既定ブランチの版から読む形にできる。`ai-review.yml` は今 `pull_request` で動き、`process.config.json` も PR の側から読む。yml が PR の側で動く限り、「基底から読む」手順そのものを PR が書き換えられる
- **プロンプトの注入の危険**: AI レビューは PR の題名・本文・差分をモデルへ渡す。変更の側の内容が、指示の上書き(プロンプトの注入)として働く。`pull_request_target` で動かすと既定ブランチの文脈のトークンと秘密情報(モデルの API の鍵)に届くため、注入によってそれらを使わせる経路が生じる。条件: 権限を read だけにし、書き込みが要るなら別のジョブへ分けて PR の内容に依らない入力だけを渡す。題名・本文を `run:` へ式展開しない。PR のコードを checkout しない。AI の確認を承認にも合否条件にもしない既存の規定(第5章 5.5.4 の箇条、附属書H H.4)を保つ
- **check run と commit status**: AI レビューの結果を状態として出す場合も、commit status は PR の側から上書きできる(実機の確認 E-4)。必須にしない既存の扱いを保つ
- **承認の要求**: AI レビューの指示や `ai-review.yml` を変える PR は統制の設定の変更であり、AI維持管理者が本人のアカウントで出す承認のレビューを要する(`.claude/**` は `.claude/settings.json`・`guard.json`・`hooks/**` だけが CONTROL_FILES。指示の置き場を CONTROL_FILES に足すかは #369 で決める)

## 3b. 実装の判断への裁定(J-3・J-5・J-7・J-8)と独立の突合への裁定(C-1〜C-11)への対応

入力: `decision.md` の末尾の2つの裁定、`crosscheck.md`、実装した版の実機の確認 `probe-371b.md`(F-1a〜F-5)。本体は 43e375c の上に積んだ。

| 裁定 | 対応 | 変えたファイル |
| --- | --- | --- |
| C-1・J-7 | 実機で確かめた部分だけを delivered にした。IMPL-0455(gate-g5-base の基底での実行と check run が上書きされないこと。F-1a・F-1b・F-4)、IMPL-0456(承認のレビューが無いとき・本文の記名だけのとき・意見のレビューのときに落ちること。F-2・F-4)、IMPL-0459(record-copy の closed 契機。F-3)。IMPL-0456 の note は、確認用のワークフローの E-4 と実装した版の F-2・F-4 を分けて書いた。別のアカウントの承認で通ること、承認の後の push での失効、1名の体制で本人の意見のレビューで通ること(F-5 の後に変えた振る舞い)は IMPL-0460(undelivered)に入れた | `gate-criteria.md` |
| C-2・J-5 | 規定を取り込む前かを、基底ブランチの第1親の連鎖で `gate-g5-base.yml` を初めて足したコミット(`controlRuleBoundary`)と、変更のマージのコミットの前後で決めるようにした。日付の定数 `CONTROL_APPROVAL_REQUIRED_SINCE` を外した。連鎖に無いコミット・浅い取得は規定の後(欠落の側)。境が無い構成はすべて規定の前。試験で、日付を偽った後のコミットが規定の後になることを固定した | `aggregate-evidence.mjs`、`material-attribution.mjs`、`test-control-approval.mjs`、`gate-criteria.md`(欠落の表・IMPL-0457)、ADR-0115 |
| C-3・J-8 | IMPL-0340・IMPL-0460 の `issue=` を 361 へ。`impl-inventory.yaml` の `issue: 371` はマークを付けた Issue の記録であり、計画の Issue ではないため残した | `gate-criteria.md`、`tailoring-guide.md` |
| C-4 | PR の時点の判定と集約が同じ関数 `controlTouchedBetween`(名前の変更の元、変更の前の版のアダプタの thresholdFiles、process.config.json の閾値の鍵)で範囲を決めるようにした。2つの範囲の一致を試験で固定した | `check-pr.mjs`、`aggregate-evidence.mjs`、`test-control-approval.mjs` |
| C-5 | 保証の開示の層の行を、出荷の時点の既定ブランチの `gate-g5-base.yml` の定義から導く(`baseJudgeLayers`。4層それぞれ満たす / 満たさない。ファイルが無ければ4層とも未達)。定義の読み方を `base-judge.mjs` へ切り出し、静的な試験・env-check・集約で共有した | `base-judge.mjs`(新設)、`test-base-judge-workflow.mjs`、`aggregate-evidence.mjs`、`impl-untraced.yaml`、IMPL-0461 |
| C-6 | 1名の体制の自己申告は、席の責任者本人のアカウントの PR の先頭へのレビュー(意見のレビューを含む)を数値の識別子で照らして成立させる。本文の記名・作成の事実だけでは通さない(F-5 の経路を塞いだ)。PR の時点の判定と集約の両方の試験で固定した。名義を共有する構成では、その操作が AI のものでありうることを注記と開示に出す | `material-attribution.mjs`、`test-control-approval.mjs`、`gate-criteria.md`、ADR-0115 決定5、ワークフローの冒頭 |
| C-7 | checkout は変えず(F-1a で確かめた形を保つ)、判定に使った定義(`GITHUB_SHA`)とスクリプト(checkout した先端)の版をジョブの要約に出し、違えば警告する手順を足した。限界を ADR の影響に書いた | `gate-g5-base.yml`、ADR-0115 |
| C-8 | 承認の取り下げ・変更要求が gate-g5-base を起動しない限界と、集約が事後に検出することを、ワークフローの冒頭と ADR の影響に書いた | `gate-g5-base.yml`、ADR-0115 |
| C-9 | env-check の「満たす」に、定義の中身(静的な試験と同じ観点)の確認を足した。PR の先頭を checkout する定義は「満たさない」。IMPL-0458 の note に、実際の振る舞いを確かめないことを書いた | `adoption-trial.mjs`、`test-env-check.mjs`、`gate-criteria.md` |
| C-10 | 専用の App の鍵の却下を「採らなかった案」から外し、「決定の外」の節に書いた | ADR-0115 |
| C-11 | 準拠テンプレートの main への直接の push が所有者の作業の指示にもとづき、採用者のリポジトリの承認の手続と別であることを状態の節に書いた | ADR-0115 |
| F-3 | マージした PR が書き換えた写しの手順がその PR 自身の写しに使われる経路を、残る経路として標準(判定のコードの読み元の箇条、G-7 の項目1 の箇条)・ADR(決定7)・保証の開示の項目1 の定型の文に書いた | `gate-criteria.md`、ADR-0115、`aggregate-evidence.mjs` |

- 新しい裁定に無い判断: K-1 IMPL-0457(集約)・IMPL-0458(env-check)・IMPL-0461(開示の行)は delivered のままにした。実機の確認(probe-371b)は集約と env-check を動かしていない。集約は記録用ブランチの写しとホスティングの記録を読む既存の経路の上の照合で、env-check は既存の項目と同じ API を読む。依頼の「実機で確かめた部分だけを delivered」の列挙に入っていないため、報告する。K-2 C-7 は `ref: ${{ github.sha }}` へ替えなかった。替えると F-1a・F-3 で確かめた checkout の形が変わり、実機で確かめていない版になるため
- 試験: test-control-approval.mjs 40 件、test-base-judge-workflow.mjs 25 件、test-env-check.mjs に1場面
- 試験の結果: テンプレートの試験一式(Windows)は test-g5-aggregate.mjs(CRLF による既知の失敗)を除いて通過。WSL で test-env-check.mjs(63 件)・test-g5-aggregate.mjs(23 件)・test-control-approval.mjs(40 件。TZ=UTC でも通過)・test-base-judge-workflow.mjs(25 件)は通過。回帰スイート(WSL、--kb keep)は通常の時刻帯と TZ=UTC の両方で全本が通過(WSL の作業の場所が消えていたため作り直した)。npm run check の各段(test:template-suite と test:regress を除き Windows で個別に実行)、lint:text・lint:provisions・build はすべて通過

## 4. 本件で直さず申し送ること(裁定の外)

- **委任のマージと必須の検査**: 委任の判定(`check-delegation.mjs`)は、PR の先頭の check run を名前で読み、`gate-g5` の通過を見る。`gate-g5` は PR の側の定義で作られる(起案の委員 R-2 理由4)。委任のマージのトークン(`DELEGATED_MERGE_TOKEN`。必須の承認を回避できる権限)が、必須の検査 `gate-g5-base` の失敗も回避してマージできるかは確かめていない。統制の設定を変える変更が委任の範囲(R3 の登録した変更種別)に入らないことは、規則の登録の側に依る。後継で、委任の判定が `gate-g5-base` の成功を条件に読むかを決める
- **出荷の証跡の集約の G-5 の結果**: 集約は PR ごとに `gate-g5` の結果を見て、成功でない PR を欠落に数える。`gate-g5-base` の結果は見ない(承認の照合は集約の側で別に行う)
- **ship-evidence の verify**: `ref:` を PR の中で替えられる(E-6)。verify は必須の検査ではない(#379 P-5)。裁定に無いため変えていない
- **gitlink を含む PR**: fetch の振る舞いを確かめていない(E-11 の範囲)
- **#371 を閉じる前**: IMPL-0340 と IMPL-0460 は `issue=371` を持つ。後継の Issue を起票して付け替える(J-8)

## 5. 試験と検査の結果

- 準拠テンプレートの試験一式(本体の test:template-suite。Windows): test-g5-aggregate.mjs(CRLF による既知の失敗)を除いて通過。新しい test-control-approval.mjs(31 件)・test-base-judge-workflow.mjs(19 件)は通過。test-env-check.mjs は Windows では省かれる(WSL の結果は下)
- npm run check の各段(test:template-suite と test:regress を除き Windows で個別に実行): lint:ci・lint:tone・lint:evidence・lint:impl・lint:scope・lint:refs・lint:provisions・lint:skills・lint:figures・brand:check・lint:sources・lint:citations・test:citations・test:edition・lint:registry・test:registry・test:engine・lint:stage-table・test:impl・test:ci-wiring・test:template・test:fields・test:criteria はすべて通過
- lint:text: 通過。build: 通過(346 ページ)
- WSL: 回帰スイート(--kb keep)は通常の時刻帯と TZ=UTC の両方で全本が通過(落ちた 0、印 0)。test-env-check.mjs(62 件)・test-g5-aggregate.mjs(23 件)・test-control-approval.mjs(31 件。TZ=UTC でも通過)・test-base-judge-workflow.mjs(19 件)は通過
- graphify の更新は行っていない(main への push で自動の更新が走る)
- コミット: 本体 cea873e(標準の本文)と submodule の参照の更新(push していない)。準拠テンプレート ba2b7e8(pit-in-template の main へ push 済み。トレーラ Spec: setup)
