# 審議の入力: Issue #293 と、束ねた元 Issue の要点

- 作成: 2026-10-23。議長(主担当)が、GitHub の Issue 本文と 2026-10-08 の突合(`research/phase4-standard/issue-triage-2026-10-08.md` L850-1020)から写した
- この文書は論点の所在を示す。起票者の提案が正しいという前提を置かない(コアポリシー)
- 作業ツリーは #289〜#292(ADR-0071〜0076)の反映を含む。**#292 で `ci.yml` を、テンプレートのサブモジュールを取得して `npm run check` を走らせる形に改めた**(PR と main への push。`research/292-deliberation/implementation.md` 7.2)

## #293(本 Issue)

リポジトリ運営(CI・配布)の技術タスクを束ねる。いずれも標準の条項ではなく、本リポジトリの運営の問題として起票された。ただし #277・#280・#281 は、それぞれ標準側へ置く文の案を含む。**標準側の文は会議体を経る**(突合のコメントがそう書いている)。

受入条件:
- CI で走る検査の一覧が 1 か所にあり、`ci.yml`・`CLAUDE.md` と一致している
- 配布の経路に検査段があり、submodule 不在は「対象なし」として明示される
- publish-standard に Environments 承認と ref の確認がある
- lychee の残る 4xx が 0 件か、理由つきで無視されている

## #276 CI が実際に落とす検査の一覧を 1 か所に置き、ci.yml と突合する(未対応)

- 10-08 時点: `check` 12 本、`ci.yml` は 2 本(`lint:text`・`build`)。`CLAUDE.md` は 7 本を列挙して「PR では CI が同じチェックを実行」と書き、食い違う。`project-management.md` L57 も古い。`deploy.yml` は push main でビルドだけ
- 「CI を 2 本に留める」と決めた記録は無い(書かれていない側)
- 現在: #292 で `ci.yml` が `npm run check` を走らせる。`check` は 19 本程度に増えている。一覧を 1 か所に置いて突合する検査は無い
- テンプレート側は `verify-gate-contract.mjs` が構成 ⇄ CI ⇄ ブランチ保護を検査(本 Issue の対象外)

## #277 配布物を配る前に検査する(未対応)

- `check-gate-criteria.mjs` の 3 方向目(配布用の知識ベースとの突合)は `if (fs.existsSync(KB))` で、対象が無ければ出力も残さず通る
- `publish-standard.yml` は `npm ci` → `build-template-kb.mjs` → コピー → `git push --force` で、配布物を検査する段が無い
- ADR-0052 決定1「配布物そのものを検査する」と帰結「`npm run check` が配布物の判定基準の件数と生成元の版を検査する」が成立していない
- 前例: `ci-gates.md` L848(カバレッジの「対象なし」として通す条件)、`g5-local.mjs` の `status: 'skip'` と理由、`check-template-drift.mjs` の理由の出力
- 標準側へ置く 1 文の案:「検査の対象が存在しないとき、検査を通過として扱いません」。会議体で、カバレッジの「対象なし」で通す規則と矛盾しないかを確かめる

## #280 手元の検査と CI の境界を書く(一部)

- 論点2「手元の PASS は公式判定ではない」はテンプレート側に降りている(`g5-local.mjs` 冒頭、`template/README.md` L60、`template-repository.md` L702-703)
- 残り 3 点: (1) 段の中を安く落ちる順に並べる規律 (2) 検査基準(テンプレート・検査スクリプトとその読み込み先)が基底で更新されていれば実行前に止める規律(`verify-gate-contract.mjs --base` が比べるのは構成であって検査定義ではない)(3) 論点2 を標準側(`compute-strategy.md`)へ規範として書き、実装マークでテンプレートへ接続する
- 起票の案: 標準は規律だけを書き、`pre-ready` 相当の実装は案件ごと。止める条件を「検査基準が動いたときだけ」に限る根拠はがんばりクエスト 1 件(入れるなら EV マーク)

## #281 配布ブランチへの force push を、起動元ブランチのワークフローのファイルだけで守らない(未対応)

- `publish-standard.yml` は初版から変更が無い。`workflow_dispatch` を受け付け、`environment:` も `github.ref` の確認も無く、`contents: write` で `dist/standard` へ `--force`
- `VERSION.md` の `${GITHUB_SHA}` は起動元のコミット。main 以外から起動すると ADR-0052 決定2(生成元の版の記録)が「正本のどの版か」を示せない
- 標準側: `git-strategy.md` は既定ブランチのルールセットとタスクブランチの `--force-with-lease` まで。配布ブランチ・手動起動の起動元には触れていない。`ci-gates.md`「デプロイゲート」は G-8 を Environments の承認で実装する
- 実行層の 3 点: (1) Environment の Deployment branches を main に限る (2) ジョブ先頭の ref 確認で二重にする (3) ファイルの外で止めている事実と止まらない経路を文書に書く
- 標準側の 1 節(`ci-gates.md` か `risk-catalog.md`)は、根拠が publishing-hub 1 件のため会議体と EV マークが要る
- **Environment の作成・保護規則の設定はリポジトリの設定画面で行う。ワークフローの変更だけでは完結しない**(利用者の操作が要る)

## #260 の残り(週次 lychee の 4xx の棚卸し)

- #299(週次の再起票)の 17 URL は PR #322 で棚卸しした(未マージ)。#260 の 9 URL がその中に含まれるかを確かめる
