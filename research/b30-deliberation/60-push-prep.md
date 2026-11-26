---
title: 束 B32 の push の準備(回帰)
---

## 載せ直し
- 本体は origin/main(9b6bc677、知識グラフの自動更新)の上に既にある(origin/main は HEAD の祖先、16コミット)。rebase は不要で、衝突なし。
- template は fetch の結果、origin/main が b5f406f。b32(3769f79)はその上にあり(origin/main は祖先)、rebase は不要。本体の gitlink は 3769f79 で揃っている。

## 番号の確認
- origin/main の最大: EV-0346、IMPL-1036、SRC-0768。本束の差分に足した行に出る番号は EV-0345、IMPL-0047・0061・0118・0190・0191・0268・0284・0287・0288・0291・0516〜0518・0521・0645・0834・0977・1003・1004・1006・1011・1017・1033・1035 で、いずれも origin/main の最大以下の既存の番号の状態変更・参照。新しい番号の追加は無く、重なりなし。
- impl:write・evidence:write・scope:write は差分なし。template:kb の差は生成元の版の自己参照(commit の1行)だけ。コミットせず元へ戻した(先例 61-push-prep-y12.md)。

## 回帰の全量(WSL Ubuntu-24.04・node v26.13.1・LF の写し、npm ci 終了 0、直列)
写しは git archive(core.autocrlf=false)で作り、本体は bundle の履歴(.git)、template は git init の1コミットを足した(test-adoption が git ls-files を、test:criteria が生成元のコミットを引くため。写しの不備で、本束の欠陥ではない。先に履歴なし・CRLF の写しで落ちた分は判定に使わない)。

| 条件 | 終了コード | ok 行 | FAIL |
|---|---|---|---|
| 通常 | 1 | 449 | 1(test:regress の scenarios の4場面) |
| TZ=UTC | 1 | 449 | 1(同じ) |

- npm run check は test:regress で止まり、後続の build は連鎖で走らない。build は別に流し、終了 0(405 ページ)。それ以前の検査(test:template・test:fields・test:criteria・test:template-suite を含む)は通過。

## FAIL の切り分け(直していない)
- 落ちた場面 4: scenarios(scripts/regress/suite/scenarios.mjs)の「承認権限の一時制限の発動を記録する(通知は未記入)」「一時制限の発動が、未記入の通知として残る」「通知先が出荷判定者の席の責任者でない → 拒否」「通知を後から記録する(種別 notice)」。
- 原因: 本束の変更。template の 162fd99(#356 の単位 Y)が、承認権限の一時制限の変化点に根拠の区分 `restriction.cause`(7.9.1-1 / 7.9.1-2)を必須にした。suite の283行目ほかの入力は restriction に cause を持たず、「restriction.cause を書きます」で拒否される。後続の2場面は、1つ目が反映されない連鎖。時計依存・環境の偽ではない(通常・UTC で同じ)。
- 要対応: 場面の入力へ cause を足し、期待(scripts/regress/expected/scenes/scenarios.txt)を更新する。cause の欠落を拒否する場面の追加も要る。push の前に直す(この記録の担当は直さない)。

## 最終
- template 先頭: 3769f797229d1f6211cfe15e2476f9d0801e77f0(origin/main b5f406f の上)
- 本体の先頭: 本記録のコミット(報告に記す)
- 写しは削除した。

## 2回目
回帰の全量を、修正後の本体 8f7426f1・template 3769f79 で流し直した(WSL Ubuntu-24.04・node v26.13.1・LF の写し、npm ci 終了 0、直列)。

- 写しの作り方: 本体は bundle を clone(autocrlf=false)、template は git archive の1コミット。今回は template の写しが CRLF だったため、先に LF へ揃えた(CRLF のままだと t288・trial・r3-scen・r3-verify・r3-succession が D-0 の表の置き換えで中断する。写しの不備で、本束の欠陥ではない。判定に使わない)。
- `node scripts/regress/run.mjs --write-scenes`: 終了 0、29 本すべて通った。場面の一覧の差分は scenarios.txt の1行追加だけ: 「一時制限の発動に根拠の区分(cause)が無い → 拒否 → 拒否」(承認権限の一時制限の発動を記録する の直前)。それ以外の一覧の差分なし。Windows の作業ツリーへ LF のまま持ち帰った。
- 表示の注意: 追加行の末尾が「→ 拒否 → 拒否」と重なる。場面の名に「→ 拒否」を含めたため。意味は変えないが、直すなら場面の名から「→ 拒否」を外す。直していない。

| 条件 | 終了コード | ok 行 | FAIL |
|---|---|---|---|
| 通常 | 0 | 449 | 0 |
| TZ=UTC | 0 | 449 | 0 |

- 写しは削除した(node_modules は写しの内側で、Windows へのリンクなし)。
