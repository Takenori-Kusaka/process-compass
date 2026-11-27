# 段 C(template): 値の扱いと、事故の後の警告 — 実装の結果

- 日付: 2026-11-28。template のブランチ `d4-466`(段 B の 0cdfab3 の上に 3 コミット)。本体・参照は触っていない。push していない。ADR 番号・Issue 番号・research への参照は、template へ足した文・コメント・試験の名に入れていない
- 方針: §9 の線(安全重要度 CL1 以上、または規制業 = 現行のまま止める)、§10 の 3(数え方を揃える)を当てた。新しい記入の欄・様式は足していない(構成の値の欄だけ)

## 1. 値(所在・未定義のときの挙動・出る所)

新モジュール `scripts/gate/detection-values.mjs`(読み取り・一覧・検査)。未定義 = 欄が無い、または履歴の最新の `value` が null。欄に直接 null は検査が拒む。

| 値 | 構成の欄 | 外した直書き | 未定義のとき |
| --- | --- | --- | --- |
| 最小標本数 | `detection.minSample`(整数、または `{history:[{value,recordedAt,decidedBy,reason}]}`) | `autonomy.mjs` の `MIN_SAMPLE`(generate-profile の import も外した) | 止めない。差し戻し率 0% の継続と手戻り率の検知は働かない(新状態「未定義」。判定不能とも 0% とも別)。委任した種類は当月の全件を事後に確かめる側へ倒す |
| 観測の窓 | `observationWindow`(既存。履歴に整数の months がある) | 判定側の既定。`OBSERVATION_WINDOW_DEFAULT` は検証の下限と別の観測(流れの観測)の既定として残した | 上と同じ。窓が未定義でも、数える窓は名目の 2 か月で表示するだけ |
| 同時保有の上限 | `reviewQueue.loadLimit` | `DEFAULT_LOAD_LIMIT`・環境変数 `REVIEW_LOAD_LIMIT`(yml の受け渡しも削除) | 上限の知らせを出さない(期限超過の催促は出る)。ログに 1 行の注意を出す |
| 事後の抜き取りの件数 | `delegation.sampling.perMonth`(既存) | `SAMPLING_DEFAULT_CAP = 5` | 月の定めは当月の全件。表示の出所は「定めていないため、当月の全件」 |
| 手戻り率の基準値 | `reworkBaseline`(既存) | 未設定で止める分岐 | 止めない。手戻り率の検知は働かず、当月の全件を事後に確かめる側へ倒す |

- 働いていない検知の名: `undefinedValues(config)` が値ごとの文を持つ。`autonomyState().undefinedValues` に出し、`warningLines()` が次の 3 か所へ同じ文を出す: `/pit` の注記(`autonomyNoteLines` 経由)、保証の開示の項目3(集約の AI自律レベルの節)、出荷の証跡の宣言の表(`tailoring` へ 1 行。欠落には数えない)。外へ渡す形は件数と値の名だけ
- 文(全文): 「定めていない値が N 件ある。働いていない検知: <値の名>(<内容>) / … 。値は自社の過去のトラブルとプロダクトの特性に合わせて決め、種別 settings で記録する(定めるまで検知は働かず、止めない)」。0% の継続の行: 「0% の継続の検知は働いていない(最小標本数か観測の窓を定めていない。止めない。委任した種類は当月の全件を事後に確かめる。…)」
- `/process-init` の手順 6b に、値の対話(5 つの値・決め方の手引きは例であって既定値ではない・採るかは利用者に聞く)を足した。入口は `/process-change` の種別 `settings`。`generate-profile.mjs` の settings の検証・書き込みに `detection.minSample`・`reviewQueue.loadLimit`(履歴・記名・理由。AI の名義は拒む)を足し、観測の窓は「未定義から 2 を置く」ことも履歴へ記録する形にした
- 構成の検査(`config.mjs`)に `detectionValueProblems` を結線した

## 2. 事故の後の警告

