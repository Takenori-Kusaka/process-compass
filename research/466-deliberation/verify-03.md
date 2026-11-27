# #466 まとまり 2 の独立の突合(1 巡目・全体)

- 日付: 2026-11-28。査読者は実装を見ていない文脈。作り手の記録(`impl-D2a.md`・`impl-E2.md`)は所見を出した後で照合にだけ使った
- 対象: template `7642faa..3dae878`(7 コミット)と本体 `1bd64184`
- 照らした決定: `ruling.md` §1(D10〜D16・D18・D19)・§2.3・§3・§4・§5・§15、`ruling-draft-03.md` §2・§4.1〜§4.5・§4.8、`owner-answers-04.md`
- 一時ファイルは OS の一時置き場(scratchpad と `os.tmpdir()`)だけに置いた。作業ツリーには本ファイルのほか何も書いていない

## 1. 所見

### V3-1【高】構成ファイル(process.config.json)の変更が範囲の外になる。範囲の宣言そのもの・名簿・回答を、承認なしで書き換えられる

- 所在: template `scripts/gate/check-pr.mjs` の `preReadRangeOf`(行 1462〜1490)の `control` は `CONTROL_FILES`・`INSTRUCTION_ASSET_FILES` だけを見る。`CONTROL_FILES`(行 384)に `process.config.json` は無い。構成の変更を統制の設定に数えるのは `CONTROL_CONFIG_KEYS = ['ci','task','guard','aiReview']`(行 568)の鍵だけ
- 見た事実(実行): 一時の git の写しで `analyzePr(requireControlApproval: true)` を S2 の構成で動かした(scratchpad `probe2.mjs`)。PR が `process.config.json` だけを書き換える場合、次の 4 つで `preRead:false`・`required:0` になり、範囲の承認の失敗は出なかった(出た失敗は写しに CODEOWNERS が無いことだけ)
  - E1 `delegation.protectedPaths` を `src/nothing/**` へ狭める(範囲の行 2 の宣言そのもの)
  - E2 `decisionRules.rules` を空にする(範囲の行 3 の宣言そのもの)
  - E3 `people[]` に架空の人を足す(名簿)
  - E4 `answers.q-criticality` を書き換える(R3)
- 帰結: この束の前は、S2 の全 PR が取り込む前に 1 名の承認を要した。いまは範囲を決める宣言を、範囲の外の変更として承認なしで取り込める。その後の変更は、狭めた宣言で範囲の外に出る(集約は親と HEAD の版の和で照らすが、両方とも狭めた後の版になる)。E3 と組み合わせると、架空の名簿の人を判定者にした出荷の前の確認の記録を作れる。署名を要しない構成では、足し手の照合は作成者の名義に依るので防げない(EV-0388 の残余)。最後の砦(出荷の前に全件を読む)はあるが、読む側の人を偽る経路と重なる
- 照らした決定: D13(範囲の行 2・3・4)。3 版 §4.3 の行 4 は F10 の CONTROL_FILES を引いた。そのため実装は決定の字面どおりで、穴は決定にもある。ただし行 2 の「未宣言なら全変更」の歯止め(IMPL-0469)は、宣言を PR で消せるなら効かない
- 直し方の案: `process.config.json` の変更(少なくとも `delegation`・`riskFloor`・`decisionRules`・`people`・`seats`・`roles`・`answers`・`gates`・`review` の鍵)を範囲の行 4 に入れる。check-pr と集約の両方に入れ、E1〜E3 を試験に足す。他の層(契約検査・集約の changeLog の照合)が名簿の直接の編集を止めるかは確かめていない(§3)

### V3-2【高】取り込みで本番を起動する構成の検出が、push と `environment:` の組み合わせしか拾わない。拾わない書き方が開示されていない

- 所在: `check-pr.mjs` の `deployOnPushFindings`・`triggersOnPush`(行 1404〜1425)。本文 GC G-6「使えない構成」の行、EV-0391、IMPL-1071(delivered)、G-6.md の節の末尾の行
- 見た事実(実行。scratchpad `probe1.mjs`。1 は検出、0 は見逃し)
  - 見逃す: `on: workflow_run`(CI の完了で配備するよくある形)、`on: release`、`on: schedule`、push の workflow から再利用の workflow を `uses:` で呼ぶ形(呼ぶ側に `environment:` が無く、呼ばれる側は `workflow_call`)、`environment:` を書かずに秘密情報で配備する push の workflow
  - 拾う: flow の形 `on: { push: … }`、配列の形 `[push]`、`environment` のオブジェクトの形・式での指定、`on:` の後の注釈、契機を読めない workflow(起動する側)
  - analyzePr でも確かめた(E8): 基底に `workflow_run` と `environment: production` の配備の workflow があっても、範囲の外の R2 は `required:0`
