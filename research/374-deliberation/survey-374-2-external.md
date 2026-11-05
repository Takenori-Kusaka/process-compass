# #374 外部調査: 出荷判定(G-7)の「簡略」の中身

- 調査時点: 2026-11-05
- 担当: process-researcher(外部調査 2)
- 論点: 第8章テーラリングで S1 × CL0 の G-7 を「簡略」としているが、中身が定義されていない。次のどれにするかの判断材料を集める
  - (a) どの判定基準を省き、どれを残すかを決める
  - (b) 「適用」へ寄せる
  - (c) 「省略」へ寄せる
- 本標準の G-7 判定基準(2026-10-01 時点、`src/content/docs/phase5-implementation/ci-gates.md` の対応表による)
  - 1 計画したテストの消化率
  - 2 未解決の欠陥
  - 3 受容した負債の台帳記録
  - 4 運用引き継ぎ文書
  - 5 全ゲートの通過記録
  - 6 AI 品質指標の確認
  - 7 (安全関連ソフトウェアのみ)安全適合性の検証記録
  - 8 知財潔白性の検査記録
  - 9 保証の開示の完備
- 表記
  - 【原文確認】= 原文(またはその公開プレビュー)で確かめた事実
  - 【二次情報】= 解説・テンプレート・検索結果の抜粋で確かめたが、原典では確かめていない
  - 【未確認】= 筆者の記憶に基づく。原典で確かめていない。根拠に使わない
  - 解釈は末尾の「考察」節に分ける

---

## 出典ごとの記録

### S-01 IEC 62304:2006+AMD1:2015 1.4 Compliance・序文(公開プレビュー)

- URL: https://assets.vde-verlag.de/iec-normen/preview-pdf/info_iec62304%7Bed1.1%7Db.pdf (VDE Verlag の公開プレビュー。旧 URL https://www.vde-verlag.de/iec-normen/preview-pdf/info_iec62304{ed1.1}b.pdf から転送)
- 取得日: 2026-11-05
- 【原文確認】1.4 Compliance
  - "Compliance with this standard is defined as implementing all of the PROCESSES, ACTIVITIES, and TASKS identified in this standard in accordance with the software safety class."
  - "NOTE The software safety classes assigned to each requirement are identified in the normative text following the requirement."
  - "NOTE 3 Where any requirements contain "as appropriate" and were not performed, documentation for the justification is necessary for this assessment."
- 【原文確認】序文の用語
  - "where this standard uses the term "as appropriate" in conjunction with a required PROCESS, ACTIVITY, TASK or output, the intention is that the MANUFACTURER shall use the PROCESS, ACTIVITY, TASK or output unless the MANUFACTURER can document a justification for not so doing."
- 【原文確認】1.2 の適用範囲
  - "This standard does not cover validation and final release of the MEDICAL DEVICE, even when the MEDICAL DEVICE consists entirely of software."
- 【原文確認】目次上の 5.8 の題名は "Software RELEASE for utilization at a SYSTEM level"。プレビューは第3章冒頭までで、5.8 の本文と Table A.1(Summary of requirements by software safety class)は含まない
- 本件への示唆
  - IEC 62304 は、軽いクラスでの緩和を「要求事項ごとに、適用するクラスを本文に書く」方式で定義している。「簡略」のような包括語は使わない
  - 「as appropriate」の要求を実施しないときは、理由の文書化を求める。省いたことと理由が記録に残る形
  - 5.8 はソフトウェアの「リリース」であり、製品の最終リリースの判断(1.2 で範囲外)とは別物である。G-7 と対応づけるときは、この違いに注意が要る

### S-02 IEC 62304 5.8 の小項目のクラス別適用(二次情報)

- URL
  - https://openregulatory.com/iec-62304-mapping-requirements-documents/ (検索結果の抜粋で確認。本文の取得は 403)
  - https://templates.openregulatory.com/techdoc/62304/62304-mapping.docx (検索結果の抜粋で確認)
  - https://www.scribd.com/document/795109678/Checklist-Software-Release (検索結果の抜粋で確認)
  - https://jamb.readthedocs.io/en/latest/iec-62304/safety-classifications.html (取得して確認)
