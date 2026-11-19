# 束 B25 独立の突合 2巡目(直した差分だけ)— 単位 C・S・D と K-4(2026-11-19)

対象: template `197f7b4..6bc6642`(51be64e・5a1c987・5fd5ebb・6bc6642)、本体 `97f65071..c96b6e2b -- src`。入力は 1巡目の所見(50-review-CS-1・50-review-D-1)と議長の裁定(60-ruling-fix-CSD-1 と追記)。直しの担当の記録(70-fix-CS-1・70-fix-D-1)は所見を固めた後に読んだ。ファイルは本ファイルのほか書き換えていない。最後の巡(3巡目は無い)。

件数(新しい所見): **高 3 / 中 1 / 低 3**

## 実行したこと

- WSL の node 26.13.1。`git -C template archive 6bc6642` を `/tmp/b25r2.*` へ展開し `git init`・commit。場面のスクリプトは scratchpad に置いた(作業ツリーには置いていない)。終了後に一時ディレクトリとスクリプトを消した(`/tmp/pit-in-adoption-*` の残りも消した)
- 試験(写し・6bc6642): test-adoption 88 / test-init-g5 182 / test-check-delegation 83 場面 / test-aggregate-records 222 / test-check-pr 270 場面 / test-model-adoption 41 / test-roster-conditions 61 / test-performer-account 72。すべて期待と一致
- 直しを外して落ちることの確認(写しごとに1つ外す):
  - M1 0772 `weakenedHere` を常に偽: test-adoption の ng 4件(simplified・omitted・文言・同居)が NG
  - M2 0834 `inheritedBasis` を基底によらず真: test-adoption の「新しく足した種別の4点目の欠けは失敗」が NG
  - M3 0651 `chainStarted` の条件を外す: test-init-g5 の ok 2件(1名・3名の旧い構成は注意)が NG
  - M4 0597 `reviewerResolved` の分岐を外す: test-aggregate-records の ng 1件が NG
- 本体: `npm run -s lint:impl` → 終了コード 0(実装マーク 1018件、降りていない規定 112件、機械 287 / 実在 152 / 人 579)

### 基底と比べる形の場面(写しの上で `verify-gate-contract.mjs` を実行。導出 g2 = required)

| 場面 | 結果 | 判定 |
| --- | --- | --- |
| (a) 基底も simplified・変更後も simplified(宣言なし) | 失敗なし。`::warning::` 「未適用の厳格化として表示にとどめます」 | 裁定どおり |
| (b) 基底 required → 変更後 simplified(宣言なし)、`--base HEAD` | 失敗1件「この変更が基底の状態から弱めています」 | 裁定どおり |
| (c) (b) に deviations[] を付けた | 失敗なし | 裁定どおり |
| (d) `--base` なし(作業ツリーは弱めたまま) | 失敗なし。注記の文は「**基底の状態から弱めた変更ではないため**」 | **高-2**(確かめていないのに確かめた文になる) |
| (e) 作業ツリーで弱め、基底の版は required、`--base HEAD` | 失敗(基底は `git show <base>:process.config.json` の git の版から読む。作業ツリーのファイルでは騙せない) | 裁定どおり |
| (g) 基底 simplified + deviations[] → 変更後 simplified、deviations[] を外した | **失敗なし**。注記「未適用の厳格化」 | **高-1** |
| (h) 基底 unmet + unmet[] → 変更後 omitted、宣言なし | **失敗なし**。注記「未適用の厳格化」 | **高-1** |
| (i) 基底を template の初期の版(未設定)にした | 失敗(初期の版の状態が required のため弱めに数える) | 所見なし |
| (f1) 4点目の欠けた種別を新しく足す | 失敗(新しい種別だけ)。旧い種別は注記 | 裁定どおり |
| (f2) 基底で4点目の欠けた種別の、登録者・登録日・tests を変えた(4点目は欠けたまま) | **失敗なし**(注記) | 中-1 |
| (f3) `--base` なし | 注記「**基底の構成に既にある欠けのため**」 | 高-2 と同じ |
| 委任の停止(`autonomy.mjs`) | 差分で変わっていない。test-check-delegation の「4点目の無い登録済みの種別は止まる」が通る | 裁定どおり |