- 変更した分岐: `autonomy.mjs` の第1区分の Sev1・Sev2 の 3 経路(台帳が無い・原因不明・AI 起因あり/発生日無し)を `incident()` に通した。`strictIncident`(線の内側)なら従来どおり `stop`、それ以外は `warnings` へ
- 線の読み方: `detection-values.mjs` の `safetyOrRegulated(config)` = `answers['q-criticality'] !== 'cl0' || answers['q-quality'] === 'quality-regulated'`。`delegation.mjs` の条件1 と同じ式。**未記入は CL0 とみなさず、線の内側(止める側)**
- 変えていないもの: 理解保持者数の停止・第2区分の停止・上限・安全関連部・5.4.5 条件4 は触っていない
- 警告の文(AI 起因あり): 「AI が原因の重大な事故 <ID> <Sev>(AI 起因: あり)が <日> に発生した。止めていない。この事故の後に、<件数の文>。同じ所の変更を取り込む前に人が読む形へ戻すかを決める(委任の範囲を狭める・協働へ下げる・保護するパスへ足す)」。件数の文: 「この種類の範囲に入った変更 N 件のうち、取り込む前に独立の人の承認を経ていない変更が M 件ある(台帳の原因の変更が触れた所は特定せず、種類の範囲全体で数えている)」(承認の記録を読めないときは「…件数は、承認の記録を読めないため数えていない」)
- 原因不明: 「重大な事故 … 原因をまだ特定できていない。止めていない。原因の特定を進め、…決める」。発生日無し: 「…発生日が台帳に無く、事故の後に入った変更を数えられない。止めていない。発生日を台帳へ記入する」。台帳無し: 「<台帳> が無く、重大な事故(Sev1・Sev2)が AI の起因かを確かめられない。事故の警告は働いていない。事故が起きたら台帳へ記録する(止めない)」
- 出す所: `/pit`(`autonomyNoteLines`)、保証の開示の項目3(外へは件数だけ)、出荷の証跡の宣言の表、`delegation-eligibility`(`check-delegation.mjs` の render と `delegation.mjs` の `warnings`。該当の判定は変えない)。解決(AI 起因なし)で消える
- **実装していない所**: (a) `/pit` の「件数が変わったときだけ強調」(強調の状態を持つ置き場が無く、足さなかった)。(b) 期間の開示に「解決済みの事故の発生日から解決の日までの件数を残す」(警告の行は state に残るが、解決した行を期間で残す処理は無い)。(c) 件数の「所」は台帳の「原因の変更」のパスを読まず、行の変更種別の範囲全体で数える(全範囲側へ倒れて数が多めに出る)。(d) G-5 の出力へ「その所に触れる PR」の 1 行は足していない。いずれも本文の記述では undelivered の表示が要る

## 3. 数え方の揃え(§10 の 3)

- `derivePostHoc` に `approvedPrs` を足し、取り込む前に承認の記録がある変更を「事後へ移した変更」から除いた(集約の「独立した人の事前の承認が無い委任の変更」に揃える向き)。`readAutonomyRecords` が承認の記録を渡す
- **揃えきれていない所**: 集約は承認した者が独立した人かを見るが、判定の側は承認の有無だけ(承認の者の独立性は判定の側に無い)。取り込む前に独立でない人だけが承認した変更は、集約は事後に数え、判定は数えない(判定が少なめ = 止めない側)。表示の文(`samplingMonthlyText`)に差を明記した

## 4. 試験(どの決定の置き換えか)

