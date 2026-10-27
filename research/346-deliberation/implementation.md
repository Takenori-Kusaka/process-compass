# 実装の記録(#346 ジョブの権限で発行される短命のトークンと、G-8「配備の統制と資格情報の置き場」)

入力: `decision.md`(議長の裁定 R-1〜R-5、却下の一覧、後継の Issue、7節の突合の項目)。記録先の ADR は ADR-0090(`src/content/docs/adr/0090-job-token-and-deploy-credential-binding.md`)。委員の文案(`council-01`〜`05`)と調査(`survey-346-1`・`survey-346-2`)は、裁定と食い違う箇所では裁定に従った。

## 1. 裁定の各項目との対応

| 裁定 | 項目 | 対応 | 所在 |
| --- | --- | --- | --- |
| 0 | 「起動者が既に持つ能力を超えない」を採らない(3経路) | ADR-0090 決定1 に3経路と「保護の無い配布先だけが適合になる」を書いた | ADR-0090 |
| R-1 の1 | (a) 参照に限った配備の環境の秘密情報 / (b) 参照・配備の環境を確かめてから発行・受理する短命の資格情報 | G-8 の節を書き直した。(b) は「確かめる側が無い場合は当たらない」を括弧で持つ | `phase4-process-design/gate-criteria.md` G-8「配備の統制と資格情報の置き場」 |
| R-1 の2 | GITHUB_TOKEN は短命でも (a)(b) に当たらない | 同節に太字で明記。「有効期間が短いことを、参照への結び付きの代わりにしません」 | 同上 |
| R-1 の3 | 短命は推奨で要求事項にしない | 同節に「推奨であり、要求事項ではありません」。(a) で長期の鍵を置く構成も満たすと書いた | 同上 |
| R-1 の4 | 未達を「手段が無い」「手段はあるが使わないと決めた」の2区分へ。決定は人が記名、AI の名義にしない。記録の3項目 | 同節の箇条2つと記録の3項目 | 同上、ADR-0090 決定2 |
| R-1 の5 | (b) を新しい EV(E1)で開示。EV-0137 は再利用しない | EV-0184(E1、見直し 2027-10)を G-8 の節に置いた | 同上 |
| R-2 | 「GitHub には、このトークンの書き込みを参照で限る機能はありません(2026-10 時点の GitHub Docs)」 | `ci-gates.md` の理由の段落に置いた(出典 SRC-0701・0702・0705) | `phase5-implementation/ci-gates.md`「統制と資格情報の置き場」 |
| R-2 | 対応表の8行(止める・止めない・監査で読む値) | 措置の表を新設。裁定の8行に、(a) の行と「Actions による PR の作成・承認を無効」(品質保証の委員)と「主体の資格情報から管理者の権限と workflow の範囲を外す」(裁定 R-2 の主体の側の統制)を足した。区分の列で (a)(b) の2行だけを適合の手段とし、ほかを狭める措置とした | 同上 |
| R-2 | 899 行の「ファイルの外の設定だけが、この経路を止めます」の訂正 | 「リポジトリの秘密情報への経路は、ファイルの外の設定が止めます。GITHUB_TOKEN の書き込みは、ファイルの外のどの設定でも止まりません」へ改めた | 同上 |
| R-2 | 1.4 に3語。一般の語「資格情報」は定義しない。3.5.3 の「認証情報」との関係を注記 | 「配備の資格情報」「配備の環境」「参照に結び付いた資格情報」を「検出の層」の行の後に足した。注記は「配備の資格情報」の行の中 | `phase4-process-design/overview.md` 1.4 |
| R-2 | G-8 と ci-gates の「実行環境」を「配備の環境」へ。5.8.6 などは変えない | G-8 の節と ci-gates の当該節(本文・表・EV-0137)を置き換えた。全文の grep で、配備の文脈の「実行環境」が他に残らないことと、5.8.6・成果物の様式の用法を変えていないことを確かめた | 同上 |
| R-2 | IMPL-0237 と `deploy-workflow` の説明を本文の範囲へ | 両方を「既定ブランチ、またはリリースのタグ」と2つの形へ改めた | `gate-criteria.md`、`src/data/impl-targets.yaml` |
| R-2 | 「`.github/workflows` を変えるコミットの push には workflow の範囲が要る」を一次資料で確かめる | GitHub Docs の OAuth の範囲の表(SRC-0720)と個人のアクセストークンの頁(SRC-0721)で確かめた。範囲の説明は「Grants the ability to add and update GitHub Actions workflow files.」。同じパスと内容のファイルが同じリポジトリの別のブランチにあれば範囲なしでコミットできる例外も同じ表にあり、表の「止めないもの」に書いた。確かめられたため EV は付けていない | `ci-gates.md` の表と箇条 |
| R-3 | 条項に合わせる変更はしない。区分「手段はあるが使わないと決めた」、決定者は保守者 | プロジェクト運営に「標準の規定との関係」の節を新設し、区分・決定者・決定の中身・記録の3項目を書いた | `community/project-management.md` |
| R-3 | 鍵を使わずに適合する道は配布の経路の変更だけ。後継の Issue の候補 | 同節と ADR-0090 決定5・8 | 同上 |
| R-3 | リモートの実状(旧 publish-standard.yml、ルールセット空)に開示を合わせる | 「リモートの実状(2026-10-27)」の節を新設。経路の表の Environment とルールセットの行に「所有者の設定の後」を足した | 同上 |
| R-3 | 所有者の設定の順序つきの一覧と監査で読む値。設定済みと書かない | 「所有者が行う設定(順序つき)」の表(7行)。冒頭に「2026-10-27 時点で、どれも設定済みとは確かめていません」。記録の宛先を #293 から #346 へ改めた | 同上 |
| R-3 | EV-0137 の差し替え条件を対の確認へ。(b) は使い捨ての参照で。(a) だけを適合の証拠にしない | EV-0137 の対象・差し替え条件・本文を書き直した | `ci-gates.md` EV-0137 |
| R-4 | 採用者への指針は R-1 の文と ci-gates の表 | ci-gates に採用者の段落を置いた | `ci-gates.md` |
| R-4 | テンプレートにデプロイの雛形は足さない。意図した省略。IMPL-0237 は undelivered のまま | ci-gates の準拠テンプレートの段落と ADR-0090 決定6 に意図した省略と理由を書いた。IMPL-0237 は undelivered のまま、計画を `plan=adopter decision=ADR-0090` へ改めた(2節の逸脱1) | `gate-criteria.md`、ADR-0090 |
| R-4 | env-check が Workflow permissions の既定・Actions による PR の承認・Environment の配備の参照の限定を読む。読めなければ未確認で通過にしない。適合の判定に使わず事実として出す。新しい実装マーク | `template/scripts/gate/adoption-trial.mjs` と `org-assurance.mjs` に3項目を足した。IMPL-0351(adoption-trial、machine、test=template/scripts/gate/test-env-check.mjs)。試験に `IMPL-0351:ok`(適合の応答は確認済み)と `IMPL-0351:ng`(403 は未確認・終了コード 1)を別の行に置いた | `gate-criteria.md` G-8、テンプレート |
| R-4 | テンプレートの最上位の書き込み権限と `delegation.yml` の検査は後継の Issue | 扱っていない。5節の下書き2 | — |
| R-5 | ADR-0090。ADR-0077 決定6 の「標準」の段落を一部置き換え。ADR-0077 のステータスの節から相互参照。「#293 で別に扱う」を決着 | ADR-0090 を新設。ADR-0077 はステータスの節に1段落を足しただけ(本文は変えていない) | ADR-0090、ADR-0077 |
| R-5 | b185611 が会議体と突合を経ていないことを事実として記録 | ADR-0090 のコンテキストに太字で書いた | ADR-0090 |
| R-5 | `research/293-deliberation/implementation.md` は書き換えず、日付つきの追記の段落だけ | 末尾に「追記(2026-10-27、#346)」を足した | 同ファイル |
| R-5 | 公開の記録は「保守者の決定(2026-10-23)」と中身。原文は `research/` にだけ | ADR-0090 とプロジェクト運営は、決定の中身(鍵を設定しない・ジョブの権限で書く・ルールセットで更新を制限しない)だけを書いた。原文は引いていない(3節の注意1) | 同上 |
| R-5 | 本件で決めないことの明記 | ADR-0090 決定8 に4つを列挙した | ADR-0090 |
| 却下の一覧 | 9件を ADR-0090 に理由とともに | 「検討した選択肢」に9行すべてを書いた | ADR-0090 |

### 出典

外部の調査の文献と、裁定 R-2 の確認・env-check の実装で読んだ文献を SRC-0700〜SRC-0723 として登録した(cluster I346、themes TH10・TH12、verification partial / agent-read、accessed 2026-10-27)。SLSA v1.2 Source(SRC-0416)と OpenSSF Scorecard(SRC-0574)は既にあり、重複させていない。`npm run lint:sources` は問題なし。`npm run sources:index` で索引を再生成した。

| SRC | 文献 |
| --- | --- |
| 0700〜0702 | GitHub Docs: GITHUB_TOKEN / Workflow syntax(permissions)/ Managing GitHub Actions settings for a repository |
| 0703・0704 | GitHub Changelog: 既定の read 化(2023-02-02)/ pull_request_target と Environment のブランチ規則(2025-11-07) |
| 0705・0706 | GitHub Docs: Deployments and environments / Available rules for rulesets |
| 0707 | GitHub Community Discussion #25305(一次資料ではない。補助) |
| 0708〜0710 | GitHub Changelog: ワークフロー実行の保護(2026-06-18 プレビュー・2026-09-17 一般提供)/ 2026 のセキュリティの計画 |
| 0711・0713 | actions/create-github-app-token・actions/deploy-pages の README |
| 0712 | GitHub Docs: OpenID Connect reference |
| 0714〜0719 | OWASP Top 10 CI/CD / SLSA v1.0 Build / NSA・CISA CI/CD / GitHub Secure use / NIST SP 800-218 / NIST SP 800-204D |
| 0720・0721 | GitHub Docs: Scopes for OAuth apps / Managing your personal access tokens(裁定 R-2 の確認) |
| 0722・0723 | GitHub REST API: Actions permissions / deployment environments(env-check が読む値の所在) |

### 再生成と検査

- `npm run evidence:write`(EV-0184 の追加と EV-0137 の改め)・`npm run impl:write`(IMPL-0237 の改め、IMPL-0351)・`npm run scope:write`(変更なし)・`npm run sources:index`・`npm run template:kb`
- `src/data/impl-inventory.yaml` の G-8 の節の登録へ IMPL-0351 を足した
- `npm run check`: 通過
- 準拠テンプレートの試験(`scripts/gate/test-*.mjs` の19本。`test-results.mjs` は引数を要する報告の手順のため除く)と `check-process-rules`・`verify-gate-contract`: すべて通過。`test-env-check` は 31 件
- graphify は環境に無いため `graphify update .` は実行していない

## 2. 裁定からの逸脱・裁定に書かれていない判断と、その理由

1. **IMPL-0237 の計画を `plan=scheduled issue=346` から `plan=adopter decision=ADR-0090` へ改めた**。裁定は「IMPL-0237 は undelivered のまま」とし、雛形を足さないことを意図した省略とした。#346 を閉じると、`issue=346` は降ろす予定の無い Issue を指し続ける。降りていない状態(`state=undelivered`)は変えず、台帳にも出続ける。採用者がデプロイのワークフローを足すときに確かめる規定として、`check=manual` の確かめる者を「採用者」にした
2. **ci-gates の措置の表に、裁定の8行の外の3行を足した**。(a) の行(適合の手段の対として要る)、「Actions による PR の作成・承認を無効」(裁定の0節が3経路の1つに挙げ、R-3 の所有者の設定4 と R-4 の env-check が読む値)、「主体の資格情報から管理者の権限と workflow の範囲を外す」(裁定 R-2 の最後の箇条が「狭める措置として表に書く」とした)。いずれも区分は狭める措置で、適合の手段に数えていない
3. **env-check の Environment の項目で、Environment が1つも無い場合を対象外にした**(突合 X-7・裁定 §8 で改めた。後掲 §8)。裁定は対象外を定めていない。委任のマージを使わず配備もしない採用者には確かめる対象が無いため、既存の4値の扱い(対象外は確認済みに数えない)に合わせた。読む側(`readEnvCheck`)も、記録の Environment の一覧が空の場合だけ対象外を受け入れる。委任を許す構成で `delegated-merge` が無いことを不一致にする案は採らなかった。構成の `delegation.allowed` は、マージのジョブを有効にする変数(`DELEGATED_MERGE_ENABLED`)と別で、委任を許すがマージを有効にしない構成を誤って不一致にするためである。Environment を作らずにマージのジョブが走れば、保護の無い Environment が自動で作られ、次の env-check で「配備の参照の限定が無い」と出る
4. **env-check の値の判定**。裁定は「事実として出す」とした。既存の4値に合わせ、狭める措置が掛かっていれば確認済み、掛かっていなければ不一致と書き、各項目の説明に「G-8 の適合の判定には使わない(狭める措置の事実)」を書いた。Environment の「保護されたブランチだけ」の設定は、既定ブランチ・リリースのタグに限る形ではないため不一致とした。管理者の迂回の可否は事実として説明に書き、判定に使っていない(応答に欄がある場合だけ)
5. **テンプレートの `CLAUDE.md` は変えなかった**。env-check の確かめる項目の例示に「配備の統制を狭める措置」を足す編集を試みたが、常駐の規則の照合(`claude-md-resident.json`)が失敗した。例示の追記のために常駐の規則の照合を更新することは、規則の変更の手続(強制層の縮小・変更)に当たるため採らず、編集を戻した。項目の一覧は README・スキル・様式・フェーズ5 の頁にある
6. **1.10 の「実環境の統制の確認と、導入前の検証の結果」の確かめる項目に、狭める措置の3つを足した**。裁定は env-check に読ませることを決めたが、標準の本文の要求事項(確かめて記録する項目)に書かなければ、テンプレートが標準の部分集合でなくなる。G-8 の適合の判定に使わないことを同じ箇条に書いた

## 3. 注意(所有者へ)

1. **`research/346-deliberation/` には、所有者の指示の原文(`issues-context.md` ほか、調査と意見書の引用)がある**。裁定 R-5 は「原文は `research/` にだけ置く。原文を公開するかは所有者が決める」とした。本リポジトリは公開であり、`research/` もリモートへ push すれば GitHub 上で読める。前例(#318・#319)に合わせて `research/346-deliberation/` をコミットしたが、push は所有者の判断を待つ。公開しない場合は、push の前に原文の箇所を除く必要がある
2. 開示(プロジェクト運営・ADR-0090)は 2026-10-27 時点のリモートの実状(`survey-346-1-internal.md` の 3.4)に基づく。所有者が設定を済ませたら、設定の記録を #346 に残し、開示の「リモートの実状」の節を改める
3. テンプレートの変更は強制層(`scripts/gate/**`・`.claude/skills/**`)に当たる。取り込みは AI維持管理者の承認を要する(`state:needs-platform`)。統制の弱化に当たる変更は無い(確かめる項目を足す向き。旧い記録は足した3項目が未確認へ倒れる)

## 4. 所有者の設定の一覧(#346 へ書き込む文の案)

以下は、Issue #346 へ書き込むコメントの案です(AI は書き込んでいません。設定もしていません)。

> #346 の裁定(ADR-0090)により、本リポジトリの配布は G-8 を満たさない「未達(手段はあるが使わないと決めた。決定者: 保守者)」として開示を続けます。開示はリモートの実状(旧 `publish-standard.yml` が動き、ルールセットが空)に合わせました。経路を狭めるため、次の設定を順に行い、各項目の値をこの Issue に記録してください。設定は所有者が行います。
>
> 1. **2 より前に**、Environment `dist-standard` を作り、配備のブランチを「Selected branches」で `main` だけに限る。管理者の迂回を外す。必須レビュアと秘密情報は置かない。`github-pages` も `main` に限る。
>    - 記録する値: `gh api repos/Takenori-Kusaka/process-compass/environments/dist-standard`(`deployment_branch_policy`)、同 `…/environments/dist-standard/deployment-branch-policies`、`github-pages` の同じ2つ、管理者の迂回の設定の画面
> 2. #293 以降の変更をリモートの `main` へ入れ(テンプレートの変更を先に template の `main` へ入れ、submodule の指す先を合わせる)、旧い `publish-standard.yml` と `deploy.yml` が消えたことを確かめる。
>    - 記録する値: リモートの `main` の `.github/workflows/` の一覧
> 3. `dist/standard` にルールセットを置く。削除の禁止と強制 push の禁止を有効にし、更新の制限は有効にしない。バイパスは空にする。鍵を置かない前提のもとでは、迂回を許す結び付いた資格情報が無いため、この設定でも G-8 の (c)(配備先が結び付いた資格情報以外からの書き込みを拒む)は満たせない。
>    - 記録する値: `gh api repos/Takenori-Kusaka/process-compass/rules/branches/dist%2Fstandard` と、そのルールセットの `bypass_actors`
> 4. Settings → Actions → Workflow permissions を read にし、「Allow GitHub Actions to create and approve pull requests」を無効にする。
>    - 記録する値: `gh api repos/Takenori-Kusaka/process-compass/actions/permissions/workflow`(`default_workflow_permissions: read`、`can_approve_pull_request_reviews: false`)
> 5. AI のセッションに渡す資格情報から、管理者の権限と `workflow` の範囲(fine-grained のトークン・GitHub App では Workflows の権限)を外す。
>    - 記録する値: 渡した資格情報の種類・範囲・権限
> 6. ワークフロー実行の保護で、`push` と `workflow_dispatch` を起動できる主体を限れるかを評価する(個人所有の公開のリポジトリで使えるかは未確認)。限れても、G-8 を満たす手段には数えない。
>    - 記録する値: 評価の結果と、設定した場合のルールセットの API の応答
> 7. 1〜6 の設定と、対の確認の記録を残す。(a) Environment `dist-standard` を参照するジョブが `main` 以外から拒まれた記録。(b) `environment:` を外して `contents: write` を宣言したワークフローが、使い捨ての参照(例: `dist/test-346`)へ書き込めたかの記録。`dist/standard` そのものでは試さない。(a) だけを統制が成り立つ証拠に数えない。
>
> 5 が最も効く措置です。管理者の権限を持つ主体には、ブランチ上のワークフローを経る必要がなく、`dist/standard` へ直接 push でき、Environment とルールセットも変えられます。

## 5. 後継の Issue の下書き(起票しない。起票は人の了承を得てから)

### 5.1 配布の経路を、受け手が出どころを確かめられる形へ変えるか

- 背景: #346 は、本リポジトリの `dist/standard` への配布を G-8 の未達(手段はあるが使わないと決めた)として開示した(ADR-0090 決定5)。鍵を使わずに G-8 を満たす道は、配布の経路を変えることだけである
- 問い: (1) 配布物を GitHub Pages の下に置く(`github-pages` を `main` に限れば、GitHub が OIDC で参照を確かめる)か。(2) `dist/standard` を残し、成果物の来歴の証明(artifact attestation)を付け、採用者に確かめさせるか。(3) `dist/standard` の各コミットを、`main` への push の成功した CI の実行と突き合わせる定期の検査を置くか(品質保証の委員の案)
- 制約: 採用者は `dist/standard` を submodule で固定して取り込む。経路の変更は、テンプレートと submodule の利用者が頼るインタフェースを変える(人へ戻す (b))。所有者が決める
- 関連: ADR-0090、ADR-0077 決定4・6、ADR-0052 決定1・2、EV-0137

### 5.2 準拠テンプレートの workflows の最小権限

- 背景: テンプレートの `delegation.yml`(`pull-requests: write`・`statuses: write`)・`gate-g5.yml`・`ai-review.yml`・`gate-entry.yml`・`context-drift.yml` は、書き込みの権限を最上位に置いている。本リポジトリの `check-ci-wiring` の条件5(最上位で書き込みを与えない)に当たる検査は、テンプレートに無い。`delegation.yml` は `pull_request_target` と `workflow_run` を持ち、既定ブランチのファイルが書き込みのトークンで fork の生成物・本文を扱う
- 問い: 最上位の書き込みの権限をジョブ単位へ下ろすか。`pull_request_target`・`workflow_run` で PR の側の本文・生成物を実行しない・評価式へ埋め込まないことを、機械で確かめるか(OpenSSF Scorecard の Dangerous-Workflow と同じ観点)
- 位置づけ: 最小権限の衛生であり、G-8 の資格情報の置き場とは別の論点(裁定 R-4)。ジョブ単位へ下ろしても、ブランチ上の昇格は止まらないため、統制には数えない
- 関連: ADR-0090 決定8、SRC-0574(Scorecard)、SRC-0717(Secure use)

### 5.3 「実行環境」「資格情報」「認証情報」の語の統一

- 背景: ADR-0090 は、G-8 とフェーズ5 の配備の文脈の「実行環境」を「配備の環境」へ改め、1.4 に配備の語を3つ足した。一般の語「資格情報」は定義していない。第3章 3.5.3 は「認証情報」を、第5章 5.8.6 と成果物の様式は「実行環境」を AI エージェントの環境の意味で、第4章 G-5 の基準7 は「資格情報」を混入した秘密の意味で使う
- 問い: 3語の範囲を全章で揃えるか。揃えるなら、どの語を基に、どの用例を改めるか
- 位置づけ: 決めていない事項(課さないと決めたのではない)
- 関連: ADR-0090 決定3

### 5.4 関係する Issue への書き置き(下書き)

- #293: 方式の変更(`b185611`)は #346 で事後に審議した。所有者の設定の記録の宛先は #346 へ移した。`research/293-deliberation/implementation.md` に日付つきの追記を足した
- #361(IMPL-0324、G-8 の判定ごとの実環境の読み取り): env-check が狭める措置の3項目を読むようになった(IMPL-0351)。出荷の集約が実環境を読み直す設計に、同じ3項目を含めるかを扱う

## 6. コミット

- 準拠テンプレート(`template/`、ブランチ `claude/process-compass-346`): `904f41c`
- 親(ブランチ `work/346`): 本ファイルを含むコミット(SHA は引き渡しの報告に書く)
- push はしていない

## 7. 次に使える識別子

EV-0174・IMPL-0346・SRC-0724

## 8. 突合(crosscheck.md)への裁定(decision.md §8)への対応

議長は突合の指摘(高1・中8・低6)と裁定への指摘 D-1〜D-4 をすべて採りました。§8 を拘束力のある文として、次のとおり直しました。

| 項目 | 対応 | 直した所在 |
| --- | --- | --- |
| X-1・D-1 | 直した。G-8 に (c)(ジョブのトークンなどが配備先に届く場合、配備先は参照に結び付いた資格情報以外からの書き込みを拒む)を足し、「(c) を満たさない構成は (a)(b) を用いていても満たさない」と書いた。(c) は配布用のブランチの保護を独立の要求事項にするものではないことも同じ段落に書いた。未達の「手段が無い」と記録の項目1 に (c) の欠如を足した | `gate-criteria.md` G-8、`ci-gates.md`(適合の手段の行 (c) を足し、表の前文を「(a)(b) のどちらかと (c) が揃って」へ)、ADR-0090 決定1・決定4・影響、1.4 の「参照に結び付いた資格情報」、IMPL-0237 の注記、`impl-targets.yaml` の `deploy-workflow` |
| X-2・D-2 | 直した。(b) の「配備の環境を確かめる」を、配備を許す参照に限った配備の環境に限った。Environment を参照したジョブの OIDC の `sub` に参照が入らないことを理由に書いた | `gate-criteria.md` G-8、1.4、`ci-gates.md` の (b) の行と対応の表、ADR-0090 決定1 |
| X-3・D-3 | 直した。EV-0184 の差し替え条件を対の確認(受け手が既定ブランチ以外の発行を拒むこと、`environment:` を外したジョブの発行が受理されないこと)へ改め、拒まれた記録だけを証拠に数えないと書いた | `gate-criteria.md` の EV-0184、ADR-0090 決定1 |
| X-4 | 直した。開示から「トークンは新しい能力を足さない」を消した。3つの経路(PR の自己承認・権限の昇格・名義の消失)を開いている経路として書き、(c) の欠如を足した | `project-management.md` |
| X-5・D-4 | 直した。env-check はタグの規則についてタグのルールセット(作成の規則・迂回なし・有効。パターンは完全一致か `~ALL`)を読み、任意のタグ(`*` など)と作成の限定の無いタグの規則を不一致にする。読めなければ未確認 | `template/scripts/gate/adoption-trial.mjs`、試験、README の節8、スキル、`template-repository.md`、IMPL-0351 の注記、ADR-0090 決定6 |
| X-6 | 直した。M5(識別の鍵 `environmentIds` を欠く確認済み)・M6(`protected_branches: true`)・M7(`delegated-merge` を外した `feature/*` だけ)・M8(空の規則)を落とす場面を足した。判定は構造の値 `evidence.findings`(`environment`・`kind`・`value`)に残し、照合はこの値で行う。読む側は `findings` が空でない確認済みを未確認に倒す | `test-env-check.mjs`、`org-assurance.mjs` の `ENV_EVIDENCE_KEYS` |
| X-7・D-4 | 直した。Environment の有無に依らず、リポジトリの秘密情報と変数の名前(値は読まない)を読み、`DELEGATED_MERGE_TOKEN` があれば不一致。名前を読めなければ未確認。対象外は、Environment が無く、2つの名前の一覧を読めて、委任のトークンが無い場合だけ。読む側の `envNotApplicableRefusal` も同じ条件にした。組織の秘密情報は読まない(§8 が「リポジトリの秘密情報と変数」と定めたため。説明の文に同じ行で書いた)。§2 の逸脱3 は、これで改めた | `adoption-trial.mjs`、`org-assurance.mjs`、試験、README、スキル、`template-repository.md` |
| X-8 | 直した。`adoption-guide.md` の 465 行(記録の様式の節3)と 501 行(要件⑦の写し)を9項目へ、`template-repository.md` の EV-0168 の対象と差し替え条件を「9項目」へ改め、台帳を作り直した。`template-repository.md` の要件⑦の行の列挙にも足した3項目を書いた | `adoption-guide.md`、`template-repository.md`、`evidence-ledger.md`(生成) |
| X-9 | 直した。`workflow` の範囲を外す措置の「止めないもの」に、既存のワークフローが実行するブランチ上のスクリプト・依存の変更を足した。本リポジトリで `contents: write` を持つジョブ(`publish`・`graphify-update`)は `main` の push に限ることを開示に添えた | `ci-gates.md`、`project-management.md` |
| X-10 | 直した。Restrict file paths を「GitHub Team 以上の internal・private のリポジトリ(と、その fork)に限り、公開のリポジトリでは使えない」へ改め、SRC-0706 の summary と claim c2 を Docs の文に合わせた | `ci-gates.md`、`research/sources/SRC-0706.yaml` |
| X-11 | 直した。(a) の行の「止めないもの」に、既定ブランチの定義で走る `pull_request_target`・`workflow_run` が PR の中身を実行する経路(SRC-0704)を足し、後継の Issue(テンプレートの最小権限。§5.2)を指した | `ci-gates.md` |
| X-12 | 規約の側を直した。`implementation-marking.md` の規則を「ADR-0084 決定4 の表、または `decision=` が指す ADR」へ改めた。理由: ADR-0084 は採用済みで本文を書き換えられず、新しい `plan=adopter` の理由をその表へ足せない。この規約の改めを ADR-0090 の影響に書いた。ADR-0090 決定6 に「採用者に求めること」を1段落で書いた | `implementation-marking.md`、ADR-0090 決定6・影響 |
| X-13 | 直した。env-check の一覧(Environment・配備の参照・秘密情報と変数・タグのルールセット)を `per_page=100` のページ送りで全件読み、読めた件数が `total_count` と合わなければ未確認にする。配列で返る一覧は、100件に満たない頁で終える | `adoption-trial.mjs` の `ghPaged`、試験 |
| X-14 | 直した。ADR-0077 のステータスの1行目を「採用(2026-10-23)。一部置き換え(→ ADR-0090 の決定1・2): …」の形にした。「採用済みの ADR の決定を置き換えない」は、採用の時点で ADR-0033・ADR-0052 に対して述べた文であることが分かる段落へ移した。ステータスの節の外は変えていない | ADR-0077 |
| X-15 | 直した。ADR-0090 の影響を「#293 以降の変更がリモートの `main` に入るまで」へ改め、本リポジトリの配布が (c) も満たさないことを同じ箇条に書いた | ADR-0090 |
| 本リポジトリの開示 | 直した。開いている経路に (c) の欠如を足した。所有者の設定の一覧の `dist/standard` のルールセットの行に「迂回の主体は置かない」と書き、鍵を置かない前提のもとでは迂回を許す結び付いた資格情報が無いため (c) は満たせないことを太字で書いた。§4 の書き込みの案にも同じ文を足した | `project-management.md`、本ファイル §4 |

### 8.1 判断と、その理由

1. **ADR-0090 の本文を改めた**。CLAUDE.md は「採用済み ADR の本文は書き換えない」とする。ADR-0090 は本 Issue で作り、まだリモートへ push していない。突合の裁定(§8)は「ADR-0090 を合わせる」と求めている。#318 の前例(同じ Issue の未 push の ADR-0088 を突合の段で改めた)に合わせた。push の後の変更は、新しい ADR で置き換える
2. **タグのパターンの照合は完全一致か `~ALL` に限った**。ルールセットの `fnmatch` の包含(例: `v*` を `v**` が覆うか)を判定する実装は、誤って確認済みにする余地を持つ。完全一致でないパターンは「作成を限るルールセットが無い」として不一致に倒し、説明の文にこの照合の範囲を書いた。採用者はパターンを揃えれば確認済みに至る
3. **タグのルールセットの迂回の主体は空に限った**。突合の案のとおり。リリースの自動化に迂回を許す構成は不一致として出る。その主体がブランチで書き換えられる場所から得られる資格情報でないことを、env-check は確かめられないためである
4. **判定の構造の値 `findings` を、確認済みの識別の鍵に足した**。読む側が「findings が空」を確かめるため、手で書いた記録が不一致の内訳を残したまま確認済みを名乗ることを拒める
5. **`DELEGATED_MERGE_ENABLED` の値は読まない**。§8 は「名前(値は読まない)」とした。委任のトークンの名前だけで不一致を決める。変数の一覧の応答は値を含むが、記録には名前だけを書く(試験で確かめる)

### 8.2 変異の試験(X-6 の追試)

`test-env-check.mjs` に足した場面が、次の変異を落とすことを確かめました(スクラッチへ退避した元のファイルへ、各変異の後に戻した)。

| 変異 | 結果 |
| --- | --- |
| M5 `environmentIds` の要求を外す | 落ちた(1件) |
| M6 `protected_branches: true` を不一致にしない | 落ちた(1件) |
| M7 既定ブランチ以外へ開く規則を不一致にしない | 落ちた(2件) |
| M8 選んだ参照が空の規則を不一致にしない | 落ちた(1件) |
| タグの作成の限定を見ない | 落ちた(3件) |
| 任意のタグを不一致にしない | 落ちた(1件) |
| タグのルールセットの迂回の主体を見ない | 落ちた(1件) |
| 委任のトークンの名前を見ない | 落ちた(2件) |
| 読む側が名前を読んでいない対象外を受け入れる | 落ちた(1件) |
| ページ送りの件数の突き合わせを外す | 落ちた(1件) |
| 1頁目で読むのをやめる | 落ちた(1件) |

### 8.3 コミット

- 準拠テンプレート(ブランチ `claude/process-compass-346`): `c11e66e`(第1段 `904f41c` の上に積んだ)
- 親(ブランチ `work/346`): (記入する)
- push はしていない
