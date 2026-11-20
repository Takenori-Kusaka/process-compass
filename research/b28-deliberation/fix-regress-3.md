---
title: b28 回帰の落ち(2回目)の直しへの突合の所見の直し(3回目)
---

## 裁定
`ruling-regress-fix.md` の表のとおり。H-1・M-1 はカバレッジの下限(`ci.coverageThreshold`)と同じ扱いに揃えた。

## 直し(template)
- `scripts/init/generate-profile.mjs`
  - 構成の差分に「段 mutation の閾値: 前 → 後」の行を出す(値の比較。数値でない側は「なし」)。変化点の記録は変更ありで残る
  - 緩める向き: 下げる変更と、設定済みの値を外す変更(`push` の前後の値を、未設定 = 最小として比べる)。初めて入れる変更と上げる変更は緩める向きにしない(締める向きの行)。記名は `ci.coverageThreshold` と同じ席(AI維持管理者または D-0 表1 の決定者)
  - PROCESS-PROFILE.md の「CI の設定値」に、値があるときだけ行を足す
- 手引き: `process-init/SKILL.md` 手順6 項7 と `README.md` 項21 に、後から CL3 になる場合・附属書F の適用(D-0 で Q1 を「はい」)の場合も、閾値を入れるまで契約検査が落ちることを足した。README には下げる向きの記名と、外す経路を置かないことも書いた。`kinds/settings.md` の向きの欄は、実装に合わせて書き換えた(生成器が検出する・初めて入れる/上げるは緩める向きでない・外す経路は置かない)

## カバレッジの下限に揃えた点と揃えなかった点
- 揃えた: 差分の行、変化点の記録、下げる変更の記名要求(緩める向き)、PROCESS-PROFILE.md への出力
- 揃えなかった(足していない): 外す経路。カバレッジの下限には「未設定へ戻す」経路が無く(`"derived"` は導出値へ戻すだけ)、閾値にも置かなかった。`null` は引き続き拒否する。「置かない」と決めたことを `kinds/settings.md` と README に書いた。単位の「%」は付けていない(閾値は 0〜100 の数値で、行の書式は試験が固定する)
- 由来・導出値・代償措置の仕組みはカバレッジの下限だけの仕組みで、閾値には無い(既定値が無いため)

## 足した試験と陰性の確認(`scripts/gate/test-init-g5.mjs`)
生成器の経路(`--answers`・`--change`)だけを通し、構成の JSON を直接書き換えない。
- 「閾値の向き」ブロック(1〜2名の構成。記名を受ける名簿と D-0 を置く。3名の構成では、1名の名簿が兼務禁止に当たって名簿を置けないため): 初めて入れる(60)は記名なしで通り、差分に行が出て「構成の変更なし」と出ず記録が変更ありで残る / 60→5 は記名なしで止まり構成の値を変えない(H-1 の場面) / 記名ありで通り、記録が緩める向き・変更あり・記名の者で残る / 5→70 は記名なしで通り、差分に行が出る / PROCESS-PROFILE.md に出る / 0 は記名つきで残る
- 「閾値の経路」の既存の検査: 60 の差分の行の検査を足し、「閾値を入れると契約検査が閾値の問題で落ちない」は `r.ok` も見るよう直した。0 の検査は、下げる変更になったため記名つきの「閾値の向き」へ移した
- 陰性: 生成器の直しを外した版(`git apply -R`)で 6 件が NG(経路 1・向き 5)。直した版は 208 件すべて通過
- H-1 の場面(60→5)の再実行の結果: 直した版で、記名なしは差分に「段 mutation の閾値: 60 → 5」と緩める向きを出して止まり、構成は 60 のまま。記名ありは通り、記録は `direction: loosen`・変更ありで残る(上の試験)

## 確認の結果
- sweep: WSL の複製(LF。template は e9b963a。node v18.19.1 の非ログインシェル。前回は node v26)で `node scripts/regress/run.mjs --only matrix-sweep.sweep-1`: 193 場面、落ち 0。CL3 の前提の「初めて入れる」は緩める向きでないため、記名を求められず落ちない(確かめた)。sweep-2〜4 は流していない
- Windows 側の run.mjs は、gh の代役を呼べず走らせる前の確認で止まる(環境の制約。直しとは無関係)
- test-init-g5 208 件・test-loosening-decider すべて・test-adapter 140 件・test-adoption 123 件・test-roster-rules 216 件が通過。lint:skills・check-process-rules 通過。textlint 通過。`npm run check` の全量・`graphify update` は流していない

## 本体
- IMPL-0930 の note に、閾値の差分の行・下げる変更の記名・PROCESS-PROFILE.md への出力・外す経路を置かないことを足し、`npm run impl:write` で台帳を再生成した。IMPL-0836・0291 は閾値と関係せず、触っていない
- 触っていない: aggregate-evidence.mjs・config.mjs・check-pr.mjs・autonomy.mjs・org-assurance.mjs・00-d0-governance.md

## 差分の範囲
- template: 2290e55..c433555(e9b963a 生成器と試験、c433555 手引き)。bundle `template-b28-20.bundle`・`template-b28-21.bundle`
- 本体: fdd5c9e4..(この記録を含む先頭)。bundle `main-b28-07.bundle`

## 議長へ返す点
1. `mutation-stage.mjs` など、契約検査が見る側の変更は無い。`check-pr.mjs` の「基準値の変更」の検査(別の束 B30 が触っている)が、閾値の変更を製品のコードと同時に見るかは確かめていない
2. 過去の決定と食い違う fixture は見つからなかった(test-loosening-decider は変更なしで通過)
