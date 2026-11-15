# 引き継ぎの記録 11(実装の担当 11人目。範囲: 附属書F・B・D)

## 較正(先に書いた区分。answers を開く前)

手順の注記: 節の本文を grep で探す際に、1・4 の節の本文中の既存のマーク(IMPL-0216・IMPL-0832)が出力に混じって見えた。登録簿の行は見ていない。1・4 はマークの存在を見た上での区分であり、独立な較正としては弱い。

| # | 節 | 私の区分 |
| --- | --- | --- |
| 1 | roles-responsibilities 3.10.8 形骸化の検知 | 規定あり、既存マーク IMPL-0216(undelivered)で足りる → marked |
| 2 | gate-criteria G-1 企画承認 | 規定あり、既存マーク IMPL-0679・0371 が節内にある → marked |
| 3 | human-ai-boundary 5.8 | 適用範囲を述べる導入文だけ。規定は子節 5.8.x → none(規定は子節が担う) |
| 4 | roles-responsibilities 3.10.7 | 規定あり、既存マーク IMPL-0832 → marked |
| 5 | gate-criteria 品質の約束と保証範囲(層2) | 規定あり、節内に既存マークなし → 新しいマークが要る(marked) |
| 6 | gate-criteria 合否条件にしてよい指標、してはならない指標 | 「してはならない」の規定あり、節内に既存マークなし → 新しいマークが要る(marked) |

### 答えとの比較

一致: 1(marked)、3(none)。食い違い: 2(答えは `kb`。判定基準の表を持つ節の区分を、私は marked と読んだ)、4(答えは none/org-design。当日のふるまいの定めは記録に現れない。私は既存マークの存在に引かれて marked とした。1・4 は先に見たマークの影響が大きい)、5(答えは elsewhere。私は「節の中に既存マークが無い」ことから新マークと読み、他の節の IMPL-0057・0069・0072 の note が規定を名指すかを探さなかった)、6(答えは not-imposed か org-design。私は禁止の文を規定と読んで marked とした)。
読みのずれ: 「してはならない」の文末だけで marked に倒すこと、節の外のマークの note を探さないこと。以降の区分では、(a) 違反が記録に現れない当日・組織内のふるまいの定めは org-design、(b) 他の頁のマークの note が規定を名指すときは elsewhere を先に検討する。

## 1. 区分した節の数(範囲 36 節。pending だった節をすべて区分した)

| 区分 | 節数 | 内訳 |
| --- | --- | --- |
| `marked`(新しいマークを足した) | 18 | 附属書F 14(F.1 用語、F.2 切り分け、F.2 区分、F.3 2つのケース、F.3 追加要求、F.3 反復、F.4、F.5 手法の分類、F.5 最小限、F.5 AI 生成、F.6 カバレッジ、F.6 CI、F.6 既知の限界、F.7)、附属書B 4(5つのパターン、書き方の手順、草案、チェックリスト) |
| `none / elsewhere` | 1 | F.2 適用の判定(図のみ。IMPL-0449・0933・0924・0915 が名指す) |
| `none / org-design` | 4 | F.1、D 冒頭、D 提案の戦略、D 提案書で使わない表現 |
| `none / explanation` | 13 | F 冒頭・F.5 導入・F.6 位置づけ・F.8、B 冒頭・なぜ・良い例・出典、D テンプレート・想定問答3節・提案の進め方 |


## 2. 足したマーク(0914〜0943。0677 は欠番のまま)

- 附属書F: 0914〜0934(21 件)。うち `delivered` は 0915(d0-template、presence)だけ。残り 20 件は `undelivered plan=scheduled issue=324`
- 附属書B: 0935・0940 が `delivered`(spec-write-skill、manual)。0936〜0939・0941〜0943 の 7 件が `undelivered`(0942 は feature-spec-template、0943 は gate-skill、他は spec-write-skill)
- 附属書D: マークを足さない
- 降ろし先: `safety-verification-record`(`kind: planned`。T4 により新設)、`spec-write-skill`(`template-file`。実在を確かめて登録)。ほかは既存の profile-generator・implement-skill・g5-adapter・d0-template・feature-spec-template・gate-skill
- 台帳は `npm run impl:write` で再生成した

