# #470 push の前の回帰の全量(コミット済みの状態)

- 日付: 2026-11-28。直さない・push しない。判定は **push 不可**(本物の失敗が 2 件)

## 環境

- WSL ubuntu-24.04・node v26.13.1(nvm)・`$HOME/p470reg/repo`(`/tmp` は別の担当と衝突して消えたので使っていない)
- 本体 46f1dac010ef50494f9013c3e2190eeca0f00bde(枝 Takenori-Kusaka/d5 の bundle から `core.autocrlf=false` で clone)。template 2ff1d0ac601f7be1a6781187f835fed675f0b569(`git ls-tree HEAD template` と一致)
- `npm ci`、git の名義は本体・template とも `regress` を設定(名義の差は出さない)。pit-crew・zenn は初期化していない(要らなかった)

## 結果

| 通り | 結果 |
| --- | --- |
| 通常 | 終了コード 1。`test:template` で停止 |
| `TZ=UTC` | 終了コード 1。同じく `test:template` で停止 |

- `lint:ci` から `lint:sources`・`lint:citations`・`test:edition`・`lint:registry`・`test:registry`・`test:engine`・`lint:stage-table`・`test:impl`・`test:plan-issues`・`test:ci-wiring` までは、2 通りとも通った(`test:template` に進んだことが根拠)
- **`lint:sources` はコミット済みの状態で通る**。作業ツリーの research/282-survey-2026-09/ の未コミットの再生成の差分は、コミットしなくてよい
- `test:template` の後は、止まったので 2 通りでは流れていない。そこで写しの中だけで、`node scripts/build-template-kb.mjs` で複製を作り直したうえで、通常の通りだけ `test:template`〜`build` を流した(写しだけの変更。元へは何も触れていない)。`test:template`・`test:fields`・`test:criteria`・`test:template-suite`・`test:regress` は通り、`build` で落ちた。`TZ=UTC` のこの後半は流していない

## 本物の失敗(i)2 件

1. **`test:template`(知識ベースの複製が古い)**
   - 出力: `複製の検査で乖離を検出しました: - 知識ベースが複製元の YAML と一致しません。node scripts/build-template-kb.mjs を実行してください`
   - 作り直した差分(template の `scripts/vendor/tailoring-kb.json`)は 2 点だけ。`source.commit` が 20692c19 から本体の HEAD へ変わることと、適用範囲の表へ「決め事を先に人へ上げる範囲」の行(CL1 以上・規制業・R1、per-change)が増えること。#470 が本体の規則データへ足した行が、template の複製へ届いていない
   - 環境の差(名義・時計・Linux)では出ない。名義あり・なしにも、TZ にも依らず、決定的に出る。CLAUDE.md の運用(規則データを変えたら `npm run template:kb`)の漏れ
2. **`build`(内部リンクの検証)**
   - 出力: `adr/0276-undefined-matters-lean-on-existing-then-world-standards-review-exclusion-by-adopter.md` の 25 行目 `/process-compass/adr/0267-selection-rationale-recorded-for-rejected-alternatives-and-external-constraints/` が `invalid link`(1 件)
   - 実在する ADR-0267 のファイルは `0267-work-choice-rationale-limited-to-rejected-alternatives-and-external-constraints.md`。リンクの slug が違う。Linux・Windows に依らない

## 環境の差(ii)・既存の失敗(iii)

- 環境の差による偽の失敗は 0 件。既存の失敗(origin/main でも落ちる)の比較は行っていない。上の 2 件は、差分の内容(#470 が足した行・#470 が足した ADR-0276 のリンク)から、今回の変更による失敗と判断した

## 議長が直すべき点

1. template で `npm run template:kb` を流し、template の複製の更新をコミットする。本体の `source.commit` は本体のコミットで変わるので、**本体のコミットの後に作り直す**順序に注意(`test:template` が commit の値まで見るかは未確認。見るなら、本体を確定してから複製を作り直し、template と本体の参照を対で進める)
2. ADR-0276 の 25 行目のリンクを、実在する ADR-0267 の slug に直す
3. 直した後、コミット済みの状態で `npm run check` を通常と `TZ=UTC` で全量流し直す(`test:template` の後の `test:regress` と `build` の全量は、2 通りとも未実施)

## 流し直し(本体 d0fc5b59・template 22fc966)

- 環境: WSL・node v26.13.1・`$HOME/p470reg2/repo`(bundle から autocrlf=false で clone、`npm ci`、名義は仮設定)。`git ls-tree HEAD template` は 22fc966 で、写しの template の HEAD と一致
- 流し方: `npm run check` の連結を検査ごとに分け、落ちても止めずに全 32 検査を、通常と `TZ=UTC` の 2 通りで流した(計 64 回)
- 結果: **64 回すべて終了コード 0**。`lint:sources`・`test:template`・`test:fields`・`test:criteria`・`test:template-suite`・`test:regress`・`build` を含む。先の 2 件(知識ベースの複製・ADR-0276 のリンク)は解消した
- 判定: 本物の失敗 0 件。**push してよい**(この写しの検査の範囲で)。確かめていないこと: push の後の CI
