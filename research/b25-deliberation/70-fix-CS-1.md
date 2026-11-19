# 束 B25 — 単位 C・S の突合 1巡目の所見の直し(2026-11-19)

template のコミット(先頭 197f7b4 の上): C の直し `51be64e`、S の直し `5a1c987`。bundle は `tmp/bundles/template-b25-CSfix-01.bundle`(2コミットを含む。コミット後に1回だけ作った)。README 14・15 節の編集は両単位にまたがる(hunk を分けられず)ため C のコミットに入れた。

試験(WSL node 26、HEAD の archive に直したファイルを重ねた写し): test-adoption 80 / test-init-g5 182 / test-model-adoption 41 / test-performer-account 72 / test-check-pr 270 場面 / test-recalibration 17 / test-roster-conditions 61 / test-roster-rules 216。すべて期待と一致。本体: `lint:impl` exit 0、textlint 違反なし。

## H-1(0772)— 形: 基底との比較

未適用の厳格化の検出(`pendingTightenings`)は、ゲートごとに差を出せる。ただし条件(構成の状態が導出より弱い)が 0772 と同一で、宣言の無い弱めと知識ベースの更新による差を、構成の状態だけでは分けられない。裁定の「注意にとどめる」の形をそのまま採ると、0772 が常に注意となり検査が死ぬ。そこで構成へ欄を足さず、次の決定可能な条件で分けた。

- 弱めた状態が `pendingTightenings` の挙げるゲートで、かつ基底ブランチの構成の状態から弱めていない → 失敗にせず注記(未適用の厳格化として `/pit`・集約が表示し続ける)
- 基底の状態より弱めた変更(宣言なし) → 失敗
- 基底を読めない実行(`--base` なし・main への push) → 注記。PR の契約検査(`GITHUB_BASE_REF`)で失敗にする
- 実行時の文言は分けた。注記は「基底の状態から弱めた変更ではないため、未適用の厳格化として表示にとどめる」。失敗は「この変更が基底の状態から弱めています」。未達の宣言は「state を unmet にして unmet[] に理由」と書く(L-3)

所在: `template/scripts/gate/verify-gate-contract.mjs`(`baseConfigRead` と 0772 の節)。試験(test-adoption): 基底から simplified・omitted へ弱めた変更は失敗(2)・文言(1)、deviations あり・導出どおり・強い向き(L-1: 導出 simplified・構成 required)は通る、基底と同じ状態の差は失敗せず注記(1)、基底なしは注記(1)、未適用の厳格化(g2)と弱め(g3)が同居すると g3 だけ失敗(1)。

外して落ちる確認: 「注記へ寄せる分岐」を外すと注記側の4件が落ちる。「基底より弱めた判定」を外すと失敗側の4件が落ちる。

採らなかった案: 知識ベースの識別を構成へ記録する案(裁定どおり)。限界(開示): 基底に既に入った宣言の無い弱めは、以後の PR では注記となる(基底に入った時点の PR が止める設計)。

## 他の所見

| 所見 | 直した所在 | 試験・外した確認 |
| --- | --- | --- |
| 高-2 | `overview.md` 711 行を、D-0 節12 の表が受ける旨(IMPL-1030)へ改めた | textlint・lint:impl |
| 高-3 | `roles-responsibilities.md` IMPL-0976 の note を、「移す」「外す」の両方、0980 を参照する形へ。台帳を再生成 | lint:impl |
| M-1 | `template/README.md` 15 節の冒頭に、0636・1030 による生成の変更と 0651 の再生成までの失敗、再生成の手順を1か所で書いた | なし(文) |
| M-2・L-8 | `check-process-rules.mjs` を `chainStarted` で分岐(連鎖なしは注意)。0651 の note に限定を追記 | test-init-g5 に旧い構成の ok(1名・3名)。分岐を外すと2件が落ちる |
| M-3 | `00-d0-governance.md` 節12 の (2) に除外と名簿のアカウントの扱い(ADR-0225 決定5)を追記 | test-performer-account に文の存在の固定1件。文を変えると落ちる |
| M-4 | IMPL-0643 の note に「表示だけで止めない」を開示。止める向きは採らず、再検討の契機を併記 | なし(note) |
| L-1 | 上記の強い向きの ok | test-adoption |
| L-2・L-3 | README 14 節を note と揃え(merged-into を書く、未達の書き方) | なし(文) |
| L-4 | README 14 節に 0709 の `answers.json` 名拾いと rename の扱いを開示 | なし(文) |
| L-5 | `org-assurance.mjs` の 0643 の照合を導入の記録の側(空白だけ除く)へ | test-model-adoption に括弧違いの ng 1件。`normKey` に戻すと落ちる |
| L-6 | 直さない(裁定: G-6 の先例と同じ慣例のまま) | - |
| L-7 | `process-change/reference/input.md` の `competence` に 3.4.1 の任意の用法を追記 | なし(文) |

0772 の note(tailoring-guide.md)は、基底との比較と注記の扱い、基底なしの実行の扱いを書いた。

## 作れなかった点

なし。残り: 直した差分の独立の突合(2巡目)。bundle の `-02` は作っていない(コミット後に1回だけ作成したため `-01` が両コミットを含む)。
