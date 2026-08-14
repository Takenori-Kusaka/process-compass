# 「作るか、あるものを使うか」に既存規格は何を要求しているか

- 調査日: 2026-08-13(第2版。同日に追加調査を反映)
- 対象 Issue: #237
- 目的: 「自前実装の前に既存部品を探す義務」の先例を、規格・法令・実務・研究から集める

## 0. 読了状況とツール制約の明示

### 0.1 この環境で PDF はどこまで読めたか

Bash がこのセッションで無効化されており、`curl` + `pdftotext` は使えません。Read ツールの PDF 経路も `pdftoppm` 未導入で失敗します。代替として **テキスト抽出プロキシ(r.jina.ai)経由の WebFetch** を使い、PDF 本文の取得に成功しました。

判明した制約です。

- **成功**: ISO/IEC/IEEE 12207:2026 のサンプル PDF(目次・まえがき)、Automotive SPICE PAM 4.0 日本語版の目次
- **制約**: プロキシは**おおむね 100ページ相当で打ち切られる**。CMMI-DEV V1.3(482ページ、DAR は 149ページ)は、複数のホストを試しても DAR 節へ到達できなかった
- **失敗**: kilthub(403)、O'Reilly(403)

**引き継ぎ**: `pdftotext` が使える環境なら、CMMI DAR の原典は次の1コマンドで確定できます。

```bash
curl -sL -A "Mozilla/5.0" -o cmmi13.pdf \
  "https://se.inf.ethz.ch/courses/2013b_fall/dsl/slides/reading_material/cmmi-for-development_13.pdf"
pdftotext -layout -f 145 -l 160 cmmi13.pdf -
```

同一ファイルは <https://www.gob.mx/cms/uploads/attachment/file/922687/CMMI_for_development_.pdf> にもあります。

### 0.2 一次と二次の区別

- **一次で確認済み**: FAR Part 10、OMB M-16-21(digital.gov 版)、Software Engineering at Google 第21章、OpenSSF Concise Guide、ISO/IEC/IEEE 12207:2026 の目次とまえがき、IEEE 1517 のステータス、MADR テンプレート本文、IPA オープンソース推進レポート 2024/2025、ISO/IEC 5230 の公開仕様テキスト、CRA 条文
- **逐語再現の二次情報(三系統一致)**: CMMI-DEV V1.3 の DAR 本文。wibas(CMMI パートナー)、cmmis.free.fr、O'Reilly 版 CMMI for Services の該当章が同一文言を再現している。**原典 PDF での確認は未了**
- **二次情報**: ISO 26262、IEC 62304、DO-178C、Automotive SPICE PAM 本文、12207:2008 の再利用プロセス本文、各種研究の要旨

---

## 1. ISO/IEC/IEEE 12207 と 15288

### 1.1 版の状況

- ISO/IEC 12207:2008 は、箇条 7.3 に「Software Reuse Processes」を持つ
- ISO/IEC/IEEE 12207:2017 で 15288 と調和し、**独立した再利用プロセス群は削除された**(43→30プロセス)
- **ISO/IEC/IEEE 12207:2026(第2版)が 2026年4月29日 に発行**され、2017年版を置き換えた。140ページ

出典: <https://en.wikipedia.org/wiki/ISO/IEC_12207>(二次)、<https://www.iso.org/standard/90219.html>、<https://www.en-standard.eu/iso-iec-ieee-12207-2026-systems-and-software-engineering-software-life-cycle-processes/>

### 1.2 12207:2026 の目次(一次確認済み。今回の追加調査)

サンプル PDF から目次全体を取得しました。

- 1 Scope / 2 Normative references / 3 Terms, definitions and abbreviated terms
- 4 Conformance(4.1 General、4.2 Full conformance、4.3 Tailored conformance)
- 5 Key concepts and application(5.1〜5.8。5.6 Process groups、5.8 Process reference model)
- **6 Software life cycle processes**
  - 6.1 Agreement processes
  - 6.2 Organizational project-enabling processes
  - 6.3 Technical management processes
  - 6.4 Technical processes
- Annex A(規定)Tailoring process / Annex B(参考)Examples of process information items / Annex C(参考)Process reference model for assessment purposes / Annex D(参考)Model-based systems and software engineering / Annex E(参考)Assurance and assurance cases

**確定した事実: 12207:2026 にも再利用のプロセス群は存在しません。** プロセス群は 6.1〜6.4 の四つのみで、2017年版の構成を踏襲しています。2008年版の箇条 7.3 に相当するものは復活していません。

まえがきが挙げる主な変更点(逐語):

- 「clarifications and updates to reflect current practices in selected technical processes, including business or mission analysis, system architecture definition, implementation, integration, operations, and maintenance」
- 「improvements to selected technical management processes, including risk management and configuration management」
- 「updates to Clause 5, key concepts, including a more precise description of iteration, recursion, system-of-systems, and quality characteristics」
- 「new content in Clause 5 on concept and system definition, and expanded content on agile methods, process application, and system concepts」
- 「revised Annex D on model-based systems and software engineering (MBSSE)」

**再利用・make-or-buy は変更点の列挙に一切登場しません。**

留意点です。サンプル PDF は前付けと目次が中心であり、6.4 Implementation process の本文は含まれません。よって「本文中に reuse の語が出てこない」とまでは言えません。**言えるのは「独立したプロセスとしては存在しない」までです。**

出典(一次): <https://cdn.standards.iteh.ai/samples/iso/iso-iec-ieee-12207-2026/422278b89dc34c5582cfcb36e5dabac1/iso-iec-ieee-12207-2026.pdf>

### 1.3 12207:2008 の再利用プロセス(現行版では削除済み)

三つのプロセスで構成される、と解説されています(二次情報)。

- **Domain Engineering**: ドメインモデル・ドメインアーキテクチャ・資産を開発し維持する
- **Reuse Asset Management**: 再利用資産の一生を、着想から廃止まで管理する
- **Reuse Program Management**: 組織の再利用プログラムを計画・確立・管理・統制・監視し、**再利用機会を体系的に開拓する**

「systematically exploit reuse opportunities」は**組織レベルの機会探索**を要求する文言に見えます。個別の設計判断ごとに「探したか」を問う形ではありません。

出典: <https://msritse2012.wordpress.com/2013/01/30/isoiec-12207software-life-cycle-process/>(二次)

### 1.4 取得プロセスの make-or-buy(未解決)

12207/15288 の Acquisition Process と Implementation Process に make-or-buy の明示的な判断点があるかは、**依然として確認できていません**。有料本文の該当箇条に到達していません。

---

## 2. IEEE 1517(Software Reuse Processes)

