# B3 束の push 準備の記録(2026-11-15・2回目の載せ直し)

- main へ push してよいコミット: `806f06e64ff48f56d7f111d3c190825025aa6dd9`(ブランチ b3-push の先頭)
- 載せた先の origin/main: `037dfc4d28548791797efd69f1bd7d1f0eb6fb9c`。回帰の後に再度 fetch して、進んでいない
- #324 の範囲(main へ出さない)は Takenori-Kusaka/b3 に、b3-push の上へ載せ直した(#324 の3コミット、審議の記録、台帳の再生成)
- 退避: ブランチ b3-backup-pre-rebase-2、b3-324-part、bundle tmp/bundles/b3-pre-rebase-2.bundle
- 番号の付け直し: 有り。EV-0260〜0264 → 0261〜0265、IMPL-0520 → 0521(origin/main の #334 が EV-0260・IMPL-0520 を使った)。ADR は 0129 までで重ならない(0131〜0133 のまま)。SRC は新設なし。対応表は research/b3-rebase-2026-11-15.md
- 衝突: 台帳(evidence-ledger・implementation-ledger)だけ。origin/main 側を採って再生成した
- template の参照: origin/main と同じ 3d9da56
- 確かめ(b3-push): lint:refs・evidence・impl・scope・provisions、test:impl・plan-issues・provisions・fields、impl:issues は合格
- 回帰(WSL・node v26.13.1・WSL 内の git clone。~/b3-regress を再利用): npm ci 0、通常の `npm run check` 0、`TZ=UTC npm run check` 0
- 所見(b3 の #324 の範囲、main へは出さない): `npm run impl:issues` が失敗する。IMPL-0554(gate-criteria.md:1484)が issue=334 を持つが、#334 は origin/main の束で閉じた。#324 の次の作業で open の Issue へ付け替える(ここでは直していない)
- 回帰の後の origin/main: 進んでいない
