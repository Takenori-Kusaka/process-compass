# #473 外部の調査の照合(2026-11-28)

指揮役が走らせた外部の調査(4 本のメモ)の主張を、一次の所在で開き、逐語で照合した記録です。調査はやり直していません。

## 読み方と略記

- メモの略記: **S** = `standards_graded_assurance.md`、**C** = `change_risk_tiers_and_stage.md`、**T** = `traceability_and_triage_feedback.md`、**X** = `tests_and_complexity_scoring.md`(場所は `E:/Github/process-compass/tmp/deep-research/research_notes/リスクに応じた根拠の厚み/`。git の外)
- 方法: PDF は `pdftotext` で本文を抽出して該当文を目で照合した。HTML は WebFetch。**WebFetch は要約モデルを通すので、そこから採った逐語は「要約経由」と書き、文字単位の照合はしていない**。取得日はすべて 2026-11-28
- 逐語は原語のまま(50 語以内)。日本語の原典は日本語で引く
- 出典台帳に既にあるもの: SRC-0554(Automotive SPICE PAM 4.0)、SRC-0348(DORA の変更承認の頁)、SRC-0420(Inozemtseva & Holmes 2014)、SRC-0544(NIST SP 800-53B。53A ではない)、SRC-0685(Google のコードレビュー)、SRC-0686(Bacchelli & Bird。台帳は ICSE の案内頁で、私は PDF を読んだ)。これらは下書きを作っていない
- 新しい出典の下書き: `sources-draft/draft-18` 〜 `draft-41`(24 件。SRC 番号は未採番)。`lint:sources` と目隠し抽出は未実施

## (1) 議長向けの最も重要な発見

**指揮役の要点と一次の文が食い違った点(先に)**

1. **主張 7(重大度の判断は人でもばらつく / 評価者間の一致)**。メモが挙げる 2 つの数値は、評価者間の一致の測定ではない。
   - Wunder ほか(IEEE S&P 2024)の **68% は、同じ人が 9 か月後に付け直した重大度の変化**である(「evaluations of the same person changed severity for 68% of participants」)。評価者間の食い違いは別に「指標ごとに不一致」と書かれるだけで、率は無い
   - Tian ほか(EMSE 2016)の **51% は 3 つの対象のうち最大の値**(OpenOffice 28.9%・Mozilla 36.6%・Eclipse 50.8%)。「約 51%」と一括して引くと過大になる。対象は重複した不具合報告で、コードレビューの指摘ではない
   - 「コードレビューの指摘の重大度で、評価者間の一致を測った研究」は、メモ自身が見つからなかったと書き、私も開けていない。引ける形は「不具合報告と脆弱性の評価で、重大度の判定が揃わないことが測られている。レビューの指摘への適用は推測」まで
2. **主張 11(AI の承認の製品は対象の重要さを測らない)は一般化できない**。一次で確かめられたのは **CodeRabbit の Merge Risk だけ**(「It does not count how important the touched code is」)。同じ文書が、利用者の指示で重要さを数えさせられると書く(「can make importance count」)。メモ C の問い4 の表は、Cursor の雛形と Claude Approvals の例が、認証・課金・データ移行を高く扱い、内部専用ツールを低く扱うと記す(私は開いていない)。つまり「製品は測らない」ではなく「**製品によって違う。CodeRabbit の既定は測らない**」
3. **主張 15(複雑さの閾値は慣行で、実証から導かれていない)は強すぎる**。NIST SP 500-235 §2.5 は「The original limit of 10 as proposed by McCabe has significant supporting evidence, but limits as high as 15 have been used successfully as well.」と書く。同じ節に「The precise number to use as a limit, however, remains somewhat controversial.」もある。引ける形は「**1996 年の NIST 文書が、10 に相当の裏づけがあるとし、15 までの上限も使われてきたと書き、正確な数は議論が残るとする**。10 が実証から導かれたかを独立に確かめた研究は、私は開いていない」。「慣行にすぎない」とは言えない
4. **主張 14(AI が書いた「通るだけ」のテストは欠陥を固定する)は、ツールの設計に強く依る**。Mathews & Nagappan(arXiv:2412.14137v1)は、欠陥を固定する試験が Copilot で 4.2%(12 件)、CodiumAI(CoverAgent)で 59.6%(171 件)、CoverUp で 68.1%(62 件)。高い 2 つは「現在のコードで通る試験だけを残す」設計。さらに両ツールは、欠陥のある標本の多くで試験スイートを作れない(著者が注記)。分母が表で混在する。未査読。「AI の試験は一般に欠陥を固定する」ではなく「通る試験だけを残す型の生成器で測られた」
5. **主張 5 の「2.6 倍」は報告書の PDF に在る**(メモ X は「PDF で未確認」と書いた)。ただし抽出では文が段の切れ目で折れ、「Survey respondents were 2.6 times more likely to be low performers if their organization」で止まる。条件の続きは原頁で要確認。FCA の「2 倍」は「大きな変更は**標準的変更に比べて**」の比で、メモ C の「他の種類の変更より」より狭い(これは要約経由)
6. **主張 6 の「書き方の決まりとレビューで守られ、機械が確かめられるのは結び付けの存在まで」は、前半が一次で閉じない**。Automotive SPICE は「リンクの存在は整合を意味しない」を **11 か所**で繰り返す(メモは 8 か所)。これは「リンクの存在と中身の整合は別」という規格の位置であって、「書き方の決まり」で守るとは書いていない。後者は Google・Linux カーネルの作法の記述(メモ T の A-2。私は開いていない)と推論に依る
7. **主張 3 の後半(現場の情報で見直す)は、一次で開けた文に無い**。IAEA GSR Part 2 の 4.15 は「基準を文書化する」まで。NIST RA-02 は「分類を権限者が承認する」まで。「見直す」は ISO 14971 の箇条 10 とトップマネジメントのレビューに依るが、**ISO 14971 の本文は有償で、公開プレビューは前書きと目次までしか読めなかった**(前書きに「More detail is given on the information to be collected and the actions to be taken when the collected information has been reviewed and determined to be relevant to safety.」)。メモ S は非公式の写しで読んでいる。**引かない**
8. **主張 4(ITIL の標準的変更)は ITIL 4 の原典では照合できない**(有償)。組織の手順書(WaTech、Yale)が一次の運用例。「承認を個々の変更から型へ前倒しする」という書き方は二次(メモ C の changeriskintel ほか)の言い回しで、手順書では「型を変更管理チームが審査して公開し、型から起こす変更は長い承認を要さない」と書く

