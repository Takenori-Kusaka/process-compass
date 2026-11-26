# #454 実装の記録(担当: 実装。2026-11-27)

## 1. R-2 の欠陥の確認(実行)

既存の関数 `weakeningFindings` に小さな差分を通した(修正前の版)。

- 差分 A: 削除 `expect(f()).toBe(1);` / 追加 `it('should x', () => {})`。結果: 対(期待値の改め)1件・削除行のアサーション0件。題の文字列の `should` が検証と数えられ、検証の削除が「期待値の改め」に化けていた(欠陥を確認)
- 差分 B: 同じ削除 / 追加 `it('does x', () => {})`。結果: 削除行のアサーション1件・対0件(正)
- 同じ `ASSERTION` は `analyzePr` の「既存のテストの変更」の削除行の判定(IMPL-0203 の表)にも使われていた

直し: `maskLiterals`(文字列の中身を空にする)と宣言の名前の除去を `isAssertionLine` に入れ、既存の削除行の判定もこれに通した。修正後は A が削除行1件・対0件になる(試験の場面に固定)。直ったので IMPL-1043 は delivered にした。

## 2. 実装

template(`check-pr.mjs`、`test-check-pr.mjs`、`gates/G-6.md`、`human-verify/SKILL.md`)

- `ASSERTION` に R-6 の書式(`verify`・`raises`・`should_panic`・`shouldBe*`・`toThrow*`)を追加
- `incompleteMarkFindings`(R-1・R-4)。製品のコード(`CODE_EXTENSIONS`)の追加行の行注釈の `TODO`・`FIXME`・`XXX` と未実装の例外・マクロ。文書・生成物・vendor・ロックファイル・テストは対象外。同じ PR で削除した行と同じ本文の追加行は出さない
- `weakeningFindings` に `noAssertionTests`(R-3。ファイル単位の近似)
- `renderG6Material` は節を3つに分離(R-5): 検証を弱める変更 / 検証の語が1つも無い追加のテストのファイル / 製品のコードの追加行の未完了の語。限界の文は節ごとに0件でも出す。「印」の語は使わない
- 試験: 新しい場面7件、言語の書式9種。既存の IMPL-0204 の場面は変更せず通すこと(結果は 5 を参照)
- R-9: G-6 を事前に行わない変更が在る(事業ステージ S1 のコア機能への限定、G-6 の省略・未達の構成、R3 の委任の事後判定)。G-6.md と本体の行の中に「一覧は出るが事前に読む判定者がいない。検出できるとは主張しない」を書いた

本体

- 5.8.5 後段の拡張(`human-ai-boundary.md`。「確かめる」まで・差し戻しの文なし R-8・リスク区分に依らないことを行の中に R-1)
- 附属書H H.2(保守性の行。理由は保証の証跡と合格水準を持たないこと。代わりに示すものに負債台帳を挙げない)・H.11(残るリスクの行。効く層と効かない層を分ける R-10)
- 附属書C(パス3 の手引き E2 と一覧の確認)
- ADR-0262 を新設(`src/content/docs/adr/0262-…`)
- 採用済み ADR の本文は書き換えていない

## 3. 仮番号(push の直前に付け直す)

- IMPL-1042(未完了の語。delivered・machine)、IMPL-1043(検証の語の無いテスト。delivered・machine)、IMPL-1044(G-6 の確認。delivered・manual)
- EV-0355(検出の方式と範囲。E0。見直し 2027-05)、EV-0356(G-6 の確認が自己申告であること。E0)
- ADR-0262
- 付け直す場所: 本体の `human-ai-boundary.md` の IMPL・EV のマーク、`src/data/impl-inventory.yaml`、ADR-0262 の本文(ステータスの文)、`assurance-case.md` の ADR 参照、template の試験の目印(`IMPL-1042:ng/ok`・`IMPL-1043:ng/ok`)。台帳は `npm run evidence:write`・`npm run impl:write` で再生成する

## 4. 採らなかった実装上の判断

- `ASSERTION` を足す範囲は R-6 の列挙に限った。`pytest.fail`・`Assertions.` などは足していない
- 設定の鍵は置いていない(R-7)。`.claude/skills/artifact/artifacts/03-debt-ledger.md` は変えていない(案 §5.1 で実装の段の判断とされたが、裁定に無いので触らない)
- 規則データは触っていない(`template:kb` は不要)

## 5. 試験の結果

- template `test-check-pr.mjs`: 316 場面と付随の確認が一致(既存の IMPL-0204 の場面を含む)。初回に Rust の `#[should_panic]` の行が注釈の行と読まれて落ち、`#[` の行を注釈に数えない直しで通した
- `npm run lint:refs`・`test:fields`・`evidence:write`・`impl:write`・`scope:write`・textlint(変更した3ページ)は問題なし
- 全量の回帰・`npm run check` は流していない(push の前に1回)
- template のコミット d7bd78d は未 push。bundle は `tmp/d1-template.bundle`
