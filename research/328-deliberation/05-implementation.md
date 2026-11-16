# #328・#347・#351 実装記録(2026-11-17)

裁定: 各 04-ruling.md。template/ には書き込まず、`npm run template:kb` は流していない。`src/data/tailoring/` は未変更(#351 H-1 は template の段)。

## 変えた所在
- ADR-0142 新設: `src/content/docs/adr/0142-resolve-name-collisions-by-definition-not-rename.md`(EV-0287)。ADR-0082 のステータスの後に案内を1段落
- #328 C-3/C-4/C-14/C-10: `roles-responsibilities.md`(3.5.1 の箇条、3.5.5 の語彙の表・遷移の表・弱化の箇条、EV-0286、IMPL-0331 の note)。`phase5-implementation/label-mailbox.md:106`(他の needs-platform の記述は 107・108・128 で範囲を限る書き方は無く、変更なし)
- C-6: `src/data/processes/integrated.yaml`。C-17: `ears-guide.md` の題、`src/data/impl-inventory.yaml` の key と note
- C-15/16: `overview.md` 1.4 に「記録の欠落」「不変条件」「RACI」「担保水準」の行、AI自律レベルの行の書き換え、EV-0288。`src/data/provision-forms.yaml` のコメント
- #347: 上記 1.4 の2行と EV-0288
- #351 H-2: `tailoring-guide.md` に説明の段落、IMPL-0300 の note。H-4: `deliverable-templates.md`(箇条・表8 の欄名・コメント)。H-5: `tailoring-guide.md` の4か所と IMPL-0988(undelivered)、`impl-inventory.yaml` の登録に IMPL-0988
- 台帳: evidence-ledger・implementation-ledger を再生成(scope-ledger は変更なし)

## 番号
EV-0286(3.5.5)・EV-0287(ADR-0142)・EV-0288(1.4)。IMPL-0988(H-5)。

## 流した検査(すべて exit 0)
lint:text・lint:tone・lint:evidence・lint:impl・lint:scope・lint:refs・lint:provisions・lint:dekimasu・test:impl・test:fields・test:criteria・lint:registry・lint:stage-table・test:plan-issues・test:template(複製一致)・test:engine。
`test:regress` は exit 1(`unknown flag: --regress-probe`)。template 側の旗の欠落で、本束の変更と無関係とみている(全量は push 前に別途)。`npm run check` の全量と build は未実施。

## 実装で見つけた点(直していない。突合へ)
1. `impl-inventory-baseline.yaml` は凍結(要約を定数で検査)のため、ears-guide の旧キーはそのまま残した(節が消えた鍵は無視される)。裁定の「baseline:127 を直す」は実施できない
2. 1.4 に足した「不変条件」は `safety-verification.md:141` の「不変条件」(検証対象の性質)と語が重なる。定義の食い違いの可能性
3. 外殻・内殻は裁定どおり行を足していない
4. 3.5.2 に外部の確認者を席に置く構成を否定する文は見つからなかった(確認は 3.5.2 本文の通読ではなく grep)
5. 表8 の欄名「決定した者(理由)」でも test:fields は通った
6. 裁定の行番号は数行ずれていた。文の一致で置換した
