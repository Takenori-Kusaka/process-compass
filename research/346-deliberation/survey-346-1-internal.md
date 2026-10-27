# 調査 346-1: 内部の現状(条項・決定・ワークフロー・設定)

- 作成: 2026-10-27。担当: 内部調査。作業ツリー: work/346(template/ は claude/process-compass-346)
- 範囲: 事実の記録だけ。案の採否は書かない
- 行番号は 2026-10-27 時点の work/346 の作業ツリーによる
- GitHub の実設定は、この環境の `gh api`(保守者のトークン。`permissions.admin: true`)で読める範囲だけ読んだ。プロキシが Environments と Actions の設定の API を拒んだ(HTTP 403)ため、その2つは読めていない

## 1. 条項

### 1.1 第4章 G-8「配備の統制と資格情報の置き場」

所在: `src/content/docs/phase4-process-design/gate-criteria.md` L1190〜1197(G-8 リリース決裁 の子の節)。

本文(原文のまま):

> **配備・配布の統制と資格情報を、起動元のブランチで書き換えられる場所(ワークフローの定義のファイルなど)の中だけに置いてはなりません**。その場所の中の確認は、起動元のブランチで書き換えれば外れるためです。資格情報は、配備を許す参照(既定ブランチ、またはリリースのタグ)に限った実行環境の秘密情報に置きます。参照する実行環境は、参照する前に作り、保護を設定します。委任の取り込み([第5章 5.5.4])に用いる資格情報も同じです。
>
> 契約の条件などによって、実行環境の秘密情報や配備の参照の限定を使えない場合は、この規定を満たせません。**満たしたものとして扱わず、保証の開示に未達として記録します**([ADR-0028])。GitHub での対応の例は、[フェーズ5]「デプロイゲート」を参照。

事実の整理:

- 規範は2文に分かれる。(1)「統制と資格情報を、起動元のブランチで書き換えられる場所の中**だけ**に置いてはならない」(禁止)。(2)「資格情報は…実行環境の秘密情報に置きます」(置き場の指定。ですます調の平叙で、「なければならない」の形ではない)
- 「資格情報」「秘密情報」「実行環境」の定義は、第1章・第4章に見当たらない(overview.md と用語集を grep して該当なし)。ジョブの権限で発行される短命のトークン(GITHUB_TOKEN)が「資格情報」に当たるか、どこに「置く」と見るかを本文は書いていない
- 適用範囲: 見出しに `(適用: …)` が無い。#293 の実装記録 6章7(`research/293-deliberation/implementation.md`)は「G-8 を持つ案件に限らず、自動のデプロイ・配布を持つすべての案件に掛かるため、見出しに付けなかった」と記録している(当時の置き場はフェーズ5 のデプロイゲートの子の節。現在は第4章 G-8 の子の節)
- 未達の扱い: 実行環境の秘密情報・配備の参照の限定を「使えない場合」に限って、保証の開示へ未達として記録する。**使えるのに使わない場合**(本リポジトリの形)の扱いは、本文に書かれていない
- 実装マーク(L1196〜1197):
  - IMPL-0236 `target=delegation-workflow state=delivered check=manual`: 委任のマージのトークン `DELEGATED_MERGE_TOKEN` を Environment `delegated-merge` の秘密情報に置く手順(README)。実際の GitHub 上で実行していない。#314 で presence から manual へ下げた
  - IMPL-0237 `target=deploy-workflow state=undelivered check=manual plan=scheduled issue=346 review=2027-04`: 案件のデプロイのワークフローで、配備の資格情報を参照を限った実行環境の秘密情報に置く。準拠テンプレートにデプロイのワークフローは無い
  - 降ろし先 `deploy-workflow`(`src/data/impl-targets.yaml` L355〜359): `kind: planned`、`path: .github/workflows/deploy.yml`。説明は「配備の資格情報を、配備のブランチを既定ブランチに限った実行環境の秘密情報に置く」(タグに触れていない。本文は「既定ブランチ、またはリリースのタグ」)
  - 登録簿 `src/data/impl-inventory.yaml` L669〜674: 当節は `status: marked`、ids IMPL-0236・0237、`issue: 316`