**一次で確かめられ、指揮役の要点どおりだった点**: 主張 1(FDA CSA、NIST SP 800-53A 付録 C、Def Stan 00-56 Issue 4)、主張 2(ICH Q9(R1)、FDA CSA の低い側)、主張 5 の DORA と FCA の向き、主張 8(変異試験が実欠陥と連動した 70%・73%)、主張 12(IPA・NASA OIG・GAO)

**所有者の方針に対して最も重いもの**

- **支える側**: 方針 1 と 2 の骨格(リスクが高いほど証拠を厚くする。基準は組織が先に文書化し、権限者が承認する)は、分野をまたぐ一次の規範で確かめられた。方針 2 の「事業の段階で線を動かす」は、段階を明文に持つのは IAEA の用語集(「the stage in the lifetime of a facility」)だけで、英国 GDS の評価(年 100,000 件超で評価団が変わる)と NASA の Class E の出口条件は**運用の線**の先例。ただし**どれも事業の段階での証拠水準の線を数値で示した資料ではない**(主張 9)
- **反する側(または未支持)**: ①方針 3 の「設計書と対になるテスト」を低リスクの条件にする事例・規格は見つからず(主張 10)、Hill(ESEM 2026)は仕様の成果物の有無・質が欠陥を予測しないと報告する。②方針 5 の「テストが十分で継続して評価されている」は、カバレッジは指標にならず(Inozemtseva)、AI の試験は欠陥を固定しうる(Mathews)ので、**指標は変異試験の信号が要る**。③方針 6 の「複雑さの採点」は、LLM に採点させて人と比べた査読済みの研究が見つからない(メモ X)
- **最も重いもの**: 「厚みを事業の段階で変える」ための**線の数値と、AI のレビューで仕分けた結果の信頼性**(重大度は人でも揃わない。LLM の保守性の採点は未検証)の 2 点が、実証を欠く。標準に書くなら根拠水準マークで開示する前提になる

## (2) 主張ごとの表

判定の凡例: **一次**= 一次の本文で逐語を確認。**一次(要約経由)**= WebFetch の要約モデル経由で逐語を得た(文字単位の照合なし)。**二次のみ**。**食い違い**。**開けない**。**メモ自身が未確認等**。

### 支える向き

