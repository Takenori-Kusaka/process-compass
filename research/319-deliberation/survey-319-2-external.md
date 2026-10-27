# #319 外部調査: 決定を固定する回帰試験を、どこに置き、どう保つか

- 調査日: 2026-10-26
- 担当: 外部調査(規格・業界の実務)
- 入力: `research/319-deliberation/issues-context.md`
- 方針: 一次資料を優先する。本文を読めなかった規格は「読めていない」と書く。二次資料に頼った箇所はその旨を書く
- 本書は調査の記録であり、条項の提案ではない。採否は会議体で決める

## 0. 要点

1. **試験資産は構成品目である**。CMMI・NASA NPR 7150.2・IEC 61508-3 の公開部分・Fowler の CI 原則はそろって、試験(スクリプト・データ・試験ツール)を版管理と構成識別の対象に含める。作業ディレクトリ(`tmp/`)に置かれた試験は、どの規範から見ても「構成管理されていない検証」に当たる(知見 A1〜A5)
2. **ISO 9001 7.5.3 は「消失からの保護」を要求する**。文書化した情報は必要なときに利用可能で、完全性の喪失から保護されることを求める。#319 の「利用者の端末にだけ残っていた」状態は、この要求に照らすと保護されていない(知見 A6)
3. **期待値ファイル(スナップショット・承認ファイル)は、コミットしてレビューする**のが Jest・Node.js・ApprovalTests の公式の手引きで一致する。CI では期待値を自動で書き換えない(知見 B2〜B4)。一方で、**更新の盲目化**(落ちたら上書き)が実務上の最大の弱点として実証研究に出ている(知見 B5)
4. **特性記述試験(characterization / golden master)は、正しさではなく「変化」を検出する**。不具合も固定するので、差分が意図したものかの判断は人に残る(知見 B1)
5. **時計に依存する試験は、時計を注入または凍結する**のが定石(Fowler 2011、Jest、Node.js MockTimers は v23.1.0 で stable)(知見 C1〜C3)
6. **非決定的な試験の隔離(quarantine)には上限を置く**。Fowler は件数・期間の上限を、Google は隔離時の自動起票を挙げつつ「本物の不具合を隠しうる」と明記する(知見 C4〜C5)
7. **既知の失敗は、「落ちることを期待する」形で走らせ続け、予期せず通ったら失敗にする**(pytest `xfail(strict=True)`、Node.js `expectFailure`(v24.14.0〜)、Bun/Jest `test.failing`)。Node.js の `todo` は失敗しても終了コードに影響しないので、この用途には弱い(知見 D1〜D4)
8. **無効化には記録(Issue)を必須にする**のが大規模 OSS の通例(Mozilla、Chromium、rustc の tidy 検査)。ただし期限の自動強制まで持つ例は今回見つけられなかった(知見 D5〜D7)
9. **禁止語の登録簿は、規則ファイルとしてリポジトリに置き、規則自体に試験を持たせられる**(textlint-rule-prh の `specs`、Vale の `reject.txt`)(知見 E1〜E3)
10. **ADR と自動検査を結ぶ研究・実務はある**が、規格の要求ではない(fitness function、ArchUnit、ADE)(知見 F1〜F3)

## A. 規格: 構成管理・文書管理・回帰の要求

### A1. ISO/IEC/IEEE 29119-3:2021(試験文書)

- 発行 2021-10-27/28。試験方針の節に「6.2.10 Test asset archiving and reuse」、試験完了報告に「7.4.9 Reusable test assets」、試験データ要求に「8.5.7 Archiving or disposal」がある
- 規格の要約は「test asset management, archiving, and reuse を容易にする」と述べる
- **読めていない**: 上記の節の本文。公開サンプルは目次と箇条1までで、見出ししか確認できない
- 含意(調査者の読み): 29119 系は試験資産の保管と再利用を**方針の項目**として持つ。保管場所を作業ディレクトリに任せることは、方針の欠落として扱える
- 出典: iTeh カタログ <https://standards.iteh.ai/catalog/standards/iso/b4f42a41-dd8f-446c-9674-238ba5dc90f1/iso-iec-ieee-29119-3-2021>(iTeh, 2021-10)、サンプル <https://cdn.standards.iteh.ai/samples/79429/27623aa24dba41a2876884c0ec57f5d7/ISO-IEC-IEEE-29119-3-2021.pdf>

