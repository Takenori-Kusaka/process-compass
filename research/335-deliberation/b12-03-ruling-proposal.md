# #335 template の項目 1〜10 議長の裁定の案(束 B12。軽。2026-11-17)

前の段: `b12-01-drafter.md`(起案)、`b12-02-opponent.md`(反対)。本文側の裁定: `04-ruling.md`。

## 重さ

軽のまま。本文 3.5.5 と ADR-0078 決定2 の既存の義務を template へ降ろすだけで、新しい義務・ADR の原則の変更・安全の新設は無い。2委員が割れた点(CR-014 の核に例を入れるか)は議長が裁定する(反対の案を採る)。重へ上げる事由に当たらない。

## 項目ごとの裁定と指示

実装は template を先に直し、1つのコミット(または項目 A・B を同じコミットにした順の小さいコミット)にする。準拠テンプレートを触るので、束 B12 の他の Issue とは直列。コミットのたびに bundle へ退避する。

### A. 項目 1・2・3(採る。2 は反対の案で)— 同じコミット

1. `template/CLAUDE.md` L36 の「例」の列: `削除・本番デプロイ・…` → `データの削除・本番デプロイ・課金の書き込み・スキーマ変更・外部への発行`
2. `template/CLAUDE.md` L43 を次にする(括弧の例は**足さない**):
   `| 強制層(`.claude/**` 等)の縮小・遮断の解除・閾値の緩和 | `state:needs-platform`(取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除の場合は `state:needs-owner` も) |`
3. `template/scripts/gate/claude-md-resident.json` L151(CR-014)の `core` を手で次にする。id は変えない。`--write-resident` は使わない:
   `"強制層(.claude/ 等)の縮小・遮断の解除・閾値の緩和 / state:needs-platform(取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除の場合は state:needs-owner も)"`
4. CR-010(L131)・CR-013(L146)は変えない
5. 確かめ: `node scripts/gate/check-process-rules.mjs`、`node scripts/gate/test-claude-md-resident.mjs`

### B. 採用者の取り込みの案内(反対 O-1。採る)

- `template/README.md` の「既に初期化済みの既存案件への追随」の節の末尾(いま L682 の「### 11. process-compass #359…」の後)へ、`### 12. process-compass #335 の更新を取り込むとき` を足す。番号は実装の時点の末尾の次を振る(他の Issue と衝突させない)
- 書く内容(#319 の節 L631〜 の型に倣う):
  - **常駐の規則 CR-014 の核が変わったため、旧い行を持つ `CLAUDE.md` は、取り込むと常駐の規則の照合で失敗する**。統制を強める向きの変更であり、照合を緩めて通さない
  - 採用者が直す所: 「人へ戻す3つの場合」の戻す先の表の、強制層の縮小の行のラベルの列の括弧を「取り消せない操作に当たる場合と、ガード・検証ゲート・重要テストの削除の場合は `state:needs-owner` も」にする。(c) の例の列の「削除」を「データの削除」にする(照合には掛からない)
  - `.claude/skills/pit/reference/handoff.md` は取り込みで書き換わる。独自に改めている採用者は同じ箇所を直す
  - `CLAUDE.md` の変更は AI維持管理者の承認を経る(`state:needs-platform`)
  - 併記の基準そのものは変わっていない(本標準 3.5.5・ADR-0078 決定2)。旧い行は削除の場合の併記を落としていた

### C. 項目 4・7・8 と同種(handoff.md。採る。4 は文言を直して)

`template/.claude/skills/pit/reference/handoff.md`:

1. L13(項目 7): `削除・本番デプロイ・…は例であり` → `データの削除・本番デプロイ・…は例であり`
2. L15: 変えない(既に併記を運ぶ)。例を足す任意の案は採らない
3. L51 の直後へ1行足す(項目 4。反対 O-3 で文言を本文に揃える):
   `| 配備の環境の保護規則の削除・ルールセットへの迂回の主体の追加(遮断の解除の例。統制の弱化。配備の起動が取り消せない操作に当たるかは上の (c)(標準 第5章 5.5.1)の定義により、この行は配備の起動を対象としない) | `state:needs-platform` |`
4. L53 の行の第1列の括弧へ、判断の基準を足す(反対 O-4):
   `ガード・検証ゲート・重要テストの削除(統制の弱化。取り消せない操作の定義によらず併記する。当たるかは列挙で決めず、削除によって止めていたものを止めなくなるかで判断する)`
5. L56(項目 8): `[第5章 4.7](…/phase5-implementation/label-mailbox/)` → `[第3章 3.5.5](https://takenori-kusaka.github.io/process-compass/phase4-process-design/roles-responsibilities/)`。`<!-- 根拠: IMPL-0015 -->` は保つ
6. L10 末尾: `（同 4.3.1）` → `（同 3.5.5 の状態の遷移）`
7. L70: `[第5章 4.5.1](…/label-mailbox/)` → `[第3章 3.5.3](https://takenori-kusaka.github.io/process-compass/phase4-process-design/roles-responsibilities/)`

### D. 項目 9・10 と同種(編集の指摘。採る)

- `template/scripts/init/generate-profile.mjs`
  - L4244 の注釈: `(4.3 の付与者・4.7.3)` → `(第3章 3.5.5「ラベルの語彙」の付ける席)`
  - L4279 の注釈: `第7章 7.6 / 第5章 4.5.2 / ADR-0095` → `第7章 7.6 / ADR-0095`(4.5.2 は実在しない。反対 O-5)
  - L4468 の生成する文: `[第5章 4.5.1](…/label-mailbox/)` → handoff.md L70 と同じ `[第3章 3.5.3](…/roles-responsibilities/)`(反対 O-5)。生成物を固定する試験が無いことを `grep '4.5.1' scripts` で確かめる
- `template/scripts/gate/test-roster-rules.mjs`
  - L317: `(4.3 の付与者・4.7.3)` → `(第3章 3.5.5「ラベルの語彙」の付ける席)`
  - L319: `4.3 の付与者` → `第3章 3.5.5「ラベルの語彙」の付ける席`
  - L320: `4.3.1 の差し戻しの2行` → `第3章 3.5.5「ラベルの語彙」の qm-blocked の行`
- 確かめ: `node scripts/gate/test-roster-rules.mjs`

### E. 項目 5・6(変えない)

- 5: ESCALATION(generate-profile.mjs L4282〜)に統制の弱化の行を足さない。7.6 の表の写しであり、足すと本文と食い違う。統制の弱化の経路は CLAUDE.md の戻す先の表と handoff.md の表が運ぶ
- 6: boundaries.md に「削除」の語は無い(2026-11-17 に `grep` で0件)。直さない

### F. 本流側(template の main へ入り、submodule の参照を進めた後に、同じ PR で)

`src/content/docs/phase4-process-design/roles-responsibilities.md` L899 の IMPL-0984:

- `state=undelivered check=manual plan=scheduled issue=335 review=2027-05` → `state=delivered check=presence`(`plan=`・`issue=`・`review=` を外す。test= は presence に要らない。IMPL-0014・0015 と同じ型)
- note を次の趣旨に書き換える(`単位: 行` を残す。検査が求める):
  「強制層の変更は state:needs-platform、取り消せない操作に当たる場合とガード・検証のゲート・重要なテストを削除する場合は state:needs-owner も併記する(3.5.5 の語彙の節と本節。単位: 行)。template の CLAUDE.md の戻す先の表の行と claude-md-resident.json の CR-014 が運び、check-process-rules が CR-014 の核を行に照合する。pit の handoff.md も運ぶ。ガード・検証のゲート・重要なテストに当たるかを、列挙でなく削除によって止めていたものを止めなくなるかで判断することは handoff.md の行が運び、機械では閉じない(人が確かめる。EV-0286)」
- EV-0286 の caution とその見直し日は変えない
- `npm run impl:write` で台帳を再生成し、`npm run check` を push の前に1回流す
- 参照を進める前は undelivered のまま。Issue は IMPL-0984 が delivered になった後に閉じる(他に `issue=335` のマークは無い)

## 採らない案

| 案 | 理由 |
| --- | --- |
| CLAUDE.md L43 と CR-014 の核へ配備の統制の例を括弧で入れる(起案の項目 2) | 照合が例の文言まで採用者へ課す。例は閉じた列挙ではない(3.5.5)。常駐させるのは併記の規範だけで足り、例は CLAUDE.md が詳細と例の所在とする handoff.md が運ぶ。Issue の項目 2 の「配備の統制を足す」は項目 4 で満たす |
| handoff.md の「配備の起動そのものは取り消せない操作の側」(起案の項目 4 の文言) | 本文 3.5.5 は「5.5.1 の定義による。この表の例は配備の起動を対象としない」とだけ書く。常に当たると読める言い換えは 5.5.1 より広い |
| handoff.md L15 へも例を足す(起案の任意の案) | L53 の表と重なる。同じ例の正本を2か所に作らない |
| ESCALATION に統制の弱化の行を足す | 7.6 の表を超える |
| CLAUDE.md の戻す先の表へ統制の弱化の独立の行を足す | 同じ行に既にある。CR が2つに割れる |
| 統制の弱化の判定表を handoff.md に置く | 手順は手引きの範囲で、1文の基準(C-4)で足りる。表は列挙の代用になり ADR-0038 決定1 に反する |
| 判断の基準(削除によって止めていたものを止めなくなるか)を機械の検査にする | 自由な文の意味であり決定可能でない。manual の部分として note と EV-0286 で開示する |
| README の取り込みの案内を省き、コミットの本文だけに書く | 採用者はコミットの本文を読まず、取り込み後の照合の失敗だけを見る。表示と実態が食い違う |

## 所有者へ上げる点

無し。