| # | 主張 | メモの所在 | 一次の URL | 逐語(原語) | 判定 | 引いてよい書き方 |
|---|---|---|---|---|---|---|
| 1 | リスクが高いほど証拠を厚く(一般則) | S「安全以外の領域」。FDA・NIST・Def Stan | FDA: https://www.fda.gov/media/188844/download / NIST: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53Ar5.pdf / Def Stan: https://skybrary.aero/sites/default/files/bookshelf/344.pdf | FDA: "heightened risks of software features, functions, or operations generally entail greater rigor for assurance efforts (i.e., a greater amount of objective evidence)." / NIST 附属書 C(p.707-708): "limited body of evidence" / "substantial body of evidence" / "extensive body of evidence" / Def Stan 11.3.1: "The quantity and quality of the evidence shall be commensurate with the potential risk posed by the system, the complexity of the system and the unfamiliarity of the circumstances involved." | **一次**。ただし Def Stan は **Issue 4(2007)**。Issue 7(2017)に同じ文言があるかは未確認(メモも未確認)。FDA は拘束力のない推奨で、対象は製造・品質システムのソフトウェア | 「FDA のガイダンス(2026-02-03)、NIST SP 800-53A 附属書 C、Def Stan 00-56 Issue 4 は、証拠の量をリスクに結び付ける」。「一般則」と書くなら、分野(医療機器の製造ソフト・情報セキュリティの評価・英国の防衛)を並べる。開発プロセスの標準への直接の先例とは書かない |
| 2 | 低い側を軽くするのも規範 | S。ICH Q9(R1) | https://database.ich.org/sites/default/files/ICH_Q9%28R1%29_Guideline_Step4_2022_1219.pdf | ICH: "The level of effort, formality and documentation of the quality risk management process should be commensurate with the level of risk." / FDA: "Documentation of assurance activities need not include more evidence than necessary to show that the software feature, function, or operation performs as intended for the risk identified." | **一次**。ICH の文は「見合う」と書くだけで、低い側を軽くしてよいと明記するのは FDA の「need not include more evidence than necessary」と「relatively low risk … generally entails less collection of objective evidence」 | 低い側は FDA の文を引く。ICH は「見合うべき」まで |
| 3 | 区分の基準は組織が先に文書化し、現場の情報で見直す | S「リスクの区分そのもの」 | GSR Part 2: https://gnssn.iaea.org/CSN/Trainings%20and%20Workshops/National%20Training%20Course%20on%20Safety%20Assessment%20in%20O/Bibliography/IAEA%20GSR%20Part%202.pdf / NIST 53A の RA-02 / ISO 14971 は**開けない** | GSR 4.15: "The criteria used to grade the development and application of the management system shall be documented in the management system." / RA-02c: "the authorizing official or authorizing official designated representative reviews and approves the security categorization decision." | **前半は一次**(文書化と承認)。**後半(現場の情報で見直す)は一次で未照合**。ISO 14971 は有償(プレビューは前書きと目次まで)。GSR Part 2 は GNSSN 配布の写しで、IAEA 公式の版との一致は未確認 | 「IAEA GSR Part 2 の 4.15 は段を決める基準の文書化を、NIST SP 800-53A の RA-02 は分類の決定を権限者が承認することを求める」。見直しは**引かない** |
| 4 | ITIL の標準的変更は承認を型へ前倒し | C 問い1 | ITIL 4 原典は有償。運用例: https://watech.wa.gov/sites/default/files/2024-12/ITSM%20-%20Change%20-%20Process%20Guide.pdf / https://its.yale.edu/sites/default/files/ServiceNow_Change_Management_v0.3.pdf | WaTech: "Standard changes are those that are low risk, with repeatable implementation steps and a proven history of success." / "Users can propose a new standard change template … directly from an existing change if that change has not been marked as unsuccessful." / Yale: "If there is a high volume of minor changes, their impact and risk are predictable and the procedures are well defined, they become candidates for standard changes" | **二次のみ(ITIL 4 の定義)+ 一次(組織の手順書 2 件)**。WaTech は 2022 年の ServiceNow の著作権表記を持つ運用の手順書で、ITIL の原典ではない。検索の要約では、Splunk・Ivanti・Celonis・Cornell が「低リスク・事前承認・手順が既知」と書く(二次) | 「ITIL の標準的変更は、低リスクで繰り返す変更を、型として事前に承認しておく仕組みとして一般に説明される(二次)。WaTech の手順書は、型の提案を『失敗と記録されていない変更』からに限り、使用と失敗を監視して型を廃止・停止できるとする」。ITIL 4 の語を一次として引かない |
| 5 | 重い事前承認は障害を減らしていない | C 問い5 | DORA 2019: https://dora.dev/research/2019/dora-report/2019-dora-accelerate-state-of-devops-report.pdf / DORA 頁: https://dora.dev/capabilities/streamlining-change-approval/ / FCA: https://www.fca.org.uk/publications/multi-firm-reviews/implementing-technology-change | DORA(p.50): "we investigated whether a more formal approval process was associated with lower change fail rates and we found no evidence to support this hypothesis, consistent with earlier research." / "Survey respondents were 2.6 times more likely to be low performers if their organization" / DORA 頁(要約経由): "Often organizations use additional process and more heavyweight approvals when faced with stability problems in production." / FCA(要約経由): "CABs approved over 90% of the major changes they reviewed" / "This may indicate that many CABs perform more of a 'flight control' role rather than an assurance function." | **一次**(DORA の PDF は文字単位で確認。FCA と DORA の頁は要約経由)。どちらも観察研究。FCA の発行は 2021-02-05、データは 2019 年。DORA は自己申告の横断調査 | 「DORA 2019 は、より正式な承認過程が低い変更失敗率と結び付くという仮説の証拠を見つけなかった。FCA(2021)は、CAB が審査した大きな変更の 90% 超を承認したと報告し、保証の機能か疑問を呈した。どちらも観察研究で因果は示さない」。否定しているのは**チームの外の機関による個々の変更の事前承認**で、同僚レビューは勧めている(DORA) |
| 6 | 追跡は書き方の決まりとレビューで守られ、機械が確かめられるのは結び付けの存在まで | T A-1・A-2 | Automotive SPICE PAM 4.0: https://vda-qmc.de/wp-content/uploads/2023/12/Automotive-SPICE-PAM-v40.pdf(SRC-0554) | SWE.1 Note 11: "Traceability alone, e.g., the existence of links, does not necessarily mean that the information is consistent with each other." / SUP.10.BP1: "including the initiator and reason of the change request." / SUP.10.BP3: "Approve change requests before implementation." | **一部が一次(食い違いあり)**。「リンクの存在は整合を意味しない」は 11 か所で確認(SYS.2〜5・SWE.1〜4・SWE.6・VAL.1 ほか)。**「書き方の決まりで守る」は規格の文でなく推論**。Google の CL 説明・カーネルの changelog の作法はメモ T の記述で、私は開いていない | 「Automotive SPICE は、双方向の追跡の注記で、リンクの存在は情報の整合を意味しないと繰り返す。変更要求には起票者と理由の記録を求める」。『書き方の決まりとレビューで守る』を規格の要求として書かない |
| 7 | 重大度の判断は人でもばらつく | T B-2 | Tian: https://sail.cs.queensu.ca/data/pdfs/EMSE2015_OnTheUnreliabilityOfBugSeverityData.pdf / Wunder: https://arxiv.org/abs/2308.15259 | Tian: "around 51 % of the duplicate bug reports have inconsistent human-assigned severity labels even though they refer to the same software problem" / "28.9 %, 36.6 %, and 50.8 % of the duplicate bug reports have inconsistent severity labels in the OpenOffice, Mozilla, and Eclipse datasets, respectively." / Wunder: "evaluations of the same person changed severity for 68% of participants." | **食い違い**((1) の 1 を参照)。Tian の 51% は最大値。Wunder の 68% は同一人物の再評価。kappa の研究(メモ T の arXiv:2306.08632・2605.12280)は**開けていない** | 「重複した不具合報告では、人が付けた重大度が 29〜51% で食い違う(Tian ほか 2016)。CVSS では、同じ人が 9 か月後に 68% で違う重大度を付けた(Wunder ほか 2024)。コードレビューの指摘での測定は無い」 |
| 8 | テスト十分性の指標で、実欠陥との結び付きが測られているのは変異試験 | X §2 | Petrović: https://arxiv.org/abs/2103.07189 / Just: https://homes.cs.washington.edu/~mernst/pubs/mutation-effectiveness-fse2014.pdf / Inozemtseva: https://www.cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf(SRC-0420) | Petrović(ICSE 2021): "We found that for 1043 (70%) of the bugs, mutation" / "Google has used mutation testing since 2014. … a total of 14,730,562 mutants have been generated for 662,584 code changes in 446,604 files." / Just(FSE 2014): "The results show the existence of a coupling effect for 73% of real faults." / "The results show a statistically significant correlation that is stronger than the correlation between statement coverage and real fault detection." / Inozemtseva: "coverage, while useful for identifying under-tested parts of a program, should not be used as a quality target because it is not a good indicator of test suite effectiveness." | **一次**。条件: ①Inozemtseva の有効性の測定は**変異試験の点**(実欠陥ではない)。つまり「カバレッジは実欠陥との結び付きが弱い」の根拠でなく、「変異点との相関が低〜中」の根拠 ②Petrović の 1,043 件は 1,502 件のうち。単一企業 ③「変異試験だけが測られている」という**排他の主張は未照合**(他の指標の研究を探していない) | 「変異体は、Google の高優先の実欠陥 1,502 件のうち 70%(1,043 件)と連動した(Petrović ほか 2021)。5 つの OSS の実欠陥 357 件では 73%(Just ほか 2014)。残りの欠陥は連動しないので、変異点が満点でも安全の証明にならない」 |

