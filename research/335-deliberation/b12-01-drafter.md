# #335 template の項目 1〜10 の実装案(束 B12 起案委員。軽。2026-11-17)

前提: 本文は main に入っている(`roles-responsibilities.md` L826 以降「ラベルの語彙」)。現行の本文は、(1) 表の下の箇条に「`state:needs-owner` の範囲」「強制層の変更の併記(取り消せない操作の定義によらない)」、(2) 「統制の弱化」の節に、遮断の解除の例として「配備の環境の保護規則を削除する。ルールセットへ迂回の主体を足す」を持ち、(3) 「取り消せない操作 = 5.5.1・`needs-owner` だけ、統制の弱化 = 3.5.5・`needs-platform`、削除の場合に ADR-0078 決定2 の併記」を明記している。template はこれに追随する。行番号は 2026-11-17 の template/ で確認した。

## 機械の検査に掛かるか(先に結論)

| 検査 | 掛かる範囲 | 結論 |
| --- | --- | --- |
| `check-process-rules`(`claude-md-resident.mjs` の `missingResident`) | `claude-md-resident.json` の各 `core` が、CLAUDE.md の同じ節の行(表は「`#`・止める仕組み・例」の列を除いた列を ` / ` でつないだ文)に**部分文字列として**含まれること。`normalizeRule` が `**`・バッククォート・リンク・HTML コメントを除き、NFKC で正規化する | 項目2 の行を変えると **CR-014 が落ちる**。項目3 を同時に直すこと。項目1 の「例」の列は NON_CORE なので json に影響しない(CR-010 は「例」を持たない) |
| `--write-resident` | 追加だけ。既存 `core` は書き換えない | 項目3 は**手で CR-014 の `core` を直す**(`--write-resident` を使うと旧 CR-014 を残したまま新しい CR を足し、旧が落ちる)。id は変えない |
| `test-claude-md-resident.mjs` | 変異(行の削除など)の試験。`削除`・`needs-platform` の文言を固定する箇所なし(grep 済み) | 影響なし。実行して確かめる |
| `test-roster-rules.mjs` | `MAILBOX` の値を検査。項目10 は試験名だけ | 名前の変更は通る。名前を固定する他の参照なし(要 grep の再確認は実装の担当) |
| `npm run check` の `test:template`(`check-template-drift.mjs`) | tailoring-engine・tailoring-kb・様式(`templates/*.md`)の複製。CLAUDE.md・handoff.md・generate-profile.mjs は対象外 | 影響なし |
| `lint:refs` | 標準側の節番号・ADR の実在。template の本文は対象外 | 影響なし |
| 標準側の台帳 | IMPL-0984(`target=claude-md-resident state=undelivered issue=335`) | 末尾の「実装マーク」を参照 |

## 項目ごとの案

### 項目 1(意味を変える。軽微) `template/CLAUDE.md` L36(c) の「例」の列

- 現行: `| 削除・本番デプロイ・課金の書き込み・スキーマ変更・外部への発行 |`
- 差し替え: `| データの削除・本番デプロイ・課金の書き込み・スキーマ変更・外部への発行 |`
- 理由: 「削除」を単独で例示すると、ガード・検証ゲート・重要テストの削除(統制の弱化。3.5.5)と混ざる。(c) は取り消せない操作であり、これを指す語は「データの削除」である。
- 検査: 「例」の列は NON_CORE。json に影響しない。
- 意味を変えるか: 例示の語を絞るだけ(列挙は例示のまま)。新しい義務なし。編集の指摘に近いが、読み手の判断の範囲が変わり得るため「意味を変える側」に数える(議長が決める)。

### 項目 2(意味を変える) `template/CLAUDE.md` L43

