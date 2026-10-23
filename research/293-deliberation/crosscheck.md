# 突合(Issue #293 リポジトリ運営 — CI・配布)

- 日付: 2026-10-23。突合の担当
- 対象: `work/293` の 03382b2(`git diff work/292..work/293`)、準拠テンプレートの 8a7fc40(`git -C template diff b1c8b4b..8a7fc40`。ブランチ `claude/process-compass-293`)
- 正とした文書: `decision.md`(J-1〜J-9)、`implementation.md`(6 章の食い違い 10 件)
- 方法: 入力の欠如の試験は、作業の木の外の worktree(scratchpad の `wt/`。`template/` は空のディレクトリ、次に削除)で行った。結線の検査は、`ci.yml` を書き換えた YAML を `checkWiring` へ渡す探針(scratchpad の `probe.mjs`)で試した。作業の木は変えていない(`git status` は本ファイルの追加だけ)
- 外部の事実の確認: `https://api.github.com/meta` の `ssh_keys`、`git ls-remote --tags`(actions/upload-pages-artifact・actions/deploy-pages)、GitHub Docs「Deployments and environments」(2026-10-23 取得)

## 指摘

### X-1 重大 デプロイゲートの新しい規範が、本標準のタグによるリリースと、プランの制限に反する

- 所在: `phase5-implementation/ci-gates.md`「デプロイゲート > 統制と資格情報の置き場」第1段落の第2文・第3文、対応の表、EV-0137 の対象の文。ADR-0077 決定6(標準)
- 何が誤りか:
  1. 規範は「資格情報は、配備のブランチを**既定ブランチに限った**実行環境の秘密情報に置きます」とする(第1章 1.7.2 により、平叙の文も要求として読む)。本標準は `git-strategy.md` L40「release ブランチは作らない。リリースはタグ(`vX.Y.Z`)で固定する」、L131、`ci-gates.md` の G-7 の集約(前タグから今回タグまで)で、**リリースをタグで固定する**。タグを契機にした配備の `GITHUB_REF` は `refs/tags/vX.Y.Z` で、GitHub Docs は「配備のブランチ・タグの規則は、実行の `GITHUB_REF` に照らす」とする。既定ブランチだけに限った Environment は、タグからの配備を拒む。規範に従うと、本標準のリリースの形(タグ)から配備できない
  2. GitHub Docs(2026-10-23 取得)は、「GitHub Free では、Environment の秘密情報は公開のリポジトリでだけ使える」「配備のブランチ・タグの限定は、Pro・Team で非公開のリポジトリにも使える」とする。Free の非公開のリポジトリでは、規範の手段(配備のブランチの限定・実行環境の秘密情報)そのものが無い。本文が開示したプランの制限は必須レビュアだけで、規範の側の制限を開示していない。満たせない要求事項が、満たせないことを示さずに置かれている
- 証跡: 上記の頁の文面。GitHub Docs の該当の文(WebFetch で取得)
- どちらが誤りか: 裁定 J-6 の文案(会議体が tag の配備とプランの制限を突き合わせていない)と、それを写した実装。本標準の既存の条項(タグで固定)は誤りでない
- 修正案:
  - 規範の「既定ブランチに限った」を「配備を起動できる ref(既定ブランチと、作成を保護したリリースのタグ)に限った」へ改める。対応の表の行「配備のブランチの限定」に、GitHub の「Selected branches and tags」と、タグの作成をルールセットで限ることを足す
  - 対応の表に行を足し、Environment の秘密情報と配備のブランチの限定が、Free の非公開のリポジトリで使えないことを開示する。使えない場合の扱い(未達として表示するか、別の手段を認めるか)は会議体を要するので、本 Issue では「満たす手段が無い」ことの開示に留め、裁定 5 章の別 Issue 1(G-8 の成立条件とプラン)へ含める
  - EV-0137 の対象の文と ADR-0077 決定6 の文を同じく改める
  - 本リポジトリの `dist-standard`(main への push だけで配る)は影響を受けない

