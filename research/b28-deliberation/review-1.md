# 束 B28 独立の突合(1巡目・全体)

突合 2026-11-20。対象は template `origin/main..b28`(5 コミット)と本体 `origin/main..HEAD`(graphify-out・research を除く)。基準は `ruling-1.md`・`ruling-u4a-returns.md`・`answers-1.md`・`ruling-draft-1.md` §1〜§3、ADR-0151・0200・0224、附属書F F.6・附属書H H.1/H.4、`326-deliberation/b26-ruling-6-9.md` 2.4・`b26-live-check.md`。実装の記録(impl-u4a・u4b)は、所見を書き終えてから読んだ(§4)。

実行の場所: template の LF の複製(`git -C template -c core.autocrlf=false archive b28 | tar -x`)を scratchpad に7つ作り、陰性の確認(1つずつ壊して関係する試験を流す)と、段の実際の実行を行った。node_modules は張っていない。作業ツリーと git の状態は変えていない(書いたのは本書だけ)。`npm run check`・`graphify update` は流していない。

基準の試験(壊す前): test-adapter 121 件一致、test-g5-aggregate 52 件一致、test-init-g5 182 件一致(LF の複製)。本体の作業ツリーで lint:evidence・lint:impl・lint:scope・check-section-refs は通過した。

## 1. 所見

### 高

**H-1 R2・R3 の PR でも、段のコマンドを書けば合否条件になる(H.1 の「R2 は合否条件にしない」と ADR-0244 決定1 の「必須でなければ注意を出して通し」と食い違う)**
- 所在: `template/scripts/gate/adapter.mjs` 156〜166 行(`if (phase === 'mutation')` の分岐は `stage.required` を見ない)、`mutation-stage.mjs` の `evaluateMutation`
- 根拠: 実行(`scratchpad/live.mjs`)。R2 の PR・基底の閾値 80・`score=10` → **exit=1**「スコア 10 が閾値 80 に届きません」。R2 の PR・出力の行なし → **exit=1**「行がありません」。R1 の PR では段のコマンドが要るので、採用者はコマンドを書く。書いた時点で、全ての PR(R2・R3 を含む)で段が走り、閾値と出力の約束が合否になる。附属書H H.1 の表は R2 を「週次の定期実行。合否条件にしない」、R3 を「任意」とする。`ruling-draft-1.md` §1.2 は「必須でなければ段の中で注意を出して success で終わる」とした。README 第17項の「R2・R3 の PR は落ちません」も、コマンドを書いた後は事実と合わない。EV-0345(所要時間と費用)の対象も R1 の PR だけで、全 PR に走る費用は開示の外にある
- 直しの向き(案): 必須でないとき(`!stage.required`)は、コマンドを走らせるなら結果を注意に出して exit 0 にするか、走らせずに注意で通す。どちらにするかは議長の裁定。陰性の試験(R2 の PR・閾値割れ → 0、R2・行なし → 0)を足す

**H-2 段のジョブが段を呼ばなくなっても、どの試験も落ちない(入口 gate-g5.yml → adapter.mjs の結線が試験で固定されていない)**
- 所在: `template/.github/workflows/gate-g5.yml` 441 行 `run: node scripts/gate/adapter.mjs run mutation`
- 根拠: 陰性(`scratchpad/mut.mjs` c2)。この行を `run: "true"` に替えると、test-g5-aggregate 52 件・test-adapter 121 件・test-init-g5 182 件がすべて一致のまま。ジョブは success になり、集約の success の検査も通る。つまり R1 の PR で段が空でも G-5 が通る形へ、うっかりの書き換えで戻せる。IMPL-0763・0930 は `check=machine`・`delivered` で、IMPL-1029 の note も「template へ降ろした」と書く。b26 の裁定 2.4 が守るとした「式の誤り(うっかり)」の範囲に、段のジョブの中身が入っていない
- 直しの向き(案): 試験(test-g5-aggregate か test-adapter)に、ジョブ `mutation` の手順が `adapter.mjs run mutation` を呼び、env に `PIT_IN_EVENT`・`PIT_IN_DIFF_BASE`・`PIT_IN_PR_BODY`・`PIT_IN_BASE_CONFIG` を渡し、`fetch-depth: 0` であることの値の一致を足す(決定可能)。`regulatory` も同じ