### 空白・反する向き

| # | 主張 | メモの所在 | 一次の URL | 逐語(原語) | 判定 | 引いてよい書き方 |
|---|---|---|---|---|---|---|
| 9 | 試作と大規模な本番の線を数値で示した公開の資料は無い | C 問い3 の Takeaway・Gaps | (無いことの主張。照合しない) | メモの探索: 「『PoC』と『利用者 1,000 万人規模の本番』で承認・証拠の閾値をどう変えるかを数値で示した公開資料: **見つからなかった**。スタートアップの段階モデルと工学実務の厳格さを結ぶ、査読のある研究にも当たれていない」/ 「Thoughtworks・DORA・Team Topologies が … 明示的に書いた箇所: 今回の検索では一次資料を特定できなかった」 | **メモの探索の記述を写す**。私は探索をやり直していない。近い先例は下に 3 つ開いた(段階の線の先例であって、証拠水準の線ではない) | 「見つからなかった(外部の調査 2026-11-28、検索の範囲はメモ C 問い3 の Gaps)。存在しないことの確認ではない」 |
| 10 | 事前の設計の資料への適合を低リスクの条件にする事例・規格は見つからず類推にとどまる | S の 3 節 Gaps、C 問い4 の Gaps | (同上) | S: 「『事前にレビューした設計判断(ADR に当たるもの)を根拠として引く』ことを直接扱う規格は見つからなかった。上の(2)の層からの類推に留まる」 / C: 「既存の設計決定(ADR・RFC・Design Doc)への適合を低リスクの条件にする AI 承認の方針・製品: **見つからなかった**(検索語: design doc / ADR / RFC / already approved。不在の観察であり、存在しないことの確認ではない)」 | **メモの探索の記述を写す**。ただし C の問い4 は「設計文書を**人が握るもの**として除外側に置く例」(カウシェ)があると記す。これは逆向きの事例(私は開いていない) | 「見つからなかった。類推の材料は、使用実績・供給者の証拠・過去の評価の再利用が、適用条件の一致・変更管理・日付を条件にする点(S の 3 節、NIST 800-53A 3.2.3.5 の再利用の条件)」 |
| 11 | AI の承認の製品は対象の重要さを測らない | C 問い4 | CodeRabbit: https://docs.coderabbit.ai/pr-reviews/merge-risk | CodeRabbit(要約経由): "It does not count how important the touched code is, general uncertainty about rolling out a change" / "can make importance count for your codebase, for example by marking billing changes as high risk." | **食い違い**((1) の 2 を参照)。一次で確認できたのは CodeRabbit 1 製品。Cursor・Claude Approvals・Macroscope・カウシェ・Reddit はメモの記述のみ(未開封) | 「CodeRabbit の Merge Risk は、触れたコードの重要さを既定では数えない。利用者の指示で数えさせられる。他の製品(Cursor の雛形、Claude Approvals の例)は認証・課金などを高く扱う(メモ C の記述。未照合)」 |
| 12 | 過去のトラブルの記録は使われないことが多い | T B-1 | IPA: https://www.ipa.go.jp/archive/files/000058073.pdf / NASA OIG: https://www.oversight.gov/sites/default/files/oig-reports/IG-12-012.pdf / GAO: https://www.govinfo.gov/content/pkg/GAOREPORTS-GAO-02-195/html/GAOREPORTS-GAO-02-195.htm | IPA: 「「過去トラDB」が有効活用されない理由は、障害を防止するためのノウハウが整理されておらず、表面的な障害の事象とどこにどんな対処をしたかぐらいの情報しか書かれていないためである。」 / OIG: "LLIS has been marginalized in favor of other NASA knowledge sharing system components and is of diminishing and questionable value." / "NASA program and project managers rarely consult or contribute to LLIS" / GAO(要約経由): "in the past 2 years, 43 percent of program and project managers have not submitted a lesson to the LLIS" / "compared to 23 percent of managers who have" | **一次**(IPA・OIG は本文を抽出して確認、GAO は要約経由)。IPA は**測定ではなく、ガイドブックの診断の記述**。OIG は 2012 年、GAO は 2002 年と古い。「使われないことが多い」は、日本(IPA の診断)と米国(NASA の 2 つの報告)の 2 国の例 | 「IPA(2017)は過去トラ DB が有効に活用されない理由を、ノウハウが整理されず表面的な情報しか無いためと診断する。NASA の LLIS は 2002 年の GAO の調査で提出した管理者が 23%、2012 年の監察総監の報告で価値が減り疑わしいとされた」。『多くの組織で』とまでは言わない |
| 13 | 基準・チェック項目を足し続ける害 | T B-1 | https://newswitch.jp/p/37955(書籍『事例でナットク! DRBFM による正しい設計プロセスの実行と GD&T …』(鷲﨑・栗山)の抜粋、2023-08-08) | 「設計チェックシートや再発防止シートなどを用いて、不具合が起きるたびに再発防止対策を講じていた。しかし、それでも同じような不具合が発生し、なかなか止まらなくなってきた。」 / 「設計自体が益々ルールに縛られた作業となり、かつその対応工数が膨大になったため」(要約経由) | **二次(書籍の抜粋。要約経由)**。DRBFM を勧める側の叙述で、測定ではない。台帳の SRC-0336 にも似た「ワークシートを提出するための作業」の記述がある(別の出典) | 「DRBFM を勧める書籍の抜粋は、不具合のたびにチェックシートを足した結果、設計がルールに縛られ工数が膨大になり、同様の不具合も止まらなかった、と述べる。測定ではなく経験の叙述」 |
| 14 | AI が書いた「通るだけ」のテストは欠陥を正しいと固定する(未査読) | X §3 | https://arxiv.org/abs/2412.14137 | "We found 12 such cases (4.2%) in Copilot's output, while CodiumAI and CoverUp produced 171 (59.6%) and 62 (68.1%) such cases respectively in their final test suites." / "These tests effectively validate bugs by treating incorrect behaviour as expected." | **一次(preprint)。食い違い(条件つき)**((1) の 4 を参照) | 「欠陥のあるコードを入力して測ると、現在のコードで通る試験だけを残す型の生成器では、最終スイートの 6〜7 割が欠陥を正しいと固定した(Mathews & Nagappan、2024、未査読)。Copilot では 4.2%」 |
| 15 | 複雑さの閾値は慣行で、検証済みの指標は無い | X §5・§6・§7 | NIST: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication500-235.pdf / Chowdhury: https://www.cs.ubc.ca/~rtholmes/papers/emse_2022_chowdhury_preprint.pdf / He ほか: https://arxiv.org/abs/2511.04427 / Hill: https://drops.dagstuhl.de/storage/00lipics/lipics-vol394-esem2026/LIPIcs.ESEM.2026.84/LIPIcs.ESEM.2026.84.pdf | NIST: "The original limit of 10 as proposed by McCabe has significant supporting evidence, but limits as high as 15 have been used successfully as well." / "The precise number to use as a limit, however, remains somewhat controversial." / Chowdhury: "we demonstrate why past studies contradict one another while examining the same data. We also show that evaluation context is king." / Hill: "The positive raw association between specification artifacts and defects is explained by task complexity: developers spec their hardest work." | **食い違い**((1) の 3 を参照)。「保守性を LLM に採点させて人と比べた査読済みの研究が無い」は**不在の主張で、メモ X §7 の探索の記述を写す**(私は探索をやり直していない。メモ自身が「本文を読んだものは無い」と書く)。「仕様の複雑さの検証済みの指標が無い」も同じ。Hill は仕様の**有無と質**を測ったもので、仕様の複雑さの指標ではない | 「NIST SP 500-235(1996)は、10 に相当の裏づけがあるとし、15 までの上限も使われてきたと書く。正確な数は議論が残る。コード指標と保守の負荷の関係は、評価の文脈で結論が変わる(Chowdhury ほか 2022)。LLM による保守性の採点の人との一致を測った査読済みの研究は、外部の調査では見つからなかった」 |