### X-2 中 テンプレートの `delegation.yml` が、既定で無効のまま、保護の無い Environment を全採用者に作らせる(IMPL-0236 の `delivered` が成り立たない)

- 所在: `template/.github/workflows/delegation.yml` L62-67(ジョブ `eligibility` の `environment: delegated-merge`)、`template/README.md` 有効化の手順3、`ci-gates.md` IMPL-0236
- 何が誤りか:
  1. `environment:` が判定のジョブ全体に付いた。このジョブは、マージを有効化していない既定の状態でも、PR の更新ごとに `pull_request_target` で動く。採用者が最初の PR を出した時点で、参照された `delegated-merge` が**保護の無いまま自動で作られる**。新しい規範の第3文「参照する実行環境は、参照する前に作り、保護を設定します」と、README の手順3「ワークフローが参照する前に作る」に、テンプレート自身が反する。後で有効化する組織が、自動で作られた Environment に保護を設定せずにトークンを置く経路が開く
  2. `pull_request_target` の `GITHUB_REF` は PR の基底ブランチである。既定ブランチ以外へ向けた PR では、配備のブランチの限定がジョブを拒み、判定のステータス(`delegation-eligibility`)が出ない。ジョブの注記「pull_request_target と workflow_run の ref は既定ブランチであり、この限定を通る」は、既定ブランチへ向けた PR に限って真である
  3. 以前の README に従ってリポジトリの秘密情報へトークンを置いた組織は、その秘密情報が残る限り穴が塞がらない。README に削除の手順が無い
- 証跡: ワークフローの `on:` に `pull_request_target` の `branches` の絞り込みが無い。ジョブの `if` は有効化の変数を見ない
- どちらが誤りか: 実装(テンプレート)
- 修正案: 判定のジョブから `environment:` を外し、マージだけを別のジョブへ分ける(`needs: eligibility`、`if: vars.DELEGATED_MERGE_ENABLED == 'true' && needs.eligibility.outputs.eligible == 'true'`、`environment: delegated-merge`)。有効化するまで Environment は参照されない。`test-check-delegation.mjs` の新しい 1 件を、マージのジョブに `environment` があり、判定のジョブに無いことへ改める。README に「リポジトリの秘密情報に置いたトークンを削除する」を足す。直すまでは IMPL-0236 を `undelivered` にする

### X-3 中 デプロイゲートに、裁定に無い G-8 の代替の手段が入った(QMS の成立の条件と衝突する)

- 所在: `ci-gates.md`「デプロイゲート」第1項の末尾「使えない場合は、G-8 の決断の記録を判定記録で残し、配備のブランチの限定と資格情報の置き場(次項)で起動の経路を絞る」
- 何が誤りか: 裁定 J-6 は、この項について「事実の訂正(必須レビュアがプランで使えない)」だけを決め、`qms-document-control.md` L41(G-8 の成立の条件)がプランで満たせない件は「成立条件の変更になるので別 Issue(会議体を経る)」とした。実装の文は、必須レビュアが使えない場合の G-8 の手段を新たに指示している。`qms-document-control.md` の承認権限のマッピングは G-8 の操作を「実行環境の承認操作」に限り、「成立の条件を満たさない操作は、承認の記録として扱いません」とする。判定記録による代替は、その表に無い。会議体を経ない規定の変更で、既存の条項と食い違う
- どちらが誤りか: 実装
- 修正案: 「使えない場合は、…絞る」の文を削り、「使えない場合の G-8 の成立の条件は、別 Issue で扱う(`qms-document-control.md` の承認権限のマッピング)」程度の開示に替える。別 Issue 1 の起票に、この文の要否を含める

### X-4 中 結線の検査が、`always()` と `||` で検査の通過を待たない公開・配布を通す

