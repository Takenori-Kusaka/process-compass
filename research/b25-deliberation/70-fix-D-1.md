# 束 B25 — 単位 D・K-4 の突合 1巡目の所見の直し(2026-11-19)

template のコミット(5a1c987 の上): `5fd5ebb`(契約検査・0597・低-2・試験)、`6bc6642`(README・手引き・L3 の表示)。bundle は `tmp/bundles/template-b25-Dfix-01.bundle`(2コミットを含む。コミット後に1回だけ作成)。L3 の表示の変更のうち `aggregate-evidence.mjs` の1行は、同じファイルの 0597 の直しと同じ hunk 群にあり、`5fd5ebb` に入った。

試験(WSL node 26、HEAD の archive に直したファイルを重ねた写し): test-adoption 88(80 から +8)/ test-init-g5 182 / test-check-delegation 83 場面 / test-delegation-wiring 27 / test-ai-free-practice 67 / test-aggregate-records 222(+1)/ test-check-pr 270 場面。すべて一致。本体: `lint:impl` exit 0、`evidence:write` 322 件(期限到来 0)、textlint 違反なし。

## 中-1(0834・0664)— 形: 基底との比較(0772 と同じ向き)

- 所在: `config.mjs` の `changeTypeProblems` に `baseConfig`・`onInherited` を足した。4点目だけの欠け(`enforcement*` のキーだけ)と、R1・R2 の規則との同一のパターンのうち、基底の構成にも同じ欠けがあるものを `onInherited`(注記)へ回す。`verify-gate-contract.mjs` が `baseConfigRead` を渡し、注記は「基底の構成に既にある欠けのため、失敗にしません。登録済みの種別は、4点目を記録するまで委任が止まります」と言う
- 失敗のまま: 基底に無い欠け(新しく足す・変える登録)、4点目以外(検知条件など3点)の欠け、4点目が3点と混ざる欠け。`/process-change` の登録の拒否と `autonomy.mjs` の委任の停止は `baseConfig` を渡さない呼び出しで、従来どおり(試験 test-check-delegation 83 場面が通る)
- 基底を読めない実行(`--base` なし・基底に構成が無い): 同じ欠けを注記にとどめる(0772 と同じ向き)。PR で基底を解決できなければ、既存の処理が別に失敗にする。限界(開示): main への push やローカルでは、新しく足した4点目の欠けも契約検査では注記になる。拒否は登録(`/process-change`)と PR の契約検査が担う
- 試験(test-adoption の新しい塊): 基底にある4点目の欠け → 注記・失敗なし / 新しい種別の欠け → 失敗(旧い種別は失敗にしない)/ 4点目を記録 → どちらも出ない / `--base` なし → 注記 / 検知条件の欠けは基底にあっても失敗 / 基底にある同一のパターン → 注記 / 新しく足した同一のパターン → 失敗
- 外して落ちる確認: `baseConfig` を渡さない形へ戻すと、注記側の3件と失敗側の1件が落ちた(4件)
- README 16 節: 0834・0664・K-4 の項を実態へ(契約検査は基底に既にある欠けを注記、委任の停止は保つ、基底を読めない実行の扱い)。IMPL-0834・0664 の note にも同旨を足した

## 高(IMPL-0983 と本文2か所)

編集のみ。`human-ai-boundary.md` の IMPL-0983 の note と 5.5.4 の表の行、`assurance-case.md` の括弧を、0834 が機械で降りた実態(記入の有無を確かめ、同じ表示に出す。内容は確かめない)に改めた。条文の規範の文は変えていない。根拠水準マークの中は触っていない。

## 中-2(0840)

IMPL-0840 の note に「依存の目印は準拠テンプレートの一覧(DEPENDENCY_MANIFESTS。15 のファイル名)に限り、一覧に無いマニフェストは確かめない」を足した。`mode.md` の置き場の手引きにも、一覧の範囲と、一覧に無いマニフェストも `excludePaths` に書ける旨を足した(一覧は足していない)。文のみ。

## 中-3(0597)— 先に再現を確かめた

- 再現: 席の責任者を引けない構成では `bySeat` が常に偽になる(コードを読んだ範囲)。その入力を `samplingMonthly` に渡すと、記録があっても全ての月が `short` に出る(n=8・k=0 の月が不足)。**集約の通しの実走は行っていない**(月ごとの表の構築は関数への入力で決まるため、関数の挙動で確かめた)
- 直し: `aggregate-evidence.mjs` の `samplingMonthly` に `reviewerResolved`(既定 true)を足し、偽なら月ごとの不足を出さず `unresolved` を返す。`samplingMonthlyText` は「独立レビュアの席の責任者を名簿から引けず、事後の抜き取りの件数を数えていません。抜き取りが行われていないことを意味しません」を出す。呼び出しは `whoKey('independent-reviewer')` の有無を渡す。IMPL-0597 の note にも同旨
- 試験: test-aggregate-records に1場面。外して落ちる確認: 分岐を無効にすると落ちた

## 低

- 低-1(0840): note を「版の数字・16進のハッシュ・sha の integrity だけが変わる更新は戻さない。それ以外の追加の行(依存でない行、go.sum の base64 のハッシュだけの更新を含む)は戻す」へ。正規化は変えていない
- 低-2(0664): `riskFloorOverlapPatterns` が、規則の `excludePaths` に同じ文字列があるパターンを除く。試験1件(test-adoption)。外すと落ちた。`./` の違いは開示済みのまま
- 低-3: L3 の表示に「変更のリスク区分が R1・R2 の変更は、種別が L3 でも委任で進まない(条件2)」を足した(`autonomy.mjs` の注記、`aggregate-evidence.mjs` の保証の開示、`generate-profile.mjs` と `templates/00-d0-governance.md` の節12 の文)。表示のみ。既存の試験が通る(生成と様式の文が一致)
- 低-5: README 16 節の K-4 の項に、区切りは読点・カンマ・スラッシュで「・」では分けないこと、「なし」に括弧の理由を付けた行は登録外の ID として扱うことを足した。区切りに「・」は足していない
- 低-4・低-6: 本束では直さない / 議長が直す(裁定どおり)

## 作れなかった点

なし。残り: 直した差分の独立の突合(2巡目)。`tailoring-kb.json` の M(CRLF の差)はコミットに入れていない。
