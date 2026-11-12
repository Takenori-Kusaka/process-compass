# #357 push の準備(担当の記録。push はしていない)

## 状態

- template: `wip-357` = 85ae3d2。pit-in-template の origin/main(7424b49)の直接の上にある(載せ直しは不要。差は 6 コミット)。bundle は作り直した
- 本体: main を a07cfe9 の上へ載せ直し、fast-forward で取り込んだ。origin/main より 8 コミット先行。`template` の参照は 85ae3d2(`git submodule status` で確認)
- 本体の載せ直しで衝突は無かった

## 回帰の全量(WSL・node 26・LF の写し。通常と TZ=UTC)

- `npm run check`: 通常は 2 回の修正後に残りが通る。TZ=UTC は exit 0(358 ページ build まで)
- 初回の失敗は 3 件。いずれも #357 が原因で、最小の直しをコミットした
  1. `lint:provisions`: assurance-case.md:285 の「検出できない」(規定の文末)。「検出する手段がありません」へ(0785531)
  2. `test:regress` の scenarios 4 場面: 承認権限の一時制限の発動に、構造化した `restriction` の記録を要する入力へ変わった。場面の入力を直した
  3. `test:regress` の scenarios 2 場面・self-decision 4 場面: 外部の確認者を独立レビュアの席に置く条件(ADR-0127 決定2・3)として、力量の確認の記録 `reviewCompetence` と書面の合意の所在 `agreement` を要する。場面の入力を直した(f87ca22)
- 直した後、scenarios(186 場面)と self-decision(131 場面)は落ちた場面 0
- 通常の `npm run check` の全量は、直した後に regress の 2 本だけ再実行した(ほかは直す前の全量で通過)
- 作業上の注意: Windows の `git archive` は core.autocrlf=true で CRLF を出す。LF の写しは `git -c core.autocrlf=false archive` で作る。CRLF のままだと test-g5-aggregate と test-discouraged-evidence が偽の FAIL になる(origin/main でも落ちる)。時計依存の偽の FAIL は出なかった

## 議長が打つ push

template の push を先に、本体を後に打つ。

```
git -C E:\Github\process-compass\template push origin wip-357:main
git -C E:\Github\process-compass push
```

push の前に `git fetch`(両方)で、origin/main が先へ進んでいないことを確かめる。進んでいたら、載せ直してから回帰を再実行する。
