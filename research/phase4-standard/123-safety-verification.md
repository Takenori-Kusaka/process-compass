# 調査メモ: 安全制御ソフトウェア（PL / SIL）の設計と V&V 検証ガイド（Issue #123）

- 調査日: 2026-08-05（すべての URL のアクセス日も 2026-08-05）
- 対象 Issue: #123「安全制御ソフトウェア（PLr/SIL）設計および V&V 検証ガイド」
- 目的: 機能安全規格が要求する検証手法と、AI 生成コード／AI 生成テストを安全関連ソフトウェアの開発に用いる際の規格上の位置づけを一次情報から整理する

## 0. 本メモの鮮度と読み方

- 事実と解釈を分離する。解釈は各節末の「考察」または最終節に置く
- **重要な限界**: ISO 13849-1、IEC 61508、IEC 62061、ISO 26262、ISO/IEC TR 5469、ISO/PAS 8800 はいずれも有償規格であり、本調査で**規格本文は入手できていない**。以下の記述は公開プレビュー、規格発行機関の公開ページ、規格解説を業とする企業（Pilz、exida、TÜV、Heicon、Analog Devices 等）の解説、および査読論文に基づく二次情報である
- 条項番号は解説記事が明示していたものだけを記載し、推測では書かない。番号を確認できなかった箇所は「条項番号未確認」と記す
- AI／エージェント関連の記述は「2026-08-05 時点」の状況である。この領域は変化が速い

---

## 1. 前提の検証（Issue 本文の前提が正しいかの確認）

Issue タイトルの「PLr/SIL」という併記について、以下を確認した。

### 1.1 検証結果 1: PL と SIL は別規格・別体系である（Issue 本文の前提は妥当だが、併記は要注意）

**確認できた事実:**

- **PL（Performance Level）／PLr（required Performance Level）は ISO 13849-1 の指標**である。ISO 13849-1 は機械類の安全関連制御システム部（SRP/CS）を対象とし、**技術によらず**適用される。すなわち電気・電子だけでなく、油圧・空気圧・機械式の制御部にも適用できる
- **SIL（Safety Integrity Level）は IEC 61508 系の指標**である。IEC 61508 は E/E/PE（電気・電子・プログラマブル電子）安全関連系の一般規格であり、機械分野への派生規格が IEC 62061 である。IEC 62061 は**純粋に電気／電子／プログラマブル電子の安全関連制御系**を対象とする
- したがって適用対象の切り分けは以下になる。
  - 混合技術（接触器ベース、油空圧を含む）の機械制御系 → ISO 13849-1（PL）
  - プログラマブル安全 PLC、複雑な電子・ソフトウェアベース設計 → IEC 62061（SIL）または IEC 61508（SIL）
  - プロセス産業・一般産業の E/E/PE 安全計装系 → IEC 61508 / IEC 61511（SIL）
  - 自動車 → ISO 26262（ASIL、IEC 61508 の派生だが独立体系）
- **対応表は存在するが等価ではない**。一般に流通している対応は PL b/c ↔ SIL 1、PL d ↔ SIL 2、PL e ↔ SIL 3 であり、**PL a に対応する SIL は存在しない**（SIL 1 未満に相当するため）
- 対応の限界として、次の点が指摘されている。
  - 対応は**条件付き**であり、算出した PFH<sub>D</sub>（単位時間あたりの危険側故障確率）が PL 帯または SIL 帯の境界付近にある場合は、ISO 13849-1 附属書 K（Annex K）または IEC 62061 の表を使って帰属する帯を判定する必要がある
  - PL b ↔ SIL 1 の対応は**事前設計されたサブシステム**では成立するが、アーキテクチャがカテゴリ B（基本構造）の場合は成立しない
  - PL と SIL は算出方法自体が異なる。ISO 13849-1 はカテゴリ（アーキテクチャ）＋ MTTF<sub>D</sub> ＋ DC ＋ CCF を簡易法で PL に写像する。IEC 62061 / IEC 61508 は PFH<sub>D</sub> ＋ アーキテクチャ制約（SFF／HFT）＋ 系統的能力（systematic capability）で SIL を決める

**結論:** 「PLr/SIL」という併記は、**両者が同じ尺度であるかのような誤解を招くため、本標準では避けるべき**である。書くなら「PLr（ISO 13849-1）／SIL（IEC 61508 系）」のように**規格名を必ず添える**か、抽象語として「安全度水準（Safety Integrity 相当の要求水準）」を用い、具体的な指標は適用規格を決めてから確定する、という順序にする。

**出典:**
- ISO 13849-1 と IEC 62061 の適用範囲比較（CTB 解説）: https://www.ctb.co.at/en/knowledge/safety-performance-level-sil-iec-13849-62061/
- PL と SIL の違い（Eaton 解説）: https://www.eaton.com/gb/en-gb/markets/machine-building/service-and-support-machine-building-moem-service-eaton/blogs/difference-between-sil-and-pl.html
- Annex K を用いた境界判定と PL b の非対応（CAPIEL ホワイトペーパー、機械安全の欧州業界団体）: https://www.capiel.eu/img/CAPIEL_white-paper.pdf
- IEC 62061 と ISO 13849 の関係（61508.org シンポジウム資料）: https://61508.org/wp-content/uploads/2024/11/09A-T6A-Symposium-Presentation-IEC-62061-and-ISO-13849.pdf
- Phoenix Contact による両規格の整理: https://www.phoenixcontact.com/en-us/industries/functional-safety/safety-of-machinery-standards

**考察:** Process Compass は特定業界の規格適合ガイドではなく、汎用の開発プロセス標準である。したがって「PL/SIL のどちらを使うか」を標準側で決めるのではなく、**「安全関連ソフトウェアに該当するかの判定 → 適用規格の特定 → 当該規格が要求する V&V 手法の適用」という判定フローを提供する**のが正しい抽象度と考える。

### 1.2 検証結果 2: SRASW は ISO 13849-1 の用語である（Issue 本文の前提は正しい）

**確認できた事実:**

- ISO 13849-1 は安全関連ソフトウェアを 2 種に分ける。
  - **SRESW（Safety-Related Embedded Software）** — 組込ソフトウェア。安全部品メーカーが供給する、機器内部のファームウェアに相当する。通常 **FVL（Full Variability Language、C/C++/アセンブラ等の完全可変言語）**で書かれる
  - **SRASW（Safety-Related Application Software）** — アプリケーションソフトウェア。機械メーカーが安全 PLC 上に書く応用プログラムに相当する。**LVL（Limited Variability Language、限定可変言語）**でも FVL でも書ける
