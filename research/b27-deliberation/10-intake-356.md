# 束 B27 — #356 の受付と調査・裁定の案(2026-11-20)

担当: 受付と調査・裁定の案。実装はしていない。作業ツリー `E:/Github/orca/workspace/process-compass/b27`(本体 921b36b0、template 31e783a)。

## 0. 範囲の確認

- `npm run impl:issues -- --issue 356` の出力は3件(IMPL-1011・0191・1003)。3件とも `state=undelivered check=manual plan=scheduled issue=356`
- `src/content/docs` を `issue=356` で検索した。マークは上の3件だけ。ほかの一致は ADR-0139 §4 の見出し(過去の6規定の表。その後 ADR-0161 で adopter 化済み)で、マークではない
- 「計4」と聞いていた件は、検索では見つからなかった。IMPL-1012 は B11 で adopter(ADR-0161)、IMPL-0169・0190・0195・0627・0666 は adopter(decision=ADR-0161)で、どれも issue=356 を持たない
- 所有者の回答(`E:/Github/process-compass/research/sweep-2026-11-12-triage.md` §4)に #356 を名指す項目は無い。29(Q1 = N。7.9.5 の枠)は IMPL-0630 で、1011 と同じ単位17 だが #445 の項目

## 1. マークごとの現状

### 1.1 IMPL-1011(exception-escalation.md:859、target=evidence-aggregation、review=2027-03)

- **条文の要旨**(7.9.6「記録する事項」): 発動の記録は識別子・範囲・根拠の測定結果の所在・記録した者。**7.9.1 の2(意図的な違反)による発動だけ**対象の人を加える。対象の人は 5.6.3 の措置との照合のためだけに記録し、制限は範囲に掛ける。7.9.1 の1(見逃しの反復)の記録に見逃した者を含めない(7.9.1 本文: 見逃しは範囲ごとに数え、見逃した者ごとには数えない)
- **既存の裁定**: ADR-0161 決定5(ADR-0127 決定5 の person 必須を一部置き換え)。束 B21 の案 `research/b21-deliberation/ruling-deferred-draft.md` §3.1「IMPL-1011」を議長が採った(`ruling-deferred.md` §2)。条件は「`restriction.cause`(`"7.9.1-1"` / `"7.9.1-2"`)を必須、1 なら person を書けない、2 なら必須、集約の出力から人を外す、person の定義の文を改める、旧い記録は注意に出して範囲の照合は続ける」。採らない案は「person の有無から種別を推す(2 の記録の欠けを検出できない)」
- **降りていない理由**: 単位17 は `config.mjs`・`aggregate-evidence.mjs` を触るため、B20〜B25 の直列の後に回された(`b23-handover.md`)。実装は未着手
- **実行で確かめたこと**(`template/scripts/gate/config.mjs` を node で直接読んだ。探針は scratchpad の `probe-1011.mjs`)
  - person の無い発動の記録 → `restriction.person(検出能力の低下を検知された者)を…書きます` で拒否される。**7.9.1 の1 の正しい記録が入口で書けない**(標準と逆)
  - `cause` 欄 → `書けない欄があります(cause)` で拒否。種別を記録する手段が無い
  - `restrictionState` の active は person を保持し、`aggregate-evidence.mjs:2232` が変更の行に「対象 <person>」を出す。`aggregate-evidence.mjs:4248` で evidence.json の `independence.restrictions.active[]` にも person がそのまま載る(マークの note は出力の行だけを名指すが、証跡の JSON も同じ害を持つ)
  - 入口の文 `.claude/skills/process-change/kinds/notice.md` 40・44 行も person を必須と書く
  - `node scripts/gate/test-roster-conditions.mjs` は現状 61 件一致(110〜127・227〜246 行の fixture が person 必須を固定している。B21 §6.3 の指摘のとおり)

### 1.2 IMPL-0191(human-ai-boundary.md:921、target=pr-checks、review=2027-03)

