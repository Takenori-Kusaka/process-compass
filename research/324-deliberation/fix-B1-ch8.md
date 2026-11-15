# 束 B 独立の突合 1巡目の直し: 第8章 tailoring-guide(Issue #324)

2026-11-15。裁定は `ruling-B1.md`、所見は `crosscheck-B1.md` の B8-01〜24。条文は変えていない。template/ は読むだけ。

## 1. 所見ごとの直し

| 所見 | 直し | 所在 |
| --- | --- | --- |
| B8-01 | IMPL-0735 を `delivered` に(`deciderProblems`・`nameProblems`) | tailoring-guide.md |
| B8-02 | IMPL-0746 を `delivered` に(`detectUnmet`) | 同 |
| B8-03 | IMPL-0742 を `delivered` に(G-6.md の行・CLAUDE.md)。「人の確認を減らさず合否条件に入れない」は G-6.md に文が無いので **IMPL-0835**(undelivered, gate-skill-g6)へ分けた | 同 |
| B8-04 | IMPL-0773 を `delivered` に、降ろし先 `config-seats`(`SEAT_CEILING`・`modeCeiling`) | 同 |
| B8-05 | IMPL-0741 を規模の条件だけ `delivered`(`classifyDelegation`)。種別の属性は **IMPL-0840**(undelivered) | 同 |
| B8-06 | IMPL-0744 を即時停止だけ `delivered`。緊急修正の除外は **IMPL-0841**(undelivered) | 同 |
| B8-07 | IMPL-0748 からトレーサビリティを外し **IMPL-0839**(規制業。profile-generator, undelivered)へ。IMPL-0760 の「PROCESS-PROFILE.md に出す」を削除 | 同 |
| B8-08 | 第3章の側で閉じ済み(申し送りどおり 0733 は触らない) | - |
| B8-09 | 「事後監査の手続」を `marked`(ids: **IMPL-0842** 2期連続の停止, undelivered)に。`location` は 5.5.4 と G-6「委任の変更は判定の時点を事後へ移す」。抽出の対象を当事者に選ばせない規則は、H.3 と同じ制度設計の事項として inventory の note に理由を書いた(マークは置かない) | impl-inventory.yaml、tailoring-guide.md |
| B8-10 | 「極小規模での事後監査への切替」の `location` を 5.5.4・B-4(IMPL-0823)・5.5.4 の登録の節(IMPL-0035)に改め、IMPL-0291 の言及を外した | impl-inventory.yaml |
| B8-11 | 「委任・標準変更・L3…」に B-4 を足し、reason に表の行ごとの追い先(IMPL-0823・0664・0035・0284〜0291)を書いた | 同 |
| B8-12 | 「調整は宣言を伴う」の要求事項1〜3 を `elsewhere` に(1 → IMPL-0737・0028、2 → IMPL-0772・0737、3 → IMPL-0006・0737)。節 note の切れた文を直し、`issue` を閉じた #313 から 324 へ | 同 |
| B8-13 | 契機に数えないもの(IMPL-0053・0706・0826〜0828)、外部の確認者(IMPL-0011)、本軸が動かすもの(IMPL-0222〜0225・0143)、軸D(7.7.9 の IMPL-0364〜0366・0376、IMPL-0383、0751・0752)の note と `location` に番号を書いた | 同 |
| B8-14 | **IMPL-0843**(`evidence-aggregation`・delivered。未達の表が代償措置と別の欄を持つ)を足した | tailoring-guide.md |
| B8-15 | IMPL-0749 を分けた。0749(AI 単独不可・claude-md-resident)、**0836**(規制要件の自動チェック・g5-adapter)、**0837**(規制当局向けエビデンス・evidence-aggregation)、**0838**(限定的な抜き取り確認・gate-skill)。すべて undelivered。予定の降ろし先は足していない | 同 |
| B8-16 | IMPL-0745 の降ろし先を `gate-skill` に。G-1.md・SG.md に条件が無いことを note に | 同 |
| B8-17 | IMPL-0756 を `delivered` に(様式 08 第9項の欄と「監視によって…採りません」の文)。**この読みは議長の確認を要する**(§3) | 同 |
| B8-18 | 軸A の節の note と `location` に、兼務の表(3.5)・IMPL-0746・0344・0030・0843 を足した | impl-inventory.yaml |
| B8-19 | IMPL-0762・0765 の降ろし先を `autonomy-derivation` に。所在を `scripts/gate/autonomy.mjs` の `capFromAnswers` に | tailoring-guide.md |
| B8-20 | IMPL-0768 の「確かめる者」を計画の Issue の担当者に揃えた | 同 |
| B8-22 | 「委託の体制の人数と、軸A との組み合わせ」の `location` に軸D を足した | impl-inventory.yaml |
| B8-23 | IMPL-0771 の note に、構成へゲートを足す経路が無いことを書いた | tailoring-guide.md |
| B8-24 | IMPL-0759 の note の範囲を「最も高い区分の一致の照合」に絞った | 同 |