- IEEE 1517-2010 は 2010年8月25日 発行、IEEE 1517-1999 を置き換え
- 適用範囲は「システム・ソフトウェアライフサイクルプロセスを拡張し、再利用の体系的な実践を組み込むための共通枠組み」
- **2021年3月25日に Inactive-Reserved(非活性・留保)へ移行**。10年以上改訂されなかったための管理上の措置

出典(一次): <https://standards.ieee.org/ieee/1517/4603>

**再利用を正面から扱った唯一の独立規格は、現在生きていません。** 12207 からの削除(2017、2026年版でも復活せず)と 1517 の非活性化(2021)は同じ方向を向いています。「再利用プロセスを独立に規定する」という approach は、標準化の世界では退潮しました。

ただし「再利用を要求しなくなった」とは限りません。次章の CMMI・ASPICE には残っています。

---

## 3. CMMI

### 3.1 DAR(CMMI-DEV V1.3)

目的(逐語): 「The purpose of Decision Analysis and Resolution (DAR) is to analyze possible decisions using a formal evaluation process that evaluates identified alternatives against established criteria.」

形式的評価プロセスの構成要素:

- 評価基準の確立
- 代替解の識別
- 評価方法の選定
- 基準と方法による代替案の評価
- 評価に基づく推奨解の選定

**扱う典型的論点(typical issues)の列挙**:

- アーキテクチャ・設計の代替案
- **再利用可能部品または COTS 部品の使用**
- 供給者選定
- エンジニアリング支援環境・ツール
- テスト環境
- 納入方法とロジスティクス
- **make-or-buy 判断**
- 製造プロセスの開発
- 配送拠点の選定

SG 1「Decisions are based on an evaluation of alternatives using established criteria.」の下に六つの実践があります。

- **SP 1.1 Establish Guidelines for Decision Analysis**: 「Establish and maintain guidelines to determine which issues are subject to a formal evaluation process.」
- **SP 1.2 Establish Evaluation Criteria**: 「Establish and maintain criteria for evaluating alternatives and the relative ranking of these criteria.」
- **SP 1.3 Identify Alternative Solutions**: 「**Identify alternative solutions to address issues.**」
- **SP 1.4 Select Evaluation Methods**: 「Select evaluation methods.」
- **SP 1.5 Evaluate Alternative Solutions**: 「Evaluate alternative solutions using established criteria and methods.」
- **SP 1.6 Select Solutions**: 「Select solutions from alternatives based on evaluation criteria.」

SP 1.1 の下位実践(逐語):

1. 「Establish guidelines for when to use a formal evaluation process.」
2. 「Incorporate the use of guidelines into the defined process as appropriate.」

作業成果物: 「Guidelines for when to apply a formal evaluation process」

**形式評価を要する典型的ガイドライン**(逐語。V1.3 の記述):

- 「A decision is directly related to issues that are medium-to-high-impact risk」
- 「A decision is related to changing work products under configuration management」
- 「A decision would cause schedule delays over a certain percentage or amount of time」
- 「A decision affects the ability of the project to achieve its objectives」
- 「The costs of the formal evaluation process are reasonable when compared to the decision's impact」
- 「A legal obligation exists during a solicitation」
- 「When competing quality attribute requirements would result in significantly different alternative architectures」

形式評価を使う活動の例:

- 部品調達で、20% の部品が総コストの 80% を占める場合の判断
- 技術性能の失敗が致命的故障を招きうる設計実装判断(飛行安全品目など)
- 設計リスク・設計変更・サイクルタイム・応答時間・製造コストを大きく減らしうる判断

出典(逐語再現の二次情報。三系統一致):

- <https://www.wibas.com/cmmi/decision-analysis-and-resolution-dar-cmmi-dev>
- <https://www.wibas.com/cmmi/darsp-11-establish-guidelines-for-decision-analysis>
- <https://www.wibas.com/cmmi/darsg-1-evaluate-alternatives>
- <http://cmmis.free.fr/cmmi-acq/text/pa-dar.php>
- <https://www.oreilly.com/library/view/cmmi-for-services/9780321685353/ch11.html>

### 3.1.1 原典(一次情報)— CMMI for Development, Version 1.3, pp.149-153

