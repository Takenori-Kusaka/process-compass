# #466 まとまり 2 の独立の突合(2 巡目・直した差分だけ)

- 日付: 2026-11-28。査読者は実装を見ていない文脈。作り手の記録(`fix-03.md`)は所見を出した後で照合にだけ使った
- 対象: template `3dae878..5e63822`(5 コミット)と本体 `bb3cde1d..HEAD -- src`(台帳の再生成分は流し読み)
- 照らした決定: `ruling.md` §16・§17、`verify-03.md`
- 一時ファイルは scratchpad(`v4probe1.mjs`・`wsl-run.sh`)と WSL の `~/v04-tpl`(終了後に消した)だけに置いた。作業ツリーには本ファイルのほか何も書いていない

## 1. 1 巡目の所見の直り

| 所見 | 判定 | 根拠 |
| --- | --- | --- |
| V3-1 構成のファイルが範囲の外 | **直った** | `preReadRangeOf` の control に `f === 'process.config.json'` が入った。probe(`preReadRangeOf` を直接呼ぶ)で `process.config.json` は `preRead:true`。test-deferred-review の analyzePr の場面(E1〜E4 と、鍵の追加)で、承認なしは落ち、`required:1`・control の行に当たる。集約の `deferredReviewOf` は同じ `preReadRangeOf` を親と HEAD の版の構成で呼ぶため、範囲の内に識別される(コードで確認。集約の場面の専用の試験は無い) |
| V3-1 残る自己書き換えの経路 | **塞がっている(1 つは開示)** | 範囲の入力の所在を読んだ: 区分の下限・判断記録の規則・コア機能のパス(`corePathsOf`)は、どれも `process.config.json` の中だけにある。`.claude/guard.json`(テストのパターン)・ワークフロー・CODEOWNERS・`scripts/gate/**` は `CONTROL_FILES`、実装計画は `specs/**`(行 5)。probe で `.claude/guard.json`・`CODEOWNERS`・`specs/F-001/plan.md` が `true`。範囲の構成は既定ブランチの版から読む(`rangeConfig = policyConfig`)。テストの設定(`vitest.config.ts`)は `false` で範囲の外だが、行 6 と集約の限界の行で開示した |
| V3-2 起動の検出 | **一部**(新しい所見 V4-1 高・V4-2 中) | `workflow_run`・`release`・`schedule`・`merge_group`・`repository_dispatch`・`deployment_status`・読めない契機・読めない再利用の呼び出し・`true:` の鍵は検出した(probe と試験)。準拠テンプレート自身の workflows は検出 0 件。ただし `pull_request` の `types: [closed]`(取り込みで動く形)を見逃す(V4-1)。委任のマージのワークフローの除外は、同じファイル・同じ環境の名のジョブを足すと配備を隠せる(V4-2) |
| V3-3 範囲の書き方 | **直った** | G-6.md・様式 04・GC の「読み方」の行・ADR-0275 決定4 から外れた。grep で「範囲を書いてよ」「または承認レビュー」「PR #12〜」の残りは G-6.md の使わない旨の文だけ。IMPL-1074 の note に「範囲を書いても中の変更は対応づかない」が入った |
| V3-4 承認レビューの経路 | **直った** | 本文・ADR-0275 決定1・G-6.md・様式から外れた。集約は親の版が `approvalByPreRead` の変更だけ、マージの時刻より後の APPROVED を候補から外す。WSL の集約の場面で、取り込む前の承認は数える(対照)・後の承認だけの PR は欠落、を確かめた(146 件通過)。S1・委任の登録・まとまり 1 の構成は `approvalByPreRead` が偽なので数え方は変わらない(コードで確認。試験 aggregate-records 226・assurance-period 37・record-independence 13 の通過)。時刻を読めないときは外さない側(V4-4 低) |
| V3-5 読めない入力 | **一部**(V4-3 中) | テストのパターンが無い・計画が無い・既定ブランチと変更後の追跡ファイル・テストの差分は `unevaluated` の行で範囲の中へ倒れる(試験と probe)。既定ブランチのコミットの一覧を読めないとき(`log === null`)は、注記だけで範囲の外のまま |
| V3-6 件数の行 | **直った** | 集約に `noSpecTrailer` の行を足した。WSL の場面で「2 件」(トレーラのある PR を除く) |
| V3-7 許す値 | **直った** | `phase !== 'growth' && phase !== 'stable'` で偽。試験で `foo`・`S1`・`S2`・`Growth`・空・null・0 は偽 |
| V3-9 時刻の比較 | **直った** | `Date.parse` で比べる。WSL の場面で `+09:00` と `Z` の組の積み重なりが 1 件 |
| V3-10 見出し | **直った** | 見出しを「アサーションの行の削除」にした。スキップへの書き換えとテストの設定は、GC の行 6 と集約の限界の行に書いた |

