# 束 B13 の push の準備(担当の記録。push はしていない)

## 載せ直し

- `git fetch` の後 `git rebase origin/main`(origin/main 30c5746b)。B13 の 32 コミットを保ったまま載せた(畳んでいない)
- 衝突は生成物の台帳だけ(`evidence-ledger.md`・`implementation-ledger.md`、複数のコミットで)。各コミットで origin/main 側を取り、最後に再生成して解いた。本文の衝突はなし
- template は B13 で変えていない。参照は origin/main の b5bfc6d のまま。作業ツリーの template が旧い 2f80544 だったので、検査のため b5bfc6d(2f80544 の子孫)へ checkout しただけ

## 番号の付け直し

origin/main の最大: EV-0312、IMPL-1012、SRC-0764、ADR-0165。

| 種別 | 旧 | 新 |
| --- | --- | --- |
| EV | EV-0312〜0318 | EV-0313〜0319(+1。EV-0312 は B12 の ADR-0165 が使用) |
| IMPL | IMPL-1013〜1019 | 変更なし(重ならない) |
| SRC | SRC-0765 | 変更なし(重ならない) |
| ADR | 0170〜0173・0175 | 変更なし(origin/main の最大は 0165。重ならない) |

- 置換は B13 が触った 98 ファイルのうち台帳・graphify-out を除く 25 ファイル(本文・ADR・research の記録)。B12 の記録(ADR-0165・`research/354-deliberation/`)の EV-0312 は触っていない
- 略記(「EV-0312・0313」)を 1 箇所直した(`research/340-deliberation/implementation.md`)
- 台帳は `evidence:write`・`impl:write`・`scope:write`・`sources:index` と `graphify update .` で再生成

## 検査

- Windows `npm run check`: lint 群・sources・citations・registry・engine・impl・template ほか前段はすべて通過。`test:template-suite` で `test-discouraged-evidence`・`test-g5-aggregate` が落ち、そこで止まった(後段の regress・build は未実行)。両方とも前例のとおり Windows の CRLF による偽の FAIL と見て判定に使わない。全量は WSL で確かめた(下記)

## 回帰(WSL・node 26.13.1・LF の写し〔`git -c core.autocrlf=false archive`〕。`npm ci` 後。順に流した)

| 条件 | 終了コード | ok の行 | FAIL/NG |
|---|---|---|---|
| `npm run check` 通常(template の全量・regress・build を含む) | 0 | 177 | 0 |
| `TZ=UTC npm run check` | 0 | 177 | 0 |

- 時計依存の偽の FAIL は出なかった。Windows で落ちた 2 本(`test-discouraged-evidence`・`test-g5-aggregate`)も WSL では通過した(CRLF の偽の FAIL と整合)
- 確かめていないこと: push 後の CI。Windows での regress・build
- 議長が打つ push: template の変更は無い(本体のみ)。push の前に `git fetch` で origin/main が進んでいないか確かめる。WSL の写し(`~/b13w`)は後始末済み
