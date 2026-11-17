# #347 独立の突合(2巡目・直した差分)の所見(2026-11-17)

対象: コミット `b3cf3203` の差分だけ。基準: `07-reconciliation-1.md`・`research/328-deliberation/08-fixes-1.md`・`04-ruling.md`。本文は直していない。実行の結果と束の全体は `research/328-deliberation/09-reconciliation-2.md` による。

**件数(#347 分)**: 高 1・中 0・低 1・ed 1。

## 1巡目の所見の直しの確かめ
| 所見 | 判定 | 根拠 |
| --- | --- | --- |
| M-1 当たる本文6か所 | 6か所とも語が入った。ただし見出しの変更が template へ波及した(H-1)。残りが2か所(L-2) | `tailoring-guide.md` の見出し・担保水準 L0 の行・CL3 の行、`deliverable-templates.md:138`・`:140`・見出し。記号は改めておらず、裁定の意図(案 A)を変えていない |
| L-1 ADR-0142 の L2 | 解いた | 「AI自律レベル L2 は、人間が統合点を確認する仕様駆動の並行実行」は 5.4 の表の名称と監視者の語に一致し、5.5 の運用形態「協働」と重ならない。ADR-0142 は未 push の新設 |
| ed-1 影響の節 | 解いた | 3.5.1 の3文と ADR-0082 の案内を影響に書いた |

`impl-inventory.yaml` の鍵の付け替えは見出しの新しい文字列に一致し、baseline は凍結のまま(`lint:impl` exit 0)。`deliverable-templates` の見出しの鍵は(適用: …)を含まないため付け替えは要らず、実際に変えていない。retired-ok・異表記の登録は改名しないため要らない(`lint:provisions` exit 0)。

## 所見

### H-1(高) 見出しの適用範囲を変えたため、準拠テンプレートの知識ベースが複製元と食い違い、`npm run check` が落ちる
- 所在: `deliverable-templates.md` の見出し「## AIエージェント安全リスクアセスメント(適用: 物理的な危険源・R1 の変更種別・本番到達・AI自律レベル L2 以上のいずれか)」。複製先 `template/scripts/vendor/tailoring-kb.json:1650-1652`(`clauseScopes` の `range` と、見出しのアンカーを含む `source`)
- 根拠:
  - `npm run test:template` が exit 1「知識ベースが複製元の YAML と一致しません」。1巡目(dcad179)では exit 0 だった。突合の担当が誤って書き出した差分(`research/328-deliberation/09-reconciliation-2.md` の記録)は、`commit` のほかに `range` と `source` の2行だけで、原因はこの見出しの変更に限られる
  - `test:template` は `npm run check` に含まれる。push の前の全量と CI(`ci.yml`)が落ち、サイトの公開も止まる
  - 公開後は、テンプレートの知識ベースの `source` が旧いアンカー(`…本番到達l2-以上のいずれか`)を指し、存在しない節へのリンクになる
  - 表示と実態の食い違い: `08-fixes-1.md` は「template/ は触っていない」「語を足しただけで意味は変えない(ed の範囲)」とし、検査の要約に `test:template` を挙げない。#347 の裁定・1巡目の突合は「template の変更なし」とした。実態は template の複製の更新が要る。`05-issue-comment.md` にも template への波及が無い
- 直しの案(巡の数に関わらず直す):
  1. `npm run template:kb` で複製を更新し、template 側でコミットする(準拠テンプレートを触るため直列。push していないコミットは bundle へ退避)。submodule の参照を進める
  2. `05-issue-comment.md`(#347)に、template の知識ベースの `range` と `source` が変わる旨を足す。`08-fixes-1.md` の「template/ は触っていない」を、この直しの後の事実に合わせる
  3. 直した後に `test:template` を流す
- 採らない案: 見出しを元に戻す。1巡目 M-1 の規則違反が戻り、規則が本文自身で守られない状態に戻るため
- 参考(範囲外): `template/.claude/skills/gate/gates/G-1.md:11` も「本番到達・L2 以上」と書く。ADR-0142 決定2 の対象は「本標準の本文と第6章の様式」で、template の手順書は対象外のため所見にしない。template を触る機会に揃えるかは議長の判断

### L-2(低) 規則に当たる記号だけの書き方が2か所残る
- 所在:
  - `tailoring-guide.md:1333`(例3)「安全リスクアセスメントは、第6章の適用条件(L2 のエージェントを使うなど)に当たるため」。前の文に「AI自律レベルの上限は L2」があるが、規則は「同じ文」で読めることを求める。1巡目も本突合の前も grep の対象外だった
  - `deliverable-templates.md:140` の第2文「L3 と「未計測」を同じ行に並べない」。同じ箇条の第1文には語があるが、別の文
- 根拠: 08 は当たる本文を6か所で閉じたと読める。ADR-0142 決定3 は読み分けを manual とし、網羅の機械の検査は無い
- 開示の案(推奨は ed の直し): 2か所に「AI自律レベル」を足す。直さない場合は、ADR-0142 決定3 の manual の確認に任せ、`08-fixes-1.md` へ「規則に当たる本文の確認は 2026-11-17 時点で tailoring-guide・deliverable-templates・human-ai-boundary・gate-criteria を grep したもので、網羅を機械で確かめていない」と記録する

### ed-1 実装マークの note と棚卸しの理由が、直した本文の旧い文言を引く
- 所在: `tailoring-guide.md` の IMPL-0765 の note「組み合わせ表の「CL3 の安全関連部 × L2 以上」」(鉤括弧の引用が、行の新しい文言「× AI自律レベル L2 以上」と一致しない)。IMPL-0741 の note「第4章の L0 の既定値」(本文は「担保水準 L0」)。`impl-inventory.yaml:6302` の reason「委任・標準変更・L3 を同じ登録として扱う」
- 根拠: note は公開の台帳(`implementation-ledger.md`)に出る。引用が本文と食い違うと、台帳から本文の行を探しにくい
- 直しの案: 3か所に「AI自律レベル」「担保水準」を足し、`npm run impl:write` で台帳を再生成する
