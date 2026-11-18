# 束 B20 push の準備(段 P1)

## 載せ直し
- template b20: origin/main へ rebase(31 コミット、衝突なし)。gate-g5.yml は B21 の行と共存。bundle: template-b20-P1-01(rebase 後)・P1-02(template:kb の複製更新後)
- 本体: origin/main(c35063cf)へ rebase(30 コミット)。template の参照・台帳の衝突は再生成で解いた
- 手で解いた衝突 2 件
  1. `gate-criteria.md` の IMPL-0136: origin/main の delivered(試験つき)を採り、「読まれずに通る散文の検知は IMPL-1010 が追う」の 1 文だけを ADR-0219 の決定(課さないと決めた。番号 IMPL-1010 は再利用しない)へ改めた。origin/main の IMPL-1010 のマークは本束の側の削除を採った
  2. `src/data/impl-untraced.yaml`: origin/main の 4 件と本束の e2e-fixture.mjs の両方を残した
- template の参照は template b20 の HEAD に合わせた(中間コミットも最終 HEAD を指す)

## 番号
- origin/main の最大: ADR-0200、EV-0326、IMPL-1025。本束の新設: ADR-0216〜0222、EV-0327〜0336、IMPL-1026〜1028。いずれも origin/main の最大より後で衝突なし。付け直しは不要(旧=新)
- 注意: 他の束(B21 等)が同じ番号を使う場合は、先に main へ入る側が優先。ADR-0201〜0215 は origin/main に無い(他の束の配分)

## 規則データ・台帳
- template:kb で tailoring-kb.json を更新し template にコミット。impl:write は変更あり、evidence:write・scope:write は変更なし

## Issue の確認
- impl:issues: 355・448・447・444 は 0 件(閉じてよい)。IMPL-0200 は issue=452

## 開示で閉じる 2 点
- macOS・ネイティブ Linux/Windows の隔離とトレーラ: EV-0318・EV-0319 で開示済み
- GitHub 実機の refs/pull/N/head とスタック型 PR: EV-0332 で開示済み
- 足す必要なし

## 検査
- lint:impl・lint:evidence・lint:refs・lint:provisions: 通過
- test-aggregate-wiring 61・test-delegation-wiring 27・test-agent-run-record 26・test-review-queue 55・test:fields 11: 通過
- 回帰の全量と npm run check は流していない。push していない
