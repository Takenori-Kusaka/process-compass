# 束 B12(#330)の push の準備(担当の記録。push はしていない)

## 載せ直し

- 本体: origin/main(35 コミット先)の上へ rebase。衝突は `implementation-ledger.md` の 1 件だけ(自動生成)。upstream 側を採り、再生成して解いた。B13 のコミットが先に載っている
- template: origin/main は進んでおらず rebase なし。未 push は b5bfc6d..e9f5590。bundle `E:/Github/process-compass/tmp/bundles/template-b12-330-04.bundle` に退避した
- `template:kb` は識別(commit)だけが変わるため template へ反映せず戻した(前回と同じ)

## 番号

- 本ブランチが新設した EV・IMPL・SRC・ADR はなし(IMPL-0239・0234・0992・0993・0995 は既存マークの state・note の変更。EV-0293 は文言の更新)。B13 の使用分(EV-0313〜0319・IMPL-1013〜1019・SRC-0765・ADR-0170〜0173・0175)との重なりなし。付け直しなし
- `impl:write`・`evidence:write`・`scope:write` を再生成(変更は implementation-ledger のみ)。コミット b1ca7804

## 回帰(WSL・node v26.13.1・LF の写し・npm ci 後・直列)

| 条件 | 終了コード | build |
|---|---|---|
| `npm run check` | 0 | 388 ページ |
| `TZ=UTC npm run check` | 0 | 388 ページ |

- 写し: 本体は `git -c core.autocrlf=false archive HEAD`、template は同じ方法で HEAD を展開し git init した

## `impl:issues --issue 330`

- 残るマーク 2 件(閉じる前に issue= の付け替えが必要。閉じられない):
  - IMPL-0239(gate-criteria.md:1027)state=undelivered。対象なしによる通過の判定の時刻・実装開始後の不使用が機械で止まらない
  - IMPL-0234(gate-criteria.md:1055)state=undelivered。依存取得失敗時に各スタックの検査器が失敗するかは道具の実装で保証しない
- 対処案: 両マークの issue= を open の Issue(例: #355 など G-7・集約の計画 Issue)へ付け替え、寄せ先へ受け入れ条件の案をコメントで足す。付け替えの判断は議長に委ねる