- 帰結: 取り込みで本番が動く構成なのに、この形が使われる。読まれていない変更が利用者へ届く(D14 が塞ぐはずの場面)。開示は「workflows の外の配備は検出しない」だけで、workflows の中の見逃しを読み手は知れない。IMPL-1071 の note と EV-0391 は「push を契機とし…」と書くが、`workflow_run` などが「起動しない側」に倒れることは書いていない
- 照らした決定: D14、3 版 §4.4-2(「構文で決定可能」「起動する側に倒す」)。ruling §3「配備の起動を機械で確かめた範囲は workflows に限る」
- 直し方の案: `workflow_run`・`release`・`workflow_call` の呼び出し(push の workflow の `uses:` のジョブ)を、起動する側に倒す。拾わない形(`environment:` の無い配備など)を IMPL-1071 の note・EV-0391・保証の開示の限界の行に書く

### V3-3【高】手引きと本文は判定記録の「対象」に範囲(`PR #12〜#15`)を書いてよいとするが、集約は範囲の中間の PR を対応づけない

- 所在: template `.claude/skills/gate/gates/G-6.md` の新しい節の第2箇条、`templates/04-gate-record.md` の足した段落、本文 GC の表の「読み方」の行、ADR-0275 決定4。集約 `aggregate-evidence.mjs` の `refersToPr`(行 1429〜1439)
- 見た事実(読み): `refersToPr` は `#<n>` の字面だけを探す。`PR #12〜#15` で当たるのは #12 と #15 だけで、#13・#14 は当たらない。範囲の書き方を解く処理は集約に無い(`〜` を扱うのは期間の G-8 の記録だけ。行 4001〜4004)
- 帰結: 手引きに従って範囲を書くと、中間の PR が「出荷の前の確認が済んでいない」の欠落になる。向きは止める側(緩めない)だが、手引き(IMPL-1076 delivered「対象に範囲を書ける」)と実態が食い違う。G-6.md は「規模の基準値が未定義なら使わない」の条件も書いていない。IMPL-1074(undelivered)の note は「組を機械で照らさない」とだけ書き、範囲を書いても数えられないことを示していない
- 照らした決定: D11、§15-8(累積の差分は実装しない。undelivered で表示)
- 直し方の案: IMPL-1074 が降りるまで、G-6.md と様式から範囲の書き方を外す(1 件ずつ `PR #<番号>` を並べる)。IMPL-1074 と IMPL-1076 の note に「範囲を書いても中の変更は対応づかない」を書く

### V3-4【高・読みによる】出荷の前の確認を「承認レビュー」で残す経路に、出荷判定の記録より前という独立性の条件が当たらない

- 所在: 本文 GC の表「出荷判定までに」の行(「G-6 の判定記録の様式(または承認レビュー)で記録する」)、ADR-0275 決定1、G-6.md 第2箇条(「承認レビューの本文でもよい」)。集約の `recordNotCounted`(行 2195〜2225)は判定記録(`docs/gates/`)だけを照らす。`independentConfirmation` の PR のレビューの候補(行 2274〜2312 付近)は、提出の時刻を出荷判定の記録と比べない
- 見た事実(読み。実行していない): 3 版 §4.1 の裁定1 は「記録は G-6 の判定記録の様式で残す(F1・F4)」とした。F4 で、マージの後に付けた PR の承認が数えられるかは「ホスティングの応答と写しの有無で変わる。未確認」だったため、確かめた経路に限った。本文と ADR は「または承認レビュー」を足した。マージの後のレビューは、写しとの突合で「所見」へ回る(行 553〜557)。その後に独立した確認に数えるかは、読みでは決められなかった
- 帰結: 数えられる場合は、出荷判定の後に付けた承認で D15 (b)(出荷判定の記録より前)を迂回できる。数えられない場合は、手引きに従った確認が欠落になる。どちらでも表示と実態が食い違う。IMPL-1072 は「マージ済みの PR に後から付けた承認…が数えられること」を未確認と表示しているが、本文の規範の文は承認レビューを認めている
- 照らした決定: 3 版 §4.1 裁定1・F4、D15
- 直し方の案: 本文・ADR・G-6.md の「または承認レビュー」を、この形について外す(判定記録の様式に限る)。残すなら、マージの後のレビューに出荷判定の記録との前後の照合を当て、その試験を足す

### V3-5【中】範囲の判定の入力を読めないとき、黙って範囲の外へ倒れる所がある