## 2. 新しい所見

### V4-1【高】`pull_request` の `types: [closed]` で動く配備の workflow を「PR の検査」として見逃す

- 所在: template `scripts/gate/check-pr.mjs` の `workflowFires`(`events.every((e) => /^pull_request/.test(e))` で偽)
- 見た事実(実行。`v4probe1.mjs` で `deployOnPushFindings` を直接呼んだ): `on: pull_request: types: [closed]` + `environment: production` → 0。`pull_request_target` の `closed`、flow の書き方 `{ pull_request: { types: [closed] } }` も 0
- 帰結: 取り込みの時(PR を閉じた時)に `if: github.event.pull_request.merged` で配備する形はよく使われる。この形で本番が動く構成なのに、範囲の外の変更を承認なしで取り込める。D14 が塞ぐ場面(読まれていない変更が利用者へ届く)そのもの。本文 GC「使えない構成」・ADR-0275 決定7・IMPL-1071(delivered)は「PR の検査だけであるときを除く」と書くが、`closed` で動く workflow は PR の検査ではない。表示と実態も食い違う。試験は `types: [opened]` の場合しか見ていない
- 直し方の案: pull_request 系の契機は、`types` を読めて `closed` を含まない場合だけを PR の検査とし、それ以外(`closed` を含む・`types` を読めない)は起動する側へ倒す。試験を足す

### V4-2【中】委任のマージのワークフローの環境の除外で、同じファイルに足したジョブの配備を隠せる

- 所在: `deployOnPushFindings` の `hasEnvironment`(ファイル `.github/workflows/delegation.yml` と値 `delegated-merge` が合う行を数えない)
- 見た事実(実行): `delegation.yml` に `environment: delegated-merge` の 2 つ目のジョブ(`run: ./deploy.sh`)を足しても 0。push の workflow が `delegation.yml` を再利用の workflow として呼び、呼ばれる側の環境が `delegated-merge` だけのときも 0(呼ばれる側を「配備の環境が無い」と確かめた扱い)。ほかのファイルの同じ名の環境と、ほかの名の環境は検出する
- 帰結: `delegation.yml` の書き換えは統制の設定で、取り込む前の承認を 1 回経る(§17-1)。承認の後は、そのジョブが本番へ配備しても検出されない。リポジトリの秘密情報はどの環境のジョブからも読めるため、「環境を指定しない配備」(開示した限界)と同じ穴になる。IMPL-1071 の note と EV-0391 は除外を書くが、本文 GC「使えない構成」の行と集約の限界の行は書いていない
- 直し方の案: 除外を `delegated-merge` を使うジョブが 1 つだけで、呼ばれる側として使われない場合に限る。あるいは、除外がこの穴を残すことを GC の行と集約の限界の行に書く

### V4-3【中】既定ブランチのコミットの一覧を読めないとき、範囲の外のまま(V3-5 の残り)

- 所在: `analyzePr` の依存するタスクの段の `if (log === null) notEvaluated.push(...)`。`unreadable` へ入れていない
- 見た事実(読み): ほかの読めない入力は `cannot()` で範囲の中へ倒すが、この入力だけは注記だけを出す。トレーラ `Spec:` を持つ PR で、依存するタスクの未取り込みを確かめないまま範囲の外になる。IMPL-1069 の note と GC の行 7 は、この場合を範囲の中へ倒すとは書いていないため、表示との食い違いは無い。§16 の V3-5 の裁定(読めない入力で範囲の外へ倒れない)の趣旨からは外れる
- 直し方の案: `cannot('既定ブランチのコミットを読めない(依存するタスクを調べられない)')` にする

### V4-4【低】レビューの提出の時刻を読めないとき、取り込んだ後の承認として外さない

- 所在: 集約の `reviewsForConfirmation`(`Number.isFinite(t)` が偽なら残す)
- 見た事実(読み): 写しはマージの時点で取り、REST と提出日時を突き合わせるので、写しの経路では起こりにくい。写しの無い PR の gh・REST の記録は、提出済みのレビューに通常 `submitted_at` を持つ。IMPL-1070 は「取り込みの時刻を読めないときは外さない」とだけ書き、レビューの時刻のことは書いていない
- 直し方の案: 時刻の無い APPROVED を候補から外す(止める側)。または note に 1 句足す

