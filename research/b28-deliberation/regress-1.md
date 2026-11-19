---
title: b28 回帰の全量 1
---

## 条件
- 本体 24e2b486(bundle `main-b28-02.bundle`)、template d455cb2(bundle `template-b28-01.bundle`)。
- WSL(Ubuntu-24.04)の Linux 側 `~/regress-b28`。node v26.13.1。origin を `core.autocrlf=false` で clone し、bundle から取り込んでチェックアウト。pit-crew は未初期化、template と zenn は初期化。`npm ci` は終了 0。
- 直列で流した(通常 → TZ=UTC)。

## 結果
| 条件 | `npm run check` 終了コード | `ok` 行の数 | 落ち |
|---|---|---|---|
| 通常 | 0 | 449 | 0 |
| TZ=UTC | 0 | 449 | 0 |

- build は 403 ページ、内部リンクはすべて有効。
- `ok` 行の数は出力の行頭 `ok ` を数えたもの。b26 の記録(291 本)とは数え方が異なり、単純比較しない。
- 時計・CRLF 由来の偽の落ちは出なかった。直したものは無い。

## 写し
両方が終了 0 のため削除する。
