# 束 B18 実装 A(単位0〜3)突合1巡目の所見への対応

作成 2026-11-18。`review-A-1.md` の所見を、末尾の議長の裁定どおりに直した記録。

## 所見ごとの対応

| 所見 | 対応 |
| --- | --- |
| 高-1 | `decisionG3Reach` を書き直した。(i) 基底の docs/gates/ と記録用ブランチの records/gates/(判定者の記名が名簿の人へ対応づくものに限る)。(ii) 宣言行 `G-3: 通過` を1行目に持つ名簿の人のレビュー(状態は問わない。この PR は pr.reviews、基底へ入っている判断記録は写し records/reviews/pr-N.json を `readRecordsBranch` で読む)。宣言行の無い承認は数えない |
| 中-4 | ホスティングの記録や記録用ブランチを読めないときは ok: null とし、注意に出す(失敗にしない)。PR を経ずに入り様式も無いときは ng |
| 高-2 | `CODEOWNERS_PLACES` を順に探し、最初に見つけた1つを検査。3か所に無いときだけ失敗。失敗の文に検査した所在を出す |
| 中-1 | README・process-init SKILL・verify-gate-contract・preflight の文言を「名簿の人の個人のログイン名(チームは個人と併記)」へ。README の「失敗したとき」の表に行を追加。CODEOWNERS の冒頭の注記を新しく落ちる3条件に改めた。note と pre-review-automation.md の構成例も同様 |
| 中-2 | IMPL-0384 の note と check-pr.mjs 冒頭に IMPL-0972 を書いた |
| 中-3 | (b) を採用。IMPL-0567 の note に「出荷の集約は印を読まない。後の束へ申し送り」を開示。aggregate-evidence.mjs は触っていない |
| 低-1 | ADR-0200 に決定6 と影響を足した |
| 低-2 | 末尾 `/*` の型は直下だけに当たる。失敗の文を「どれかの行に当たるか」へ |
| 低-3 | templates/03-debt-ledger.md の行に「括弧の中には短縮するゲートだけを書く」を足した |
| 低-4 | IMPL-0767 の note に、判定日を改めた者は確かめないこと(IMPL-0415 の範囲と内部監査)を書いた |
| 低-5 | 担当割り振り済み。今回は触れていない(`lint:evidence` は既知の EV-0322 重複のまま) |

## 試験の結果

- `test-check-pr.mjs`: 250 場面一致(終了 0)。IMPL-0972 の ng/ok を足した(宣言行の無い承認、差し戻しの宣言、記録用ブランチの様式の記名が不一致、PR を経ない判断記録 / 作成者本人の COMMENT、記録用ブランチの様式、写しの宣言行、読めないときの注意)。IMPL-0211 の ng/ok を足した(根の CODEOWNERS だけ / 3か所とも無い)。既存の IMPL-0384 の ok の場面は宣言行つきの承認へ直した
- `test-roster-ids.mjs`: 61 件一致(`docs/*` が下の階層へ及ばない確認を追加)
- control-approval・material-attribution・material-records-more・init-g5・performer-account・base-judge-workflow: 終了 0
- 本体: lint:impl・lint:refs・lint:text・test:fields・test:template 通過。impl:write で台帳を再生成

## 差分の範囲

- template(ブランチ b18-328): 172bfa37 から 1a13013c。bundle は E:/Github/process-compass/tmp/bundles/template-b18-a-fix1.bundle
- 本体: bdd5ff19 から、このファイルを含むコミットまで
- 触らなかったファイル: aggregate-evidence.mjs、templates/00-d0-governance.md・11-quality-assurance-policy.md、handoff.md、template-fields.yaml
