# #318 外部調査 2: 独立検証の強さを「承認者の人数」ではなく「組織上の距離」で上げるべきか

- 調査日: 2026-10-24(全出典の参照日も同じ)
- 調査者: Claude(サブエージェント)。WebSearch・WebFetch による。WebFetch は要約モデルを経由するため、「逐語」と書いた引用も PDF の目視照合はしていない
- 読みの区分
  - **一次(本文)**: 規格・規制・論文の本文、またはその公式の翻訳採用版・公開草案を読んだ
  - **一次(抜粋)**: 公式の手引き・規格を引用した公的機関の文書で、規格の文言を読んだ
  - **二次**: 解説記事・講演資料・研修資料。規格の内容は 要約経由
- 既存の出典台帳との重複は各節の末尾に `既存:` で記す

## 0. 結論の先取り

- 調べた安全規格は**すべて**、独立性の強さを「確認する人の数」ではなく「作成者からの組織上の距離」(別人 → 別チーム/直属の上長が別 → 別部門 → 別組織)で段階づける。人数で強さを上げる規定は見つからなかった
- 距離の段階は、リスク水準(ASIL・SIL・DAL・完全性水準)に連動させている
- 距離の判定基準は「指揮命令系統」「資源(予算)」「リリース権限」の3つに収れんする(ISO 26262 の I3、IEEE 1012 の管理・財務の独立)
- 人数は、コードレビュー研究では「2人で頭打ち」という知見があり、SLSA は「レビュアーを足すことは収穫逓減」と明言する。人数は検出の層の量を増やすが、独立性の段階は上げない
- 小さな組織は、外部の評価者・契約した IV&V・認定済みの検査機関で距離を買う。規格側も「別会社までは要らない」(NRC)、「内部 IV&V・組込み IV&V」(IEEE 1012)など、内部での達成を明示的に許す段階を持つ

## 1. ISO 26262-2:2018 表1(確認措置と独立性 I0〜I3)

### 1.1 I0〜I3 の定義と表1

- URL: https://www.catarc.org.cn/upload/202104/29/202104291547457908.pdf
- 文書: GB/T 34590.2 征求意见稿(ISO 26262-2:2018 の中国国家規格の改訂の意見募集草案。「本文件使用重新起草法修改采用了ISO 26262-2：2018」= 修正採用)
- 読み: **一次(本文、ただし翻訳採用版の草案)**。ISO 原文は有償で未読。逐語は中国語
- 所在: 6.4.9.1 表1 の脚注 a
- 定義(逐語、中国語。括弧内は訳)
  - I0: 「宜执行认可措施；但如果执行，应由与负责创建工作成果的人员不同的人员执行」(確認措置を実施することが望ましい。実施する場合は、作成責任者と異なる人が行う)
  - I1: 「认可措施应由与负责创建工作成果的人员不同的人员执行」(作成責任者と異なる人が行う)
  - I2: 「认可措施应由独立于负责创建工作成果的团队的人员执行，即由不向同一个直接上级报告的人员执行」(作成チームから独立した人、すなわち同じ直属の上長に報告しない人が行う)
  - I3: 「认可措施应由在管理、资源和发布权限方面与负责创建对应工作产品的部门独立的人员执行」(管理・資源・リリース権限の点で作成部門から独立した人が行う)
- 表1(QM / A / B / C / D)
  - 影響分析の確認レビュー: I3 / I3 / I3 / I3 / I3
  - HARA の確認レビュー: I3 / I3 / I3 / I3 / I3
  - 安全計画・機能安全コンセプト・技術安全コンセプト・安全分析と従属故障分析・安全ケースの確認レビュー: — / I1 / I1 / I2 / I3
  - 統合・テスト戦略、安全妥当性確認仕様の確認レビュー: — / I0 / I1 / I2 / I2
  - 機能安全監査(6.4.11)・機能安全アセスメント(6.4.12): — / — / I0 / I2 / I3
