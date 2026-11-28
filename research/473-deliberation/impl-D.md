# 段 D 実装記録(出典台帳)

- 日付: 2026-11-28
- 結果: `npm run lint:sources` は「問題なし」(注意は既存のものと、登録した SRC-0985 の `published` 欠け)。`npm run lint:citations` も通った。`npm run sources:index` で索引を再生成した(`catalog.md`・`by-issue.md`・`coverage.md`・`questions.md`・`verification.md`・`views/`)。標準の本文(src/content/docs/)は触っていない

## 1. 更新

| 対象 | 内容 |
| --- | --- |
| SRC-0009 | `version: v2`・`updated: 2026-10-01`・`accessed: 2026-11-28`。主張 c9〜c12(v2 の逐語)を追加。v1 の c1〜c8 は消さず残し、c10 が c2・c3 の SR・SA に対する優位を取り下げると `verification.note` と要約に書いた。c9〜c12 は手動の逐語照合で、機械照合・目隠し抽出は未実施 |
| SRC-0394 | `version: v5`・`updated: 2026-10-27`・`accessed: 2026-11-28`。`verification.note` に、c2(32/33 (97%))は v5 でも同じ文で照合済み(`external.md` 11 行目)、c1・c3 の v5 での再照合は未実施と書いた |
| FND-0087 | `findings.yaml` を直した。水準を E3 から E2 へ下げ、`change: changed`。文を 4 つに分けた: (1) SR2 に対する優位は保たれる、(2) SR・SA に対する優位は取り下げ、(3) 再現率 27.1% は不変(約 73% は算術)、(4) テスト生成・PR 説明文の除去は別の測定。`sources` は SRC-0009#c9・c10・c12 と SRC-0021#c1・c3、SRC-0394#c3。旧版の注記は `note` に残した |

## 2. 新規に登録した出典(下書きの名 → SRC)

段 B の担当は、本文で `[SRC-NNNN]` と書くときにこの表を引く。

| 下書き | SRC | 内容 | 検証 |
| --- | --- | --- | --- |
| 473/draft-06 | SRC-0985 | NeurIPS 2026 ワークショップ Agrawal(別モデル 3 つの組の同時の誤り 17.0%、独立の仮定 3.0% の 5.7 倍、47 リポジトリ 141 件で 19.2%) | partial(abstract のみ) |
| 473/draft-07 | SRC-0986 | Tufano ほか arXiv 2411.11401(29 名、レビュアは LLM が指した箇所に集中する) | partial(abstract のみ。数値の「中央値 50%・72 レビュー」は登録していない) |
| 473/draft-26 | SRC-0987 | WaTech の変更管理の手順書(標準的変更の型) | partial |
| 473/draft-28 | SRC-0988 | Petrović ほか arXiv 2103.07189(Google の変異試験) | partial |
| 473/draft-33 | SRC-0989 | Tian ほか 2016(重複報告で重大度が食い違う 28.9%・36.6%・50.8%。51% は最大値で平均ではない) | partial |
| 473/draft-34 | SRC-0990 | Wunder ほか 2024(CVSS の食い違い。68% は同じ人が 9 か月後に付け直した変化) | partial |
| 473/draft-35 | SRC-0991 | Mathews ほか arXiv 2412.14137(欠陥を固定する試験 4.2%・59.6%・68.1%。標本の分母が表で混在) | partial |
| 473/draft-37 | SRC-0992 | Hill ほか ESEM 2026(OSS 119 リポジトリ・PR 88,052 件) | partial |
| 473/draft-38 | SRC-0993 | NIST SP 500-235(サイクロマティック複雑度の上限 10) | partial |
| 473/draft-39 | SRC-0994 | Chowdhury ほか 2022(コード指標と保守の負荷) | partial(要旨のみ) |
| 472/draft-01 | SRC-0995 | Bacchelli & Bird 2013(abstract) | partial |
| 472/draft-03 | SRC-0996 | 技能形成の試験(15.4%、d=0.738 を主に引く。50% 対 67% は頁の表現と断る) | verified |
| 472/draft-07 | SRC-0997 | Capers Jones 2011 Table 2(検査 85%、非公式のピアレビュー 50% は平均) | verified |

- 473/draft-01 は SRC-0009 の更新(v2)として統合した(新規の番号は付けない)
- SRC-0985〜0997 の 13 件。番号は連続で、再利用していない

### 重複のため新規にしなかったもの

- 472/draft-04(METR)は既存 SRC-0470 と同じ arXiv 2507.09089。SRC-0470 の主張に 19% 増(c1)と 20% 短縮の推定(c2 相当)がある。「事前の予測 24%」「moderate AI experience」の逐語は台帳に無い。本文が引くなら SRC-0470 へ足す
- 472/draft-08(思考の連鎖)は既存 SRC-0769 と同じ arXiv 2505.05410。「often below 20%」の逐語は SRC-0769 にある
- Inozemtseva は既存 SRC-0420

