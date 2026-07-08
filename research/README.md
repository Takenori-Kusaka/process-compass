# research/ — 調査メモ置き場

このディレクトリは、サイトに公開する前の一次調査メモ・下書き・素材を置く作業領域です。
`src/content/docs/` 以下(公開ドキュメント)とは区別して管理します。

## 運用ルール(実運用で確定済み)

1. ディープリサーチの結果、参考文献リスト、検討メモはまずここに `YYYYMMDD-topic.md` 形式で置く
2. メモ冒頭に対応 Issue 番号を書く(Issue にない調査はしない)
3. 内容が体系化できたら `src/content/docs/` の該当ディレクトリへ清書して公開する(手順は `.claude/skills/research-to-docs` が正)
4. 清書したらメモ冒頭に「清書済み → <公開ページパス>」を追記する。**メモは削除しない**(一次情報・出典として保持)
5. 清書時は図解ファースト(作図規約: `/process-compass/community/style-guide-diagrams/`)に変換する

実運用例: `20260708-diagram-conventions.md` → `src/content/docs/community/style-guide-diagrams.md`

## 構成

```
research/
├── phase1/   # 現状調査の一次メモ
├── phase2/   # AIDLC・理想形調査の一次メモ
├── assets/   # 図の元データ・生成画像の検討版
└── *.md      # フェーズ横断の検討メモ(リポジトリ整備など)
```