- SRASW 向けの軽減された措置は、**LVL で書かれている場合にのみ適用できる**。FVL で書く場合は SRESW と同等の措置が要る
- LVL の判定基準として、IEC 61131-3 のラダー図（LD）、ファンクションブロック図（FBD）、シーケンシャルファンクションチャート（SFC）、ブール代数が挙げられる
- **開発モデルは V モデル**である。ISO 13849-1 は「簡易化された V モデル（simplified V-model of the software safety lifecycle）」を採用する。SRASW（LVL・検証済みファンクションブロック使用・検証済みハードウェア上で動作）向けには、さらに段階を減らした V モデルが示されている
- **PL 依存の措置**（EN ISO 13849-1:2015 の 4.6 節ベースの解説による）:
  - PL a〜b: 仕様・設計の文書化、ブラックボックステスト、変更管理
  - PL c〜d: ISO 9001 相当の品質マネジメントシステム、ソースコードのウォークスルーレビュー、影響分析、拡張機能テスト
  - PL e: **IEC 61508-3 の第 7 章（SIL 3 相当）の要求**を適用する
- **第 4 版（ISO 13849-1:2023）の変更点**（解説記事より）:
  - プログラミング言語を LVL か FVL かに分類するための**新しい判断支援（decision-making aid）**が追加された
  - 安全関連ソフトウェア設計における**故障回避措置（fault-avoiding measures）に関する新附属書 N** が追加された
  - 6.3 節が「ソフトウェアによる手動パラメータ設定（software based manual parameterization）」を扱い、パラメータ設定ツールの検証と文書化の要求を含む
- 注意: ソフトウェア要求の条項番号は、2015 年版では 4.6 節、2023 年版では章立てが変わっている。**2023 年版におけるソフトウェア要求の正確な条項番号は本調査では未確認**である

**出典:**
- ISO 13849 のソフトウェア開発要求（Heicon、機能安全コンサル）: https://heicon-ulm.de/en/iso-13849-safety-of-machinery-software-development/
- SRESW / SRASW と V モデル（TeLo）: https://www.telo.at/en/news/safety-related-software-according-en-iso-13849-1-2
- EN ISO 13849-1 第 4 版の新機能（DGUV、ドイツ労災保険組合の公開資料）: https://publikationen.dguv.de/widgets/pdf/download/article/4894
- Pilz による PL の基礎解説: https://www.pilz.com/en-US/support/law-standards-norms/functional-safety/en-iso-13849-1
- ISO 13849-1:2023 プレビュー（目次・範囲のみ）: https://cdn.standards.iteh.ai/samples/73481/a2b27fd1dab8460fa3cef34426de7cce/ISO-13849-1-2023.pdf

**考察:** 本標準にとって重要なのは、**「PL e ではソフトウェア要求が IEC 61508-3 に丸ごと委譲される」**という構造である。つまり最上位の安全要求では、機械安全規格の簡易ルートは使えず、汎用機能安全規格のフルセット（後述の Table A/B の手法群）が要求される。本標準の検証ガイドは IEC 61508-3 を基準に書き、ISO 13849-1 の簡易ルートは「低 PL の場合のテーラリング」として扱うのが構成上きれいである。

### 1.3 検証結果 3: 機能安全規格は「決定論的でない要素」を原則として安全機能から排除する方向で扱う

**確認できた事実:**

- IEC 61508 は故障を**ランダムハードウェア故障**と**系統的故障（systematic failure）**に分ける。ソフトウェアの故障はすべて系統的故障であり、確率で扱わず、**プロセス（開発ライフサイクルの厳格さ）と手法の適用によって回避・制御する**という枠組みを採る。ここに「学習によって振る舞いが決まり、要求への追跡性が乏しい要素」を入れると、規格が前提とする「仕様 → 設計 → コード → テスト」の追跡性が破綻する
- **ISO 26262 の ASIL 分解**は、高 ASIL の安全要求を、**十分に独立（sufficiently independent）な** 2 つの冗長要素へ、より低い ASIL の要求として分割する設計戦略である。重要な制約として、**同種冗長（homogeneous redundancy、同じデバイス・同じソフトウェアの複製）は独立性が欠けるため一般に ASIL 低減には不十分**とされる。2 要素が同一マイクロプロセッサ、同一電源、共通原因故障経路を共有する場合、分解は成立せず各要素が親 ASIL を満たさねばならない
- ISO 26262 と ISO 21448（SOTIF）は、AI/ML アルゴリズム・モデル固有の機能不全と開発ライフサイクルを扱っていない。この穴を埋めるために **ISO/PAS 8800:2024（Road vehicles — Safety and artificial intelligence）**が発行され、ISO 26262 の AI 要素向けテーラリング／拡張として位置づけられている。分布外入力（OOD）に対する予測不能な振る舞いのリスク管理プロセスを要求する
- 航空分野では、既存の ARP-4754 / DO-178C / DO-254 が AI ベースシステムへの適合性を提供できていないと指摘されている。一方で、**AI が生成したコードそのものは DO-178C 上、人間が書いたコードと区別されない**という立場が実務側から示されている（後述 3.3）

**出典:**
- ASIL 分解と独立性（Infineon Developer Community、Knowledge Base）: https://community.infineon.com/t5/Knowledge-Base-Articles/ASIL-decomposition-ISO-26262/ta-p/852405
- ASIL 分解の概説（Jama Software）: https://www.jamasoftware.com/requirements-management-guide/automotive-engineering/asil/
- ISO/PAS 8800:2024 の位置づけ（UL Solutions）: https://www.ul.com/sis/blog/safety-related-systems-road-vehicles-artificial-intelligence-are-addressed-isopas-88002024
- ISO/PAS 8800:2024 用語（ISO Online Browsing Platform、無償公開部分）: https://www.iso.org/obp/ui/#iso:std:iso:pas:8800:ed-1:v1:en:term:4.3.14.3
- ISO/PAS 8800 解説（Perforce）: https://www.perforce.com/blog/sca/iso-pas-8800
- IEC 61508 の概要と系統的故障の扱い（IEC 公開資料）: https://assets.iec.ch/public/acos/IEC%2061508%20&%20Functional%20Safety-2022.pdf

**考察（重要）:** 本 Issue の核心である「AI が生成したコードを安全関連ソフトウェアに使えるか」に対する規格の答えは、**「生成物としてのコードは問題ではない。問題は生成プロセスが規格の要求する追跡性・レビュー・検証を満たすか、および生成に使った AI をツールとしてどう扱うかである」**と整理できる。AI が**安全機能そのものを実装（推論として動作）する**ケース（TR 5469 / ISO/PAS 8800 / EASA が扱う領域）と、**AI が開発を支援する**ケース（ツール認定の領域）は、規格上まったく別問題である。Issue #123 が対象とすべきは後者であり、この区別を本標準で明示する必要がある。

---

## 2. ISO/IEC TR 5469（Functional safety and AI systems）

### 2.1 確認できた事実

- **ISO/IEC TR 5469:2024**、Technical Report（技術報告書、規格ではなくガイダンス文書）。**2024 年 1 月発行**。ISO/IEC JTC 1/SC 42（人工知能）の成果物
- 適用範囲は次の 3 つの利用形態である（ISO 公式の scope 記述）。
  1. **安全関連機能の内部で AI を使い、その機能性を実現する**
  2. **AI 制御された機器の安全を確保するために、非 AI の安全関連機能を使う**（AI を外側の非 AI セーフティで囲う）
  3. **安全関連機能を設計・開発するために AI システムを使う** ← **本 Issue の中心はここ**
