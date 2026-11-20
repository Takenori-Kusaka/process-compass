---
title: b28 回帰の落ち(2回目)の直し
---

## 裁定
議長は regress-2-diagnosis.md の選択肢1(生成器に降ろす)を採った。採らないのは、CL3 に既定値を書く案・契約検査から CL3 の閾値を外す案・sweep の期待を「契約×」へ改める案(ADR-0224 決定6 に反する)。

## 直し
- `template/scripts/init/generate-profile.mjs`
  - 種別 settings の `ci.mutationThreshold` を検証する(0〜100 の有限の数値だけ。文字列・範囲の外・null は拒否。coverageThreshold の検証と同じ位置・形)
  - 構成の `ci` へ保存する。再生成(構成からの `--answers`・別の値の settings)でも保つ。値が無いときは書かない(既定値なし)。0 は有効な値として残る
- `scripts/regress/suite/matrix-sweep.mjs`: CL3 の場面の前提に、初期化の直後に種別 settings で閾値(60)を入れる手順を足した(拒否される初期化の後の 3 名の経路も同じ)。期待値(観測の「契約○」)は変えていない。入れられないときは failures に出す
- 手引き(条文は変えない)
  - `template/.claude/skills/process-init/SKILL.md` 手順 6: CL3 は初期化の直後に契約検査が落ちること、入れ方(G-1 で値を定め、`/process-change` の settings)を伝える項を足した(附属書F の適用も同じ)
  - `template/README.md` 移行の注意 項21 の閾値の項: 書く経路の条件と、初期化の直後の CL3 が落ちることを足した
- 実装マーク IMPL-0930 の note(`src/content/docs/phase4-process-design/safety-verification.md`)に、生成器が閾値を受けて保つことと確かめる試験を足し、`npm run impl:write` で台帳を再生成した

## 足した試験と陰性の確認
`template/scripts/gate/test-init-g5.mjs` に「閾値の経路」の 12 検査(生成器の経路だけ。JSON の直接書き換えなし): 値が無いとき書かない / 初期化の直後の CL3 は契約検査が落ちる / 文字列・101・-1・null を拒否して書かない / 60 が通り構成に残る / 入れると閾値の問題で契約検査が落ちない / 別の settings で消えない / 構成からの再生成で消えない / 0 が残る。
- 陰性: 生成器の直しを外した版(`git apply -R`)で、閾値の経路の 12 検査のうち 9 件が NG になることを確かめた(拒否 4・保存・契約・別の settings で保持・再生成で保持・0)。初期化・未設定で書かない・初期化の直後に落ちる、の 3 件は直す前から通る前提の検査。直した版で全件通る(200 件)

## 確認の結果
- sweep: WSL(node v26.13.1)で `node scripts/regress/run.mjs --only matrix-sweep.sweep-1`: 193 場面、落ち 0(直す前は 48 場面が落ちた)。sweep-2〜4 は同じコードで、流していない
- test-init-g5 200 件・test-adapter 140 件・test-adoption 123 件・test-roster-rules 216 件・test-loosening-decider(触らない)すべて通過。check-process-rules 通過、lint:skills 通過
- 回帰の全量 `npm run check` は流していない(議長の指示)

## 差分の範囲
- template: e15221a..2290e55(620a9e0 生成器と試験、2290e55 手引き)。bundle `template-b28-19.bundle`
- 本体: 5ae253fa..(この記録を含む先頭)。bundle `main-b28-06.bundle`

## 議長へ返す点
1. `kinds/settings.md` は「`ci.mutationThreshold` を下げるのは緩める向き」と書くが、生成器の緩める向きの検出(`generate-profile.mjs` の構成の差分)は閾値を見ていない。下げる・外す変更に記名を要しない。直すと新しい義務(記名)を課すため、今回は触らなかった(要審議)
2. 閾値(CL3)の未設定は、初期化の出力に警告として出していない。手引き(process-init の伝達項)だけに頼る。出力へ出す案は未実施
3. sweep-2〜4 を流す要否
