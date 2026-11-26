# #361・#452 実装の記録(束 B34、2026-11-26)

実装役。裁定 `30-ruling.md` の §3 の順(1 切り分け → 2 template の直し → 3 README・本文の手引き → 4 IMPL の note・本文の試行の事実)。5 の独立の突合は行っていない(議長の段)。

## 1. 実装した裁定の項目と残り

| 項目 | 状態 |
| --- | --- |
| R-1 切り分け | 実施(§2) |
| R-2 / D-1 | 実装。除外式のまま、複製の補助 `template-copy.mjs` 1つへ。製品のコードと、初期化が足す基盤のファイル(`scaffoldStack` から導く)を外し、構成を未設定の既定へ置き換える。試験 `test-template-copy.mjs`(違反と適合の対、既定の構成の同期) |
| R-3 / D-2 | 実装(PR ごとのグループ、git と createCommitOnBranch の push のやり直し、尽きたら失敗)。静的な検査と変異の試験。**実機では未確認**。D-17 は直していない(原因不明) |
| R-4 / D-3 | 実装。理由 `plan`(HTTP 403 と文言「Upgrade to GitHub Pro or make this repository public」の組)。一致しなければ `permission` に戻る。文言は定数 1 か所 |
| R-5 / D-4 と手引き | 実装。verify の最初の手順で、基底に `.github/gate-node-version` が無ければ理由つきで失敗(通過にしない)。手引き(本文・README)は事実だけ。順序を課す文は書いていない |
| D-6 | 手引きだけ(README 手順1、本文)。`.gitattributes` は触っていない |
| D-7 | 実装(go.mod があれば挙げない、置き場と例、go 行と runtimeVersion の食い違いを告げる)。setup-stack で道具を入れる案は採っていない |
| D-8・D-15 | README のみ |
| D-9 | 実装(既存の package.json に scripts.coverage が無ければ todo に出す。README に jest の例。jest は実行して確かめていない旨を併記) |
| D-10 | 本文 EV-0170 の本文に事実として足した(python のアダプタは pyproject の dev を読み requirements を読まない) |
| D-14 | 実装(env-check の未知のオプションを exit 2 で拒む。警告で置く案は採っていない) |
| R-6 | 実装しない(D-7 の版の比較は go 行と runtimeVersion の一致の告げだけ。「初期化の検査」は足していない) |
| R-7 | 判定の表は本文に載せていない(research の記録の側の裁定。本文には「合」の件数を出していない) |
| R-8 | IMPL-0200 の note を「差が出る場面を作れなかった」へ。所見 1・2 は「文書の読みから導ける食い違い(観測ではない)」と書き、EV-0350 の根拠に数えない |
| R-9 | §4 |
| R-10 | IMPL の state は改めていない。EV は差し替えず、本文に事実を足した。水準は上げていない |
| R-11 | #361 は閉じない。コメントは書いていない(議長の段) |
| **残り** | 独立の突合(2 巡まで)。push 前の回帰の全量(本実装では流していない)。`npm run check` の最後の段(template-suite 以降)。#361 へ寄せる 4 件のコメント。bundle の push と本体の push(議長) |

## 2. R-1 の切り分け(WSL ubuntu、node 26.13.1、LF の写し)

構成: 未初期化の複製(uninit)・初期化済みの node(nodecfg)・初期化済みで go の製品のコードあり(gocfg)。gate-contract が流す 74 の自己試験を各構成で実行。

| 試験 | uninit | nodecfg | gocfg | 読み |
| --- | --- | --- | --- | --- |
| test-edition-end | 通る | 12 NG | 12 NG | D-1(構成済みが原因) |
| test-adapter | 通る | 1 NG | 1 NG | D-1(複製でなく ROOT の構成を読む。python の `services/api`) |
| test-license-scan | 通る | 2 NG | 2 NG | D-1 |
| test-name-confirmation-timing | 通る | 2 NG | 2 NG | D-1 |
| test-discouraged-evidence | 通る | 通る | 通る | **D-1 でない。原因は未特定**(§3) |
| test-self-heal | 通る | 通る | 通る | 案の付録 A の失敗は Windows の環境の要因。D-1 でない |
| test-adoption | 1 NG(@OWNER) | 通る | 通る | 構成済みでは自己判定で省く作り。uninit の NG は切り分け用の複製で @OWNER を置き換えた人為(試験の前提) |
| test-results | rc=2 | rc=2 | rc=2 | 引数なしでの実行による(構成と無関係。CI は引数つき) |
| test-ship-evidence-steps | 通る | rc=1(NG の語なし) | 通る | nodecfg だけ。§5 の追記を参照 |

