# 調査(Issue #341・#336)

2026-11-12。内部の調査(既存の ADR・条項・語彙との突合)と外部の調査を1つの調査で行った(軽)。外部の事実には SRC を付ける。今回足したカードは SRC-0731〜SRC-0737。

## 1. 内部の調査

### 1.1 1.3 の形と、版の追従の手続(ADR-0083)

- 1.3 は「引用規格はない。表は参考文献」と明記し、各行に版・用途・読んだ範囲・SRC を持つ(overview.md 59〜72 行)。`lint:citations`(`scripts/check-citations.mjs`)は、1.3 の表の行の版の呼び名が、行の引く SRC のカードの題名の最初の呼び名と一致することを確かめる(部分一致では通さない。ADR-0083 X-12)。1.3 の外の本文の引用は検査しない
- 追従の手続は `community/standard-editions.md`「引用規格の棚卸し」: 版の発行ごとに、1.3 の各行の文書の改訂の有無を確かめ、新しい版へ追従するかを**文書ごとに決める**。改訂があったことだけを理由に自動で追従しない。要求事項が変われば N を上げる。記録の所在を `edition.yaml` の `history[].citationReview` に書く
- `src/data/edition.yaml` は `edition: null`(第1版を発行していない)。棚卸しの記録の置き場はまだ1件も無い。**追従の決定を「版の発行の前の棚卸し」まで先送りすると、その間の決定の置き場は 1.3 の注記だけ**になる
- 1.3 の注記(78・80 行)は、12207 と ISO 9001 のどちらについても「追従を決めていない」と開示している。開示としては正しいが、#341 と #336 が決めるべき事項そのものである

### 1.2 12207 を引く箇所の用途(intake.md 3.1)

- 本標準の本文(T1〜T4)が 12207 に頼るのは、**プロセスを成果(Outcomes)で定義する構成の根拠**(1.3)と、**適合の箇条の本文を読めていない**という開示(EV-0106・H.10)の2点だけである
- 本標準の本文は、12207:2017 の附属書H「Application of Agile」を**どこでも引いていない**(`grep -rn "Application of Agile\|Agile"` で本文に該当なし。ADR と research だけ)。附属書H を先例として使ったのは #298 の調査2(`research/298-deliberation/survey-298-2-external.md` 119・196 行の「二段の型」)で、#298 の裁定がすでに「最新の先例は一段(適用範囲)」と直している(`council-04-standards.md` 215 行。ADR-0080 24 行に記録)
- **名の衝突**: 本標準の「附属書H」(保証の論証)と、12207:2017 の Annex H(アジャイル)は別物である。#341 の題と依頼文が両者を並べており、読み手が取り違えうる
- ADR-0009(章立て)は 12207:2017 の成果ベースと4プロセス群に依った。2026 年版も4プロセス群(合意・組織のプロジェクト支援・技術マネジメント・技術)を保つ(2.1)。ADR-0009 の決定と矛盾しない
- ADR-0068 32 行と EV-0106 の「12207:2017 の適合の箇条の本文は読めていない」は、決定の時点の読めた範囲の記録として正しい。2026 年版の適合の箇条(箇条4)も、本文は読めていない(2.1)
- `src/data/processes/*.yaml` の `iso12207Groups` は版を持たないキーで、4プロセス群の名に依る。2026 年版でも群は同じ
- ADR-0118・`provision-forms.yaml` の「システム統合プロセス」等は工程名の訳語で、2026 年版の目次にも integration が技術プロセスとして残る(まえがきの主な変更点)。版の主張ではない

### 1.3 ISO 9001 の対応表(H.10)と追随の現状

- H.10 は「適合は主張しない」。ISO 9001:2015 の箇条の番号と題を 16 行に添える。番号と題は 2015 年版の公開の目次により、題まで確かめ、本文と照合していない。2026 年版の本文は未確認で、「細分箇条の番号と題が変わっている場合は、題で引き直す」とすでに書いている(assurance-case.md 910〜913 行)
- 番号の正本は H.10 の1か所(qms-document-control.md 172 行)。ただし、**1.3 の外の本文に、版の無い ISO 9001 の箇条の引用が4件ある**: `gate-criteria.md` 274 行(ISO 9001 7.5.3。二次の解説 SRC-0692 の引用)、751・756 行(ISO 9001 8.6。EV の本文)、`roles-responsibilities.md` 1067 行(ISO 9001 5.3)、`tailoring-guide.md` 507 行(ISO 9001 8.6)。1.3 の規則「箇条・表・図を引くときは、必ず版を付ける」に反する(`lint:citations` の範囲外のため検出されていない)。753 行は `ISO 9001:2015 の 8.6` と版を持つ。ADR の中の言及(0073・0087・0091・0096・0112・0121・0125)は書き換えない
- 1.3 の行は「ISO 9001:2015 / JIS Q 9001:2015」で、**追補(ISO 9001:2015/Amd 1:2024、JIS Q 9001:2015/AMENDMENT 1:2025)を書いていない**(2.2)。H.10 は箇条4(組織の状況)を「対応を示さない」に入れており、追補が変えた箇所(4.1・4.2 の気候変動)と重ならない。ただし、1.3 は「読んだ版」を書く表であり、追補の有無が読み手に分からない

