# 束 B22 — 群A(#325)・群C(#446)の実装の報告(2026-11-19)

従ったもの: `30-ruling.md`、`30-ruling-draft.md` の §3.1・§3.3・§3.4〜§3.7 のうち群A・群C の分。群B(§3.2)は実装していない。template/ と `src/data/tailoring/` は触っていない。`template:kb` は実行していない。

## 1. 変えたファイルと箇所

### 群A(コミット: 「事前レビュー期間の短縮の条件と判定へ進めない検査の扱いを定める(#325)」)

| ファイル | 箇所 | 変更 |
| --- | --- | --- |
| `src/content/docs/phase4-process-design/roles-responsibilities.md` | 3.10.2 の最終段落と EV-0281 | 3段落に差し替え。流れ図(Mermaid)を足した。EV-0281 の caution を削除(番号は空けたまま)し、EV-0327 を置いた |
| 同 | 3.10.9 の「つまり」の文の直後 | 「この扱いは、判定へ進める条件(3.10.5)に限ります。…」を足した(編集の指摘) |
| 同 | IMPL-0830・IMPL-0214・IMPL-0217 の note | 裁定の案 §3.1(4) のとおり書き換え。状態・plan・issue・review は変えていない |
| `src/content/docs/phase4-process-design/exception-escalation.md` | 7.4「後回しにできる対象」の「ここにないものを短縮してはなりません。」の直後 | 参照の一文を足した。表は変えていない |
| `src/data/impl-targets.yaml` | `pre-review-automation` の description | 「必須ステータスチェックは作らない」「判定へ進めない強制は作らない」を、宣言行の検査を用意し既定で必須にしない旨へ替えた |
| `src/content/docs/adr/0223-pre-review-shortening-requires-all-named-responses.md` | 新規 | ADR-0223。EV-0328 を本文末に置いた(ADR に caution を置く前例は ADR-0200 の EV-0326 にある) |
| `src/content/docs/adr/0200-b18-first-group-adopter-record-conventions.md` | ステータスの節 | 決定4 の一部置き換えを追記(両側が互いを指す状態) |
| `src/content/docs/community/evidence-ledger.md`・`implementation-ledger.md` | 自動生成 | `evidence:write`・`impl:write` で再生成 |

### 群C(コミット: 認証情報の離脱。本ファイルを含む)

| ファイル | 箇所 | 変更 |
| --- | --- | --- |
| `src/content/docs/phase4-process-design/overview.md` | 1.10.2 の表の行 | 1行を2行に分けた(§3.3(1) の文) |
| 同 | 帰結の注記(「席ごとに認証情報を分けていない構成。」)と2名の体制の条件(「席ごとに認証情報を分けている。」) | §3.3(2) のとおり替えた |
| 同 | 表の後(IMPL-1004 の前) | EV-0330・EV-0331 を置いた |
| 同 | IMPL-1004 | `state=undelivered check=manual plan=adopter decision=ADR-0225` へ移し、`issue=`・`review=` を外した。note を §3.3(4) のとおり書き換えた |
| `src/content/docs/phase4-process-design/roles-responsibilities.md` | 表3 の理由文、3.5.1 の「ロールごとに」 | §3.3(3) のとおり、兼務を禁止した組に揃えた。条件1・レーンの定義・表前文・IMPL-0299 は触っていない |
| `src/content/docs/adr/0225-credential-departure-split-seats-and-natural-persons.md` | 新規 | ADR-0225 |
| `src/content/docs/adr/0133-…`・`0035-…`・`0147-…` | ステータスの節 | 一部置き換えを追記(両側が互いを指す状態) |
| `research/sources/SRC-0766.yaml`・`SRC-0767.yaml` | 新規 | NIST SP 800-53 Rev.5 IA-2(5)、OWASP NHI9 |
| `research/sources/catalog.md`、`research/282-survey-2026-09/by-issue.md`・`coverage.md`・`verification.md` | 自動生成 | `sources:index` の再生成による |
| 台帳 | 自動生成 | `evidence:write`・`impl:write`・`scope:write` |

## 2. 仮番号と実番号の対応

| 仮番号 | 実番号 | 置き場 | 備考 |
| --- | --- | --- | --- |
| EV-TMP-1 | EV-0327 | roles-responsibilities.md 3.10.2 | 現在の最大は EV-0326 |
| EV-TMP-2 | EV-0328 | ADR-0223 末尾 | |
| EV-TMP-3 | (EV-0329 を群B のために空けた) | 附属書F F.6 | 群B の担当が使う。付け直しのときに衝突しなければそのまま |
| EV-TMP-4 | EV-0330 | overview.md 1.10.2 | |
| EV-TMP-5 | EV-0331 | overview.md 1.10.2 | |
| SRC-TMP-C1 | SRC-0766 | | 現在の最大は SRC-0765 |
| SRC-TMP-C4 | SRC-0767 | | |
| IMPL-TMP-1 | (群B。本担当は使っていない) | | 群C は新しい IMPL を足していない |
| EV-0281 | 削除 | | 番号は空けたまま |