- 6.4.9 注3(逐語): 「本文中所用的“独立性”一词指的是组织独立性」(本文書の独立性は組織上の独立性を指す)
- 6.4.10.4・6.4.12.6: レビュー担当者・評価者の補助者は少なくとも I1(要約経由)
- 人数の規定: 確認に関わる人数の下限・段階は書かれていない
- 示唆: 同じ ASIL でも、**成果物の性質で距離を変える**(HARA と影響分析は QM でも I3)。距離の定義は「人 → 直属の上長 → 部門(管理・資源・リリース権限)」の3軸で、人数の軸は無い
- 既存: SRC-0526(ISO 26262-12 プレビュー。§7.2.1 注4「independence は organizational」)。表1 は既存カードでは未読だった

### 1.2 二次資料の食い違い(注意)

- https://presencis.com/regulations/iso-26262/article-2-safety-management/ — 二次。「Review: ASIL A〜C は Independent person、ASIL D は Independent team」とする表を載せるが、上の表1 とも一致しない
- https://www.kuglermaag.com/functional-safety/fsa/ — 二次。「ASIL C は別チーム、ASIL D は別部門または社外」
- https://dvcon-proceedings.org/wp-content/uploads/institutionalizing-a-certified-iso26262-safety-process-experiences-and-lessons-learned.pdf — 二次。「I1: by a different person, I2: by a person from a different team, I3: by a person from a different department or organization」
- 示唆: 二次資料は表を単純化・誤記している。本標準で引くときは表1 の行(成果物)ごとの区別を落とさない

### 1.3 ISO 26262-8 との関係

- 第8部は検証(第9章)・ソフトウェアツールの信頼性(第11章、TCL)を扱う。**検証に I0〜I3 の独立性を課す規定は第8部に無い**と理解しているが、本文は未読(未確認)
- 示唆: ISO 26262 は「作業としての検証」と「確認措置(独立性つき)」を分け、独立性は後者にだけ課す。この分離は本標準の「検出の層」と「判定」の分離に対応しうる

## 2. DO-178C の「with independence」と DO-330

- URL: https://www.rtca.org/wp-content/uploads/2024/06/FTP1050_3-PUBLICATION.pdf
- 文書: FAS Topic Paper FTP1050「Agile Methodology」Rev 3(2024-02-26、RTCA)
- 読み: **一次(抜粋)**。DO-178C 本文は有償で未読。用語集の定義を逐語で引いた RTCA 自身の文書
- 引用(§2.0 p.4、DO-178C/ED-12C 用語集として)
  - "Independence - Separation of responsibilities which ensures the accomplishment of objective evaluation."
  - "independence is achieved when the verification activity is performed by a person(s) other than the developer"
  - "a tool(s) may be used to achieve equivalence to the human verification activity"
- §4.0 p.7: "testing, review, and analysis activities should be independent from the personnel who authored the artifact"
- 示唆: DO-178C の独立性は「作成者以外」という**職責の分離**の一段だけで、組織の距離の段階を持たない。強さは「独立性を要する目標の数」で DAL に連動させる。さらに**ツールが人の検証と同等になりうる**と明記する

### 2.1 独立性を要する目標の数

- https://en.wikipedia.org/wiki/DO-178C — 二次。目標数/独立性つき: A 71/30、B 69/18、C 62/5、D 26/2、E 0/0
- https://www.adacore.com/blog/a-fresh-take-on-do-178c-software-reviews(Appéré・Nava Bello、2024-04-16)— 二次。レビュー関係の目標で「16 out of 31 for software level A (7 out of 31 for level B, none for level C or D)」。独立性は §6.2 e を引く
- 示唆: 航空は「距離」ではなく「**どの目標に独立性を要するか(範囲)**」で強さを上げる。人数ではない点は他規格と共通

### 2.2 DO-330 との関係

- 既存: SRC-0530(NASA 論文)が「TQL-1 has the most objectives requiring satisfaction by independence」と述べる。SRC-0529(AC 20-115D)は §12.2 と DO-330 を適合手段として認める
- 示唆: 検証ツールで独立な人の検証を置き換えるなら、そのツール自体を認定する(TQL)。AI レビュアーを独立性の担い手に数える議論では、この「ツールの認定」が対応物になる

