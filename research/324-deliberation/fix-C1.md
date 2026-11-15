# 束 C 独立の突合 1巡目の直し(Issue #324。2026-11-15)

`ruling-C1.md` のとおり、`crosscheck-C1.md` の所見 45 件を直した。条文は変えていない。`template/` は読んだだけ。附属書(assurance-case・safety-verification・ears-guide・proposal-template)は触っていない。

## 1. 登録した降ろし先(`src/data/impl-targets.yaml`。手引きごと。`ai-sla-guide` と同じ形)

| id | path |
| --- | --- |
| `debt-ledger-guide` | `.claude/skills/artifact/artifacts/03-debt-ledger.md` |
| `d0-guide` | `.claude/skills/artifact/artifacts/00-d0-governance.md` |
| `project-brief-guide` | `.claude/skills/artifact/artifacts/06-project-brief.md` |
| `safety-risk-assessment-guide` | `.claude/skills/artifact/artifacts/09-safety-risk-assessment.md` |
| `qa-policy-guide` | `.claude/skills/artifact/artifacts/11-quality-assurance-policy.md` |

`ai-sla-guide` の `description` に、知財潔白性の検査を AI の利用に限らず課すことと補償を省略の根拠にしないこと(手順 3)を足した。`flow-observation` の `description` を、2.10.5 の調整の記録と 2.10.6 の見込みの評価・順序の記録まで広げた(C1-22)。

## 2. 所見ごとの直し

手引きが運ぶ規定は `delivered check=manual`(note に手引きの節)。レビューの観点も「運ぶ」に数えた(裁定)。足したマークは IMPL-0944〜0958(0943 の次から。0677 は欠番のまま)。

### 高

| # | 直し | マーク |
| --- | --- | --- |
| C1-01 | IMPL-0788 を `debt-ledger-guide`・`delivered`。「TODO」の語が手引きに無いこと、検査が無いことを note に残した | 0788 |
| C1-02 | IMPL-0789 を同上 | 0789 |
| C1-03 | IMPL-0779 を `d0-template`・`delivered`(様式 節13 の末尾の文)に改め、引き継ぎの記録と前の体制の名義の判定を拒む検査を IMPL-0944(`process-change-skill`・`undelivered`)に分けた | 0779、新 0944 |
| C1-04 | IMPL-0781 を `d0-guide`・`delivered`(レビューの観点 2 項目)。検査が無いことは note に残した。分けなかった(観点が規定の全文を言う) | 0781 |
| C1-05 | 登録 36「誰がいつ書くか」を `marked`。手引き 06 の担い手の表を IMPL-0949(`project-brief-guide`・`delivered`)で追う。IMPL-0800 への `location` を残した | 新 0949 |
| C1-06 | 登録 4「原則・判断記録・判定記録の関係」を `marked`。`/gate` の G-3.md 冒頭「判定の証跡: 判定記録」を IMPL-0956(`gate-skill`・`delivered`)で追う。理由を IMPL-0241(降りていない・置き換えの判断記録に限る)と IMPL-0817 を名指す形に直し、`location` に第4章「確定した版を変える場合」を足した | 新 0956 |
| C1-07 | IMPL-0869 を `safety-risk-assessment-guide`・`delivered`(手順 4) | 0869 |
| C1-08 | IMPL-0815 を `qa-policy-guide`・`delivered`(項目2 と規模の分)。項目4 が外枠を下回らない分を IMPL-0945(`qa-policy-template`・`undelivered`)に分けた | 0815、新 0945 |
| C1-09 | IMPL-0860 を `delivered check=manual`(様式 09 の承認の段落と手引き 09 手順 9)。評価者の欄・読んだ記録の欄・検査が無いことを note に残した。読んだ記録は本文に無い要求なので足さない | 0860 |
| C1-10 | テンプレ11 要求事項10 を `marked`。周知の行(手引き 11)を IMPL-0947(`qa-policy-guide`・`delivered`)、各人の認識を求める後段を IMPL-0948(`undelivered`)に分けた | 新 0947・0948 |
| C1-11 | IMPL-0899 の note から選択肢3案の起票を外し、IMPL-0617 が追うと書いた。IMPL-0617(`handoff-reference`・`delivered`)は `handoff.md` の節「エスカレーション」に5項目の語が実在することを開いて確かめ、向きは変えていない。登録 2.10.6 の `location` に 7.6「エスカレーションレポートの様式」を足した | 0899 |

### 中

