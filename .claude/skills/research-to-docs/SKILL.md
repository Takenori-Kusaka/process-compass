---
name: research-to-docs
description: research/ の一次調査メモを src/content/docs/ の公開ページへ清書するワークフロー。調査 Issue の仕上げ(公開)フェーズで使う。
---

# 調査メモ → 公開ドキュメント清書ワークフロー

## 前提

- 対象の Issue(受け入れ条件)を確認してから始める。Issue にない清書はしない
- 一次メモは `research/phase1/` 等に `YYYYMMDD-topic.md` 形式で存在している前提

## 手順

1. **構成設計**: メモから公開ページの見出し構成を決める。まず図(mermaid-diagram スキル参照)を設計し、本文は図の補足として書く
2. **配置**: `src/content/docs/<該当フェーズディレクトリ>/` に作成する。ファイル名は英語ケバブケース
3. **frontmatter**(必須):
   ```yaml
   ---
   title: ページタイトル
   description: 1文の説明(検索・OGP に使われる)
   sidebar:
     order: <番号>  # ディレクトリ内の表示順
   ---
   ```
4. **執筆規約**:
   - 本文は「ですます調」、箇条書き・表は「である調 / 体言止め」
   - 内部リンクは base パス付き: `/process-compass/vision/01-goal/`
   - 出典は「参考文献」節に URL 付きで残す(調査メモから引き継ぐ)
5. **検証**: `npm run check`(textlint + ビルド)を通す。落ちたら ja-proofread スキルで修正する
6. **後処理**:
   - research/ 側のメモ冒頭に「清書済み → <公開ページパス>」と追記する(メモは削除しない。一次情報として保持)
   - Issue の受け入れ条件をチェックし、Epic 本文の該当項目にもチェックを入れる
   - push(main 直 push 可)後、デプロイ成功を確認する
