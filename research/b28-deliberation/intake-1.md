# 束 B28 受付の更新(その1)— U4a〜U6 の計画の突合と IMPL-1029 の受付

作成 2026-11-20。担当は「受付の更新と議長の裁定の案」。実装はしていない。書いたのは本ファイルと `ruling-draft-1.md` だけ。

- 現物: 本体 `Takenori-Kusaka/b28`(24e2b486。origin/main = 6329c888、`git ls-remote` で確かめた)、template `b28`(d455cb2。origin/main = 31e783a のまま)
- 他の束: B25 は origin/main に入っている(intake-2 の時点で既に反映済み)。B27 は作業ツリー `b29`(本体 232f6938・template 4bd0a8b)で進行中で、**まだ push していない**。B27 の template の差(31e783a..4bd0a8b)は `README.md`・`adoption-trial.mjs`・`next.mjs`・`seeded-error-scan.mjs`・`test-env-check.mjs`・`test-next-records.mjs`・`test-seeded-error-scan.mjs`・`templates/03-debt-ledger.md` だけで、U4a〜U6 のファイルには触れない。ただし README.md は U4a〜U6 の移行の注意(README の「テンプレート更新時の…」節)と同じファイルなので、push の順で衝突しうる
- 番号: B27 は ADR-0250(仮番号)を使う。本束の ADR-0243・0244 も仮番号とし、push の直前に origin/main の最大と照らす
- 作業ツリーの状態: template の `scripts/vendor/tailoring-kb.json` が変更ありと出るが、`git diff --ignore-cr-at-eol` で中身の差は無い(改行だけ)。触っていない
- 入力: `research/b26-deliberation/intake-2.md` §1.4〜§1.6・§2・§3・§4、`ruling-2.md`、`research/b22-deliberation/00-intake.md`・`10-research-B.md`・`30-ruling.md`・`81-ruling-light-H.md`・`96-issue-comment-445.md`、ADR-0224・ADR-0151・ADR-0200、`research/b21-deliberation/ruling-deferred.md`、`research/326-deliberation/b26-live-check.md`、triage §4 の 43

## 1. (a) U4a・U4b・U5・U6 の計画と現物の突合

### 1.1 結論

**ずれは小さい。単位の分け方と触るファイルは intake-2 §2.1 のままでよい**。U1〜U3 が触ったファイル(31e783a..d455cb2: `aggregate-evidence.mjs`・`check-safety-record.mjs`・`verify-gate-contract.mjs`・`generate-profile.mjs`・`00-d0-governance.md` と試験4つ)のうち、U4a〜U6 と重なるのは `aggregate-evidence.mjs`(U5)と `verify-gate-contract.mjs`(U4b の契約。ただし U4b は `g5-aggregate.mjs` 側へ足すだけ)だけである。`adapter.mjs`・`config.mjs`・`gate-g5.yml`・`g5-aggregate.mjs`・`check-pr.mjs`・`exception-expiry.mjs`・`adapters/*.json` は 31e783a から変わっていない。

### 1.2 項目ごとの照合