- 所在: `scripts/lib/ci-wiring.mjs` L37-40(`gatedOnPushToMain`)、L21-24(`writesDistStandard`)、L99-102(条件3)
- 何が誤りか: 探針で `ci.yml` を書き換え、`checkWiring` が問題を返さない(合格する)ことを確かめた
  1. `deploy` の `if` を `always() && github.event_name == 'push' && github.ref == 'refs/heads/main'` にする。`needs: check` があっても、`always()` は `check` の失敗後にも公開を走らせる。J-2 の目的(検査に落ちた版を出さない)が外れる。`!cancelled()`・`failure()` も同じ
  2. `if` を `github.event_name == 'push' || github.ref == 'refs/heads/main'` にする(正規表現は両方の語の出現だけを見る)
  3. `git push` の行の `dist/standard` を変数(`$BR`)にする、または push を別の手順に分ける。`dist/standard` へ書くジョブと認識されず、条件4・6 が掛からない
  4. サブモジュールの取得を `git submodule update --init --recursive zenn` にする(`--recursive` があれば通る)。ただしこの場合は J-3 により `npm run check` が失敗するので、黙って通る害は無い
  5. `npm run check` の前の手順で `npm pkg set scripts.check="true"` とする。構造の検査の限界で、`check-ci-wiring.mjs` の冒頭に開示すれば足りる
- 試験(`test-check-ci-wiring.mjs` 21 件)はこれらの場面を持たない
- どちらが誤りか: 実装
- 修正案: 公開・配布のジョブの `if` に状態の関数(`always`・`failure`・`cancelled`・`success` の否定)と `||` があれば失敗にする。`dist/standard` へ書くジョブの認識を「ジョブのいずれかの手順が `dist/standard` を含み、いずれかの手順が `git push` を含む」へ広げる。条件3 は `template` の語を必須にする。1〜3 の陽性対照を試験へ足す。5 は限界として冒頭の注記へ書く

### X-5 中 配布の対象の変化を push の直前と比べるため、失敗した配布が次の本文の変更まで取り戻されない

- 所在: `ci.yml` ジョブ `check` の手順「配布の対象が変わったか」(L62-80)、ジョブ `publish` の `if`、同「配布用ブランチへ積む」の「配布物に変化がありません」(L259-262)
- 何が誤りか:
  1. 比べる相手が `github.event.before`(push の直前)である。配布が一度失敗すると(管理者の設定が済むまでは毎回失敗する。一時的な取得の失敗もある)、その後の本文を変えない push では `publish` が走らない。管理者が設定を済ませても、`dist/standard` は次に本文を変えるまで古い版のままで、`VERSION.md` は古いコミットを示し続ける。旧 `publish-standard.yml` の `paths` の条件も同じ欠点を持っていたが、本変更は「設定が済むまで失敗する」経路を意図して作ったので、影響が確実に出る
  2. `VERSION.md` と `tailoring-kb.json` は毎回 `GITHUB_SHA`(と実行の番号)を含むため、`git diff --cached --quiet` は常に偽である。「配布物に変化が無ければコミットしない」(implementation.md 6 章 4)は動かない
- どちらが誤りか: 実装
- 修正案: `check` の変化の判定と `publish` の `if` の `dist_changed` をやめ、`publish` を main への push ごとに走らせる。`publish` の中で、配布済みの版(`dist/standard` の `tailoring-kb.json` の `source.commit`。PREV)と `GITHUB_SHA` の間で対象のパスを `git diff --quiet PREV GITHUB_SHA -- …` で比べ、変化が無ければ配らずに終える。PREV が無い・祖先でない・40 桁でない場合は配る。「変化が無ければコミットしない」の記述は、この判定に置き換える

### X-6 中 削除したワークフローを、CLAUDE.md と README のバッジが指したまま

