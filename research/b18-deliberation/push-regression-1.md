# 束 B18 前半(#328・単位0〜3)の載せ直しと push の前の回帰(担当の記録。push はしていない)

## 載せ直し
- origin/main: 本体 979ed992(B19 後)、template ef60cda。
- template(b18-328 を origin/main へ rebase): 衝突なし。試験は test-check-pr 255 場面、test-roster-ids 61 件、test-roster-rules 212 件が一致。
- 本体の rebase: 衝突は submodule 参照(template)と自動生成の台帳(implementation-ledger.md)だけ。参照は b18-328 の先頭へ、台帳は upstream を取り、後で再生成した。graphify-out の衝突は出なかった。
- template:kb を再生成し、template へ d467db4 をコミット、本体で参照を更新、impl:write で台帳を再生成してコミットした。
- 注意: tailoring-kb.json は生成元の本体コミット SHA を埋め込むため、本体にコミットするたびに作業ツリーで 1 行の差分が再び出る(template の作業ツリーに残っている。コミットしていない)。

## 番号
- origin/main の最大: EV-0325、IMPL-1025、SRC-0765。ADR-0200 は origin/main に無い。
- B18 の EV-0326 は最大の次で重ならない。IMPL・SRC は付け直し不要(重複なし)。evidence:write・scope:write の台帳に差分なし。

## 回帰の全量(WSL・node 26.13.1・git archive の LF の写し)
| 条件 | 終了コード | 結果 |
|---|---|---|
| 回帰スイート --kb keep(通常) | 1 | t288 が落ちた(87 場面中 4)。他は全部通った |
| 同 TZ=UTC | 1 | 同じ t288 の 4 場面 |
| npm run check(通常) | 1 | test:criteria で停止(下記 2) |
| TZ=UTC npm run check | 1 | 同上 |

### 落ちた原因
1. t288 の 4 場面(停止: ラベルなしでは対象外 / 権限者の記名・理由・上申の記録がある解除で通る / 層1 の権限者(出荷判定者)の解除で通る / 層1 なしでは事業決裁者を権限者とみなし、その旨を出す)。errors に「CODEOWNERS(.github/CODEOWNERS): 15 行目(*): 所有者 @tester が名簿(people[].accounts)の人へ対応づかない」。原因は B18 の変更: template の 7fe000d(#325。CODEOWNERS の所有者の定義を G-5 で確かめる、IMPL-0211)が、名簿に無い所有者を失敗にするようにした。suite の t288 の fixture は CODEOWNERS の所有者に @tester を置き、名簿に対応づけていない。時計依存ではない(日付は固定の 2026-10-08)。B16 の push 2 では通っていた。
2. npm run check の test:criteria: 「生成元の版 d3ff0213… が標準の履歴の上にあるかを確かめられません(git のリポジトリではありません)」。写しに .git が無い環境の問題で、B18 の欠陥ではない。.git を持つ写し(git clone で作る)で流し直す必要がある。この停止のため、check の後続(test:template-suite・regress・build)は未確認。

## 止めた理由
原因 1 は B18 の変更。指示のとおり直さずに止めた。直すなら、suite の t288 の fixture(と同じ @tester を使う suite/adjust.mjs ほか)の CODEOWNERS を名簿に対応づく所有者へ直すか、#325 の規則の適用範囲を見直すか。どちらが誤りかは議長の裁定が要る(suite の fixture は過去の決定を固定している)。

## 先頭
- 本体: f8f6332c(この記録のコミットの 1 つ前の先頭は f8f6332c)
- template: d467db4(bundle: E:/Github/process-compass/tmp/bundles/template-b18-rebased-02.bundle)

## 後始末
WSL の /tmp/pcb18・/tmp/pit-regress-*・/tmp/pcb18-*.log と Windows 側の tmp/b18.tar・b18t.tar・p3.sh・p3.out は残している(原因調査に使うため)。

## 議長の裁定(2026-11-18): t288 の 4 場面の失敗

どちらが誤りか: **規則の側を改める。suite の fixture は変えない。**

- fixture の `@tester` は、ADR-0085 の「人が実在のアカウントへ置き換える」を写した調整である(`scripts/regress/run.mjs:121`)。ADR-0085 が塞いだのは雛形の `@OWNER` が残ることで、所有者が名簿に載ることは求めていない
- IMPL-0211 の規定の結果は「所有者の無い領域を作らない」「部署名・グループ名だけの指名を認めない」である。個人が記名されていれば、この結果は満たされる。名簿に無い個人(外部の保守担当・委託先のレビュア等)を一律に失敗にすると、すべての PR が G-5 で止まる。これは条文に無い新しい義務で、破られて失うものに対して重い(所有者の方針 2026-11-16 の問い3)
- 承認として数えるかは名簿の照合が別に確かめる(IMPL-0972 の宣言行ほか)ため、ここで止めなくても適合の主張の信頼は損なわれない

決定:
1. 名簿に対応づかない個人の所有者(メールの形を含む)は **失敗にせず注意(notices)に出す**。失敗に残すのは、置き字 `@OWNER`、所有者の無い行、チームだけの行、どの行の型にも当たらない変更、CODEOWNERS が3か所のどこにも無い構成
2. ruling-a1.md の IMPL-0211 の「対応づかなければ失敗」を本裁定で置き換える。ADR-0200 の決定6(未 push)・IMPL-0211 の note・README・process-init・`verify-gate-contract.mjs` の文言を、名簿の個人を「勧める」形へそろえる
3. 採らない案: fixture の所有者を名簿の人へ置き換える(条文に無い義務を固定するため)。名簿の照合をやめて何も出さない(記名の誤りに気づく手がかりを失うため)
4. 独立の突合は単位0〜3 で2巡を終えているため、この直しは議長が差分を確かめ、回帰の全量で閉じる

範囲の変更(指揮役 2026-11-18): #355・#448・#447・#444 は B20 へ移す。ruling-a1.md の単位6(0759・0927・0925・0934)・単位13・14(0207・1019・0506・0510)は B18 で実装しない。
