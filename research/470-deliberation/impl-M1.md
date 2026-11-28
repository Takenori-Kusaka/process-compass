# #470 実装 M1(本体: 規定 A・規定 B・決め事を先に人へ上げる範囲)

## 変えたファイルと節

- `src/content/docs/phase4-process-design/human-ai-boundary.md` 5.5.1
  - 作業上の選択の段落: 「人確定の変更でも同じ。ただし、後掲の決め事は除く」を追記(追補 5.1)
  - 作業上の選択の表に行を 1 つ(CL1 以上・規制業の案件の変更と R1 の変更での決め事)
  - 規定 A(6 段の表と要求の箇条)を表の直後へ。IMPL-1078・1079、EV-0394
  - 規定 B を、理由の記録の要求事項の箇条の直後(「本節は、開発の道具として…」の前)へ。IMPL-1080〜1083、EV-0395。要求事項の 4 つ目と 5 つ目は追補 5.3 の 1 つにまとめた形
  - 見出し「決め事を先に人へ上げる範囲(適用: …)」を 5.5.1 の末尾(5.5.2 の直前)へ。IMPL-1084〜1086、EV-0396
  - IMPL-1050〜1052 を delivered へ(note を降りた内容へ。plan・issue・review の属性を外した)。IMPL-0024 の note に 1 文
- `lifecycle.md` 2.6: 「判断記録の範囲」の末尾に箇条 1 つ、「判断記録の要否の規則」の箇条列に 1 つ
- `gate-criteria.md`: G-6 に 1 文(基準4 の段落の直前)。G-7「保証の開示」の箇条に 1 つ(項目2)
- `tailoring-guide.md`: 「人が触る場所」の表の後の箇条に 1 つ
- `assurance-case.md`: H.4 条件4 の注記の例示に 1 つ。さらに、投影表の AI の作業のブラックボックスの行で、IMPL-1050〜1052 を「未達」としていた区分と文を直した(`lint:refs` の投影表の検査が落ちたため)
- `src/content/docs/adr/0276-undefined-matters-lean-on-existing-then-world-standards-review-exclusion-by-adopter.md`(新規)
- `src/content/docs/adr/0044-no-search-obligation-for-existing-parts.md`: 状態の節だけ
- `src/data/impl-inventory.yaml`: 5.5.1 の登録に IMPL-1078〜1083 を足し、新しい見出しの節を登録(IMPL-1084〜1086)
- 台帳(`evidence-ledger.md`・`implementation-ledger.md`・`scope-ledger.md`)を再生成

## 採番(仮の名 → 番号)

| 仮の名 | 番号 | target | check |
| --- | --- | --- | --- |
| ADR | ADR-0276 | — | — |
| EV-A | EV-0394 | — | — |
| EV-B | EV-0395 | — | — |
| EV-C | EV-0396 | — | — |
| IMPL-A | IMPL-1078 | claude-md-resident | presence(単位: 行) |
| IMPL-B | IMPL-1079 | implement-skill | manual |
| IMPL-C | IMPL-1080 | profile-generator | machine |
| IMPL-D | IMPL-1081 | pr-checks | machine |
| IMPL-E | IMPL-1082 | evidence-aggregation | machine |
| IMPL-F | IMPL-1083 | gate-skill-g6 | manual |
| IMPL-G | IMPL-1084 | claude-md-resident | presence(単位: 行) |
| IMPL-H | IMPL-1085 | implement-skill | manual |
| IMPL-I | IMPL-1086 | task-breakdown-skill | manual |

採番の前に、docs 配下の最大が EV-0393・IMPL-1077 であることを確かめた。push の直前に origin/main の最大を取り直して、付け直す必要がある。

## 流した検査

- `npm run lint:refs`: 通過(投影表の整合は、assurance-case の行を直して通した)
- `npm run lint:evidence`: 通過(375 件)
- `npm run lint:scope`: 通過
- `npm run lint:provisions`・`lint:dekimasu`・`lint:tone`・`lint:citations`・`lint:sources`: 通過
- `npm run test:provisions`・`test:impl`・`lint:detection-values`・`lint:stage-table`: 通過
- textlint(変えた phase4 の全ファイルと ADR-0276・0044): 違反なし
- `npm run lint:impl`: **6 件失敗**(下の「後で合わせる点」)。ほかの項目は通過
- `npm run lint:text` の全量は流していない(背景で実行に入れたが、結果を待っていない)。変えたファイルは個別の textlint で通した
- `npm run check` の全量は流していない

node_modules は主の作業ツリーへの junction(`mklink /J`)で用意した。junction は git の管理外。

## 後で合わせる点