**H-3 IMPL-0931 の note が「G-5 の入口にミューテーション試験の段が無い(2026-11-15)」「7.3 の経路は…成立しない」のまま残り、同じ note の「降ろした」と食い違う**
- 所在: `src/content/docs/phase4-process-design/safety-verification.md` 298 行(IMPL-0931)
- 根拠: note を読んだ。「段のコマンド・必須の判定・閾値の型・出力の約束(束 U4a)と…は降ろした」と同じ note に、「G-5 の入口にミューテーション試験の段が無い(2026-11-15)」が残る。実態は段が在る。impl-u4b.md は「IMPL-0931: 降りていないのは閾値割れの 7.3(U6)だけと明記」と書くが、古い文は消えていない
- 直しの向き(案): 古い2文(段が無い・7.3 の経路の文のうち現状と食い違う部分)を消すか、日付つきの経緯へ移す。impl:write で台帳を再生成

### 中

**M-1 IMPL-1035 と EV-0345 が origin/main(束 B29)の番号と衝突している**
- 所在: `assurance-case.md` 93・100 行、ADR-0244 の「影響」「根拠水準」、`impl-inventory.yaml`
- 根拠: `git grep` で origin/main に `IMPL-1035`(human-ai-boundary.md 922 行。seeded-error-isolation、ADR-0250)と `EV-0345`(seeded-error-safety.md 55 行)が在る(c54205e2「本束の IMPL-1033 を IMPL-1035 へ付け直す」)。2点の比較 `origin/main..HEAD` では、B28 が B29 のマーク・ADR-0250 を消して見える(rebase をしていないため。B28 自体は消していない)。識別子の再利用は禁じられている
- 直しの向き(案): rebase の後に、IMPL・EV・ADR の番号を最大と照らして付け直す(ADR-0244 の本文の参照も)。`impl:write`・`evidence:write` を流し直す。tailoring-kb.json の `source.commit`(21e717c1 = wip のコミット)も再生成する

**M-2 `workflow_dispatch` の実行で、R に依らず段が必須になり、出力の理由が誤る**
- 所在: `mutation-stage.mjs` `r1Of` の先頭(`event !== 'pull_request' && event !== 'push'`)、gate-g5.yml の `on.workflow_dispatch`
- 根拠: 実行(live 10)。`PIT_IN_EVENT=workflow_dispatch`・空 → exit=1「起動の経路(PIT_IN_EVENT)が分からず」。経路は分かっているのに「分からず」と出る。空の mutation は全採用者の既定なので、手動の実行は全員で G-5 が落ちる。必須の側に倒すのは ruling-1 §1.3 に沿うが、README 第17項の「新しく落ちるのは次の場合」は「PR の本文・変更ファイルを取れない」だけを挙げ、手動の実行を挙げていない。契約検査は同じ場面を「基底を読めず確かめていない」の注記にしている(README 762 行)
- 直しの向き(案): 必須の側に倒すまま、理由の文を「この起動の経路(<event>)ではリスク区分を判定しない」に改め、README の項に手動の実行を足す。注記にとどめる案は ruling-1 §1.3 と食い違うので採らない

**M-3 区分の下限の判定が check-pr と食い違う(`kinds: ['rename']` の規則を段が拾わない)**
- 所在: `mutation-stage.mjs` 426〜431 行(`--no-renames`、`from` を持たない変更の一覧を自前で作る)
- 根拠: 実行(`scratchpad/rename.mjs`)。基底の規則 `{paths:['src/auth/**'], kinds:['rename'], floor:'R1'}`、`git mv src/auth/a.js src/auth/b.js`、トレーラ `Risk: R2`。check-pr の `riskFloorOf`(rename と from つき)は R1。段は push・PR とも exit=0「必須ではありません」。PR の経路は pr-rules が本文と下限の食い違いで落とすが、push の経路は段も pr-rules も止めない。ruling-draft-1 §1.2 は「R1 の判定は check-pr.mjs の関数を呼び、新しく定義しない」とした。変更の一覧の作り方が新しく定義されている
- 直しの向き(案): check-pr と同じ変更の一覧(名前の変更を検出し `from` を持つ)を使う。rename の規則の試験を足す

