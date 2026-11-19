# 単位 R 実装(IMPL-0225。#325)

## 変えたもの(template コミット 317e8fb。bundle: tmp/bundles/template-b25-R-01.bundle)
- `scripts/gate/agent-run-record.mjs`: 下位命令 `read` を追加。`READ_UNRECORDABLE`・`readsPath`・`assetRelPath`・`appendReadRecord` を export。`read --unrecordable` で記録できない種別を出す。常に exit 0。記録は `.claude/agent-runs/<id>.reads.jsonl`(`{at,path}` を 1 行ずつ追記)。ASSET_ROOTS 外・ASSET_EXCLUDES・作業ツリー外・不正な識別子は記録しない。
- `.claude/settings.json`: `hooks.PostToolUse`(matcher: Read)から `node scripts/gate/agent-run-record.mjs read` を呼ぶ。
- `scripts/gate/test-agent-run-record.mjs`: IMPL-0225 の場面を追加(下記)。

## 足した試験の場面
ok: 絶対・相対パスの Read が追記される / 識別子ごとに別の記録 / 記録できない種別が出力に出る / settings.json の結線 / 記録が record の assets=clean を変えない。
ng: 指示資産の外・作業ツリーの外・agent-runs・settings.local.json・_archive は記録しない / 壊れた入力(不正 JSON・空・null・不正な識別子・パスの型不正・欠落)で exit 0 / 不正な識別子で書かない。

## 試験
WSL node 26: `実行の記録の試験: 34 件が期待と一致しました`

## 実機の確認(1 回で成功)
WSL 一時ディレクトリへ `git archive b25 | tar -x`、`git init`。Claude Code 2.1.314。
`claude -p "Read ツールで .claude/skills/gate/SKILL.md の先頭10行を読み、1行で要約して" --allowedTools Read --model haiku --permission-mode acceptEdits`
結果: 要約が返り、`.claude/agent-runs/73f21dbd-....json`(SessionStart)と `73f21dbd-....reads.jsonl` ができた。中身: `{"at":"2026-11-19T01:43:11.500Z","path":".claude/skills/gate/SKILL.md"}`。一時ディレクトリは削除済み。

## マークの新しい行
roles-responsibilities.md の IMPL-0225: `state=delivered check=machine test=template/scripts/gate/test-agent-run-record.mjs`(他の delivered と同じく plan=・issue= は付けない)。note に環境・記録できない種別・書き換えを防げない点(確かめる者: プロセス内部監査)を記載。台帳(impl:write)は未実行。

## 未確認の点
- 警告: 未信頼のワークスペースでも `-p` では PostToolUse が走った(settings の allow は無視されると出た)。対話のモードでの信頼ダイアログ後の挙動、サブエージェント(Task)内の Read が親の識別子で記録されるかは未確認。
- 同じ設定を npm run check 側(pit-crew 以外の本体検査 check-impl)で通すかは議長の実行に委ねる。
