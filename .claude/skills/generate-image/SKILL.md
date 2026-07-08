---
name: generate-image
description: Gemini 画像モデルで図版・イラストを生成しサイトへ掲載する手順と、サイト全体で統一するビジュアル規約。ヒーロー画像・概念図・OGP 画像などが必要なときに使う。
---

# 画像生成ワークフロー

## コマンド

```bash
node scripts/generate-image.mjs -p "プロンプト" -o 出力先.png [-a 16:9] [-s 2K] [-i 参照画像.png] [-m モデル名]
node scripts/list-image-models.mjs   # 利用可能モデルの確認
```

- 既定モデル: `gemini-3-pro-image-preview`(`.env` の `IMAGE_MODEL` か `-m` で変更)
- API キー: `.env` の `GOOGLE_AI_STUDIO_API_KEY`(コミット禁止・Read も deny 済み)
- 新モデルが出たら list-image-models で確認して切り替える

## ビジュアル規約(サイト全体の統一感)

プロンプトに以下の要素を含めて、既存画像とトーンを揃える:

- **スタイル**: モダンでフラットなテックイラスト。透明感のあるガラス質感を許容
- **配色**: 落ち着いた青とスレートグレー基調、アクセントに琥珀色(ヒーロー画像 `src/assets/hero-compass.png` が基準)
- **背景**: ダークテーマでも映えること(暗めの背景か透過を意識)
- **文字**: 画像内に文字を入れない(「文字は一切入れない」と明示する)。ラベルが必要な図は Mermaid を使う

## 使い分けと出力先

| 用途 | 出力先 | 備考 |
| --- | --- | --- |
| サイト掲載(確定版) | `src/assets/` | md からは相対パスで参照(Astro が最適化) |
| 検討用・下書き | `research/assets/` | 命名は `YYYYMMDD-topic.png` |
| 構造・フローの説明 | 生成画像ではなく Mermaid | 正確性が必要な図解は作図で(mermaid-diagram スキル) |

## 後処理(必須)

- 使用したプロンプト・アスペクト比・モデル名を、対応する Issue のコメントか research/ のメモに記録する(再現性の担保)
- 参照した生成画像には alt テキストを必ず付ける
