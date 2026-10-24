# 実装の記録(Issue #314 実装マークの検査の手段と降りていない規定)

- 日付: 2026-10-24。実装者(Claude。議長の裁定 `decision.md` の 0〜6 節を正本として実装した)
- 親リポジトリのブランチ: `work/314`(push していない)。準拠テンプレートのブランチ: `claude/process-compass-314`
- ADR: [ADR-0084](../../src/content/docs/adr/0084-check-strength-plans-and-resident-rules.md)。ADR-0061・ADR-0064・ADR-0068 は、ステータスの節に補いの指し示しだけを足した(本文は変えていない)
- 使った番号: ADR-0084、EV-0163〜0165、IMPL-0312。出典台帳のカードは足していない(EV の出典の所在は `survey-314-2-external.md` を指す)

## 1. 裁定ごとの変更

### R-1 検査の強さ

| 変更 | 所在 |
| --- | --- |
| 未分類 100 件を分類した(内訳は 3 節)。`machine` の 54 件を確かめ直し、試験の対が無い 8 件を `manual`、欄・行の有無までの 2 件を `presence` へ下げた。`presence` 47 件のうち、ファイルの実在までしか確かめていない 15 件を `manual` へ下げ、試験の対がある 1 件(IMPL-0203)を `machine` へ上げた | 標準本文とフェーズ5・6 の各頁の実装マーク |
| `check` を欠くマーク、不正な値、`test` の無い `machine`、`machine` 以外の `test`、単位の無い `presence` を落とす | `scripts/lib/impl-inventory.mjs`(`markAttrProblems`)、`scripts/check-impl.mjs` |
| `machine` の試験の3要件(実在、`IMPL-NNNN:ng` と `IMPL-NNNN:ok` の目印、必須の集約からの実行)を確かめる。テンプレートの試験は `g5-aggregate.mjs` の読み方で集約が合否に使うジョブを求め、親の試験は `package.json` の `check` から `npm run` を辿る | 同上(`machineTestProblems`・`templateTestWired`・`parentTestWired`) |
| 試験の目印を 56 件の `machine` の試験へ入れた(テンプレート 15 ファイル。うち新規 2。親 1 ファイル) | `template/scripts/gate/test-*.mjs`、`scripts/test-tailoring-engine.mjs`(IMPL-0109) |
| 降ろし先の登録簿の `check` を `checker` へ改名 | `src/data/impl-targets.yaml`、`scripts/check-impl.mjs` |
| 不正な `check` の値で落ちる陽性の対照ほか 14 件の試験 | `scripts/test-check-impl.mjs` |
| 規約の書式・検査の手段の節を改め、`machine` の要件と `presence` の単位を書く。EV-0163(E1) | `community/implementation-marking.md` |
| 台帳から未分類の行と定型文を除き、`machine` の確かめの範囲を書く。全件の表に試験の列 | `scripts/check-impl.mjs`(生成)、`community/implementation-ledger.md`(生成物) |

### R-2 常駐の規則

| 変更 | 所在 |
| --- | --- |
| 一覧に規則ごとの識別子(`CR-NNN`)・節・核の文言を持たせる(90 件)。`omit` を置く | `template/scripts/gate/claude-md-resident.json`(schemaVersion 1) |
| 抽出と照合(正規化して、同じ節の行に核の文言が含まれるか)。表は「#」「止める仕組み」「例」の列を核に含めない。所在だけの行と説明の段落は規則に数えない | `template/scripts/gate/claude-md-resident.mjs` |
| `--write-resident` は追加だけ。消えた規則を一覧から消さない。`omit` の規則を足し戻さない | `template/scripts/gate/check-process-rules.mjs` |
| 変異の試験(行の削除、節を1行に置き換える、否定を除く 3 種、案件の編集の自由、正規化、追加だけ) | `template/scripts/gate/test-claude-md-resident.mjs`(新規。contract ジョブに結線) |
| 一覧とテンプレートの `CLAUDE.md` の一致の試験を規則まで広げる | `template/scripts/gate/test-init-g5.mjs` |
| 常駐の規則の行を降ろし先とするマークを `presence`(単位: 行)にし、降ろし先を `claude-md-resident` へ改める(18 件)。IMPL-0180・0186・0188・0189・0123 の注記を規則の照合へ改める | 標準本文の実装マーク |
| 採用者向けの説明 | `phase5-implementation/template-repository.md`、`template/README.md` |

