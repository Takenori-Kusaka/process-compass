# 束 B14 独立の突合 1巡目の直し

| 所見 | 直した所在 |
| --- | --- |
| R1-1 | lifecycle.md 654(例を B-2 を置く体制に限り、置かない体制の段階3・契約の裁定を上程でないとした)。ADR-0178 決定2 も同じ |
| R1-2(案 b) | human-ai-boundary.md 344(「名指す時点は条件5」に弱め、「兼ねる」は 5.4.5 の読みに委ねて固定しない)。IMPL-0978 の note(348)、ADR-0178 の未決の項(34)に前提の問いを併記。decision.md 4 節に前提の問いの段落を追記 |
| R1-3 | ADR-0173 ステータス(10) |
| R1-4 | lifecycle.md 711(7.7.3 の算定と Issue への記録は変わらない) |
| R1-5 | lifecycle.md 716(EV-0321 の差し替え条件を「項目が残るまま」に限定) |
| R1-6 | ADR-0178 の採らない選択肢の表に3行追加 |
| R1-7 | human-ai-boundary.md 344(7.3 の例外承認で受けないことを列挙に追加) |
| R1-8 | ADR-0175 ステータス(10)の主語を寄せた |

## 検査
lint:refs・lint:impl・test:impl(56件)・lint:evidence(302件)・lint:scope: exit 0。impl:write・evidence:write・scope:write で台帳を再生成した。
