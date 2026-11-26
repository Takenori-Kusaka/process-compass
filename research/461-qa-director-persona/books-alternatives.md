# 書籍の代替候補(#461 B2・B3・B5 の代わり)

- 日付: 2026-11-27
- 入力: `books.md`(論点 L1〜L8、候補 B1〜B6)
- 所有者の方針: 「Google Play ブックス、または DRM の無い PDF で買えなければ、別のもので代替する。英語の本でもよい」
- 本書は購入前の候補表である。出典カードは作らない。購入は所有者が決める
- 確認の方法: 販売頁を 2026-11-27 に取得して読んだ。取得は要約を返す仕組みを通したため、目次・価格・形式は販売頁の記載に従う。頁に載っていない項目は「未記載」と書いた

## 1. 前提の確認

- B2『ソフトウェア品質判定メソッド』、B3『ソフトウェア品質保証の基本』は Google Play に無い。通販の頁(ヨドバシ)に電子版の表示も無かった。日科技連出版社の PDF 直販は見つからなかった
  - https://www.yodobashi.com/maker/0000010351/
- B5(井芹洋輝『ソフトウェア品質保証ガイド』)は、Google Play の検索で当たらなかった。同じ著者の別の本(下記 G1)に電子版がある
- Gihyo Digital Publishing の電子書籍は、DRM(利用・複製の制限)が無い。購入者を識別する固有 ID とメールアドレス等が付く、と同社の案内に書かれている。PDF に購入者の情報が入る点は、所有者が知っておくこと
  - https://gihyo.jp/dp/help/reading/drm
- Leanpub の本は DRM が無いと、各書籍の頁に書かれている
- ASQ Quality Press の電子書籍は、DRM の無い PDF とは確かめられなかった(5 節)。外部の販売頁では Adobe DRM の表示があった

## 2. 論点ごとの候補

記号: G は Google Play、P は DRM の無い PDF の販売。形式の列は「Google Play」または「DRM の無い PDF」。

### 2.1 L1 承認・拒否の具体的な基準と拒否権の所在

| 記号 | 優先度 | 書名 | 著者 | 出版社 | 年 | ISBN | 入手先の URL | 形式 | 確かめた方法 | 埋まる見込み(目次で確かめた節) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | 高 | ソフトウェアテスト徹底指南書 開発の高品質と高スピードを両立させる実践アプローチ | 井芹 洋輝 | 技術評論社 | 2025 | 978-4-297-14910-9(電子版) | https://gihyo.jp/dp/ebook/2025/978-4-297-14910-9 | DRM の無い PDF(EPUB/PDF セット、3,600 円) | Gihyo の電子書籍の頁で形式・目次を確認。DRM は同社の案内で確認 | 20.6「テスト結果を評価しリリース判定する」。2.6「品質マネジメントを担う部門の陳腐化」。拒否権の所在そのものは目次から分からない。B2 の代わりに最も近い |
| G1 | 中 | Managing the Testing Process(第3版) | Rex Black | Wiley | 2011(電子版。紙は 2009) | 978-1-118-07401-5(電子版)、978-0-470-40415-7(紙) | https://play.google.com/store/books/details/Rex_Black_Managing_the_Testing_Process?id=XcmgfAZwL9gC | Google Play(4,259 円) | Google Play の詳細頁を確認。目次は Perlego の頁で確認 | 第9章「The Triumph of Politics: Organizational Challenges for Test Managers」、第6章「Crunch Mode」。出荷判定の節があるかは目次から確かめられていない |
| P2 | 中 | QAエンジニア入門 チームで品質を高める連携のしかた | 岩崎 駿 | 技術評論社 | 2026 | 978-4-297-15833-0(頁の URL の符号。本文に ISBN の記載なし) | https://gihyo.jp/dp/ebook/2026/978-4-297-15833-0 | DRM の無い PDF(2,600 円) | Gihyo の電子書籍の頁で形式・目次を確認 | 4.2.2「リリース判断に必要なユーザー影響を伝える」。QA エンジニア向けで、部長の判断の記述は薄い見込み |

