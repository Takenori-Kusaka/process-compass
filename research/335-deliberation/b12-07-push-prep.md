# 束 B12(#335・#339)の push の準備(担当の記録。push はしていない)

## 載せ直し

- 本体: origin/main の上へ rebase(origin/main は graph の自動更新 1 コミット先)。衝突なし
- template: origin/main は進んでおらず rebase なし。未 push は 5510c4b..HEAD。bundle `template-b12-335-02.bundle` に退避済み
- `template:kb` は識別(commit)だけが変わるため template へ反映せず戻した

## 番号

- git diff origin/main で見た EV・IMPL・ADR は、すべて origin/main に既にある番号の参照と state・note の変更のみ(EV-0286・IMPL-0983・IMPL-0984 ほか)。新設なし、付け直しなし。SRC の新設なし
- `impl:write`・`evidence:write`・`scope:write` の再生成で変更なし

## `impl:issues`

- `--issue 339`: 0 件(閉じてよい)
- `--issue 335`: 0 件(閉じてよい)

## 回帰(WSL・node v26.13.1・LF の写し・npm ci 後・直列)

| 条件 | 終了コード |
|---|---|
| `npm run check` | 0 |
| `TZ=UTC npm run check` | 0 |

- 写し: 本体・template とも `git -c core.autocrlf=false archive HEAD` を WSL へ展開し、両方で `git init` と 1 コミット(template の試験が `git status` を呼ぶため。無いと落ちる)。落ちた検査はなく、切り分けは不要