### 空白の主張 9 の周辺で開けた先例(主張の裏づけではない)

| 先例 | 一次の URL | 逐語 | 位置づけ |
|---|---|---|---|
| IAEA 用語集 graded approach | https://www-pub.iaea.org/MTCD/Publications/PDF/PUB1830_web.pdf | "commensurate with, for example, the magnitudes of any radiological hazards and non-radiological hazards, the nature and the particular characteristics of a facility, and the stage in the lifetime of a facility" | **段階を明文に持つ**。ただし原子力施設の寿命のうちの段階で、事業の段階への類推 |
| 英国 GOV.UK 評価の閾値 | https://www.gov.uk/service-manual/service-assessments/check-if-need-to-meet-service-standard | (要約経由)"your service is likely to handle more than 100,000 transactions per year." で省庁横断の評価団。"expecting to get fewer than 10,000 transactions per year." で評価不要(認定された様式作成基盤を使う場合) | 規模で**評価する者**が変わる運用の線。証拠水準でなく評価者の独立性 |
| 英国 GOV.UK 試作 | https://www.gov.uk/service-manual/design/making-prototypes | (要約経由)"The code in a prototype does not need to meet the same standards as production code." / "Do not just copy prototype code into production." | 試作を軽くするには、本番へ写さない出口の条件が付く |
| NASA NPR 7150.2D 附属書 D | https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7150_002D_&page_name=AppendixD | (要約経由)Class E: "Software developed to explore a design concept or hypothesis but not used to make decisions" for an operational Class A, B, or C system / "Class E software cannot be safety-critical software." / "If more than one software class appears to apply, then assign the higher of the classes to the system/subsystem." | 軽い層の定義は性質でなく**境界(何の決定に使わないか)**。迷えば高い方 |

## (3) 4 本のメモから審議に要る分の写し(所有者の方針 6 点別)

方針の番号は `owner-answers-02.md` の議長の読み 1〜6。**私は新しい解釈を足していない。メモの記述を写し、照合の判定を付けた。**

### 方針 1: リスクが高いほど、取り込みに要る根拠を厚くする(段は例で、実際は連続)