### A2. ISO/IEC/IEEE 29119-2:2021・29119-1(試験プロセス・用語)

- 29119-2:2021(第2版、2021-10-28)は試験プロセスを組織・管理・動的試験の3層で規定する(ISO の要約)
- 回帰試験の定義(ISTQB 用語集 v3.4 と 29119-1:2013 を出典に挙げる用語集): 「試験項目またはその運用環境の変更の後に行う試験」。どちらの出典の文言かは区別されていない(二次資料)
- **読めていない**: 29119-2 の本文(回帰試験を試験の完了・保守でどう扱うか)
- 留意: 29119 には 2014 年に「Stop 29119」の撤回要求があった(文書偏重・規範性過多への批判)。条項の根拠に引くなら、この論争に触れておく
- 出典: ISO <https://www.iso.org/standard/79428.html>(ISO, 2021-10)、imbus 用語集 <https://www.imbus.de/en/glossar/term/regression-testing>(imbus, 日付不明)、Wikipedia <https://en.wikipedia.org/wiki/ISO/IEC_29119>(二次)

### A3. ISO/IEC/IEEE 12207・15288(構成管理プロセス・検証プロセス)

- 15288 の 6.3.5.1 構成管理の目的は「ライフサイクルにわたりシステム要素と構成を管理・統制する」こと、製品と構成定義の一貫性の管理(INCOSE ハンドブック 4.0 の独語訳を経た引用。二次)
- **読めていない**: 12207:2017/2026 と 15288 の構成管理・検証プロセスの成果(outcomes)と活動の本文。台帳の SRC-0491(12207:2026 プレビュー)・SRC-0642(12207:2017 プレビュー)も目次・まえがきまで
- 出典: GfSE プロセスモデル <https://www.prozessmodell.gfse.de/15603b4a-2055-4a4e-a5a8-bde62073c06c/elements/eea96f65-e8bc-4243-a394-f617cfb27253.html>(GfSE, 日付不明)

### A4. IEEE 828-2012(構成管理)

- 状態は **Inactive-Reserved**(2023-03-30 に不活性化)。2012-03-16 発行。構成品目の識別と取得、変更管理、状態記録、ビルドとリリースを対象とし、12207:2008・15288:2008 を支える
- 引用するなら「現行ではない」ことを明記する必要がある
- **読めていない**: 本文(構成品目に試験資産を含めるかの具体)
- 出典: IEEE SA <https://standards.ieee.org/standard/828-2012.html>(IEEE, 2012-03-16 / 2023-03-30)

### A5. 構成品目に試験資産を含める(CMMI・NASA・IEC 61508-3)

- **CMMI-SVC v1.3 CM**: 構成管理の対象の例に「Test tools and test scripts」を挙げ、作業成果物を作る・記述するのに使うツール等も範囲に含める。目的は作業成果物の「完全性の確立と維持」(wibas の解説頁。原典は CMMI v1.3。二次)
- **NASA NPR 7150.2 SWE-081(5.1.4)**: 「プロジェクト管理者は、統制するソフトウェア構成品目(ソフトウェアの記録・コード・データ・ツール・モデル・スクリプト等)とその版を識別しなければならない」。手引きは「test data, build scripts, test documents, test scripts」と試験ツールを挙げる(NASA SWEHB、2023-07-31 更新)
- **IEC 61508-3:2010 6.2.3**: ソフトウェア構成管理として、変更の管理的・技術的統制、要求された系統的能力の実証に要る操作の実施の保証、構成品目の一意な識別と正確な維持を求める。品目の列挙は「…software source code modules; test plans」まで読めた(以降は切れている)
- **読めていない**: IEC 61508-3 の 7.8(ソフトウェア改修)と表 A.8 の本文(回帰の妥当性確認・影響分析)。プレビューは見出しのみ
- 出典: wibas <https://www.wibas.com/cmmi/configuration-management-cm-cmmi-svc>(wibas, 日付不明)、NASA SWEHB <https://swehb.nasa.gov/x/6IAIAw>(NASA, 2023-07-31)、IEC 61508-3 ed2.0 プレビュー <https://assets.vde-verlag.de/iec-normen/preview-pdf/info_iec61508-3%7Bed2.0%7Db.pdf>(IEC/VDE, 2010)

