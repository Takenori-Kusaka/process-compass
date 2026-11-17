# #330 準拠テンプレート T-1〜T-8 議長の裁定の案(束 B12・軽)

日付: 2026-11-17。根拠: b12-01-drafter.md(起案)、b12-02-opponent.md(反対)、decision.md、ADR-0151。審議の重さは軽のまま。割れた点のうち新しい義務に当たる1点(T-8 の G-7 の欠落)は、重へ上げず所有者へ上げる(既定の実装は義務を増やさない側)。

## 0. 共通

- 直列で行う(準拠テンプレートを触る)。順序: T-8 → T-1/T-2 → T-3/T-4 → T-5 → T-7 → T-6 → 標準側の追随
- template のコミットのたびに bundle へ退避する。途中は関係する試験だけを流す。全量(template の contract 一式と標準の `npm run check`)は push の前に1回
- 新しい試験ファイルは gate-g5.yml の contract ジョブ(L179・L191 の並び)へ `- run: node scripts/gate/<名>.mjs` で結線する
- delivered machine にする各 IMPL は、試験に `IMPL-NNNN:ng` と `IMPL-NNNN:ok` を**別の行に**置く(scripts/check-impl.mjs の要件)
- 時計に依らない: 日付は引数で渡す。純関数は git を呼ばない(必要な値は引数の関数で受ける)

## 1. 項目ごとの裁定

### T-8 空・対象なしのライセンス検査を「実施」と記録・表示する誤り — 採る(最優先)

降ろし方: (a) 機械の検査。条件は「`adapter.mjs print licenses` の出力が空か」「アダプタのコマンドが空か・対象があるか」で決定可能。

1. **記録の側**: 新規 `template/scripts/gate/license-scan-record.mjs`。入力は `--outcome <steps.lic.outcome>`。`loadConfig`・`loadAdapter`・`targetState` で判定し、`evidence/license-scan.json` を書く
   - コマンドが空 → `{ "scanRun": false, "result": "skipped", "reason": "コマンドが未設定", "scannedAt": … }`
   - 対象なし(licenses は ALWAYS_PHASES に入らない) → 同じく `scanRun: false`、`reason: "検査対象が存在しない"`
   - それ以外 → 従来どおり `scanRun: true, result: <outcome>`
   - gate-g5.yml L352-356 の printf の段を `node scripts/gate/license-scan-record.mjs --outcome "${{ steps.lic.outcome }}"` に置き換える(`if: always()` は残す)
2. **集約の側**(古い記録・構成の変化にも効くよう両側で閉じる): aggregate-evidence.mjs の isMain より前に純関数 `licenseScanStatus({ licenseScan, phaseStatus, aggregate })` を export する。`phaseStatus` は `machineCheckStatus({ name: 'licenses', job: 'ip-clearance', … })` の値
   - phaseStatus が `未実施` で始まる → `{ run: false, text: phaseStatus }`(scanRun に依らない)
   - 記録が `scanRun: false` → `{ run: false, text: reason ? `未実施(${reason})` : '未実施' }`
   - それ以外 → 現行の L4145-4149 の式
   - 4か所(L3440・L4145・L5338・L6609)は `licenseScan.scanRun` ではなく、この関数の `run`・`text` を読む
3. **L3440 の記載の欠落**: 既定は「記録が無い(license-scan.json が無い)」ときだけ欠落にする(現行どおり)。構成で選んだ未実施(コマンドが空・対象なし)は欠落にせず、項目4 に未実施、G-7 基準8 の行に「なし(構成で選んだ未実施。記録の有無だけを見た)」、「記録」の節に「未実施(理由)」と出す。欠落にするかは **所有者へ上げる点 1**。切り替えは条件1つと試験1件で済む形にしておく
4. 試験: 新規 `template/scripts/gate/test-license-scan.mjs`(contract へ結線)
   - `IMPL-0995:ng` コマンドが空 → 記録 `scanRun false`・reason「コマンドが未設定」。集約の関数が `run false`、項目4 の値が `未実施(コマンドが未設定)`
   - `IMPL-0995:ng` 対象なし → reason「検査対象が存在しない」
   - `IMPL-0995:ng` 古い記録(`scanRun: true`)でもアダプタのコマンドが空 → `run false`
   - `IMPL-0995:ok` コマンドあり・成功 → `scanRun true`・「実施(success)」
   - outcome failure → `scanRun true, result failure`
   - 記録が無い → 欠落が出る。構成で選んだ未実施 → 欠落が出ない(既定。所有者の決定で反転する行)
   - 記録の側の試験は test-adapter.mjs の作業場(一時の構成)に倣う
