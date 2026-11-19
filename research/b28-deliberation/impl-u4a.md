# 束 B28 U4a の実装の記録(G-5 の段 mutation・regulatory と IMPL-1029)

実装 2026-11-20。裁定は `ruling-1.md`(最優先)と `ruling-draft-1.md` §1〜§3。途中でセッションが再起動し、途中のコミットを挟んで再開した。

## 変えたファイルと要点

### template(ブランチ b28)
- `scripts/gate/mutation-stage.mjs`(新規): 必須の判定(案件の条件 = Q1「はい」または CL3、または R1)、R1 の判定(`r1Of`)、出力の行の解釈(`parseMutationResult`)、閾値の型(`thresholdOf`・`thresholdProblems`)、段の評価(`evaluateMutation`)
  - R1: PR の経路は本文の区分(`riskClassOf`)と下限(`riskFloorOf`。基底の構成の規則)の高いほう。push の経路はトレーラ `Risk: R1` と下限の高いほう
  - 判定の入力が読めないとき(PIT_IN_EVENT なし・PIT_IN_DIFF_BASE なし・差分が取れない・PR の本文が渡されない・push でコミットが取れない)は必須の側に倒す。変更ファイルが取れなければ、本文があっても読めない扱い(下限を出せないため。裁定の「本文も変更ファイルも取れない」より厳しい側に解した。下の「議長へ返す点」)
  - 出力: `mutation-result: score=<0〜100 または none> survivors=<所在>`。none は閾値があっても比較せず通す。閾値なしは「閾値なしで通過。…検出力が足りるとは主張しません」を出す
  - 閾値は基底の構成(`PIT_IN_BASE_CONFIG`)から読む。案件の条件に当たる構成で基底に値が無いときだけ作業ツリーの値を使う(値を初めて入れる PR を止めないため)
- `scripts/gate/adapter.mjs`: mutation・regulatory はキーが無いことを空と同じに扱う(終了コード 2 にしない)。必須で空なら失敗。必須でなければ注意で通し、mutation は「R1 の変更の PR では、この段が空だと G-5 が失敗します」を添える。mutation は出力を取り込んで評価。環境変数 `PIT_IN_MUTATION_THRESHOLD` を渡す
- `scripts/gate/verify-gate-contract.mjs`: 閾値の型(常に)と案件の条件での未設定を問題にする
- `adapters/*.json` 7つ: 空の `mutation`・`regulatory`(既定のコマンドは置かない)
- `.github/workflows/gate-g5.yml`: 段のジョブ `mutation`・`regulatory`(構成済みなら常に走る)。fetch-depth 0、PR の本文はイベントのペイロード(`github.event.pull_request.body`)を env 経由で渡す、基底の構成と比較の起点を取り出す。**集約の needs と集約の手順は触っていない**
- `templates/09-safety-risk-assessment.md`: F.4 の注(Q1「はい」・CL3 のミューテーション試験はしない理由で省けない)を2か所に降ろした
- `.claude/skills/process-change/kinds/settings.md`: `ci.mutationThreshold` の行と出力の約束、例の道具(node: Stryker、python: cosmic-ray、go は例なし)
- `README.md`: 取り込みの注意 第17項(CHANGELOG は新設しない)
- `scripts/vendor/tailoring-kb.json`: `npm run template:kb` で再生成(r-e-cl3 の注記)
- `scripts/gate/test-adapter.mjs`: 第7節を追加(下)

### 本体
- `src/data/tailoring/rules-criticality.yaml`: r-e-cl3 の注記を「ミューテーション試験(実行前の故障挿入を含む)をCIの必須チェックに加える」へ
- 附属書H(`assurance-case.md`): H.1 の表の直後に R1 の変更の段の文(限定は同じ文の中)、EV-0345、IMPL-1029 の note の書き換え、IMPL-1035(R2 の週次。undelivered)
- 附属書F(`safety-verification.md`): F.6 の 7.3 の名指しに「閾値を定めている場合」と R1 の変更ごとの段を入れた。道具の無い言語の許しを R1 にも掛けた。表の「優先」に「R1 の変更は H.1 により必須」を添えた。EV-0339 の対象と差し替え条件を広げた。IMPL-0930・0931 の note に降ろした範囲を追記
- `tailoring-guide.md`: IMPL-0763・0836 の note に同上
- ADR-0244(仮番号): `src/content/docs/adr/0244-r1-change-requires-g5-mutation-stage.md`
- `src/data/impl-inventory.yaml`(IMPL-1035 を登録)・`impl-untraced.yaml`(mutation-stage.mjs)・`scope-exempt.yaml`(H の節の限定は同じ文の中)・台帳 3 つ(`impl:write`・`evidence:write`・`scope:write`)

