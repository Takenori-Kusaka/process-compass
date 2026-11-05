# 独立の突き合わせ(#374 の実装)

対象: 本体 efa58c5、テンプレート cc27644。照らした基準: 裁定 `decision.md`、議題 `council-00-agenda.md`、第8章・第1章 1.7.3・G-7、ADR-0028・0063・0065・0088・0089。`implementation.md` と実装した側の説明は、判断を終えるまで読んでいない。

検証用のスクリプトはスクラッチパッドに置いた(リポジトリへは書いていない)。`probe.mjs`(エンジンの出力)、`break.mjs`(升の突合の検査を壊した入力で試す)、`aggdiff.mjs`(新旧のテンプレートで集約の出力を比べる)、`axisd.mjs`(軸C・軸E 以外の軸が升を動かすか)。

## 1. 裁定 R-1〜R-4 の実装の漏れ・過不足

| 裁定 | 実装の所在 | 判定 |
| --- | --- | --- |
| R-1 CL0 × S1 の G-7 を適用 | tailoring-guide.md:470、rules-business-phase.yaml(r-b-mvp の simplify を削除) | 実装済み |
| R-1 S1 の軽さの所在(基準2・基準3・G-6 の範囲・記録突合に限る) | tailoring-guide.md の S1 の段落と箇条、gate-criteria.md:1237 | 実装済み |
| R-1 項目2 に G-6 の範囲の限定 | gate-criteria.md:1377、aggregate-evidence.mjs:3284 | 実装済み(実装マークは無い。指摘 X-2) |
| R-1 集約の出力の不変を実行で確認 | 下記 4 で独立に再確認 | 確認した |
| R-1 EV-0230(見直し 2027-05) | tailoring-guide.md:494 | 実装済み。書式は EV-0101 と同じ形 |
| R-1 採らない案 | ADR-0112「採らなかった案」、第8章「S1 の G-7 を簡略にしないことは、決めた事項です」 | 実装済み |
| R-2 軸の間の優先を表の直下へ | tailoring-guide.md:475 | 実装済み |
| R-2 緩める升の括弧に上書きの条件 | tailoring-guide.md:469・470(S0 の G-6・G-7 に品質「高」以上) | 実装済み。エンジンの出力と一致(下記 3) |
| R-2 升とエンジンの出力の突合の検査 | scripts/check-stage-table.mjs、scripts/lib/stage-table.mjs、IMPL-0447 | 実装済み。範囲の限定の書き落としを捉えない(指摘 X-1) |
| R-2 全升の試験を品質の3種へ | test-tailoring-engine.mjs の QUALITIES | 実装済み |
| R-2 r-c-high・r-c-regulated の restore と試験での固定 | rules-quality.yaml、test-tailoring-engine.mjs の noQualityRestore の対 | 実装済み |
| R-3 1.7.3 の定義 | overview.md:362 | 裁定の文言どおり |
| R-3 中身の無い簡略を検査で止める | check-provisions.mjs の検査3、stage-table.mjs の emptySimplified | 実装済み(表記の揺れに弱い。指摘 X-4) |
| R-3 採らない(語の廃止・禁止事項) | ADR-0112 の表 | 実装済み |
| R-4 ADR-0112 新設、ADR-0088 の状態の節へ追記 | ADR-0112、ADR-0088:44 | 実装済み |
| R-4 :367・:424 | 下記 6 | 裁定どおり |
| R-4 旧い構成を未適用の厳格化として表示(blocking でない) | aggregate-evidence.mjs:3286、test-roster-rules.mjs、test-tailoring-declaration.mjs | 実装済み。規定の文は G-7 に限らず一般化している(指摘 X-3) |
| R-4 IMPL-0345 の注記、IMPL-0447 | tailoring-guide.md:519・477 | 実装済み |
| R-4 副次の所見の確認と後継の Issue | ADR-0112 決定4・「影響」、Issue #435 | 確かめて送った。ADR が #435 を引かない(指摘 X-6) |

裁定に無い追加: 道具の頁(knowledge-base-schema.md・proposal-logic.md)の restore の例の差し替え、1.7.4 の検査の列挙、provision-forms.md の検査3 の記述。いずれも R-1・R-3 の帰結であり、新しい規範ではない。gate-criteria.md:1378 の一般化だけが、裁定の範囲を少し越える(X-3)。

## 2. matrix-sweep の「逸脱 g7」の正否

結論: **正しい帰結である**。restore の副作用による誤りではない。旧い期待値のほうが、判定者の方式を失う不具合を固定していた。

実行: `node scratchpad/probe.mjs E:/Github/process-compass`(現行の規則)と、efa58c5~1 の規則データを取り出して同じスクリプトで比べた。