- 隣接: G-8 の判定基準表(L1182〜1185)は「G-7 通過」「事業リスクの受容」の2基準で、配備の統制は判定基準の行ではない(子の節の規定)

### 1.2 フェーズ5 `ci-gates.md`「デプロイゲート」>「統制と資格情報の置き場」

所在: `src/content/docs/phase5-implementation/ci-gates.md` L886〜924。

- L888: 必須レビュアは Free・Pro・Team の非公開のリポジトリで使えない(2026-10-23 時点)。使えない場合の G-8 の成立の条件は「本標準では現時点で定めていない」
- L895〜897: 要求事項は第4章 G-8 による。本節は理由と GitHub での対応
- L899(理由。原文): 「ワークフローのファイルの中の確認(実行環境の指定、ref の比較、`if:` の条件)は、起動元のブランチでファイルを書き換えれば外れます。手動の起動は、起動するときに選んだブランチのファイルで動きます。**書き込みの権限を持つ者は、自分のブランチへ置いたワークフローから、リポジトリの秘密情報とトークンの書き込みの権限に届きます**。ファイルの外の設定(実行環境の配備の参照の限定)だけが、この経路を止めます。」タグからの配備はタグの作成を限らなければ同じ穴
- L903〜909 対応表: 実行環境=Environment(参照した Environment が無ければ保護の無いものが自動で作られる)/配備の参照の限定=Deployment branches and tags(規則は `GITHUB_REF` に照らす。タグはルールセットで作成を限る)/プランの制限(Free の非公開では Environment の秘密情報と参照の限定が使えない)/秘密情報=Environment secrets(Repository secrets は任意のブランチから読める)/保護の迂回=管理者の迂回。「2026-10-23 時点の GitHub Docs に基づく。実機では確かめていない」
- 対応表に `GITHUB_TOKEN`・ジョブの `permissions`・リポジトリの Actions の既定の権限(Workflow permissions)の行は無い。L899 は「トークンの書き込みの権限に届く」と書くが、それを何が止めるかは表に無い
- L911: 準拠テンプレートの委任のマージは Environment `delegated-merge` の秘密情報。テンプレートはデプロイのワークフローを持たない
- EV-0137(L913〜919): 対象=資格情報を参照を限った実行環境の秘密情報に置くことを要求事項にし、手段が無い場合を未達として記録させること。根拠 E1(間接)。見直し 2027-10。差し替え条件=迂回の事例数と、保護で止まった事例数。「本リポジトリの配布(`dist/standard`)で設定した後、既定ブランチ以外から起動した配布が拒まれた記録を残します。拒まれなければ本文を直します」
- L921〜924: 配布用のブランチの保護を独立の要求事項にしない(課さない明記)。配布用ブランチを持つ案件は前項を当てはめる

### 1.3 第6章 `deliverable-templates.md`「短命の資格情報を用いる」

所在: L1652〜1676(エージェントの安全分析の「リスク低減の3ステップ」)。

- RRS1(本質的安全設計方策)の具体策の列挙の1項: 「認証情報の分離(本番の資格情報を渡さない、短命の資格情報を用いる)」(L1665)。前置きは「設定ファイルとして実装し、文書と実態が乖離しない形にします」(L1659)
- 文脈は **AI エージェントの実行環境**に渡す認証情報で、CI の配備のジョブを対象にした文ではない。列挙は具体策の例で、要求事項の表の形ではない
- 同じ RRS1 の列挙に「書込み可能な範囲の限定と、秘密情報を含む場所の読取り拒否」(L1663)。RRS2 に「入出力の検査(…秘密情報の検知)」(L1674)

