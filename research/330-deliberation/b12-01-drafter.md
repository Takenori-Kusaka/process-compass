# #330 準拠テンプレート T-1〜T-8 の実装案(束 B12 起案委員・軽)

日付: 2026-11-17。読んだもの: tmp/b12/brief-common.md・issue-330.txt、decision.md、ADR-0151、gate-criteria.md の IMPL-0992(L1049)・0993(L1723)・0995(L1051)・0239(L1027)・0234(L1055)、template-repository.md L864、template/ の adapter.mjs・aggregate-evidence.mjs・g5-aggregate.mjs・gate-g5.yml・adapters/*.json・test-adapter.mjs・test-g5-aggregate.mjs。template は変えていない。

## 0. 試験の走らせ方

- 個別: `cd template && node scripts/gate/test-g5-aggregate.mjs` / `node scripts/gate/test-adapter.mjs`(どちらも gate-g5.yml の contract ジョブが実行している。L179・L191。ネットワーク不要。adapter の試験は PATH 先頭の代役 npx・python を使う)
- 新しい試験ファイルを足すなら、gate-g5.yml の contract ジョブへ `- run: node scripts/gate/test-<名>.mjs` を足す(test-g5-aggregate.mjs 末尾の「contract でこの試験を実行する」型の自己検査も同様)
- 全量は push 前に1回(WSL では node 26)。標準側は `npm run check`(template:kb の乖離・impl 台帳を含む)
- 時計依存: aggregate の試験は日付を引数で渡す。`releaseDay` は `toDay` 由来で固定できる

## 1. 項目ごとの案

三問: 1 条文は結果と証跡まで。2 例外承認で受けられるか(裁定で否。7.3 に入口が無い)。3 破られたとき失うもの。

### T-8(優先度 最高。表示と実態の食い違い。CLAUDE.md の「表示と実態が食い違う高」は巡の数に関わらず直す)

- 実在: gate-g5.yml L335-359 ip-clearance。`licenses` を実行した後、`if: always()` の段が **無条件で** `"scanRun": true` を書く(L355)。adapter.mjs L72-74 は空のコマンドで notice・exit 0 なので、空でも `steps.lic.outcome == success` になり `scanRun: true, result: success`。
- 誤る4か所(aggregate-evidence.mjs): L3440(記載の欠落の抑止)、L4145-4149(項目4 の licenses が「実施(success)」)、L5338(G-7 基準8 の「記録 あり」)、L6609(「知財潔白性の検査: 実施」)。none・undetermined は licenses が既定で空(adapters/none.json L12・undetermined.json L12)なので既定でこうなる。
- 降ろし方: (a)機械の検査。決定可能(コマンドが空か)。三問3: 適合の主張(知財潔白性)の信頼に直結する。細かく書く側。
- 案(根本の1箇所で閉じる。4か所を個別に直さない):
  1. adapter.mjs: `print licenses` の出力が空かを判定する経路を使う。gate-g5.yml の記録の段を「コマンドが空なら `{"scanRun": false, "result": "skipped", "reason": "コマンドが未設定(構成で選んだ未実施)", "scannedAt": ...}`」に変える。実装は小さい node スクリプト(例 `scripts/gate/license-scan-record.mjs`)に出し、ワークフローの printf を置き換える。入力は `steps.lic.outcome` と `adapter.mjs print licenses` の空判定。失敗(outcome failure)は `scanRun: true, result: failure`(実施して失敗)
  2. aggregate-evidence.mjs L4145: `!licenseScan.scanRun` の分岐に、`licenseScan.reason` があれば `未実施(${reason})` を出す。L3440: 項目4 が未実施でも「知財潔白性の検査記録がありません」の欠落は **出す**(空のコマンドを G-7 の欠落の検出から抜けさせない)。ただし理由つきの文にする(「構成で選んだ未実施」と明示し、欠落と見分けられるように)
  3. L5338・L6609 は `scanRun` が false なら「なし / 未実施」を出す(今の式のまま正しくなる。`scanRun` の値が正しくなれば自動で直る)。念のため試験で固定する
  4. 古い証跡(scanRun だけで reason なし)は従来どおり読める(後方互換)
- 試験(違反と適合の対。IMPL-0995 の note が求める): 新規 `test-license-scan.mjs` か test-g5-aggregate.mjs に節を足す。
  - ng: licenses が空 → 記録 `scanRun false`、項目4 が `^未実施`、基準8 が「なし」、欠落が出る
  - ok: licenses が実行されて成功 → `scanRun true`・「実施(success)」・欠落なし
  - 失敗した licenses → `scanRun true, result failure`(項目4 は実施(failure)と出る。ジョブ自体も失敗)
  - 注意: 集約のこれらの行は `if (isMain)` の中(aggregate-evidence.mjs L1083 以降)。試験できるよう、licenses の表示判定を純関数(例 `licenseStatus({licenseScan, aggregate})`)として g5-aggregate.mjs か同モジュールの本体より前へ出して export する
- IMPL-0995: undelivered → **delivered**(check=machine、test=`template/scripts/gate/test-license-scan.mjs`、目印 `IMPL-0995:ok/ng` を試験に付ける)。note を現状の欠陥の記述から降りた挙動の記述へ書き換える。ADR-0151 L65 の「準拠テンプレートは変更なし」は ADR 本文を書き換えず、実装の記録(implementation.md)へ追記する。
- 重へ上げる条件: 無し(欠陥の修正で新しい義務ではない)。

### T-1(IMPL-0993)集約が項目4 の未実施の各検査に継続期間を出す

- 実在: 項目4 は aggregate-evidence.mjs L4126-4152 の `machineChecks`。継続の仕組みは項目6 の `unmeasuredStreak`(L4253-4266。`since`・`releases`・`note` を返し、前回の成果物 `prevA` から起点と回数を引き継ぐ。`sameRelease` なら回数を進めない)と `streakText`(L4267)。前回は `loadPrevious()`(L3572)。
- 降ろし方: (a)機械の検査。値の存在と日付だけで決定可能。合否には使わない。三問3: 未実施が通過と読まれる損失は出荷判定者・事業決裁者の判断の質と適合の信頼。「見える化」までに限る(裁定3)。
- 案:
  1. `machineChecks` の対象 6 項目(coverage・staticAnalysis・dependencyAudit・licenses と、test・secretScan)のうち、**値が `未実施` で始まるもの**を検査ごとに `unmeasuredStreak` に掛ける。値の文字列は変えず(既存の読み手を壊さない)、別の欄 `machineChecks.unrunStreaks = { staticAnalysis: { since, releases, reason }, ... }` を足す(前回は `prevA.machineChecks.unrunStreaks` から読む)
  2. 継続は検査ごとに数え、**理由が変わっても未実施が続く限り途切れない**(IMPL-0993 note)。前回の値が `未実施` で始まれば prevWasUnmeasured。`unmeasuredStreak` の第4引数を「前回の値が未実施か」で渡し、旧い形式(unrunStreaks が無い前回)は既存の「起点を持たない旧い形式」の分岐で前回の出荷を起点にする
  3. 出力: Markdown の項目4 の表(L6152-6157)の該当行の値の後ろに ` / ${streakText(st)}` を足す。理由が「検査対象が存在しない」の未実施にも出す(裁定2)。実施に戻った検査は streak を持たない(`measured` で解消)
  4. 起点は「未実施のまま出荷した最初の出荷」(S1)。範囲指定なしの `--period-*` の集約にも同じ関数が効くことを確かめる
  5. `unmeasuredStreak` は集約の本体の中の閉包(L4253)。試験できるよう `scripts/gate/unrun-streak.mjs` へ純関数として出す(`releaseDay`・`sameRelease`・`previous` を引数に取る)。項目6 の呼び出し(L4553・4556)も同じ関数を使い、挙動を変えない(既存の項目6 の試験が通ることで確かめる)
- IMPL-0993: undelivered → delivered(machine、test=T-2 の試験)。IMPL-0992 の note に「IMPL-0993 を降ろすときに目印つきの試験を足して machine へ戻す」とある。T-4 と併せて 0992 を machine へ戻す。

### T-2 T-1 の試験

- 新規 `template/scripts/gate/test-unrun-streak.mjs`(contract に結線)。純関数を直接呼ぶ。固定する日付は引数で渡す(時計に依らない)。ケース:
  - 初回(前回なし): since=今回の出荷の日、releases 1、note「前回の出力なし」
  - 2回目: since 維持、releases 2。3回目: 3
  - 同じ出荷の再集計: 回数を進めない
  - 理由が変わる(「コマンドが未設定」→「検査対象が存在しない」)が未実施のまま: 途切れない(IMPL-0993 note)
  - 実施に戻る → streak 無し。再び未実施 → 起点が新しくなる
  - 検査ごとに独立(lint だけ継続・audit は実施)
  - 旧い形式の前回(unrunStreaks 無し・値が未実施)→ 前回の出荷を起点、releases 2
  - 目印 `IMPL-0993:ok` / `IMPL-0993:ng`(継続を出さず通過と同じ表示にする形が ng)
  - 表示: 項目4 の Markdown の行に「回連続」が出る(出力の組み立てを関数にして固定)
- 閾値で差し戻さないことも ng 側に入れる: 100回継続でも aggregate の problems が増えない(裁定3。課さないと決めたことの固定)

### T-3 adapter.mjs 冒頭の注釈

- 実在: adapter.mjs L9「コマンドが空の場合は失敗させます。」。実際は L68-79: OPTIONAL(lint・audit・licenses・coverage・install)は空でも通知して exit 0、必須(test・secretScan)は空で exit 1。
- 注意: **coverage は OPTIONAL に入っているが、言語のアダプタで製品のコードがあると coverage-check.mjs が失敗にする**(決定 1 章 b。ADR-0124)。裁定4「カバレッジは任意の検査から外す」の趣旨に合わせ、注釈では coverage を「adapter.mjs は通すが、集計ファイルが無いことを coverage-check.mjs が失敗に数える」と分けて書く。OPTIONAL の集合そのものを変える(coverage を外す)かは本案の範囲外。外すと coverage 空で adapter が exit 1 になり、coverage-check の失敗理由と二重になる。振る舞いを変えない編集に限るのが無難(議長の裁定を請う点。§3 参照)
- 降ろし方: (c)手引き(コードの注釈)。編集の指摘に当たる。文言の修正だけで試験は T-4 で受ける。
- 案文: 「必須の段(test・secretScan)でコマンドが空の場合は失敗させます。任意の段(lint・audit・licenses・install)が空の場合は、実施しない旨を通知して通し、集約が項目4 に『未実施』と出します。coverage は adapter としては通しますが、製品のコードがあるのに集計ファイルが無ければ coverage-check.mjs が失敗にします。」
- 同ファイル L77 の fail の文「空のまま通すと…」は必須の段向けでそのまま正しい。

### T-4 空の任意の検査で通知して exit 0、必須の段で exit 1 の試験

- 実在: test-adapter.mjs に該当なし(決定 1章 a)。同ファイルの作業場(`W` / `run`、代役 PATH)を使える(L52-73)。
- 降ろし方: (a)機械の検査。
- 案: test-adapter.mjs に節 5 を足す。node アダプタで構成を一時の作業場に作り、アダプタ JSON の commands を書き換える(既存の節の作り方に倣う)。
  - ng/ok 対: `lint`・`audit`・`licenses`・`install` を `""` → exit 0 かつ出力に「実施しません。この事実は証跡へ残ります」、代役 npx が呼ばれない(`!W.ran`)
  - `test`・`secretScan` を `""` → exit 1 かつ「が空です」
  - 製品のコードが無い場合の対象なし(既存の節 1 の確認)と取り違えない: 目印(package.json)を置いて対象ありにして試験する
  - `coverage` は adapter として exit 0(通すこと)を固定。coverage-check の失敗は既存 test-coverage-scope.mjs が受けているか確かめ、無ければ「集計なし+製品のコードあり → exit 1」を1件足す(ADR-0124・IMPL-0495 との整合)
  - 目印 `IMPL-0992:ok/ng`
- IMPL-0992: check=manual → **machine へ戻す**(test=`template/scripts/gate/test-adapter.mjs` と test-unrun-streak.mjs)。state は delivered のまま。ライセンス検査と依存の導入を含めない旨(note)は、T-8 で licenses を含められるので note を更新する。install は集約に項目が無いので除外のまま。

### T-5 対象なしが基準・理由・時刻で証跡に残る試験(IMPL-0239)

- 実在: 対象なしは adapter.mjs L63 が notice を標準出力へ出すだけ(基準・理由・時刻の3項目を持つ記録は書かない)。coverage は製品のコードが無いとき対象なしとして通す(coverage-check.mjs)。記録の3項目を書く実装があるかは未確認(IMPL-0239 note も「確かめていない」)。
- 三問: 1 条文は「基準・理由・時刻」の証跡まで。裁定2により、実装の開始後に続く対象なしは T-1 の継続期間で見える。機械で「実装の開始後に用いない」ことを止めない(開始の判定は機械で閉じない。裁定の「機械で止めない」)。
- 降ろし方の案: **(d)の部分と(a)の部分に分ける**。
  - (a) 証跡の3項目: adapter.mjs が「対象なし」で通すとき、記録(`evidence/adapter-skipped.json` に追記など)へ `{ criterion, phase, reason, at }` を書く。基準の対応は phase から固定表(test→1、lint/audit→2、coverage→3、licenses→5、…。G5_CRITERION_JOBS と同じ表)で導く。時刻は `new Date().toISOString()`。集約が読み項目4 の「検査対象が存在しない」の理由に使う。**これは実装の変更を伴う**ため、実装の担当の判断で採るか決める。範囲が大きければ次のいずれかに縮める
  - 縮小案: 現状の実装(出力の notice のみ)と、項目4 の理由「検査対象が存在しない」(test-adapter.mjs の machineCheckStatus 呼び出し L8 のとおり)が、基準・理由・時刻の3項目を **証跡として満たさない** ことを実行で確かめ、IMPL-0239 を `undelivered` のまま note を更新して開示する。時刻は集約の出力の `generatedAt` が持ち、基準と理由は項目4 の行が持つ、という **既存の組み合わせで3項目に当たる** と言えるなら、その旨を試験で固定して delivered にする
  - 私の推奨は縮小案の後半(既存の組み合わせの固定)。新しい書き込みの経路を足さず、項目4 の行(検査名=基準、理由、出荷の日時)で3項目を読ませる。ただし「基準」が検査名(静的解析 など)で、基準番号(G-5 基準2)ではない点を試験で確かめ、足りなければ項目4 の表の見出しの注に基準番号を足す
- 試験: 製品のコードの無い構成で `aggregate`(または machineCheckStatus)を呼び、`未実施(検査対象が存在しない)` と出ること、ng 側は対象なしを実施と出す形。目印 `IMPL-0239:ok/ng`
- IMPL-0239: 試験が通れば note を更新して state は **undelivered のまま残す**(「実装の開始後に用いないこと」は機械で閉じず manual と開示。T-1 が降りれば継続期間で見える)。降りた部分は IMPL-0992 のように分ける案もある。分けるなら標準側の別 IMPL を起こすため、議長の裁定に委ねる。
- 優先度: 中。T-1 の後。

### T-6 手引き: 言語ごとの lint・audit・licenses の既定のコマンドの例

- 降ろし方: (c)手引き。コマンドの選び方は手順であり条文に書かない(裁定8)。
- 置き場: template/README.md L387(アダプタの節)の直後に小節「任意の検査のコマンドを空にする場合と既定の例」。
- 内容(実在する既定の一覧から。adapters/*.json で確認済み):
  | アダプタ | lint | audit | licenses |
  | --- | --- | --- | --- |
  | node | `npm run lint --if-present` | `npm audit --audit-level=...` | `license-checker-rseidelsohn ...` |
  | python | `ruff check .` | `pip-audit` | `pip-licenses ... ip-clearance-python.mjs` |
  | go | `go vet ./...` | `govulncheck ./...` | `go-licenses check ./...` |
  | none・undetermined | 空 | 空 | 空 |
  - 空にすると項目4 に「未実施(コマンドが未設定)」と継続期間が出る。通知は出るが G-5 は失敗にならない。S4: audit はどの言語にも道具がある旨を併記し、必須化はしない(「課さないと決めた」)
  - rust・java 等(none に手書き)の例は、道具名を断定せず「その言語の標準の静的解析・依存監査・ライセンス検査」と書き、具体のコマンドを載せる場合は出典(公式ドキュメント)を付ける。未検証のコマンドは載せない(実証を欠く記述は根拠水準マーク)
  - 標準側 template-repository.md L864 は T-8 の完了後に「現在の準拠テンプレートは実施と記録し…降りていない」の括弧を削る(標準側の編集。実装の担当が別の段で)
- 試験: 不要(文)。ただし README が adapters/*.json の既定と食い違わないよう、test-adapter.mjs か軽い check に「README の表の node/python/go のコマンドが adapters の値と一致」を1件足すかは任意。決定可能だが保守コストが出るので **推奨しない**(手引きは手引き。乖離は表の見出しに「同梱アダプタの値(アダプタが正)」と書いて受ける)。

### T-7 依存の取得の失敗で検査器が失敗で終わる試験(IMPL-0234)

- 実在: 依存の導入は setup-stack action(.github/actions/setup-stack/action.yml L38-40)が `adapter.mjs run install` を呼ぶ。install は OPTIONAL(空でも通す)。ここが失敗しても続く段(`run lint` 等)が、入力の欠けた状態で **成功で終わらないか** が IMPL-0234 の確かめていない点。
- 降ろし方: (a)機械の検査のうち「アダプタを介した伝播」までを。検査器(npm audit・pip-audit・govulncheck)の中身の挙動は外部の道具のため、試験は代役の道具で終了コードの伝播を確かめるに限る。外部の道具そのものが依存欠落で失敗するかは **降ろさない(d)**(道具の実装であり、テンプレートが保証できない。根拠水準マークで開示)。
- 案: test-adapter.mjs に節 6。FAKE_EXIT=1 の代役で:
  - `adapter.mjs run install` が失敗(exit 非 0)のとき、install が **コマンドあり** なら adapter が exit を伝播する(既存の実装 L100 以降の spawnSync の戻り値の扱いを確認。伝播しているなら ok の固定)
  - `run lint/audit/licenses` に FAKE_EXIT=1 → adapter も exit 1(検査器の失敗が失敗で終わる)
  - 製品のコードがあり lock ファイルがある構成で install が失敗 → 後続の `run test` は呼ばれても代役が失敗を返す。ワークフロー側は setup-stack の install の段が失敗した時点でジョブが止まる(YAML の step の既定)。これは gate-g5.yml/ action.yml の構文の検査(`continue-on-error` が install の段に無い)で足りる。決定可能な構文の検査として test-g5-aggregate.mjs か test-adapter.mjs に `!/continue-on-error/.test(action.yml)` を1件
- IMPL-0234: 降りた部分(伝播)を delivered にするには標準側で IMPL を分ける(0992 の前例)。分けず note を更新して undelivered のまま残すのが安全。「入力の欠落で検査器が失敗で終わる」の外部の道具の部分は undelivered のまま表示(裁定の「降りた部分だけ delivered、入力の欠落は undelivered」に一致)。分割の標準側の編集は議長の判断。
- 優先度: 低(外部の道具に依る部分が大きい)。

## 2. 実装の順序と優先度

1. **T-8(最優先)**。表示と実態の食い違い。T-3 の注釈の誤りも同じ種類だが、実害は無いので T-8 の後
2. T-1 + T-2(純関数の切り出しを共通の土台にする。T-8 の純関数の切り出しと同じ手で行う)
3. T-3 → T-4(注釈を直してから試験で固定)
4. T-5(縮小案)
5. T-6(文。T-1・T-8 が降りた後に、README の「項目4 に継続期間が出る」を書く)
6. T-7

準拠テンプレートを触る Issue は直列(CLAUDE.md)。T-1・T-8 は aggregate-evidence.mjs の別の場所を触るが、同じファイルなので同じ担当が連続して行う。template の push していないコミットは、コミットのたびに bundle へ退避する。

## 3. 降ろさないと決める点(「書かれていない」と区別する)

| 点 | 扱い | 理由(三問) |
| --- | --- | --- |
| 継続期間への閾値・差し戻し | 課さないと決めた(ADR-0151) | 三問2: 例外承認では受けられない。三問3: 見える化までで足りる |
| 空の任意の検査を失敗にする | 課さない | 同上 |
| 対象なしの「実装の開始後は用いない」の機械の停止 | 降ろさない(manual) | 開始の判定が機械で閉じない。T-1 の継続期間で見えるようにする |
| 外部の検査器が依存の欠落で必ず失敗するか | 降ろさない(undelivered で開示) | 道具の実装。テンプレートは終了コードの伝播までを保証する |
| 手引きの表と adapters/*.json の一致の機械検査 | 採らない | 手引きは手引き。アダプタが正と書く |

## 4. 議長への確認点

1. coverage を adapter.mjs の OPTIONAL から外すか(T-3)。決定は「任意の検査から外す」(裁定4)。本案は挙動を変えず注釈で分けた。外すなら T-4 の試験が変わる
2. T-5 を縮小案(既存の項目4+generatedAt で3項目に当てる)で採るか、書き込みの経路を足すか。推奨は縮小案
3. IMPL-0234・0239 を分割して部分的に delivered にするか(標準側の編集を伴う)
4. T-8 の項目4 の欠落(L3440)の扱い。空のコマンドで知財潔白性の記載の欠落を **出す** 案にした。これは G-7 の欠落の数え方が変わる(採用者の案件で新たに欠落が出る)ため、独立の突合で確かめる対象にしてほしい