5. 実装マーク: IMPL-0995 を `state=delivered check=machine test=template/scripts/gate/test-license-scan.mjs`。note を降りた挙動へ書き換え、欠落にしない扱いは「所有者の決定待ち(#330)」と書かず、決まった既定として書く(決定が反転したら note を改める)。plan・issue・review を外す

### T-1 項目4 の未実施の継続期間 — 採る(範囲を広げる)

降ろし方: (a) 機械の検査(表示)。値の前置きの一致と日付で決定可能。合否に使わない。

1. aggregate-evidence.mjs L4253 の `unmeasuredStreak` と L4267 の `streakText` を新規 `template/scripts/gate/unrun-streak.mjs` へ純関数で出す。署名例 `unrunStreak({ measured, prevSince, prevReleases, prevWasUnmeasured, previous, sameRelease, releaseDay, dayOfRef })`。項目6 の呼び出し(L4553・L4556)も同じ関数を使い、挙動を変えない
2. 対象: machineChecks の test・coverage・staticAnalysis・dependencyAudit・licenses・secretScan のうち、値が **`未実施` または `未測定`** で始まるもの(反対の指摘。カバレッジの未実施は `未測定(…)` と出る。所有者のコメント1件目の問いに答える)。`記録なし`(アダプタが無い)は対象外
3. 出力: `machineChecks.unrunStreaks = { <検査>: { since, releases, note } }` を足す。値の文字列は変えない。前回は `prevA.machineChecks.unrunStreaks`。前回が旧い形式(unrunStreaks なし)で値が未実施・未測定なら、既存の「起点を持たない旧い形式」の分岐で前回の出荷を起点にする
4. 理由が変わっても未実施・未測定が続く限り途切れない(IMPL-0993 の note)。実施に戻れば消え、再び未実施なら起点が新しくなる
5. quality-report.md の項目4 の表(L6152-6157)の該当行の値の後ろに ` / ${streakText(st)}` を足す
6. 期間の指定(`--period-*`)では前回を読まない(`if (period) return null`)ため、常に「前回の出力なし」になる。項目6 と同じ挙動として試験で固定する

### T-2 T-1 の試験 — 採る

新規 `template/scripts/gate/test-unrun-streak.mjs`(contract へ結線)。起案のケース一式(初回・2回目・3回目・同じ出荷の再集計・理由の変化・実施への復帰・検査ごとの独立・旧い形式)に、次を足す。

- カバレッジの `未測定(…)` が継続の対象になる
- 期間の指定で前回なし
- `IMPL-0993:ng` 未実施なのに継続を出さない形 / `IMPL-0993:ok` 出す形
- 100 回連続でも集約の problems・gaps が増えない(閾値を課さないと決めたことの固定)
- 項目6 の既存の試験が通ること(切り出しで挙動を変えていないことの確認)

実装マーク: IMPL-0993 を `state=delivered check=machine test=template/scripts/gate/test-unrun-streak.mjs`。plan・issue・review を外し、note にカバレッジの未測定を含むことを書く。

### T-3 adapter.mjs 冒頭の注釈 — 採る(編集)

- L9 を起案の案文に置き換える。**coverage は OPTIONAL から外さない**(外すと none・undetermined の空の coverage が exit 1 になり、IMPL-0495 の ok 側を壊す。decision の裁定4 は標準の本文の編集で、adapter の挙動の指示ではない)

### T-4 空の任意の検査 / 必須の段の試験 — 採る

test-adapter.mjs に節を足す。製品のコードの目印を置いて対象ありにする。

- `IMPL-0992:ok` lint・audit・licenses・install が `""` → exit 0、「実施しません。この事実は証跡へ残ります」、代役が呼ばれない
- `IMPL-0992:ng` test・secretScan が `""` → exit 1、「が空です」
- coverage が `""` → adapter は exit 0(注釈どおり。失敗は coverage-check.mjs が受け、test-coverage-scope.mjs の IMPL-0495 が既に固定している。足さない)
- 終了コードの伝播: lint・audit・licenses に FAKE_EXIT=1 → exit 1(T-7 から移す)

実装マーク: IMPL-0992 を `check=machine test=template/scripts/gate/test-adapter.mjs` へ戻す。note からライセンス検査の除外を外す(T-8 で表示が正しくなるため)。依存の導入は集約に項目が無いので除外のまま。

### T-5 対象なしの3項目 — 縮小して採る(delivered にしない)

- 試験: 製品のコードの無い構成で、項目4 の各検査が `未実施(検査対象が存在しない)` と出ること、秘匿情報の検査はそう出ないことを test-g5-aggregate.mjs に固定する(既存の machineCheckStatus の試験に足す。目印は付けない)
- IMPL-0239 は **undelivered のまま**。note を改める: 「基準と理由は項目4 が検査ごとに出し、続いていることは継続期間(IMPL-0993)で出荷ごとに見える。判定の時刻は記録していない(集約の時刻は G-5 の判定の時刻ではない)。実装の開始の後に用いないことは機械で止めない」
- 採らない: 集約の `generatedAt` を判定の時刻と読み替えて delivered にする案(表示と実態の食い違い)。各ジョブに記録を書かせて取り込む経路の新設(G-5 の全ジョブと ship-evidence の結線に及ぶ。継続期間で読める以上の信頼を足さない)

### T-6 手引き — 採る(写さない形)

- 置き場: template/README.md の「言語に依存しません」の節(L380-386)の後に小節
- 内容: 7種のアダプタ(node・python・python-poetry・python-uv・go・none・undetermined)ごとに lint・audit・licenses の既定を持つか(持つ / 空)の表。コマンドの正は `adapters/<id>.json` の commands と書き、**コマンドの文字列は写さない**(二重の正本を作らない)。空にすると項目4 に未実施と継続期間が出、G-5 は失敗しない旨。依存監査はどの言語にも道具があるが必須にしないと決めた旨(ADR-0151。課さないと決めた)
- rust・java などの例は載せない(未検証のコマンドを書かない)
- 試験は足さない

### T-7 依存の取得の失敗 — 一部を採る

- 採る: test-g5-aggregate.mjs に、setup-stack/action.yml の install の段(L38-40)に `continue-on-error` が無いことの構文の検査を1件(決定可能。依存の取得の失敗が黙って続く回帰を止める)。目印は付けない
- 降ろさない: 各スタックの検査器(npm audit・license-checker・pip-audit・govulncheck 等)が入力の欠落で失敗で終わるか。道具の実装で、テンプレートは保証できない。空の install と lock ファイルだけの構成で license-checker が空の一覧で通りうる筋が残るため、表示を続ける
- IMPL-0234 は分けない。undelivered のまま、note に「アダプタの終了コードの伝播は試験がある(test-adapter.mjs)。install の段に continue-on-error を置かないことを構文で確かめる」を足す

## 2. 標準の側の追随(template の後。同じ担当)

| 所在 | 変更 |
| --- | --- |
| gate-criteria.md L1049 IMPL-0992 | T-4 のとおり |
| L1051 IMPL-0995 | T-8 のとおり |
| L1723 IMPL-0993 | T-2 のとおり |
| L1027 IMPL-0239・L1055 IMPL-0234 | T-5・T-7 の note |
| L1533 IMPL-0046 | 「空のコマンドでも記録ありと数える(IMPL-0995)」を削る。state は変えない(#355 の範囲) |
| L1044 EV-0293 の対象の文 | ライセンス検査の表示の欠陥の一文を、直った旨へ改める。識別子・期限は変えない |
| template-repository.md L864 | 括弧「現在の準拠テンプレートは実施(success)と記録し…降りていない」を削る |
| ADR-0151 | 本文を書き換えない。research/330-deliberation/implementation.md に T-1〜T-8 の記録を追記する |

その後 `npm run template:kb`(規則データを変えていなければ差分なしの確認)・`npm run impl:write`・`npm run evidence:write`・`npm run lint:refs`。

## 3. 採らない案

| 案 | 理由 |
| --- | --- |
| T-8 を記録の側だけで直す(起案) | 古い記録・構成の変化が残る。集約でも判定する |
| T-8 の対象なしを直さない(起案の見落とし) | 同じ食い違いが対象なしでも起きる |
| coverage を OPTIONAL から外す | IMPL-0495 の ok 側を壊す。注釈で足りる |
| 継続の対象を `未実施` の前置きだけにする(起案) | カバレッジの未測定が漏れ、所有者の問いに答えない |
| IMPL-0239 を集約の時刻で3項目に当てて delivered にする(起案の推奨) | 判定の時刻ではない。表示と実態が食い違う |
| 対象なしの記録の書き込みの経路の新設 | 結線が G-5 の全ジョブに及び、継続期間以上の信頼を足さない |
| IMPL-0234・0239 を分けて部分を delivered にする | 降りた部分は規定の中身でなく、細かい定義を増やすだけ |
| README にコマンドの文字列を写す / 一致の機械検査 | 二重の正本。正は adapters/*.json |
| 継続期間への閾値・差し戻し、空の任意の検査の失敗化、依存監査の必須化 | ADR-0151 で課さないと決めた |

## 4. 所有者へ上げる点

1. **構成で選んだ未実施のライセンス検査(コマンドが空・対象なし)を、G-7 の記載の欠落「知財潔白性の検査記録がありません」に数えるか**。
   - 数える側の根拠: G-7 基準8(gate-criteria.md L1543)は「定めた検査を実施し記録したこと」を判定する。IMPL-0995 の note は、欠落が抑えられることを欠陥と書く
   - 数えない側の根拠: ADR-0151 決定1・3 は構成で選んだ未実施を失敗にせず、継続で差し戻さない。数えると none・undetermined の採用者は出荷のたびに G-7 で差し戻され、今は無い差し戻しが生じる。準拠テンプレートの基準8 の判定は、類似の検知でなくライセンス検査の記録の有無で代えている(IMPL-0046 undelivered)
   - 議長の推奨: 数えない(既定の実装)。表示は未実施と正しく出すため、取り違えは起きない。数えるなら G-7 の新しい差し戻しで、重の審議を要する
   - 決定が「数える」なら、T-8 の条件1つと試験1件を反転し、IMPL-0995 の note を改める

## 5. 議長の裁定(2026-11-17)

- 4.1 は所有者へ上げず、議長が裁定する: **数えない**(既定の実装のまま)。理由: ADR-0151 決定1・3 が構成で選んだ未実施を失敗にせず差し戻さないと決めており、数える案は G-7 に新しい差し戻し(採用者への新しい義務)を足す。既存の決定の範囲で閉じる側を採る。表示は「未実施(理由)」と正しく出るため、記録の有無を取り違える読みは起きない
- 採らない案: 構成で選んだ未実施のライセンス検査を G-7 の記載の欠落に数える案。採るなら重の審議で ADR-0151 を置き換える
- IMPL-0995 の note のうち「欠落が抑えられることを欠陥とする」読みは、この裁定に合わせて改める
- その他の項目は本ファイルの 1〜3 のとおり採る
