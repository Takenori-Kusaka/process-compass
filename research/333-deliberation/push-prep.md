# #333 push の準備(担当の記録。push はしていない)

## 取り込んだ origin/main

- origin/main の 38 コミット(806f06e 以降。#334・B3 の新設・#357・#440 ほか)に `git rebase origin/main` で載せ直した。template は origin/main が進んでおらず、そのまま

## 衝突と解き方

- 衝突は `src/content/docs/community/implementation-ledger.md` だけ(載せ直しの複数のコミットで繰り返し)。origin 側を採り、載せ直しの後に `npm run impl:write`・`evidence:write`・`scope:write` で再生成した(evidence は更新、scope は変更なし)
- 本文の衝突は無い

## 番号の付け直し

- 重複したもの: IMPL-0521(origin の overview.md:687 = #352 の降りていない規定と衝突)、EV-0261(origin の implementation-marking.md ほかと衝突)
- IMPL-0521 → IMPL-0522、EV-0261 → EV-0266 へ #333 の側を付け直した。対象は ADR-0135、gate-criteria.md、ci-gates.md、impl-inventory.yaml(該当 2 行だけ)、impl-untraced.yaml、research/333-deliberation/、template の試験の目印と文書(template は 75a1703 でコミット済み。bundle は E:/Github/process-compass/tmp/bundles/template-b4-333-09.bundle)
- ADR-0135 と SRC-0745〜0747 は重複なし。IMPL-0001・0002 の重複は以前からの複数参照で #333 の変更ではない
- 注意: research に #324 の IMPL-0533〜0572、ほかの作業の 0530〜0532 の予約の記述がある。0522 はそれらと重ならない
- 本体のコミット: 437b3ec(参照は template 75a1703 で、`git ls-tree HEAD template` と `git -C template rev-parse main` が一致)

## 回帰(WSL・node 26.13.1・LF の写し。本体の archive と template の main。template の写しは git init 済み)

- 通常: `npm run check` 終了コード 0、FAIL 0、build 364 ページ
- `TZ=UTC`: 終了コード 0、FAIL 0、build 364 ページ
- 途中、template の写しが git 管理外だった回に test-adoption.mjs の「git ls-files と一致する」が落ちたが、写しの作り方の問題(git init を足して解消)。#333 の変更が原因ではない
- Windows の node の `npm run check` は流していない(CRLF による偽の FAIL のため)

## 議長が打つ push

template を先に、本体を後に。push の前に両方で `git fetch` し、origin/main が進んでいないことを確かめる。