- 所在: `check-pr.mjs` の analyzePr の範囲の段(行 2287〜2330)
- 見た事実
  - 実行(E6): 基底の `.claude/guard.json` に `testPatterns` が無い構成では、基底にあるテストを消す PR が `preRead:false`・`required:0`。「照らせなかった」の注記も出ない
  - 読み: `specs/<F>/plan.md` が無い(機能のディレクトリの名がトレーラと違う)と `unmergedDependencies` は黙って飛ばす(probe1 T1)。`trackedFiles(root, policyPoint)` が null なら配備の検出は空になる。テストの行の `git diff` が失敗すると空として扱う
- 照らした決定: 観点「判定に失敗・読めないとき通る側へ倒れない」。3 版 §4.3-7 は、照らしていないものを開示するとした
- 直し方の案: これらを `notEvaluated` へ出す。テストのパターンが無い構成は行 6 を「照らせない」として範囲の中へ倒す

### V3-6【中】トレーラの無い変更の「照らしていない件数」が開示に出ない

- 所在: 本文 GC の範囲の表の行 7(「照らしていない旨を出す」)。集約の `deferredReviewLines` の限界の行
- 見た事実(読み): 3 版 §4.3 の行 7 の裁定は「照らしていない件数を開示に出す」。PR の検査は注記を出すだけ。集約は照らし直さず(§15-6 で認めた)、件数も出さない。本文は「旨を出す」へ弱めた
- 照らした決定: 3 版 §4.3-7、§15-6(§15-6 が認めたのは照らし直さないことで、件数を出さないことではない)
- 直し方の案: 集約の投影に、範囲の外の変更のうちトレーラ `Spec:` の無い件数を 1 行足す。足さないなら、裁定で件数の開示を採らないと記録する

### V3-7【低】使う構成の判定が、事業ステージの未知の値を S2 として扱う

- 所在: `config.mjs` の `approvalByPreRead`(`!phase || poc || mvp` だけを除く)
- 見た事実(実行): `q-biz-phase` が `foo`・`S1` のときも真(probe1 A2・A3)。生成の経路は値の一覧(`generate-profile.mjs` 行 1801)で受けるので、手で書いた構成だけに当たる
- 直し方の案: `growth`・`stable` の許可の一覧にする

### V3-8【低】#469 の開示が HAB 5.4.2 に無い

- 所在: ruling §3 は「置く所」に HAB 5.4.2 の人が触る場所の表の注を挙げた。#469 は GC G-6・TG・附属書H H.11 にあり、HAB には無い(grep)
- 直し方の案: HAB に 1 行足す。または、表が TG へ移った(ADR-0274)ので TG で足りると裁定に記録する

### V3-9【低】積み重なりの前後を時刻の文字列で比べる

- 所在: 集約の `deferredReview` の `stacked`(`mergedAtOf(q) > mergedAtOf(u)`)
- 見た事実(読み): `mergedAt`(`Z`)とコミットの日時(`%cI`、`+09:00`)が混じると、文字列の比較は時刻の前後と合わない。表示の数だけに効き、欠落には効かない
- 直し方の案: `Date.parse` で比べる

### V3-10【低】範囲の行 6 の見出しが、検出の範囲より広い

- 所在: `PRE_READ_ROWS['test-weakened']` は「…名前の変更・行の削除」と書く。検出するのはテストの削除・名前の変更と、アサーションの行の削除だけ
- 帰結: `it.skip` への書き換えや、テストの設定(`vitest.config.ts`・`jest.config.js`。probe1 R11 で範囲の外)による除外は拾わない。3 版 §4.3-6 の範囲(アサーションの行)の内側なので、決定違反ではない。私の E5 の写しは同じ行にアサーションがあったため検出され、`it.skip` 単独の場合は確かめていない
- 直し方の案: 見出しを「アサーションの行の削除」に合わせる。テストの設定を拾わないことを限界の行に書く

## 2. 問題が無かった観点(確かめた範囲)

