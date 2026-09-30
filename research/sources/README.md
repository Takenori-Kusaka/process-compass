# 出典台帳(research/sources/)

外部文献を1件1ファイル(`SRC-NNNN.yaml`)で管理する台帳です。2026-09 の事前調査(Issue #282)から運用を始めました。**それ以前の調査メモが引いた出典はこの台帳に入っていません**(「台帳に無い=調べていない」ではありません)。

## 読み方(最小トークンで辿る)

1. Issue 番号やテーマから引くときは、調査スナップショット(例: `research/282-survey-2026-09/`)の `by-issue.md` / `questions.md` を先に見る。1行で足りることが多い
2. 数値や引用が要るときだけ、`[SRC-NNNN#cN]` の ID で `research/sources/SRC-NNNN.yaml` を開く。`claims[]` に主張・原文抜粋(quote)・位置(locator)・検証結果がある
3. カードは**先頭から `claims` の終わりまで**を読めば足りる。`verification:` 以降は検証の生データ(機械照合・目隠し抽出・裁定の記録)で長い。`grep -n "^verification:" SRC-NNNN.yaml` で切れ目の行番号を得て、Read の limit に渡す。特定の主張だけなら `grep -n -A12 "id: c3" SRC-NNNN.yaml`
4. 台帳全体を眺めるときは `catalog.md`(生成物、1出典1行)を読む。YAML を全部読まない

## ID の規則

- `SRC-NNNN` はリポジトリ全体で一意。**再利用しない**(根拠水準マーク EV-NNNN と同じ)
- 除外した出典(`status: excluded`)も消さない。却下は成果であり、「探して無かった」と「探していない」を区別するため
- 本文中の引用は `[SRC-0123]`(出典)または `[SRC-0123#c2]`(出典の主張2)

## スキーマ(`schemaVersion: 0`、欄名は camelCase)

| 欄 | 値 | 意味 |
|---|---|---|
| `status` | included / excluded | excluded には `excludeReason` が必須 |
| `excludeReason` | not-found / off-topic / duplicate / untraceable-number / superseded / promotional / low-quality | |
| `url` / `canonicalUrl` | | 正規化後の URL と、重複判定に使う正準キー(`arxiv:ID`、`doi:...`、URL) |
| `ids` | `{arxiv, doi}` | |
| `orgType` | vendor / academic / standards-body / government / enterprise / sier / user-it / startup / individual / media / community / consultancy / nonprofit | 日本の Web 系・SIer・ユーザー企業 IT 部門・公的機関を区別する |
| `region` / `lang` | global / us / eu / jp / cn / other、言語コード | |
| `sourceType` | standard / regulation / public-agency / paper-peer / preprint / vendor-official / industry-report / corp-techblog / individual / news / talk / repo / community / book | |
| `published` / `publishedBasis` | 日付、arxiv-v1 / byline / meta / pdf / page / unknown | arXiv は v1 の日付。更新日は `updated` |
| `accessed` / `access` | 取得日、open / paywall / login / blocked | 403 やペイウォールを「実在しない」と取り違えないため |
| `readLevel` | full / section / abstract / secondary / snippet | **snippet は知見の根拠に使えない** |
| `foundBy` | `{cluster, query}` | 網羅性と偏りの監査用 |
| `derivedFrom` | `[SRC-…]` | 二次情報の一次出典。独立した根拠の数え上げで束ねる(E3 の水増し防止) |
| `selfReported` | true / false | ベンダーが自社製品について主張しているもの |
| `themes` | TH01〜TH12 | テーマの定義は調査スナップショットの README |
| `events` | `[{date, label}]` | 年表(views/landscape.md)の材料 |
| `claims[]` | 下記 | 主張は出典単位ではなく主張単位で記録する |
| `verification` | `{status, method[], date, humanChecked, note, mech, agent}` | 下記 |
| `volatility` / `reviewBy` | fast / medium / slow、YYYY-MM | 次回の差分調査で見直す対象を選ぶ |

### 主張(`claims[]`)

| 欄 | 意味 |
|---|---|
| `id` | c1, c2, … |
| `text` | 主張(日本語、1〜2文) |
| `quote` | **原文の抜粋(言い換え禁止)**。機械照合の足場 |
| `locator` | 節・表・ページなど |
| `quant` | `{value, n, design, population}`。数値を持つ主張に必須 |
| `evidenceKind` | rct / controlled-experiment / observational / survey / case-report / benchmark / review / normative(規格が定めること。効果の証拠ではない)/ vendor-guidance / expert-opinion / news-fact |
| `rqs` / `issues` | 関係する調査課題(`TH06-Q2`)と Issue 番号 |
| `stance` | supports / contradicts / qualifies / context(調査課題または Issue の主張に対して) |

### 検証(`verification`)

| status | 意味 | 旧マーカー |
|---|---|---|
| verified | 機械検証(URL・タイトル・arXiv/Crossref・引用文の一致)と目隠し抽出のいずれかで主張が確認できた | 【確認】 |
| partial | 一部の主張だけ確認できた、または二次情報経由 | 【二次】 |
| mismatch | 出典に書かれている値と食い違う(要裁定) | — |
| unreachable | 取得できなかった(403、ペイウォール、JS 描画)。実在しないという意味ではない | 【未確認】 |
| not-found | 404 や ID 不一致で実在を確認できない。**必ず excluded にする** | 【未確認】 |
| needs-agent | 機械検証で引用文が見つからず、目隠し抽出待ち | — |
| unverified | 未検証 | — |

`method` は mech-fetch / arxiv-abs / crossref / agent-blind の組み合わせ。`mech` に機械検証の生データ、`agent` に目隠し抽出(検証役は主張された値を見ずに抜き出し、比較はスクリプトが行う)の結果が入ります。

## 操作(`scripts/research-ledger.mjs`)

| コマンド | 役割 |
|---|---|
| `ingest <staging-dir>` | 検索役が書いた JSON カードを正規化・重複除去・採番して取り込む。LLM に書き写させない |
| `verify [--all\|--ids a,b]` | 機械検証(オンライン)。`npm run check` には含めない(#260 のリンク切れ検出と同じく手動) |
| `blind-tasks` / `adjudication-tasks` / `merge-adjudication <json>` | 目隠し抽出と裁定の作業票の生成、裁定結果の反映 |
| `bundles [--from SRC-NNNN --out dir]` | テーマ別にカードを1ファイルへ束ねる(知見抽出役が1回の Read で済むように) |
| `rq-update <json>` / `reformat` | 調査課題の状態の反映 / YAML の再整形と独立出典数の数え直し |
| `merge-verification <json>` | 目隠し抽出の結果を反映し、一致判定を機械で行う |
| `findings-ingest <json>` | 知見(FND)を採番して追記 |
| `lint` | オフライン検査。`npm run check` に含める |
| `index` | catalog / by-issue / questions / coverage / verification 集計 / views を再生成 |

調査スナップショットの場所は環境変数 `SURVEY_DIR` で切り替えられます(既定: `research/282-survey-2026-09`)。
