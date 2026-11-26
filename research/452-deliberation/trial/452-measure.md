| commit | 題名 | Spec | 変更 | R1外 | R2外 | R3外 | R4外 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4682b43 | docs: env-check の記録(試行の代記) (#4) |  | 1 | 1 | 1 | 1 | 1 |
| 9ae25be | probe: add probe-envcheck (to be reverted) |  | 1 | 1 | 1 | 1 | 1 |
| 3c77456 | probe: fix probe-envcheck content (to be reverted) |  | 1 | 1 | 1 | 1 | 1 |
| 2b14552 | probe: revert probe-envcheck |  | 1 | 1 | 1 | 1 | 1 |
| 7a8ebc3 | docs: F-001 の仕様と計画 (#5) | F-001 | 2 | 2 | 2 | 2 | 2 |
| ee0dd5a | feat: 引数の解析を分ける (#6) | F-001 | 3 | 0 | 0 | 0 | 0 |
| 3feb6fc | feat: --verbose の出力 (#7) | F-001 | 2 | 1 | 1 | 1 | 1 |
| 3553885 | feat: 数でない引数の検査 (#8) | F-001 | 3 | 1 | 1 | 1 | 1 |
| b221b2c | feat: F-002 の仕様・計画と設定の読み込み(計画と実装を同じ PR に入れる) (#9) | F-002 | 3 | 3 | 3 | 3 | 2 |
| 9c62268 | test: 設定の試験 (#10) | F-002 | 3 | 2 | 2 | 2 | 2 |
| 3969c7c | feat: CLI へ設定を組み込む (#11) | F-002 | 3 | 2 | 2 | 2 | 2 |
| bf80702 | docs: F-003 の仕様と計画 (#12) | F-003 | 2 | 2 | 2 | 2 | 2 |
| 3027835 | feat: minimist で引数を解析する (#13) | F-003 | 4 | 3 | 3 | 3 | 3 |
| 9e7b6a1 | docs: F-003 の計画の誤りを直す(依存の追加で package.json が要る) (#14) | F-003 | 1 | 1 | 1 | 1 | 1 |
| 208383c | test: 解析の試験 (#15) | F-003 | 1 | 0 | 0 | 0 | 0 |

外れたパスの置き場別の件数(のべ)

| 置き場 | R1 | R2 | R3 | R4 |
| --- | --- | --- | --- | --- |
| docs | 2 | 2 | 2 | 2 |
| enforcement | 3 | 3 | 3 | 3 |
| specs | 10 | 10 | 10 | 10 |
| readme/changelog | 2 | 2 | 2 | 2 |
| other | 1 | 1 | 1 | 0 |
| fixture | 1 | 1 | 1 | 1 |
| lockfile | 1 | 1 | 1 | 1 |
| package.json | 1 | 1 | 1 | 1 |

各コミットの R1 の外れたパス

- 4682b43 docs: env-check の記録(試行の代記) (#4): docs/adoption-trial/env-check.json[docs]
- 9ae25be probe: add probe-envcheck (to be reverted): .github/workflows/probe-envcheck.yml[enforcement]
- 3c77456 probe: fix probe-envcheck content (to be reverted): .github/workflows/probe-envcheck.yml[enforcement]
- 2b14552 probe: revert probe-envcheck: .github/workflows/probe-envcheck.yml[enforcement]
- 7a8ebc3 docs: F-001 の仕様と計画 (#5): specs/F-001/plan.md[specs], specs/F-001/spec.md[specs]
- ee0dd5a feat: 引数の解析を分ける (#6): (なし)
- 3feb6fc feat: --verbose の出力 (#7): README.md[readme/changelog]
- 3553885 feat: 数でない引数の検査 (#8): CHANGELOG.md[readme/changelog]
- b221b2c feat: F-002 の仕様・計画と設定の読み込み(計画と実装を同じ PR に入れる) (#9): specs/F-002/plan.md[specs], specs/F-002/spec.md[specs], src/config.js[other]
- 9c62268 test: 設定の試験 (#10): __tests__/fixtures/config.json[fixture], specs/F-002/plan.md[specs]
- 3969c7c feat: CLI へ設定を組み込む (#11): docs/config.md[docs], specs/F-002/plan.md[specs]
- bf80702 docs: F-003 の仕様と計画 (#12): specs/F-003/plan.md[specs], specs/F-003/spec.md[specs]
- 3027835 feat: minimist で引数を解析する (#13): package-lock.json[lockfile], package.json[package.json], specs/F-003/plan.md[specs]
- 9e7b6a1 docs: F-003 の計画の誤りを直す(依存の追加で package.json が要る) (#14): specs/F-003/plan.md[specs]
- 208383c test: 解析の試験 (#15): (なし)

各コミットの R3 の外れたパス

- 4682b43 (Spec なし): docs/adoption-trial/env-check.json
- 9ae25be (Spec なし): .github/workflows/probe-envcheck.yml
- 3c77456 (Spec なし): .github/workflows/probe-envcheck.yml
- 2b14552 (Spec なし): .github/workflows/probe-envcheck.yml
- 7a8ebc3 (F-001): specs/F-001/plan.md, specs/F-001/spec.md
- ee0dd5a (F-001): (なし)
- 3feb6fc (F-001): README.md
- 3553885 (F-001): CHANGELOG.md
- b221b2c (F-002): specs/F-002/plan.md, specs/F-002/spec.md, src/config.js
- 9c62268 (F-002): __tests__/fixtures/config.json, specs/F-002/plan.md
- 3969c7c (F-002): docs/config.md, specs/F-002/plan.md
- bf80702 (F-003): specs/F-003/plan.md, specs/F-003/spec.md
- 3027835 (F-003): package-lock.json, package.json, specs/F-003/plan.md
- 9e7b6a1 (F-003): specs/F-003/plan.md
- 208383c (F-003): (なし)