### A6. ISO 9001:2015 7.5.3(文書化した情報の管理)

- 7.5.3.1: 文書化した情報は (a) 必要なときに、必要なところで、入手可能かつ利用に適した状態であり、(b) 十分に保護されている(機密性の喪失・不適切な使用・**完全性の喪失**から)
- 7.5.3.2: 配付・アクセス・検索・利用、保管・保存(読みやすさの保持を含む)、**変更の管理(版の管理など)**、保持・廃棄に取り組む
- 含意(調査者の読み): 過去の決定を固定する試験が「決定の記録」の一部であるなら、利用者の端末の `tmp/` にだけある状態は (a)(b) と 7.5.3.2 の変更管理の双方を満たさない
- **読めていない**: ISO 9001:2015 本文(上は監査員教育サイトの転記。二次)。ISO 9001:2026 での 7.5 の変更の有無も未確認
- 出典: Auditor Training Online <https://blog.auditortrainingonline.com/blog/explaining-iso-9001-clause-7.5.3-control-of-documented-information>(J. Stapleton, 2023-04-01)

### A7. DO-178C(航空)

- FAA AC 00-69(2017-07-21)3.1: 変更影響分析(CIA)は、変更の対象に「Development or verification environment」と構成データを含め、各項目の影響を記述する。**検証環境の変化も影響分析の対象**
- DO-178C は試験ケース↔手順↔結果の双方向トレーサビリティを求める(NASA の解説論文、SRC-0530)
- Parasoft の解説は「DO-178C は回帰試験を明示的には述べないが、変更後の検証を最新に保つ必要を含意する」とする(ベンダ解説。二次)
- **読めていない**: DO-178C 本文(有償)。特に 7章(構成管理)の管理区分 CC1/CC2、11.13〜11.15(検証ケースと手順、検証結果、環境構成索引)の文言
- 出典: FAA AC 00-69 <https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_00-69.pdf>(FAA, 2017-07-21)、NASA <https://ntrs.nasa.gov/api/citations/20120016835/downloads/20120016835.pdf>(NASA Ames, 2012)、Parasoft <https://www.parasoft.com/learning-center/do-178c/regression-testing/>(Parasoft, 2025-08-18 更新)

## B. 期待値を固定する試験(characterization / golden master / approval / snapshot)

### B1. 特性記述試験の性質

- Feathers『Working Effectively with Legacy Code』が命名。既存ソフトウェアの**実際の**振る舞いを記述する。正しさを推論しない。書いた時点の振る舞いを検証するので、**既存の不具合も固定される**。検出された変化が意図されたものかは分析者が判断する
- 再現性が前提。揮発する値(時刻など)は伏せるか除く。除くものが多すぎると実用にならない
- 含意: #319 の「前から落ちている 16 件」は、(i) 固定した振る舞いが後の決定で変わった(期待値の陳腐化)、(ii) 環境・時計に依存して再現性を失った、(iii) 本物の後退、のいずれでもありうる。特性記述試験の性質上、どれかを機械は判別しない
- 出典: Wikipedia "Characterization test" <https://en.wikipedia.org/wiki/Characterization_test>(二次。原典の書籍は未読)

### B2. Jest のスナップショット

- 「スナップショットはコード変更と一緒にコミットし、コードレビューの一部としてレビューする」。目的は「試験が落ちたときに原因を調べずにスナップショットを再生成する習慣と戦う」こと
- `-u` での再生成について: 意図しない不具合で落ちている試験があれば、**先に不具合を直してから**再生成しないと、不具合の振る舞いを記録してしまう
- Jest 20 以降、CI では `--updateSnapshot` を明示しない限りスナップショットを書かない。「新しいスナップショットは自動で通るので、CI では通してはならない」
- 試験は決定的であるべき。`Date.now` をモックする例を示す
- 出典: Jest 公式 <https://jestjs.io/docs/snapshot-testing>(Meta/OpenJS, 取得 2026-10-26)

### B3. Node.js テストランナーのスナップショット

- 「スナップショットファイルは試験ファイルと一緒にソース管理へ入れるのが最善の慣行」。生成は `--test-update-snapshots` を付けたときだけ。初回はファイルが無いので失敗する
- 本プロジェクトは Node のスクリプト群なので、外部ライブラリなしで同じ運用ができる
- 出典: Node.js v24.22.0 ドキュメント <https://nodejs.org/download/release/v24.22.0/docs/api/test.html>(OpenJS, 2026)