- 取得日: 2026-11-05
- 【二次情報】OpenRegulatory の対応表(検索結果の抜粋)
  - クラス A・B・C すべて: 5.8.1 Ensure software verification is complete、5.8.2 Document known residual anomalies、5.8.4 Document released versions、5.8.7 Archive software
  - クラス B・C のみ: 5.8.3 Evaluate known residual anomalies、5.8.5 Document how released software was created、5.8.6 Ensure activities and tasks are complete
  - 5.8.8(Assure reliable delivery of released software)は抜粋に現れず未確認
- 【二次情報】Scribd のチェックリストは 5.8.3 もクラス A に含めており、OpenRegulatory と食い違う
- 【二次情報】jamb の表は "Release | Required | Required | Required" と、活動単位でだけ「全クラスで必須」を示す
- 本件への示唆
  - 二次情報が一致する範囲では、最も軽いクラス A でもリリースの活動そのものは省かれない。残るのは「検証の完了の確認」「既知の残存異常の文書化」「リリースした版の文書化」「保管」
  - クラス A で外れる(とされる)のは、残存異常の評価、作り方の文書化、全活動の完了の確認。すなわち「記録を残して出す」は残し、「判定の深さ」を削る形
  - 規格本文(5.8 と Table A.1)では未確認。採否の根拠に使う前に、原文で確かめる必要がある

### S-03 ISO 9001:2015 8.6 Release of products and services、A.5 Applicability

- URL: https://www.eapo.org/wp-content/uploads/2024/04/iso-9001-2015.pdf (EAPO 掲載の英露対訳版。ISO の正本ではない)
- 取得日: 2026-11-05
- 【原文確認】8.6(英文)
  - "The organization shall implement planned arrangements, at appropriate stages, to verify that the product and service requirements have been met."
  - "The release of products and services to the customer shall not proceed until the planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, as applicable, by the customer."
  - "The organization shall retain documented information on the release of products and services. The documented information shall include: a) evidence of conformity with the acceptance criteria; b) traceability to the person(s) authorizing the release."
- 【原文確認】A.5 Applicability
  - "an organization can review the applicability of requirements due to the size or complexity of the organization, the management model it adopts, the range of the organization's activities and the nature of the risks and opportunities it encounters."
  - "The organization can only decide that a requirement is not applicable if its decision will not result in failure to achieve conformity of products and services."
- 【原文確認】6.1.2 "Actions taken to address risks and opportunities shall be proportionate to the potential impact on the conformity of products and services."
- 本件への示唆
  - リリースの判定は「計画した取り決め(planned arrangements)」の完了で決まる。取り決めの中身(何を確かめるか)は組織が計画で決める。軽くできるのは取り決めの中身である
  - 一方で、どの規模でも残る最小の記録が2つ明示されている。受入基準への適合の証拠と、リリースを許可した人の追跡可能性である
  - 取り決めを満たさずに出す道は「relevant authority(および該当すれば顧客)の承認」として残されている。省略ではなく、権限者の承認つきの例外として書かれている

### S-04 Google SRE 本 第27章 Reliable Product Launches at Scale

- URL: https://sre.google/sre-book/reliable-product-launches/
- 取得日: 2026-11-05
- 【原文確認】(取得ツールの抜粋による。全段落は取得できず、鍵となる文だけを確かめた)
  - "LCEs identified categories of low-risk launches that were highly unlikely to face or cause mishaps."
  - 低リスクの例として、新しいサーバ実行ファイルを伴わず、トラフィック増が 10% 未満の機能のローンチが挙げられ、その種のローンチには "an almost trivial checklist" が課された(取得ツールの要約。逐語の全文は未確認)
  - 良いローンチプロセスの基準: "Lightweight"("Easy on developers")、"Robust"("Catches obvious errors")、"Thorough"("Addresses important details consistently and reproducibly")、"Scalable"("Accommodates both a large number of simple launches and fewer complex launches")、"Adaptable"
  - "Every question's importance must be substantiated, ideally by a previous launch disaster."
  - "Google defines a launch as any new code that introduces an externally visible change to an application."
