# 実装の担当への共通の指示(Issue #324。束 B5 の議長。2026-11-15)

実装の2人目以降は、この頁と、議長が指示で渡す範囲・鍵だけで始める。審議はやり直さない。

## 1. 読むもの(この順)

1. `CLAUDE.md` の「規定を実行層へ届ける」
2. `research/324-deliberation/decision.md`(裁定。2章と5章)
3. `research/324-deliberation/rulings.md` の 1章(改めた判定表)・3章(型ごとの早見)。2章の裁定例は、型が当たったときに該当の R だけ読む
4. `research/324-deliberation/draft.md` の 3.3(足りないマークの扱い)
5. `research/324-deliberation/pending-worklist.md` の、自分の範囲の頁の表だけ
6. 直前の担当の引き継ぎの記録 `handover-NN.md` の「次の担当への注意」
7. 書式の正本: `src/content/docs/community/implementation-marking.md`、`src/data/impl-targets.yaml`、`src/data/impl-inventory.yaml` の冒頭の注記

`research/324-deliberation/calibration-answers.md` は、較正の区分を記録に書き終えるまで開かない。`rulings.md` の 5章を範囲表示しない。

所在を探すときは、先に `graphify query "<問い>"` を使う(hook が求める)。

## 2. 較正

議長が渡す鍵の節(区分済み)を、登録簿の該当の行を見ずに本文だけから区分し、引き継ぎの記録に書いてから `calibration-answers.md` と比べる。食い違いは記録に書く。手順を踏めなかったときは「無効」と書く。

## 3. 引き継ぎの記録 01 の迷った点への裁定(議長)

| 点 | 裁定 |
| --- | --- |
| `gate-skill` の `gates/G-N.md` を `delivered` の根拠にする読み | 認める。降ろし先の `description` が補助ファイルを明記している |
| 判定表の試し c だけで規定とする扱い | 迷ったら、規定として `state=undelivered` で表示する側へ倒す。誤りが表示を減らす向きに出ることを避ける(`decision.md` 2章 #1 の理由)。c だけで当てた箇所は引き継ぎの記録に挙げる |
| 合う降ろし先が無い規定(許可リストの運用、類似の検知の実施など) | 節は `pending` のまま、`note` に「区分済み・降ろし先未定」と規定の所在を書く。束の終わりに議長が1件ずつ裁定する。予定の降ろし先(`kind: planned`)を自分で足してよいのは、`decision.md` 5章 T1・T2・T4・T8 が名指す型だけ |
| `issue=` | open の Issue だけ。閉じた Issue を名指さない(`gh issue view <番号> --json state` で確かめる)。領域の合うものが無ければ `issue=324` |
| `pending` の節の中に既存のマークがあるとき | 既存のマークの `ids` を挙げて `marked` にできる。マークの有無でなく、規定の文を数えて決める |

## 4. 守ること

- `template/` は読むだけ。書き換えない。条文は変えない(文の誤り・矛盾の候補は記録に挙げる)
- `check=machine` と `plan=adopter` を新しく付けない
- `delivered` の `note` には降ろし先の中の所在(ファイルと、見出し・識別子・関数名)を書く。行番号は書かない
- 採番: 開始のときに `git fetch origin main` を行い、作業ツリー・`origin/main`・`research/` に現れる `IMPL-NNNN` の最大の次から振る
- 台帳は `npm run impl:write` で再生成する。手で編集しない。`npm run lint:impl`・`npm run test:impl`・`npm run lint:refs`・textlint を通す。`npm run check` の全量は流さない。出力は要約の1行だけ読む
- 人が書く欄を埋めない。AI の名義を書かない
- 呼び出しが 120 回に達したら、いまの節を終えて記録を書き、コミットして止める。残りは `pending` のまま次の担当へ渡る
- ファイルは Write/Edit で書く(Git Bash のヒアドキュメントはバックスラッシュが壊れる)

## 5. 残すもの

- `research/324-deliberation/handover-NN.md`(NN は議長が渡す)。書くこと: 較正の結果、区分した節の数(区分ごと)、足したマークの番号と降ろし先、`pending` のまま残した節と理由、降ろし先が登録に無かった規定、文の誤り・矛盾の候補、重へ上げる候補、次の担当への注意
- コミット(自分が変えたファイルだけ。`docs: #324 実装マークの棚卸し <範囲>`、末尾に `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`)。push しない。Issue にコメントしない
- 報告は最後に1回、5行以内
