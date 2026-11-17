# #356 A 独立の突合 2巡目の所見の直し(2026-11-17)

裁定は `fix-round2-ruling.md`。3巡目の突合は行わない。

| 所見 | 結果 |
| --- | --- |
| R2-1 | 直した。識別子の照合の境界を英数字だけにした。試験に `SE-1-fix.js`・`inject_SE-1`(拾う)と `SE-10`(拾わない)を固定した |
| R2-2 | 直した。記録の `limits` と冒頭の注記に、squash の既定の文の設定の経路と `failures` を足した |
| R2-3 | 直した。試験に、浅い clone で走査が成立しない場面(exit 1・scanRun false・failures あり)を足した |
| R2-4 | 直した。IMPL-0161 の note に、行を消した様式も止めないことを開示した。表示も「#356 より前の様式か、行を消した様式」にした |

通した試験: `test-seeded-error-scan`(全件)、`test-env-findings`。`test-g5-aggregate`・`test-discouraged-evidence` は Windows の CRLF による偽の FAIL のため判定に使わない。
