# Claude Code 開発リポジトリとしての整備 — ディープリサーチ結果(2026-07-08)

Issue: #67 / 検証方法: 5アングル並列検索 → 22ソース取得 → 105クレーム抽出 → 上位25件を3票制の敵対的検証(25件全件 confirmed、反証0)

## 確定した公式仕様(すべて code.claude.com/docs で逐語確認済み)

### 標準構成

- ルート: `CLAUDE.md`、`.mcp.json`(MCP共有設定。`.claude/` 内ではない)
- `.claude/` 配下: `settings.json`(コミット)/ `settings.local.json`(gitignore)/ `rules/` / `skills/` / `agents/` / ほか
- `settings.local.json` 以外はコミットしてチーム共有が公式推奨

### 4層の役割分担(最重要の設計原則)

| 層 | 実体 | 性質 |
| --- | --- | --- |
| 常時ガイダンス | CLAUDE.md(200行未満、毎セッション必要な事実のみ) | Claude が「読む」だけ。強制力なし |
| 条件付きルール | .claude/rules/(frontmatter の paths glob で該当ファイル操作時のみロード) | 同上 |
| 呼び出し時ロード | .claude/skills/<name>/SKILL.md(progressive disclosure: 平常時は description のみ、本文は呼び出し時) | 複数ステップの手順はここへ |
| 強制層 | settings.json の permissions / hooks | Claude の判断に関わらず実行・ブロック |

- 「複数ステップの手順や一部にしか関係しない内容は skill か paths 付き rule へ移す」が公式基準
- 確実にブロックしたいものは PreToolUse hook か permissions.deny(CLAUDE.md への記載は保証にならない)

### その他の確定事項

- **commands は skills に統合済み**(2026年時点)。新規は `.claude/skills/` 一択。同名時は skill が優先
- SKILL.md frontmatter はすべて任意(description のみ推奨)。本体500行未満、詳細は同ディレクトリの参照ファイルへ
- スキル階層: Enterprise > Personal(~/.claude/skills/)> Project(.claude/skills/)。プラグインは名前空間分離
- `.mcp.json` はルート置き・コミット共有・シークレットは `${VAR}` 参照。個人用は user スコープへ
- サブエージェントは `.claude/agents/*.md`(YAML frontmatter、必須は name と description のみ)。CLAUDE.md の規約は自動継承される
- settings はファイル監視で再起動なしリロード。permissions ルールはスコープ間でマージ

## 本リポジトリへの適用(P1〜P5)

- **P1(導入済み)**: `.claude/settings.json` — 定型コマンドの permissions.allow、`.env` の Read 禁止(deny)、PostToolUse hook で docs 配下 md/mdx 編集時に textlint 自動実行(「push前にcheck」を願望から保証に変える)
- **P2(導入済み)**: プロジェクトスキル4つ — `ja-proofread` / `mermaid-diagram` / `research-to-docs` / `generate-image`
- **P3(導入済み)**: CLAUDE.md から手順(画像生成コマンド詳細)をスキルへ切り出しスリム化。rules/ 分割は執筆規約が肥大化してから
- **P4(保留)**: `.mcp.json` — 現状 gh CLI で足りているため必要になった時点で導入(GitHub MCP、`${GITHUB_TOKEN}`)
- **P5(導入済み)**: `.claude/agents/process-researcher.md` — フェーズ1〜2の一次調査を委譲するサブエージェント

## 未検証領域(実装時に公式ページ要確認)

- hooks の matcher 構文・stdin JSON スキーマの詳細(https://code.claude.com/docs/en/hooks)→ 導入した hook は動作テスト済みだが、Claude Code 本体更新時に挙動確認を推奨
- claude-code-action(GitHub Actions で @claude メンション対応・PR 自動レビュー)→ コントリビューターが現れて PR フローに移行する際に検討
- `.claude/workflows/` と `.claude/agent-memory/` の仕様(存在のみ確認)

## 主要ソース

- https://code.claude.com/docs/en/claude-directory
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/settings
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/slash-commands
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/mcp
- https://code.claude.com/docs/en/hooks
- https://github.com/anthropics/skills / https://github.com/hesreallyhim/awesome-claude-code(補助)