## 試験と陰性の確認
- test-adapter.mjs に第7節(37 件追加。全 116 件一致)。R1 の PR で段が空→失敗/キーなし→失敗(終了コード 1)/R2 でキーなし→通り注意/本文 R2 で下限 R1→失敗/本文なし・経路なし・差分なし→必須で失敗/push のトレーラ R1→失敗・R2 で下限なし→通る・R2 で下限 R1→失敗/CL3 で R2 の PR でも空は失敗・閾値未設定は失敗・閾値ありで通る/規制業で regulatory 空→失敗/出力の行なし・スコアが数値でない・範囲外・所在が空・終了コード非 0 → 失敗/none → 通る/閾値あり割れ→失敗・届く→通る・none は比較せず通る・閾値が文字列→失敗/閾値なし→「閾値なしで通過」/閾値の型の契約/7つのアダプタの空のキー
- **陰性の確認**: `required: caseCond.required || r1.r1` を `caseCond.required` に壊すと 8 件が NG になることを実行で見た(元に戻して 116 件一致)。閾値の比較を壊す確認は、時間切れで中断したため行っていない(閾値割れの NG 試験は上にある)
- 他: test-adoption 123 件・test-coverage-scope 79 件・test-push-trigger 27 件・test-g5-missing・test-init-g5(NG 0)一致。本体: lint:refs・lint:impl・lint:evidence・lint:scope・test:fields・test:criteria・textlint(変更した md)通過
- **気になる点**: `test-aggregate-wiring.mjs` の全量実行で `IMPL-0925:ng 集約: 挿入した環境が模擬環境(TBD)…` が1件 NG(2回とも)。`1007 0925 0927 0934` を指定した単独実行では全件 ok。変更前の HEAD の複製(git archive)での全量は NG 0 件だった。mutation と無関係に見える(この試験は様式09を読まない)が、原因は未確認。次の単位で全量の前に再確認が要る
- 回帰の全量 `npm run check` は流していない(指示どおり)。test-g5-aggregate は CRLF で 4 件 NG(既知。直していない)

## 新設の番号
- IMPL-1035(R2 の週次。undelivered)、EV-0345(増分実行の所要時間と費用に公開の実測が無い)、ADR-0244(仮)。番号は push の直前に最大と照らす

## ruling-1 が「実装の担当が確かめる」とした点
- **節番号**: 「R1 は変異試験で検出力を測っていることを検証に数える条件に加える」の文は **H.4**(`## H.4 AI による確認の数え方` の表の「決定論的な検査」の行)にある。案と委員の「H.3」は誤り。H.1 の表が正本。ADR-0244 は H.4 と書いた
- **fork の PR の本文**: `pull_request` イベントのペイロード `github.event.pull_request.body` は fork の PR でも読める(取り出しにトークンの権限は要らない)。段のジョブは env 経由で渡している。実環境の fork での実行は、ここでは試していない(文書上の確認)
- **squash マージ後のトレーラ**: 実環境で確かめられない。PR の本文の末尾の段落(`Spec:` など)が squash の本文に入る既定はあるが、`Risk:` のトレーラが残るとは言えない。push の経路は下限を併用しているため、トレーラが落ちても下限の R1 は拾える。人が R1 と確定して下限が R2 以下のときは、PR の経路の判定(段の実行は PR で済む)に頼る。根拠水準マークでは新しく開示していない(EV-0345 は所要時間と費用だけ)。**議長へ返す点**に残す
- **`true` 類の検査の先例**: 既存の段(adapter.mjs・coverage-check.mjs・verify-gate-contract.mjs)に、コマンドが `true`・`echo` の類かを型で見分ける検査は見つからなかった。よって注意に出す検査は足していない(裁定どおり)
- **F.6 の表の「優先」と H.1 の「必須」**: 意味を変えない範囲で「(R1 の変更は、附属書H H.1 により当該範囲の変更のたびに必須)」を添えた。「安全関連部を優先する」は変えていない(安全関連部まで必須にすると意味が変わるため)

## U4b へ回した点
- 集約の needs に段のジョブ `mutation`・`regulatory` を足し、success を確かめて skipped を通さないこと(`G5_RULE_JOBS`。契約検査の needs の検査)
- 集約へ出す「構成に閾値が無いことの注意」の1行(ruling-1 §1.1)
- 出荷の集約の側のテスト(test-g5-aggregate は CRLF の既知の NG)

## U6 へ回した点
- 閾値割れを 7.3 の例外承認で受ける機械(台帳の行の約束。ADR-0243)。U4a は「閾値割れは失敗」まで。README と F.6 の文は「閾値を定めている場合の閾値割れは 7.3 の対象」と書いた(機械が受けるのは U6)
- IMPL-0996 の範囲の改め。台帳の行の約束は案件の段と R1 の段の両方に掛ける(ruling-1 §3)

## U5 へ回した点
- check-pr.mjs の「基準値と除外設定の変更」に `ci.mutationThreshold`・段のコマンドを入れること(閾値の下げを機能変更と同じ PR に入れさせない)。U4a の「案件の条件に当たる構成で基底に値が無いときは作業ツリーの値を使う」はこの検査に頼っている

## 議長へ返す点
1. **判定の入力が読めない範囲**: 裁定は「本文も変更ファイルも取れない」と書くが、実装は「変更ファイルが取れなければ(本文があっても)読めない」とした(下限を出せないため。必須の側に倒す方向なので裁定の趣旨に沿う解釈)。本文だけが取れず下限が取れる場合も、PR の本文が渡されなければ読めない扱い。緩めたい場合は決めてほしい
2. **squash マージ後のトレーラ**: 上のとおり確かめられなかった。push の経路のトレーラが落ちる場合の開示(根拠水準マークか note)が要るか
3. **手元の実行(`adapter.mjs run mutation` を PIT_IN_EVENT なしで実行)** は、読めない扱いで必須になる。`g5-local.mjs` がこの段を呼ぶ場合に手元で落ちる。g5-local の改めは U4a の範囲に入れていない(必要なら U4b)
4. **test-aggregate-wiring の全量での 1 件 NG**(上)。原因が分かるまで、U4b の回帰の前に確認

## コミット
- template(ブランチ b28): d73ab93(段・必須の判定・試験・ワークフロー・アダプタ。途中)、63a02aa(README・settings・kb)。退避: `E:/Github/process-compass/tmp/bundles/template-b28-03.bundle`・`template-b28-04.bundle`
- 本体: 21e717c1(途中: F.6・規則データ・template の参照)、続く最終コミット(附属書H・ADR-0244・マーク・台帳・本記録・template の参照)
