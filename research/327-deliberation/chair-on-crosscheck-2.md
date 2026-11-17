# #327 独立の突合(2巡目)への議長の裁定(2026-11-17)

突合は2巡で閉じる。直しは議長の指示のもとで1回だけ行い、議長が差分を読んで確かめる。

- 中(1) IMPL-0567 の注記: 7.3 の境(対象ごとに、その判定・集約・検証の記録が無いまま 7.3 で進めない。実施した判定の基準ごとの不充足は 7.3 の対象)に合わせて書き直す。issue=445 は既存の運び手なので変えない
- 中(2) 準拠テンプレートの trial-checklist.md の旧い文: template は触らない。#327 の template の項目に T8 として足し、implementation.md の一覧にも足す。本文側に未達の表示が要る規定なら、IMPL(undelivered、issue=327)で開示する
- 中(3) L-3: 新しい定めは足さない。S0 で G-2 を G-4 へ統合した場合に層の割り当てを書くのは、本文(gate-criteria.md の G-2 基準5 の後の段落)のとおり **G-4 の判定者**である。委譲できるかは、G-4 の判定者の委譲の既存の規定にそのまま従う(統合のための別の委譲の規則は置かない。採らない)。ADR-0154 決定1 と IMPL-0997 の文を、この主語に揃える
- 低4件: 直す

## push の前の回帰での差し戻し(2026-11-17)

- 回帰の全量(2eef0ad2)で test:template の複製検査が落ちた。標準の試行前チェックリスト(tailoring-guide.md)の「差し引き」の項目を改めたが、複製の検査は template/templates/trial-checklist.md との全文一致を求める。B10 は template を触らない
- 指揮役の裁定(A): 標準の項目(tailoring-guide.md と enablement.md の写し)を元の文「導入後の判定件数が、置換前を上回らないことを確認した」へ戻す。ADR-0013 決定2(差し引きが負)との食い違いは IMPL-1002(undelivered、issue=327)の note と #327 の template の項目 T8 で開示する。T8 は template を改める束で、標準と template を同時に改める
- 戻した後、lint:impl・lint:evidence・lint:refs・test:template が通った