| 単位 | intake-2 の記述 | 現物(2026-11-20) | 改め |
| --- | --- | --- | --- |
| U4a | `adapter.mjs` は phase の定義が無いと終了コード 2(47〜51 行) | 同じ。`node scripts/gate/adapter.mjs print mutation` は `::error::アダプタ none に phase "mutation" の定義がありません`・exit=2 を返した(実行で確かめた) | なし。キーが無いことを空と同じに扱う(intake-2 §1.5)は要る |
| U4a | `ALWAYS_PHASES` は secretScan だけ(config.mjs 3146 行) | 同じ(3146 行) | なし |
| U4a | `OPTIONAL` の集合は adapter.mjs の中 | 74 行の局所の定数(lint・audit・licenses・coverage・install)。test・secretScan 以外は空なら失敗という形ではなく、「OPTIONAL に無ければ空で失敗」 | **改め**: `mutation` を OPTIONAL に入れず、必須かの判定(案件の条件・R1)を段の中で行い、必須でなければ注意で通す分岐を OPTIONAL の判定の前に置く。現形では OPTIONAL に無い段は空で無条件に失敗するので、何もしないと全採用者の G-5 が落ちる |
| U4a | 7つのアダプタは `mutation`・`regulatory` を持たない | 同じ(go・node・none・python-poetry・python-uv・python・undetermined。キーの数は 0) | なし |
| U4a | `ci.mutationThreshold` の読みと型の検査を config.mjs に | config.mjs に mutation の語は無い。閾値の先例は `ci.coverageThreshold`(読みは adapter.mjs 121 行の環境変数、型と在否は verify-gate-contract.mjs 866〜868 行、書くのは `/process-change` の `kinds/settings.md`) | **改め**: 閾値の在否と型の検査の置き場は、coverage に倣い **verify-gate-contract.mjs と adapter.mjs の段の中**の2か所。config.mjs は読みの関数だけ(置くなら)。補助ファイルは `.claude/skills/process-change/kinds/settings.md` と確定 |
| U4a | `f2Q1Of`・`readF2Q1`(cl-judgment.mjs 136・169 行) | 同じ(136・146・161・169 行) | なし |
| U4a | r-e-cl3 の note(rules-criticality.yaml) | 115 行「故障挿入試験とミューテーション試験をCIの必須チェックに加える(附属書F F.4)」のまま | なし(項目6 は未着手のとおり) |
| U4a | 様式09 にミューテーションの語が無い | 0 件 | なし |
| U4a | `src/data/template-fields.yaml` | mutation・ミューテーションの登録は無い | なし |
| U4b | 集約の手順は failure・cancelled だけを落とす | 同じ(gate-g5.yml 520〜545 行。needs は9ジョブ) | 行番号のみ(intake-2 は 514〜527 を引く研究B を経由) |
| U4b | `G5_CRITERION_JOBS`・`G5_RULE_JOBS`(g5-aggregate.mjs) | 26・36 行。RULE は contract・pr-rules の2つ | なし |
| U4b | 試験 test-g5-aggregate.mjs | **Windows の作業ツリーでは 4/30 が NG**。原因は CRLF(core.autocrlf=true で gate-g5.yml と試験が CRLF)。`git -c core.autocrlf=false archive` で LF の複製を作って流すと 30/30 一致(実行で確かめた)。欠陥ではない | **注意を足す**: U4b の担当は試験を LF の複製か WSL(node 26)で流す。CRLF の NG を直しにいかない |
| U5 | `exceptionFor`(check-pr.mjs 747 行)、`restrictedStateExceptions`(exception-expiry.mjs 248 行)、`exceptionQuotaText`(280 行) | 同じ | なし |
| U5 | 集約の項目7(aggregate-evidence.mjs 4597〜4618 行) | **4632〜4653 行**へ動いた(U3 の 47 行の追加による) | 行番号の改め |
| U6 | `unjudgedGateExceptions`(IMPL-0996。exception-expiry.mjs) | 361〜373 行。G-5 の行は常に欠落の文。集約の呼び出しは aggregate-evidence.mjs 3535 行 | 行番号の明記 |
| U6 | ADR-0243 を新設 | 本体の ADR の最大は 0225(ファイル名で確かめた)。0243 は B26 の予約の番号の見込み。B27 は 0250(仮) | 仮番号のまま。push の直前に照らす |
| 共通 | ★(B27 が並行して触る可能性): aggregate-evidence.mjs・config.mjs・check-pr.mjs・gate-g5.yml | B27(b29)の template の差はこの4つに触れていない | **★の直列の制約は外してよい**。B27 の push の後に載せ直す必要は README.md だけ |
| 共通 | 試験はすべて結線済み | 変わらず(intake-2 §1.8 の行番号は gate-g5.yml の contract のジョブ) | なし |

### 1.3 確定の一覧(intake-2 §2.1 の改め。IMPL-1029 を含める)

