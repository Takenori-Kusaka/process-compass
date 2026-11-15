# 実装の記録: #350・#349(decision.md §7.1 の手順1・2)

実装日: 2026-11-12。範囲は #350 と #349 だけ。#348・#340・ADR の新設は行っていない。

## 変えた所在

### #350(宣言行の無い CHANGES_REQUESTED)
- template `scripts/gate/autonomy.mjs`: `undeclaredChangeRequests`(写しから、`parseDeclaration` が null の CHANGES_REQUESTED を取り出す。読み方は増やしていない)、`undeclaredText`、`readRejectionRecords` の返り値 `undeclared`(記録用ブランチを読めないとき available=false)、`autonomyState` の窓ごとの件数(種別の範囲に入る変更の PR に限る)、`rejectionText` と 0% の停止の理由への表示。分子には入れない。
- 標準 `human-ai-boundary.md` 5.4.6: 「宣言行の無い承認レビュー」の項を追加(理由は「判定記録ではない」)。IMPL-0285 の note に件数表示を追記。

### #349(観測の窓)
- template `scripts/gate/config.mjs`: `OBSERVATION_WINDOW_DEFAULT`(2)、`observationWindowAt(config, day)`(記録した日 < 評価の日の最後の履歴。無ければ 2)、`observationWindowInfo`、`observationWindowProblems`(整数・下限2・記名と理由・日付の順・最後の値の一致。`configIntegrityProblems` に接続)。
- 構成の形: `observationWindow = { months, history: [{ months, recordedAt, decidedBy, reason }] }`。最小標本数の欄は持たない。
- template `scripts/init/generate-profile.mjs`: settings の `observationWindow` の入力検査(整数・下限2・`months` 以外の欄を拒否・変えるときは向きを問わず記名と理由、AI 名義は拒否)、履歴への追記、再生成での保持、差分の向き(長くする = 緩める。`push(..., -前, -後, M)`)、PROCESS-PROFILE の窓の文。
- template `scripts/gate/autonomy.mjs`: `windowOf(m, months)`、評価の日ごとに `observationWindowAt(config, m)` を当てる(遡らない)。現在の状態(判定不能か)は判定の日に効く窓。履歴の読み出しの起点を記録した最長の窓から導く(AM:661-662 相当)。`windowLengthText` を `rejectionText`(保証の開示の項目3)と `autonomyNoteLines`(/pit)に常に出し、既定より長いときは決定者と日付を併記。
- template `.claude/skills/process-change/kinds/settings.md`・`reference/input.md`: observationWindow の欄と向きを追記。
- 標準 `human-ai-boundary.md`: 表の2行目、「毎月、直近の観測の窓で評価する」、観測の窓の項、「長くした窓は…遡って当てない」の段落、新 EV-0259(E0、見直し 2027-10、上限を置かない)、IMPL-0285・0287・0288 の note。
- 標準 `gate-criteria.md`: 新 IMPL-0516(delivered、machine、test=test-check-delegation.mjs)を足し、IMPL-0268 の note を残り(一発承認率・短期書き換え率)に絞った。`src/data/impl-inventory.yaml` の該当節に IMPL-0516 を登録。
- `npm run impl:write`・`evidence:write`・`scope:write` で台帳を再生成。

## 試験(関係するものだけ。全量の回帰・全量の `npm run check` は流していない)
- `node template/scripts/gate/test-check-delegation.mjs`: 全通過、NG 0(既存の68場面は期待を書き換えずに通る。#350 の5件、#349 の12件前後を追加。IMPL-0516:ng/ok の目印あり)
- `node template/scripts/gate/test-loosening-decider.mjs`: 全通過(窓の入口の試験を追加: 窓1・2.5・minSample の拒否、記名・理由なしの拒否、4への変更の受理と履歴、ほかの設定での保持、短くする向きの記名要求)
- `node scripts/check-impl.mjs`・`check-evidence.mjs`・`npm run lint:refs`: exit 0。textlint(human-ai-boundary.md・gate-criteria.md): 指摘なし

## 仕様との差・後続への申し送り
1. **IMPL 番号**: 新 IMPL は IMPL-0516。IMPL-0515 は ADR-0127 が空けた番号のため使っていない。後続(#348・#340)は IMPL-0517 以降を使う。EV は EV-0259 を使用済み。次は EV-0258。
2. **IMPL-0516 の適用範囲は差し戻し率のみ**。decision §3.5 は「差し戻し率・手戻り率」に掛けると書くが、手戻り率は #348(手順3)の実装前に降りていると書くと表示と実態が食い違うため、note に「手戻り率は IMPL-0291 が降りた時点で同じ窓を使う」と書いた。#348 の担当は IMPL-0516 の note に手戻り率を足し、`observationWindowAt(config, m)` と `MIN_SAMPLE` を使うこと。
3. **現在の状態の窓**: 「判定不能の停止が新しい窓で解ける」を実現するため、現在の状態(`latest`)は判定の日(asOf)に効く窓で数え、0% の停止を探す評価の日ごとの判定は `observationWindowAt(config, m)`(m は月初)で数える。効力日は記録した日 < 評価の日(同日は前の値)。
4. **IMPL-0268 の `issue=349` は維持**。#349 は現在 open で、後継の既存 open Issue を検索したが「一発承認率」に当たるものは無かった。#349 を閉じる前に Q3(後継の起票の可否)の決定が要る。note は残りに絞り済み。
5. **未確認**: 窓を「短くする」向きの強化は記録だけを課し、拒否しない(仕様どおり)。`PROCESS-PROFILE.md` の既存の生成物は窓 2 のまま同じ文になるため再生成不要。G-1 の企画書(06-project-brief)に窓の行が無い点は decision §3.7 のとおり範囲外。独立の突合で、既存の IMPL がこれを覆っているかの確認は未実施。
6. 事前の注意: template の作業ツリーは CRLF(autocrlf)。パッチは LF 正規化して当て、CRLF で書き戻した。