### R-3 G-5 基準6

| 変更 | 所在 |
| --- | --- |
| 開示を直す(参照切れの一部だけが降りた。アンカーと逆引用符の中は確かめない。分量の上限は降ろさない) | 第4章 G-5(旧 460 行) |
| 参照切れの検査(文脈ファイルの相対リンクと `@` の取り込み) | `template/scripts/gate/check-context-refs.mjs`(新規) |
| 試験(`IMPL-0269:ng`・`ok`、範囲の外、テンプレート自身、ワークフローの結線) | `template/scripts/gate/test-context-refs.mjs`(新規。contract ジョブに結線) |
| ジョブ `context-format` を足し、集約 `gate-g5` の `needs` へ入れる | `template/.github/workflows/gate-g5.yml` |
| 基準6 をジョブへ対応づけ、注意の文を改める | `template/scripts/gate/g5-aggregate.mjs`、`test-g5-aggregate.mjs`、`test-init-g5.mjs`、`aggregate-evidence.mjs`、`.claude/skills/gate/gates/G-5.md` |
| IMPL-0269 を参照切れ(降ろし先 `context-refs`、`machine`、`plan=adopter`)と分量の上限(IMPL-0312、`manual`、`plan=adopter`)に分ける。棚卸しの登録簿へ IMPL-0312 を足す | 第4章 G-5、`src/data/impl-inventory.yaml` |
| 骨格例に基準6 のジョブを足す | `phase5-implementation/ci-gates.md` |

### R-4 降りていない規定

| 変更 | 所在 |
| --- | --- |
| 属性 `plan`・`issue`・`review`・`decision` の検査。`state=delivered` に書けば落とす | `scripts/lib/impl-inventory.mjs`、`scripts/check-impl.mjs` |
| `adopter` にできない規定の登録簿(5.4.3・5.5.5・5.8.3・7.11・Label Mailbox 4.7。下位の節を含む) | `src/data/impl-no-adopter.yaml`(新規) |
| 全 95 件の `undelivered` に `plan` を付けた(`scheduled` 88 件、`adopter` 7 件) | 実装マーク |
| 台帳: 降ろし先の種別で定型文を書き分け、列の見出しの「(予定)」を除き、計画の列を足し、順序(`adopter` にできない → G-7・G-8・R1 → その他)で並べ、見直しの年月を過ぎた件数を出す(生成した月で変わる行は鮮度の比較から除く) | `scripts/lib/impl-inventory.mjs`(`renderUndelivered`)、`scripts/check-impl.mjs` |
| 規約の「降りていない規定の扱い」。EV-0164(E0) | `community/implementation-marking.md` |
| IMPL-0120 の注記を 1.10.2 の後の併記の事項に合わせる。IMPL-0116・0117・0118 は別 Issue(下書き C)へ `scheduled` | 第1章 1.10.2、第3章ほか |

### R-5 スキルの文の検査

| 変更 | 所在 |
| --- | --- |
| 「〜ないでください」の 20 行を要求・禁止の文末へ書き直し、行ごとに印を付けた(数え直した結果、起草の 20 行と一致。生成区間の `CLAUDE.md:22` は対象の外) | `template/.claude/skills/` の 10 ファイル、`template/CLAUDE.md:7` |
| 検査の文末に依頼の形を足す。`template/CLAUDE.md` の生成区間の外を対象に加える。太字の否定(111 行)と平叙の否定(315 行)の件数を出力する | `scripts/check-skill-provisions.mjs` |
| `CLAUDE.md` の行ってはならない作業の表の 9 行に、行ごとの印を付けた(`pit/reference/boundaries.md` と同じ所在) | `template/CLAUDE.md` |
| 所在の追跡であって遵守を示さないこと、振る舞いの評価を CI に課さないこと。EV-0165(E0)。限界の表に範囲の外の否定と遵守を足す | `community/implementation-marking.md` |
| ADR-0064 の範囲の改め | ADR-0084 決定5、ADR-0064 のステータス |

