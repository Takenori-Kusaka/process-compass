# 束 B28 独立の突合(2巡目・直した差分だけ)

突合 2026-11-20。1巡目の担当とも直しの担当とも別の文脈で見た。対象は template `7786d16..9c2d401`(2 コミット)と本体 `b277c100..20d0ab98`(graphify-out を除く)。基準は `ruling-fix1.md`(1巡目への裁定)と `review-1.md`(元の所見と陰性の確認の手順)。直しの担当の記録 `fix-1.md` は、§1〜§3 を書き終えてから読んだ(§4)。

実行の場所: template の LF の複製(`git -C template -c core.autocrlf=false archive 9c2d401 | tar -x`)を scratchpad の `r2/base` に作り、陰性の確認は1つずつ別の複製(`r2/n-<記号>`)で行った。node_modules のリンクは張っていない。作業ツリーと git の状態は変えていない(書いたのは本書だけ)。`npm run check`・`graphify update` は流していない。

基準の試験(壊す前。LF の複製): test-adapter 140 件一致、test-g5-aggregate 61 件一致、test-init-g5 188 件一致、test-aggregate-wiring 64 件通過。

## 1. 所見

高 0・中 1・低 2。

### 中

**M2-1 `changeListBetween` を check-pr 自身は使っておらず、同じ作り方の変更の一覧が check-pr.mjs の中に3つになった(二重の定義。一致を試験が固定していない)**
- 所在: `template/scripts/gate/check-pr.mjs` 983〜990 行(新設の `changeListBetween`)。check-pr 自身の一覧は従来どおり 1660〜1662 行(`measureCommitSize`)と 1742〜1757 行(PR の検査)の中で組み立てている。使う側は `mutation-stage.mjs` の `r1Of` だけ
- 根拠: `grep -n "changeListBetween" scripts/gate/check-pr.mjs` で、定義の1か所しか出ない。陰性 (d)(`changeListBetween` の `-M` を `--no-renames` に替える)では、test-adapter の rename の2件が落ちる。一方 test-check-pr は「270 場面と付随の確認が、期待と一致」のままだった。つまり check-pr の判定と段の判定が同じ一覧を使う、と機械は固定していない。今の挙動は一致する(段の実行 6・7。rename の規則で push・PR とも R1 になり段が走る。名前を外へ出す変更も from で当たる)。裁定 M-3 は「check-pr と同じ変更の一覧を使う。変更の一覧を段の中で新しく定義しない」とした。字面(段の中に定義しない)には合う。ただし「同じ一覧」は、関数の共有ではなく、同じ作り方を写した関数にとどまる。ADR-0244 決定2 の「check-pr と同じ変更の一覧」と、関数の注釈の「measureCommitSize と PR の検査が使うものと同じ作り方」は、今は事実と合う。しかし、check-pr 側だけを直すと黙って食い違う形である
- 直しの向き(案): check-pr の2か所(`measureCommitSize` と PR の検査)も、numstat の結果と name-status の対応から変更の一覧を作る共通の関数を呼ぶ形にして、段と同じ関数を通す。サイズの算定が numstat の行(lines)を要るので、`changeListBetween` を「numstat の項目と状態の対応 → 一覧」の純関数と「git から取る」薄い包みに分けるとよい。手の入れ方を変えない場合は、試験で同じ入力に対し check-pr の一覧と `changeListBetween` の一覧が一致することを確かめる
- 残す場合の開示の形(2巡目で閉じる前提): ADR-0244 決定2 の文を「check-pr と同じ作り方の変更の一覧(名前の変更を検出する)」に改める。IMPL-1029 の note に「段の変更の一覧は check-pr の一覧と同じ作り方の別の関数で、一致は試験で固定していない」と1文を足す

### 低

**L2-1 settings.md の文「段のコマンドは R1 の変更の PR と案件の条件に当たる構成でだけ走り」は、push の経路と手動の実行を落としている**
- 所在: `template/.claude/skills/process-change/kinds/settings.md` 14 行(`ci.mutationThreshold` の行の末尾)
- 根拠: 段の実行 4(`workflow_dispatch`・コマンドあり)は exit=0 で走った(必須の理由: 「この起動の経路(workflow_dispatch)ではリスク区分を判定しない」ため必須の側に倒す)。段の実行 6・7(push の経路・下限 R1)も走った。「でだけ」は実態より狭い。README 第17項と ADR-0244 決定2 は、手動の実行と判定できないときを必須の側に挙げており、食い違いは settings.md の1文だけ。走る範囲を狭く書いており、統制が弱く見える向きではない
- 直しの向き(案): 「段のコマンドは、R1 の変更(PR と push)、案件の条件に当たる構成、R1 かを判定できないとき(手動の実行を含む)に走り、R2・R3 の PR・push では走らせず注意で通る」とする
- 残す場合の開示の形: 編集の指摘として次の束で直す(意味は README 第17項が正しく持つ)