直し(template-copy.mjs ほか)の後、gofix(gocfg に最新の道具を重ねた複製)で test-edition-end・test-license-scan・test-name-confirmation-timing・test-adapter・test-self-heal・test-discouraged-evidence・test-env-check は通った。違反の対は、製品のコード・構成を持つ複製で試験が通り、検査装置を書き換えた複製は書き換えたまま複製される(`test-template-copy.mjs`)。

## 3. 未特定として開示するもの

- **test-discouraged-evidence の失敗**: Windows(ローカル)と node の CI の実機(ubuntu、初期化の PR)で落ちたが、WSL ubuntu の 3 構成では落ちない。CI の node の記録は D-0 の欠如(`docs/D-0-governance.md` が無い)を併記しており、複製の入力が違う可能性がある。原因は特定していない。直していない。#361 へ寄せる(裁定の R-1 のとおり D-1 から切り離した)
- **D-2 の実機の再現と解消**: 13 秒間隔のマージを作っていない。状態は「未確認」。D-17(成功なのに写しが無い)は D-2 と切り分けて記録し、直していない
- D-11・D-16・D-17・D-18: 直していない(#361 へ寄せる)

## 4. R-9 template に check-pr が掛かるか

**掛からない**(2026-11-26 に確かめた)。pit-in-template の `process.config.json` は `configured: false` で、gate-g5・gate-g5-base の check-pr を呼ぶジョブは `configured == 'true'` の条件で飛ぶ。gate-contract(自己試験)は構成に依らず動く。pit-in-template の main には、ルールセットも旧来のブランチ保護も無い(`gh api` で空と 404)。よって、template の統制の設定(gate-g5.yml・record-copy.yml・自己試験)の変更に、AI維持管理者本人の承認が要る経路は、template 自身では働かない。議長の §8 の決定(正本の改訂は本標準の審議で受ける)は成り立つ。承認の経路は審議の記録(30-ruling.md)に残る。

## 5. 突合と開示

- D-3 の値の名: 本文の理由の列挙は「など」で開いている。`plan`(プランの制約で使えない)は列挙の内。ADR-0085 決定4 は「権限不足の未確認」を定め、文言を閉じていない。ADR は書き換えず、本文と IMPL-0316 の note を正にした。R-4 の「応答の文書 URL を見る」は、観測した gh の出力に URL が無く、実装できていない(状態コード 403 と文言の組)。
- D-4 の手引きの根拠水準: E2(単一事例)。保護の下での振る舞いは観測していないと本文に書いた。
- IMPL の注意: note に `<`・`>` を含めると実装マークの検査が読めない。`<owner/name>` を使わない形にした。
- 台帳: `impl:write`・`evidence:write` を実行した。IMPL の新しい番号は無い。`src/data/impl-untraced.yaml` に `scripts/gate/template-copy.mjs`(infra)を足した。
- 事後に気づいた点: `test-ship-evidence-steps` は nodecfg の基準の複製で rc=1 だった(NG の語を使わない形式の FAIL)。直しの後の複製での結果は、最終報告の前に確かめた分を §6 に追記する。

## 6. 仮の番号

| 種別 | 番号 | 場所 |
| --- | --- | --- |
| EV | EV-0349 | `phase5-implementation/template-repository.md`「持ち込みの最初の PR と複製の元(観測)」 |
| EV | EV-0350 | `phase5-implementation/agent-trace-control.md`(`specs/**` の外れ) |
| IMPL・SRC・ADR | なし | — |

(origin/main の最大は EV-0348・IMPL-1036・SRC-0768。push の直前に議長が付け直す。)

## 7. template のコミット(b34、base は origin/main d5d2d86)

1. fix(gate) 自己試験の複製から採用者の製品のコードと構成を外す(D-1)
2. fix(ci) record-copy の並行のグループを PR ごとに(D-2)
3. fix(gate) env-check がプランの制約による 403 を分ける(D-3)・未知のオプションを拒む(D-14)
4. fix(ci) ship-evidence-verify が持ち込みの最初の PR を理由つきで失敗にする(D-4)
5. fix(init) go と node の「作るもの」(D-7・D-9)
6. docs README(D-6・D-8・D-15)

template の先頭: `616f039`(7 コミット)。bundle: `E:/Github/process-compass/tmp/bundles/template-b34.bundle`(`origin/main..b34`)。

## 8. 採らない案(実装していない)

R-2 の許す一覧(案A)、D-7 の道具の setup-stack 導入、D-6 の `.gitattributes`、D-8 の読み方の変更、手引きでの順序の義務、並行グループを分けるだけの D-2 の直し、応答の文言の一致だけの D-3 の判定(状態コードとの組にした)。