- 本件への示唆
  - 軽量化は「ゲートを省く」ではなく「低リスクの類型を定義し、その類型に短いチェックリストを当てる」形で行われている
  - 低リスクの類型は、変更の性質(新しい実行ファイルの有無、負荷の増分)で定義されている。事業の段階では定義されていない
  - チェックリストの各項目に、過去の障害という根拠を求めている。項目の採否に根拠を要求する点は、本標準の根拠水準マークの考え方と通じる

### S-05 ISO/IEC/IEEE 12207:2017 の構成(公開プレビュー)

- URL: https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed1.0%7Den.pdf
- 取得日: 2026-11-05
- 【原文確認】目次: 4.2 Full conformance(4.2.1 to outcomes、4.2.2 to tasks)、4.3 Tailored conformance、5.5.4 Tailoring、Annex A (normative) Tailoring process(A.2.1 Purpose、A.2.2 Outcomes、A.2.3 Activities and tasks)
- 【原文確認】1.2 "Annex A provides normative direction regarding the tailoring of these software life cycle processes."
- 【原文確認】序文 "An organization, depending on its purpose, can select and apply an appropriate subset to fulfill that purpose."
- 【原文確認】1.4 "This document does not detail information items in terms of name, format, explicit content and recording media."
- 4.3 と Annex A の本文はプレビューの範囲外で未確認
- 【未確認】筆者の記憶では、Annex A のタスクは、テーラリングの判断に影響する状況の特定、利害関係者の意見の取得、テーラリング判断の文書化と根拠(rationale)の記録を含む。原文で確かめていない
- 本件への示唆
  - 12207 は「適合」を full と tailored の2種類に分け、テーラリングを規範の附属書(Annex A)で手続きとして定める。テーラリングの結果は「部分集合の選択」として扱われる
  - 6.4.x(技術プロセス)のうち、リリースに近いのは 6.4.10 Transition process、6.4.9 Verification、6.4.11 Validation である(目次で確認)。個々のタスクの省略可否は本文未確認

### S-06 IPA SEC「ソフトウェア開発の標準プロセス 〜共通フレーム2007の概要〜」(2011)

- URL: https://www.ipa.go.jp/archive/files/000004771.pdf
- 取得日: 2026-11-05
- 注: 共通フレーム2013 本体ではなく、2007 第2版の解説スライドである。2013 版のテーラリング規定は未確認
- 【原文確認】スライド17「修整(テーラリング)とは」
  - 「共通フレームをそのまま適用するのではなく、組織(企業)やプロジェクトの特性(例えば開発モデル)に合わせて、共通フレームで規定されているプロセス/アクティビティ/タスクを取捨選択したり、繰り返し実行できるように、又は複数を一つに括って実行できるように組み替えたりする作業をいう。」
- 【原文確認】スライド18「テーラリングのポイント」
  - 「(2)「共通フレームに書いてあること」を、妥当と判断した場合には、省略してもよい。」
  - 「「修整」であり、「修正」ではない!」
- 【原文確認】スライド19「もし修整(テーラリング)をしなければ、どうなるのか?」
  - 「小規模プロジェクトにとって冗長的な作業項目が含まれ、生産性が低下する。」
  - 「安全性が特に求められるシステムを構築する場合は、品質保証活動(レビュー/検証/妥当性確認/監査など)が不足することとなり、システムの信頼性について確実な確信が持てなくなる。」
