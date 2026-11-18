# 束 B20 実装 I7 の報告

- 範囲: 軽の 7 節 U9(IMPL-1015 → 1016 → 0764)と 12 節の注、heavy 5 節の IMPL-1016 の向きの申し送り、IMPL-0506 の裁定の反映、`impl:issues` の残りの一覧
- template のコミット(ブランチ b20)は 1 つ。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-I7-01.bundle`。template と本体は push していない
- ADR は新設していない。U9 の決定は ADR-0171 決定1・2 の降ろしであり、軽の 7 節に ADR の配分が無い

## 実装した内容

| 単位 | 内容 | 主なファイル |
| --- | --- | --- |
| 1015 | 質問 `q-f2-q1`(軸E、選択肢 `f2q1-no`・`f2q1-yes`)と規則 `r-e-f2q1-yes`(`g-ship` の restore、優先度 50)を足した。S0・標準・CL0 でも Q1 の写しが「ある」なら G-7 を適用し、G-6 は省略のまま。CL は Q1 から導かない。厳格化は下げない。回答の無い既存の構成は従来どおり G-7 を省略する。`stage-table.mjs` の CONDITIONS と PROBES に「F.2 の Q1「はい」」を足し、軸B の G-7 の S0 の升の括弧と `r-b-poc` の注記を改めた。`PROCESS-PROFILE.md` の回答の表に写しの行を足した。process-init の設問の表に 9 番目を足し、「8問」を「9問」へ(README・process-init の description と見出し) | `src/data/tailoring/questions.yaml`・`rules-criticality.yaml`・`rules-business-phase.yaml`、`scripts/lib/stage-table.mjs`、`tailoring-guide.md`、template の `generate-profile.mjs`・`README.md`・`process-init/SKILL.md`・`scripts/vendor/tailoring-kb.json`(`template:kb`) |
| 1016 | `clJudgmentState` が写しと D-0 表10 を比べる。写しが「ない」か無く D-0 が「はい」は記録の不備(G-1 の前は D-0 の検査が失敗、以後は出荷の記載の欠落。旧い構成の緩い扱いに当てない)。写しが「ある」で D-0 が「はい」でない向きと、写しが無く D-0 も「はい」でない場合は注意(止めない。後者は `/process-change` で答えるよう案内) | `template/scripts/gate/cl-judgment.mjs`・`test-cl-judgment.mjs` |
| 0764 | 新しい設定は足さない。`stepCompare` の求める段が構成の回答 `q-criticality` から導かれること(CL2 は段2、CL3 は段3)を、CL2×段1・CL3×段2 が欠落、CL3×段3 が通る対の試験で固定した | `template/scripts/gate/test-roster-conditions.mjs` |
| 0506 | `chair-ruling-0506.md` に従い delivered / manual へ移した。note に条件を結果の後に改めたことと、記録のそろった案件の終了コード 0 は隔離のもとでは確かめていないことを書いた。`research/444-verification/README.md` に裁定の所在を足した | `human-ai-boundary.md`、`research/444-verification/README.md` |

マーク: IMPL-1015 は delivered / machine(`scripts/test-tailoring-engine.mjs`)、IMPL-1016 は delivered / machine(`template/scripts/gate/test-cl-judgment.mjs`)、IMPL-0764 は delivered / machine(`template/scripts/gate/test-roster-conditions.mjs`)。`npm run impl:write` で台帳を再生成した。tailoring-guide の前提4 の段落にあった「機械は降りていない(IMPL-1016、#448)」の文を、降りた旨に改めた。

## ng が実装の前に実際に落ちることの確認(実行した)

- 1015: 試験を先に足し、質問・規則を入れる前に `node scripts/test-tailoring-engine.mjs` を実行した。終了コード 1。`IMPL-1015:ok` 側の `Q1「はい」の導出が期待と食い違う` が落ちた(`S0・標準・CL0・Q1「はい」の G-7 が omit(期待 適用)`)。ng 側は規則を外した規則データを検査が見逃さないことを確かめる形で、実装後は規則を外すと検査が非空を返す。実装後は通過
- 1016: 試験を先に足し、`cl-judgment.mjs` を変える前に `node scripts/gate/test-cl-judgment.mjs` を実行した。4 件が NG(写し「いいえ」× D-0「はい」、写しなし × D-0「はい」の 2 件の `IMPL-1016:ng`、写し「はい」× D-0「いいえ」、写しなし × D-0「いいえ」の 2 件の `IMPL-1016:ok` の注意)。実装後は 116 件通過
- 0764: 振る舞いは既に実装されており(`stepRequired` が回答から導く)、実装の前に落ちる形では確かめられない。代わりに、`aggregate-evidence.mjs` の `stepRequired` を一時的に定数 2 へ置き換えて `node scripts/gate/test-roster-conditions.mjs` を実行し、`集約: CL3 で評価者の段2 は、求める段 段3 に届かず…` が NG になることを確かめた(その後に元へ戻した)。「実装前のコミットへ戻しての再実行」ではなく、仮の形の方式
- 0506(manual): ng の試験は無い。`impl:write` の後に `lint:impl`・`test:impl` が通ることを確かめた

## 試験の結果

- 本体: `test:engine`・`lint:stage-table`・`lint:impl`・`test:impl`・`lint:evidence`・`lint:scope`・`lint:refs`・`test:template`(複製の一致)・`test:fields`・`test:criteria`・`lint:tone`・`lint:skills`・`lint:registry`・`test:plan-issues` が通過。tailoring-guide は textlint 通過
- template: `test-cl-judgment.mjs` 116 件、`test-roster-conditions.mjs` 57 件、`test-safety-record.mjs`・`test-check-delegation.mjs`・`test-ai-free-practice.mjs`・`test-aggregate-records.mjs`・`test-aggregate-drift.mjs`・`test-next-records.mjs`・`test-adoption.mjs`・`test-assurance-period.mjs`・`test-init-g5.mjs` が終了コード 0
- 既存の試験の見本の変更: `test-cl-judgment.mjs` の D-0 が「はい」の 4 場面で、構成の回答に `q-f2-q1: f2q1-yes` を足した(足さないと新しい記録の不備に当たる)
- `lint:provisions` は 1 件失敗する。`human-ai-boundary.md:1159` の「できません」の文末で、この段で触れていない既存の箇所である(前の段までの混入。この段では直していない)

## `npm run --silent impl:issues -- --issue <番号>` の残り

| Issue | 結果 |
| --- | --- |
| 355 | 0 件(閉じてよい) |
| 448 | 0 件(閉じてよい) |
| 447 | 0 件(閉じてよい) |
| 444 | 0 件(閉じてよい) |

IMPL-0200 は `issue=452`(`plan=scheduled`)になっていることを `human-ai-boundary.md` で確かめた。閉じる前に、2026-11-12 の記録のとおり他の Issue の降りていないマークも確かめること(この段の範囲外)。

## 裁定と合わない点・判断した点

- ADR-0220 は「構成へ Q1 を写さない(D-0 と食い違うため)」と書く。これは委任の停止(IMPL-0919)の判定が D-0 だけを読む、という範囲の記述である。IMPL-1015 が足す構成の回答 `q-f2-q1` はゲートの導出の入力であり、衝突しない。ただし読み手が混同しうるため、ADR-0220 の本文は書き換えず、IMPL-1016 の note に「委任の停止は D-0 だけを読むため、写しが『ある』でも D-0 が『いいえ』なら委任は止まらない」と書いた
- heavy 5 節の申し送り(写し「はい」× D-0「いいえ」)は、軽の 7 節の裁定どおり注意にとどめた。この向きでは、G-7 は適用されるが委任は動く。採らない案: 写しを委任の停止にも読ませる案(2 系統の一本化に反する。ADR-0220)
- `appliesWhen` は付けず、Q1 は全案件に聞く。質問の文言は、附属書F F.2 の Q1 を専門用語を使わずに言い換えた(「人の身体に危害が及びうる制御を…成果物は持つ?」)。標準に先例が無い言い換えのため、文言は人の確認を要する
- 写しが無く D-0 が「はい」でない場合の注意は、D-0 に判定の記録の節がある(`parsed.present`)ときだけ出す。D-0 が無い案件では、記録の不備が別に出るため

## 確かめなかったこと

- `/process-init` を通した実行(対話の経路)は実行していない。生成の関数 `buildConfig` を通した試験までである。process-change の `axis` 変更で `q-f2-q1` を改める経路も、入口の検査(知識ベースの選択肢の照合)に頼り、通しでは実行していない
- 既存の採用者の構成への移行(回答の無い構成が従来どおり動くこと)は、エンジンの試験(回答なし → 省略)と `cl-judgment` の注意までで、実リポジトリでは試していない
- 回帰の全量(`npm run check`・template の全試験)は流していない(push の前に 1 回)。`graphify update .` は未実行
- 写しの文言(質問と選択肢の `help`・`note`)は textlint の対象外(YAML)。日本語の校正は未実施

## 残った点

- 回帰の全量と、EV・IMPL 番号の push 直前の付け直し(この段で新しい EV・IMPL は使っていない)
- `human-ai-boundary.md:1159` の `lint:provisions` の失敗
- G-7 基準7 の `.claude/skills/artifact/artifacts/09-safety-risk-assessment.md` の手順の更新(I4 から持ち越し)
- 独立の突合(実装を見ていない別の文脈)。IMPL-0506 の裁定を確かめる対象に含める(裁定の開示のとおり)
