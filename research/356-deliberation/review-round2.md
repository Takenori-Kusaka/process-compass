# #356 部分 A の独立の突合(2巡目・直した差分だけ)

- 日付: 2026-11-17。突合の担当は、実装と1巡目の直しを見ていない別の文脈
- 対象: 本体 `git diff 2016b6a3..81cf4989`、template `git -C template diff 255f6fe..2b08607`
- 照らしたもの: `review-round1.md`(所見)、`fix-round1-ruling.md`(裁定)。`fix-round1.md` の主張は前提にしていない
- 実行で確かめたこと: 一時の git リポジトリ(Windows の node 26.13)で、浅い clone・深い clone・actions/checkout の手順の模擬(fetch-depth 0 と 1)に `seeded-error-scan.mjs` を流した。集約の `readSeededScan` を import して、浅い clone の記録を読ませた。template の試験は LF で取り出した版(`git -c core.autocrlf=false archive 2b08607`)で流した

## 1. 所見

| # | 重大度 | 所在 | 根拠 | 直し方の案 | 3巡目が無いための開示の案 |
| --- | --- | --- | --- | --- | --- |
| R2-1 | 中 | template `scripts/gate/seeded-error-scan.mjs` の台帳の照合(`(?<![A-Za-z0-9_-])…(?![A-Za-z0-9_-])`)。R1-5 の直し | 1巡目の部分一致の誤りは失敗する向き(偽の失敗)だった。直しの語の境界は `-` と `_` を語の一部に数えるので、**拾わない向き(流出の向き)へ誤りが移った**。実行で確かめた: 識別子 `SE-1` に対し、`+seeded/SE-1-fix.js`・`+inject_SE-1`・`+SE-1_fix`・`+xSE-1` は旧い照合で拾い、新しい照合で拾わない。識別子を名に含むファイル名や変数名は、注入の残存としてありうる形である。記録は `ledgerFindings` 空・「標識の残存なし」になる。IMPL-0047 の note はこの限界を書いていない(スキルの項目18は「語の境界で見る」とだけ書く)。既定の出荷の経路は台帳を渡さないので(R1-2)、影響は台帳を足した採用者に限る | 境界を英数字だけにする(`(?<![0-9A-Za-z])…(?![0-9A-Za-z])`)。`SE-10` は拾わず、`SE-1-fix`・`inject_SE-1` は拾う。ハンクの見出しは追加の行の絞り込みで既に外れている。試験に `SE-1-fix.js` と `inject_SE-1` の ok(拾う)を足す | 直さない場合は、EV-0284 の対象と IMPL-0047 の note に「識別子の前後に英数字・`-`・`_` が続く形(ファイル名・変数名に含めた識別子など)は拾わない」を足す。誤りの向きが流出の向きであることを書く |
| R2-2 | 低 | template `seeded-error-scan.mjs` の記録の `limits` の文と冒頭の注記(限界・検査の3) | R1-3 の直しは EV-0284・note・スキル・フェーズ5の文書に「squash の既定の文の設定で標識が消える経路」を足した。記録(成果物 `evidence/seeded-error-scan.json`)の `limits` は「GitHub 上で文を書き換えた squash は拾えない」のままで、設定の経路を含まない。冒頭の注記の検査3も、集約が失敗させる条件に `failures` を挙げていない。文書と記録の表示の食い違い | `limits` の文と冒頭の注記に、squash の既定の文の設定の経路と `failures` を足す | 直さない場合は、IMPL-0047 の note に「記録の limits の文は文書の限界の一部だけを書く。限界の正本は EV-0284」と書く |
| R2-3 | 低 | template `scripts/gate/test-seeded-error-scan.mjs`。IMPL-0047 の note(`check=machine test=…test-seeded-error-scan.mjs`) | note は「浅い clone のときは走査を成立させず(scanRun false・failures)集約が失敗させる」と書く。試験には浅い clone の場面が無い。壊して確かめる場面も無い。挙動は本巡の実行で確かめた(3 章)が、回帰で守られていない | 試験に、`git clone --depth 1 file://…` で作った浅い clone の ng(exit 1・scanRun false・failures あり・集約が失敗)を足す | 直さない場合は、note の該当の文に「浅い clone の扱いは試験に無い」を足す |
| R2-4 | 低 | template `scripts/gate/adoption-trial.mjs:1083`。IMPL-0161 の note(`human-ai-boundary.md:718`)。R1-6 の直しと、note を直さなかった理由 | 理由は「note の追記は意味を変える新しい説明になる」。この理由は当たらない。行を消した様式でも止めないことは、試験 T-7「行を持たない旧い様式は止めない」が固定している実際の挙動である。それを note に書くのは開示であり、義務も意味も変えない。さらに、直した表示「(様式に行なし。#356 より前の様式)」は原因を言い切る。現行の様式から行を消した場合にも同じ文が出て、表示が実態と違う | 表示を「(様式に行なし。#356 より前の様式か、行を消した様式)」にする。note に「行を消した様式も止めない(欄の有無の検査は外れる)。記録に様式に行なしと出るのを品質保証部門が読む」を足す。編集の指摘(ed)として扱える | 直さない場合は、上の note の追記だけを足す(表示の文は残す) |

重大度「高」は無い。

## 2. R1-4 の直しと出荷の経路の checkout の深さ(高の疑いは否定)

`.github/workflows/ship-evidence.yml`(2b08607)の2つのジョブはどちらも `actions/checkout@v4` に `fetch-depth: 0` を渡す(evidence ジョブ 97〜99 行、verify ジョブ 367〜370 行)。verify は後で `git fetch origin "pull/$PR/head:pr-head" "$base"` を足すが、深い clone の上なので浅くならない。走査を呼ぶのはこの2か所だけである(`git grep` で確認。gate-g5 は試験 `test-seeded-error-scan.mjs` を流すだけで、試験は一時のリポジトリで動く)。

実行の結果(起点 v1・標識を1件含む v1..v2、`file://` の origin):

| 場面 | 結果 |
| --- | --- |
| `git clone --depth 1`(既定の actions/checkout 相当) | exit 1・scanRun false・failures 1・「浅い clone です」 |
| actions/checkout の fetch-depth 1 の手順を模す(`fetch --no-tags --depth=1 +<sha>:refs/tags/v2`) | exit 1・scanRun false・failures 1 |
| actions/checkout の fetch-depth 0 の手順を模す(`fetch +refs/heads/*… +refs/tags/*…`、深さ指定なし) | 走査が成立する。起点 v1 を `describe` で決め、3件を走査して標識を拾う(exit 1・residual 1) |
| 深い clone・標識の無い範囲(演習をしない採用者) | exit 0・scanRun true・residual 0 |
| 浅い clone を `--unshallow` した後 | 走査が成立する |
| 浅い clone の記録を `readSeededScan` へ | problems 3件(failures あり・scanRun が true でない・residual が値なし)。集約は失敗する |

既定の結線(fetch-depth 0)では走査が成立し、演習をしない採用者は residual 0 で通る。出荷は壊れない。浅い clone は大きな音で落ちる(誤りの向きは安全側)。採用者が checkout の深さを変えたときの失敗の文は「fetch-depth: 0 で取得します」と直し方を示す。

## 3. そのほかの確かめ(問題なし)

- **新しい義務**: スキルの項目18の「足すのは強制層の変更。AI維持管理者の承認を要する」は、既存の規則(`process-change/kinds/intake.md`・`migrate.md` の強制層の変更の扱い)の言い直しで、新しい義務ではない。R1-2 の直しは入力を足していない(裁定どおり)。R1-1・R1-4 の失敗は、採用者の手順を増やさない
- **R1-1**: 台帳がリポジトリの中・読めない・範囲の差分を読めない、のどれでも `scanRun` は false のまま、`failures` に理由、statement は「走査が成立していない」。集約は `failures` を独立の条件として失敗させる。試験の ng(r5・r6、集約の `failures` の場面)は通る。起点・終点を読めない場合は `failures` が空だが、`scanRun` false で集約が落ちるので食い違いは無い
- **R1-2・R1-3**: IMPL-0047 の note・ADR-0139 決定1・スキルの項目18・フェーズ5の文書の4か所で、経路が台帳を渡さないことと squash の設定の経路が揃っている。EV-0284 は「確かめていません」と書き、実証の範囲を越えていない。マークは割っていない
- **R1-8**: `decision-draft.md` の追認の1行は、1巡目の判断(妥当)と一致する
- **ADR-0139 の本文の変更**: ステータスは「採用(2026-11-17)」だが、ADR は本ブランチで追加したもので、まだ push していない(`git branch -r --contains 95660a4e` が空)。公開前の同じ Issue の中の直しとして扱い、所見にしない。push の後は書き換えない
- **試験と検査**: LF の版で `test-seeded-error-scan`(全件通過)・`test-g5-aggregate`(23/23)・`test-env-findings`(23/23)・`test-discouraged-evidence`(8/8)が通る。本体の `lint:impl`・`lint:evidence`・`lint:refs`・`lint:scope` と、変えた3文書の textlint は通る。`npm run check` の全量は流していない(push の前に1回の規則による)

## 4. 巡の扱い

2巡目で閉じる。R2-1〜R2-4 は表の「開示の案」で閉じられる。R2-1 は直し方が決定可能(境界の文字の集合)で試験を足せるので、議長が直すかどうかを裁定する。
