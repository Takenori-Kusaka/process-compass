# 束 B24 — 触る予定のファイル(案。★ = 束 B23 と衝突しうる)

## 本体(全単位で共通)
- `src/content/docs/community/implementation-ledger.md`(`npm run impl:write` で再生成。手で編集しない)
- `src/data/impl-targets.yaml`(単位C: `gate-skill-g7` を足す)

## 単位 P 事前レビュー(0830・0214・0217・0216 と分けた1件)
- 本体: `src/content/docs/phase4-process-design/roles-responsibilities.md`(1306・1358・1405・1428 行のマーク。0216 を分けた新しいマーク)
- template: `scripts/gate/pre-review.mjs`、`scripts/gate/test-pre-review.mjs`(fixture の EV-0281 の文も)
- template: `.github/workflows/pre-review-responded.yml`(新規・仮名。gate-g5 の needs に入れない)、`.github/workflows/pre-review.yml`
- template: `.claude/skills/gate/SKILL.md`(判定当日の論点の手引き)、`.claude/skills/gate/reference/sync-escalation.md`(0217 の導出しない行・小さいチームの一文)、README の事前レビューの節(必須にする手順)

## 単位 R 読み込みの記録(0225)
- 本体: `roles-responsibilities.md`(1582 行のマーク)
- template: `scripts/gate/agent-run-record.mjs`(下位命令 read)、`scripts/gate/test-agent-run-record.mjs`、`.claude/settings.json`(PostToolUse matcher Read)

## 単位 C 契約と PR(0772・0651・0709・0900)
- 本体: `tailoring-guide.md`(1409)、`roles-responsibilities.md`(641・710・1821)
- template: ★`scripts/gate/verify-gate-contract.mjs`(B23 の 0771)、`scripts/gate/test-adoption.mjs`
- template: `scripts/gate/check-process-rules.mjs`、`scripts/gate/test-claude-md-resident.mjs` か `test-init-g5.mjs`(0651 の試験の置き場は実装で決める)
- template: ★`scripts/gate/check-pr.mjs`・★`scripts/gate/test-check-pr.mjs`(B23 の 0191・0630)
- template: ★`.claude/skills/gate/gates/G-7.md`(B23 の 0761)

## 単位 S 席と D-0(0636・0640・0643・0980・1030)
- 本体: `roles-responsibilities.md`(115・249・255・2100)、`overview.md`(740)、`src/data/template-fields.yaml`(節12 の欄を変える場合だけ)
- template: ★`scripts/gate/config.mjs`(seats・認証情報の注釈)、★`scripts/gate/org-assurance.mjs`(continuityState。B23 の 0645)
- template: `scripts/gate/recalibration.mjs`、`scripts/gate/test-recalibration.mjs`、`docs/calibration-register.md`
- template: ★`scripts/init/generate-profile.mjs`(4席の外の表示・節12)、`templates/00-d0-governance.md`(節12)、★`scripts/gate/aggregate-evidence.mjs`(1004 の注記)
- template: `scripts/gate/test-model-adoption.mjs`、`scripts/gate/test-roster-conditions.mjs`

## 単位 D 委任と自律(0594・0834・0664・0840・0597・0599)
- 本体: `human-ai-boundary.md`(122・560・689)、`roles-responsibilities.md`(1075・1992)、`tailoring-guide.md`(436)
- template: ★`scripts/gate/autonomy.mjs`(B23 の 0291・1006)、★`scripts/gate/config.mjs`(CHANGE_TYPE_BASIS・changeTypeProblems。B23 の 1006・0630)
- template: `scripts/gate/delegation.mjs`、★`scripts/gate/aggregate-evidence.mjs`(抜き取りの件数。B23 の 1003・1011・0268)
- template: ★`scripts/gate/test-check-delegation.mjs`(fixture の4点目。B23 の 0291・1006)、`scripts/gate/test-aggregate-records.mjs`
- template: `.claude/skills/process-change/kinds/mode.md`・`settings.md` ほか delegation の補助ファイル(0599・0840 の手引き)、CHANGELOG・移行の注意
