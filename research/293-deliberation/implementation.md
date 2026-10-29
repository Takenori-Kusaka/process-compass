# 反映の記録(Issue #293 リポジトリ運営 — CI・配布。裁定 J-1〜J-9)

- 日付: 2026-10-23
- 正とした文書: `research/293-deliberation/decision.md`(J-1〜J-9)
- 迷ったときに引いた材料: `council-01-drafter.md`(文の案・ワークフローの案)、`survey-293-1-internal.md`(列挙の 9 か所 e1〜e9)
- 様式の手本: `research/292-deliberation/implementation.md`、`src/content/docs/adr/0076-*.md`

## 0. 次の担当へ引き継ぐこと

### 0.1 番号

この担当が使った番号: ADR-0077、EV-0137・EV-0138、IMPL-0232〜IMPL-0239(突合の後の修正で新しい番号は使っていない)。**次に使える番号は、ADR-0078、EV-0139、IMPL-0240**。使う前に、既存の最大を自分で確かめること。

### 0.2 マージの前提(利用者へ伝えること)

`template/` のサブモジュールは pit-in-template の作業ブランチ `claude/process-compass-293`(9fc6132。突合の後の修正を含む)を指す。#291〜#293 の積み重ねで、template の main には無い。**本リポジトリの変更を main へ入れる前に、テンプレート側を main へマージし、サブモジュールの指す先を template の main の上のコミットにする**。CI(`ci.yml`)は template を取得できなければ失敗する(J-3)。

### 0.3 管理者の設定(利用者が設定画面で行う。AI は行わない)

`community/project-management.md`「管理者の設定(保守者が設定画面で行う)」が正。要点:

1. 配布専用の SSH 鍵(ed25519)を作り、公開鍵を deploy key(書き込み可)として登録する
2. **配布のジョブが走る前に** Environment `dist-standard` を作る。配備のブランチは `main` だけ。必須レビュアは置かない。秘密情報 `DIST_STANDARD_DEPLOY_KEY` に秘密鍵を置く(リポジトリの秘密情報には置かない)
3. `dist/standard` にルールセット(削除の禁止・強制 push の禁止・更新の制限)。バイパスは deploy key だけ。`GITHUB_TOKEN`(GitHub Actions)と管理者のロールを入れない
4. 設定の日付と、`main` 以外のブランチから配布できないことを確かめた結果を Issue #293 に記録する(EV-0137 の差し替え条件の材料)

設定が済むまで、`publish` は「配布の資格情報がありません」で失敗する(止まる側)。その間に `publish` が走ると、保護の無い Environment `dist-standard` が自動で作られる。その場合は手順2 でその Environment に保護を設定する。

### 0.4 Issue に書くこと

- 受入条件2 の「対象なし」は「入力の欠如」と読み替えた(J-3。起票の文 4-A は採らない)
- 受入条件3 の「Environments の承認」は「Environment の配備のブランチの限定」と読み替えた(J-6。必須レビュアは置かない)
- 受入条件4 は、PR #322 のマージ後の週次の lychee で 4xx の起票が 0 件であることを確かめて閉じる(J-8。本変更では閉じない)
- CLAUDE.md の「コマンド」の行を変えた。CLAUDE.md は利用者の指示ファイルなので、PR で変更点を明示して了承を得る(J-1)

## 1. 裁定ごとの記録

### J-1 検査の一覧

- 正本は `package.json` の `check`。次の説明の側の列挙をやめ、`check` を参照する形に改めた
  - `CLAUDE.md` の「コマンド」の `npm run check` の行(ほかの節は触れていない)
  - `README.md`「開発」(初期化の行を足し、公開の行を CI の通過に合わせた)
  - `CONTRIBUTING.md`「開発環境」と PR のルール2
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `community/project-management.md` の完了の定義(旧 L57)と PR フロー移行の手順3(旧 L66。「CI の `check` ジョブを必須ステータスチェックにし、strict」)
- `scripts/check-ci-wiring.mjs`(`npm run lint:ci`)を `check` の先頭に入れた。条件の本体は `scripts/lib/ci-wiring.mjs` の純粋な関数 `checkWiring`。裁定の条件1〜7 をすべて実装した。加えて、条件4 で公開・配布のジョブの `if` が main への push に限ること、条件5 で最上位の権限が書き込みを与えないこと(J-6 f)を確かめる
- 陽性対照 `scripts/test-check-ci-wiring.mjs`(`npm run test:ci-wiring`。`check` に含めた)。21 件。実際のワークフローが通ることと、各条件の違反で落ちることを確かめる
- 散文の列挙の機械検出は課さない(実装していない。`check-ci-wiring.mjs` の冒頭と ADR-0077 決定1 に明記)