### 2.3 小規模・アジャイル

- https://arxiv.org/pdf/2311.04344 — 二次(論文)。§3.4「alternative approaches are available to ensure role independence」として TDD・ペアプログラミングを挙げ、§3.7 で「team members not involved in initial development can provide impartial assessments」
- 示唆: 航空でも、独立性は「同じチームの別人」で満たせる一段構成なので、1〜2人の体制でも原理的に到達できる

## 3. IEC 61508(機能安全アセスメントの独立性)

- 本文は有償で未読。IEC の FAQ ページ(https://www.iec.ch/functional-safety/faq)は取得に失敗した
- 既存: SRC-0649(IEC 61508:2010 目録)、SRC-0528(61508-3 第3版 CDV プレビュー)

### 3.1 表4・表5 の構造

- URL: https://esc.uk.net/wp-content/uploads/2012/09/IEC-61508-Assessment-Certification-and-Other-Assurance-Measures-October-2014.pdf
- 文書: Ron Bell「IEC61508: Assessment, Certification and Other Assurance Measures」(Safety-Critical Systems Club、2014-10 頃)
- 読み: **二次(規格の起草関係者による解説)**。表は 要約経由
- 内容
  - 三段階: independent person / independent department / independent organization
  - 表5 は SIL 別。記号 X(最低限)、X1・X2(状況により選ぶ)、Y(不十分)
  - 抽出した行(列の位置は崩れていたため再構成): 独立した人 = SIL1 X、SIL2 X1、SIL3 Y、SIL4 Y / 独立した部門 = SIL2 X2、SIL3 X1、SIL4 Y / 独立した組織 = SIL3 X2、SIL4 X
  - 引用: "If a lower level of independence is adopted, then the rationale has to be specified."
  - 引用(p.14): "There is no requirement in IEC 61508 for compliance to be attested by a certification body"
- 裏付け: https://www.exida.com/articles/IEC-61508-Overview.pdf(exida、2006、第1版ベース、二次)が同じ形を HR/HR1/HR2/NR で示す(SIL3 は独立した部門 HR1・独立した組織 HR2、SIL4 は独立した組織 HR)
- 表4(結果の重大さ別)については https://safecontrols.blog/2015/07/08/how-independent-should-your-fsa-leader-be/ (二次)が、61508-1:2010 8.2.15 を引き、結果区分 C は独立した部門、D は独立した組織とし、「complexity is high, the design is novel」の場合は C でも独立した組織を使うと説明する
- X1・X2 の選択: 経験不足・複雑さ・新規性があれば一段上げる(https://hsseworld.com/wp-content/uploads/2021/06/The-Safety-Critical-Systems-Handbook.pdf の注記「Add one level if there is lack of experience, unusual complexity or novel design.」。二次)
- 示唆: IEC 61508 は**リスク(SIL・結果)と状況(新規性・複雑さ・経験)の2つで距離を決め**、より低い距離を採るなら理由を書かせる。第三者認証は要求しない
- 依頼文の「8.2.18」について: 二次資料は 8.2.12〜8.2.15 を独立性の条項として引く。条項番号は本文で確かめていない(未確認)

### 3.2 IEC 61508-3(ソフトウェア)

- 61508-3 の検証(7.9)に SIL 別の独立性の段階があるかは、本文を読めず未確認。独立性は第1部の機能安全アセスメントに集約されているという理解(未確認)
- 実務例: https://library.e.abb.com/public/94e085279ca00c3085257625006f6de4/Functional%20Safety%20Assessment.pdf(ABB、Stuart Nunns、2009-03、二次)は SIL1・2 は社内の設計チーム外の人、SIL3 は社内の別の専門組織(SLCC)の指揮下で行うと定めていた
- IEC 61511 5.2.6.1.2(プロセス産業)は「at least one senior competent person not involved in the project design team」(safecontrols の引用、二次)。**最低1人**という書き方で、人数ではなく「関与していない」ことが要件

## 4. EN 50128:2011 / EN 50716:2023(鉄道ソフトウェア)

- 本文は有償で未読。以下はすべて二次(要約経由)
- URL: https://www.csa.ch/en/blog/the-new-en-50716-rules-for-project-organisation(CSA Engineering、日付・著者の表示無し)
  - 基本完全性(旧 SIL0): 評価者不要。テスター・検証者・妥当性確認者は同一人物でよい
  - SIL1・2: 独立した評価者(Assessor)を置く。要求管理者・設計者・実装者は自分の作ったコンポーネントをテストしない
  - SIL3・4: 妥当性確認者(Validator)はプロジェクトマネージャーの部下であってはならない。検証者と妥当性確認者は原則別人
  - 評価者: プロジェクトチームから独立し、別の組織単位に属する。EN 50716 では顧客・供給者・第三者のいずれの組織に属してもよい
  - 兼務禁止の例: "a validator may not also be an implementer at the same time"(5.1.2.10〜5.1.2.12)
  - EN 50716 の変更: 統合者の役割を削除。検証者と妥当性確認者の入れ替えは禁止から「非推奨」へ
- https://www.csa.ch/en/blog/verification-for-safety-related-applications — 二次(EN 50126/50129 の文脈)。SIL4 でも「the verifier may in principle be subordinate to the project manager」、ただし妥当性確認を兼ねない場合
- https://www.spilma.com/en/guides/en-50128-50657-rail-software — 二次。EN 50716 まえがきは組織の選択肢を「broadly unchanged」とする。ETCS では CSM 評価機関(規則 (EU) 402/2013)が行い、A・B・C 型の独立性(ISO/IEC 17020)をいずれも認める
- 示唆: 鉄道は**役割ごとに報告線を規定**する(検証者は PM 配下でも可、妥当性確認者は PM 配下不可、評価者は別組織単位)。強さは「誰の配下にいるか」で上げており、人数ではない。役割を人に割り当てるので、1人が複数役割を持つ組み合わせの許否が要点になる

## 5. IEEE 1012-2016(V&V)

- IEEE 1012-2016 本文は有償で未読。プレビュー(accuristech)は取得失敗
- 既存: SRC-0522(NASA-STD-8739.8B §4.4.1.2 が技術・管理・財務の3要素を IEEE の定義として規定)、SRC-0523(NRC RG 1.168 Rev.2: "The new IEEE concept of conditional independence in Annex C, Table C.1 is not acceptable to the NRC staff." と "this does not mean that a separate company should perform independent V&V.")
- URL: https://www.scirp.org/html/23958.html
- 文書: Joon Ku Lee・Yang Mo Kim「Lessons Learned from Practical Independent Verification and Validation Based on IEEE 1012」(J. Software Engineering and Applications 5、2012)
- 読み: **二次(査読論文、IEEE 1012 の形態を引用)**
  - 5形態: "Classical IV & V embodies all three independence parameters." / Modified(主契約者が IV&V を選ぶ) / Integrated(迅速なフィードバック重視) / "Internal IV & V exists when the developer conducts the IV & V with personnel from within its own" / Embedded(開発組織の人員を使う)
  - 実務: "The classic model of IV & V is desirable." と "The "integrated model" of IV & V is realistic." を対比。財務の独立が最も難しい("Financial independence seems to be tough to implement in realistic project environment.")
- https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/14%20-%20IVV/eplc_ivv_practices_guide.pdf(米 HHS、日付欄は未記入、一次(抜粋))— IEEE 1012-2004 の3要素を引用。財務の独立を "funded from a general & administrative expense account" とする
- 示唆: IEEE 1012 は独立性を**技術・管理・財務の3軸の組み合わせ**として扱い、形態(Classical〜Embedded)を段階として並べる。規制当局(NRC)は「条件付き独立」の緩和は拒んだが、別会社までは要求しない。距離は「組織図」だけでなく「予算を誰が握るか」でも測られる

## 6. その他

### 6.1 NASA IV&V(NPR 7150.2D SWE-141)

- URL: https://swehb.nasa.gov/spaces/SWEHBVD/pages/102695499/SWE-141+-+Software+Independent+Verification+and+Validation
- 読み: **一次(要求文)+ NASA 手引き**
- 要求(3.6.2): "For projects reaching Key Decision Point A, the program manager shall ensure that software IV&V is performed" — 対象は Category 1、Category 2 かつ Class A/B ペイロード、MDAA の選定案件
- 手引き: "financially, managerially, and technically independent and cannot be part of a company associated with the development organization." / "the NASA IV&V Facility serve as the sole provider of IV&V services unless an alternative provider is approved."
- 小規模案件: 対象区分に当たれば必要。外れる案件は Class C 以下が多い。対象だが資金が付かない場合は自費で IV&V を行うか、免除(SWE-126・SWE-223)を得る
- 示唆: 最も強い距離(別会社・別予算)は**対象案件を絞って**課す。全案件に課さず、外す場合は免除の記録を残す
- 既存: SRC-0560(NPR 7150.2D 第2章)、SRC-0522

### 6.2 ISO/IEC 17020:2012 の A・B・C 型

- URL: https://www.iasonline.org/wp-content/uploads/2021/01/Tab-1-01-Understanding-ISOIEC-17020-Handbook.pdf
- 文書: IAS「Understanding ISO/IEC 17020:2012」研修ハンドブック(J.E.J. Gravel、Rev 5.0、日付無し)
- 読み: **一次(抜粋)**。附属書A の規範文をハンドブックが転記したものを読んだ
  - A型(A.1 a): "The inspection body shall be independent of the parties involved." 設計・製造・供給・設置・購入・所有・使用・保守に関与する法人の一部であってはならない。共通の所有・役員・上位経営への報告による結びつきも不可
  - B型(A.2 a): "Inspection services shall only be supplied to the organization of which the inspection body forms a part." 親組織の他機能との責任の明確な分離を、組織上の識別と報告方法で示す
  - C型(A.3 a・b): 組織内に責任の分離の保護措置を設ける。同一の人が同じ品目の設計等と検査の両方を行ってはならない(規制上の例外を除く)
- 示唆: 適合性評価の世界では、独立性は**3段階の「型」**として定型化され、認定で確かめられる。型は人数ではなく「法人・報告線・同一人物の禁止」で定義される。本標準が距離の段階を定めるなら、この型の語彙を借りられる

### 6.3 コードレビュー研究: 人数と独立性

- https://userweb.cs.txstate.edu/~rp31/papersSQ/PorterEtAl_TSE.pdf — 一次(論文本文)。Porter・Siy・Toman・Votta「An Experiment to Assess the Cost-Benefits of Code Inspections in Large Scale Software Development」(IEEE TSE 23(6)、1997)。§5.2: "We found no difference in the interval or effectiveness of inspections of two- or four-person teams." / "The effectiveness of one-reviewer teams was poorer than both of the others."
- https://users.ece.utexas.edu/~miryung/teaching/EE379K-Spring2014/Papers/Paper%204.pdf — 一次(論文本文)。Rigby・Bird「Convergent Contemporary Software Peer Review Practices」(ESEC/FSE 2013)。"Two reviewers find an optimal number of defects." / Microsoft では招待は中央値3〜4人だが実際の参加は "the median number of people that actually take part in a review (other than the author) is 2." / "Contemporary review usually involves two reviewers."
- https://www.michaelagreiler.com/code-reviews/ — 二次。Sadowski ら「Modern Code Review: A Case Study at Google」(ICSE-SEIP 2018)の要約として "more than 75% of the code reviews have just one reviewer."、承認は1人以上で、所有者(owner)と言語ごとのリーダビリティ資格者を含むこと。論文本文は未読(https://research.google/pubs/modern-code-review-a-case-study-at-google/ は要旨のみ)
- https://2013.icse-conferences.org/content/expectations-outcomes-and-challenges-modern-code-review.html — 一次(要旨)。Bacchelli・Bird(ICSE 2013、Microsoft)"reviews are less about defects than expected" / "code and change understanding is the key aspect of code reviewing"
- https://arxiv.org/pdf/2005.09217 — 一次(プレプリント)。Krutauz・Dey・Rigby・Mockus(2020)。レビュアー数等の指標は出荷後の欠陥を直接説明せず("we were unable to find any direct effect of review measures on post-release defects")、McIntosh らの結果を再現できなかった
- https://slsa.dev/spec/draft/threats — 一次(仕様の作業草案、現行 v1.2)。二者レビューを推奨しつつ、"requiring additional, or more senior reviewers" は "doing so has diminishing returns"。2人の共謀は "This threat is not currently addressed by SLSA." / "no actor is able to control or influence multiple accounts with review privileges"
- 示唆: 人数の効果は**2人で頭打ち**(1997・2013 で一致)。人数の指標は欠陥を安定して説明しない。Google は人数を1人に絞り、代わりに**資格(所有・リーダビリティ)**で承認を縛る。SLSA は人数の追加を収穫逓減とし、共謀(=独立性の欠如)は人数では防げないと認める
- 既存: SRC-0416(SLSA v1.2 Source requirements)、SRC-0458(Google「Writing good CL descriptions」)。上記論文のカードは無い

### 6.4 規制側の参考

- 既存: SRC-0524(FDA GPSV §4.9)"Self-validation is extremely difficult. When possible, an independent evaluation is always better, especially for higher risk applications." / "Smaller firms may need to be creative in how tasks are organized and assigned in order to maintain internal independence of review."

## 7. 小規模(1〜2人)の体制での独立性の実現

| 規格 | 内部で届く上限 | 外から買う方法 | 出典の水準 |
| --- | --- | --- | --- |
| ISO 26262-2 | I1(別人)まで。I2 は直属の上長が別であることを要するため、2人の会社では1人が上長でない限り届かない | I3 は外部の評価者・評価機関(要約経由) | 一次(翻訳草案) |
| DO-178C | 「作成者以外」の1段。2人なら相互検証で届く。ツールでも同等を得られる(ツールは DO-330 で認定) | DER・コンサルタント(本調査では未確認) | 一次(抜粋) |
| IEC 61508 | SIL1 は独立した人で足りる | SIL3・4 は独立した部門・組織。第三者認証は不要だが外部の評価者を使うのが通例 | 二次 |
| EN 50128/50716 | 基本完全性は兼務可。SIL1 以上は評価者が要る | 評価者は顧客・第三者の組織でもよい(EN 50716) | 二次 |
| IEEE 1012 | Internal・Embedded の形態 | Classical(別会社・別予算) | 二次・既存カード |
| NASA | 対象外の案件は課されない | NASA IV&V Facility または承認された代替 | 一次 |
| ISO/IEC 17020 | C型(同一組織内、同一人物の禁止) | A型(第三者) | 一次(抜粋) |
| FDA GPSV | 社内の非関与者 | 第三者(要約経由) | 既存カード |

- 共通する型: **最下段(別人)は内部で満たせる。中段(別チーム・別部門)は小さな組織では構造的に成立しない。上段は外部から買う**
- 1人の体制は、どの規格でも最下段(別人)すら内部で満たせない。外部の人か、DO-178C 的な「認定したツール」による代替しかない
- 2人の体制では、最下段は相互に満たせるが、2人が同じ指揮命令系統・同じ予算・同じリリース権限の下にあるので、ISO 26262 の I2・I3、IEEE 1012 の管理・財務の独立には届かない

## 8. 本標準への示唆

1. **独立性の強さは「距離」で段階づけ、人数を段階の軸にしない**。調べた安全規格(ISO 26262・IEC 61508・EN 50128/50716・IEEE 1012・ISO/IEC 17020・NASA)はすべて距離で段階を作っており、人数で強さを上げる規格は見つからなかった。人数を軸にすると、外部の規格と対応が取れなくなる
2. **距離の判定基準は3軸に揃える**: 指揮命令系統(直属の上長・報告線)、資源(予算)、リリース権限。ISO 26262 の I3 と IEEE 1012 の管理・財務の独立が同じ構造を持つ。「別人か」だけでは最下段しか定義できない
3. **段階はリスク区分に連動させつつ、成果物の性質で例外を置く**。ISO 26262 は HARA・影響分析だけを ASIL に依らず I3 とする。本標準でも、リスク区分の判定そのもの(R の決定)のように「誤ると後段の保証がすべて崩れる成果物」は、変更のリスク区分に依らず距離を上げる案を検討する価値がある
4. **下げるなら理由を書かせる**。IEC 61508 の「より低い独立性を採るなら根拠を明記」は、本標準の「却下を明記する」「未達と省略を区別する」(ADR-0028)と整合する
5. **人数は検出の層の量として扱い、判定の独立性とは別の軸に置く**。2人で効果が頭打ちになる知見(Porter 1997、Rigby・Bird 2013)と、SLSA の「収穫逓減」「共謀は人数で防げない」から、承認者を3人・4人と増やしても独立性は上がらない
6. **資格による縛りは人数の代替になりうる**。Google は1人の承認に所有・リーダビリティの資格を課す。本標準の「適合性確認」(担い手の力量)と組み合わせ、「誰が」を「何人」より先に定める
7. **AI の確認を距離の段階に数えるなら、DO-178C・DO-330 のツール認定が対応物**。認定していない AI を独立な人の代わりにしない。本標準の「AI の確認は検出の層」とは矛盾しない
8. **小規模の体制には「内部で届く段階」と「外から買う段階」を明示する**。2人の体制は中段に構造的に届かない。届かない段階を要求するなら、外部の評価者・契約した IV&V の経路と、それを使わない場合の扱い(未達として表示し続ける)を併記する。NASA のように対象を絞り、外すなら免除を記録する形もある
9. **規制当局は緩和を拒むことがある**。NRC は IEEE 1012 の「条件付き独立」を認めなかった。本標準が小規模向けの緩和段階を設けるなら、その段階を独立性と呼ばず、別の名前(例: 相互確認)にして混同を避けることを検討する
10. **二次資料の表は誤りが多い**。ISO 26262 表1 の二次資料は互いに食い違っていた。本標準が外部規格の段階を引くときは、一次(翻訳採用版を含む)で確かめた範囲に限り、それ以外は根拠水準マーク(ADR-0026)で開示する

## 9. 出典カード候補(作成していない)

既存カードと重複するもの: ISO 26262-12(SRC-0526)、ISO 26262-6(SRC-0527)、IEC 61508(SRC-0649・SRC-0528)、NASA-STD-8739.8B(SRC-0522)、NRC RG 1.168(SRC-0523)、FDA GPSV(SRC-0524)、AC 20-115D(SRC-0529)、NASA DO-178C 解説(SRC-0530)、NPR 7150.2D 第2章(SRC-0560)、SLSA v1.2 Source requirements(SRC-0416)。EN 50128・EN 50716・ISO/IEC 17020・IEEE 1012 本文のカードは無い。

| 候補 ID | 出典 | URL | 読み | 主な主張 |
| --- | --- | --- | --- | --- |
| SRC-0675 | GB/T 34590.2 征求意见稿(ISO 26262-2:2018 の修正採用) | https://www.catarc.org.cn/upload/202104/29/202104291547457908.pdf | 一次(翻訳草案) | 表1 の I0〜I3 定義と ASIL 別の行、注3「組織上の独立」 |
| SRC-0676 | RTCA FTP1050 Agile Methodology Rev 3(2024-02-26) | https://www.rtca.org/wp-content/uploads/2024/06/FTP1050_3-PUBLICATION.pdf | 一次(抜粋) | DO-178C 用語集の independence の定義、ツールによる同等 |
| SRC-0677 | Bell「IEC61508: Assessment, Certification and Other Assurance Measures」 | https://esc.uk.net/wp-content/uploads/2012/09/IEC-61508-Assessment-Certification-and-Other-Assurance-Measures-October-2014.pdf | 二次 | 表4・表5 の三段階、低い独立性の根拠明記、第三者認証は不要 |
| SRC-0678 | exida IEC 61508 Overview Report v2.0(2006) | https://www.exida.com/articles/IEC-61508-Overview.pdf | 二次 | 第1版の SIL 別の独立性(HR/HR1/HR2/NR) |
| SRC-0679 | CSA「The new EN 50716 rules for project organisation」 | https://www.csa.ch/en/blog/the-new-en-50716-rules-for-project-organisation | 二次 | 役割の兼務・報告線の SIL 別の規定、EN 50128 からの変更 |
| SRC-0680 | Lee・Kim「Lessons Learned from Practical IV&V Based on IEEE 1012」(2012) | https://www.scirp.org/html/23958.html | 二次(査読) | IV&V の5形態、財務の独立の難しさ |
| SRC-0681 | NASA SWEHB SWE-141(NPR 7150.2D 3.6.2) | https://swehb.nasa.gov/spaces/SWEHBVD/pages/102695499/SWE-141+-+Software+Independent+Verification+and+Validation | 一次 | IV&V の対象案件、3要素、別会社の禁止、免除の経路 |
| SRC-0682 | IAS「Understanding ISO/IEC 17020:2012」 | https://www.iasonline.org/wp-content/uploads/2021/01/Tab-1-01-Understanding-ISOIEC-17020-Handbook.pdf | 一次(抜粋) | 附属書A の A・B・C 型の独立性 |
| SRC-0683 | Porter ら(IEEE TSE 1997) | https://userweb.cs.txstate.edu/~rp31/papersSQ/PorterEtAl_TSE.pdf | 一次 | 2人と4人で有効性に差が無い、1人は劣る |
| SRC-0684 | Rigby・Bird(ESEC/FSE 2013) | https://users.ece.utexas.edu/~miryung/teaching/EE379K-Spring2014/Papers/Paper%204.pdf | 一次 | 実参加レビュアーの中央値は2、2人で最適 |
| SRC-0685 | Sadowski ら(ICSE-SEIP 2018)— 要旨と二次要約 | https://research.google/pubs/modern-code-review-a-case-study-at-google/ | 一次(要旨)+二次 | 75% 超が1人レビュー、所有・リーダビリティの資格 |
| SRC-0686 | Bacchelli・Bird(ICSE 2013) | https://2013.icse-conferences.org/content/expectations-outcomes-and-challenges-modern-code-review.html | 一次(要旨) | レビューは期待より欠陥発見が少なく、理解が要 |
| SRC-0687 | Krutauz ら(arXiv 2005.09217、2020) | https://arxiv.org/pdf/2005.09217 | 一次 | レビュー指標は出荷後欠陥を直接説明しない |
| SRC-0688 | SLSA Threats & mitigations(作業草案) | https://slsa.dev/spec/draft/threats | 一次(草案) | レビュアー追加は収穫逓減、共謀は対象外 |
| SRC-0689 | AdaCore「A Fresh Take on DO-178C Software Reviews」(2024-04-16) | https://www.adacore.com/blog/a-fresh-take-on-do-178c-software-reviews | 二次 | レビュー関係の目標の独立性の数(A 16/31、B 7/31) |

## 10. 読めなかったもの・未確認

- ISO 26262-2:2018 の ISO 原文(有償)。表1 は中国の修正採用の草案で読んだ。発行版 GB/T 34590.2-2022 との差は未確認
- ISO 26262-8 の検証に独立性の規定が無いこと(未確認)
- DO-178C 本文、附属書A の表(有償)
- IEC 61508-1:2010 の条項番号(8.2.18 か 8.2.15 か)と表5 の正確な配置、61508-3 の検証の独立性
- EN 50128:2011 §5.1.2・図2、EN 50716:2023 第5章の本文
- IEEE 1012-2016 附属書C の本文(形態の正式な定義と、どの完全性水準で IV&V を要するか)
- 規則 (EU) 402/2013 附属書II の本文(EUR-Lex は取得に失敗、curl はプロキシで 403)
- Sadowski ら 2018 の本文(75% の数値は二次の要約による)