### 1.4 却下の記録の語彙(intake.md 3.3)

本標準は、却下を**対象ごとに別の手続**で記録する。共通の値の列挙は持たない。

| 対象 | 語と手続 | 誰が決めるか | 機械の役割 |
| --- | --- | --- | --- |
| 人の意見(3.10.4) | 理由のない反対は「意見として扱わない」 | 起案者が理由を添えて記録し、決定者が判定記録で確かめる | 欄の空欄を示すだけ(IMPL-0231・0215、undelivered) |
| AI の指摘(H.4、ADR-0075 決定8) | 採否の欄の「不採用(所在・根拠なし)」 | レビュア | 欠落を示すだけ。指摘を消さない |
| 検査そのもの(G-5「検査を外す変更の記録」) | 外した検査・止めていた場面・外した後に止めるもの(または止めない理由)・受け入れた者 | AI維持管理者(AI の名義を受け付けない) | 4欄の有無を検査(IMPL-0143、delivered) |
| 製品でないパス(G-5「除外の一覧」) | 一覧への登録 | 統制の設定の変更の承認 | 製品のコードとの同時の変更を禁止(IMPL-0202) |
| 基準を満たさないもの(7.3、欠陥トリアージ) | 例外承認、既知の不具合 | 定めた権限者 | — |

- ADR-0075 決定10: 「AI の指摘の書式を定めない。定めるのは含める値。構造を満たしたことを内容の根拠にしない」。却下の理由の値を列挙して課すことは、この方向に反する
- **確かめていない隙間**: G-5「基準値と除外設定の変更」(gate-criteria.md 847 行〜)は「検査の除外設定の追加」を別の変更に分けるが、**ソースの中の抑止の記述**(例: `eslint-disable`・`# noqa`・`@SuppressWarnings`。SARIF の `kind: inSource` に当たる)が「除外設定」に含まれるかを書いていない。本文に該当の語は無い(`grep -i "disable\|noqa\|抑止"` で該当なし)。準拠テンプレートの実装はこの作業ツリーで読めなかった

## 2. 外部の調査

### 2.1 ISO/IEC/IEEE 12207:2026

出典: SRC-0491(2026 年版の出版社の公開プレビュー。既存のカード)、SRC-0731(2017 年版の出版社の公開プレビュー。今回登録)。どちらも PDF を取得し pdftotext で文字に起こして、逐語で確かめた。