**支える**
- 安全規格(DO-178C・ISO 26262・IEC 61508・EN 50128・IEC 62304)は水準が上がると、目的・活動の数、技法の推奨の強さ、独立した確認の数が増える。DO-178C は目的の数(71→69→62→26)より独立性を伴う目的の数(30→18→5→2)が急に減る(S。二次。規格本文は有償で未読。独立性の数は二次の間で揺れる)
- 「標準の技法に従った」は理由として足り、標準から外れるときに個別の論証が要る構造(S の Inference。ISO 26262-8 の "A rationale based on the methods listed in the table is sufficient" は公式プレビューで確認済みとメモは書く)
- 根拠の 3 層という読み: (1) 一般の根拠(標準・良い実務)、(2) 事前に確かめた根拠の再利用(使用実績・供給者の記録・過去の評価。適用条件の一致・変更管理・日付が条件)、(3) 個別の分析と上位の承認(S の 3 節の Inference。**メモの読みで、規格の文ではない**)
- 段を決める入力は結果の重大さだけでなく、複雑さ・新規性・不確かさ・**下流に人の確認があるか**(FDA CSA の例)が加わる(S の Inference。FDA の「下流の人の確認」は私が本文で確認していない)
- 区分を低く付けて厚い根拠を逃れる道は塞がれている。EASA は「最悪の場合の不適合」で区分させ、過去の立証の再利用を区分の理由から外した(S。EASA の文書は未開封)

**反する・条件**
- 「高リスクに重い承認を」は、FCA で CAB がほぼ全件を通していたこと、DORA で外部の重い承認が失敗率の低さと結び付かないことと食い違う。メモ C は「承認者が何を見て何を却下するかを定めない限り根拠が弱い」と読む(C 問い5 の Inference。DORA は**同僚レビュー**を残す)
- 層別した承認を一律の承認と比べて障害率を測った独立の研究は見つからなかった(C 問い5 の Gaps)

### 方針 2: 求める厚みは事業の段階でも変わる(試作は中リスクまで一般論。大きな稼働中は低リスクで利用者に影響の無いものに限る)

