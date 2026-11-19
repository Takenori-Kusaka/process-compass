# 束 B23 push の前の回帰 2 本の直し(2回目)

## 1. template の test-records(recordFromForm)
- 実装(records.mjs)は doneCondition・unitPeriod を formCell で読む。欄が無い・空・様式の文言のまま・選択肢が残ったままは null(他の欄と同じ規則。undefined や空文字は返さない)。
- 呼び出し元(cl-judgment・config・content-sampling・next)は返り値の個別の欄を読むか展開するだけで、余計な欄で壊れない。関連の試験(test-config 系・test-next・test-cl-judgment・test-content-sampling)も通過。
- 期待値へ 2 欄を null で足した。欄がある場面(値を読む)と未記入の場面(null)を試験へ足し、2 欄の読みを縛った。通常と TZ=UTC で 95 件通過。

## 2. test:criteria(判定基準の複製の生成元の版)
- 本体で npm run template:kb を流し、scripts/vendor/tailoring-kb.json(template 側)の生成元の版を 3b278f5f から 38a40b7c(HEAD の祖先)へ更新。template にコミット。本体の履歴は書き換えず、新しいコミットを重ねるだけ。
- 本体のコミットの後で test:criteria を再実行(下記の結果参照)。

## 確認
- lint:impl・lint:refs・test:fields・test:criteria 通過。test:template-suite は Windows では 10 分で終わらず、WSL(node 26、LF の clone)で流した。test-adoption 以外は通過。test-adoption は同じ clone を cp -a した写しで落ちた(86e732b でも同じ。マージの衝突)が、WSL ネイティブの新しい clone では 69 件通過。写しの作り方による偽の落ちと判断(原因は未調査)。
- 写しは削除した。