| 単位 | 項目 | template のファイル | 本体のファイル | 試験 | 新設 |
| --- | --- | --- | --- | --- | --- |
| U4a | 段(項目1〜3・6・9)**と IMPL-1029 の R1 の必須の条件** | `scripts/gate/adapter.mjs`(段の必須の判定。R1 の判定は check-pr.mjs の `riskClassOf`・`riskFloorOf` を呼ぶ)・`scripts/gate/verify-gate-contract.mjs`(閾値の在否と型。866 行の coverage に倣う)・`adapters/*.json`(7つに空の `mutation`・`regulatory`)・`scripts/gate/test-adapter.mjs`・`.claude/skills/process-change/kinds/settings.md`・`templates/09-safety-risk-assessment.md`・`scripts/vendor/tailoring-kb.json`(生成)・`.github/workflows/gate-g5.yml`(段のジョブ2つ。PR の本文と基底の構成を段へ渡す)・`README.md`(移行の注意) | `src/data/tailoring/rules-criticality.yaml`・`src/data/template-fields.yaml`・`tailoring-guide.md`(0763)・`safety-verification.md`(0930・F.6 の 284・286 行)・`assurance-case.md`(IMPL-1029)・ADR-0244(仮)・台帳 | test-adapter・test-adoption・本体 test:fields | ADR-0244(仮) |
| U4b | 集約(項目4・5)と 326-B | `gate-g5.yml`(集約の手順と needs)・`g5-aggregate.mjs`(`G5_RULE_JOBS` へ mutation・regulatory)・`test-g5-aggregate.mjs` | intake-2 のとおり | test-g5-aggregate(LF で流す)・test-adoption | なし |
| U5 | 0630・項目7 | intake-2 のとおり(aggregate-evidence.mjs の行は 4632〜4653) | intake-2 のとおり | intake-2 のとおり | なし |
| U6 | 閾値割れの 7.3(案件の段と **R1 の段の両方**) | `adapter.mjs`(段が台帳の行を読む)・`exception-expiry.mjs`(361〜373 行の IMPL-0996 の改め)・`test-exception-expiry.mjs`・`test-adapter.mjs` | ADR-0243(仮)・`adr/index.md`・`exception-escalation.md`(IMPL-0996)・`safety-verification.md`(IMPL-0931・F.6 の 284 行)・台帳 | test-exception-expiry・test-adapter | ADR-0243(仮) |

- gate-g5.yml は U4a(段のジョブの追加)と U4b(集約)の両方が触る。U4a→U4b の直列で足りる(intake-2 は U4b だけに置いていたが、段のジョブの本体は U4a で要る。U4a の段のジョブを集約へ入れるのは U4b)
- IMPL-1029 の R1 の判定は PR の本文と変更ファイルを要するため、段のジョブに PR の番号(と push の範囲)を渡す配線が U4a に増える。これが intake-2 の計画に無かった唯一の追加の配線である
- 順: U4a → U4b → U5 → U6(intake-2 §2.2 のとおり)。IMPL-1029 の裁定(重)が済むまで U4a は着手しない(段の必須の条件が IMPL-1029 で変わるため。U4a を案件の条件だけで先に降ろすと、同じ分岐を2度書き換える)

## 2. (b) IMPL-1029 の受付(審議の重さ)

### 2.1 判定: **重**

| 理由 | 中身 |
| --- | --- |
| 採用者への新しい義務 | 標準の規定(附属書H H.1「R1 は必須。当該範囲を変更するたびに実行」)は在るが(ADR-0224 決定13・81-ruling-light-H)、**準拠テンプレートの機械の止め方は新しい**。全採用者の R1 の PR で、段が空なら G-5 が新たに落ちる |
| ADR の原則の変更 | ADR-0151 決定1(必須の段は test・secretScan)の集合を、ADR-0224 に続いて再び広げる。ADR-0151 の採らない案「実装の開始後は空のコマンドを G-5 の失敗にする」(理由: 道具の無い言語・社内の閉じた道具の採用者を抜け道か例外の連続へ追い込む)と同じ型の判断を、全採用者の R1 について行う。ADR-0224 決定13 の「本 ADR が足すのは案件ごとの段だけ」も一部置き換える |
| 適合の主張の信頼 | 保証の主張 C4・H.3「R1 の変更では変異試験で検出力を測っていることも条件に加える」の裏付けになる。破られると、R1 の変更について「検出力を測っている」と主張する根拠が採用者から失われる |

### 2.2 先例(B21 の Q4・IMPL-0214)の扱いと、それに倣う進め方

