# #328 独立の突合 1巡目の所見への対応

対象: b18-07-review-1.md。議長の裁定に従って直した。

| 所見 | 対応 |
| --- | --- |
| M-1 | lifecycle.md:735 を「G-2(要件合意)の合意と契約は更新されません」へ直した |
| M-2 | lifecycle.md:744・751、gate-criteria.md:329、ADR-0019 の案内を「G-2 の合意または契約の変更」へ直した |
| L-1 | rules-supplementary.yaml:35 と practices.yaml:28 を「参照モデルの企画承認(G-1)・出荷判定(G-7)」へ戻した。template:kb で複製を更新した |
| L-2 | ADR-0078 の案内へ、決定1 の「外殻の変更管理」の読み方を足した |
| L-3 | ADR-0019・ADR-0118 の案内を「第2章 2.2 などの図のラベル」へ直した。kv-overview の図は触っていない |
| L-4 | proposal-template.md:59 の「協調ループ」の重複を直した |
| L-5 | 直していない。#332 へ寄せる(コメントは議長が書く) |

検査: test:template、test:engine、lint:text、lint:refs、lint:provisions、test:provisions、test:fields は通過した。

差分の範囲: 本体 c6a964a8..b8fd602f(本コミット)、template 3bb41f8..fadcaa3(bundle: tmp/bundles/template-b18-328-02.bundle)
