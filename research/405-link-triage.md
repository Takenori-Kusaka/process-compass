# #405 リンク切れ検出(2026-11-02 の週次実行)の棚卸し

2026-11-04 に、Issue #405 の lychee の結果(エラー 109 件・タイムアウト 12 件、重複を除いて 104 URL)を 1 件ずつ確かめた記録です。前例は #299 を処理した PR #322 です。

## 確かめた方法

- **curl**: `curl -L -k` に一般的なブラウザの User-Agent(Chrome 130)と Accept / Accept-Language ヘッダを付けて GET した。手元(日本、家庭回線)から実行
- **DoH**: 接続エラーのホストは `https://dns.google/resolve` で名前解決を確かめた(NXDOMAIN = ドメインが消えている)
- **Wayback**: `https://archive.org/wayback/available` で保存版の有無を確かめた
- **WebFetch**: curl で 404 のものは、別経路の取得でも本文が得られないかを確かめた

## 1. 書き方の誤り(URL の直後の日本語・括弧を lychee が URL の一部として読んだもの)

URL と後ろの文字の間に半角空白を入れた。リンク先は変えていない。区切ったあとの URL を curl で取得した結果も記す。

| ファイル | 行 | 区切った URL | 直後の文字 | 区切ったあとの取得 |
|---|---|---|---|---|
| research/290-deliberation/survey-290-1-apparatus-total.md | 136 | https://www.nao.org.uk/reports/the-business-impact-target-cutting-the-cost-of-regulation/ | (取得 | 200 |
| 同 | 146 | https://ma.iaqg.org/wp-content/uploads/2019/11/ISO9001_2015_Guidance_on_Documented_Information.docx | 、取得 | 404(→ 2 へ) |
| 同 | 156 | https://6826.csail.mit.edu/2020/papers/google-analysis-cacm.pdf | (取得 | 200 |
| 同 | 157 | https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html | (取得 | 200 |
| 同 | 158 | https://engineering.fb.com/2020/12/10/developer-tools/probabilistic-flakiness/ | (取得 | 200 |
| 同 | 159 | https://research.google/pubs/why-dont-software-developers-use-static-analysis-tools-to-find-bugs/ | (取得 | 200 |
| 同 | 161 | https://www.notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules | (取得 | 200 |
| 同 | 167 | https://sre.google/sre-book/monitoring-distributed-systems/ | (取得 | 200 |
| 同 | 174 | https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-71B.pdf | (取得 | 200 |
| 同 | 183 | https://unintendedconsequenc.es/new-morality-of-attainment-goodharts-law/ | 、取得(タイムアウトとして報告) | 200 |
| research/291-deliberation/survey-291-1-g4-count.md | 139 | https://www.iapsam.org/psam12/proceedings/Presentations/paper_195_4.pdf | 。条番号は | 200 |
| research/291-deliberation/survey-291-2-assumption-observed.md | 113 | https://helio.zurb.com/blog/assumption-mapping/ | (2026-10-23 | 200 |
| 同 | 123 | https://raw.githubusercontent.com/github/spec-kit/main/templates/commands/specify.md | 、2026-10-23 | 200 |
| 同 | 124 | https://raw.githubusercontent.com/github/spec-kit/main/templates/spec-template.md | 、2026-10-23 | 200 |
| 同 | 132 | https://www.renesas.com/en/blogs/renesas-functional-safety-support-automotive-3-applying-iso-26262-standard-seooc-software | (2026-10-23 | 200 |
| 同 | 133 | https://www.embitel.com/blog/embedded-blog/what-is-safety-element-out-of-context-seooc-in-automotive-functional-safety | (2026-10-23 | 200 |
| 同 | 211 | https://student.cs.uwaterloo.ca/~cs445/Winter2026/Week09/09d_SRS_slides.pdf | 、2026-10-23 | 200 |
| research/291-deliberation/survey-291-3-ai-finding.md | 152 | https://www.graphite.com/docs/ai-review-comments | (FND-0222 | 200 |
| research/294-deliberation/survey-294-2-external.md | 73 | https://learn.chatgpt.com/docs/agent-approvals-security.md | (developers.openai.com | 200 |
| 同 | 87 | https://www.speakeasy.com/blog/owasp-agentic-top-10-explained | (一次: | 200 |
| 同 | 281 | https://agentpatterns.ai/code-review/dismissal-reason-capture/ | (著者不明 | 200 |
| 同 | 349 | https://arxiv.org/pdf/1801.06812 | (「29119 | 200 |
| research/315-deliberation/survey-315-2-external.md | 21 | https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed1.0%7Den.pdf | (SRC-0642 | 200 |
| 同 | 61 | https://kubernetes.io/docs/reference/using-api/deprecation-policy/ | (原文は | 200(/docs/reference/deprecation-policy/ へ転送) |
| 同 | 69 | https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks | (SRC-0573 | 200 |
| research/318-deliberation/survey-318-2-external.md | 71 | https://www.adacore.com/blog/a-fresh-take-on-do-178c-software-reviews | (Appéré | 200 |
| 同 | 100 | https://www.exida.com/articles/IEC-61508-Overview.pdf | (exida | 200 |
| 同 | 115 | https://www.csa.ch/en/blog/the-new-en-50716-rules-for-project-organisation | (CSA | 200 |

区切ったあと 404 になった ma.iaqg.org の docx は、2 の「消失(保存版を併記)」でも扱った。

## 2. 消失・移転(404・410)

curl(ブラウザの UA)と WebFetch の両方で 404・410 を確かめた。Actions からの要求にだけ 404 を返すもの(本文が得られるもの)は無かった。保存版は Wayback の可用性 API で status 200 の版を選び、元のファイルの URL の直後に「(保存版: <…>。2026-11-04 に併記)」の形で書き足した。旧 URL は `.lycheeignore` に `^` で始まる正規表現で足した(`^` が無いと、旧 URL を含む保存版の URL まで除外されるため)。

| ファイル:行 | URL | エラー | 分類 | 処置 | 確かめた方法 |
|---|---|---|---|---|---|
| research/282-survey-2026-09/verification.md:32、research/298-deliberation/survey-298-2-external.md:153、research/sources/catalog.md:651、SRC-0641 | https://www.five-is.com/download/agile-stage-gate-for-manufacturers | 404 | 消失 | 保存版 20251015104458 を併記。SRC-0641 は verification.note に追記(catalog.md は自動生成のため触らない)。ignore に追加 | curl 404・WebFetch 404・Wayback |
| research/290-deliberation/survey-290-1-apparatus-total.md:146 | https://ma.iaqg.org/wp-content/uploads/2019/11/ISO9001_2015_Guidance_on_Documented_Information.docx | 404(1 を直して判明) | 消失 | 保存版 20261013180741 を併記。ignore | curl 404・Wayback(保存版は 200 を確認) |
| research/290-deliberation/survey-290-3-escape-clause.md:157 | https://ma.iaqg.org/wp-content/uploads/2019/10/qp1220standardissues.pdf | 404 | 消失(保存版なし) | ignore | curl 404・Wayback なし |
| research/290-deliberation/survey-290-3-escape-clause.md:158 | https://www.nqa.com/en-ca/resources/blog/October-2020/non-applicable-requirements | 404 | 消失 | 保存版 20250904155735 を併記。ignore(en-us は地域選択の頁へ転送され、本文に届かない) | curl 404・WebFetch 404・Wayback |
| research/289-deliberation/survey-289-4-classlock-effectiveness.md:130 | https://cdn.presencis.com/regulations/iso-9001/article-10.2/ | 404 | 消失(保存版なし) | ignore(presencis.com 側の同じパスも 410) | curl・WebFetch 404・Wayback なし |
| research/291-deliberation/survey-291-3-ai-finding.md:142 | https://docs.hackerone.com/en/articles/8514356-quality-reports | 404 | 消失 | 保存版 20250114104643 を併記。ignore(ハッカー向けの別記事 8475116 は別文書のため差し替えない) | curl・WebFetch 404・Wayback(200 を確認) |
| research/291-deliberation/survey-291-4-ai-roundtrip.md:115 | https://preview.aclanthology.org/ingest-acl/2026.acl-srw.1/ | 404 | 移転 | https://aclanthology.org/2026.acl-srw.1/ へ差し替え、旧 URL を同じ行に記録。旧 URL を ignore | 移転先の title が同じ論文名(Multi-Agent Reasoning Improves Compute Efficiency)であることを curl で確認 |
| research/293-deliberation/survey-293-2-external.md:103 | https://git.polymech.info/polymech/zeroclaw/src/tag/v0.1.8/docs/operations/required-check-mapping.md | 404 | 消失(保存版なし) | ignore(リポジトリごと 404) | curl 404・Wayback なし |
| research/293-deliberation/survey-293-2-external.md:32 | https://tessl.io/registry/tessl/pypi-coverage/files/docs/exceptions.md | 404 | 消失(保存版なし) | ignore(パッケージの頁ごと 404) | curl 404・Wayback なし |
| research/294-deliberation/survey-294-2-external.md:325 | https://cybersecurity.cd.foundation/docs/phase-1/ssdf/ssdf-ps/ | 404 | 消失 | 保存版 20260415173208 を併記。ignore(サイトの sitemap に ssdf の頁が無い) | curl 404・sitemap・Wayback(200 を確認) |
| research/294-deliberation/survey-294-2-external.md:216 | https://support.claude.com/en/articles/11014257-about-claude-s-max-plan-usage | 404 | 消失 | 保存版 20260124232649 を併記。ignore | curl 404・Wayback |
| research/296-deliberation/survey-296-2-external.md:230 | https://graphite.com/blog/the-ideal-pr-is-50-lines-long | 404 | 消失 | 保存版 20261002192314 を併記。ignore | curl 404(graphite.dev からも同じ)・Wayback(200 を確認) |
| research/296-deliberation/survey-296-2-external.md:31 | https://www.adacore.com/uploads/techPapers/couverture_ertss2010.pdf | 404 | 消失 | 保存版 20240725171200 を併記。ignore | curl 404・Wayback |
| research/298-deliberation/survey-298-2-external.md:110 | https://aami.org/training/training-suites/software-cybersecurity/key-updates-aami-tir45-2023-guidance-on-agile-practices | 404 | 消失(保存版なし) | ignore | curl・WebFetch 404・Wayback なし |
| research/312-deliberation/survey-312-2-external.md:72、research/318-deliberation/survey-318-2-external.md:46 | https://presencis.com/regulations/iso-26262/article-2-safety-management/ | 410 | 消失(保存版なし) | ignore(サイトは条項別の記事を廃止し、概要・チェックリスト等の頁へ再編) | curl 410・索引頁のリンク一覧・Wayback なし |
| research/314-deliberation/survey-314-2-external.md:79 | https://presencis.com/regulations/iso-26262/article-6-software-verification/ | 410 | 消失(保存版なし) | ignore | 同上 |
| research/313-deliberation/survey-313-2-external.md:117 | https://www.sac-accreditation.gov.sg/files/Documents/iaf_md26_issue_2_15012023.pdf | 404 | 消失 | 保存版 20250404210304 を併記。ignore。参考: 同名の文書が IAF に https://iaf.nu/iaf_system/uploads/documents/IAF_MD26_Issue_2_15012023.pdf (200)としてある。読んだ写しと同一かは確かめていないため差し替えない | curl 404(小文字の documents でも 404)・Wayback |
| research/313-deliberation/survey-313-2-external.md:164 | https://www.tuv-nord.com/fileadmin/Content/TUV_NORD_COM/TUV_USA/Documents/Quality_Management_Documents/P008_Certification_Reduction_of_Scope_Suspension__or_Withdrawal_rev_3_03162016.pdf | 404 | 消失(保存版なし) | ignore | curl 404・Wayback なし |
| research/314-deliberation/survey-314-2-external.md:186 | https://github.com/agentwares/agentsmd-lint | 404 | 消失(保存版なし) | ignore(組織 agentwares ごと 404) | curl 404・Wayback なし |
| research/314-deliberation/survey-314-2-external.md:228 | https://origin-www.gsa.gov/system/files/Plan-of-Action-and-Milestones-%28POAM%29-%5BCIO-IT-Security-09-44-Rev-8%5D-09-14-2022.pdf | 404 | 消失 | 保存版 20250222143018 を併記。ignore(www.gsa.gov の同じパスも 404) | curl 404・Wayback |
| research/316-deliberation/survey-316-2-external.md:144・243 | https://github.com/OWASP/ASVS/blob/master/5.0/en/0x03-Using-ASVS.md | 404 | 移転 | https://github.com/OWASP/ASVS/blob/master/5.0/en/0x03-What-is-the-ASVS.md へ差し替え、旧 URL を同じ行に記録。旧 URL を ignore | GitHub の履歴でコミット 3814a7cb(2025-05-22、using ASVS から what is the ASVS への改名)を確認。移転先に、引いた 3 文(識別子の書式・版の前置・版を省いた場合)があることを確認 |
| research/319-deliberation/survey-319-2-external.md:241 | https://eprints.ost.ch/id/eprint/1381/ | 404 | 消失 | 保存版 20261014025932 を併記。ignore(orix.ost.ch の旧 ID 転送先も 404) | curl 404・Wayback |
| research/phase4-standard/237-reuse-make-or-buy-standards.md:309 | https://iso26262.academy/features/concepts/software-qualification | 404 | 消失(保存版なし) | ignore | curl・WebFetch 404・Wayback なし |
| research/phase4-standard/gate-record-03-industry-practice.md:389 | https://graphite.com/blog/code-review-best-practices | 404 | 消失 | 保存版 20260514015751 を併記。ignore(/guides/code-review-best-practices は「Code review best practices」という別の記事で、引いた「Empirically supported…」ではないため差し替えない) | curl 404・移転候補の題名・Wayback |
| research/phase4-standard/gate-record-03-industry-practice.md:375 | https://graphite.com/blog/how-google-does-code-review | 404 | 消失 | 保存版 20260725153917 を併記。ignore | curl 404(graphite.dev・/guides/ も不可)・Wayback |

## 3. 5xx・タイムアウト・接続エラー

07:48・07:55・08:31(JST)の 3 回、curl で確かめた。lychee の起票条件(4xx のみ)には掛からない。

### 3-a. 恒常的(ドメインが名前解決できない)→ 2 と同じ扱い

DoH(dns.google)で NXDOMAIN。isec.ipa.go.jp は応答はあるが A レコードが無い。3 回とも curl は exit 6(名前解決の失敗)。

| ファイル:行 | URL | lychee のエラー | 処置 |
|---|---|---|---|
| research/292-deliberation/survey-292-1-inventory.md:257、survey-292-3-external.md:55、research/314-deliberation/survey-314-2-external.md:93 | https://automate.fedramp.gov/documentation/ssp/6-security-controls | Connection failed | 保存版 20250523085917 を併記。ignore |
| research/phase4-standard/126-tool-integration.md:120 | https://cio.go.jp/guides/ | Connection failed | 保存版 20251210232836 を併記。ignore |
| research/phase4-standard/126-tool-integration.md:355 | https://isec.ipa.go.jp/benchmark-main/ | Connection failed | 保存版 20191113100708 を併記。ignore |
| research/phase4-standard/126-tool-integration.md:105 | https://www.cmmi.co.uk/cmmi/OPD.htm | Connection failed | 保存版 20240805000902 を併記。ignore |
| research/phase4-standard/288/research-02-international.md:339 | https://davidbarker.consulting/iso9001/clause-8-6-release-of-products-and-services | Connection failed | 保存版 20250710055911 を併記。ignore |
| research/phase4-standard/125-105-d0-governance-chart.md:48 | https://publications.axelos.com/PRINCE2Agile2016/content.aspx?page=pra_199&showNav=true&expandNav=true | Connection failed | 保存版 20210509190455 を併記。ignore |
| research/phase4-standard/106-context-handover.md:40 | https://workplaceinsights.microsoft.com/employee-experience/onboarding-buddy/ | Connection failed | 保存版 20240524003722 を併記。ignore |
| research/316-deliberation/survey-316-2-external.md:41 | https://iteh.es/catalog/standards/iso/71a606f9-9681-4ef6-b389-fe051c8a83a0/iso-iec-ieee-24748-3-2020 | Connection failed | 保存版なし。ignore |
| research/phase4-standard/113-114-seeded-errors.md:229 | https://www.aviatorlegacies.com/post/james-reason-s-just-culture-enhancing-safety-reporting-in-aviation | Connection failed | 保存版なし。ignore |

### 3-b. 手元から到達できた → 一時的・実行環境依存。何もしない

| URL | lychee のエラー | 手元の結果 |
|---|---|---|
| https://sback.it/publications/ の icse2013.pdf・icse2018seip.pdf・icse2019a.pdf・icse2020.pdf | HTTP/2 protocol error | 200 |
| https://agilealliance.org/glossary/bdd/ 、 https://agilealliance.org/resources/experience-reports/distribute-design-authority-with-architecture-decision-records 、 https://www.agilealliance.org/wp-content/uploads/2016/01/Agile-2012-The-0-Page-Agile-Test-Plan-Paul-Carvalho.pdf | HTTP/2 protocol error | 200 |
| https://acqnotes.com/acqnote/acquisitions/milestone-overview 、 https://associationforsoftwaretesting.org/2014/09/05/the-iso29119-debate/ 、 https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html 、 https://www.tricentis.com/blog/qa-trends-ai-agentic-testing 、 https://www.shaunabram.com/wp-content/uploads/2025/10/2025_state_of_ai_assisted_software_development.pdf | HTTP/2 protocol error | 200 |
| https://iaf.nu/general_information/expected-outcomes-for-accredited-certication-to-iso-management-system-standards-such-as-iso-9001-and-iso-14001 、 https://iaf.nu/iaf_system/uploads/documents/IAFID9Transition9001PublicationVersion.pdf 、 https://www.simpleque.com/a-look-at-the-2024-iso-survey-and-iso-9001-iso-14001-and-iso-45001-certifications-worldwide/ | 502 | 200(3 回とも) |
| https://unsworks.unsw.edu.au/bitstreams/12a27234-0c28-4ce0-8e11-bdb02ed21c85/download 、 https://byteiota.com/ai-prs-wait-4-6x-longer-linearb-2026-benchmarks/ | 500 | 200 |
| https://umbrex.com/resources/frameworks/ の 3 頁(stage-gate-phase-gate、raci-matrix-responsible-accountable-consulted-informed、rapid-decision-rights-framework) | 520 | 200 |
| https://byteiota.com/software-engineering-benchmarks-2026-ai-code-review-gap/ 、 https://www.gihub.org/resources/publications/the-green-book-five-case-model/ | タイムアウト | 200 |
| https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/knowledge-conference-forum/88/1/Knowledge%20Management.pdf | タイムアウト | 200(ただしサインインの頁へ転送される。本文の取得にはログインが要る。調査メモの記述は変えない) |
| https://www.edn.com/program-sequence-monitoring-using-watchdog-timers/ | HTTP/2 protocol error | curl はタイムアウト、WebFetch で本文(題名一致)を取得 |
| https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code 、 https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/ | HTTP/2 protocol error・520 | 403(bot 判定。workflow は 403 を許容) |

### 3-c. 確認できず(3 回とも手元からも到達できない、または 5xx が続く)→ 何もしない

ドメインは名前解決でき、サイト全体(トップの頁を含む)が手元から応答しないものが多い。取得の経路(CDN の bot 判定・地域の制限)による可能性を否定できないため、消失とは判断しなかった。次回の週次でも続くなら、ブラウザで確かめて 2 の扱いへ移す。

| URL | lychee のエラー | 手元の結果(3 回) |
|---|---|---|
| https://ipsj.ixsq.nii.ac.jp/records/2011757 、 2011758 | 503 | 406(トップも 406)。WebFetch は 503 |
| https://www.jisc.go.jp/mss/qms.html | 502 | 502(トップも 502) |
| https://learn.mountaingoatsoftware.com/blog/scrummasters-should-not-also-be-product-owners | 523 | 522(WebFetch も 522、Retry-After 120) |
| https://www.analog.com/en/resources/analog-dialogue/ の 3 頁(improving-industrial-functional-safety-part-3・part-4、raq-issue-226)、 https://ez.analog.com/b/engineerzone-spotlight/posts/software-tools | HTTP/2 protocol error | タイムアウト・受信失敗(トップも同じ)。WebFetch もタイムアウト |
| https://www.eaton.com/gb/en-gb/markets/machine-building/service-and-support-machine-building-moem-service-eaton/blogs/difference-between-sil-and-pl.html | HTTP/2 protocol error | 受信失敗・タイムアウト(トップも同じ) |
| https://www.imdrf.org/sites/default/files/2025-01/IMDRF_SaMD%20WG_Software-Specific%20Risk_N81%20Final_0.pdf 、 https://www.imdrf.org/sites/default/files/docs/imdrf/final/technical/imdrf-tech-140918-samd-framework-risk-categorization-141013.pdf | HTTP/2 protocol error | タイムアウト(トップも同じ)。WebFetch もタイムアウト |
| http://sunnyday.mit.edu/STAMP-publications.html | タイムアウト | タイムアウト。WebFetch は接続拒否 |
| http://www.cs.sjsu.edu/~pearce/modules/topics/uml/spem.pdf 、 http://crestweb.cs.ucl.ac.uk/resources/mutation_testing_repository/theory.php 、 https://asterix-gerrit.ics.uci.edu/Documentation/config-labels.html 、 https://www2007.cpsc.ucalgary.ca/program/paper.php?id=447 、 https://glossary.mizuho-sc.com/faq/show/319 | タイムアウト | タイムアウト(トップも同じ) |

## 4. 出典台帳(research/sources/)

旧 URL を台帳で検索した結果、該当は SRC-0641(five-is.com)だけだった。`url` は取得時の記録として変えず、`verification.note` に消失と保存版を追記した。`npm run lint:sources` は「問題なし」。catalog.md は自動生成のため再生成していない(note は catalog に出ない)。

## 件数

| 分類 | URL の件数 |
|---|---|
| 1. 書き方の誤り(区切りを入れた) | 28 |
| 2. 消失・保存版を併記 | 13 |
| 2. 消失・保存版なし(ignore のみ) | 10 |
| 2. 移転(差し替え) | 2 |
| 2. Actions からだけ 404 | 0 |
| 3-a. 恒常的(NXDOMAIN)・保存版を併記 | 7 |
| 3-a. 恒常的(NXDOMAIN)・保存版なし | 2 |
| 3-b. 到達可能(一時的・環境依存) | 26 |
| 3-c. 確認できず | 17 |

docx(ma.iaqg.org)は 1 と 2 の両方に数えている。src/content/docs/ の標準の本文にはエラーが無かった。
