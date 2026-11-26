# #455 実装の記録(束 D1、2026-11-27)

裁定: `decision.md`(土台は `decision-draft.md`)。push していない。

## 1. IMPL-E の実行の確認(裁定 §6 の1)

- node 26.13.0 / npm 11.20.0。一時ディレクトリで、乱数の名前 `zz-nonexistent-pkg-<乱数>` を使った。外部への書き込みは無く、レジストリへは読み取りの照会だけ
- A: package.json にだけ足して `npm ci` → 404、終了コード 1
- B: package-lock.json に存在しない名前の解決元 URL を書いて `npm ci` → 404、終了コード 1
- C: 名前を足して `npm install` → 404、終了コード 1
- 結線: `adapter.mjs run install` は終了コードを伝え、`setup-stack` の依存の取得に `continue-on-error` は無く、`gate-g5` の集約は `failure` と success でない結果を落とす。`test-unregistered-name.mjs`(代役の npm)で固定した
- 結果: 落ちた。実装を続行した。ADR-0261 決定1 に書いた
- 確かめていない範囲: node の runtimeVersion 22 そのもの(手元は 26)、python・go

## 2. 実装した内容

template(コミット 2 本。bundle: `tmp/d1-template.bundle`)

- `scripts/gate/dependency-parse.mjs`(純関数)・`dependency-collect.mjs`(git のみ)・`dependency-provenance.mjs`(ネットワーク。照会と `npm audit signatures`)・`dependency-diff.mjs`(一覧の組み立て。`buildReport` を export)
- 試験 `test-dependency-diff.mjs`(32 件。ネットワークを使わず応答を差し替え)、`test-unregistered-name.mjs`(11 件)。どちらも `gate-g5.yml` の gate-contract に結線
- `gate-g5.yml`: dependency-diff ジョブに setup-stack・来歴の照会と検証の段を足した(すべて `continue-on-error`。合否に使わない)。基準9 のジョブは置かない
- `G-6.md` 手順3(2観点・照会せずの扱い・悪意の不在を確かめない)、README の手引き(cooldown・ignore-scripts は課さず手引き。MAL- は保証しない)
- `scripts/vendor/tailoring-kb.json` は `npm run template:kb` で更新

本体

- `gate-criteria.md`: G-5 基準8 の行(F-3 の文言、状態行、欄、限定は同じ行の中)、基準8 の節(日数の閾値を定めない、状態行・省略、検証の種類)、G-6 基準5 の行(印の対象)、IMPL・EV マーク
- ADR-0261 新設、ADR-0044 のステータスに1文。`impl-inventory.yaml`・`impl-untraced.yaml` に登録(降ろし先 `impl-targets.yaml` は既存のものだけで足りた)
- 台帳(evidence・implementation)・`integrated.yaml` を再生成

## 3. 番号(仮。push の直前に付け直す)

- IMPL: 仮に 1037(来歴の欄)・1038(検証の欄)・1039(python・go、undelivered、plan=adopter)・1040(G-6 基準5)・1041(未登録の名前)。IMPL-0550 は note を更新。origin/main の最大は IMPL-1036
- EV: 仮に 0351(脅威の根拠)・0352(cooldown)・0353(検証の失敗を合否にしない)・0354(意図した部品かの確認)。origin/main の最大は EV-0350
- ADR-0261(origin/main の最大は 0250)
- 付け直しの所在: gate-criteria.md のマーク、ADR-0261、ADR-0044 のステータス、`impl-inventory.yaml`、template の `gate-g5.yml` の注釈と試験の `IMPL-10xx:ng/ok`、台帳(再生成)

## 4. 裁定からの差分・実施しなかったこと

- R-7: 5.8.5 の既存の型(IMPL-0204。check-pr.mjs)は、確認の記載の存在も中身も機械で確かめていない(一覧を出して G-6 の必須の確認事項にするだけ)。そろえて manual、EV-0354 で開示した。新しい検査は作っていない
- R-9: 保持は第4章の既存の節「判定が指す記録の保管」を引いた(CI の成果物の既定の保持は保管でない)。条文は新設していない
- アダプタの `integrity` コマンドは足していない。検証は `dependency-provenance.mjs --verify` が node のときだけ `npm audit signatures` を直接呼ぶ(アダプタの契約を広げないため)
- `ci.dependencyRegistries`(照会先の設定)は足していない。私設・ミラーは解決元のホストで「対象外」と判定する(案 §5.1 からの縮小。新しい設定の構文検査を作らない)
- 実レジストリへの照会(packument の読み取り)の実機の確認は未実施。値の読み取り(`_npmUser`・`dist.attestations`・`time`)は公開されている形式に基づき、応答を差し替えた試験でだけ確かめた。実レジストリで確かめると、EV-0351 の根拠が補える
- `npm audit signatures` の出力の解析(失敗の名前の取り出し)は、実出力で確かめていない
- 全量の回帰は流していない(push の前に1回要る)

## 5. 環境の注意

- Windows の作業ツリーでは `gate-g5.yml` が CRLF になり、`test-g5-aggregate.mjs` が 6 件落ちる。改行を LF にした複製では 61 件通る。今回の変更に依らない(LF の複製で確認)
- この worktree は `node_modules` が無かったため `npm ci --ignore-scripts` を実行した
- 流した検査: 本体の `lint:impl`・`lint:evidence`・`lint:scope`・`lint:refs`・`lint:tone`・`lint:provisions`・`test:criteria`・`test:fields`・`test:ci-wiring`・`test:template`、textlint(変更した3ファイル)、template の `test-dependency-diff`・`test-unregistered-name`・`test-context-refs`