**M-4 基底ブランチの構成を渡す結線を壊しても試験が落ちない**
- 所在: gate-g5.yml 436 行(`PIT_IN_BASE_CONFIG` の書き出し)、`mutation-stage.mjs` `decideStage`
- 根拠: 陰性 c3(書き出しを `true` に)→ 3 つの試験とも一致のまま。陰性 a3(閾値を作業ツリーの値から優先して読む)→ test-adapter 一致のまま。基底の構成が渡らないと、閾値と区分の下限は作業ツリー(PR 側)の構成から読まれる。実行(live 5c): PR 側で閾値を外し基底を渡さない → score=70 で exit=0「閾値なしで通過」。ruling-1 §1.1 は「閾値は基底ブランチの構成から読む」。構成の ci の変更は check-pr の閾値の変更の検査(CONTROL_CONFIG_KEYS)が別に見るので実害は限られるが、ADR-0244 決定2・4 の「基底」を機械が固定していない
- 直しの向き(案): H-2 の値の一致に `PIT_IN_BASE_CONFIG` を含める。基底と作業ツリーで閾値が違う場面(基底 80・作業ツリー 50 か未設定・score 70 → 失敗)の試験を足す

**M-5 契約検査が閾値の問題を呼ぶことを、試験が固定していない**
- 所在: `verify-gate-contract.mjs` 871 行
- 根拠: 陰性 c6(呼び出しの行を消す)→ test-adapter 121 件・test-init-g5 182 件一致のまま。`thresholdProblems` の関数の単体試験はあるが、契約検査の結線は試験に無い。CL3 で閾値未設定は段の側でも落ちる(d8 で確認)ので二重の片方が無試験という程度
- 直しの向き(案): test-init-g5 か契約検査の試験に、CL3・閾値未設定・閾値が文字列の構成で契約検査が落ちる組を足す

**M-6 出荷の集約の「閾値が無い」の注意の試験は文字列の在否だけで、出力を見ていない**
- 所在: `test-adapter.mjs` 第8節の最後の check(`ev.includes('A.machineChecks.mutationThresholdNote')`)
- 根拠: 陰性 c7(`if (A.machineChecks.mutationThresholdNote) R.push(` を `if (false) R.push(` に)→ test-adapter 一致のまま。IMPL-0930・0763 の note は「構成に閾値が無いことの注意を出荷の集約へ出すこと…test-adapter.mjs・test-g5-aggregate.mjs が確かめる」と書き、`check=machine` を名乗る
- 直しの向き(案): 集約の出力(報告の表)にその行が出ることを試験で見る(test-aggregate-wiring の流儀)。できなければ note を「在否だけを確かめる」に改める

### 低

- **L-1 閾値の境界が試験に無い**: 陰性 a1(`<` を `<=`)→ test-adapter 一致のまま。実行(live 5b)で score=80・閾値 80 は通る(仕様どおり)。境界の組(80/80 → 通る)を足す
- **L-2 行頭の固定を外しても落ちない**: 陰性 d4。実行(live 12)では行頭でない行は拒否される。行頭でない行の陰性の組を足す
- **L-3 複数の行は最後の1行で判定する**: 実行(live 13)で score=10 の行の後に score=99 の行を出すと通る。コマンドの実質は manual で開示済み(EV-0339)なので所見としては低。settings.md・README に「最後の1行を読む」と書くかは任意
- **L-4 本文の区分が R1 と R2 の両方を含むと区分なしになり、下限だけで判定する**: `riskClassOf` の既存の挙動(live 15)。PR の経路は pr-rules が「区分が複数」で落とすので実害は無い
- **L-5 集約の注意の文が、案件の条件に当たる構成で誤る**: `mutationThresholdNote` は閾値が無ければ常に「閾値なしで通過します」と出すが、CL3・Q1「はい」の構成では段も契約検査も失敗にする。案件の条件では文を変える
- **L-6 F.6 の「機械が確かめるのは…閾値が数値で在ること」**(safety-verification.md 286 行)は、R1 だけの構成では閾値を求めない今回の決定と合わない。「閾値を定めた場合は数値であること」へ(編集)
- **L-7 ADR-0244 の「影響」の最後の項「集約が段のジョブの success を確かめること…は次の単位で降ろす」**は U4b の後では事実と合わない。push 前の未採用の本文なので直してよい
- **L-8 H.1 の追加文の「適用: 検査対象が存在する構成」**: 実行で確かめた(`none` で全コマンドが空、`undetermined` は `targetState` が present=false → 段は exit 0 の注意)。条文の限定は同じ文の中にあり #226 に合う。README 第17項にはこの限定が無い(足すかは任意)

## 2. 実行の記録

### 段の実行(`scratchpad/live.mjs`。node スタック、package.json あり、基底のコミットの後に src/a.js を足す)

