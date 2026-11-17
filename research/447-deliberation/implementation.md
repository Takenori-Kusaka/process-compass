# #447 実装の記録

## 変えたファイル

- human-ai-boundary.md: 5.4.5 条件5 の値の欄・登録の段の最後の箇条、5.4.7 の段落の置き換え、EV-0321・0322、IMPL-0978(target=d0-template)、IMPL-1022
- roles-responsibilities.md: 3.4.3 の箇条、3.13.2 の表の行
- deliverable-templates.md: D-0 の説明の節と IMPL-1023、IMPL-0777 の note、「人が書くもの」の行、様式の表、テンプレ11 の行、IMPL-1020・1021 の note
- adr/0179-ai-free-practice-record-and-overdue-disclosure.md(新設)、adr/0178(ステータスの節だけ)
- impl-targets.yaml(`ai-free-practice-record` を削除、d0-template・evidence-aggregation の description)、impl-inventory.yaml、implementation-marking.md、台帳3つ(再生成)

## 振った番号

IMPL-NEW1=IMPL-1022、IMPL-NEW2=IMPL-1023、EV-NEW1=EV-0321、EV-NEW2=EV-0322、ADR-0179。

## 裁定の文から外れた点(原文との食い違い・機械の要請による)

1. EV-0321 の根拠の水準欄は、書式の検査が `E1(間接)。` の完全一致を求めるため、「技能の維持への効果は E0」を欄から本文の末尾の文へ移した(実態の訂正: 1巡目の突合で、移したはずの文がマークに無いと分かった。直し 1回目でマークの本文の末尾に「技能の維持への効果の根拠は E0(なし)です。」を足し、記録と実態を合わせた)
2. IMPL-1023 の note の末尾へ「(単位: 欄)」を足した(check=presence は単位の注記が要る)
3. impl-inventory.yaml に、D-0 の新しい節「AI を用いない実施の記録を書く」の項目(IMPL-1023、issue=447)を足した(裁定 8 の#8 の「lint:impl の結果に従う」による)
4. textlint の指摘で文言を直した(「出荷を止めず、登録した変更種別も止めません」「機械は確かめず、判定者も確かめません」「実装した、あるいは調査したものなら」)。意味は変えない
5. ADR-0179 の「採らない案」の表は裁定 3 節を写したが、節番号への参照は外した。ADR-0057 のリンクは実在の slug(organizational-quality-assurance)にした
6. IMPL-0777 の note の追記は末尾(単位の注記の後ろ)に付けた

## 検査の結果

impl:write・lint:impl・test:impl(56件合格)・impl:issues(全て open)・evidence:write・lint:evidence(304件)・scope:write・lint:scope・lint:refs・lint:tone・lint:provisions・test:fields・textlint(対象6ファイル): すべて合格。npm run check と回帰の全量は流していない。graphify update は流していない。

## 未解決

- template/ は触っていない。IMPL-0978・1020・1021・1022・1023 は undelivered で表示される(#447 は open のまま)
- template-fields.yaml へは足していない(裁定どおり)
- 裁定 5 節の「範囲外の点」4件は既存の open Issue へのコメントが未了(本担当では行わない)