workflow の結線: `gate-g5.yml` の contract ジョブは、PR では `--base` を渡さないが、GitHub Actions が `GITHUB_BASE_REF` を設定し、`compareWithBase` が `origin/<base>` を読む(直前の step で fetch)。解決できなければ problems で失敗する。**既定ブランチへの push(`gate-g5-push.yml` → workflow_call)では `--base "$BEFORE"` を渡す**。基底を読まないのは、ブランチの作成の push(BEFORE が空)と `workflow_dispatch` とローカルだけ。よって、検査が常に注記になる「高」は無い。ただし note と README は「main への push は基底を読めない(注記)」と書いており、実態(main への push は比べて失敗にする)と食い違う(高-3)。

## 1. 1巡目の所見の直り

### 単位 C・S(高3・中4・低8)

| 所見 | 判定 | 根拠 |
| --- | --- | --- |
| H-1 0772 が未適用の厳格化で止める | 直った(追記の形)。ただし新しい穴 → 高-1・高-2・高-3 | 場面 (a)(b)(c) |
| H-2 overview.md の IMPL-1030 | 直った | 「D-0 節12 の表である(…書き分けてある。IMPL-1030)」。規範は変わっていない |
| H-3 IMPL-0976 の note | 直った | 「『移す』と『外す』に…無視して所見に出す。『外す』…は IMPL-0980」 |
| M-1 README 15 節 | 直った | 冒頭が check-d0・check-process-rules の失敗と再生成の1つの手順を書く |
| M-2 0651 の旧い構成 | 直った | `chainStarted` でなければ warn。M3 で試験が落ちる |
| M-3 D-0 節12 (2) | 直った | ADR-0225 決定5 の両面(個別の認証は当たらない/名簿のアカウントは当たる)を書く。文の固定の試験あり(test-performer-account +1) |
| M-4 0643 の note | 直った(裁定どおり開示。止める向きは採らない旨と再検討の契機も note にある) |  |
| L-1 強い向きの ok | 直った | test-adoption に場面あり |
| L-2 merged-into | 直った | README 14 節に「同じ段に数え、向きは確かめません」 |
| L-3 宣言の文言 | 直った | 「state を unmet にして unmet[] に理由」 |
| L-4 answers.json の拾い方 | 直った | README 14 節(IMPL-0709)に追記 |
| L-5 正規化 | 直った | `modelKey` は NFKC・小文字・空白だけ除く |
| L-6 gate-skill-g7 | 裁定どおり直さない |  |
| L-7 input.md | 直った | 4席の外は 3.4.1 の任命の確認として任意 |
| L-8 0651 の note の限定 | 直った | note 末尾に旧い構成の限定 |

### 単位 D と K-4(高1・中3・低6)

| 所見 | 判定 | 根拠 |
| --- | --- | --- |
| 高 IMPL-0983 と本文2か所 | 直った | note・human-ai-boundary.md(574 行の2文)・assurance-case.md が「記入の有無は IMPL-0834(機械)」。規範の文(4点の記録が無い種別は登録しない等)は変わっていない。根拠水準マークは触っていない |
| 中-1 0834・0664 の契約検査 | 直った((a) の形)。ただし (f2) → 中-1、note の push の記述 → 高-3 | 場面 (f1)(f3) |
| 中-2 0840 の範囲 | 直った | note と mode.md に一覧の限定と `excludePaths` の1文 |
| 中-3 0597 | 直った | `reviewerResolved` が偽なら件数を数えず理由を出す。試験1件(M4 で落ちる) |
| 低-1 0840 の note | 直った | go.sum の base64 を含む旨 |
| 低-2 0664 の excludePaths | 直った | 同じ文字列を同一に数えない。試験あり |
| 低-3 L3 の表示 | 直った | autonomy.mjs・generate-profile.mjs・aggregate-evidence.mjs・D-0 様式に1句 |
| 低-4 欠陥の台帳の列 | 裁定どおり直さない(議長が既存 Issue へ寄せる) |  |
| 低-5 K-4 の区切り | 直った | README 16 節に1句 |
| 低-6 EV-0342 | 直った(議長の編集。97f65071) | 差し替え条件に「または、所有者が本文への定義の追加を決めたとき(別の審議)」。書式は保たれている |

