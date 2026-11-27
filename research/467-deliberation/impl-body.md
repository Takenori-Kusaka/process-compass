# #467 本体側の実装の記録(2026-11-27。担当: 本体の実装)

- 入力: `ruling.md`(追補 2 が最終)、`impl-template.md`、`impl-precheck.md`。template の中身は変えていない(template の d4-467 は e68d92b のまま。コミット・退避の追加なし)
- 実装した件の全体は 13 件。本体側で触ったのは下記

## 変えたファイルと要点

| ファイル | 要点 |
| --- | --- |
| `src/content/docs/adr/0271-burden-review-drop-copies-...-to-machine.md`(新規) | ADR-0271。点検の軸・やめる 5 項・機械へ移す 6 項・まとめる・残す(段階1)・採らない案 33 行(ruling-draft §4 の 27 件と、M-7・B-13・G-1 の 3 件)・影響と限界・EV 3 件。ADR の一覧は autogenerate なので index.md への追記は無い |
| `phase4-process-design/deliverable-templates.md` | 第4章「実装作業における順序」の段階3 を「比べる。記録は求めない。生成結果を採った場合は 5.5.1 の作業上の選択の理由として残す」へ。IMPL-0819 の note を改めた(マークは残す)。段階1 と「段階1 を経ずに段階2 へ進んではならない」は不変。実装計画の運用ルールへ「着手・完了は履歴から導いてよい。人が書くのは『やり直し』だけ」の 1 行を足した(下の食い違い 1) |
| `phase5-implementation/pr-workflow.md` | 例の PR の「AI 関与範囲」を「トレーラが正本」の 1 行へ(見出しは残した)。補足の文(旧 104 行)を同じ形へ。導出が未実装で IMPL-1061 で表示される旨を足した |
| `phase4-process-design/human-ai-boundary.md` | IMPL-1061 を 5.8.2 の IMPL-1034 の直後へ置いた(下の「見送り・判断」の 1) |
| `phase4-process-design/tailoring-guide.md` | IMPL-0310 の note へ「準拠テンプレートは D-0 の版の欄を構成から生成する区間にした。値の食い違いは check-d0 が問題にする」を追記 |
| `src/data/template-fields.yaml` | t1「承認」・t6「承認(G-1)」の extra を削除。t7「承認(G-4)」の reason を「承認の記録の所在の 1 行」へ。t7 の状態の行の template 側の文字列を新しい様式の文(「…のいずれかです」)へ(test:fields が落ちたため) |
| `src/data/impl-targets.yaml` | pr-template の description に AI 関与範囲・自己チェックの扱いを、process-change-skill の description に seatsByPerson・d0-edition を追記 |
| `src/data/impl-inventory.yaml` | 5.8.2 の登録へ IMPL-1061 を追加 |
| `community/implementation-ledger.md`・`evidence-ledger.md` | `impl:write`・`evidence:write` で再生成(手編集なし) |
| `template`(submodule) | 参照を d4-467 の先頭 e68d92b へ進めた(`git add template`) |

## 足した番号

- EV-0365(写しの欄をやめても事故の後の再構成に支障がない。E0)、EV-0366(PR の自己チェックは確かめた証拠にならない。E0)、EV-0367(段階3 の記録をやめても段階1 の効果が保たれる。E1)。すべて見直し 2027-11。origin/main の最大 EV-0364 の次
- IMPL-1061(PR の AI 関与範囲の導出。undelivered)。origin/main の最大 IMPL-1060 の次
- push の直前に別の担当が付け直す場合は、ADR-0271 の本文・pr-workflow.md・human-ai-boundary.md・impl-inventory.yaml・台帳の同番号を揃えて直す

## 流した検査

