# #332 実装の記録(束 B11、2026-11-17)

## 変えたファイル

- `src/content/docs/community/standard-editions.md` — 節「受け取り側が生成元を確かめる手順」(5.1)。既知の食い違いの開示と EV-0301 を含む
- `src/content/docs/phase5-implementation/compute-strategy.md` — 「PR」の語2か所の中立化と、1名の体制の1段落(5.2)
- `src/content/docs/adr/0157-recipient-origin-check-is-guidance-and-kb-source-limited-to-main-history.md` — 新規(5.4)。決定3 に「降ろすまでの間は未達」(8章)
- `src/content/docs/adr/0090-job-token-and-deploy-credential-binding.md` — ステータスの節だけに、決定8 の2項目の一部置き換えを追記(本文は不変)
- `src/content/docs/community/evidence-ledger.md` — `npm run evidence:write` による再生成(EV-0301)
- 索引: `adr/index.md` は ADR の一覧を持たない(サイドバーは自動生成)ため、行は足していない。運用ルール5 に従い、置き換えの関係は両側のステータスの節に書いた

EV 番号: origin/main の最大は EV-0300。EV-0301 を仮に使った。他の束と衝突したら付け直す。

## 実行での確認(6章。scratchpad の使い捨てリポジトリ。スクリプトは `…/scratchpad/trial.sh`)

条件1 = `git merge-base --is-ancestor S origin/main`(配布物は加えて kb の `source.commit` = `VERSION.md` のコミット)、条件2 = `git diff --quiet S:src/content/docs D:docs`(終了コード 0 が成功)。

| 例 | 結果 | 期待との一致 |
| --- | --- | --- |
| T1 正常 | 祖先=0 一致=0 中身=0 | 一致 |
| T2 中身の差し替え | 祖先=0 一致=0 **中身=1** | 一致(祖先の確認だけでは通る) |
| T3 偽の生成元(main に無い枝) | **祖先=1** | 一致 |
| T4 識別と kb の不一致 | 祖先=0 **一致=1** | 一致 |
| T5 実物の同梱 kb(59425d2e) | 祖先=1(標準の `origin/main` の祖先でない) | 一致(0章の再現) |
| T6a `source.commit` を 154c2086 に直した写し | 祖先=0。`dist/standard` の D(5554596d)の kb と `cmp` で一致(0) | 一致 |
| T6b T6a の判定基準の1行(`priority`)を変えた写し | `cmp` が不一致(1) | 一致 |
| 実物の D(154c2086) | `git diff --quiet 154c2086:src/content/docs D:docs` = 0 | 一致 |
| `source.commit`=59425d2e の D | `git log --grep` が0件(D なし)→手引きは「未確認」と書く | 一致 |
| T7 配る側の検査 | **実施せず**。8章により本束は 5.3 を入れない | 対象外 |

T2・T3・T5・T6 は期待どおりに落ちた。手引きに書いた手順は、上で流したコマンドと同じ。D の探し方(`git log origin/dist/standard --fixed-strings --grep=S`)は、配布のコミットの題に生成元が入る現行の形に依る(実物で確認)。手引きには、同梱の kb の比較を `git show` で取り出して行うと書いた(作業ツリーは改行変換でバイトが変わりうるため。この点は変換を起こす環境では試していない。「変わりうる」と書くにとどめた)。

確かめられなかったこと: 浅い clone の挙動(T7 に含まれるため)。手引きには書いていない(前提として履歴ごとの clone を求めただけ)。

## 検査の結果

- `npm run evidence:write` 成功(287 件、期限到来 0)。`lint:evidence`・`lint:tone`・`lint:scope`・`lint:provisions`・`lint:dekimasu`・`lint:ci`・`lint:registry`: 通過
- `npm run lint:refs`: 通過
- textlint(変更した4ファイル): 違反 0
- `lint:impl`: IMPL-1001・1002 の「降りていない規定」が出るが、本件の前からあるもの(本件で実装マークは足していない)
- `lint:citations`・`lint:sources`: 本作業ツリーで `yaml` の読み込みの例外(node_modules が親ディレクトリのものを参照し、`YAMLParseError`)で起動できなかった。本件の変更とは無関係の環境の問題。ADR-0157 が引く FND-0100・SRC-0459 は、decision.md の引用をそのまま写したもので、台帳での実在は本担当では確かめていない。独立の突合で確かめること
- 回帰の全量・`npm run build` は流していない(指示どおり)

## 開示した食い違い(0章)

ADR-0157 のコンテキスト・決定3・影響と、手引きの「既知の食い違い」の段落で開示した。手引きの条件1 は、今のテンプレートの同梱 kb を落とす。これは意図した開示である。

## Issue #332 のコメント用の文(template に及ぶ分。本束では template を触らない)

> #332 の B11 の実装の報告。標準の側は、手引き(community/standard-editions.md の「受け取り側が生成元を確かめる手順」)、compute-strategy の中立化と1名の体制の1段落、ADR-0157 を入れた。template に及ぶ分は次の4点で、本束では触っていない。
> 1. 【重大度: 高】準拠テンプレートの main(b780a76)が同梱する知識ベースの `source.commit`(59425d2e21db…)は、標準のどのブランチからも到達できない。中身は `dist/standard`(154c2086)と `source.commit` の行を除いてバイト一致する。template を触る束(B8)で、最後の rebase の後に `npm run template:kb` を流し直す。標準の側の機械の検査(`source.commit` が標準の `HEAD` の祖先であること。`check-gate-criteria.mjs`、既定の対象の知識ベースの検査)は、再生成と同時に入れる。それまで ADR-0157 の決定3 は未達として開示している
> 2. テンプレートの README の版の節(L452)に、手引きへのリンクを1行足すか(任意。手引きであり規範ではない)
> 3. 1.10.2 の「配布物のコミットの識別」と、テンプレートの表示「標準のコミット」(`source.commit`)の語の食い違い。本件では直さず、先送り
> 4. テンプレートの契約検査には、受け取り側の確認(来歴・中身)を入れない。ADR-0157 の決定1・3 で採らないと決めた