- 所在: `CLAUDE.md` L114「`main` への push で `.github/workflows/deploy.yml` が GitHub Pages へ自動デプロイ」、`README.md` L3 のバッジ(`actions/workflows/deploy.yml/badge.svg`)
- 何が誤りか: `deploy.yml` は削除された。CLAUDE.md は AI のセッションが従う指示なので、誤った経路を前提に作業させる。バッジは存在しないワークフローを指し、公開の状態を示さなくなる。裁定 J-1 は説明の側の誤りを直すことを求めており、CLAUDE.md の「コマンド」の行だけを直した実装は、同じファイルの「Git 戦略」の行を見落とした
- どちらが誤りか: 実装
- 修正案: CLAUDE.md L114 を「`main` への push で CI(`ci.yml`)が `npm run check` を実行し、通過した場合に限ってジョブ `deploy` が GitHub Pages へ公開する」へ改める(「コマンド」の行と合わせて、PR で利用者の了承を得る)。バッジを `ci.yml` へ向ける

### X-7 軽 公開の上書き防止は、新しいコミットの実行が成功することに頼る

- 所在: `ci.yml` ジョブ `deploy` の手順「main の先頭より古い版で上書きしないことを確かめる」
- 何が誤りか: main がサイトに入るファイルの変更で先へ進んでいれば公開しない。後のコミットの `check` が落ちた場合や、人が `[skip ci]` を付けて push した場合、どの実行も公開せず、サイトは最後に通過したコミットより古い版のまま残る。`research/` だけの変更でも「サイトに入るファイル」に数える(除外は `graphify-out/` と `.gitattributes` だけ)。止まる側に倒れるので害は遅れに留まるが、「止まらない経路」の節にも、遅れる経路としても書かれていない
- どちらが誤りか: 実装(開示の欠落)
- 修正案: `project-management.md`「止まらない経路」に、遅れる経路として 1 行足す(後のコミットの検査が落ちると、その前の通過した版も公開されない。公開し直すには、通過する版を push する)。除外を `src/`・`public/`・`astro.config.mjs`・`package*.json` などサイトに入る側の列挙へ改めるかは任意

### X-8 軽 G-5 の新しい段落の理由の文が過大で、置き場所が既存の表の導入を切り離す

- 所在: `gate-criteria.md` L515(「実行環境が検査器の読む入力…」の段落)
- 何が誤りか:
  1. 裁定の 3 文に足した理由の文「対象は存在しており、検査が実施されていないためです」(implementation.md 6 章 5)は、入力が無いときに対象の有無を確かめていない事実と合わない。入力が無いために、対象が無いことも確かめられていない。正しい理由は「対象の有無を確かめていない」である
  2. 例示の「検査の対象を取得するための依存」は、依存が対象を取得するかのように読める。裁定の定義は「検査器が読む入力」で、例示を狭める必要は無い
  3. 段落と 3 つの実装マークが、L513「検査の対象が存在しない基準は、『対象なし』として…通過させます」と、その基準ごとの表(L521〜)の間に入った。表が入力の欠如の段落に続くように読める
  4. 語: 保証の開示 項目4(L849)は「未実施と通過を区別する」とする。新しい文は「実施しなかった検査」とする。同じ状態に 2 つの語を使わない方が監査で照合しやすい
- 語の衝突の確認: L421(集約から外すことで基準を外さない)、L509・L513(対象なし)、L530 以降(実装後は用いない)、L849 とは、意味の上で衝突しない。入力の欠如を失敗に数えることは、項目4 の区別(未実施は通過でない)と整合する
- どちらが誤りか: 実装
- 修正案: 理由の文を「入力が無いため、対象の有無を確かめていません」へ改める。例示を「(依存・サブモジュール・生成物など)」にする。段落とマーク IMPL-0233・0234 を、未達・省略・対象なしの表(L546 付近)の後へ移す。「実施しなかった検査」を「未実施の検査」とし、保証の開示 項目4 の語に揃える

### X-9 軽 ADR-0077「既存の決定との関係」の引用の誤り

