# 束 B33 載せ直し 1(origin/main の上へ)

- template: wip/b33 の3コミットを origin/main(3769f79)の上へ rebase。衝突なし。新しい先頭 0ab526a
- 本体: Takenori-Kusaka/b33 を origin/main(cc13a6aa)の上へ rebase。衝突は2種のみ
  - submodule の参照(template): rebase 後の template の先頭 0ab526a へ合わせた
  - implementation-ledger.md: 自動生成のため `npm run impl:write` で再生成(降りていない規定 94件、機械 304・人 566)
  - graphify-out の衝突は無かった
- 番号: ADR-0243 は origin/main に無く衝突なし(B32 は 0244・0250 を使用)。EV-0347・0348 も origin/main に無い。IMPL-1036 は B32 の ADR-0244 が undelivered で予約したマークで、B33 が同じ番号のまま delivered にする(別番号にしない。意図した引き継ぎ)。SRC の追加は無い
- 台帳: impl:write で差分が出たので再生成。evidence:write・scope:write は変更なし
- template:kb: 複製の差は commit 欄(自己参照)のみで、規則データの差は無いため、template 側は戻して先頭を動かさない
- 試験(template の LF の写し): test-adapter 232・exception-expiry 109/109・push-trigger 27/27・init-g5 208 は通過。check-pr・g5-aggregate は最終報告の記載を参照
- 本体: lint:impl・lint:evidence・lint:refs・test:fields は終了 0