### B4. ApprovalTests

- `.approved` ファイルはソース管理へ入れる。`.received` ファイルは決して入れず、`.gitignore` に `*.received.*` を書く
- 不一致時は差分ツールが開き、意図しない変化ならコードを直し、新しい振る舞いを望むなら再承認する。承認者の役割は規定していない(実行した開発者が判断)
- 出典: ApprovalTests.cpp チュートリアル <https://approvaltestscpp.readthedocs.io/en/latest/generated_docs/Tutorial.html>(approvals プロジェクト, 日付不明)

### B5. 実証研究: 更新の盲目化

- Fujita ほか "An Empirical Study on the Use of Snapshot Testing"(ICSME 2023): コミットの約 8.2% がスナップショットを更新し、他の変更と同時に起きることが多い
- Cruz "Understanding Snapshot Testing in Practice"(UFMG 修士論文, 2024): 実務者は「落ちたときにコードを直さず原因も理解せずに更新するのはとても簡単」と述べる。差分がバグか意図した変更かの判断は全面的に人に掛かる。大きいスナップショットの衝突解消が難しい。UUID・時刻などの非決定的な出力が更新を不安定にする
- 含意: 期待値の更新を**機能変更と同じ差分の中で、理由つきで人が確かめる**仕組みがないと、固定試験は「通るように書き換えられる」。テンプレートの禁止事項3(テストの失敗をテスト側の変更で解消する)と同じ構造の危険
- 出典: NAIST SDLab <https://sdlab.naist.jp/en/post/fujita-icsme2023/>(NAIST, 2023。論文本体は未読)、UFMG <https://homepages.dcc.ufmg.br/~mtov/diss/2024-victor.pdf>(UFMG, 2024。RQ4.5 の結果は読めていない)

## C. 時計に依存する試験と非決定性

### C1. 時計を包み、差し替える

- Fowler「Eradicating Non-Determinism in Tests」(2011-04-14): 「常にシステムの時計を包み、試験のために簡単に差し替えられるようにせよ」。時計のスタブは特定の時刻に設定して凍結できる
- 同: 試験は互いに隔離し、どの順序でも走るようにする。後片付けより、試験ごとに初期状態を作り直すほうが失敗の原因を見つけやすい
- 出典: <https://www.martinfowler.com/articles/nonDeterminism.html>(M. Fowler, 2011-04-14)

### C2. Node.js MockTimers

- `mock.timers.enable({ apis: ['Date'], now })` で `Date` を凍結できる。`now` 省略時は Unix エポック。`setTime()` で時刻を進める
- MockTimers は Node.js v23.1.0 で **stable** になった(2023-04 導入)
- 出典: Node.js v23.1.0 リリースノート <https://nodejs.org/en/blog/release/v23.1.0>(OpenJS, 2024-10)、API 解説 <https://docs.deno.com/api/node/test/~/MockTimers.prototype.enable>(Deno による Node API の再掲。二次)

### C3. Jest の例

- 前掲 B2。`Date.now` を固定値のモックへ差し替え、いつ走らせても同じスナップショットになるようにする

### C4. 隔離(quarantine)の上限

- Fowler(前掲): 隔離は有効だが上限を置く。件数の上限(例: 8 件まで)か期間の上限(例: 1 週間以内)。「回帰試験の失敗を無視し始めたら、その試験は役に立たず、捨てたほうがよい」
- 出典: 前掲 C1

### C5. Google の flaky test の扱い

- J. Micco「Flaky Tests at Google and How We Mitigate Them」(Google Testing Blog, 2016-05-27): 試験の約 16% に何らかの flaky さがある。緩和策は再実行、「3回連続で落ちたら失敗」とする flaky 指定、flaky さの高い試験をクリティカルパスから外して**自動でバグを起票する**隔離ツール
- 同記事の注意: flaky 指定は flaky さを無視させる方向に働き「完全な解決ではない」。隔離は「本物の競合状態などの不具合を容易に隠しうる」。開発者が本物の失敗を flake と見なして片付ける例がある
- Google の研究(Ziftci ほか)は、flaky さを減らす手段としてハーメチックな使い捨ての試験環境を報告している(本文は未読)
- 出典: <https://testing.googleblog.com/2016/05/>(Google, 2016-05-27)、ICST 2023 <https://conf.researchr.org/details/icst-2023/cciw-2023-papers/3/How-we-use-Hermetic-Ephemeral-Test-Environments-at-Google-to-reduce-Test-Flakiness>(Google, 2023。未読)

