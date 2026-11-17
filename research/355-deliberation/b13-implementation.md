# #355 束 B13 実装記録(ADR-0171)

## 変えたファイル
- src/content/docs/adr/0171-s0-omission-premise-f2-q1-restores-g7.md(新設。adr/index.md は一覧を持たないので変更なし)
- src/content/docs/phase4-process-design/tailoring-guide.md(軸B 前提4・EV-0315・IMPL-1015/1016・箇条2件・軸E の升2か所)
- src/content/docs/phase4-process-design/gate-criteria.md(基準5 の表2行・段落末・基準7)
- src/content/docs/phase4-process-design/safety-verification.md(F.2)
- src/data/impl-inventory.yaml(軸B 節の ids と行4の登録)
- 台帳: evidence-ledger.md・implementation-ledger.md(再生成)

## 番号
EV-0315、IMPL-1015・IMPL-1016(最大の次。push の前に付け直す)

## 未実装・理由
- IMPL-1015・1016 は仕様の check=machine でなく check=manual にした。理由: lint:impl は machine に test= と、試験内の IMPL-NNNN:ng/:ok の目印を求めるが、試験は template の束で書く。降ろすときに machine へ改める(note に明記)
- 規則データ・質問・エンジン・stage-table.mjs・軸B の G-7 の升の括弧・template: 仕様どおり触っていない(裁定の 5.6)

## 検査(すべて通過)
evidence:write・impl:write・scope:write(変更なし)・lint:evidence・lint:impl・lint:scope・lint:refs・lint:stage-table・test:plan-issues・変更ファイルの textlint。npm run check は未実施。
