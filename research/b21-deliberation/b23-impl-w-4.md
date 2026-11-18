# 束 B23 単位 W の残りと単位 4 の実装の記録

2026-11-19。裁定は `ruling-deferred.md`・`ruling-deferred-draft.md`(§2・§3・§7.2)・`../b18-deliberation/ruling-a1.md` §3。template のコミットは単位 W が template-b23-W-01、単位 4 が template-b23-U4-01(bundle は `tmp/bundles/`)。

## 単位 W

- 様式 04 に欄「作業単位の完了の条件」を足した(ステージ移行ゲートのみ。それ以外は「該当なし」)。`records.mjs` の `recordFromForm` が `doneCondition` として読む。`next.mjs` の `doneConditionSource` が、ステージ移行ゲートの通過が無ければ企画書の欄、有れば最新の通過の記録の欄を返す。`flowSection` がこれを使う。欄が未記入なら算定できないと出し、企画書の欄へは戻らない。
- 上げたマーク: IMPL-0374・0377・0614 を `state=delivered check=machine`(0374・0614 は test-next-records、0377 は test-reach-forecast-record)。note から「降りていない理由」を削り、実装した部分を足した。0614 の「ラベルを外すと更新の日が進む前提は実環境で未確認」の開示は残した。
- IMPL-0954 のうち様式 04 の部分: 様式 04 の注記に、価値責任者の調整の記録の書き方(ゲート欄・種別と理由・結果欄の読み替え)を足した。マークは `undelivered` のまま。note に降りた部分と降りていない部分(集約と /pit の件数。単位 18)を分けた。
- `/gate` の SKILL.md: 「起案者へ差し戻します」を「実装計画へ差し戻します(起案者が計画を改める。標準 …」に揃えた(R-8)。
- 本体: テンプレ4 の標準側に同じ行を足し、`src/data/template-fields.yaml` に両方向で登録した。

### 裁定から変えた点(W)

- 標準 第6章 テンプレ4 に「作業単位の完了の条件」の行が無かった(2.10.2 要求事項4 は置き場を判定記録と定める)。template-fields の両方向の照合のため、標準側に1行と注記を足した。新しい義務ではなく、既存の要求事項の置き場の明示である。
- 単位期間の長さは、判定記録に欄を持たないため企画書の欄から読む。判定記録の完了の条件だけを正本にした(欄を増やさない)。

## 単位 4

- IMPL-0801: 観点1「対応する戦略目標」が「成長」、観点2の欄が「知見がある」「実績がある」、「現在の代替手段」が「ない・なし・無い・無し」と、NFKC・空白・句読点・括弧を除いて完全一致のとき失敗。
- IMPL-0878: 環境変数 `PREVIOUS_BRIEF`(パス、または git show で読める「版:パス」)を与えたとき、観点1・観点2・代替手段の欄の完全一致を警告に出す。与えないときは確認していない旨を notice で出す。承認可否に使わない。
- IMPL-0884: (a) D-0 の approved_at ≤ (b) 節16 の判定日 ≤ (c) 様式 09 の承認日 ≤ (d) 企画書の版のコミットの日付を読み、逆なら失敗。読めない日付は注意。`gate-entry.yml` の g1-check に `fetch-depth: 0` を足した。
- 3件とも `state=delivered check=machine test=test-brief-estimates.mjs`。

### 裁定から変えた点(単位 4)

- IMPL-0884: G-1 を通過済みの案件では、順序の逆を失敗にせず警告にした。D-0 の承認日は変化点で版を上げるたびに改まる(様式 00 節11)ため、通過済みの案件を遡って落とす誤検出になる。裁定は「前後が逆なら失敗」だけを定めていたので、これは条文に無い緩和であり、note に開示した。G-1 の通過を決められない場合と通過前は失敗にする。
- 比較は、読めた日付の間だけ(読めない日付を飛ばして前後を見る)。

## 試験(WSL)

- test-next-records 130 件(通常・TZ=UTC とも通過)、test-reach-forecast-record 21 件、test-brief-estimates 32 件(通常・TZ=UTC とも通過)、test-claude-md-resident、test-aggregate-records 214 件。
- 変異(各1回、元へ戻した): 0374 は SG の分岐を無効化し 4 件が落ちた。0801・0878・0884 は条件を `false` に置換し、各 2〜3 件が落ちた。
- 本体: impl:write、lint:impl、impl:issues、lint:evidence、lint:refs、test:fields、lint:scope は通過。textlint は触った docs に違反なし。

## 残った点

- 本体の回帰 `scripts/regress/run.mjs --only t288,t288b` は、WSL で作業ツリーの D-0 様式の置換が空振りして(改行コードの違いとみられる)setup で止まる。本件の変更に依らず、様式 04 の変更と単位 4 の影響は回帰で確かめていない。t288 は check-g1 を使うため、push の前の全量で確かめる。
- `fetchClosedUnits` などの GitHub の読み出し、新しい workflow は実物で未確認(note に開示済み)。
- `test:template-suite` は流していない(新しい試験ファイルは足していない)。
- IMPL-0954 の残り(集約と /pit の件数)は単位 18。
