# 束 B20 実装の担当の共通の指示

作業ディレクトリ: `E:/Github/orca/workspace/process-compass/b20`(これ以外を触らない)。

## 進め方

- 裁定は `research/448-deliberation/b20-decision.md` と、そこから指す heavy・light の該当の節に従う。裁定に無い変更をしない。裁定が実物と合わないときは、勝手に決めず `research/448-deliberation/b20-impl-<段>.md` の「裁定と合わない点」へ書いて、影響の無い範囲を進める
- 行番号は変わっている。実装の前に grep で確かめ直す
- `machine` の件は、試験に `IMPL-NNNN:ng` と `IMPL-NNNN:ok` の目印を別の行で置く。**ng の試験が実装の前に実際に落ちることを確かめる**
- 実装マークの書式は `src/content/docs/community/implementation-marking.md`、根拠水準マークは `community/evidence-marking.md`、適用範囲は `community/scope-marking.md` が正本
- 台帳は手で編集しない。`npm run impl:write`・`npm run evidence:write`・`npm run scope:write` で再生成する
- 規則データを変えたら `npm run template:kb`
- 採用済み ADR の本文は書き換えない。新しい ADR で置き換える。各 ADR に採らない案を書く。規格に先例の無い点は「本標準が足す」と書く
- 責任者・承認者の欄へ AI の名義を書かない。人が書く欄を埋めない
- docs の md は textlint を通す(本文はですます調、箇条書きは である調 / 体言止め)

## 番号

ADR は裁定の配分どおり。EV・IMPL は現在の最大の次から仮に振る(push の直前に付け直す)。使った番号を報告のファイルに書く。

## template のコミット

- template は detached ではなくローカルのブランチ `b20` で作業する。`git -C template checkout b20`(無ければ `-b`)
- コミットのたびに bundle を退避する: `git -C template bundle create E:/Github/process-compass/tmp/bundles/template-b20-<段>-<連番>.bundle b20`
- **template を push しない。本体も push しない**
- 本体のコミットは段の区切りごとに行う。`git add template` で submodule の参照も含める
- コミットのメッセージの末尾に次を付ける: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- コミットのメッセージに、閉じない Issue の番号を close・fix・resolve の語と並べて書かない

## 試験

- 途中では関係する試験だけを流す。回帰の全量は流さない
- 出力は要約の行だけを読む

## 報告

`research/448-deliberation/b20-impl-<段>.md` に、実装した内容・試験の結果・使った番号・裁定と合わない点・残った点を書いてコミットする。