- 所在: `adr/0077-repository-ci-wiring-and-distribution.md` L89・L90・L91
- 何が誤りか:
  - L89「『未実施』『対象なし』『通過』の区別(決定7)」: ADR-0033 決定7 は「対象なし」を未達・省略と区別する決定で、未実施と通過の区別ではない
  - L90 の ADR-0052 の行の「決定6 の履歴を積む配布」: ADR-0052 の決定は 1〜4 で、ここの決定6 は ADR-0077 の決定6 を指す。行の主語が ADR-0052 なので取り違える
  - L91「G-5 の3条件の型に従う」を ADR-0074 の行に置く: 3 つの条件の出所は ADR-0073 決定2(ADR-0074 L77・L97 も ADR-0073 決定2 を引く)。ADR-0074 との関係は決定2(判定基準を実装する検査が集約に入っていることを機械で確かめる)の型である
  - 参考: `decision.md` J-3 は「G-5 の基準の数(ADR-0013 決定1)」と書くが、ADR-0013 は移行の段階の ADR で、正しくは ADR-0033 決定1。実装(ADR-0077 L44)は正しく ADR-0033 決定1 とした
- どちらが誤りか: 実装(ADR-0077。同じコミットで新設した ADR なので、採用の前に直せる)
- 修正案: L89 を「『対象なし』と未達・省略の区別(決定7)は変えない。入力の欠如は、未実施として保証の開示 項目4 で通過と区別する」へ。L90 を「本 ADR 決定6 の…」へ。L91 を ADR-0073 決定2(3 つの条件)と ADR-0074 決定2(集約の機械の確認)に分ける

### X-10 軽 委任の実装の表の「次行」が別の行を指す

- 所在: `ci-gates.md` L775(「基底ブランチから読む方法」の行)「マージのトークンへ届かないことは、次行の Environment が担う」
- 何が誤りか: 次行は「判定のスクリプト」。Environment を書いたのは 3 行下の「マージの実行の有効化」
- 修正案: 「後掲の行『マージの実行の有効化』の Environment が担う」へ改める

### X-11 軽 compute-strategy の新しい文が、判定の材料を基底から読むことを一般化している

- 所在: `compute-strategy.md` L114(「手元の検査の定義…が基底ブランチより古いことを理由に…」の段落の第2文)
- 何が誤りか: 「集約は最新の基底に対して判定し(…strict)、判定の材料を基底ブランチから読みます」。基底から読むのは基準値・台帳の例外の行(`ci-gates.md` L147)と委任の判定(L764)に限られる。G-5 の検査の定義そのものは、PR のマージのコミットから読まれる(それを補うのが契約検査)。strict はルールセットを置く体制に限られ、1 名の行には無い。EV-0138 の理由(「公式の判定が最新の基底に対して行われることで担う」)が、この一般化に依っている
- 修正案: 「集約は、基底を取り込んだ版に対して判定します(PR ではマージのコミット、PR を経ない体制では既定ブランチへの push の後の版)。基準値と例外の行は基底ブランチから読みます」程度に改める

### X-12 軽 登録簿の区分: デプロイゲートの親の節を「説明」とした

- 所在: `src/data/impl-inventory.yaml` の `ci-gates#デプロイゲート`(`none` / `explanation`)
- 何が誤りか: 親の節には、行為の指示が 2 つある。「ロールバック手順は運用引き継ぎ文書(テンプレ5)に記載し、デプロイ自動化とセットで整備する」(既存)と、X-3 の「使えない場合は、…絞る」(新規)。理由の欄「実装手段の例示と、…扱いの説明」は前者を落としている
- 修正案: X-3 の文を削ったうえで、ロールバック手順の行をどう扱うか(様式の欄で追う `elsewhere` か、マークか)を区分し直す

### X-13 軽 `build-template-kb.mjs` は template/ が無いとき失敗しない(反映の記録の確認が偽)

