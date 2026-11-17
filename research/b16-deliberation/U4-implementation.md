# 束 B16 U4(D-0 と変更の手引き)の実装の記録

新しい `##` 見出しと必須欄は足していない(`template-fields.yaml` は変えない)。新しい表は節の末尾に太字の見出し行で置いた。D-0 の写し(profiles 配下)は無い。全 24 件を delivered にした(降ろさなかった件は無い)。

| 項目 | 降ろし先 | 内容 | マーク |
| --- | --- | --- | --- |
| 0592 0635 0721 0654 | 00-d0 節3 末尾「成果物ごとの結果責任者(担当表)」 | A を1名、2名の行・欠く行を作らない、委譲先の欄で文書化、保守は文脈オーナー | delivered(0592 は target を config-roles から d0-template へ) |
| 0637 | 00 節9 末尾「暫定任命の期間」 | 期間・満了時の扱い・延長の決裁、併記と未達の表示 | delivered |
| 0659〜0662 | 00 節10 末尾「会議体の運用」 | B-1〜B-4 の決定者・判定期限・適用条件・記録、B-4 の3区分 | delivered |
| 0701 | 00 節4 | 決裁者の既定の割当の表。記録の無い交点は表による | delivered |
| 0704 | 00 節5 | 判定期限は上程の受理日から起算 | delivered |
| 0714 0829 | 00 節12 | モデルの版固定。共有の認証情報の構成を記録する表 | delivered |
| 0901 | 00 節8 末尾「監査担当の充足方法」 | 方法・相手・要件4 の担い手(置けなければ未実施) | delivered(target を internal-audit-record から d0-template へ) |
| C-7 | 00 節1 の名簿の説明 | 受託で発注側に置く席の人も体制の内として載せる | なし |
| C-8 | 00 節2 | 変化点で始めた兼務の理由は節13 の行を指してよい。参照先の実在の検査は B15 | なし |
| 0595 0624 0841 0842 | process-change kinds/mode.md 節「引き上げと登録の判断点」「条件に反する変更が出たとき」 | 実測値を根拠、判断点で基準値と比較、緊急修正は登録しない、2期連続で collab へ | delivered(0841・0842 は target を config-delegation から process-change-skill へ) |
| 0732 0885 0887 0898 | kinds/accountable.md | 担い手の増減の契機の限定。H-1〜H-3 の残作業・判定者・延長と空席 | delivered(0885 系は target を context-transfer-record から変更) |
| 0737 | SKILL.md 節「宣言を満たし直す」 | 4点の確認。手順番号は動かさず節として置いた(apply.md が手順8・9 を引くため) | delivered |
| 0944 | reference/dry-run.md 節「変化点をまたぐ未完了の判定」 | 引き継ぎと前任の名義の扱いを残作業として渡す。名義の機械の検査は無い | delivered(手順の境界のみ) |
| 手引き | artifacts/00-d0-governance.md | 新しい表の所在、レビューの観点 | なし |

## 検査

lint:impl・lint:refs・test:plan-issues・test:fields・lint:skills・lint:text は終了コード 0。impl:write 済み。template の test-roster-rules・test-roster-conditions・test-cl-judgment・test-loosening-decider・test-name-confirmation-timing は通過。check-d0 は構成未設定の通知のみ。test-discouraged-evidence は 2 件不一致だが、変更を退避した HEAD でも同じ 2 件で落ちる(U4 の前から。時計または前提の表の書き込みの問題の疑い)。test-edition-end・test-init-g5 は流していない。

## 突合で見てほしい点

- 節12 の表は箇条書きの途中に入る。読みやすさと、標準 3.5.3 が求める記録の置き場(列挙に無い離脱の記録先)が節の表で足りるか
- 節10 の判定期限は標準の値の写し。B-3 の起算は標準が「提出」、他は「上程」
- 0944 の名義の検査は手順だけで、機械の検査は無い(inventory の境界どおり)
