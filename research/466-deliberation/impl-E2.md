# 段 D2 の後半(template の手順と様式の文)と段 E2(ADR-0275 と標準の本文)— 実装の結果

- 日付: 2026-11-28。push していない。template のブランチ `d4-466`(D2a の 5 コミットの上に 2 コミット)

## 1. 変えた所

template(bundle: `E:/Github/process-compass/tmp/466-recover/bundles/466-tpl-D2b-2.bundle`、範囲 `7642faa..d4-466`)
- 87740be `.claude/skills/gate/gates/G-6.md` に節「取り込む前に人が読む範囲の外の変更の、出荷の前の確認」。`templates/04-gate-record.md` の「リスク区分を確定した者」へ注記(出荷の前の確認の記録の書き方・範囲の外の R2 の確定者の記名先・取り込みで配備が動く構成では使えない)。ADR 番号・Issue 番号・内部の語なし。新しい欄なし。`scripts/` は触っていない
- 3dae878 `scripts/gate/test-deferred-review.mjs` へ目印コメント(IMPL-1069〜1071 の `:ok`/`:ng`)だけ。挙動は不変(79 件通過)
- 試験: test:fields・test-context-refs・check-context-refs・test-claude-md-resident・test-aggregate-wiring・test-spec-recheck 通過

