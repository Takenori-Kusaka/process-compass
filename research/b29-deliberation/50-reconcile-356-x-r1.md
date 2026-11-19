# 束 B29 — #356 単位 X の独立の突合(1巡目・全体)(2026-11-20)

担当: 独立の突合(実装を見ていない別の文脈)。直しはしていない。基点は `research/b27-deliberation/31-chair-356.md`・`30-ruling-356.md` §1・§2・§3.1・`40-impl-356-x.md`、template の差分 `31e783a..bbbc95f`、本体の `d7d0be18`・`232f6938`。単位 Y(§3.2)は範囲外。

## 件数

| 重大度 | 件数 |
| --- | --- |
| 高 | 1 |
| 中 | 3 |
| 低 | 2 |
| 編集 | 3 |

## 所見

### R1-1(高)ADR-0250 決定1 の表が、条文と既存の判断より広い義務を採用者に求めている

- 所在: `src/content/docs/adr/0250-seeded-error-layer2-adopter-split-and-default-branch-prs.md:26`(表の2行目「採用者に求めること」)
- 根拠
  - 表は「演習用のブランチで squash・rebase・履歴の書き換えを禁じる設定と、その記録を持つ」を求める。条文 5.6.2 第2層(`human-ai-boundary.md:911`)は「演習用のブランチで、標識の失われる履歴の書き換えをしない」で、結果だけを求める。手引き(`seeded-error-safety.md:53`)もスカッシュの禁止までである
  - rebase は、既存の判断で標識を保つ通常の取り込みに数えている(`seeded-error-safety.md:101` 既存の暫定 EV の対象「通常の取り込み(merge・rebase・既定の文の squash・cherry-pick)で標識の残存を拾う」)。rebase の一律の禁止は、この判断と食い違い、標識の失われない操作まで禁じる
  - 「設定と、その記録を持つ」は、条文に無い手段(設定)と証跡(記録)の新しい義務である。議長の裁定(`31-chair-356.md` 3行目、`30-ruling-356.md` §1 D「重さ」)は「(i)(iii)の義務は 5.6.2 第2層に既にある。adopter は開示で、新しい義務でない」とし、その前提で軽のまま裁定した。ADR の表はこの前提と矛盾する
  - 所有者の方針(2026-11-16。条文は結果と証跡まで・手順は手引き)にも反する。ADR-0161 の同じ形の表(`0161-…md:81` IMPL-0190 の行)は、条文の結果を言い換えるだけで、手段を指定していない
- 直しの案: 2行目の「採用者に求めること」を、条文の結果へ戻す。例「演習用のブランチで、標識の失われる履歴の書き換え(本文を組み替える squash など)をしない。方法の例は手引き(フェーズ5)」。rebase と「設定と、その記録を持つ」を外す。IMPL-1033 の note の「確かめる者: …演習の記録と演習用ブランチの設定を読む」は IMPL-0190 と同じ形の確かめ方の記述で、義務ではないので残してよい

### R1-2(中)指示書 §3.1-1 の `scan()` の置き換えが行われておらず、実装の記録がそれを行ったと書いている

- 所在: `template/scripts/gate/seeded-error-scan.mjs:109-115`(`scan()` が `git log` と分割を自前で持ち続ける)、`research/b27-deliberation/40-impl-356-x.md:9`(「`scan()` は `parseLog` を使う(挙動不変)」)
- 根拠: 指示書 §3.1-1 は「`scan()` の 92〜100 行はこの関数を使う形へ置き換える」。差分 `31e783a..bbbc95f` は `markerCommitsInRange`・`parseLog` を足しただけで、`scan()` の本体は変わっていない(`'\x1e'` で分ける同じ処理が2か所にある)。PR の検査と出荷の走査が「同じ判定」(16 行のコメント)を持つという前提は、標識の判定 `hasMarker` は1か所で保たれるが、ログの読み方は2つの写しに分かれ、片方だけ直すと食い違いうる。記録の文は実態と違う
- 直しの案: `scan()` の分割を `parseLog(log)` に置き換える(`commitsScanned` に件数が要るため、`markerCommitsInRange` ではなく `parseLog` を共有する形でよい)。T-1〜T-7 が通ることを確かめる。または記録の文を実態に改める。前者を推す(指示書の項であり、判定の置き場を1つにする E の趣旨に合う)

### R1-3(中)`seeded-error-scan.mjs` の冒頭のコメントが、まだ無い import を現在形で書いている

- 所在: `template/scripts/gate/seeded-error-scan.mjs:16`「PR の検査(check-pr.mjs)が同じ判定(markerCommitsInRange)を import する」
- 根拠: bbbc95f の時点で `check-pr.mjs` は `markerCommitsInRange` も `PR_MARKER_HINT` も参照しない(template 全体を grep して、参照は seeded-error-scan.mjs とその試験だけ)。import は単位 Y の変更である。指示書がこの1行を X に置いたため実装の誤りではないが、X だけが push された状態では、採用者が読むコードの注記が実態と食い違う。裁定は X を B26 の push の前に、Y を後に置くので、X 単独の公開がありうる
- 直しの案: 「PR の検査(check-pr.mjs)が import するための関数(取り込みの前の拒否は降ろしている途中。IMPL-0191)」のように未来の利用と分かる文にし、Y で現在形へ改める。または X と Y を同じ push に載せることを指揮役が確かめる