- template 側の試験に、次の目印が無いため `lint:impl` が落ちる。template の実装の担当が、試験に `IMPL-NNNN:ng`(違反の入力)と `IMPL-NNNN:ok`(適合の入力)を別の行で足すこと。足せない試験の名が変わったら、本体のマークの `test=` を直す
  - IMPL-1080: `template/scripts/gate/test-loosening-decider.mjs`
  - IMPL-1081: `template/scripts/gate/test-check-pr.mjs`
  - IMPL-1082: `template/scripts/gate/test-direct-commit-rules.mjs`(ruling.md 4 章は「集約の試験は実装の担当が選ぶ」。6 章の表に従い、この試験を仮に置いた。項目2 の件数を確かめる別の試験になるなら直す)
- template の降ろし先の実在・文言を、template の実装が終わった後に `lint:impl` で確かめ直す。本担当は template を触っていない。template の枝は afd0ae7(1 本目の 2 コミットまで)を見た
- IMPL-1050 を `presence` にした。template の CR-015 の核(`claude-md-resident.json`)が実在する前提(impl-T1.md)
- 台帳(実装)は、上の 6 件が解けた後に `npm run impl:write` を流し直すこと(今回の生成は、失敗の状態のまま書き出した)
- 本体の `npm run test:fields`(`check-template-fields`)は流していない。template の実装の後に流す

## 裁定の文案から変えた点

- 「決め事を先に人へ上げる範囲」の見出しを、追補 5.2 の「規定 A の箇条の直後」でなく、5.5.1 の末尾(5.5.2 の直前)へ置いた。理由: 見出し(h4)を規定 A の直後に置くと、続く理由の記録・規定 B・EV-0358 のすべてが、適用範囲(CL1 以上・規制業・R1)の見出しの下に入り、`lint:scope` の読みと読み手の読みが「全部がこの範囲」になるため。規定 B と規定 A の本文は、本文中で「後掲の『決め事を先に人へ上げる範囲』」と引いた
- 作業上の選択の表の新しい行(追補 5.1)は、「(適用: この範囲)」の書式を使わず、限定を行の中の文で書いた(適用範囲の注記を行へ付けると、台帳に見出し以外の注記が増えるため)
- 規定 B の要求事項 4・5 は追補 5.3 の 1 つ。ruling.md の「議長が引いた線として最後の報告で知らせる」は書いていない(追補が勝つ)
- 裁定の箇条を、本文のある所では「である調」「ですます調」へ整えた(意味は変えていない)
- 日本語校正のため、EV-0394・0396 の差し替え条件を、「(a)…件数。(b)…」の文の並びへ変えた(1 文を 150 字以内にするため)。意味は変えていない
- EV-0394 の本文: 試験の数値は external.md の 4 章・6 章のとおり(コード 15.4% 減、費用 10.3% 減、置くだけでは 10 回中 0 回、作者の値 54% 減)に書いた。「中央値」とは書いていない。出典は SRC-0982(幻覚パッケージの実測)・SRC-0983(公開のスキルの本文)・SRC-0984(独立の試験)。`lint:sources`・`lint:citations` は通過したが、出典台帳に登録されているかは確かめていない
- EV-0394 の「根拠の水準」は E0。外部の試験が単一で、安全の保持を測っていないため、裁定どおり
- ADR-0276 の題を、追補の内容(安全・規制と R1 の決め事)まで含めた
- ADR-0044 の状態の節は、ADR-0261 の書き方に倣い、別の行(段落)で足した

## 議長へ

- assurance-case.md の投影表(AI の作業がブラックボックスになる行)を、裁定の表に無いのに直した。IMPL-1050〜1052 を「未達」と書いていたため、delivered にすると `lint:refs` が落ちる。「未達」を外し、規則で外した範囲の見逃しを開示の欄に 1 文足した。区分の列の判断(人・開示)は変えていない。この行に降りた内容を増やすかは議長が決める
- 「決め事を先に人へ上げる範囲」を末尾へ置いたことで、規定 A の「安全に関わる判断は 5.5.5 による」の箇条と、末尾の範囲の記述の間に距離ができた。読み手の導線として問題があれば、見出しを分けない形(適用の限定を各箇条の行へ書く)へ変えられる
- 規定 A の「依存の追加の確認(第4章 G-5 基準8 の一覧と G-6 基準5)」のリンクは、章の入口(gate-criteria)へ張った。節の見出しの名前を引く形にしていない
- ADR-0044 の決定の本文・帰結は書き換えていない。ADR-0276 の「置き換える対象」の表で、置き換えた部分を示した
- ADR-0267・ADR-0269 の本文にある「束 D1 で降ろす」「降りるまで undelivered」は、降りた後は古い記述になる。ADR は書き換えないので、そのままにした。#457 を閉じるときに、issue=457 の降りていない計画のマークが無いことを確かめること(本体の IMPL-1050〜1052 は delivered にした)
- 3.11.4 要求事項2 の読み(標準の条項の降ろしには掛からない)は、本担当では確かめていない(独立の突合へ回す)
- 一時の作業で `E:/Github/orca/workspace/process-compass/d5/node_modules` の junction を作った。不要なら `rmdir node_modules`(中身は消えない)で外せる
