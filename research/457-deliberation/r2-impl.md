# #457 再審議の実装の記録(2026-11-27。束 D3)

## 変えたファイルと箇所

- `src/content/docs/phase4-process-design/assurance-case.md`: H.3 の「ブラックボックス(何をしたか)」「同(なぜそう作ったか)」の2行の升だけ。H.5 問11 の答えの冒頭(追跡 → 構成管理の記録の順へ並べ替え)。行の見出しの語・前書き・行の出所・EV-0357 は触っていない
- `src/content/docs/phase5-implementation/pr-workflow.md`: 理由の記録先(PR の本文を既定)、スカッシュの後に残すトレーラの列挙(`Agent-Run`・`Agent-Assets` を足し、運ばれないことと `Co-Authored-By` が未観測であることを書いた)、新しい節「後から1つの変更を辿る」(Mermaid 1つ、順の表、辿れない箇所の表、調査の寄せ先、EV-0365・EV-0366)
- `src/content/docs/phase4-process-design/human-ai-boundary.md`: IMPL-1050・1051・1052 の note、IMPL-0177・1033 の note(運ぶ処理は IMPL-1061 と書き足し。state は変えない)、IMPL-1061(undelivered)と EV-0367 を IMPL-1034 の後へ。5.8.2 の条文は変えていない
- `src/content/docs/phase4-process-design/proposal-template.md`: 「監査対応」の行
- `src/content/docs/adr/0269-trace-start-at-pr-body-and-research-record-scope-unchanged.md`(新設)、`0270-model-version-record-as-configuration-management-not-evidence-of-explanation.md`(新設)
- `src/content/docs/adr/0012-ai-output-as-unverified-input.md`: ステータスの欄に「一部置き換え(→ ADR-0270 の決定1)」だけを足した(前例: ADR-0009・0017・0021)
- `src/data/impl-inventory.yaml`: 5.8.2 の登録に IMPL-1061 を足した(足さないと `lint:impl` が落ちる)
- `scripts/test-failure-projection.mjs` L54: 試験の前提の文字列を、新しい `未達` の升に合わせた(同試験の注意書きが、行を改めたら前提も直すと求めている)
- 台帳(`implementation-ledger.md`・`evidence-ledger.md`)を再生成した

## 足した番号

- IMPL-1061(target=evidence-aggregation、state=undelivered、issue=457、review=2027-01)
- EV-0365(追跡。E0。pr-workflow)、EV-0366(K7 の形。E2。pr-workflow)、EV-0367(K8。E0、未観測。human-ai-boundary)
- 現時点の最大(IMPL-1060・EV-0364)の次。push の前に付け直す場合は、assurance-case.md H.3 の2行・pr-workflow.md・human-ai-boundary.md・ADR-0269 の根拠水準・IMPL-1061 の note と inventory を合わせて直す

## 裁定の案の文案から変えた点と理由

1. EV-NEW-2 を、EV-0366(K7。E2)と EV-0367(K8。E0)の2つに分けた。案が「合わなければ2つに分ける」とし、書式は水準を1つしか許さない(呼称まで一致させる)ため。裁定の「K7 は観測済み、K8 は未観測」にも合う
2. H.3 の「何をしたか」の行の止める場所・最も弱い止め方・証拠の文は、案の骨子を保ちつつ、区分の列の「/」の分割検査((c))を壊す「/」を使わない文に直した。内部リンクの節名は、アンカーを付けず節名で指した
3. 区分の升に `人(G-6 基準6 の検証の記録)` と `開示` を足し、最も弱い止め方の先頭を `開示:` にした(案どおり。(f) の導出)。IMPL-1019 を `機械が示し人が止める` の升へ足した
4. Mermaid は、`-.-x` を Mermaid の記法として確かめられなかったため `-.->` に直し、限界の2点を矢印のラベルと注記のノードで示した。ノードは 9 個(規約の「7個前後」を少し超える)。判断記録・前提の台帳は1ノードにまとめた
5. 案の「順・読むもの・所在・答える問い」の表は7行。7行目の実行の記録は「保持は採用者が定める。本標準は課さない」と書いた。G-6・G-7 の判定の記録は4行目へ含めた(別の行にしない)
6. 案の「Spec が Issue 番号か setup」の理由は、`ci-gates.md` L169(#286 の経路)の記述に合わせて書いた
7. ADR-0028 の slug を、案の想定でなく実在のファイル名(`0028-unmet-gate-distinct-from-omitted`)で引いた
8. ADR-0270 に「5.8.2 の本文は変えない」の理由を足した。5.8.2 の条文は裁定どおり変えていない

## 実行した検査と結果

- `node scripts/check-failure-projection.mjs`: 通過(表記の整合を確認)
- `node scripts/test-failure-projection.mjs`: 26 件通過(試験の前提の文字列を直した後)
- `npm run lint:refs`: 通過(終了コード 0)
- `npm run lint:evidence`: 通過(347 件、期限到来 0)
- `npm run lint:scope`: 通過
- `npm run lint:tone`: 通過
- `npm run test:impl`: 56 件通過
- `npx textlint`(変えた md 7 本): 指摘なし
- `npm run impl:issues -- --issue 457`: IMPL-1050〜1052・IMPL-1061 を列挙して終了コード 1(想定どおり。#457 は D1 で降りるまで閉じない)
- `npm run lint:impl`: `template/` が空のため、試験の結線の確認だけが失敗する。inventory の登録漏れ(IMPL-1061)は直して消えた。template を初期化した環境で再確認が要る

## できなかった点・気づいたこと

- `lint:impl` の試験の結線の確認(template/ の初期化が要る)と、全量の `npm run check` は流していない
- Mermaid の描画は、`npm run dev` で見ていない(記法は `flowchart LR` と `-.->` だけを使った)
- `human-ai-boundary.md` 5.8.3 の inventory の note が IMPL-1019 を「降りていない」と書いている(IMPL-1019 は delivered)。本束の範囲外の食い違い。既存の open Issue へ寄せる候補
- `adr/0268-...md` と `research/465-deliberation/review-round2.md` は、本束の前から作業ツリーにあった #465 の変更で、触っていない
- template の変更・#361 への観測の依頼・コミット・push は行っていない
