# #326 実装の記録(本体の項目 1・2・3・4・5・14・15 と重の項目 12、2026-11-15)

前の段: `04-ruling.md`。本体側(scripts/・src/・research/)だけを変えた。template/ と pit-crew/ は書き換えていない。本体のスクリプトに template 側の複製は無い(`find template -name 'check-scope*'` ほか、いずれも該当なし)。`template:kb` の対象の `integrated.yaml` は書き戻しの差分が 0 のため変わらない。

使った番号: **EV-0280**(根拠水準マーク、項目12)。IMPL の新設は無し(使った番号なし。現在の最大は IMPL-0983)。ADR は新設していない。push の前に議長が付け直す。

## 項目 1 `scope-exempt` の残骸と reason

- 再現: 登録に存在しない見出しと reason が `-` の登録を足して `check-scope.mjs` を実行すると、直す前は通る(`EXEMPT` は鍵の集合にするだけで reason も使用も見ない)。直した後は 3 件落ちる(残骸・reason なし・重複)
- 直し: `scripts/lib/scope-exempt.mjs` を新設(`exemptProblems`)。`check-scope.mjs` が免除として働いた鍵を記録し、働かなかった登録・reason の非空(`isReason`)・page と heading の欠け・重複を落とす。reason の意味は検査しない
- 確かめ: 現行の 18 件はすべて使われ、`npm run lint:scope` は通る(既存の違反 0 件)。試験 `scripts/test-scope-exempt.mjs`(6 件)。`lint:scope` に結線
- 所在: `scripts/check-scope.mjs`、`scripts/lib/scope-exempt.mjs`、`scripts/test-scope-exempt.mjs`、`package.json`

## 項目 2 `provision-ok` の早期 return

- 再現: 規定の文書の 1 行に「確認してください」(依頼の形)と「省略可」(廃した升の語)を置くと 2 件落ちる。同じ行に `<!-- provision-ok: 理由 -->` を 1 つ足すと 0 件になる
- 裁定のとおり、種別つきの印(B)も件数の登録簿(B2)も採らない。検査のヘッダの開示を読み直すと、「行に印がある行(2〜5・7〜12 の検査)」とだけ書かれ、同じ行の別の種別の違反も飛ぶことが読めなかったため、文を直した
- 直し: `scripts/check-provisions.mjs` のヘッダ(除外の節)に、印は検査の種別を区別せず、同じ行の別の違反も通ること、1 行に複数の違反を置かないこと、種別つきの印と登録簿を採らなかった理由(ADR-0118 決定3)を足した。検査の動作は変えない
- 確かめ: `lint:provisions`・`test:provisions` は通る

## 項目 3 `check-gate-criteria --write`

- 実装の前の確認(通った): 新しい読み(YAML パーサ)で、現行の 45 件が第4章の基準と文字列で完全に一致した。書き戻しは差分 0(`git status` で `src/data` に変更なし)
- 再現(直す前): 基準を「投資が [事業基準] を満たす」「かつ: 確認 #1」に変えて旧い置換を行うと、YAML パーサが「Missing , or : between flow sequence items」で落ちる
- 直し: `scripts/lib/gate-criteria-yaml.mjs` を新設。読みを `yaml` パッケージへ替え、書き戻しは素のまま往復できる基準は素のまま(現行の書式を変えない)、記号を含むものは二重引用符で書く。置換は criteria の行全体を対象にし、`$&` などの置換記号も関数で避ける。検査は件数に加え、文の一致も見る
- 確かめ: `npm run test:criteria` は通る(`scripts/test-gate-criteria-yaml.mjs` 5 件。`[ ] , : #`・引用符・バックスラッシュ・先頭の記号・冪等)。`test:criteria` に結線
- 所在: `scripts/check-gate-criteria.mjs`、`scripts/lib/gate-criteria-yaml.mjs`、`scripts/test-gate-criteria-yaml.mjs`

## 項目 4 `lint:refs` の番号と見出しの対応(D2)

- 再現: 「[第3章 3.9](…)「決裁権限マトリクス」」(3.9 は「会議体の運用規律」)は、直す前は exit 0、直した後は exit 1
- 直し: 検査9 を狭めた。リンクのラベルに節番号が 1 つだけあり名が添えられているとき、その番号で始まる見出しの節(下の小見出しを含む)に名が含まれるかを見る。語を添えない参照は機械で閉じないと、ヘッダの「検査しない」に書いた。`SOURCES` は広げていない
- 実行での発見: 1 回目は節の中の小見出しを数えず、`adoption-guide.md:481`(1.10.1 の下の番号なしの小見出しの名)を誤って落とした。節の部分木も数える形に直し、試験に足した(誤検出を 1 件出して直した記録)
- 確かめ: 対象 4 ページで 1 件(番号と名の対応)を検査して通る。試験 `scripts/test-section-refs.mjs`(6 件)。`lint:refs` に結線
- 所在: `scripts/check-section-refs.mjs`、`scripts/test-section-refs.mjs`

