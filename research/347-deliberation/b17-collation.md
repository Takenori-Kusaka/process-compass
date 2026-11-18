# #347 受け入れ条件・コメント項目の突合(b17。2026-11-18)

実物で確かめた範囲: `gh issue view 347`、`git log --all --grep '#347'`、overview.md 1.4、ADR-0142、evidence-ledger、deliverable-templates.md:1841、pit-in-template の 9fb3dcd(gh api で 09 を読んだ。template/ はこの worktree では未初期化)。

| 項目 | 判定 | 所在・根拠 |
| --- | --- | --- |
| AC1 どちらかの記号を改める、または改めない理由を ADR に記録 | 満たした | ADR-0142(`src/content/docs/adr/0142-resolve-name-collisions-by-definition-not-rename.md`)。コミット dcad1797(反映)、18785331(裁定 04-ruling.md) |
| AC2 改める場合、本文・テンプレート・知識ベース・retired-ok を揃える | 該当せず(改めない裁定) | 04-ruling.md K-1。案 B・C・D は不採用で記録済み |
| C 本文: 1.4 に「担保水準」行と AI自律レベル行の読み分け規則 | 満たした | `phase4-process-design/overview.md:154-155`、EV-0288(同 :189、evidence-ledger.md:193)。dcad1797、突合の直し b3cf3203・59891f72 |
| C 独立の突合 2 巡(軽) | 満たした | 07・09、直し 08・10。push f85e164、CI 43989021666 緑 |
| C 機械の検査にしない(manual を EV で開示) | 満たした | EV-0288(E0)。実装マークなしの裁定どおり |
| 1コメント目の残り: template の見出しへ語を足す・知識ベース再生成 | 寄せ済み相当(束 B16 で実施)、一部要確認 | B16 コメント C-6。template 9fb3dcd の `09-safety-risk-assessment.md:24` に「L の記号は AI自律レベルを指します。担保水準の L0〜L2 とは別」を追加、適用条件の語は「AI自律レベル」(:14)へ揃え済み。知識ベース再生成は B15 の範囲と記録。B16 の記録 `research/b16-deliberation/` |
| 見出しへの語の追加(`## AIエージェント安全リスクアセスメント(適用: …L2 以上…)`) | 要確認 | 標準側 `deliverable-templates.md:1841` の見出しは「…本番到達・L2 以上のいずれか」のまま(記号のみ)。B16 は見出しを変えず本文の注記で読み分ける方針(inventory C-6 は「見出し」を対象と書いたが、実施は「記号」節への注記。H1 を揃える案は見送りと記録)。見出しの L2 が 1.4 の規則(同じ文・見出し・欄名から読めない所は記号のみにしない)に当たるかは manual の確認事項で、確認の記録は見当たらない。ただし ADR-0142 決定3 の manual の対象と 04-ruling/1コメント目に既に明記された扱い |
| 寄せ先 Issue | なし | 他の Issue への付け替えの記録なし。#361 などは無関係。open で当該作業を持つ Issue は検索で見つからず |
| `npm run impl:issues -- --issue 347` | 満たした | 0 件(依頼文・B16 コメントとも) |

## 結論

閉じてよい(議長の判断で)。AC1・AC2 は満たし、template 側の項目(C-6)も B16 で実施済み。template の機械の検査で残るものは無い(検査対象にしない裁定)。

要確認は1点のみ。標準側 deliverable-templates.md:1841 の見出しに記号だけの「L2 以上」が残り、規則の manual 確認が記録されていない。これは機械の検査ではなく、議長の判断で「見出しは手順の題として許容」と記録するか、見出しへ「AI自律レベル」を足すかを決める事項。
