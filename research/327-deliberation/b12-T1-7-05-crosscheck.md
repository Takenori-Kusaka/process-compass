# #327 T1〜T7 独立の突合(束 B12・軽・1巡目・差分だけ)

- 見た差分: 本体 `git diff 5241b937..HEAD -- . ':!research'`、template `git -C template diff 2d66b46..HEAD`(1de1ff2・8fb1179・73cef16・cfb2e3e)
- 基準: `b12-T1-7-03-ruling-proposal.md`。実装の記録 `b12-T1-7-04-implementation.md` は「指示書と違えた点」の確認にだけ使った
- 実装の文脈は見ていない。mutation は写し(scratchpad)から戻し、`git status` が本体・template ともに空であることを確かめた

## 結論

重大度「高」「中」は無し。裁定どおりに実装されている。「低」が5件(うち2件は編集の指摘)。2巡目は要しない。

## 確かめたこと

### (1) 裁定どおりか

- T7: `g4Judged` の出所は `g4Passes` と同じ(`gateDetails` の `/G-4/` と `specRe`、`reviewJudgements` の `judgeOk !== false` と `specs.includes`)。違いは結果の条件(通過か差し戻しの完全一致。`resultWord`)と `headMatch` を問わない点だけで、裁定 T7-2 に一致する。`resultWord` は同じ `if (isMain)` の範囲(1394 行)で定義されている。`gateExceptions.matched` の利用者は 4247 行の `residual.gateExceptions` だけで、絞り直し(3223 行)より後にある。G-4・G-5 以外のゲートは `unjudgedGateExceptions` が返さない。欠落の文は裁定の文面どおり
- 実装の記録の違え点1(純関数 `unjudgedGateExceptions` を exception-expiry.mjs へ出した): 挙動は同じで、試験しやすさのための形の違い。問題なし
- T4: 表を見出しの欄名で特定し(節2 `Hz`+`SR`、節3 `Hz`+`低減後 SR`、節5 `Hz`+`残留 SR`)、危険源ごとに節5 → 節3 → 節2 の順で最新の値を採り、`/^SR4$/i` だけを見る。様式の凡例(26・31 行)は `Hz` 欄を持たず読まない。158 行の表の欄「対応する Hz」は欄名が完全一致しないため読まない。check-g1 は G-1 通過済みを `warn`、それ以外を `g1Dependent` にする
- T5: `overdue` のときだけ SG の文を出し、G-1 の文を残す。冒頭の説明と SG.md の材料の集め方1 も裁定どおり
- T2・T3・T6: G-4.md(項目の位置は「引き受けた前提」の直前)、G-4.md 16 行だけの書き換え、G-2.md 6 行、exception-paths.md の1文と2項目は、裁定の文面どおり
- T1: yaml 16 行と kb.json 205 行だけが変わる
- マーク: IMPL-0996(machine・test-exception-expiry.mjs)、IMPL-0849(machine・test-brief-thresholds.mjs)、IMPL-0951・0997・0542・0603(manual)。`plan=`・`issue=`・`review=` は外れている。IMPL-0864・0850 の note は事実の更新だけ。`npm run impl:issues -- --issue 327` は 0 件。裁定は IMPL-1002 が残る想定だったが、IMPL-1002 は既に `delivered check=presence` で、実装の記録の説明どおり。裁定の前提の誤りで、実装の誤りではない

### (2) 表示と実態(試験と実行)

- Windows: test-exception-expiry 54/54(集約の通しは省く)、test-cl-judgment 98 件一致、test-brief-thresholds 50 通過
- WSL(node 26.13.1): test-exception-expiry 59/59。集約の通しで、G-4 F-001 の判定記録なし → 欠落に出て `gateExceptions` に出ない、G-5 P-001 → 記録があっても成立しない、F-002 の記録だけ → G-4 F-001 は欠落、F-001 の「差し戻し」の様式 → 成立、帰属を裏づけた G-2 F-001 → 従来どおり成立、を確かめた
- T4: 低減後に SR2 の危険源・判定の根拠の欄の「SR4」・様式の写し(凡例を含む)が 0 件になることを、関数の試験と入口(check-g1)の試験で確かめた

