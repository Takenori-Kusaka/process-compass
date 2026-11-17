# #327 T1〜T7 の push の準備(束 B12・担当の記録。push はしていない)

- 本体: origin/main の上へ rebase(1 コミット先。衝突なし)。template: origin/main は進んでおらず rebase なし。未 push は 2d66b46..HEAD。bundle `template-b12-327-06.bundle` に退避済み
- 番号: git diff origin/main の EV・IMPL・ADR(IMPL-0542・0603・0679・0849・0850・0864・0951・0996・0997、ADR-0154)は、すべて origin/main に既にある番号の参照と state・note の変更。新設なし、付け直しなし。SRC の新設なし
- `impl:write`・`evidence:write`・`scope:write` で変更なし。`template:kb` は source.commit だけが変わったため template へ反映せず、stash push と名前での drop で退避した
- 回帰(WSL・node v26.13.1・LF の写し・本体と template に git init と 1 コミット・直列): `npm run check` rc=0、`TZ=UTC npm run check` rc=0。落ちた検査なし
- `npm run impl:issues -- --issue 327`: 0 件(閉じてよい)