| 場面 | 終了コード | 出力の要点 | 裁定との照合 |
| --- | --- | --- | --- |
| R1 の PR・空 | 1 | 「"mutation" が空です(必須の理由: この変更が R1(PR の本文の区分が R1))…7.3 の例外承認は使えません」 | 合う |
| R2 の PR・空 | 0 | 注意「R1 の変更の PR では、この段が空だと G-5 が失敗します」 | 合う(§1.4) |
| R1・score=none | 0 | 「対象の変異体なし…閾値の比較はしません」 | 合う(§1.1) |
| R1・score=72.5・閾値なし | 0 | 「閾値なしで通過…検出力が足りるとは主張しません」 | 合う |
| R1・基底の閾値 80・score=70 | 1 | 「スコア 70 が閾値 80 に届きません」 | 合う(7.3 は U6) |
| R1・80/80 | 0 | 「閾値 80 以上」 | 合う |
| 入力なし(環境変数なし)・空 | 1 | 「R1 かを判定できない…必須の側に倒す」 | 合う(§1.3・返し1) |
| 入力なし・コマンドあり | 0 | 必須の理由に「判定できない」と出て評価 | 合う |
| `echo 'mutation-result: score=100 survivors=x'`(Windows の cmd) | 1 | cmd が引用符を残すため行頭が崩れた。Linux の sh では通る。`node -e` で定数を出すだけのコマンドは通った(上の 72.5) | コマンドの実質は manual。IMPL-1029 の note・EV-0339・README・settings.md に開示がある |
| R2 の PR・コマンドあり・閾値割れ | **1** | H-1 | 食い違う |
| R2 の PR・コマンドあり・行なし | **1** | H-1 | 食い違う |
| workflow_dispatch・空 | 1 | 「起動の経路(PIT_IN_EVENT)が分からず」 | M-2 |
| push・トレーラ R2・空 | 0 | 必須でない | 合う |
| rename の下限の規則(rename.mjs) | 0 | check-pr は R1 | M-3 |

### 陰性の確認(`scratchpad/mut.mjs`。1つずつ壊して流し、元に戻す)

| 壊したもの | 関係する試験の結果 |
| --- | --- |
| (a) 閾値の比較を常に偽 | test-adapter 1 件 NG(落ちる) |
| (a) `<` を `<=` | **落ちない**(L-1) |
| (a) 閾値を常に作業ツリーから | 3 件 NG |
| (a) 作業ツリーの閾値を優先 | **落ちない**(M-4) |
| (b) R1 を下限だけ / 本文だけ | 3 件 / 2 件 NG |
| (b) 読めないとき必須にしない | 3 件 NG |
| (b) トレーラを読まない | 1 件 NG |
| (b) 下限を作業ツリーの構成から | 2 件 NG |
| (b) adapter の `stage.required` を捨てる | 10 件 NG |
| (b) R1 だけでは必須にしない | 8 件 NG |
| (b) regulatory の必須を捨てる | 1 件 NG |
| (c) 集約の needs から mutation を外す | test-g5-aggregate 12 件・test-init-g5 23 件 NG |
| (c) 集約の success の組から mutation を外す | 7 件 NG |
| (c) 段のジョブを `if: false` | 落ちない(b26 の裁定 2.4 が字面の検査を採らないと決めた。実行時は集約の success の検査が落とす。9e の模擬で確認済み)。所見にしない |
| (c) 段のジョブが adapter を呼ばない | **落ちない**(H-2) |
| (c) 基底の構成を渡さない | **落ちない**(M-4) |
| (c) 契約検査が閾値を見ない | **落ちない**(M-5) |
| (c) 集約の表へ注意を出さない | **落ちない**(M-6) |
| (d) 行が無くても通す / 所在の空を通す / 範囲を見ない / none 扱い / 終了コードを見ない | 1 / 1 / 1 / 6 / 1 件 NG |
| (d) 行頭の固定を外す | **落ちない**(L-2) |
| (d) 閾値なしの注意を出さない / CL3 の閾値未設定を通す | 1 / 1 件 NG |

常に通る試験の点検: test-g5-aggregate 9e は bash が無いと `check(..., false)` で落とす形で、黙って通らない。test-adapter の「終了コードが 0 でない」の組は期待の正規表現が `/./` だが終了コード 3 を見ているので常に通る試験ではない。期待の正規表現の逃がし忘れは見つけなかった。