### C6. Chromium

- flaky な試験は**有効のまま**にする(ビルダーが自動で再試行し、flakiness ダッシュボードが記録する)。`FAILS_`・`FLAKY_` 接頭辞は廃止された
- 出典: <https://www.chromium.org/developers/tree-sheriffs/handling-a-failing-test/>(Chromium, 日付不明)

## D. 長く落ちたままの試験(known failures / xfail / skip)

### D1. pytest の xfail と strict

- xfail は「何らかの理由で落ちると期待する」試験。既定では XFAIL も XPASS(予期せず通る)もスイートを落とさない。`strict=True` にすると **XPASS がスイートを落とす**。設定ファイルで既定を変えられる(公式頁の例はキー名が `xfail_strict` と `strict_xfail` で揺れている)
- `reason` で理由を書く。`raises` で期待する例外の型を限定すると、別の理由で落ちたときは通常の失敗になる
- 出典: <https://pytest.org/skipping.html>(pytest-dev, 取得 2026-10-26)

### D2. xfail の実務(Ganssle)

- strict を常用する。最小の再現を xfail 試験にし、修正の受入基準として使う。直れば strict が知らせるので印を外して回帰試験として残す。無関係な変更で偶然直ったことも検出できる。例では理由にバグ番号を書く(規則としては述べていない)
- skip は「その環境では走らせない」試験(OS・版の条件)、xfail は「通るべきだが今は落ちる」試験。xfail は**走り続け**、落ち続けていることを確かめる
- 出典: <https://blog.ganssle.io/articles/2021/11/pytest-xfail.html>(P. Ganssle, 2021-11-09)

### D3. Node.js の todo と expectFailure

- `todo`: 「TODO の試験は実行されるが失敗として扱われず、終了コードに影響しない」。flaky・未完了の印として案内されている。**予期せず通っても知らせない**ので、既知の失敗の固定には strict xfail より弱い
- `expectFailure`(v24.14.0 で追加): 印を付けた試験は**例外を投げたときに通り、投げなければ失敗する**。正規表現・エラー型で期待する失敗を限定できる。`{ label, match }` で理由と照合を両方書ける。`skip`・`todo` が優先する
- 出典: 前掲 B3

### D4. Bun / Jest の test.failing

- 結果を反転する。投げれば通り、投げなければ失敗する。`todo` と違い常に走る(Bun の資料。Jest の公式頁は今回開けていない)
- 出典: <https://bun.com/reference/bun/test/Test/failing>(Oven, 取得 2026-10-26)

### D5. Mozilla の試験無効化方針

- 無効化の前に、試験の作者・レビュアー・モジュール所有者を含むバグを起票し、2 営業日以内の応答を求める。応答がなければさらに 2 日で無効化。30% 以上落ちる試験は起票して先に無効化する。最近 7 日以内に入った試験なら、その変更を差し戻す
- 再有効化の手順はこの頁に無い
- 出典: <https://wiki.mozilla.org/Sheriffing/Test_Disabling_Policy>(Mozilla, 最終編集 2017-05-30)

### D6. Chromium の無効化

- `DISABLED_` 接頭辞を付け、**バグへのリンクをコメントに書く**。バグにはログの抜粋を貼る(ボットのログは消えるのでリンクだけでは不十分)。所有者を割り当てる
- 出典: 前掲 C6

### D7. rustc の known-bug

- `tests/crashes` の試験は `//@ known-bug: ` 指示を持たなければならず、tidy(リポジトリの検査)が欠落を誤りにする。ただし指示の後ろに Issue 番号があるかまでは検査しない(接頭辞だけを見る)
- 出典: <https://doc.rust-lang.org/nightly/nightly-rustc/src/tidy/known_bug.rs.html>(Rust Project, nightly)

### D8. 外部資源の消失で試験を止めた例(quarto-cli)

