# 締めの記録: 規約への開示と ADR-0140(Issue #324。2026-11-15)

審議・裁定・実装・突合(束 A〜D、各2巡)の後の締め。条文・`template/`・登録簿・マークは変えていない。

## 1. 入れた所在と番号

| 何 | 所在 | 番号 |
| --- | --- | --- |
| 小節「区分の確かめ方」と根拠水準マーク | `src/content/docs/community/implementation-marking.md`「対象の棚卸し」の末尾(EV-0273 の枠の後、「限界」の前) | EV-0274(E0。見直し 2027-10) |
| EV-0135 の補足への参照の1文 | 同頁。対象・水準・差し替え条件は変えていない | — |
| 「棚卸しの残りは、章ごとの Issue で進めます。」の改め | 同頁「基準線」の末尾。終えた事実(2026-11-15、#324、`pending` 0)と集計の表 | — |
| ADR | `src/content/docs/adr/0140-inventory-closure-without-double-classification.md`(`sidebar.order: 140`) | ADR-0140 |
| 台帳 | `src/content/docs/community/evidence-ledger.md`(再生成)。実装台帳・適用範囲の台帳は「変更なし」 | — |

- EV の番号: 作業ツリーの言及の最大は EV-0273(EV-9997〜9999 は `research/440-deliberation/crosscheck-2.md` の見本で、数えない)。次の EV-0274 を使った
- ADR の番号: 指示のとおり 0140。0135〜0139 はファイルが無い(`research/333`・`334` が 0135・0136 に言及する。他の束の分と読んだ)

## 2. 集計の数(機械で数えた)

`src/data/impl-inventory.yaml` を YAML として読んで数えた(HEAD 81cf1eb。台帳の冒頭の表と一致)。

| 区分 | 節 | 着手の時点(806f06e) |
| --- | --- | --- |
| `marked` | 387 | 101 |
| `kb` | 7 | 3 |
| `none` / `explanation` | 94 | 16 |
| `none` / `elsewhere` | 67 | 26 |
| `none` / `org-design` | 6 | 20 |
| `none` / `not-imposed` | 4 | 1 |
| `pending` | 0 | 398 |
| 計 | 565 | 565 |

- 規約に自動生成の集計の表は無かった(自動生成は実装台帳の冒頭の章ごとの表)。規約には日付つきの手書きの表を足し、今の値は台帳を引く形にした
- 実装マーク: 519 → 966 件。降りていない規定: 104 → 333 件(うち降ろし先が予定: 37 → 103)。予定の降ろし先: 11 → 24 件。`check=machine` 197 → 197、`plan=adopter` 29 → 29(新設 0)
- **`issue=324` のマークが 205 件ある**。`decision.md` 2章 #5 の閉じる条件(`npm run impl:issues -- --issue 324` が 0 件)は満たしていない。付け替えは本担当の範囲の外。ADR-0140 の「影響」に書いた

## 3. EV-0274 に書いた数の出所

| 数 | 出所 |
| --- | --- |
| 既存のマークだけで `marked`・`kb` の節 63 のうち未読 42(A 10、B 24+5、C 3、D 0) | `crosscheck-A1.md` 1章の行5、`crosscheck-B1.md` 第3章・第8章の (5)、`crosscheck-C1.md` 4章 (5)、`crosscheck-D1.md` 4章の行5(附属書H の 5 節は全件) |
| `note` だけで判断した `undelivered` 47 件(A 26、B 12+9) | `crosscheck-A1.md` 3b、`crosscheck-B1.md` の (3) の2か所 |
| 束 B の2巡目 39 件のうち 21 件(予定 9・note だけ 12) | `crosscheck-B2.md` 5章 |
| 本件の前から `none` の節で対象外(A 14 節、C 17 節・4 行)。束 D の読み直し 29 節・18 行 | `crosscheck-A1.md` 1章の行1'、`crosscheck-C1.md` 4章 (1)(2)、`crosscheck-D1.md` 4章 |
| 較正: 11 担当、無効 2(01・07)、6 節一致 6(03・04・05・06・08・09)、5 節一致 2(02・10)、2 節一致 1(11) | `handover-01.md`〜`handover-11.md` の較正の節 |
| 1巡目の所見 160 件・高 41(A 20/2、B 53/21、C 45/11、D 42/7) | `ruling-A1.md`・`ruling-B1.md`・`ruling-C1.md`・`ruling-D1.md` の冒頭 |
| 2巡目の所見 57 件・高 8(A 10/2、B 18/2、C 14/1、D 15/3) | `crosscheck-A2.md` 2章、`crosscheck-B2.md` 0章、`crosscheck-C2.md` 1章、`crosscheck-D2.md` 冒頭 |

## 4. 検査の結果

回帰の全量は流していない。一時 worktree は作っていない。結果は本ファイルの末尾の「検査」に追記する。

## 5. 迷った点

1. **区分済みの `elsewhere` の全件の読み直し**: `decision.md` 2章 #2 は、区分済みの `org-design` と `elsewhere` を突合で全件読み直すと定める。記録から確かめられたのは、`org-design` の読み直し(束 D。29 節・18 行)と、束 B の第3章の区分済み 14 節である。束 A の 14 節と束 C の 17 節・4 行は「対象外」と書かれており、そのうち `elsewhere`・`explanation` の節が後で読まれた記録は見つからなかった。EV-0274 に「残りの数は数えていない」と書いて開示した。議長が、裁定の #2 を満たしたと読むかを確かめてほしい
2. **較正の 02 番の数え方**: 6 番で候補を2つ(`marked` か `org-design`)挙げている。T6 は `not-imposed` と `org-design` を一致と数える。5 節一致に数えた
3. **1巡目の「高」の型ごとの件数**: 束 B だけ型ごとの件数の表がある(21 件のうち 13 件)。束 C は「11 件のうち 8 件が同じ原因」と書くが、型の内訳と足すと 12 になり、重なりがある。全束の型ごとの件数は書かず、束 B の数だけを書いた
4. **「高」の向き**: 多くは表示を増やす向き(降りているものを降りていないと表示)だが、区分済みの `org-design` の読み直し(束 D の高 6)と附属書D の `none` は、表示を減らす向きである。EV-0274 の末尾に両方を書いた
5. **2巡目の直しの後**: 2巡目の所見を受けた直し(`fix-A2`・`fix-B2`・`fix-C2-D`・`fix-D2`)は、別の文脈が見直していない。EV-0274 に書いた
6. **ADR-0075 との関係**: 記録の中に、本件が ADR-0075 の決定に触れた箇所は見つからなかった。「決定を変えない。ADR-0076 決定10 が直した決定9 の事実にも触れない」とだけ書いた
7. **ADR-0076 決定4「残りは章ごとの Issue で進める」**: 本件は #324 の1件で進めた。置き換えとはせず、「既存の決定との関係」に事実を書いた。置き換えと読むなら、ADR-0076 のステータスの節に後継の番号を足す必要がある(adr/index.md の運用 5)。議長の判断に委ねる
8. **判定表の所在**: 決定2 の判定表は `research/324-deliberation/rulings.md` にあり、規約の本文には無い。規約へ判定表を足すことは指示に無いので、ADR-0140 の決定2 に問いの文だけを書いた
9. **条文の食い違いの候補の寄せ先**: 各 ruling は「議長が既存の open の Issue へ寄せる」と書く。寄せ終えたかは確かめていないので、ADR には番号を書かず「既存の open の Issue で扱う」とした
10. **実装台帳の定型文**: 冒頭の「未棚卸しの0節は、実行主体を縛る規定があるかを確かめていません」は、0 節のとき文が合わない。生成のスクリプトの文で、本担当の範囲の外。直していない
11. **集計の表の鮮度**: 規約に足した集計は手書きで、日付(2026-11-15)を付けた。登録が変わっても検査は食い違いを見ない

## 検査

2026-11-15。すべて終了コード 0。

| 検査 | 結果 |
| --- | --- |
| `npm run evidence:write` | 更新(根拠水準マーク 258 件。期限到来 0 件) |
| `npm run impl:write`・`npm run scope:write` | 変更なし |
| `lint:text`(textlint。全頁) | 0 |
| `lint:tone`・`lint:evidence`・`lint:impl`・`lint:scope`・`lint:refs`・`lint:provisions` | 0 |
| `lint:dekimasu`・`lint:citations`・`lint:registry` | 0 |

- ADR の番号・索引だけを見る専用の検査は `package.json` に無い。ADR 番号の実在は `lint:refs` が見る。`adr/index.md` は ADR の一覧を持たない(sidebar は autogenerate)
- 流していないもの: `test:*`、`build`、`lint:skills`・`lint:figures`・`lint:sources`・`lint:ci`・`lint:stage-table`、回帰の全量。push の前の `npm run check` で確かめる