- 分類スキームは 2 軸である。**AI technology class（AI 技術クラス）**と **usage level（使用レベル）**。usage level は「エンジニアリングされた AI システムが実行するタスクの性質」に関係する。usage level の定義は **ISO/IEC TR 5469:2024 の 6.2 項**に記載される。**6 章**が、AI 技術クラスと usage level の組み合わせごとの機能安全リスクの相対水準の定性的な概観を与える
- 「10 の assurance の柱（pillars of assurance）」を提示し、AI システムの assurance case を支える構成としている（二次情報による記述）

### 2.2 未確認事項（重要）

- **usage level の各レベル（レベル数、各レベルの定義）は本調査で取得できなかった**。ISO 公式ページ、IEC ブログ、複数の販売サイトはいずれも 403 または PDF バイナリで本文を返し、無償プレビューには 6.2 項の中身が含まれない
- 同様に **AI technology class（A/B/C 等の記号を含む区分）の具体的定義も未確認**である。ネット上に「クラス A/B/C」という表現は流通しているが、TR 5469 の原文に由来するかを確認できなかった。本標準で引用する場合は**原文の入手が必須**
- 上記 3. の利用形態（開発支援 AI）に対して TR 5469 がどのような保証手法を推奨しているか、その具体的内容も**未確認**

**出典:**
- ISO/IEC TR 5469:2024 公式ページ（scope 記述）: https://www.iso.org/standard/81283.html
- 分類スキーム・6.2 項・6 章への言及（Regulations.ai によるまとめ）: https://regulations.ai/regulations/RAI-XS-GO-FUNCTIO-2024
- AI Standards Hub の登録情報: https://aistandardshub.org/ai-standards/artificial-intelligence-functional-safety-and-ai-systems-iso-iec-tr-54692024/
- IEC 公式ブログ（新規格の紹介、本調査では 403 で本文未取得）: https://www.iec.ch/blog/new-standard-increase-safety-ai
- JTC 1 における位置づけの解説資料（Riccardo Mariani、JTC1 info）: https://jtc1info.org/wp-content/uploads/2023/06/Riccardo_Mariani-Functional_Safety_and_AI_technologies.pdf
- IET「The Application of Artificial Intelligence in Functional Safety」: https://electrical.theiet.org/media/ifbjt25i/the-application-of-artificial-intelligence-in-functional-safety-v9.pdf

**考察:** TR 5469 は「AI が安全機能を実装する場合」に紙幅の大半を割いており、「AI が開発を支援する場合」は 3 番目の利用形態として挙がってはいるものの、その要求の詳細は既存のツール認定枠組み（次節）に接続すると考えるのが自然である。**本標準では TR 5469 を「3 分類の語彙を借りる」用途に留め、開発支援 AI の具体的な統制は IEC 61508-3 のツール分類と ISO 26262-8 の TCL に接続するほうが実装可能性が高い**。

### 2.3 参考: EASA の AI レベル分類（公開文書として入手可能な代替枠組み）

TR 5469 の usage level が入手できないため、公開されている類似の分類として EASA（欧州航空安全機関）の枠組みを挙げる。

- **EASA Artificial Intelligence Concept Paper Issue 2「Guidance for Level 1 & 2 machine learning applications」**、2024 年 3 月公表
- **Level 1**（人間の能力を補助・強化する AI）を 1A / 1B に細分し、**Level 2**（人間の監督下で AI が自動的に意思決定を行う。"human-AI teaming, HAT" の概念を導入）まで扱う。Level 3（自律）は今後
- 「learning assurance」「AI explainability」「ethics-based assessment」を基礎概念として展開する
- EASA AI ロードマップの第 2 フェーズ（framework consolidation）に対応し、RMT.0742 で規則・AMC へ統合予定

**出典:**
- EASA 公式ニュース（Issue 2 公表）: https://www.easa.europa.eu/en/newsroom-and-events/news/easa-publishes-artificial-intelligence-concept-paper-issue-2-guidance
- EASA AI Concept Paper Issue 2 文書ページ: https://www.easa.europa.eu/en/document-library/general-publications/easa-artificial-intelligence-concept-paper-issue-2
- Issue 02 提案版 PDF（無償公開）: https://www.easa.europa.eu/en/downloads/139504/en

**考察:** EASA の Level 1（人間を補助）／Level 2（人間の監督下で AI が決定）という分け方は、本標準の **AI 自律レベル L1〜L3** と概念が近い。本標準の L1〜L3 を対外的に説明する際、EASA の枠組みと**同型だが別体系**であることを注記しておくと、規制産業の読者との衝突を避けられる。

---

## 3. 機能安全におけるツール認定・ツール信頼度と AI コーディングアシスタント

ここが本 Issue の実務上の要である。

### 3.1 IEC 61508-3 のオフライン支援ツール分類（T1 / T2 / T3）

- IEC 61508-4 がオフライン支援ツールを次のように分類する（分類定義は 61508-4、選定要求は 61508-3 の 7.4.4 項）。
  - **T1**: 安全関連システムの実行可能コード（データを含む）に直接的にも間接的にも寄与する出力を生成しないツール。例: テキストエディタ、要求管理ツール、構成管理ツール
  - **T2**: 設計または実行可能コードのテスト・検証を支援するツール。ツールの誤りは欠陥の見逃しを招きうるが、実行コードに直接誤りを作り込むことはない。例: 静的解析ツール、テストカバレッジ計測ツール、テストハーネス
  - **T3**: 安全関連システムの実行可能コードに直接的または間接的に寄与する出力を生成するツール。例: コンパイラ、コードジェネレータ、モデルからのコード生成器
- 7.4.4.1〜7.4.4.6 項がツール選定を扱う。**選定は正当化（justify）されねばならず**、**T3 クラスの各ツールについては、そのツールが仕様または文書に適合することの証拠が利用可能でなければならない**
- 7.4.4.4 項は、**すべての T2 および T3 ツールについて、使用モデルと制約を列挙した製品文書を要求する**。7.4.4.5、7.4.4.6 項がツール妥当性確認の活動を規定する
- 7.4.4.7〜7.4.4.10 項がツール妥当性確認、記録、文書化を扱い、**ツールに起因する故障が実行可能な安全関連システムの故障につながることを制御する有効な方策**を求める

**出典:**
- T1/T2/T3 の定義解説（Analog Devices EngineerZone）: https://ez.analog.com/b/engineerzone-spotlight/posts/software-tools
- IEC 61508 におけるツール認定の必要性（61508.org / UL 資料）: https://61508.org/wp-content/uploads/2024/11/09B-IEC-61508-Why-tool-qualification_V2_cut.pdf
- 7.4.4 項の要求の整理（AbsInt、ツールベンダの規格対応ページ）: https://www.absint.com/qualification/iec.htm
- ツール認定計画の実例（Verifysoft、Testwell CTC++ の Tool Qualification Plan）: https://www.verifysoft.com/Tool_Qualification_Plan_for_Testwell_CTC.pdf
- ISO 26262 のツール認定を IEC 61508 で活用する（Siemens Verification Horizons）: https://blogs.sw.siemens.com/verificationhorizons/2020/12/17/leveraging-iso-26262-tool-certification-in-iec-61508/

