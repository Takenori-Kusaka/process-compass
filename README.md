# Process Compass 🧭

[![Deploy to GitHub Pages](https://github.com/Takenori-Kusaka/process-compass/actions/workflows/deploy.yml/badge.svg)](https://github.com/Takenori-Kusaka/process-compass/actions/workflows/deploy.yml)
[![Docs License: CC BY 4.0](https://img.shields.io/badge/docs-CC%20BY%204.0-lightgrey.svg)](./LICENSE-docs)
[![Code License: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](./LICENSE)

生成AI時代の開発プロセスを体系化し、チーム体制・期待品質・事業フェーズに合わせて最適な開発プロセスを提案する「羅針盤」を目指すプロジェクトです。

📖 **サイト**: https://takenori-kusaka.github.io/process-compass/

## このプロジェクトについて

AIDLC(AI-Driven Development Life Cycle)は「AIが自律的に開発し、人は意思決定だけを行う」と語られがちですが、企業での開発には組織的な責任・品質保証の現実があり、単純な導入は困難です。

本プロジェクトでは:

1. 既存の開発プロセス(ウォーターフォール、アジャイル/スクラム、TDD、DDD、イベント駆動、仕様駆動 など)を、ロール・決裁ゲート・成果物・レビュープロセスまで踏み込んで体系化し
2. AIDLC・生成AI前提の理想プロセスと突合して
3. **組織で実際に運用できる**開発プロセスと、その実装・運用方法を策定

最終的には、アサイン可能なメンバー・稼働時間・体制・期待品質・事業フェーズを入力すると最適な開発プロセスを提案する**インタラクティブなプロセス支援ツール**として確立することがゴールです。

詳細は [プロジェクトの目的とゴール](https://takenori-kusaka.github.io/process-compass/vision/01-goal/) を参照してください。

## ピットイン方式

本プロジェクトが策定した開発プロセスの通称です。正式名称は「AI協調型ソフトウェア開発プロセス標準」といいます。

> マシンは人間より速い。それでも、決められた場所では必ず人間が触る。

F1 のピット作業は、18〜20名が2秒以下で終わります。レースそのものは止まりません。決められた場所でだけ人の手が入ります。AI が実装を主導する開発でも、この形は変わりません。

- 標準の本文: [第1章 総則](https://takenori-kusaka.github.io/process-compass/phase4-process-design/overview/)
- 命名の記録: [ADR-0027](https://takenori-kusaka.github.io/process-compass/adr/0027-process-name-pit-in/)

### 試してみる

[**pit-in-template**](https://github.com/Takenori-Kusaka/pit-in-template) から新しいリポジトリを作り、Claude Code で `/process-init` を実行してください。5つの質問に答えると、あなたのチーム規模・事業ステージに合ったゲート構成・成果物・ブランチ保護が揃います。

このリポジトリからは `template/` としてサブモジュール参照しています。

```bash
git submodule update --init --recursive
```

使い方は [準拠テンプレートリポジトリ](https://takenori-kusaka.github.io/process-compass/phase5-implementation/template-repository/) を参照してください。

### 要点だけ読む

Zenn に本を公開しています。第1章だけで要点が伝わる構成です。

**AIが実装する時代の開発プロセス — ピットイン方式**

「AIDLC は理想論」と感じている人、パラダイムシフトで何が変わるのかもやもやしている人へ向けて、要点を10章にまとめました。原稿は [zenn-content](https://github.com/Takenori-Kusaka/zenn-content) にあり、このリポジトリからは `zenn/` としてサブモジュール参照しています。

## フィードバック歓迎

意見・アイデア・フィードバックを広く募集しています。[Issues](https://github.com/Takenori-Kusaka/process-compass/issues) からお気軽にどうぞ。

## 開発

```bash
npm install
npm run dev      # ローカルプレビュー (http://localhost:4321/process-compass)
npm run build    # 本番ビルド
npm run check    # textlint(日本語校正) + ビルド検証
```

- サイト基盤: [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/)
- 公開ドキュメント: `src/content/docs/`
- 調査メモ(非公開扱いの作業領域): `research/`
- `main` への push で GitHub Actions が自動デプロイ

## コントリビュート

貢献方法は [CONTRIBUTING.md](./CONTRIBUTING.md) を、参加時の約束事は [行動規範](./CODE_OF_CONDUCT.md) を参照してください。

## English

**Process Compass** is a docs-as-code project that systematizes software development processes for the generative AI era.
It analyzes the gap between traditional processes (Waterfall / Agile / Scrum / TDD / DDD) and AI-driven development (AIDLC).
The goal is an interactive tool that recommends the optimal development process based on your team structure and business phase.
The documentation is currently written in Japanese. An English version may follow based on community interest.
Feedback is welcome in [Issues](https://github.com/Takenori-Kusaka/process-compass/issues) in either language.

## ライセンス

- **ドキュメント** (`src/content/docs/` 以下の文章・図): [CC-BY-4.0](./LICENSE-docs)
- **コード** (サイト実装・ツール類): [MIT](./LICENSE)
