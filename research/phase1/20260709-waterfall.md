# ウォーターフォール開発プロセス 調査メモ

- Issue: #21
- 作成日: 2026-07-09
- 状態: 清書済み → src/data/processes/waterfall.yaml(公開: /process-compass/processes/waterfall/)

> 記述様式: [調査フレームワーク](https://takenori-kusaka.github.io/process-compass/phase1-current-state/research-framework/)(6+2要素)に従う。
> すべての主張に出典 URL を付ける。一次情報(原典・公式ガイド・規格)を最優先。
> 「建前(規定・原典の定義)」と「実運用(日本の現場実態)」は必ず分けて書く。

## 0. プロセスの概要

- 提唱者・原典・成立年:
  - 通説上の原典は Winston W. Royce「[Managing the Development of Large Software Systems](https://www.praxisframework.org/files/royce1970.pdf)」(Proceedings, IEEE WESCON, 1970)
  - ただし Royce 自身は論文中で「waterfall」という語を一度も使っていない。「waterfall」の語の初出は Bell & Thayer(1976)とされる([英語版 Wikipedia "Waterfall model"](https://en.wikipedia.org/wiki/Waterfall_model))
  - さらに先行事例として Benington(1956)の SAGE 開発におけるフェーズ型アプローチがある。Benington は 1983 年の再録時に「実際は厳密なトップダウンではなくプロトタイプに依存していた」と注記している(同上)
  - 米国防総省が DOD-STD-2167(1985)で逐次型 6 フェーズ(Software Requirement Analysis → Preliminary Design → Detailed Design → Coding and Unit Testing → Integration → Testing)を制度化し、業界標準として固定化。後継の MIL-STD-498(1994)では一転して evolutionary acquisition と反復・漸進開発を推奨した(同上、[dwheeler.com "The Waterfall Model"](https://dwheeler.com/essays/waterfall.html))
- 一言でいうと: 要件定義から運用まで工程を一方向に直列に並べ、各工程末の完了判定(レビュー・審査)を通過してから次工程へ進む開発プロセスモデル
- ISO/IEC/IEEE 12207:2017 の4プロセス群のうち厚くカバーする領域: テクニカルプロセス(要件定義〜検証・妥当性確認)。日本では共通フレーム(SLCP-JCF)がこの規格系列(ISO/IEC 12207 / JIS X 0160)を基に「取得者と供給者の共通の物差し」として整備され、事実上ウォーターフォール型の多段階受発注の語彙基盤になっている([IPA 共通フレーム2013](https://www.ipa.go.jp/publish/secbooks20130304.html)、[木暮仁 Web教材「共通フレーム」](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html))

### 原典(Royce 1970)の実際の主張 — 「ウォーターフォールを提唱した」は俗説

- 事実関係(一次情報・原文引用に基づく):
  - Royce は System Requirements → Software Requirements → Analysis → Program Design → Coding → Testing → Operations の逐次フェーズ図を提示した([原論文 PDF](https://www.praxisframework.org/files/royce1970.pdf)、[英語版 Wikipedia](https://en.wikipedia.org/wiki/Waterfall_model))
  - その直後に **"I believe in this concept, but the implementation described above is risky and invites failure."**(この概念自体は信じるが、上記のままの実装はリスキーで失敗を招く)と明言している([pragtob による原文読解記事](https://pragtob.wordpress.com/2012/03/02/why-waterfall-was-a-big-misunderstanding-from-the-beginning-reading-the-original-paper/)、[dwheeler.com](https://dwheeler.com/essays/waterfall.html))
  - 理由: テストが開発サイクルの最後に来るため、タイミング・ストレージ・入出力などが「分析ではなく経験として」初めて判明し、大規模な手戻りが設計まで波及するから(同上)
  - Royce が単純逐次モデルの欠陥を補うために提案した 5 つのステップ([pragtob 記事](https://pragtob.wordpress.com/2012/03/02/why-waterfall-was-a-big-misunderstanding-from-the-beginning-reading-the-original-paper/)):
    1. Program design comes first(分析より前に予備的プログラム設計を入れる)
    2. Document the design(設計を徹底的に文書化する)
    3. Do it twice(本番の前にミニチュア版を一度作る。"it is simply the entire process done in miniature" — パイロット版による反復)
    4. Plan, control and monitor testing(テストを計画・統制・監視する)
    5. Involve the customer(顧客関与は "formal, in-depth, and continuing" であるべき。"To give the contractor free rein between requirement definition and operation is inviting trouble.")
  - すなわち原典は「一方向・一発勝負の逐次開発」をむしろ警告し、反復(Do it twice)・フィードバック・継続的顧客関与を推奨していた。図だけが独り歩きし、本文の警告が無視されて標準・組織に組み込まれた([dwheeler.com](https://dwheeler.com/essays/waterfall.html)、[Annotated Library の注釈](https://inigomedina.co/library/work/royce-managing-development-of-large-software-systems))
- 注記: 原論文 PDF は取得済みだが本環境で全文の直接読解ができず、引用文は原文を引用する複数の二次資料で照合した(確度: 高。複数独立ソースで一致)

## 1. title / purpose / outcomes

| 要素 | 記述 | 出典 |
| --- | --- | --- |
| title | ウォーターフォール開発プロセス(日本の SIer 標準形) | — |
| purpose | 大規模・多人数・受発注構造の開発において、工程と成果物を直列に固定し、各工程末の完了判定で品質と契約責任を確定させながら、計画どおりに(QCD を管理して)システムを完成させる | [IPA モデル取引・契約書](https://www.ipa.go.jp/digital/model/index.html)、[木暮仁 Web教材](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html) |
| outcomes(観察可能な結果) | (1) 各工程の承認済み成果物一式(要件定義書〜テスト成績書)が揃う (2) 工程ごとの完了判定・検収記録が残る (3) 検収合格により契約上の債務履行が確定する (4) 保守へ引き継ぎ可能な文書群が残る | [IPA モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html)、[オプティマル・システムデザイン・ワークス 工程解説](https://optimal-sdw.com/blog/code-projectmanagement/article_99) |

## 2. 階層構造(process → activities → tasks)

- 前提: 共通フレーム(SLCP-JCF)は「プロセス(役割の観点で相関の強いアクティビティの束)→アクティビティ(作業目的ごとの束)→タスク(個々の作業)」の3階層で作業を定義しており、本節はこの階層に合わせて記述する([木暮仁 Web教材](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html))
- 慣行的工程名と共通フレームの対応(同上):
  - 要件定義+基本設計(外部設計) ≒ 要件定義プロセス+システム方式設計
  - 詳細設計(内部設計) ≒ ソフトウェア方式設計+ソフトウェア詳細設計
  - 製造 ≒ ソフトウェア構築(コード作成・単体テスト)
  - テスト ≒ ソフトウェア結合〜システム適格性確認テスト
- **フェーズ数: 8**(下記 P1〜P8)。V字モデルでは左辺(P1〜P4)と右辺(P5〜P8)が検証関係で対応する([サイゼント技術ブログ](https://cyzennt.co.jp/blog/2019/10/26/%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A9%E3%83%BC%E3%83%AB%E3%83%A2%E3%83%87%E3%83%AB%E3%81%A8%EF%BD%96%E5%AD%97%E3%83%A2%E3%83%87%E3%83%AB/)、[AGEST V字モデル解説](https://agest.co.jp/column/2025-05-15/))

- 全体プロセス: ウォーターフォール開発(受注後。企画・提案・見積り・契約は前段として存在)
  - **P1. 要件定義**(V字対応: 受入テスト/運用テスト)
    - アクティビティ: 現行業務・現行システムの調査
      - タスク: 現行業務フローの確認、課題整理([オプティマル 工程解説](https://optimal-sdw.com/blog/code-projectmanagement/article_99))
    - アクティビティ: 利害関係者要件の定義(共通フレームのタスク: 利害関係者の識別 → 要件の識別 → 要件の評価 → 要件の合意)([IPA 共通フレーム2013 第3部](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf)、[木暮仁](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html))
      - タスク: 新業務フロー定義、機能要件一覧化、非機能要件(性能・可用性・セキュリティ)定義、スコープ・予算・期間の合意
    - アクティビティ: 要件定義書の作成とレビュー・顧客承認
  - **P2. 基本設計(外部設計)**(V字対応: 総合テスト)
    - アクティビティ: システム方式設計(システム要件のハード/ソフト/手作業への割り振り)([木暮仁](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html))
    - アクティビティ: 外部仕様の設計
      - タスク: 画面レイアウト・画面遷移設計、帳票設計、外部インタフェース設計、データベース論理設計([オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99)、[Sky株式会社 開発工程解説](https://www.skygroup.jp/software/article/04/))
    - アクティビティ: 基本設計書の作成、顧客との認識合わせ(レビュー・承認)
  - **P3. 詳細設計(内部設計)**(V字対応: 結合テスト ※資料により単体テスト対応とする流儀もある)
    - アクティビティ: ソフトウェア方式設計・ソフトウェア詳細設計
      - タスク(共通フレームのソフトウェア詳細設計): (a)コンポーネント詳細設計 (b)インタフェース詳細設計 (c)データベース詳細設計 (d)利用者文書の詳細化 (e)結合テスト要求事項の定義 (f)文書化 (g)レビュー実施([共通フレーム2013 第3部](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf)、[五味弘 note 解説](https://note.com/hiroshi_gomi/n/nb72333804e2f))
      - タスク: モジュール分割、処理ロジック記述(コーディング可能な粒度)、物理 DB 設計([Sky](https://www.skygroup.jp/software/article/04/)、[オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99))
    - アクティビティ: 詳細設計書の作成と内部レビュー(基本設計書との整合確認)
  - **P4. 製造(コーディング)**
    - アクティビティ: コーディング
      - タスク: コーディング規約に基づく実装、コードレビュー、静的解析
    - アクティビティ: 単体テスト仕様書の作成(詳細設計を基に)
  - **P5. 単体テスト(UT)**(V字対応: 詳細設計または製造)
    - アクティビティ: モジュール単位のテスト実施
      - タスク: テスト実施、バグ票起票・修正、テスト密度/バグ密度の集計
  - **P6. 結合テスト(IT)**(V字対応: 詳細設計〜基本設計)
    - アクティビティ: モジュール間・サブシステム間結合テスト
      - タスク: 内部結合/外部結合テスト仕様書作成、実施、欠陥管理([オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99))
  - **P7. 総合テスト(システムテスト/ST)**(V字対応: 基本設計〜要件定義)
    - アクティビティ: システム全体の適格性確認
      - タスク: 性能・負荷・障害・運用シナリオテスト、システムテスト仕様書に基づく実施
    - アクティビティ: 出荷判定(ベンダ内)
  - **P8. 受入・リリース(運用テスト/UAT・検収)**(V字対応: 要件定義)
    - アクティビティ: ユーザによる受入テスト(運用テスト)
      - タスク: 検査仕様書に基づく検査、変更要望の扱い決定([IPA モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html))
    - アクティビティ: 検収・リリース判定・本番移行
      - タスク: 検収書発行、移行手順書に基づく移行、教育([オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99))

## 3. roles(ロール)

| ロール | 責任 | 兼務の実態(日本の現場) | 出典 |
| --- | --- | --- | --- |
| PM(プロジェクトマネージャ) | プロジェクト執行責任者。顧客折衝・納期取り決め・トラブル対応指揮・工程管理 | 中小規模では PL を兼務。元請け側に置かれる | [キーシステム 役割解説](https://key-sys.com/role-of-each-member/)、[システム幹事](https://system-kanji.com/posts/system-development-role) |
| PL(プロジェクトリーダー) | 現場責任者。設計・製造の進捗管理 | 小規模では置かれない。大規模でメンバーが増えると PM の下に複数配置 | [キーシステム](https://key-sys.com/role-of-each-member/) |
| SE(システムエンジニア) | 要件定義・設計など上流工程を担当し、機能・性能を決定 | 上流専任は元請けに集中。設計と製造管理を兼ねることが多い | [Qbook 役割一覧](https://www.qbook.jp/column/2086.html) |
| PG(プログラマー) | SE の設計に沿った実装(下流工程) | 多重下請け構造では二次請け以下に発注されがち | [Qbook](https://www.qbook.jp/column/2086.html)、[システム幹事](https://system-kanji.com/posts/system-development-role) |
| 品質保証部門(QA/品証) | プロセス品質(工程実行状況)とプロダクト品質(中間成果物)の両面を評価し、品質ゲート(計画審査・工程終了審査・出荷判定)を運営 | プロジェクト外の第三者組織として大手 SIer・メーカー系に存在。判定権限の強さは会社により差 | [フォスターフリーランス 品質保証解説](https://freelance.fosternet.jp/workstyle/software-quality03/)、[JUSE ソフトウェア品質保証部長の会 資料](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf) |
| 顧客側レビュアー(ユーザ企業情報システム部門・業務部門) | 要件定義・基本設計の承認、受入テスト・検収の実施。連絡協議会での意思決定 | 業務部門が多忙でレビューが形式化しやすい(考察参照) | [IPA モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html) |
| (原典比較)Royce の想定 | 顧客は「formal, in-depth, and continuing」に関与し、3つのレビュー時点で判断する | 日本では工程末の承認会議に集約されがち | [pragtob 原文読解](https://pragtob.wordpress.com/2012/03/02/why-waterfall-was-a-big-misunderstanding-from-the-beginning-reading-the-original-paper/) |

## 4. information items(成果物・文書)

| 成果物 | 作成者(ロール) | 用途・後続への引き渡し先 | 出典 |
| --- | --- | --- | --- |
| 要件定義書 | SE(+顧客合意) | 基本設計のインプット。受入テスト(UAT)の検証基準。準委任契約の成果物 | [オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99)、[IPA モデル取引・契約書](https://www.ipa.go.jp/digital/model/model20201222.html) |
| 基本設計書(外部設計書: 画面・帳票・IF・DB論理) | SE | 詳細設計のインプット。総合テストの検証基準。顧客承認対象 | [Sky](https://www.skygroup.jp/software/article/04/)、[オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99) |
| 詳細設計書(内部設計書: モジュール仕様・物理DB) | SE/PL | 製造のインプット。結合テストの検証基準 | 同上 |
| ソースコード・実行モジュール | PG | 単体テスト以降のテスト対象 | [Qbook](https://www.qbook.jp/column/2086.html) |
| テスト仕様書(単体/結合/システム各層) | SE/PG | 各テスト工程の実施基準。V字の対応工程の設計書から導出 | [オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99)、[AGEST](https://agest.co.jp/column/2025-05-15/) |
| テスト成績書・品質報告(テスト密度・バグ密度等) | PL/QA | 工程終了審査・出荷判定のエビデンス | [フォスターフリーランス](https://freelance.fosternet.jp/workstyle/software-quality03/) |
| 検査仕様書・検収書 | 顧客(ユーザ) | 検収(みなし検収条項あり)の判定基準・記録 | [IPA モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html) |
| 操作マニュアル・移行手順書 | SE | 受入・教育・本番移行、保守への引き継ぎ | [オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99)、[Sky](https://www.skygroup.jp/software/article/04/) |

## 5. gates(ゲート・決裁)

**ゲート数: 9**(計画審査 1 + 工程完了判定 6 + 出荷判定 1 + 検収 1)。各工程末レビューがゲートを兼ねるのが日本の標準形。品質保証の枠組みとしては「計画審査 → 工程終了審査(各工程末) → 出荷判定」の3類型に整理される([JUSE 品質保証部長の会 資料](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf)、[インソース研修「ウォーターフォールモデル開発の品質保証〜計画審査、工程終了審査、出荷判定〜」](https://www.insource.co.jp/nmp/HH145.html)、[フォスターフリーランス](https://freelance.fosternet.jp/workstyle/software-quality03/))。

| ゲート名 | Deliverables | Criteria(判定基準) | 判定者 | 判定結果の種類 | 出典 |
| --- | --- | --- | --- | --- | --- |
| G0. 計画審査 | プロジェクト計画書、品質計画 | 計画の実現性、体制・リスクの妥当性 | QA部門+事業部門長 | 承認/条件付き承認/差し戻し | [JUSE 資料](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf)、[インソース](https://www.insource.co.jp/nmp/HH145.html) |
| G1. 要件定義完了判定 | 要件定義書 | 要件の合意(利害関係者の識別・評価・合意タスクの完了)、スコープ確定 | 顧客+PM(連絡協議会) | 承認(次工程契約へ)/差し戻し | [共通フレーム2013 第3部](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf)、[IPA モデル契約](https://www.ipa.go.jp/digital/model/model20201222.html) |
| G2. 基本設計完了判定 | 基本設計書 | 要件定義書との整合、外部仕様の顧客合意 | 顧客+PM | 承認/差し戻し | [オプティマル](https://optimal-sdw.com/blog/code-projectmanagement/article_99) |
| G3. 詳細設計完了判定 | 詳細設計書 | 基本設計書との無矛盾、コーディング可能な粒度、レビュー完了 | PL/PM(+QA)。ベンダ内 | 承認/差し戻し | [Sky](https://www.skygroup.jp/software/article/04/)、[共通フレーム2013 第3部](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf) |
| G4. 製造・単体テスト完了判定 | ソース、単体テスト成績 | コードレビュー・静的解析の実施、予定テストの完了、バグ密度が基準内 | PL(+QA) | 承認/差し戻し | [フォスターフリーランス](https://freelance.fosternet.jp/workstyle/software-quality03/) |
| G5. 結合テスト完了判定 | 結合テスト成績書 | テスト消化率・残バグ件数が基準内 | PM(+QA) | 承認/差し戻し | 同上 |
| G6. 総合テスト完了判定 | システムテスト成績書、品質報告 | 非機能要件の充足、残存リスクの評価 | PM+QA | 承認/差し戻し | 同上 |
| G7. 出荷判定 | 全成果物+品質エビデンス | プロセス品質・プロダクト品質の総合評価 | QA部門長(第三者判定) | 出荷可/不可 | [JUSE 資料](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf)、[フォスターフリーランス](https://freelance.fosternet.jp/workstyle/software-quality03/) |
| G8. 検収(受入判定) | 検査仕様書に基づく検査結果、検収書 | 契約・仕様との適合(民法改正後は契約不適合責任の起点)。期間内に通知なき場合はみなし検収 | 顧客 | 合格(債務履行確定)/不合格(修補請求等) | [IPA モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html) |

- 補足(原典比較): Royce が「Involve the customer」で挙げた顧客関与レビューは Preliminary Software Review(プログラム設計後)・Critical Software Review(コーディング前後)・Final Software Acceptance Review(テスト後)の 3 時点であり、日本の G1/G2(上流の顧客承認)と G8(受入)に相当する構造が原典にも存在する([原論文 PDF](https://www.praxisframework.org/files/royce1970.pdf)。※レビュー名の詳細は本環境で原文照合が完了しておらず確度は中)

## 6. レビュープロセス

- 建前(規格上の位置づけ): 共通フレームでは「検証(仕様への適合の技術的確認)」「妥当性確認(利用者視点での正しさの確認)」「共同レビュー(取得者・供給者が共通理解を維持するためのレビュー)」が支援プロセスとして独立に定義され、各テクニカルプロセスのアクティビティから参照される([木暮仁](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html)、[共通フレーム2013 第3部](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf))
- 実運用(日本の標準形):
  - 工程内レビュー(ピアレビュー・チームレビュー)と工程末レビュー(=ゲート G1〜G6)の二層構造。工程末レビューは完了判定会議を兼ねる
  - レビュー=ゲートの一部という運用が支配的。「レビュー実施済みであること」自体が完了基準の確認項目になる([フォスターフリーランス](https://freelance.fosternet.jp/workstyle/software-quality03/))
  - 上流工程(G1・G2)のレビューは顧客承認を兼ね、受発注の契約区切り(多段階契約の節目)と一体化する([IPA モデル取引・契約書](https://www.ipa.go.jp/digital/model/model20201222.html))
  - QA 部門はプロセス品質(レビュー未実施・設計漏れ・仕様変更対応漏れ等の検出)とプロダクト品質(テスト密度・バグ密度等の定量評価)の両面で品質ゲートを運営([フォスターフリーランス](https://freelance.fosternet.jp/workstyle/software-quality03/))
- レビュー形骸化の典型(製造業 DR の知見だがソフトでも同型): 判断基準が共有されず「好みの議論」に流れる、目的・ゴールが曖昧で決定事項が残らない、役割・承認フローが不明確で誰も決定できない会議になる([日立ソリューションズ東日本 DR コラム](https://www.hitachi-solutions-east.co.jp/products/appsquare/b_column/unique_column03/))

## 7. 日本的観点(標準がカバーしない領域)

- 稟議・多段決裁の有無と形:
  - 受発注間の公式な意思決定機構として、IPA モデル契約は「連絡協議会」の設置を必須とし、仕様・プロジェクト管理方法・検収手続きの合意形成の場と定める([IPA モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html))
  - 発注側企業内では工程ごとの契約(多段階契約)のたびに社内稟議・予算決裁が走るのが通例(※この点の一次情報は未確認。追加調査項目)
- 品質保証部門など第三者レビューの制度:
  - 大手では QA 部門がプロジェクトから独立した第三者として計画審査・工程終了審査・出荷判定を運営する制度が確立([JUSE ソフトウェア品質保証部長の会 資料](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf)、[インソース研修案内](https://www.insource.co.jp/nmp/HH145.html))
  - 出荷判定における QA の「署名権(拒否権)」の強さは組織差が大きい(一次情報未確認。追加調査項目)
- 受発注構造とレビューの二重性(検収を兼ねるか):
  - 兼ねる。上流工程末レビュー(G1/G2)は準委任契約の成果物確認を、最終検収(G8)は請負契約の債務履行確定を兼ねる。IPA モデル契約は工程ごとに準委任(要件定義・外部設計)/請負(内部設計〜テスト)を使い分ける多段階契約を推奨([IPA モデル取引・契約書](https://www.ipa.go.jp/digital/model/model20201222.html)、[METI モデル取引・契約書 第一版](https://www.meti.go.jp/policy/it_policy/keiyaku/model_keiyakusyo.pdf))
  - 検収には検査仕様書・検査期間・みなし検収(期間内に通知なければ合格扱い)の仕組みがあり、2020 年民法改正後は契約不適合責任(修補請求・代金減額等)の起点になる(同上)
  - 多重下請け構造: 元請け(PM/SE=上流)、二次請け以下(PG=製造・単体テスト)という工程別の分業が一般的([システム幹事](https://system-kanji.com/posts/system-development-role))
- 建前と実運用の乖離(形骸化パターン):
  - 「後工程ほど手戻りコストが増大するので前工程で品質を作り込む」が建前だが、実際には工程完了判定が日程優先で「条件付き通過」の連発になり、品質ゲートが通過儀式化するリスクが知られる([日立ソリューションズ東日本 DR 失敗例](https://www.hitachi-solutions-east.co.jp/products/appsquare/b_column/unique_column03/))
  - SIer の人月ビジネス(単価×人数)は、文書量・工程数を減らす生産性向上と収益が相反するインセンティブ構造を持ち、重厚な工程・文書が温存されやすいという指摘がある([川本広二 note](https://note.com/koji_kawamoto_sm/n/n7d6408f9b45e)。※業界関係者の見解であり定量的裏付けは未確認)
  - 原典との乖離という意味では、Royce の警告(反復・Do it twice・継続的顧客関与)が落ち、図の逐次モデルだけが「ウォーターフォール」として制度化された経緯そのものが最大の建前と実態の乖離([dwheeler.com](https://dwheeler.com/essays/waterfall.html))
- ロールの兼務の実態: PM/PL 兼務(中小規模)、SE の設計・製造管理兼務が常態([キーシステム](https://key-sys.com/role-of-each-member/))
- IPA 共通フレームとの関係:
  - 共通フレームは「開発モデルを規定しない」建前だが(プロセスの並べ方はテーラリング)、多段階契約・工程末検収と組み合わさることで実務上ウォーターフォールの語彙基盤として機能([木暮仁](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html)、[五味弘 note](https://note.com/hiroshi_gomi/n/nb72333804e2f))
  - 版の変遷: 共通フレーム94 → 98(ISO/IEC 12207 適合)→ 2007(超上流・要件定義の強化)→ 2013(システム/ソフトウェアの区分明確化、ISO/IEC 12207:2008・JIS X 0160:2012 ベース)([木暮仁](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html)、[IPA](https://www.ipa.go.jp/publish/secbooks20130304.html))

### 手戻りコスト増大の根拠データ

- 古典的出典の系譜(出典追跡調査記事: [大根's ITブログ](https://daiconnnnnnn.hatenablog.com/entry/2022/03/21/203149)): Boehm "Software Engineering Economics"(1981)、Boehm & Basili "Software Defect Reduction Top 10 List"、IBM System Science Institute、NIST "The Economic Impacts of Inadequate Infrastructure for Software Testing"(2002)、Capers Jones
- 引用される代表的数値: 実装フェーズの修正コストを 1 とすると運用フェーズでは約 14 倍、仕様書不備起因のバグをテスト工程以降で直すコストは上流修正の 20〜200 倍([SHIFT ASIA コラム](https://shiftasia.com/ja/column/%E3%83%90%E3%82%B0%E3%81%AE%E6%97%A9%E6%9C%9F%E6%A4%9C%E5%87%BA%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%A8%E3%81%9D%E3%81%AE%E6%96%B9%E6%B3%95/))
- 注意点: これらの倍率は 1970 年代の TRW 等ウォーターフォール前提の環境で測定されたもので、現代環境への外挿には批判もある([ブロッコリーのブログ 翻訳記事](https://nihonbuson.hatenadiary.jp/entry/QA-activities-in-response-to-generated-code))
- 日本の定量データ: IPA[ソフトウェア開発データ白書](https://www.ipa.go.jp/archive/publish/wp-sd/qa.html)シリーズおよび後継の[ソフトウェア開発分析データ集2022](https://www.ipa.go.jp/digital/software-survey/metrics/hjuojm000000c6it-att/000102171.pdf)(5,546 プロジェクト)が、基本設計〜総合テストの 5 工程別の工数比率・信頼性データを収集(工程別「修正コスト倍率」そのものの IPA 一次データは本調査では特定できず。追加調査項目)

## 8. 考察(事実と分離)

- 「ウォーターフォール=Royce の発明」は二重の誤り。(1) 先行者がいる(Benington 1956)、(2) Royce は逐次一発勝負を警告した側。プロセス体系化の際は「俗説のウォーターフォール(逐次一方向)」と「原典の推奨(反復+文書+顧客関与)」を別プロセスとして扱うと図解が明快になる
- 日本の標準形の本質は「開発モデル」より「契約モデル」。工程末ゲートは品質判定であると同時に契約の区切り(準委任→請負の切り替え、検収)であり、ゲートの判定者に顧客が入る点が米国型(DOD 標準の政府調達)と同型。スキーマ化する際、gates には「品質判定」と「契約判定」の2属性を持たせるべき
- ゲート形骸化の構造要因は、(1) 判定者が日程遅延の責任も負っている(利益相反)、(2) 判定基準が定量化されていない、の2点に整理できそう。QA の独立性(第三者判定)がこの対策として制度化されている、と読める
- V字対応(詳細設計↔結合 or 単体)の流儀差は、スキーマでは「テスト工程の検証基準となる設計書」のリンクとして表現すれば吸収できる
- 生成 AI 時代の論点(フェーズ3向け): Royce の「Do it twice」は AI によるプロトタイプ高速生成で安価に実現可能になり、原典の推奨形に回帰する可能性がある(これは純粋な仮説)

## 9. 埋められなかった観点(追加調査項目)

- Royce 原論文の全文直接読解(本環境で PDF 読解不可)。特に「Involve the customer」節の 3 レビュー名(Preliminary Software Review / Critical Software Review / Final Software Acceptance Review)の原文確認
- 稟議・多段決裁の一次情報(発注側企業の社内決裁規程とシステム開発工程の対応)。政府調達では[デジタル・ガバメント推進標準ガイドライン](https://www.digital.go.jp/en/resources/standard_guidelines)や[特許庁 設計・開発ガイドライン](https://www.jpo.go.jp/system/laws/sesaku/gyomu/document/system_kouchiku_13/all.pdf)に工程レビュー・検収の規定があるが、PDF 本文の精読が未了
- 品質保証部門の「署名権」(出荷判定拒否権)の制度的裏付け(各社品質保証規程は非公開のため、JUSE SQiP 等の発表資料からの間接収集が必要)
- IPA 一次データとしての工程別欠陥修正コスト倍率(データ白書/分析データ集の該当章の精読が必要)
- 共通フレーム2013 本体(書籍)のタスクレベルの完全な列挙(Web 公開は部分のみ)
- 工程完了判定の具体的な定量基準値(レビュー指摘密度・テスト密度・バグ密度の業界標準値。IPA データ白書に統計あり、精読未了)

## 10. 出典一覧

### 一次情報

- Royce, W.W. (1970) [Managing the Development of Large Software Systems](https://www.praxisframework.org/files/royce1970.pdf) (IEEE WESCON) — 原論文 PDF
- IPA [共通フレーム2013(SEC BOOKS 紹介ページ)](https://www.ipa.go.jp/publish/secbooks20130304.html)
- IPA [共通フレーム2013 第3部 共通フレームとガイダンス(PDF)](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf)
- IPA [情報システム・モデル取引・契約書(第二版)](https://www.ipa.go.jp/digital/model/model20201222.html) / [同 総合ページ](https://www.ipa.go.jp/digital/model/index.html)
- METI [情報システム・モデル取引・契約書〈第一版〉(PDF)](https://www.meti.go.jp/policy/it_policy/keiyaku/model_keiyakusyo.pdf)
- IPA [ソフトウェア開発データ白書 FAQ](https://www.ipa.go.jp/archive/publish/wp-sd/qa.html) / [ソフトウェア開発分析データ集2022(PDF)](https://www.ipa.go.jp/digital/software-survey/metrics/hjuojm000000c6it-att/000102171.pdf)
- 特許庁 [システム設計・開発ガイドライン(PDF)](https://www.jpo.go.jp/system/laws/sesaku/gyomu/document/system_kouchiku_13/all.pdf)(未精読)
- JUSE [ソフトウェア品質保証部長の会 第2期成果発表資料(PDF)](https://www.juse.or.jp/sqip/community/bucyo/2/file/group2.pdf)

### 二次情報

- [英語版 Wikipedia: Waterfall model](https://en.wikipedia.org/wiki/Waterfall_model)(Bell & Thayer 1976、Benington 1956、DOD-STD-2167、MIL-STD-498)
- David A. Wheeler [The Waterfall Model](https://dwheeler.com/essays/waterfall.html)
- pragtob [Why Waterfall was a big misunderstanding from the beginning](https://pragtob.wordpress.com/2012/03/02/why-waterfall-was-a-big-misunderstanding-from-the-beginning-reading-the-original-paper/)(原文引用)
- [Annotated Library: Royce (1970)](https://inigomedina.co/library/work/royce-managing-development-of-large-software-systems)
- 木暮仁 [Web教材: 共通フレーム](https://www.kogures.com/hitoshi/webtext/std-kyotu-frame/index.html)
- 五味弘 [IPA SLCP 共通フレーム再考(3)](https://note.com/hiroshi_gomi/n/nb72333804e2f)
- サイゼント [ウォーターフォールモデルとV字モデル](https://cyzennt.co.jp/blog/2019/10/26/%E3%82%A6%E3%82%A9%E3%83%BC%E3%82%BF%E3%83%BC%E3%83%95%E3%82%A9%E3%83%BC%E3%83%AB%E3%83%A2%E3%83%87%E3%83%AB%E3%81%A8%EF%BD%96%E5%AD%97%E3%83%A2%E3%83%87%E3%83%AB/) / [AGEST V字モデル](https://agest.co.jp/column/2025-05-15/) / [ウェブレッジ V字モデル](https://webrage.jp/techblog/v_shaped_mode/)
- Sky株式会社 [システム開発工程とは](https://www.skygroup.jp/software/article/04/)
- オプティマル・システムデザイン・ワークス [システム開発プロジェクトの工程について](https://optimal-sdw.com/blog/code-projectmanagement/article_99)
- キーシステム [PM、PL、SE、PG それぞれの役割](https://key-sys.com/role-of-each-member/) / [Qbook 役割一覧](https://www.qbook.jp/column/2086.html) / [システム幹事 体制解説](https://system-kanji.com/posts/system-development-role)
- フォスターフリーランス [ウォーターフォール開発のソフトウェア品質保証](https://freelance.fosternet.jp/workstyle/software-quality03/)
- インソース [研修: ウォーターフォールモデル開発の品質保証(計画審査・工程終了審査・出荷判定)](https://www.insource.co.jp/nmp/HH145.html)(取得時 404、題名・概要は検索結果より)
- 日立ソリューションズ東日本 [デザインレビューとは](https://www.hitachi-solutions-east.co.jp/products/appsquare/b_column/unique_column03/)
- 大根's ITブログ [「後工程になるほどコストかかる」の情報調べ](https://daiconnnnnnn.hatenablog.com/entry/2022/03/21/203149)
- SHIFT ASIA [バグの早期検出メリット](https://shiftasia.com/ja/column/%E3%83%90%E3%82%B0%E3%81%AE%E6%97%A9%E6%9C%9F%E6%A4%9C%E5%87%BA%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%81%A8%E3%81%9D%E3%81%AE%E6%96%B9%E6%B3%95/)
- ブロッコリーのブログ [翻訳: AIコーディングツールと品質保証活動](https://nihonbuson.hatenadiary.jp/entry/QA-activities-in-response-to-generated-code)(コスト曲線の前提への批判)
- 川本広二 [日本のSIerがAI開発ツールを導入すると何が起きるのか](https://note.com/koji_kawamoto_sm/n/n7d6408f9b45e)(人月ビジネスのインセンティブ構造)
