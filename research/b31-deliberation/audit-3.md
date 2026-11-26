# 束 B33 U6c・U8 の独立の突合(この単位の1巡目)

突合 2026-11-26。実装を見ていない別の文脈で行った。対象: template `0ab526a..4701087`、本体 `053c45c3..e622e39a`(research・graphify-out を除く)。基準: `ruling-1.md`(§0・§1.1・§1.5・§3)、`ruling-draft-1.md` §1.4・§3・§7、`ruling-4-audit-2.md`。`impl-u6c-u8.md` は主張として扱い、現物と実行で確かめた。

試験は template の LF の写し(`tmp/audit3/t`。`git -c core.autocrlf=false archive 4701087`)を WSL の node 26.13.1 で流した: test-exception-expiry 123/123、test-check-pr 300 場面、test-g5-aggregate 61、test-aggregate-wiring 65、test-adapter 232。すべて通過。

## 結果: 高 0・中 1・低 2

### 中1 集約は、写しがあっても (A) が満たされないとき (B) で帰属を数える。ADR-0243 決定5・IMPL-0996/0931 の note・README 項23・手引きの記述より弱い

- 所在: `template/scripts/gate/aggregate-evidence.mjs` 2980〜2994 行(閾値割れの行の `ledgerRowUnbacked` の呼び出し)と 2700〜2715 行(`ledgerRowUnbacked` は material の (A) が通らなければ、行を入れた PR の作成者・承認者の (B) へ落ちる)
- 入力と起きること(写しで実行して確かめた。`tmp/audit3/t2` で test-exception-expiry の集約の場面に2件を足した):
  1. 対象 `G-5 PR-351`・印あり・PR-351 の写しが範囲にあり、宣言行のレビューが**無い**。承認した者は、行を入れた PR(352)の承認者(名簿 乙)。→ 欠落にならず、`gateExceptions` に成立として出る
  2. 同じで、承認した者が**対象の PR の作成者**(名簿 甲。行を入れた PR の作成者でもある)。→ 欠落にならず成立。段は条件7(承認した者が PR の作成者でない)と条件8 の (A) で受けない行である
  3. 写しが無く PR が範囲にある場合(REST だけ。`edited_by` が無い)も、(A) は「編集の記録を読めない」で落ちて (B) へ進む。ADR-0243 決定5 の「写しが無い・読めないときは、集約が欠落に数えて止める側に倒れる」は、この経路では成り立たない
- 表示との食い違い: ADR-0243 決定5・IMPL-0996 の note・IMPL-0931 の note・README 項23・exception-paths.md は、「帰属は対象の PR の写しの宣言行のレビュー (A) で数える。写しが範囲に**無い**ときだけ (B)」と書く。実態は「(A) か (B)」である。ruling-1 §0 の一致「帰属は (A) に限る」とも、ruling-draft-1 §3(写しがあれば (A)、範囲に無い・写しが無いときだけ (B))とも合わない。この非対称を許すと決めた裁定は無い(impl-u6c-u8 の「議長へ返す点2」で問われたまま)
- 抜け道になるか(観点1)の結論: **G-7 を通す抜け道にはならない**。
  - 集約は、範囲の各 PR の gate-g5 を、台帳の行と無関係に見る(3524〜3529 行。成功でなければ `PR #N: gate-g5 が <結論> です`、記録が無ければ g5MissingText)。上の 1 の場面でも `PR #351: gate-g5 の結果の記録がありません` が欠落に出ることを確かめた。段が失敗した PR を管理者の迂回などでマージしても、この欠落は残る
  - `G-5 PR-N` の行は `gateExceptionTarget` に当たるため、変更の行の照合(2920 行の `continue`)に入らず、G-6 などの欠落も解かない
  - 既定ブランチの push の gate-g5 は G-7 の通過に数えない(`G5_PR_EVENTS` は pull_request・pull_request_target だけ)。push の経路で段が受けたかどうかは G-7 の結論に効かない
  - 影響は表示に留まる: 段が受けない行(宣言行のレビューが無い、承認した者が作成者)が、出荷の証跡に「成立した例外承認(未回収)」として載る。出荷判定者は、成立した 7.3 の承認と読む
