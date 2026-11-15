# #326 独立の突合(1巡目)の所見への直し(2026-11-15)

対象: `07-reconciliation-1.md` の R-1〜R-7。議長の裁定は全件を採る。外れる検査の集合(R-2)と template・pit-crew は変えていない。

| # | 結果 | 所在 | 確かめた結果 |
| --- | --- | --- | --- |
| R-1 高 | 直した | `scripts/lib/claim-terms.mjs`(`tableText` が見出し行の最初の升で表を特定)、`scripts/check-claim-terms.mjs`(1.10.2 は「述べること」、H.8 は「使ってよい表現」の表だけを読む。表が無ければ落ちる)、`scripts/test-claim-terms.mjs` | 実物の H.8 の「使ってよい表現」の表だけから 10 語を1つずつ消す試験を足した。別の表(使ってはならない表現)に語が残る入力である。節の全部の表を読む実装へ戻すと、表の特定の試験で落ちる(直す前の挙動の再現)。直した後は 7 件通過、実物の検査も通る |
| R-2 高 | 直した(集合は変えず) | `scripts/check-provisions.mjs` のヘッダ(2〜5・7〜12・14・17)、`community/provision-forms.md` の除外の印の表(2〜5、7〜11 → 2〜5、7〜12、14、17) | 検査14 は 2〜5 のループの中の早期 return、検査17 は 256 行の `hasMark` で外れる。ADR-0118 決定3・ADR-0132 に、14・17 を外さないという記述は無く、矛盾しない(ADR-0132 の却下は「未決の文を印で通す」で、別の事項)。`05-issue-comment.md` の項目2 も同じ範囲に直した。lint:provisions・test:provisions 通過 |
| R-3 中 | 直した | `scripts/check-scope.mjs`(環境変数 `SCOPE_EXEMPT_YAML`)、`scripts/check-gate-criteria.mjs`(`GATE_CRITERIA_YAML`)。差し替えは試験のためだけで、既定の挙動は同じ。`test-scope-exempt.mjs`・`test-gate-criteria-yaml.mjs` に検査本体を子の工程で起動する試験を足した | 突然変異で確認した。`check-scope.mjs` の `exemptProblems` の呼び出しを消すと試験が落ち、`check-gate-criteria.mjs` の文の一致の比較を無効にすると試験が落ちた。いずれも元へ戻し、差分は環境変数の差し替えだけである |
| R-4 中 | 開示(検査は広げない) | `scripts/check-section-refs.mjs` ヘッダの「検査しない形式」 | 節番号が複数のリンクで、名がいずれかの番号の節に属すれば足りるか全部かは文による。決定可能で偽陽性が無いと確かめていないので、所見の案(b)を採った |
| R-5 低 | 直した | `05-issue-comment.md` の項目9 | 3つ目(過去の PR の時点のワークフローの定義)を、限界として開示する案として足した |
| R-6 低 | 直した | `scripts/lib/gate-criteria-yaml.mjs` の `writeCriteria`(置換を次の `- id:` の手前までに限り、CRLF を許す) | criteria 行の無いゲートが次のゲートを書き換えない試験と、CRLF の試験を足した。現行の 45 件は一致のまま |
| R-7 低 | 直した | `scripts/lib/adr-links.mjs` の `forwardCounts`、`scripts/check-adr-links.mjs` の出力 | 「136 件のうち、順方向の参照を持つ 18 件(25 組)を検査」と出る |

## 流した検査

lint:refs(試験を含む)、lint:provisions、test:provisions、lint:scope、test:criteria、check-gate-criteria、lint:ci(結線)、textlint(provision-forms.md)。回帰の全量と `npm run check` の全体は流していない。

## 採らなかった案

- R-2: 各検査の違反に印を足すとヘッダの検査だけが外れることの試験は足していない(裁定は開示を保つ。範囲を手で書く限りずれうることは、所見のとおり残る)
- R-4: 番号が複数のときの対応の検査は足していない(上記)
