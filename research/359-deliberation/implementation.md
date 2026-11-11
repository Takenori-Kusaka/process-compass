# #359 実装の記録

- 裁定: `decision.md`。本件で降ろしたのは裁定 1 の 9 件(IMPL-0135・0220・0250・0252・0256・0280・0381・0465・0466)
- 準拠テンプレートの変更は、ブランチ `wip-359` のコミットにある。`scripts/gate/**` と `.github/workflows/gate-g5.yml` の変更は強制層の変更で、AI維持管理者の承認待ち(承認者と承認日は未記入)

## 1. マークごとの実装

| マーク | 状態 | 準拠テンプレート | 本体 |
| --- | --- | --- | --- |
| IMPL-0135 | undelivered → delivered(manual) | `templates/defect-ledger.md` に節「是正の記録」。`/artifact defect` の手順7 とレビューの観点、`/artifact adoption-trial` の集計の後の手順に、行を足すことを置いた | マークの改め。起点の記録と行の対応の検出は IMPL-0486(新設、undelivered、`target=adoption-trial`、`issue=359`) |
| IMPL-0256 | undelivered → delivered(manual) | `.github/PULL_REQUEST_TEMPLATE.md` の「検証方法と結果」の注記に、3要素・判断の指示・山括弧の例・写さないこと・分量の下限が無いこと | マークの改め |
| IMPL-0250 | undelivered → delivered(manual) | `gates/G-6.md` の承認の数え方に、層ごとに承認する注記。集約が層の合わさりを見ないこと、中間の層へのマージを拒否する設定が無いことを開示 | マークの改め。集約の側は IMPL-0487(新設、undelivered、`target=evidence-aggregation`、`issue=360`)。棚卸しの登録簿の「積み重ねた変更とゲート」に IMPL-0487 を足した |
| IMPL-0252 | undelivered → delivered(manual) | `templates/04-gate-record.md` の決断の記録の後と `gates/SG.md` の判定記録の書き方に、SG-0 の2つの注記 | マークの改め。`template-fields.yaml` の t4 に「確認した事項」を登録 |
| IMPL-0220 | undelivered → delivered(manual) | `/gate` の判定の原則6。テンプレ4 の「人が判断する項目」の表に列「根拠とした原資料の所在」と注記 | マークの改め。第6章テンプレ4 のチェックリスト突合に注記 |
| IMPL-0280 | undelivered → delivered(machine) | 企画書の様式(本体と3つのプロファイル)に行「停止条件の値」。`brief-thresholds.mjs` に `briefStopConditionState`・`briefStopConditionMessages`、`check-g1.mjs` から呼ぶ。試験は `test-brief-thresholds.mjs`(IMPL-0280:ok/ng と入口) | マークの改め。第6章テンプレ6 に行、t6 に登録 |
| IMPL-0381 | undelivered → delivered(machine) | `templates/04-gate-record.md` の「到達の見込み」にゲート欄の値と置き場。`aggregate-evidence.mjs` がゲート欄「必達基準の判定」の記録の節の欠落と空欄を記載の欠落に数える。試験 `test-reach-forecast-record.mjs`(新設。gate-g5.yml に結線) | マークの改め。第6章テンプレ4 の冒頭の注記にゲート名を定めた |
| IMPL-0465・0466 | undelivered → delivered(machine) | `templates/trial-checklist.md`(新設。第8章の写しと免除の表)、`scripts/gate/trial-checklist.mjs`(新設)、`next.mjs` の注記、`/artifact trial-checklist`(補助ファイル新設、SKILL の表に行)。試験 `test-trial-checklist.mjs`(新設。gate-g5.yml に結線。日付は引数で固定) | マークの改め。降ろし先 `trial-checklist` を planned → template-file。`trial-checklist.mjs` を `impl-untraced.yaml` に variant(of: trial-checklist)で登録。`check-template-drift.mjs` の補助の様式に足し、第8章の項目と様式の項目の一致を両方向で確かめる |
| IMPL-0283 | undelivered のまま | ― | note の食い違い(「採用者が…通知の手段を置く」と `plan=scheduled`)を、裁定 2 の降ろす形に改めた |

裁定 2・3 の残り(IMPL-0174・0175・0342・0374・0377・0462・0467)は変えていない。

## 2. 番号

- IMPL-0486・IMPL-0487 を新設した
- ADR・EV は新設していない(裁定 4)

## 3. 台帳の再生成

- `npm run impl:write`: 実装の台帳を更新した
- `npm run evidence:write`・`npm run scope:write`: 変更なし
- `npm run template:kb`: 知識ベースの複製の基点のコミットだけが変わった

## 4. 検査

- Windows の `npm run check` の各段: lint:ci〜test:criteria(test:template を含む)は通過。`npm run build` は 353 頁で通過。test:template-suite は `test-g5-aggregate.mjs`(既知の CRLF)と、`test-base-judge-workflow.mjs`・`test-discouraged-evidence.mjs` が落ちた。後の2本は、準拠テンプレートの変更前(ef539dc を `git archive` で写したもの)でも Windows で落ちることを確かめた。本件の変更に依らない。test:regress は Windows では流していない(WSL で流した)
- WSL(本体の作業ツリーと準拠テンプレート 51323c3 を `git -c core.autocrlf=false archive` で LF に写したもの、node v22.23.4): 回帰の道具の試験(test-run.mjs)は通過。回帰スイートは、通常の時刻帯と TZ=UTC の両方で「すべて通った」。テンプレートの試験一式は 47 本すべてが通った(既知の test-init-g5 の1件も、今回は落ちなかった)

## 5. 独立の突合と、止めた点

`crosscheck.md` のとおり、高 1・中 4・低 7 が出た。**高-1(G-1 を通過済みで出荷前の案件の企画書を、check-g1 が遡って失敗させる)が出たので、ここで止めた**。高・中・低のいずれも直していない。IMPL-0280 は `state=delivered` の表示のまま残っており、高-1 を直すまでは、その note の「G-1 を通過済みは欠落」は記録用ブランチにだけ判定記録がある案件で成り立たない。