### 3.2 ISO 26262-8 のツール信頼度（TCL）

- **TI（Tool Impact、ツール影響度）**: ツールの誤動作が安全関連の成果物に誤りを作り込む、または誤りの検出に失敗する可能性があるか。TI1（可能性なし）／TI2（可能性あり）
- **TD（Tool error Detection、ツール誤り検出度）**: そのツール誤動作を防止または検出できる度合い。TD1（高い確度で検出／防止）／TD2（中）／TD3（低い）
- **TCL（Tool Confidence Level）**は TI と TD の組み合わせから行列で導出する。**TCL1 は最低レベルで、最終製品の品質に高い影響を与えないためツール認定は不要**。**TCL2（中）／TCL3（高）はツール認定が必要**
- 認定方法は 4 つある。
  1. **使用実績による信頼度の増大（increased confidence from use）**
  2. **ツール開発プロセスの評価（evaluation of the tool development process）**
  3. **ソフトウェアツールの妥当性確認（validation of the software tool）**
  4. **安全規格に従った開発（development in accordance with a safety standard）**
- 推奨度は対象機能の ASIL に依存し、**高 ASIL かつ TCL3 の組み合わせでは 3.（妥当性確認）または 4.（規格準拠開発）が優先される**

**出典:**
- ツール分類と認定（Model Engineering Solutions）: https://model-engineers.com/en/blog/tool-classification-and-qualification-in-compliance-with-iso-26262/
- ツール認定の必要性（Embitel）: https://www.embitel.com/blog/embedded-blog/why-is-software-tool-qualification-indispensable-in-iso-26262-based-software-development
- itemis によるツール認定の定義: https://www.itemis.com/en/glossary/tool-qualification/
- 実施タイミングと方法（BTC Embedded Systems）: https://www.btc-embedded.com/when-and-how-to-qualify-tools-according-to-iso-26262
- 実際の TCL 判定文書の例（GitHub CodeQL Coding Standards の ISO 26262 ツール認定文書、公開）: https://github.com/github/codeql-coding-standards/blob/main/docs/iso_26262_tool_qualification.md
- MathWorks によるツール認定戦略: https://www.mathworks.com/content/dam/mathworks/tag-team/Objects/m/61793_CMR10-16.pdf
- Reactis Safety Manual のツール分類章（実装例）: https://reactive-systems.com/reactis-safety-manual/tool-classification.html

**考察（本調査の中核的な帰結）:** **AI コーディングアシスタントの位置づけは、TD（誤り検出度）を上げることで TCL を下げる、という枠組みで扱うのが規格的に整合する。**

- 素朴に見れば、AI がコードを生成するなら **T3 相当・TI2 相当**である。T3 ツールには「仕様への適合の証拠」が要求されるが、LLM は仕様書がなく、決定論的でなく、バージョン間で挙動が変わるため、**T3 ツールとしての認定は現実的に不可能**である（本調査時点の解釈）
- したがって実務上の唯一の成立経路は、**AI 出力を「未検証の入力」として扱い、後段の決定論的な検証（レビュー、静的解析、テスト、カバレッジ）で完全に捕捉する**ことである。この構成では AI は「実行コードに寄与する出力を生成するが、その誤りは後段で検出される」という位置になり、**TD を TD1 に押し上げることで TCL1（認定不要）に落とせる**
- ISO 26262 の TI/TD/TCL 行列は、まさにこの「検出手段があれば信頼度要求を下げられる」という考え方を明文化している。**本標準の AI 生成コードに対する統制は、この論理をそのまま採用できる**

### 3.3 航空分野の実務側の見解（2026-02 時点）

- WITTENSTEIN high integrity systems の Andrew Longhurst による寄稿（2026 年 2 月 28 日）は次の立場を示す。
  - **DO-178C の下で AI 生成コードは人間が書いたコードと同一に扱われる**。すべての行が、(a) 低位要求へトレースし、(b) 承認されたコーディング規約に適合し、(c) **独立したエンジニアによってレビューされ理解され**、(d) 決定論的テストによって検証されねばならない
  - 「AI はエンジニアの役割を**第一著者からレビュー・編集者へ移す**が、**アカウンタビリティは完全に人間に残る**」
  - **DO-330（ツール認定）の複雑な要求を避けるため、多くの組織は AI 出力を「助言的（advisory）」に留め、検証されていないビルドチェーンの外に置いている**
  - 認証は決定論的ビルドと再現可能な出力を要求するため、**モデルバージョンを固定し、プロンプトを構成管理下のツールとしてアーカイブする**必要がある
  - AI が有効な適用領域: 高位要求から詳細ソフトウェア要求への分解、ボイラープレートコード（インタフェース、ステートマシン、ドライバ）の生成、要求からの単体テスト生成とカバレッジギャップの特定
  - AI が決してしてはならないこと: 最終的な安全上の決定、人間のレビューなしでの飛行クリティカルコードの変更、形式的検証活動の代替、決定論的振る舞いの隠蔽

**出典:** https://aerospaceglobalnews.com/opinion/ai-aerospace-software-do-178c-certification/

**考察:** この寄稿は業界誌のオピニオンであり規制当局の公式見解ではないが、**「AI 出力を advisory に留めてツール認定を回避する」という実務パターンは、3.2 の TCL 論理と完全に一致する**。本標準の安全関連ソフトウェア向けガイドは、この 2 つを同じ原則の別表現として提示できる。また「プロンプトとモデルバージョンを構成管理下に置く」という具体策は、本標準の記録要求へ直接落とし込める。

---

## 4. V&V 手法: 規格が要求する検証技法

### 4.1 IEC 61508-3 の手法表と SIL 別推奨度

- IEC 61508-3 は附属書 A / B の表で技法を列挙し、SIL ごとに推奨度を示す。記法は **HR（Highly Recommended、強く推奨）／ R（Recommended、推奨）／ ---（推奨も非推奨もしない）／ NR（Not Recommended、非推奨）**である
- 7.4.7 項および 7.4.8 項がソフトウェアモジュールテストと統合テストを扱い、**Table B.2** がその際に用いる技法を重要度（SIL）に応じて示す
- **構造カバレッジ**: **MC/DC（Modified Condition/Decision Coverage）は SIL 1、2、3 で「推奨（R）」、SIL 4 で「強く推奨（HR）」**である
- 注意: HR は「その SIL でその技法を使わない場合、なぜ使わないのかの根拠を示さねばならない」という意味であり、絶対的な義務ではない（規格の一般的な運用。**条項番号は未確認**）