- 使う構成の判定: CL1〜3・CL の未記入・品質「高」・規制業・品質の未記入・S0・S1・事業ステージの未記入・G-6 の未達・簡略・省略・承認者 2 名・委任の規則の登録・必須の承認数 1 では偽(試験と probe1)。`generate-profile` は `strict`(安全・規制)の構成を除く。S2・品質「高」・CL1・委任の規則ありの生成は `team` か承認 1 以上のまま(test-roster-rules)
- 範囲の行: R1(記載・下限。R3 と書いて下限が R1 の場合を含む)・区分を読めない PR(E7)・コア機能の未宣言・追跡ファイルに当たらない宣言(probe1 R14)・名前の変更の元のパス(R6)・統制の設定・指示資産・仕様・依存・テストの削除・依存タスクは、範囲の中に倒れる
- 判定の版: 使う構成・範囲の宣言・配備の workflow は既定ブランチ(policy)の版から読む。集約は親の版と HEAD の版の和で照らす(緩める向きの後からの狭めは効かない。V3-1 の自己書き換えは除く)
- 最後の砦: 範囲の外で独立の確認を経ない PR は欠落に数える。PR を経ないコミットは範囲の外にしない。トレーラ `Delegated:` を流用しない(`g6PostHoc` は登録した規則の `inScope` に依る)。範囲の外の R2 で確定者の記名が無ければ欠落。AI の名義と自己記載は数えない(WSL の test-deferred-review の集約の場面)
- 判定記録の独立性(D15): test-record-independence が、名義を設定していない環境でも 13 件通過した
- ADR: 0054・0057・0101 は状態の節の書き換えだけで、決定の本文は変えていない(0101 の「どれも置き換えません」が「他は置き換えません」になったのは状態の文)。0272〜0274 は変えていない
- 新しい欄・記名欄・人の記入: 足していない。確定者は既存の欄「リスク区分を確定した者」を使う
- 適用範囲: 見出しに併記している。lint:scope は通過
- template の足した行: ADR 番号・Issue 番号・「案R」「事前の範囲」「記出」は無い。試験の `IMPL-NNNN:ok/ng` の目印は既存の慣行。test-deferred-review 行 369 は、内部の語が出ないことを確かめる正規表現の中だけ
- D18・D19: H.4 の例の括弧に S2 の形を 1 句足し、条件4 の文言は変えていない。範囲の判定と区分の確定を AI に行わせないことは GC G-6 にある
- 事前の範囲の 8 を削り、9 を形骸化に限ったこと(§2.3): 本文と ADR の表のとおり。9 は undelivered(IMPL-1073)。委任の規則を登録した構成では使わないことと、実装(`approvalByPreRead`)が一致する
- 実機で確かめていないこと(impl-D2a §7)は IMPL-1072 の undelivered にまとめてある。delivered の IMPL-1069〜1071 は「fixture の試験で確かめた範囲」と書く。ただし V3-2・V3-3・V3-4 の食い違いがある
- 回帰スイート: `scripts/regress/suite/*.mjs` に、S2 の `team`・承認 1 を固定する期待は grep で見つからなかった。S2 の答えを使う suite は lib-r3・matrix-sweep・stages・v3。実行はしていない

## 3. 流した試験

- Windows(node 26.13.0)。末尾の 1 行: test-deferred-review 79 件、test-check-pr 338 場面、test-control-approval 74/74、test-roster-rules 237、test-aggregate-records 226、test-record-independence 11、test-material-attribution 61、test-check-delegation 83、test-direct-commit-rules 11。どれも通過
- 本体: lint:impl・lint:evidence・lint:scope・lint:refs は終了コード 0
- WSL(Ubuntu-24.04、node v26.13.1。`~/v03-tpl` に LF の写しを clone。HEAD 3dae878): test-deferred-review 98 件・test-record-independence 13 件・test-tailoring-declaration 39 件。名義を設定した環境と、名義の無い環境(`GIT_CONFIG_GLOBAL=/dev/null`)の両方で通過
- 独自の probe(一時置き場): `probe1.mjs`(関数の直接の呼び出し)、`probe2.mjs`(一時の git の写しで analyzePr)

## 4. 見られなかった範囲

- V3-4 の、マージの後の PR の承認が集約で数えられるかは実行していない(模擬の gh の集約の写しが要る)
- 契約検査(verify-gate-contract)と集約が、`process.config.json` の名簿・宣言の直接の編集を別に止めるか(V3-1 の緩和の有無)は確かめていない
- `riskClassOf` が小文字・不正な区分(`r1`・`R0`)を読むか。probe1 の R3・R4 は `preReadRangeOf` に直接渡しただけ
- 回帰スイートの実行、`npm run check` の全量、template の全量、test-loosening-decider
- ホスティング上の実機(IMPL-1072 の範囲)

## 5. 作り手の記録との照合(所見の後)

- `impl-D2a.md` §6-5・6・7、`ruling.md` §15 は、依存タスクの止める側への倒れ、集約が照らし直さないこと、PR を経ないコミットの扱いを認めている。V3-5・V3-6 はその外の所(読めない入力の黙った倒れ、件数の開示)
- `impl-E2.md` §4・§5 は、`process.config.json` の扱い・workflows の中の見逃し・範囲の記載の対応づけ・承認レビューの経路に触れていない。V3-1〜V3-4 は作り手の記録に無い
- `impl-E2.md` §5 の「回帰スイートに S2 の固定は無い」は、私の grep と一致する
