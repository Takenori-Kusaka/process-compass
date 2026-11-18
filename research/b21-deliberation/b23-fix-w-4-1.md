# 束 B23 単位 W・4 の直し(1巡目の裁定 `b23-ruling-w-4-fix1.md` の実装の記録)

2026-11-19。template は F1-01〜03(bundle は `tmp/bundles/template-b23-F1-0N.bundle`)。

## 所見ごとの直し

- **M-1(0884)**: `check-g1.mjs` が、(a)(b) を現在の D-0 でなく、判定した企画書の版(G-1 の記録の版。無ければ企画書の最後のコミット)の時点の D-0(`git show 版:`)から読む。順序の逆は通過の前後を問わず失敗に戻した。版が読めないとき(記録に版が無い・存在しない版)は「確かめられません」を出して失敗にする。note の「条文に無い緩和」は削り、日付は自己申告で改ざんは確かめないこと(L-1)と gate-entry.yml が実物未確認であること(L-2)を足した。
- **M-2**: 様式 04 と標準テンプレ4 に「単位期間の長さ」の行を足し(ステージ移行ゲートのみ)、`template-fields.yaml` に両方向で登録。`doneConditionSource` が SG の通過の後は様式 04 の行から読み(未記入・読めない書き方は算定できない)、SG の前は企画書の欄(見込み)を読む。
- **M-3**: SG の出所は「validPass の SG の記録が1件でもあるか」で決める。後の別の SG の差し戻しで企画書へ戻らない。0374 の note を実挙動に合わせた。
- **M-4**: 様式 04 の「next.mjs は調整を行ったと読みます」を削除。
- **M-5**: IMPL-0614 を `state=undelivered check=manual plan=scheduled issue=443 review=2027-05` へ戻し、実装済みで実環境の確認だけが残ることと確かめる者を note に書いた。
- **低**: L-1・L-2 は 0884 の note、L-3 は 0878 の note(CI の既定は前案件を与えない・比べられるのはリポジトリの中の物だけ・プレースホルダ同士の同一警告)の開示で閉じた。L-5 は標準の「人が書く欄」へ完了の条件・単位期間の長さを足した。L-6 は理由の文を「未記入または読めない」に改めた。

## 採らなかった低の所見

- L-3 の `isFilledValue` を squash の前に掛ける案: 検査の条件の変更に当たるため採らず、note の開示で閉じた(害は小さい)。
- L-4(通過済みの企画書の一般語の検査を注意に緩める案): 裁定の変更に当たり、本裁定に無いため採らない。0801 は IMPL-0800 と同じ扱いのまま。

## 試験と変異(WSL node 26、通常・TZ=UTC)

- test-next-records 135、test-reach-forecast-record 21、test-brief-estimates 35、test-project-id 5、test-brief-thresholds 50、すべて通過。
- 変異(各1回、戻した): 順序の逆を警告へ・現在の D-0 を読む・読めないとき失敗にしない(0884 の ng が落ちた)、SG の出所を passed() に戻す(M-3)、単位期間を企画書から読む(M-2)。いずれも落ちた。

## 回帰(`--template-ref HEAD`、WSL)

- t288 87 場面・t288b 82 場面、落ち 0。
- 様式 04・企画書に依る cl-judgment 26・scenarios 186・stages 175・self-decision 131・verify-n 37・trial 35 場面、落ち 0。fixture の直しは要らなかった。

## 本体の検査

impl:write・evidence:write・scope:write、lint:impl・lint:evidence・lint:refs・test:fields・lint:scope・impl:issues、触った docs の textlint は通過。`template:kb` は複製元のコミットの記録だけが変わり、template F1-03 でコミット。

## 残った点

- 判定し直す G-1 は、新しい版の記録ができるまで前の版で比べる(note に開示)。
- IMPL-0614 の実環境の確認は、通し実行の一時リポジトリが要るため本束では行わない。
- 読み取りの結線(`flowSection` 全体)の通しの試験は無い(network が要る)。
- `template:kb` の複製元のコミットは本体のコミットのたびに古くなる(記録のみ。乖離の検査には影響しない)。
