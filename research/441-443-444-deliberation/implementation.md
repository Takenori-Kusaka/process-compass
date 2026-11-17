# #441・#443・#444 実装の記録

- 日付: 2026-11-17。仕様は `decision.md`。`template/` は触っていない

## 採番

- IMPL-1017(#441 短期書き換え率・adopter)、IMPL-1018(#443 予算の入力・adopter)、IMPL-1019(#444 指示資産の版)
- EV-0317(完了の既定の述語)、EV-0318(隔離)、EV-0319(実行の識別子)
- SRC-0765(Claude Code の環境変数の参照)
- ADR-0172、ADR-0173(ADR-0174 は使っていない)

## 変えたファイル

- 本文: `gate-criteria.md`(IMPL-0268・0044・1017)、`human-ai-boundary.md`(0174・0175・5.7.5 箇条1・0207・1019・0506・0510・0507・0200・EV-0251・EV-0318・EV-0319)、`lifecycle.md`(2.10.5 の調整の記録の段落・0374・EV-0317・0283・0851・0954・0899)、`exception-escalation.md`(0614・1018・0615・0377)、`roles-responsibilities.md`(0500・0828)、`deliverable-templates.md`(テンプレ4 の注記)
- `tailoring-guide.md` の IMPL-0743 は、別の担当のコミットに含まれて入った(本コミットの差分には出ない)
- 手引き: `phase5-implementation/agent-trace-control.md`(S1〜S4、範囲の実測、T1〜T3、日付、IMPL-0207・1019 の2文)
- ADR: `adr/0172-*.md`、`adr/0173-*.md`
- 登録簿: `src/data/impl-inventory.yaml`(IMPL-1017・1018・1019 を節へ登録)
- 出典: `research/sources/SRC-0765.yaml`。`npm run sources:index` が `research/sources/catalog.md` と `research/282-survey-2026-09/` の索引を更新した
- 台帳: `implementation-ledger.md`、`evidence-ledger.md`(再生成)

## 検査の結果

- lint:impl・lint:refs・lint:evidence・lint:scope・lint:tone・lint:provisions・lint:sources: 通過
- test:plan-issues: 22件合格
- 変えたファイルの textlint: 違反なし
- 全量の `npm run check`・`lint:text`・`graphify update .` は流していない(push の前に1回)

## 未実装・理由

- `adr/index.md` に ADR の一覧は無い(運用ルールとテンプレートだけ)。サイドバーは autogenerate のため、足していない
- ADR-0137・ADR-0094 などのステータスの節への後継の記載は足していない。ADR-0172 は ADR-0137 を「補う」だけで、置き換えではないため
- 重の候補(IMPL-0899 の順序の違反を確かめる者、2.10.5 と 3.10.1 の食い違い)は実装しない。decision.md §2.5 のとおり、Issue のコメントで扱う
- 台帳に既存の別の担当の変更は含まれていない(再生成の時点でコミット済み)
- 2.10.5 の段落のゲート欄「価値責任者の調整」は、出荷の証跡の集約が欠落として扱わないかを確かめていない(decision.md のとおり template の項目)
- IMPL-0207 の `check=machine` への変更は、降ろした後の作業として、note に条件だけ書いた
- deliverable-templates.md の注記は、仕様の文言(「事業決裁者の決裁」の後に足す)ではなく、別の1文として足した(文の読みやすさのため)
