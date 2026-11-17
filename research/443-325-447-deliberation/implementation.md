# 束 B14 の実装の記録(#443・#325・#447)

- 日付: 2026-11-17。裁定: `decision.md`。push していない

## 変えたファイル

- `src/content/docs/phase4-process-design/lifecycle.md`: 2.10.5 冒頭の段落、2.10.6 の「課しません」の段落と EV-0320、IMPL-0954・0899
- `src/content/docs/phase4-process-design/human-ai-boundary.md`: 5.4.7 箇条1、「未決」の段落、IMPL-0978
- `src/content/docs/phase4-process-design/deliverable-templates.md`: テンプレ11 の行、IMPL-1020・1021 の新設、IMPL-0070・0071 の note
- `src/content/docs/adr/0178-scope-procedure-records-backlog-review-and-ai-free-practice-frequency.md`(新設)
- ADR-0019・0173・0175: ステータスの節のみ
- `src/data/impl-targets.yaml`、`src/data/impl-inventory.yaml`
- 台帳(再生成): implementation-ledger.md、evidence-ledger.md
- `adr/index.md` に一覧は無い(sidebar は autogenerate)ので変更なし

## 振った番号

IMPL-NEW1 = IMPL-1020、IMPL-NEW2 = IMPL-1021、EV-NEW1 = EV-0320。origin/main の最大(IMPL-1019・EV-0319)の次。push の直前に並行の束と衝突しないか確かめ、必要なら付け直す。

## 流した検査と結果

impl:write・evidence:write・scope:write(再生成)、lint:impl・lint:refs・lint:evidence・lint:scope・lint:tone・lint:provisions・lint:ci・lint:dekimasu・lint:registry・lint:stage-table・lint:citations、test:impl・test:fields・test:ci-wiring・test:plan-issues、impl:issues、textlint(変えた7頁)。すべて合格。回帰の全量と build は流していない。

## 裁定の文と原文の食い違い・判断した点

1. 作業ツリーに node_modules と template が無かった。node_modules は E:/Github/process-compass/node_modules への junction を作り(git 管理外)、template は `git submodule update --init template` で参照の版を取得しただけ(内容は触っていない)
2. `impl-inventory.yaml` のテンプレ11 の節(「様式の読み方」)に IMPL-1020・1021 を足した。裁定は「lint:impl の結果に従う」としており、足さないと lint:impl が落ちた
3. `impl-targets.yaml` の flow-observation の description に「経緯: 」と書くと YAML が壊れたため「経緯は、」とした
4. ADR-0173 のステータスは「決定3 のうち IMPL-0899 の降ろし先と、結果の節の重の候補の記述は、一部置き換え(→ ADR-0178 の決定1)」と書いた。ADR-0175 は括弧つきの書き方で lint:refs が通った
5. 2.10.5 の inventory の note は、「一覧と現状の非同期の確認に 3.10 を掛けない」の句を括弧の外の文として置いた(裁定の趣旨どおり、括弧の入れ子を避けるため)
6. ADR-0178 の本文は 7 節の要旨と 1〜3 節の「採らない」から書き起こした。文言は議長の確認を要する

## 未解決

- #447 の所有者への問い(登録の経路で照らす時点・常時の実施の記録)は未回答。5.4.7 と ADR-0178 に「未決」で書いた
- 範囲外の気付き 2 件(7.6 段階1・2 の事前レビュー無し、5.4.5 条件5)の Issue コメントは未実施
- template の項目(裁定 8 節)は未着手。IMPL-0899・1020・1021・0978 は undelivered で表示
- graphify update は未実行
