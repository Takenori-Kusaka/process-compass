# #334 実装の記録

- 日付: 2026-11-15
- 担当: 実装(裁定 decision.md 5 章・8 章のとおり)

## 変更したファイル

template(コミット a3a1d6f・2b694fe。bundle は `E:/Github/process-compass/tmp/bundles/template-b4-334-01.bundle` と `-02.bundle`)

- `scripts/gate/spec-sections.mjs`(新規): `SPEC_FILE`・`CONFIRMED_SECTIONS`・`specSections`・`changedSpecSections`
- `scripts/gate/check-pr.mjs`: 検査4c、`result.specChanges`、`renderSpecChanges`(`renderG6Material` から呼ぶ)、CLI の `warn` 1行、冒頭コメント。`errors`・`warnings`・終了コードは変えない
- `scripts/gate/test-check-pr.mjs`: 基底の `specs/F-001/spec.md` を3節つきに変更。当たる5・当たらない5・合否・単体3の試験を追加
- `.claude/skills/gate/gates/G-4.md`: 表示が無いことを根拠にしない旨を追記

本体

- `src/content/docs/phase4-process-design/gate-criteria.md`: 時点の表と箇条書き、IMPL-0520、EV-0260(見直し 2027-05)、IMPL-0241 の note の追記
- `src/data/impl-inventory.yaml`: 登録簿の「確定した版を変える場合」に IMPL-0520 を追加
- `src/data/impl-untraced.yaml`: `spec-sections.mjs` を library として登録
- 台帳(`implementation-ledger.md`・`evidence-ledger.md`)は `npm run impl:write`・`evidence:write` で再生成

## 流した試験と結果

- `node template/scripts/gate/test-check-pr.mjs`(Windows の node 26): 208 場面と付随の確認が期待と一致(約2分25秒)
- `npm run lint:impl`・`lint:refs`・`lint:evidence`・`lint:scope`・`lint:ci`・textlint(gate-criteria.md): すべて通過
- `scope:write`: 変更なし。`template:kb`: 規則データに差分なし(`tailoring-kb.json` の commit 欄の更新だけ。複製の内容は変わらないので戻した)
- `npm run check` の全量は流していない(議長が push の前に1回)

## 裁定との食い違いと補足

1. 実装マークの note に `F-<数字>` と書くと、書式の検査(`>` を含む)が失敗した。`F-数字` に直した。意味は変えていない
2. `lint:impl` の追加の要求: (a) `src/data/impl-inventory.yaml` に IMPL-0520 の登録、(b) `spec-sections.mjs` の逆向きの追跡(`impl-untraced.yaml` に library で登録)、(c) 試験に `IMPL-0520:ng` と `:ok` の目印。裁定の指示にないが、検査が求めた
3. 表の2行目の「合否にする」のセルへ、裁定 5.1 の「文が強く読めるとき」の案に従い「(準拠テンプレートには降りていない)」を最初から足した。独立の突合が不要と見るなら外してよい
4. IMPL-0241 の `review=2026-11` は変えていない(年月は議長が決める)。今月で切れる
5. 判定記録の整合を PR で課さない行には実装マークを足していない(`lint:impl` は要求しなかった)
6. `template-repository.md` の「規則と担保の対応」に確定した版の変更の行は無かったため、足していない
7. 「実装の前の `check-pr.mjs` で当たる試験が落ちること」: 旧 `check-pr.mjs` に戻して流すと、最初の「当たる」の場面で `r.specChanges.length` が未定義のため例外で停止した(試験が検査の出力を見ている確認にはなるが、NG の行の一覧ではなく例外終了)
8. 削除の判定は `atHead(e.path)` が null のとき。名前の変更では `e.path`(移動先)の本文と比べる
9. template の作業ツリーに `scripts/vendor/tailoring-kb.json` の行末(CRLF)だけの差分が残る。内容は同一。コミットしていない

## 未確認の点

- 約2分半かかる試験の CRLF 由来の偽の FAIL は出なかった
- GitHub 上の `--comment` の表示と、実際の PR での動作は確かめていない(試験は一時リポジトリ)
- 裁定 9 章の限界(ADR-0036・0028 の本文を未読)は引き継ぐ