### 2.2 L2 出荷判定会議・品質会議の実際の運用

| 記号 | 優先度 | 書名 | 著者 | 出版社 | 年 | ISBN | 入手先の URL | 形式 | 確かめた方法 | 埋まる見込み(目次で確かめた節) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P2 | 高 | QAエンジニア入門 | 岩崎 駿 | 技術評論社 | 2026 | 上に同じ | https://gihyo.jp/dp/ebook/2026/978-4-297-15833-0 | DRM の無い PDF | 上に同じ | 7.2.2「仕組みを作って回す: 情報・会議・テスト・リリース判断」。会議の運用に最も近い節 |
| P1 | 中 | ソフトウェアテスト徹底指南書 | 井芹 洋輝 | 技術評論社 | 2025 | 上に同じ | https://gihyo.jp/dp/ebook/2025/978-4-297-14910-9 | DRM の無い PDF | 上に同じ | 20.6 |
| G2 | 低 | Software Quality: Concepts and Practice | Daniel Galin | Wiley(Wiley-IEEE Computer Society Press) | 2018 | 978-1-119-13451-0(電子版)、978-1-119-13449-7(紙) | https://play.google.com/store/books/details/Daniel_Galin_Software_Quality?id=5aNMDwAAQBAJ | Google Play(17,508 円)。同じ書名の頁がもう1つある(id=86NMDwAAQBAJ) | Google Play の詳細頁を確認。目次は大学図書館の目録で確認 | 第13章 Reviews and Audits。付録 C Project Progress Control。「会議の運用」の記述は目次から確かめられていない |

### 2.3 L5 品質保証部門の組織・責任の体系的な記述

| 記号 | 優先度 | 書名 | 著者 | 出版社 | 年 | ISBN | 入手先の URL | 形式 | 確かめた方法 | 埋まる見込み(目次で確かめた節) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| G2 | 高 | Software Quality: Concepts and Practice | Daniel Galin | Wiley | 2018 | 上に同じ | https://play.google.com/store/books/details/Daniel_Galin_Software_Quality?id=5aNMDwAAQBAJ | Google Play(17,508 円) | 上に同じ | 第4章 Organization for Assuring Software Quality。第20章、第22章(変更管理)、付録 B(品質マネジメント規格)。章の題名で確認しただけで、本文は未読 |
| P1 | 高 | ソフトウェアテスト徹底指南書 | 井芹 洋輝 | 技術評論社 | 2025 | 上に同じ | https://gihyo.jp/dp/ebook/2025/978-4-297-14910-9 | DRM の無い PDF | 上に同じ | 2.2〜2.6(品質マネジメント、QMS の実現、品質マネジメントを担う部門の陳腐化)。第36章「テストを担う組織の構築」 |
| G3 | 低 | Software Quality Assurance | Claude Y. Laporte・Alain April | Wiley-IEEE Computer Society Press | 2018(電子版は 2017-12) | 978-1-119-31242-0(電子版)、978-1-118-50182-5(紙) | https://play.google.com/store/books/details/Claude_Y_Laporte_Software_Quality_Assurance?id=_M5KDwAAQBAJ | Google Play(16,089 円)。同じ書名の頁がもう1つある(id=AD5EDwAAQBAJ) | Google Play の詳細頁を確認。目次は書店の頁で確認 | 第2章 Quality Culture、第6章 Software Audits、第9章 Policies, Processes, and Procedures。組織・独立性の章は目次に無い |

### 2.4 L7 AI 駆動開発について品質保証部長が出す承認の条件

どれも、部長の承認条件を直接書いた本ではない。L7 は本来、QA4AI 本体など公開の資料で補う論点である(`books.md` の L7 の注と同じ)。

