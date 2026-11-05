# #376 実装の独立の突き合わせ

- 照らした入力: `decision.md`(裁定と外部調査の突合)、本体 7447489 の差分、テンプレート 3e0a5d8 の差分、既存の条項と ADR(3.13.3・3.13.4、第5章「向きの扱い」、第6章 D-0 表8、ADR-0087・0088・0089)
- 読んでいないもの: `implementation.md`、実装した側の説明
- 行番号は 3e0a5d8 / 7447489 の時点

## 確かめた項目の状況

| 項目 | 結果 |
| --- | --- |
| 1. R-1〜R-4 の漏れ | 漏れなし。R-1 の優先の順(generate-profile.mjs 2140〜2148 の導出)、表示「緩める(任免を含む)」、R-2 の要求事項(3.13.3)と案内、R-3 の維持と #432、R-4 の記録7・matrix-sweep の印の解除・mixed-change-point・ADR-0110・ADR-0089 の追記・EV-0228・IMPL-0444/0445 がそろう |
| 1. 裁定に無い追加 | `none`(F-4)、表示を rowKinds のある記録に限ること(F-4)。どちらも裁定から導ける補いで、ADR-0110 に書かれている |
| 2. ADR-0088 決定5 | 維持と書かれ、矛盾しない。ADR-0110 のステータスの表が「補う」関係を明記 |
| 2. 3.13.4 の番号 | 1〜6 を変えず 7 を末尾に足した。ただし第6章 表8 に対応の欄が無い(F-2) |
| 2. SIGNED_DIRECTIONS と帰属の照合 | 差分で不変(config.mjs 308 行、check-pr・aggregate の帰属の判定 `decisionNeedsAttribution` に手が入っていない) |
| 3. 文の規約 | textlint 通過。IMPL・EV・適用範囲の検査も通過(下記)。内部リンクはすべて `/process-compass/` 付き |
| 4. テンプレート | 案内の条件(F-5)、rowKinds の検査と旧い記録(F-6・F-8)、表示の箇所(F-1)、試験の印(F-6)、日付(問題なし) |
| 5. 回帰スイート | `changed` の書式は ADR-0089 決定3 の by・on・from に合う。mixed-change-point は (a)(b) の拒否と分けた受け付けの両方を固定する。Windows では実行できず、実行での確認はしていない(F-9) |

実行した確認:

- `TZ=UTC node scripts/gate/test-loosening-decider.mjs`(template)→ 「すべて通過」。#376 の9件(IMPL-0444:ng 2件・ok 2件、IMPL-0445:ok・ng、複合のラベル、旧い記録)が ok。fixture の日付は 2026-10-01(`generatedAt` は 2026-10-01T09:00+09:00 = 00:00 UTC)で、今日(2026-11-05)より前。TZ=UTC で未来にならない
- `npx textlint`(ADR-0110・ADR-0089・roles-responsibilities・template-repository)→ 終了コード 0
- `node scripts/check-impl.mjs` → 0、`node scripts/check-evidence.mjs` → 0、`node scripts/check-scope.mjs` → 0
- `node scripts/regress/run.mjs --only mixed-change-point` → 「gh の代役を呼べない。Windows では代役を execFileSync('gh') から呼べない」で走らせる前に停止

## 指摘

### F-1 表示の箇所の漏れ — 漏れなし(指摘なし)

- 所在: `template/scripts/` の `DIRECTION_LABEL|directionLabel` の全件
- 根拠: 向きを表示する箇所は、要約の表(generate-profile.mjs 3369)、D-0 の承認者の欄(同 5613)、check-pr の検査6b の見出し(check-pr.mjs 659)、aggregate-evidence の決定の記名(3983)と変化点の表(5411)。すべて `directionLabel(e)` に替わった。D-0 改訂履歴(節13。generate-profile.mjs 2693〜2730)は向きの列を持たず、決定者の欄は `e.direction === 'arising'` を判定に使うだけで表示名を出さない。`next.mjs` は向きを表示しない(1209 行は注記のみ)。残る `DIRECTION_LABEL[...]` は、記名の欠落の文言(config.mjs 1622、verify-gate-contract.mjs 632)で、表示ではなく SIGNED_DIRECTIONS の照合の文言である
- 重大度: —
- 直し方の向き: なし

### F-2 記録7 が第6章 D-0 表8(改訂履歴)に欄を持たない

- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md:2045`(記録7)、`src/content/docs/phase4-process-design/deliverable-templates.md:467`(表8 の列)、`src/data/template-fields.yaml:85〜93`、`template/scripts/init/generate-profile.mjs:2694`(節13 の列)
- 根拠: 3.13.4 は「記録は、D-0 体制図の改訂履歴と、構成の変更記録に置きます」と定める。表8 の列は記録1〜6 に対応し(日付・種別・版・再判定・無効になった確認・失効・決定した者・通知)、記録7 に当たる欄も注記も無い。準拠テンプレートは `changeLog[].rowKinds` にだけ残す。準拠テンプレートを使わない採用者は、標準の様式に記録7 の置き場を持たない。裁定 R-4 は「準拠テンプレートの changeLog の記録は」と書き、置き場を構成の変更記録に限る含みがあるが、標準の本文はその限定を書いていない
- 重大度: 中
- 直し方の向き: どちらかを決める。(i) 記録7 の行に「構成の変更記録に置く(D-0 の改訂履歴には要さない)」と行の中で限定する。(ii) 表8 に列か注記を足し、`template-fields.yaml` に必須欄または理由つきの `omit` を登録する。標準と逆の指示にならない形にする

### F-3 規則の承認で有効になった委任(緩める向き)が rowKinds に出ない

- 所在: `template/scripts/init/generate-profile.mjs:5471〜5480`(ruleActivated)、同 `1866〜1869`(承認の差分の行を `diff.push` で積む)、同 `2134〜2137`(rowKinds の算出)
- 根拠: 承認だけの変化点で委任の規則が有効になると、`report.loosenItems`・`report.loosens` に項目を足し、`report.direction = 'loosen'` とする。この処理は diffConfig の後にあり、`report.rowKinds` は書き換えない。対応する差分の行「委任の規則 X: AI維持管理者の承認 … → …」は `push` を通らず `none` になる。記録は「向き 緩める」でありながら、行ごとの種類に `loosen` が1件も無い。記録7「変更の行ごとの種類」と ADR-0110 決定3 の目的(どの行が緩める行かを残す)に反する。`rowKindsProblems` は数と既知の値だけを見るため、この不整合を検出しない(コードを読んで確認。実行での再現はしていない)
- 重大度: 中
- 直し方の向き: ruleActivated で項目を足すとき、該当する差分の行の種類を `loosen` に改める(行が無ければ行を足し、rowKinds も足す)。あわせて、rowKinds のある記録について「direction が loosen なら rowKinds に loosen がある」等の整合を検査に足すかを検討する。試験に承認だけの変化点の場面を足す

### F-4 `none` の追加と、複合の表示を rowKinds のある記録に限ること — 当否は可。ただし `none` の語の説明が狭い

- 所在: `roles-responsibilities.md:2045`(記録7 の「いずれにも当たらない行(名簿への追加など)は、その旨」)、ADR-0110 決定3 の1行目、`template/scripts/gate/config.mjs`(ROW_KIND_LABEL の `none: '—'`)、ADR-0110 決定1 の2行目(「表示は、行ごとの種類を持つ記録に限る」)
- 根拠: 裁定 R-4 は種類を5つ挙げ、差分の行と同じ数を求める。差分には5つのどれにも当たらない行(回答の変更、名簿への追加、適合性確認の記録、カタログの登録、規則の承認、担い手の識別など)が実在する(diffConfig の `diff.push` の各所)。数を合わせるには「当たらない」を表す値が要り、`none` は裁定から導ける補いである。ADR-0110 決定3 に書かれ、標準の記録7 とも一致するので、裁定に無い恣意的な追加ではない。複合の表示を rowKinds のある記録に限ることも、R-4 の「移行しない」から導ける。一方、`none` には記名を要する行も入る。氏名の確認・アカウントの確認(本人以外の記名を要する。generate-profile.mjs 1580〜1606)、規則の承認、カタログの登録である。記録7 の例示「名簿への追加など」は、`none` を「記名の要件の無い行」と読ませるおそれがある
- 重大度: 低
- 直し方の向き: 記録7 の括弧書きを「5つの種類で区分しない行(名簿への追加、氏名・アカウントの確認など。記名の要件は各行の規定による)」の趣旨へ改める。実装の側で裁定外の補いを入れたことを、ADR-0110 の該当の決定に「実装で補った」と明記してもよい

### F-5 分け方の案内の条件が、分けても通らない組でも出る。抑止の側の試験が無い

- 所在: `template/scripts/init/generate-profile.mjs` の `deciderProblems`(差分 496〜513 行目に当たる追加。`mixed` と名簿の全員の照合)
- 根拠: 条件は「(任免または名簿の表記の変更の行) かつ 緩める行」があり、かつ名簿のだれも全行を満たさないこと。満たせない原因が任免の行そのもの(例: 前任の決定者が外れ、任命権者も名簿にいない決定者の任命)でも、緩める行が1件あれば案内が出る。分けても任免の段が通らないので、案内は誤った手当てを示す。名簿の表記の変更と緩める行の組でも、文言は「決定者その人を替える変化点と、任命権者の変化点」の分け方だけを示す。ADR-0110 決定2 の「案内は、名簿のだれの記名でも全行の要件を満たせない場合に限って出す」は満たしているが、「分ければ通る」は EV-0228 で開示済みの未実証の前提である。試験は案内が出る側だけを固定し、だれかが全行を満たせるときに案内が出ないこと(抑止の側)を確かめていない(コードを読んで確認)
- 重大度: 低
- 直し方の向き: 案内を出す条件に「緩める行を除いた差分なら、だれかの記名で通る」ことを足すか、文言に「分けても通らない場合は、任免の段の要件を先に確かめる」の趣旨を足す。試験に、全行を満たす者がいるが記名者が違う場合に案内が出ない場面を足す

### F-6 IMPL-0445:ng が関数を直接呼び、注記が名指す契約検査の入口を通していない

- 所在: `template/scripts/gate/test-loosening-decider.mjs`(差分の 281〜285 行目に当たる IMPL-0445:ng)、`roles-responsibilities.md:2047`(IMPL-0445 の注記)
- 根拠: `community/implementation-marking.md` の machine の要件は「規定が入口(コマンド・スキル)についてのものなら、関数を直接呼ぶ試験では足りない。入口を通す試験を名指す」とする。IMPL-0445 の注記は「契約検査(verify-gate-contract)と出荷の証跡の集約(configIntegrityProblems)が問題にする」と入口を名指す。ng は `rowKindsProblems` を直接呼ぶだけで、verify-gate-contract.mjs 632 行の結線(`problems.push(...rowKindsProblems(e, i))`)が外れても落ちない。IMPL-0444 は `generate-profile.mjs --change` を通しており、この問題は無い。`check-impl.mjs` は目印の有無だけを見るため通る(終了コード 0)
- 重大度: 低
- 直し方の向き: 数の合わない rowKinds を持つ構成を一時の置き場に書き、`verify-gate-contract.mjs` を実行して落ちることを IMPL-0445:ng とする(封印がある場合は封印を付け直した構成で)。関数の試験は残してよい

### F-7 第3章が「名簿の表記の変更」の要件を第5章へ預けている

- 所在: `roles-responsibilities.md:1996`
- 根拠: 新しい箇条は、記名者が満たすべき行に「名簿の表記の変更」を挙げ、定義を第5章「向きの扱い」へリンクで送る。第3章 3.13.3 の任免の表には、名簿の表記の変更の記名の要件(決定者、決定者本人の行は任命権者または本人以外の席の責任者)が無く、要件は第5章の表(template-repository.md:601)にしかない。第5章は準拠テンプレートの章であり、テンプレートを使わない採用者にとって「すべての行の要件」の一部が規範の側に無い。#376 で新たに生じた問題ではなく、今回の箇条がそれを要件として引いたことで顕在化した
- 重大度: 低
- 直し方の向き: 本件では直さず、名簿の表記の変更の要件を第3章へ上げるかを別の Issue で審議する(コアポリシーにより、ここで条項を足さない)。少なくとも本箇条のリンク先を「第5章の表『人の名簿の表記の変更』の行」と特定する

### F-8 「旧い記録」を欄の有無で判定するため、新しい記録で欄が欠けても区別できない

- 所在: `template/scripts/gate/config.mjs`(`rowKindsProblems` の `e.rowKinds === undefined` で空を返す)、`generate-profile.mjs` の changeLogEntry(`Array.isArray(e.rowKinds)` のときだけ欄を持つ)、intake・migrate・init の記録(4317・4375・1038 行。rowKinds を渡さない)
- 根拠: 裁定 R-4 は「旧い記録には無くてよい。無い記録は種類の区分の無い記録として扱う」とし、実装はこのとおりである。ただし判定の鍵が時点ではなく欄の有無なので、本変更の後に書かれた体制の変化点(kind=accountable 等)の記録が欄を欠いても、検査は旧い記録として受け付ける。intake・migrate・init は体制の変化点ではない(D-0 改訂履歴から除かれる)ので、欄が無いことは記録7 に反しない。封印(sealChangeLog)が手書きの記録の差し込みを抑える前提で、実害は小さい
- 重大度: 低
- 直し方の向き: 裁定の範囲内なので必須ではない。強めるなら、構成の記録に rowKinds を導入した版(例: テンプレートのコミットまたは形式の版)を残し、それより後の体制の変化点の記録で欄が無いものを問題にする

### F-9 回帰スイート — 書式と固定の範囲は合う。実行での確認はできなかった

- 所在: `scripts/regress/expected/matrix-sweep.json`(changed の2件、knownFailure を空へ)、`scripts/regress/suite/mixed-change-point.mjs`、`scripts/regress/expected/scenes/*.txt`
- 根拠: `changed` の追加は `by: "ADR-0110 決定1"`・`on: "2026-11-05"`・`from`(旧い期待値)で、ADR-0089 決定3(決定の識別子・日付・旧い期待値。Issue だけの引用を認めない)と既存の項目の形に合う。R-4 の「決定5 は引かない」も守られている。mixed-change-point は (b) を前任・新任の両方の記名で拒否(案内の2語を照合)、(a) を任命権者の記名で拒否、両方を分けて受け付け、rowKinds・向き・下限 80 を確かめる。scenes の24行は本体の check/refused/accepted の呼び出しと一致する。matrix-sweep.txt から「: 向き」の2行が消え、knownFailure の解除と合う。Windows では gh の代役を呼べず実行できなかった
- 重大度: 低(確認の不足)
- 直し方の向き: CI(Linux)の `npm run check` の結果で、mixed-change-point と matrix-sweep の通過を確かめる
