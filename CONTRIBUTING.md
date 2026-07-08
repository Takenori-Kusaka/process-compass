# コントリビューションガイド

Process Compass への関心をありがとうございます。このプロジェクトは、多くの人からの意見・アイデア・フィードバックで育つことを前提に運営されています。どんな小さな貢献も歓迎です。

## 貢献の方法

| やりたいこと | 窓口 |
| --- | --- |
| 意見・質問・アイデア | [Issues](https://github.com/Takenori-Kusaka/process-compass/issues)(テンプレートあり)または [Discussions](https://github.com/Takenori-Kusaka/process-compass/discussions) |
| 誤字修正・内容改善 | Pull Request(各ページ右上の「ページを編集」からも可) |
| 新しいプロセス・観点の提案 | Issue テンプレート「コンテンツ提案」 |

## 開発環境

```bash
npm install
npm run dev      # ローカルプレビュー (http://localhost:4321/process-compass)
npm run check    # textlint(日本語校正)+ ビルド検証
```

## Pull Request のルール

1. 対応する Issue を確認・起票してから作業する(Issue 駆動。詳細は [プロジェクト運営](https://takenori-kusaka.github.io/process-compass/community/project-management/))
2. `npm run check` が通ること(PR では CI が同じチェックを実行します)
3. 執筆規約に従うこと:
   - 本文は「ですます調」、箇条書き・表は「である調 / 体言止め」(textlint が検査)
   - 図解ファースト([作図規約](https://takenori-kusaka.github.io/process-compass/community/style-guide-diagrams/))
   - ページには frontmatter の `title` と `description` を必ず書く

## ライセンスへの同意

コントリビュートいただいた内容は、ドキュメント部分は [CC-BY-4.0](./LICENSE-docs)、コード部分は [MIT](./LICENSE) で公開されることに同意いただいたものとみなします。

## 行動規範

参加者は [行動規範](./CODE_OF_CONDUCT.md) の遵守をお願いします。