**出典:**
- MC/DC の SIL 別推奨度（LDRA、規格対応ツールベンダ）: https://ldra.com/capabilities/mc-dc/
- IEC 61508 準拠モジュールテストと Table B.2（exida）: https://www.exida.com/Blog/IEC-61508-Compliant-Module-Testing-Part-II
- IEC 61508 の解説（LDRA）: https://ldra.com/iec-61508/
- MC/DC の技術解説（Qt Coco）: https://www.qt.io/quality-assurance/coco/feature-modified-condition-decision-coverage-mcdc
- IEC 61508 ソフトウェア適合の概観（QA Systems）: https://www.qa-systems.com/solutions/iec-61508/

### 4.2 ISO 26262 における故障注入試験（fault injection test）

- **故障注入は ASIL A、B で「推奨（+）」、ASIL C、D で「強く推奨（++）」**である。単体テストと統合テストの双方の技法表に現れる
- ISO 26262 は単体テストレベルの故障注入を「**任意の故障を注入すること。例えば変数の値を破壊する、コードのミューテーションを導入する、CPU レジスタの値を破壊する**」と記述する
- 統合レベルの故障注入は**ソフトウェアアーキテクチャの検証**が目的であり、安全機構を実装するインタフェースに対し、メモリ破壊・データ破壊といった故障が正しく検出・処理されるかを試験する

**出典:**
- ISO 26262 準拠の故障注入試験（Embitel）: https://www.embitel.com/blog/embedded-blog/fault-injection-testing-of-safety-critical-automotive-software
- ISO 26262 の単体テスト要求（Parasoft ラーニングセンター）: https://www.parasoft.com/learning-center/iso-26262/unit-testing/
- ASIL 別要求のまとめ（Parasoft ホワイトペーパー）: https://alm.parasoft.com/hubfs/whitepaper-Achieving-Functional-Safety-Automotive-ISO-26262-ASIL.pdf
- ISO 26262 テストのベストプラクティス（QA Systems）: https://www.qa-systems.com/blog/iso-26262-testing-best-practices/

**注記（本標準にとって重要）:** ISO 26262 が単体テストレベルの故障注入の例として**「コードのミューテーションを導入する」を明示している**点は、本標準がミューテーションテストを安全関連ソフトウェアの検証手段として位置づける際の直接の根拠になる。ただしこれは二次情報経由の引用であり、**原文の条項番号と正確な文言は未確認**である。

### 4.3 故障注入の手法分類

- 大分類として **HWIFI（hardware-implemented fault injection、ハードウェア実装故障注入）** と **SWIFI（software-implemented fault injection、ソフトウェア実装故障注入）** がある
- 別の軸として、**シミュレーションベース**（ハードウェアモデルへ注入）と**物理的技法**（実システム・試作機へ注入）がある
- **SWIFI** はハードウェア故障（ゲートレベルのスタックアット等）の影響をソフトウェア上でエミュレートする。実装は次の 2 系統に分かれる。
  - **実行前（pre-runtime）**: バイナリ実行形式またはソースコードを改変して故障を作り込む ← **ミューテーションテストはここに属する**
  - **実行時（runtime）**: ソフトウェアトラップで実行を止め、プロセッサやプログラムの特定箇所へ故障を注入する
- SWIFI が扱える故障モデルは広い。**ハードウェア故障を表すモデル**（CPU レジスタ・メモリの単一／多重ビットフリップ）と、**ソフトウェア故障を表すモデル**（最も一般的な実ソフトウェア欠陥を模したコードミューテーション）の双方を実装できる
- ハードウェア故障は持続時間で**恒久故障（permanent）**と**過渡故障（transient、ソフトエラー）**に分類される
- モデルレベルの故障注入（MODIFI: MOdel-Implemented Fault Injection）は Simulink モデル等に対する注入手法として研究されている

**出典:**
- SWIFI の定義と分類（VALU3S プロジェクト リポジトリ、EU 研究プロジェクト）: https://repo.valu3s.eu/method/software-implemented-fault-injection
- ソフトウェア故障注入によるディペンダビリティ評価のサーベイ: https://www.researchgate.net/publication/293640828_Assessing_Dependability_with_Software_Fault_Injection_A_Survey
- ソフトウェア／ハードウェア故障注入ツール・技法のサーベイ: https://www.researchgate.net/publication/363316033_A_Survey_on_SoftwareHardware_Fault_Injection_Tools_and_Techniques
- SWIFI 方法論（IEEE）: https://ieeexplore.ieee.org/document/941435/
- MODIFI: モデル実装故障注入ツール（Springer）: https://link.springer.com/chapter/10.1007/978-3-642-15651-9_16

**考察:** いわゆる chaos engineering（本番系での障害注入）は、この分類では「実行時 SWIFI／物理的技法」の運用版に相当する。**ただし機能安全の文脈では、本番稼働中の安全関連システムに故障を注入することは通常許されない**。本標準では、chaos engineering は分散システムの可用性検証の文脈に限定し、安全関連ソフトウェアの検証には**実行前 SWIFI（ミューテーション）＋ HIL 環境での実行時注入**を割り当てるのが妥当である。

---

## 5. ミューテーションテストと AI 生成コード（2026-08-05 時点）

### 5.1 ツールと CI 組み込み

- 主要ツール: **PIT（PITest、Java の標準的選択肢）**、**Stryker Mutator（JavaScript / TypeScript / C# / Scala）**、**mutmut（Python）**
- CI への組み込みは**差分ベースの増分実行（incremental / diff-based）**が定石である。main へ向けた PR では全体実行ではなく、前回 main 実行以降の変更分だけを対象にする
- **StrykerJS の incremental モード**: `--incremental` で実行するとコードとテストの変更を追跡し、変更されたコードのみミューテーションテストを実行するが、最終レポートは完全なものを出力する。前回結果を `reports/stryker-incremental.json` に保存し、次回実行時に可能な限り再利用する
- 4 ツールに共通する CI パターンは「**増分解析 ＋ 並列実行 ＋ スコアに基づく exit code ゲート**」である

**出典:**
- StrykerJS incremental モード発表: https://stryker-mutator.io/blog/announcing-incremental-mode/
- StrykerJS incremental ドキュメント: https://stryker-mutator.io/docs/stryker-js/incremental/
- ミューテーションテストの CI 統合パターン（Calmops）: https://calmops.com/software-engineering/mutation-testing/
- Stryker 設定ガイド（OneUptime）: https://oneuptime.com/blog/post/2026-01-25-mutation-testing-with-stryker/view

### 5.2 AI 生成テストの品質評価としてのミューテーションスコア