- 【原文確認】スライド17 の図: 共通フレーム → 組織(企業)標準 → 特性別(領域別)標準 → プロジェクト標準 の4レベルで、各段に「修整」を置く
- 本件への示唆
  - 日本の標準プロセスの系譜でも、軽量化は「取捨選択・統合」として位置づけられ、「妥当と判断した場合には省略してもよい」とされる。何を省くかの判断は、組織標準・プロジェクト標準へ委ねられている
  - 省略の判断の記録を求める記述は、このスライドには無い(2013 版本体で要確認)
  - 小規模で冗長、安全性重視で不足、という対の問題意識は、本標準の軸(事業ステージ × 安全重要度)と同型である

### S-07 Stage-Gate の縮約版(XPress・Lite)

- URL
  - https://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq.ipfs.4everland.io/wiki/Phase-gate_model.html (Wikipedia「Phase–gate model」のミラー。検索結果の抜粋で確認)
  - https://resources.rework.com/libraries/project-management/stage-gate-process (検索結果の抜粋で確認)
  - https://ideas.repec.org/a/eme/ejimpp/ejim-07-2014-0070.html (European Journal of Innovation Management の論文書誌。検索結果の抜粋で確認)
- 取得日: 2026-11-05
- 【二次情報】Wikipedia ミラー: "Moderate risk projects, including extensions, modification and improvements, use the short XPress version." "Very minor changes (e.g. sales force and marketing requests) may be executed using a lighter process (phase–gate lite)."
- 【二次情報】Rework のガイド: 低リスクの仕事では、段数を減らし、ゲートを統合し、文書を軽くした縮約版がよく使われる。名称は Stage-Gate International の公式の版を確かめるよう注記
- 【二次情報】EJIM 論文の書誌: XPress の利用者は他の版の利用者より、平均して成果が高かったと報告(本文は有料で未確認)
- Cooper または Stage-Gate International の一次資料は取得できなかった
- 本件への示唆
  - Stage-Gate の縮約は「段とゲートの統合」と「文書の軽量化」であり、ゲート内の判定基準を基準ごとに省く定義は、二次情報の範囲では見当たらない
  - 縮約版の適用条件は、プロジェクトのリスク区分(改良・拡張か、軽微な変更か)で決まる

### S-08 PRINCE2 のテーラリングと最小要件(二次情報)

- URL
  - https://www.axelos.com/resource-hub/blog/prince2-2017-update-balancing-minimum-requirements-and-tailoring (本文は取得できず、検索結果の抜粋のみ)
  - https://open-exam-prep.com/study-guides/prince2-practitioner/practices-overview-business-case/practices-overview (検索結果の抜粋)
- 取得日: 2026-11-05
- 【二次情報】PRINCE2 2017 版: 各テーマに最小要件(minimum requirements)を置き、それを満たさなければ PRINCE2 のプロジェクトと呼べないとした。AXELOS のブログは、最小要件をテーラリングの歯止めとして説明している
- 【二次情報】PRINCE2 7(2023)では、最小要件の語を外したとする受験対策サイトの記述がある。公式マニュアルでは未確認で、情報源どうしが食い違う
- 【二次情報】7つの原則は、どのテーラリングでも外せないとされる
- 本件への示唆
  - 2017 版の PRINCE2 は「テーラリングしても残る最小要件」を明示する型である。簡略の中身を、残すものの側から定義する例にあたる
  - 7 版で最小要件を外したことが事実なら、その理由は「項目を消化するだけの運用を招いた」とされる。最小要件の列挙が形骸化を生むという反対側の論拠になる(要原典確認)

### S-09 SAFe Release on Demand

- URL: https://framework.scaledagile.com/release-on-demand
- 取得日: 2026-11-05
- 【原文確認】"Deciding what and when to release is a critical economic driver."
- 【原文確認】"Critically, releases are decoupled from the work to deploy the functionality."
- 【原文確認】リリースの判断は Product Management と Business Owners の問いとして書かれている。"release governance" の節は会員向けで、本文を取得できなかった
- 本件への示唆
  - SAFe は、リリースの判断を経済的な判断として扱い、デプロイと切り離す。技術的な判定(デプロイ可能か)と事業的な判定(出すか)を別のものとして置く
  - 本標準で G-7(出荷判定)と G-8(事業決裁)を別の自然人が記名する構成と方向が一致する。簡略の議論で、G-7 の中身を G-8 側へ寄せない根拠の一つになりうる

