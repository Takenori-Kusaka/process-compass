# 束 B15 の push 前の準備(2026-11-18)

## 基点と先端

| 対象 | origin/main | 先端(push 前) |
|---|---|---|
| 本体 | cfb39d9b7881d7df88282daf00f07d6d36027a1f | 本ファイルのコミットの直前は 46e980f0d9b71d0bfdf7d033e270a8ce7dcbf9e0。本ファイルのコミットが先端(`git rev-parse HEAD` が正) |
| template | d871f2599eb95bd7fcd0ac9b016e0294a45edfb8 | 690621532859d91680539beaf260ad68173c6875 |

- 本ブランチの origin/main の上のコミット数: 本体 28(本ファイルのコミットを含む)、template 10
- template の退避: `E:/Github/process-compass/tmp/bundles/template-b15-10.bundle`(origin/main..main の10コミット)

## 実施

1. 本体を origin/main へ rebase した。衝突は graphify-out/ だけで、upstream 側を採った。`graphify update .` で再生成した
2. rebase の後、`node scripts/check-gate-criteria.mjs` は「生成元の版が標準の HEAD の祖先ではない」で落ちた(予期どおり)。`npm run template:kb` で `template/scripts/vendor/tailoring-kb.json` を再生成した。差分は `source.commit` の1行だけ
3. template でコミットして bundle へ退避し、本体で template の参照を進めた。`check-gate-criteria`(8ゲート/45件 一致)と `npm run test:template`(複製の検査 一致)は通った

## 番号の確認(付け直しなし)

- EV: origin/main の最大は EV-0321、本ブランチの新設は EV-0322〜0325 で重ならない
- IMPL: origin/main の最大は IMPL-1021、本ブランチの新設は IMPL-1022〜1025 で重ならない
- ADR: origin/main の最大は ADR-0178、本ブランチの新設は ADR-0179・0184 で重ならない
- SRC: 本ブランチの新設はない(research/sources に差分なし)
- `evidence:write`・`impl:write`・`scope:write` を流した。台帳に差分は出なかった

## 流した検査(すべて exit 0)

lint:refs・lint:impl(降りていない IMPL-1024・1025 は scheduled として表示される。意図どおり)・test:impl(56件)・lint:evidence(307件)・lint:scope・lint:sources。全量の `npm run check` は本ファイルの範囲では流していない。