- 所在: `scripts/build-template-kb.mjs` `defaultOut()`、`implementation.md` 4 章 3 項目め
- 何が誤りか: 記録は「`template/` の無い複製で、… `build-template-kb.mjs` の既定の出力が、取得の命令を出して終了コード 1 で終わる」とする。worktree で `template/` を削除して実行すると、`../pit-in-template/scripts/vendor/tailoring-kb.json` を作って書き出し、終了コード 0 だった(空のディレクトリの場合は終了コード 1)。リポジトリの外にディレクトリを作る。加えて、書き出しの失敗の文言が「検査を実施できません。実施しなかった検査は失敗に数えます」で、書き出しに合わない
- どちらが誤りか: 実装の記録(と、残した兄弟のリポジトリへの退避)
- 修正案: 兄弟のリポジトリへの退避を `--out` の明示に限り、既定では template/ が無ければ失敗させる。少なくとも記録を事実に合わせる。`describeMissing` に書き出し用の文言を分ける

### X-14 軽 git-strategy の1名の行の重複

- 所在: `git-strategy.md` L138
- 何が誤りか: 「既定ブランチへの push を契機に実行する。push そのものは止めない。既定ブランチへの push でも、契約検査を実行する」と、既定ブランチへの push を 2 度書く。読み手は 2 つの別の要求と読む
- 修正案: 「CI(G-5相当)は最初から必須。既定ブランチへの push を契機に、契約検査を含めて実行する。push そのものは止めない」へまとめる

### X-15 軽 新しい文「失敗に数えなければなりません」と、アダプタの任意の検査の通過

- 所在: `gate-criteria.md` L515 と IMPL-0234 の note、`template/scripts/gate/adapter.mjs` L46-53
- 何が誤りか: アダプタは `audit`・`licenses`・`coverage`(基準2・5・3)のコマンドが空のとき、通知を出して通す。入力の欠如ではなく構成の欠如なので、新しい文に直接は反しない。しかし「実施しなかった検査として失敗に数える」は、読み手に「未実施は G-5 で失敗」という一般則として読まれやすく、テンプレートの挙動と食い違って見える。IMPL-0234 の note は開示している
- 修正案: 本 Issue では直さない。裁定 5 章の別 Issue 2(「未実施」の長期化)の起票に、アダプタの任意の検査の空のコマンドを含める

## 確かめて誤りが無かったこと

