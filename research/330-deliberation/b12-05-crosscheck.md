# #330 束 B12 独立の突合(差分の1回)

日付: 2026-11-17。担当: 実装を見ていない別の文脈。対象: 本体 `9d33938d..91d1968c`(research を除く)、template `b5bfc6d..fce8273`。照らした裁定: b12-03-ruling-proposal.md(「5. 議長の裁定」を優先)。

## 実行で確かめたこと

- test-license-scan 27 件・test-unrun-streak 31 件・test-adapter 66 件は通過。test-g5-aggregate は 4/30 が落ちる(実装の記録のとおり b5bfc6d でも同じ件数。CRLF の既知の偽の FAIL として扱い、本突合では追っていない)
- 集約を一時の作業場で通しで走らせ、項目4 のライセンスの行を出力させた(試験の写しに表示を足して実行し、写しは消した)
  - コマンドが空 → `未実施(コマンドが未設定) / 2026-11-17 の出荷から 1 回連続。前回の出力なし。起点は今回`
  - 対象なし → `未実施(検査対象が存在しない) / …`
  - 古い記録(scanRun: true)+ 空のコマンド → `未実施(コマンドが未設定) / …`(実施と出ない)
  - コマンドあり・成功 → `実施(success)`、記録なし → `未実施 / …` と欠落
- mutation(いずれもファイルの写しを取り、確かめた後に写しから戻した。`git status` は空のまま)
  - aggregate-evidence.mjs の licenseScanStatus から構成の側の判定を外す → `IMPL-0995:ng` 3件が落ちる
  - adapter.mjs の OPTIONAL に test・secretScan を足す → `IMPL-0992:ng` 2件が落ちる
  - unrun-streak.mjs の isUnrunValue を常に false → `IMPL-0993:ok` 3件が落ち、続く検査の TypeError で試験が異常終了する(検出はする)
- 本体: `lint:impl`(exit 0)・`lint:evidence`・`lint:scope`・`impl:issues`・`lint:refs` は通過
- contract への結線: gate-g5.yml L193 に test-license-scan、L195 に test-unrun-streak。test-adapter(L191)・test-g5-aggregate(L179)は既存の結線

## 観点ごとの結論

1. 裁定どおりか: おおむね裁定どおり。4.1 の「数えない」は L3463 の `exists('evidence/license-scan.json')` で実装され、試験2件で固定。実装の逸脱(phaseStatus が構成以外の理由の未実施のときに素通しにする)は、どの経路でも「実施」と出さないため受け入れてよい
2. 表示と実態: 空・対象なしを「実施」と出す経路は、記録の側・集約の側の両方で閉じている。outcome が skipped・cancelled(setup-stack の失敗)のとき記録は `scanRun: true, result: skipped` になるが、その実行は成功しないため ship-evidence(`--status success` の実行だけを取る)へ届かない。T-7 の構文の検査が setup-stack の continue-on-error を止めるので、この経路は塞がれている
3. delivered の test= は3件とも実在し、ng/ok は別の行にあり、mutation で違反を検出した
4. 実装マークの規約とは矛盾しない。ADR-0151 とは下の X3 の文言の食い違いがある
5. 結線済み

## 所見

| 番号 | 重大度 | 所見 | 推奨 |
| --- | --- | --- | --- |
| X1 | 中 | 旧い版から上げた採用者で、継続期間の起点が実態より新しく出る。旧い集約は空のライセンス検査を `実施(success)` と出していた(IMPL-0995 の欠陥)。前回の出力が旧い形式(unrunStreaks なし)で licenses が `実施(…)` なら、computeUnrunStreaks は「今回の出荷から 1 回連続」と出す。前回は実施だったと機械が確かめたように読めるが、実際は未実施だった可能性がある。裁定 T-1 の3(旧い形式の分岐)は値が未実施のときだけを扱い、この筋を扱っていない | 前回が旧い形式で licenses の値が `実施` のときの note を「前回の出力は旧い形式(空のライセンス検査も実施と出した)。起点は今回」などへ改めるか、開示で閉じる。直さないなら、IMPL-0993 の note に旧い形式からの移行の限界を書く |
| X2 | 中 | template-repository.md L867 の「ライセンス検査は IMPL-0995 が降りるまでこの前提が成り立たず」が残っている。IMPL-0995 は delivered になったため、今も成り立たないと読める。裁定の表は L864 の括弧だけを挙げており、同じ節のこの文が漏れた | 「ライセンス検査も、空のコマンド・対象なしを scanRun: false の記録として残す(IMPL-0995)」の趣旨へ改める(編集の指摘) |
| X3 | 低 | adapter.mjs 冒頭の注釈が coverage を「任意の段」に並べる。ADR-0151 決定1 は「カバレッジは任意の検査から外す」と書く。挙動(adapter は通し、coverage-check.mjs が失敗させる)は注釈の3行目で正しく書かれ、裁定どおり OPTIONAL からは外していないが、語が ADR と逆に読める | 1行目の括弧から coverage を外し、「coverage は任意の検査ではないが、このアダプタは空を通す(失敗は coverage-check.mjs)」とする |
| X4 | 低 | 裁定の表(2. 標準の側の追随)は「research/330-deliberation/implementation.md に T-1〜T-8 の記録を追記する」と求めるが、追記されていない(実装の記録は「議長が必要なら行う」とした)。ADR-0151 L39・L65 は IMPL-0993・IMPL-0995 を undelivered と書いたまま。ADR は書き換えないため、追跡の記録が要る | 議長が implementation.md へ追記し、ADR-0151 の「影響」の記述が B12 で降りたことを辿れるようにする |
| X5 | 低 | test-license-scan.mjs の通しの検査の正規表現が `…| 未実施 /` の選択を含む。特に `IMPL-0995:ok 項目4: 「実施(success)」と出す` は、行が素の `未実施` でも通る。今回の実行では行は `実施(success)` で、純関数の ok 側の検査が同じ誤りを捕えるため、検出力は残る | 通しの ok の正規表現から `| 未実施 ` の選択を外す。ng 側も理由つきの文字列に限る |
| X6 | 低 | G-7 基準8 の行は、構成で選んだ未実施のとき「記録 なし(構成で選んだ未実施。記録の有無だけを見た)」と出す。license-scan.json は scanRun: false で存在し、chosen の判定には構成も読んでいるため、「なし」「記録の有無だけを見た」はどちらも実態と少しずれる。文言は裁定の指定どおり | 次に触るときに「実施の記録 なし(構成で選んだ未実施。記録とアダプタの構成を見た)」の趣旨へ改める。今回は直さなくてよい |
| X7 | 低 | evidence.json の `ipClearance` は記録の生の値をそのまま出す。古い記録(scanRun: true)+ 空のコマンドでは、項目4 が未実施でも ipClearance.scanRun は true のまま。外部の読み手が ipClearance を読むと食い違う | ipClearance に licenseScanStatus の run・text を並べて出すか、生の記録であることを欄名か注で示す |

「高」はない。
