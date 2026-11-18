# 束 B20 直しの段 1(F1 出荷の統制)の報告

- 日付: 2026-11-18。担当: 段 1。範囲: 裁定 1 節、2 節(F-07)、3 節の F-01・03・04・05・06・09〜13
- template のコミット(ブランチ b20): `27c29a4`(0738・F-05・F-07・F-10〜13)、F-01・F-04、F-03、F-09、G-6.md。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-F1-1〜5.bundle`
- 番号: 新しい ADR・EV・IMPL は使っていない(ADR-0218 の slug を `0218-b20-ship-block-on-human-confirmation-unmet-and-stacked-layer-approval.md` へ改名。参照元は無かった)

## 実装した内容

| 項目 | 内容 |
| --- | --- |
| IMPL-0738 案 B | `config.mjs` に `UNMET_SHIP_SCOPE`・`unmetStopsShip`・`derivedUnmet`。`unmetShipBlockers`/`unmetShipGaps` は `{ extra }` を受ける。適合の主張(288 行)も `derivedUnmet`。`aggregate-evidence.mjs`: 3269 行の呼び出しを、判定記録の読みの後(`judgementRecords` の中)へ移し、G-2 と範囲の中の併記の未達(`cosignShipEntries`)を渡す。開示の `unmet` は `derivedUnmet` で、`howToResolve` を写す。`judgement-records.mjs`: `inRange` を写し、`cosignShipEntries` を足し、文を改めた |
| 評価者の段の未達(裁定 10 節の未確認) | 実行で確認。`test-roster-conditions.mjs` の場面(「集約: 安全性の評価者の段を読み…届かなければ記録の欠落にする」)が実物の集約で通過(57 件、exit 0)。`stepCompare` の不足は `auditRecordGaps` に入り、`gaps.push(...auditRecordGaps)` で欠落になる。裁定どおり実装し、議長へ戻す事態は無い |
| F-07 | `test-name-confirmation-timing.mjs` の D-0 の Q1 を「いいえ」に記入。直す前に NG 10 件(Windows の作業ツリーで確認)、直した後 exit 0 |
| F-01 | `reachRecordOf` が節「会議体の判定の記録」から欄名の完全一致で読み、判定の語がちょうど 1 つで先頭にあるときだけ採る |
| F-03 | `decision-recheck.mjs` に `decisionG3Passes`。`aggregate-evidence.mjs` の `g3Passes` を、基底の様式・記録用ブランチの様式(判定者が名簿の人で AI の名義でない)・宣言行のレビューの 3 経路に替えた。宣言行の版は、マージ時の head と一致するレビューならマージコミット、一致しなければ `commitId` |
| F-04 | `stackedLayerCheck` に必須の `hasValidApproval(n, copy)`(渡さなければ TypeError。例外は承認なしへ倒す)。呼び出しを PR の繰り返しの前へ移し、`independentConfirmation` を X の写しへ当てる述語を作った。アカウントの所見の副作用は戻す |
| F-05 / F-11 / F-12 | `lapsedSimilarRows` の「失効」の読み飛ばしを削除 / `extendedDueRows` の終点を区分で絞らない / `fastTrackMarkOf` が `_` も除く |
| F-10 | `fastTrackMetrics` に `inRange`。分子は範囲へ対応づく印の行。全体の件数と「範囲へ対応づかない行 N 件」を併記 |
| F-13 | 席が引けないとき、`resolveSigner(config, seatName)` の人を B-2 の決定者とする |
| F-09 | `extensionVerdict`(self / unverified / ok)。指示者本人の延長は成立させず、解決できない延長は成立に数えて項目7 に件数を出す |
| F-06 | gate-criteria の 2 か所、`template/.claude/skills/gate/gates/G-6.md` を裁定の文へ |
| 標準・ADR | tailoring-guide の表・IMPL-0738/0755 の note・EV-0331、roles-responsibilities の IMPL-0638 の note、ADR-0217 決定11 と選択肢の行、ADR-0218 の全面改訂(案 A を「採らない」、G-3 を「課さないと決めたこと」へ明記)、assurance-case 問21、gate-criteria と exception-escalation と deliverable-templates の note |
| 台帳 | `npm run impl:write`・`evidence:write`・`scope:write` で再生成 |

## 対の試験と、直す前に落ちることの確認

試験は `template/scripts/gate/` に置いた。コマンドは `node scripts/gate/<試験>.mjs`。

| 直し | 直す前の結果 | 直した後 |
| --- | --- | --- |
| IMPL-0738(`test-aggregate-records.mjs`) | 仮の export を足して実行し、NG 7 件: G-3 の `:ok` 3 件、`:ng` の「G-3 と並ぶ」「CL1 × 委託 × 置かない」「規制業 × 委託 × 置かない」「範囲の中の併記なし」。G-6・表に無い値・CL0 の `:ok` は元から通る(`:ng` の G-6 は現行の実装が既に止めていた) | NG 0 |
| F-01 | NG 2 件(様式 04 の全文を埋めた記録の読み、乙の継続 4 件) | NG 0 |
| F-04 | NG 3 件(bot の承認だけの X、判定の例外、述語の必須) | NG 0 |
| F-03(`test-decisions.mjs`) | `DR.decisionG3Passes is not a function`(関数が無く全体が落ちる) | 73 件通過 |
| F-05・F-10・F-12・F-11(`test-exception-expiry.mjs`) | F-05・F-12・F-10 の NG 4 件。F-11 は最初の入力(例外から類似検知)が両方の区分を拾うため通ったので、区分を「前提の受容」へ変えて作り直し、終点の絞り込みだけを元に戻して NG 1 件を確認 | 75 件通過(F-09 の 3 件を含む) |
| F-09 | `extensionVerdict` が無く import で落ちる | 通過 |
| F-07 | NG 10 件 | exit 0 |
| F-13 | 専用の試験を置いていない(下記) | — |

## 完了の条件の結果

`test-aggregate-records`・`test-decisions`・`test-exception-expiry`・`test-name-confirmation-timing` は exit 0。ほかに `test-roster-conditions`・`test-aggregate-drift`・`test-cl-judgment`・`test-g5-aggregate` も exit 0。`npm run lint:impl`・`lint:evidence`・`lint:refs` は exit 0、textlint は指摘なし。`test-discouraged-evidence.mjs` は Windows の CRLF の写しで落ちる(「D-0 の記録の表へ行を書き込めた」が NG。裁定 2 節のとおり、B20 の欠陥ではない)。回帰の全量は流していない。

## 残った点・裁定と合わない点

- **F-13 の対の試験は置いていない**。集約を通す場面(D-0 の B-2 の決定者の欄に氏名を書く)が要り、段 3 の結線の場面(`test-aggregate-wiring.mjs` の 0628)へ回す
- **F-04 の述語(`hasValidApproval`)は、実物の集約では動かしていない**。単体は通ったが、承認の無い層を含む通しの場面が無い。段 3 の 0498 の場面で、bot だけが承認した層・名簿の人が承認した層の両方を通す必要がある。例外は承認なしへ倒れるので、述語が壊れていると Y を過剰に数えない側へ倒れる点に注意
- **F-03 の宣言行の経路**も同じく通しの場面が無い(段 3 の 0523 の場面)
- 裁定の 1.3 は `unmetShipGaps` の呼び出しを「4852 行の直後」と定めたが、`judgementRecords` の中(`provisional` の算出の直後、`gaps` を読む前)へ置いた。同じ意味である
- F-09 の ADR-0217 の行は、「採らない」表の該当行を、解決できない場合だけ成立に数える形に書き換えた
- 文書の `ADR-0218` slug の改名に合わせて ADR-0217 の本文からリンクを足した。`lint:refs` は通る
