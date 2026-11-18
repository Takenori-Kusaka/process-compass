# 束 B21 単位11・12 の実装の記録

作成 2026-11-18。裁定は `research/b18-deliberation/ruling-a1.md` §2.1・§2.4・§3.9・§4・§5・§7。実装は template のブランチ b21(単位11 = 99340a4、単位12 = b0a4da5。bundle は `tmp/bundles/template-b21-06.bundle`・`-07.bundle`)。

## 全体の state

- 0571・0210・0215・0213・0219・0216: **`state=undelivered` のまま**(`check=manual plan=scheduled`)。新しい試験 `test-pre-review.mjs` を `gate-g5.yml` へ結線できない(B20 の領域)ため、`check=machine` の要件3 を満たせない(§7)。note の先頭に「実装済み・結線待ち」と事実を書いた
- 0218: **`state=delivered check=manual`**(試験を持たない。手引きの所在と確かめる者を note に書いた)
- 降ろし先 `pre-review-automation` は `planned` から `template-file`(path = `scripts/gate/pre-review.mjs`)へ改めた(§2.7)

## 作ったもの

- `.github/ISSUE_TEMPLATE/pre-review.yml`(欄: 種別・工程ゲート・リスク区分・判定予定日 T・起案者・指名レビュア・判定資料の所在。意見の雛形と応答の宣言行の案内)。**指名レビュア**の欄は裁定の欄の一覧に無いが、0213・0219 の宛先に要るため足した
- `.github/workflows/pre-review.yml`(日次の notify と月次の metrics。`schedule` と `workflow_dispatch` のみ。`permissions` は contents: read・issues: write。`${{ }}` は env 経由。ジョブ名に gate-g5 を使わない。dry-run を既定)
- `scripts/gate/pre-review.mjs`(純関数 `planNotify`・`metricsFor`・`readProposal` と、差し替え可能な GitHub 入出力 `fetchIssues`・`applyActions`)
- `scripts/gate/test-pre-review.mjs`(50 件。時計を読まない。子プロセスで TZ=UTC と TZ=Asia/Tokyo の同一を確認)
- `scripts/gate/preflight.mjs` の `TEMPLATE_WORKFLOWS` へ `pre-review.yml`
- `.claude/skills/gate/reference/sync-escalation.md`(0218 の手引き)と、`.claude/skills/gate/SKILL.md` の「参照」へ2行(手引きの所在と、0682 の差し戻しの一文 = 単位9 の残作業。B20 の一覧に無いファイルのため置いた)

## 項目ごと

| IMPL | 作ったもの | 試験(結果) | state | 採らなかった点 |
| --- | --- | --- | --- | --- |
| 0571 | `targetOf`。B-1〜B-4 と工程ゲートを対象、標準変更・読めない種別は対象外。工程ゲートは起票と通知だけ(判定当日の手順を持たない) | `IMPL-0571:ng/ok` 6件 | undelivered | — |
| 0210 | T の5営業日前(R1 は10)に、題名「[草案] 」の判定資料 Issue を起票。3.10.3 の5項目の見出しのみ、中身は「(起案者が記入する)」。同じ資料があれば再起票しない。印を外す(題名)か「判定資料の所在」が書かれるまで公開に数えない | `IMPL-0210:ng/ok` 7件 | undelivered | 項目の中身の生成(人が書く欄を埋めない) |
| 0215 | 意見(`賛否:` の行があるコメント)の欄の空を、注意のコメントで示す。反対のときだけ代替案の空も数える。意見ごとに1回 | `IMPL-0215:ng/ok` 4件 | undelivered | 複数論点の自動検知(意味を読む。毎回の注意に分割の促しの定型文を入れるにとどめた)。意見の除外 |
| 0213 | 締切の2営業日前・前営業日に通知(指名レビュアを記名。応答済みは「(応答済み)」と @ なしで記す)。通知と最初の応答の時刻の一覧を1件のコメントとして更新(内容が同じなら更新しない) | `IMPL-0213:ng/ok` 5件 | undelivered | 一覧を新しいコメントで重ねる |
| 0219 | 通知先を未応答に絞る。前営業日は D-0 節6 の判定する者にも。締切を過ぎ T までの間に未応答があれば、3.9.3 の措置の宛先(節6)へ通知 | `IMPL-0219:ng/ok` 7件(AI・空の賛否は応答に数えない) | undelivered | 代理の指名の自動化・自動の再割り当て |
| 0216 | `metricsFor`/`metricsBody`。上程数・意見0件の上程比率・指名レビュアの応答率・応答の無い意見の比率。応答は起案者の宣言行 `応答: <URL>`。AI のコメントを数えない | `IMPL-0216:ng/ok` 6件 | undelivered | 個人別の値(3.10.11 が個人評価への流用を禁じる)。判定当日に初めて出た論点の比率・公開から判定までの日数(Issue のコメントから決められない) |
| 0218 | 手引き `reference/sync-escalation.md` | —(manual) | delivered | 往復の機械の検知(裁定 §5) |