| 検査 | 結果 |
| --- | --- |
| `npm ci` | 実行 |
| `npm run test:fields` | 通過(最初は t7 の状態の行で失敗。上記のとおり直した) |
| `npm run test:template` | 複製の検査: 一致 |
| `npm run lint:impl` | 通過(IMPL-1061 の登録簿の漏れを直した) |
| `npm run lint:refs`(ADR のリンク検査を含む) | 通過 |
| `npm run lint:evidence`・`lint:scope`・`lint:provisions`・`lint:tone`・`lint:dekimasu`・`lint:skills` | 通過(provisions は IMPL-1061 を手引きの頁へ置いて失敗したので、5.8.2 へ移して通過) |
| textlint(ADR-0271・pr-workflow・human-ai-boundary・tailoring-guide・deliverable-templates) | 通過 |
| `npm run template:kb` | 実行した。規則データは変えていない。差分は template の `tailoring-kb.json` の `source.commit`(本体の HEAD の参照)だけで、元の値へ戻した。LF/CRLF の差の表示だけが残る(内容の差は無い) |
| `npm run check` の全量・template の回帰 | 流していない(別の担当) |

## 直した食い違い

1. 第6章 テンプレ7 の運用ルール「着手は Draft PR の作成」は、`/pit` の導出(ブランチ)と、人が書く値の範囲(template は「やり直し」だけ)に食い違う。人の記入を要しない旨の 1 行を足した。着手の定義(Draft PR / ブランチ / 最初の PR=ADR-0173)の 3 つの並立は、そのまま残した
2. `template-fields.yaml` t7 の状態の行の template 側の文字列
3. IMPL-0819 の note の「相違を記録する(段階3)」
4. IMPL-0310 の note(D-0 の版の欄が生成区間になった)
5. pr-workflow.md の例・補足の文・導出の表示

調べて食い違いが無かったもの: ci-gates.md の `approver`・`approved_at`(D-0 の承認欄で別件)、overview.md・tailoring-guide.md の「従う本標準の版」(要求事項の記述で、生成の有無に触れない)、agent-trace-control.md 126 行(導出元から自動で埋める形と整合)、PR のチェックリスト項目を定める標準の本文(無い)、`approved_by` を言う標準の本文(無い)。数値 ID を人が書くと定めた標準の本文も無かった。

## 見送りと、判断した点

1. **IMPL-1061 の計画の印**: `plan=scheduled issue=467` は #467 を閉じる妨げになるので使わなかった。`plan=scheduled` に別の Issue を置くと、その Issue(#457 など)が無関係に閉じにくくなる。`plan=adopter decision=ADR-0271` とした(降りていない事実は台帳に残る)。裁定は「undelivered で表示」としか言っておらず、`adopter` は「準拠テンプレートは導出を実装せず、採用者が決める」ことを意味する。**これは裁定を超えた判断かもしれない**。所有者が template 側で導出を作る方針なら、Issue を起票して `scheduled` へ改める。マークの置き場は、手引きの頁だと `lint:provisions` が落ちるため、5.8.2(標準の条項の側)にした
2. **M-5 の「不明」の部分実装**(impl-template.md 参照)は、標準の本文に書いていない。本文に条項を足さないため
3. **標準の本文の「Draft PR をもって着手」**: 書き換えず並置した。直すと着手の定義の整理(ADR-0173 を含む)になり、本件の範囲を超える
4. kb の再生成: 規則データを変えていないので template へのコミットは無い

## 独立の突合の担当に見てほしい所

- ADR-0271 の「採らない」表の理由が、ruling-draft.md §4 と追補の 3 件の文意と合っているか。「影響」の「約 4 割減」は §1 の表(欄 74→56、78→59 など)からの概算で、型 T の最小は 16→9 で約 4 割を超える
- ADR-0271 の「決定 3」の M-5 の説明に、「不明」の実装が一部であることを書いたか(影響の限界に書いた)
- IMPL-1061 を `adopter` としたこと、置き場を 5.8.2 にしたことの妥当性
- 実装計画の運用ルールに足した 1 行が、新しい義務・条項に当たらないか(許容の文のつもり)
- EV-0367 の水準を E1 としたこと(対照実験は隣接する領域)

## 本体のコミット

下の「コミット」の節を参照(作成後に追記)。
