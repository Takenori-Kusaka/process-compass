# 束 B28 独立の突合1巡目への直し

直し 2026-11-20。裁定は `ruling-fix1.md`。M-1(番号の付け直し)と L-4 は触っていない。

## 直しの差分の範囲(2巡目の突合が見る範囲)

- template: `7786d16..9c2d401`(コミット 242f38b がコードと試験、9c2d401 が README と settings。bundle は `tmp/bundles/template-b28-08.bundle`)
- 本体: `b277c100..`(この記録を含むコミットまで)

## 所見ごとの直し

| 所見 | 直したファイルと要点 |
| --- | --- |
| H-1 | `scripts/gate/adapter.mjs`: 段 mutation が必須でない(案件の条件にも R1 にも当たらない)とき、コマンドを走らせず注意1行で終了 0。空のときの注意(R1 の PR では空だと失敗)は据え置き。README 第17項・`kinds/settings.md`・ADR-0244 決定1と「課さないと決めたこと」を実装に合わせた |
| H-2 | `scripts/gate/test-g5-aggregate.mjs` 9b: ジョブ mutation・regulatory が `adapter.mjs run <段>` を呼ぶこと、`fetch-depth: 0`、mutation の env 4つ(`PIT_IN_EVENT`・`PIT_IN_DIFF_BASE`・`PIT_IN_PR_BODY`・`PIT_IN_BASE_CONFIG`)と基底の構成の書き出しを値の一致で固定。CRLF の作業ツリーでも読めるよう、読み込み時に改行を LF へ揃える |
| H-3 | `safety-verification.md` IMPL-0931 の note: 「段が無い(2026-11-15)」を経緯へ移し、7.3 の食い違いの文を「その機械は降りていない(U6。ADR-0243)」へ。`impl:write` で台帳を再生成 |
| M-2 | `mutation-stage.mjs` `r1Of`: 経路が分かるのに手動などのとき「この起動の経路(<event>)ではリスク区分を判定しない」。必須の側は据え置き。README 第17項に手動の実行を追記。ADR-0244 決定2にも |
| M-3 | `check-pr.mjs` に `changeListBetween(git, from, to)` を最小の公開として追加(`measureCommitSize` と同じ作り方: numstat -M と name-status)。`mutation-stage.mjs` はこれを呼ぶだけにし、自前の一覧と `KIND` を削除。既存の関数の中身は変えていない |
| M-4 | H-2 の値の一致に含めた。`test-adapter.mjs`: 基底 80・作業ツリー未設定 / 50・score 70 → 失敗、基底の構成なしのときは作業ツリーの 80 を使う組を足した |
| M-5 | `test-init-g5.mjs`: 閾値が文字列、CL3・閾値未設定で契約検査が落ちる組と、閾値 80 で閾値の問題が出ない組を足した |
| M-6 | `test-aggregate-wiring.mjs`(IMPL-0763・0930): 集約を実行し、報告に「段 mutation の閾値」の行が閾値なしで出る・閾値ありで出ない・CL3 で文が変わることを見る |
| L-1・L-2 | `test-adapter.mjs`: 80/80 が通る、79.9/80 が落ちる、行頭に空白・語が付く行が拒否される組 |
| L-3 | `kinds/settings.md`: 「同じ行が複数あるときは最後の1行を読む」。機械は変えていない |
| L-5 | `mutationThresholdNote(config, d0Text)`: 案件の条件に当たる構成で閾値が無いとき「閾値が未設定のため、段と契約検査が失敗にします」の文。`aggregate-evidence.mjs` は D-0 の本文を渡す |
| L-6 | `safety-verification.md` F.6: 「閾値を定めた場合は数値であること」 |
| L-7 | ADR-0244 の影響: U4b の後の実態(集約の success・注意の1行・結線の固定)へ。降ろしていないのは 7.3 の機械と R2 の週次 |
| L-8 | README 第17項に「検査対象(製品のコード)が存在する構成」の限定を同じ項の中へ |

追加で、`assurance-case.md` IMPL-1029 の note に「必須でない変更(R2・R3)ではコマンドを走らせず注意で通す」「手動の実行は必須の側」を足した。

## 足した試験の件数

template の試験の一致件数: test-adapter 121 → 140、test-g5-aggregate 52 → 61、test-init-g5 182 → 188(LF の複製)、test-aggregate-wiring に IMPL-0763・0930 の場面 3 件(全場面 64 件通過)。

## 陰性の確認(直した後に、壊して試験が落ちることを実行で見た)

LF の複製(コミット 242f38b)で、1つずつ壊して関係する試験を流し、元に戻した。

| 所見 | 壊し方 | 試験 | 結果 |
| --- | --- | --- | --- |
| H-1 | 必須でないときの打ち切りを `if (false)` | test-adapter | 3 件 NG(R2 の PR で走らせない組ほか) |
| H-2 | 段 mutation の呼び出しを `run: "true"` | test-g5-aggregate | 1 件 NG |
| H-2 | 段 regulatory の呼び出しを `run: "true"` | test-g5-aggregate | 1 件 NG |
| M-2 | 経路名の理由の文を外す | test-adapter | 1 件 NG |
| M-3 | 変更の一覧の rename を modify にする | test-adapter | 3 件 NG(rename の push・PR の組を含む) |
| M-4 | 閾値を作業ツリーの値から優先して読む | test-adapter | 1 件 NG(作業ツリー 50 の組) |
| M-4 | 基底の構成の書き出しを `true` にする | test-g5-aggregate | 1 件 NG |
| M-5 | 契約検査の `thresholdProblems` の呼び出しを消す | test-init-g5 | 4 件 NG |
| M-6 | 集約の注意の行を `if (false)` | test-aggregate-wiring | 3 件 NG |
| L-1 | `<` を `<=` | test-adapter | 1 件 NG(80/80) |
| L-2 | 行頭の固定 `^` を外す | test-adapter | 2 件 NG |
| L-5 | 案件の条件の分岐を `if (false)` | test-adapter | 1 件 NG(集約の文は test-aggregate-wiring の CL3 の組も見る) |

M-6 の NG が 3 件で、ok の組(閾値あり)も数に入っている理由は、壊し方が行の push を落とすことによる別の NG が混ざったかを詳しく見ていない。落ちること自体は確認した。

## 実行した検査

template(LF の複製): test-adapter 140 件一致、test-g5-aggregate 61 件一致、test-init-g5 188 件一致、test-aggregate-wiring 64 件通過、test-adoption 123 件一致。作業ツリー(CRLF)では test-g5-aggregate の既存の 6 件が改行で NG になる(既知。LF で通る)。本体: lint:refs・lint:impl・lint:evidence・lint:scope・test:fields・test:criteria・textlint は通過。回帰の全量(npm run check)は流していない(push の前に行う)。

## 議長へ返す点

- 無し。裁定どおりに直せた。M-1(番号の付け直し)と tailoring-kb.json の生成元の版は push の準備で行う
- 注意: `check-pr.mjs` に `changeListBetween` を最小の公開として足した(既存の関数は変えていない)。2巡目はここを見てほしい
- 注意: H-1 の「走らせない」は段 mutation だけ。regulatory は、規制業でないときに空でなければ従来どおり走る(裁定の対象外)