### R1-4(中)(iii)を template へ運べないとする理由に、ルールセットで塞ぐ案の検討が記録されていない

- 所在: `src/content/docs/adr/0250-…md:26`(委ねる理由)、同 34〜46 行(採らない案の表)、`human-ai-boundary.md:922`(IMPL-1033 の note「準拠テンプレートに運ぶ仕組みが無い」)
- 根拠: 準拠テンプレートはルールセットの JSON を配っている(`.github/rulesets/*.json`)。GitHub のルールセットは、参照の名の include に対して強制 push の禁止(`non_fast_forward`)や取り込みの方式の制限を掛けられる。したがって「運ぶ仕組みが無い」は自明ではない。採らない理由は立ちうる(演習用ブランチの名は採用者が決め、ADR-0161 は流出を止める判定をブランチの名に依らせないと決めた。PR のブランチ側の書き換えは手元で行える)が、ADR にも裁定にも書かれていない。「採らないと決めたこと」と「検討していないこと」を読み手が区別できない
- 直しの案: ADR-0250 の採らない案に1行足す。「準拠テンプレートのルールセットで演習用ブランチの強制 push・squash の取り込みを禁じる: 演習用ブランチの名は採用者が決め、判定を名に依らせない(ADR-0161)。手元の書き換えは PR より前に起き、ルールセットに乗らない」。新しい判断を要するなら議長の裁定で決める

### R1-5(低)env-check の空の一覧の経路に足した文が試験で固定されていない

- 所在: `template/scripts/gate/adoption-trial.mjs:1634`、`template/scripts/gate/test-env-check.mjs`
- 根拠: 手元の写しで、空の一覧の経路から直接の push の文を外す mutation(M5)を入れても `test-env-check.mjs` は 66 件一致のまま通った。指示書 §3.1-3 は3経路への追加を求め、§3.1-4 の試験は2経路(確認済み・G-6 有効の不一致)だけを挙げたので、指示書どおりではある。G-6 無効で必須チェックが欠ける不一致の経路(365 行の `none`)の追加も試験されていない
- 直しの案: 既存の空の一覧の試験と `none` の試験の条件に `/直接の push/` を足す(試験の追加は1行ずつ)

### R1-6(低)ADR-0250 に、指示書に無い決定4 が足されている

- 所在: `src/content/docs/adr/0250-…md:30`
- 根拠: 指示書 §3.1-6 の決定は1〜3(B・C・D)。決定4 は裁定 E(PR の失敗の文)で、内容は裁定と一致し、採らない案(例外承認の経路を置く)も表にある。実装の記録の「指示書から外れた点」に挙がっていない
- 直しの案: 残してよい(E も変えにくい決定)。実装の記録の「指示書から外れた点」に1行足す

### R1-7(編集)ADR-0250 のステータスに内部の作業の語がある

- 所在: `src/content/docs/adr/0250-…md:10`「仮番号です(番号の付け直しは指揮役が行う)」
- 根拠: 公開の ADR に内部の役の名(指揮役)が出る。番号の付け直しの後に消す前提の文
- 直しの案: 番号を確定するときに文を外す。確定しないまま push するなら「番号は仮です」までにする

### R1-8(編集)EV-0345 の差し替え条件に、条件でない文が入っている

- 所在: `src/content/docs/phase5-implementation/seeded-error-safety.md:58`
- 根拠: 「準拠テンプレートは、この構成を env-check で表示し、止めません」は差し替え条件でなく、対象の説明である。台帳(`evidence-ledger.md:237`)は対象の欄を写すので内容は欠けないが、書式(`community/evidence-marking.md`)の欄の意味とずれる
- 直しの案: その文を **対象** の行の末尾へ移し、`npm run evidence:write` で台帳を再生成する

### R1-9(編集)adoption-trial.mjs の冒頭のコメントの1行が、env-check の説明(⑦)の前に浮いている

- 所在: `template/scripts/gate/adoption-trial.mjs:18`
- 根拠: 「7つの要件(I.11)を、このコマンドでは次のように扱う。」の直後、⑦ の行の前に挿入されたため、⑦ の説明に属さない括弧書きとして読める
- 直しの案: ⑦ の説明の3行(19〜21 行)の後へ移す

## 観点ごとの結果