注: 作業の途中で EV-0334 と書いてしまい、EV-0327 へ直した。最終の差分に EV-0334 は残っていない。

## 3. 流した検査(結果)

- `npm run lint:evidence`: 通過
- `npm run lint:impl`: 通過
- `npm run lint:scope`: 通過(注記32件。台帳に変更なし)
- `npm run lint:refs`: 通過
- `npm run lint:provisions`: 通過(初回は 3.10.2 の「短縮できません」で1件落ちたため「短縮してはなりません」へ直した)
- `npm run lint:tone`・`lint:dekimasu`・`lint:figures`・`lint:citations`: 通過
- `npm run lint:sources`: 通過(初回は readLevel の語彙で落ちたため `section` へ直した)
- `npm run test:plan-issues`・`npm run impl:issues`: 通過
- textlint(編集した md だけ): 通過(途中の違反2件は即直した)
- `npm run check` 全体、`lint:text` の全量、`build`、template 関係の試験(`test:template` ほか)は流していない(指示による)

## 4. 置けなかった文案と理由

なし。次の食い違いは、意味を変えずに合わせた。

- `roles-responsibilities.md:545` の原文は全角の括弧「（GitHubトークン等）」だった。案は半角だったため、原文の表記を保って「兼務を禁止した組のロールどうしで認証情報（GitHubトークン等）を分ける」とした
- 案の IMPL-0830 の note の「(a)〜(c)」は、そのまま置いた。既存の「行があれば…と出し」の文は、旧い出力の文が template に残る旨へ書き換えた
- 案の「`overview.md` 2行目の見出しの名は、`gate-criteria.md` の実際の見出しを確かめて合わせる」: `gate-criteria.md:90` の箇条「アカウントと人の対応表」と、保証の主張の成立条件4(1848 行付近の IMPL-0113)が実在することを確かめ、案の文のまま置いた。`lint:refs` は通っている

## 5. 裁定の案と違えた点

- ADR の index(`adr/index.md`)に3本を足す指示(§3.5): index は運用ルールとテンプレートだけで ADR の一覧を持たない(sidebar は autogenerate)ため、足していない。ADR-0224 は群B のために空けた
- EV-TMP-2 の置き場: ADR に caution を置く前例があるため、ADR-0223 の末尾に置いた(条文側には置いていない)
- ADR-0225 には EV-0330・EV-0331 の caution を重複して置かず、「根拠水準」の節で番号を指した(同じ識別子を2箇所に置くと検査が落ちるため)
- 3.7 の流れ図は、勧めに従って 3.10.2 に1枚足した
- 手引きに「3名以下では…」を書く案(A2-3): 実装の指示 §3.1 に含まれず、「新しい条項を足さない」のため、本束では書いていない。pre-review の手引きは template 側の文書で、次の template の束で扱う
- IMPL-0521 の note に読みの変化の一句を足すかの判断(§3.3(4)): 足していない。note は内容が正しく、読みの変化は ADR-0225 と 1.10.2 の2行で足りる
- `research/b22-deliberation/30-ruling.md` に作業ツリーで別の変更(群B の回答の記入)があった。本担当は触っていない。コミットにも含めていない

## 6. 独立の突合で見てほしい点

- 3.5.3 の意味(禁止の組だけに課す)が変わっていないこと(表3 の理由文と 3.5.1 の語の直しが、禁止でない組にも分ける義務を消した向きにだけ働いていること)。意味の変更でなく編集に収まるかは、突合の判断を待つ
- 名簿で人に対応づけたホスティングのアカウントを案I の除外に入れない限定(会議体に付議していない議長の加え)が、1.10.2 の2行目と ADR-0225 決定5 で同じ文意になっていること
- 3.10.2 の「(適用: 7.4 の行がそのゲートを名指す場合)」が、scope-marking の書式に沿うこと(`lint:scope` は通っているが、台帳に新しい行は出ていない)
- IMPL-0830 の note が、template の現在の出力(旧い文)と実装の範囲を食い違いなく書いていること

## 7. 次の template の束へ

裁定の案 §4 の #325・#446 の項目(各 Issue のコメントに貼る分)は、本担当では貼っていない。

## 8. 番号の付け直しの注意

push の直前に付け直す担当は、EV-0327・0328・0330・0331、SRC-0766・0767 を群B の番号と突き合わせる。EV の参照は次の5か所にある: roles-responsibilities.md(EV-0327)、ADR-0223(EV-0327 を選択肢の表で参照、EV-0328 を定義)、overview.md(EV-0330・EV-0331 を定義)、ADR-0225(両方を参照)。
