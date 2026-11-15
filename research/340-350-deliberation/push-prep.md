# push の前の番号の付け直し(B1 を origin/main 23e250c の上へ載せる)

束 B2 が先に main へ入り、ADR-0128・EV-0257・SRC-0731〜0737 を使ったため、B1 の分を付け直した。標準の意味は変えていない。B1 の 20 コミットは 1 つの差分へ畳んだ(重複した番号を持つ途中のコミットを main へ入れないため)。退避: ブランチ `backup-b1r-pre-renumber`(旧 69adf5b)。

## 旧→新の対応表

| 種別 | 旧 | 新 |
| --- | --- | --- |
| ADR | ADR-0128(ファイル `0128-second-category-window-baseline-and-rework-rate-derivation.md`) | ADR-0129(`0129-…`) |
| 根拠水準 | EV-0257 | EV-0259 |
| 出典台帳 | SRC-0731〜0737 | SRC-0738〜0744(+7) |
| 実装マーク | IMPL-0516〜0519 | 変更なし(origin/main の最大は IMPL-0515 で重ならない)。template の試験の目印も変更なし |

B2 のもの(ADR-0128・EV-0257/0258・SRC-0731〜0737)は触っていない。本書以外の B1 の記録(`research/340-350-deliberation/`・`research/354-deliberation/`・`research/282-survey-2026-09/`)の中の番号は、B1 のものを新しい番号へ改めた。したがってこれらの記録の「ADR-0129」「EV-0259」「SRC-0738〜0744」は、記録を書いた時点では 0128・0257・0731〜0737 だった。

## 衝突とその解き方

付け直し済みの B1(一時ブランチ)を origin/main へ `merge --squash` した。衝突は 3 件。
- `research/sources/catalog.md`・`src/content/docs/community/implementation-ledger.md`: 自動生成の台帳。origin/main の側を取り、`impl:write`・`sources:index` で再生成した
- `src/content/docs/phase4-process-design/overview.md`(参考文献の表の 2 行): B2 の行(12207:2026 の SRC-0491、9001 の追補を読んでいない旨)を土台にし、B1 の JIS Q 9001 の記述(公開プレビューの表紙の識別だけ。本文は取得していない)を足した。両方の変更を残した
- `SRC-0731〜0737.yaml` の add/add は、付け直しにより B1 を SRC-0738〜0744 へ移したため発生しなかった
- `evidence-ledger.md` は自動で合流し、`evidence:write` で「変更なし」を確認した。`graphify-out/` は origin/main のまま

## リンクの直し

ADR-0129 17行目の `/adr/0084-adopter-plan-and-undelivered-display/` は実在しない。実在は `0084-check-strength-plans-and-resident-rules`。ADR-0084 の決定4(`state` は2値のまま、降りていない規定に計画を付ける)が引用の趣旨(`plan=adopter` の理由を記録する表の形)に合うことを確かめ、リンクを直した。変更した `src/` のほかの ADR へのリンクは、すべて実在した。

## 検査の結果

すべて合格: `check-impl`(IMPL-0514 ほかの未達の表示は仕様どおり)・`lint:refs`・`lint:evidence`(247件)・`lint:scope`(31件)・`lint:sources`・`lint:registry`・`lint:citations`・`check-template-drift`・`check-template-fields`・変更した md の textlint・template の `test-check-delegation.mjs`(68場面)・`test-loosening-decider.mjs`。node_modules は共有のものへジャンクションを張って使い、終了後に外した。全量の `npm run check` は流していない(次の担当が WSL で流す)。

## template

IMPL の番号を変えていないため、template に新しいコミットは足していない。参照は `rebuild-b1` の 1e30869。push していない。

## 検算

下の「検算の結果」を参照(コミット後に追記)。

## 検算の結果

- `git diff backup-b1r-pre-renumber b1r-landing` は、番号の置換・ファイル名の改名・B2 の変更(origin/main の進み 64 ファイル)・台帳の再生成だけで説明がつく。B1 の 5 件の差分(`git diff 490a8f3 backup-b1r-pre-renumber` の 48 ファイル)はすべて載っている
- `origin/main` との差分の追加行に旧い番号(ADR-0128・EV-0257・SRC-0731〜0737)が残る箇所は、すべて B2 のものへの正当な参照である。すなわち、B2 の出典を含めて再生成した `research/282-survey-2026-09/` の索引と台帳の行、`overview.md` の参考文献の表の SRC-0737(B2 の追補の出典)、本書の対応表。B1 の手書きの本文には残っていない
