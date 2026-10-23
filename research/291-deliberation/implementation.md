# 反映の記録(Issue #291 254 系: G-4 の数え上げ、仕様の前提、AI の指摘、往復。論点 G-1〜G-15)

- 日付: 2026-10-23
- 正とした文書: `research/291-deliberation/decision.md`(G-1〜G-15、6 章の暫定マークの表)
- 迷ったときに引いた材料: `council-01-drafter.md`(文の案・置き場)、`council-03-qa-audit.md`(G-3 の ci-gates の矛盾、G-9 の検出の数え方、G-13 の禁止の 1 文)、`council-04-standards.md`(#258 の受入条件の記録の書き方)、`survey-291-4-ai-roundtrip.md`(H.4 の合議の行の初出)
- 様式の手本: `research/290-deliberation/implementation.md`、`src/content/docs/adr/0074-*.md`

## 0. 次の担当へ引き継ぐこと

### 0.1 番号

この担当が使った番号は「2. 番号の割り当て」にある。**次に使える番号は、ADR-0076、EV-0134、IMPL-0156**。使う前に、既存の最大を自分で確かめること。

### 0.2 語の決まり(今回足したもの)

| 語 | 決まり | 所在 |
| --- | --- | --- |
| 前提 | 確かめないまま成り立つとみなして置き、崩れると成果物に影響する言明。機能仕様の前提の欄に書かれたものは、すべて確かめていないものとして読む。ゲートの「前提条件」とは別の語 | 第1章 1.4 |
| コンテキスト基盤 | 定義の「前提情報」を「文脈の情報」へ改めた(語「前提」を定義したため) | 第1章 1.4 |
| 指摘の内容(H.4 条件5) | 所在(どこか)と根拠(照らした基準と、見た事実)。6 番目の条件ではなく条件5 の語の定義 | 附属書H H.4「指摘の内容(条件5)」 |

### 0.3 機械の決まり(今回足したもの)

| 決まり | 実装 | 試験 |
| --- | --- | --- |
| G-4 基準6 の一覧(どのタスクにも現れない受入基準) | `template/scripts/gate/verification-trace.mjs` の `criterionNumbers`・`readPlanMappings`・`unmappedCriteria`(`readAcceptanceCriteria` を再利用)。`spec-lint.mjs --gate G-4 specs/F-NNN` が一覧を出す(合否に使わない)。`next.mjs` の `withG4Material` が G-4 の判定待ちの詳細に添える | `test-plan-trace.mjs`(新設、27 件)、`test-init-g5.mjs`(様式の計画で一覧が空、受入基準を足すと一覧に出る。× 2 タグ) |
| G-2 基準6・G-4 基準7(未確定事項) | `verification-trace.mjs` の `countClarifications`・`readClarifications`(コードブロック・HTML コメント・インラインコードの中を数えない)。`spec-lint.mjs --gate G-2|G-4` が 1 件でも残れば失敗する。`next.mjs` の `clarificationStep` が、印の残る機能を G-2・G-4 の判定待ちへ進めず「未確定事項が残る」を出す | `test-plan-trace.mjs`、`test-init-g5.mjs`(様式のままの仕様で `--gate G-2` が落ちる。× 2 タグ) |
| `--gate` を付けない spec-lint(G-5 の CI)は変えていない | 未確定事項で CI を落とさない。G-2 前の機能が他の PR の G-5 を落とすのを避けるため | `test-plan-trace.mjs`(付けない実行は通る) |

`test-plan-trace.mjs` は `gate-g5.yml` の `contract` ジョブで実行する(`test-g5-aggregate.mjs` の後)。

## 1. 論点ごとの記録

### G-1・G-2 G-4 基準6(受入基準 → タスク)

- 第4章 `gate-criteria.md` G-4 の表に基準6。確認方法は裁定の文のまま(機械が一覧、判定者が判定、対応の有無だけ、内容と束ね方は判定しない)
- 新設「#### 受入基準とタスクの対応(基準6)」: 置く理由(基準2 は粒度で差し戻す項目が無い、S0 で G-7 を省略)、除外の印と理由の欄を置かない理由(テストを書く・当てる作業はタスクに属する。ADR-0044 決定4 と同じ論法)、数え上げは整合を保証しない、束ね方は基準2・4、機械は合否を出さない(基準5 に倣う。ただし推定を含まない)、識別子の一意性。EV-0129(E1)
- IMPL-0151(`task-breakdown-skill`、delivered、machine)、IMPL-0152(`gate-skill`、delivered、manual)
- `integrated.yaml` の `human-approve` の記述に「各受入基準がいずれかのタスクに対応していること」「未確定事項が残っていないこと」を足した(手で書く部分)。`criteria` は `check-gate-criteria.mjs --write` で再生成(46 件)
- テンプレート: `verification-trace.mjs`、`spec-lint.mjs`(`--gate`)、`next.mjs`、`.claude/skills/task-breakdown/SKILL.md`(手順と完了の条件)、`.claude/skills/gate/gates/G-4.md`、`.claude/skills/artifact/artifacts/07-implementation-plan.md`、`templates/07-implementation-plan.md`(逆向きの確認の段落)

### G-3 識別子・G-7 基準1・ci-gates

- 第6章 テンプレ1 の受入基準の節に、識別子の注記(機能の中で一意、実装計画とテストは同じ識別子で引く、記法は組織が定める)。テンプレートの `01-feature-spec.md` にも同じ段落
- 第4章 G-7「基準1・2 の記録」の表から「実装計画のタスクと受入基準の対応」を外し、箇条に「計画の対応は取り込まない。3 つの数は計画を読まない。計画の対応は G-4 基準6」を足した
- フェーズ5 `ci-gates.md` の「取り込んでいないもの」から、テストの計画数・消化数と未解決の欠陥の件数を外し、取り込んでいる旨と「判定基準との対応」の G-7 基準1・2 を引いた
- G-2 基準1 の数え上げを表へ移すかは別 Issue(6 章)

### G-4 前提の観測区分(課さない)

- 第4章 G-2 に「#### 前提の欄(基準3)」: 確かめるのは ID の有無まで、内容は判定しない、**前提の欄に書かれたものはすべて確かめていないものとして読む**、確かめた事実は本文、前提の欄の外の推測は G-2 の判定で扱う、**区別を課さない**(列・標識・確かめた事実の欄を置かない)と理由 3 つ、テンプレ10 の監視の欄も課さない(非対称は意図)。EV-0130(E1)
- フェーズ5 `context-base.md` の標識の却下の後に「この却下は前提の欄の区別にも及ぶ(破れ方2)」の 1 段落と ADR-0075 決定3 の参照
- ADR-0075 決定3 に、context-base の却下の出所の ADR が辿れないこと、前提の欄にも及ぶことと理由、起草の委員の反論と退けた理由を記録した

### G-5 未確定事項・G-2 基準3・様式の食い違い

- G-2 の表に基準6、G-4 の表に基準7「未確定事項が残っていない」。確認方法は裁定の文(印を機械が数える、1 件でも残れば判定を開始しない)。判定基準の列から `[NEEDS CLARIFICATION]` の括弧書きを確認方法の列へ移した(下の 5.2)
- G-2 基準3 の確認方法に「前提の各行に案件層の ID があること(対応の有無だけ。前提の内容が正しいかは本基準で判定しない)」
- 新設「#### 未確定事項(基準6)」: 閉じ方 3 つ、責任者と期限を付けた持ち越しの禁止(ADR-0036 決定3)、残すなら 7.3、様式の注記にしか無かった経緯、G-4 にも置く理由、機械は件数まで。EV-0131(E1)
- IMPL-0148(`spec-lint`、delivered、machine)、IMPL-0149(`gate-skill`、delivered、presence)、IMPL-0150(`feature-spec-template`、delivered、presence)
- 第6章 テンプレ1 の「前提・依存」を「前提 / 案件層の ID / 崩れたときの影響」の表へ。注記に「すべて確かめていないものとして読む」。未確定事項の注記を「G-2 基準6・G-4 基準7 により判定までに閉じる。閉じ方は 3 つ」へ
- `template-fields.yaml` の `t1` に 4 欄(`## 前提・依存`、表の見出し行、「すべて確かめていないものとして読む」、識別子の注記)
- `integrated.yaml` の `resolve-ambiguity` の記述(「判断者と期限を付けて仕様に記録する」)を、3 つの閉じ方と「判断者と期限を付けて残したまま要件合意を通さない」へ改めた。裁定と食い違う手で書く記述だったため
- テンプレート: `templates/01-feature-spec.md`(前提の表に ID の列、確かめた事実を書かない注記、未確定事項の閉じ方。例の前提を「確かめた事実」の形から「確かめていない言明」の形へ替えた)、`.claude/skills/spec-write/SKILL.md`(手順 6 を新設、完了の条件 2 行)、`.claude/skills/gate/gates/G-2.md`、`.claude/skills/artifact/artifacts/01-feature-spec.md`

### G-6 語「前提」

- 第1章 1.4 に「前提」の行(裁定の文 + 機能仕様の前提の欄の読み方 + 前提条件との区別)。「コンテキスト基盤」の定義を「文脈の情報」へ

### G-7 根拠水準マーク(課さない)+ 観点7

- 第1章に「### 1.7.6 根拠水準のマークの範囲」(本標準の記述に付ける、採用者の文書に課さない、理由、附属書I 要件⑥ は残る、組織の値の見直しは能力依存の定数の登録簿)
- プロセス内部監査 観点7 を「組織が書いた根拠の水準の記録(附属書I 要件⑥ の記録と、組織が自ら付けた水準の記録)」へ。表の後に、マークを付けていない組織では要件⑥ の記録だけが対象、本標準のマークの見直しは監査の対象にしない、の段落
- `community/evidence-marking.md` の冒頭に「本規約は本標準の記述に掛かる。採用者の文書には課さない(1.7.6)」の 1 文

### G-8 AI の指摘の中身

- 附属書H `assurance-case.md` H.4 に「### 指摘の内容(条件5)」: 所在と根拠の表、6 番目の条件でないこと、実行の結果の記録の所在、**記録の所在の無い実行の結果を実行で確かめたと記録してはならない**、**実行・観測値・代替案を求めない**、所在を求める理由(5.6.2)、代替案を求めない理由(SRC-0002 の経路は機械 → 機械。同論文の「知っていることだけを報告」。監査の指針は処方的な助言を戒める)、実行と観測を求めない理由(捏造を誘う)
- 条件5 の「確かめる中身」の升に「指摘の内容(所在と根拠)」を足した
- EV-0132(E1。G-8・G-9 を 1 つのマークで扱う。裁定 6 章の表も 1 行)
- IMPL-0154(`claude-md`、delivered、presence)、IMPL-0155(`ai-review-workflow`、**undelivered**、manual)
- テンプレート: `CLAUDE.md`(判断の確定と委任の節に所在と根拠・実行の記録の所在の 1 行)、`.github/workflows/ai-review.yml`(差し込み口の注記)

### G-9 「懸念がある」型

- H.4「#### 所在か根拠を欠く指摘」: レビュアが「不採用(所在・根拠なし)」と記録してよい、機械は欠落を示すだけで消さない、欠陥注入の検出は所在が注入箇所を指す指摘に限る、**提出時の不成立は課さない**(5.7.4 要求事項1 と同じ構造、手掛かりを捨てる、先例が無い)、区分の格下げもしない
- 第5章 5.6.2「AIによるレビュー層も対象とする」に、検出に数える指摘は H.4 による、の 1 文(規定は H.4 の 1 か所に置いた)

### G-10 3.10 との関係

- 第3章 3.10.1 の箇条に「AI の担い手の出力は本節の意見に当たらない。AI の指摘は H.4。指名されたレビュアが AI を使って書いた意見は本節に従う」と、理由の段落(記名の指名、全ての意見への応答を閉じる条件、H.4 条件4 との矛盾、意見と指摘の性格の違い)
- H.4 に「#### 意見と指摘」(3.10.1 を引く)

### G-11 出力形式(課さない)

- H.4「#### 指摘の書式」: **書式を定めない**、定めるのは値、組織が構造を定めることは妨げない、**構造を満たしたことを内容の根拠にしてはならない**、散文と構造化の差 0〜2 ポイント

### G-12 往復(課さない + 入力の分離)

- H.4「#### AI どうしの往復」: **禁止しない**、収束は数えない、往復の中で作成側の反論・説明を渡した確認は条件2 を満たさない、往復の中の指摘も条件5 の中身を持つ、上限を新設しない(E.7 と計算資源の停止条件)、禁止しない理由、合意で止める構成も規制しない理由。EV-0133(E2)
- H.4 の条件2 の「確かめる中身」の升に「往復の中で作成側の反論・説明を検証側へ渡していないこと」
- H.4 の「数えてはなりません」の列挙の後に、合議・多数決の行の根拠が ADR-0075 決定11 にあることを 1 文。IMPL-0153(`claude-md`、delivered、presence)
- ADR-0075 決定11 に、合議・多数決の行の初出(`cb41fcb`、2026-10-01、#284・#285)、出所(`research/phase4-standard/284-council-01-drafter.md` の「数えてはならない条件」、L240)、根拠(FND-0078・0077。自己修正は FND-0086)、#258 の受入条件3・4 が数える側の規定として満たされていたこと(2026-10-23 確認)
- テンプレート: `CLAUDE.md`(往復してよい、作成側の反論・説明を渡さない、収束・合議・多数決・外部の観測の無い自己修正を数えない)

### G-13 系統の異質性(課さない + 禁止 1 文)

- 第3章 3.5.4 帰結4 の理由を 3 つへ(誤りの系統横断の相関を足し、航空・機能安全の独立は責任の分離、1986 年の実験)。**求めない・禁止しない**、混ぜた構成も H.4 の条件と測定を受ける、**系統の違いを確認の強さの根拠として書いてはならない**(「独立」を使わない主張を含む)、「推奨しない」を書かない理由
- テンプレート: `CLAUDE.md`(系統の違いを確認の強さの根拠として書かない)。IMPL-0154 の注記に含めた

### G-14 降ろし先

- `src/data/impl-targets.yaml` に `task-breakdown-skill`・`feature-spec-template`・`ai-review-workflow` を足した(既存の `template-file` の書式。`check` は付けない。既存の同種の登録に倣った)
- KB(`integrated.yaml`)は `check-gate-criteria.mjs --write` と `npm run template:kb` で降ろした。KB 自体は impl-targets の降ろし先ではないため、実装マークは付けていない(判定基準の表は ADR-0048 の機構で降りる)
- 課さないと明記する文(G-4・G-7・G-9 の提出時不成立・G-11・G-12・G-13 の求めない・禁止しない)には実装マークを付けていない(#222)

### G-15 範囲の外

本 Issue で直す 6 件はすべて直した(ADR-0075 決定13 の表 #1〜#6)。別 Issue の 4 件と記録のみの 1 件は 6 章。

## 2. 番号の割り当て(この担当が使ったもの)

| 番号 | 所在 | 対象 |
| --- | --- | --- |
| ADR-0075 | `adr/0075-acceptance-criteria-coverage-premises-and-ai-findings.md` | G-1〜G-15 |
| EV-0129 | 第4章 G-4「受入基準とタスクの対応(基準6)」 | G-1・G-2(E1) |
| EV-0130 | 第4章 G-2「前提の欄(基準3)」 | G-4(E1) |
| EV-0131 | 第4章 G-2「未確定事項(基準6)」 | G-5(E1) |
| EV-0132 | 附属書H H.4「所在か根拠を欠く指摘」 | G-8・G-9(E1) |
| EV-0133 | 附属書H H.4「AI どうしの往復」 | G-12(E2) |
| IMPL-0148 | 第4章 G-2「未確定事項(基準6)」 | spec-lint / delivered / machine |
| IMPL-0149 | 同上 | gate-skill / delivered / presence |
| IMPL-0150 | 同上 | feature-spec-template / delivered / presence |
| IMPL-0151 | 第4章 G-4「受入基準とタスクの対応(基準6)」 | task-breakdown-skill / delivered / machine |
| IMPL-0152 | 同上 | gate-skill / delivered / manual |
| IMPL-0153 | 附属書H H.4 の「数えてはなりません」の列挙の後 | claude-md / delivered / presence |
| IMPL-0154 | 附属書H H.4「AI どうしの往復」の後 | claude-md / delivered / presence |
| IMPL-0155 | 同上 | ai-review-workflow / **undelivered** / manual |

## 3. 変更したファイル

本体:

- `src/content/docs/phase4-process-design/gate-criteria.md`(G-2 の表・基準3 の確認方法・前提の欄・未確定事項、G-4 の表・受入基準とタスクの対応、G-7 基準1 の記録)
- `src/content/docs/phase4-process-design/overview.md`(1.4 の「前提」と「コンテキスト基盤」、1.7.6)
- `src/content/docs/phase4-process-design/roles-responsibilities.md`(3.5.4 帰結4 の理由、3.10.1)
- `src/content/docs/phase4-process-design/assurance-case.md`(H.4)
- `src/content/docs/phase4-process-design/human-ai-boundary.md`(5.6.2)
- `src/content/docs/phase4-process-design/deliverable-templates.md`(テンプレ1)
- `src/content/docs/phase5-implementation/ci-gates.md`、`context-base.md`
- `src/content/docs/phase6-operation/process-audit.md`(観点7)
- `src/content/docs/community/evidence-marking.md`
- `src/content/docs/adr/0075-acceptance-criteria-coverage-premises-and-ai-findings.md`(新設)
- 自動生成: `community/evidence-ledger.md`・`implementation-ledger.md`、`src/data/processes/integrated.yaml` の `criteria`
- `src/data/impl-targets.yaml`、`src/data/template-fields.yaml`、`src/data/scope-exempt.yaml`(下の 5.2)、`src/data/processes/integrated.yaml`(手で書く記述 2 か所)

テンプレート(`template/`):

- 新設: `scripts/gate/test-plan-trace.mjs`
- 変更: `scripts/gate/verification-trace.mjs`、`scripts/gate/spec-lint.mjs`、`scripts/gate/next.mjs`、`scripts/gate/test-init-g5.mjs`、`.github/workflows/gate-g5.yml`、`.github/workflows/ai-review.yml`、`CLAUDE.md`、`templates/01-feature-spec.md`、`templates/07-implementation-plan.md`、`.claude/skills/task-breakdown/SKILL.md`、`.claude/skills/spec-write/SKILL.md`、`.claude/skills/gate/gates/G-2.md`・`G-4.md`、`.claude/skills/artifact/artifacts/01-feature-spec.md`・`07-implementation-plan.md`、`scripts/vendor/tailoring-kb.json`(`npm run template:kb` の再生成)

**ADR の状態の行は変えていない**。ADR-0075 は置き換えではなく補う決定。ADR-0036(決定3・4)、ADR-0051(決定2)、ADR-0054(決定7)、ADR-0056(決定4)、ADR-0018(決定4・8)、ADR-0026 と突き合わせ、いずれも延長で矛盾しないと判断した。突合の結果を ADR-0075「既存の決定との関係」の表に書いた。特に:

- ADR-0051 決定2 の「判定の総数を増やしません」は、G-2 基準1 の確認方法への追加の置き方についての文で、G-2 に別の対象の行(基準6)を足すことを禁じていない
- ADR-0056 決定4 の 5 条件は、文も組も変えていない(条件5 の語の定義と、条件2 の確かめる中身の明記だけ)
- ADR-0026 は採用者の文書にマークを課すと決めていない

## 4. 検査と試験の結果

| 検査・試験 | 結果 |
| --- | --- |
| `npm run check`(本体) | 下の 4.1 |
| `test-plan-trace.mjs`(新設) | 27 件一致 |
| `test-init-g5.mjs` | 100 件一致(作業前 94。未確定事項・一覧の 3 件 × 2 タグ) |
| `test-check-pr.mjs` | 100 場面一致(変わらず) |
| `test-check-delegation.mjs` | 39 件一致(変わらず) |
| `test-recalibration.mjs` | 14 件一致(変わらず) |
| `test-roster-rules.mjs` | 69 件一致(変わらず) |
| `test-decisions.mjs` | 22 件一致(変わらず) |
| `test-g5-aggregate.mjs` | 23 件一致(変わらず) |
| `check-decisions.mjs` | 不一致 0 件 |
| `check-process-rules.mjs` | 常駐の規則の節 16 節が揃う |
| 台帳 | `evidence:write`(111 件)、`impl:write`(IMPL-0148〜0155 を追加)、`scope:write`(18 件、変化なし)、`check-gate-criteria.mjs --write`(8 ゲート 46 件)、`template:kb` |

### 4.1 `npm run check`

- 1 回目: textlint 11 件(助詞の重複・冗長な表現)。文を直した
- 2 回目: textlint 1 件(「確かめずに」の「に」)。直した
- 3 回目: 根拠水準の台帳が古い(文を直した後に再生成していなかった)。台帳を再生成した
- 4 回目: **通過**(終了コード 0)。末尾は「All internal links are valid.」「304 page(s) built」「Complete!」。ログは `/tmp/claude-0/-home-claude-process-compass/e43836ec-c999-5cc7-926b-e9d20f117969/scratchpad/check291.log`
- 4 回目の後に `template/templates/07-implementation-plan.md` に段落を 1 つ足し、本記録を書いた。commit の前に `npm run check` をもう一度通した(5 章の末尾)

## 5. 決定どおりにできなかった箇所、決定に明記が無く帰結として書いたもの

### 5.1 決定どおりにできなかった・降ろしていないもの

- IMPL-0155(AI レビューの出力): 裁定どおり差し込み口の注記までで、`undelivered` で表示した
- それ以外に裁定から外れたものは無い

### 5.2 決定に明記が無く、帰結として書いたもの

- **判定基準の列の文**: 裁定は G-2 基準6・G-4 基準7 の判定基準を「未確定事項(`[NEEDS CLARIFICATION]`)が残っていない」としていた。この文を KB(`integrated.yaml` の YAML のフロー列)へ降ろすと、角括弧がフロー列の区切りとして読まれ、YAML として壊れる(`check-gate-criteria.mjs --write` の生成物が読めなくなることを実行して確かめた)。判定基準の列を「未確定事項が残っていない」とし、印の書き方を確認方法の列「機能仕様の未確定事項の印(`[NEEDS CLARIFICATION]`)を機械が数える」へ移した。規範の中身は変えていない。生成器の引用の扱いは直していない(6 章)
- **一覧と判定の開始の機械の置き場**: 裁定は G-2 基準6・G-4 基準7 の降ろし先を `spec-lint` とした。G-5 の CI の `spec-lint`(引数なし)に未確定事項を足すと、G-2 前の機能の印が他の PR の G-5 を落とすため、`--gate G-2|G-4` を付けたときだけ数えて失敗させる形にした。G-5 の CI の合否は変えていない。G-4 基準6 の一覧も同じ `--gate G-4` から出し、関数は `verification-trace.mjs` に置いた(`readAcceptanceCriteria` を再利用)
- **next.mjs**: 裁定は降ろし先に `next-role` を挙げていないが、「判定を開始しない」を機械で効かせるため、未確定事項の残る機能を判定待ちへ進めない段階と、G-4 の判定待ちへの一覧の添付を足した。IMPL-0148・0151 の注記に書いた(降ろし先は `spec-lint`・`task-breakdown-skill` のまま)
- **範囲の書き方**: 実装計画の対応の升に「1〜3」と書いた場合、両端も含めて対応に数えない(一覧に出て判定者が見る)。推定を入れない側に倒した
- **同じ機能の識別子**: `F-002/AC-1` のように別の機能を指す対応は、この機能の受入基準に数えない
- **適用範囲の検査の除外**: 「未確定事項(基準6)」と「受入基準とタスクの対応(基準6)」の地の文の「S0 では」は、基準を置く理由の説明で適用範囲ではない。`scope-exempt.yaml` へ理由つきで登録した
- **ADR-0018 の決定の番号**: 裁定は「ADR-0018 決定5・8」と書いていたが、テンプレ10 が前提を観測された事象で監視することは決定4(劣化を観測された事象で定義する)である(決定5 は尺度の無い 5 件に条件を定めないこと)。ADR-0075 では「決定4・8」と引いた
- **H.4 の合議の行の自己修正の根拠**: 裁定は合議・多数決の根拠の所在(L240)だけを挙げた。同じ意見書の L115 が自己修正について FND-0086 を挙げているため、ADR-0075 決定11 に併記した
- **`integrated.yaml` の手で書く記述**: `resolve-ambiguity` の「判断者と期限を付けて仕様に記録する」は裁定 G-5(持ち越しを置かない)と食い違うため改めた。`human-approve` に基準6・7 の確認を足した
- **G-10 の置き場**: 裁定は 3.10.1 に足すとした。H.4 にも「#### 意見と指摘」を置き、3.10.1 を引く形にした(規定は 3.10.1 の 1 か所)
- **G-9 の 5.6.2 の側**: 検出の数え方の規定は H.4 に置き、5.6.2 からは引くだけにした(同じ事項の規定は 1 か所)
- **テンプレートの例の前提**: 様式の例「招待テーブルに `expires_at` がある」は確かめられる事実の形だったため、「招待の有効期限は、運用中に変えない」へ替えた。確かめた事実を前提の欄に書かない規定と、例が逆になるため

### 5.3 決定が前提にした事実との違い

- 無し(ci-gates の矛盾の行番号は L326 付近で、裁定のとおりだった)

## 6. 送る先(別 Issue)

- **S0 の「統合(G-4 へ)」の中身**: どの G-2 基準を G-4 で判定するかが定義されていない(規則データ `r-b-poc` の注記「要件合意は省略し、仕様承認に統合する」と G-4 本文の食い違いを含む)。**G-2 基準1 の価値 → 受入基準の数え上げを表の行へ移すか**と一緒に決める(ADR-0051 決定2 を変える話)
- **#292 へ**: 3.10.4 の機械検査(`lint-comments.mjs`)が準拠テンプレートに無く、`pre-review-automation.md` に実装マークが 1 つも無い。あわせて、3.10.1 で AI の出力を意見に数えないとしたため、同頁の `pre-review-closed` が AI の出力を意見の集計から外す必要がある
- **委任の変更の作成側の「実行したコマンドと観測した結果」**: 自己申告で、機械は記載の有無(`authorVerificationPresent`)だけを見る。G-8 の作成側の対
- **「判定の総数」原則を ADR-0051 が引いていること**: #290 から既に送る予定の件(ADR-0074 決定11 #2)に合流
- **第6章 テンプレ7 の前文**: 「機能仕様承認(G-4)の判定基準『タスク分解の粒度が検証可能(1タスク=1レビュー単位)』を突合できる様式です」は、G-4 基準2 を表と違う文で引き、基準6・7 にも触れない。テンプレ7 の自己点検にも受入基準 → タスクの行が無い。裁定の「本 Issue で直す」に含まれていないため触れていない(起草の委員の F-15 #4)
- **`check-gate-criteria.mjs` の書き戻し**: 判定基準の文に角括弧などの YAML のフロー指示子を含むと、生成物が壊れる(書き戻しの正規表現も最初の `]` までしか置き換えない)。引用するか、検査で落とすかを決める
- **記録のみ**: 254 系のメモ(`254-council-01-drafter.md` ほか)はリポジトリの履歴に無い。ADR-0075 はそれらに乗っていない