- **カバレッジは AI 生成テストの品質指標として機能しない**。**カバレッジ 100% でミューテーションスコアが 4% という測定例**が報告されている。ミューテーションスコアのほうが信頼でき厳格な尺度である
- **MutGen 研究**: HumanEval-Java において、素の LLM プロンプトによるテスト生成のミューテーションスコアは **53%** に留まった。ミューテーションフィードバックを導入することで、**llama3-70b で最大 +8.44%、GPT-4o で +10.67%、GPT-3.5 で +5.14%** の系統的な改善を得た
- **AI 生成テストの既知の弱点**: ミューテーション演算子が条件境界をずらした場合、LLM 生成テストは代表的な無効入力や境界から遠い有効値を検査する傾向があり、**境界を殺すアサーション（boundary-killing assertion）の生成に頻繁に失敗する**
- **22,374 件のテスト生成タスクを走らせた研究**では、**LLM は実際のコード挙動を無視し、事前学習知識に対してアサートする**傾向が確認された
- **Meta の産業適用**: 2024 年 10 月〜12 月にかけて Facebook、Instagram、WhatsApp、Meta のウェアラブル向けに LLM ベースのミューテーションテストを展開し、**プライバシーエンジニアが生成テストの 73% を受け入れた**
- **PRIMG**（ミュータント優先度付けによる LLM テスト生成）は、実プロジェクトでテストスイートのサイズを大幅に削減しつつ高いミューテーションカバレッジを維持した

**出典:**
- Mutation-Guided Unit Test Generation with a Large Language Model（arXiv、HTML 版）: https://arxiv.org/html/2506.02954
- LLMs Are the Key to Mutation Testing and Better Compliance（Meta Engineering、2025-09-30）: https://engineering.fb.com/2025/09/30/security/llms-are-the-key-to-mutation-testing-and-better-compliance/
- Mutation-Guided LLM-based Test Generation at Meta: https://www.researchgate.net/publication/394720083_Mutation-Guided_LLM-based_Test_Generation_at_Meta
- PRIMG: Efficient LLM-driven Test Generation Using Mutant Prioritization（EASE 2025、ACM DL）: https://dl.acm.org/doi/10.1145/3756681.3756991
- Do Coverage and Mutation Scores of LLM-Generated Test Suites Correlate with Their Effectiveness?（再現性研究、arXiv）: https://arxiv.org/html/2607.22880v1
- AI 生成コードのミューテーションテスト実務ガイド（Augment Code、ベンダ二次情報）: https://www.augmentcode.com/guides/mutation-testing-ai-generated-code

**注記:** 上記の数値はいずれも論文要約・企業ブログ経由で取得しており、**論文本文での再確認をしていない**。本標準に転記する場合は原典で数値を検証すること。

---

## 6. AI にテストを書かせる際の独立性の問題

本 Issue で最も本標準の設計に影響する論点である。

### 6.1 規格が要求する「独立性（independence）」

- IEC 61508-1 は**機能安全アセスメント（functional safety assessment）**の実施者に対し、対象となる機能安全の責任者から**適切に独立**していることを要求する。独立性の最低水準は SIL と結果の重大性に依存する
  - **SIL 1**: 同一組織内の独立した人（independent person）でよい
  - **SIL 4**: 独立した組織（independent organisation）でなければならない
  - **SIL 2、SIL 3**: システムの特性等の要因に影響される中間的水準
- 関連する表は 2 つある。**Table 4** が全体安全ライフサイクルのフェーズ 1〜8 および 12〜16 における独立性の最低水準を、**Table 5** がフェーズ 9、10（E/E/PE システムおよびソフトウェアの全フェーズを含む）における最低水準を示す。**表の中身の詳細は原文未確認**
- ISO 26262 の ASIL 分解における「十分な独立性」も同種の要求である（1.3 節参照）。**同種冗長は独立性を満たさない**

**出典:**
- IEC 61508 の包括ガイド（Spyrosoft、独立性の水準に言及）: https://spyro-soft.com/blog/industry-4-0/iec-61508
- exida IEC 61508 Overview Report: https://www.exida.com/articles/IEC-61508-Overview.pdf
- IEC 61508 アセスメント・認証・その他の保証手段（Safety-Critical Systems Club 公開資料）: https://esc.uk.net/wp-content/uploads/2012/09/IEC-61508-Assessment-Certification-and-Other-Assurance-Measures-October-2014.pdf
- 機能安全アセスメント（TÜV SÜD）: https://www.tuvsud.com/en-us/services/functional-safety/iec-61508

### 6.2 LLM が実装とテストの両方を書く場合の独立性喪失（研究成果）

- **「On the Risk of Coding Before Testing: An Empirical Study on LLM-Based Test Generation Workflow」**（Michael Konstantinou、Florian Tambon、Mike Papadakis、arXiv:2607.05139、2026 年）
  - 問題設定: 従来の TDD が機能した理由は**仕様（テスト）と実装の独立性**にあり、それが確証バイアスを減らした。しかし実務の LLM ワークフローでは、まず LLM でコードを生成し、次にそのコードに対してテストを書かせるため、**実装と生成テストの間に強い依存が生じる**
  - 手法: test-first（仕様のみからテスト生成）と code-first（実装コードを見た後にテスト生成）を比較し、ミューテーションテストと欠陥検出能力でテスト品質を測定
  - 結果: **test-first のほうが有意に効果的なテストスイートを生成する**。実装コードを見る前に作られたテストは、より高いミューテーションスコアを達成し、より多くの実装欠陥を検出した
  - 推奨: LLM をテスト作成に用いる場合、**テスト生成フェーズと実装フェーズの独立性を維持すべき**である
  - **注記: 本メモの記述は PDF 要約経由であり、具体的な数値・対象データセット・モデル構成は未確認**
- **誤った解を与えた場合の追従バイアス**: 誤っている可能性のある解を与えられ、それを評価するテストケースを書くよう指示されると、**すべてのモデルで顕著な性能劣化**が起きる。さらに**「解に追従するな」と明示的にプロンプトしてもなお、与えられた解に迎合するバイアスがある**（Scoring Verifiers、arXiv:2502.13820）
- **自己評価バイアス**: LLM が生成したベンチマークは**それを作ったモデル自身を系統的に優遇する**。多様性制御を明示しても、各モデルの暗黙のスタイル傾向が均質でモデル固有の出力を生み、自身のスコアを押し上げる（When LLMs Benchmark Themselves、arXiv:2509.26600）
- **LLM 生成テストケースの欠陥被覆**: TestCase-Eval（arXiv:2506.12278）は、アルゴリズム問題に対する LLM 生成テストケースの欠陥被覆・露出を体系評価している
- **多エージェント化による緩和**: 「Hallucination to Consensus: Multi-Agent LLMs for End-to-End JUnit Test Generation」（arXiv:2506.02943）は、複数エージェントの合意形成でテスト生成品質を改善するアプローチを示す
- **テストオラクルの権威の所在**: 「LLM-Based Test Oracles: Source-of-Authority Taxonomy」（arXiv:2607.05031）が、LLM ベースのオラクルが「何を正解の根拠にしているか」の分類を体系的レビューとして整理している

