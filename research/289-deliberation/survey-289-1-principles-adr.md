# 調査: 立ち戻る先の成果物、G-3 の判定対象と証跡、設計判断の置き場、ADR にする基準 — Issue #289(#251・#253 由来)

- 調査日: 2026-10-23
- 位置づけ: コアポリシー「取り込みの前に議論する」の**調査**段階。採否は決めていない。推しは書いていない
- 入力: `research/289-deliberation/issues-context.md`(#251・#253 の節と「既に決まっていること」)
- 突合した版: 本体 `46b056f`(2026-10-12)、準拠テンプレート submodule `ec8ecd6`(2026-10-13)。引用の行番号はこの版のもの
- 外部の束: `research/282-survey-2026-09/`(by-issue の #251・#253、TH05、FND-0061〜0065・0132・0213・0218、出典 SRC-0145・0366〜0369・0377〜0379・0381〜0383・0515・0547〜0551・0554)。今回の検索で足したものは 2 章で「今回」と書く
- 対象外: #272(ADR の索引・参照実績の観測)、#252(文書量の指標)、#275 原則4・9。ただし論点の境界で触れる箇所は注記する

## 0. 要約(10 行)

1. **「立ち戻る先」(原則・軸・ポリシー)に当たる成果物は、標準の本文に無い**。第6章の成果物一覧(12 種)に無く、第5章 コンテキスト基盤は `context/standards/` に「設計標準・レビュー観点」のラベルを置くだけで様式も要求も無い。テンプレートが同梱する `context/standards/` は G-6 のレビュー観点 1 枚である
2. **G-3 基準2「恒久層(設計標準)との突合」は、様式の無い置き場を確認方法にしている**。初期化直後のテンプレートでは、突合する相手が存在しない
3. **ADR の範囲が 6 通りに書かれている**。「設計上の選択」(2.6)、「G-3 の判定の対象とした選択」(2.6 のステージ表)、「あとから変えにくい決定。技術選定、方針、原則…」(テンプレートの README・`/adr-write`、本プロジェクト自身の ADR 運用)、「設計判断・技術選定・リスク受容の理由」(`integrated.yaml`)、スタックの変更(ADR-0034)、CL の引き下げ(第8章)。**テンプレートは「原則」を ADR に入れると書いており、#251 の混同はテンプレートの文言から生じうる**
4. **G-3 の判定対象は、標準の中で 3 通りに読める**。第6章「ADR = G-3 の判定対象」、`integrated.yaml`「アーキテクチャ設計・技術選定案」と「判断記録(ADR)案」、第7章「G-3 の判断記録(ADR)は後回し可(判断そのものは実施する)」。最後の 1 つは**判断と記録を既に分けている**。Label Mailbox は「判定記録を作成し、採否と却下理由を ADR へ永続化」で、ADR を判定の後の産物として書く
5. 細部の食い違い: G-3 基準1 の「設計案」に様式が無い。基準3 の「『戻せない選択』欄」はテンプレ2 に同名の欄が無い(標準は 2 値、テンプレートは 3 値)。`integrated.yaml` の G-3 の判定語彙が ADR-0036 の 2 値と違う。ADR-0034 の退けた案の理由が、ADR-0063 で変わった前提(S0 の G-3 は簡略)に立つ
6. **置き場を ADR 以外へ寄せると、少なくとも 9 か所が `context/decisions/` か「ADR」を名指しで参照している**(G-6 基準3、第2章 2.9.4、3.4.3 の力量確認、第7章 7.4、第8章の CL 引き下げ、フェーズ6 の「判断記録の充足」、出荷の証跡の集約、PR テンプレート、ADR-0034 決定5)
7. **外部: 原則と決定記録を別の層に置く向きは、TOGAF 9・Microsoft・AWS・英国 CDDO の原則の手引きで一致する**(E1)。原則は「長く保ち滅多に改めない」、名前・文・理由・含意の 4 項目、数は 10〜20、改廃の手続を別に置く(TOGAF 9)。原則どうしが衝突したときの判断は記録する(TOGAF 9、CDDO)。Nygard・MADR・Fowler は分離に触れない
8. **ADR の対象を絞る基準は外部で 3 つの型に分かれる**。構造・品質特性・覆しにくさ(Nygard、Microsoft)、影響範囲(GDS の義務は横断的決定に限る)、可逆性で手続の重さを変える(Amazon 2016、国内 1 社)。ISO/IEC 12207:2008 の意思決定管理は「決定の状況ごとに意思決定の戦略を選んで宣言する」とし、決定の記録と根拠の把握を成果に置く。置き場は ISO/IEC/IEEE 15289 が統合・分割・リポジトリ参照を適合と認める(E1)
9. **実証は乏しい**。分離・置き場・可逆除外のどれも効果の測定は見つからない。設計根拠の記録の価値を測った統制実験(Falessi ほか 2013、修士学生 75 名)は「項目の価値は種類と用途で大きく変わる」とし、全項目の記録を前提にしない。ADR の様式の比較実験(2026、学生)は Nygard 型を MADR より理解しやすいとした
10. 案は論点ごとに 6〜7 個を立てた(現状維持・課さないと明記を含む)。会議体への問いは 9 つ。とくに「可逆性で ADR の要否を切ると、可逆性の評価(G-3 基準3)が判定の前に自己申告で済む」問題は、ADR-0044 決定4 の論法と正面から当たる

## 1. 標準の現状(突合)

### 1.1 「立ち戻る先」に当たる置き場(逐語)

| # | 所在 | 記述 |
| --- | --- | --- |
| a | `src/content/docs/phase4-process-design/deliverable-templates.md:36-49`「成果物と様式の対応」 | 12 行(D-0、機能仕様書、判断記録(ADR)、技術負債台帳、ゲート判定記録、運用引き継ぎ文書、企画書、実装計画、AI-SLA、安全リスクアセスメント表、前提の台帳、層1)。**原則・軸・ポリシー・設計標準に当たる行は無い** |
| b | `src/content/docs/phase5-implementation/context-base.md:17-23` | 「`├── context/`」「`│   ├── decisions/             # ADR(判断記録)の置き場`」「`│   ├── standards/             # 設計標準・レビュー観点`」 |
| c | 同 `:82` | 「`/context/standards/   @tech-lead-c`」(CODEOWNERS の例。所有者は技術判断の側) |
| d | 同 `:128-134` | frontmatter の例「`# 決済まわりの設計標準`」(`scope: src/payment/**`)。**設計標準の唯一の例は、特定コードに紐づく規約で、プロダクト全体の軸ではない** |
| e | 同 `:244` | 「小規模・初期 \| CLAUDE.md+用語集+ADR だけで開始(1日で整備できる範囲)」。**小規模の初期構成に設計標準が入っていない** |
| f | `src/content/docs/phase3-gap-analysis/context-infrastructure.md:29` | 「**恒久層**: 組織・プロダクトに恒久的な前提。コーディング規約、設計標準、ドメイン用語、レビュー基準。一度書いて常駐させる」 |
| g | `src/content/docs/phase4-process-design/gate-criteria.md:227` | 「\| 2 \| 既存資産・コンテキスト基盤と整合している \| 恒久層(設計標準)との突合 \|」 |
| h | `src/content/docs/phase4-process-design/lifecycle.md:155` | 「\| コンテキスト基盤 \| 案件層のみ \| 恒久層の整備を開始 \| 恒久層の維持が必須 \|」(S0 / S1 / S2)。**S0 は恒久層を持たないので、S0 でも適用する G-3(`tailoring-guide.md:429`)の基準2 は突合先が無い** |
| i | `src/content/docs/phase4-process-design/roles-responsibilities.md:1108-1118` 3.11.4 | 指示資産の保守要求 7 項目(200 行、追記の条件、権限の集約、四半期の棚卸し、導出できる内容を書かない、読み込み実績、保管)。**設計標準が指示資産に当たるかは書かれていない**(3.11.3 の 3 層は強制力の層で、内容の種類の層ではない) |
| j | `template/context/standards/review-checklist.md:1-9` | 「# レビュー観点」「独立レビュー(G-6)で確認する項目です」。**`context/standards/` に同梱されているのはこの 1 枚だけ** |
| k | `template/context/projects/README.md`「恒久層へ上げるもの」 | 「設計標準・レビュー観点 → `../standards/`」「あとから変えにくい決定 → `../decisions/`」 |
| l | `template/CLAUDE.md:16` | 「設計標準・レビュー観点は `context/standards/`、判断記録は `context/decisions/`」 |
| m | 第1章 1.4(`overview.md`) | 「判断記録」「ADR」「設計標準」「原則」のいずれも用語の定義が無い(`overview.md:108` は「コンテキスト基盤」の定義だけ) |

「原則」という語は、本標準では**本標準自身の設計原則**(`integrated-process.md:18-25` の 4 原則、`gate-criteria.md:48`「設計原則の実装」、`label-mailbox.md:26`)にだけ使われています。採用組織のプロダクトの原則を指す箇所は、検索した範囲(`src/content/docs` の「原則」「ポリシー」「立ち戻」「判断の軸」)で見つかりませんでした。

### 1.2 ADR の範囲(何を ADR にするか)の書かれ方(逐語)

| # | 所在 | 記述 | 範囲の言い方 |
| --- | --- | --- | --- |
| a | `lifecycle.md:142-145`(2.6) | 「反復の終わりに、該当がある記録をコンテキスト基盤へ書き戻す。該当が無い反復に、記録を求めない」「設計上の選択を伴った場合は、判断記録(ADR)」「規約・用語が変わった場合は、恒久層コンテキスト」 | **設計上の選択**。規約は恒久層へ、と分けている |
| b | `lifecycle.md:154`(2.6 のステージ表) | 「\| 判断記録(ADR) \| G-3 の判定の対象とした選択 \| コア機能は必須 \| 全件必須 \|」 | S0 は **G-3 の判定の対象とした選択**。S2 の「全件」の母数は書かれていない |
| c | 同上の改訂履歴 | 2026-10-12 の `6e61065`(組C、#303 #308 #310)で「主要な選択のみ」から改めた。理由は「主要」が判定できない語であること(`research/302-310-deliberation/council-C-02-field.md:450`、`council-C-03-qa-audit.md:466`) | — |
| d | `developer-guide.md:20`、`:148` | 「\| 設計判断を暗黙に処理する \| 判断記録(ADR)として残す \|」「設計上の選択を伴った場合は判断記録(ADR)。採らなかった選択肢とその理由を含める」 | 設計判断 |
| e | `lifecycle.md:80`、ADR-0034 決定5 | 「S0 の結果に基づいて記録済みのスタックを変更する場合、技術判断者の判断とし、判断記録(ADR)を残します」 | スタックの変更 |
| f | `tailoring-guide.md:766-768` | 「低減の前後の区分と、根拠となる設計を記録する(… CL1 以下では ADR へ)」「引き下げの判断を [ADR](/process-compass/adr/) として記録する」 | CL の引き下げ。**リンク先は本プロジェクト自身の ADR 集**で、採用組織の判断記録(テンプレ2)ではない |
| g | `src/data/processes/integrated.yaml:147-151` | 「name: 判断記録(ADR)」「description: 設計判断・技術選定・リスク受容の理由。コア機能では必須。コンテキスト基盤へ還流する」 | 設計判断・技術選定・**リスク受容** |
| h | `template/context/decisions/README.md:3` | 「あとから変えにくい決定を記録します。技術選定、方針、原則、外部との契約に関わる設計。」 | **方針・原則を含む** |
| i | `template/.claude/skills/adr-write/SKILL.md:10`、`:12` | 「**あとから変えにくい決定**です。技術選定、方針、原則、外部との契約に関わる設計。」「設計上の選択を伴わない日々の実装判断は対象外です。迷うときの目安(テンプレート独自): 「あとで変えるとしたら何が必要か」を考え、答えが「作り直し」に近ければ、設計上の選択です。」 | 方針・原則を含む。可逆性に近い目安を「テンプレート独自」と明示 |
| j | `src/content/docs/adr/index.md`「運用ルール」1 | 「対象は「あとから変えにくい決定」: 技術選定、ライセンス、調査・表現の方針、プロセス上の原則など」 | **本プロジェクト自身の ADR 運用**。原則を ADR に入れている。テンプレートの h・i はこの文言の写しと読める |
| k | `template/.github/ISSUE_TEMPLATE/adr.yml` | 「あとから変えにくい決定。決定したら ADR を起票する」「1つ以上の代替案を挙げます。比較のない判断は判断ではありません」 | 同上 |

読み取れること。

- 本文(a・d)は「設計上の選択」、テンプレート(h・i・k)は「あとから変えにくい決定(方針・原則を含む)」で書く。**本文は規約を恒久層へ、選択を ADR へ分けているが(a)、テンプレートは方針・原則を ADR に入れる**。#251 の「ADR が立ち戻る先を代替させられている」は、この文言の差から生じうる
- 「可逆な決定を除く」に当たる規定は本文に無い。テンプレートの目安(i)は「作り直しに近ければ」で、可逆性に近いが語は違い、「テンプレート独自」と自ら書いている
- 5.7.3(`human-ai-boundary.md:640-648`)は「**本節は、リスク区分 R1 の決定と例外承認にのみ適用します**。それ以外の決定では、提示された案を読んで承認することで足ります」とし、2 案以上の比較を R1 に限る。一方、G-3 基準4(`gate-criteria.md:229`)とテンプレ2(`deliverable-templates.md:385`「## 比較した代替案(最低1つ)」)は、G-3 に掛かる選択の全部に代替案を求める。**比較を求める範囲が 2 通りある**(矛盾とまでは言えない。5.7.3 はゲート承認の記録一般、G-3 は技術設計の判定基準)

### 1.3 G-3 の判定対象と、ADR が置かれる位置(逐語)

| # | 所在 | 記述 | ADR の位置 |
| --- | --- | --- | --- |
| a | `deliverable-templates.md:40` | 「\| 判断記録(ADR) \| テンプレ2 \| 技術判断者・後任者 \| G-3 の判定対象、G-6 でコア機能の添付必須 \|」 | **判定対象** |
| b | `gate-criteria.md:222-230` G-3 の表 | 基準1「設計案の非機能欄」、基準2「恒久層(設計標準)との突合」、基準3「ADR の「戻せない選択」欄の記載」、基準4「ADR の比較表」、基準5「ADR の事業影響欄5項目…に空欄がないこと」 | 確認方法の所在。基準1 は**設計案**、基準3〜5 は ADR |
| c | `gate-criteria.md:244-254`「記載の検査」 | 「記述の質を機械判定して承認可否を決めてはなりません」「\| 記述の内容が妥当である \| しない \| 判定する \|」 | 欄の充足は機械の検査、妥当性は人 |
| d | `src/data/processes/integrated.yaml:240-250` | 「deliverables: [アーキテクチャ設計・技術選定案(AI生成+人レビュー済み), 判断記録(ADR)案]」「decisions: [承認 / 代替案の要求]」 | **設計案と ADR 案の 2 つ**。ADR は「案」 |
| e | 同 `:446-464` | 「summary: AI が設計案を生成し、技術判断者が判定する。判断理由は ADR に残す」「技術判断者が比較表を評価し、採用案・棄却案とその理由を ADR(判断記録)として記録する。…(技術設計判断ゲート g-tech-design の判定そのもの)」 | **判定の後に理由を残す先**。ただし「記録することが判定そのもの」とも読める |
| f | `exception-escalation.md:129-136` 第7章「後回しにできる対象」 | 「\| G-3 の判断記録(ADR) \| 可(記録のみ後追い。判断そのものは実施する) \|」 | **判断と記録を分けている**。ADR が判定対象なら、記録の後追いは「対象なしで判定した」ことになる |
| g | `phase5-implementation/label-mailbox.md:61`、`:84` | 「`state:needs-tech` \| 技術設計の判断(G-3)を要する状態。ADRの起草・採否、技術的トレードオフの評価」「\| `state:needs-tech` \| 技術判断者 \| G-3の判定記録を作成し、採否と却下理由をADRへ永続化 \|」 | ADR の「採否」を判定する(対象)とも、判定の後に永続化する先(証跡)とも書く |
| h | `human-ai-boundary.md:399` | 「\| 技術判断者 \| 定型的な技術選定。… \| 設計案と判断記録(ADR)の起案 \| 技術設計判断(G-3)の判定、… \|」 | AI が起案してよいのは設計案と ADR。判定は人 |
| i | `roles-responsibilities.md:814-829` 3.8.4 | 「**事業決裁者の決定は、技術的な正しさの承認ではなく、記載された事業影響の受容である。**」「事業影響を記述する様式は第6章 テンプレ2 …によります」 | ADR の事業影響欄は G-8 の受容の入力でもある |
| j | `qms-document-control.md:128` | 「設計・開発の管理と、設計・開発の変更 \| 第4章 G-2〜G-4(…判定記録)、判断記録(ADR)、…」 | QMS の**証跡**として列挙 |
| k | `template/.claude/skills/gate/gates/G-3.md:5` | 「- 判定の対象: 判断記録(ADR)`context/decisions/NNNN-*.md`(…作成は `/adr-write`)」 | **判定の対象** |
| l | 同 `:9-16` | 「判定基準ごとに、ADR の該当する欄の所在を表へ並べます。」「- 基準1: 非機能(性能・可用性・セキュリティ)の欄」「- 基準2: 恒久層の設計標準(`context/standards/`)との突合。食い違う箇所の一覧」 | テンプレートは**基準1 も ADR の欄**にしている(標準は「設計案の非機能欄」) |
| m | `template/.claude/skills/adr-write/SKILL.md:3` | 「description: あとから変えにくい決定を判断記録(ADR)として context/decisions/ へ残す。…技術設計判断(G-3)の判定対象。」 | 判定対象 |
| n | `template/.claude/skills/artifact/artifacts/02-adr.md` | 「読み手: 技術判断者(G-3 で判定する)、後任者、事業決裁者(事業影響の欄を読んで受容を判断する)」 | 判定対象 |

他のゲートとの対照。第6章の一覧は、企画書を「G-1 の判定対象」、機能仕様書を「G-2 / G-4 の判定対象」、実装計画を「G-4 の判定対象」、運用引き継ぎ文書を「G-7 の判定対象」と書く(`deliverable-templates.md:39-45`)。**ゲートごとに成果物を 1 つ判定対象に置くのは、一覧全体の書き方**である。G-3 だけ語を変えるなら、他のゲートでも「判定するのは成果物か、成果物が記す内容か」が同じ形で問われる。テンプレ4 の「対象」は「成果物の ID、PR の番号、コミットの識別子のいずれか」(`deliverable-templates.md:460`)で、判定記録の側は対象を成果物に限っていない。

ADR-0036 決定1 は「判定記録の作成をもって判定の成立とする」。**判定の証跡はテンプレ4 のゲート判定記録**である。ADR を「証跡」と呼ぶと、判定の証跡(判定記録)と、判断の内容の記録(ADR)の 2 つが同じ語に入る。語の整理は少なくとも 3 語(判定の対象 / 判定の材料 / 判定の証跡)を要する可能性がある。

### 1.4 G-6 基準3 と、ADR を名指しで参照している箇所

| # | 所在 | 記述 |
| --- | --- | --- |
| a | `gate-criteria.md:455` | 「\| 3 \| (コア機能のみ)設計意図の記録が完備 \| ADR・判断記録の添付確認 \|」。**基準の文は「設計意図の記録」で、確認方法が「ADR・判断記録」**。第6章は判断記録 = ADR と書くので、「ADR・判断記録」が 1 つか 2 つかは読めない |
| b | `review-guide.md:95` | 「- [ ] (コア機能のみ)設計意図の記録(ADR・判断記録)が完備している」 |
| c | `template/.claude/skills/gate/gates/G-6.md:12` | 「4. コア機能の変更では、判断記録(ADR)の添付を確かめる(基準3)」 |
| d | `template/context/decisions/README.md` 末尾 | 「コア機能の変更では、独立レビュー(G-6)で該当の ADR を添付します。」 |
| e | `template/templates/01-feature-spec.md:66` | 「- [ ] コア機能である(ADR の添付が G-6 で必須になる)」 |
| f | `template/.github/PULL_REQUEST_TEMPLATE.md:88` | 「- [ ] 設計上の選択を伴った場合、判断記録(ADR)を `context/decisions/` へ追加した」 |
| g | `phase6-operation/metrics.md:199` | 「\| 判断記録の充足 \| コア機能のADR完備率 \| コア機能を触った PR のうち `ADR:` トレーラ付きコミットを含む比率(git log) \|」 |
| h | `template/scripts/gate/aggregate-evidence.mjs:272`、`:3871` | 「`const adrs = listDir('context/decisions');`」「`R.push(\`- 判断記録(ADR): ${adrs.length} 件\`);`」(件数だけ。内容は見ない) |
| i | `lifecycle.md:294-295` 2.9.4 H-1 | 「\| 設計の背景と制約 \| … \| 判断記録(ADR) \|」「\| 却下した選択肢 \| … \| 判断記録(ADR)の代替案欄 \|」 |
| j | `roles-responsibilities.md:102`、`:245`(3.4.3) | 「\| 技術判断者 \| 執筆した ADR。選択肢の比較と却下理由が書かれているか \|」「\| 技術判断者 \| AI の案を見る前に書いた選択肢の比較(ADR の代替案の欄) \|」。**席の力量の確認の材料が ADR の代替案欄** |
| k | `roles-responsibilities.md:50` | 「\| 技術設計(ADR) \| C \| **A**/R \| …」(RACI) |
| l | `roles-responsibilities.md:1435`、`:1228` | 「引き継ぎの実体は**人ではなくコンテキスト基盤と判断記録(ADR)**に置く」「…判断記録(ADR)、運用手順は、自組織が管理するリポジトリに置く」 |
| m | `deliverable-templates.md:1058`、ADR-0018 決定8 | 「判断記録(ADR)とも統合しません。ADR は採用後に本文を書き換えない規約を持ちますが、**前提の充足状態は変化します**」 |
| n | ADR-0047(`0047-limit-is-default-not-cutoff.md:33-37`)、IMPL-0049 | 判断記録・機能仕様・設計文書を行数の算定から除く。「本標準は判断記録に「採らなかった選択肢とその理由」を求めます」 |

置き場を独立の ADR 以外へ寄せる案(3 章 論点3)は、a〜l の語と、h の集約の読み、g の指標の取り方を変える必要がある。

### 1.5 第2章のステージ別要否と「可逆」

- `lifecycle.md:154` の S0「G-3 の判定の対象とした選択」は、1.3 a(ADR = G-3 の判定対象)と合わせると循環する。**G-3 に掛ける選択がどれかを定める規定は、本文に無い**(G-3 の起動条件。`label-mailbox.md:61` は「技術設計の判断(G-3)を要する状態」とだけ書く)
- `tailoring-guide.md:429`「\| 技術設計判断(G-3) \| 適用 \| 適用 \| 適用 \| 適用 \|」、`:440`「S0 でも、技術設計判断(G-3)とリリース決裁(G-8)を適用します」(ADR-0063)
- ADR-0034 の「検討した選択肢」(`0034-stack-is-output-of-exploration.md:46`)は「**G-3 は S0 では「主要な選択のみ」に簡略化されており、簡略化された G-3 に確定を要求すると、簡略化の意味が失われる**」を退けた理由に使う。ADR-0063 は S0 の G-3 を「適用」とした。ADR-0034 はステータス「採用(2026-08-12)」のままで、ADR-0063 は ADR-0034 に触れない(`grep 0034` で該当なし)。**退けた理由の前提が変わっている**(決定本文の書き換えは要らないが、同じ案を再提起されたときの理由が立たない)
- 可逆性の語彙は、本文に既に 2 つある。3.8.1 のリスク区分(`roles-responsibilities.md:749-753`。R1「取り消しに相手方の同意を要する」、R2「自組織の判断のみで戻せる」、R3「取り消しが自動化された手段で完結する」)と、ADR-0053 決定1 の不可逆の基準「**取り消せない時間帯が存在すること**」。テンプレ2 の取り消しの可否(`deliverable-templates.md:401`「自動で戻せる / 人手で戻せる / 相手方の同意を要する」)は R の 3 区分と同じ並び
- ADR-0044 決定4(`0044-no-search-obligation-for-existing-parts.md:59-61`): 「テンプレ2 の「比較した代替案(最低1つ)」に、既存部品の案を含める条件を足しません。**R1 の判定そのものが自己申告であり、探索を避けたい者は R2 と申告できます**。適用範囲を閾値で切る形は、閾値の判定を自己申告にすることで要求そのものを無効化します。」(ただし 3.8.1 の区分の下限 `:759-767` が、その後に自己申告の穴を機械で一部塞いでいる)

### 1.6 矛盾・食い違いの一覧

| # | 食い違い | 新旧 | 備考 |
| --- | --- | --- | --- |
| 1 | 第6章「ADR = G-3 の判定対象」 対 第7章 7.4「G-3 の判断記録(ADR)は後回し可。判断そのものは実施する」 | 同時期(上書きの記録なし) | 第7章は判断と記録を分けて書く。第6章の読みでは、記録の後追い中は判定対象が無い |
| 2 | 第6章「判定対象」 対 Label Mailbox「判定記録を作成し、採否と却下理由を ADR へ永続化」 対 `integrated.yaml`「設計案+ADR 案」 | — | ADR が判定の入力か出力かが 3 通り |
| 3 | G-3 基準1「設計案の非機能欄」 対 第6章(設計案の行が無い) 対 テンプレート G-3.md「基準1: 非機能の欄」(ADR の欄) | テンプレートが新しい | 標準に設計案の様式が無いので、テンプレートは ADR へ寄せた |
| 4 | G-3 基準2「恒久層(設計標準)との突合」 対 `context/standards/` に様式なし・同梱は G-6 観点だけ・S0 は恒久層なし | — | #251 の指摘どおり |
| 5 | G-3 基準3「ADR の「戻せない選択」欄」 対 テンプレ2「## 可逆性 / 戻せる選択か: はい / いいえ」 対 テンプレート `02-adr.md`「後から変えられるか \| 変えられる / 変えにくい / 実質不可」 | — | 欄名が一致しない。`src/data/template-fields.yaml` の t2 は可逆性の欄を必須欄に登録していない(比較した代替案と事業影響の 4 欄だけ) |
| 6 | ADR の範囲: 本文「設計上の選択」(規約は恒久層) 対 テンプレート「方針、原則を含む」 | テンプレートは本プロジェクトの ADR 運用の写し | #251 の混同の出所になりうる |
| 7 | 5.7.3「比較は R1 と例外承認に限る。それ以外は提示された案を読んで承認で足りる」 対 G-3 基準4・テンプレ2「代替案を最低1つ」(全件) | — | 適用の層が違うので矛盾ではないが、R2・R3 の設計判断に比較を求めるかが 2 通りに読める |
| 8 | 2.6 ステージ表 S0「G-3 の判定の対象とした選択」 対 G-3 の起動条件の不在 | 2026-10-12 の改訂 | 「主要」を判定できる語に改めた結果、範囲の定義が G-3 へ移り、G-3 側に定義が無い |
| 9 | ADR-0034 の退けた案の理由(S0 の G-3 は簡略) 対 ADR-0063(S0 も G-3 適用) | ADR-0063 が新しい | ADR-0034 の決定本文は影響なし |
| 10 | `integrated.yaml` G-3 `decisions: [承認 / 代替案の要求]` 対 ADR-0036 決定2(通過 / 差し戻しの 2 値) | ADR-0036 が新しい | 本論点の範囲外だが、語の整理で触る箇所 |
| 11 | 第8章 CL 引き下げ「[ADR](/process-compass/adr/) として記録」 対 採用組織の判断記録(テンプレ2) | — | リンクが本標準自身の ADR 集を指す |
| 12 | G-6 基準3 確認方法「ADR・判断記録」 対 第6章「判断記録(ADR)」(同一物) | — | 1 つか 2 つか読めない |
| 13 | ステージ表 S2「全件必須」 | — | 何の全件かが書かれていない |

## 2. 世の中がどうなっているか

根拠水準は ADR-0026 の語彙で書く。規格・指針の規範は E1(間接)、意見は E0。取得日はすべて 2026-10-23(束の出典は各カードの `accessed` による。2026-09-24〜30)。

### 2.1 原則(立ち戻る先)を決定記録と別の層に置く型

**TOGAF 9「Architecture Principles」**(今回取得: `https://pubs.opengroup.org/architecture/togaf9-doc/m/chap20.html`。版の表示はページに無い。URL の `togaf9-doc` から TOGAF 9 系と判断。TOGAF 10 の該当箇所はログインが要り読めなかった)。

- 定義: 「Principles are general rules and guidelines, intended to be enduring and seldom amended」(束の旧版 SRC-0378#c1 と同文)
- 様式(Table 20-1): Name「Should both represent the essence of the rule as well as be easy to remember.」、Statement「Should succinctly and unambiguously communicate the fundamental rule.」、Rationale「Should highlight the business benefits of adhering to the principle, using business terminology.」、Implications「Should highlight the requirements, both for the business and IT, for carrying out the principle」
- 数: 「Principles should be few in number, future-oriented, and endorsed and championed by senior management.」「Too many principles can reduce the flexibility of the architecture.」「Many organizations prefer to define only high-level principles, and to limit the number to between 10 and 20.」
- 衝突と記録: 「Principles are inter-related, and need to be applied as a set.」「At times a decision will be required as to which principle will take precedence on a particular issue.」「The rationale for such decisions should always be documented.」
- 改廃: 「An amendment process should be established for adding, removing, or altering principles after they are ratified initially.」

**英国 CDDO(内閣府)の Architecture principles の手引き**(今回取得: `https://architecture.cddo.cabinetoffice.gov.uk/guidance/principles.html`。Alpha 版の表示があり、公式の GOV.UK ページではないと自ら書く。日付の記載なし。WebFetch の要約経由で、逐語は短い引用のみ確認)。

- 原則は「general rules and guidelines that inform and support decisions」で「enduring and seldom amended」
- 原則は「frame architecture decisions early, not to retrospectively justify them」のために使う
- 原則どうしが衝突する決定では、トレードオフを明示して記録する。決定は ADR の枠組みなど共有できる形で記録する
- 原則を spend controls・service assessments・design authorities・architecture review boards に組み込む。例外は「time-bound, documented and reviewed」
- 各原則は短い文・理由(why it matters)・含意(what it means in practice)で構成

**GOV.UK「Government Design Principles」**(今回取得: `https://gov.uk/guidance/government-design-principles`。最終更新 2025-04-02、要約経由)。見出し 11 個、各 1〜4 段落と事例 2 件。正式な目的の文は無い。**プロダクト(サービス)側の原則の公的な実例**で、決定記録とは別の頁に置かれる。

**束の既存の知見**: Microsoft は「Avoid making decision records design guides」(SRC-0366#c3)、AWS の経営層向け記事は「When your teams are stuck, encourage them to look at the principles」(SRC-0379#c1)、同記事は原則にも定期の見直しを求める(SRC-0379#c3)[FND-0062](E1)。NCDC は「抽象的な原則は反証不可能なまま積み上がり続ける」と ADR に原則を混ぜることを戒める(SRC-0381#c4、意見、E0)。

**分離に触れないもの**: Nygard 原典(SRC-0547)、MADR 4.0.0(SRC-0548。決定を「他の文書」から分けるが、原則は扱わない #c5)、Fowler の bliki「Architecture Decision Record」(今回取得: `https://www.martinfowler.com/bliki/ArchitectureDecisionRecord.html`、2026-03-24。原則と決定の区別は書かれていない。「Keep the ADR short and to the point - typically a single page」、受理後は「superseded」で置き換える)。

読み取り: 原則の層を持つ型は、**少数・長寿命・理由と含意つき・改廃手続を別に持つ・決定はそれに照らして記録する**、で揃う。どの文献も、原則の層を置いた効果を測っていない(E1)。原則の層を「誰が」持つかは、TOGAF は上級管理者の支持(endorsed and championed by senior management)、CDDO は企業アーキテクチャの担当、で、技術判断者に限らない。

### 2.2 決定の記録を規格がどう扱うか

**ISO/IEC/IEEE 42010:2022**(今回: 公開プレビュー `https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee42010%7Bed2.0%7Den.pdf` で目次だけ確認)。目次に「5.2.12 Architecture decisions and rationale」「6.10 Recording of architecture decisions and rationale」「6.10.1 Decision recording」「6.10.2 Rationale recording」がある。**本文(shall / should のどちらか、何を記録の対象とするか)は読めていない**。arc42 の解説(`https://quality.arc42.org/standards/iso-42010`、二次)は「The standard requires that decisions and their rationale be documented」と要約するが、規範の強さは確かめられない。Wikipedia(二次)は rationale の定義として「Architecture rationale records explanation, justification or reasoning about architecture decisions that have been made」を引く(出典は 42010 とするが原文は未確認)。目次に「principle」の項目は無い。

**ISO/IEC 12207:2008 6.3.3 意思決定管理プロセス**(今回: 転載 `https://fliphtml5.com/dxwhy/uhfe/ISO_12207-2008/49`。**旧版で、現行の 12207:2017 ではない。転載と原本の一致は未確認**)。

- 成果 a)「a decision-making strategy is defined;」、d)「the resolution, decision rationale and assumptions are captured and reported.」
- 6.3.3.3.2.1「The project shall select and declare the decision-making strategy for each decision situation.」
- 6.3.3.3.3.1「The project shall record, track, evaluate and report decision outcomes」

読み取り: 規格は「どの決定を、どの手続で決めるか」を**決定の状況ごとにプロジェクトが選んで宣言する**形にし、記録の様式や置き場を定めない。目的は SEBoK(`https://sebokwiki.org/wiki/Decision_Management`、15288:2015 を引用)によれば「…to provide a structured, analytical framework for objectively identifying, characterizing and evaluating a set of alternatives」。**代替案の評価は、決定管理の手続の中身に入っている**(12207:2017・15288:2023 の現行の文言は読めていない)。

**ISO/IEC/IEEE 15289:2019 5.1**(束 SRC-0377#c2、公開プレビュー): 情報項目は「unpublished but available in a repository for reference, divided into separate documents or volumes, or combined with other information items into one document」でも適合。規格の項目名の使用は適合の要件でない(#c3)。4.4 は情報項目の作成前に利用者の意思決定・作業の種類を考慮することを求める(#c1)[FND-0071](E1)。**置き場と分割は規格上自由で、読み手の決定が起点**。第 9〜10 章(記録の内容要求。decision record の項目があるか)は未読。

**Automotive SPICE 4.0 SWE.2**(束 SRC-0554): BP3「Document a rationale for the software architectural design decision.」。プロセス成果 4「The software architecture is agreed and communicated to all affected parties.」。同節に承認の語は無い [FND-0218](E1)。Note 8 は根拠の例に proven-in-use・再利用・make-or-buy を挙げ、代替案の比較を必須にしない(#c3)。

**SWEBOK v4.0**(今回: `https://mycourses.aalto.fi/pluginfile.php/2367766/mod_resource/content/3/swebok-v4.pdf`。**目次の見出しだけ読めた**。curl はプロキシで拒否、WebFetch は本文を抽出できなかった)。Software Architecture 章に「2.4 Architecture as Significant Decisions」、Software Design 章に「1.4 Software Design Principles」「4.6 Design Rationale」がある。本文は未確認。

**IPA 共通フレーム 2013**: 12207:2008 を基にした意思決定管理の節があるはずだが、今回の検索では本文に当たれなかった。デジタル庁・IPA の ADR の指針も見つからなかった。

### 2.3 ADR の対象を絞る基準

| 型 | 出典 | 逐語 | 水準 |
| --- | --- | --- | --- |
| 構造・品質特性・覆しにくさ | Nygard 原典(SRC-0547#c4) | 「We will keep a collection of records for "architecturally significant" decisions: those that affect the structure, non-functional characteristics, dependencies, interfaces, or construction techniques.」 | E1(意見に近い規範) |
| 同上 | Microsoft(SRC-0366#c2) | 「Only include choices that affect the system's structure, key quality attributes, or are difficult to reverse.」 | E1 |
| 影響範囲 | GDS の ADR 枠組み(SRC-0369#c2、#c3) | 「the ADR framework will only be mandated for cross-government and cross-public sector decisions.」「…without unnecessary overhead approval.」 | E1 |
| 可逆性で手続の重さを変える | Amazon 2016 年株主書簡(SRC-0145#c1) | 「Many decisions are reversible, two-way doors. Those decisions can use a light-weight process.」。同書簡は「The process becomes the proxy for the result you want」も警告する(#c3) | E0(経営者の見解) |
| 同上 | 国内 30 名規模のスタートアップ(SRC-0382#c2) | 「すべての決定を同じ重さで扱うと、レビューが渋滞して「ADRが開発を遅くする」という本末転倒が起きます。」。可逆/不可逆で重さと決定者を変えた | E2(単一事例、定量なし)[FND-0063] |
| アーキテクチャに影響するもの | 国内の解説(SRC-0383#c2) | 「ライブラリのマイナーバージョンアップや CSS のクラス名の命名規則は対象外だ。」。1〜2 人なら「Git のコミットメッセージで十分」(#c1) | E0 |
| ほぼ常に書く | Spotify の一部チーム(SRC-0551#c3) | 「When should I write an Architecture Decision Record? Almost always!」 | E0 |

可逆性で**記録を不要にする**先例は、束にも今回の検索にも無い。Amazon と国内 1 社は手続(重さ・決定者)を変えるのであって、記録の要否を変えるとは書いていない(国内 1 社は決定者を変えると述べる。記録を省くかは原文の範囲で不明)。

### 2.4 ADR を判定(承認)の対象にするか、記録として扱うか

束 TH05-Q2 の要約(再掲)。GDS は ADR を審査・承認にかけるが義務は横断的決定に限る(SRC-0369#c1・#c2)。AWS はチームのレビューで承認・手直し・却下し、却下にも理由を残し、承認済み ADR をコードレビューの根拠に使う(SRC-0367#c2・#c4・#c5)。Spotify の一部チームは合意を RFC・設計レビューで行い ADR は結論の記録(SRC-0551#c1)。Nygard の proposed / accepted は合意の有無で、承認者の手続は定めない(SRC-0547#c5)。ASPICE は承認手続を定めない(FND-0218)。どの側も結果(本数・滞留・設計品質)を報告していない(E1)。

後付けの ADR への警告: 「実装が終わってから体裁を整えるための「後出しADR」は、記録ではなくアリバイです。」(SRC-0382#c3)、「decision records are not valuable if they're just an after-the-fact forced paperwork requirement.」(SRC-0550#c3)。**本標準の第7章 7.4「記録のみ後追い」は、この警告と緊張関係にある**(本標準は判断の実施を条件にしている)。

### 2.5 置き場(独立文書か、ほかの成果物への同居か)

- 15289 は統合・分割・リポジトリ参照を適合と認める(2.2)
- MADR は `decisions/` のサブフォルダで他の文書から分ける(SRC-0548#c5)。リポジトリ構成は強制しない(#c3)
- Google Cloud はソース管理の ADR の主要な決定を wiki へ写す選択肢を示す(SRC-0368#c3)[FND-0072]
- 実案件 Filetto は 2026-08-14 に ADR のディレクトリを廃して決定の実体を仕様へ移した(SRC-0515#c3)。文書量は 21,116 行 → 14,484 行(−31%)。**効果(判断の漏れ・後任の追跡)の測定は無い**(TH05:161)
- 1〜2 人はコミットメッセージで十分(SRC-0383#c1、意見)対「書かれていない「決定の理由」は、AIにとって存在しないのと同じ」(SRC-0382#c4、意見)
- PR 本文・実装計画・ゲート判定記録へ設計判断を寄せる運用を、規範または指針として定めた文献は、今回の検索では見つからなかった

### 2.6 実証(design rationale 研究)

- **Falessi, Briand, Cantone, Capilla, Kruchten "The Value of Design Rationale Information"**(ACM TOSEM 22(3), 2013。今回: `https://pure.ul.ie/en/publications/the-value-of-design-rationale-information/` の抄録)。修士学生 75 名の統制実験 2 件。「the value of a DRD information item significantly depends on its category」。半数以上の場面で要求された項目だけを記録すると、全項目の約半分の文書になると報告。**全項目を記録する前提を、価値に基づいて削る方向の実証**(E2。学生、2013 年、AI 以前)
- **Nogueira, Silva, Conte "One Size Fits All? An Empirical Comparison of ADR Templates…"**(arXiv:2604.27333、2026-04-30。抄録)。5 様式(Tyree/Akerman、Nygard、arc42、Y-statements、MADR)を専門家判断で選別し、上位 2 つを学生の統制実験で比較。Nygard 型が総合点で MADR を上回った。人数は抄録に無い(E2。プレプリント)
- **Zdun ほか "Sustainable Architectural Design Decisions"**(IEEE Software, 2013。`https://eprints.cs.univie.ac.at/3775` の抄録のみ)。Y-statement の提案元。決定を持続させる基準を論じる。様式の本文は未読(E0〜E1)
- Wikipedia「Architectural decision」(二次)は、実務家の意思決定が非構造的で、遅延と漏れが生じるという Rekha・Muccini(2014、2018)の所見を引く。原典は未読
- **原則の層を置いた効果、ADR を判定対象から外した効果、可逆な決定を除いた効果を測った研究は見つからなかった**

### 2.7 外部と本標準の対応

| 論点 | 外部の主な型 | 本標準の現状 |
| --- | --- | --- |
| 立ち戻る先 | 原則の層を別に置く(TOGAF 9、CDDO、Microsoft、AWS)。少数・理由と含意・改廃手続 | 様式なし。`context/standards/` のラベルだけ。テンプレートは原則を ADR に入れると書く |
| 判定と記録 | 承認対象にする(GDS は範囲限定、AWS はチーム内)/ 記録とする(Spotify、Nygard、ASPICE) | ADR = G-3 の判定対象(第6章)。ただし第7章は判断と記録を分ける |
| 置き場 | 規格は自由(15289)。慣行は `decisions/` に分ける(MADR) | `context/decisions/`。9 か所以上が名指し |
| 対象の絞り込み | 構造・品質特性・覆しにくさ(Nygard、Microsoft)/ 影響範囲(GDS)/ 状況ごとに戦略を宣言(12207:2008) | 設計上の選択(本文)/ 方針・原則も(テンプレート)。可逆除外なし |
| 可逆性 | 手続の重さを変える(Amazon、国内 1 社) | R1〜R3 と ADR-0053 の語彙あり。5.7.3 は比較を R1 に限る |

## 3. 選択肢

推しは書かない。各論点の案は組み合わせられる(例: 論点1 の C と論点2 の B)。「既存 ADR との衝突」は、本文の書き換えや置き換えが要るかどうかで書く。

### 3.1 論点1: 立ち戻る先(原則・軸・ポリシー)を成果物として定義するか

| 案 | 内容 | 利点 | 欠点 | 既存 ADR との衝突 |
| --- | --- | --- | --- | --- |
| 1-A 現状維持 | 定義しない。`context/standards/` はラベルのまま | 新しい成果物を足さない(第8章「成果物を増やさない」系の判断と同じ向き) | G-3 基準2 の突合先が無いまま。テンプレートの「原則は ADR」が残る。#251 の事象は再発しうる | なし |
| 1-B 課さないと明記 | 「本標準は、プロダクトの原則・軸の成果物を定めない」と書き、G-3 基準2 の確認方法を「恒久層(用語集・設計標準・採用済みの判断記録)のうち、存在するもの」へ改める | 「書かれていない」と「課さない」を区別できる(コアポリシー)。却下を成果として残せる | 外部の原則の層の型(2.1)を採らない理由を書く必要がある。テンプレートの「原則は ADR」をどうするかは別に決める | ADR-0048(表の確認方法の列を変える。表が正本なので本文の改訂で足りる) |
| 1-C 恒久層の様式として定義 | 第5章 コンテキスト基盤に「プロダクトの原則」(名前・文・理由・含意。TOGAF 9 型)の様式と置き場(`context/standards/` 内)を置く。第6章の成果物一覧には入れない。G-3 基準2 の突合先とする | 規約と原則を恒久層へ、選択を ADR へ、という 2.6 の分け方と一致。ゲートを増やさない | 3.11.4 の指示資産の保守要求(200 行、追記の条件、四半期棚卸し、保管)が掛かるかを決める必要。所有者(文脈オーナー / 技術判断者 / 価値責任者)が決まっていない。小規模の初期構成(`context-base.md:244`)に入れるか | ADR-0025(保管・忘却の手続が原則にも掛かるか)。ADR-0040(テンプレートの必須欄に足すなら template-fields.yaml) |
| 1-D 第6章の成果物として新設 | テンプレ12 として様式を置き、ゲートとの関係を持たせる(例: G-1 の層2 の照合先、G-3 基準2 の突合先、SG で見直し)。記名者を決める | 「立ち戻る先」が成果物として監査で追える。決裁者が記名すれば「事業の軸」になる | 成果物と記名が 1 つ増える。#252(文書量)と逆向き。AI が書くと量が増える(FND-0066)。原則の改廃手続(TOGAF の amendment process)をどこに置くか | ADR-0010(`integrated.yaml` の成果物の追加が先)。ADR-0040。ADR-0057 の層1 と役割が重なりうる |
| 1-E 既存の成果物へ吸収 | 企画書(テンプレ6)か層1(テンプレ11)か D-0 に「判断の軸」欄を足す | 新しい成果物を作らない。記名者が既にいる | 企画書は案件ごと、層1 は組織に 1 つで、プロダクト単位の置き場とずれる。技術の原則(TOGAF の意味)は事業文書に入りにくい | ADR-0057(層1 は 1 ページ・5 項目。項目を足すなら補足が要る)。ADR-0031(企画書の構造) |
| 1-F 原則も ADR の一種として扱う | 原則を ADR の中で「原則」の種別として持ち、索引で引けるようにする(本プロジェクト自身の運用に近い) | テンプレートの現行の文言と一致。supersede の経路を流用できる | #251 の事業決裁者の不満(案が並ぶ)が残る。NCDC の「抽象的な原則は反証不可能なまま積み上がる」。索引は #272 の範囲 | ADR-0025・#272 の論点と重なる |
| 1-G G-3 基準2 の参照先だけ直す | 立ち戻る先の扱いは決めず、基準2 の確認方法を様式のある置き場(用語集・採用済みの判断記録・D-0 の前提)へ改める | 実在しない置き場を参照する欠陥だけを直す | #251 の要求1・2 に答えない。受入条件「置くか、置かないと決めたかが ADR に記録」を満たさない(単独では) | ADR-0048 |

### 3.2 論点2: G-3 の「判定対象」と「証跡」の語

| 案 | 内容 | 利点 | 欠点 | 既存 ADR との衝突 |
| --- | --- | --- | --- | --- |
| 2-A 現状維持 | ADR = G-3 の判定対象。欄の充足は判定でないことは「記載の検査」と 5.7.4 で既に書かれている | 第6章の一覧(ゲートごとに判定対象の成果物を 1 つ)と同じ形。他のゲートへ波及しない | 第7章 7.4・Label Mailbox・`integrated.yaml` との 3 通りの読みが残る(1.6 の 1・2) | なし |
| 2-B 判定対象 = 設計判断、ADR = 判定の材料 | 第4章・第6章で「G-3 が判定するのは技術上の選択。判断記録はその材料であり、判定の後は判断の内容の記録」と書き分ける。判定の証跡は判定記録(テンプレ4)と明記 | 第7章 7.4(判断と記録の分離)と整合。#253 要求1 に答える | 他のゲート(企画書・機能仕様書)も同じ語で書き直すかが問われる。書き直さないと G-3 だけ語が違う | ADR-0036(判定の証跡は判定記録、と既に決まっている。整合する方向)。ADR-0048(確認方法の列) |
| 2-C 判定対象 = 設計案、ADR = 判定後の記録 | `integrated.yaml` と Label Mailbox の読みに揃える。設計案の様式(基準1 の「非機能欄」を含む)を置く | G-3 基準1 の「設計案」の欠落(1.6 の 3)も同時に埋まる | 様式が 1 つ増える。設計案と ADR の欄が重複する(比較・可逆性・非機能)。「後出し ADR」(2.4)の形に近づく | ADR-0010(データが先)。ADR-0040 |
| 2-D 語を全ゲート共通で定義 | 第1章 1.4 に「判定の対象」「判定の材料」「判定の証跡」を定義し、第6章の一覧の列を「判定の対象」と「証跡」に分ける | G-3 だけの特例にならない。監査の読みが揃う | 全ゲートの行を見直す改訂になる。語を増やす(ADR-0062 の曖昧語の正本の扱い) | ADR-0062(用語の正本)。ADR-0036 |
| 2-E 第6章の一覧の文言だけ改める | 「G-3 の判定対象」を「G-3 の判定で確認する記録」に改め、テンプレート G-3.md の「判定の対象」を同じ語へ | 変更点が限られる | 語の定義が無いので、別の箇所で同じ揺れが再発しうる | なし |

### 3.3 論点3: 設計判断の記録の置き場

| 案 | 内容 | 利点 | 欠点 | 既存 ADR との衝突 |
| --- | --- | --- | --- | --- |
| 3-A 現状維持 | 独立の ADR を `context/decisions/` に置く | 1.4 の 9 か所以上を変えない。supersede の慣行(Nygard・AWS・Microsoft)と一致 | #253 の「判断ごとに 1 本」が残る(ただし範囲は論点4 で決まる) | なし |
| 3-B 内容要件だけを定め、置き場を問わない | テンプレ2 の必須欄(決定・代替案・可逆性・事業影響)を「判断記録の内容」として定め、独立文書・実装計画・判定記録・PR のどこに置いてもよいとする(15289 5.1 型)。所在を構成に宣言させる | 規格の作法と一致。案件が量を抑えられる | 集約(`aggregate-evidence`)・指標(`ADR:` トレーラ)・G-6 基準3 の機械の読みが所在ごとに要る。書き換えない規約(ADR)と書き換わる実装計画が同居し、ADR-0018 決定8 と同じ問題が起きる | ADR-0018 決定8 の論法(書き換えない記録と変わる状態を統合しない)。ADR-0040 |
| 3-C ゲート判定記録へ寄せる | G-3 の判定記録(テンプレ4)に設計判断の節(決定・代替案・可逆性・事業影響)を置き、ADR を作らない | 判定記録と ADR の 2 ファイルが 1 つになる(#252 の「1 判定 1 ファイル」と同じ向き) | 判定記録は判定ごと、決定は supersede で連鎖する。後任が「現在有効な決定」を引く経路が判定記録の束から必要になる。G-8 の受容の入力(3.8.4)が判定記録になる | ADR-0036(判定記録の成立要件は変えない)。3.8.4 と ADR-0024(事業影響の様式はテンプレ2) |
| 3-D 実装計画・機能仕様へ寄せる | 機能単位の設計判断は実装計画(テンプレ7)に置く(Filetto の措置) | 機能と判断が同じ所にある | 機能横断の決定(データストア、外部契約)の置き場が無い。実装計画は G-4 の判定対象で、G-3 と G-4 の境界が崩れる。2.9.4 の書き戻し先が機能の数だけ散る | ADR-0018 決定8 と同じ論法。2.9.4 |
| 3-E 区分で置き場を分ける | R1 の決定は独立の ADR、R2・R3 は PR 本文か実装計画の節で足りる | 5.7.3(比較は R1)と揃う。3.8.1 の区分の下限で自己申告を一部塞げる | 区分は変更ごと(ADR-0039)で、設計判断の単位と一致しない。G-6 基準3 の「コア機能」の軸とも別 | ADR-0039。ADR-0044 決定4 の論法(区分で適用範囲を切る) |
| 3-F 現状維持+「現状の正解」の要約を別に置く | ADR は経緯として残し、現在有効な決定の一覧(要約)を恒久層に置く | #251 の案件の措置に近い。#272 の分離と同じ向き | 要約と ADR の一致の検査が要る(派生物の一致の先例なし FND-0072) | #272 の範囲。ADR-0025 |

### 3.4 論点4: ADR にする基準に「可逆な決定を除く」を加えるか

| 案 | 内容 | 利点 | 欠点 | 既存 ADR との衝突 |
| --- | --- | --- | --- | --- |
| 4-A 現状維持 | 本文は「設計上の選択」+ステージ表。テンプレートは独自の目安(作り直しに近ければ)を持つ | 変更なし | テンプレートの目安が「テンプレート独自」のまま標準に根拠が無い(ADR-0064 の「スキルの規定は標準へ辿る」と緊張) | ADR-0064(要確認) |
| 4-B 課さないと明記 | 「可逆性で判断記録の要否を分けない」と書く。理由: 可逆性の評価は G-3 基準3 の中身であり、要否の判定へ前置すると評価が自己申告で済む | ADR-0044 決定4 の論法と一致。可逆性の評価を G-3 の中に保つ | #253 の「判断ごとに 1 本」に答えない。外部(Microsoft・Nygard)の絞り込みと逆向き | なし |
| 4-C 「可逆な決定を除く」を本文へ | 可逆の基準を 3.8.1 の R3(取り消しが自動化された手段で完結)か ADR-0053(取り消せない時間帯が無い)で定義し、その決定を ADR の対象外にする | 既存の語彙を使える。Microsoft の「difficult to reverse」と同じ向き | 可逆の判定が判定の前に起案者の自己申告で済む(ADR-0044 の指摘)。可逆を誤って申告した決定の扱いが要る。可逆な決定でも理由が後任に要る場合(SRC-0382#c4)を落とす | ADR-0044 決定4 と正面から当たる。ADR-0053(語の流用は整合) |
| 4-D 区分で重さを変える(記録は残す) | R1 は独立の ADR+代替案必須、R2 は簡略(代替案任意)、R3 は PR のトレーラ程度 | Amazon・国内 1 社の「重さを変える」型。記録を無くさない。5.7.3 と揃う | 区分は変更ごと(ADR-0039)。設計判断の区分をどう確定するか(3.8.1 の下限の規則はパスと変更種別から導く) | ADR-0039。ADR-0044(比較の範囲を区分で切る形) |
| 4-E 影響範囲で切る | 複数機能・コア機能・外部インタフェース・データ形式に影響する決定に限る(GDS 型) | 観測できる条件で書ける。コア指定・確約範囲の既存の語彙 | 影響範囲の判定も起案者の申告。S0 はコア指定なし(第8章 軸B)で範囲が空になる | ADR-0065(S0 の前提はコア指定なし) |
| 4-F テンプレートの目安を標準へ昇格 | 「あとで変えるとしたら作り直しに近ければ」を本文に置く | テンプレートと本文が一致する | 「作り直しに近い」は判定できない語(#310 で「主要」を退けた理由と同じ) | ADR-0063(曖昧語・規範の書き方) |
| 4-G 状況ごとに戦略を宣言させる | どの決定を ADR にするかの基準を、案件が開始時(G-1 か D-0)に宣言する(12207:2008 6.3.3.3.2.1 型)。標準は宣言を求めるだけ | 規格の作法と同じ。案件の規模に合わせられる | 宣言の妥当性を誰が判定するか。宣言で全部外せる経路(第8章「個別の判断で任意に省略しない」と緊張) | ADR-0028・0036(「無くてよいか」を問う欄は採らないと決定済み)と緊張 |

## 4. 会議体への問い

1. **#251 の「立ち戻る先」は、技術の原則(TOGAF の意味)か、事業の軸か、その両方か**。前者なら所有者は技術判断者か文脈オーナー、後者なら価値責任者か事業決裁者になる。#251 の発言者は事業決裁者である。誰が記名し、誰が改廃するのかを決めずに置き場だけ決められるか
2. **原則を置くなら、改廃の経路は ADR の supersede と同じか、別か**(TH05 の問い1 の再掲)。原則どうしが衝突したときの判断(TOGAF・CDDO は記録を求める)は ADR にするのか
3. **G-3 基準2「恒久層(設計標準)との突合」は、恒久層の無い S0 で何と突合するのか**。S0 でも G-3 を適用すると決めた(ADR-0063)以上、S0 の突合先を決める必要があるのではないか
4. **G-3 が判定するのは「選択」か「記録」か**。第7章 7.4 は記録の後追いを認め、判断の実施を条件にしている。この規定は「判定対象は選択」の読みを既に前提にしていないか。そうなら第6章の一覧の文言が誤りで、そうでないなら第7章の規定が判定対象なしの判定を認めていることになる
5. **語を G-3 だけで直すのか、全ゲートで直すのか**。第6章の一覧は全ゲートで「成果物 = 判定対象」と書く。G-3 だけ変えると、企画書(G-1)・機能仕様書(G-2/G-4)で同じ問いが残る
6. **G-3 基準1 の「設計案」は成果物なのか**。`integrated.yaml` は G-3 の成果物に設計案を挙げ、第6章には無い。テンプレートは ADR の欄で代えている。設計案を ADR に吸収したと決めるのか、別の成果物とするのか
7. **置き場を ADR 以外へ開くとき、書き換えない記録(ADR)と書き換わる成果物(実装計画)の同居を、ADR-0018 決定8 と同じ理由で退けるのか**。退けないなら、同居した記録の版をどう固定するのか
8. **可逆性で ADR の要否を切ると、可逆性の評価(G-3 基準3)が判定の前に起案者の申告で済む**。ADR-0044 決定4 は「閾値の判定を自己申告にすることで要求そのものを無効化する」として同じ形を退けた。3.8.1 の区分の下限(機械で導く)が、この論法をどこまで解消したか。解消していないなら、可逆除外(4-C)は採れるのか
9. **テンプレートの「方針・原則も ADR」(本プロジェクト自身の ADR 運用の写し)は、標準本文の「規約は恒久層、選択は ADR」と食い違う**。どちらが誤りか。本プロジェクトの ADR 運用(標準の策定)と、採用組織の判断記録(プロダクトの開発)を同じ規約にする理由はあるか

## 5. 確認できなかったこと

内部。

- `src/content/docs/phase4-process-design/` 以外の章(附属書、フェーズ1〜3、フェーズ6 の metrics 以外)で「ADR」「判断記録」を参照する全箇所は数えていない。1.4 は grep の結果から論点に掛かるものを選んだ
- ADR-0064(スキルの規定は標準へ辿る)の本文を読んでいない。`/adr-write` の「テンプレート独自」の目安がこの ADR の要求に照らして許されるかは未確認
- テンプレートの `scripts/gate/` が `context/standards/` を読むか(G-3 の材料として)は grep で見つからなかったが、全スクリプトを読んではいない
- Filetto の `context/standards/product-principles.md` の本文は読んでいない(#251 の起票の要旨による)。軸 7 つの中身と、ADR との重複の程度は未確認
- 第6章の一覧が「判定対象」を書いた経緯(どの ADR・Issue で決めたか)は調べていない
- 3.11.4(指示資産の保守要求)が恒久層の設計標準に掛かるかは、本文から読めなかった(1.1 の i)

外部。

- ISO/IEC/IEEE 42010:2022 の 5.2.12・6.10 の本文(shall か should か、記録の対象をどう絞るか)。目次だけ確認。二次(arc42、Wikipedia)の要約は「requires」と書くが規範の強さは未確認
- ISO/IEC/IEEE 12207:2017・15288:2023 の意思決定管理と、Architecture Definition / Design Definition の本文。2008 年版の転載と SEBoK の目的の引用だけ
- ISO/IEC/IEEE 15289:2019 の第 9〜10 章(decision record・design description の内容要求)
- SWEBOK v4.0 の 2.4「Architecture as Significant Decisions」、3.4.6「Design Rationale」の本文(目次だけ)
- TOGAF 10 の Architecture Principles(ログインが要る)。TOGAF 9 系のページで代えた
- IPA 共通フレーム 2013 の意思決定管理・方式設計の節。デジタル庁・IPA の ADR の指針(検索で見つからず)
- 米国政府(18F 等)の ADR の指針(検索で公式の文書に当たれなかった)
- CDDO の原則の手引きは Alpha 版で日付の記載が無い。逐語は要約経由の短い引用だけ
- Y-statement の原典(Zdun ほか 2013)の本文、Tang ほか(2006)の設計根拠の調査の本文、Rekha・Muccini の原典
- 原則の層を置いた効果、ADR を判定対象から外した効果、置き場を同居させた効果、可逆な決定を記録から除いた効果のいずれも、測定は見つからなかった