## 2. 申し送り(第5章 IMPL-0600 との揃え)

template の実物を開いた。`scripts/init/generate-profile.mjs` が残作業に「抜き取り待ちの委任の変更を…協働の手続で全件確認し直す」を出し、`kinds/axis.md`・`reference/apply.md` も同じ文を持つ。実施は人が行う。これは IMPL-0724(第3章。delivered)と同じ規定の同じ事実なので、IMPL-0600(human-ai-boundary.md)を `delivered` に揃えた。IMPL-0724 の note に残る「向きの揃えは議長の裁定」は第3章の範囲なので触っていない(古い文言になった。次に第3章を触る担当が消す)。

## 3. 議長の確認を要する点・直さなかった点

- **IMPL-0756(B8-17)**: 欄で足りるという読みで `delivered` にした。足りないという読みなら undelivered に戻す(降ろし先はそのまま)
- **B8-21**(IMPL-0343 の note へ3つの文): 第6章の担当の範囲なので触っていない
- **B8-13 の残り**: 実測の裏づけなしの固定を事業決裁者が記名で受容する文と、知財潔白性の要求を AI の利用に限って課さない文は、追うマークを新設できなかった(軸D の inventory の note に未解決として開示した)。2.10.8 の経路も確かめていない
- **B8-12 の一部**: 要求事項1 の「導出の所在」は IMPL-0028・0737 に寄せた。導出そのものを照らすマークは置いていない
- **CL2 の自律レベルの上限**(第8章 軸E の表は L2、附属書F F.3 の追加要求1 は L1 固定): 条文は変えず、IMPL-0762 の note も変えていない。事実の確認(2つの「L」が同じ尺度か)は、本担当では本文を読み直していない。crosscheck-B1.md の記述(F.3 は L1 固定、第8章の表は CL2 を L2、規則データ `r-e-cl2` の注記は L2 上限)を、議長が既存の open の Issue へ寄せる際の事実として使える。AI 自律レベル(L1〜L3)と審査の担保水準(L0〜L2)の記号の衝突(#347)による見かけの食い違いかは未確認

## 4. 採番・降ろし先

- 新しい番号: IMPL-0835〜0843(0834 の次。0677 は欠番のまま)。`issue=324`(open)
- 足した降ろし先: なし。付け替えは既存の `config-seats`・`gate-skill`・`claude-md-resident`・`g5-adapter`・`evidence-aggregation`・`autonomy-derivation`

## 5. 検査(終了コード)

- `npm run impl:write`: 0
- `npm run lint:impl`: 0
- `npm run test:impl`: 0(56件合格)
- `npm run lint:refs`: 0
- `npx textlint`(tailoring-guide.md・human-ai-boundary.md): 0
- 回帰の全量は流していない
