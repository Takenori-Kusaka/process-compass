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