本体
- ADR-0275 新設(`src/content/docs/adr/0275-medium-change-review-moved-to-before-shipping.md`)
- ADR-0054・0101・0057 の状態の節へ「一部置き換え(→ ADR-0275 の決定 n)」。0057 は RR 3.8.1 要求事項3 の出所(補足の決定 S2)
- gate-criteria: G-6 に節「出荷の前の確認(適用: …)」(表 2 つ・実装マーク 9・EV 4)。確認の範囲と深さの「新しく設けない」箇条、G-7 基準5 の突合(段落と表の 2 行)、項目1・3 の開示の箇条、IMPL-0416 の note(S2 にも及ぶ)
- human-ai-boundary: 5.5.2(協働の行・委任の箇条)・5.7.1
- roles-responsibilities: 3.8.1 要求事項3 の行(範囲の外の R2 は出荷判定まで)・IMPL-0062 の note
- assurance-case: H.4 の例に 1 句(既存の注記は重ねず)・H.11 に 2 行(出荷の前の確認の読まれ方・取り込み=本番の構成と #469)
- tailoring-guide: 人が触る場所の表(凡例に「出荷前」を足し、S2・R2 と S2・R3 の行を分け、導入文を改めた)、軸B の表の後に S2 の G-6 の注(表の升の語は変えず check-stage-table は一致)
- `src/data/impl-inventory.yaml`(G-6 の新しい節の登録)、台帳 3 つは `evidence:write`・`impl:write`・`scope:write` で再生成

## 2. ADR-0275 の決定の箇条

1 出荷の前の確認(案 R)/ 2 取り込む前に人が読む範囲(行 1〜7・9。8 は作らない)/ 3 範囲の外の R2 の区分の確定は出荷判定まで/ 4 累積の差分で読んでよい(組の条件・規模の基準値が未定義なら開かない)/ 5 記録の独立性(ADR-0272 決定8 を引く)/ 6 出荷判定の材料と開示の投影(値なし)/ 7 取り込み=本番の構成では使わない・便益は #469 で審議中/ 8 Delegated トレーラで識別しない/ 9 表の S2 の行の新しい値/ 10 形骸化で止めた委任の戻し先と、委任の規則を登録した構成では使わない/ 11 準拠テンプレートの既定

## 3. マーク

- IMPL-1069 pr-checks delivered machine(範囲の判定と承認の照合)/ IMPL-1070 evidence-aggregation delivered machine(識別・確定者の欠落・投影)/ IMPL-1071 pr-checks delivered machine(配備の構文の検出・使う構成の条件)/ IMPL-1076 gate-skill-g6 delivered manual(手引き・様式の文)
- undelivered scheduled(issue=466 review=2027-04): IMPL-1072 rulesets(承認数 0 と必須の検査の実機。D2a §7 の項目すべて)/ IMPL-1073 pr-checks(形骸化で止めた種類の範囲)/ IMPL-1074 evidence-aggregation(累積の差分の組の判定)
- undelivered adopter(decision=ADR-0275): IMPL-1075(workflows の外の配備)/ IMPL-1077(読んだ中身の質・例外承認の常態化)
- EV(E0): EV-0389(案 R・R' の安全と効果)・0390(区分の確定の移動の残余)・0391(配備の検出の範囲)・0392(範囲 5〜7 の効果)は本文、EV-0393(S2 の「前→出荷前」)は ADR。署名なしの構成の記録の独立性は EV-0388 を引く(新設なし)
- 確認: lint:refs・sources・evidence・impl・scope・tone・citations・provisions・dekimasu・registry・stage-table・ci・figures、test:fields・criteria、detection-values、textlint(変更した md)。`npm run check` の全量は流していない

## 4. 決定と食い違った所・書かなかった所

- 「記出」「出」の記号は本文に使えないので、TG の表と凡例は「出荷前」「記(出荷判定まで)」で書いた。**ruling §15-3 は事故の警告の内訳「出荷の前の確認」を足さないので、本文の事故の警告の節は触れていない**
- 範囲の行 9 は、ruling D13 と §15-4 のとおり、決定と表には書き、実装マーク IMPL-1073 を undelivered にした。「委任の規則を登録した構成ではこの形を使わない」を決定10・本文の表の行に明記
- RR 3.8.1 の決定の出所は ADR-0057 補足の決定 S2 と判断した(`区分の下限の規則を構成に置き、G-5 で照合する。R1・R2 は…確定して記名する`)。IMPL-0062 から辿れる ADR 本文は無く、0057 の S2 の行が一致した。確かでなければ議長が差し替える
- H.4 の注記は、まとまり 1 で足した 1 文に重ねず、例の括弧へ S2 の形を 1 句足しただけ
- GC の旧 1538・1539 の行は、いまは「確認の範囲と深さ」の箇条(「判定の時点を事後へ移す経路を新しく設けない」)に当たると読み、書き換えた。1709・1712 の行は、G-7 基準5 の突合の段落と表の 2 行に当たる(表 1 行目を「委任で…(出荷の前の確認の変更を含めない)」へ、2 行目に出荷の前の確認で記録が対応づかない変更を足した)。1712 の是正の段落の本文自体は変えていない(出荷の前の確認の節の最後の箇条で結んだ)
- 保証の開示の項目1・3 の箇条は G-7 の箇条として足した(項目2 の表の行・配備の検出の限界を併記)
- 累積の差分で読む組の機械の判定(D11)は実装しない(§15-8)。template の `scripts/` は触っていない

## 5. 未確認の点・議長が見る点

- `npm run check` の全量・template の全量・WSL(名義なし環境)での再実行は流していない
- 回帰スイートの S2 の既定の固定: `scripts/regress/suite/*.mjs` を `ruleset === 'team'`・`requiredApprovals === 1`・`requiredApprovals: 1`・`team'` で Grep したが該当なし。S2 を扱う suite は lib-r3.mjs・matrix-sweep.mjs・stages.mjs・v3.mjs。実行して確かめてはいない
- 内部の語を使わない: 本文と手引きに「案R」「事前の範囲」「記出」は無い(ADR の「検討した選択肢」と research の記録には案名がある)。ADR の決定2 の「取り込む前に人が読む範囲」の表は、本文の範囲の表と同じ行番号(1〜7・9)
- scope: 見出しは `適用: 事業ステージ S2・安全重要度 CL0・品質が標準で「高」と規制業を除く・承認者 1 名・取り込みが本番への反映を直接起動しない構成`(括弧の入れ子は台帳の読み取りを壊すので避けた)。`lint:scope` 通過
- 第7章 7.3 の節・附属書H H.6 の保証の開示の本文は、GC の項目1・3 の箇条で足りるとして触っていない

## 6. コミット

- template: 87740be・3dae878(`466-tpl-D2b-1.bundle`・`466-tpl-D2b-2.bundle`。最新の全体は D2b-2)
- 本体: 本ファイルと同じコミット(`docs(adr): …(#466)`)。`template` の参照は add していない
