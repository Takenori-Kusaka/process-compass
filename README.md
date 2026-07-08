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
3. **組織で実際に運用できる**統合プロセスと、その実装・運用方法を策定

最終的には、アサイン可能なメンバー・稼働時間・体制・期待品質・事業フェーズを入力すると最適な開発プロセスを提案する**インタラクティブなプロセス支援ツール**として確立することがゴールです。

詳細は [プロジェクトの目的とゴール](https://takenori-kusaka.github.io/process-compass/vision/01-goal/) を参照してください。

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

## ライセンス

- **ドキュメント** (`src/content/docs/` 以下の文章・図): [CC-BY-4.0](./LICENSE-docs)
- **コード** (サイト実装・ツール類): [MIT](./LICENSE)
