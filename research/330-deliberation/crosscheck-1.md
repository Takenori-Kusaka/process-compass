# #330 独立の突合(1巡目・全体)

日付: 2026-11-17。担当: 独立の突合(実装を見ていない別の文脈)。対象: コミット 7ea46786。照らした先: decision.md、Issue #330 の本文とコメント、ADR-0124・ADR-0151、gate-criteria.md・assurance-case.md・ci-gates.md・template-repository.md、template/ の adapter.mjs・coverage-check.mjs・g5-aggregate.mjs・aggregate-evidence.mjs・gate-g5.yml・ship-evidence.yml。

## 実行で確かめたこと

方法: `template/` を `.git`・node_modules を除いて scratchpad へ複製し、`configured: true`・`stack: node`、`package.json` と `src/a.js` を置いた(template 本体は変えていない)。

| 構成 | 結果 |
| --- | --- |
| `lint: ""` | `adapter.mjs run lint` は通知して exit 0。項目4 は「静的解析 \| 未実施(コマンドが未設定)」 |
| `audit: "echo AUDIT-RAN"` | 実行。項目4 は「依存の監査 \| 実施(結果は gate-g5 に含む)」。基準2 の2検査は別に出る(裁定の 1章 a と一致) |
| `coverage: ""`、製品のコードあり | `adapter.mjs run coverage` は通知して exit 0、続く `coverage-check.mjs --base HEAD` は「集計ファイルがありません … 失敗に数えます」で exit 1(template-repository.md の直しと一致) |
| `coverage: ""`、製品のコードなし | `coverage-check.mjs` は「対象プロジェクトが見つかりません。未実施として記録します」で exit 0 |
| `licenses: ""` | `adapter.mjs run licenses` は通知して exit 0。gate-g5.yml の ip-clearance は、その段の outcome(success)を `{"scanRun": true, "result": "success"}` として `evidence/license-scan.json` に書く(L340-345)。ship-evidence がこの成果物を取り込む(L141・L408)。同じ記録で集約を流すと、項目4 は **「依存関係のライセンス \| 実施(success)」** と出る(quality-report.md・assurance-disclosure.external.md の両方) |

検査: `lint:impl`・`lint:evidence`(274件、期限到来 0)・`lint:refs`・`lint:scope`・`lint:provisions` はすべて exit 0。`impl:write`・`evidence:write`・`scope:write` を流し直しても差分は出ない(台帳はマークと一致)。

## 所見

| # | 重大度 | 所在 | 所見 | 直し方の案 |
| --- | --- | --- | --- | --- |
| X1 | **高** | gate-criteria.md L1022(新しい段落)・L1030 の IMPL-0992(delivered)・ADR-0151「コンテキスト」2つ目の箇条・template の gate-g5.yml L340-345 | **表示と実態が食い違う**。本文は「構成で選んだ未実施は、項目4 に検査ごとに未実施として出します」と書き、IMPL-0992 は対象を「lint・audit・licenses・install」として「項目4 は検査ごとに『未実施(コマンドが未設定)』と出す」を delivered にしている。実行では、licenses が空のとき項目4 は「実施(success)」と出る。ip-clearance の記録の段が、空のコマンドで通った段の成功を `scanRun: true` として書くためである。これは観点16 の兆候「実施していない検査が、通過として集計されている」そのものである。ADR-0151 の「通過との区別は、実行で確かめた範囲では成り立つ」と EV-0293 の判断(項目4 の開示で取り違えを防げる)の前提が、ライセンス検査では成り立っていない。裁定の 1章 a は lint と audit しか実行していない | (1) IMPL-0992 の note を lint・audit に限る。(2) licenses の表示を別の実装マーク(undelivered、plan=scheduled、issue=330)に分け、「空のコマンドで通った ip-clearance の記録が scanRun: true となり、項目4 が実施と出る」を note に書く。(3) template へ申し送る T-8 を足す(ip-clearance の記録の段で、`adapter.mjs print licenses` が空なら `scanRun: false` と理由を書く。または machineChecks.licenses を machineCheckStatus の `name: 'licenses'` で先に判定する)と、その違反と適合の対の試験。(4) ADR-0151 のコンテキストの箇条を「lint・audit では成り立つ。licenses では成り立たない(IMPL-NNNN)」へ改める。EV-0293 の対象に同じ限定を書く |
| X2 | 中 | gate-criteria.md L1022 | 新しい段落の例外の列挙が「テストの実行と秘匿情報の混入検査」だけで、**カバレッジが漏れている**。段落の主語は「アダプタのコマンドが空のため実施しなかった検査」の全体であり、文字どおり読むと、言語のアダプタのカバレッジの空も「失敗に数えず」に入る。同じ章の L1066(ADR-0124 決定1。測れない構成は未実施として失敗)と食い違う。ADR-0151 決定1 と template-repository.md の表はカバレッジを外しているので、第4章の本文だけが外していない | 主語を「アダプタのコマンドが空のため実施しなかった任意の検査(静的解析・依存監査・ライセンス検査・依存の導入)」と列挙に改めるか、例外に「言語のアダプタで製品のコードがあるときのカバレッジ(後掲「カバレッジの測る範囲と規模」)」を足す。意味を変えない編集(ed)で足りる |
| X3 | 中 | gate-criteria.md L1022・IMPL-0992・ADR-0151 決定1 | 「依存の導入(install)」を任意の検査に数え、「項目4 に検査ごとに未実施として出します」の対象に含めているが、集約の machineChecks に install の項目は無く、項目4 に出ない(aggregate-evidence.mjs L4020-4045)。表示の対象として列挙したものが出ていない | install は G-5 の基準を実装する検査ではない(導入の段)ので、項目4 に出す対象から外す旨を本文に書く。出すなら undelivered のマークで開示する。IMPL-0992 の note から install を除く |
| X4 | 低 | IMPL-0992 の check=manual と「確かめる者: 出荷判定者」 | 裁定(check=machine)から外れた理由(lint:impl が試験の中の目印を要し、template を触れない)は実在し、manual で表示と実態は食い違わない(検査を名乗らない)。ただし「出荷判定者が G-7 で集約の出力を読んで確かめる」は、X1 のとおり出力そのものが誤る場合に確かめようが無い。確かめる者を出荷判定者に置くことは本文で課していない役割で、note だけの記載に留まる | X1 の直しの後、note の確かめる者を「計画の Issue の担当者(T-4 で目印つきの試験を足したときに machine へ戻す)」とする。出荷判定者へ新しい確認を割り当てる形を避ける |
| X5 | 低 | gate-criteria.md L1653-1661 | 保証の開示の要求の箇条書きの途中に caution(EV-0292)と実装マーク(IMPL-0993)を挟み、箇条書きが2つに割れた(後半の「項目1・3・6 には…」が別の箇条書きになる)。意味は変わらない | caution とマークを箇条書きの末尾(「対外文書へ添える…」の後)へ移すか、項目4 の箇条を箇条書きの最後に置く(ed) |
| X6 | 低 | ADR-0151 決定2・gate-criteria.md 項目4 の行・ci-gates.md L940 | 起点(未実施のまま出荷した最初の出荷)は項目6・H.6・ci-gates.md L940 と一致し、矛盾は無い。ただし項目4 の未実施は理由が変わりうる(「コマンドが未設定」→「ジョブを集約が使っていない」など)。継続を検査ごとに数えるのか、理由ごとに数えるのかが書かれていない。項目6 には理由の別が無いので、項目6 の型の転用では決まらない | IMPL-0993 の note か T-1 に「継続は検査ごとに数え、理由が変わっても未実施が続く限り途切れない」(または理由ごと)を書き、降ろすときの試験に含める |
| X7 | 低 | template-repository.md の空コマンドの表、カバレッジの行 | 「言語のアダプタ(node・python・go)」の列挙は、同梱の python-poetry・python-uv を名で含まない(coverage-check.mjs は「none・undetermined 以外」で判定)。「製品のコードが無い間は対象なしとして通過」は、template の出力では「未実施として記録します」/「未実施(検査対象が存在しない)」と出る。ADR-0151 決定2 も後者の言い方を使っており、語の食い違いは既存の template 側の表記に由来する | 「言語のアダプタ(none・undetermined 以外)」と書く。対象なしの語は既存の第4章の語のままでよいが、出力の語との対応を手引きに1文で添える(ed) |