### S-10 ISO/IEC 29110(VSE 向けプロファイル)

- URL
  - https://webstore.ansi.org/preview-pages/ISO/preview_ISO+IEC+29110-5-1-2-2025.pdf (検索結果で存在を確認。本文は未取得)
  - https://swplm29110-5-6-2.readthedocs.io/en/latest/PROJ-ProductAcceptance.html (29110-5-6-2 系のテンプレート。取得して確認)
- 取得日: 2026-11-05
- 【二次情報】ISO/IEC 29110-5-1-2 は 2025 年版が現行。旧版(2011)は TR であった
- 【二次情報】タイ語の解説(検索結果の抜粋): Basic プロファイルのプロジェクト管理の活動に Project Closure があり、プロジェクト計画の Delivery Instructions に従って引き渡し、顧客が署名する Acceptance Record で終える
- 【原文確認】テンプレート「Product Acceptance Record」は "Documents the Acquirer acceptance of the Deliverables of the project." とし、受領の記録(日付、受領した取得者の署名)、引き渡した要素、取得者の受入基準の検証、未解決事項(Open Issues)の4欄を持つ(欄の中身は TBD)
- Entry プロファイルと Basic プロファイルの引き渡し活動の差は、原文で確かめられなかった
- 本件への示唆
  - 最小規模の組織向けプロファイルでも、引き渡しには「受入基準の検証」と「未解決事項」と「署名」の欄が残る(テンプレートの範囲での確認)
  - Entry と Basic の差分を原文で確かめれば、「最も軽いプロファイルで引き渡しの何が省かれるか」の直接の例になる(追加調査が要る)

---

## 観点別の整理(調査フレームワーク)

- ロールモデル(リリースを決める人)
  - ISO 9001 8.6: リリースを許可した人の追跡可能性を記録に必須とする(S-03)
  - SAFe: 何を・いつ出すかは Product Management と Business Owners の問いとされる(S-09)
  - Google SRE: Launch Coordination Engineer(LCE)がチェックリストでローンチを導く(S-04)
- 組織的役割
  - Google の LCE は専門部隊としてローンチを審査し、低リスクの類型を定義する側に立つ(S-04)
  - 共通フレームは、組織標準 → プロジェクト標準の各段で修整を行う構造(S-06)
- ゲート・意思決定
  - 軽量化の型は3つに分かれる
    - 型1 基準ごとに適用の有無を本文で定める(IEC 62304 のクラス別の要求)(S-01, S-02)
    - 型2 低リスクの類型を定義し、その類型に短いチェックリストを当てる(Google LCE)(S-04)
    - 型3 段・ゲートを統合し文書を軽くする。基準の取捨は利用者に委ねる(Stage-Gate XPress・Lite、共通フレームの修整)(S-06, S-07)
  - 取り決めを満たさずに出す道は、権限者の承認つきの例外として書かれる(ISO 9001 8.6)(S-03)
- 成果物
  - どの軽量化でも残る記録の候補: 受入基準への適合の証拠、リリースの許可者、リリースした版、既知の残存異常、保管(S-02, S-03, S-10)
- レビュープロセス
  - IEC 62304 では、クラス A で「残存異常の評価」が外れるとされ、「文書化」は残る(二次情報)(S-02)
- 階層構造
  - 全体プロセス: 12207 の Annex A(テーラリング手続き)と 4.3 Tailored conformance(S-05)
  - フェーズ内ワークフロー: 62304 5.8 の小項目、Google のローンチチェックリスト(S-02, S-04)
  - 個別作業: 9001 8.6 の a)・b) の記録項目(S-03)

## 日本の実態(建前と実運用の乖離)

- 今回の範囲では、出荷判定の簡略化が形骸化を招いた事例や、品質判定会議の省略の実態を一次情報で示す資料は見つからなかった
- 共通フレーム2007 の解説は「妥当と判断した場合には省略してもよい」とするが、判断の記録を求める記述は無い(S-06)。省略の判断が記録に残らないまま運用される余地がある、という点は推測であり、事実としては未確認

