# #473 push の前の回帰の全量(本体 f3b3ea7f・template 0f4acc8)

- 日付: 2026-11-28。直さない・push しない。判定は **push 不可**(本物の失敗 2 件)

## 環境

- WSL ubuntu-24.04・node v26.13.1・写し `~/p473reg/`(WSL 側 `/home/kokor/p473reg`)。本体は `repo0`(bundle から autocrlf=false で clone、f3b3ea7f)、template は bundle から clone して 0f4acc8(`git ls-tree HEAD template` と一致)。`npm ci` 成功。pit-crew・zenn は未初期化
- 3 つの複製(`repon` 通常・`repou` TZ=UTC・`repog` GIT_CONFIG_GLOBAL/SYSTEM=/dev/null)で、`npm run check` の連結 32 検査を **止めずに 1 検査ずつ**全部流した(各 32 回。ログは `steps-n|u|g/<検査名>.log`、要約は `summary.txt`)。最初に `npm run check` 通しも流したが、`lint:dekimasu` で止まった
- CI(ci.yml)は `npm run check` のあとに changed-scenes.mjs(要約の出力のみ・合否に使わない)と成果物の保存だけ。`build` は check の最後に含まれる。追加で流すものは無い

## 結果

| 通り | 結果 |
| --- | --- |
| 通常 | 32 中 3 件が rc=1 |
| TZ=UTC | 同じ 3 件 |
| 名義なし | 同じ 3 件 |

失敗した検査は 3 通りで同じ: `lint:dekimasu`・`test:criteria`・`test:template-suite`。`test:regress`・`test:template`・`test:fields`・`build` を含む残り 29 件は 3 通りとも通った。

## 失敗の切り分け

1. **`lint:dekimasu`(1 件)— (c) 本物の失敗(新しい文の登録漏れ)**
   - `src/content/docs/phase4-process-design/tailoring-guide.md:814`(表「本人の確認も抜き取りも無い行」の行)の「今「本」「記+本」の行を取り込む行にすると、人が中身を読まない変更ができる」が `src/data/dekimasu-registry.yaml` に無い。f9bc2603(#473 段 B 前半)で入った文
   - 環境の差でも過去の fixture でもない。決定的に落ちる
   - 直しの案(どちらか): (A) 文を許容・結果の形へ書き換える(例「…人が中身を読まない変更が通る」)。(B) 登録簿へ `K-077`(page: phase4-process-design/tailoring-guide、class: capability、basis: human、text は検査の出力の文字列どおり)を足す。この文は能力・可能性の記述なので capability が妥当。区分の当否は人が読んで確かめる(第1章 1.7.4)。登録後は `test:dekimasu` も流し直す
2. **`test:criteria`(1 件)— (c) 本物の失敗(手順の漏れ)。作業ツリーでは見えず、clean な clone と CI でだけ落ちる**
   - 出力: 「生成元の版 0eb117576a08… のコミットが、標準のリポジトリにありません」。`template/scripts/vendor/tailoring-kb.json` の `source.commit` が 0eb11757 を指す。0eb11757 は「独立の突合 2 巡目」のコミットの amend 前の版で、いまの履歴では e2b9cbf6 に置き換わっている(作業ツリーには孤立したオブジェクトが残るので、手元では通る)
   - 直し: 本体の最終コミットを確定してから `npm run template:kb` で複製を作り直し、template のコミットと本体の参照を対で進める(push-prep 470 の指摘と同じ順序。複製の `source.commit` は本体の HEAD または直前を指すので、本体を更に進めたら再生成する)。`test:template` は通っているので、commit の値までは見ていない。`test:criteria` だけが値を見る
3. **`test:template-suite`(1 件)— (a) 環境の差(私の並列実行が原因)**
   - 落ちた試験は `scripts/gate/test-ship-evidence-steps.mjs` だけで、通常は「tar: /tmp/pr: Cannot open」、UTC と名義なしは別の場面(IMPL-0522:ng)。3 通りで落ちる場面が違うのは、3 複製を並列に流して共有の `/tmp/pr` を取り合ったため。同じ試験を単独で流すと全通過(rc=0)
   - 実装の欠陥ではない。CI は 1 本ずつなので出ない。ただし、複数の担当が同時に回帰を流すと偽の失敗になる(`/tmp/pr` の固定パスが原因。試験側が一意の作業場所を使えば解ける。今回は直さない)

## (b) 過去の決定を固定した fixture

該当なし。今回の変更の文(限定の足し・G-6 の事後・CLAUDE.md の文・見出しの適用範囲・仕様に無い事項の決め方)に当たる suite・`adoption-trial.mjs`・template の fixture の失敗は 0 件。`test:regress`(回帰の全量 sweep)・`test:template`・`test:fields` は 3 通りとも通った。時計依存の偽の失敗も出ていない(実行は 22:28 JST 以降)。

## 議長が直すべき点

1. `lint:dekimasu`: tailoring-guide.md:814 の文を書き換えるか、登録簿へ K-077 を足す(上記)
2. `test:criteria`: 本体を確定した後に `npm run template:kb`、template のコミットと参照を対で進める
3. 直した後、clean な clone(bundle から)で `npm run check` を **1 本ずつ**(並列にしない)通常と TZ=UTC で流し直す。名義なしは 1 回
