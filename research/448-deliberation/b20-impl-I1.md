# 束 B20 実装 I1 の報告

- 範囲: 1 節(対立 1)、2 節 U1(0787・1008・1009)、3 節 U2(0739・0687・0631・0755)、4 節 U3(fastTrackMarkOf の移動、0612、0628、0669、0554)
- template のコミット(ブランチ b20): 1f88a27(U1)、82b9deb(U2)、d829597(U3)。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-I1-01〜03.bundle`
- template と本体は push していない

## 実装した内容

| 単位 | 内容 | 主なファイル |
| --- | --- | --- |
| U1 0787 | `extendedDueRows` で期限を延ばす書き換えを欠落にする。始点が読めなければ `unverifiable` で欠落にしない | `exception-expiry.mjs`・`aggregate-evidence.mjs` |
| U1 1008 | `lapsedSimilarRows` で類似検知の期限超過と日付として読めない行を欠落にする。有効な延長の行は数えない。`countRangeExceptions` は変えない | 同上 |
| U1 1009 | manual。マークのみ(ファイルの変更なし) | gate-criteria.md |
| U1 | 類似検知の延長の書き方を 1 行 | `.claude/skills/gate/reference/exception-paths.md` |
| U2 0739 | 項目3 に G-6 未達の R2 の件数の行(`r2G6UnmetOf`・`r2G6UnmetLine`) | `aggregate-evidence.mjs` |
| U2 0687 | `inputRecordGaps`(D-0 の不在・changeLog の不在)。見出し 7 個と成立判定の本文は、D-0 を除いた一時の置き場の通しで固定 | 同上 |
| U2 0631 | 実装は規定どおり。`stopFindings` の試験で固定 | `test-aggregate-records.mjs` |
| U2 0755 | `valueOwnerAgreementState` が NFKC 完全一致の「置かない」を `not-placed` にし、集約が G-2 を未達として表示。様式 08 の説明に値を足した | `config.mjs`・`aggregate-evidence.mjs`・`templates/08-ai-sla.md`・`next.mjs` |
| U3 移動 | `fastTrackMarkOf` を `exception-expiry.mjs` へ移し、`*`・バッククォート・括弧前の空白・全角を許す。`check-pr.mjs` も同じ関数 | 同上 |
| U3 0612 | `fastTrackMetrics`(発生率・回収完了率・欠陥は結べた件数と空欄の件数を併記)を項目7 へ | `exception-expiry.mjs`・`aggregate-evidence.mjs` |
| U3 0628 | `restrictedStateExceptions`(B-2 の決定者・返却の目安の日付と回収責任者を欠落、読めなければ未確認、印の無い行は件数のみ) | 同上 |
| U3 0669 | `exceptionQuotaText`(枠・行使・残り、超過は止めない)。ステージの累計は直前のステージ移行ゲート通過のコミットの台帳との差 | 同上 |
| U3 0554 | `check-pr.mjs` の `pr-rules` で、写しと台帳・閾値・停止の解除の様式の同時変更を失敗にする。記録用ブランチと同名・同内容の様式は除外。読めなければその様式だけ注意 | `check-pr.mjs` |

本体: マーク 11 件を更新(0787・1008・0739・0687・0631・0755・0612・0628・0669・0554 は delivered / machine、1009 は delivered / manual)。ADR-0217 を起こした。台帳(impl・evidence・scope)を再生成した。

## 試験の結果

- `test-exception-expiry.mjs` 65/65、`test-roster-conditions.mjs` 54/54、`test-aggregate-records.mjs` 158/158、`test-check-pr.mjs` 265 場面、`test-aggregate-drift.mjs` 25/25
- 本体: `lint:impl`・`lint:evidence`・`lint:scope`・`lint:refs`・`lint:provisions`・`lint:tone`・`lint:skills`・`lint:registry`・`test:fields`・`test:impl`・`test:plan-issues`・`test:criteria` 通過。ADR-0217 は textlint 通過
- ng が実装の前に落ちることの確認: 0787・1008 は、集約だけを実装前の版に戻して通しの ng 場面が落ちることを実行で確かめた。その他は単体の ng が新しい export の不在、通しの ng が新しい欠落・表示の不在に依るため落ちる構成だが、実装前の版での再実行はしていない
- 回帰の全量(`npm run check`・template の全試験)は流していない(push の前に 1 回)

## 使った番号

- ADR-0217(I2 の分は決定 9 以降に足す。現在の本文は I1 の分の決定 1〜8 だけ)
- EV-0327(0612 の指標の根拠水準 E0。ADR-0217 に置いた)
- IMPL は新設なし

## 裁定と合わない点・判断した点

- 1008 の延長の成立判定は、IMPL-0786 の全条件のうち「検知した変更の作成を指示した者との照合」を含めていない。類似検知の行の対象(検知した変更)から指示者を導く経路が集約に無いため。note と ADR-0217 に開示した。必要なら I2 以降で足す
- 0669 のステージ累計は、範囲の中で 7.9.4 の条件に当たる行のうち直前のステージ移行ゲートの台帳に無い行を数える下限の値。範囲の外で足された行は再判定できない。表示に明記した
- 0628 の B-2 の決定者は、D-0 の会議体の表の B-2 の行の決定者の欄を席の名か役割名で引く。引けなければ未確認。新しい読み取りなので、実物の D-0 での動作は雛形の形でしか確かめていない
- 0612 の EV マークは標準の本文ではなく ADR-0217 に置いた
- 0755 は `next.mjs` の注記を `not-placed` のとき出さない(未達として集約が出すため)

## 残った点

- ADR-0217 の決定 9 以降(0667・0622・0638・0523)は I2 で足す
- 0554 の ng 場面と 0755・0739・0687 の ng の「実装前に落ちる」確認は未実施(上記)
- `graphify update .` は未実行
