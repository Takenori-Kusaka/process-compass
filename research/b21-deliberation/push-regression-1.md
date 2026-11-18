# 束 B21 の push の前の回帰の全量(担当の記録。push はしていない。ファイルは直していない)

## 条件
- WSL・node 26.13.1(PATH を明示)。写しは `~/b21-regress/`(ext4)。本体は `git clone` を `core.autocrlf=false` で作り、先頭 e15692b05ef11c5c3d8a99da89045eee63520b0b。`template/` は同じく clone して 0f5f83d5292f16d2b37c4e23de7daae5ebeb224e。どちらも LF で作業ツリーは清潔。pit-crew は初期化していない。node_modules は前の束の `/tmp/pcb18/node_modules` を複写。
- 2通りを順に流した(通常=TZ 未設定、`TZ=UTC`)。出力は `~/b21-out-n/`・`~/b21-out-u/`。

## 流したもの
1. template の試験の全量: gate-*.yml など `.github/workflows/` が流す `node scripts/...` と `scripts/**/test-*.mjs` の和集合 91 本(新規の 5 本を含む)を、template 内で 1 本ずつ実行。
2. `npm run check`(本体。template 初期化済み)。
3. check が途中で止まったため、後続の `npm run test:regress` と `npm run build` を別に実行。

## 結果(通常・UTC で同じ)
| 検査 | 通常 | TZ=UTC |
|---|---|---|
| template の `test-*.mjs`・`check-decisions.mjs` ほか試験 79 本 | 全部 exit 0 | 同じ |
| 新規 5 本(test-review-queue・test-flow-observation・test-pre-review・test-review-order・test-enforcement-inventory) | 全部 exit 0 | 同じ |
| `npm run check` | **exit 1(test:template-suite で停止)** | **同じ** |
| `npm run test:regress`(単独) | exit 0(すべて通った。落ちた場面 0) | exit 0 |
| `npm run build`(単独) | exit 0(393 ページ) | exit 0(393 ページ) |

check の test:template-suite より前の検査(lint:*・test:template・test:fields・test:criteria 等)は両方とも通過。
check の終了コードは両条件とも 1。後続の test:regress・build は check の連鎖では実行されていない(上のとおり単独で確認)。

## 落ちたものと切り分け
### 1. test:template-suite(両条件で同一。時計・環境に依らない)
`scripts/test-template-suite.mjs` が 5 件を報告。template の次の 5 本が gate-g5.yml のジョブ contract の手順にも除外表 NOT_TESTS にも無い。
- scripts/gate/test-review-queue.mjs
- scripts/gate/test-flow-observation.mjs
- scripts/gate/test-pre-review.mjs
- scripts/gate/test-review-order.mjs
- scripts/gate/test-enforcement-inventory.mjs

切り分け: **(a) このブランチの変更が原因**。5 本はこのブランチで足された試験で、origin/main には無いため origin/main では起きない(origin/main の写しでの実行は不要と判断。試験の存在そのものが原因)。試験自体は単体では全部通る。IMPL-0136 の注記に「試験の結線が B20 の push の後」とあるが、`npm run check` は結線の欠けを失敗として扱うので、このままでは CI(`ci.yml`)の check が落ちる。
対処の案(担当は直していない): gate-g5.yml の contract へ 5 本の手順を足す(template 側の変更)、または NOT_TESTS へ理由を書く。どちらかは議長の裁定。

### 2. 担当の実行の側の注意(欠陥ではない)
template の workflow が引数つきで呼ぶ CLI 12 本(adapter・aggregate-evidence・ai-review-record・check-delegation・check-pr・evidence-manifest・flow-observation・license-scan-record・period-needed・pre-review・review-queue・test-results)を、引数なしで流したため exit 1/2(使い方の表示)。試験ではないので判定に使わない。同名の `test-*.mjs` は通っている。

### 3. 偽の FAIL
- CRLF 由来(test-g5-aggregate 等)は出なかった。時計依存(tpl2 trial・r3 scen)も出なかった。回帰スイートの 29 本はどちらの TZ でも落ちた場面 0。

## 判定
**push してはならない**(check が落ちる)。原因は 1 つで、template の新規 5 本の試験の結線(gate-g5.yml contract)。これを直せば、他は両条件とも通過している(再実行で test:template-suite 以降の確認が要る)。

## 確かめていないこと
push 後の CI、Windows での regress・build。check 修正後の再実行。

## 後始末
WSL の `~/b21-regress`・`~/b21-out-n`・`~/b21-out-u`・`/tmp/pit-regress-*` は残している(再実行に使う)。