### R-6 附随

| 変更 | 所在 |
| --- | --- |
| A-11 の入口を通す試験(外部の確認者の記名による、独立レビュアの席を人確定から協働へ上げる変化点を `generate-profile.mjs --change` が拒否し、構成を書き換えない。D-0 表1 の決定者の記名なら受け付ける) | `template/scripts/gate/test-loosening-decider.mjs`(新規。contract ジョブに結線)、IMPL-0115 の `test` |
| 台帳の定型文の書き分けと列の見出し(R-4 と同じ変更)。IMPL-0042・0043 は分けない | `scripts/lib/impl-inventory.mjs` |
| IMPL-0209: 降ろし先 `human-verify-skill` を登録し、`delivered`・`manual` へ改める。スキルの印を `根拠: IMPL-0209` へ改める | `src/data/impl-targets.yaml`、`template/.claude/skills/human-verify/SKILL.md:71` |
| IMPL-0206 の注記を、/human-verify が自らの出力に要約を書かないことだけを定めている事実に合わせる | `phase5-implementation/agent-trace-control.md` |
| 逆向きの追跡(ファイルの単位)。対象のファイルが登録簿の `path`・`checker` か除外の一覧にあること。降ろし先を 5 件登録(`context-refs`・`human-verify-skill`・`dependency-diff`・`gate-entry-workflow`・`assurance-period-workflow`)、除外 13 件(`library` 8 件、`infra` 5 件) | `scripts/check-impl.mjs`、`src/data/impl-untraced.yaml`(新規)、`src/data/impl-targets.yaml` |
| テンプレートのコード・スキル・様式・ワークフロー・README に書かれた IMPL 番号が標準に実在すること | `scripts/check-impl.mjs` |

## 2. 裁定からの逸れと理由

| # | 逸れ | 理由 |
| --- | --- | --- |
| 1 | 後継の Issue 6 本を起票できなかった。該当する 60 件のマークは `plan=scheduled issue=314 review=2026-11` を仮に名指す | 実装のセッションで、`gh api` による Issue の作成が権限の分類器に拒否された。迂回していない。下書きは `followup-issues.md`。起票の後に `issue=` を改める。見直しの年月を早く置き、仮のまま放置されないようにした |
| 2 | 常駐の規則の核の文言は、行の全文(`[機械]` の注記と行の中の所在より前)とした。行の途中への挿入は文言の変更として落ちる | 最初の文だけを核にすると、「**AI は停止を解除しない**」のように2文目にある禁止が照合から外れ、否定を除く変異で落ちなかった(試験で確かめた)。裁定の「周りに書き足す」は行の前後への書き足しと読んだ |
| 3 | 表の行の核から「止める仕組み」「例」の列を外した | 裁定(起草の意見書)の「採用者が止める仕組みの列を自分の基盤に合わせて書き換える」への対応。列の見出しで決める |
| 4 | 順序の第1段(表示の誤り)は台帳の並びに使わない | 表示の誤りは機械で判別できない。見つけたその場で直す(IMPL-0206・0209・0120 はこの Issue で直した)。台帳は残りの3段で並べ、規約にその旨を書いた |
| 5 | G-7・G-8・R1 に関わる規定の判別は、注記の語(`G-7`・`G-8`・`R1`)による | 規定の属性に段の欄を足すと、同じ事実を2か所で書く。語で拾えない規定がありうる(限界) |
| 6 | 逆向きの追跡で、`config-key` の降ろし先は `scripts/init/generate-profile.mjs` を追跡済みに数える | 構成のキーを生成するのは同ファイルであり、登録簿の `path` を持たない |
| 7 | ADR-0068 のステータスにも指し示しを足した | 「影響」の常駐の規則の節の記述が、決定2 で規則の単位へ改まったため。指示に無い ADR だが、本文は変えていない |
| 8 | `graphify update .` を実行していない | この環境に `graphify` のコマンドが無い |