| 構成(CL0) | 旧い規則の G-7 | 新しい規則の G-7 |
| --- | --- | --- |
| 1〜2名・reviewer-no・S0・品質「高」 | strengthen、params `{}` | strengthen、`approverMode: value-owner-merged` |
| 1〜2名・reviewer-no・S1・品質「高」 | strengthen、`value-owner-merged` | 同じ |
| 1〜2名・reviewer-no・S2・品質「高」 | strengthen、`value-owner-merged` | 同じ |
| 3〜9名・S0・品質「高」・規制業 | strengthen、params `{}` | strengthen、`approverMode: named-concurrent` |

- 品質「高」の S0 では G-7 が適用(strengthen)になる。旧い規則では、省略が無効化した判定者の方式が戻らず、適用の G-7 に判定者が決まっていなかった。議題の事実と一致する
- 1〜2名で判定者の方式が `value-owner-merged`(価値責任者の兼務)に戻ると、兼務が逸脱 g7 として記録される。同じ 1〜2名・品質「高」の S1・S2 の行は、改める前から「逸脱 g7」だった(matrix-sweep.json:126・150 ほか)。S0 だけが逸脱を出さなかったのは、判定者の方式が失われていたためである
- 「承認者を満たせない」のではなく、兼務の逸脱である。未達(g6)は変わらない
- changed の書式: 8行とも `{ by: "ADR-0112 決定2", on: "2026-11-05", from: <旧い期待値> }`。ADR-0089 決定3(決定の識別子・日付・旧い期待値)を満たす。`npm run lint:refs` の「changed の by は決定を含む」も通過
- 限界: `npm run test:regress` は、この Windows の環境では gh の代役を呼べず、走らせる前の確認で止まった(`gh --regress-probe`)。efa58c5 は未 push のため CI の結果も無い。sweep の期待値そのものは、エンジンの出力と既存の S1・S2 の行との整合で確かめた

## 3. 升の突合の検査・中身の無い簡略の検査

実行: `npm run lint:stage-table` は「8 行 × 4 ステージ … で一致」。`npm run lint:provisions`・`test:engine`・`lint:ci`・`test:ci-wiring` も通過。`package.json` の `check` に `lint:stage-table` が `test:engine` の後に入っている。`lint:ci` は ci.yml が `npm run check` を合否に使うことを確かめる形であり、個々の lint の結線は `check` の連結で足りる。

壊した入力(`node scratchpad/break.mjs`):

| 入力 | 結果 |
| --- | --- |
| S1 の G-7 を「簡略(記録を減らす)」(限定はあるが、エンジンは適用) | 検出 |
| S1 の G-7 を「簡略」 | 検出(語の食い違いと中身の無い簡略の2件) |
| S2 の G-1 を「簡略(1枚企画書)」 | 検出 |
| S0 の G-7 から CL1 を落とす / 品質「高」を落とす | 検出 |
| S0 の G-7 を「省略(CL1 以上では適用)」(句の揺れ) | 検出(条件を読めない) |
| S0 の G-6 から上書きの条件を落とす | 検出 |
| S1 の G-6 に品質「高」以上を書き足す(エンジンは戻さない) | 検出 |
| 升の末尾に「。」 | 検出(状態の語を読めない) |
| 規則: r-b-mvp に simplify を戻す | 検出 |
| 規則: r-c-high の G-6 の調整を外す | 検出 |
| **S1 の G-6 を「適用」(コア機能の限定を書き落とす)** | **通過(X-1)** |
| 規則: r-c-high・r-c-regulated の restore を外す | 通過。升の状態は変わらないため。判定者の方式の欠落は、エンジンの試験の否定の対が捉える(test:engine で確認) |

軸C・軸E 以外の軸(開発形態・既存のゲート・AI の制約・人数)が、標準品質・CL0 の升の状態と範囲を変えないことも確かめた(`axisd.mjs`。差は 0 件)。プローブを CL と品質に絞ったことは、現行の規則では漏れにならない。

emptySimplified の判定: 「簡略」「簡略(CL1 以上は適用)」「簡略(CL1 以上・品質「高」以上は適用)」「簡略(CL1 以上では適用)」「簡略 (CL1 以上は適用)」「**簡略**」は中身無しと判定する。「簡略(1枚企画書)」は通る。「簡略化」「簡略(1枚企画書)。」は読めずに通る(X-4)。

## 4. 集約の出力の不変

実行: `git archive` で cc27644~1 と cc27644 をスクラッチパッドへ取り出し、新しい知識ベースで作った同じ構成を両方の `aggregate-evidence.mjs` に与えて、`evidence/` の全ファイルと標準出力を比べた(`aggdiff.mjs`)。