## 2. 新しい所見

### 高(直しが要る)

**高-1 0772 は、基底にあった宣言を外す変更と、基底の unmet を宣言なしの omitted へ移す変更を通す(検査が黙って通す。注記は原因を「未適用の厳格化」と取り違える)**
- 所在: `template/scripts/gate/verify-gate-contract.mjs` の 0772 の節(`weakenedHere = baseState !== undefined && rank(baseState) > rank(have)`)
- 事実: 場面 (g)(h)。比較は状態の段だけで、基底の宣言の有無を見ない。`rank('unmet')` は 1(omitted と同じ段)。このため、(g) 基底で deviations[] つきの simplified を、宣言だけ外した変更、(h) 基底で unmet(unmet[] つき)のゲートを、宣言なしの omitted にした変更は、どちらも「基底の状態から弱めた変更ではない」と注記され、失敗しない。直し前は失敗していた(この変更で生じた後退)。どちらも禁止事項6 の「宣言の無い逸脱」をこの変更が作っており、未適用の厳格化(知識ベースの更新)ではない。note は「基底より弱めた変更だけを失敗にする…基底と同じ状態の差は取り込みで導出が強くなっただけの未適用の厳格化」と書き、この2つが通ることを開示していない。追記が求めた「基底に既に入った弱めが以後の PR で注記になる」の開示も、未適用の厳格化という説明に置き換わっていて明示されていない
- 直す案: 「この変更が作った宣言の無い弱め」を、次のどれかに当たるものとする。(1) 基底の状態より段が下がった(現状)、(2) 基底で当該ゲートに宣言(unmet[] か deviations[]、または state が unmet)があった、(3) 基底の状態が unmet だった。注記に回すのは、基底でも同じ状態で宣言が無かったものだけにする。ng 2件((g)(h))の試験を足す。note に「基底で既に宣言なしだった弱めは、以後の PR で注記になる(基底へ入った経路は確かめない)」を明記する。人の承認の層(gate-g5-base の統制の設定の承認)があることは、機械の表示を正す理由にならない

**高-2 基底を読まない実行の注記の文が、確かめていないことを確かめた文で出す**
- 所在: `verify-gate-contract.mjs` の 0772 の注記(「基底の状態から弱めた変更ではないため、未適用の厳格化として表示にとどめます」)、0834・0664 の `onInherited` の注記(「基底の構成に既にある欠けのため、失敗にしません」)
- 事実: 場面 (d)(f3)。`baseConfigRead` が null(`--base` なし、ブランチの作成の push、`workflow_dispatch`、基底に構成が無い)でも同じ文が出る。比べていないのに「基底から弱めていない」「基底に既にある」と出力する。出力と実態の食い違い。PR の経路では基底を必ず読む(読めなければ失敗)ため、合否の穴ではない
- 直す案: `baseConfigRead === null` のときは文を分ける。例「基底ブランチの構成と比べていないため(--base なし、または基底に構成が無い)、この変更が弱めたかを確かめていません。表示にとどめます。PR の契約検査で比べます」。4点目・同一のパターンも同様。文言の試験を1件ずつ

**高-3 note と README が「main への push は基底を読めない(注記)」と書くが、実際は `--base "$BEFORE"` で比べて失敗にする**
- 所在: IMPL-0772 の note(`tailoring-guide.md`)「基底を読めない実行(--base なしのローカル実行や main への push)は注記にとどめ」、README 14 節(0772)・16 節(0834)、`verify-gate-contract.mjs` と `config.mjs` のコメント、70-fix-D-1 の「限界(開示)」
- 事実: `gate-g5.yml` の push の分岐は `node scripts/gate/verify-gate-contract.mjs --base "$BEFORE"`(fetch に失敗すると解決できず失敗)。場面 (b)(e) のとおり、基底を読んだ実行は弱めを失敗にする。表示は実態より弱く言っている(実態のほうが厳しい)。直接 push の採用者は、表示を信じると push の後の失敗を予期できない
- 直す案: 表示の直しで閉じる。「基底を読まない実行(--base なしのローカル実行、ブランチの作成の push、workflow_dispatch)は注記にとどめる。PR は GITHUB_BASE_REF の基底と、既定ブランチへの push は直前のコミット(github.event.before)と比べ、弱めを失敗にする」に揃える(0772 の note・README 14・16 節・コード中のコメント)。IMPL-0834 の note は場所を挙げていないため、そのままでよい