### (3) machine の ng/ok の検出力と manual の note

- mutation A(aggregate の `matched` の絞り直しを無効化。WSL): 集約の `IMPL-0996:ng` 2件(G-4 の記録なし・G-5)が NG になる(57/59)。検出する
- mutation B(`sraResidualProblems` の優先を節2 → 節3 → 節5 に逆転): 関数の試験3件が NG、入口の `IMPL-0849:ok` が FAIL。検出する
- mutation C(「SR4 と Hz を含む行」を拾う素朴な実装へ置換): 関数の試験3件(自由な文の行・危険源ごと・低減後 SR2)が NG。検出する
- manual の4件(0951・0997・0542・0603)の note は、所在を書いたうえで「所在を読んだ(実行して確かめていない)」で閉じ、「確かめた」と強く読める文は無い。`npm run lint:impl`・`lint:refs` は終了コード 0

### (4) 規則データの複製

- `node scripts/check-template-drift.mjs`: 「複製の検査: 一致しています」。kb.json の `source.commit` が 5241b937(yaml を変える前のコミット)を指すが、検査は commit を比較から外す(#301)。従来の生成の手順に由来し、本件の欠陥ではない

## 所見

| 番号 | 重大度 | 所見 | 推奨 |
| --- | --- | --- | --- |
| C-1 | 低 | 集約の通しの F-002 の場面(test-exception-expiry.mjs の場面 c)は欠落の文だけを確かめ、`gateExceptions` に出ないこと(`!shows`)を確かめていない。場面 a・b は両方を確かめる。関数の試験 ng3 が同じ筋を覆うため、検出力は残る | 場面 c にも `!shows(c.ev, ...)` を足す(任意) |
| C-2 | 低 | `g4Judged` のレビューの宣言行の筋(`reviewJudgements` で結果が差し戻しのもの)は、試験が無い。様式の筋だけを確かめている。読みは `g4Passes` と同じ出所で、論理は目視で正しい | 実行の確認が要るなら、次に集約の試験を触る Issue で足す。根拠水準の開示は不要(machine の ng/ok は様式の筋で成立している) |
| C-3 | 低 | `sraResidualProblems` は、見出しの次の行が区切り行でないとき `head` を差し替えるが `kind` を求め直さない。崩れた表に限る筋で、様式の表では起きない | 直すなら `head = cells; kind = kindOf(head);` とする(任意) |
| C-4 | 低 | IMPL-0567(issue=445、裁定で変えないとした)の note に「対象のゲートで行を拒む検査は無い」が残る。IMPL-0996 が G-4・G-5 の行を拒むようになったため、表示が実態より古い。state は undelivered のままで、規定が降りたかの表示は誤っていない | #445 の作業で note の事実を更新する(本件では変えない。裁定どおり) |
| C-5 | 低(編集) | (a) G-4.md 基準5「判定欄は判定者が記入する。AI は判定の草案を示してよいが、記入は判定者」は同じ内容を2度言う。(b) exception-paths.md の最後の文「…判定記録が無いとき、および対象を `G-5 <対象>` とした行を、成立させない」は、条件の節と目的語が並列になり読みにくい | (a)「AI は判定の草案を示してよいが、判定欄の記入は判定者が行う」の1文へ。(b)「出荷の証跡の集約は、対象を `G-4 <機能 ID>` とした行のうち当該の G-4 の判定記録が無い行と、対象を `G-5 <対象>` とした行を、成立させない」へ |

## 採らない所見

- 集約の通しが Windows で省かれること: CI(gate-g5.yml 164 行。Linux)で走り、WSL でも通過を確かめた。machine の要件は関数の試験の ng/ok でも満たす。所見にしない
- G-5 を常に成立させる経路が無いこと: 裁定の「所有者へ上げる点」で開示済み
