# #355 束4 標準側の実装の記録

## 変えたファイル
- `human-ai-boundary.md`: 5.5.4 の段落の末尾へ1文(L502)。IMPL-0048 を `delivered check=machine test=template/scripts/gate/test-assurance-period.mjs` へ。直後に EV-0270。IMPL-0159 を `delivered check=manual` へ(plan を外す)。直後に EV-0271
- `gate-criteria.md`: 「判定完了時間の SLA」の後へ参照。IMPL-0136 は `review=2027-02` と新しい note。IMPL-0100 の note へ1句
- `roles-responsibilities.md` 3.11.7: IMPL-0230 を `plan=adopter decision=ADR-0137` へ。IMPL-0525 を新設。直後に EV-0272
- `src/content/docs/adr/0137-period-disclosure-approval-pace-and-degradation-metrics.md`: 新設。選択肢の表は2章を写した
- `src/data/impl-inventory.yaml`: 3.11.7 の ids へ IMPL-0525
- 自動生成: `evidence-ledger.md`・`implementation-ledger.md`(`scope-ledger.md` は変更なし)

## 番号
- IMPL-NEW1 は IMPL-0525。EV-NEW1 は EV-0270、EV-NEW3 は EV-0271、EV-NEW4 は EV-0272
- ADR は 0137

## 指示書と違えた点
- EV-NEW2 は 4.2 に文が無い。台帳に欠番を作らないため、NEW3・NEW4 を 0271・0272 と詰めた(0270→0272 を飛ばさない)
- ADR の「ステータス」は ADR-0136 に倣い「採用(2026-11-15)」とした(議長の裁定の日)。承認者・承認日の欄は未記入と明記した
- ADR-0137 の sidebar.order は 136 (直近 0136 が 135)

## 指示書に文が無く自分で起こした文
- EV-0270〜0272 の「採用の事例はありません。…」の末尾の段落
- EV-0272 の「本文の規範の文は、この束では変えていません。」
- ADR-0137 の本文全体(コンテキスト・影響・見直しの契機・各決定の文)。決定の内容は指示書とカテゴリの 1.1〜1.4 に従った。(B) の読み方は書いていない

## 流した検査と結果
- 通過: lint:evidence、lint:scope、lint:refs、lint:tone、lint:dekimasu、lint:provisions、textlint(ADR-0137 と編集した3頁。全体の再実行は時間切れで止めた。初回の全体で出た2件は ADR-0137 のもので、直して再検査済み)、`evidence:write`・`scope:write`
- node_modules は b3 への junction で用意し、終了時に `rmdir` で junction だけ外した(b3 の実体は残存を確認)

## 落ちたまま残した検査
- lint:impl(`impl:write` の末尾も同じ)。2件
  1. `IMPL-0048: test= の試験 template/scripts/gate/test-assurance-period.mjs がありません`(template 側の担当が足す前)
  2. 逆向きの追跡: `scripts/gate/test-approval-pace.mjs` が impl-targets.yaml にも impl-untraced.yaml にも無い。試験は gate-g5.yml の run: から実行されるものが対象外なので、template 担当が結線すれば消える見込み。そうでなければ impl-untraced へ library 等で登録する。template の担当が決めるため、自分では登録していない

## 確かめていないこと
- `npm run check` 全体、`npm run template:kb`(規則データは変えていない)
- `check-impl.mjs` が manual の IMPL-0159 の目印をどう扱うか
- IMPL-0268(#441)と IMPL-0230 の adopter の重なり(独立の突合へ)
- 3.11.7 と IMPL-0136 の規定の文は直していない(指示どおり)。#355 へのコメントは書いていない。コミットなし
