# #355 束4 の push の準備(B9 の取り込み後。担当の記録。push はしていない)

## 載せ直し

- 枝 `Takenori-Kusaka/b8-b4push`(作業ツリー `E:/Github/orca/workspace/process-compass/b8-b4push`)。d4e4d1a までを origin/main(B9 の 19 コミット、先頭 5d5ccdf)の上へ rebase した
- 衝突: 束4 の「番号を付け直し」のコミット(1895d51)で `evidence-ledger.md` と `implementation-ledger.md` の 2 件。自動生成の台帳なので、upstream 側を採って rebase を続け、最後に `impl:write`・`evidence:write`・`scope:write` で再生成してコミットした。本文の衝突なし
- `src/data/tailoring/` と `src/lib/tailoring-engine.mjs` は origin/main と差なし。`template:kb` は不要
- template の参照は 8839c80(bundle template-b6-355-b4-04.bundle から取得。origin/main 1e12ad2 の 4 先)

## 番号の重なり

- origin/main の B9: IMPL-0983〜0984、EV-0279〜0281、ADR-0140。束4: IMPL-0981、EV-0275〜0277、ADR-0137。重なりなし。付け直しなし(本体で grep して IMPL-0981 は束4 の 7 箇所のみ)

## 回帰(WSL・node v26.13.1・LF の写し・`npm ci` 後)

| 条件 | 終了コード | build |
|---|---|---|
| `npm run check` | 0 | 368 ページ |
| `TZ=UTC npm run check` | 0 | 368 ページ |

## 失敗の切り分け

- 1回目は test-discouraged-evidence と test-g5-aggregate が落ちた。原因は写しの作り方で、Windows の git が `core.autocrlf=true` のため `git archive` が CRLF で出力し、template の表の正規表現が一致しなかった。`git -c core.autocrlf=false archive` で作り直して解消(コード・本文は変えていない)
- 以後 Windows で `git archive` する際は `-c core.autocrlf=false` を付ける

## 確かめていないこと

- Windows の node での全量、push 後の CI

## 議長が打つ push

template を先に(8839c80)、本体を後に。push 前に両方で `git fetch` し、origin/main が進んでいないことを確かめる。