- **SSH のホスト鍵**: `ci.yml` L187 の `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl` は、`https://api.github.com/meta` の `ssh_keys` の ed25519 の値と一致した
- **アクションの版**: `actions/upload-pages-artifact` に `v4`・`v4.0.0` のタグ、`actions/deploy-pages` に `v5`・`v5.0.0`・`v5.0.1` のタグがある(`git ls-remote --tags`)。`deploy-pages@v5` は旧 `deploy.yml` でも使っていた
- **成果物の受け渡し**: `check` が `upload-pages-artifact` で `dist/` を上げ、同じ実行の `deploy` が `deploy-pages` で受け取る形は、公式の 2 ジョブの型と同じ。`deploy` の権限(`pages: write`・`id-token: write`)、`environment: github-pages`、`concurrency: pages` は揃っている。`deploy`・`publish` の `if` は状態の関数を持たないので、暗黙の `success()` が掛かる
- **publish の手順**: `persist-credentials: false`、最上位 `contents: read`、`GITHUB_TOKEN` に書き込みを与えない、強制 push をしない、ブランチが無いときだけ作る(`ls-remote` の終了コード 2)、それ以外の取得の失敗は失敗、の各点は裁定 J-6 a・b・e・f と一致する。`fetch-depth: 0` で祖先の判定ができる。`source.commit` は `git rev-parse HEAD`(push の実行では `GITHUB_SHA`)で、`--kb` の一致の検査と矛盾しない。`check-gate-criteria.mjs --kb` は template/ を読まないので、サブモジュールを取らない `publish` でも動く
- **入力の欠如(J-3)**: `template/` が空のディレクトリのとき、`check-template-drift`・`check-template-fields`・`check-skill-provisions`・`check-recalibration-registry`・`check-gate-criteria`・`check-provisions`・`check-impl`・`build-template-kb`(既定の出力)がすべて取得の命令を出して終了コード 1。`template/` が無いときも、`build-template-kb` を除いて終了コード 1(X-13)。template を読むスクリプトはこの 8 本と試験だけで(`grep`)、黙って通るものは残っていない
- **台帳**: `npm run evidence:write`・`impl:write`・`scope:write` を再実行して差分なし。EV-0137・EV-0138 の書式は EV-0134〜0136 と同じ
- **IMPL の降ろし先と状態**: 新しい降ろし先 `g5-local`・`g5-adapter`・`delegation-workflow`・`gate-g5-workflow` は template にファイルが実在する。IMPL-0232(`g5-local.mjs` が「証跡になりません」を出す)、IMPL-0233(`spec-lint.mjs` は KB が無ければ `readFileSync` で落ち、検出語が空なら `exit(1)`)、IMPL-0238(`gate-g5.yml` は `push: branches: [main]` で `verify-gate-contract.mjs` を走らせ、集約がトレーラ `Risk`・`Verification` を読む)は `delivered` が事実に合う。IMPL-0234・0235・0237・0239 の `undelivered` も事実に合う。IMPL-0236 だけが X-2 により疑わしい
- **ADR の書式**: ADR-0077 は adr/index.md のテンプレートの節(ステータス・コンテキスト・決定・検討した選択肢・影響)を持つ。置き換えではないので、運用ルール5 の相互の参照は要らない
- **git-strategy の 1名の行**: 要求の中身(CI 必須・契約検査・トレーラ)は変わっていない。注記の削除は他所からの参照が無い(`grep`)
- **delegation.yml の注記**: 「`workflow_dispatch` は選んだ ref の定義で動く」は GitHub の挙動と合う。「リポジトリの秘密情報は任意のブランチのワークフローから読める」「限定の無い Environment の秘密情報はどのブランチからも読める」「管理者は既定で迂回できる」は GitHub Docs と合う(ただし管理者の迂回の設定は Free・Pro・Team では公開のリポジトリに限る)

## 実装の担当が挙げた食い違い(implementation.md 6 章)の評価

| # | 内容 | 評価 |
| --- | --- | --- |
| 1 | 飛ばす・黙って通す検査をすべて揃えた | 受け入れる。裁定の趣旨どおり。記録の確認の一部が偽(X-13) |
| 2 | 手動の起動では公開・配布しない | 受け入れる。再配布の手段は「main の push の実行の Re-run」として残る。ただし X-5 の場合は Re-run では取り戻せない |
| 3 | `publish` は `contents: read` のまま | 受け入れる。裁定より狭い |
| 4 | 変化の判定・古い版の上書きの防止・変化が無ければコミットしない | 上書きの防止は受け入れる(X-7 の開示を足す)。変化の判定は X-5 の欠陥を持ち、「コミットしない」は動かない |
| 5 | 文の語順と理由の 1 文 | 語順は受け入れる。理由の 1 文は事実に合わない(X-8) |
| 6 | デプロイゲートを子の節に分けた | 構成は受け入れる。ただし親の節に裁定に無い G-8 の代替が入った(X-3) |
| 7 | 適用範囲の注記を付けない | 受け入れる。主語(デプロイ・配布)が範囲を限る。ただし規範の中身は X-1 で直す |
| 8 | 裁定に無い実装マーク 3 件 | 受け入れる。IMPL-0239 の `undelivered` は別 Issue 2 の論点を正しく開示する |
| 9 | `g5-local.mjs` に 1 行足して `delivered` | 受け入れる |
| 10 | CLAUDE.md の 1 行だけ | 不足。同じファイルの L114 が削除したワークフローを指す(X-6) |

## 実行した検査

- `npm run check`(作業の木。`lint:ci` から `build` まで。306 頁。終了コード 0)
- 台帳の再生成(`evidence:write`・`impl:write`・`scope:write`)後の `git status`: 差分なし
- worktree(`template/` 空・削除)での個別のスクリプトの実行(上記)
- `checkWiring` への探針 9 場面(X-4)