**2026-08-13、原典 PDF を取得して読了しました**(<https://se.inf.ethz.ch/courses/2013b_fall/dsl/slides/reading_material/cmmi-for-development_13.pdf>)。以下は逐語です。**本節の記述は二次情報ではありません。**

**(a) 再利用・COTS・make-or-buy の名指し**(Introductory Notes)

> During planning, specific issues requiring a formal evaluation process are identified. **Typical issues include selection among architectural or design alternatives, use of reusable or commercial off-the-shelf (COTS) components, supplier selection**, engineering support environments or associated tools, test environments, delivery alternatives, and logistics and production. A formal evaluation process **can also be used to address a make-or-buy decision**, the development of manufacturing processes, the selection of distribution locations, and other decisions.

名指しは事実です。ただし `can also be used` であり、義務ではありません。

**(b) 全件強制ではない。閾値を組織が明文化する**(SP 1.1)

> **Establish and maintain guidelines to determine which issues are subject to a formal evaluation process.**
>
> Not every decision is significant enough to require a formal evaluation process. **The choice between the trivial and the truly important is unclear without explicit guidance.**

典型的な閾値(逐語、7項目):

- A decision is directly related to issues that are **medium-to-high-impact risk**
- A decision is related to **changing work products under configuration management**
- A decision would cause **schedule delays over a certain percentage or amount of time**
- A decision **affects the ability of the project to achieve its objectives**
- **The costs of the formal evaluation process are reasonable when compared to the decision's impact**
- A **legal obligation** exists during a solicitation
- When **competing quality attribute requirements would result in significantly different alternative architectures**

5番目は FAR 10.002 の「規模と複雑さに応じた形で」と同型の**比例原則**です。

**(c) 探索が subpractice として明文で置かれている**(SP 1.3。**本調査で最も重要な逐語**)

> **SP 1.3 Identify Alternative Solutions**
> Identify alternative solutions to address issues.
>
> **Subpractices**
> **1. Perform a literature search.**
>
> **A literature search can uncover what others have done both inside and outside the organization.** Such a search can provide a deeper understanding of the problem, **alternatives to consider**, barriers to implementation, **existing trade studies**, and lessons learned from similar decisions.
>
> 2. Identify alternatives for consideration **in addition to the alternatives that may be provided with the issue.**
> 3. Document proposed alternatives.

> Sufficient candidate solutions may not be furnished for analysis. As the analysis proceeds, **other alternatives should be added** to the list of potential candidate solutions.

**「組織の内外で他者が何をしたかを明らかにする」ための探索が、明文で要求されています。** 第1版の「規格に探す義務は無い」という結論は、**ここで修正されます**。

さらに 2番目が「issue とともに提供された代替案に**加えて**」識別せよと定めており、**手元に出てきた案だけで比較を済ませることを禁じる形**です。Issue #237 が指摘した非対称(自前実装しか候補に挙がらない)に直接対応します。

**(d) 重さも可変**(Introductory Notes)

> Formal evaluation processes **can vary in formality**, type of criteria, and methods employed. **Less formal decisions can be analyzed in a few hours, use few criteria (e.g., effectiveness, cost to implement), and result in a one- or two-page report.**

同じ比例原則が SP 1.4 にもあります: 「The level of detail of a method should be **commensurate with cost, schedule, performance, and risk impacts.**」

**(e) 記録の受益者は「将来の他案件」**

> A recommended alternative is accompanied by documentation of selected methods, criteria, alternatives, and rationale for the recommendation. ... it provides a record of the formal evaluation process and rationale, **which are useful to other projects that encounter a similar issue.**

SP 1.2 にも同じ趣旨があります: 「Document the rationale for the selection and rejection of evaluation criteria. ... may be needed to justify solutions or **for future reference and use.**」

**(f) 目的**

> A formal evaluation process **reduces the subjective nature of a decision** and provides a higher probability of selecting a solution that meets multiple demands of relevant stakeholders.

### 3.1.2 含意

CMMI は make-or-buy と COTS/再利用部品の採用を、**形式的評価を要する決定の代表例として名指し**しています。設計者の裁量に丸投げしていません。ただし全件強制ではなく、**閾値を組織が明文化する**建て付けです。

そして構造が重要です。**SP 1.3「代替解を識別せよ」が独立の実践として置かれています。** 「既存部品を優先せよ」ではなく「代替案を挙げよ」という形をとっており、既存部品も自前実装も等しく代替案として扱われます。**探索(literature search)は、その代替案を揃えるための手段として置かれています。**

### 3.2 CMMI V3.0(2023年4月6日リリース)

一般公開の Quick Reference Guide から確認しました。

- **Intent(逐語)**: 「Makes and **records** decisions using a **recorded** process that analyzes alternatives.」
- **Value**: 「Increases the objectivity of decision-making and the probability of selecting the optimal solution.」
- Level 1: 「Identify alternatives and make decisions.」
- Level 2: 「Develop rules and criteria for making and evaluating decisions, identifying alternatives, evaluation methods, and using them to select solutions.」
- Level 3: 役割に基づく意思決定への組織的アプローチを要求する

**V3.0 の要約には COTS・再利用・make-or-buy の語がありません。** V1.3 で「典型的論点」として列挙されていた具体例は、要約レベルでは落ちています。モデル本文に残っているかは未確認です。

一方で V3.0 は **「記録する(records / recorded)」を intent の文言そのものに埋め込んでいます**。V1.3 より記録の要求が前面に出ています。

Supplier Source Selection(SSS)は V3.0 で削除され、内容は Supplier Agreement Management(SAM)へ統合されました。

出典: <https://processgroup.com/CMMI-Model-Quick-Reference-Guide_Digital-1024.pdf>、<https://cmmiinstitute.com/getattachment/47a7c84e-472c-4f7f-a473-ddc21c6ae045/attachment.aspx/>、<https://www.thecoresolution.com/cmmi-v3-update-explained>(二次)

---

## 4. Automotive SPICE

### 4.1 ACQ プロセス群は 4.0 で激減

- PAM 3.1 の ACQ.3 / ACQ.11 / ACQ.12 / ACQ.13 / ACQ.14 / ACQ.15 は 4.0 で削除
- 4.0 の Acquisition プロセス群に残るのは **ACQ.4 Supplier Monitoring のみ**
- 3.0 で新設されたプロセス群は MLE(機械学習)、HWE(ハードウェア)、VAL(妥当性確認)

出典: <https://www.sanei-hy.co.jp/en/blog/2025/01/00316/>(二次)、PAM v4.0 <https://vda-qmc.de/wp-content/uploads/2023/12/Automotive-SPICE-PAM-v40.pdf>

### 4.2 REU.2 は残っているが、標準スコープの外

日本語版 PAM 4.0 の目次から確認しました(一次)。**REU.2 のプロセス名は「製品の再利用管理」**です。3.1 の「REU.2 Reuse Program Management(再利用プログラム管理)」から改称されました。

出典(一次。目次のみ到達): <https://vda-qmc.de/wp-content/uploads/2024/02/Automotive-SPICE-PAM_40_Japanese-1.pdf>

3.1 の REU.2 のベースプラクティス(二次情報):

- BP1: 組織的な再利用戦略の定義
- BP2: 再利用の可能性があるドメインの特定
- BP3: ドメインの再利用ポテンシャルの評価
- BP4: 再利用成熟度の評価
- BP5: **再利用提案の評価**(再利用製品が適合するかの確認)
- BP6: 再利用プログラムの実施
- BP7: 再利用からのフィードバック取得
- BP8: 再利用の監視

出典: <https://alef1986.github.io/ASPICE-Archi/0c6fbcf4-57de-4e25-a1b4-d9a0fa460c16/views/28149d58-8380-4737-8efd-42ff195234a5.html>(二次)

**運用上の決定的な事実(今回の追加調査)**: REU.2 は **VDA スコープ(基本の16プロセス)に含まれません**。ACQ.4、SYS.2〜5、SWE.1〜6、MAN.3、SUP.1/8/9/10 が基本スコープです。REU.2 は**拡張 VDA スコープ**の、しかもレベル3の「推奨(recommended)」区分に置かれています。拡張を含めても計23プロセスです。

出典: <https://www.sanei-hy.co.jp/en/blog/2025/01/00316/>(二次)、検索経由の VDA ガイドライン記述(二次)

**含意**: 車載開発で ASPICE アセスメントを受けても、**再利用プロセスは通常は評価されません**。「規格に書いてあるが、現場のアセスメントでは見られない」という建前と実態の乖離が、制度の構造として存在します。これは日本の車載に限らずグローバル共通の構造ですが、日本企業が ASPICE を「アセスメントで問われる範囲」として理解する傾向を踏まえると、実務上 REU.2 は死文に近いと考えられます(この最後の推論は未検証)。

### 4.3 ISO 26262 の既製品の扱い

ISO 26262-8:2018 は、既存要素の持ち込みに三つの経路を用意しています(二次情報)。

- **箇条 12 Qualification of software components**: 既存ソフトウェア部品の再利用適合性の証拠を、要求ベースのテストスイートを中心に整える
- **箇条 13 Evaluation of hardware elements**: 26262 に従わずに開発されたハードウェア要素の評価
- **箇条 14 Proven in use argument**: 市場実績による論証。候補は他車種・他の安全関連産業での実績、または自動車向けとは限らない COTS でよい

**SEooC(Safety Element out of Context)** は、最終的な車両文脈を知らないまま 26262 に従って開発する形態であり、箇条 12/13 の「26262 準拠でない既存要素」とは区別されます。

出典: <https://iso26262.academy/features/concepts/software-qualification>、<https://piembsystech.com/iso-26262-part-8-supporting-processes/>(いずれも二次)

**26262 は「使うなら、こう正当化せよ」を厚く書いています。「探せ」とは書いていません。方向が逆です。**

### 4.4 参考: IEC 62304 と DO-178C

- IEC 62304 の SOUP は、8.1.2 で題名・製造者・一意識別子の文書化、5.3.3 / 5.3.4 で機能・性能要求とハードウェア/ソフトウェア要求の明示を求める
- DO-178C 第12章は Previously Developed Software と製品サービス履歴による認証クレジットを扱う

出典: <https://openregulatory.com/questions/how-to-document-soup-iec-62304>、<https://www.parasoft.com/learning-center/do-178c/what-is/>(いずれも二次)

いずれも **「使うときの管理」側**です。

---

## 5. 政府調達 — 「探す義務」と「否定的結果の記録」の先例

ここが本調査で最も直接的な先例です。

### 5.1 FAR Part 10(Market Research)

米国連邦調達規則の第10部は、市場調査を**義務**として置いています(一次確認済み)。

- 実施時期: 「**新しい要求文書を作成する前**(Before developing new requirements documents for an acquisition)」および簡易調達閾値超の調達の提案要求前
- 目的: 「機関の要求を満たしうる供給源が存在するかを判断する」、商用品・非開発品(nondevelopmental items)が要求を満たすかの判断
- **記録義務**: 「The head of the agency shall document the results of market research in a manner appropriate to the size and complexity of the acquisition.」(FAR 10.002)
- 優先順位: 既存の政府全体契約上の商用品 → 要求を修正して既存契約を使えるか → 他の供給源の商用品 → 商用品の改造 → **非開発品でしか満たせない場合**、の順に判定する

出典(一次): <https://www.acquisition.gov/far/part-10>
根拠法: 41 U.S.C. 3306(a)(1)、41 U.S.C. 3307、10 U.S.C. 3453、6 U.S.C. 796

**注意**: FAR Part 10 は 2025年からの「Revolutionary FAR Overhaul(RFO)」でクラスデビエーションによる改定が進行中です。条文は流動的です。
参考: <https://www.dhs.gov/sites/default/files/2025-06/25_0612_cpo_far-class-dev-25-06-far-part-10_508.pdf>

### 5.2 OMB M-16-21(Federal Source Code Policy、2016年8月8日)

**Three-Step Software Solutions Analysis** を定めています(一次確認済み)。

1. **Step 1 — Strategic Analysis and Alternatives Analysis**: 「Each agency must conduct research and analysis **prior to initiating any technology acquisition or custom code development**.」代替案分析は既存の連邦ソフトウェア解の使用を優先する
2. **Step 2 — Existing Commercial Solutions**: 要求が商用既製品で満たせるかを検討する
3. **Step 3 — Custom Development**: Step 1・2 で満たせないと結論した場合に**限り**、独自開発コードの調達を検討してよい

出典(一次): <https://digital.gov/resources/requirements-for-achieving-efficiency-transparency-and-innovation-through-reusable-and-open-source-software/>
原本 PDF: <https://obamawhitehouse.archives.gov/sites/default/files/omb/memoranda/2016/m_16_21.pdf>

**「実装前に探す義務」の最も明確な先例です。** 順序が固定され、時期が「着手前」に固定され、独自開発は最後の手段として条件付けられています。

限界です。digital.gov 版からは、**Step 1・2 の分析結果を文書化する明示的な義務は読み取れませんでした**。記録義務があるのは FAR 10.002 の側です。両者を組み合わせて初めて「探した・無かった・記録した」が揃います。

### 5.3 適用範囲の違い(重要な留保)

FAR Part 10 も M-16-21 も、対象は**調達単位**です。プルリクエスト単位や関数単位の判断には掛かりません。粒度が数桁違います。本標準へ持ち込むときは、この粒度差が最大の論点になります。

---

## 6. OSS ガバナンス — 「使うときの管理」に閉じているか

### 6.1 OpenChain(ISO/IEC 5230:2020)

- 2020年末に ISO/IEC で発行。OpenChain 2.1 と同一内容
- 箇条 3 が適合要件。主題は「オープンソースポリシーの存在」と「プログラム参加者の力量」
- 「供給ソフトウェアのオープンソースライセンス遵守を統治する、**書かれたオープンソースポリシーが存在すること**」「ポリシーが社内に周知されていること」

出典: <https://github.com/OpenChain-Project/License-Compliance-Specification/blob/master/Official/en/ISO-5230-2020/ISO-5230-2020.md>、<https://www.iso.org/standard/81039.html>

**ISO/IEC 5230 は「OSS を使うことを検討する義務」を定めていません。** 対象はライセンス遵守プログラムの品質です。SPDX(ISO/IEC 5962)も交換フォーマットの規格であり同様です。

### 6.2 SBOM

- NTIA「The Minimum Elements For a SBOM」(2021)が起点
- CISA が 2025年8月に「2025 Minimum Elements」草案を公開しパブリックコメントを募集。Component Hash / License / Tool Name / Generation Context などを追加
- 現在は 2026年版が CISA のリソースとして掲載
- G7 各国と共同で AI 向け SBOM(AIBOM)の最小要素も 2026年6月に公表

出典: <https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom>、<https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf>、<https://www.cisa.gov/resources-tools/resources/2026-minimum-elements-software-bill-materials-sbom>

日本側: 経済産業省「ソフトウェア管理に向けた SBOM の導入に関する手引」ver 2.0(2024年8月29日)。脆弱性管理プロセスの具体化、SBOM 対応モデル、SBOM 取引モデルを追加。
出典: <https://www.meti.go.jp/press/2024/08/20240829001/20240829001-1r.pdf>

**SBOM 系はすべて「入っているものを列挙し追跡する」規定です。** 採用の検討義務はありません。むしろ **依存が増えるほど管理コストが増えることを可視化する仕組み**であり、依存の追加に抑制的に働きます。

### 6.3 EU Cyber Resilience Act(規則 (EU) 2024/2847)

第13条が製造者の義務を定めます。第三者部品の統合にあたり **due diligence(相当の注意)** を求め、商業活動の過程で市場に出されていない FOSS 部品の統合も明示的に対象に含めます。違反は最大 1500万ユーロまたは全世界年間売上高の 2.5% の制裁金の対象になりえます。

出典: <https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847>(一次)、<https://digital-strategy.ec.europa.eu/en/policies/cra-summary>

**方向は「採用のハードルを上げる」側です。** 「OSS をなるべく使え」という規範と CRA の due diligence 義務は、同じ組織の中で緊張します。

---

## 7. 実務側の指針と研究

### 7.1 Google(Software Engineering at Google 第21章)

一次(公開版)から確認できた要点です。

- 出発点は肯定的: 「if your external dependency satisfies the requirements for your programming task, you should use it」
- 時間軸を入れると反転する: 「**Just because you get to avoid a development cost doesn't mean importing a dependency is the correct choice.**」
- 「**Adding a dependency isn't free for a software engineering project.**」使っていない依存でも、脆弱性やプラットフォーム変更で更新を強いられる
- インポート前に問う質問として、依存側(テストは通るか、誰が保守し評判はどうか、互換性の約束は、人気は、破壊的変更の頻度は)と自組織側(**内製したらどれだけ難しいか**、更新の動機は誰にあるか、誰が更新作業をやるか、更新の難度の見込みは)の両方を挙げる

出典(一次): <https://abseil.io/resources/swe-book/html/ch21.html>

**Google の指針は「探せ」でも「使え」でもなく「両方のコストを見積もって比べよ」です。** 内製難度の見積もりが質問リストに含まれ、外部部品の質と**対等に**置かれています。

### 7.2 OpenSSF Concise Guide for Evaluating Open Source Software

OSS 採用時の評価観点を列挙したガイドです。冒頭に近い位置に次の問いが置かれています。

- 「**Can you avoid adding it?**(追加を避けられないか)」
- 「Can you use an existing (possibly indirect) dependency instead?(既にある間接依存で代替できないか)」
- 「Every new dependency increases the attack surface.(新しい依存はすべて攻撃面を広げる)」

その他の観点: 意図したバージョン・フォークかの確認、保守されているか、セキュリティ修正の適時性と LTS の有無、ライセンス情報の明確さ、依存の鮮度、ブランチ保護などの利用、既存のセキュリティ監査の有無。

出典(一次): <https://best.openssf.org/Concise-Guide-for-Evaluating-Open-Source-Software.html>

**セキュリティ側の一次資料が最初に置く問いが「追加を避けられないか」である**という事実は、両論併記に不可欠です。

### 7.3 ADR — 「検討したが採らなかった選択肢」を記録する慣行(追加調査)

本標準は ADR を判定対象に持つため、降ろし先の候補として直接効きます。**結論は「テンプレートによって割れる」です。**

**Nygard 形式**(原型): Title / Status / Context / Decision / Consequences の四節。**却下した代替案の列挙を要求しません。** Decision 節は「何をするか」、Context 節は「なぜか」を書きますが、**却下された選択肢は暗黙にとどまります**。

**MADR(Markdown Any Decision Records)**: 一次(公式テンプレート)から確認した節構成です。

- frontmatter: `status` / `date` / `decision-makers` / `consulted` / `informed`
- Context and Problem Statement
- Decision Drivers
- **Considered Options**(「{title of option 1}」「{title of option 2}」…を列挙する)
- Decision Outcome(「Chosen option: "..." , because ...」)
  - Consequences(Good, because … / Bad, because …)
  - **Confirmation**(「Describe how the implementation / compliance of the ADR can/will be confirmed. Is there any automated or manual fitness function?」)
- **Pros and Cons of the Options**(選択肢ごとに Good/Neutral/Bad を列挙)
- More Information

MADR は「the _considered options_ with their pros and cons are crucial to understand the reasons for choosing a particular design」と述べ、**Considered Options を必須節として持ちます**。

出典(一次): <https://raw.githubusercontent.com/adr/madr/main/template/adr-template.md>、<https://adr.github.io/adr-templates/>
出典(二次): <https://ozimmer.ch/practices/2022/11/22/MADRTemplatePrimer.html>

**本件にとっての含意**:

- MADR の「Considered Options」は、**CMMI DAR の SP 1.3(代替解の識別)と SP 1.5(基準による評価)を、ソフトウェア開発の粒度で実装した形**とみなせる
- ただし MADR も「探索の否定的結果」を独立の記録項目としては持たない。「探したが該当なし」は Considered Options に「自前実装のみ」と書かれて終わる可能性がある
- MADR の **Confirmation 節**は注目に値する。「この決定が守られているかを、自動または手動の fitness function でどう確認するか」を書かせる。**決定の検証可能性を様式に埋め込んだ数少ない例**
- ADR は規格ではなく慣行であり、強制力を持たない。ISO/IEC/IEEE 42010:2011 が ADR 向けに九つの情報項目を示唆しているとされるが、本文は未確認

### 7.4 InnerSource(社内資産の探索)

- **Discover Your InnerSource**: 「開発者が、自分が解こうとしている問題について**まず社内の既存解を確認する**よう動機づけるプロセス変更」を導入する
- **InnerSource Portal**: 社内プロジェクトの発見可能性を上げる入口を用意する。Mercado Libre、WellSky、Siemens の実装事例
- 課題認識: コードベースを開いた後で、複数チームが重複した製品を独立に作っていた事実が判明する。しかし縄張り意識と技術方針の差により統合は難しい

出典: <https://patterns.innersourcecommons.org/p/innersource-portal>、<https://github.com/InnerSourceCommons/InnerSourcePatterns/blob/main/patterns/1-initial/discover-your-innersource.md>

**「まず探す」を規範として書いた例は、規格ではなく InnerSource のパターン言語の側にあります。** ただしパターンは強制力を持たない推奨です。

### 7.5 Not Invented Here 症候群の実証研究

- NIH は「外部で生成された知識に対する従業員の否定的な態度」と定義される
- ドイツで収集したデータを用いた研究では、**外部ソフトウェア部品の再利用に関する戦略的判断において、NIH バイアスが最も大きな役割を果たした**とされる
- 障壁は心理面だけではない。再利用を報いる仕組みの不足、再利用技法の訓練不足、再利用が進むと専門家の役割が縮むという懸念も挙がる
- **NIH を克服する介入策についての実証的証拠は乏しい**とされる

出典(いずれも二次。要旨レベル): <https://www.researchgate.net/publication/221600023_A_qualitative_model_for_barriers_to_software_reuse_adoption>、<https://link.springer.com/chapter/10.1007/978-3-319-19593-3_18>、<https://www.worldscientific.com/doi/10.1142/S1363919621500705>

NIH が実在するなら「探す義務」には根拠が立ちます。しかし「介入策の証拠が乏しい」なら、**義務化が効くかどうかは未検証**です。

### 7.6 再利用の経済性(反対向きの証拠)

- COCOMO II の RUSE(Required Reusability)コストドライバは、再利用可能な部品を作るための追加工数を表す。より汎用的な設計、詳細な文書、広範なテストが原因
- AT&T では広範な再利用向け開発で **2.25 倍**のコスト増を経験したとされる。Ada COCOMO の再利用乗数は (1.5)(1.4) = 2.10
- COCOMO 2.0 の非線形再利用モデルは、**再利用候補の評価だけで約 5% の固定費**が掛かり、改造コストは不釣り合いに高くなるとする

出典: <https://personal.utdallas.edu/~John.Cole/CoCoMo2.pdf>、<https://link.springer.com/article/10.1007/BF02249046>

**「評価そのものにコストが掛かる」という数字がある点が重要です。** 全件に探索を義務づけると、この 5% 相当が全件に掛かります。CMMI DAR が「形式評価の費用が決定の影響に照らして妥当な場合」という閾値を置くのは、この事情への対処と読めます。

---

## 8. 日本の実態 — 建前と実運用の乖離(追加調査)

### 8.1 IPA オープンソース推進レポート

IPA は日本企業の OSS 活用実態を継続調査しています。**2025年度調査は国内企業 362社**が対象です(2026年2月9日時点の回答数。公開は 2025年11月25日)。あわせて世界7か国・30,298リポジトリの GitHub 国際比較調査を実施しています。

**2024年度調査で見えた乖離**(一次):

- ユーザー企業で「利用ポリシー等が存在しない」「わからない」の回答が合わせて **8割超**
- OSPO(Open Source Program Office)の設置について「特に対応していない」が **およそ7割**
- 「企業が組織として OSS コミュニティ活動へコミットする取り組みが少数である」。貢献が **「個人の趣味的活動の範疇」** に留まることを「既知の課題」と記述
- 利用時の上位課題は、メンテナンス・運用への不安、ルール・ポリシーの不在、商用サポートの欠如。**技術的懸念というより、情報不足と体制未整備から生じる不安**と分析

出典(一次): <https://www.ipa.go.jp/digital/kaihatsu/oss/about/report2024/oss-usage-japan.html>

**2025年度調査の数値**(一次):

- OSS ポリシー整備率: 2024年度 19.5%(統計的補正後 32.0%)→ **2025年度 36.7%**
- OSPO 設置率: **2025年度 4.1%**(設置済み+計画中でも 6.9%)。補正後 2024年度値 4.8% と比べ **実質横ばいから微減**
- OSS 化実施率: 2024年度 4.6%(同 12.0%)→ **2025年度 15.2%**
- 課題認識: 「わからない」が 34.8% → **14.1%** へ急減。「セキュリティ面の懸念」25.7%、「技術ノウハウ・人材不足」21.5% へシフト
- IPA の評価: 「日本企業の OSS 活用は『認識段階』から『実践段階』へ移行しつつある傾向」

出典(一次): <https://www.ipa.go.jp/digital/kaihatsu/oss/report/report2025/index.html>

**これが日本の建前と実態の乖離を示す最良の数字です。**

- **ポリシー整備率 36.7% に対し、OSPO 設置率 4.1%。** 文書はできつつあるが、それを運用する組織はほぼ存在しない
- IPA 自身が「ポリシー整備と組織体制の**大きな乖離**が次の重要課題」と指摘する
- ポリシー整備率は1年で約2倍(19.5%→36.7%)に伸びた一方、体制は横ばいから微減。**書類だけが先行している**

**本件への含意**: 「探索を義務づける規定」を書いても、それを運用する主体がいなければ同じ経路をたどります。日本の実態は「規定を書けば整備率の数字は上がるが、実行体制は追いつかない」ことを示しています。**規定の設計にあたっては、実行主体を同時に指定しないと数字だけが動きます。**

### 8.2 車載: ASPICE REU.2 はアセスメントで見られない

4.2 に記載のとおり、REU.2 は VDA スコープ(16プロセス)の外にあり、拡張スコープのレベル3「推奨」区分です。**規格に条項として存在しても、アセスメントで問われる範囲には入っていません。**

### 8.3 未収穫

日本の SI・受託開発における「内製するか既存を使うか」の判断実態、JASPIC(日本SPIコンソーシアム)発表資料での具体事例は、今回は見つかりませんでした。SPI Japan の発表資料は jaspic.org で公開されますが、本件に該当するものを特定できていません。
参考: <https://www.jaspic.org/>

---

## 9. 反対側 — 依存を増やすリスク

「なるべく既存のものを使え」を規範化する危険を、事実で押さえます。

### 9.1 事件

- **left-pad(2016年3月22日)**: 開発者 Azer Koçulu が Kik との名称紛争を機に npm から 273 パッケージを削除。11行の left-pad が消え、Facebook・Netflix・Airbnb などのビルドが失敗した。npm は前例のない「un-unpublish」を実施し、公開後一定時間を過ぎ依存を持つパッケージの unpublish を禁じる規則を新設した
  出典: <https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm>(一次)、<https://en.wikipedia.org/wiki/Npm_left-pad_incident>
- **xz-utils / CVE-2024-3094(2024年3月29日公表)**: Microsoft のエンジニア Andres Freund が SSH ログインの性能異常から発見。CVSS 10.0。「Jia Tan」名義の人物が約2年かけて信頼を築き共同メンテナ権限を得た。sockpuppet 疑いのアカウントが機能要求と不具合報告で圧力を掛け、燃え尽きた原メンテナに共同メンテナ追加を促した経緯が指摘される
  出典: <https://jfrog.com/blog/xz-backdoor-attack-cve-2024-3094-all-you-need-to-know/>、<https://snyk.io/blog/the-xz-backdoor-cve-2024-3094/>(二次)

**xz-utils が決定的な理由**: この攻撃は、コードレビューでも SBOM でもライセンス監査でも止まりませんでした。止めたのは偶然の性能観測です。「既存の OSS を使え」という規範は、この種のリスクに防御を提供しません。

### 9.2 規模

- Sonatype の報告(2025年分)では、新規の悪意あるパッケージが **454,648 件**発見された。既知かつブロック済みのマルウェアの累計は **123万件超**
- 同期間の部品ダウンロードは Maven Central・PyPI・npm・NuGet 合計で **9.8兆回**
- 記録された悪意あるパッケージの **56%** が「リポジトリ悪用」。chalk・debug のような著名パッケージの乗っ取りは、**確立したメンテナが大量配布の入口として狙われている**ことを示す
- 脅威は「スパムと悪ふざけ」から「持続的・産業化されたキャンペーン」へ移行し、その多くが国家支援とされる

出典: <https://www.sonatype.com/state-of-the-software-supply-chain/2026/open-source-malware>、<https://www.infosecurity-magazine.com/news/454000-malicious-open-source/>(二次)

### 9.3 緊張関係を扱った先例

明示的に両立させた例は二つです。

- **OpenSSF Concise Guide**: 評価ガイドでありながら、**最初の問いを「追加を避けられないか」に置く**。不使用を第一選択として残す
- **Google 第21章**: 「使え」と言った直後に時間軸で反転させ、内製難度を質問リストに含める

一方、**「なるべく OSS を採用せよ」を明示的な規範として置いた規格は、本調査では見つかりませんでした。** 政府調達(M-16-21)は既製品優先を規範化していますが、対象は調達単位であり 2016年の文書です。CRA(2024)や CISA SBOM(2025-2026)の流れは逆向きです。

---

## 10. 2026年8月13日時点の AI コーディング文脈

変化が速い領域です。**日付を必ず併記します。**

### 10.1 エージェントの普及度

128,018 の GitHub プロジェクトを対象とした調査(2026年2月21日時点のデータ)で、**22.20% 〜 28.66%** のプロジェクトにコーディングエージェント利用の痕跡が見られました。普及は 2025年3月〜10月に集中し、なお増加中です。
出典: <https://arxiv.org/pdf/2601.18341>

### 10.2 「ライブラリを探さず自分で書く」傾向についての直接的証拠

**2026年8月13日時点で、この命題を直接検証した研究は見つかりませんでした。** 無いことを無いと記録します。近接するものは以下です。

- **LLM のライブラリ選好(arXiv:2503.17181v3、2026年4月8日版)**: 8モデルを検証。「NumPy usage diverges with ground-truth solutions for up to 45% of tasks」(必要ないのに NumPy を使う)。全モデルの上位3ライブラリが同一。使用ライブラリの総種類は 32〜39 に留まる。**この論文は「ゼロから実装するか、ライブラリを使うか」の判断を扱っていません**(外部ライブラリを使う前提で、どれを選ぶかに限定)
  出典: <https://arxiv.org/html/2503.17181v3>
- **コード重複の増加(GitClear)**: 2025年版は 2億1100万行の変更を分析し、2024年に重複コードブロックの頻度が **8倍**に増えたと報告。リファクタリング関連の変更行は 2021年 25% から 2024年 10%未満へ低下。copy/pasted 行は 8.3%→12.3%。2024年は記録上初めてコミット内の copy/paste が「moved」を上回った年。2026年版ではブロック重複が 2023年 40.3 → 2026年上半期 73.0(+81%、記録上最高)、copy/paste は 2022年 9.4% → 2026年上半期 15.7%
  出典: <https://www.gitclear.com/ai_assistant_code_quality_2025_research>、<https://www.gitclear.com/the_ai_code_quality_maintainability_gap>

**留意**: GitClear の指標は「コード内の重複」であり、「既存ライブラリを使わず自前実装した」とは別物です。相関を示唆する材料ではあっても証明ではありません。GitClear はコード解析製品のベンダーであり、利害関係があります。

### 10.3 逆向きのリスク — 存在しないパッケージの推薦

- USENIX Security 2025 の研究: 16 の LLM、576,000超のコードサンプルを分析し、**推薦されたパッケージの 19.7% が存在しなかった**。ユニークな架空パッケージ名は 205,474件
- モデル別: オープンソースモデル 21.7%、商用モデル 5.2%
- 再現性: 同一プロンプトを10回ずつ再実行し、**架空パッケージ名の 43% が毎回再出現**、58% が複数回再出現。この一貫性が攻撃を成立させる
- 内訳: 38% が conflation(例: express-mongoose)、13% がタイポ変種、51% が純粋な捏造
- **slopsquatting**: 2025年4月、Python Software Foundation の Seth Larson が命名。LLM が幻覚したパッケージ名を攻撃者が先回りして登録する

出典: <https://www.helpnetsecurity.com/2025/04/14/package-hallucination-slopsquatting-malicious-code/>、<https://socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks>、<https://arxiv.org/pdf/2501.19012>、<https://arxiv.org/pdf/2605.17062>

- 「Correct Code, Vulnerable Dependencies」(arXiv:2605.06279)は、LLM が指定するライブラリバージョンの脆弱性を大規模に測定
- 「AI-Generated Code Is Not Reproducible (Yet)」(arXiv:2512.22387)は、**68.3% のプロジェクトしかそのまま実行できず**、宣言された依存から実行時の実際の依存へ平均 **13.5倍**の膨張があると報告

出典: <https://arxiv.org/pdf/2605.06279>、<https://arxiv.org/abs/2512.22387>

**含意**: 「AI に既存ライブラリを探させる」方向の規範は、slopsquatting のリスクを直接増やします。**「探せ」と「実在を確認せよ」は必ず対で設計する必要があります。**

---

## 11. 問いへの回答

### Q1. 規格は make-or-buy を明示的な判断点として置いているか

**割れています。**

- **置いている**: CMMI の DAR。make-or-buy と「再利用可能部品または COTS 部品の使用」を、形式的評価を要する典型的論点として名指しする。ただし全件強制ではなく、影響度・リスクの閾値を組織が定める。V3.0 の要約では具体例が落ちる一方、「記録する」が intent 文言に入った
- **組織レベルでのみ置いている**: Automotive SPICE の REU.2(4.0 で「製品の再利用管理」へ改称)。ただし **VDA スコープ外**で、実務では通常アセスメントされない。旧 12207:2008 の Reuse Program Management も同種
- **置いていない**: ISO/IEC/IEEE 12207 は 2017年版で再利用プロセス群を削除し、**2026年版でも復活していない**(目次で一次確認)。ISO 26262、IEC 62304、DO-178C は「持ち込むときの正当化」だけを規定する。ISO/IEC 5230、SPDX、SBOM 系は採用の是非に踏み込まない
- **廃れた**: IEEE 1517 は 2021年3月に非活性化

### Q2. 「探したが無かった」という否定的結果の記録を要求する規格はあるか

**探索を要求する明文は規格にもあります(CMMI SP 1.3)。ただし「探したが無かった」を独立の記録項目として持つ様式は、規格にも慣行にも見つかりませんでした。**

- **CMMI DAR SP 1.3 subpractice 1**(一次確認済み、2026-08-13 追記): 「**Perform a literature search.** A literature search can uncover **what others have done both inside and outside the organization**」。**探索そのものは明文で要求されています**。ただし要求されているのは「代替案を識別し文書化すること」(subpractice 3)であって、探索の否定的結果を独立項目として残すことではありません

- **FAR 10.002**(一次確認済み): 「機関の長は、調達の**規模と複雑さに応じた形で**、市場調査の結果を文書化しなければならない」。結果には「適合する供給源が存在しない」という否定的結論も当然含まれる。**様式は指定されず、比例原則が唯一の様式要件**
- **OMB M-16-21**(一次確認済み): 独自開発は Step 1・2 で満たせないと結論した場合に**限り**検討してよい。ただし分析結果の文書化義務は digital.gov 版から読み取れなかった
- **CMMI DAR**: **SP 1.3「代替解を識別せよ」** が独立の実践として存在し、SP 1.5 で基準に照らして評価する。形式評価は代替案・基準・評価結果の記録を伴う。V3.0 では intent 文言が「Makes and **records** decisions using a **recorded** process」となり、記録の要求が前面に出た。ただし「探したが無かった」を独立の記録対象として名指しはしていない
- **MADR**(一次確認済み): **Considered Options が必須節**。ただし「探索の否定的結果」を独立項目としては持たない。Nygard 形式は却下案の列挙を要求しない

**様式についての示唆**: 見つかった唯一の様式指針は FAR の**比例原則**(規模と複雑さに応じた形で)です。全件同一様式ではありません。記録の器としては **MADR の Considered Options + Pros and Cons** が最も近い既製品です。

### Q3. 「なるべく既存のものを使え」を標準の規範として書くのは妥当か

**両論あります。丸めるべきではありません。**

賛成側の根拠:

- 再利用の経済的利得は自明とされてきた(Google 第21章の出発点、旧 12207 の Reuse Program Management)
- NIH バイアスの実在は実証されている。外部部品の再利用判断で NIH が最も大きな役割を果たすという研究がある
- 政府調達には先例がある(M-16-21 の三段階、FAR 10.001 の優先順位)
- 検出できない側(自前実装)を放置すると、非対称のまま残る

反対側の根拠:

- **セキュリティ側の一次資料が真逆を推す**。OpenSSF は最初の問いを「追加を避けられないか」に置き、「新しい依存はすべて攻撃面を広げる」と書く
- **法規制の潮流も逆向き**。CRA 第13条は第三者部品(無償 OSS を含む)の統合に due diligence を課し、違反に最大1500万ユーロの制裁金を科す
- **規模の証拠**: 2025年に新規の悪意あるパッケージ 454,648件。既知マルウェア累計 123万件超。56% がリポジトリ悪用
- **止まらない攻撃の実例**: xz-utils はレビューでも SBOM でも止まらなかった
- **評価コスト**: COCOMO 2.0 の非線形再利用モデルでは、再利用候補の評価だけで約 5% の固定費が掛かる
- **AI 文脈の新リスク**: 「探せ」を AI に課すと slopsquatting の露出が直接増える(架空パッケージ推薦率 19.7%、うち 43% は毎回再現)
- **日本の実態**: 規定を書いても運用体制が伴わない実績がある(ポリシー整備率 36.7% に対し OSPO 設置率 4.1%)

**先例の扱い方**: 両立させた例はいずれも「使え」ではなく「**比べよ**」に規範を置きます。Google は内製難度を質問リストに入れて外部部品と対等に並べます。OpenSSF は不使用を第一選択として残したうえで評価軸を与えます。CMMI DAR も同じ形で、「代替案を明確化し、確立した基準で評価する」のであってどちらを選べとは言いません。MADR の Considered Options も同じ構造です。

**先例が支持しているのは「既存を優先せよ」ではなく「両方を代替案として並べ、基準に照らして比べ、記録せよ」です。** 追加調査でもこの結論は変わりませんでした。CMMI の SP 1.3 が独立実践であること、MADR の Considered Options が必須節であることが、この読みを補強します。

### Q4. 判断を設計時点(実装前)に置く根拠はあるか

**あります。ただし調達文脈のものです。**

- **FAR 10.001**(一次確認済み): 市場調査は「**新しい要求文書を作成する前**」に行う。要件定義より前に置かれている
- **OMB M-16-21**(一次確認済み): 「**技術調達または独自コード開発に着手する前に**、研究と分析を実施しなければならない」
- **CMMI DAR**: タイミングを直接規定せず、「形式評価の費用が決定の影響に照らして妥当な場合」という費用対効果の閾値で間接的に位置づける
- **COCOMO 2.0 の非線形再利用モデル**: 改造コストが不釣り合いに高くなるという知見は、判断が遅れるほど乗り換えコストが上がることを示唆する(間接的な根拠)
- **ADR の慣行**: ADR は決定の時点で書かれるものであり、実装前に置かれるのが通例。MADR の Confirmation 節が「決定が守られているかをどう確認するか」を書かせる点は、決定と実装のあいだに検証点を置く発想である

**穴(未解決)**: 「PR 単位・関数単位の判断を実装前に置くべき」という粒度の根拠資料は、追加調査でも見つかりませんでした。既存の根拠はすべて調達・プロジェクト着手・アーキテクチャ決定の粒度です。ADR が最も細かい粒度の先例ですが、それでも「アーキテクチャ上の意思決定」であり、個々の実装判断ではありません。

---

## 12. 未解決の穴(圧縮版)

優先度順に並べます。

### 高

1. **CMMI-DEV V1.3 の SEI 原典 PDF での DAR 本文確認**。現在は逐語再現の二次情報三系統の一致に依拠。`pdftotext -f 145 -l 160` で確定できる(節0.1 にコマンド記載)。**あわせて CMMI V3.0 モデル本文で、typical issues の COTS/make-or-buy 列挙が残っているかを確認する**
2. **ISO/IEC/IEEE 12207:2026 の 6.4 技術プロセス本文**。目次で「再利用プロセスは無い」ことは確定した。残るのは Implementation process と Acquisition process の本文に reuse / make-or-buy の記述があるかの確認
3. **ISO/IEC/IEEE 15288:2015 / 2023 の 6.4.7 Implementation Process 本文**。「implementation strategy」に make/buy/reuse が含まれるか

### 中

4. **Automotive SPICE PAM 4.0 の REU.2 本文**(プロセス目的と BP)。日本語版 PDF の目次までは到達済み。プロキシの打ち切りにより本文未到達
5. **ISO 26262-8:2018 箇条 12/13/14 の要求事項本文**。すべて解説サイト経由
6. **OMB M-16-21 原本 PDF の文書化義務**。digital.gov 版では確認できず
7. **FAR Part 10 の 2026年8月時点の有効条文**。RFO のクラスデビエーションで流動的

### 低

8. **日本の SI・受託開発における内製 vs 既存採用の判断実態**。IPA の OSS 統計は取得済み(§8.1)だが、判断プロセスそのものの調査は未発見。JASPIC / SPI Japan 発表資料に該当なし
9. **ECSS-E-ST-40C**(欧州宇宙機関のソフトウェア規格)の再利用要求。未調査
10. **ISO/IEC/IEEE 42010:2011 が示唆する ADR 向け九つの情報項目**。本文未確認

### 結論として残す(追加調査不要)

11. **「LLM がライブラリを探さず自前実装に走る」直接の実証研究は、2026年8月13日時点で見つからない。** 近接研究(ライブラリ選好、コード重複、パッケージ幻覚)は §10 に収録済み。存在しない可能性が高い