- 一般の案件で「止まる」だった場面を「止まらず警告」へ: `test-check-delegation.mjs` の表の 5 場面(AI 起因 Sev1・原因不明 Sev2・空欄・発生日無し・台帳無し。第5章 5.4.6 の事故の停止の置き換え)。欠陥台帳の登録外 ID の E〜H の場面と原因不明・AI 起因の導出の場面は、規制業の入力へ替えて期待を変えず(線の内側で現行どおり止まる)
- 値を入力で与える形: `base()` が最小標本数 30・窓 2 か月を構成で与える(期待は変えず)。通常の月の抜き取りは `perMonth: 5` を構成で与える。`test-review-queue.mjs` の 3 件上限の場面は `loadLimit: 3`、`test-aggregate-records.mjs` の 5 件の定めの場面は `perMonth: 5`
- 手戻り率の基準値の未設定の 9 場面(停止の理由・次の評価の日の案内)は、止めずに「検知は働いていない」と出す期待へ(基準値の未設定で止める定めの置き換え)
- 足した試験: 一般の案件の警告(AI 起因・原因不明・登録外 ID は全種類・台帳無し・件数・読めないとき・解決で消える・Sev3・外へ渡す形・注記)/ **CL1 と規制業で現行どおり止まる(AI 起因・原因不明・台帳無し)**/ 安全重要度の未記入は線の内側 / 値の未定義(最小標本数・観測の窓・外した記録・履歴つき・欄の検査・抜き取りの全件・一覧・全件を事後に確かめる月)/ 同時保有の上限が無いと知らせない / 数え方の揃え
- 流した(Windows の node。全量は流していない): test-check-delegation 83 場面と付随(全通過)・test-review-queue 62・test-aggregate-records 226・test-assurance-period 31・test-delegation-wiring 27・test-record-independence 9・test-aggregate-drift 46・test-aggregate-wiring 65・test-direct-commit-rules 11・test-next-records 157・test-tailoring-declaration・test-claude-md-resident・test-flow-observation 33。test-adoption と test-init-g5 は途中で時間切れ・出力が無く、通過を確かめていない

## 5. 終わりの条件の確認

- 一般の案件で事故による停止の経路が残っていないこと: `autonomy.mjs` の `stop('第1区分'` は理解保持者数の 5 か所と `incident()` の 1 か所(線の内側だけ)。`grep "cause-unknown"` は `incident()` 経由の 1 か所。試験(一般で止まらない・警告が出る)で確認
- CL1 以上・規制業で現行の停止が保たれていること: 試験(CL1・規制業の両方で downgrade・cause-unknown・unmeasurable)

## 議長が決める点

1. **線の内側でも、値の未定義は止めない**(基準値の未設定の停止も外した)。ruling は事故の 3 つだけを線で分けると読んだが、基準値の停止は「値」の側(所有者の「定義が無ければ止めずに警告」)として全案件で外した
2. 観測の窓の下限 2(検証)を残した(下限 1 への緩和は緩める向きで別の決定)
3. 事故の件数の「所」を種類の範囲で数える簡略(§2 (c))。台帳の「原因の変更」を読む実装を次の段へ回すか

## 未確認の点

- `/process-change` の settings の書き込み(`detection`・`reviewQueue`・窓の履歴)は、構成が未設定のため通しで動かしていない(`node --check` と、単体の読み取りの試験だけ)
- `delegation.yml` 側の警告の出力、集約の宣言の表の行の見え方は、実機・集約の通し出力で見ていない(`test-aggregate-wiring` は通過)

## 次の段(D1)へ渡すこと(本文に書く値・警告・欄の名)

- 構成の欄: `detection.minSample`・`reviewQueue.loadLimit`(履歴つき可)・`observationWindow`・`delegation.sampling.perMonth`・`reworkBaseline`。直書きの既定(30・3・5・窓 2 の既定効力)は template に無い
- 警告の種類: 事故の警告(AI 起因あり/原因不明/台帳無し/発生日無し)、定めていない値と働いていない検知(5 つ)。出す所: `/pit`・保証の開示 項目3・出荷の証跡の宣言の表・`delegation-eligibility` の注記
- 本文の降ろし先の更新が要る: 手戻り率の基準値の停止の記述(HAB・IMPL の note)、`MIN_SAMPLE`・既定 5 件・既定 3 件への言及、template の D-0 雛形の文(本段で直した)

## template のコミット

- 329c36d feat(values): 検知・知らせ・抜き取りの値の一律の既定を外し、構成から読む
- 01e82e4 feat(autonomy): 事故の後の停止を一般の案件では警告にし、値の定義が無いときは止めずに働いていない検知を出す
- e713818 docs(values): 値は採用者が定めること、事故の後の警告と現行の停止の線を…書く
- bundle: `tmp/466-tpl-C-1.bundle`・`-2`・`-3`(いずれも c8d4e27..d4-466)
