# 束 B20 実装 I4 の報告

- 範囲: heavy の 5〜12 節(0919・0766・U2 の共通の形・1007・0925・0927・0934・0759)と 13 節(ADR-0220・0221)
- template のコミット(ブランチ b20): 0919、安全関連部の検証の記録の検査(1007・0925・0927・0934)、0759 と文書・登録の各コミット。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-I4-01.bundle` ほか(最後の連番が最新)
- template と本体は push していない

## 実装した内容

| 単位 | 内容 | 主なファイル |
| --- | --- | --- |
| 0919 | `safetyPartStop(q1)` を判定の唯一の所在にした。`autonomyState`(種別の停止)・`capRefusal`(登録の拒否)・`renderAutonomyTable` と `l3ScopeIds`(D-0 の表と L3 の範囲)が同じ関数を通る。Q1 は `readF2Q1`/`readF2Q1Text`(cl-judgment)で D-0 から判定のたびに読む。`readAutonomyRecords` が `f2q1` を返し、無い入力は null として止める。D-0 の生成区間と検査(`applyD0Sections`・`d0SectionProblems` ほか)は D-0 の本文から Q1 を読んで描く。`buildDelegation` は変えず、構成へ Q1 を写さない | `autonomy.mjs`・`cl-judgment.mjs`・`generate-profile.mjs`・`aggregate-evidence.mjs` |
| 0766 | マークを `plan=adopter decision=ADR-0220` の undelivered / manual へ。`npm run lint:impl` は通る | `tailoring-guide.md` |
| 共通の土台 | `check-safety-record.mjs`(適用の判定・空欄の判定・記録の節の読み取り・欠落の出力)。基準7 を `partial` にし、結果の文に「記載の欠落の検査のみ。内容の妥当性は確かめていない」を書く。適用外は「適用外(Q1 いいえ・CL0/CL1)」と出す。D-0 が無い・Q1 が読めないときは適用 | `check-safety-record.mjs`・`aggregate-evidence.mjs` |
| 1007 | F.7 の6項目(切り分け・適用規格と水準・AI の利用・独立した評価の行と、手法の表、試験項目の表の7行)の置き場と空欄。条件つきの4行は見ない。様式の初期の文は定数で持ち、様式 09 との一致を試験で固定 | 同上・様式 09 |
| 0925 | 環境の欄は「試験台の実機・模擬環境・専門部門の設備」の識別つき、または「実行前の挿入」。種別だけ・3種でない語・併用・空欄・例外承認の ID は欠落(前方一致にしない) | 同上 |
| 0927 | 7行すべての結果の欄は「一致」「不一致」で始める。省く場合は `例外承認: D-NNN`(台帳の区分「例外」で `exceptionStanding` が active の行)。台帳を読めないときは欠落 | 同上 |
| 0934 | 手法の表(5列)。表なし・0件・推奨度か出典か適用の空欄・適用の値の誤り・HR で「しない」かつ理由空欄を欠落に数える。出力に「HR の行 n 件・うち不適用 m 件(推奨度は記入者の申告)」。規格の表は転載しない | 同上・様式 09 |
| 0759 | D-0 節16 に「構成要素ごとの判定」の表(全 CL)。`componentClasses` と `clJudgmentState` が読む。判定 < 表の最大・表なし・0行・区分を1つに読めない行は記録の不備、判定 > 表の最大は注意 | `cl-judgment.mjs`・`templates/00-d0-governance.md` |
| ADR | ADR-0220(0919・0766)、ADR-0221(1007・0925・0927・0934・0759) | `src/content/docs/adr/` |
| 条文・登録 | tailoring-guide の表・組み合わせ表・CL2 の説明・判定の記録の表、safety-verification の F.7 の2行、gate-criteria の基準7 の行と 1680 付近、deliverable-templates の表10 の下、`rules-criticality.yaml` の `r-e-cl2` の注記(`template:kb` で複製を更新)、`template-fields.yaml` に表の見出しと列を登録、`impl-targets.yaml` の `safety-verification-record` を実在のファイルへ、template の `gate-g5.yml` に `test-safety-record.mjs`、`G-7.md` の基準7 の手順、`capReason` の文 | 各ファイル |

## ng が実装の前に実際に落ちることの確認(実行した)

- 0919: 新しい `safetyPartStop` を `return null` の仮の形にして配線だけ済ませ、`node scripts/gate/test-check-delegation.mjs` を実行した。IMPL-0919:ng の11件が NG(登録の拒否・表が L1・判定不可・L3 の範囲・未記入/様式のまま/未定/節なし/D-0 なし・値が無い入力・「いいえ」から「はい」へ改めた入力)。本体を入れて 68 場面すべて通過
- 1007・0925・0927・0934: 検査の本体を、`safetyRecordProblems` が空の結果を返し `checkSafetyRecord` が適用外を返す仮の形に差し替え、`node scripts/gate/test-safety-record.mjs` を実行した。49件が NG(違反の全件と適合の一部)。本体へ戻して 66 件通過。様式 09 の変更前は「様式のまま欠落 19 件」の試験が落ち、変更後に通った
- 0759: 試験を先に足し、実装の前に `node scripts/gate/test-cl-judgment.mjs` を実行した。7件が NG(判定 CL0×表 CL1、表なし CL1・CL0、0行、「CL1 または CL2」、様式のまま、判定 CL2×表 CL1 の注意)。実装後は 108 件通過
- 0766(manual): ng の試験は無い。`npm run impl:write` の後に `npm run lint:impl` が通ることを実行して確かめた

## 試験の結果

- template: `test-check-delegation.mjs` 68 場面、`test-safety-record.mjs` 66 件、`test-cl-judgment.mjs` 108 件、`test-ai-free-practice.mjs` 67 件、`test-aggregate-records.mjs` 191 件、`test-aggregate-drift.mjs` 25 件、`test-next-records.mjs` 88 件、`test-roster-rules.mjs` 212 件、`test-check-pr.mjs` 265 場面が通過
- 本体: `lint:impl`・`lint:evidence`・`lint:refs`・`lint:provisions`・`lint:tone`・`lint:scope`・`lint:skills`・`lint:registry`・`lint:sources`・`test:fields`・`test:impl`・`test:plan-issues`・`test:criteria` が通過。変更した md は textlint 通過
- 既存の試験の見本の変更: fixture `delegation-eligible.json` に `f2q1: false`、`test-ai-free-practice.mjs` の D-0 に F.2 の「いいえ」、`test-cl-judgment.mjs` の `d0()` に構成要素の表(既定は判定した区分の1行)

## 使った番号

- ADR-0220、ADR-0221
- EV-0333(0919)、EV-0334(0927)、EV-0335(0934、E1)、EV-0336(0759)。EV-0296 は本文を更新(識別子は維持)。**EV は仮の番号**(I3 の EV-0331・0332 の次)
- IMPL は新設なし

## 移行の注意(変更の記録へ書く事項)

- 0759: 既存の案件の D-0 に「構成要素ごとの判定」の表が無いと、次の `check-d0` で記録の不備になる(G-1 の前は失敗、以後は出荷の記載の欠落)。1行で足りる
- 0919: Q1 が「はい」または読めない案件は、登録済みの委任が止まる。D-0 の生成区間は Q1 を読んで描くため、Q1 を改めたら区間を再生成する
- 1007: 安全関連の案件は、様式 09 の手法の表と環境・結果の列へ記録を写し直す

## 裁定と合わない点・判断した点

- 裁定の 9 節は環境の欄を F.7 の「行」の中に置くが、様式 09 の試験項目の表(7行 × 環境と結果の列)で見る形にした。環境の欄は7行すべてに求める(実行前の挿入ならその旨を書く)
- 手法の表の行は、全セルが空の行を行に数えない(様式のままで「行 0 件」になる)。部分的に空の行は欄ごとに欠落
- 結果の欄は「一致」「不一致」の前方一致で通す(裁定の「で始める」)。「一致しない」と書いても通るが、判定は人が行う
- 適用の判定の区分は、D-0 の判定した区分と構成の回答 `q-criticality` の高いほうで読む。どちらも読めず Q1 が「いいえ」のときは適用として扱う
- IMPL-0924 の note を手法の表へ合わせて直した。IMPL-0045・IMPL-0761 の note も直した
- `impl-targets.yaml` の `safety-verification-record` を `kind: planned` から `template-file`(`scripts/gate/check-safety-record.mjs`)へ改めた(lint:impl の逆向きの追跡のため)
- 実装マークの note に `<…>` を含めると読み取りから落ちる(IMPL-1007・0927 で発生し、山括弧を避けて直した)

## 確かめなかったこと

- 0919 の登録の拒否(`generate-profile.mjs` の `capRefusal` の結線)は、関数の試験だけ。`/process-change` の経路を通しては実行していない
- 基準7 の集約への結線は、`test-aggregate-records.mjs` が通ることと構文の検査まで。安全関連の案件で記録が欠ける通しの実行(集約の exit 1)は試験にしていない
- 0766 の ng は manual のため無い
- 「実装前のコミットへ戻しての再実行」はしていない(仮の形の方式)
- 回帰の全量(`npm run check`・template の全試験)は流していない(push の前に 1 回)。`graphify update .` は未実行
- 既存の D-0 で生成区間が Q1 を読んで描かれるようになったことによる `check-d0` の差異は、template の既存の試験の範囲でだけ確かめた

## 残った点

- 回帰の全量と EV 番号の採番の時の付け直し
- IMPL-1016(写しが「はい」で D-0 が「いいえ」の向き)は軽の裁定へ申し送り(ADR-0220 に書いた)
- G-7 基準7 の `.claude/skills/artifact/artifacts/09-safety-risk-assessment.md` の手順は未更新(様式の列の変更は様式 09 の注記に書いた)