**支える(先例。数値の線ではない)**
- IAEA 用語集は段階的な適用の基準に「施設の寿命の段階」を挙げる(上の表で確認)
- GDS は規模で評価の主体を変え(年 100,000 件超)、基準は同じで評価者の独立性が上がる設計。試作は「公衆が使えない」「本番へ写さない」が条件(上の表で確認。要約経由)
- NASA は分類を先に決め、低いクラスほど要求を減らす。Class E の出口条件(運用システムの決定に使わない・安全上重要でない)を持つ(メモ C。一部は上の表で確認)
- IPA の非機能要求グレードは、利用者の広がり(特定部門→取引先・顧客→不特定多数)で 3 つのモデルに分け、稼働率 99% / 99.99% / 99.999% を初期値にする(C 問い1。**未開封**)
- 大手の実務は、サービスの重要度の層・エラーバジェット・影響範囲を絞った展開・可逆性の 4 つの軸で根拠の厚みを決める。可逆でない変更(スキーマ・データ移行)は「常に人」の一覧に入る(C 問い2。Google SRE・AWS Builders' Library・Bezos の手紙。**未開封**)

**反する・空白**
- PoC と 1,000 万人規模の本番で閾値をどう変えるかを数値で示した公開資料は見つからなかった(主張 9)。AI の承認の製品は、事業の段階を「どのリポジトリで有効にするか」の設定に畳んでおり、既定が変わる仕組みは無い(C 問い4 の Inference)
- 商用の指針(Beck の 3X・Fowler の犠牲的アーキテクチャ)は段階で流儀を変えよと言うが、段階の移行をいつ・誰が宣言するかを定めない(C 問い3 の Inference)
- 公表された自動承認の実績は「ほぼ全 PR が低リスク」という前提より低い(Intercom 約 19%、Rewind 約 40%、Customer.io 60% 超。いずれも自社報告で選択の偏りがある。C 問い4。未開封)

### 方針 3: 追える状態は書き方の決まりで守る。行き着く先は設計書への落とし込みと、対になるテスト

**支える**
- 規格が共通に求める最小限は、変更要求の一意の識別と理由の記録、影響の分析、実装の前の承認、変更要求と影響を受けた成果物・問題報告の双方向の結び付け、要求と検証の対応の記録(T の A-1。ASPICE の SUP.10 は上で確認)
- 「決定を含む設計文書」はどの変更にも課されていない。根拠の文書化が明文なのはアーキテクチャの決定(SWE.2.BP3)。ISO/IEC/IEEE 15289 は文書の本数も名称も縛らず、チケット・PR 説明・リポジトリ内のファイルのどれに置いてもよい(T の Inference。SWE.2.BP3 は SRC-0554、15289 は SRC-0377)
- Google の CL 説明と Linux カーネルの changelog は「なぜ」を人が読む記録として求め、守らせているのはレビュアと保守者。道具で縛られているのは「なぜ」を含まない部分(T の A-2。**未開封**)

**反する・条件**
- 「リンクの存在は整合を意味しない」が規格に 11 か所ある(上で確認)。追跡の機械の検査は存在までで、中身は人の確認に残る。この点は方針 3 と矛盾せず、方針 3 が機械を条件にしないことと合う
- エージェントが書いた理由が実際の判断の経緯と合っているかを測った研究は見つからなかった(T の A-3 の Gaps)。記録者を規格は役職で指定していない(T の Inference)
- 試験と要求の対(双方向の追跡)が欠陥を減らすという実証は調べきれなかった(X §2 の Gaps)
- **Hill(ESEM 2026)**: 仕様の成果物(大半は課題・チケットへの参照)の有無・質は欠陥の導入を予測しない。素の関連は課題の複雑さで説明される(上で確認)。「設計書がある」だけで欠陥が減るという前提を置けない根拠。ただし標本は OSS で、設計書(ADR・設計仕様)そのものではない
- 仕様駆動の道具は仕様とタスクの結び付けを生成の副産物として残すが、仕様が人に更新されるまで静的なものもある(T の A-3。二次・個人の比較記事。**未開封**)

### 方針 4: 仕分けの基準を組織で合意し、AI レビューで検出し、検出できなかった件は基準へ戻す(人でも同じ回し方)

**支える**
- 区分は個人がその場で付ける見積りでなく、組織が先に文書にした基準を当てはめる行為として設計されている(IAEA 4.15、NIST RA-02 は上で確認。ISO 14971 は**未開封**)
- 基準の作りで、判定のばらつきを抑えるのは具体例・数値のしきい値・決定表を持つもの(Microsoft の SDL Security Bug Bar。T の B-2。**未開封**)。指針の共有と突き合わせで kappa が上がる例が複数ある(T。個別の論文は未読)
- Cursor の Bugbot は、人のレビュアが見落としを指摘した信号などから規則を作り、効かない規則を止める。解決率 52%→約 78% は自社報告で、LLM の判定による代理の指標(T の B-3。**未開封**)

**反する・条件**
- **重大度は人でも揃わない**(主張 7。Tian の 29〜51%、Wunder の同一人物の 68% の変化)。AI の重大度を人のラベルで採点するなら、先に人同士の一致を測らないと、不一致が AI の誤りか基準の曖昧さかを分けられない(T の Inference)
- **過去トラの記録は使われないことが多い**(主張 12)。溜めるだけでは足りず、一般化・使う場面へ届ける・傾向を見て直す責任が別に要る(T の B-1 の Takeaway)
- **項目を足すだけのフィードバックは基準を膨らませる**(主張 13)。DRBFM の文献の対処は、変更点に当たる項目だけを呼び出すことと、項目の由来を元の事例へ辿れるようにすること(T の Inference)
- 過去トラ・教訓を基準へ反映して再発が減ったことを測った公開資料は見つからなかった。逃した本番の不具合を評価集合へ足して AI レビュアを回帰試験する運用の公開例も見つからなかった。学習した規則の導入前後で逃した欠陥の率を比べた資料も無い(T の B-1・B-3 の Gaps)
- 学習した規則が人の承認なしに有効になるなら、基準が合意の手続きを経ずに変わる(T の B-3 の Inference。メモの推論)

### 方針 5: 本番の欠陥が減ったかは見極められない。拠り所は、十分なテストが作られ継続して評価されていること

**支える**
- レビューが届けている成果の中心は欠陥の検出でなく、保守性・理解・規範の維持・知識の移転(Bacchelli & Bird 2013: 指摘の「欠陥」は 570 件中 78 件(14%)とメモは書く。私が PDF で確認したのは、動機の首位は欠陥の発見だが実際の成果は欠陥の発見より少ない、という要旨と、570 件・管理者 165 名・開発者 873 名の規模まで。Sadowski ほか 2018 は未開封)。レビューの被覆と出荷後の欠陥の関係は 4 リリース中 2 つでしか有意でない(McIntosh ほか。X §1。未開封)
- DORA が外したのは外部の重い承認で、同僚レビューではない。変更の安全を別の手段(試験・段階的な配信・監視)に置き、レビューを保守性と所有の統制として残す構成と矛盾しない(X §1 の Inference)
- 変異体の生存のように試験が欠陥を検出できるかを測る信号が要る。実欠陥との結び付きの測定があるのは変異試験(主張 8)

**反する・条件**
- **カバレッジは指標にならない**(Inozemtseva。ただし測定は変異点)。Google の目安は 60/75/90% だが、全社で閾値を強制していない(X §2。ブログ。**未開封**)
- **AI の試験は欠陥を固定しうる**(主張 14)。網羅 100% でも変異点 4% の例(MutGen。X §3。要旨と本文の要約。**未開封**)。試験の独立性を測定可能な条件に落とすと、(a) 期待値の出所が仕様か実装か、(b) 試験が殺せる変異体があるか、(c) 実装を書いた文脈から試験が見えていたか。(b) だけが機械で決まる(X §3 の Inference)
- 試験の失敗の信号の大半が雑音になりうる(Google の flaky は全実行の約 1.5%、遷移の 84%。X §2。ブログ。**未開封**)。試験を根拠に置く標準は flaky の管理を前提条件に書く必要がある(メモの Inference)
- カナリア分析が障害を減らすという定量の公開の証拠は見つからなかった(X §2 の Gaps)。DORA の「リスク補償」(基盤が良いと不安定さがわずかに増す)は二次で、一次で未確認(X §4)
- 試験を書く担当と実装を書く担当を分けた場合の効果を実在の欠陥で測った研究は見つからなかった(X §3 の Gaps)

### 方針 6: コードの絡まりは重大障害を生むリスクを増やす。複雑さの採点の仕組みと基準が定義されていればよい

**支える**
- AI の採用後に認知的複雑度が +41.64%、静的解析の警告が +30.26% 増え、持続する。複雑度が 100% 増えると追加行数が 64.5% 減る(He ほか。abstract は上で確認: "a substantial and persistent increase in static analysis warnings and code complexity")。独立の差分の差分 2 本で方向が揃う(X §6。Agarwal ほかは**未開封**)
- 複雑度は規模を統制しても保守の負荷(変更されやすさ)を予測する(Chowdhury ほか。abstract のみ確認)。欠陥そのものの予測では変更の履歴の方が強い(Radjenović ほか。X §5。二次)。メモは複雑度を「欠陥の証拠」でなく「変更の危険が高い箇所の先行指標」と読む
- 組織が基準を定め、超えたら理由を記録する形(NIST SP 500-235 の「exceed するなら書面で理由」。メモ X の記述。**私は §2.5 の該当文を確認していない**)は、標準が数値を置かずに統制を求める先例になる(X §5 の Inference)

**反する・条件**
- 複雑度の指標は規模と強く相関し、「規模だけが妥当な指標」とする研究と割れる(X §5。Gil & Lalouche、Tahir & Xiao。二次)。CodeScene の「15 倍」は提供者が著者で、規模を統制していない(X §5。**未開封**)
- 欠陥との相関はごく弱いとする測定もある(Defects4J、Kendall 0.064。二次。著者が欠陥が単純と注記)
- 閾値を合否にした組織と一覧化にとどめた組織を比べた研究は見つからなかった(X §5 の Gaps)
- **LLM に保守性を採点させ人の専門家との一致を測った査読済みの研究は見つからなかった**。人の専門家どうしの一致も重み付き kappa で平均約 0.30(Extract Method の研究。二次)。LLM の採点は「一覧化して人へ渡す入力」までで、合否にする根拠は無い(X §7 の Inference)
- **仕様の複雑さを採点して欠陥を予測する検証済みの指標は見つからなかった**。Hill は仕様の有無・質が欠陥を予測しないと報告する(上で確認)。Yellin の提案(arXiv:2508.20119)は単著・未査読で、構成要素が要旨に無い(X §6)
- 複雑度の増加の値が、He ほかの本文内で表(41.64%)と考察(25%)で食い違う(メモ X の記述。表の値は私が本文で確認)

## (4) 分かっていないこと

- **ISO 14971 の本文**(受容可能性の基準の方針・製造後情報のレビュー)は、公開プレビューが前書きと目次までで読めなかった。主張 3 の「現場の情報で見直す」は一次で閉じていない
- **ITIL 4 の原典**(change enablement の標準的変更の定義と見直しの規定)は有償で未読。二次の一致は多いが、一次の文は無い
- **Def Stan 00-56 の現行版(Issue 7 以降)**が Issue 4 の「量と質をリスクに見合わせる」文言を保つかは未確認(メモ S も未確認)
- **ISO 26262-6・DO-178C・IEC 61508・EN 50128・IEC 62304 の本文の表**は有償で未読。段別の値(文網羅が ASIL で ++ か + か)は二次の間で食い違う(X §2)。引かない
- **FISC 安全対策基準の最新の版**と変更管理の項目は、一次を特定できていない(C 問い1)
- **事業の段階での証拠水準の線**を数値で示した資料は無い(主張 9)。IPA の非機能要求グレードのモデル別の初期値は、私は開いていない
- **評価者間の一致**の測定のうち、コードレビューの指摘に関するものは無い。kappa の複数の研究(T の B-2)は未開封
- **AI レビューでの仕分けの精度**(人の基準に照らした一致)を測った資料は見つからなかった(T の B-3 の Gaps)
- **Petrović の 70% のうち、連動しない 30% の欠陥の性質**は、本文の分析(50 件の標本)を私は読んでいない
- 本メモが挙げた**大手の実務**(Google SRE・AWS Builders' Library・Meta の Diff Risk Score・Rootly・Reddit・Intercom・Ona ほか)は、一次を私は開いていない。数値はすべて自社報告で、選択の偏りがある

## (5) 照合の集計と限界

**集計(主張 15 件)**

| 判定 | 件数 | 主張 |
|---|---|---|
| 一次で逐語を照合し、要点どおり | 5 | 1・2・5・8・12 |
| 一次で照合したが、指揮役の書き方と食い違う・条件が付く | 5 | 6(一部)・7・11・14・15 |
| 一部だけ一次、残りは二次・未照合 | 3 | 3(後半が未照合)・4(ITIL 4 は二次のみ)・13(二次の抜粋) |
| 「無い」という主張。メモの探索の記述を写した | 2 | 9・10 |

- 「引かない」と決めた値・文: ISO 14971 の箇条 10 の内容全般、ITIL 4 の語の一次としての引用、Tian の「約 51% で食い違う」の一括(最大値)、Wunder の 68% を「評価者間」と書くこと、「複雑さの閾値は実証から導かれていない」と断定すること、「製品は対象の重要さを測らない」の一般化、「AI の試験の 6〜7 割が欠陥を固定」を一般に書くこと、Def Stan の文言を「現行の」と書くこと
- 新しく作った出典の下書き: 24 件(`sources-draft/draft-18` 〜 `draft-41`)。うち 4 件(FCA・GAO・CodeRabbit・ニュースイッチ)の逐語は要約経由で、`verification.note` に書いた。GOV.UK 2 件・NASA NPR 7150.2D は下書きを作っていない(本メモの表に逐語のみ)
- 限界:
  - WebFetch は要約モデルを通す。「要約経由」と書いた逐語は、原頁での再確認が要る
  - PDF の抽出テキストは合字の欠落や段の折れがある(NIST RA-02、DORA の 2.6 倍の文)。引用に直した綴りは下書きの `note` に書いた
  - 逐語を 50 語以内に切ったため、条項の全文ではない
  - 下書きの YAML は `lint:sources` を通していない(構文は JSON 形式の引用で崩れないようにしたが、パーサでの検査は環境に無く未実施)
  - 開いた回数は 70 回前後。未開封の出典(上の「未開封」)は、メモの記述のまま写した

## 付録: 作業の出力

- 本ファイル: `research/473-deliberation/external-02.md`
- 出典の下書き: `research/473-deliberation/sources-draft/draft-18-*.yaml` 〜 `draft-41-*.yaml`(24 件)
- 作業用の抽出テキスト・生成スクリプトはスクラッチに置いた(git の外)