## 判断した点(裁定の文面との差を含む)

- **0213 と 0219 の通知を1つのコメントにまとめた**。裁定は 0213 を「指名レビュアを記名した通知」、0219 を「0213 の対象を未応答者に絞る」とし、標準 3.10.11 の表は「未応答のレビュアへ通知」と書く。二重に通知しないため、1コメントに指名レビュア全員を記名し(応答済みは @ なし)、`通知先:` の行だけを未応答に絞った
- **判定資料の項目4 と 項目5**: マークの旧 note は「項目4(求める判断)」だが、標準 3.10.3 の表では求める判断は項目5(項目4 はリスク区分の根拠)。標準に従い、5項目すべてを起案者の記入とし、note を「項目5 の求める判断を含む」に改めた
- **措置の通知は R1 に限らない**。裁定の「締切で未応答が残れば」と 3.10.11 の表に従い、R2・R3 にも出す。コメントの文は R1 だけ「判定へ進めません」とし、他は「不応答は記録します」(3.10.5)にとどめる。R3 は沈黙を異議なしとみなす区分のため、過剰と読まれうる。突合で見てほしい
- **応答の数え方**: 指名レビュアの「応答」は、賛否の欄が書かれたコメントだけ。自由な文だけのコメントは応答に数えず、通知が続く。決定可能な条件に絞ったための選択
- 営業日: 締切の2営業日前の通知は、前営業日以後には遅れて出さない。期間は `[notice2, notice1)`・`[notice1, 締切日]`・`(締切日, T]`
- AI の判定は `aiAccountCheck`(bot・AI を示す語)と `dedicatedSeatOf`(専用と申告した担い手の識別子)の併用。コメントの投稿者の識別子を読む
- 台帳 `impl-untraced.yaml` に workflow と試験の2行を足した。**結線の後は試験の行を外してよい**

## 試験の結果(Windows、node 26)

`test-pre-review.mjs` 50件、`test-review-queue.mjs` 39件、`test-flow-observation.mjs` 15件、`test-adoption.mjs` 69件、`test-push-trigger.mjs` 27件、`test-gate-node.mjs` 27件、`test-context-refs.mjs` すべて期待と一致。本体: `npm run impl:write`・`lint:impl`・`impl:issues`・`test:fields` が通る。全量の `npm run check` は流していない。

## 結線で足す行(B20 の push の後)

- `.github/workflows/gate-g5.yml` の gate-contract のジョブへ(`|| true`・`if:`・`continue-on-error` を付けない): `      - run: node scripts/gate/test-pre-review.mjs`
- 結線の後、0571・0210・0215・0213・0219・0216 を `state=delivered check=machine test=template/scripts/gate/test-pre-review.mjs` へ改め、`plan`・`issue`・`review` を外す。試験に `IMPL-NNNN:ng`・`:ok` の別の行がある(0213・0219 は一部の行が両方に当たる)。実物の GitHub で未確認のため、ADR-0126 決定5 のとおり「実機で確かめるまで scheduled」とするかを結線の担当が裁定する
- `impl-untraced.yaml` の `scripts/gate/test-pre-review.mjs` の行を外す
- CHANGELOG・移行の注意: 新しい workflow は既定で `schedule` により有効になる(Issue が無ければ何もしない)。採用者は不要なら削除する。ラベル `pre-review`・`pre-review-material` は API が作る(色・説明は付かない)。リポジトリの変数 `PRE_REVIEW_METRICS_ISSUE` を置くと月次の集計が書かれる(無ければ出力だけ)

## 実物で確かめていない点

- GitHub 上での workflow の実行(`gh api` の応答の形、`--paginate` の連結、`issues: write` での起票・コメントの更新、ラベルの自動作成)。応答は固定の入力で確かめただけ
- Issue の様式で起票した本文の見出し(`### ラベル`)の読み。GitHub の実物の本文で確かめていない(人が本文を編集した後の形も)
- 判定資料の Issue の題名の印を外す操作を、起案者がするかどうか(運用)
- 通知は開いた上程だけ、閉じた上程は月次の集計だけが読む。`--paginate` で全件を読むため、上程が多いとコメントの取得の呼び出しが増える
