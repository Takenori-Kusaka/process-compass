# 週次リンク検査(#453)の 4xx の棚卸し

- 実施日: 2026-11-26
- 入力: #453 の 4xx 18 件(402・409・410 を各1件、999 を1件含む)。Errors 108 件のうち、残る 90 件は扱わない(タイムアウト・5xx・接続失敗・HTTP/2 エラーなど一時的なもの。#405・#437・#451 と同じ方針。件数だけ記録)
- 確かめた方法: 検査と同じ UA の curl で、リダイレクトを追って状態を取り直した
- 扱い: 編集の指摘として直した(会議体は開かない)

## 書き方の誤り(9 件)

URL の直後に全角の読点・句点・括弧、または半角の括弧が続き、URL の一部として読まれていた。URL と後続の間に半角空白を入れた(URL が読点でつながる2行は、後ろの URL の直前にも入れた)。文意は変えていない。直した後の URL は curl で 200 を確かめた(linkedin を除く)。

| ファイル | 件数 |
| --- | --- |
| research/298-deliberation/council-04-standards.md | 1 |
| research/355-deliberation/b13-research-external.md | 1 |
| research/357-deliberation/survey-external.md | 1 |
| research/359-deliberation/survey-external.md | 1 |
| research/406-roles-estimation/survey-external.md | 1 |
| research/424-deliberation/survey-424-2-external.md | 1 |
| research/441-443-444-deliberation/decision.md・review-round1.md | 2 |
| research/447-deliberation/research-standards.md | 1 |

tr.linkedin.com/in/nida-baser は直しても curl が 999 を返す。自動の取得を拒む相手であり、.lycheeignore へ足した(下表の外)。

## 消失・削除済み(.lycheeignore へ理由つきで追加。8 件・6 URL)

curl でも 404(ecosyste.ms は 402、depscope は 410)が続く。

| 所在 | URL | 状態 |
| --- | --- | --- |
| research/329-deliberation/sources-draft.md:93 | https://iso27001security.com/ISO27k_ISMS_A8.32_skeleton_policy_on_change_management_2023.txt | 404 |
| research/355-deliberation/b20-research-external.md:102・149 | https://preview.aclanthology.org/ingest-eacl/2026.eacl-long.182.pdf | 404 |
| research/355-deliberation/b20-research-external.md:100・148 | https://www.cs.wm.edu/semeru/tefse2011/papers/p58-dekhtyar.pdf | 404 |
| research/427-deliberation/survey-427-2-external.md:35 | https://arxiv.org/html/2606.19544 | 404 |
| research/b28-deliberation/research-ext-1.md:96 | https://awesome.ecosyste.ms/projects/github.com%2Fzimmski%2FGo-mutesting | 402 |
| research/b28-deliberation/research-ext-1.md:91 | https://depscope.dev/pkg/pypi/mutmut | 410 |

## 扱わない(1 件と 90 件)

- research/phase4-standard/review-burden-03-metadesign.md:15 の globalgbc.org(409): 取り直すと 200。一時的な応答であり、扱わない
- 4xx 以外の 90 件(タイムアウト・5xx・接続失敗・HTTP/2 エラーなど)は、一時的なものとして扱わない。サイトの側の状態で応答が変わるため、除外すると本物の消失を見逃す
- 除外は URL を指定した先頭一致であり、ドメイン全体は除外していない(#451 の突合の低-3 と同じ。末尾を固定しない前例に合わせた)
