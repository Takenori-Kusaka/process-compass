---
title: b28 回帰の全量 2
---

## 条件
- 本体 0e9476e8(bundle `main-b28-04.bundle`)、template e15221a(bundle `template-b28-16.bundle`)。いずれも bundle が先頭を持つことを確かめた。
- WSL(Ubuntu-24.04)の Linux 側 `~/regress-b28`。node v26.13.1。origin を `core.autocrlf=false` で clone し、bundle から取り込んでチェックアウト。pit-crew は未初期化、template と zenn は初期化。`npm ci` は終了 0。
- 直列で流した(通常 → TZ=UTC)。出力は `~/b28r2-normal.txt` と `~/b28r2-utc.txt`。

## 結果
| 条件 | `npm run check` | `ok` 行の数 | 落ち |
|---|---|---|---|
| 通常 | 失敗(`test:regress` の `regress: 失敗`。記録用の終了コードの行は、実行の補助 script が `set -e` で中断して書けていない) | 449 | matrix-sweep 4 本 |
| TZ=UTC | 同じ出力で `regress: 失敗`。ただし補助 script の `EXIT $?` は 0 と記録(出力と食い違う。出力の失敗の表示を採る) | 449 | matrix-sweep 4 本 |

- 落ちたのは `test:regress` の `matrix-sweep.sweep-1`〜`sweep-4`。各 193 場面のうち 48 場面が落ちる(計 192)。他の runs は落ち 0。
- 通常と TZ=UTC で落ちる場面の数は同じ(各 48)。`regress:` の後ろの `npm run build` には到達していない(`ok` 行 449 は build の前までの数)。

## 落ちの内容
- 落ちた場面は `size-1-2 <段階> <品質> cl3 <inhouse|vendor> reviewer-no node` の型。cl0〜cl2 は通る。先頭の例は `size-1-2 poc quality-standard cl3 inhouse reviewer-no node`。
- 期待は「向き - 契約○」、観測は「向き - 契約×」。それ以外の項目(初期化・記入・変化点・出荷)は期待と一致。
- 観測の出力の要点:
  - `独立が成立しない: 開発者(検証者) × 独立レビュア(山田 太郎)`(同一人物のため独立が成立しない組 1 件)
  - `[エラー] 統制を緩める向きの変更を含みます。決定した者の記名(decidedBy)と理由(reason)が要ります。…AI が決めてはなりません`
- 出力の所在(WSL): `/tmp/pit-regress-aFfG8B/out/matrix-sweep.sweep-1.log`(通常)、`/tmp/pit-regress-qfJmJt/out/`(UTC)。

## 見立て(直していない)
- 時計・CRLF・順序由来の偽の落ちではないとみる。理由は、通常と UTC で同数・同型であること、場面の型が cl3 と reviewer-no に限られること、観測が規則の文言に沿った決定的な出力であること。
- regress-1(本体 24e2b486)では 449 本・落ち 0 だった。それ以降(束 U5 の載せ直しなど)で、cl3 かつ独立レビューなしの場面の「契約」の向きが変わった可能性が高い。期待値(suite の fixture)の側が古いか、規則の側が変わったかは未判定。
- 次に見るもの: `scripts/regress/` の matrix-sweep の期待の生成と、cl3 の独立レビューなしの扱いを変えた直近のコミット。

## 写し
落ちがあるため残す。`~/regress-b28`(WSL Ubuntu-24.04)。
