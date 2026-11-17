# 束 B12(#337・#330)の push の準備(担当の記録。push はしていない)

## 載せ直し

- 本体: origin/main の上へ rebase(1 コミット先)。衝突なし
- template: origin/main は進んでおらず rebase なし。未 push は origin/main..HEAD の 3 コミット(e9f5590 の後)。bundle `E:/Github/process-compass/tmp/bundles/template-b12-337-04.bundle` に退避した
- `template:kb` は識別(commit)だけが変わるため template へ反映せず戻した(前回と同じ)

## 番号

- 本ブランチの新設は EV-0320・ADR-0166 のみ。origin/main の最大は EV-0319・ADR-0175 で、0320 と 0166 は未使用。重なりなし、付け直しなし
- IMPL は既存マークの state・note の変更のみ(IMPL-0234・0239・0262・0346・0994・1001 ほか)。SRC の新設なし
- `impl:write`・`evidence:write`・`scope:write` を再生成。変更なし(台帳のコミットは不要)

## 回帰(WSL・node v26.13.1・LF の写し・npm ci 後・直列)

| 条件 | 終了コード | build |
|---|---|---|
| `npm run check` | 0 | 389 ページ |
| `TZ=UTC npm run check` | 0 | 389 ページ |

- 写し: 本体・template とも Windows の `git -c core.autocrlf=false archive HEAD` を WSL へ展開(worktree の .git は WSL の git から読めないため)。落ちた検査はなく、切り分けは不要

## `impl:issues`

- `--issue 337`: 0 件(閉じてよい)
- `--issue 330`: 0 件(閉じてよい)