## 3. 未照合で登録しなかったもの

- 473/draft-32(GAO-02-195): 引用が WebFetch の要約モデル経由で、文字単位の照合が済んでいない。ruling が本文に引く一覧に無く、3.11.4 の理由に引く場合だけ要る。引くなら原文で照合してから
- 統計的な抜き取りの規格(ISO 2859、JIS Z 9015 など): 照合していないので登録しない
- 登録した出典の中の未照合の部分: SRC-0986 の数値(中央値 50%、72 レビュー)は abstract 以外を未開封のため登録していない。SRC-0985 は NeurIPS ポスターの abstract のみで、メモが挙げる arXiv:2604.19049 は未開封。SRC-0991 の表の分母の混在、SRC-0994 の本文は未読
- 登録しなかった下書き(本文が引かないため): 473 の draft-02〜05・08〜12・13〜15・16〜25・27・29・30〜32・36・40・41、472 の draft-02・05・06。一覧は各 `sources-draft/README.md`

## 4. 本文の値の直しに使う逐語(段 B が引く)

### 4.1 再現率 27.1%(`AC:496`、`TG:485`、`adoption-guide.md:169`。SRC-0009#c4・c12)

- 逐語(Table 2。v1・v2 とも同じ行): `| CCR | 4.5 | 1.4 | 3.1 | 3.6 | 31.5 | 27.1 | 28.6 |`。列は Finds / TP / FP / FN / Prec. / Rec. / F1。Rec. = 27.1(%)
- 母数: 1 条件あたり N=90(3 回 × 30 成果物。「Table 2 shows results averaged across all 90 reviews per condition (3 runs × 30 artifacts).」)。注入欠陥は 150 件(30 成果物 × 各 5 件。誤りの種類ごとに 1 件)
- 定義: TP の判定は行番号 ±5 行と語の Jaccard 類似度による自動照合(§4.4、閾値 2.0)。再現率はこの照合関数に依存する
- 条件: 単著の preprint、Claude Opus 4.6 の単一モデル(生成器とレビュアが同一)、注入欠陥。CCR 条件(新しいセッションで再レビュー)の値
- 論文に見逃しの割合を書いた文は無い。「約 73%」は 100−27.1 の算術。本文は「再現率 27.1%(CCR、注入欠陥)」と書く
- v2(2026-10-01)で取り下げられたのは SR・SA に対する優位だけ。逐語: `the first version’s advantages over these two baselines came from run 1.` / `CCR ranks first in run 1 only`。残るのは SR2 に対する優位: `CCR (F1 28.6%) outperforms a second review in the same session (SR2, 21.7%) robustly.`(SRC-0009#c9)

### 4.2 適合率「3〜17%」(本文に該当の語は現在無い。引くとき)

- 出典: SWR-Bench(arXiv:2509.01494、2025-09 投稿。v2 は 2026-06-05。下書き 473/draft-08。**未登録**。引くなら SRC を新設する)
- 本文の 1 文(逐語): `the top-performing combination, PR-Review leveraged with Gemini-2.5-Pro, achieved an F1 score of only 19.38%.`(RQ2、表 III・IV)
- 適合率: 最良の構成で 16.65%(再現率 23.18%、F1 19.38%)。5 ツールの平均は 2.79〜15.39%(表の平均行の読み取りで、本文の 1 文には無い)。したがって「2.79〜16.65%」は、下限が表の平均行の最小値、上限が最良の構成の適合率という 2 つの読みをつないだ範囲である。書くときはその旨を併記する
- 定義と母数: GitHub の PR 1,000 件(Python 12 プロジェクト)で、LLM のコードレビューが指摘した項目を測る。CR-Bench(Nutanix、2026-03)の 3.56% は abstract に値が無く**未照合**。Martian のオンライン版(64.9〜76.2%)は、開発者がその後に変えた箇所との一致で測る別の定義で、Greptile の記事経由の二次(一次未確認)。CRBugBench は適合率を報告していない
- 書き方: 「SWR-Bench の適合率 2.79〜16.65%(PR 1,000 件、2025-09。ほかの測定は定義が違うため並べない)」

## 5. 残った点

- SRC-0009・0394 の v2・v5 の主張(c9〜c12 など)は、機械照合(`verify`)と目隠し抽出が未実施。`npm run lint:sources` は書式と参照の検査だけで、逐語の一致は見ない
- SRC-0985 は `published` が無い(NeurIPS のページに日付が無い)。警告のまま
- 登録した partial の出典は、引く側が「abstract のみ」「本文は未読」を断る
