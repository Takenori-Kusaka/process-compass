# #355 束3 push の準備(担当の記録。push はしていない)

## 載せ直し

- `git fetch` の後 `git rebase origin/main`。origin/main の 1 コミット(知識グラフの自動更新)に載せ直した。衝突なし
- 本体の先頭: 8183368(`chore(#355): template の参照を進める(束3)`)。その前は fb8f4b1(載せ直し後の 2巡目の直し)
- template の先頭: 1e12ad2(ブランチ b6-355-b3。origin/main から 3 コミット先。未 push)。`git ls-tree HEAD template` と一致
- `src/data/tailoring/`・`src/lib/tailoring-engine.mjs` は origin/main と差なし。`template:kb` は不要

## 番号の確認(origin/main の最大)

- IMPL-0522、EV-0266、ADR-0135、SRC-0747。こちらの新設は IMPL-0523・0524、EV-0267〜0269、ADR-0136。重なりなし。付け直しなし

## 回帰(WSL・node 26.13.1・LF の写し。`npm ci` 後。template の全量は check 内の test:template-suite と test:template)

| 条件 | 終了コード | ok | FAIL/NG | build |
|---|---|---|---|---|
| 本体 `npm run check` 通常 | 0 | 227 | 0 | 365 ページ |
| 本体 `TZ=UTC npm run check` | 0 | 227 | 0 | 365 ページ |
| template の全量 通常(check 内) | 0 | 全通過 | 0 | - |
| template の全量 TZ=UTC(check 内) | 0 | 全通過 | 0 | - |

- test-adoption は 2 回とも通過。基線の落ち方の照合は要らなかった
- 時計に依る試験の偽の FAIL は出なかった

## 失敗の切り分け

- 1回目の写しで test-discouraged-evidence と test-g5-aggregate が落ちた(通常・UTC とも)。原因は写しの作り方。`git archive` を既定の設定(core.autocrlf=true)で作った写しに CRLF が混ざっていた疑い。`git -c core.autocrlf=false archive` で作り直した写し(`grep -P "\r"` で 0 件を確認)では 2 本とも通過し、全量も 0。コード・本文は変えていない
- 手本(333)の記録の「LF の写し」には、archive に `-c core.autocrlf=false` を付ける手順が無かった。次回は付ける

## 確かめていないこと

- Windows の node での全量(CRLF による偽の FAIL のため流さない)
- 1回目の写しの CRLF の混入は、落ちた後に作り直して解消を見ただけで、原因の行までは追っていない
- push 後の CI(ホスティング側)の結果

## 議長が打つ push

template を先に、本体を後に。push の前に両方で `git fetch` し、origin/main が進んでいないことを確かめる。WSL の写しは消した。
