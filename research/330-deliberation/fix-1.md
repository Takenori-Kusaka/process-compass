# #330 独立の突合(1巡目)の所見を直した記録(2026-11-17)

裁定: chair-on-crosscheck-1.md。重へは上げない。

| # | 直した所在 |
| --- | --- |
| X1 | gate-criteria.md「検査対象が存在しない場合の扱い」の段落を、項目4 に出るのは静的解析と依存監査に限ると改めた。IMPL-0989 の note を lint・audit に限った。新しい IMPL-0992(undelivered、issue=330)でライセンス検査の「実施(success)」と出る食い違いを開示し、template への申し送り T-8 を note に書いた。EV-0290 の対象に実物の反例を書いた。ADR-0151 のコンテキスト・決定1・影響を同じ限定へ改めた。impl-inventory.yaml へ IMPL-0992 を登録した。template は触っていない |
| X2 | 同段落の主語を任意の検査の列挙に改め、言語のアダプタで製品のコードがあるときのカバレッジを例外に足した(ADR-0124 決定1 と一致) |
| X3 | 依存の導入は項目4 に出ない旨を本文・ADR-0151・IMPL-0992 に書き、IMPL-0989 の note から外した |
| X4 | IMPL-0989 の確かめる者を計画の Issue の担当者に改めた(出荷判定者へ新しい確認を割り当てない)。AI 名義を責任者欄へ書く形ではない |
| X5 | EV-0289 の caution と IMPL-0990 を、保証の開示の要求の箇条書きの末尾へ移し、箇条書きの分断を解いた |
| X6 | IMPL-0990 の note と ADR-0151 決定2 に「継続は検査ごとに数え、理由が変わっても未実施が続く限り途切れない」を書いた |
| X7 | template-repository.md を「none・undetermined 以外。同梱の node・python・go」と改め、対象なしの出力の語との対応を添えた |

検査: lint:impl・lint:evidence・lint:refs・lint:scope は exit 0。台帳は impl:write・evidence:write で再生成した。textlint は通過。