**L2-2 IMPL-0930・0763 の note の試験の一覧に、直しで足した試験の所在が無い**
- 所在: `safety-verification.md` 269 行(IMPL-0930)、`tailoring-guide.md` 1218 行(IMPL-0763)
- 根拠: note は「構成に閾値が無いことの注意を出荷の集約へ出すこと…test-adapter.mjs・test-g5-aggregate.mjs が確かめる」「確かめるのは段の存在・出力の行・閾値との比較・集約の式まで」のまま。直しの後、集約の報告への出力を確かめるのは test-aggregate-wiring.mjs(陰性 (f) で落ちる)、契約検査の閾値は test-init-g5.mjs(陰性 (e) で落ちる)、段のジョブの結線は test-g5-aggregate.mjs 9b(陰性 (b)(c) で落ちる)である。note は確かめる範囲を実態より狭く書いており、主張を過大にする向きではない
- 直しの向き(案): note の試験の所在に test-aggregate-wiring.mjs・test-init-g5.mjs を足し、「確かめる」範囲に段のジョブの結線(呼び出し・env・全履歴)を足す。`impl:write`
- 残す場合の開示の形: そのまま残しても誤認は生まない(狭く書いている)。次の束の編集で揃える

## 2. 実行の記録

### 2.1 裁定の各項の照合