- 現行(表「戻す先 | ラベル」の行): `| 強制層(`.claude/**` 等)の縮小・遮断の解除・閾値の緩和 | `state:needs-platform`(取り消せない操作なら `state:needs-owner` も) |`
- 差し替え:
  `| 強制層(`.claude/**` 等)の縮小・遮断の解除・閾値の緩和(統制の弱化。配備の環境の保護規則の削除、ルールセットへの迂回の主体の追加も遮断の解除に当たる) | `state:needs-platform`(取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除の場合は `state:needs-owner` も) |`
- 根拠: 3.5.5「統制の弱化」の表の例と、箇条「強制層の縮小は…取り消せない操作に当たる場合と、…削除する場合は、`state:needs-owner` を併記する」。ADR-0078 決定2(併記は取り消せない操作の定義によらない)。
- 配備の起動そのものは足さない(3.5.5 は「この表の例は配備の起動を対象としない。配備の起動が取り消せない操作に当たるかは 5.5.1 による」と書く。CLAUDE.md の行で言い換えて広げない)。
- 行が長くなるが、CLAUDE.md の常駐の規則の核なので、括弧内を省いて核を `…の緩和 / state:needs-platform(…)` に保つ案(下記 CR-014)に合わせる。括弧の説明は「規則の索引」の節へ回さず、そのまま持つ。

### 項目 3(意味を変える。項目 1・2 と同時) `template/scripts/gate/claude-md-resident.json`

- L131(CR-010 の `core`)と L146(CR-013): **変えない**。CR-010 は (c) の定義を写す第1列で、「例」の列を含まない。CR-013 は「取り消せない操作・事業決裁 / state:needs-owner」で、本文と合う。
- L151(CR-014)の `core` を、項目 2 の行の核(「例」ではないので、第1列と第2列を ` / ` でつないだ文)に直す。`normalizeRule` が `**`・バッククォートを除くので、json では除いた形で書く:
  `"core": "強制層(.claude/ 等)の縮小・遮断の解除・閾値の緩和(統制の弱化。配備の環境の保護規則の削除、ルールセットへの迂回の主体の追加も遮断の解除に当たる) / state:needs-platform(取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除の場合は state:needs-owner も)"`
- 注意: json の `note` は「規則を除くのは強制層の縮小」と書く。CR-014 の `core` を強める書き換えは除去ではないので omit へ移さない。ただし規則の一覧の変更は強制層の変更(`state:needs-platform`)に当たるため、template のコミットの本文に「CR-014 の書き換え。弱化でなく強化」と書く。
- 検証: `node scripts/gate/check-process-rules.mjs` が通ること(CLAUDE.md を直した後に json を直さないと、CR-014 が欠けると出る)。

### 項目 4(意味を変える。1行足す) `template/.claude/skills/pit/reference/handoff.md` L15・L53

- L15 は、すでに「取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除(統制の弱化)の場合は `state:needs-owner` も併記」「統制の弱化の併記は、取り消せない操作の定義によらない」を運ぶ。**変えない**。ただし冒頭「遮断の解除・閾値の緩和・強制層の縮小」に例を足したいなら、項目 2 と同じ括弧の1節を足す(任意)。
- L53 の次の行(「弱化の範囲そのものの適否」の前)へ、表の行を足す:
  `| 配備の環境の保護規則の削除・ルールセットへの迂回の主体の追加(遮断の解除。統制の弱化。配備の起動そのものは取り消せない操作の側で、5.5.1 の定義による) | `state:needs-platform` |`
  あるいは、L51 の行「強制層(`.claude/**` 等)の縮小」の文言を保ち、新しい行を L51 の直後に置く(読む順が「強制層の縮小 → 配備の統制 → 取り消せない操作 → 削除の併記」になる)。後者を推す。
- 注意: 「配備の起動は取り消せない操作の側」は 3.5.5 の最後の箇条の言い換えである。5.5.1 より広げない。「5.5.1 の定義による」だけを書き、「配備の起動は常に当たる」とは書かない。
- 検査: 機械の検査なし。実装マーク IMPL-0015 は handoff.md の対応する行を指す(`delivered`、変わらない)。

### 項目 5(変えない。降ろさない理由を書く) `template/scripts/init/generate-profile.mjs` L4286(ESCALATION)

- 変えない。ESCALATION は第7章 7.6 の表(段階1〜3 と取り消せない操作)の写しで、統制の弱化の行は 7.6 に無い。足すと本文と食い違う。
- 課さないと決めたことの明記: 統制の弱化の経路は handoff.md の表(L51〜54)と CLAUDE.md の戻す先の表が運ぶ。ESCALATION に統制の弱化の行を足さないのは、7.6 の表を超えないため(2026-11-15 の裁定)。
- 実装の担当が足す記録: 不要(議長の裁定とこの案で足りる)。

### 項目 6(直さない) `template/.claude/skills/pit/reference/boundaries.md` L24

- 「削除」の語は無い(2026-11-17 に再確認。`grep 削除` が当該ファイルで 0 件。L20〜L26 は「人へ戻すのは次の3つ」の本文で (c) の定義だけを持ち、例示の列挙を持たない)。
- 直さない。

### 項目 7(意味を変える。語の置換) 起案が足した「削除」

- `template/` で「削除・本番…」の形の列挙は 2 か所だけ(`grep` 済み): `template/CLAUDE.md` L36 と `template/.claude/skills/pit/reference/handoff.md` L13(a)(b)(c) の (c)。
- handoff.md L13 の現行: 「…削除・本番デプロイ・課金の書き込み・スキーマ変更・外部への発行は例であり、これに限らない。」 → 「…データの削除・本番デプロイ・課金の書き込み・スキーマ変更・外部への発行は例であり、これに限らない。」
- L36 は項目 1。
- 次の「削除」は取り消せない操作の例示ではないので**置換しない**: CLAUDE.md L132(`.claude/**` 等の追加・統合・削除は AI維持管理者が承認。統制の弱化ではなく指示資産の変更の権限)、claude-md-resident.json L346 の同じ文、handoff.md L15・L53(ガード・検証ゲート・重要テストの削除。統制の弱化として正しい)、boundaries.md(語なし)。

### 項目 8(編集の指摘。意味を変えない) `handoff.md` L56 のリンク

- 現行: `([第5章 4.7](https://takenori-kusaka.github.io/process-compass/phase5-implementation/label-mailbox/))`
- 差し替え: `([第3章 3.5.5](https://takenori-kusaka.github.io/process-compass/phase4-process-design/roles-responsibilities/))`
- 同じ行の `<!-- 根拠: IMPL-0015 -->` は保つ。
- 追加で見つけた同種(議長が項目に数えるか決める): handoff.md L10 末尾の「同 4.3.1」(→「同 3.5.5 の状態の遷移」)、L70 の「第5章 4.5.1」(label-mailbox へのリンク。受信箱の確認を自分のロールに限ることの正本は第3章 3.5.3 なので、「第3章 3.5.3」と `roles-responsibilities` へ直す)。いずれも編集の指摘。

### 項目 9(編集の指摘) `generate-profile.mjs` L4244 の注釈

- 現行: `// needs-platform は、レビューや記録の突合で強制層の変更の要否・統制の弱化に気付いた席が付ける(4.3 の付与者・4.7.3)`
- 差し替え: `…気付いた席が付ける(第3章 3.5.5「ラベルの語彙」の付ける席)`

### 項目 10(編集の指摘) `test-roster-rules.mjs` L317 の試験名

- 現行: `'needs-platform は独立レビュア・出荷判定者も付けられる(4.3 の付与者・4.7.3)'`
- 差し替え: `'needs-platform は独立レビュア・出荷判定者も付けられる(第3章 3.5.5「ラベルの語彙」の付ける席)'`
- 同じ古い参照が L319(`4.3 の付与者`)、L320(`4.3.1 の差し戻しの2行`)にもある。L319 → `第3章 3.5.5「ラベルの語彙」の付ける席`、L320 → `第3章 3.5.5「ラベルの語彙」の qm-blocked の行`。

## 区分

| 区分 | 項目 |
| --- | --- |
| 意味を変える(本文 3.5.5 に追随。新しい義務ではなく、既存の義務の template への降ろし) | 1、2、3(同時)、4、7 |
| 編集の指摘(意味を変えない) | 8、9、10(と同種の L10・L70・L319・L320) |
| 変えない(理由を残す) | 5、6 |

## 実装の順序

1. CLAUDE.md L36・L43(項目 1・2)と json CR-014(項目 3)を**同じコミット**で直す。
2. handoff.md L13(項目 7)・L53 の前後(項目 4)・L56(項目 8)。
3. generate-profile.mjs L4244(項目 9)・test-roster-rules.mjs L317(項目 10)。
4. template 側で `node scripts/gate/check-process-rules.mjs` と `node scripts/gate/test-claude-md-resident.mjs`、`node scripts/gate/test-roster-rules.mjs`。本流側で `npm run check`(push の前に1回)。template のコミットは bundle へ退避し、本流の submodule の参照は template の main へ入った後に進める。

## 実装マーク IMPL-0984 の扱い

- 場所: `src/content/docs/phase4-process-design/roles-responsibilities.md` L899。現行 `state=undelivered check=manual plan=scheduled issue=335 review=2027-05`。note は「template の CLAUDE.md の該当行と claude-md-resident.json は取り消せない操作の場合だけを書き、削除の場合の併記を落としている」。
- 項目 2・3 を template の main へ入れ、本流が参照を進めた後に、**同じ PR で**:
  `state=delivered check=presence`(`target=claude-md-resident` は presence を持つ。IMPL-0014・IMPL-0015 と同じ)に変え、`plan=`・`issue=`・`review=` を外す。note を「CLAUDE.md の戻す先の表の行と claude-md-resident.json の CR-014 が、強制層の縮小と取り消せない操作の場合・ガード・検証ゲート・重要テストの削除の場合の `state:needs-owner` の併記を運ぶ。handoff.md も運ぶ」に書き換え、「機械が確かめていない」の文を、「CR-014 の `core` が CLAUDE.md の行に含まれることを `check-process-rules` が確かめる。ガード・検証ゲート・重要テストに当たるかの判断は機械で閉じない(人が確かめる)」に直す。
- 参照を進める前は `undelivered` のまま(台帳に出し続ける)。`npm run impl:write` で台帳を再生成する。EV-0286 の見直し日(2027-05)は変えない。
- 範囲: check=presence は併記の有無だけを確かめる。「ガード・検証ゲート・重要テストに当たるか」は、EV-0286 のとおり判断であり、機械で閉じない。そのため根拠水準のマーク(EV-0286)は残す。

## 採らない案

| 案 | 理由 |
| --- | --- |
| CLAUDE.md の「戻す先」の表へ「統制の弱化」の独立の行を足す | 同じ行(`state:needs-platform`)に既にあり、行を分けると CR の核が2つに割れて照合の対象が増える。3.5.5 も列挙を分けていない |
| ESCALATION(項目 5)に統制の弱化の行を足す | 7.6 の表に無い行を足すと本文と食い違う |
| 配備の起動を CLAUDE.md の (c) の例に明記する | 5.5.1 の定義(上流の編集は当たらず、直接起動する構成では当たる)より広げる言い方になる。定義に委ねる |
| handoff.md に統制の弱化の判定表を詳しく書く | 条文は結果と証跡まで、手順は手引き、が方針。3.5.5 の「削除によって止めていたものを止めなくなるか」で足りる |
