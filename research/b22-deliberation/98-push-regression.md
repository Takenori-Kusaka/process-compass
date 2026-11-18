# 束 B22 の push の前の回帰の全量(担当の記録。push はしていない。ファイルは直していない)

## 条件
- WSL(Ubuntu-24.04)・node v26.13.1(PATH 明示)。写しは `~/b22-regress/`(ext4)。
- 本体の HEAD は 1411cab84829068a65ed27f508c073653386b0d6。template の HEAD は 795cbb7f89ef1e84dc08ca98a1ffb1539bbb4926(origin/main と同じ)。どちらも `core.autocrlf=false` で bundle から clone した LF の写し。流す前後とも作業ツリーは清潔(`git status` 空)。
- pit-crew は初期化していない。node_modules は `~/b21-regress/node_modules` を複写。
- 通常(TZ 未設定)と `TZ=UTC` を直列に流した(他の束の写しとの同時実行なし)。出力は `~/b22-out-n/`・`~/b22-out-u/`。
- 通常の開始は JST 08:07、UTC の開始は 23:28 UTC(= JST 08:28)。時計依存の時刻帯(深夜・日付またぎ)には当たっていない。

## 流したもの
1. template の試験: `scripts/**/test-*.mjs` と gate-*.yml などの workflow が呼ぶ test-*/check-decisions の和集合 76 本を、template 内で 1 本ずつ実行。
2. `npm run check`(本体。template 初期化済み)。

## 結果
| 検査 | 通常 | TZ=UTC |
|---|---|---|
| template の試験 76 本 | 75 本 exit 0。1 本 exit 2(下記、試験ではない) | 同じ |
| `npm run check`(lint:ci から build まで全連鎖) | **exit 0** | **exit 0** |
| 　うち test:template-suite | 通過 | 通過 |
| 　うち test:regress | 31 行すべて「落ちた 0」 | 同じ |
| 　うち build | 403 ページ | 403 ページ |

check が最後まで通ったので、止まった検査の洗い出し(個別実行)は不要だった。

## 落ちたものと切り分け
- 実際の失敗: **なし**。
- 唯一の exit 2: `scripts/gate/test-results.mjs`。使い方の表示(`--outcome <success|failure|skipped>` が要る)。gate-g5.yml が引数つきで呼ぶ CLI であり、名前が test- で始まるだけで試験ではない(B21 の記録と同じ型)。判定に使わない。(c) 環境・実行の側の注意。
- 実行リストの `scripts/check-decisions.mjs` は MISSING と出たが、実体は `scripts/gate/check-decisions.mjs` で、そちらは別の行で exit 0。リストの作り方の問題で、欠陥ではない。
- 偽の FAIL(CRLF 由来・tpl2 trial・r3 scen の時計依存)は出なかった。切り分け不要。
- (b) origin/main の写しでの確認は、落ちたものがないので行っていない。

## 直しの案
なし(直すべきものがない)。

## 判定
push してよい(WSL・node 26 の条件で、通常・TZ=UTC とも check が exit 0)。

## 確かめていないこと
push 後の CI、Windows での実行、pit-crew を含む検査。

## 後始末
`~/b22-regress`・`~/b22-out-n`・`~/b22-out-u`・`~/b22-run.sh` は残している。
