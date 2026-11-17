# 束 B14(#443・#325・#447)の push の準備(担当の記録。push はしていない)

## 載せ直し

- origin/main(6 コミット先: 束 B12 の push の準備と #330 の標準側の追随)の上へ、本束の 8 コミットを rebase した
- 衝突は `implementation-ledger.md`(自動生成)だけで、コミットごとに 3 回出た。upstream 側を採って進め、最後に `impl:write` で再生成して解いた(コミット 661eff50)。本文の衝突はなし
- template: origin/main の参照は e9f5590f のまま動かず、本束は template の参照を進めていない。回帰には参照どおりの e9f5590f を使った(作業ツリーの template は古い b5bfc6d にあったため、e9f5590f へ付け替えた)
- `template:kb` は識別(commit)だけが変わるため template へ反映せず戻した(B12 と同じ)。template の未 push はなし

## 番号

- 本束が新設した番号は EV-0321・IMPL-1020・IMPL-1021・ADR-0178。origin/main の最大は EV-0319・IMPL-1019・ADR-0175 で、重ならない(IMPL-1019 は origin/main 側の既存で本束のものではない。ADR-0176・0177 は origin/main にも本ブランチにもない欠番)。付け直しなし
- `evidence:write`・`impl:write`・`scope:write` を再生成。変更は implementation-ledger のみ

## 検査と回帰

| 条件 | 結果 |
|---|---|
| Windows `npm run check` | 落ちた試験 2 件: test-discouraged-evidence.mjs(「D-0 の記録の表へ行を書き込めた」が NG)・test-g5-aggregate.mjs。改行コード(CRLF)に依る偽の FAIL と見て判定に使わない。LF の写しで通ることで裏づけた |
| WSL・node v26.13.1・LF の写し・通常 | 終了コード 0、389 ページ |
| WSL・同・`TZ=UTC` | 終了コード 0、389 ページ |

- 写し: 本体は `git -c core.autocrlf=false archive HEAD`、template は同じ方法で参照どおりの版(e9f5590f)を展開し git init した。`npm ci` 後に実行
- 実行の注意: 通常の実行の開始時に、取り消した実行(誤って二重に起動したもの)が /tmp を共有して重なった時間がある。通常は 0 で終わったが、偽の PASS の可能性は低い(偽の FAIL を出す型の干渉)。UTC の実行は、残った実行をすべて止めた後に単独で流した

## origin/main への載せ直し(2026-11-18)
- 軽の先端 6f6bdde9(元 46348067 を rebase し、EV-0320 → EV-0321 の付け直しと台帳の再生成を1コミットで直後に置いた)。重の先端 8a314f2e(重の5コミットを cherry-pick し EV-0321 → EV-0322、EV-0322 → EV-0323)。
- 衝突は自動生成の台帳(evidence-ledger・implementation-ledger)のみ。upstream 側を採り再生成で解いた。本文の衝突なし。
- IMPL-1020〜1023・ADR-0178・0179・SRC は origin/main(IMPL-1019・ADR-0175・SRC-0765 が最大)と重ならず、付け直し不要。template の参照は d871f25 のまま。
- 検査: lint:refs・sources・evidence・impl・scope・registry・provisions・citations・dekimasu・tone・impl:issues は通過。textlint(変更した docs)通過。test:template は軽の先端で通過、重の先端で失敗(既知。template の tailoring-kb.json の再生成が要る)。
