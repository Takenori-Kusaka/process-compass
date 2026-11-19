---
title: B29 単位 X の push の準備(回帰)
---

## 載せ直しと付け直し
- 本体は origin/main(c0e8b164)の上へ rebase 済み。template も origin/main(d455cb2)の上へ rebase 済み(bundle template-b29-x-rebased-01.bundle)。fetch で origin/main が c0e8b164 のままであることを確かめた。
- 本束の IMPL-1033 は IMPL-1035 へ付け直した(c54205e2。束 B28 が IMPL-1033・1034 を使ったため)。research/b27-deliberation/40-impl-356-x.md と 52-fix-x-r1.md に 1 行を記した。
- impl:write・evidence:write・scope:write は差分なし。template:kb の差は生成元の版の自己参照だけ(b28 の先例どおりコミットせず、コミット済みの内容へ戻した)。

## npm run check(Windows)
- 終了 1。落ちは 2 本: scripts/gate/test-g5-aggregate.mjs(CRLF による既知の偽の FAIL)と scripts/gate/test-discouraged-evidence.mjs(Windows の改行・環境由来と見込む。WSL では通る)。他は通過。
- 判定には使わない。回帰の判定は下の WSL(LF)の結果による。

## 回帰の全量(WSL・node v26.13.1・LF の写し、npm ci 終了 0、直列)
| 条件 | 終了コード | ok 行 | FAIL |
|---|---|---|---|
| 通常 | 0 | 449 | 0 |
| TZ=UTC | 0 | 449 | 0 |

- template の試験は npm run check の中で走る(b28 の先例と同じ)。切り分けの要る FAIL は無く、template を直していないので bundle -02 は作っていない。

## 最終
- template 先頭: 45a71621e304cbae9821d00d38a8abd808127776
- 本体の先頭: 本記録のコミット(報告に記す)
- bundle: template-b29-x-rebased-01.bundle(変更なし)