### 中(note・README の開示で閉じてよい)

**中-1 0834: 基底で4点目の欠けた種別の登録を「変える」変更(登録者・登録日・根拠の他の欄)も注記になる。note と README は「新しく足す・変える登録の欠けは失敗」と書く**
- 所在: `config.mjs` `changeTypeProblems` の `inheritedBasis`(欠けたキーが基底と同じかだけを見る)
- 事実: 場面 (f2)。種別 ID が同じで欠けたキーが同じなら、他の欄を変えても注記。裁定の「新しく足す・変える登録だけを拒む」と note の文が、実装より広い。委任の停止(`autonomy.mjs`)は保たれ、`/process-change` の登録の拒否も `baseConfig` を渡さないため働く。安全の穴ではない
- 閉じ方: 表示の食い違いなので、どちらかに揃える。(a) note・README を「4点目の欠けが基底にもある種別は、他の欄を変えても契約検査では注記(登録の拒否は /process-change、停止は autonomy.mjs が担う)」に改める。(b) 種別の `basis`・`registeredAt` などが基底と違えば失敗にする。議長が選ぶ。表示と実態の食い違いに当たるため、(a) でも直しは要る(巡の数によらない)

### 低

- **低-1** IMPL-0664 の note が、基底を読まない実行で同一のパターンも注記になる旨を書いていない(0834 の note は書く)。1句足す
- **低-2** 0597 の結線(`reviewerResolved: Boolean(whoKey('independent-reviewer'))`)は試験されていない(試験は `samplingMonthly` へ直接渡す)。1巡目の「見ていない点」と同じ。note か担当の記録で開示
- **低-3** D-0 節12 (2) の文が「同じく列挙に無い離脱に数え、…記録の所在を採用者が確かめる」の直後に「記録が残る場合は (2) に当たらず」と続く。順に読めば矛盾しないが、前の文の「確かめる」の対象が除外の判定のためと読みにくい。任意の編集

## 3. 見た・所見なし

- 基底の読み方: `git show <base>:<prefix>process.config.json`(git の版)。作業ツリーの差し替えでは騙せない(場面 e)。PR の側が workflow の定義(`gate-g5.yml`)自体を変える経路は、本巡の差分の外(gate-g5-base.yml の統制の設定の承認が受ける)
- 0651 の `chainStarted`: 旧い構成は warn と「最初の /process-change の後は失敗します」、連鎖の後は失敗(既存の ng が通る)
- 0597 の責任者を引けないときの文: 「抜き取りが行われていないことを意味しません」「合否にも記載の欠落にも数えません」を含む
- 0664 の `excludePaths`: NFKC と trim で同じ正規化。試験あり
- 0643 の正規化: 導入の記録の側と同じ(括弧を除かない)
- L3 の1句: 4か所(autonomy.mjs・generate-profile.mjs・aggregate-evidence.mjs・D-0 様式)で同じ文
- README 14〜16 節: 高-3 と中-1 の箇所を除き、実態と合う(0651 の旧い構成、0709 の拾い方、15 節冒頭の再生成の手順、16 節の 0834・0664・K-4)
- 本文の状態の記述の編集(overview.md・human-ai-boundary.md・assurance-case.md): 状態の記述だけで、条文の規範(登録しない・止める)は変わっていない。根拠水準マークの書式は壊れていない
- 裁定に無いことの追加: 見つからなかった

## 4. 見ていない点

- 実物の GitHub Actions での実行(`GITHUB_BASE_REF` の設定・push の BEFORE の fetch)。workflow の定義を読んだだけ
- 回帰の全量・`npm run check`・`template:kb`(template の作業ツリーの未コミットの `tailoring-kb.json` の差は見ていない)
- `merged-into-gN` を含む基底との比較の場面(rank は omitted と同じ。高-1 の直しで同じに扱われる見込み)
- 出荷の証跡の集約の全体の実走での 0597 の表示