| # | 直し |
| --- | --- |
| C1-12 | 知財潔白性の節を `marked`。IMPL-0955(`ai-sla-guide`・`delivered`。手順 3)を新設。IMPL-0678 は「自組織の CI の同じ趣旨の別の規定」と位置づけ、note は広げていない |
| C1-13 | IMPL-0850 を検出の分(`delivered`。check-d0 の `next_review` と gates/SG.md 材料1)にし、「失敗のとき SG を開始しない」を IMPL-0951(`undelivered`)に分けた。登録 2.8「前提条件の統制」を直した |
| C1-14 | IMPL-0794 を `project-brief-guide`・`delivered check=manual`(手順 4)。類型の一覧が様式と一致しないこと(internal は行の名だけ、oss は4類型)を開示した |
| C1-15 | 規定1・2 を IMPL-0950(`project-brief-template`・`undelivered`)で `marked` にした |
| C1-16 | IMPL-0946(`qa-policy-template`・`undelivered`)で要求事項2 の時点の定めを追う |
| C1-17 | IMPL-0865・0868・0875 を `manual`。IMPL-0803・0805 も、t8 が節の見出しだけを持つため `manual`(裁定の指示が無かったが規約「presence の単位」に従った) |
| C1-18 | 本文の第7項の様式に無い3行と注記を IMPL-0957(`ai-sla-template`・`undelivered`)で追う。IMPL-0752(第8章。note だけ)を「無い(開いて確かめた)」に改めた。`template-fields.yaml` の t8 に fields も omit も無い事実は後継へ寄せる(新規起票しない) |
| C1-19 | 2.4 に IMPL-0953(`gate-skill`・`undelivered`)。登録の note で IMPL-0359 は G-1 の材料の欄に限ると明記 |
| C1-20 | 2.10.5 に IMPL-0954(`flow-observation`・`undelivered`。調整の記録と 3.10 の事前レビュー期間への連結)。2.10.7 を `elsewhere` にして `location` を書いた |
| C1-21 | 1.3 を `elsewhere` に改め、第8章「調整は宣言を伴う」(IMPL-0310)を `location` に |
| C1-22 | 裁定の指示が無く、案のうち「説明を広げる」を採った(flow-observation の説明。上記)。見込みの評価を `next-role` へ分ける案は採らない(同じ降ろし先に残す。#443 の後継で決める) |
| C1-23 | 登録 2.8 の手順2・3 に `location`(G-1 の節、第8章 軸E)を足し、節の note で IMPL-0679・0449・0453 を名指した。行3a・3b は rows へ足さず note で名指した。IMPL-0884 の note を絞った |
| C1-24 | 登録 3 を `elsewhere`、`location` はテンプレ11(IMPL-0811) |
| C1-25 | 手引きの降ろし先登録(上記)と、各マークの照合で対応した。束 A・B の `undelivered` の同じ死角は範囲外で確かめていない |

### 低(20 件)

| # | 直し |
| --- | --- |
| C1-26 | 登録 35 の `location` を 5.7.4 の鍵に改め、IMPL-0173 を note で名指した |
| C1-27 | 登録 15 の `location` に第3章の IMPL-0699・0823 の節を足し、note で名指した |
| C1-28 | 登録 27 の note の IMPL-0537 の括弧書きを事実に合わせた |
| C1-29 | 登録 36 の `location` に G-1 の節を足し、IMPL-0793・0776 の note に「本文の文は様式に在るが単位に数えていない」を足した |
| C1-30 | IMPL-0863 を「記入時の注意」の末尾へ移し、2つの登録を入れ替えた |
| C1-31 | IMPL-0861 の note の所在を直した |
| C1-32 | IMPL-0820 の note に例外承認(`templates/04-gate-record.md`)を足した |
| C1-33 | IMPL-0877 の `issue` を 325(open を確認)に改めた。降ろし先の合いの弱さは、`pre-review-automation` の説明を変えず、ここに開示する(事前レビュー期間の道具で、規定の「すべてのレビュー」より狭い) |
| C1-34 | 登録の理由に「恒久層に登録します」の文を名指しした。**規定として読む余地が残る文として開示する**(`undelivered` に倒すかは議長が決める) |
| C1-35 | 「出荷判定では是正計画型と開示義務型を基本」の前半を IMPL-0958(`gate-skill`・`undelivered`)で追う |
| C1-36 | 直さない。条文の食い違い(様式 11 が置き場へ写す義務を足す)の候補で、既存の open の Issue へ寄せる(Issue にはコメントしていない) |
| C1-37 | 直さない。範囲外(束 A・B のマーク。IMPL-0536 と IMPL-0656)。議長が束 D か後継で扱う |
| C1-38 | IMPL-0848 を様式の分に絞り、スキルの分を IMPL-0952(`adr-write-skill`・`delivered`)に分けた |
| C1-39 | IMPL-0885 の note を事実に合わせた |
| C1-40 | IMPL-0898 から人事評価の文を外し、登録 2.9.8 に制度設計として理由と探した場所を書いた |
| C1-41 | IMPL-0879 の note の、節に無い句を外した |
| C1-42 | 登録 1.9 の `location` に附属書H の IMPL-0050 の節の鍵を足した(附属書の本文は触っていない) |
| C1-43 | IMPL-0849 の `target` を `g1-check` に改めた |
| C1-44 | 登録 2.5 の note に「第8章のマークで S0 と G-3・G-8 を名指すものは見つからなかった」を書いた |
| C1-45 | 登録 2.10.5 の note (5) に探した場所を書いた |

## 3. 検査(終了コード)

- `npm run impl:write`: 0。台帳 `community/implementation-ledger.md` を再生成
- `npm run lint:impl`: 0。`npm run test:impl`: 0(56 件合格)
- `npm run lint:refs`: 0。`npm run lint:provisions`: 0
- textlint(lifecycle.md・deliverable-templates.md・tailoring-guide.md): 0
- 回帰の全量・`npm run check` は流していない

## 4. 議長への開示

- **読まなかった範囲**(根拠水準マークの本文で数を開示する分): 突合の4章のとおり。`marked` の節の任意の `location` で開いていないマーク、既存のマークだけの `marked` 3 節(登録 27・37・55)、IMPL-0774〜0782 の check-d0.mjs の拒否の範囲。この直しでも新たには読んでいない
- 手引き 17 枚のうち、規定を運ぶものとして登録したのは5枚。ほかの手引き(01・02・04・05・07・12・adoption-trial・defect-ledger・trial-checklist)は、束 C の `undelivered` と突き合わせていない(C1-25 の死角の残り)
- 手引きの `path` と、予定の降ろし先 `context-transfer-record`・`project-registration-record` の `path` が仮の所在であることの開示は、この直しでは足していない(突合 5章 意見14。低)
- 新しい `undelivered`(0944・0945・0946・0948・0950・0951・0953・0954・0957・0958)は、すべて `plan=scheduled`、`issue=324` か既存の open の Issue(443・325)。`check=machine` と `plan=adopter` は足していない