- 試験が依存していた外部の GitHub リポジトリが削除され 404 になり、内容の写しも誰も持っていなかった。対応は、試験を消さずに `_` 接頭辞で拾われないようにし、README で事情を書き、CI の並列実行表から外し、再作成を後続の作業として残す
- 含意: 「試験が依存する資産が、管理の外にあったので消えた」実例。#319 の `tmp/` と同型。止める際に**消さず、理由と復帰の作業を残す**運用の一例でもある
- 出典: <https://github.com/quarto-dev/quarto-cli/pull/13298>(quarto-dev, 日付は頁から読めず)

### D の小括(調査者の読み)

- 業界の通例は「既知の失敗を黙って落としておく」のではなく、(a) 落ちることを期待する印を付けて走らせ続ける、(b) 印に Issue を結ぶ、(c) 予期せず通ったら知らせる、の3点
- 期限の扱いは、Fowler の隔離期間の上限(例示)と Mozilla の応答期限が見つかった範囲。**印に期限を持たせて機械が期限切れを落とす公式の仕組みは、今回見つけられなかった**

## E. 禁止語・廃した表現の検査と登録簿

### E1. textlint-rule-prh

- `prh.yml` に `expected` と `pattern(s)` を書く辞書。正規表現と捕捉群が使える。各項目に `specs`(`from`/`to` の組)を書け、**specs が失敗すると辞書の読み込み自体が失敗する**。つまり登録簿の各項目が自分の試験を持つ
- 辞書は `rulePaths` で `.textlintrc` から参照する(リポジトリに置く前提)
- 出典: <https://github.com/textlint-rule/textlint-rule-prh>(textlint-rule, 取得 2026-10-26)

### E2. Vale の語彙

- 語彙は `accept.txt` と `reject.txt` の2ファイル(1行1正規表現)。`reject.txt` の項目は `Vale.Avoid` の存在規則に入り、**すべての出現を誤り**にする。`accept.txt` は例外として全スタイルに効く
- 版管理の扱いは公式頁に記述なし(プロジェクト側の設定として置くのが自然、は調査者の推測)
- 出典: <https://docs.vale.sh/keys/vocabularies>(Vale, 取得 2026-10-26)

### E3. alex

- `.alexrc` で `allow`(報告しない規則)か `deny`(この規則だけ報告)を指定。両方は同時に使えない。Markdown の `<!--alex ignore-->` 等で局所的に黙らせられる
- 含意: 抑止の手段(ignore コメント)が文書中に散ると、登録簿だけを見ても何が許されているかが分からない。抑止の一覧化が要る(本プロジェクトの `scope-exempt.yaml` の理由付き登録と同じ発想)
- 出典: <https://www.npmjs.com/alex>(get-alex, 取得 2026-10-26)

### E の小括

- 3 つとも、登録簿は**検査ツールが読む設定ファイル**であり、文書の作業手順のチェックリストではない。#319 の「廃した言い回しの登録簿(当時 20 句)」がスイートの中にあって手順に無かった問題は、登録簿をリポジトリの検査が読む位置へ置けば、手順に頼らずに済む形になる(調査者の読み)
- 登録簿の各句に「どの決定(ADR・Issue)で廃したか」を持たせる公式の仕組みは、3 ツールとも持たない。必要なら項目のコメントか独自の欄で持つ

## F. 決定記録と試験を結ぶ

### F1. Fitness function

- Ford・Parsons・Kua・Sadalage『Building Evolutionary Architectures』の定義: アーキテクチャ特性の「客観的な完全性の評価を与える仕組み」。InfoQ の解説は、設計の意図を実行可能なコードとして記録し、セーフティネット・文書・進化の支えになるとする。ADR への言及は無い
- 出典: InfoQ <https://www.infoq.com/articles/fitness-functions-architecture/>(T. Much, 2025-04-14。原典の書籍は未読)

### F2. ArchUnit

- Thoughtworks Technology Radar: 2018-05 Assess、2018-11 Trial。既存の単体試験の仕組みで走り、CI・デプロイのパイプラインで fitness function を実装しやすくする。Java のみ
- 出典: <https://www.thoughtworks.com/en-us/radar/tools/archunit>(Thoughtworks, 2018-11)

### F3. ADR から自動検査へ(ADE)