- **B21 の Q4(IMPL-0763 ほか)**: 所有者が方向(A: 空なら失敗、新しい ADR)を答えた後、B21 は「回答は方向の決定であり、調査と会議体を経ていない。重の審議を省かない」として B22 へ切り出した(`ruling-deferred.md` §4)。B22 は調査(内部と外部を1担当)→ 5委員 → 議長の裁定 → ADR-0224 で、閾値の未設定の扱い(決定6)・7.3 の範囲(決定7)・集約の skipped(決定8)・機械で閉じる範囲(決定9)を決めた
- **IMPL-0214(Q3 X)**: 所有者は「重の審議を開く」とだけ答え、B22 の会議体は「既定の必須ステータスチェックにしない。必須にする手順は README に書く」と決めた(ADR-0223 決定5・6)。方向の答えが無いときは会議体が強制の強さまで決めた先例である
- **本件は Q4 の型**(方向は所有者が決めた。回答 43 は確定で覆さない)。会議体が審議するのは、方向の内側の設計と書き方だけ:
  1. R1 の変更だけに当たる構成(案件の条件に当たらない)で、閾値の未設定をどう扱うか(ADR-0224 決定6 は案件の条件に限って失敗にした)
  2. R1 を機械がどこから知るか(PR の本文の区分・区分の下限・push の経路)
  3. 道具の無い言語の「外部の記録を照らすコマンド」で、機械が閉じる条件と閉じない統制
  4. 既存の採用者の移行(アダプタの既定のコマンドを置くか・版の切り替え・CHANGELOG の所在)
  5. F.6 の 7.3 の名指しを R1 へ広げる書き方と、U6(ADR-0243)の台帳の行の約束との統合
- 採らない進め方: 回答 43 をもって軽として実装する(B21 §4 と同じ理由で採らない)。U4a と同じ担当で裁定まで済ませる(作り手と同じ死角。CLAUDE.md の段ごとに短命な担当)

### 2.3 外部の調査の有無と足りない点

既にあるもの:
- `research/b22-deliberation/10-research-B.md` §2: Google の差分の変異試験(SRC-TMP-B1)・Stryker の閾値の既定(B2)・閾値を合否にする批判(B3)・網羅率と検出力(B4 = SRC-0420・SRC-0023)・機能安全の規格の二次資料(B5・B6)・必須チェックの skipped の穴(B10・B11)
- 出典台帳: SRC-0021・0022・0023・0031・0420(LLM のテストと変異スコア・網羅率の相関)。282 調査の FND-0162(網羅率は検出力の代理として弱い)
- **B22 の SRC-TMP-B1〜B13 は出典台帳へ登録されていない**(sources/ に Google の論文も Stryker も無い。B22 の push の SRC は 0765〜0767 だけ)