| 記号 | 優先度 | 書名 | 著者 | 出版社 | 年 | ISBN | 入手先の URL | 形式 | 確かめた方法 | 埋まる見込み(目次で確かめた節) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P3 | 高 | 生成AIアプリケーション評価入門 | 松木 晋祐 | 技術評論社 | 2026 | 978-4-297-15615-2(電子版) | https://gihyo.jp/dp/ebook/2026/978-4-297-15615-2 | DRM の無い PDF(EPUB/PDF セット、2,400 円) | Gihyo の電子書籍の頁で形式・目次を確認 | 7.3「AI 駆動開発のテスト・QA」(リスクと対策を含む)。2.6「開発チームと QA チームの役割分担の例」。1.2.3「QA エンジニアの役割」。対象は生成 AI を使うアプリの評価で、AI で書いたコードの出荷承認とは範囲が異なる |
| G4 | 中 | バイブコーディング 生成AI→チャット→エージェントによる「本番品質のソフトウェア」の未来 | ジーン・キム、スティーブ・イェギ(訳 長尾高弘) | 日経BP | 2026 | 未記載 | https://play.google.com/store/books/details?id=U7b0EQAAQBAJ | Google Play(3,080 円、販売価格 2,772 円) | Google Play の詳細頁を確認 | 第4部「大規模展開: 開発者個人の生産性を越えて」。節の題名は頁に無く、承認の記述があるかは未確認 |
| L1 | 中 | AI-Generated Code: Verification, Testing and Software Quality | Steve Publications | Leanpub | 2026(最終更新 2026-09-01) | なし | https://leanpub.com/ai-generatedcodeverificationtestingandsoftwarequality | DRM の無い PDF(PDF/EPUB、最低 19 ドル) | Leanpub の頁で形式・目次・DRM の記載を確認 | 第9章 Human-in-the-Loop Code Review、第12章 Governance, Policy, and Legal Considerations、第15章 Adoption Roadmap。著者名が団体名で、著者の経歴を頁で確かめられていない。購入前に試し読み(無料サンプル)で確かめること |

補助(優先度 低、3 冊の枠の外):

- QAエンジニア入門(P2)の 5.3「AI 時代に、QA エンジニアは何を問い、何を守るのか」
- 機械学習工学(石川冬樹ほか、講談社、2022、336 ページ、3,300 円)。Google Play。「品質の考え方と管理」を含む。生成 AI より前の機械学習の本。ISBN 未記載。https://play.google.com/store/books/details?id=jxChEAAAQBAJ

## 3. 論点ごとの候補の数と最有力

| 論点 | 候補の数(確認済み) | 最有力の1冊 | B2・B3・B5 の代わりになるか |
| --- | --- | --- | --- |
| L1 | 3 | P1『ソフトウェアテスト徹底指南書』 | 部分的。B2 の審査の枠組みに相当する本は見つからなかった |
| L2 | 3 | P2『QAエンジニア入門』(7.2.2) | 部分的。会議体の運用を主題にした本は見つからなかった |
| L5 | 3 | G2 Galin 第4章(組織)と P1 の 2.6(日本の実務)を2冊で組む | 代わりになる見込み。B3 の第5章と同じ範囲かは本文を読むまで分からない |
| L7 | 3(補助 2) | P3『生成AIアプリケーション評価入門』 | 部分的。B5 の「体制づくり」に当たる記述は目次から確かめられていない |

## 4. 考察(事実と分ける)

- 考察: B2 が埋めるはずだった L1・L2 は、代替では埋まりきらない。目次で「リリース判定」の節名が確認できたのは P1 の 20.6 と P2 の 4.2.2・7.2.2 だけである。部長の拒否権の所在は、目次の題名からは確かめられなかった
- 考察: 同じ著者の P1(2025)は B5(2026)と同じ著者で、品質マネジメントの章を持つ。B5 を Google Play で買えない場合の代わりとして、内容の重なりが見込める。重なりの度合いは未確認
- 考察: P1・P2・P3 は技術評論社の同じ店で買える。PDF で読める形が1か所にまとまる点は、所有者の方針に合う
- 考察: G2・G3 は Google Play で買えるが、1冊が 1.6〜1.8 万円である。L5 だけなら G2 を1冊に絞るのがよい