| 構成 | 差 |
| --- | --- |
| S1・CL0・標準(現行の構成) | 項目2 に「G-6 独立レビュー / 範囲の限定(コア機能)」の行。quality-report.md・assurance-disclosure.external.md・evidence.json の tailoring だけ |
| S1・CL0・標準、G-7 を simplified にした旧い構成 | 項目2 の G-7 の状態に「。未適用の厳格化: 現行の規則の再導出では required。欠落には数えない」。項目1 の表に未適用の厳格化の1行。evidence.json の pendingTightenings に `blocking: false` |
| S0・CL0・標準 / S2・CL0・標準 / S0・CL0・品質「高」 / S1・CL1・標準 | 差なし |

- どの構成でも、標準出力・終了コード・欠落の計上(`::error::`)は新旧で同じ。旧い構成の未適用の厳格化は blocking でない
- 旧い構成の項目1 の1行は、集約の変更ではなく知識ベースの変更(再導出が required になる)による。ADR-0112「影響」の記述と一致する
- evidence.json の `files` の 232 → 233 は、テンプレートに試験のファイルが1つ増えたことによる。比べ方の副産物であり、変化に数えない

## 5. 文の規約

- `npx textlint` を ADR-0112・tailoring-guide.md・gate-criteria.md・overview.md・ADR-0088 に実行し、違反なし。`npm run lint:tone` も違反なし
- 追加した箇条書きは「である調 / 体言止め」、地の文は「ですます調」。目視でも崩れは無い
- EV-0230 の書式(`:::caution[暫定 EV-0230 / 見直し 2027-05]`、対象・根拠の水準・差し替え条件)は既存の EV-0101 と同じ形。`npm run lint:evidence` 通過
- IMPL-0447・IMPL-0345 の書式は `npm run lint:impl` 通過。IMPL-0447 の ng・ok の対は check-stage-table.mjs にある
- 内部リンクはすべて `/process-compass/` で始まる
- ADR-0088 の差分は、ステータスの節(表の直後、コンテキストの見出しの前)への1段落の追加だけ。削除の行は 0
- 新しい規範(gate-criteria.md:1377・1378)に実装マークが無い(X-2)

## 6. エンジンの試験の :367・:424

- 旧 :367(`expectG7` の `mvp: 'simplify'`)は `mvp: 'standard'` に直した。裁定どおり
- 旧 :424(weakened の規則で `mvp・cl1: G-7 simplify` を検出する assert)は消され、r-b-mvp へ simplify を戻した知識ベース `reSimplified` の対に置き換えた。対は (i) CL0・S1 の簡略を検出する、(ii) CL1〜CL3 の S1 の簡略は r-e-cl1 の restore が取り消し、食い違いに出ない、(iii) 品質「高」・規制業の S1 は軸C の強化が勝つ、の3つ。(i) が検出の力を、(ii)(iii) が取り消しを固定する。裁定と ADR-0112 決定4 の文言どおり
- 追加で、r-c-high・r-c-regulated の restore を外すと品質「高」・規制業の S0 で「G-7 の判定者の方式が無い」を検出する否定の対がある(R-2 の「試験で固定する」)
- 補足: 旧 :424 の対が示していた「r-e-cl1 の restore を外すと CL1 の S1 の簡略が出る」は、restore を外し簡略を戻した組み合わせの対としては残っていない。(ii) が restore の効果を肯定の形で固定し、(i) が検出の力を示すため、欠けとはしない

## 指摘の一覧

### X-1 升の突合が、範囲の限定(コア機能)の書き落としを捉えない — 中

- 所在: scripts/lib/stage-table.mjs:276〜279
- 根拠: 升が「コア機能」を書くときだけエンジンの範囲と比べ、エンジンの範囲が `core-only` で升が限定を書かない場合を比べない。`break.mjs` で S1 の G-6 を「適用」にすると、問題 0 件で通過した。ADR-0112 決定1 は G-6 の範囲を S1 の軽さの所在の1つに挙げ、保証の開示の項目2 に載せると定めた。その範囲が升から黙って消えても止まらないのは、決定2(升とエンジンの出力の一致を機械で確かめる)の穴である
- 直し方の向き: 基準の構成の出力が `scope: core-only` で、升の括弧に「コア機能」が無ければ食い違いとして出す。check-stage-table.mjs に ng の対(S1 の G-6 を「適用」に置き換える)を足す。IMPL-0447 の注記の「確かめないこと」と合わせる

### X-2 保証の開示の項目2 の新しい規範に実装マークが無い — 中

