# #332 配る側の検査の実装(B15)

- 実装: `scripts/lib/inputs.mjs` の `ancestryProblems`、`scripts/check-gate-criteria.mjs`(既定の対象のみ。`--kb` は GITHUB_SHA との一致を維持)
- 失敗にする場合: 祖先でない・コミットのオブジェクトが無い・浅い clone・git のリポジトリでない。問題の文に「rebase の後は `npm run template:kb` で再生成する」を記載。`editionAt` は変更なし
- 試験: `scripts/test-kb-ancestry.mjs` 4件(祖先・到達できない・オブジェクト無し・git 外)。`npm run test:criteria` に結線
- 実行: `node scripts/check-gate-criteria.mjs` 通過(template の d871f25 の source.commit 5241b937 は祖先)。lint:impl・lint:refs・test:ci-wiring 通過
- IMPL: 決定どおり実装マークは不要(IMPL-NEW1 を使わず、ADR-0157 に対応する IMPL は無い)。台帳は変更なし
- 文書: standard-editions.md の「既知の食い違い」を時点つきで改め、ADR-0157 のステータス節に実装済みを追記(本文は不変)