### 1.4 資格情報・秘密情報・トークン・権限に触れるほかの条項(grep の結果)

| 所在 | 内容(要点) |
| --- | --- |
| 第4章 G-5 基準7(gate-criteria.md L605・L758〜768) | 混入した資格情報は台帳への記録で通過させない。是正は無効化と再発行。無効化をコードの修正より先に行う。検出されないことは不在の証明にならない |
| 第3章 3.5「文脈の分離が成立する条件」(roles-responsibilities.md L574〜579) | 分離の対象3「認証情報(トークン)」。分けられない場合「権限の分離が成立しない。列挙に無い離脱として記録する(第1章 1.10.2。代償措置は定めていない)」 |
| 第5章 5.5.4 委任(human-ai-boundary.md L425〜455) | 判定の規則と構成は基底ブランチから読む。変更の側の規則で判定する構成は条件2 を満たさない。取り込みは組織が明示した場合だけ。IMPL-0026・IMPL-0235 は undelivered(issue=339) |
| 第5章 5.8.6(human-ai-boundary.md L1046〜1059) | 要求事項1 認証情報・秘密情報への接触は実行時に拒否。要求事項2 拒否の範囲は強制層に置き、指示ファイルだけでは拒否できたものとしない。要求事項4 秘匿情報は実行環境から参照できない位置へ。要求事項7 AI レビューの指示は対象の変更が書き換えられない場所へ。漏えい後の手順は課さない(組織の規程) |
| テンプレ8(AI の SLA)第6項(deliverable-templates.md L1154) | 秘密情報を外部サービスへ送出することの可否 |
| フェーズ5 ci-gates.md L118〜120 | 秘密情報の走査は `fetch-depth: 0`。検出時の一次対応は無効化 |
| フェーズ5 ci-gates.md L328 | 出荷の証跡の取得は `gh`(トークンはワークフローの `GITHUB_TOKEN`) |
| フェーズ5 ci-gates.md L780〜792 | 委任のワークフローの実装表。マージのトークンは Environment `delegated-merge` の秘密情報。トークンをリポジトリの秘密情報に置かない |
| フェーズ5 ai-environment.md L42〜62 | `.env` 等は permissions の deny で読み取り自体を禁止 |
| フェーズ5 pre-review-automation.md L57〜65・L137〜145 | 例示のワークフローに `permissions:` と `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` |
| フェーズ5 template-repository.md L114 | ルールセットの応答に `bypass_actors` の鍵が無ければ「未確認(権限不足で読めない)」(SRC-0663) |

本文中で `GITHUB_TOKEN`・ジョブの `permissions` を規範の対象として扱う条項は見つからなかった。現れるのは例示・実装の記述だけである。

## 2. 決定の記録

### 2.1 ADR-0077(採用 2026-10-23)決定6 と影響

所在: `src/content/docs/adr/0077-repository-ci-wiring-and-distribution.md` L57〜72・L101〜110。

決定6(運営)の要点:

