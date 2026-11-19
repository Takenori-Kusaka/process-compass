# 45 単位 P・R の lint の機械的な修正

## 変えたファイル
- src/data/impl-inventory.yaml: roles-responsibilities#3.10.8 の ids に IMPL-1031 を足した
- src/data/impl-untraced.yaml: `.github/workflows/pre-review-responded.yml` を reason=infra で登録した(先例 pre-review.yml に揃えた。規定は IMPL-0214。新しい降ろし先は作っていない)
- src/content/docs/community/implementation-ledger.md: `npm run impl:write` で再生成

## 各 lint の末尾
- lint:impl: 違反あり(下記。IMPL-1031・pre-review-responded・台帳の古さは解消)
- lint:refs: 通過(語の存在の試験: 8件通過)
- lint:scope: 通過(scope-exempt の試験: 7件通過)

## 残った違反(条文・マークの書き換えが要るため直していない)
1. roles-responsibilities.md:1583 の IMPL-0225 のマークが書式に合致しない(target=agent-settings state=delivered check=machine test=... note="...")。原因の候補: note が長い・note 内の記号、または target `agent-settings` が impl-targets.yaml に無い
2. 上記のため IMPL-0225 が台帳に載らず、次も連鎖して落ちる
   - impl-inventory.yaml の 3.11.4 が挙げる IMPL-0225 が台帳・節の中に無い
   - template/scripts/gate/agent-run-record.mjs・test-agent-run-record.mjs が IMPL-0225 を標準本文に見つけられない
3. IMPL-0225 は単位 P・R の外(3.11.4。別の担当の作業)。マークの書式を直せば 2 は解ける見込み