## 3. 7 節の突合の結果

### ADR との矛盾

| ADR | 確かめたこと | 結果 |
| --- | --- | --- |
| ADR-0028 | 降りていない規定を消さずに表示し続けること | 矛盾なし。`plan=adopter` も台帳の表に残し、規定は課したまま |
| ADR-0061 | 決定1(`state` は2値、`check` は独立) | 維持。決定2・3 は ADR-0084 が補う(ステータスに指し示し) |
| ADR-0063 | 依頼の形を規範に使わない向き | 一致。スキルの依頼の形を要求・禁止の文末へ改めた |
| ADR-0064 | 印の書式と所在の検査 | 維持。範囲だけを広げた(ステータスに指し示し) |
| ADR-0073 | 統制の設定を変える変更の陰性の確認(決定6) | テンプレートの集約に `context-format` を足す変更は、統制を強める向き。陰性の確認(外すと落ちること)は `test-g5-aggregate.mjs` と `test-init-g5.mjs` の needs を外す試験が持つ |
| ADR-0074 | 判定基準を実装する検査が集約にあること(決定2)、強制層の検査の追加は AI維持管理者が承認する(決定3) | 決定2 は `G5_CRITERION_JOBS` に基準6 を足して機械で確かめる。決定3 の承認は、テンプレートの変更を取り込む人の判断として残る(下の「人が行うこと」) |
| ADR-0076 | 「課さない」を棚卸しの `not-imposed` で扱うこと、件数を合否に使わないこと(決定5) | 一致。`plan` に「課さない」を置かず、見直しの年月を過ぎた件数を合否に使わない |

### 分類の分布と下げたマーク

