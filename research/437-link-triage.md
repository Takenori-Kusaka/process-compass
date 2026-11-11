# 週次リンク検査(#437)の 4xx の棚卸し

- 実施日: 2026-11-11
- 入力: #437 の 4xx 56 件。タイムアウト 23 件は扱わない(#405 と同じ方針)
- 確かめた方法: 検査と同じ UA の curl で、リダイレクトを追って状態を取り直した

## 書き方の誤り(8 件)

URL の直後に全角の記号・括弧が続き、URL の一部として読まれていた。間に半角空白を入れた。

| 所在 | URL | 直した後の状態 |
| --- | --- | --- |
| research/369-delivery/probe-369.md:31 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42119251046 | 404 |
| research/371-deliberation/probe-371.md:87 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996013263 | 404 |
| research/371-deliberation/probe-371b.md:43 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035541211 | 404 |
| research/371-deliberation/probe-371b.md:95 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036467080 | 404 |
| research/372-deliberation/survey-372-1-internal.md:171 | https://www.mhlw.go.jp/content/001328443.pdf | 200 |
| research/372-deliberation/survey-372-2-external.md:263 | https://cdn.openai.com/osa/openai-services-agreement.pdf | 200 |
| research/406-roles-estimation/survey-external.md:83 | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | 200 |
| research/406-roles-estimation/survey-external.md:87 | https://metr.org/blog/2026-02-24-uplift-update/ | 200 |

## 消失・削除済み(.lycheeignore へ理由つきで追加)

- 一時リポジトリ pit-in-trial-369・371・371b の実行の記録(確認の後に削除した)は、先頭の一致の1行でまとめて除外した
- そのほか 404・410 の4件を個別に除外した。mdcpp.com の1件は接続できず(000)、タイムアウトと同じ扱いで変えていない

| 所在 | URL | 状態 |
| --- | --- | --- |
| research/318-deliberation/survey-318-2-external.md:164 | https://www.michaelagreiler.com/code-reviews/ | 404 |
| research/369-delivery/probe-369.md:37 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42119332278 | 404 |
| research/369-delivery/probe-369.md:50 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42119611130 | 404 |
| research/369-delivery/probe-369.md:55 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42119611174 | 404 |
| research/369-delivery/probe-369.md:62 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42119644346 | 404 |
| research/369-delivery/probe-369.md:78 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120126340 | 404 |
| research/369-delivery/probe-369.md:82 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120126480 | 404 |
| research/369-delivery/probe-369.md:95 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120209140 | 404 |
| research/369-delivery/probe-369.md:95 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120209209 | 404 |
| research/369-delivery/probe-369.md:95 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120209924 | 404 |
| research/369-delivery/probe-369.md:96 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120660376 | 404 |
| research/369-delivery/probe-369.md:96 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120660496 | 404 |
| research/369-delivery/probe-369.md:96 | https://github.com/Takenori-Kusaka/pit-in-trial-369/actions/runs/42120664119 | 404 |
| research/371-deliberation/probe-371.md:62 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995219516 | 404 |
| research/371-deliberation/probe-371.md:63 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995229002 | 404 |
| research/371-deliberation/probe-371.md:74 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995535361 | 404 |
| research/371-deliberation/probe-371.md:75 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995546036 | 404 |
| research/371-deliberation/probe-371.md:85 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995577102 | 404 |
| research/371-deliberation/probe-371.md:85 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995577198 | 404 |
| research/371-deliberation/probe-371.md:97 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995585569 | 404 |
| research/371-deliberation/probe-371.md:86 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995879035 | 404 |
| research/371-deliberation/probe-371.md:99 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996011328 | 404 |
| research/371-deliberation/probe-371.md:112 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996333978 | 404 |
| research/371-deliberation/probe-371.md:122 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996333978 | 404 |
| research/371-deliberation/probe-371.md:131 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996344885 | 404 |
| research/371-deliberation/probe-371.md:113 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996781708 | 404 |
| research/371-deliberation/probe-371.md:170 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41997122885 | 404 |
| research/371-deliberation/probe-371.md:160 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41997296988 | 404 |
| research/371-deliberation/probe-371.md:161 | https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41997300108 | 404 |
| research/371-deliberation/probe-371b.md:49 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035726789 | 404 |
| research/371-deliberation/probe-371b.md:61 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035940584 | 404 |
| research/371-deliberation/probe-371b.md:60 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035944191 | 404 |
| research/371-deliberation/probe-371b.md:95 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036048745 | 404 |
| research/371-deliberation/probe-371b.md:111 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036084540 | 404 |
| research/371-deliberation/probe-371b.md:72 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036084540 | 404 |
| research/371-deliberation/probe-371b.md:96 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036470581 | 404 |
| research/371-deliberation/probe-371b.md:98 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036470590 | 404 |
| research/371-deliberation/probe-371b.md:82 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036606377 | 404 |
| research/371-deliberation/probe-371b.md:101 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036875378 | 404 |
| research/371-deliberation/probe-371b.md:102 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42037026805 | 404 |
| research/371-deliberation/probe-371b.md:112 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42037057564 | 404 |
| research/371-deliberation/probe-371b.md:112 | https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42037058036 | 404 |
| research/371-deliberation/survey-371-2-external.md:68 | https://docs.github.com/actions/using-workflows/required-workflows | 404 |
| research/373-deliberation/survey-373-2-external.md:57 | https://johner-institute.com/articles/software-iec-62304/safety-classes-level-of-concern | 404 |
| research/373-deliberation/survey-373-2-external.md:124 | https://www.mdcpp.com/doc/standard/IEC61508-1-1997.pdf | 000 |
| research/376-deliberation/survey-376-2-external.md:71 | https://presencis.com/regulations/iso-27001/article-A.5.3/ | 410 |
| research/379-deliberation/survey-379-2-external.md:229 | https://standards.iteh.ai/catalog/standards/sist/1fc38e10-624f-4e18-a0a8-5c3283e61a1a/iso-iec-27002-2022 | ? |
| research/431-link-triage.md:57 | https://standards.iteh.ai/catalog/standards/sist/1fc38e10-624f-4e18-a0a8-5c3283e61a1a/iso-iec-27002-2022 | ? |