### J-2 公開と配布

- `deploy.yml`・`publish-standard.yml` を削除し、`ci.yml` のジョブ `deploy`・`publish` にした。どちらも `needs: check` と `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
- 公開は、`check` の `npm run check`(最後の `astro build`)が作った `dist/` を `actions/upload-pages-artifact@v4` で渡し、`deploy` が `actions/deploy-pages@v5` で配る。`withastro/action` による 2 回目のビルドはやめた
- `workflow_run` は使っていない

### J-3 入力が無いとき

- 共通の関数 `scripts/lib/inputs.mjs`(`missingInputs`・`requireInputs`・`describeMissing`。空のディレクトリを無いものに数える。失敗の文言に `git submodule update --init --recursive`)
- template を読む検査を、手元・CI とも失敗に揃えた

| 検査 | 以前 | 以後 |
| --- | --- | --- |
| `check-template-drift.mjs` | 飛ばす(終了コード 0) | 失敗。冒頭の注記を改めた |
| `check-template-fields.mjs` | 方向2 を飛ばす | 方向1 を実施したうえで失敗 |
| `check-skill-provisions.mjs` | 飛ばす | 失敗 |
| `check-recalibration-registry.mjs` | 飛ばす | 失敗 |
| `check-gate-criteria.mjs` | KB が無ければ黙って「一致」 | 失敗 |
| `check-provisions.mjs` | 置き場が空でも「違反なし」(空のディレクトリは数えていなかった) | 置き場が無い・空なら違反 |
| `check-impl.mjs` | 失敗(取得の命令が `--init` だけ) | 失敗。空のディレクトリも明示して失敗。命令に `--recursive` |
| `build-template-kb.mjs` の既定の出力 | 空の template へ書き出す | 失敗 |

- 標準: 第4章 G-5「検査対象が存在しない場合の扱い」の L509 の段落の後に、入力の欠如は「対象なし」に当たらず、G-5 の判定で失敗に数え、「対象なし」として記録してはならない旨を置いた。ADR-0033 決定2 の範囲の明確化として ADR-0077 決定3 に記録した
- 実装マーク: IMPL-0233(`spec-lint`、`delivered`・`machine`。検出語の知識ベースが無ければ読み込みで、空なら `fail` で失敗することを本文で確かめた)、IMPL-0234(新しい降ろし先 `g5-adapter`、`undelivered`。依存の取得の失敗で各スタックの検査器が失敗で終わるかは確かめていない)

### J-4 配布物の検査

- `check-gate-criteria.mjs --kb <path>` を足した。`publish` で、生成の直後・push の前に `dist-standard/tailoring-kb.json` を検査する
- `source.commit` は 40 桁の16進に限る(`'unknown'`・短い識別子・`-dirty` 付きを通さない)。`--kb` を渡し環境変数 `GITHUB_SHA` があれば一致を求める。template 側の KB(既定の対象)にも 40 桁の16進を求める
- ADR-0077 決定4 に「ADR-0052 決定1 の配布物は `dist/standard` を含む」と記録した

### J-5 段の順序・手元の停止・手元の結果

- (1) `compute-strategy.md`「ローカルファーストの多段検査」に「段の中の検査の順序は定めません。段の判定は、その段のすべての検査の結果で行います」
- (2) 同「ローカル実行環境の整備」の末尾に、基底の検査定義の古さを理由に手元を止めることは求めない旨と EV-0138(E1、見直し 2027-10)
- (3) 第4章 G-5「判定基準を実装する検査と集約」に「**手元で実行した検査の結果を、G-5 の判定の証跡としてはなりません**」。IMPL-0232(新しい降ろし先 `g5-local`、`delivered`・`manual`)。テンプレートの `g5-local.mjs` の出力に「この結果は G-5 の判定の証跡になりません」を足した(証跡の置き場へ書かないことは本文で確かめた)
- `compute-strategy.md` の表と図の「PR」を「必須の検査の集約」に改め、第4章 G-5 の節を引いた

### J-6 配布の保護

運営(`ci.yml` の `publish`):

| # | 裁定 | 実装 |
| --- | --- | --- |
| a | 強制 push をやめ、履歴を積む | 既存の `dist/standard` を clone し、中身を入れ替えてコミットを積み、`--force` なしで push。ブランチが無ければ(`git ls-remote` の終了コード 2)最初の配布として作る。それ以外の取得の失敗は失敗。配る中身は本文・KB・`VERSION.md`・`LICENSE` だけ |
| b | deploy key を Environment `dist-standard` の秘密情報に置き、無ければ失敗 | `environment: dist-standard`。秘密情報 `DIST_STANDARD_DEPLOY_KEY` が空なら、管理者の手順を示して失敗。SSH のホスト鍵は GitHub の公開する ed25519 の鍵に固定 |
| e | ジョブ先頭で ref と push を確認 | 「起動元を確かめる」の手順 |
| f | 最上位 `contents: read`、ジョブ単位で付与、setup-node v7 | 全 4 ワークフロー。`publish` は deploy key で書くため `contents: read` のまま。`evidence-review.yml` の `setup-node@v4` も v7 へ揃えた |
| g | VERSION.md に契機・ref・SHA | 「起動: `push` / `refs/heads/main`」「コミット」「実行の番号と試行」 |
| h | 止まらない経路の文書化 | `project-management.md`「止まらない経路」 |
| c・d | Environment の配備のブランチ・ルールセット | 利用者の作業(0.3) |

標準:

- `ci-gates.md`「デプロイゲート」を改めた。L879 の事実の訂正(必須レビュアは Free・Pro・Team の非公開のリポジトリで使えない)、子の節「統制と資格情報の置き場」に規範「デプロイ・配布の統制と資格情報を、起動元のブランチで書き換えられるワークフローのファイルの中だけに置いてはなりません」、GitHub の機能との対応の表(自動作成・配備のブランチの限定・リポジトリの秘密情報・管理者の迂回)、EV-0137(E1、見直し 2027-10)
- 子の節「配布用のブランチの保護を独立の要求事項にしない」で、課さないと明記した
- 実装マーク: IMPL-0236(`delegation-workflow`、`delivered`)、IMPL-0237(新しい降ろし先 `deploy-workflow` は `planned`、`undelivered`)
- 委任の実装の表(旧 L774・L778): 手動の起動は選んだブランチの定義で動くこと、トークンを Environment `delegated-merge` の秘密情報に置くことに改めた

テンプレート(pit-in-template、`claude/process-compass-293`、8a7fc40。push 済み):

- `delegation.yml`: `workflow_dispatch` の注記を直した(選んだ ref の定義で動く)。ジョブに `environment: delegated-merge`。冒頭の注記のトークンの置き場を改めた
- `README.md`: 有効化の手順に Environment の作成(参照の前)・配備のブランチの限定・リポジトリの秘密情報に置かないこと・既定ブランチ以外の起動が拒まれることの確認を足した。管理者の迂回を責任の項目に足した
- `test-check-delegation.mjs`: ジョブの `environment: delegated-merge` を確かめる 1 件を足した
- `check-delegation.mjs`: 無効のときの文言のトークンの置き場を改めた

### J-7 事実の誤り

- `git-strategy.md` の「本サイトが段階導入の実例」の注記を削った。他所からの参照は無かった(`grep` で確かめた。research の調査・意見書の引用だけ)
- 1名の行に「既定ブランチへの push を契機に実行する。push そのものは止めない」を補った。IMPL-0238(新しい降ろし先 `gate-g5-workflow`、`delivered`)
- `ci-gates.md` L281 の注記は保ち、「CI でも、PR と既定ブランチへの push で同じ `npm run check` を実行します」を足した
- 本リポジトリの実際の運用は `project-management.md`「本リポジトリの運用」に書いた

### J-8

- 何もしない(`.lycheeignore` に足していない)。受入条件4 は 0.4 のとおり

### J-9 本 Issue で直す 8 件

1. `source.commit: 'unknown'` が通る → J-4
2. `deploy.yml` の 2 回目のビルド → J-2
3. `permissions:` の欠落・最上位の `contents: write` → J-6 f
4. `publish-standard.yml` の `setup-node@v4` → ファイルごと削除。`ci.yml` は v7
5. README・CONTRIBUTING の初期化 → J-1・J-3
6. `project-management.md` L66 → J-1
7. `delegation.yml` の注記とトークンの置き場、`ci-gates.md` L774・L778 → J-6
8. 強制 push → J-6 a

別 Issue 4 件(裁定 5 章)と記録のみ 3 件は、本変更で扱っていない。起票は議長が行う。

## 2. 番号の割り当て

| 番号 | 置き場 | 内容 |
| --- | --- | --- |
| ADR-0077 | `adr/0077-repository-ci-wiring-and-distribution.md` | 本 Issue の決定 |
| EV-0137 | `ci-gates.md` デプロイゲート > 統制と資格情報の置き場 | 統制と資格情報の置き場の要求(E1) |
| EV-0138 | `compute-strategy.md` ローカル実行環境の整備 | 手元の停止を課さないこと(E1) |
| IMPL-0232 | 第4章 G-5 判定基準を実装する検査と集約 | 手元の結果を証跡にしない → `g5-local`(delivered) |
| IMPL-0233 | 第4章 G-5 検査対象が存在しない場合の扱い | 入力の欠如 → `spec-lint`(delivered) |
| IMPL-0234 | 同上 | 入力の欠如 → `g5-adapter`(undelivered) |
| IMPL-0235 | `ci-gates.md` 委任の該当の判定とマージの経路 | 要求事項1〜6 → `delegation-workflow`(undelivered。実機で未確認) |
| IMPL-0236 | `ci-gates.md` デプロイゲート > 統制と資格情報の置き場 | トークンの置き場 → `delegation-workflow`(delivered) |
| IMPL-0237 | 同上 | 案件のデプロイ → `deploy-workflow`(planned、undelivered) |
| IMPL-0238 | `git-strategy.md` 段階導入 | 1名の行 → `gate-g5-workflow`(delivered) |
| IMPL-0239 | 第4章 G-5 検査対象が存在しない場合の扱い | 既存の「対象なし」の規定 → `g5-adapter`(undelivered) |

新しい降ろし先: `g5-local`・`g5-adapter`・`delegation-workflow`・`gate-g5-workflow`(template-file。実在を検査が確かめる)、`deploy-workflow`(planned)。

## 3. 変更したファイル

- ワークフロー: `.github/workflows/ci.yml`(書き直し)、`evidence-review.yml`・`link-check.yml`・`graphify-update.yml`(権限。`evidence-review` は setup-node v7)、`deploy.yml`・`publish-standard.yml`(削除)
- 検査: `scripts/check-ci-wiring.mjs`(新)、`scripts/lib/ci-wiring.mjs`(新)、`scripts/lib/inputs.mjs`(新)、`scripts/test-check-ci-wiring.mjs`(新)、`scripts/check-gate-criteria.mjs`、`check-provisions.mjs`、`check-impl.mjs`、`check-template-drift.mjs`、`check-template-fields.mjs`、`check-skill-provisions.mjs`、`check-recalibration-registry.mjs`、`build-template-kb.mjs`、`package.json`
- 説明: `CLAUDE.md`(「コマンド」の 1 行だけ)、`README.md`、`CONTRIBUTING.md`、`.github/PULL_REQUEST_TEMPLATE.md`
- 標準: `phase4-process-design/gate-criteria.md`、`phase5-implementation/ci-gates.md`・`compute-strategy.md`・`git-strategy.md`、`community/project-management.md`、`adr/0077-*.md`(新)
- データ: `src/data/impl-targets.yaml`、`src/data/impl-inventory.yaml`
- 台帳(自動生成): `community/evidence-ledger.md`、`community/implementation-ledger.md`(`scope-ledger.md` は変化なし)
- サブモジュール: `template` → 8a7fc40

### 3.1 登録簿で区分した節(すべて `issue: 293`)

| 節 | 区分 |
| --- | --- |
| 第4章 G-5 > 判定基準を実装する検査と集約 | marked(IMPL-0142・0232) |
| 第4章 G-5 > 検査対象が存在しない場合の扱い | marked(IMPL-0233・0234・0239) |
| ci-gates#様式・データの検証もゲートに載せる | none / explanation |
| ci-gates#…委任の該当の判定とマージの経路 | marked(IMPL-0235。行 要求事項1〜6。1・2 は第5章 5.5.4 も所在) |
| ci-gates#デプロイゲート | none / explanation |
| ci-gates#デプロイゲート > 統制と資格情報の置き場 | marked(IMPL-0236・0237) |
| ci-gates#デプロイゲート > 配布用のブランチの保護を独立の要求事項にしない | none / not-imposed |
| compute-strategy#ローカルファーストの多段検査 | none / elsewhere(第4章 G-5 集約の節) |
| compute-strategy#ローカル実行環境の整備 | none / not-imposed |
| git-strategy#段階導入(テーラリング) | marked(IMPL-0238。所在: 第8章 軸E) |

## 4. 確かめたこと

- `npm run check` が全体で通る(2026-10-23。終了コード 0。306 頁のビルド)
- `actionlint` 1.7.12(`pip install actionlint-py`)で、本リポジトリの 4 ワークフローと template の全ワークフローに指摘 0 件。shellcheck は環境に無く、`run:` のシェルの静的検査はしていない
- `template/` を空のディレクトリにした複製と、`template/` の無い複製で、`lint:impl`・`lint:provisions`・`lint:skills`・`lint:registry`・`test:template`・`test:fields`・`test:criteria` が、取得の命令を出して終了コード 1 で終わる。`build-template-kb.mjs` の既定の出力は、この時点では空のディレクトリの場合だけ失敗し、`template/` の無い場合は兄弟のリポジトリへ書き出していた(突合 X-13 で偽と指摘。7 章で直し、両方で失敗することを確かめ直した)
- `check-gate-criteria.mjs --kb` が、`GITHUB_SHA` と食い違う版で失敗し、一致する版で通る
- `publish` の「配布用ブランチへ積む」の手順を、送り先を手元の bare リポジトリへ差し替えて実行した: 1 回目でブランチを作り、2 回目で前のコミットの上へ積む。中身は `docs/`・`tailoring-kb.json`・`VERSION.md`・`LICENSE` だけ。配布済みの版より古いコミットからの実行は配らずに終わる
- テンプレートの試験(`verify-gate-contract`・`test-check-delegation`(39 場面)・`test-check-pr`・`test-recalibration`・`test-roster-rules`・`test-g5-aggregate`・`test-plan-trace`・`test-init-g5`)がすべて通る
- KB は再生成の要が無い(本文の変更で KB の内容は変わらず、`check-template-drift` が一致)

## 5. 確かめていないこと

- 公開・配布・委任のマージの経路を、実際の GitHub 上で実行していない。とくに次の 4 点
  - `actions/upload-pages-artifact@v4` の版の実在と、`check` の `dist/` を別のジョブの `deploy-pages@v5` が受け取ること(この環境から GitHub の API に届かなかった)
  - 配備のブランチを `main` に限った Environment が、既定ブランチ以外からの起動を拒むこと(EV-0137 の差し替え条件の材料)
  - ルールセットのバイパスに deploy key を指定でき、`GITHUB_TOKEN` の書き込みが拒まれること
  - `delegated-merge` を参照する `pull_request_target`・`workflow_run` のジョブが、配備のブランチの限定を通ること(ref が既定ブランチであることは GitHub の文書による)
- GitHub の ed25519 のホスト鍵の値は、記憶している公開値を書いた。この環境から GitHub の公開の一覧(`api.github.com/meta`)と照合していない。食い違えば `publish` は接続で失敗する(通る側には倒れない)
- `deploy` の「古い版で上書きしない」の手順(compare API の `status` と変更ファイル)は、実際の API の応答で確かめていない。取得に失敗した場合は公開しない側に倒れる
- アダプタを使う G-5 のジョブが、依存の取得の失敗で検査器の入力を欠いたときに失敗で終わるか(IMPL-0234 を `undelivered` にした理由)

## 6. 裁定と食い違った点

1. **入力の欠如で「飛ばす・黙って通す」検査の数**: 裁定は「黙って通る 2 本と、飛ばす 1 本」とした。実際には、飛ばすものが 4 本(`check-template-drift`・`check-template-fields` の方向2・`check-skill-provisions`・`check-recalibration-registry`)、黙って通すものが 2 本(`check-gate-criteria`・`check-provisions`)と、`build-template-kb.mjs` の既定の出力(空の template へ書き出す)があった。裁定の趣旨(手元・CI とも失敗に揃える)に従い、すべてを揃えた
2. **手動の起動での公開・配布**: 裁定は公開・配布を「main への push」に限った。以前の `deploy.yml`・`publish-standard.yml` は `workflow_dispatch` でも動いた。`ci.yml` の `workflow_dispatch` は検査だけを走らせ、公開・配布はしない。手動で配り直すときは、main への push の実行を「Re-run」する(起動の契機は push のまま残る)。起草が 7-D で懸念した「手動の再配布の手段」はこの形で残る
3. **`publish` のジョブの権限**: 裁定 f は「書き込みはジョブ単位で付ける」。`publish` は deploy key で書くため、`GITHUB_TOKEN` に書き込みを付けていない(`contents: read`)。裁定 d の「`GITHUB_TOKEN` をバイパスに入れない」と合わせ、より狭い形にした
4. **裁定に無い手当て(足したもの)**
   - 配布の対象の変化の判定を `check` のジョブに置いた(旧 `publish-standard.yml` のパスの条件の引き継ぎ。比べられなければ変わったものとして扱う)。対象に `scripts/check-gate-criteria.mjs`・`scripts/lib/inputs.mjs` を足した
   - 古い版での上書きの防止。`needs` でも、別の push の実行どうしは完了の順に並ぶため、起草が `workflow_run` について挙げた上書きが残る。`publish` は配布済みの版がこの実行のコミットの子孫なら配らない。`deploy` は `main` がサイトに入るファイルの変更で進んでいれば配らない(知識グラフの `[skip ci]` のコミットだけで進んだ場合は配る。そうしないと公開が毎回止まる)
   - 配布物に変化が無ければコミットしない
5. **J-3 の標準の文の語順**: 裁定の文案「検査器が読む入力(…)が実行環境に無いために実施できなかった検査は」は textlint(助詞「に」の重複)で落ちるため、「実行環境が検査器の読む入力(…)を欠くため実施できなかった検査は」とした。意味は変えていない。裁定の 3 文に加え、「対象は存在しており、検査が実施されていないためです」の理由の 1 文を置いた
6. **デプロイゲートの構成**: 規範を箇条書きの1行でなく、子の節「統制と資格情報の置き場」に置いた。GitHub の機能名は対応の表へ分けた(裁定の「規範の文は『実行環境』『秘密情報』で書き、GitHub の対応は表・注記に置く」に従う)。課さない明記も子の節にした。新しい節は登録簿で区分した
7. **適用範囲の注記**: 裁定 7 章が要否の確認を求めた。デプロイゲートの規範は G-8 を持つ案件に限らず、自動のデプロイ・配布を持つすべての案件に掛かるため、見出しに `(適用: …)` を付けなかった
8. **裁定に無い実装マーク**: 変えた節を登録簿で区分するため、IMPL-0235(委任の要求事項1〜6。実機で未確認のため `undelivered`)、IMPL-0238(1名の行)、IMPL-0239(既存の「対象なし」の規定。`undelivered`)を足した。裁定の別 Issue 3(「対象なし」を記録の 3 項目で残しているか)の論点は、IMPL-0239 の `undelivered` で開示した
9. **テンプレートの `g5-local.mjs`**: 裁定は IMPL-0232 を `g5-local` へ `delivered` で接続するとした。既存の出力は「マージを止めるのは CI」までで、「証跡にならない」は無かった。出力に 1 行足してから `delivered` にした
10. **CLAUDE.md**: 「コマンド」の `npm run check` の行だけを改めた。了承は PR で得る(0.4)

## 7. 突合の後の修正(`crosscheck.md` X-1〜X-15、`decision.md` 8 章の裁定に従う)

| ID | 裁定 | 直したこと |
| --- | --- | --- |
| X-1 | 裁定 J-6 の文を改める | `ci-gates.md`「統制と資格情報の置き場」の手段の文を「配備を許す参照(既定ブランチ、またはリリースのタグ)に限った実行環境の秘密情報に置きます」へ改めた。プランにより手段を使えない場合は規定を満たせず、満たしたものとして扱わず保証の開示に未達として記録する旨の段落を置いた(ADR-0028 を引く)。タグからの配備を許す場合にタグの作成を限らないと同じ穴を持つことを足した。対応の表の行を「配備の参照の限定(Selected branches and tags。規則は `GITHUB_REF` に照らす。タグの作成をルールセットで限る)」に改め、「プランの制限」の行(Free の非公開のリポジトリでは Environment の秘密情報と配備の参照の限定を使えない。必須レビュアは Free・Pro・Team の非公開で使えない)を足した。管理者の迂回の設定が Free・Pro・Team では公開のリポジトリに限ることを足した。EV-0137 の対象の文、IMPL-0237 の note、ADR-0077 決定6(標準)を同じく改めた。本リポジトリの `dist-standard`(main への push だけで配る)は変えていない |
| X-2 | 採る | テンプレート `delegation.yml` を、判定のジョブ `delegation-check`(Environment もトークンも参照しない。`--status` だけ)と、マージのジョブ `delegation-merge`(`needs: eligibility`、`if: vars.DELEGATED_MERGE_ENABLED == 'true' && needs.eligibility.outputs.eligible == 'true'`、`environment: delegated-merge`、判定し直してから `--merge`)に分けた。`check-delegation.mjs` が判定の結果 `eligible` を `GITHUB_OUTPUT` へ出す。`test-check-delegation.mjs` の 1 件を 2 件に改めた(判定のジョブが Environment とトークンを参照しないこと、マージのジョブだけが参照し有効化の変数で動くこと)。README に、マージのジョブだけが参照すること・既定ブランチ以外へ向けた PR ではマージのジョブが拒まれること・以前の手順のリポジトリの秘密情報を削除することを足した。`ci-gates.md` の委任の実装の表と IMPL-0236 の note を合わせた。修正したので IMPL-0236 は `delivered` のまま。テンプレートのコミット 9fc6132(push 済み)、サブモジュールの指す先を更新 |
| X-3 | 採る | デプロイゲートの第1項の G-8 の代替の文を削り、「使えない場合の G-8 の成立の条件は、本標準では現時点で定めていない(QMS 文書管理の承認権限の対応の扱いとして、別に検討する)」へ替えた。ADR-0077 にも同旨を足した。別 Issue 1 の起票に、この文の要否を含めること |
| X-4 | 採る | `checkWiring`: 公開・配布のジョブの `if` に `always(`・`failure(`・`cancelled(`(否定を含む)・`!success(`・`\|\|` があれば失敗。`dist/standard` へ書くジョブの認識を「いずれかの手順が `dist/standard` を含み、いずれかの手順が `git push` を含む」へ広げた。条件3 は取得の命令に `template` の語を必須にした(`--recursive` だけでは通さない)。条件8 を足した: `dist/standard` の文字列と `DIST_STANDARD_DEPLOY_KEY` が、`ci.yml` の `publish` ジョブの外(全ワークフローの最上位と他のジョブ)に現れれば失敗。陽性対照を 4 件足した。変数や別の手順で隠した push と、`npm pkg set` などで `check` を書き換える形は拾わないことを、`check-ci-wiring.mjs` の冒頭と `project-management.md`「止まらない経路」に書いた(止めるのはルールセット) |
| X-5 | 採る | `check` の「配布の対象が変わったか」の手順と、`publish` の `if` の `dist_changed` を外した。`publish` は main への push ごとに走り、生成した中身と、現在の `dist/standard` の中身を比べる。`VERSION.md` を除いたファイルの差と、知識ベースの `source` を除いた JSON の差がどちらも無ければ配らない。前の配布が失敗しても、次の push で取り戻す。手元の bare リポジトリで、1 回目は作成、同じ中身の 2 回目は配らない、本文を変えた 3 回目は積む、を確かめた。比べるための前回の知識ベースは `RUNNER_TEMP` に置く |
| X-6 | 採る | CLAUDE.md「Git 戦略」の `deploy.yml` の行を `ci.yml` のジョブ `deploy`・`publish` へ、README のバッジを `ci.yml` へ改めた。CLAUDE.md の変更は、J-1 の行と合わせて PR で利用者の了承を得る |
| X-7 | 採る | `project-management.md`「止まらない経路」に、上書きの防止は新しい実行の成功に依り、後のコミットの検査が落ちる・`[skip ci]` を付けた push では前の通過した版も公開されないことを足した。表の行にも注記した |
| X-8 | 採る | G-5 の段落の理由を「入力が無いため、対象の有無を確かめていないからです」へ、例示を「(依存・サブモジュール・生成物など)」へ、「実施しなかった検査」を「未実施の検査」へ改め、保証の開示の項目4 と同じ区別であることを書いた。段落と IMPL-0233・0234 を、未達・省略・対象なしの表の後(節の末尾)へ移した |
| X-9 | 採る | ADR-0077「既存の決定との関係」: ADR-0033 決定7 を「『対象なし』と未達・省略の区別」に直し、入力の欠如は未実施として項目4 で通過と区別すると書いた。ADR-0052 の行の「決定6」を「本 ADR 決定6」に直した。3 つの条件の出所を ADR-0073 決定2 の行に分け、ADR-0074 の行は決定2(集約の機械の確認)の型とした |
| X-10 | 採る | 委任の実装の表の「次行の Environment」を「後掲の行『マージの実行の有効化』の Environment」へ |
| X-11 | 採る | `compute-strategy.md`: 集約は基底を取り込んだ版(PR ではマージのコミット、PR を経ない体制では push の後の版)に対して判定し、strict はルールセットを置く体制で求め、基底から読むのは基準値と例外承認の行、と改めた。EV-0138 の本文の「最新の基底」を「基底を取り込んだ版」に合わせた |
| X-12 | 採る | 登録簿の `ci-gates#デプロイゲート` を `none` / `elsewhere`(所在: 第6章 テンプレ5 運用引き継ぎ文書。ロールバック手順は様式の切り戻しの欄で追う)に改めた |
| X-13 | 採る | `build-template-kb.mjs` は、`--out` の指定が無く `template/` が無い・空なら失敗する(兄弟のリポジトリへの退避をやめた)。書き出し用の文言 `describeMissingTarget`(「書き出し先が無いため、書き出しません」と `--out` の案内)を分け、陽性対照を 1 件足した。4 章の記録を事実に合わせた。`template/` が空・無いの両方の複製で、検査 7 本と書き出しが終了コード 1 で終わることを確かめ直した |
| X-14 | 採る | `git-strategy.md` の 1名の行を「CI(G-5相当)は最初から必須。既定ブランチへの push を契機に、契約検査を含めて実行する。push そのものは止めない」へまとめた |
| X-15 | 別 Issue 2 へ含める | 本変更では直していない。別 Issue 2(未実施の長期化)の起票に、アダプタの任意の検査(`audit`・`licenses`・`coverage`)の空のコマンドが通知を出して通ることを含めること |

### 7.1 6 章の記録の訂正

- 6 章 4 の「配布の対象の変化の判定を `check` のジョブに置いた」「配布物に変化が無ければコミットしない」は、X-5 で置き換えた(後者は `VERSION.md` が毎回変わるため動いていなかった)
- 6 章 5 の理由の 1 文「対象は存在しており」は、X-8 で「対象の有無を確かめていない」へ改めた
- 6 章 6 の「使えない場合は、G-8 の決断の記録を判定記録で残し…」は、X-3 で削った

### 7.2 検査と試験(突合の後)

- `npm run check`: 終了コード 0(突合の後の修正のコミットの直前)
- `actionlint`: 本リポジトリの全ワークフローとテンプレートの `delegation.yml` に指摘 0 件
- テンプレート: `verify-gate-contract`・`test-check-delegation`(39 場面と付随の確認)・`test-init-g5` が通る
- 結線と入力の試験(`test:ci-wiring`): 26 件
- 台帳: `evidence:write`・`impl:write`・`scope:write` を再実行した


## 追記(2026-10-27、#346)

この記録の後、コミット `b185611`(2026-10-23)で、配布の書き込みを deploy key の方式(裁定 J-6 の b・d)から、ジョブ `publish` にだけ `contents: write` を付けた `GITHUB_TOKEN` の方式へ改めた。保守者の決定(2026-10-23)を受けた変更で、調査・会議体・突合を経ていない。本ファイルの 6章3 など、deploy key の方式を前提にした記述は、その時点の記録として書き換えずに残す。変更の事後の審議と、第4章 G-8 の資格情報の規定の改め(置き場の指定から、参照に結び付く性質の規定へ)は、#346 で扱った(`research/346-deliberation/`、ADR-0090)。