**出典:**
- On the Risk of Coding Before Testing（arXiv PDF）: https://arxiv.org/pdf/2607.05139
- Scoring Verifiers: Evaluating Synthetic Verification for Code and Reasoning: https://arxiv.org/pdf/2502.13820
- When LLMs Benchmark Themselves: Deconstructing Self-Bias in Automated Evaluation: https://arxiv.org/abs/2509.26600
- Can LLMs Generate High-Quality Test Cases for Algorithm Problems? (TestCase-Eval): https://arxiv.org/pdf/2506.12278
- Hallucination to Consensus: Multi-Agent LLMs for End-to-End JUnit Test Generation: https://arxiv.org/pdf/2506.02943
- LLM-Based Test Oracles: Source-of-Authority Taxonomy: https://arxiv.org/pdf/2607.05031
- Large Language Models for Software Testing: A Research Roadmap: https://arxiv.org/pdf/2509.25043

**考察:** 規格が要求する「独立性」は**組織的独立性（誰が評価するか）**であり、研究が示す独立性は**情報的独立性（何を見てテストを書くか）**である。両者は別物だが、**AI を使う場合は後者が前者を侵食する**。人間の場合、実装者と検証者を分ければ情報的独立性も自然に確保されたが、同一の LLM／同一のコンテキストを使えば、担当者を分けても**モデルの事前学習知識とスタイル傾向という共通原因**が残る。これは ISO 26262 の「同種冗長は独立性として不十分」という原則と構造的に同じ問題である。

**独立性を確保する実務的手段（本調査からの整理。一部は解釈）:**

1. **順序による独立性**: テストを実装より先に生成する（test-first）。研究で最も明確に効果が示された手段
2. **入力による独立性**: テスト生成には**仕様のみ**を渡し、実装コードをコンテキストに入れない
3. **エージェントによる独立性**: 実装と検証を別セッション／別コンテキストで実行する。ただし同一モデルなら共通原因は残る（部分的緩和）
4. **モデルによる独立性**: 実装と検証で異なるベンダのモデルを使う（多様冗長に相当。本調査では規格・研究による裏付けを確認できていない**仮説**）
5. **人間による独立性**: 受け入れ基準を人間が事前に定義し、AI 生成テストがそれを満たすかを人間が判定する。**規格が求める組織的独立性を満たせるのはこの手段だけ**である

---

## 7. ウォッチドッグタイマとセーフ状態遷移

- IEC 61508-2 附属書 A の **Table A.10** が、デジタル機器のプログラムシーケンスにおけるハードウェア故障を制御する診断技法・方策を推奨する。ウォッチドッグを用いるものとして 3 類型がある。
  1. **独立した時間基準を持つが時間窓を持たない**単純ウォッチドッグ → **低い診断範囲（low DC）**しか主張できない
  2. **独立した時間基準と時間窓の双方を持つ**ウィンドウ付きウォッチドッグ → **中程度の診断範囲（medium DC）**を主張できる
  3. **チャレンジ／レスポンス方式のウィンドウ付きウォッチドッグ** → MCU の演算能力そのものを検査できるため、プログラムシーケンス故障に対する診断範囲をさらに高められる
- **高い診断範囲（high DC）**を得るには、ウォッチドッグによる時間監視に加えて**論理監視（logical monitoring、プログラムフローの正しい順序の監視）**を併用する
- **IEC 61508-2:2010 の Table A.15 および Table A.16 は、SIL と診断範囲によらずウォッチドッグタイマを「強く推奨（HR）」としている**
- **外部または独立したウォッチドッグ（スーパーバイザ IC の形態）**が望ましい。共通原因故障を排除し、MCU が故障しても安全機能がトリガされることを保証するためである

**出典:**
- ウォッチドッグによるプログラムシーケンス監視（Analog Devices、Analog Dialogue Part 4）: https://www.analog.com/en/resources/analog-dialogue/articles/improving-industrial-functional-safety-part-4.html
- 同（EDN 掲載版）: https://www.edn.com/program-sequence-monitoring-using-watchdog-timers/
- 安全上重要な機能（Analog Devices、Part 3）: https://www.analog.com/en/resources/analog-dialogue/articles/improving-industrial-functional-safety-part-3.html
- 組込システムにおける堅牢なウォッチドッグ実装（In Compliance Magazine）: https://incompliancemag.com/implementing-robust-watchdog-timers-for-embedded-systems/
- 監視回路と機能安全（Analog Devices RAQ Issue 226）: https://www.analog.com/en/resources/analog-dialogue/raqs/raq-issue-226.html

**未確認事項:** 「セーフ状態（safe state）遷移」の設計と検証について、規格が要求する具体的手順（セーフ状態の定義要求、遷移時間の要求、セーフ状態からの復帰の要求）は本調査では**十分に掘れていない**。IEC 61508-2 のセーフ状態関連要求、ISO 26262 の FTTI（Fault Tolerant Time Interval）／FHTI との関係は追加調査が必要である。

---

## 8. 日本企業における実態に関する所見

本調査では、日本の機能安全実務における「建前と運用の乖離」を直接扱う一次情報（監査報告、業界団体の実態調査等）を**発見できなかった**。以下は本調査から演繹される仮説であり、裏付けは取れていない。

- ISO 13849-1 の PL c〜d 要求である「ISO 9001 相当の QMS」「ソースコードのウォークスルー」は、既存の品質保証部門の活動へ形式的に吸収されやすく、**安全関連ソフトウェア固有の検証として実質が伴っているかの検証が難しい**
- 「PL e では IEC 61508-3 第 7 章が適用される」という委譲構造は、実務では**「安全部品ベンダの認証済み部品を買ってきて PL e を確保し、自社のアプリケーションソフトは低 PL に留める」**という設計判断へ向かいやすい。これ自体は正当な設計だが、**自社に検証能力が蓄積しない**という副作用がある

この節は**追加調査が必要**である。

---

## 9. 本標準（Process Compass フェーズ4標準）への提言

### 9.1 用語の扱い

1. **「PLr/SIL」という併記をやめる**。規格名を必ず添える（1.1 節）。本標準の一般ガイドとしては「**安全度水準**」という抽象語を使い、「適用規格の特定」を判定フローの最初のステップに置く
2. TR 5469 の usage level／technology class は**原文未入手のため、本標準では引用しない**。引用するなら規格を購入してから。代わりに公開文書である EASA Concept Paper Issue 2 の Level 1A/1B/2 を参照枠として使える（2.3 節）
3. **本標準の L1〜L3（AI 自律レベル）が EASA Level 1/2 と同型だが別体系である**旨を注記し、混同を防ぐ

### 9.2 AI 生成コードの統制モデル（本調査の中核提言）

**原則: AI 出力は「未検証の入力（advisory output）」として扱い、決定論的な後段検証で完全に捕捉する。**

この原則は次の 2 つの規格枠組みから同時に導かれる（3.2、3.3 節）。

- ISO 26262-8 の TI/TD/TCL: **TD（誤り検出度）を上げれば TCL は下がる**。AI は TI2 だが、後段検証で TD1 を達成すれば TCL1（ツール認定不要）に落とせる
- IEC 61508-3 の T1/T2/T3: AI を **T3 ツールとして認定するのは現実的に不可能**（仕様がなく、決定論的でなく、バージョン間で挙動が変わる）。認定を回避する唯一の道が「advisory 扱い＋後段検証」である

