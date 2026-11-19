# 束 B26 後半 — 突合1巡目への直し(fix2-1)

- 日付: 2026-11-20
- 直しの差分の範囲: template `1ca7be2..fa52793`、本体 `43bf6fa1..<このコミット>`(最後のコミットは `git log -1` で見る)
- 退避: `E:/Github/process-compass/tmp/bundles/template-b26b-05.bundle`
- 根拠: `ruling2-fix1.md`(裁定)・`review2-1.md`(所見)。2巡目は直した差分だけを見る

## 所見ごとの直し

| 所見 | 直し | 試験 |
| --- | --- | --- |
| 高-1 | `declarationDrift` の JSDoc、3.13.5 の行、IMPL-0023 の note、IMPL-0177 の note を、「部分一致は両方の向きで通す(記録が宣言の一部分・宣言が記録の一部分)。版の違いを検出するのはどちらにも当たらないときだけ」へ揃えた。誤りの文(「記録が宣言の一部分に当たらないときだけ」)を消した。判定は変えない | test-aggregate-drift に「宣言 claude-opus-4 は記録 Claude Opus 4.5 を通す」を偽の合格の固定として足した |
| 中-1 | 試験側だけを足した。aggregate-evidence.mjs の挙動は変えていない。結線は欠けていなかった(集約は構成をそのまま渡す) | test-safety-record に `IMPL-0761:ng`・`:ok` の入口の試験を足した。作業ツリーの写しで集約を起動する。ng は構成 g7 が required・Q1 いいえ・CL1・記録なしで「安全関連部の検証の記録(基準7)」の欠落が出る。ok は値が無いと出ない。IMPL-0761 は `check=machine` のまま |
| 中-2 | 開示で閉じた。3.13.5 の行・IMPL-0023 と IMPL-0177 の note・JSDoc に「名称の部分に英数字を持たない記録(日本語の名など)は、どの宣言とも一致したとみなす」を書き、判定を変えない理由(変えると人の共著者で偽の検出が出る)を 3.13.5 に書いた | 固定の試験に1件(日本語の名と名の無い記録 `<x@y>` が 0 件) |
| 低-1 | IMPL-0177 の note を「Co-Authored-By の無いコミットは、Agent-Run を持つものだけを IMPL-1033 が警告し、Agent-Run も無いコミットは検出しない」へ直した | なし(note) |
| 低-2 | IMPL-0653 の note から、向きの対比を除き「IMPL-0771 は束 B26 で降りた」だけにした | なし(note) |
| 低-3 | IMPL-0761 の note を「集約は基準7 の欠落を例外承認の行で解かない(実装の選択。標準の扱いは第7章 7.3 と ADR-0153 のとおり)」へ直した。実装の事実と標準の根拠を分けた | なし(note) |
| 低-4 | 直していない(挙動の変更。開示で閉じる、下記) | なし |
| 低-5 | `IMPL-1033:ok` の目印を、Agent-Run と `Claude Opus 4.5 <…>` を持つコミットだけの実行(警告の行が出ない)へ移した。旧い ok は目印を外して「通し: Agent-Run の無い実行では警告を出さない」とした | test-aggregate-drift |
| 低-6 | 直していない(挙動の変更。開示で閉じる、下記) | なし |

## 壊して落ちることの確認(中-1)

aggregate-evidence.mjs の `checkSafetyRecord({ root: ROOT, config, day: exceptionDay })` を `config: { ...config, gates: {} }` へ一時的に変えて test-safety-record を流した。`0761 入口(違反)` が落ちた(1 件)。バックアップから戻し、aggregate-evidence.mjs の差分は JSDoc だけであることを確かめた。直す前は、同じ破壊でどの試験も落ちなかった(review2-1)。

## 開示で閉じた点(挙動を変えない)

- 低-4 `gateCodeOf` の正規化の外れ(逆引用符・中の空白・小文字の g・U+2010)は閉じる側に倒れ、偽の通過は出ない。置き場のままの値(`<ゲート>`・`(未記入)`)が code になる点は開く側だが、置き場のままの記録は他の検査で落ちる見込み。`isFilledValue` と同じ判定で null にする案は、挙動の変更なので採らず、残る
- 低-6 行B の `<` を閉じる `>` が無い記録(`Claude <x1@y`)は、メールの数字で行B を通る。閉じの無い `<` から後ろを除く案は挙動の変更なので採らない。行B は「人の共著者の名に数字があれば通る」と既に開示している限界の内側に置く
- 中-2 の判定(英数字の無い名を不一致とする)は、裁定の採らない案のまま採らない

## 試験

- template: test-aggregate-drift 46 件・test-aggregate-records 222 件・test-aggregate-wiring 61 件・test-safety-record 97 件・test-adoption 123 件・test-loosening-decider すべて通過
- 本体: lint:impl・lint:refs・lint:scope 通過。編集した3つの docs に textlint の違反なし。`impl:write` で台帳を再生成した
- 裁定のとおりに直せなかった点: なし
