# 束 B16 の実装の担当への共通の指示

作業ディレクトリ: `E:\Github\orca\workspace\process-compass\b16`(process-compass)。`template/` は準拠テンプレートの submodule で、ブランチ `b16` に居る。最初に `CLAUDE.md` を読む。

## 読むもの

- `research/b16-deliberation/ruling.md`(議長の裁定。優先する)
- `research/b16-deliberation/inventory.md` の担当する単位の行(A・B・C 表)
- `research/445-450-deliberation/decision.tsv` と `marks.tsv` の該当 IMPL の行(降ろし先・理由・マークの note の全文)
- 該当 IMPL のマークが付く標準の条文(`src/content/docs/` を `IMPL-NNNN` で grep)。条文の段落だけ読む。全文を読まない

## 書き方の方針(所有者 2026-11-16)

- 様式の欄は「何を書くか」まで。手引きは「どう満たすか」の例まで。手順の細目・新しい定義を増やさない
- **条文と逆の指示を書かない**。条文の語(ゲート・判定記録・例外承認・責任者 等)をそのまま使う。条文に無い義務を足さない
- 新しい必須欄を足さない(`src/data/template-fields.yaml` は変えない)。欄を足すなら任意の欄
- 既存の文と重複するなら足さず、既存の文を指す。既に満たしているなら「既に降りている」と記録して、マークの state だけ直す
- 責任者・承認者の欄へ AI の名義を書かない。人が書く欄を埋めない
- 触れてよいのは `template/templates/*.md` と template の散文の手引き(`.claude/skills/**/*.md`、`CLAUDE.md`、`README.md`、`docs/`)だけ。`tailoring-kb.json`・`scripts/`・`.github/`・`process.config.json` は触れない
- 様式・手引きの文は日本語。箇条書きは「である調/体言止め」、本文は「ですます調」

## 標準の側でやること

- 降ろした IMPL のマークを `state=delivered` にする。target が実在の降ろし先と違えば直す(降ろし先は `src/data/impl-targets.yaml` に登録済みのものだけ。無ければ登録する)。`plan=`・`issue=` は delivered の書式(`community/implementation-marking.md`)に合わせる
- 降ろさなかった件は理由を記録に書き、マークはそのまま
- `npm run impl:write` で台帳を再生成する

## 検査(全量の回帰は流さない)

- `npm run lint:impl`、`npm run lint:refs`、`npm run test:plan-issues`、様式の必須欄の検査(`package.json` の check の中から template-fields に当たるもの)、`npm run lint:skills`
- template 側: 触ったファイルに関係する試験だけ(`template/scripts/gate/test-*.mjs` のうち、触った様式・手引きのファイル名や文言を読むもの。grep で探す)。`claude-md-resident` の試験は CLAUDE.md を触る単位だけ
- 出力は要約の1行だけを読む

## コミット

1. template: `git -C template add -A && git -C template commit`(メッセージ「docs(B16 Ux): …」。閉じない Issue の番号を close・fix・resolve の語と並べない)。末尾に `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
2. bundle の退避: `git -C template bundle create E:/Github/process-compass/tmp/bundles/template-b16-Ux.bundle origin/main..b16`
3. process-compass: マーク・台帳・submodule の参照・`research/b16-deliberation/Ux-implementation.md` をコミット。push しない

## 記録 `research/b16-deliberation/Ux-implementation.md`

件ごとに1行: IMPL または C-n / 降ろし先のファイル / 何を書いたか(または既に降りていた・降ろさなかった理由)/ マークの変化。最後に検査の結果と、突合で見てほしい点。
