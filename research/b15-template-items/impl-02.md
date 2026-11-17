# 束 B15 順 2〜6 の実装記録

基点: template origin/main = d871f25、順 0・1 の 0fe36e0 の上。順 7・8 はしていない。template/CLAUDE.md・claude-md-resident.json・templates/*.md は触っていない。

| 順 | 項目 | template | 本体 | bundle |
| --- | --- | --- | --- | --- |
| 2 | IMPL-0988 | 4d8562f | 0df763ca | E:/Github/process-compass/tmp/bundles/template-b15-02.bundle |
| 3 | IMPL-0278 | 6cc2f25 | 64f7c368 | template-b15-03.bundle |
| 4 | IMPL-0760・0839 | f5d6ce8 | 95c7ad44 | template-b15-04.bundle |
| 5 | IMPL-0959 | ac69225 | 743fd021 | template-b15-05.bundle |
| 6 | IMPL-0987 | 4da885e | e7b44f7e | template-b15-06.bundle |

## 順 2 IMPL-0988
- `config.mjs` に `shippingSeparatedFromDevLine`(出荷判定者・開発者・独立レビュアの3席が、名簿の人に割り当てられ互いに別のときだけ true)。`detectDeviations` は席と名簿を受け取り、true のときだけ D-1 を出さない。契約検査(verify-gate-contract)の「approverMode が value-owner-merged なのに D-1 が無い」も同じ条件へそろえた(そろえないと、D-1 を出さない構成が契約検査で落ちる)
- 試験 test-roster-rules.mjs: ng 5(開発者を兼ねる・独立レビュアを兼ねる・1名・席が未割当・名簿が空)、ok 1(外部の確認者が独立レビュア、出荷判定者が別の名簿の人)
- 解釈: 「開発ラインの席」を、標準の兼務禁止表の sep-dev-shipping・sep-reviewer-shipping に合わせ、開発者の席と独立レビュアの席の両方とした

## 順 3 IMPL-0278(過去の固定の反転)
- `headcountProblems(config, { requireRoster })` に、3名以上の回答・名簿の体制の内が0名(外部の確認者だけも空に数える)・`config.d0Version` が空でない、の条件で出す検出を足した
- 反転した固定: `test-roster-rules.mjs` の「3名以上の回答で名簿が空なら出さない(降りていない差。IMPL-0278)」。突合: 351 の 04-ruling は H-2 を「現状維持+理由の記録」とし、名簿が空の検出は IMPL-0278 を undelivered のまま、閉じる候補(存在の検査。決定可能)を template の項目として残した。ADR-0082 は IMPL-0278 の注記の食い違いを直しただけで、空を検出しない決定を含まない。ADR-0065(回答は見込み、判定の根拠にしない)には触れない: 人数を名簿から導かず、存在だけを見る。よって固定は決定ではなく「降りていない差」の印であり、反転してよい。D-0 の作成前(d0Version なし)の試験は ok 側に残した
- 実行で見つけた回帰: 名簿を埋める変化点の受け付け(generate-profile.mjs の拒否)に同じ検出を掛けると、外部の人だけを足す途中の変化点が拒否され、test-name-confirmation-timing が落ちた。そのため受け付けでは `requireRoster:false` とし、構成の整合の検査と契約検査でだけ出す
- IMPL-0300 の note に「空を検出しない」の文は無かったので外す作業は無し。IMPL-0278 は target を gate-contract へ付け替えた

## 順 4 IMPL-0760・0839
- `traceabilityRequirement`/`traceabilityText`: 回答から規則データ(r-e-cl1・r-c-regulated)で practice traceability の必須を導き、PROCESS-PROFILE.md の「AI 生成箇所の追跡」の節と CLAUDE.md の構成依存部分の1行に同じ文を出す。claude-md-resident.json の対は、目印の区間の中なので不要(test-claude-md-resident 通過)
- 試験は test-edition-end.mjs(既に renderProfileMd・renderProcessRules を試験している)に ng/ok を足した。test-init-g5 は追加していない(1回の実行が長いため、関数を直に呼ぶ形にした)

## 順 5 IMPL-0959
- `renderProfileMd` に「提案書へ写す調整の宣言」の節。外した・簡略化した・統合したゲートと、practice・constraint の調整を理由つきで並べ、無い構成は「なし」。承認者は書かず、決裁者が記名する旨を案内する(承認者の欄は様式にも記録にも作っていない)
- 限界: 実際の構成では practice に常に注記が付くため、「なし」は実質、規則が何も当たらない構成(試験では結果を空にして確認)でしか出ない

## 順 6 IMPL-0987
- `aggregate-evidence.mjs`: `g5TriggerVerdict`(pull_request・pull_request_target の成功が無い PR は not-pr、実行を読めない・0件は unverified)、`g5TriggerGapText`、`g5RunsOf`(`actions/runs?head_sha=`、パスが gate-g5.yml のものに限る)。PR の経路の gate-g5 が成功でも、pr でなければ p.g5 を `event-not-pr`/`event-unverified` に置き、欠落に数える。文言「未確認(起動の事象を読めない)」。push の経路は触っていない
- `record-copy.yml`: `actions: read` を足し、写しの checks.gate_g5.runs に起動の事象を足した(読めなければ null。充足には数えない)
- `gate-g5.yml` の workflow_dispatch は外していない。標準 gate-criteria.md に EV-0325(見直し 2027-03)を置き、実機の結果の後に外すかを決めると開示した。一時リポジトリは作っていない
- 強制層の変更(record-copy.yml)の承認は、所有者が AI維持管理者として出す。承認者の欄は作っていない・AI の名義も書いていない
- 試験 test-g5-missing.mjs: 関数の対(ng 5・ok 3)、record-copy.yml の静的確認 2、集約の通し(偽の gh に actions/runs を足し、手動だけ・読めないの ng 2)。通しは Windows では読み飛ばされるため WSL(node 26)で通過を確かめた

## 試験の結果
- 流した: test-roster-rules 197、test-edition-end 87、test-init-g5 164、test-claude-md-resident、test-roster-conditions 50、test-roster-ids 52、test-name-confirmation-timing、test-g5-missing(Windows と WSL の両方)、test-aggregate-records 135、test-push-trigger 27、test-ship-evidence-steps、test-aggregate-drift 25 ほか多数。本体は各順で test:template・lint:impl・test:impl・lint:refs、最後に lint:scope・check-evidence
- 既存の NG(今回の変更に依らない): test-discouraged-evidence の 2 件(順 3 の検出を外しても同じ。時計依存の可能性。memory の回帰スイートの時計依存を参照)、test-g5-aggregate の 4 件(gate-g5.yml を変異させる試験で、Windows の CRLF によると推定。gate-g5.yml は未変更)
- 流していない: test-check-pr(120 秒超)、`npm run check` の全量(push の前に1回)
- 止めた項目: なし(呼び出しは上限内)
- 作業中の失敗: bash の heredoc 経由の python/node でバックスラッシュと改行の置換が壊れる事象が2回あった(Write で書いたスクリプトで直し、node --check と試験で確認済み)
