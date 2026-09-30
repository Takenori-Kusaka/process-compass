# research/ — 調査メモ置き場

このディレクトリは、サイトに公開する前の一次調査メモ・下書き・素材を置く作業領域です。
`src/content/docs/` 以下(公開ドキュメント)とは区別して管理します。

## 運用ルール(実運用で確定済み)

1. ディープリサーチの結果、参考文献リスト、検討メモはまずここに置く。ファイル名は **`NNN-topic.md`(NNN = 対応 Issue 番号)**。2026-07 のフェーズ1・2の初期メモは `YYYYMMDD-topic.md` 形式で、そのまま残している
2. メモ冒頭に対応 Issue 番号と**調査日**を書く(Issue にない調査はしない)
3. 事実には「(発表日 YYYY-MM-DD, 出典)」または「(取得日 YYYY-MM-DD, 出典)」を付ける。エージェント型開発の記述は2〜3か月で古くなるため、日付のない事実記述を置かない
4. 標本と測定方法が示されていない数値は採らない(採るなら「流通しているが根拠不明」と明記する)
5. 内容が体系化できたら `src/content/docs/` の該当ディレクトリへ清書して公開する(手順は `.claude/skills/research-to-docs` が正)
6. 清書したらメモ冒頭に「清書済み → <公開ページパス>」を追記する。**メモは削除しない**(一次情報・出典として保持)
7. 清書時は図解ファースト(作図規約: `/process-compass/community/style-guide-diagrams/`)に変換する

実運用例: `20260708-diagram-conventions.md` → `src/content/docs/community/style-guide-diagrams.md`

## 出典台帳(2026-09 開始)

外部文献は `sources/` の台帳(1出典1ファイル `SRC-NNNN.yaml`)で管理します。スキーマ・ID 規則・検証状態の意味は [sources/README.md](./sources/README.md) が正本です。操作は `node scripts/research-ledger.mjs`(ingest / verify / lint / index)。

- 台帳は 2026-09 の事前調査(#282)から始めました。**それ以前のメモが引いた出典は台帳に入っていません**
- 検証状態と旧マーカーの対応: verified =【確認】、partial =【二次】、unreachable / not-found =【未確認】
- 大規模な調査は「調査スナップショット」(`NNN-survey-YYYY-MM/`)にまとめ、知見(`findings.yaml`、FND-NNNN)と生成索引(by-issue / questions / coverage)から出典へ辿れるようにします

## 構成

```
research/
├── README.md                 # このファイル
├── sources/                  # 出典台帳(SRC-NNNN.yaml、catalog.md は生成物)
├── 282-survey-2026-09/       # 大規模改訂に先立つ外部調査(2026-09)。入口は README.md
├── phase1/                   # 現状調査の一次メモ(2026-07、一部 08)
├── phase2/                   # AIDLC・理想形調査の一次メモ(2026-07〜08)
├── phase3-gap-analysis/      # ギャップ分析・調査層の監査(2026-08)
├── phase4-standard/          # 標準の条項ごとの調査と会議体の記録(2026-08)
├── articles/                 # 発信用の下書き
└── *.md                      # フェーズ横断の検討メモ(リポジトリ整備など)
```

## 最新の外部調査を引くとき

2026-09-23 時点の外部動向は [282-survey-2026-09/README.md](./282-survey-2026-09/README.md) から辿ってください。Issue 番号 → `by-issue.md` → 知見 → 出典カードの順に読むと、全文献を読まずに根拠へ届きます。
