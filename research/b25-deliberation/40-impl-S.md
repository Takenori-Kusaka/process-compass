# 単位 S(席・モデル・D-0)の実装の記録

template: b25 の先頭 4f3faf8(単位 C の3コミットの上に3コミット)。bundle は `E:/Github/process-compass/tmp/bundles/template-b25-S-01〜03.bundle`。push していない。

| コミット | 内容 | bundle |
| --- | --- | --- |
| 0ffbd99 | IMPL-0980 | S-01 |
| fc8e9f1 | IMPL-0643・0640、IMPL-0636 の状態関数 | S-02 |
| 4f3faf8 | IMPL-0636 の表示、IMPL-1030、README の取り込みの注意 | S-03 |

## IMPL-0980(delivered check=machine)

- 変更: `scripts/gate/recalibration.mjs` 44 行付近(条件を「移す」と「外す」の両方に広げ、無視の理由に判断を出す)。`docs/calibration-register.md` の説明(「外す」で空の行は数えない)。`.claude/skills/process-change/kinds/settings.md`(記録の書き方)
- 場面: `test-recalibration.mjs`。ng = 外す・移した先が空は無視され RC-01 が再評価待ちのまま。ok = 外す・移した先ありで RC-01 が解ける。目印 `IMPL-0980:ng` / `IMPL-0980:ok`
- 結果: 17 件が期待と一致
- 実装を外した確認: 条件を元(移すのみ)にして実行 → ng の場面が NG。戻して通過
- 注意: 既存の「4件を無視」の場面は、記名が名簿外で先に弾かれるため件数が変わらない

## IMPL-0643(delivered check=machine)

- 変更: `scripts/gate/org-assurance.mjs` に `seatQualificationProblems(aiSeats, adoption)` を足し、`continuityState` が `modelAdoptionState` の直後(束 B23 の 0645 の版の上)で呼ぶ。対象は `qualification` を持つ AI の席。確認の対象のモデルは `qualification.performer.model`、無ければ `performer.model`。`normKey`(NFKC・小文字・空白除去)の一致で導入の記録を引く。記録に無い、または `approved` でないとき problems。導入の記録のファイルが無いとき「確かめられない」を problems に出す
- 場面: `test-model-adoption.mjs`(ok = 問題の無い記録に在る・正規化の一致・席のモデルで代替、ng = 記録に無い・記録に問題・ファイル無し、`qualification` 無しは対象外、`continuityState` 経由の結線)
- 結果: 40 件が期待と一致
- 実装を外した確認: `continuityState` の呼び出しを外す → 結線の場面が NG。戻して通過

## IMPL-0640(delivered check=presence。単位: キー seats[].qualification.record)

- 変更: 同じ `seatQualificationProblems` が `qualification.record` の実在(`isFilledValue`)を見る。欠けは problems(失敗にしない。出荷の集約の「読めない記録」に出る)。構成の入口(`generate-profile.mjs`)は `qualification` の欄を検査しておらず `record` はそのまま通るため、受け付けの変更は無い。`reference/input.md`・`kinds/performer.md` に欄を書いた
- 場面: `test-model-adoption.mjs`(ng = record 無し、ok = 有り、結線)
- 欠けたときの扱い: 失敗にしない。問題の一覧に出続ける。README の取り込みの注意に書いた
- 注意: `isFilledValue` は 1 文字の値(例 `x`)を未記入として扱う。試験の値は `docs/q.md` にした

## IMPL-0636(delivered check=manual)

