# #328・#347・#351 独立の突合(1巡目)の所見への対処(2026-11-17)

すべての所見に対処した。template/ と src/data/tailoring/ は触っていない。`template:kb` は流していない。

## #328
| 所見 | 対処 | 所在 |
| --- | --- | --- |
| M-1 不変条件 | 直した。1.4 の行を「第5章 5.4.3 の…表の4項目」に限定し、附属書F の検証対象の性質、検査の名(template-repository.md:928。`shipBlocked` の記録の検査)、constraints.yaml の説明(knowledge-base-schema.md:19)は当たらない旨を足した。後2者は 5.4.3 と別の意味と確かめた | overview.md 1.4 |
| L-1 IMPL-0984 | 直した。note の末尾に判断の仕方を足した。state は undelivered のまま | roles-responsibilities.md の IMPL-0984 |
| L-2 公式用語の決め方 | 直した。1.4 の表の前に1文、ADR-0118 のステータスの後に案内 | overview.md 1.4、adr/0118 |
| L-3 出典の示し方 | 直した。「理由は、統制の弱化をパスで定義しないことと同じである(ADR-0038 決定1)」。EV-0286 の対象は変えない(対象は判断そのもの) | roles-responsibilities.md 3.5.5 |
| ed-1 | 直した | adr/0082 |
| ed-2 | 直さない。baseline は凍結で、裁定の誤りとして記録のみ | - |
| 記録のみ(lint:impl) | 台帳を再生成し lint:impl は exit 0 になった | - |

## #347
| 所見 | 対処 | 所在 |
| --- | --- | --- |
| M-1 当たる本文6か所 | 直した。語を足しただけで意味は変えない(ed の範囲)。tailoring-guide.md の見出し(委任・標準変更・AI自律レベル L3 …)、「担保水準 L0 の既定値」、表の行「× AI自律レベル L2 以上」。deliverable-templates.md の「AI自律レベル L2 以上」「AI自律レベル L3」、見出しの(適用: …AI自律レベル L2 以上…)。見出しの変更に合わせ、impl-inventory.yaml のキーを付け替えた(baseline は凍結のため触らない)。human-ai-boundary.md・gate-criteria.md も grep した。human-ai-boundary.md:303 の「L2 以上」は 5.4 の節の中で AI自律レベルを論じる段落であり、見出しから読めるので規則に当たる | tailoring-guide.md・deliverable-templates.md・impl-inventory.yaml |
| L-1 ADR-0142 の L2 | 直した。「AI自律レベル L2 は、人間が統合点を確認する仕様駆動の並行実行であり」 | adr/0142 コンテキスト |
| ed-1 影響の節 | 直した | adr/0142 影響 |

## #351
| 所見 | 対処 | 所在 |
| --- | --- | --- |
| M-1 IMPL-0278 | 直した。note を、名簿が空のときの検出を降りていない差とし、回答から導くことは意図と述べる形に改めた。state=undelivered・issue=351 は保つ | tailoring-guide.md の IMPL-0278 |
| ed-1 欄の呼び方 | 直した。「表8 の行の「決定した者(理由)」の欄に書き」 | deliverable-templates.md |

## 検査(要約)
evidence:write・impl:write・scope:write で台帳を再生成。lint:refs / lint:evidence(272) / lint:impl / lint:scope / lint:provisions / test:impl / test:fields / lint:tone / lint:dekimasu / lint:registry は exit 0。変えた md の textlint exit 0。新しいマークは足していない。

## 新しい義務・裁定の意図の変更
無し。記号は改名していない。