- **条文の要旨**(5.6.2 第2層): 注入したコミットに履歴に残る標識を付け、標識を含むコミットの本番のブランチへの取り込みを、取り込みの前に拒否する。標識が見つける者の面に出て秘匿が崩れても、拒否を外したり出荷の前の確かめに代えたりしてはならない(流出の防止を秘匿より先に取る)
- **既存の裁定**: ADR-0161(第2層を「取り込みの前または出荷の前」へ緩める案を採らない)。`ruling-deferred-draft.md` §3.4「IMPL-0191」(議長が採った): 保護ブランチ宛の PR の全コミットの本文に `seeded-error-scan.mjs` の `MARKER` の行があれば失敗。定数は import。演習用ブランチ宛は対象外。直接の push を禁じていない構成は強制層の欠落として表示。例外承認で受けない
- **降りていない理由**: 単位20。`check-pr.mjs` を触るため直列の後
- **実行で確かめたこと**
  - `check-pr.mjs` に `Seeded-Error`・`hasMarker`・`seeded-error-scan` の参照は0件。取り込みの前の拒否は無い
  - scratchpad の一時リポジトリ(main と drill、drill のコミットの本文に `Seeded-Error: SE-1 …`)で `seeded-error-scan.mjs --from main --to drill` を流した。`scanRun true / residual 1 / markerCommits 1`、終了コード 1。**PR の範囲(基底..先頭)にそのまま使える**ことを確かめた。`hasMarker` と `MARKER` は export 済み、モジュールは isMain の守りがあり import できる
  - `gate-g5-base.yml` は `fetch-depth: 0` で PR の先頭を `refs/remotes/pr/head` に取得し、`check-pr.mjs --base origin/${BASE_REF} --policy-base origin/${DEFAULT_BRANCH} --head refs/remotes/pr/head` を呼ぶ。`analyzePr` は `mergeBase` と `HEADREF` を既に持つので、`git log --format=%B mergeBase..HEADREF` で全コミットの本文を読める。workflow の変更は要らない
  - PR のコミットを読むので、squash の取り込みで標識が消える経路(EV-0291)より**前**に止まる。出荷の走査の弱点を補う向き
  - 直接の push: `.github/rulesets/` の `team`・`regulated`・`safety` は `pull_request` の規則を持つ。`checks-only` は `required_status_checks` だけで `pull_request` を持たない。演習用ブランチ宛の PR では本検査を走らせないため、演習のコミットが他の必須の検査に通った状態を得て、既定ブランチへ直接 push される経路が `checks-only` では残る。構成 `ruleset` の名が指す JSON に `pull_request` の規則があるかは決定可能(値の存在)
  - `test-check-pr.mjs` の fixture に `Seeded-Error:` を本文に持つコミットは無い(B21 §6.3 の確認事項。既存の試験は倒れない見込み)。`test-check-pr.mjs` は gate-g5.yml 101 行で既に結線済み

### 1.3 IMPL-1003(overview.md:720、target=evidence-aggregation、review=2027-05)