- 強制 push をやめ、前回の `dist/standard` の上へ積む
- 「配布の資格情報は、ジョブ `publish` の `GITHUB_TOKEN` だけとする。`contents: write` は `ci.yml` の中でジョブ `publish` にだけ付け、最上位と他のジョブは読み取りに留める。deploy key・SSH 鍵・秘密情報は作らない(保守者の決定、2026-10-23)。トークンはジョブの終了で失効する」
- 「ジョブ `publish` は Environment `dist-standard`(配備のブランチを `main` に限る)を参照する。この限定が止めるのは、このジョブを `main` 以外の参照で走らせることだけである。`GITHUB_TOKEN` は Environment に属さないため、限定は資格情報の置き場にはならない」
- ジョブ先頭の起動元の確認は事故の歯止め(ファイルを書き換えれば外れる)
- 必須レビュアは置かない(1名の自己承認は独立した確認ではない)
- `dist/standard` のルールセットは削除と強制 push を禁じ、更新の制限は置かない。理由: 2026-10-23 時点の GitHub Docs はバイパスの主体に `GITHUB_TOKEN`(GitHub Actions)を挙げていない。更新を制限すると配布の push も止まる
- 開示(L70 原文): 「**本リポジトリの配布は、下の標準の規範『資格情報を実行環境の秘密情報に置く』を満たしません**。`contents: write` の付与はワークフローのファイルの中にあり、起動元のブランチで書き換えられます。本リポジトリは本標準に従う開発の案件ではありません。…食い違いを規範の側で解くか、運営の側で解くかは、本 ADR では決めません(#293 で別に扱う)」

検討した選択肢(L86〜87): 「配布専用の deploy key を Environment `dist-standard` の秘密情報に置く」は保守者の決定で採らない。理由は長期の鍵の管理・更新・漏えいの対象が増えること。「代わりに、ルールセットで更新を deploy key だけに限る統制を失う」と明記。「ルールセットで更新を制限し、GitHub Actions だけをバイパスに入れる」は、バイパスに `GITHUB_TOKEN` を入れられないとして却下。

影響(L101〜110): 管理者の設定前に配布が走ると保護の無い Environment `dist-standard` が自動で作られ、配布は成功する(止まる側に倒れない)。書き込みの権限を持つ者は `dist/standard` へ早送りの push ができる。`VERSION.md` は書き込んだ者が自由に書けるため、実行の番号を Actions の記録と突き合わせる。経路は実際の GitHub 上で実行して確かめていない(actionlint のみ)。

### 2.2 #293 の審議の経緯(`research/293-deliberation/`)

- `decision.md` J-6(L86〜115): 裁定 b は「配布の資格情報を、配布専用の deploy key(書き込み可)とし、Environment `dist-standard` の秘密情報にだけ置く。秘密情報が無ければ失敗する」。裁定 d は「ルールセットで更新を deploy key のバイパスだけに限る。`GITHUB_TOKEN` をバイパスに入れない」。機序として「書き込み権限を持つ者(作業ブランチへ push する AI のセッションを含む)は、push の契機を足したワークフローを自分のブランチに置けば `contents: write` で `dist/standard` を強制 push できる」を全委員が確かめた
- `council-04-standards.md` L182: 資格情報を `GITHUB_TOKEN` から外し、Environment の秘密情報(配布専用の GitHub App のトークンか deploy key)に置く案
- `implementation.md`(2026-10-23): deploy key 方式で実装した記録のまま。6章3「`publish` は deploy key で書くため `GITHUB_TOKEN` に書き込みを付けていない(`contents: read`)」。**その後の GITHUB_TOKEN 方式への変更は、このファイルに反映されていない**
- 変更はコミット b185611(2026-10-23 22:32 UTC「#293: 配布の書き込みを deploy key から GitHub Actions のジョブの権限へ改める」。ci.yml・check-ci-wiring・ADR-0077・project-management.md の6ファイル)。このコミットに対応する調査・会議体・突合の記録は `research/293-deliberation/` に無い
- 所有者の指示の文言(「github actions permission で設定するものでありキーは設定してはいけません」「github token を使わずにやりたいことを直接 permission 付与すればよくないですか?」「ルールセット緩和でいくしかないは同意です」)は、リポジトリ内では `research/346-deliberation/issues-context.md` にだけある。公開の記録(ADR-0077・project-management.md・ci.yml の注記)は「保守者の決定、2026-10-23」とだけ書く
- `research/294-deliberation/` は K-2(#278)で ADR-0077・EV-0137 を引く(起動元のブランチで配備が動く構成では push が取り消せない操作に当たる、など)。G-8 の成立の条件がプランにより未定である点も擁護側が引く(council-05 L129・L315)

### 2.3 ADR-0052・ADR-0036・ADR-0071・ADR-0028 の関係箇所

- ADR-0052 決定1「配る仕組みではなく、配布物そのものを検査する」、決定2「配布物へ生成元の版を記録する」、決定4「上流の生成器を直す」。ADR-0077 決定4 が `dist/standard` を決定1 の配布物に含めた。資格情報・権限には触れない
- ADR-0036 決定1: 判定は判定記録の作成で成立し、Issue のクローズ・PR のマージ・ラベルの遷移は成立要件ではない。Environment の承認(必須レビュア)の記録を G-8 の判定記録と見なすかに関わる(ci-gates.md L888 は「決裁の記録も自動で残る」と書き、ADR-0077 は自己承認が承認と誤読されるとして置かない)
- ADR-0071 決定3: 判定の証跡は判定記録(テンプレ4)に限る。Environment・ルールセットの設定の事実は判定の証跡ではない
- ADR-0028: 未達と省略の区別。G-8 の「使えない場合は未達として記録」の根拠
- 本リポジトリの位置: project-management.md は「本リポジトリは本標準に従う開発の案件ではない」(ADR-0077 L70 が引く)

## 3. 本リポジトリの `.github/workflows/ci.yml`(work/346)

### 3.1 構成

| 項目 | 内容 |
| --- | --- |
| 契機 | `pull_request`(ブランチの限定なし)、`push`(`main`)、`workflow_dispatch` |
| 最上位の権限 | `contents: read` |
| check | 全契機で `npm run check`。`push` かつ `refs/heads/main` のときだけ Pages の成果物を上げる |
| deploy | `needs: check`、`if: github.event_name == 'push' && github.ref == 'refs/heads/main'`、`permissions: contents: read / pages: write / id-token: write`、`environment: github-pages`。`gh api compare` に `github.token` を使う |
| publish | `needs: check`、同じ `if`、`permissions: contents: write`、`environment: dist-standard`、`concurrency: publish-standard`。先頭で `GITHUB_EVENT_NAME`=push かつ `GITHUB_REF`=refs/heads/main を確かめて違えば失敗。`actions/checkout@v7`(既定の `persist-credentials` で GITHUB_TOKEN を git に設定)の認証のまま `git worktree` から `git push origin HEAD:refs/heads/dist/standard`(強制なし)。`secrets.` の参照なし |

ほかのワークフロー(work/346): `graphify-update.yml`(push main、最上位 read、ジョブ `update-graph` が `contents: write`、checkout に `token: ${{ secrets.GITHUB_TOKEN }}`)、`evidence-review.yml`・`link-check.yml`(schedule・dispatch、ジョブに `issues: write`)。

### 3.2 `scripts/check-ci-wiring.mjs`(本体は `scripts/lib/ci-wiring.mjs`)の検査

条件1 契機に pull_request と main への push。2 check に `npm run check` の手順、if・continue-on-error なし。3 template の取得。4 Pages と `dist/standard` へ書くジョブは ci.yml にあり、`needs: check`、main への push に限り、`if` に always/failure/cancelled/`||` を置かない。5 全ワークフローが最上位に permissions を明示し、最上位で書き込みを与えない。6 `dist/standard` へ書くジョブが environment を持つ。8 `dist/standard` の文字列が publish の外に現れない。9 ci.yml で contents の書き込みを持つのは publish だけ、publish は contents: write だけを持ち environment `dist-standard` を参照し needs に check。10 配布のジョブが `secrets.` を参照せず SSH を使わない。11〜14 回帰の試験の結線。

検査の限界(ファイル冒頭の注記): 変数や別の手順で隠した push、`npm run check` の前の書き換え、書き込みの権限を持つジョブがファイルの中で `dist/standard` へ push できること、ルールセットは早送りを止めないこと。GitHub 側の設定(Environment の参照の限定・ルールセット)は確かめない。検査の対象は既定ブランチ上ではなく**検査を走らせたブランチ上の**ワークフローのファイルである(同じ push・PR の中で書き換えられる。project-management.md「止まらない経路」に記載)。

### 3.3 `dist/standard` へ書き込める経路(work/346 の ci.yml が main に入った後の形。記録からの列挙)

| # | 経路 | 何が止めるか(記録上) |
| --- | --- | --- |
| A | main への push → check 通過 → publish | 想定の経路。Environment `dist-standard`(main に限る。設定されていれば) |
| B | 保守者の直接の早送り push(`git push origin …:dist/standard`) | 止めない(ルールセットは削除・強制 push だけ。project-management.md「止まらない経路」) |
| C | 書き込みの権限を持つ者が、自分のブランチへ `push`(または `pull_request`)の契機と `permissions: contents: write` を持つワークフローを置き、`GITHUB_TOKEN` で push | 止めない(Environment を参照しなければ限定が掛からない。project-management.md・ci-gates.md L899)。作業ブランチへ push する AI のセッションも含む(#293 decision J-6) |
| D | 同じリポジトリのブランチからの PR(`pull_request`)。ci.yml は PR の側の定義で動く | publish の `if` は push に限るが、PR の側で ci.yml を書き換えれば C と同じ。止めるのは C と同じく無い(未検証の機序。GitHub の仕様の確認が要る) |
| E | fork からの PR | 記録に無い。GitHub の仕様では fork の PR の `GITHUB_TOKEN` は読み取りに限られ、秘密情報も渡らないとされる(外部調査で確かめる事項。本調査では確かめていない) |
| F | `workflow_dispatch`(任意のブランチを選んで起動) | ci.yml の publish は `if` で走らない。起動元のブランチのファイルで `if` を外せば C と同じ。Environment を参照すれば main 以外は拒まれる(設定されていれば) |
| G | `graphify-update.yml`(main への push、`contents: write`) | check-ci-wiring 条件8 がジョブの定義に `dist/standard` の文字列が無いことを確かめる。変数で隠した push は拾わない |
| H | Dependabot の PR | 記録に無い。リモートに dependabot のブランチと PR の CI 実行あり(3.4) |

### 3.4 リモート(GitHub)の現状(2026-10-27、`gh api` で読んだ事実)

- **#293 の変更はリモートの main に入っていない**。リモートの main(5cd4770)は 03382b2・b185611・44b16a4 を含まない(API が「No commit found」)。リモートの main の workflows は `ci.yml`(契機は pull_request・workflow_dispatch だけ)・`deploy.yml`・`publish-standard.yml`・`graphify-update.yml`・`evidence-review.yml`・`link-check.yml`
- リモートの main の `publish-standard.yml`: `push`(main)・`workflow_dispatch`、**最上位 `permissions: contents: write`**、Environment なし、`git push -q --force`。`graphify-update.yml` も最上位 `contents: write`。`deploy.yml` は最上位 `contents: read / pages: write / id-token: write`、`workflow_dispatch` あり
- `dist/standard` の先頭は 95a55af(親なし。2026-10-24T00:35Z。github-actions[bot])。`VERSION.md` は「生成: 標準の本文を配布用ブランチへ公開する / run 16」で、旧 `publish-standard.yml` による強制 push の出力。新しい publish のジョブは一度も動いていない
- 直近 100 件の実行: 「標準の本文を配布用ブランチへ公開する」14 件はすべて push・main。CI の pull_request の実行は dependabot と claude/* などのブランチ
- デプロイメント(deployments API)は `github-pages` のものだけで、`dist-standard` の記録は無い
- リポジトリ: `visibility: public`、既定ブランチ `main`
- ルールセット: `GET /repos/…/rulesets` は `[]`。`GET /repos/…/rules/branches/dist%2Fstandard` と `…/main` も `[]`。ブランチ保護: `main` は「Branch not protected」、`dist/standard` は `protected: false`。トークンは admin 権限を持つため、読めないことによる空ではないと見られる(template-repository.md L114 の注意は管理の権限の無いトークンの場合)
- 読めなかったもの: Environments の一覧と `dist-standard` の配備の参照の規則、Actions の権限(`actions/permissions`・`actions/permissions/workflow`)。プロキシが 403 で拒否
- project-management.md「管理者の設定」手順3 は「設定した日付と、main 以外から publish が走らないことを確かめた結果を Issue #293 に記録する」。リポジトリ内にその記録は無い(Issue のコメントは本調査で読んでいない)

## 4. 準拠テンプレート(template/、claude/process-compass-346)

| ワークフロー | 契機 | 最上位の権限 | Environment・秘密情報 |
| --- | --- | --- | --- |
| `delegation.yml` | pull_request_target・workflow_run(gate-g5)・workflow_dispatch | contents read / **pull-requests write / statuses write** / checks read(最上位) | ジョブ `merge` だけ `environment: delegated-merge`、`secrets.DELEGATED_MERGE_TOKEN`、`if: vars.DELEGATED_MERGE_ENABLED == 'true' && eligible`。判定のジョブは Environment を参照しない。両ジョブとも既定ブランチを `persist-credentials: false` で checkout、`GH_TOKEN: github.token` |
| `gate-g5.yml` | pull_request・push・workflow_dispatch | contents read / pull-requests write / issues read | なし。`github.token` |
| `ai-review.yml` | pull_request | contents read / pull-requests write | なし |
| `gate-entry.yml` | pull_request・schedule・dispatch | contents read / issues write | なし |
| `context-drift.yml` | schedule・dispatch | contents read / issues write | なし |
| `assurance-period.yml` | schedule・dispatch | contents read / pull-requests read | なし |
| `ship-evidence.yml` | push・dispatch | contents read / pull-requests read / actions read | なし |

- テンプレートは `contents: write` をどのワークフローにも付けていない。デプロイのワークフローは無い(IMPL-0237 の降ろし先 `deploy-workflow` は `kind: planned`)
- 書き込みの権限(pull-requests・statuses・issues)は最上位に置かれている。本リポジトリの check-ci-wiring 条件5(最上位で書き込みを与えない)に相当する検査はテンプレート側に無い(テンプレートの規約ではない)
- 委任のマージは「長期のトークンを Environment の秘密情報へ」の形(IMPL-0236)。README L228〜238: Environment を参照の前に作り、配備のブランチを既定ブランチに限る。リポジトリの秘密情報に置かない。トークンの保管・権限・失効は組織の責任。実機で未確認
- `delegation.yml` の注記(L42〜45): workflow_dispatch は選んだブランチの定義で動く。既定ブランチ以外から起動すると Environment がマージのジョブを拒み、トークンに届かない。`pull_request_review` は PR の側の定義で動くため使わない
- テンプレートの導入前の検証 `adoption-trial.mjs env-check` が読むのは、ブランチ保護(`branches/<b>/protection`)とルールセット(`rulesets/<id>`、`bypass_actors`)。Environments の保護、Actions の既定の権限は読まない(grep で該当なし)
- 採用者で同じ問題が起きるか(記録から言えること): テンプレートの委任のマージは長期のトークンを Environment に置く形で、G-8 の節の形に合う。一方、採用者が `GITHUB_TOKEN` に `contents: write` を付けて配備・配布する形(本リポジトリと同じ形)を採った場合の扱いは、標準にもテンプレートにも書かれていない。テンプレートの最上位の `pull-requests: write` 等は、ブランチ上のワークフローから同じ権限に届く点で同じ構造を持つ(配備ではない)

## 5. GitHub の実設定でしか確かめられない点

| # | 点 | 本リポジトリの現状(記録・API から分かる範囲) |
| --- | --- | --- |
| 1 | リポジトリ(組織)の Actions の既定の権限(Workflow permissions: read / read and write)、「GitHub Actions に PR の作成・承認を許す」 | 不明(API が 403)。リポジトリ内の記録にも無い。#293 council-03 L12 も「読めなかった」と記録 |
| 2 | ワークフローの `permissions:` が既定の権限の設定を超えて書き込みを得られるか(既定の設定が上限か既定値か) | 本リポジトリの記録に記述なし。GitHub の仕様の確認が要る(外部調査の範囲) |
| 3 | Environment `dist-standard` の存在と、Deployment branches and tags の限定(main だけ)、管理者の迂回の可否 | 不明(API が 403)。新しい publish は未実行で、デプロイメントの記録も無い。手順3 の記録はリポジトリ内に無い |
| 4 | Environment `github-pages` の配備の参照の限定 | 不明(API が 403)。デプロイメントはすべて ref=main |
| 5 | `dist/standard` のルールセット(削除・強制 push の禁止) | **無い**(rulesets `[]`、rules/branches/dist%2Fstandard `[]`、protected false)。project-management.md 手順2 は未実施と見られる |
| 6 | `main` のブランチ保護・ルールセット | 無い(Branch not protected、rules `[]`)。CLAUDE.md の運用(ソロ期は main へ直接 push)と整合 |
| 7 | ルールセットのバイパスに `GITHUB_TOKEN`(GitHub Actions)を入れられるか | ADR-0077 は「2026-10-23 時点の GitHub Docs は挙げていない」。実機で未確認(#293 implementation.md 5章) |
| 8 | 書き込みの権限を持つ協力者の数 | 記録上ソロ期で保守者1名(project-management.md)。collaborators は本調査で読んでいない |
| 9 | fork の PR・Dependabot の PR のトークンの権限と秘密情報の扱い | 記録なし。外部調査の範囲 |
| 10 | Environment を参照するジョブの `GITHUB_TOKEN` の権限が Environment の保護で変わるか | ADR-0077 は「`GITHUB_TOKEN` は Environment に属さない」とする。実機で未確認 |
| 11 | OIDC(`id-token: write`)で短命の資格情報を得る経路が、`dist/standard` への push に使えるか | 本リポジトリの記録では deploy(Pages)にだけ `id-token: write`。配布への適用の記録なし |

## 6. 食い違い・未記録の点(事実として)

1. G-8 の文は資格情報を「実行環境の秘密情報に置く」と書き、ジョブの権限で発行されるトークンを想定した記述が無い。ADR-0077 は本リポジトリがこれを満たさないと開示し、解き方を「#293 で別に扱う」としたが、#293 の記録にその扱いは無い(#346 へ移った)
2. G-8 の未達の扱いは「手段を使えない場合」に限られ、手段を使えるのに鍵を置かないと決めた場合の扱いは書かれていない
3. `implementation.md`(#293)は deploy key 方式のまま。GITHUB_TOKEN 方式への変更(b185611)に会議体・突合の記録が無い。所有者の指示の文言は #346 の issues-context.md にだけある
4. `impl-targets.yaml` の `deploy-workflow` の説明は「既定ブランチに限った」で、本文の「既定ブランチ、またはリリースのタグ」と範囲が違う
5. ADR-0077 決定6 の運営の形(Environment `dist-standard`・ルールセット)は、リモートでは未適用。#293 の変更自体がリモートの main に入っておらず、`dist/standard` は今も旧ワークフロー(最上位 `contents: write`、Environment なし、強制 push、workflow_dispatch あり)で配られている
6. EV-0137 の差し替えの材料(既定ブランチ以外から起動した配布が拒まれた記録)は、まだ存在しない
7. ci-gates.md の対応表は、`GITHUB_TOKEN`・ジョブの `permissions`・Actions の既定の権限の行を持たない。L899 は「トークンの書き込みの権限に届く」経路を書くが、止める手段は「実行環境の配備の参照の限定」だけを挙げる。ADR-0077 は同じ限定が `GITHUB_TOKEN` の置き場にならないと書く
