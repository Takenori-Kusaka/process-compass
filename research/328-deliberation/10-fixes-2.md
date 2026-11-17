# #328・#347・#351 独立の突合(2巡目)の所見への対処(2026-11-17)

議長の裁定に従う。template/ と src/data/tailoring/ は触っていない。`template:kb` と `build-template-kb.mjs` は流していない。

## #328
| 所見 | 対処 |
| --- | --- |
| M-1 ADR-0118 の案内 | ed として直した。出所を「#328 の裁定」とし、引用の位置を「コンテキスト」にし、異表記の検査へ登録するのは決定4 のとおり正表記を決めた ADR のある語だけ、と改めた |
| L-1 「不変条件」の除外 | ed として直した。1.4 の行の除外を、所在の列挙から性質の書き方(一般の技術用語・テーラリングの禁止事項を指す語・検査の名)へ改めた |

## #347
| 所見 | 対処 |
| --- | --- |
| H-1 見出しの変更が template の知識ベースへ波及 | 裁定どおり、`deliverable-templates.md` の「AIエージェント安全リスクアセスメント(適用: …)」の見出しを元の文言に戻した(「AI自律レベル」を外した)。見出し以外の本文の語の追加は残した。05-issue-comment.md に template の項目(見出しへの語の追加と知識ベースの再生成)を足し、#347 は開いたままとした。この見出しは ADR-0142 決定3 の規則に当たったまま残る(manual の確認の対象。template の段で直す)。08-fixes-1.md の「template/ は触っていない」は事実のまま。採らない案: template:kb で template を更新する(本束の範囲外) |
| L-2 記号だけの2か所 | 直した。tailoring-guide.md の例3 に「AI自律レベル L2」、deliverable-templates.md:140 の第2文に「AI自律レベル L3」を足した。足した後の `test:template` は exit 0(知識ベースへ波及しない) |
| ed-1 note・reason | 直した。IMPL-0765 の note(× AI自律レベル L2 以上)、IMPL-0741 の note(担保水準 L0)、impl-inventory.yaml の reason(AI自律レベル L3)。`impl:write` で台帳を再生成 |

## #351
| 所見 | 対処 |
| --- | --- |
| ed-1 IMPL-0278 の note | 直した。第1文を「表5-2 の区分が「体制の内」の人で数え」とし、「名簿が空」を「名簿の体制の内が空」に揃えた。台帳を再生成 |

## 検査(要約)
test:template exit 0 / lint:refs / lint:impl / lint:evidence / lint:scope / lint:provisions / test:impl / test:fields は exit 0。変えた md の textlint exit 0。`git -C template status` は空。