- **条文の要旨**(1.10.2 の列挙に無い離脱の表、709 行): 欠陥注入の時期と箇所の秘匿の不成立(1〜2名の体制で注入する者と見つける者を分けられない)。述べられる名はこれを数えない。構造の判断であり、`blind: false` は1回の測定、理由は自由な文のため機械の検査にしない
- **既存の裁定**: ADR-0147(注記で開示する形。決定4)。`ruling-deferred-draft.md` §3.1「IMPL-1003・1004」(議長が採った): 構成書と保証の開示の、述べられる名の節の後に1行。`state=delivered check=manual`、確かめる者は出荷判定者。採らない案: `blind: false` から機械で数える
- **降りていない理由**: 単位18(集約)。直列の後
- **実行で確かめたこと**
  - 構成書の側は**既に降りている**: `template/scripts/init/generate-profile.mjs:3703` の注記が「欠陥注入の時期と箇所の秘匿が成り立たないこと…は、数えません。…数えない項目は人が確かめます」と出す(dcc5c4a、#354 で入った)。ただしこの注記は述べられる名が「適用の表明」でないときだけ出る(3698 行の条件)
  - template を scratchpad へ clone し、CODEOWNERS の雛形を埋めて `generate-profile.mjs --answers <size-3-9> --stack node --dry-run` を流した。終了 0、述べられる名は「適用の表明」で、**注記は出なかった**(条件どおり)。初期化の時点では、構成書から読み手は注記を見ない
  - 保証の開示(`aggregate-evidence.mjs` 6727〜6735 行)には、IMPL-1004 の「数えない認証情報の共有」の行はあるが、**秘匿の不成立の行は無い**。出荷判定者が読む面に開示が無い
  - 双子の IMPL-1004 は、表示の行があるまま ADR-0225 決定8 で `plan=adopter` になった。理由は、確かめる証跡(個別の認証の記録)がテンプレートの外にあり、内部監査の観点に入れるかも採用者が決めるため

## 2. 審議の重さ

**軽**。理由:

- 3件とも条文は既にあり(5.6.2 第2層、7.9.6、1.10.2 の表)、降ろし方の裁定も既にある(ADR-0161・ADR-0147、B21 の議長の裁定)。本件は準拠テンプレートの実装を条文に揃える回帰・食い違いの解消である
- 採用者への新しい義務は無い。0191 で PR が止まるのは第2層の既存の要求の実装。1011 で記録の形に `cause` が増えるが、7.9.6 が既に区別を求める記録の項目を決定可能にするだけである(B21 §2.2 の「条文が記録すると名指す値」の線)
- ADR の原則の変更・安全・法令に当たらない。0191 は取り消せない混入に関わるが、出荷の時点は IMPL-0047 が既に止めており、本件はその前の層を足す向き(厳しくする向き)
- 外部の調査は行わない(新しい義務でなく、規格の引用も要らない)

委員は起案と反対の2委員とする。反対の委員に特に当ててほしい点は §3 の各「採らない案」と §3.4 の論点。

## 3. 裁定の案

### 3.1 IMPL-1011 — 降ろす(機械の検査)

- **方針の3つの問い**
  - (1) 条文は結果(1 の記録に人を持たせない、2 の記録に人を持たせる、出力に人を出さない)と証跡(記録の欄)まで。手順は notice.md(手引き)
  - (2) 例外承認で受ける場面ではない。標準と逆を求めている実装の直しである
  - (3) 破られたとき失うのは、見逃した個人。個人が記録・表示され、5.6.2 の個人単位の集計の禁止に反し、測定が懲罰と同一視されて注入の事前察知と申し送りを招く(7.9.1 本文)。測定そのものの信頼に響くので、決定可能な範囲は機械で閉じる
- **降ろし方**(B21 §3.1 の条件のまま。差分だけ書く)
  - `config.mjs` `restrictionInputProblems`: 発動の `allowed` に `cause` を足し、`"7.9.1-1"` か `"7.9.1-2"` を必須にする。1 で person があれば問題、2 で person が無いか名簿に無ければ問題。person の文の定義を「7.9.1 の2 の区分(意図的な違反)の対象の人。5.6.3 の措置との照合のためだけに記録する」へ改める
  - `config.mjs` `restrictionState`: active・released に person を持ち回らない(記録の側には残る。照らすのは範囲だけで、人を使う処理は無い)。旧い記録(cause が無い)は数を `legacyCause` として返し、範囲の照合は続ける
  - `aggregate-evidence.mjs` 2232 行: 「。対象 <person>」を外す。4248 行の evidence.json にも person を載せない(active を上の形にすれば自然に外れる)。6394 行の表示に、cause の無い旧い記録の件数を「根拠の種別が無い。対象の人を表示しない」として出す
  - `.claude/skills/process-change/kinds/notice.md` 40・44 行: cause を書き分け、1 の例には person を書かない形にする
  - 試験 `test-roster-conditions.mjs`: ng(cause 1・person あり)、ng(cause 2・person なし)、ng(cause なし)、ok(cause 1・person なし)、ok(cause 2・person あり)。入口の試験(227〜246 行)の R を cause 付きに改める。集約の出力に person の文字列が出ないことを1件(evidence.json と開示の両方)
  - 旧い記録は止めない(既存の構成を割らない)。ただし新しい発動は cause を要する
- **マーク**: `state=delivered check=machine test=template/scripts/gate/test-roster-conditions.mjs`。note から「計画の Issue の担当者」を外す
- **採らない案**
  - person の有無から種別を推す: 7.9.1 の2 の記録で person が欠けたことを検出できない(B21 の採らない案を保つ)
  - 旧い記録で person を持つものを失敗にする: 既存の構成を割り、記録の書き換え(changeLog の改変)を誘う。表示にとどめる
  - 2名の計数を人で数える: IMPL-0118 のとおり範囲で数える
  - 7.9.1 の2 の person を集約の出力に出す: 7.9.6 は「照合のためだけに記録」とし、出力の目的が無い

### 3.2 IMPL-0191 — 降ろす(機械の検査)と、直接の push の欠けの表示

- **方針の3つの問い**
  - (1) 結果(標識を含むコミットを保護ブランチへ取り込まない)まで。標識の書き方・演習のブランチの運用は手引き(フェーズ5 seeded-error-safety)
  - (2) 第7章の例外承認で受けない。PR の時点では、標識を本文に誤って含む(説明のための)コミットは、取り込みの前に PR のブランチの側で文を直せる。本番の履歴に入った後(出荷の走査)と違い、直す手段がある。出荷の走査が例外承認を受けるのと食い違わない(直す手段の有無で分かれる)
  - (3) 失うのは、利用者と案件。注入した欠陥が本番のブランチに入ると、`non_fast_forward` の下で履歴から消せない(取り消せない)。細かく書いてよい領域
- **降ろし方**
  - `check-pr.mjs` `analyzePr`: 基底が保護ブランチのとき、`git log --format=%H%x00%B%x1e mergeBase..HEADREF` を読み、`seeded-error-scan.mjs` の `hasMarker` で判定して、当たったコミットの短い SHA を挙げて errors に積む。定数は import(1か所。標識の形が変わるときは seeded-error-scan.mjs だけを直す)。コミットの本文は出力しない(標識の識別子を見つける者の面に広げない)
  - 保護ブランチの判定(決定可能): PR の基底が `--policy-base` の既定ブランチと同じか、構成 `ruleset` が指す `.github/rulesets/<名>.json` の `conditions.ref_name.include` に当たる(`~DEFAULT_BRANCH` を既定ブランチに解く)。どちらにも当たらない基底(演習用ブランチ)は対象外
  - 直接の push の欠けの表示: 構成 `ruleset` が無いか、指す JSON に `type: pull_request` の規則が無いとき、「保護ブランチへの直接の push をルールセットで禁じていない。取り込みの前の拒否(第5章 5.6.2 第2層)は PR の経路だけで働き、直接の push の経路は欠ける。出荷の時点は走査が止める(IMPL-0047)」を出す。置き場は `preflight.mjs`(告げる項目。止めない)と、保証の開示(`aggregate-evidence.mjs` の 6735 行の近く。止めない)。`checks-only` が当たる
  - 試験 `test-check-pr.mjs`: ng(保護ブランチ宛、本文に `Seeded-Error:` の行)、ng(行頭に空白)、ok(標識の無いコミット)、ok(演習用ブランチ宛)、ok(本文の行の途中に語があるだけ。`MARKER_LINE` は行頭の形だけを当てる)。preflight の表示は `test-preflight` 相当の既存の試験に ok/ng を1対(ファイル名は実装の段で確かめる)
- **マーク**: `state=delivered check=machine test=template/scripts/gate/test-check-pr.mjs note="… 直接の push は PR の検査に乗らない(ルールセットに pull_request の規則が無い構成では欠ける。事前点検と保証の開示が表示する)。出荷の時点は IMPL-0047"`
- **採らない案**
  - 演習用ブランチ宛の PR も止める: 見つける者のレビューの面に検査の失敗として標識の存在が出る。流出の経路でない取り込み先で秘匿を崩す理由が無い
  - 直接の push の欠けを失敗にする: 1名の体制では `pull_request` の規則を置けない構成がありうる(checks-only を置いた理由)。止めると構成の選択肢を奪う。表示で開示し、出荷の走査が後ろを受ける
  - PR の題・本文(PR の説明)も走査する: 条文の標識はコミットに付ける(履歴に残る形)。PR の説明は履歴に残らない。対象を広げると説明に語を書いただけの PR が止まる
  - トレーラの解析だけで判定する: squash で組み替わると0件になる(B8 の採らない案と同じ)
  - 例外承認で通す経路を check-pr に置く: §3.2 (2) のとおり、直す手段がある段階で例外を置く理由が無い

### 3.3 IMPL-1003 — 降ろす(手引きに近い表示。check=manual)

- **方針の3つの問い**
  - (1) 結果(述べられる名がこれを数えないことを、読み手が見る面に出す)まで。秘匿が成り立つかの判断は人
  - (2) 1〜2名の体制で注入する者と見つける者を分けられない構成は、第7章で受ける対象ではない。1.10.2 の列挙に無い離脱であり、帰結は「適用の表明まで」と条文が既に定める
  - (3) 失うのは、適合の主張の信頼。数えない離脱を、数えたものと読み違えて適合を主張する。機械では閉じない(構造の判断)ので、開示の面を確実にする
- **降ろし方**
  - `aggregate-evidence.mjs` 6735 行の IMPL-1004 の行の隣に、常に1行出す: 「述べられる名が数えない欠陥注入の秘匿の不成立(第1章 1.10.2。IMPL-1003。人が確かめる): 注入する者と見つける者を分けられない体制では、測定の記録の blind の値によらず、適合の主張を述べられない。機械は数えない(ADR-0147)」
  - 構成書の注記(generate-profile.mjs:3703)は既にある。変えない。初期化の時点で出ないのは、名が「適用の表明」のときに数えない項目を挙げる必要が無いためで、条件は正しい
  - 文の定数を1か所に置くかは実装の段で決める(B21 の案は「両方が読む定数」。構成書の文は他の項目と1文に連なっているため、無理に共有しない)
  - 試験 `test-aggregate-records.mjs`: 開示に行があることの1件(文字列の存在。合否の試験ではない)
- **マーク**: `state=delivered check=manual note="… 確かめる者: 適合の主張を述べる者(出荷判定者。保証の開示を読むとき)"`
- **採らない案**
  - `blind: false` から機械で数える: 1回の測定の値で、構造の判断の代わりにならない(ADR-0147 の採らない案)
  - 双子の IMPL-1004 に倣って `plan=adopter` にする: 1004 は確かめる証跡(個別の認証の記録)がテンプレートの外にあることが理由だった(ADR-0225 決定8)。1003 の確かめる対象は体制の構造で、出荷判定者が保証の開示と D-0 の体制図を読んで判断でき、テンプレートが表示まで担える。adopter にすると、テンプレートが表示を出していることが台帳から読めない
  - 構成書の注記を「適用の表明」のときも出す: 名が既に「適用の表明」なら、数えない項目は名を変えない。出すと読み手に余計な警告を読ませる
  - 様式(D-0)に「注入する者と見つける者」の欄を足す: 第6章の様式に無い欄で、義務を作る(ADR-0040)

### 3.4 反対の委員に当ててほしい論点

1. 1011 の `cause` は、細かい定義を増やす向きか。7.9.6 の「7.9.1 の2 による発動では」を決定可能にする最小の値と見ている
2. 0191 の保護ブランチの判定に ruleset の include を使うのは、宣言(リポジトリの JSON)と実機の適用の食い違いを見ない。実機の ruleset を API で読む案との比較
3. 0191 の「例外承認で受けない」は、説明のために語を書いたコミットを含む PR を、文の直し(PR のブランチの書き換え)へ導く。第2層の「標識の失われる履歴の書き換えをしない」は注入したコミットに掛かり、説明のコミットには掛からないと読んでいる。この読みの当否
4. 1003 を manual で delivered にするのは、1004 の adopter と並んで、台帳の読み手に不揃いに見えないか

## 4. 触る予定のファイル

### 本体(process-compass)

- `src/content/docs/phase4-process-design/exception-escalation.md`(859 行のマーク)
- `src/content/docs/phase4-process-design/human-ai-boundary.md`(921 行のマーク)
- `src/content/docs/phase4-process-design/overview.md`(720 行のマーク)
- `src/content/docs/community/implementation-ledger.md`(`npm run impl:write` で再生成。手で編集しない)
- `research/b27-deliberation/`(審議・実装・突合の記録)
- 新しい ADR は要らない見込み(ADR-0161・ADR-0147 と B21 の裁定の範囲)。2委員の結論で要るとなれば `src/content/docs/adr/` に1件

### template(pit-in-template)

- `scripts/gate/config.mjs`(1011。**B26 と重なる**)
- `scripts/gate/aggregate-evidence.mjs`(1011・1003・0191 の開示の行。**B26 と重なる**)
- `scripts/gate/check-pr.mjs`(0191。**B26 と重なる**)
- `scripts/gate/preflight.mjs`(0191 の表示。B26 と重ならない)
- `scripts/gate/seeded-error-scan.mjs`(読むだけの予定。import のため export の追加が要れば触る。B26 と重ならない)
- `.claude/skills/process-change/kinds/notice.md`(1011。B26 と重ならない)
- `scripts/gate/test-roster-conditions.mjs`(1011)
- `scripts/gate/test-check-pr.mjs`(0191)
- `scripts/gate/test-aggregate-records.mjs`(1003・1011 の出力)
- preflight の試験(0191。既存の試験のファイル名は実装の段で確かめる。例: `scripts/gate/test-preflight.mjs` か `test-env-check.mjs`)

B26 の一覧のうち触らないもの: `autonomy.mjs`・`org-assurance.mjs`・`recalibration.mjs`・`verify-gate-contract.mjs`・`check-process-rules.mjs`・`generate-profile.mjs`・`gate-g5.yml`。試験は gate-g5.yml に既に結線済み(101・111・131 行)で、gate-g5.yml を触らない。

**重なりは3ファイル(config.mjs・aggregate-evidence.mjs・check-pr.mjs)**。所有者の回答 20(重ならないように分ければ2つまで並行)により、本件の template の実装は B26 の push の後に直列で行う必要がある。本文のマークの直しと ledger の再生成は、template の実装と同じ push に載せる(マークを delivered にするのは template が入ってから)。

## 5. 所有者への問い

なし。3件とも既存の裁定(ADR-0161・ADR-0147・B21 の議長の裁定)の範囲で、方針の3つの問いでも新しい義務・原則の変更に当たらない。§3.4 の論点は2委員と議長の裁定で閉じる。B26 との直列の順は指揮役が決める事項。