| 項 | 裁定の中身 | 直した差分 | 判定 |
| --- | --- | --- | --- |
| H-1 | 必須でないときは段のコマンドを走らせず、注意で終了 0。空のときの注意は保つ。陰性の試験。README・settings・ADR を合わせる | `adapter.mjs` 153〜159 行。空の分岐(90〜99 行)はそのまま。試験は R2・閾値割れ・行なし・走っていないこと(目印のファイル)・R1 は走る・CL3 は R2 でも走る | 合う(段の実行 1〜3・8。settings.md の文は L2-1) |
| H-2 | 段のジョブの手順・env の4つ・fetch-depth 0 を値の一致で固定。`run: "true"` で落ちること | test-g5-aggregate 9b | 合う(陰性 (b)(b2)(c)) |
| H-3 | IMPL-0931 の古い文を消す・経緯は日付つき | 「段が無かったのは 2026-11-15 時点の経緯」へ。7.3 の文は「その機械は降りていない(U6)」へ | 合う |
| M-2 | 理由の文を「この起動の経路(<event>)ではリスク区分を判定しない」。README に手動の実行 | `r1Of`。経路が空のときは従来の「分からず」の文を保つ | 合う(段の実行 4・5・5b・5c) |
| M-3 | check-pr と同じ変更の一覧。段の中で新しく定義しない。rename の試験(push と PR) | `check-pr.mjs` に `changeListBetween` を新設し、段から呼ぶ | 挙動は合う。共有は不完全(M2-1) |
| M-4 | 結線の値の一致に基底の構成を含める。基底 80・作業ツリー未設定・score 70 → 失敗 | 9b に含めた。test-adapter に未設定と 50 の2組、基底の構成なしの1組 | 合う(陰性 (c)) |
| M-5 | 契約検査の試験に CL3・閾値未設定と、文字列の閾値 | test-init-g5(1名・3名) | 合う(陰性 (e) で4件落ちる) |
| M-6 | 集約の出力に行が出る・出ないを、集約を実行する試験で | test-aggregate-wiring の 0763・0930 の節 | 合う(陰性 (f) で2件落ちる) |
| L-1・L-2 | 80/80 が通る組、行頭でない行の拒否 | 80/80、79.9 の組。空白始まり・語の後ろの2組 | 合う(陰性 (g)(g2)(h)) |
| L-3 | settings.md に「最後の1行を読む」 | 足した。機械は不変 | 合う |
| L-5 | 案件の条件で閾値が無いときの文 | `mutationThresholdNote(config, d0Text)`。集約は D-0 の本文を渡す | 合う(test-adapter の単体と test-aggregate-wiring の CL3) |
| L-6 | F.6 の文 | 「閾値を定めた場合は数値であること」 | 合う |
| L-7 | ADR-0244 の影響の項 | U4b 後の実態(集約の success・注意の1行・結線の試験・降りていないもの)へ | 合う |
| L-8 | README 第17項に「検査対象が存在する構成」 | 同じ項の段落の中に足した | 合う(#226 の書き方) |
| 採らない案 | H-1 の「走らせて注意に出す」、M-2 の「注記にとどめる」 | ADR-0244「課さないと決めたこと」に2行で記録。実装に紛れていない(段の実行 1・3 でコマンドが走っていない。4・5 で必須) | 合う |

### 2.2 段の実行(`scratchpad/r2/live.mjs`。node スタック・package.json あり。目印のファイル `ran.flag` でコマンドが走ったかを見る)

| 場面 | 終了コード | 走ったか | 出力の要点 | 裁定との照合 |
| --- | --- | --- | --- | --- |
| 1 R2 の PR・コマンドあり(基底の閾値 80・score 10) | 0 | 走らない | 注意「この変更では必須ではありません。走らせません」 | 合う(H-1) |
| 2 R1 の PR・同じコマンド | 1 | 走る | 「必須の理由: この変更が R1(PR の本文の区分が R1)」「スコア 10 が閾値 80 に届きません」 | 合う |
| 3 R3 の PR・コマンドあり | 0 | 走らない | 同 1 | 合う |
| 4 workflow_dispatch・コマンドあり | 0 | 走る | 「この起動の経路(workflow_dispatch)ではリスク区分を判定しない…必須の側に倒す」、閾値なしで通過 | 合う(M-2。必須の側) |
| 5 workflow_dispatch・空 | 1 | — | 同じ理由で「"mutation" が空です」 | 合う(M-2) |
| 5b schedule・空(参考) | 1 | — | 「この起動の経路(schedule)では…」 | gate-g5.yml に schedule の起動は無い(`on:` は pull_request と workflow_call 等)。所見にしない |
| 5c 経路なし・空 | 1 | — | 「起動の経路(PIT_IN_EVENT)が分からず」(従来の文) | 合う |
| 6 rename の規則(push・トレーラ R2) | 0 | 走る | 「必須の理由: この変更が R1(区分の下限が R1)」 | 合う(M-3。1巡目は exit=0「必須ではありません」) |
| 6 rename の規則(PR・本文 R2) | 0 | 走る | 同上 | 合う |
| 7 名前を規則の外へ出す(push。from だけが規則のパス) | 0 | 走る | 区分の下限が R1 | 合う(check-pr の riskFloorOf の from の扱い) |
| 8 CL3・R2 の PR・コマンドあり | 1 | 走る | 「必須の理由: 安全重要度 CL3」、閾値割れで失敗 | 合う(案件の条件は区分に依らず必須。ADR-0224) |
| 9 R2 の PR・基底の閾値が文字列 | 0 | 走らない | 必須でない注意 | 段は必須でないので見ない。文字列の閾値は契約検査が落とす(陰性 (e) の対の試験が通ることで確認)。所見にしない |

regulatory: 直しは段 mutation だけを走らせない。段 regulatory は必須でなくてもコマンドがあれば走り合否になる(従来どおり)。附属書H H.1 の「R2 は合否条件にしない」は変異試験の列であり、ADR-0224 決定2・7 は規制要件の段を軸C の構成で必須とし、それ以外の構成での実行を禁じていない。食い違わない。

### 2.3 陰性の確認(`scratchpad/r2/neg.mjs`。1つずつ壊して関係する試験を流す)

| 記号 | 壊したもの | 結果 |
| --- | --- | --- |
| (a) | 必須でないときも走らせる(`adapter.mjs` の分岐の条件を `false &&`) | test-adapter 3 件 NG(R2 の PR で走らせない・閾値割れでも 0・行なしでも 0) |
| (b) | gate-g5.yml のジョブ mutation の run を `"true"` | test-g5-aggregate 1 件 NG。test-adapter・test-init-g5 は一致のまま(結線を見るのは 9b だけで足りる) |
| (b2) | ジョブ regulatory の run を `"true"` | test-g5-aggregate 1 件 NG |
| (c) | `PIT_IN_BASE_CONFIG` の書き出しを外す | test-g5-aggregate 1 件 NG |
| (d) | `changeListBetween` の名前の変更の検出を外す(`-M` → `--no-renames`) | test-adapter 2 件 NG(rename の push・PR)。test-check-pr は 270 場面一致のまま(M2-1) |
| (e) | 契約検査の閾値の呼び出しを消す | test-init-g5 4 件 NG(1名・3名 × 文字列・CL3 未設定)。test-adapter は一致 |
| (f) | 集約の注意の行を出さない(`if (false) R.push(`) | test-aggregate-wiring 2 件 NG(閾値なしの行・CL3 の行)。「閾値があれば出ない」の組は通る(対の陽性なので単独では常に通るが、対で意味を持つ)。test-adapter は一致(字面の検査は「`mutationThresholdNote(config,` を含む」で、出力の行は見ない) |
| (g) | 閾値の比較を `<` → `<=` | test-adapter 1 件 NG(80/80 の境界) |
| (g2) | 閾値の比較を `< threshold - 0.5` | test-adapter 1 件 NG(79.9 の組) |
| (h) | 出力の行の行頭の固定を外す | test-adapter 2 件 NG(行頭でない2組) |

常に通る試験の点検: 9b の陰性の組は、試験の中で文字列を置き換えた写しに `stageProblems` を当てる形で、実ファイルの置き換え(b・b2・c)でも 9b の陽性が落ちることを確かめた。H-1 の CL3 の組は終了コードを見ず「走ったこと」と出力の行を見る。走らせない向きへ壊すと落ちる形で、常に通る試験ではない。

## 3. 確かめて問題の無かった点

- H-1 の分岐は空のコマンドの分岐(90〜99 行)より後にあり、空のときの注意「R1 の変更の PR では、この段が空だと G-5 が失敗します」は保たれている。分岐は `phase === 'mutation'` に限り、regulatory と他の段は変えていない
- 案件の条件(附属書F の適用・CL3)は `decideStage` の `required = caseCond.required || r1.r1` のままで、区分に依らず必須(段の実行 8)。ADR-0224 決定1・6 と合う
- `changeListBetween` の追加は既存の関数を変えていない(新しい export だけ)。check-pr の挙動は不変(陰性 (d) で test-check-pr 270 場面一致)。`r1Of` の「差分を取れなければ読めない扱い」は `changeListBetween` の null で保たれている(name-status が取れないときは kind を modify に倒す。check-pr の2か所と同じ)
- `mutationThresholdNote` の2つ目の引数は省略時 null で、既存の呼び出しの意味を変えない。集約は D-0 の本文を、無ければ null を渡す
- README 第17項・ADR-0244 決定1・2・影響・「課さないと決めたこと」、IMPL-1029 の note は、直した後の実装と合う(段の実行 1〜8)。IMPL-0931 の note から現状と食い違う文が消え、経緯は日付つき。IMPL-0836 は今回の直しの範囲外で、変えていないことが正しい(regulatory は不変)
- 附属書H H.1 の追加文(assurance-case.md 93 行)は R1 の PR だけを規定し、R2・R3 の PR で走らせないことと矛盾しない
- 本体の台帳(implementation-ledger.md)の差分は IMPL-0931・1029 の note の再生成だけ
- 番号の衝突(IMPL-1035・EV-0345)は裁定どおり push の準備で扱うため、所見にしていない

## 4. 直しの担当の記録(fix-1.md)との食い違い

§1〜§3 を書き終えてから読んだ。

1. **(f) の「3 件 NG のうち1件が想定外」**: 同じ壊し方(`if (A.machineChecks.mutationThresholdNote) R.push(` → `if (false) R.push(`)で、落ちる試験は2件だった(閾値なしの行・CL3 の行)。「閾値があれば出ない」の ok の組は通る。test-aggregate-wiring は最後に集計の行 `NG 2 件(全 64 件)` を出す。この行も `NG` で始まるので、行頭の `NG` を数えると3件になる(本突合の `neg.mjs` も同じ行を拾った)。想定外の1件は試験の失敗ではなく、集計の行を数えたものと判断する。所見にしない
2. fix-1 の M-3 の記述「`measureCommitSize` と同じ作り方」「既存の関数の中身は変えていない」は事実と合う。ただし「同じ作り方」は共有ではなく写しで、check-pr 自身はこの関数を呼ばない(M2-1)。fix-1 の「2巡目はここを見てほしい」への答えは M2-1 である
3. fix-1 の M-2 の陰性(理由の文を外す → 1 件 NG)・L-5 の陰性(1 件 NG)は本突合では再実行していない。M-2 は段の実行 4・5 で文を、L-5 は陰性 (f) の CL3 の組で集約の文を確かめた
4. fix-1 の「regulatory は従来どおり走る(裁定の対象外)」は、§2.2 の末尾のとおり ADR-0224 と食い違わない
5. fix-1 は settings.md の「でだけ走り」の範囲(L2-1)と、IMPL-0930・0763 の note の試験の所在(L2-2)に触れていない