足りない点(外部の調査を要する。本担当は Web を調べていない):
1. **PR ごとの増分の変異試験の所要時間**(小さいチーム・CI の分単位の費用)。研究B §5 が「実測は無い」と書いた。全採用者の R1 の PR に掛かるので、費用の実測か公開の事例が要る
2. **言語ごとの道具の有無と増分の対応**: PIT(Java)の incremental/history、mutmut(Python)、Stryker(JS/TS・C#・Scala)、Go(go-mutesting 等の保守状況)。研究B §5 が未確認とした。template の7つのアダプタ(node・python 3種・go)で既定のコマンドを置けるかの判断に要る
3. **外部で実行した記録を CI で照らす実務の先例**(変異試験の結果の取り込み。SonarQube・Stryker Dashboard 等の報告形式)。照らすコマンドの出力の約束を決める材料
4. 引くなら、SRC-TMP-B1(Petrović ほか 2021)・B2(Stryker)を出典台帳へ登録する(ADR に事実として引く場合)

外部の調査は「新しい義務を課す」ので要る(CLAUDE.md の重の段)。範囲は上の1〜3に絞る(B22 の調査を繰り返さない)。

## 3. (c) IMPL-1029 の現状

### 3.1 マークと条文

- マーク: `src/content/docs/phase4-process-design/assurance-case.md` 91 行。`target=g5-adapter state=undelivered check=manual plan=scheduled issue=445 review=2027-05`。note は「R1 は変更のたび、R2 は週次で合否条件にしない。F.4 の R1・R2 の欄は H.1 を指す。道具の無い言語と 7.3 の名指しは #445 に残る。降ろし方は template の束で決める」
- 条文: 同 84〜89 行の H.1 の表の「変異試験」の列。R1「必須。当該範囲を変更するたびに実行する」、R2「週次の定期実行。合否条件にしない」、R3「任意。実行しない場合も記録を要しない」、安全関連「附属書F F.6 による」
- 結び付く条文: H.3(332 行。R1 は変異試験で検出力を測っていることを検証に数える条件に加える)、C4 の証拠(240 行)、想定問答4(922 行)
- F.6(safety-verification.md 284 行): 「附属書H の R1 の変更ごとの変異試験には、7.3 の名指しを掛けていません。掛けるかは #445 で審議します」。286 行: 道具の無い言語の記録を照らすコマンドは、案件の条件の段について妨げない
- **本件の裁定は F.6 の 284 行の文を改めることになる**(回答 43 の「閾値割れは F.6 の 7.3 に揃え」)

### 3.2 adapter.mjs の段の必須の条件(現物)

- 段の空の扱いは、`ALWAYS_PHASES`(secretScan。対象なしを認めない)と、局所の `OPTIONAL`(lint・audit・licenses・coverage・install。空は注意で通す)の2つの集合だけで決まる。どちらにも無い段(現状は test)は空で無条件に失敗
- 段の必須を構成・記録・変更から判定する仕組みは無い(条件つきの必須は ADR-0224 で決めたが未実装)
- 対象なし(`targetState` が present でない)は、ALWAYS でない段を「実施しない」で通す。下の階層の目印は失敗(`nestedTargetProblem`)
- 環境変数で段へ渡すのは重大度・ライセンス・網羅率の閾値・直下・所在だけ。**PR の番号・基底のコミット・変更ファイルは渡していない**

### 3.3 R1 を機械がどう知るか(PR ごとに決定可能か)

- **決定可能**。材料は2つで、どちらも check-pr.mjs に既にある
  - PR の本文の「リスク区分」の節に残した区分: `riskClassOf(pr.body)`(2014 行)。pr-rules が「1つだけ残す」を強制し(2013〜2030 行)、R1・R2 は「確定した者」を求める(`riskConfirmerOf` 1221 行)
  - 区分の下限: `riskFloorOf(基底の構成の riskFloor.rules, 変更)`(981 行)。本文の区分が下限より低ければ pr-rules が失敗にする
  - R1 の判定は「本文の区分と下限の高いほう」が R1。PR の本文の編集は `edited` の契機で再実行される(gate-g5.yml 22 行)
- push の経路(`gate-g5-push.yml` が既定ブランチへの push で呼ぶ): PR が無い。PR を経ないコミットはトレーラ `Risk:` を持つ(出荷の集約が欠落として扱う)。push の範囲のコミットのトレーラは決定可能に読める
- 決定できないもの: 人が区分を低く確定したこと(下限の規則に当たらない R1 を R2 と書いた)。これは 3.8.1 の確定者と G-6 が受ける既存の統制で、本件で機械に閉じない
- 段のジョブ(adapter.mjs を呼ぶジョブ)は現状 PR の本文を読まない。読むには gh と PR 番号を段のジョブへ渡す(pr-rules のジョブが既に行う形)

### 3.4 「外部の記録を照らすコマンド」の既存の仕組み

- **無い**。template に、外部で実行した結果の記録を照らすスクリプトや出力の約束は無い(`外部で実行`・`記録を照らす` の語は scripts・.claude・adapters に無い。aggregate-evidence.mjs・generate-profile.mjs の該当は法人の外部の記録(登記)で別物)
- 近い先例は `license-scan-record.mjs`(段が実際に走ったかを、コマンドが空か・対象があるかの決定可能な条件で記録する。IMPL-0995)。照らす中身ではなく、実施の事実の記録の型
- 案件の段の出力の約束(閾値との比較・生き残りの一覧の所在。96-issue-comment-445 の項目2・3)も未実装。U4a で決める出力の約束を、外部の記録を照らすコマンドもそのまま満たす形にすれば、新しい仕組みは要らない

## 4. 方針の3問(IMPL-1029)

1. **結果と証跡**: 結果は「R1 の変更ごとに変異試験が走り、スコアと(閾値があれば)閾値との比較、生き残りの一覧の所在が残ること」。証跡は段のジョブの出力と結果。道具の設定・増分の絞り方・較正の手順は手引き(フェーズ5 の検出力検証・`kinds/settings.md`・アダプタの説明)へ回す
2. **例外承認で受けられないか**: 道具の無い言語は、新しい条項を足さず、所有者の回答どおり「外部の記録を照らすコマンド」(F.6 286 行の既存の許し)を R1 にも広げて受ける。閾値割れは 7.3(F.6 の名指しを広げる)。段が空のままの通過は 7.3 で受けない(ADR-0224 決定7 と揃える)
3. **破られたとき誰が何を失うか**: 保証の主張 C4・H.3 を読む者(出荷判定者・事業決裁者・採用者の顧客)が、R1 の変更の検出力の主張の根拠を失う。適合の主張の信頼に響くので、機械の止め方を細かく書くことは正当化される。ただし機械にするのは、段が空か・R1 か・閾値の型・出力の所在・ジョブの結果(決定可能)だけ
