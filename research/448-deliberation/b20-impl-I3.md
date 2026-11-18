# 束 B20 実装 I3 の報告

- 範囲: heavy の 2 節(0738)・3 節(0498)・4 節(0990)・13 節(ADR 0218・0219)、light の 1010
- template のコミット(ブランチ b20): a9999d7(0738・0498)、その次のコミット(0990 の文書)。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-I3-01.bundle`・`-02.bundle`
- template と本体は push していない

## 実装した内容

| 単位 | 内容 | 主なファイル |
| --- | --- | --- |
| 0738 | `unmetShipBlockers`(CL1 以上か規制業のとき、構成の unmet と、回答・スタックから導き直した G-3 の未達の和)と `unmetShipGaps`。集約の `shipBlocked` の欠落の次で欠落に足す。G-3 の条件と記載は `g3UnmetCondition`・`g3UnmetEntry` の1か所に置き、`detectUnmet` も使う | `config.mjs`・`generate-profile.mjs`・`aggregate-evidence.mjs` |
| 0498 | `stackedLayerCheck`(承認の無い下の層の merge_commit_sha が、Y の head_sha の祖先なら `stackedLayer`、浅い取得・先頭を取得できないなら `stackedUnconfirmed`)。承認の無い層があるときだけ `git fetch --no-tags origin refs/pull/<Y>/head`。数えない理由を `NOT_COUNTED_CODE` に足し、開示の行と evidence.json の `records.stackedLayers` を足した。`OFF_DEFAULT_MERGE_LIMIT_TEXT` は検出の一覧の扱いに限ることが読めるように改めた | `aggregate-evidence.mjs` |
| 0990 | 標準の表を「しない / 判定する」へ。マークは delivered / manual。G-3.md と check-decisions.mjs の注記を直した | gate-criteria.md・`gates/G-3.md` |
| 1010 | マークを外し(番号は再利用しない)、`impl-inventory.yaml` から外した。ADR-0219 に「課さない」と書いた。IMPL-0136 の note の「IMPL-1010 が追う」を直した | gate-criteria.md・`impl-inventory.yaml` |
| ADR | ADR-0218(0738・0498。ADR-0136 決定4 を置き換える)、ADR-0219(0990 は人に残す、1010 は課さない。ADR-0138 決定3 と ADR-0092 決定7 の該当の文を置き換える) | `src/content/docs/adr/` |
| 条文 | tailoring-guide の表の2行、assurance-case 問21、gate-criteria の層の合わさりの段落 | `src/content/docs/phase4-process-design/` |

## ng が実装の前に落ちることの確認(実行した)

方法は、新しい関数を空の結果だけを返すスタブにして、試験を先に書いて流した。

- 0738: `node scripts/gate/test-aggregate-records.mjs`(スタブの `unmetShipGaps` が空配列)で 4 件が NG(CL1×G-3、規制業×G-3、手書きの `unmet: []`、欠落の文の内容)。実装後は通過
- 0498: 同じコマンド(スタブの `stackedLayerCheck` が空の結果)で 4 件が NG(手動のスタック、浅い取得、Y の先頭を取得できない、fetch の形)。1回目の実装では fetch の試験が落ちた(試験の複製が全ブランチを持っており取得が起きなかったため、単一ブランチの複製に直して通過)
- 試験の結果: `test-aggregate-records.mjs` 191/191、`test-aggregate-drift.mjs` 25/25、`test-exception-expiry.mjs` 65/65、`test-model-adoption.mjs` 30/30、`test-decisions.mjs` 67/67。本体: `lint:impl`・`lint:evidence`・`lint:refs`・`lint:provisions`・`lint:tone`・`lint:scope`・`lint:skills`・`lint:registry`・`test:fields`・`test:impl`・`test:plan-issues`・`test:criteria` 通過。変更した md は textlint 通過
- 試験で固定したもの: 典型の初期状態で出荷が永久に止まらない(CL0〜3 × PoC・MVP・成長 × スタック node・none は欠落なし。undetermined でも PoC なら欠落なし)

## 裁定の 15 節 2(手書きの構成を契約検査へ掛ける)の確認(実行した)

使い捨ての template の複製で、CL1・スタック未確定の構成を作り、`unmet = []`・`gates.g3.state = 'omitted'` に手で書き換えて `verify-gate-contract.mjs` を実行した。

- 契約検査は、この形に起因する不整合を出さなかった(出た2件は CODEOWNERS の雛形と git の追跡一覧で、複製の環境に依る別件)。**手書きの形は契約検査をすり抜けることを確かめた**
- 同じ構成で `aggregate-evidence.mjs` は exit 1 になり、evidence.json に「未達のゲートがあります: G-3 技術設計判断(…)」の欠落が出た。止めるのは集約である

## 確かめなかったこと

- 0498 の `refs/pull/N/head` の取得は、使い捨ての git リポジトリ(file プロトコルの上流を複製)でだけ確かめた。GitHub の実機で PR の参照が公開されること、verify ジョブで同じ結果になることは確かめていない(裁定 15 節 3)
- 0498 の集約への結線(`stackedLayers` を事前に計算し、`independentConfirmation` の結果を上書きする)は、純関数の試験と構文の検査だけ。実履歴を置いた集約の通しの実行は無い
- 0738 の集約への結線は、手書きの構成での通しの実行で exit 1 になることを確かめた。CL1 で G-6 だけが未達の構成での通しは、純関数の試験(`unmetShipBlockers` が `config.unmet` を含む)だけ
- 「実装前のコミットへ戻しての再実行」はしていない(スタブ方式)
- 回帰の全量(`npm run check`・template の全試験・`test-check-pr.mjs`)は流していない(push の前に 1 回)
- `npm run template:kb` は流していない(規則データを変えていない)。`graphify update .` は未実行

## 使った番号

- ADR-0218、ADR-0219(新設)
- EV-0331(0738)、EV-0332(0498)。EV-0269 は外した(再利用しない)
- IMPL は新設なし。IMPL-1010 を削除。**EV は仮の番号**(I4 の EV と衝突するなら採番の時に付け直す)

## 裁定と合わない点・判断した点

- `implementation-marking.md` の規約で `decision=` は `state=undelivered` のマークだけに書ける。0738・0498・0990 は delivered なので、ADR の番号は note に書き、`decision=` は付けていない
- 0990 のマークの target を `decisions-check` から `gate-skill` へ変えた(裁定の「target=gate-skill」のとおり)
- 0738 の欠落の文は、`reason` の全文を含める(裁定の「未達の名、理由、howToResolve の先頭」)
- 0498 の X の「merge より前」は、写しの merged_at の比較で決める。merged_at が読めないときは PR 番号の大小で代える
- 0498 の既定ブランチの名前は、写しの default_branch、無ければ `origin/HEAD` の symbolic-ref から取る。どちらも無いときは候補を作らない(判定しない側)
- 0498 の `stackedLayerCheck` は `detail` に「承認の無い層 #N」を記録するが、承認の有効性を追う処理は足していない(`approvalCountOfCopy` が 0 のものだけを承認なしとする)

## 残った点

- GitHub の実機での確認(0498)
- EV 番号の採番の時の付け直し
- 回帰の全量
