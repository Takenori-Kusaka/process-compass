# 束 B12 の push の準備(担当の記録。push はしていない)

## 載せ直し

- 本体: 枝 `Takenori-Kusaka/b12` の 6 コミットを origin/main(30 コミット先)の上へ rebase した。衝突は `evidence-ledger.md` と `implementation-ledger.md` の 2 件だけ(自動生成)。upstream 側を採り、再生成して解いた
- 本体の先頭: 73b4f902(付け直し・再生成)、その下 46f87047
- template: origin/main(2f80544)は進んでおらず、未 push の 3 コミットはその上にそのまま載る。rebase なし。先頭 b5bfc6d。bundle の追加なし(template-b12-354-02.bundle が b5bfc6d までを持つ)。`template:kb` は規則データに差がなく、コミットの識別だけが変わるため反映しなかった

## 付け直した番号

- EV-0301 → EV-0312(ADR-0165 の暫定マークと research/354-deliberation/b12-04-implementation.md)。EV-0301 は origin/main の #332 が使用済みだった。origin/main の最大は EV-0311
- IMPL: 本ブランチが新設した番号なし(IMPL-0120・0309・0986・1002 は既存マークの state の変更)。SRC: 新設なし
- ADR-0165: origin/main で空き(最大 0161)。変更なし
- `impl:write`・`evidence:write`・`scope:write` を再生成(scope は変更なし)

## 回帰(WSL・node v26.13.1・LF の写し・npm ci 後・直列)

| 条件 | 終了コード | build |
|---|---|---|
| `npm run check` | 0 | 383 ページ |
| `TZ=UTC npm run check` | 0 | 383 ページ |

- 写し: 本体は `git -c core.autocrlf=false archive HEAD`、template は同じ方法で b5bfc6d を展開し git init した
- test-discouraged-evidence は WSL で通った(Windows での失敗は CRLF 由来で判定に使わない)

## `impl:issues`

- `--issue 354`: 0 件(閉じてよい)
- `--issue 327`: 本ブランチの IMPL-1002 は delivered で出ない。ほかに 10 件前後(IMPL-0997 ほか。exception-escalation・gate-criteria・lifecycle・tailoring-guide)が残る。いずれも origin/main に既にあるマークで、本束の変更ではない。#327 を閉じる判断は議長に委ねる