| 事項 | 2017 年版(SRC-0731) | 2026 年版(SRC-0491) |
| --- | --- | --- |
| 版 | First edition 2017-11 | Second edition 2026-04。「This second edition cancels and replaces the first edition (ISO/IEC/IEEE 12207:2017), which has been technically revised」 |
| 附属書 | A(規定。Tailoring process)・B・C・D(Process integration and process constructs)・E(Process views)・F(Software system architecture modelling)・G(SoS)・**H(参考。Application of Agile)**・I(12207:2008 との対応) | A(規定。Tailoring process)・B(Examples of process information items)・C(Process reference model for assessment purposes)・D(MBSSE)・**E(参考。Assurance and assurance cases)**。アジャイルの附属書は無い |
| アジャイル | 附属書H | 適用範囲: 「It is applicable for agile approaches and methods, which are most widely used for software development…」。まえがき: 箇条5 に「expanded content on agile methods, process application, and system concepts」 |
| 方法中立 | 適用範囲で宣言(#298 調査2) | 適用範囲: 「This document does not identify or require any specific software life cycle model, development methodology, method…」 |
| 適合 | 箇条4: 4.1・4.2(成果への完全適合・タスクへの完全適合)・4.3 修整適合(SRC-0642) | 箇条4: 4.2.1 Full conformance to outcomes、4.2.2 Full conformance to tasks、4.3 Tailored conformance(目次)。本文は読めない |
| 成果による定義 | 成果ベース(ADR-0009) | 序論: 15288 と「the same process purpose and process outcomes」を持つ。箇条5.5.2 Description of processes(目次)。4プロセス群(5.6.2〜5.6.5)を保つ |

- **#341 の前提(附属書H の廃止)は正しい**。2026 年版の附属書の一覧にアジャイルの附属書は無く、アジャイルの記述は適用範囲の1文と箇条5 へ移った(箇条5 の本文は読めない)
- 2026 年版には、**新しく参考の附属書E「Assurance and assurance cases」がある**。本標準の附属書H(保証の論証)と主題が重なる。本文は読めない
- 発行日: プレビューの PDF の更新の日時は 2026-04-29。iso.org の頁(/standard/90219.html)は 403 で読めなかった。#298 の規格委員は iso.org で 2026-04-29 の発行と 2017 年版の廃止を確かめたと記録している(`council-04-standards.md` 17 行)。本調査では iso.org で再確認していない
- 読めなかった範囲: 箇条2〜6 の本文、附属書A〜E の本文。JIS X 0160 の 2026 年版への追随の有無

### 2.2 ISO 9001 の改訂の状況(2026-11 時点)

| 事項 | 内容 | 出典 |
| --- | --- | --- |
| 発行 | ISO 9001:2026 は 2026-09-16 に発行された | SRC-0736(認証機関の発表。二次)、SRC-0542(解説。二次) |
| 2015 年版の状態 | ISO 9001:2015 は旧版(Historical) | SRC-0643。ISO 9001:2015/Amd 1:2024 も廃止とする記述が検索の結果にあった(Nemko の頁。カード化していない。確かめていない) |
| 移行 | 2015 年版の認証は 2029-09-30 まで有効。GAC Inc. の最終の決定による | SRC-0736(二次) |
| 構造 | 調和構造に従う。トップマネジメントに品質文化と倫理的な行動の推進を明示に求める | SRC-0736(二次)。H.10 が引く解説と一致 |
| 箇条1〜10 の番号の維持 | 発行元が案内していると H.10 は書くが、今回の出典では確かめられなかった | — |
| JIS | JIS Q 9001:2015 の追補1 が 2025-03-21 に公示(ISO 9001:2015/Amd 1:2024 と IDT)。本体と併せて 2025 年版として使う | SRC-0737 |
| JIS Q 9001:2026 | JISC が一致規格として改正する予定と、検索の要約は伝える。JISC の頁は 502 で読めなかった。発行の時期は不明 | 確かめていない |

- 読めなかった範囲: ISO 9001:2026 の本文と目次(iso.org は 403。公開の目次の写しは見つけていない)。細分箇条の番号と題が 2015 年版から変わったかは、二次の解説(SRC-0542 の 6.3 など)からの断片しか無い

### 2.3 外部の書式の「却下の側」の語彙

| 書式・製品 | 却下の表し方 | 理由の構造 | 出典 |
| --- | --- | --- | --- |
| SARIF 2.1.0(OASIS 標準) | `result.suppressions[]` の `suppression`。`kind`(inSource / external)= 抑止の**仕組み**。`status`(accepted / underReview / rejected、任意)= 抑止の**審査の状態** | **自由な文字列** `justification`(利用者が書く)。理由の列挙は無い | SRC-0732 §3.35 |
| GitHub code scanning | `state: dismissed` | `dismissed_reason` 必須: false positive / won't fix / used in tests / mitigated。自由文 `dismissed_comment`(280 字まで) | SRC-0733(API 2026-03-10) |
| GitHub Dependabot | `state: dismissed` | `dismissed_reason`: fix_started / inaccurate / no_bandwidth / not_used / tolerable_risk | SRC-0734 |
| GitHub secret scanning | `state: resolved` | `resolution`: false_positive / wont_fix / revoked / used_in_tests。`resolution_comment` は更新も削除もできない | SRC-0735 |

- **#336 の前提は半分だけ正しい**。交換の標準(SARIF)は、却下の**理由を構造化していない**。構造化しているのは仕組み(kind)と審査の状態(status)である。理由を列挙しているのは個々の製品の API で、**同じ提供者の中でも値の組が3通りに割れる**(誤り・見送り・テストでだけ使う・対処済み・修正に着手・使っていない・許容できるリスク)。#294 の調査2(`survey-294-2-external.md` 262 行)は SARIF の列挙値を「未確認」としていた。今回、OASIS の本文で確かめた
- SARIF の NOTE 1 は、抑止の目的を「方針が求めるすべての結果を見て、直したか直さないと明示に決めたかを監査人へ示す」ことに置き、kind が「技術者の合意を記録に明示するレビューの工程」を可能にするとする。**誰が抑止を受け入れてよいかは定めない**
- 外部の値には、本標準では権限を要する判断が混ざる。「won't fix」「tolerable_risk」「no_bandwidth」はリスクの受容に当たり、本標準では受容の権限(層1・G-8・7.3)を要する。「false positive」「inaccurate」は事実の判断で、H.4 の不採用に近い。「mitigated」は代償措置の主張で、G-5「検査を外す変更の記録」の3欄目(外した後に止めるもの)に近い。**値の名だけで対応づけると、権限の無い者の dismissed が受容として読まれる**
- 読めなかった範囲: GitHub の UI の却下の理由の説明(resolving-code-scanning-alerts の頁は一覧を載せていなかった)。`mitigated` の追加の日付(#294 の調査2 は 2026-08-20 とするが、今回は changelog を確かめていない)。Copilot code review の解決の理由(#294 の調査2 の記述のみ)
