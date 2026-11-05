# 週次リンク検査(#431)の 4xx の棚卸し

- 実施日: 2026-11-05
- 入力: #431(手動で起動した Link Check の実行 41961280086)の 4xx 56 件。タイムアウト 43 件は扱わない(#405 と同じ方針: 実行環境から到達できないだけの場合が大半)
- 確かめた方法: 検査と同じ UA(process-compass-link-check/1.0)の curl で、リダイレクトを追って状態を取り直した
- 標準の本文(src/content/docs)と README には、消失した URL は無かった

## 書き方の誤り(37 件)

URL の直後に全角の記号(】。、など)・括弧が続き、検査器が URL の一部として読んでいた。URL と後続の文字の間に半角の空白を入れた。直した後の URL の状態も併記する。

| 所在 | URL | 直した後の状態 |
| --- | --- | --- |
| research/406-roles-estimation/survey-external.md:188 | https://accu.org/content/conf2008/Coplien-20080504FiveSolutions.pdf | 200 |
| research/406-roles-estimation/survey-external.md:94 | https://arxiv.org/abs/2410.12944v3 | 200 |
| research/406-roles-estimation/survey-external.md:44 | https://arxiv.org/abs/2608.02582 | 200 |
| research/406-roles-estimation/survey-external.md:78 | https://basecamp.com/shapeup/1.2-chapter-03 | 200 |
| research/406-roles-estimation/survey-external.md:107 | https://code.claude.com/docs/en/monitoring-usage | 200 |
| research/406-roles-estimation/survey-external.md:41 | https://cosmic-sizing.org/cosmic-sizing/functional-size-measurement/second-generation/ | 200 |
| research/406-roles-estimation/survey-external.md:151 | https://ddat-capability-framework.service.gov.uk/delivery-manager.html | 200 |
| research/406-roles-estimation/survey-external.md:150 | https://framework.scaledagile.com/release-train-engineer/ | 200 |
| research/406-roles-estimation/survey-external.md:42 | https://frostburg-state-university.github.io/bju/lectures/lecture-12-ai-estimation/ | 200 |
| research/406-roles-estimation/survey-external.md:57 | https://juas.or.jp/cms/media/2025/03/25swm.pdf | 200 |
| research/406-roles-estimation/survey-external.md:60 | https://monoist.itmedia.co.jp/mn/articles/2506/24/news011_3.html | 200 |
| research/406-roles-estimation/survey-external.md:164 | https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity | 200 |
| research/406-roles-estimation/survey-external.md:72 | https://onlinepmcourses.com/monitoring-and-controlling-what-is-the-pmbok-7-measurement-performance-domain/ | 200 |
| research/406-roles-estimation/survey-external.md:139 | https://scrumguides.org/scrum-guide.html | 200 |
| research/406-roles-estimation/survey-external.md:67 | https://scrumguides.org/scrum-guide.html | 200 |
| research/406-roles-estimation/survey-external.md:187 | https://sites.google.com/site/agilepatterns/agilepatterns-org/proxy-product-ownership | 404 |
| research/406-roles-estimation/survey-external.md:195 | https://thehuman2ai.pages.dev/research/best-practices/nngroup-ai-simulations-digital-twins | 200 |
| research/406-roles-estimation/survey-external.md:19 | https://web-backend.simula.no/sites/default/files/publications/Simula.simula.2440.pdf | 200 |
| research/406-roles-estimation/survey-external.md:117 | https://www.finops.org/wg/finops-for-ai-overview/ | 200 |
| research/406-roles-estimation/survey-external.md:55 | https://www.ipa.go.jp/archive/publish/qv6pgp0000000wvg-att/000005104.pdf | 200 |
| research/406-roles-estimation/survey-external.md:49 | https://www.ipa.go.jp/digital/chousa/metrics/metrics2022.html | 200 |
| research/406-roles-estimation/survey-external.md:54 | https://www.ipa.go.jp/sec/publish/tn04-011.html | 200 |
| research/406-roles-estimation/survey-external.md:190 | https://www.nngroup.com/articles/synthetic-users/ | 200 |
| research/406-roles-estimation/survey-external.md:185 | https://www.producttalk.org/glossary-discovery-continuous-discovery/ | 200 |
| research/406-roles-estimation/survey-external.md:155 | https://www.scrum.org/resources/blog/10-scrum-master-interview-questions-ai-era | 403 |
| research/406-roles-estimation/survey-external.md:161 | https://www.scrum.org/resources/blog/gaming-velocity-how-not-measure-success-and-what-avoid | 403 |
| research/406-roles-estimation/survey-external.md:134 | https://www.techinterview.org/post/3233475304/em-and-ai-how-llms-change-engineering-management-2026/ | 200 |
| research/415-deliberation/survey-415-2-external.md:59 | https://arxiv.org/pdf/1302.3642 | 200 |
| research/415-deliberation/survey-415-2-external.md:34 | https://discovery.larc.nasa.gov/PDF_FILES/SPD-19_PI-ledmissions_70JCL.pdf | 200 |
| research/422-deliberation/survey-422-2-external.md:50 | https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle | 200 |
| research/422-deliberation/survey-422-2-external.md:70 | https://claude.com/blog/how-anthropic-teams-use-claude-code | 200 |
| research/422-deliberation/survey-422-2-external.md:62 | https://www.anthropic.com/institute/recursive-self-improvement | 200 |
| research/422-deliberation/survey-422-2-external.md:67 | https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic | 200 |
| research/424-deliberation/survey-424-2-external.md:250 | https://developers.openai.com/api/docs/guides/evaluation-best-practices | 200 |
| research/424-deliberation/survey-424-2-external.md:176 | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf | 200 |
| research/427-deliberation/survey-427-2-external.md:189 | https://tianpan.co/blog/2026-04-23-llm-judge-drift-evaluator-upgrade-phantom-regression | 200 |
| research/427-deliberation/survey-427-2-external.md:159 | https://www.emergentmind.com/papers/2512.05379 | 200 |