## 観点ごとの判定

1. **裁定どおりか**: 4.1 (1)〜(6)・4.2・4.3 の文はほぼ裁定どおりに入っている。裁定から外れた2点のうち、IMPL-0992 の check=manual は妥当(X4 の注記つき)。EV の説明を「対象」欄へ移したことは、台帳の列(対象・根拠・根拠とした事例・見直し・差し替え条件)に合い、lint:evidence も通るので妥当。ただし X1 で、IMPL-0992 の delivered の範囲そのものが実態を超えている
2. **新しい義務**: 本文が出荷判定者・事業決裁者・採用者に新しい記載を課した箇所は見当たらない。観点14・G-8 の異議の対象は変わっておらず、観点16 の確かめ方の列と H.6 の C3 の行に継続期間が足され、ADR-0151 決定3 に「広げない」が明記されている。S2 の受け方は本文に正しく出ている。X4 の「確かめる者: 出荷判定者」は note の記載だけで規定ではない
3. **起点の一致**: 項目4 の行・H.6 の表・ci-gates.md L444・L940・ADR-0151 決定2 で「未実施のまま出荷した最初の出荷」(項目6 と同じ)に揃っている。矛盾は無い(X6 は未記載の細部)
4. **マークと台帳**: lint 5種が通過し、台帳の再生成で差分が出ない。IMPL-0234・0239・0476 の note の付け替えは裁定 4.2 どおり
5. **template-repository.md の直し**: カバレッジの行は実挙動と一致する(実行で確かめた)。静的解析・依存監査の行も一致する。**ライセンス検査は「未実施として証跡へ残し…項目4 に検査ごとの未実施…が出る」と書いたが、実挙動は「実施(success)」**(X1)

## 重への上げについて

CLAUDE.md の規則は「独立の突合で重大度『高』が出た場合」を重へ上げる条件に挙げる。X1 は、新しい義務や ADR の原則の争点ではなく、既存の template の表示の誤りを本件が delivered と表示したことによる食い違いで、直し方(表示の範囲を lint・audit に限り、licenses を undelivered で開示する)は軽の範囲で閉じる。議長が、規則の文言に従って重へ上げるか、表示の直しで閉じるかを裁定すること。突合者の見立ては後者だが、EV-0293 の判断(失敗にしなくても項目4 で取り違えを防げる)の反例が実物に1件あることは、ADR-0151 の決定1 の前提に触れるため、裁定に記録を残すことを求める。

## 件数

高 1(X1)・中 2(X2・X3)・低 4(X4〜X7)。
