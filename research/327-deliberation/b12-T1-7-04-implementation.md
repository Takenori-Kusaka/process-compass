# #327 T1〜T7 実装の記録(束 B12)

指示書: `b12-T1-7-03-ruling-proposal.md`(T7 の G-5 は常に成立させない、の裁定を含む)。実装の順は T7 → T4 → T5・T2・T3・T6 → T1。

## template のコミットと bundle

| 順 | 項目 | コミット | bundle |
| --- | --- | --- | --- |
| 1 | T7 | 1de1ff2 | template-b12-327-02 |
| 2 | T4 | 8fb1179 | template-b12-327-03 |
| 3 | T5・T2・T3・T6 | 73cef16 | template-b12-327-04 |
| 4 | T1(複製) | cfb2e3e | template-b12-327-05 |

bundle は `origin/main..HEAD`(01 は push 済みの 2d66b46 まで)。

## 変えたファイル

- T7: `scripts/gate/aggregate-evidence.mjs`(g4Approved の直後に g4Judged を置き、gateExceptions.matched を絞り直す)、`scripts/gate/exception-expiry.mjs`(純関数 `unjudgedGateExceptions` を足した)、`scripts/gate/test-exception-expiry.mjs`
- T4: `scripts/gate/cl-judgment.mjs`(`sraResidualProblems`。SR4 の危険源の Hz の配列を返す)、`scripts/gate/check-g1.mjs`、`test-cl-judgment.mjs`(関数 9 件)、`test-brief-thresholds.mjs`(入口 3 件)
- T5: `scripts/gate/check-d0.mjs`、`.claude/skills/gate/gates/SG.md`、`test-cl-judgment.mjs`(next_review の 2 件。`writeD0` は変えず、書いた D-0 の `next_review:` 行を差し替えた)
- T2: `gates/G-4.md`(判定記録の書き方に S0 の項)、`gates/G-2.md` 6 行
- T3: `gates/G-4.md` 基準5 の 1 行だけ
- T6: `reference/exception-paths.md`(G-8 の名指しと 2 項目)
- T1: 本体 `src/data/tailoring/rules-business-phase.yaml` 16 行、`template/scripts/vendor/tailoring-kb.json`(`template:kb`)。差分は note 1 行と source.commit(5241b937)。note が変わるためコミットした

## 指示書と違えた点

1. T7 の関数: 指示書は aggregate の中で直接絞り直す書き方。実際は純関数 `unjudgedGateExceptions(rows, judged)` を exception-expiry.mjs へ出し、aggregate から呼ぶ。理由は、Windows では模擬の gh を置けず、台帳の行の帰属を裏づけられないため、集約の通しで matched に届く場面を作れない。関数を単体で試験でき、通しは非 Windows で動かせる。挙動は指示書どおり
2. T7 の試験: 関数の試験(Windows でも動く)と、集約の通し(模擬の gh。`process.platform === 'win32'` では省く。test-material-records-more.mjs と同じ型)の 2 層。通しは WSL(node 22)で実行して全件通過(59/59)。Windows の実行は 54/54(通しを省く)
3. T7 の目印: 台帳の行を成立させる「帰属を裏づけた G-2 の行」の前提の check を足した(通しが成立しない理由を帰属の失敗と取り違えないため)。`IMPL-0996:ng/:ok` は関数の試験と通しの両方に置いた
4. T4 の戻り値: 指示書の「1件」は Hz 1つを1件と読み、`sraResidualProblems` は SR4 が残る Hz の配列を返す。check-g1 は 1 つの文にまとめて Hz を列挙する
5. 判定記録の種別: `g4Judged` は `gateDetails` の様式と `reviewJudgements` を読み、結果が通過か差し戻しの語を数える。`headMatch` は問わない(指示書どおり)

## 試験の結果

- `test-exception-expiry.mjs`: Windows 54/54、WSL 59/59
- `test-cl-judgment.mjs`: 98 件一致
- `test-brief-thresholds.mjs`: 50 passed
- `check-template-drift.mjs`: 一致
- `npm run lint:impl`・`npm run lint:refs`: 終了コード 0。textlint(5 ファイル): 指摘なし
- `npm run check` の全量は走らせていない(議長が push 前に 1 回)

## 実装マーク

- IMPL-0996: delivered / machine / `template/scripts/gate/test-exception-expiry.mjs`
- IMPL-0849: delivered / machine / `template/scripts/gate/test-brief-thresholds.mjs`(入口の試験に `IMPL-0849:ng/:ok`)
- IMPL-0951: delivered / manual(`plan=`・`issue=`・`review=` を外した)
- IMPL-0997・IMPL-0542・IMPL-0603: delivered / manual(同上。IMPL-0603 の target は gate-skill のまま)
- 事実の更新: IMPL-0864 の note(SR4 の検査は IMPL-0849 が持つ)、IMPL-0850 の note(冒頭の文言と失敗の文は G-1 と SG を名指す)
- manual の delivered 4 件の note の末尾へ「所在を読んだ(実行して確かめていない)」を足した(IMPL-0850 の型。指示書の note にはなく、読んだだけで実行していないため)。不要なら外す
- `npm run impl:write` で台帳を再生成した

## `npm run impl:issues -- --issue 327`

`#327 を issue= に持つマークは 0 件です。閉じてよい(付け替え済み)`。指示書は IMPL-1002(T8)が残る想定だったが、IMPL-1002 は `state=delivered check=presence` で、すでに降りており `issue=` を持たない。残るマークは無い。

## 範囲の外の所見(既存の Issue へ寄せる)

指示書の所見のとおり。`g4Passes`(G-7 基準5)と `g4Judged`(T7)は、記録用ブランチ `records/gates/` の様式を読まない。仕様が PR として存在しない場合の G-4 の様式は記録用ブランチへ置かれるため、偽の欠落が出る疑いがある(実行では確かめていない)。IMPL-0996 の note で出所を開示済み。

## 独立の突合へ渡す点

(1) G-4 の行が、判定記録なし・他の機能の記録だけで matched に出ず、差し戻しと通過の記録で出る(通しの 4 場面で確認) (2) G-2 の行は変わらない(通しの前提の check) (3) T4 は低減後 SR2・自由な文の SR4・凡例・様式の写しに反応しない(関数の試験) (4) 4 マークの state・check・test= (lint:impl 通過)