## 消失(.lycheeignore へ理由つきで追加)

| 所在 | URL | 状態 |
| --- | --- | --- |
| research/406-roles-estimation/survey-external.md:187 | https://sites.google.com/site/agilepatterns/agilepatterns-org/proxy-product-ownership | 404(書き方を直した後も消失) |
| research/379-deliberation/survey-379-2-external.md:229 | https://standards.iteh.ai/catalog/standards/sist/1fc38e10-624f-4e18-a0a8-5c3283e61a1a/iso-iec-27002-2022 | 200 |
| research/380-deliberation/survey-380-2-external.md:165 | https://www.github.com/theoremlp/required-reviews | 404 |
| research/407-deliberation/survey-407-2-external.md:115 | https://student.cs.uwaterloo.ca/~cs430/CII_modelman2000.0.pdf | 404 |
| research/407-deliberation/survey-407-2-external.md:147 | https://www.agilebusiness.org/dsdm-project-framework/moscow-prioririsation.html | 404 |
| research/407-deliberation/survey-407-2-external.md:165 | https://www.city.osaka.lg.jp/ictsenryakushitsu/cmsfiles/contents/0000251/251904/RFItouRYUIJIKOU20250801.pdf | 404 |
| research/414-deliberation/survey-414-2-external.md:146 | https://processgroup.com/benchmark-team-files-release/TPG-cmmi-V3-SVC-condensed-practices-v1.pdf | 404 |
| research/414-deliberation/survey-414-2-external.md:109 | https://www.scruminc.com/?p=764 | 404 |
| research/415-deliberation/survey-415-2-external.md:88 | https://nicolas-brown-tdxj.squarespace.com/blog/tag/Forecasting | 404 |
| research/417-deliberation/survey-417-2-external.md:188 | https://processgroup.com/benchmark-team-files-release/TPG-cmmi-V3-SVC-condensed-practices-v1.pdf | 404 |
| research/417-deliberation/survey-417-2-external.md:184 | https://www.simula.no/research/impact-lessons-learned-sessions-effort-estimation-and-uncertainty-assessments | 404 |
| research/417-deliberation/survey-417-2-external.md:185 | https://www.simula.no/research/origami-software-development-review-studies-judgment-based-predictions-performance-time | 404 |
| research/417-deliberation/survey-417-2-external.md:183 | https://www.simula.no/research/what-we-do-and-dont-know-about-software-development-effort-estimation | 404 |
| research/418-deliberation/survey-418-2-external.md:52 | https://firebrand.training/se/learn/pmp/course-material/project-integration-management/perform-integrated-change-control | 404 |
| research/418-deliberation/survey-418-2-external.md:91 | https://help.easyagile.com/easy-agile-programs/pi-objectives | 404 |
| research/418-deliberation/survey-418-2-external.md:33 | https://project-management-basics.com/prince2009/PRINCE2_2009_041_Organization_The_PRINCE2_approach_The_project_management_team_Change_Authority | 404 |
| research/419-deliberation/survey-419-2-external.md:124 | https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/overlay-repository/overlay-overview | 404 |
| research/419-deliberation/survey-419-2-external.md:122 | https://gravidor.gitbooks.io/800-53/the_fundamentals/22_security_control_structure.html | 401 |
| research/419-deliberation/survey-419-2-external.md:30 | https://presencis.com/regulations/iso-13485/article-5.5/ | 410 |
| research/424-deliberation/survey-424-2-external.md:24 | https://preview.aclanthology.org/setup/2025.gem-1.33 | 404 |

## 扱いを変えなかったもの

- scrum.org の2件は 403(bot 判定)。検査は 403 を受け入れるため、空白を入れた後は検出されない
- standards.iteh.ai の1件は、確かめ直すと 200 だった。一時的な失敗として変えていない
- 保存版(Wayback Machine)は探していない。調査メモの出典は取得時の記録として残す
