# 反映の記録(Issue #290 検査装置の総量、論点 E-1〜E-13)

- 日付: 2026-10-23
- 正とした文書: `research/290-deliberation/decision.md`(E-1〜E-13、根拠水準のマークの表、反映の担当への指示)
- 迷ったときに引いた材料: `council-01-drafter.md`(文の案・置き場)、`council-03-qa-audit.md`(E-1・E-4・E-13 #3〜5 の実行の記録と記録の欄)、`council-05-defender.md`(E-4 の起点の範囲の読み方)、`council-04-standards.md`(E-10 の軸A の升の語)
- 様式の手本: `research/289-deliberation/implementation.md`
- git の操作はしていない。本体(`work/290`)も `template/`(`claude/process-compass-290`)も、編集しただけで commit していない

## 0. 次の担当へ引き継ぐこと

### 0.1 番号

この担当が使った番号は「2. 番号の割り当て」にある。**次に使える番号は、ADR-0075、EV-0129、IMPL-0148**。使う前に、既存の最大を自分で確かめること。

### 0.2 語の決まり(今回足したもの)

| 語 | 決まり | 所在 |
| --- | --- | --- |
| 検査装置 | 強制層の検査(CI の必須の検査、実行前フックと権限設定による遮断)と、それを動かす構成とスクリプト(検査のスクリプト、スタック別の検査の定義、ワークフロー、検査が読む規則データ)の総称 | 第1章 1.4 |
| 記名の済んだ縮小 | 「検査を外す変更の記録」の記名を済ませて検査を外したこと。是正の起動の起点「統制の弱化の検知」に当たらない。記名の無い縮小は当たる | 第4章 G-5「是正の起動」 |
| 陰性の確認の結果 | 止まった / 止まらなかった / 外した の3値。「外した」は4項目(外した検査・止めていた場面・外した後に止めるもの・受け入れた者) | 第4章 G-5「検査を外す変更の記録」、テンプレートの PR 様式 |
| escape clause | (a) 要求文の逃げ道の句(採用済み)、(b) 当てはまらない項目を外す規定(課さない)、(c) 基準の転用のパターン(採用者に課さず、起草手順に置く)。1 語で混ぜて使わない | ADR-0074 決定9 |

### 0.3 機械の決まり(今回足したもの)

| 決まり | 実装 | 試験 |
| --- | --- | --- |
| G-5 の判定基準を実装する検査が集約の合否に入っている | `template/scripts/gate/g5-aggregate.mjs`(新設。`aggregateFindings`)を `verify-gate-contract.mjs` の 6 の節が呼ぶ。基準1〜5・7 のジョブと `contract`・`pr-rules` が `gate-g5` の `needs` にあること、集約が `needs.*.result`(echo の行を除く)を合否に使うこと、ジョブの単位の `continue-on-error` が無いことを確かめ、欠ければ失敗。基準6 は注意 | `test-g5-aggregate.mjs`(新設、23 件)、`test-init-g5.mjs`(初期化済みの複製で `needs` から 5 ジョブを外し、契約検査が落ちることをタグごとに確かめる) |
| 保証の開示 項目4 の「実施」の出所 | `aggregate-evidence.mjs` の 4 の節。`machineCheckStatus` が、集約が合否に使うジョブの検査だけを「実施」とする。カバレッジとライセンスも同じ。集約の不備を項目4 の表に1行で出す(JSON は `machineChecks.aggregateProblems`) | `test-g5-aggregate.mjs`(項目4 の 6 件)。テンプレート自身で実行し、表に行が出ることを確かめた |
| 陰性の確認の結果「外した」 | `check-pr.mjs` の `negativeCheckOf`(欄の読み取り)と `removalProblems`(4 欄、AI の名義、構成に AI維持管理者の席の責任者があれば一致) | `test-check-pr.mjs`(場面 4 件と関数の確認 3 件) |
| 検査装置を統制の設定に含める | `check-pr.mjs` の `CONTROL_FILES` に `scripts/gate/**`・`scripts/vendor/**`・`adapters/**` | `test-check-pr.mjs`(場面 3 件。基底に `scripts/gate/spec-lint.mjs` と `scripts/vendor/tailoring-kb.json` を置いた) |
| 強制層を事業ステージで外さない | `generate-profile.mjs` の `guardEnabled` を常に `true` にした。外すのは構成の `guard` の上書き(期限 `reviewBy` と理由。契約検査 9 の節が期限を確かめる)だけ | `test-init-g5.mjs`(1名 = S0 と 3名 = S1 で、`guard.enabled` と deny の 4 行をタグごとに確かめる) |

## 1. 論点ごとの記録

### E-1 総量の上限(課さない)

- 運用メトリクス `metrics.md`「採用しない指標」に「検査装置の量」の行。本文の段落を「文書の量と検査装置の量に…置きません」へ広げ、害の3つと拾う先を書いた。前提(集合の可視化と外す記名)を ADR-0074 とともに書いた。EV-0126(E1)
- 第1章 `overview.md` 1.4 に「検査装置」の行
- 第4章 G-5 に「#### 判定基準を実装する検査と集約」(集約に含める、集約から外して基準を外さない、外せるのは第8章の調整だけ、集約の在ることで代えない)。IMPL-0142(gate-contract、delivered、machine)
- 附属書H H.6 項目4 の出所と読み方に「実施は集約が合否に使った検査から導く」「構成に書かれていることを実施と読まない」。IMPL-0147(evidence-aggregation、delivered、machine)
- テンプレート: `g5-aggregate.mjs`(新設)、`verify-gate-contract.mjs`、`aggregate-evidence.mjs`、`gate-g5.yml`(contract で `test-g5-aggregate.mjs` を実行)、`gates/G-5.md`
- フェーズ5 `ci-gates.md` の箇条に「総量に上限を置かない」を1行

### E-2 減らす席と非対称

- 第3章 3.11.2 承認権限に「(強制層の検査の削除・統合を含む)」
- 3.11.4 の表の要求事項3・4 の升に「(強制層の検査を含む)」「(強制層の検査の廃止の候補を含む)」。限定ではなく対象の明示なので、行の中に書いた(#226 の書式)
- 3.11.4 の本文: AI の名義の承認を受け付けない、要求事項3・4 が強制層の検査に及ぶ、承認は ADR-0038 決定3 と同じ席、追加の要否は技術判断者。棚卸しの入力に「強制層の検査の廃止の候補」の箇条(材料 = 装置を起点とする是正の記録と検査ごとの失敗の履歴)。IMPL-0145(evidence-aggregation、**undelivered**、manual)、EV-0127(E1)
- 3.11.5 に非対称を意図した設計とする段落(緩める向き = ADR-0055 決定5 と同じ非対称、Label Mailbox 原則4 の上申、G-5 の基準を実装する検査は第8章の調整だけ、ratchet と外す手続の軽減を課さない)。IMPL-0146(claude-md、delivered、presence)
- 3.11.8 RACI に2行(CI の検査の追加: 技術判断者 A、AI維持管理者 C、開発者 R。CI の検査の削除・統合: AI維持管理者 A、技術判断者 C、開発者 R)
- 附属書H H.3 の決定10 の箇条に、宛先(3.11.4 要求事項4 の棚卸し、AI維持管理者)
- 運用カタログ: 四半期の表に「強制層の検査の棚卸し」(AI維持管理者)。月次の CI ゲートの見直しに「外す・統合するは AI維持管理者の承認へ回す」
- 改善サイクル: 四半期の振り返りの参加者に AI維持管理者。手順7(棚卸しの結果を持ち込む。振り返りは決める場ではない)
- 第8章 軸B の外す判断の所在を 3.11.4 要求事項3 へ(E-13 #1 と同時)
- テンプレート: `CLAUDE.md` の受信箱の節の1行を、CI の検査を含む形へ広げた(`[機械]` の印は pr-rules と契約検査)

### E-3 追加の凍結(課さない)

- 第4章 G-5「是正の起動」に段落(凍結の手続を定めない、宣言なしに控えることは本標準に反しない、凍結中だけを項目3 の理由にしてはならない、Sev1・Sev2 は省けない)

### E-4 ADR-0073 との関係と、外す記録

- 第4章 G-5 に「#### 検査を外す変更の記録」(結果「外した」と4項目、受け入れるのは AI維持管理者、AI の名義を受け付けない、別の検査の場面だけで止まったと書いてはならない、基準を実装する検査はこの記録で外せない)。IMPL-0143(pr-checks、delivered、presence)
- 「統制の設定の陰性の確認」の括弧に「必須の検査には、検査装置を含む」。IMPL-0134 の注記に検査装置を足した(delivered のまま)
- 「是正の起動」に、装置の不具合を起点とする範囲(起点に当たる影響を生んだ場合。それ以外の誤検知は月次の見直し)と、記名の済んだ縮小は起点に当たらないことを書いた。ADR-0073 決定3 の読み方として ADR-0074 決定5 に記録
- プロセス内部監査 観点4 を「除外設定の追加と、必須の検査の削除」へ。機械で検出できるもの・できないものの表の行も改めた
- テンプレート: `check-pr.mjs`(`CONTROL_FILES`、`negativeCheckOf`、`removalProblems`、3b の節の文)、`.github/PULL_REQUEST_TEMPLATE.md`(結果の3値と4欄)、`gates/G-5.md`(検査の一覧と、落ちたときの手順6)

### E-5 装置修理の割合(課さない)

- `metrics.md`「採用しない指標」に行。EV-0126 の対象に「変更に占める割合」として含めた

### E-6 ルール化の進み・足す向きの本文

- `metrics.md` 統制の表から「ルール化の進み」の行を外し、「採用しない指標」に「人の指摘を CI の検査へ移した件数(旧「ルール化の進み」)」の行
- 第4章 G-5 の原則の文を、3つの条件を満たすものに限る文へ。足す・直す・外すで見直すこと、外す承認は AI維持管理者
- フェーズ5 `ci-gates.md`:「成長させます」を「足す・直す・外すで見直します」へ。図を差し替えた(下の「図」)。`rule-candidate` の文を外し、候補は月次の見直しで扱う、とした
- 改善サイクル 内側ループに「CI の検査を外す変更と緩める向きの変更は、担当ロールの裁量で行わない。AI維持管理者が承認する」

### E-7 指標の総数(先送り)

- 何も足していない。`metrics.md` の「現在の指標体系はこの範囲に収まります」は触れていない(再主張も削除もしていない)。#296 への申し送りは ADR-0074 の「検討した選択肢」の後の段落と 6 章

### E-8 1 PR ≈ 1 follow-up(課さない)

- `metrics.md`「採用しない指標」に「変更あたりの後続の Issue の件数、バックログの純増」の行。EV-0126 の対象に含めた

### E-9 escape clause の3つの意味

- ADR-0074 決定9 の表(3 行)と、#269 の突合の記述が ADR-0062 以前の状態であること

### E-10 (a) の残る隙間

- 第6章 テンプレ1 の注記を「類と検出語は第4章 G-2「曖昧語(基準2)」による」へ
- 第8章 軸A の升: 3〜9名「許容(機能責任者へ。第3章 3.6)」、10名以上「推奨(機能責任者へ)」。規則データ `rules-team-size.yaml` の同じ升の note も改め、`npm run template:kb` を流した。IMPL-0086 の注記と `adoption-guide.md` の引用の語も合わせた(IMPL-0086 は undelivered のまま)
- テンプレートの `spec-write` の完了条件に、類の判定(G-2 の判定者)を書いた
- `community/provision-forms.md` に「## 起草の規則(機械で検査しないもの)」と「### 逃げ道になる句を使わない」(機械検査を課さない理由を含む)
- `lifecycle.md` 2.10 は直していない(決定どおり)

### E-11 (c) を横断の要求にするか

- 第1章 `overview.md` に「### 1.7.5 組織が書く基準の読み替え」(列挙を求めない、歯止めは条項の中の禁止、一般的な濫用防止規定を置かない)。EV-0128(E1)
- 附属書B のチェックリストの後に、列挙を求めないことと、#269 の「Pre-PMF」の転用は軸B と ADR-0050 で塞がれていること
- `community/provision-forms.md` に「### 緩める理由への読み替えを問う」(会議体の突合で問う、条項の中に禁止で書く、H.11 を台帳として扱う、採用者には掛からない)

### E-12 (b)(課さない)

- 附属書B のチェックリストの後に「該当なし」の欄を置かない段落(外すのは第8章の規則と事実の記録、異常条件が見つからない機能は受入基準の側で G-2 の判定者が判定)

### E-13 範囲外の誤り

| # | 反映 |
| --- | --- |
| 1 | 第8章 軸B の2か所を 3.11.3 と 3.11.4 要求事項3 へ。ADR-0050 は書き換えず、ADR-0074 決定11 に正誤を記録した |
| 2 | ADR-0074 決定11 に、ADR-0013 にその文が無いことと、近い決定(決定2)と本文の所在(導入支援「導入を差し引きで提案する」)を記録した。原則として立てるかは別 Issue(6 章) |
| 3・4 | E-1 のとおり |
| 5 | テンプレート `generate-profile.mjs`。IMPL-0144(profile-generator、delivered、machine)を第8章 軸B「強制層に置くと決めた規則そのものを動かしません」の直後に置いた。PoC の段階で強制層を外すと書いていた文書(テンプレートの `AGENTS.md`・`boundaries.md`・`implement/SKILL.md`・`guard-write.mjs` の注記、本体の `template-repository.md` の強制層の節と規則の対応表の1行)を改めた |

### 図

フェーズ5 `ci-gates.md`「「人が毎回指摘すること」を CI へ移す運用」の図を差し替えた。見直しの起点 → [人] 技術判断者(月次の見直し。足す・直す) → 陰性の確認 → G-5 の集約、と、[AI] 候補の提示まで → 四半期の棚卸し → [人] AI維持管理者(外す・統合するを承認) → 検査を外す変更の記録 → G-5 の集約(基準を実装する検査は外せない)。節点は 8 個。見出しは、ほかのページの参照を壊さないため変えていない。

## 2. 番号の割り当て(この担当が使ったもの)

| 番号 | 所在 | 対象 |
| --- | --- | --- |
| ADR-0074 | `adr/0074-no-cap-on-inspection-apparatus.md` | E-1〜E-13 |
| EV-0126 | フェーズ6 運用メトリクス「採用しない指標」 | E-1(と E-5・E-8)装置の量・後続の起票の件数を指標にしない(E1) |
| EV-0127 | 第3章 3.11.4 棚卸しの入力の後 | E-2 削除・統合の承認を AI維持管理者に置く(E1) |
| EV-0128 | 第1章 1.7.5 | E-11 読み替えの列挙を採用者に課さない(E1) |
| IMPL-0142 | 第4章 G-5「判定基準を実装する検査と集約」 | gate-contract / delivered / machine |
| IMPL-0143 | 第4章 G-5「検査を外す変更の記録」 | pr-checks / delivered / presence |
| IMPL-0144 | 第8章 軸B「本軸が動かすもの、動かさないもの」 | profile-generator / delivered / machine |
| IMPL-0145 | 第3章 3.11.4 棚卸しの入力 | evidence-aggregation / **undelivered** / manual |
| IMPL-0146 | 第3章 3.11.5 | claude-md / delivered / presence |
| IMPL-0147 | 附属書H H.6 項目4 の表の後 | evidence-aggregation / delivered / machine |

`src/data/impl-targets.yaml` に足した降ろし先: `gate-contract`(`scripts/gate/g5-aggregate.mjs`)、`profile-generator`(`scripts/init/generate-profile.mjs`)。

## 3. 変更したファイル

本体:

- `src/content/docs/phase4-process-design/overview.md`(1.4、1.7.5)
- `src/content/docs/phase4-process-design/roles-responsibilities.md`(3.11.2、3.11.4、3.11.5、3.11.8)
- `src/content/docs/phase4-process-design/gate-criteria.md`(G-5 の原則、判定基準を実装する検査と集約、是正の起動、統制の設定の陰性の確認、検査を外す変更の記録)
- `src/content/docs/phase4-process-design/deliverable-templates.md`(テンプレ1 の注記)
- `src/content/docs/phase4-process-design/tailoring-guide.md`(軸A の升、軸B、IMPL-0086 の注記)
- `src/content/docs/phase4-process-design/ears-guide.md`(附属書B チェックリストの後)
- `src/content/docs/phase4-process-design/assurance-case.md`(H.3 の決定10 の箇条、H.6 項目4)
- `src/content/docs/phase4-process-design/adoption-guide.md`(IMPL-0086 の引用の語)
- `src/content/docs/phase5-implementation/ci-gates.md`(運用の節、図)
- `src/content/docs/phase5-implementation/template-repository.md`(強制層の節、規則の対応表の受信箱の行)
- `src/content/docs/phase6-operation/metrics.md`、`improvement-cycle.md`、`operations-catalog.md`、`process-audit.md`
- `src/content/docs/community/provision-forms.md`(起草の規則)
- `src/content/docs/adr/0074-no-cap-on-inspection-apparatus.md`(新設)
- `src/content/docs/community/evidence-ledger.md`・`implementation-ledger.md`(自動生成)
- `src/data/impl-targets.yaml`、`src/data/tailoring/rules-team-size.yaml`

テンプレート(`template/`):

- 新設: `scripts/gate/g5-aggregate.mjs`、`scripts/gate/test-g5-aggregate.mjs`
- 変更: `.claude/hooks/guard-write.mjs`(注記のみ)、`.claude/skills/gate/gates/G-5.md`、`.claude/skills/implement/SKILL.md`、`.claude/skills/pit/reference/boundaries.md`、`.claude/skills/spec-write/SKILL.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/workflows/gate-g5.yml`、`AGENTS.md`、`CLAUDE.md`、`scripts/gate/aggregate-evidence.mjs`、`scripts/gate/check-pr.mjs`、`scripts/gate/test-check-pr.mjs`、`scripts/gate/test-init-g5.mjs`、`scripts/gate/verify-gate-contract.mjs`、`scripts/init/generate-profile.mjs`、`scripts/vendor/tailoring-kb.json`(`npm run template:kb` の再生成)

ADR の状態の行は変えていない(ADR-0074 は置き換えではなく補う決定。ADR-0050・0073 の本文と状態はそのまま)。

## 4. 検査と試験の結果

| 検査・試験 | 結果 |
| --- | --- |
| `npm run check`(本体) | 下の「4.1」 |
| `test-check-pr.mjs` | 100 場面と付随の確認が一致(作業前 93) |
| `test-check-delegation.mjs` | 39 件一致(変わらず) |
| `test-recalibration.mjs` | 14 件一致(変わらず) |
| `test-roster-rules.mjs` | 69 件一致(変わらず) |
| `test-init-g5.mjs` | 94 件一致(作業前 80。強制層の 5 件 × 2 タグ、集約の 2 件 × 2 タグ) |
| `test-decisions.mjs` | 22 件一致(変わらず) |
| `test-g5-aggregate.mjs`(新設) | 23 件一致 |
| `check-decisions.mjs` | 不一致 0 件 |
| `aggregate-evidence.mjs`(テンプレート自身) | 項目4 に「集約 gate-g5 が合否に使う検査」の行が出て、不備 0 件と表示されることを確かめた。終了時の `::error::`(PR を経ていないコミット 81a8a2d のトレーラ欠落)は作業前からの既存の指摘で、本変更と無関係 |
| 台帳 | `evidence:write`(106 件)、`impl:write`(IMPL-0142〜0147 を追加)、`scope:write`(18 件、変化なし)、`check-gate-criteria --write`(8 ゲート 43 件、変化なし)、`template:kb` を実行した |

### 4.1 `npm run check`

- 1 回目: textlint の 14 件(本変更の文。助詞の重複・読点の数)で失敗。文を直した
- 2 回目: **通過**(終了コード 0)。末尾は「All internal links are valid.」「303 page(s) built」「Complete!」。`lint:provisions`(違反なし)、`lint:skills`(要求・禁止の文 40 件)、`test:template`(複製の一致)を含む
- 2 回目の後に `template/.claude/hooks/guard-write.mjs` の注記の1行だけを改めた(コードは変えていない)

## 5. 決定どおりにできなかった箇所、決定に明記が無く帰結として書いたもの

### 5.1 決定どおりにできなかった・降ろしていないもの

- IMPL-0145(棚卸しの入力の一覧): テンプレートに、検査ごとの失敗の履歴と装置を起点とする是正の記録を一覧に出す手段が無い。`undelivered` で表示した。決定は入力を定めたが、一覧の実装を指示していない
- 決定の「テンプレートで実装するもの」(E-1 の契約検査と項目4、E-4 の「外した」と CONTROL_FILES、E-13 #5)は、すべて実装して試験を足せた。`undelivered` にしたものは無い

### 5.2 決定に明記が無く、帰結として書いたもの

- **集約の確かめの範囲**: 決定は「集約の `needs` を確かめる」。`needs` にあっても効かない形(集約が `needs.*.result` を見ない、ジョブの単位の `continue-on-error`、`needs` にあるジョブの定義が無い)も、同じ「効いている検査の集合」の問題として不備にした。手順の単位の `continue-on-error` と、ジョブの `if` が常に偽になる形は確かめていない(`g5-aggregate.mjs` の冒頭に書いた)
- **集約に求めるジョブ**: 基準1〜5・7 のジョブに加え、`contract`(契約検査)と `pr-rules`(PR 単位の検査)を求めた。G-5 の規則(禁止事項6・陰性の確認・区分の下限)を実装するジョブで、外すと「外した」の記録そのものが効かなくなるため。基準6 はテンプレートの CI にジョブが無く(作業前から `gates/G-5.md` が開示)、注意として出すだけにした。基準8 は合否を判定しないので求めない
- **項目4 の読む時点**: 集約の定義は、出荷の時点のワークフローから読む。過去の PR の時点の定義は読まない(IMPL-0147 の注記に書いた)
- **「外した」のときの欄**: 4 項目だけを求め、「通した違反の場面」「確かめた者」は求めない。受け入れた者と AI維持管理者の席の照合は、構成に席の責任者がある場合だけ行う(無い構成では AI の名義でないことだけを確かめる)
- **RACI の R**: 決定は A だけを定めた。追加・削除とも、変更を作る者として開発者を R、相手の席を C とした
- **E-3 の置き場**: 決定は置き場を定めていない。凍結が是正の記録へ転用される経路を塞ぐ文なので、G-5「是正の起動」に置いた
- **E-1・E-5・E-8 の根拠水準**: 決定の表は E-1 の EV だけを挙げる。E-5・E-8 も同じ水準(E1)の判断で、マークの無い「課さない」を残すと根拠水準を開示しない記述になるため、EV-0126 の対象に含めた
- **E-11 の 1.7 の置き場**: 新しい節 1.7.5 を立てた。一般的な濫用防止規定を採らないことも同じ節に書いた(「課さないと決めた」を読み手が区別できるようにするため)
- **E-10 の升の語**: 3〜9名を「許容(機能責任者へ。第3章 3.6)」、10名以上を「推奨(機能責任者へ)」とした(規格の委員の案)。中身(3.6 の委譲の許容)は変えていない
- **E-13 #5 の上書きの経路**: 構成の `guard.enabled: false`(期限と理由。契約検査 9 の節が期限を確かめる)による一時緩和は残した。事業ステージによる自動の無効化だけを外した。上書きの経路を外すかは決定の範囲の外
- **検査装置の変更の負担**: `CONTROL_FILES` に `scripts/gate/**`・`scripts/vendor/**` を加えたため、テンプレートの更新の取り込み(知識ベースの再生成を含む)の PR にも陰性の確認の記録が要る。決定どおりで、ADR-0074 の影響に負担として書いた
- **図の置き場**: 決定 E-6 が改めると定めた `ci-gates.md` の図を差し替えて、指示の「1 つの図」とした

### 5.3 決定が前提にした事実との違い

- E-13 #2 の「ADR-0016・0019 ほか」: 「判定の総数」を引く ADR は 0016(原則の語のみ)・0019・0021・0024 が ADR-0013 を名指しし、0041・0051 は名指しせずに「判定の総数」を使う。記録は ADR-0074 決定11 に「ほか」として書いた

## 6. 別 Issue へ送るもの

- **#296 へ**: 「ルール化の進み」を指標の表から外した(正式指標の候補が1行減った)。バックログの純増を完了の流れの対の指標とする案(規格の委員)。`metrics.md` の「現在の指標体系はこの範囲に収まります」は直していない
- **「判定の総数を増やさない」原則**(E-13 #2): 本標準の設計の原則として立てるか。立てるなら置き場と ADR、立てないなら ADR-0016・0019・0021・0024 の前提の扱い
- **`ci-gates.md` 冒頭の引用の誤り**: 「参照モデルの原則「合意済みルールはすべて機械化して CI に載せ、人の目を通さない」」は、統合プロセスの原則1「機械化できる検査はすべて CI へ」の限定を落として写している。G-5 と同じ型の誤りだが、決定は G-5 だけを名指ししたため触れていない
- **`label-mailbox.md` 4.3 の「第3章 3.9 の決裁マトリクス」**: 決裁権限マトリクスは 3.8 である。E-13 #1 と同じ型の誤参照
- **節番号の参照の検査**: `npm run lint:refs` は節番号の実在だけを見て、指す先の見出しとの対応を見ない(3.9 は実在するので通った)
- **Label Mailbox 4.2 原則4 の「検証ゲートの削除」の範囲**: ルール化で足したリントの規則の削除まで事業決裁者の決裁に掛かるか(起草の委員の問い2。会議体で決着していない)
- **Label Mailbox の `needs-platform` の往路と復路の語の不一致**(起草・擁護の委員が指摘。決定に無い)
- **棚卸しの入力の一覧の実装**(IMPL-0145): CI の実行の記録から検査ごとの失敗の履歴を出す手段
- **集約の確かめの残り**: 手順の単位の `continue-on-error`、ジョブの `if` が常に偽になる書き換え、過去の PR の時点のワークフローの定義
- **G-5 基準6 のジョブ**: テンプレートの CI に文脈ファイルの形式検査が無い(作業前から開示)。契約検査は注意を出すだけ

## 7. 突合の指摘への対応

突合(`crosscheck.md`)の指摘と、議長の裁定(`decision.md`「突合の後の裁定」)を反映した。commit はしていない。

### 7.1 要修正(X-1〜X-5)

| 指摘 | 対応 | 変えたファイル |
| --- | --- | --- |
| X-1 「緩める」の承認者 | 改善サイクルの内側ループの文を「CI の検査を外す・統合する変更」に限った。統制を緩める向きのその他の変更(基準値の引き下げ・除外設定の追加・区分の下限の規則の削除・委任の範囲の拡大)は、既存の規定(G-5「基準値と除外設定の変更」、ADR-0055 決定5、3.8.1)を引く。ADR-0074 決定7 の同じ文も揃えた | `phase6-operation/improvement-cycle.md`、`adr/0073-…md`(決定7) |
| X-2 追加の席 | 強制層への組み込みの承認は、追加・削除・統合のいずれも AI維持管理者とした。追加の要否は技術判断者が決める。RACI は「CI の検査の追加の要否」(A = 技術判断者)と「強制層の検査の追加・削除・統合」(A = AI維持管理者)に書き分けた。3.11.2 の承認権限、3.11.4 の本文、1.4 の「検査装置」の定義、G-5 の原則、ci-gates の箇条と図(AI維持管理者の節点を「強制層への組み込みを承認(追加・削除・統合)」に改め、足す・直すも通す)、Label Mailbox の `needs-platform`(往路に「追加」を足し、4.1 の箇条に追加の席を書いた)、ADR-0074 決定3(裁定で E-2 を改めた旨を記録)、テンプレートの CLAUDE.md を揃えた | `roles-responsibilities.md`、`overview.md`、`gate-criteria.md`、`ci-gates.md`、`label-mailbox.md`、`adr/0073-…md`、`template/CLAUDE.md` |
| X-3 ADR-0073 決定3 との関係 | ADR-0074 決定5 を一部置き換えとして扱った。ADR-0074 の状態の行に、置き換える決定(ADR-0073 の決定3 の範囲と、決定2 の起点「統制の弱化の検知」の範囲)を書いた。ADR-0073 の状態の行を「一部置き換え(→ ADR-0074 の決定5)」へ改めた(状態の行だけ。本文は書き換えていない)。決定5 の見出しと本文を「読む」から「限る(一部置き換え)」へ改め、誤検知が起点に当たる例を置いた。G-5「是正の起動」の文を、限定が一読で分かる形(「3つの起点に当たる影響を生んだ場合に限り」)にし、誤検知が起点に当たる例を置いた | `adr/0072-…md`(状態の行)、`adr/0073-…md`、`gate-criteria.md` |
| X-4 「すべて機械化」の残り | ci-gates の冒頭と integrated-process A.4 の 1 を、G-5「是正の起動」の3つの条件の限定つきへ改めた。廃した言い回しの登録簿への追加は任意とされたため、足していない | `ci-gates.md`、`integrated-process.md` |
| X-5 附属書B の判定者 | 段落を「G-2 の判定者は基準1 の確認で、異常系の基準か、異常条件が見つからない事実の記載のいずれかがあることを確かめる。記載の当否は判定しない」へ改め、G-2 と ADR-0051 決定2 を引いた | `ears-guide.md` |

X-3 では、ADR-0074 決定5 の前半(記名の済んだ縮小は起点に当たらない)も ADR-0073 決定2 の範囲を狭めるという突合の指摘に従い、両側の状態の行に決定2 も書いた。裁定の文は決定3 だけを名指ししているが、突合の指摘の本文が決定2 にも触れているため、同じ一部置き換えに含めた。議長の確認を要する。

### 7.2 推奨(Y-1〜Y-7)

| 指摘 | 対応 |
| --- | --- |
| Y-1 「強制層の検査」の範囲 | 直した。3.11.4 の括弧を「強制層の検査とそれを動かす構成(第1章 1.4『検査装置』)」として 1.4 を引く形にした。RACI の行名は裁定(X-2)の語に揃えた。テンプレートの CLAUDE.md に `scripts/vendor/**` を足した |
| Y-2 「検査装置」と「検査の装置」 | 直した。本文と運用の文書(3.11.4、ci-gates、運用カタログ、運用メトリクス、G-5 の是正の起動、IMPL-0145 の注記)を「検査装置」へ揃えた。1.4 の定義に「ADR-0073 の『検査の装置』と同じもの」を添えた。ADR の本文は書き換えていない |
| Y-3 統制の設定の列挙 | 直した。G-5 の陰性の確認と 1.4「設計の有効性」の列挙を「閾値・除外設定・必須の検査・ルールセット・フック・権限と、それらを動かす検査装置」に揃えた。1.4「運用の有効性」の行は列挙を持たず「統制の設定」を引くだけなので、変えていない |
| Y-4 H.11 を台帳として扱うこと | 直した。H.11 の表の前に、本表が読み替えの台帳を兼ねること、起草の手順は「起草の規則」によること、載らない読み替えが EV-0128 の見直しの条件に当たることを書いた |
| Y-5 「第8章の調整だけ」 | 直した。G-5「判定基準を実装する検査と集約」に、現行の第8章は G-5 の基準を個別に外す規則を持たないこと、「対象なし」は検査を外すことではないことを添えた。IMPL-0142 の注記に「基準ごとの調整の宣言は読まない」を足した |
| Y-6 G-7 項目4 の出所 | 直した。G-7「保証の開示」項目4 の出所を「G-5 の証跡(『実施』は、集約が合否に使った検査に限る)」へ改めた |
| Y-7 要求事項1・2 の及ぶ範囲 | 直した。3.11.4 に「要求事項1 と要求事項2 は及ばない。検査の追加は件数を条件にせず、第4章 G-5 による」を足した |

### 7.3 記録のみ(R-1〜R-10)

対応していない。R-8(「外した」の PR に別の統制の変更を混ぜた場合)と R-9(`tailoring-kb.json` の `source.commit`)は運用上の注意で、R-9 は本体を commit した後に議長が `npm run template:kb` を流し直すと揃う。R-10 は記録どおり。

### 7.4 別 Issue へ送るものの更新

- 6 の「Label Mailbox の `needs-platform` の往路と復路の語の不一致」は、X-2 で往路に「追加」を足したため、語の上の不一致は減った。往路の「削減・自動生成」と復路の「修正・追加」が同じ範囲を指すかは、引き続き未決である

### 7.5 再実行の結果

- 台帳の再生成: `evidence:write`・`impl:write`・`scope:write`・`check-gate-criteria.mjs --write`・`template:kb`
- `npm run check`: 1 回目は textlint 1 件(ci-gates の助詞「か」の重複)。直して 2 回目で通過(exit 0、303 ページ)
- テンプレート: test-check-pr 100 場面、test-check-delegation 39、test-recalibration 14、test-roster-rules 69、test-init-g5 94、test-decisions 22、test-g5-aggregate 23、すべて一致。check-decisions の不一致 0 件
