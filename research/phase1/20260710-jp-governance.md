# 日本企業のガバナンス・決裁ゲートの実態 調査メモ

- Issue: #29
- 作成日: 2026-07-10
- 状態: 清書済み → src/content/docs/phase1-current-state/jp-governance.md(公開: /process-compass/phase1-current-state/jp-governance/)

> 記述様式: [調査フレームワーク](https://takenori-kusaka.github.io/process-compass/phase1-current-state/research-framework/)を土台にしつつ、本メモは**特定の開発プロセスではなく、日本企業に固有の「組織論・意思決定・決裁ゲート・品質保証体制」を横断的に整理する**性格が強い。既存メモ([20260709-waterfall.md](./20260709-waterfall.md) §5/§7、[20260709-hybrid-antipatterns.md](./20260709-hybrid-antipatterns.md) §7)で断片的に触れた日本的観点を、ここで一つの体系として深掘り・裏取りする。
> すべての主張に出典 URL を付ける。一次情報(規格・官庁・学術)を最優先。「建前(規定・原典の定義)」と「実運用(日本の現場実態)」は必ず分けて書く。
> 清書時に図解しやすいよう、各要素は「稟議フロー / 決裁階層 / DR配置」など構造として整理する。

## 0. このメモの位置づけと全体像

- 目的: 開発プロセス(WF/スクラム/ハイブリッド)の上に必ず乗る「日本企業の組織インフラ」を、プロセスから独立した層として体系化する。プロセスのロール定義やゲート設計が、この組織インフラと衝突して形骸化する構造を明らかにする。
- 本メモが扱う日本的ガバナンスの要素(全体像):
  - **意思決定の様式**: 稟議制度(文書多段承認)+ 根回し(非公式合意形成)+ 合議
  - **権限の構造**: 決裁権限規程・職務権限規程(金額・重要度による職位階層のゲート)
  - **品質保証の構造**: デザインレビュー(DR)+ 独立した品質保証部門による第三者判定・出荷判定
  - **雇用・組織の土台**: メンバーシップ型雇用(ロールの曖昧さ・兼務・異動の源泉)
  - **コミュニケーションの土台**: ハイコンテキスト文化(暗黙知前提=明文化の困難さ)
- 生成AI時代への接続(本プロジェクトの中核論点): AIは「明文化された指示」と「明確な責任主体」を要求するが、上記の日本的要素はいずれも**暗黙性・責任分散・職位依存**を本質とし、AIへの明文化・自動化と構造的に衝突する(→ §9)。

## 1. 稟議制度(りんぎ)

### 1.1 定義と仕組み(建前)

- 定義: 上位者の決定が必要な事項・自己の権限を越える事項について、起案者が**稟議書**を作成し、回覧または持ち回りで関係者の決裁(押印)を順に得ていくボトムアップ型の意思決定方式([HRプロ 人事用語集「稟議制度」](https://www.hrpro.co.jp/glossary_detail.php?id=34)、[Jugaad 稟議制度の歴史と背景](https://jugaad.co.jp/workflow/ringi/history/))。
- 特徴(機能面): 会議を開かずに文書のみで関係者の決裁を効率よく集められ、関係部署への周知が徹底できる([HRプロ](https://www.hrpro.co.jp/glossary_detail.php?id=34))。
- フロー構造(図解用): 起案(担当者)→ 回覧/合議(関係部署)→ 多段承認(課長 → 部長 → 役員 …)→ 決裁(最終決裁者)→ 施行。金額・重要度が上がるほど承認段数が増える(→ §3 の決裁権限規程と連動)。

### 1.2 歴史的背景

- 起源: 明治期に官僚制が整備された際の官庁の意思決定プロセスが、企業へ移植されて確立した([Jugaad 稟議制度の歴史と背景](https://jugaad.co.jp/workflow/ringi/history/)、[HRプロ](https://www.hrpro.co.jp/glossary_detail.php?id=34))。
- 学術的な批判の系譜(「稟議制批判論」): 行政学者・辻清明『新版・日本官僚制の研究』(東京大学出版会, 1969)を起点に、稟議制は日本官僚制の非能率・責任所在の不明確さの象徴として論じられてきた([澤田道夫「稟議制批判論」(熊本県立大学, 2005)PDF](https://www.pu-kumamoto.ac.jp/users_site/sawada-m/articles/2005ringisystem-all.pdf))。
- ※上記PDFは本環境でテキスト抽出できず、書誌情報と論点の枠組みは検索結果と表題から確認(確度: 中)。原典精読は追加調査項目(§10)。

### 1.3 責任分散という機能(建前と実態の核心)

- 建前上の機能: 関係者全員の押印により「組織の総意」を可視化し、周知を徹底する。
- 実態(責任の分散/希薄化): 稟議制では、最終決裁権を持つ最高長官と、過程に参加する職員の双方が、決定結果に対する**自己の責任の自覚が乏しくなる**とされる([澤田「稟議制批判論」PDF](https://www.pu-kumamoto.ac.jp/users_site/sawada-m/articles/2005ringisystem-all.pdf) の要旨)。多数の押印は「皆で決めた=誰も単独では決めていない」という責任分散装置として機能する。
- 弊害: 何人もの承認を要するため時間がかかり、責任の所在が曖昧になるという官僚組織的弊害をもたらす([HRプロ](https://www.hrpro.co.jp/glossary_detail.php?id=34))。
- ハイブリッドメモとの接続: この「責任分散文化」が、スクラムの単一PO原則(1人の人間であり委員会ではない)を制度的に拒む機序として既に整理済み([20260709-hybrid-antipatterns.md](./20260709-hybrid-antipatterns.md) §7、[kickflow 合議とは](https://kickflow.com/blog/gougi))。

### 1.4 デジタル化(ワークフローシステム)の現状

- 背景: テレワーク普及で、押印・回覧を対面前提とする紙の稟議は「承認者が出社していないと回覧が止まる」ボトルネックが顕在化した([富士電機 ExchangeUSE 稟議コラム](https://www.exchangeuse.com/column/dx/ringi-02.html)、[Gluegent 稟議書電子化](https://www.gluegent.com/service/flow/knowledge/approval/))。
- 電子稟議(ワークフローシステム)の効果: 上長へボタン1つで届き、複数承認者へ同時送付できる。承認スピード向上・透明性向上・ペーパーレス・リモート対応が主なメリット([desknets NEO](https://www.desknets.com/neo/column/work-flow.html)、[ITトレンド](https://it-trend.jp/workflow/article/29-0023))。
- 実態(電子化しても構造は残る): 「ITだけでなく人の意識・制度を同時に変革しないと課題は解決しない」と指摘される。すなわち電子化は回覧を高速化するが、**多段承認の段数そのものや責任分散構造は温存**される([Gluegent](https://www.gluegent.com/service/flow/knowledge/approval/))。並列同時送付を許すシステムでも、規程上の順序決裁を維持する運用が一般的。
- 図解用の含意: 電子稟議=「紙のフローの電子写像」。フローの形は変わらず、律速要因(段数・職位依存)が残る点が、後述の「AIによる自動化の限界」に直結。

## 2. 根回し・合議(ネマワシ)

### 2.1 定義と機能

- 定義: 正式な決定(稟議・会議での決議)がなされる**前に**行われる非公式な準備・調整。利害関係者と個別に会話し、懸念を聞き、提案を事前に調整する行為([Jugaad 根回しは日本の悪しき文化か](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/)、[japaneserituals.com "Ringi"](https://japaneserituals.com/ringi/))。
- 稟議との関係: 稟議書が回覧される時点では、根回しによって**決定は既に実質的に形成されており、稟議は形式(セレモニー)にすぎない**ことが多い([japaneserituals.com](https://japaneserituals.com/ringi/))。
- 機能(建前=ポジティブ面): 利害の異なるメンバー間の衝突を避け、合意形成をスムーズにする。関係者の支持を事前に確保し、心理的ハードルを下げる([president.jp 根回しのすごい効果](https://president.jp/articles/-/105819)、[Jugaad](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/))。公開の場での不一致を防ぎ、「和」を保つ([japaneserituals.com](https://japaneserituals.com/ringi/))。

### 2.2 「意思決定は遅いが実行は速い」の両面性

- 遅い側面(決定まで): 合議・コンセンサス重視のため、賛成が集まるまで議論が続き、決定に時間を要する([日本的経営 Wikipedia](https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E7%9A%84%E7%B5%8C%E5%96%B6))。
- 速い側面(決定後): 根回しで関係者が事前に納得しているため、いったん合意されると反対や手戻りが少なく、**実行フェーズは速い/確実**とされる([japaneserituals.com](https://japaneserituals.com/ringi/)、[Jugaad](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/))。
- 注意(出典の性格): この「実行が速い」という評価は日本的経営を肯定する文脈で語られることが多く、実証データに基づく比較ではない。海外研究者の評価も「感心された」という言及にとどまり、具体的な研究者名・実証研究の引用は確認できていない([president.jp](https://president.jp/articles/-/105819))。→ 断定は避け「そう説明される」として扱う。

## 3. 決裁権限規程・職務権限規程

### 3.1 定義と構造(建前)

- 定義: 部長・課長といった**職位**に付与される職務上の権限(特に決裁できる金額の上限)を定めた社内規程。決裁権に関する社内ルールを「決裁権限規程」と呼ぶ([マネーフォワード 職務権限規程とは](https://biz.moneyforward.com/payroll/basic/60675/))。
- 構成: 職務範囲・権限の範囲・責任の範囲の3要素([マネーフォワード](https://biz.moneyforward.com/payroll/basic/60675/))。
- 法的位置づけ: 法律上の作成義務はなく任意。ただし内部統制の観点で整備される([マネーフォワード](https://biz.moneyforward.com/payroll/basic/60675/))。

### 3.2 金額・重要度による決裁階層(図解の中核)

- 典型例: 「部長は1,000万円まで、課長は500万円まで」のように、職位ごとに決裁できる金額上限を設定([マネーフォワード](https://biz.moneyforward.com/payroll/basic/60675/))。
- 具体的な階層設定例(交際費): 1万円未満=課長、1万円以上3万円未満=部長、3万円以上=担当取締役([マネーフォワード](https://biz.moneyforward.com/payroll/basic/60675/)、[ジャスネットキャリア 社内の決裁ルール](https://career.jusnet.co.jp/keiri_work/1/12.php))。
- 実物の規程例(一次情報): [トビムシ 職務権限規程(PDF)](https://tobimushi.co.jp/system/wp-content/uploads/2023/10/shokumukengen.pdf)、[京都大学 職務権限一覧表(PDF)](https://www.kyoto-u.ac.jp/sites/default/files/embed/jaaboutorganizationotherrevisiondocumentspastzai-1-4-20-2.pdf) が、役員・役職者の業務分掌と権限を職位×金額×案件種別のマトリクスで定義している。
- フロー含意(図解用): 案件の**金額/重要度が承認者の職位を決定する**。つまり「誰が承認するか」は案件の内容の専門性ではなく、金額のバンドと職位で機械的に決まる。これがゲート判定者を職位で決める根拠(→ §5 で Stage-Gate と対比)。

### 3.3 なぜゲートの承認者が「職位」で決まるか

- 決裁権限規程が金額バンドと職位を対応づけているため、開発工程のゲート(要件承認・リリース承認等)も、そこに紐づく**予算・契約の決裁**を通じて自動的に職位階層の承認対象になる。
- 結果: 技術的な妥当性を最もよく判断できる人(設計者・アーキテクト)と、承認権を持つ人(職位が上=金額決裁権を持つ人)が分離する。承認者は内容の専門家とは限らない。

## 4. デザインレビュー(DR)と品質保証部門

### 4.1 DR の規格上の定義(建前=JIS)

- **デザインレビュー**(JIS Z 8115:2019, 用語番号 192J-12-101): 「当該アイテムのライフサイクル全体にわたる既存又は新規に要求される設計活動に対する、**文書化された計画的な審査**」([JIS Z 8115:2019 ディペンダビリティ用語 / kikakurui.com](https://kikakurui.com/z8/Z8115-2019-01.html)、[JSA JIS Z 8115:2019](https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+Z+8115:2019))。
- **公式デザインレビュー**(同 192-12-07): 「当該アイテムについて規定された又は暗黙の要求事項を設計が満足できているか否かを評価する目的で、設計及びその要求事項に対して実施する、**文書化された独立した審査**」([kikakurui.com](https://kikakurui.com/z8/Z8115-2019-01.html))。
  - キーワード: 「文書化された」「計画的な」「独立した」審査。DRは属人的・非公式ではなく、計画され記録され、独立性をもって行われることが規格上の要件。
- 補足: JIS Z 8115 は IEC 60050-192 を基礎に、日本独自の用語(番号に "J" が付く=192J-…)を追加した規格。DRの詳細な"J"項はこの日本追加分にあたる([J-STAGE「JIS Z 8115 ディペンダビリティ用語の現状と将来」PDF](https://www.jstage.jst.go.jp/article/essfr/9/4/9_318/_pdf))。

### 4.2 品質保証部門による第三者レビュー・出荷判定(建前=独立性)

- 独立性の要件: 品質保証部門は顧客に対する責任を果たすため、社内各部門から独立している必要があり、**品質が改善されるまで出荷を止める権限**、各部門を監査する権限を持つ([アイアール技術者教育研究所 品質保証とは](https://engineer-education.com/quality-assurance1_basic/))。経営層へも監視・指摘する立場が求められる([SkillNote 品質保証と品質管理の違い](https://skillnote.jp/knowledge/hinshitsuhosho-hinshitsukanri-chigai/))。
- 出荷判定の仕組み: 出荷判定は、品質保証部門のような**第三者**が製造記録・品質試験記録を再度徹底調査し、疑義が全くない場合に出荷を承認する。「否」判定時は製造部長・品質保証部長へ速やかに連絡する運用([eCompliance 出荷判定のあり方](https://ecompliance.jp/batch_release/))。医薬品GQPでは市場出荷判定を品質保証部門(品質保証部長)が行うと制度化されている([京都府 GQP事例集(PDF)](https://www.pref.kyoto.jp/yakumu/kps_center/documents/h170317_2kmj.pdf))。
- ソフトウェアでの対応物: 大手SIer/メーカー系では、プロジェクトから独立したQA部門が「計画審査 → 工程終了審査 → 出荷判定」を運営する(既存 [20260709-waterfall.md](./20260709-waterfall.md) §5 の G0/G7、[JUSE ソフトウェア品質保証部長の会 資料](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf))。

### 4.3 実態(独立性の揺らぎ・署名権の組織差)

- 品質保証部門の社内での位置づけが低く、独立性・拒否権が形骸化するケースが指摘される([TBCソリューションズ「品質保証部門の社内の位置づけが低い」](https://tbcs.jp/column/2023/09/16/5-%E5%93%81%E8%B3%AA%E4%BF%9D%E8%A8%BC%E9%83%A8%E9%96%80%E3%81%AE%E7%A4%BE%E5%86%85%E3%81%AE%E4%BD%8D%E7%BD%AE%E3%81%A5%E3%81%91%E3%81%8C%E4%BD%8E%E3%81%84/))。
- 出荷判定における QA の「署名権(拒否権)」の強さは会社差が大きい(既存 waterfall.md §7 で追加調査項目とした点。医薬品GQPのような規制業種では法制化されているが、一般ソフトでは各社品質保証規程が非公開で制度的裏づけの横断確認は未了)。

### 4.4 DR配置の図解(製造業型 → ソフトウェア型)

- 製造業モデル: 設計フェーズ内に DR-0(構想)/ DR-1(基本設計)/ DR-2(詳細設計)… を計画的に配置し、各DRに品質保証部門が独立審査者として参加。最終段で出荷判定(品証部長の署名)。
- ソフトウェアへの写像: 工程末レビュー(=ゲート)にQA部門が第三者として関与し、出荷判定で拒否権を持つ構造(waterfall.md §5)。DRの「文書化・計画・独立」の3要件が、ソフトの「レビュー記録・レビュー計画・QA独立性」に対応。

## 5. Stage-Gate と日本の決裁の構造的違い(比較)

- **Stage-Gate(海外・原典)**: R.G.クーパー(1986, マクマスター大)提唱。開発を複数ステージに分け、各ゲートで Go / Kill / Hold / Recycle を判定([コンサルノート ステージゲートプロセス](https://www.consulnote.com/articles/project-mgmt/stage-gate-process/)、[ステージゲート法 Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%83%86%E3%83%BC%E3%82%B8%E3%82%B2%E3%83%BC%E3%83%88%E6%B3%95_(%E6%89%8B%E6%B3%95)))。
  - ゲートキーパー: 各ゲートの判定者は事前に決めるが、**「資源配分の権限を持つ人物(リソース所有者)」が適任**とされる([コンサルノート](https://www.consulnote.com/articles/project-mgmt/stage-gate-process/))。判定の主眼は「この先へリソースを投じ続けるか(投資判断)」。
- **日本の決裁ゲート**: 判定者は決裁権限規程により**案件の金額バンドに対応する職位**で決まる(§3)。判定の主眼は「規程上の権限者による承認・責任の分散(稟議)」。
- 構造的な違い(考察に近いが対比として明記):
  - Stage-Gate: 判定者 = リソース(予算・人)を所有し、投資継続可否を裁量で決める人 → **判定基準は「投資対効果」、判定は Kill を含む**。
  - 日本の決裁: 判定者 = 職位階層の権限者 → **判定基準は「規程適合・合意の有無」、Kill(中止)は稟議では選ばれにくく、条件付き承認/差し戻しに流れる**。
  - すなわち、両者とも「ゲートで職位が高い人が承認する」外形は似るが、Stage-Gate は投資ポートフォリオ管理(選択と集中=Kill前提)、日本の決裁は合意形成と責任分散(継続前提)であり、機能が異なる。既存 waterfall.md §8 の「日本のゲートは品質判定と契約判定の二重性」とも整合。

## 6. メンバーシップ型雇用と組織

### 6.1 定義(建前)

- 提唱: 濱口桂一郎(労働政策研究・研修機構)による対概念。**ジョブ型=ジョブ(職務)に値札を貼る/メンバーシップ型=ヒト(人)に値札を貼る**([濱口桂一郎 リクルートワークス研究所コラム](https://www.works-i.com/column/policy/detail017.html)、[日本労働研究雑誌 特集PDF](https://www.jil.go.jp/institute/zassi/backnumber/2022/special/pdf/010-017.pdf))。
- メンバーシップ型の特徴: 職務内容を事前に明確化せず、企業が配置転換を命じて別業務を割り当てられる。異動・勤務地変更が本人同意なしに可能([JMAM ジョブ型雇用とは](https://www.jmam.co.jp/hrm/column/0015-jobgata.html))。
- ジョブ型との対比: ジョブ型は仕事に人を付けるため、他業務への異動・勤務地変更には労働者の同意が必要([JMAM](https://www.jmam.co.jp/hrm/column/0015-jobgata.html))。

### 6.2 プロセスのロール定義との衝突(実態)

- ロールの曖昧さ: メンバーシップ型は職務記述(ジョブディスクリプション)を持たないため、「誰が何に責任を持つか」が契約上は未定義。プロセスが要求する明確なロール(PO/SM/開発リーダー等)と、雇用の実態(職務無限定)が食い違う。
- 兼務の常態化: 職務が限定されないため、1人が複数ロールを兼ねる(PM/PL兼務、SEの設計・製造管理兼務など。waterfall.md §3)。スクラムの単一責任(PO=1人)や専任性と衝突。
- 異動によるロール断絶: 定期人事異動で担当が入れ替わり、ロールの継続性・専門性の蓄積が阻害される。プロセスが前提とする「一貫した責任主体」が保持されにくい。
- ※「メンバーシップ型がロール曖昧・兼務・異動を生む」という因果は、上記一次概念(濱口)と現場実態(waterfall.md §3)からの本メモの統合的解釈であり、単一文献の直接主張ではない(→ 考察扱い、§9)。

## 7. ハイコンテキスト文化(明文化を阻む土台)

### 7.1 定義

- 提唱: 文化人類学者エドワード・T・ホールが1970年代に提示。コミュニケーションを「コンテキスト(文脈)への依存度」で分類([高・低文脈文化 Wikipedia](https://ja.wikipedia.org/wiki/%E9%AB%98%E3%83%BB%E4%BD%8E%E6%96%87%E8%84%88%E6%96%87%E5%8C%96)、[翻訳センター ブログ](https://www.honyakuctr.com/blog/001566.html))。
- 日本の位置づけ: 日本は中国・韓国等と並ぶハイコンテキスト文化の典型。「言わなくてもわかる」「空気を読む」暗黙の了解が成立しやすい([翻訳センター](https://www.honyakuctr.com/blog/001566.html)、[土木学会 小林潔司「ハイコンテクスト社会としての日本」PDF](https://committees.jsce.or.jp/transmit_project/system/files/basic_knowledge_02.pdf))。
- 具体的な現れ: 以心伝心・阿吽の呼吸・忖度・暗黙の了解([翻訳センター](https://www.honyakuctr.com/blog/001566.html))。

### 7.2 明文化されない知識(暗黙知)への依存

- ハイコンテキスト文化では、情報が文脈・暗黙の了解に依存して伝えられ、言葉にしない部分(非言語手がかり・前提知識)が重要な役割を果たす([翻訳センター](https://www.honyakuctr.com/blog/001566.html))。
- 業務への含意: 要件・設計判断・レビュー基準・承認の勘所が「言わずともわかる」前提で暗黙化され、ドキュメントに書き下されない。これがプロセスの成果物(要件定義書・設計書)の実質を空洞化させる遠因になりうる。

### 7.3 生成AIへの明文化を阻む(本プロジェクトの中核論点への接続)

- 生成AIは「明文化された指示・文脈」を入力として要求する。ハイコンテキスト文化の暗黙知(空気・忖度・以心伝心)は、AIには渡せない=**そもそもプロンプト化・仕様化できない情報**である。
- したがって日本企業でAIを開発プロセスに組み込むには、従来「書かずに済ませてきた暗黙の前提」を明文化する追加コストが発生する。これは本プロジェクトが提案すべき介入点(暗黙知の形式知化)そのもの。→ §9 に集約。

## 8. 意思決定の遅さ — 定量・国際比較

- 定性的説明: 日本企業の意思決定が遅い理由として、(1)全体最適・リスク回避志向、(2)コンセンサス重視で賛成が集まるまで議論が続く、(3)権限移譲が進まず逐一上司の承認を要する、(4)減点主義で決断を避ける、が挙げられる([ITmedia「なぜ日本企業の意思決定は遅いのか」](https://www.itmedia.co.jp/business/articles/2103/23/news043.html))。
- 階層の深さ: 「階層が深くスピードが落ちる」ことが遅さの一因(既存 hybrid-antipatterns.md §7、[ITmedia](https://www.itmedia.co.jp/business/articles/2103/23/news043.html))。
- 定量・国際比較データ: 「経産省調査で日本企業の意思決定時間は海外より長い」との二次言及はあるが、本調査では**該当する経産省一次調査の原典(調査名・報告書)を特定できず**(→ §10 追加調査)。信頼できる定量的国際比較(例: 意思決定所要日数の国別比較)は未取得。現時点では「遅いと広く言われる」定性的言説の域を出ない点に注意。

## 9. 考察(事実と分離 / 生成AI導入時の衝突点)

- **日本的ガバナンスの共通DNA=「責任の非集中」**: 稟議(多段押印)・合議・根回し・職位階層決裁・QA第三者判定は、いずれも「単一個人に決定権と結果責任を集中させない」方向に働く。メンバーシップ型雇用(職務無限定)とハイコンテキスト(暗黙の共同了解)がこれを下支えする。この共通項が、海外発プロセスの「単一責任(PO/プロダクトオーナー)」「明示的ロール」「投資判断としてのKillゲート」と系統的に衝突する。
- **生成AI導入時の衝突点(本プロジェクトの主張候補)**:
  1. **明文化の壁(ハイコンテキスト)**: AIは暗黙知を読めない。空気・忖度・以心伝心で運んでいた要件・基準を、AI利用のためには形式知化する必要がある。→ 介入: 暗黙知の外部化(プロンプト/仕様/DoDへの落とし込み)を支援する。
  2. **責任主体の欠落(稟議・合議)**: AIの生成物を「誰が承認し責任を負うか」が、責任分散文化では宙に浮く。稟議は責任を分散する装置なので、AI生成物の説明責任(誰がレビューし署名するか)と噛み合わない。→ 介入: AI成果物のレビュー・承認責任を単一主体に割り当てる設計。
  3. **職位ゲートと専門性の乖離**: 決裁者は金額×職位で決まり、AI/技術の妥当性を判断できるとは限らない。AI導入判断・AI生成コードのリスク判断が、内容を理解しない決裁階層で滞留する。→ 介入: 技術判断ゲートと予算決裁ゲートの分離。
  4. **ロールの曖昧さ・兼務(メンバーシップ型)**: プロセス上のAI活用ロール(プロンプトエンジニア、AIレビュー担当等)を定義しても、職務無限定・異動で継続しない。→ 介入: 兼務・異動を前提にした軽量なロール設計。
  5. **ゲートの形骸化リスクの再生産**: 稟議・DRが通過儀式化する構造(waterfall.md §7)は、AIで生成速度が上がるほど「承認がボトルネック」として顕在化する(hybrid-antipatterns.md AP-6)。AIの速さが日本型ガバナンスの遅さを逆に際立たせる。
- **図解方針(清書時)**: (a)稟議フロー図(起案→根回し(点線)→多段押印→決裁)、(b)決裁階層ピラミッド(金額バンド×職位)、(c)DR配置図(設計フェーズ内のDR群+QA独立審査+出荷判定署名)、(d)海外Stage-Gate vs 日本決裁の対比表、の4点セットが解説記事の骨格になる。
- **「建前と実運用の乖離」の総括**: 稟議=効率的周知(建前)/責任分散・遅延(実態)、DR=独立審査(建前)/位置づけ低下で形骸化(実態)、根回し=衝突回避(建前)/決定の不透明化(実態)。乖離は制度そのものというより「制度が果たす裏の機能(責任回避・和の維持)」に起因する、という読み筋が一貫して立つ。

## 10. 埋められなかった観点(追加調査項目)

- 稟議制の学術原典の精読: 辻清明『新版・日本官僚制の研究』(1969)、澤田「稟議制批判論」PDF は本環境でテキスト抽出不可。責任分散論・稟議制擁護論(大森彌ら)との論争構造の一次確認が未了。
- 意思決定速度の定量的国際比較: 「経産省調査で長い」の一次出典(調査名・年・報告書URL)が未特定。信頼できる国別定量データ(意思決定所要日数など)の探索が必要。
- QA部門の「出荷判定署名権(拒否権)」の制度的裏づけ横断確認: 医薬品GQP(規制業種)では法制化を確認したが、一般ソフト/製造業の各社品質保証規程は非公開で横断像が描けていない(waterfall.md §7 と共通の宿題)。
- 根回しの実証研究: 「実行が速い」「海外が評価」の実証根拠。researchgate の「根回しによるイノベーション促進モデル」等の学術論文の精読が未了。
- メンバーシップ型→ロール曖昧の因果: 本メモは統合的解釈で接続したが、雇用形態とプロジェクトのロール定義破綻を直接結ぶ実証・事例研究は未取得。
- 政府調達の決裁ゲート一次資料: [デジタル・ガバメント推進標準ガイドライン](https://www.digital.go.jp/resources/standard_guidelines)等の工程レビュー・決裁規定の精読(waterfall.md §9 と共通)。
- JIS Z 8115 の DR 関連 "J" 項の全量: 本メモは 192J-12-101 と 192-12-07 を確認。他のDR関連用語(DRの種類・段階)の網羅は未了(規格本体は有償)。

## 11. 出典一覧

### 一次情報(規格・官庁・学術)

- [JIS Z 8115:2019 ディペンダビリティ(総合信頼性)用語 / kikakurui.com 全文](https://kikakurui.com/z8/Z8115-2019-01.html) — デザインレビュー(192J-12-101)、公式デザインレビュー(192-12-07)の定義
- [JSA JIS Z 8115:2019 書誌](https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+Z+8115:2019)
- [J-STAGE「JIS Z 8115 ディペンダビリティ用語の現状と将来」PDF](https://www.jstage.jst.go.jp/article/essfr/9/4/9_318/_pdf)
- 澤田道夫[「稟議制批判論」(熊本県立大学, 2005)PDF](https://www.pu-kumamoto.ac.jp/users_site/sawada-m/articles/2005ringisystem-all.pdf)(辻清明『新版・日本官僚制の研究』1969 を含む)※本環境でテキスト抽出不可、書誌情報のみ確認
- 濱口桂一郎[『メンバーシップ型・ジョブ型の「次」の模索』リクルートワークス研究所](https://www.works-i.com/column/policy/detail017.html)
- [日本労働研究雑誌「分析概念としてのジョブ型/メンバーシップ型雇用」PDF](https://www.jil.go.jp/institute/zassi/backnumber/2022/special/pdf/010-017.pdf)
- [高・低文脈文化 Wikipedia(エドワード・T・ホール)](https://ja.wikipedia.org/wiki/%E9%AB%98%E3%83%BB%E4%BD%8E%E6%96%87%E8%84%88%E6%96%87%E5%8C%96)
- 小林潔司[「ハイコンテクスト社会としての日本」(土木学会)PDF](https://committees.jsce.or.jp/transmit_project/system/files/basic_knowledge_02.pdf)
- [京都府 GQP事例集(品質保証部門の出荷判定)PDF](https://www.pref.kyoto.jp/yakumu/kps_center/documents/h170317_2kmj.pdf)
- [トビムシ 職務権限規程 実物PDF](https://tobimushi.co.jp/system/wp-content/uploads/2023/10/shokumukengen.pdf) / [京都大学 職務権限一覧表PDF](https://www.kyoto-u.ac.jp/sites/default/files/embed/jaaboutorganizationotherrevisiondocumentspastzai-1-4-20-2.pdf)
- [JUSE ソフトウェア品質保証部長の会 成果資料PDF](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf)(既存 waterfall.md より継承)
- [ステージゲート法 Wikipedia(クーパー1986)](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%83%86%E3%83%BC%E3%82%B8%E3%82%B2%E3%83%BC%E3%83%88%E6%B3%95_(%E6%89%8B%E6%B3%95))
- [日本的経営 Wikipedia](https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E7%9A%84%E7%B5%8C%E5%96%B6)

### 二次情報(実務・解説)

- [HRプロ 人事用語集「稟議制度」](https://www.hrpro.co.jp/glossary_detail.php?id=34)
- [Jugaad 稟議制度の歴史と背景](https://jugaad.co.jp/workflow/ringi/history/) / [根回しは日本の悪しき文化か](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/)
- [japaneserituals.com "Ringi: Japan's Consensus Decision-Making"](https://japaneserituals.com/ringi/)
- [president.jp 根回しのすごい効果](https://president.jp/articles/-/105819)
- [富士電機 ExchangeUSE 稟議電子化の落とし穴](https://www.exchangeuse.com/column/dx/ringi-02.html) / [Gluegent 稟議書電子化](https://www.gluegent.com/service/flow/knowledge/approval/) / [desknets NEO ワークフロー](https://www.desknets.com/neo/column/work-flow.html) / [ITトレンド 稟議書電子化](https://it-trend.jp/workflow/article/29-0023)
- [マネーフォワード 職務権限規程とは](https://biz.moneyforward.com/payroll/basic/60675/) / [ジャスネットキャリア 社内の決裁ルール](https://career.jusnet.co.jp/keiri_work/1/12.php)
- [アイアール技術者教育研究所 品質保証とは](https://engineer-education.com/quality-assurance1_basic/) / [SkillNote 品質保証と品質管理の違い](https://skillnote.jp/knowledge/hinshitsuhosho-hinshitsukanri-chigai/) / [eCompliance 出荷判定のあり方](https://ecompliance.jp/batch_release/) / [TBCソリューションズ 品質保証部門の位置づけ](https://tbcs.jp/column/2023/09/16/5-%E5%93%81%E8%B3%AA%E4%BF%9D%E8%A8%BC%E9%83%A8%E9%96%80%E3%81%AE%E7%A4%BE%E5%86%85%E3%81%AE%E4%BD%8D%E7%BD%AE%E3%81%A5%E3%81%91%E3%81%8C%E4%BD%8E%E3%81%84/)
- [コンサルノート ステージゲートプロセス](https://www.consulnote.com/articles/project-mgmt/stage-gate-process/)
- [JMAM ジョブ型雇用とは](https://www.jmam.co.jp/hrm/column/0015-jobgata.html)
- [翻訳センター ハイコンテクスト文化とは](https://www.honyakuctr.com/blog/001566.html)
- [ITmedia なぜ日本企業の意思決定は遅いのか](https://www.itmedia.co.jp/business/articles/2103/23/news043.html)
- [kickflow 合議とは](https://kickflow.com/blog/gougi)(既存 hybrid-antipatterns.md より継承)