### V4-5【低】flow の書き方のジョブの `uses:` を、再利用の呼び出しに数えない

- 見た事実(実行): `jobs:\n  call: { uses: org/x/.github/workflows/d.yml@v1 }` の push の workflow → 0。`reusableCallsOf` は行頭の `uses:` だけを読む
- 直し方の案: 1 行の `{ ... uses: ... }` も読む。または拾わない形として開示する

### V4-6【低】集約の範囲の判定で、変更の一覧・親の版の追跡ファイルを読めないときは黙って空になる

- 所在: `deferredReviewOf` の `trackedAt(parentRev) ?? []`・`changeListBetween(...) ?? []`
- 見た事実(読み): 空のとき、R2 の変更は範囲の外に識別され、配備の検出も空になる。範囲の外の変更も独立した確認を経なければ欠落に数えるため、緩める向きは小さい(判定記録で後から補えるかの表示だけに効く)。PR の検査の側(V3-5)と扱いが揃っていない
- 直し方の案: 読めないときは範囲の内に識別し、照らせなかった旨を出す

## 3. 問題が無かった観点

- 試験の期待の書き換え: `統制の設定` の正規表現の見出しの変更と、fake gh の名簿の数値の識別子・レビューの欄の追加だけ。既存の期待を緩めた書き換えは無い
- 緩める向きに倒れた所: V4-1・V4-2 のほかは見つけていない。読めない入力の倒し(`unevaluated`)は範囲の中、未知の事業ステージは偽、取り込んだ後の承認は外す(止める側)
- 表示と実態: IMPL-1069・1070・1071・1076 の note は、V4-1(1071 の「PR の検査だけ」)を除いて実装にある。IMPL-1072 は「取り込んだ後の承認レビューは数えない作りで、fixture で確かめた」と分け、実機の未確認を undelivered に残す。EV-0391 は除外と拾えない形を書く
- template の足した行(`7642faa..HEAD` の `+` 行): ADR 番号・Issue 番号・「案R」「事前の範囲」「記出」は無い(出ないことを確かめる試験の正規表現の中だけ)。直書きの値は `delegation.yml` と `delegated-merge`(テンプレート自身のファイル名)だけで、閾値の既定ではない。本文の差分にも内部の語は無い
- V3-8: §16 のとおり変えていない

## 4. 流した試験

- Windows(node 26.13.0。末尾の 1 行): test-deferred-review 122 件、test-check-pr 338 場面、test-control-approval 74/74、test-roster-rules 237、test-aggregate-records 226、test-record-independence 11、test-check-delegation 83、test-direct-commit-rules 11、test-material-attribution 61。どれも通過
- WSL(Ubuntu-24.04、node v26.13.1、`~/v04-tpl` に LF の写し、HEAD 5e63822): 名義を設定した環境と、名義の無い環境(`GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null HOME=<空の所>`。`git var GIT_AUTHOR_IDENT` が empty ident で失敗することを確かめた)の両方で、test-deferred-review 146 件・test-record-independence 13 件・test-tailoring-declaration 39 件・test-aggregate-records 226 件・test-assurance-period 37 件が通過
- 本体: lint:impl・lint:evidence(372 件)・lint:scope・lint:refs は終了コード 0
- probe: `v4probe1.mjs`(`deployOnPushFindings`・`deployWorkflowsOf`・`preReadRangeOf` の直接の呼び出し。準拠テンプレート自身の workflows に当てた)

## 5. 見られなかった範囲

- V4-1・V4-2 を analyzePr(一時の git の写し)で通すことはしていない。関数の層の結果と、analyzePr が `deployWorkflowsOf` を既定ブランチの版に当てることのコードの読みで判断した
- 集約の側で `process.config.json` を変えた PR が範囲の内に識別される場面の実行(コードの読みだけ)
- ホスティング上の実機(IMPL-1072)、回帰スイート、`npm run check` の全量、test-loosening-decider

## 6. 作り手の記録との照合(所見の後)

- `fix-03.md` §11 は pull_request 系を除くと書き、`closed` の扱いには触れていない。V4-1 は作り手の記録に無い
- `fix-03.md` §22・§55 (b) は `delegated-merge` の除外が抜け道になるかを重点に挙げた。§17-1 の議長の直し(ファイルと名の両方)は、ほかのファイルの同じ名を塞いだが、同じファイルに足したジョブ(V4-2)は塞いでいない
- V4-3〜V4-6 は作り手の記録に無い
