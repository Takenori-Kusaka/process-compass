# #333 独立の突合(1巡目・全体)

作成日 2026-11-15。実装を見ていない別の文脈で、裁定(`decision.md`)・実装(本体 `219e98b..577cd9f`、template `3d9da56..5199c68`)・既存の決定を突き合わせた。何も変更していない(所見だけ。コミットなし)。`implementation.md` は、所見を出した後に、申告された食い違いの確認にだけ読んだ。

## 0. 確かめ方

- scratch: `C:/Users/kokor/AppData/Local/Temp/claude/9c454912284b4ac9/4ed090b1-58dc-4976-b9da-81b77286cf15/scratchpad/333-review/`(template main の写し。`git archive` で作り、git の履歴に PR #7 のマージ・出荷の PR #8 のマージ・記録用ブランチ `records` を作った)。道具は同じ階層の `333-review-tools/`(`fakegh.mjs`・`scen.sh`・`steps.sh`・`mutate.mjs`・`bin/gh`・`bin/jq.mjs`)
- 集約は本体をそのまま動かし、`execFileSync('gh', …)` の1か所だけを偽の gh へ差し替えた(node v26.13.0。`node scripts/gate/aggregate-evidence.mjs --from v0 --to main`)
- ワークフローの手順(取り込み・前回の証跡)は、`ship-evidence.yml` の `run:` の本文を行番号で切り出し、`bash -e`(GitHub Actions が `shell` を指定しない `run:` に使う既定)で、偽の `gh` と `jq` の代役(この端末に jq が無い)を関数で差し込んで動かした
- 試験の強さは、実装を1か所だけ壊して試験が落ちるかで確かめた(`mutate.mjs`。壊した後は元へ戻す)
- 限界: 実機の GitHub では何も確かめていない。verify ジョブの `case` の分岐は読みだけ(jq が無く通しで動かせない)。回帰の全量(`npm run check`・`scripts/regress`)は流していない。`retention-days` の上限の扱いと、`bash -e` が既定であることは、公式の文書を今回は読み直していない(後者は H-1 の前提。直す前に1行確かめる価値がある)
- 誤って1回、実物の `gh` が `o/r` という架空のリポジトリ名で GitHub へ問い合わせた(404。利用者やリポジトリの情報は送っていない)。以後は関数で差し替えた

## 1. 所見

### H-1(高・表示と実態)前回の証跡を写しから読む経路が、成果物の取得に失敗した場合に届かない

- **表示**: ADR-0135 決定1「前回の証跡は、成果物を取れないとき、基底ブランチの写しのうち記録の時刻が最も新しいものから読みます」。`ship-evidence.yml` L168〜169 の注記も同じ。裁定 2.1 の最後の箇条が直すと決めた点
- **実態**: `ship-evidence.yml` L164〜167。`prev` が空でなく `gh run download` が失敗すると、`bash -e` がその場で手順を終える。L170 以降の後退に進まない。`continue-on-error: true` のため手順は成功に見え、集約は「前回なし」と出す
- **実行**(`steps.sh` の P1〜P6)

| 場面 | 結果 |
| --- | --- |
| P1 前回の実行あり・成果物なし・写しあり | `no artifact ship-evidence`、手順の exit=1、`evidence/previous/` は無い(**写しを読まない**) |
| P2 前回の実行なし・写し2件 | 新しい側(b2)を読み、notice を出す |
| P6 前回の実行あり・成果物あり | 成果物を読む |

- **P1 は例外の場面ではない**。`gh run list --workflow ship-evidence --status completed --limit 20` の先頭は、直近の完了した実行である。出荷の PR を開くと同じワークフローの verify(pull_request)が走り、その実行は成果物 `ship-evidence` を持たない。次の出荷では先頭が verify の実行になりやすい(この選び方は今回の差分より前からある)。成果物の保持(今回 90 日と明示)が実行の記録の保持より短いリポジトリでも同じ形になる
- **試験は検出しない**: `workflowProblems` は文字列 `docs/evidence/*/manifest.json` の有無だけを見る(`mutate.mjs` M10: ループを無効にして文字列をコメントに残すと通る)
- **直しの案**: (1) 取得を `gh run download … || true` にする、または後退を取得の成否と独立に置く (2) 前回の実行の選び方を、成果物 `ship-evidence` を持つ実行(`event` が push・workflow_dispatch で verify でないもの)に絞る (3) `ci-gates.md` L929 と `ship-evidence.yml` L157〜158 の「取得できない場合は『前回なし』」を、写しからの読みに合わせて改める (4) 試験は、手順の本文を切り出して動かす形にする(今回の `steps.sh` の形で足りる)

### H-2(高・表示と実態)IMPL-0244 の note が言う「欠落に数え、写しの値で充足に数えない」を、試験が確かめていない

- **表示**: `gate-criteria.md` L249 の IMPL-0244(`delivered`・`check=machine`・`test=template/scripts/gate/test-g5-missing.mjs`)の note「どの場合も欠落に数え、写しの値で充足に数えない」
- **実態(試験)**: `test-g5-missing.mjs` の `:ng` は文の関数 `g5MissingText` の単体、`:ok` はソースへの正規表現2本。`mutate.mjs` の結果:

| 壊し方 | test-g5-missing |
| --- | --- |
| M1 写しの結論が success なら `g5` を success にする(別の行に足す) | **通る(検出しない)** |
| M2 写しに結論がある PR を欠落に入れない | **通る(検出しない)** |
| M3 書き分けをやめる | 落ちる |
| M4 `gaps.push` を外す | 落ちる |
| M11 check run を読めないと record-copy の手順が失敗する | **通る(検出しない)** |

- 2本目の正規表現 `!/g5: g5 ?.*g5AtMerge/` は同じ行しか見ない。`:ok` は「適合の入力で通る場面」(implementation-marking.md「machine の要件」2)ではなく、ソースの形の確認である。実装の担当の申告(implementation.md「食い違い」1)のとおり
- **実態(実装)は正しい**。偽の gh で集約を通した結果(`scen.sh`。ホスティングの rollup と check-runs は空):

| 写しの `checks.gate_g5` | 出た文(要点) | `gateG5` の集計 | 欠落 |
| --- | --- | --- | --- |
| found: true / success | ホスティングから読めません…結論を success(check run 99…)…保持期間を過ぎて消えた可能性(マージから 106 日)…充足には数えません | success 0 / notRecorded 1 | 数える |
| found: true / failure | 同上(結論 failure) | 同上 | 数える |
| found: false | 写しにも check run がありません(必須チェックを経ずにマージされた可能性) | 同上 | 数える |
| found: null(read_error) | 区別できません(…写しが無い) | 同上 | 数える |
| 欄なし / 写しなし | 区別できません | 同上 | 数える |
| (rollup が SUCCESS。写しは true / false) | 文なし | success 1 | — |
| (rollup が FAILURE。写しは success) | `gate-g5 が failure です` | notSuccess 1 | 数える |
| 写しを後から success へ書き換え | 文は書き換え後の値を引く。別に「成立した記録の書き換え: …records/reviews/pr-7.json を変更」が欠落に出る | notRecorded 1 | 数える(2件) |
| gh が落ちている(写しで対応づけ) | 従来の文(写しで分岐しない) | notRecorded 1 | 数える |

  ADR-0109 決定2・ADR-0038 に触れる挙動は無い
- **直しの案**: 欠落を作る箇所(L3017〜3020 の輪)を純粋な関数(例 `g5Gaps(prs)`)へ出し、`:ng` は「写しが success でも欠落が1件出る」、`:ok` は「ホスティングが success の PR では 0 件」を入力と出力で確かめる。`g5` を決める式(L2058)も同じ関数へ寄せるか、今回の `scen.sh` の形(偽の gh の通し)を試験にする。直さない場合は、note を「機械の試験が確かめるのは文の書き分けまで。欠落に数えることはソースの形の確認による」へ狭め、`check` を見直す

### H-3(高・表示と実態)IMPL-0521 の note が言う機械の範囲(存在・追加だけ)を、試験もコードも閉じていない

- **表示**: `gate-criteria.md` L247 の IMPL-0521「機械が確かめるのは、写しの存在・digest の一致・追加だけであること」。裁定 6 の表は「出荷の PR 以外が足さないこと」も machine に数える
- **実態**:

| 条件 | コード | 試験(`test-evidence-manifest.mjs`) |
| --- | --- | --- |
| digest の一致 | `verifyManifest`。1 バイトの変更・削除・一覧に無い追加・壊れた一覧・一覧なしを検出(E1〜E3・E9・E11) | あり |
| 写しの存在 | **確かめていない**。verify ジョブは、差分に `docs/evidence/*/*` があるときだけ動く。一式を持たない出荷の PR は何も言われない。`evidence.json` を欠く一式も通る(E12)。`files: []` で一覧だけの置き場も通る(E6) | 文字列 `evidence-manifest.mjs write` の有無だけ。`git add -f "$bundle"` を外しても通る(M8) |
| 追加だけ | `ship-evidence.yml` L438〜441(既存の検査。`docs/evidence` を含む) | **無い**。L440 を無効にしても、`test-evidence-manifest`・`test-base-judge-workflow`・`test-records-history`・`test-aggregate-records` はすべて通る(M9) |
| 出荷の PR 以外が足さない | L473 | **無い**(M7 で通る) |
| verify ジョブが verify を呼ぶ | L478 | 文字列の有無だけ。コメントに落としても通る(M6) |

- **直しの案**: (1) verify の `case` の中身(状態の一覧と置き場を受け取り、失敗の一覧を返す)を `evidence-manifest.mjs` か別のスクリプトの純粋な関数へ出し、追加以外・出荷の PR 以外・一式の欠け(出荷の PR に置き場が1つあり、`evidence.json` と `manifest.json` を持つ)を入力と出力で試験する (2) 直さない場合は、note を「機械の試験が確かめるのは、digest の一覧の作成と照合、およびワークフローに手順の文字列があることまで。写しの存在と追加だけであることは、ワークフローの手順に依り、試験は無い」へ狭める

### M-1(中・表示)digest の一覧は自己整合しか示さない。開示が足りない

- `verifyManifest` は置き場の中の一覧と中身を比べるだけである。中身と一覧を揃えて書き換えた一式(E4)、一覧から落として中身も消した一式(E5)、`note` を「保管した」に・`target` と `range` を別の値に書き換えた一覧(E7)は、どれも「digest の一覧と一致」になる。一覧の `path` が置き場の外(`../outside.txt`)を指しても通る(E8。基底ブランチのスクリプトが PR の側の一覧の指すパスを読む。漏れるのは一致・不一致だけ)
- 出荷の PR の時点では、すべてが「追加」なので、L440 の検査も掛からない。verify は一式を再集約の出力と突き合わせない。つまり、出荷のブランチへ書ける者が PR の前に差し替えた一式は、検出されない
- 基底ブランチへ入った後の書き換えは、PR の verify(追加以外は失敗)が検出する。ただし `ship-evidence-verify` は必須チェックではない(`.github/rulesets/*.json` の `required_status_checks` は gate-g5・gate-g5-base・d0-check だけ)。失敗しても承認者が見なければ取り込める(今回の差分より前からの設計。README は「承認者は verify の結果を確かめる」)
- **直しの案**: IMPL-0521 の note と ADR-0135 決定1 に「一覧は置き場の自己整合を示すだけで、ワークフローが出した一式であることは示さない。出荷の PR へ入る前の差し替えは検出しない。verify は必須チェックではない」を足す。閉じるなら、verify の再集約の `evidence.json` と一式の `evidence.json` を、時刻の欄を除いて比べる(決定可能かは実行で確かめる)。`path` は置き場の内側に限る

### M-2(中・表示)一覧の `range` と `target` が、集約の実際の範囲と食い違いうる

- `ship-evidence.yml` L222〜225・L264。`range` は `${from:-start}..${to:-HEAD}`。タグの push では `from` が空なので `start..<タグ>` になる。集約は `--from` が無いとき直前のタグを起点にする(`aggregate-evidence.mjs` L1057〜1058)。一覧の `range` は実際の範囲ではない
- `target_sha` は `git checkout -b "$branch" "origin/$BASE"` の後に `${to:-HEAD}` を解く。入力なしの手動実行では基底ブランチの先頭になり、集約の終点(直近のタグ)とも、取り込みの手順の `target`(checkout したコミット)とも一致しない場合がある。その場合、一覧の `target` と `inputs.headSha` も食い違う
- **直しの案**: `range`・`target` は `evidence/evidence.json` が持つ集約の実際の値から取る。取れないなら欄を null にする

### M-3(中・表示)前回の証跡の写しを、照合せず・黙って読む

- `steps.sh` P3: 新しい側の一覧が壊れていると、**警告なしに**古い側(b1)を「前回」として読む。P4: 写しの `evidence.json` を一覧と不一致に書き換えても、**そのまま読む**(`evidence-manifest.mjs verify` を通さない)
- **直しの案**: 読む前に置き場を `verify` し、不一致・読めない一覧は warning に出して読まない(「前回なし」ではなく「前回の写しを読めない」と出す)

### M-4(中・表示)dependency-diff は取り込めない。ADR と注記は取り込むと書く

- ADR-0135 決定4「`coverage-result` と `dependency-diff` を取ります」、`ship-evidence.yml` L144 の注記
- `gate-g5.yml` L369〜372: ジョブ `dependency-diff` は `if: github.event_name == 'pull_request'`。出荷が取り込む実行は既定ブランチへの push(gate-g5-push.yml 経由)で、成果物 `dependency-diff` を持たない。毎回 warning になり、品質レポートの依存の差分は「記録なし」のままになる(`steps.sh` I1 でも warning)
- **直しの案**: ADR と注記を「push の実行には無い。取り込めるのは手動の実行などに限る」へ改めるか、取り込みを外す

### M-5(中・表示)EV-0261 の「確かめたのは…偽の gh による集約の実行」は、実装の時点では行われていなかった

- `ci-gates.md` の EV-0261 の末尾と、`implementation.md`「食い違い」1(「偽の gh による集約の通しは未実施」)が食い違う
- 本突合で、偽の gh による集約の通しを行った(H-2 の表、事象3・4 の下記)。記録の所在をこの文書にすれば、EV-0261 の文は実態と合う。**ワークフローの手順は実機でも偽物でも通していなかった**(H-1 はそこで見つかった)ので、「確かめたのは」に手順の切り出しの実行を足すなら、H-1 を直した後にする

### M-6(中・議長の裁定が要る)ADR-0135 決定2 の「採用者に求めること」の2点目が、既存の規定の文言より広い

- 決定2 は3点を「いずれも既存の規定の内側」と書く。2点目「保管の対象に証跡の一式(digest の一覧に載るもの)を含める」
- 第4章「判定が指す記録の保管」と `qms-document-control.md` L168 が保管の対象に挙げるのは「様式の判定記録」「レビューの写し」「判定記録と出荷の証跡が**指す**記録」である。集約の出力そのもの(`evidence.json`・外へ渡す開示)を対象に含めよ、とは書いていない
- 3点目「リポジトリの外の保管の要否を決め」も、決めることを求める文である(「課さないと決めたこと」は引き渡しと記録を課さないと書くが、要否の決定には触れない)
- 新しい義務の混入と読むなら「高」に当たる。本文(規範)と構成のキーは変わっておらず、保管日数の入力も足されていないので、ここでは中とした
- **直しの案**: 2点目を「証跡が指す記録(一式に含む取り込んだ入力の JSON を含む)を対象に含める」へ揃えるか、「準拠テンプレートが写すものの一覧。対象に含めるかは採用者の規程による」と書く。3点目は「引き渡すときは digest の一覧を使える」にとどめる

### M-7(中)`retention-days: 90` の明示が、保持を 90 日より長くしているリポジトリでは短縮になる

- 変更前は指定が無く、リポジトリの設定(非公開では最大 400 日)に従っていた。明示の 90 は、設定が 90 を超えるリポジトリで成果物の保持を縮める。ADR-0135・注記・EV-0261 はこの帰結に触れていない(上限を超える側だけを書く)
- 写しがあるので証跡は失われないが、H-1 のとおり、成果物が先に消えると「前回」が読めなくなる
- 上限を超える場合の扱い(失敗か切り詰めか)は、注記と EV-0261 が「実機で未確認」と開示しており、言い過ぎは無い
- **直しの案**: 注記と ADR に「設定が 90 日を超えるリポジトリでは短くなる」を足す。または明示をやめ、一時置きの注記だけにする(裁定 N-10 とは別の論点。議長が決める)

### M-8(中・表示)事象4 の所見が出る行の見出しが、検証の節には当たらない

- 品質レポート L90 の行は「写しとホスティングの記録の所見(…**写しを取った時点の値を記録とする**。所見であり欠落にしない)」。検証の節の有無は、今の本文で数える(裁定 N-16 で写しの本文では数えないと決めた)。写しに節が無く今の本文にある PR では、同じレポートの表に「あり」と出て、所見の行は「写しの時点の値を記録とする」と言う
- **直しの案**: 所見の文に「節の有無は今の本文で数えている」を足す

### M-9(中)IMPL-0246 を `delivered`・`machine` に改めた点(申告された食い違い)

- 改めること自体は妥当である。古い note(「取り込まない」)は実態と食い違い、`issue=333` のマークを 0 件にする規則もある
- ただし `test=` の試験が確かめるのは、文字列 `--name coverage-result` と `--json headSha` の有無だけである(M5: 比較を無効にしても通る)。note は「機械が確かめるのは、取り込みの手順の存在まで」と開示しており、言い過ぎではない。規定の中身(開示に起点と限定を出す)の試験は、`test=` に無い `test-coverage-scope.mjs` にある
- 取り込みの手順は実行で確かめた(I1 一致: 取り込み、`inputs.json` を書く。I2 不一致・I3 `gh run view` の失敗: 何も取り込まず warning)。I4: 実行に `license-scan` が無いと、`bash -e` で手順が終わり、`coverage-result` も取り込まない(並びは今回の差分より前から)
- **直しの案**: 開示の文の場面(`test-coverage-scope.mjs` の3場面)へ `IMPL-0246` の目印を移すか、`test=` をそちらへ向ける。取り込みは `license-scan` の成否と独立にする

### L-1(低)裁定 5.1-2 の「冒頭の注記へ、今回足した手順も実機で未確認と書く」が未実施

`ship-evidence.yml` L51〜52 は変わっていない。未確認の旨は L204 の注記と EV-0261 にだけある。

### L-2(低)写しの `status` を文に出さない

`g5MissingText` は `conclusion` だけを出す。マージの時点で実行中(`conclusion: null`)の写しは「結論を 不明…保持期間を過ぎて消えた可能性」と出る。record-copy の jq は `completed_at // started_at` で並べるので、完了より後に始まった実行中の run を選びうる(裁定は「完了の新しいもの1件」)。

### L-3(低)PR 本文の「複製 N 件」に一式のファイル数が入る

`ship-evidence.yml` L267。写し・様式の複製の件数として読むと合わない。

### L-4(低)SRC-0747 のカードに、公開 1〜90 日・非公開 1〜400 日の抜き書きが無い

`ci-gates.md` の表はこの値を同じ頁から引く。research-supplement.md 1 の表には抜き書きがある。カードの claims へ足す。URL・確認日(2026-11-15)・抜き書きは、3枚とも research-supplement.md と一致した。

### L-5(低・今回の差分より前)`${{ github.ref_name }}`・`${{ inputs.from }}` をシェルへ直接展開している

`ship-evidence.yml` L189〜190・L223。タグを push できる者・手動実行できる者(書き込みの権限)に限られる。今回足した行に、新しい展開は無い。既存の open Issue へコメントで足す範囲。

## 2. 確かめて所見なし

- **事象3 の開示**: 範囲が変更のとき、品質レポートの表(L136)・保証の開示の箇条(L277)・外へ渡す版(L124)の3か所に、起点と「出荷の範囲の全体の被覆ではない」が同じ行で出る。起点が無ければ「起点 記録なし」。全体の範囲は従来の文のまま。実装の担当が未確認とした「外へ渡す版」も出ることを確かめた
- **事象4**: 節の編集・写しに節が無い・今の本文に節が無い → 所見1件、`verificationSectionDiffs: [7]`、欠落の件数は変わらない。行末の空白と CRLF だけの違い・写しに本文が無い・写しが無い → 所見なし
- **権限**: record-copy.yml に増えたのは `checks: read` だけ。ship-evidence.yml の権限は変わっていない。起動は pull_request_target(closed。既定ブランチを checkout。ADR-0115 のまま)。PR の題名・本文は `env:` 経由で、`run:` へ直接展開していない。`test-base-judge-workflow` は 127 件とも通る
- **基底ブランチへ写す経路**: 署名を課す構成は `git diff --cached --name-only --diff-filter=A` で一式も運ぶ(読み)。`git add -f` で .gitignore を越える。CODEOWNERS の `/docs/evidence/` は置き場の下も覆う。出荷の PR 以外が一式を足せば verify は失敗する(読み)
- **写しの新しい欄**: `test-records`(93)・`test-next-records`(88)・`test-aggregate-records`(135)・`test-records-history`(44)は通る。`checks` を持つ写しで集約は通しで動いた。再実行の `shape` に `checks` は無い
- **docs/evidence/ の新しいファイル**: 一式を足した PR #8 のマージを作って集約した。出荷の PR は記録だけの PR に数えられないが、これは品質レポート(`docs/evidence/*.md`)でも同じで、今回の差分より前からの扱いである。`docs/evidence` を読むスクリプトは ship-evidence.yml と evidence-manifest.mjs だけ
- **回帰のスイート(`scripts/regress`)**: 改めた欠落の文・開示の文・`docs/evidence` を固定する期待値は無い(grep。スイートは流していない)
- **既存の決定**: ADR-0083・0084(表は書き換えず本 ADR に置く)・0109 決定1・2・5・0028(IMPL-0243 は表示し続ける)・0038・0026(EV-0261)・#294 K-7・implementation-marking.md(`plan=adopter` に `decision=`。第4章「判定の成立」は `impl-no-adopter.yaml` に無い)と矛盾しない。採らない案は ADR に13行ある。構成のキー・保管日数の入力は足されていない。本文(規範)の2文は変わっていない。限定は箇条の中にある
- **検査**: `lint:impl`・`lint:evidence`・`lint:refs`・`lint:sources`・`lint:scope`・`test:impl` は exit 0。`issue=333` を持つマークは 0 件
- **申告された食い違い**: IMPL-0246 → M-9。IMPL-0244 の適合側 → H-2。`evidence-manifest.mjs` の `impl-untraced.yaml` への登録 → 妥当(IMPL-0521 の `target` はワークフローで、スクリプトはそれが呼ぶ部品)。事象3 は2か所 → 出力は3か所に出る(上記)
- **環境**: `test-g5-aggregate` は 4 / 23 件が落ちる。変更前(3d9da56)の写しでも同じ件数で、作業ツリーの CRLF による(実装の担当の申告どおり)。template の作業ツリーの `scripts/vendor/tailoring-kb.json` の変更は行末だけ(内容の差分は 0)

## 3. Issue #333 の受け入れ条件

| 条件 | 判定 |
| --- | --- |
| 保管の置き場と期間の設計を決め、テンプレートへ実装する(または実装しない理由を記録する) | 置き場は実装済み、期間は ADR-0135 決定2 に理由つきで採用者へ委ねた。ただし H-1(前回の証跡の読み先)は、裁定が直すと決めた点が届いていない |
| 関係する実装マークを `delivered` にするか、`undelivered` のまま理由を書く | 形は満たす(IMPL-0243 は adopter、0244・0246・0521 は delivered)。H-2・H-3 のとおり、0244 と 0521 の note が言う機械の範囲は、試験の実物より広い |

閉じる前に、H-1〜H-3 を直すか、note と ADR の文を実態へ狭める。

## 4. 内訳

| 重大度 | 件数 | 所見 |
| --- | --- | --- |
| 高 | 3 | H-1・H-2・H-3(いずれも表示と実態の食い違い) |
| 中 | 9 | M-1〜M-9(M-6 は義務の混入と読むかを議長が決める) |
| 低 | 5 | L-1〜L-5 |

既存の決定との矛盾・権限の増加・スクリプトの注入(今回足した行)は、見つからなかった。