- 変更: `org-assurance.mjs` に `appointmentConfirmationState(config)`(4席の外の責任者のいる席。`recorded` / `unrecorded` / `invalid`。周期を照らさない)。`next.mjs` に注記(記録なしと不備。失敗にしない)。`generate-profile.mjs` の D-0 節9 の生成(4席の外の行。空欄の様式では足さない)と、責任者が替わる変化点の `remaining` の注意。`templates/00-d0-governance.md` 節9 に説明
- 場面: `test-roster-conditions.mjs`(欠け = 注意、本人が確認 = 不備、確認日なし = 不備、古い確認日でも有効 = 周期を照らさない)。`test-roster-rules.mjs`(D-0 節9 の生成: 欠けの行、書いた席の行、空欄の様式)
- 結果: roster-conditions 61 件、roster-rules 216 件が期待と一致
- 実装を外した確認: 欠けの分岐を `recorded` に変える → 欠けの場面が NG。戻して通過
- マーク: note に「機械は書いた席の照合と欠けの注意を出す。確かめる者: 任命する者(D-0 表1)。要求事項5 の有効期間は4席の外では確かめない」

## IMPL-1030(delivered check=manual。確かめる者: D-0 節12 の確認者)

- 変更: `templates/00-d0-governance.md` 節12 の箇条と表の前文を、(1) 兼務を禁止した組の席どうし(権限の分離の不成立)、(2) 別の自然人どうし(帰属の崩れ)に書き分け、禁止でない組の AI の担い手どうしは離脱に数えない旨と、3.5.2 の例外で同じ人が禁止の組を兼ねる場合は (1) の旨を出す。表の欄は足していない(`template-fields.yaml` は変更無し。`npm run test:fields` 通過)。`config.mjs` の注釈。`generate-profile.mjs` の構成書の注記(個別の認証の記録の突合は採用者)。`aggregate-evidence.mjs` に注記の1行を追加(IMPL-1004 は plan=adopter のまま。マークは触っていない)
- 場面: `test-performer-account.mjs`(文の存在の固定3件と、禁止でない組の共有を数えない既存の判定の固定)
- 結果: 71 件が期待と一致
- 注意: 文の存在を固定するだけで、書き分けの意味は人が読む(manual)

## マーク(本体)

- 0636: `target=config-seats state=delivered check=manual`(plan・issue・review を外した)
- 0640: `target=config-seats state=delivered check=presence`(単位: キー seats[].qualification.record)
- 0643: `target=config-seats state=delivered check=machine test=template/scripts/gate/test-model-adoption.mjs`
- 0980: `target=process-change-skill state=delivered check=machine test=template/scripts/gate/test-recalibration.mjs`
- 1030: `target=d0-template state=delivered check=manual`
- `npm run impl:write` で台帳を再生成。`npm run lint:impl` は成功(exit 0)。台帳の降りていない件数は 118 件
- `template-fields.yaml` は変えていない

## 移行の注意

template に CHANGELOG のファイルは無い。README の「取り込みの注意」に 15 節を足した(0640 の欠けは表示、0643 の記録なしは「確かめられない」、0980 の空の「外す」は再評価待ちが戻る、0636 は D-0 の生成区間が変わるので再生成が要る、1030 は節12 の表の改称)。

## 裁定どおりに作れなかった点・解釈した点

- 作れなかった点は無い。解釈した点:
  - 0643 の「導入の記録のファイルが無いとき確かめられない」は、問題の一覧への表示とした(`continuityState` の problems は表示で、失敗にしない)
  - 0636 の「D-0 の注意」は、D-0 節9 の表の行(4席の外)とした。生成区間が変わるため、既存の採用者は再生成が要る(README に書いた)
  - CHANGELOG のファイルが template に無いため、README の取り込みの注意だけに書いた

## 未確認の点

- `test-aggregate-wiring.mjs` の IMPL-1008 の 2 場面(R2-02)が NG。WSL の写しで HEAD の `aggregate-evidence.mjs` に戻しても同じ 3 NG のため、本単位の変更が原因ではない(束 B23 の領域か環境)
- `test-adoption.mjs` は WSL で `git merge` が失敗して落ちる(写しでも同じ。環境)。本単位は触っていない
- 回帰の全量は流していない(指示どおり)。`npm run check` の全量も未実行
- 実機の `/process-change` で、4席の外の席に `competence` を書く入力が通ることは試験していない(入力検査は役割を限っていないことをコードで確認した)