## 5. 未確認の候補(表に入れない)

| 候補 | 未確認の点 |
| --- | --- |
| The ASQ Certified Software Quality Engineer Handbook, Third Edition(Linda Westfall、ASQ Quality Press、2025、電子版 ISBN 978-1-63694-127-1) | ASQ の販売頁と FAQ は取得が拒否された(HTTP 403)。電子版は 2021 年から ePub に移った、と検索結果の要約にあるが、DRM の有無は確かめられなかった。外部の書店では ASQ の PDF に Adobe DRM の表示があった。Google Play の検索結果は読み取れなかった。2023 年版の CSQE 知識体系(公開 PDF)では、品質マネジメントの節に監査があり、製品のリリースは別の節にある。組織・拒否権の節は見当たらない。https://asq.org/quality-press/display-item?item=E1608 |
| Communication and Stakeholder Management for QA(Yuri Syuganov、Leanpub、最終更新 2026-08-30) | DRM の無い PDF は確認した。説明に「blocking a release」の項目がある。目次の節の一覧は頁に無い。「権限なしに影響を与える」という副題で、拒否権の所在の記述(L1)を補う見込みはあるが未確認。https://leanpub.com/modernqa-21-communication-stakeholder-management |
| Test Strategy and Quality Metrics(Yuri Syuganov、Leanpub) | DRM の無い PDF は確認した。「リリース可否の予測」とある。目次は頁に無い。https://leanpub.com/modernqa-22-test-strategy-quality-metrics |
| Combined Assurance Blueprinting(Attestify ほか、Leanpub) | DRM の無い PDF は確認した。全体の 6% しか公開されておらず、未完。https://leanpub.com/combined-assurance-blueprinting |
| Code Governance for AI-Native Software Development(O'Reilly、2026-11 刊と検索結果にある) | 販売の形式と DRM を確かめていない |
| The Expert Test Manager(Black ほか、Rocky Nook、2017、978-1-933952-94-9) | Google Play にある(7,049 円)。目次は第6章 Test Project Evaluation and Reporting などで、出荷判定の節名は無い。Rocky Nook の電子版の DRM は頁に記載なし。https://play.google.com/store/books/details/Rex_Black_The_Expert_Test_Manager?id=gVQnDwAAQBAJ |
| Reimagine, Don't Retrofit(Ricardo Gonzalez Vargas、Leanpub、2026-02) | DRM なしだが EPUB のみで PDF が無い。所有者の「PDF」の条件を満たさない。https://leanpub.com/reimaginedontretrofit |
| ソフトウェアテスト徹底指南書の Google Play の有無 | Google Play の検索では見つからなかった(技術評論社の PDF で買える) |

## 6. 候補にしなかったもの

- 無料の資料(IPA のガイド、QA4AI ガイドライン、SWEBOK など)は、購入ではないので本書の対象外
- 定額の読み放題(Perlego、O'Reilly、Manning の購読など)は、所有者の方針の「DRM の無い PDF」に当たらないので外した
- Software Testing with Generative AI(Manning、2024): テスト担当向けで、承認の条件は扱わない。L7 に合わない
- 多拠点プロジェクトマネジメント(技術評論社、2026): 拠点をまたぐ開発の管理の本で、品質保証部門の記述が目次に無い

## 7. 追加調査が必要な点

- B2 の目次(出荷判定の審査の枠組み)と同じ範囲を、P1 の 20.6 が含むか。購入前に Gihyo の試し読みがあれば確かめる
- G2 の第4章の本文(SQA 部門、経営層の責任、委員会などの記述)。購入前の試し読みで確かめる
- P3 の 7.3 の本文。出荷の承認の条件を書いているか
- Black の第6章に出荷判定の節があるか(目次の節名を確かめられなかった)
- ASQ の電子書籍の DRM(ASQ に直接問い合わせる必要がある)