---

## 考察(筆者の解釈。事実ではない)

- 外部の規格・実務で、ゲートを「簡略」という包括語だけで緩める例は見当たらなかった。緩める場合は、次のいずれかを伴う
  - 要求事項ごとの適用の有無(IEC 62304)
  - 低リスクの類型の定義と短いチェックリスト(Google LCE)
  - 段・ゲートの統合(Stage-Gate)で、取捨は利用者の文書化に委ねる(共通フレーム、12207 Annex A)
- したがって「簡略」を定義なしに残す案は、外部の書き方のどれにも当たらない。ADR-0088 が「定義の無い語で出荷判定を緩めることになる」と指摘した点(ADR-0088 却下理由の表)と整合する
- (a) 基準ごとに省く/残すを決める案は、IEC 62304 の型に最も近い。外部資料から、どの規模でも残る最小の記録として次が推せる
  - 受入基準への適合の証拠(9001 8.6 a)、62304 5.8.1 相当)→ G-7 基準1 の一部
  - 既知の残存異常の文書化(62304 5.8.2 相当)→ G-7 基準2 の「件数の開示」部分
  - リリースの許可者の追跡可能性(9001 8.6 b))→ G-7 の判定記録そのもの
  - リリースした版の文書化(62304 5.8.4 相当)→ G-7 基準5・9 の一部
  - 一方、外部資料で軽いクラスから外れるとされるのは「残存異常の評価」「作り方の文書化」「全活動の完了の確認」である(二次情報)。G-7 では、基準2 のトリアージ基準への照合、基準5 の全ゲート通過の確認の深さに当たりうる
- (c) 省略へ寄せる案は、ISO 9001 8.6 の「最小の記録」と衝突する。S1 は顧客へ出す段階であり、9001 の文脈では受入基準への適合の証拠と許可者の記録が残る。外部の規格に照らすと、記録ごと無くす根拠は乏しい
- (b) 適用へ寄せる案は、外部の実務と最も衝突が少ない。ただし Google SRE が挙げる「Lightweight」「Scalable」の基準と、共通フレームの「小規模で冗長」の懸念には応えない
- Google の型2 は、低リスクを「変更の性質」で定義している。本標準が事業ステージ(S1)で簡略を決める構造は、外部の型とずれる。リスク区分(R)を変更ごとに置く本標準の別の軸(ADR-0039)の方が、Google の型に近い。#374 の会議体で、簡略の条件を S1 に置き続けるか、変更のリスク区分へ寄せるかを論点にする価値がある
- PRINCE2 7 で最小要件を外したことが事実なら、「残す基準を列挙する」案(a)にも形骸化の反対論がある。この点は原典で確かめてから会議体に出す

## 埋められなかった穴(追加調査が要る)

- IEC 62304 5.8 の本文と Table A.1(クラス A に適用する小項目)。二次情報が 5.8.3 で食い違い、5.8.8 は未確認
- ISO/IEC/IEEE 12207:2017 の 4.3 Tailored conformance と Annex A の本文。6.4.10 Transition のタスクごとの記述
- ISO/IEC/IEEE 15288:2023 の該当箇所(未着手)
- ISO/IEC 29110 の Entry プロファイルと Basic プロファイルの引き渡し活動の差分(PM.4、SI.6 相当の本文)
- 共通フレーム2013 本体のテーラリング(修整)の規定。省略の判断の記録を求めるか
- PMBOK 第7版のテーラリングの記述(未着手)
- PRINCE2 7 の公式マニュアルで最小要件の扱い
- Cooper / Stage-Gate International の一次資料による XPress・Lite の定義
- SAFe の release governance の本文(会員向け)
- スタートアップの MVP のリリース判断の実務(未着手)
- 日本企業での出荷判定会議の形骸化・簡略化の実態を示す一次情報