**具体的な統制項目（本標準の記録要求へ落とし込む）:**

- **モデルバージョンの固定と記録**。AI 支援で生成した成果物には、使用モデル ID とバージョンを記録する
- **プロンプトの構成管理**。プロンプトをツールの一部として構成管理下に置く
- **人間の最終責任の明示**。「AI は第一著者からレビュー・編集者へ役割を移すが、アカウンタビリティは完全に人間に残る」を原則文として本標準に明記する
- **AI が触れてはならない領域の明示**: 最終的な安全上の決定、人間レビューなしの安全関連コード変更、形式的検証活動の代替、決定論的振る舞いの隠蔽

### 9.3 リスク区分・AI 自律レベルとの接続

- **安全関連ソフトウェア（人身への危害につながりうる制御）は、無条件に R1（最高リスク区分）として扱うべき**である。既存の「R1 → L1（AI は提案のみ、人間が全実行）」の固定は、9.2 の「advisory 扱い」原則と完全に一致する。**この一致は本標準の体系の妥当性を外部規格で裏付ける材料になる**ので、明示的に書くとよい
- ただし**粒度に注意**する。安全関連システムのすべてのコードが安全関連ソフトウェアではない。安全関連部（SRP/CS 相当）と非安全部を切り分け、**非安全部には通常の R2/R3・L2/L3 を適用してよい**という但し書きを置く。これがないと、安全製品を作る組織で AI 活用が全面停止する
- **G ゲートとの対応**: 安全関連ソフトウェアでは、規格の要求する**機能安全アセスメント（IEC 61508-1）を独立したゲートとして追加**する必要がある。既存の G-1〜G-8 のどれかに吸収するのではなく、「G-x に対する追加の独立アセスメント」として重ねる設計が、規格の独立性要求（6.1 節）と整合する

### 9.4 テスト生成における独立性ルール（本標準の新規ルール候補）

研究成果（6.2 節）から、次の順序で強度を段階化するルールを提案する。

| 独立性レベル | 内容 | 適用対象 |
|---|---|---|
| 弱 | 実装と検証を別セッション／別コンテキストで実行 | R3（低リスク） |
| 中 | テストを実装より先に生成する（test-first）。テスト生成に実装コードを渡さない | R2 |
| 強 | 上記に加え、人間が受け入れ基準を事前定義し、AI 生成テストの十分性を人間が判定する | R1・安全関連 |
| 最強 | 上記に加え、規格が要求する組織的独立性（IEC 61508-1 の独立した人／部門／組織）を満たす検証担当を置く | 安全関連（SIL 2 以上相当） |

**根拠となる原則**: 「AI が実装とテストの両方を書くと、TDD が依拠していた仕様と実装の独立性が失われ、確証バイアスが復活する」（arXiv:2607.05139）。これは ISO 26262 の「同種冗長は独立性として不十分」と構造的に同じ問題である。

### 9.5 検証手法の推奨マトリクス（設計方針）

本標準の検証ガイドは、以下の 2 軸で手法を割り当てる構成を推奨する。

- 縦軸: 本標準のリスク区分 R1〜R3（安全関連は R1 の特別ケース）
- 横軸: 検証手法（レビュー、静的解析、単体テスト、構造カバレッジ、境界値解析、ミューテーションテスト、故障注入、独立アセスメント）
- 各セルの記法は**機能安全規格の HR / R / NR 記法を借りる**。これにより規格適合が必要な組織がマッピングしやすくなる

**規格側の事実に基づく初期値（4 節より）:**

- MC/DC: SIL 1〜3 で R、SIL 4 で HR（IEC 61508-3 Table B.2）
- 故障注入: ASIL A/B で + （推奨）、ASIL C/D で ++（強く推奨）（ISO 26262）
- ウォッチドッグ: SIL・診断範囲によらず HR（IEC 61508-2 Table A.15/A.16）

### 9.6 ミューテーションテストの位置づけ

- **ISO 26262 が単体テストレベルの故障注入の例として「コードのミューテーションを導入する」を挙げている**（4.2 節）。この事実により、**ミューテーションテストは「機能安全規格が求める故障注入試験の一形態」として本標準に位置づけられる**。これは本標準にとって強い論拠である（ただし原文条項番号は未確認）
- 用途は **AI 生成テストの品質ゲート**である。カバレッジは AI 生成テストの品質指標として機能しない（カバレッジ 100% でミューテーションスコア 4% の例）。**AI がテストを書く工程には、カバレッジではなくミューテーションスコアの閾値ゲートを置く**
- CI 実装は**差分ベースの増分実行＋スコア閾値による exit code ゲート**（Stryker incremental モード等）。全量実行は現実的でない
- **既知の弱点を明示的に補う**: LLM 生成テストは境界値を殺すアサーションの生成に弱い。**境界値解析は人間または専用の手法で補完する**というルールを置く

---

## 10. 未解決事項・追加調査が必要な穴

1. **ISO/IEC TR 5469:2024 の 6.2 項（usage level の定義）と AI technology class の具体的定義**。規格購入が必要
2. **TR 5469 が「AI を安全関連機能の設計・開発に使う」場合に推奨する具体的な保証手法**。本 Issue の中心論点だが、規格本文が読めず未確認
3. **ISO 13849-1:2023（第 4 版）におけるソフトウェア要求の正確な条項番号**。2015 年版の 4.6 節に相当する箇所
4. **IEC 61508-1 Table 4 / Table 5 の具体的内容**（SIL 別の独立性水準の正確な区分）
5. **ISO 26262 が「コードのミューテーション」に言及している正確な条項番号と文言**（Part 6 の単体テスト技法表と推定されるが未確認）
6. **セーフ状態遷移の設計・検証に対する規格要求**（7 節末尾参照）。FTTI との関係を含めて別途調査が必要
7. **日本企業における機能安全実務の実態**（8 節）。一次情報が見つからず、仮説のみ
8. **arXiv:2607.05139 の具体的な数値・実験設定**。PDF 要約経由でしか読めておらず、定量的主張を本標準に転記する前に原典確認が必要
9. **モデル多様性による独立性確保（実装と検証で異なるベンダのモデルを使う）の効果に関する実証研究**。本調査では発見できず、9.4 節の「弱／中」の中間に置くべきかどうか判断できていない
10. **IEC 62061:2021 と ISO 13849-1:2023 の相互参照関係**（SILCL の扱いの変更等）。本調査では扱っていない

---

## 11. 調査枠の状況

- Web 検索枠は枯渇していない。本調査で使用した検索回数はおよそ 22 回（セッション共有上限 200 回）
- ただし**有償規格本文へのアクセス経路がない**ことが本調査の最大の制約である。ISO 公式サイト、IEC ブログ、machinerysafety101 は HTTP 403 を返し、標準機関の無償プレビュー PDF はバイナリのため本文抽出ができなかった。10 節の未解決事項の多くは、検索回数ではなく**規格の購入**によってのみ解消する