- 全 305 件(IMPL-0001〜0312。欠番 1): `machine` 56 件、`presence` 66 件、`manual` 183 件。`delivered` 210 件、`undelivered` 95 件
- 未分類 100 件の分類: `machine` 10 件(IMPL-0001・0002・0020・0049・0059・0062・0078・0093・0099・0103)、`presence` 33 件(行 13・欄 17・キー 2・ファイル 1)、`manual` 57 件
- `machine` から下げた 10 件: `manual` へ IMPL-0113・0119・0157・0233・0260・0287・0288・0311、`presence` へ IMPL-0144(キー)・0293(行)
- `presence` から `manual` へ下げた 15 件: IMPL-0141・0149・0151・0162・0166・0167・0177・0178・0199・0236・0238・0240・0242・0258・0274
- `presence` から `machine` へ上げた 1 件: IMPL-0203
- `undelivered` の計画: `scheduled` 88 件(既存の Issue 28 件、仮の #314 60 件)、`adopter` 7 件(IMPL-0086・0222・0269・0277・0279・0299・0312)。`adopter` にできない節に置かれた `undelivered` は 0 件

### 誤検出

| 検査 | 結果 |
| --- | --- |
| 常駐の規則の照合 | テンプレートの `CLAUDE.md` は 90 件の規則をすべて満たす。前後への書き足し・並べ替え・行の追加・止める仕組みの列の書き換えでは落ちない(試験)。行の途中への挿入は落ちる(逸れ 2) |
| 参照切れ | テンプレートの文脈ファイル 66 件・参照 3 件で 0 件。参照の数が少なく、実際の案件での誤検出の材料は無い。逆引用符・コードブロック・HTML コメントを読まないので、例のパスでは落ちない |
| 逆向きの追跡 | 0 件。除外 13 件は理由つき。新しいスクリプトを足すと、登録か除外の判断を求められる |
| 試験の目印 | 56 件すべてが目印と結線を満たす。目印は試験の中身の正しさを示さない(規約に明記) |

### 再生成

`npm run evidence:write`、`npm run impl:write`、`npm run scope:write`(変更なし)を実行した。規則データ(`src/data/tailoring/`)は変えていないので `npm run template:kb` は不要。`npm run check` は通過。テンプレートの contract ジョブの試験 16 本と、`check-context-refs`・`check-decisions`・`check-process-rules`・`spec-lint`・`verify-gate-contract` は手元ですべて通過。

## 4. 人が行うこと

- 後継の Issue 6 本の起票(`followup-issues.md`)と、60 件のマークの `issue=` の更新
- 強制層の変更の受け入れ(ADR-0074 決定3。**AI維持管理者(人)が承認する。AI の名義の承認は受け付けない**。テンプレートの PR には `state:needs-platform` を付ける)。次の4点を含む
  1. contract ジョブへの試験の追加(`test-context-refs`・`test-claude-md-resident`・`test-loosening-decider`、突合への応答で `test-spec-lint`)と、集約の `needs` への `context-format` の追加
  2. `check-process-rules` の合否の条件を、節の照合から規則ごとの照合へ強めたこと(突合への応答で、`omit` の理由と承認者の検査を足した)
  3. `.claude/skills/` の10ファイルと `CLAUDE.md` の文言を、依頼の形から禁止の形へ改めたこと(エージェント指示資産の変更)
  4. 既存の採用者への影響。テンプレートの更新を取り込むと、参照切れの検査・常駐の規則の照合・`omit` の検査で `gate-g5` が落ち始めうる
- 親リポジトリの `work/314` の push と main への取り込み(このセッションでは push していない)

## 8. 突合(crosscheck.md)への裁定への応答

`decision.md` の 8 節(X-1〜X-18)を反映した。テンプレートのコミットは `d4af122`(claude/process-compass-314。push 済み)。親は work/314 にコミットし、push していない。

| 指摘 | 反映 |
| --- | --- |
| X-1 | ADR-0084 のステータスを「ADR-0061 の決定2 と、決定1 の表の未分類の行・`presence` の定義を、決定1 で置き換える」へ改めた(ADR-0074 決定5 と同じ扱いと明記)。ADR-0061 のステータスを `採用(2026-10-13)。一部置き換え(→ ADR-0084 の決定1): …` の形へ改めた。決定3 は「補う」のまま。両 ADR とも変えたのはステータスの段落だけ(ADR-0084 は取り込み前のため、決定の本文も裁定に従って改めた) |
| X-2 | EV-0163〜0165 の差し替え条件に、観測の源と、結果ごとの見直しの向きを書いた。EV-0163 は裁定の例どおり(是正の記録と突合の記録。`machine` の通り抜け → 試験の内容の確認を足す、`presence` の欠落の通過 → `manual` へ、0 件 → 保つ)。EV-0164 は台帳の履歴と「規定が無い」の申し立て、EV-0165 は振る舞いの評価の記録と CI に入れた案件の報告 |
| X-3 | 60 件は `issue=314` のまま。規約の見本を架空の番号(`issue=123`)へ改め、架空である旨を書いた。規約と ADR-0084 決定4・影響に「#314 は `issue=314` のマークが 0 件になることを閉じる条件とする」と、閉じた Issue の名指しを機械で検出しないこと(検査はオフラインで Issue の状態を知り得ない)を書いた。ADR-0084 の検討した選択肢に、採らない案として足した。Issue は起票していない |
| X-4 | `test-claude-md-resident.mjs` を、試験の中の固定の写し(縮めた CLAUDE.md)と、そこから作った一覧に対して行う形へ書き直した。案件の `CLAUDE.md` を読まない。変異の一揃いを太字つきと太字を外した写しの両方で回す(陰性の対照)。変異の置き換えが空振りしたら試験の失敗にする。テンプレートの実の `CLAUDE.md` の太字を外しても `check-process-rules` が通ることも手で確かめた |
| X-5 | `claude-md-resident.mjs` に `blankComments`(複数行のコメントを改行だけ残して消す)を置き、節の読み取り・規則の抽出・照合の3つで使う。`check-context-refs.mjs` も同じ置き換えを行う。変異の試験(節の本文を複数行のコメントで囲むと、節の規則が無く本文も無いと出る)と、参照切れの試験(コメントの中のリンクを数えず、後ろの行番号を保つ)を足した |
| X-6 | (1) `markAttrProblems` が `check=manual` の注記に「確かめる者:」か「人が確かめるのは」を求める。欠けていた 182 件に確かめる者を書いた。降りている規定は降ろし先ごとの席(出荷判定者、当該ゲートの判定者、AI維持管理者など)と時点、`scheduled` は「計画の Issue の担当者(降ろすときに確かめる)」、`adopter` は「採用者」。(2) 下げた 8 件のうち 6 件に対の試験を足して `machine` へ戻した: IMPL-0119・0311(`test-edition-end`)、IMPL-0260(`test-coverage-scope`)、IMPL-0287・0288(`test-check-delegation`。0288 は集約が項目3 に使う表示の関数 `rejectionText`・`stopsText` の試験で、項目3 への配置までは見ない)、IMPL-0233(新設の `test-spec-lint`。scripts を一時の置き場へ写し、知識ベースの欠落と空の検出語で落ちることを確かめる)。IMPL-0113・0157 は試験を足さず、注記を「機械の出力はあるが、違反と適合の対の試験が無い」と確かめる者へ改めた(場面の構築が大きく、別の試験の整備に送る) |
| X-7 | IMPL-0076・0187・0198・0235 を `manual` へ下げ、確かめる者を書いた。IMPL-0187・0198 のフックの試験を、`followup-issues.md` の下書き D に行と受け入れ条件として足した |
| X-8 | 参照切れの検査に、逆引用符の中の `.claude/`・`scripts/` で始まるパスを入れた。雛形の記号(`N` の並び・`<>`・`*`・`{}`・`…`)を含むものと、`.gitignore` に当たるもの(`.claude/.self-heal`・`.claude/denied.log`。実行時の状態)を除く。`.gitignore` の簡易の照合(`gitignoreMatcher`)を足した。テンプレートで数える参照は 3 件から 84 件になり、参照切れは 0 件(突合が挙げた唯一の不在 `G-N.md` は雛形として除かれる)。ADR-0084 決定3・検討した選択肢、gate-criteria の開示、G-5.md、検査の冒頭、IMPL-0269 の注記、gate-g5.yml・g5-aggregate・aggregate-evidence の文、試験を改めた |
| X-9 | ADR-0084 決定4 に、`adopter` の 7 件(0086・0222・0269・0277・0279・0299・0312)ごとの理由と採用者に求めることの表を足した。理由は裁定の候補どおり。理由を書けない件は無く、`scheduled` へ改めた件は無い |
| X-10 | 本書の 4 節と ADR-0084 の「影響」に4点を足し、AI維持管理者の承認を要すること、AI の名義の承認を受け付けないこと、テンプレートの PR に `state:needs-platform` を付けることを書いた。テンプレートのコミットの本文にも書いた。PR は作っていない |
| X-11 | (1) `machineTestProblems` が、同じ識別子の `:ng` と `:ok` が別の行にあることを求める(`:ng` だけの行と `:ok` だけの行の両方が要る)。IMPL-0140 の検査を2つに分けた。(2) `templateTestWired` が手順を切り出し、`run:` の行の `\|\| true`・`\|\| :`、手順の `if:`、手順の `continue-on-error`(`false` を除く)を結線の不備にする。不備の無い実行が1つあれば足りる。(3) 規約・ADR・台帳の `:ng` の定義を「違反の入力で検出する(落ちる、または件数・一覧・警告に出る)」へ改めた |
| X-12 | `omitProblems` を置き、`check-process-rules` が `omit` の各項目の `reason` と `approvedBy`(`aiNameBlocked` で AI の名義を拒む)を求める。試験に5件を足した。同時の削除と後置の打ち消しを、ADR-0084 決定2 と `template-repository.md` に限界として書いた。ADR-0084 決定2 に核の文言の定義も書いた(突合 1 節の逸れ2 の指摘) |
| X-13 | 第3段の登録簿 `src/data/impl-decision-sections.yaml` を置いた(9 節)。`undeliveredRank` は登録簿で決め、注記の語を使わない。登録簿の鍵の実在を検査する。結果として IMPL-0210(付随の言及)は第3段から外れ、IMPL-0192(第4層 出荷判定への接続)が第3段に入った |
| X-14 | 規約の表と台帳の表の `presence` の文を「規則を運ぶ単位(欄・キー・行・ファイル)の有無まで」へそろえた |
| X-15 | `check-skill-provisions.mjs` の走査を `scripts/lib/skill-provisions.mjs` の `scanSkillProvisions` へ移し、`check-impl.mjs` が件数を台帳の「スキルの文のうち、検査の範囲の外の否定」へ書き出す。規約の限界の表は台帳を引き、数値を書き写さない |
| X-16 | 逆向きの追跡の対象に `.claude/*.json` と `.github/rulesets/*.json` を加えた。新しく対象になった `guard.json` とルールセット3件は、除外の一覧の新しい区分 `variant`(登録簿の降ろし先の変種・設定。`of` で降ろし先を名指し、実在を検査する)で載せた。対象の外に残るもの(CODEOWNERS、`.github/actions/` など8行)を規約の表に列挙した |
| X-17 | 下の手順を記録した。取り込みは PR の作成時に行う |
| X-18 | `impl-no-adopter.yaml` に 5.5.1(席・責任者・担い手。人へ戻す3つの場合)を加え、規約と ADR-0084 決定4 の列挙にも足した |

### X-17 取り込みの手順(PR の作成時に行う)

1. テンプレート: #313 のブランチ(`3834270` まで)を main へ取り込み、続けて #314 のブランチ(`claude/process-compass-314`)を取り込む。main は #54 で先へ進んでおり、両側が変えたファイルが 18 件ある(`gate-g5.yml`、`test-check-pr.mjs`、`check-pr.mjs`、`aggregate-evidence.mjs`、`generate-profile.mjs`、`tailoring-kb.json` など)
2. 競合を解く。`test-check-pr.mjs` の目印(IMPL-0049・0059・0062・0078・0099 ほか)は競合の解消で失われやすい。解いた後で `grep -c "IMPL-" scripts/gate/test-check-pr.mjs` を取り込み前と比べる
3. テンプレートで `node scripts/gate/check-process-rules.mjs --write-resident`(追加だけ)を実行する
4. 親で `npm run template:kb` と `npm run impl:write` を実行する
5. main 側で足された新しいファイル(`record-copy.yml`、`records.mjs`、試験 4 本)を、降ろし先の登録簿(`src/data/impl-targets.yaml`)か除外の一覧(`src/data/impl-untraced.yaml`)へ載せる。試験は contract ジョブの `run:` から実行されていれば対象の外
6. 親で `npm run check` を通す
7. 親の main は、テンプレートの取り込みの後に進める(サブモジュールのポインタを取り込んだ main のコミットへ改める)

### 突合への応答の後の値

- 実装マーク 305 件。検査の手段は `machine` 62 / `presence` 62 / `manual` 181。降りていない 95 件(`scheduled` 88 件。うち `issue=314` が 60 件。`adopter` 7 件)
- 見直しの年月を過ぎた計画 0 件(2026-10 の時点)
- スキルの文 60 ファイル、印を求める文 71 件、範囲の外の太字の否定 111 行・平叙の否定 315 行
- 参照切れの検査: テンプレートの文脈ファイル 66 件、参照 84 件、参照切れ 0 件
- 新しい識別子は使っていない。次に空いている番号は EV-0166、IMPL-0313、SRC-0650、ADR-0085
- 再生成: `npm run impl:write`・`npm run evidence:write`・`npm run scope:write`(変更なし)。`npm run check` は通過。テンプレートの contract ジョブの試験と検査はすべて通過