1. 指示書 §3.1 の実装: 1(PR_MARKER_HINT・markerCommitsInRange・冒頭のコメント)は、`scan()` の置き換えを除き実装(R1-2)。2・3・4・5 は実装。6 は決定4 の追加(R1-6)。7・8・9 は実装。指示書に無い追加は決定4 だけ。「指示書から外れた点」の4つ(番号・節 17・試験の位置・B26 の一覧の確認)はいずれも妥当
2. ADR-0250 と裁定・既存の決定: B・C・D の決定と採らない案(include を読む・SHA で比べる・演習用ブランチ宛も止める・リリースブランチ・preflight・失敗/不一致にする・承認0名の pull_request・note だけ・0190 へ足す・(i)を機械で閉じる・PR の例外承認)は裁定と一致。食い違いは決定1 の表(R1-1)。ADR-0161 の表(0191「降りたら delivered・machine」)・採らない案「第2層を緩める」、ADR-0084 決定4(adopter に理由と求めることの表)とは矛盾しない。ADR-0139・ADR-0147 は本文と関係が薄いが矛盾はない。IMPL-0191 の note を絞った後も、(i)(iii)は IMPL-1033(`undelivered check=manual plan=adopter`)として `lint:impl` の「降りていない」の一覧と台帳(`implementation-ledger.md:86`・`1209`)に出続ける。消えて見えなくなった規定は無し
3. 表示と実態: README 節17・IMPL-0191 の note(「状態は変えない。全体が確認済みのときは保証の開示の項目4 にも写る」)は、`adoption-trial.mjs` と `org-assurance.mjs:1626-1627` の summary の実装と一致。ADR 決定3 も一致。食い違いはコード注記(R1-3)と実装の記録(R1-2)。試験が実装を外すと落ちるか: 下表
4. 所有者の方針: 反する追加は R1-1(ADR の表で手段と記録を求める)。機械の検査の追加は決定可能な条件(規則の有無・標識の行の有無)だけ。細かい定義の増加は無し(リリースブランチの定義を足さない判断を保つ)
5. 関係する試験: 下の「確かめたこと」

### mutation の結果(WSL・node 26.13.1。template の写しを WSL の /tmp に置いて変えた。作業ツリーは書き換えていない)

| # | 変えたこと | 結果 |
| --- | --- | --- |
| 基準 | なし | test-env-check 66 件一致 |
| M1 | `prGap` を常に null | 2 件不一致(確認済みの表示・G-6 有効の不一致)で落ちる |
| M2 | `prGap` を常に設定 | 1 件不一致(pull_request を含む応答)で落ちる |
| M3 | 確認済みの detail への追加を外す | 1 件不一致で落ちる |
| M4 | 不一致の detail への追加を外す | 1 件不一致で落ちる |
| M5 | 空の一覧の detail への追加を外す | **通る**(R1-5) |
| M6 | `prGap` で状態を不一致にする | 2 件不一致で落ちる |
| M7 | `markerCommitsInRange` の標識の絞りを外す | test-seeded-error-scan 2 件失敗で落ちる |
| M8 | 読めない範囲で `[]` を返す | 1 件失敗で落ちる |
| M9 | PR の文を「例外承認で受ける」へ | 1 件失敗で落ちる |

## 確かめたこと

- `node template/scripts/gate/test-seeded-error-scan.mjs`: すべて通った(T-8 の4件を含む。Windows)
- `node scripts/gate/test-env-check.mjs`(WSL・node 26.13.1、template の写し): 66 件一致
- `npm run lint:refs`: 終了コード 0
- `npm run lint:impl`: 終了コード 0。IMPL-1033 は `[adopter]` の降りていない規定として表示される
- `npm run impl:issues -- --issue 356`: IMPL-1011・0191・1003 の3件(X の時点の期待どおり)
- `org-assurance.mjs` の `readEnvCheck` の summary の作り方(1620〜1628 行)と `aggregate-evidence.mjs:4560` の写し
- ADR-0161 の表(64〜99 行)、ADR-0084 決定4(adopter の表の要求)、5.6.2 第2層の条文(`human-ai-boundary.md:911`)、フェーズ5 の手引き(`seeded-error-safety.md:50-53`・`101`)
- 台帳: EV-0345(`evidence-ledger.md:237`)、IMPL-0191・IMPL-1033(`implementation-ledger.md`)、登録簿 `src/data/impl-inventory.yaml` の IMPL-1033(232f6938)
- `markerCommitsInRange`・`PR_MARKER_HINT` を参照するのが seeded-error-scan.mjs とその試験だけであること
- 作業ツリーの template の先頭は 4bd0a8b(bbbc95f の後に #348・#441・#450 の X が1件)。その差分は本件のファイルに触れない(README・next.mjs・test-next-records.mjs・03-debt-ledger.md)

## 確かめていないこと

- `test-env-findings.mjs`・`test-adoption.mjs`(実装の記録は通過と書く。本巡では流していない)、回帰の全量(`npm run check`・template の全試験)
- textlint(実装の記録は通過と書く)
- 直接の push の経路の実機の挙動(EV-0345。#361 の範囲)
- ルールセットの `non_fast_forward` などで演習用ブランチの書き換えを塞げるかの実機の挙動(R1-4 は検討の記録の欠けだけを指摘する)
- 単位 Y の各項(範囲外)
