---
title: b28 回帰の全量 3
---

## 条件
- 本体 80a142d4(bundle `main-b28-08.bundle`)、template b5f406f(bundle `template-b28-22.bundle`)。いずれも bundle が先頭を持つことを確かめた。
- WSL(Ubuntu-24.04)の Linux 側 `~/regress-b28`。既定の node は v22 だったため nvm で切り替え、回帰を流すシェルで v26.13.1 を確かめた(`~/b28r3-node.txt`)。origin を `core.autocrlf=false` で clone し、bundle から取り込んでチェックアウト。pit-crew は未初期化、template と zenn は初期化。`npm ci` は終了 0。
- 直列で流した(通常 → TZ=UTC)。出力は `~/b28r3-normal.txt` と `~/b28r3-utc.txt`。終了コードは `~/b28r3-codes.txt`。

## 結果
| 条件 | `npm run check` の終了コード | `ok` を含む行の数 | build | 落ち |
|---|---|---|---|---|
| 通常 | 0 | 450(行頭が `ok` のものは 157) | 405 ページ、Complete | なし |
| TZ=UTC | 0 | 450(同 157) | 405 ページ、Complete | なし |

- `test:regress`(template 作業ツリー、29 本、並列 8)は両条件とも「すべて通った」。regress-2 で落ちた matrix-sweep も通った。
- `ok` 行の数え方は「`ok ` を含む行」。regress-2 の 449 と同じ数え方なら 1 本増えている。

## 写し
両方が終了 0 のため、WSL の `~/regress-b28` は消した。