- Schellander「Architectural Decision Enforcement」(OST 修士論文, 2026-08 登録): 既存の適合検査ツールは**規則がどの ADR に由来するかと結ばれておらず**、それが浸食を招くと指摘。ADR の隣に置く規則の DSL を提案し、ADR 17 件の .NET プロジェクトで 9 件の決定を 44 の検査で自動強制した
- 含意: 「決定 → 試験」の対応を明示的に持つと、決定の改廃時にどの試験を見直すかが追える。#319 の「scenarios が前から落ちている」原因調査も、各場面がどの ADR・Issue を固定しているかの対応があれば、陳腐化か後退かの判断が速くなる(調査者の読み)
- 出典: <https://eprints.ost.ch/id/eprint/1381/>(OST, 2026。要旨のみ読んだ)

## G. 作業ディレクトリに試験を置くリスク

- **原則**: Fowler「Continuous Integration」(改訂 2024-01-18): リポジトリは「製品のソースコード、試験、データベーススキーマ、試験データ、設定ファイル」を確実に返すべき。「ビルドに要るものはすべてソース管理に置き、ビルドで作るものは置かない」。自己試験するビルドは CI の前提条件
  - 出典: <https://martinfowler.com/articles/continuousIntegration.html>(M. Fowler, 2024-01-18)
- **規格**: A5(構成品目に試験スクリプト・試験データ・試験ツールを含める)と A6(文書化した情報の消失からの保護)
- **事例**: D8(外部資源の消失で試験が止まり、写しが無かった)。Chromium が「ボットのログは消えるので抜粋をバグに貼る」と定めている(D6)のも、消えうる場所の記録を正本にしない運用の例
- **見つからなかったもの**: `.gitignore` の対象に試験を置いていて失われた、と明記した事後分析(postmortem)の一次資料は、今回の検索では見つけられなかった

## H. 会議体へ渡す論点(調査者の整理。結論ではない)

1. 決定を固定する場面は構成品目か。A5・A6・G から見ると、構成品目でない検証は「検証した」と主張する根拠にならない
2. 期待値の更新を誰がどの差分で確かめるか。B2・B5 は「CI では書かない」「機能変更と同じレビューで見る」を示す。テンプレートの禁止事項3と整合させる必要
3. 前から落ちている 16 件の扱い。D の通例は「strict な期待失敗 + Issue + 予期せぬ通過の通知」。Node.js の `todo` は終了コードに効かず、`expectFailure` は v24.14.0 以降(CI の Node の版を確認する要あり)
4. 時計に依存する場面。C1・C2 は時計の注入・凍結を定石とする。隔離するなら件数か期間の上限を持つ(C4)。隔離は本物の後退を隠しうる(C5)
5. 廃した言い回しの登録簿。E は登録簿を検査の設定として置き、各項目に試験を持たせる形(prh の specs)を示す。由来(ADR・Issue)の欄は自前で持つ必要
6. 決定と試験の対応表。F3 は対応が無いことを浸食の原因に挙げる

## I. 読めていない一次資料(一覧)

| 資料 | 読めた範囲 | 読めなかった範囲 |
| --- | --- | --- |
| ISO/IEC/IEEE 29119-2:2021 | ISO の要約 | 本文全体 |
| ISO/IEC/IEEE 29119-3:2021 | 目次・箇条1 | 6.2.10・7.4.9・8.5.7 の本文 |
| ISO/IEC/IEEE 29119-1 | 用語集経由の定義 | 本文 |
| ISO/IEC/IEEE 12207:2017/2026 | まえがき・目次(SRC-0491・0642) | 構成管理・検証プロセスの成果と活動 |
| ISO/IEC/IEEE 15288 | 6.3.5.1 の目的(二次) | 成果・活動 |
| IEEE 828-2012 | 要約・状態 | 本文 |
| ISO 9001:2015 7.5.3 | 監査員教育サイトの転記(二次) | 本文。2026 年版での変更 |
| IEC 61508-3:2010 | 6.2.3 の一部(プレビュー) | 7.8・表 A.8 |
| DO-178C | FAA AC 00-69・NASA 解説(二次) | 本文(7章・11.13〜11.15) |
| Fujita ほか ICSME 2023 | 研究室の紹介記事 | 論文本体 |
| Google ICST 2023(ハーメチック環境) | 題目 | 本文 |
| Feathers『Working Effectively with Legacy Code』 | Wikipedia 経由 | 書籍 |
| Jest `test.failing` 公式頁 | — | 開けていない(Bun の資料で代替) |