## 3. 確かめて問題の無かった点

- ruling-1 §1.1: 出力の行の約束・none の通過・閾値の基底からの読み・閾値なしの1行・集約の注意の1行が実装と試験にある。採らない (a)(b)(c) は実装に紛れていない
- §1.2: H.4 の「検証に数えない」の文は変えていない。節番号は H.4 が正しい(assurance-case.md 341 行)。IMPL-1029 の note に「十分条件ではない」がある
- §1.3: PR は本文と下限の高いほう、push はトレーラと下限の高いほう。本文はイベントのペイロードから env で渡す(式を run に展開しない)。返し1(変更ファイルが取れなければ読めない扱い)のとおり。返し2 の squash の開示が IMPL-1029 の note にある。fetch-depth 0
- §1.4: 7つのアダプタに空の mutation・regulatory(試験で固定)。既定のコマンドは無い。注意の1行。settings.md と README に Stryker・cosmic-ray の例、go は例なし、時間の上限は手引きだけ。CHANGELOG.md は新設していない(README に明記)。回答 44 の「R1 だけの構成に閾値を求めない」と採らない旨が README と ADR にある
- §1.5: SHA の照合・日付の検査・署名は実装に無い。manual の開示がある
- §1.6: H.1 の追加文に限定を同じ文の中で書いた(scope-exempt に理由つきで登録)。F.6 の 7.3 に「閾値を定めている場合」。「優先」は意味を変えずに添えた。ADR-0244 は ADR-0151 決定1・ADR-0224 決定13 の一部置き換え、決定6 を変えないこと、課さないと決めたことを並べている。R2 の週次は別のマーク(undelivered)で note に「R1 の PR ごとの段とは別」
- 返し3: g5-local は段を呼ばない(コメントだけの変更。挙動は不変)
- 集約の式は b26-live-check.md の候補の式と、ジョブ2つの追加を除いて一致する(ANY_BAD・未設定の警告・pr-rules の例外・success の要求)。`successCheckedJobs` がジョブの一覧と式の一致を見る(2.4 の「値の一致で確かめる」)
- ADR-0224 決定6(案件の条件での閾値の必須)は段と契約検査の両方が維持している(d8 で確認)。ADR-0039(R は変更ごと)に合う
- ADR-0200: 移行の注意は README の取り込みの節。CHANGELOG を新設しない
- 実装マーク: IMPL-1029・0931・0836 は undelivered のまま(U5・U6 が残るため)で、state は実態と合う。IMPL-0763・0930 の delivered・machine は段の機能の試験には合う(結線は H-2・M-4〜M-6)
- 所有者の方針(2026-11-16): 条文(H.1・F.6)は結果と証跡だけで、手順(増分の渡し方・道具の選び方)は settings.md・README にある。細かい定義の新設は出力の1行の形だけ
- 様式09 の2か所の注は F.4 の注と合う。規則データ r-e-cl3 の注記の改めは kb に複製されている

## 4. 実装の記録(impl-u4a・u4b)との食い違い

1. impl-u4b「全ての note に、実物の gate-g5.yml の GitHub 上での通しは行っていない…を開示した」: IMPL-0930・0763 にはあるが、IMPL-1029・0931・0836 の note には無い(本文を読んだ)。低。揃える
2. impl-u4b「IMPL-0931: 降りていないのは閾値割れの 7.3(U6)だけと明記」: 明記はあるが、古い「段が無い」の文が残る(H-3)
3. impl-u4a「閾値の比較を壊す確認は…行っていない」: 本突合で行った。常に偽は落ちるが、境界(`<=`)は落ちない(L-1)
4. impl-u4a・u4b は R2 の PR でコマンドがあるときの挙動に触れていない。陰性・陽性の組が無い(H-1)
5. impl-u4a「新設の番号 IMPL-1035・EV-0345…push の直前に照らす」: 既に origin/main と衝突している(M-1)。手順としては予定どおりだが、rebase の時に必ず行う
6. impl-u4a「U5 で check-pr の基準値の変更に ci.mutationThreshold を入れる。基底に値が無いとき作業ツリーの値を使うのはこの検査に頼る」: check-pr は既に process.config.json の `ci` の鍵の変更を閾値の変更に数える(CONTROL_CONFIG_KEYS。check-pr.mjs 589 行)。U5 の範囲の要否は U5 で照らす。本突合の所見にはしない
