# #356 B 実装の記録

- 日付: 2026-11-17。裁定: `b-decision.md`(末尾の束の議長の裁定が優先)。template/ と research/sources/ は触っていない

## 変更の要約

| 所在 | 変更 |
| --- | --- |
| `phase4-process-design/human-ai-boundary.md` 5.6.2 | 事前の周知の後に未測定の1段落(S-1。IMPL-1011 を新設)。第2層の文に「コミットとともに履歴に残る形で」(S-2)。4層の表の後に標識と秘匿の段落(S-3)。手続1・2 を直す(S-4。手続1 の矛盾の解消) |
| 同 実装マーク | IMPL-0169・0190・0195 を adopter・decision=ADR-0161 へ。IMPL-0191 は scheduled のまま review=2027-03、target を pr-checks へ。注記から `drill/`・自動・1つの操作を除く |
| `phase4-process-design/exception-escalation.md` 7.9 | 7.9.1 に範囲で数える段落(S-5)、EV-0311 を追加。7.9.2 の目的の文の主語を範囲へ、1名の範囲の開示(S-6)。7.9.6 の記録する事項から見逃した者を除く(S-7)。IMPL-0627・0666 を adopter へ。IMPL-0118 の注記に IMPL-1010 を足す(state は delivered のまま)。IMPL-1010 を新設(scheduled、target=evidence-aggregation) |
| `phase5-implementation/seeded-error-safety.md`(手引き) | 第1層に「名は識別の根拠にしない」、第2層に履歴に残る形と節「標識を見つける者の面に出さない」(EV-0310)、手続1・2 を条文に合わせる、節「体制の外の者が注入する構成」(B-3 の4点。勧めない書き方) |
| `adr/0161-...` | 新設(題・決定1〜7・採用者に求めること・採らなかった案・影響・契機) |
| ADR-0067・0127・0133・0139 | ステータスの節にだけ置き換え・追記を足した(本文は不変) |

番号の対応: IMPL-NEW1 は IMPL-1010、IMPL-NEW2 は IMPL-1011、EV-NEW1 は EV-0310、EV-NEW2 は EV-0311。

## 確かめたこと

- `roles-responsibilities.md` の 3.13.6 は「対象の人」を通知先・記録に引いていない(権限の一時制限の発動の通知先は「発動を記録した者」)。S-7 に伴う直しは不要
- template の導入前の検証のコマンド `scripts/gate/adoption-trial.mjs` は、注入の記録の封印(seal)と照合(tally)だけを行い、注入も取り除く処理も持たない。除去型ではない(IMPL-0169 の確認。読んだだけで、実行はしていない)
- 同コマンドは `blind: false` の層を測定値に載せない(1024・1093 行)。T-3 の読みと整合する
- 日本語校正(textlint): ADR-0161、ADR-0067・0127・0133・0139、5.6.2・7.9 の2ファイル、手引きで違反なし
- `impl-targets.yaml` に `pr-checks`(G-5 の PR 単位の検査)が在り、IMPL-0191 の target に使った(T-6 の登録は不要)

## 確かめられなかったこと

- 台帳の再生成(`impl:write`・`evidence:write`)は、並行する #355 束2 の未完の編集(gate-criteria.md の節の登録、EV-0305・0306 の書式)で検査が止まった。#355 の側が整った後に再生成する(最終的な結果は本ファイルの末尾の追記を参照)
- `npm run lint:refs`・`lint:impl`・`lint:evidence`・`check-template-drift` の最終結果は末尾に追記する
- 配備の経路、GitHub 上の squash の挙動、IEEE 1028・ISO/IEC/IEEE 29119 の本文は確かめていない(裁定の12章のまま)

## template に及ぶ分(Issue #356 へのコメント用)

#356 B の本文を実装しました(ADR-0161)。#356 は開いたままにします。template 側で降ろす分は次のとおりです(B8 以後の template の束)。

1. T-1(IMPL-0191): PR の検査(pr-rules 系)に、保護ブランチ宛の PR の全コミットの本文に標識の行があれば失敗させる検査を足す。標識の文字列は `seeded-error-scan.mjs` の定数を再利用する。ok/ng の対の試験を付ける。標識の文字列を本文に含む文書のコミットの偽の失敗は、第7章の例外承認で受ける(ADR-0139 と同じ文)。降りたら IMPL-0191 を delivered・machine にする
2. T-2(IMPL-1010・IMPL-0118): 制限の記録(notice の `event: restriction`)の `person` を、根拠が 7.9.1 の2 のときだけ必須にし、1 のときは持たせない。`test-roster-conditions.mjs` に ok/ng を足す。どの発動でも集約の出力に対象の人を表示しない(2 による発動の person は記録の欄に持つだけ)。集約の2名の計数は変えない(範囲で数える)
3. T-3(IMPL-1011): 集約の `blind: false` を測定値に載せない挙動を、運用中の記録(`evidence/seeded-errors.json`)についても標準 5.6.2(ADR-0161)を根拠として表示する
4. T-4(IMPL-0195・0190): スキル・手引きの写しに「気づいたときの手続」の文があれば、手続1・2 を標準に合わせる。`drill/` の例があれば、名を識別の根拠にしない旨の注意書きを添える
5. T-5(IMPL-0169): 導入前の検証のコマンドが除去型でないことは、本スレッドで読んで確かめた(実行はしていない)。除去型は見つからなかったため、別 Issue は起票しない
6. T-6: `impl-targets.yaml` に降ろし先(pr-checks)が既に在るため、登録は不要

採用者に求めること(adopter の6規定: IMPL-0190・0169・0195・0627・0666・1011)は ADR-0161 の表にあります。

## 追記: 検査の結果(最終)

- `npm run impl:write`・`evidence:write`・`scope:write` で台帳を再生成した。`src/data/impl-inventory.yaml` の 7.9.6 を「マークあり(IMPL-1010)」へ、5.6.2 事前の周知に IMPL-1011 を足した
- `lint:impl`・`lint:evidence` に残る指摘は、並行する #355 束2 の gate-criteria.md(節の登録、EV-0305)と roles-responsibilities.md(EV-0306)の分だけ。#356 B の分は無い
- `lint:refs`、`check-template-drift` は通過。回帰の全量は流していない

## 追記: 1巡目の直し(b-fix-round1.md)による template 一覧への足し

T-1: 直接の push の経路は PR の検査に乗らない(ルールセットで禁じていない構成では、取り込みの前の拒否が欠ける)。T-2: どの発動でも集約の出力に対象の人を出さない(7.9.6 の目的の限定。2 による発動の person は記録の欄に持つだけ)。検査の文の person の定義を 7.9.1 の2 の対象の人へ改める。T-3: 集約は導入前と運用中を区別しない。詳細は b-fix-round1.md。
