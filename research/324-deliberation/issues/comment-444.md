#324(実装マークの節の棚卸し、ADR-0140)で、領域の合う降りていない規定の実装マーク 2 件が仮に #324 を名指していたため、本 Issue へ付け替えます(実装マークの `issue=` を 444 へ改めます)。条文は変えていません。

## 足す範囲
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0828 | phase4-process-design/roles-responsibilities:1811 | agent-run-record | 3.12.5 要求事項5。 |
| IMPL-0743 | phase4-process-design/tailoring-guide:485 | agent-run-record | 版を特定できない実行の出力を、監査の入力に用いないこと。 |

## 受け入れ条件の案(追加分)
- [ ] 上表のマークごとに、降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(解決の方法は前提にしない。採用者に委ねる扱いは審議で決める)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
