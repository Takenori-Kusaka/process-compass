# #335 template に及ぶ項目(Issue のコメントに貼る一覧。template/ は触っていない)

本文(3.5.5)は 2026-11-15 に直した。template 側の追随は次のとおり。Issue は開いたままにする。

| # | ファイル | いまの文 | 変える内容 |
| --- | --- | --- | --- |
| 1 | `template/CLAUDE.md` L36 (c) の例示列 | 「削除・本番デプロイ・課金の書き込み・スキーマ変更・外部への発行」 | 「削除」を「データの削除」に直す。2つの概念を混ぜない(取り消せない操作は 5.5.1・戻し先 state:needs-owner、統制の弱化は 3.5.5・state:needs-platform)。ガード・検証ゲートの削除は統制の弱化であり、(c) に並べない |
| 2 | `template/CLAUDE.md` L43 | 「強制層(`.claude/**` 等)の縮小・遮断の解除・閾値の緩和 / `state:needs-platform`(取り消せない操作なら `state:needs-owner` も)」 | 3.5.5 に合わせ「取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除の場合は `state:needs-owner` も」にする。配備の統制を外す変更も統制の弱化に当たると足す |
| 3 | `template/scripts/gate/claude-md-resident.json` L131(core)・L146・L151 | L131 は (c) の例示を写す。L151 は「強制層…の縮小・遮断の解除・閾値の緩和 / state:needs-platform(取り消せない操作なら state:needs-owner も)」 | 1・2 と同じ文に揃える。CLAUDE.md の行と照合する検査があるため、同時に直す |
| 4 | `template/.claude/skills/pit/reference/handoff.md` L15・L53 | L53 は「ガード・検証ゲート・重要テストの削除(統制の弱化。取り消せない操作の定義によらず併記する)」で、すでに別の事由として区別 | 配備の統制を外す変更(配備の環境の保護規則の削除、ルールセットへの迂回の主体の追加)を統制の弱化の例として1行足す。配備の起動は取り消せない操作の側と明記 |
| 5 | `template/scripts/init/generate-profile.mjs` L4286 | ESCALATION は第7章 7.6 の表(段階1〜3 と取り消せない操作)の写し | 変えない。7.6 の表に統制の弱化の行は無く、足すと本文と食い違う。統制の弱化の経路は handoff.md L53 が運ぶ |
| 6 | `template/.claude/skills/pit/reference/boundaries.md` L24 | 「削除」の語は無いことを 2026-11-15 に確かめた | 直さない |
| 8 | `template/.claude/skills/pit/reference/handoff.md` L56 | リンク「第5章 4.7」(手引きへ降格した頁の古い節番号) | 第3章 3.5.5 に直す |
| 9 | `template/scripts/init/generate-profile.mjs` L4242 の注釈 | 古い節番号 | 第3章 3.5.5「ラベルの語彙」に直す |
| 10 | `template/scripts/gate/test-roster-rules.mjs` L317 の試験名 | 「(4.3 の付与者・4.7.3)」 | 3.5.5 の表「ラベルの語彙」に直す |
| 7 | 起案が足した「削除」の語の全箇所 | 「削除」 | 取り消せない操作の例示として使う所だけ「データの削除」にする |

