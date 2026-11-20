# 回帰の落ち(通常の実行)の原因の調査(束 B28)

## 落ちたもの
- `matrix-sweep.sweep-1`〜`sweep-4` が各48場面(計192場面)落ちた。落ちた観測は全て「契約○ → 契約×」の1点だけ(規則・再生成・未達・下限は期待と一致)
- 落ちた場面は全て**安全重要度 CL3**(段階 poc〜stable × 品質 3 × 開発形態 2 × 人数 3 の CL3 全構成)。CL0〜CL2 は通る
- 契約検査(`verify-gate-contract.mjs` 871 行 → `mutation-stage.mjs` の `thresholdProblems`)の文: 「構成に ci.mutationThreshold(G-5 の段 mutation の閾値。附属書F F.2 の Q1 が「はい」または CL3 の案件では必須)がありません。/process-change(種別 settings)で値を書いてください」

## 再現
- Windows 側で `node scripts/regress/run.mjs --only matrix-sweep.sweep-1` が同じ48場面で落ちる(gh の代役は一時の gh.exe の薄い包みで通した。作業後に消した)
- 本束の前の版では起きない(契約検査に閾値の検査が入ったのは本束の U4a。`git grep mutationThreshold origin/main -- scripts` は0件)

## 原因の分類: (a) 本束の実装の欠陥(ただし直す場所が B29 の保護の対象)
- 裁定(ruling-fix1 M-5・L-5、ADR-0224 決定6)は、CL3 で閾値が未設定なら契約検査が落ちることを意図している。sweep の期待(契約○)がそれに追随していない面は(b)に見えるが、期待を改めるだけでは直らない
- 本当の欠陥: **閾値を書く経路が無い**。設定の手引き(`kinds/settings.md`)と契約検査の文は「`/process-change` 種別 settings で書く」と案内するが、`scripts/init/generate-profile.mjs` は `ci.mutationThreshold` を一切読まず・書かない(`git grep mutationThreshold b28 -- scripts/init scripts/gate/config.mjs` は0件。`ci` の構築は `coverageThreshold`・`failOnSeverity` 等の列挙で、settings の `ci.mutationThreshold` は捨てられる)
- 実行で確かめた: sweep の CL3 で、初期化の直後に `change({kind:'settings', settings:{ci:{mutationThreshold:60}}})` を足しても変更は ok で通るが、契約検査は同じ文で落ち続ける(値が構成に残らない)。`test-init-g5.mjs` は構成の JSON を直接書き換えて閾値を入れているため、この経路の欠落を検出しなかった
- 帰結: CL3 の案件は、初期化の直後から契約検査(CI の check)が落ち、案内された手順でも直せない。採用者が JSON を手で書き換えるしかない(手書きの値は次の再生成で消えうる)。本束の実装の記録(impl-u4a)は「`ci.mutationThreshold` の読みと型の検査を config.mjs に」と書いたが、config.mjs に読みは無く、生成器にも降りていない

## 直さなかった理由と議長へ返す点
- 直すには `generate-profile.mjs`(settings の `ci.mutationThreshold` の検証と構成への保存・再生成での保持)を触る要がある。これは B29 の保護対象のファイルのため、手を付けずに返す
- 選択肢
  1. **生成器に降ろす(推奨)**: settings の `ci.mutationThreshold`(0〜100 の数値)を検証して構成へ保存し、再生成でも保持する。型の検査は `thresholdProblems` を使う。sweep は CL3 の場面の前提として settings の変化点で閾値を置く(採用者の手順と同じ)。期待値(観測)は変わらない。test-init-g5 に「settings 経由で書ける」ことの試験を足す
  2. 初期化で CL3 に既定値を書く: 裁定が「既定のコマンド・値を置かない」「案件の条件の閾値は採用者が既存コードの実測から較正する」(ADR-0224 決定6・EV-0345 の開示)と書いたことに反するため、新しい判断が要る。採らない側を推す
  3. 契約検査の閾値の検査を CL3 から外す: ADR-0224 決定6(案件の条件での必須)を変えるので、ruling-1 の「範囲は変えない」に反する。採らない
- 要判断: 選択肢1 は B29 の生成器への変更を伴うため、B29 との順序(B29 が先に取り込まれてから、または同じ束で)を議長が決める。sweep 側の直しは、生成器が閾値を保持するようになってから足す(今足しても通らないので入れていない)

## 作業物
- 本担当は、リポジトリのファイルを変えていない(sweep への試しの追加は戻した。gh.exe は消した)。コミットはこの記録の1件だけ
