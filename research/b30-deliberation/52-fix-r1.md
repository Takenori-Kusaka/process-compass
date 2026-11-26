# 束 B32 — 独立の突合 1巡目の直し(2026-11-26)

裁定 `51-chair-r1.md` の全9件を直した。template のコミット c306ccc。

| 所見 | 状態 | 直した所 |
| --- | --- | --- |
| 高-1 cause を写さない | 済 | `config.mjs` normalizeRestriction が cause を写し、cause 1 では person の鍵を持たせない。`test-roster-conditions.mjs` に cause の期待と cause 1 の入口から集約までの場面を足した。直す前は4件 NG、直した後は全通過 |
| 中-1 IMPL-0284 の句 | 済 | `human-ai-boundary.md` の note に §2.5 の句と保証の開示の行(外へ渡す形は件数だけ)を足した。`40-impl-z5.md` に訂正を足した |
| 中-2 maxBuffer | 済 | `aggregate-evidence.mjs` の本文の読み出しに maxBuffer 64 MiB を渡し、失敗は null で受ける。G-4 の行に「本文を読めず、トレーラ Spec を数えていない」を出し、確かめられない側(blockers)へ入れる。試験 `test-edition-end.mjs`(上限を env AGGREGATE_BODY_MAXBUFFER で極小にして再現。env は試験用)。直す前は NG、直した後は通過 |
| 低-1 Spec 行の述語 | 済 | 段落の外の件数を F-NNN を含む行に限った。README 節18 に1句。試験あり |
| 低-2 lowUntil の分岐 | 済 | `autonomy.mjs` の理由の文に unregisteredText を付けた。README 節19 の文を改めた(編集-2 を含む)。coreUnregistered の害の向きは止める側で、別の行は足さない |
| 低-3 input.md の向き | 済 | input.md と test-loosening-decider.mjs のコメントを「上げる・新しく置くのは緩める向き、下げる・外すのは強める向き」へ |
| 低-4 IMPL-0645 の test= | 済 | roles-responsibilities.md の note に「集約の側の試験は test-edition-end.mjs」を足した。置き場の違いは `40-impl-z5.md` の訂正に書いた |
| 編集-1 IMPL-0517 | 済 | 「次の一手の注記と、保証の開示の G-4 の行に出す」へ |
| 編集-2 README 節19 | 済 | 低-2 と同じ箇所 |

## 確かめたこと

- 流した試験(node 26): test-roster-conditions、test-edition-end、test-aggregate-wiring(65 件通過)、test-loosening-decider、test-next-records、test-model-adoption。回帰の全量は流していない
- `npm run impl:write`、`npm run lint:refs`、textlint(変えた2つの md)は通過。`impl:issues -- --issue 356・348・441・450` は各 0 件

## 議長へ上げる点

なし。