- (A) の材料を集約が通常の運用で持てるか: 持てる。record-copy.yml(pull_request_target の closed・merged)が GraphQL で `editor` を引いて `edited_by` を写しに足し、records ブランチへ置き、ship-evidence が `docs/records/reviews/` へ運ぶ。集約は写しを `reconcileCopy` で突き合わせてから material.reviews に使う。(A) に限っても経路は使える。使えなくなるのは record-copy が失敗した・写しを運んでいない PR だけで、そのときは帰属の欠落になる(止める側。既存の変更の行の (A) と同じ扱い)
- 直し方の案: (イ) 閾値割れの行で対象の PR が範囲にある(`bp` がある)ときは (A) だけで数え、(B) へ落とさない(`ledgerRowUnbacked` に (B) を禁じる引数を足す)。範囲に無いときの (B) は ruling-draft-1 §3 のとおり残し、表示はいまのままでよい。足す試験: 上の 1・2 の場面が欠落になること、陰性の確認として (B) を許した複製で落ちること。(ロ) (B) を残すなら、議長が採らない案として裁定し、ADR-0243 決定5・IMPL-0996/0931 の note・README 項23・手引きを「(A) か、行を入れた PR の (B)。(B) では承認した者が対象の PR の作成者でないことを見ない」と書き直す。ruling-1 §0 の一致に照らし、(イ) を推す

### 低1 (B) へ落ちる挙動が、どちらの向きにも試験で固定されていない

- 所在: `template/scripts/gate/test-exception-expiry.mjs` の U6c の集約の場面(u1〜u5)
- 入力と起きること: u3(宣言行なし)・u4(範囲外)は、承認した者が行を入れた PR の作成者・承認者でない場面だけを持つ。(A) が無く (B) がある場面が無いため、(B) へ落とす分岐を消しても、残しても、試験は落ちない(中1 の 1 の場面を足した写しで、現状のコードが通すことだけを確かめた)
- 直し方の案: 中1 の裁定に合わせ、(A) 無し・(B) ありの場面を1件足す

### 低2 U8 の陰性の確認で落ちる場面が「この場面だけ」ではない

- 所在: ruling-draft-1 §7 の3(「`keys` から `ci` を外した複製で、この場面だけが落ちる」)と `template/scripts/gate/test-check-pr.mjs` 1659〜1665 行
- 入力と起きること: check-pr.mjs 1889 行の `['ci', 'task', 'guard']` から `ci` を外した写し(`tmp/audit3/t3`)で流すと、3件が NG(U8 の場面、既存の「IMPL-0836:ng ci.mutationThreshold を下げる変更を製品のコードと同じ PR に入れると失敗する」ほか1件)。実装の記録の主張と一致する。U8 の場面は ok の側(同時変更の失敗にならず、`thresholds.changed` に `process.config.json(ci)` が出る)を固定しており、ok の向きでは既存の場面と重ならない。欠陥ではない
- 直し方の案: 裁定の記録で「この場面だけ」を「この場面を含む ci のキーの場面が落ちる」と読み替えることを明記する(直しは要らない)

## 所見にしなかった確認

- 観点2: `unjudgedGateExceptions` は、`mutationBreachPrOf(t) !== null` かつ `mutationBreachMarkOf(content)` のときだけ G-5 の行を飛ばす。内容が渡されない行・印の無い `G-5 PR-N`・`G-5 P-001` は欠落のまま(関数の場面 D-013〜D-015、集約の場面 u2・u5)。ruling-1 §1.1 の「subject の形だけでは判定しない」を満たす。帰属を通らない行は rejected へ行き、別に欠落になる。差分は追加と置き換えだけで、`exception-expiry.mjs`・`aggregate-evidence.mjs` の B32 以前の挙動を消していない(段の照合は `want` の比較を同じ関数 `mutationBreachPrOf` に置き換えただけ)
- 観点3: U8 の場面は ruling-draft-1 §7 の3 の場面の文のとおり。check-pr.mjs は変わっていない
- 観点4: IMPL-0931(test=test-exception-expiry)・1029(test=test-adapter)は delivered・machine。0763・0930 の note は「束 U6c で降ろした」。`npm run impl:issues` の出力に 445 は 0 件で、`issue=445` を持つ降りていないマークは無い(ADR-0219 の地の文の2か所だけ)。`npm run lint:impl` は降りていない既存の行(IMPL-1034・1035)を出すだけ。表示が挙動より強いのは中1 の帰属の記述だけ。決定5 の「段がその行で受けた事実は段の出力と宣言行に頼る(manual)」は ruling-1 §1.5 のとおり
- 観点5: template と本体の差分の追加行に、AI の名義(Claude・モデル名・bot)を責任者・承認者・承認した者の欄へ書く箇所は無い。試験の台帳の承認した者は名簿の人(名簿 己・乙)
- 低の直し(ruling-4-audit-2): 低2(ADR-0243 の ADR-0115 との突合の項の材料の列挙)と低3(README・手引きの「受けないもの」に基底を取り出せない場合)は反映を確かめた。低1 は ADR-0243・README 項23 に1文で開示されている