## 項目 5 ADR の順方向の参照

- 再現: 直す前の検査は無い。新しい検査を先に走らせると、ADR-0017 → ADR-0020 の 1 件だけが落ちた(調査のとおり)
- 直し: `scripts/lib/adr-links.mjs` と `scripts/check-adr-links.mjs` を新設。状態の行の「置き換え(→ ADR-N …)」(複数・リンク形式・入れ子の括弧を含む)から後継を引き、後継のステータスの節に旧 ADR の番号があるかを見る。ADR-0020 のステータスの節へ、ADR-0017 の決定1・決定2 を置き換える旨を表で足した(運用ルール4・5。本文は変えていない)。逆向きを検出しない旨はヘッダに開示した
- 確かめ: 136 件を検査して通る。試験 `scripts/test-adr-links.mjs`(7 件)。`lint:refs` に結線
- 所在: `scripts/check-adr-links.mjs`、`scripts/lib/adr-links.mjs`、`scripts/test-adr-links.mjs`、`src/content/docs/adr/0020-process-model-belongs-to-phase4.md`

## 項目 14 1.10.2 と H.8 の語の存在(N2)

- 確認: 両節の表の文を実行で比べ、両方に出る語を導いた。10 語(適用の表明、適合の主張、逸脱を伴う適合の主張、未達のゲートの件数、記録の欠落の件数、逸脱と列挙に無い離脱、例外承認の件数、未回収、独立した人の確認を経ない出荷、作業中の版)。**両節で通る**。「従う本標準の版」(H.8 の表に無い)・「期限超過」(1.10.2 の表では「回収の期限を過ぎた」)は片側にしか無いため入れていない。これは本文の食い違いというより言い換えで、文の型の一致を機械が保証しない例になる
- 直し: `scripts/lib/claim-terms.mjs`・`scripts/check-claim-terms.mjs` を新設。名前は「語の存在の検査」で、文の型の一致は保証しないとヘッダに書いた。ADR-0134 は更新していない
- 確かめ: 試験 `scripts/test-claim-terms.mjs`(5 件。片側の語を消すと落ちる)。`lint:refs` に結線

## 項目 15 IMPL-0145・IMPL-0497

- 裁定のとおり state・plan・review= は動かしていない。note の事実を、template の実物で確かめた
  - IMPL-0497 の note と `template/templates/defect-ledger.md:33` の列(起点・対象…記録した者)は一致する。IMPL-0145 の「一覧を出す手段が無い」は、`template/scripts` に CI の実行の一覧を出す記述が無いことと合う(`aggregate-evidence.mjs` の「棚卸し」は判定記録の節の検査で、失敗の履歴の一覧ではない)
  - 事実の誤りは見つからなかったため、マークは変えていない
- 項目 11 の前提(起点の識別子の欄の実在): 欠陥の台帳の様式に「起点」の列が実在する(上記)。様式の変更(採用者への新しい義務)にはならない見込み。Issue のコメントに書く

## 項目 12 「コア機能」の定義の二重(重。開示だけ)

- 既存の開示の確認: `tailoring-guide.md` を `コア機能の判定`・`コア機能の定義`・`2つの定義`・`機械の判定材料` で検索し、2 つの定義が食い違うことの開示は無かった(ADR-0057 の却下した案の表に、`corePaths` を設けない理由があるのみ)。足した
- 足したもの: 10名以上の規則の節に、**どちらが正かを示さない注記**と根拠水準マーク **EV-0280**(見直し 2027-05、E0)。`npm run evidence:write` で台帳を再生成した
- 項目 13 は触れていない

## 台帳と検査

- 再生成: `evidence:write`・`impl:write`・`scope:write`(IMPL の変更なし。EV の台帳のみ差分)
- 通った: `lint:refs`(新規 3 検査を含む)、`lint:provisions`、`test:provisions`、`lint:evidence`、`lint:impl`、`lint:scope`、`test:criteria`、`lint:ci`、`test:ci-wiring`、`test:impl`、`test:template`、textlint(ADR-0020・tailoring-guide)
- 回帰の全量と `npm run check` の全体は流していない(指示による)
- 結線: 新しい検査はすべて `package.json` の既存の npm script(`lint:refs`・`lint:scope`・`test:criteria`)に連ねたため、`check` に入る。`check-ci-wiring.mjs` は個々の検査の結線を見ないので、結線は `package.json` の目視で確かめた

## 残り

- 項目 6〜11 は template の束。項目 12 は重のまま(本束は開示のみ)、13 は触れていない
- 引き継ぎ: 項目 4 の誤検出の経緯のとおり、番号つき見出しの下の小見出し形の参照が現行の docs に 1 件ある(通る)