## 3. pending のまま残した節

自分の範囲は 0 件。登録簿に残る `pending` は 2 節(前の担当から引き継ぎ。降ろし先が無く、議長が裁定する)。
- `human-ai-boundary#5.4 AI自律レベル > 5.4.7 能力維持措置`(「AI を用いない機会の頻度」を運ぶ降ろし先が無い。handover-02)
- `exception-escalation#7.5 判定の滞留に対する措置`(期限超過の検出と通知・代理の指名を運ぶ降ろし先が無い。handover-03)

## 4. 降ろし先が登録に無かった規定

- 附属書F F.7・F.4・F.5・F.6 の製品の安全の試験の内容と記録: T4 に従い予定の降ろし先 `safety-verification-record` を足し、`undelivered plan=scheduled` で表示した(採用者に委ねるかは決めていない)
- 附属書B の「書き方の手順」の4ステップと G-2 提出前のセルフチェックのうち、値・異常系・テスト名の項目: /spec-write の完了の条件に無い。/spec-write 自体が未登録だったので `spec-write-skill` を足した
- F.3 要求3(各行の4条件)、F.3 の「AI が安全機能そのものを実現する場合」(専門部門と行う): 記録の欄が無く `safety-verification-record` に当てた。後者は判定表の試し c だけで規定として扱った(迷って規定の側へ倒した)

## 5. 判定表の c だけで当てた箇所

IMPL-0918(F.3 2つのケースの専門部門)、IMPL-0925(本番稼働中への故障挿入の禁止。審議中の枠だが決まるまで要求)。

## 6. 文の誤り・矛盾の候補

- F.3 要求1(安全関連部を L1 に固定)と第8章 軸E の表(CL2 の上限)の食い違いは、議長の指示に従い条文を変えず、マークの note にも書いていない。IMPL-0919 の note は「構成は上限を案件の全体に掛け、安全関連部だけを L1 に固定する単位を持たない」までに留めた
- 附属書B 書き方の手順 が formalize-criteria タスクを名指すが、準拠テンプレートにそのタスクは無い(語は /spec-write の本文の1か所だけではなく、git grep で skill の表の中の「異常系」の語のみ。タスクとしては存在しない)。語の定義か削除かを議長が裁定してほしい
- 附属書F F.6「CI への組み込み」の閾値は「組織が G-1 で定める」が、G-1 の判定基準4(指標の閾値)の列挙にミューテーションの閾値は無い(第4章 G-1 基準4 と食い違いうる)
- 附属書F の「用語を安易に併記しない」の版の記述(SRC-0740 など)は説明で、規定でない

## 7. 重へ上げる候補

なし。ただし 0918(専門部門)の扱いは、新しい記録の欄を標準へ足す必要があるなら判定表 1.2 の順 8 に当たる。私は planned の降ろし先に当てて表示した。議長の突合で外すなら pending へ戻す必要がある(検査の失敗 11 により戻せないため、none に直す形になる)

## 8. 独立の突合へ渡す点

- F.1・D の org-design 4 件(理由に探した場所を書いた)。D 提案書で使わない表現は H.8(登録済み org-design)と揃えた
- F.2 の elsewhere は、図の判断を IMPL-0449(Q1)・0933・0924・0915 が名指すことに依る。0449 の note は「附属書F F.2 の回答」「F.2 の Q1」を名指す
- F.3 追加要求の要求2・4・5 の elsewhere(IMPL-0207・0184・0344・0080・0514)
- delivered の 3 件(0915・0935・0940)は template の実物(templates/00 節16、.claude/skills/spec-write/SKILL.md、gates/G-2.md)を開いて確かめた。実行はしていない

## 9. 次の担当への注意

実装の担当は私が最後。検査: lint:impl 0 / test:impl 56件合格 / lint:refs 0 / lint:provisions 0 / textlint(safety-verification.md・ears-guide.md)0。採番は 0944 から。登録簿の `pending` は上記の 2 節。lint:impl の出力は長いので `> file` に流して先頭と末尾だけ読む。
