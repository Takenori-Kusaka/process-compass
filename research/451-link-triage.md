# 週次リンク検査(#451)の 4xx の棚卸し

- 実施日: 2026-11-17
- 入力: #451 の 4xx 62 件(400 を3件含む)。タイムアウト 12 件と、5xx・接続失敗・HTTP/2 エラーなど一時的な 98 件は扱わない(#405・#437 と同じ方針。件数だけ記録)
- 確かめた方法: 検査と同じ UA の curl で、リダイレクトを追って状態を取り直した
- 扱い: 編集の指摘として直した(会議体は開かない)

## 書き方の誤り(37 件)

URL の直後に全角の括弧・読点・句点・日本語、または半角の括弧が続き、URL の一部として読まれていた(400 の3件を含む)。URL と後続の間に半角空白を入れた。文意は変えていない。直した後の URL は curl で 200 を確かめた。

| ファイル | 件数 |
| --- | --- |
| research/333-deliberation/research-supplement.md | 3 |
| research/357-deliberation/survey-external.md | 19 |
| research/359-deliberation/survey-external.md | 7 |
| research/360-deliberation/survey-external.md | 1 |
| research/363-deliberation/survey-363-2-external.md | 3 |
| research/438-deliberation/survey-438.md | 4 |

357 には URL が読点でつながった行がある。後ろの URL の直前にも空白を入れた。

## 消失・削除済み(.lycheeignore へ理由つきで追加。9 件・5 URL)

curl でも 404 が続く(mdcpp は 000 と 404 が揺れる)。

| 所在 | URL | 状態 |
| --- | --- | --- |
| research/358-deliberation/survey-external.md:116 | https://github.com/cursor/agent-trace | 404 |
| research/360-deliberation/survey-external.md:36 | https://docs.coveralls.io/pull-requests | 404 |
| research/373-deliberation/survey-373-2-external.md:124 | https://www.mdcpp.com/doc/standard/IEC61508-1-1997.pdf | 404 |
| research/432-deliberation/survey-432-2-external.md:62 | https://www.tenable.com/audits/items/CIS_Microsoft_365_Foundations_v5.0.0_L1_E5.audit:326efd8556245699eac38da2642beb5b | 404 |
| research/379-deliberation/survey-379-2-external.md:229 | https://standards.iteh.ai/catalog/standards/sist/1fc38e10-624f-4e18-a0a8-5c3283e61a1a/iso-iec-27002-2022 | 404 |

- 最後の iteh は、#431 では 200 だったが今回は 404 が続いた。#431・#437 の棚卸しの表(research/431-link-triage.md:57、research/437-link-triage.md:73・75・76)が同じ URL と mdcpp を引いているため、合わせて 9 件になる
- mdcpp.com は #437 では接続できず(000)、今回は 404。取り直すと 000 と 404 が揺れる(独立の突合の低-2)。どちらでも文書は得られないため、除外へ移した

## 検査の実行環境からの要求の拒否(.lycheeignore へ理由つきで追加。16 件・10 URL)

www.fda.gov は手元の curl では(検査と同じ UA でも)200、検査(GitHub Actions 上の lychee)には 404 を返す。UA ではなく取得元の環境で応答が変わるとみられ、前例の「GitHub Actions の実行環境からの要求を拒否」と同じ扱いにした。実在は curl で確かめた。lychee では確かめられないため、URL を指定して除外した。

- research/373-deliberation/survey-373-2-external.md、379、401、424、434、phase4-standard/gate-record-01-regulatory.md の fda.gov
- ドメイン全体は除外していない。他の fda.gov の URL は引き続き検査される
- 根拠水準: 拒否の原因(取得元の環境)は推定であり、実証していない(独立の突合の低-1 で UA が原因でないことを確かめた)
