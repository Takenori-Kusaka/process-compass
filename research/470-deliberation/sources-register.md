# #470 出典の登録記録(SRC-0982〜0984)

2026-11-28。下書き draft-06 / 16 / 17 を、原文を取得し直して逐語で照合し、出典台帳へ登録した。0982〜0984 は登録前に空きを確かめた。

## SRC-0982(draft-06、Spracklen ほか)
- 取得: `curl` で arxiv.org/abs/2406.10279 の HTML を取得し、要旨の文字列を照合。readLevel は abstract(本文は未読)
- 確かめられた引用: 「at least 5.2% for commercial models and 21.7% for open-source models」「205,474 unique examples of hallucinated package names」「16 popular LLMs ... 576,000 code samples in two programming languages」
- 外した記述(未確認): 「19.7%」(二次情報のみ)。slopsquatting の定義(二次の解説による)。下書きの c2 の括弧書きは原文の引用ではないので台帳へ入れていない
- 引いてよい: 商用 5.2% 以上、OSS 21.7%(いずれも平均の割合)、16 モデル、57.6 万標本、固有の幻覚名 20.5 万(205,474)、2 言語、USENIX Security 2025
- 引いてはいけない: 19.7%、slopsquatting の定義、緩和策の効果の大きさ(要旨が「significantly reduce」とだけ述べる)、本文にしかない内訳

## SRC-0983(draft-16、ponytail SKILL.md)
- 取得: raw.githubusercontent.com の main を `curl`(3,496 バイト、全文)
- 確かめられた引用: 梯子「Take the first option that fully works:」と 1〜6 の段、「Never cut: ...」、「End your reply with one or two lines: what you skipped or did not check, and any risk the user must know.」
- 下書きの食い違い(台帳では原文に直した): 下書きの引用は原文と逐語でなかった。段の順は原文が (1)要るか (2)既存 (3)標準ライブラリ・基盤 (4)導入済みの依存 (5)1 行 (6)最小限で、下書きと一致。削らないものは原文が「the calibration real hardware needs, anything the user asked for」で、下書きの「hardware calibration」は言い換え。「Every reply ends with」という文は原文に無い(原文は冒頭の「End your reply with ...」)。`shortcut: <the limit>, <when to upgrade>` の注記と lite/full/ultra の 3 段は原文にある。「Reporting」「Intensity」という節名は原文に無い(節は「Levels」)
- 引いてよい: 段の順、削らないものの列挙、返答の終わりに省いたこと・確かめていないことを 1〜2 行で示す形(いずれも作者の自己の記述)
- 引いてはいけない: 効果があるという主張(この文書は実証でない)。最新版である主張(取得日の main の内容)

## SRC-0984(draft-17、JetBrains の試験)
- 取得: WebFetch は 403 のため、User-Agent を付けた `curl` で HTML を取得してタグを除き照合(全文を読んだ)
- 確かめられた: 著者 Denis Shiryaev、公開日 2026-07-28(HTML 中の日付と URL)、モデル claude-sonnet-5(medium)、SkillsBench 80 組、試験した版 ponytail v4.8.4(commit 16f2980)、コード 15.4% 減(10,205 行が 8,756 行、p=0.088、見出しの数値で最も弱い)、費用 10.3% 減(p=0.004、46 課題で安く 34 課題で高い)、置くだけでは 10 セッション中 0 回(SessionStart フックの注入でだけ効果)、「Nothing below tests whether ponytail preserves a guard, only whether the work still passes.」(検証・安全の保持は測っていない)、品質は 65 同一・9 やや悪い・6 やや良い(有意差なし、同等の証明ではない)、宣伝の −54% を否定しない
- 未確認: なし(下書きで未読とした費用 −10.3%・p=0.004 も本文で確認した)。下書きの「最新版でない」は本文に無いので台帳へ入れていない。台帳の c1 の出典は SKILL.md なので derivedFrom に SRC-0983 を置いた
- 引いてよい: 上記の「確かめられた」の数値。ただし「JetBrains の 1 回の試験」「SkillsBench・単一モデル」と限定して書く
- 引いてはいけない: 検証・安全が保たれるという結論、品質が同等という結論、−54% を実測したという記述、他モデル・他の課題への一般化

## 検査・生成
- `npm run lint:sources`: 問題なし(既存の SRC-0511 などの注意は従前から)。node_modules は主の作業ツリーへの junction を一時的に作って使い、終了後に削除した
- `npm run sources:index` は catalog.md のほか research/282 配下の views なども再生成したが、前回の生成から溜まった差分を含むため、catalog.md だけをコミットした(他は作業ツリーに未コミットで残る)

## コミット
- コミット: (下記の報告を参照)