- 所在: src/content/docs/phase4-process-design/gate-criteria.md:1377・1378
- 根拠: 2つの箇条は、準拠テンプレートの集約(evidence-aggregation)の挙動を定める規範である。CLAUDE.md(#222)は、実行主体の挙動を制約する規定に実装マークを求める。テンプレートには降ろし先(aggregate-evidence.mjs:3284〜3293。テンプレート側)と試験(test-tailoring-declaration.mjs)があるが、標準の側にマークが無く、台帳に出ない。直後の IMPL-0439 は項目1 の規範だけを運ぶ
- 直し方の向き: `<!-- impl IMPL-NNNN target=evidence-aggregation state=delivered check=machine test=template/scripts/gate/test-tailoring-declaration.mjs note="..." -->` を足し、`npm run impl:write` で台帳を再生成する

### X-3 項目2 の未適用の厳格化の規定が、裁定の範囲より広い — 低

- 所在: gate-criteria.md:1378、aggregate-evidence.mjs:3286
- 根拠: 裁定 R-4 は「旧い構成(簡略で記録された G-7)」を未適用の厳格化として表示すると定めた。規定の文は「規則の再導出で厳しくなるゲートが構成に残っている場合」と全ゲートへ一般化し、実装も全ゲートに状態の後書きを付ける。既存の IMPL-0349(未適用の厳格化)と矛盾はせず、CL1 以上の blocking も既存の挙動のままである。ただし会議体は一般化を審議していない
- 直し方の向き: 一般化を採るなら ADR-0112 決定4 にその旨を書く。採らないなら、規定の文を G-7 の旧い構成に限る

### X-4 中身の無い簡略の検査が、表記の揺れで素通りする — 低

- 所在: scripts/lib/stage-table.mjs:193(parseCell)、check-provisions.mjs の検査3 の続き
- 根拠: parseCell は升全体が「状態の語+括弧」に一致するときだけ読む。「簡略化」「簡略(1枚企画書)。」は読めずに null となり、検査3 では違反に数えない。軸B の表では check-stage-table が「状態の語を読めない」で止めるが、第8章のほかの表と規定の附属書の表では止まらない。現行の文書に該当は無い
- 直し方の向き: 検査3 で「簡略」で始まり parseCell が読めない升を、読めない升として報告する。機械の限界として provision-forms.md の検査3 に書く案もある

### X-5 保証の開示に内部の状態の語(required)がそのまま出る — 低

- 所在: template/scripts/gate/aggregate-evidence.mjs:3286
- 根拠: 項目2 の後書きが「現行の規則の再導出では required」と出す(aggdiff.mjs の出力。外へ渡す assurance-disclosure.external.md にも出る)。同じ行の前半は「簡略化」と日本語の状態の語で書いており、1行の中で語彙が混ざる。項目1 の既存の行(g7 simplified → required)も同じ形で、今回の変更の前からある
- 直し方の向き: STATE_TEXT と同じ対応(required → 適用)で表示する

### X-6 ADR-0112 が後継の Issue の番号を引かない — 低

- 所在: src/content/docs/adr/0112-s1-ship-gate-applied-and-simplified-defined.md:64・88
- 根拠: 「後継の Issue へ送る」とだけ書く。後継は Issue #435(集約が G-6 の範囲を読まず、S0 の前提3 と S1 の G-6 の範囲が食い違う)として起票済み。読み手は ADR から追えない
- 直し方の向き: #435 へのリンクを足す(採用の日の記録の補記として、状態の節か影響の節へ)

### X-7 項目2 の G-6 の行の理由に、範囲と関係の無い注記が混ざる — 低

- 所在: template/scripts/gate/aggregate-evidence.mjs:3291(`why: g.why ?? []`)
- 根拠: 「範囲の限定(コア機能)」の行の理由に、レビューの方式の注記「独立レビューはチーム内で作成者と分離して実施する」が並ぶ(aggdiff.mjs の出力)。限定の理由として読むと誤る
- 直し方の向き: 範囲の行には scope の設定の注記だけを載せる

## 確かめて問題が無かったこと

- 升の表記とエンジンの出力は一致する(lint:stage-table、break.mjs の基準の行)
- S0 の G-6 の括弧「CL1 以上・品質「高」以上は全変更に適用」と S1 の G-6 の括弧「CL1 以上は全変更」は、エンジンの出力と一致する(品質「高」の S1 は core-only のまま)
- 1〜2名・品質「高」・S0 の「逸脱 g7」は、S1・S2 の同じ構成と揃った正しい帰結である
- 集約の出力は、項目2 と、旧い構成に限る項目1 の1行のほかは変わらない。旧い構成の未適用の厳格化は blocking でない
- テンプレートの test-tailoring-declaration.mjs(6件)と test-roster-rules.mjs は通過。test-tailoring-declaration.mjs はジョブ contract(gate-g5.yml)に結線されている
- ADR-0063 決定5・ADR-0065 決定1・ADR-0028 の引き方は、各 ADR の本文と矛盾しない
