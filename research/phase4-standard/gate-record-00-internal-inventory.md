# ゲート判定記録の成立要件 — 本標準の内部の棚卸し(#321)

- 作成日: 2026-10-23
- 位置づけ: [#321](https://github.com/Takenori-Kusaka/process-compass/issues/321) の会議体へ渡す突合の材料。**採否は書きません**。既存の規定・ADR・実装が何を言っているかを、実在する行だけで並べます
- 問い: 判定記録を `docs/gates/*.md` の別ファイルではなく、承認イベント(GitHub の PR レビューの承認など)で成立させてよいか
- 引用の書式: `ファイルパス:行番号` と、その行の短い抜粋。抜粋は行の一部であり、全文ではありません
- 同じ日に並行して作られている `research/phase4-standard/gate-record-01〜03-*.md`(外部調査)は、本メモの棚卸しの対象に含めていません

---

## 1. ADR

### ADR-0036 工程ゲートの判定は記録の作成をもって成立させ、語彙を2値に限る(採用 2026-08-13)

決定の要点は、判定記録の作成を成立要件に置き、Issue・PR・ラベルの操作を事務に落とすことです。記録の媒体(ファイルか否か)は、この ADR の本文に書かれていません。

- `src/content/docs/adr/0036-gate-closure-by-record.md:57` — 「工程ゲートの判定は、判定記録([第6章 テンプレ4]…)の作成をもって成立します。**記録の無い状態は未判定として扱います**」
- `src/content/docs/adr/0036-gate-closure-by-record.md:59` — 「Issue のクローズ、PR のマージ、ラベルの遷移は、いずれも判定の成立要件ではありません。判定の成立に伴う事務です」
- `src/content/docs/adr/0036-gate-closure-by-record.md:61` — 「記録がなければ判定の存在そのものが自己申告になるためです。ADR-0035 が自己申告による判定を排したのと同じ理由」
- `src/content/docs/adr/0036-gate-closure-by-record.md:101` — 却下案「Issue のクローズをもって判定の成立とする | 案件の課題管理ツールに依存する。ツールを変えると判定の成立要件が変わる」
- `src/content/docs/adr/0036-gate-closure-by-record.md:102` — 却下案「テンプレ4 を判定手続の正本と認める | … テンプレートは案件が改変できるため、統制の根拠にならない」
- `src/content/docs/adr/0036-gate-closure-by-record.md:103` — 却下案「判定記録の作成を事後の事務のままとする | 記録の無い判定を検出できない」
- `src/content/docs/adr/0036-gate-closure-by-record.md:22` — 経緯「準拠テンプレートには `gate-record` スキルとテンプレ4 があり、記録の様式も…そちらに書かれています」(規定と実行層の向きの逆転の是正が動機)
- 今回の問いへの効き方: 却下理由は「ツール依存」と「記録の無い判定を検出できない」の2つである。承認イベントは「事務」の列挙(クローズ・マージ・ラベル)に含まれていない。ただし却下理由の「ツールを変えると成立要件が変わる」は、承認イベントにも同じ形で掛かりうる

### ADR-0010 プロセスデータと規程本文の正本を要素ごとに分担する(採用 2026-08-05)

- `src/content/docs/adr/0010-data-doc-interface.md:31` — 「判定基準の内容・閾値・期限・様式・例外の扱いの正本はフェーズ4の各章」
- `src/content/docs/adr/0010-data-doc-interface.md:42` — 却下案の理由「監査時に提出するのは本文であり、単独で理解できる必要がある」
- 今回の問いへの効き方: 判定記録の「様式」の正本は第6章である。テンプレート側の置き方を変えても、様式の正本は動かない(ADR-0036:29 が、この向きの逆転を是正の理由に挙げている)

### ADR-0028 達成できないゲートを省略と区別し、未達として表示し続ける(採用 2026-08-08)

- `src/content/docs/adr/0028-unmet-gate-distinct-from-omitted.md:42` — 決定3「出荷判定の証跡と品質レポートにも必ず載せる。隠す経路を設けない」
- `src/content/docs/adr/0028-unmet-gate-distinct-from-omitted.md:45` — 決定6「代償措置…は記録するが、**未達の解消として扱わない**」
- `src/content/docs/adr/0028-unmet-gate-distinct-from-omitted.md:46` — 決定7「AI レビューは G-5 の拡張として置き、承認させず、合否条件にもしない」
- `src/content/docs/adr/0028-unmet-gate-distinct-from-omitted.md:63` — 「満たしている項目の妥当性は、ゲート判定の記録によります」
- 今回の問いへの効き方: AI・bot 名義の承認イベントは、どの形にしても判定に数えない(決定7)

### ADR-0035 兼務の禁止を実行主体の文脈で定義する(採用 2026-08-12)

- `src/content/docs/adr/0035-separation-by-execution-context.md:65` — 決定1「同一の成果物について、作成を指示した主体は、その成果物の判定者になりません」
- `src/content/docs/adr/0035-separation-by-execution-context.md:84` — 文脈の分離の条件3「認証情報(トークン。共有する場合は、権限の分離が成立していないものとして扱う)」
- `src/content/docs/adr/0035-separation-by-execution-context.md:57` — 「全レーンが同一アカウントの認証情報を共有する運用では成立しません」
- `src/content/docs/adr/0035-separation-by-execution-context.md:101` — 「**ファイルの形式と配置は標準では規定しません**。標準が規定するのは、実行主体が自らのロールを宣言し、その宣言が検査可能であることまで」(ロールの出力についての決定。判定記録についての決定ではない)
- 今回の問いへの効き方: 承認イベントは「アカウント」に紐づく。認証情報を AI と人が共有する体制では、承認イベントの名義が人の判断を示さない。この限界は ADR-0035 が既に書いている

### ADR-0039 適用範囲は見出しへ書き、案件ごとと変更ごとの判定を分ける(採用 2026-08-13)

- `src/content/docs/adr/0039-scope-in-heading-and-unit-of-judgement.md:24` — 「第6章のテンプレ4 は欄名の括弧書きで適用範囲を示しており、読み落としにくい形が標準の中に既にあります」
- `src/content/docs/adr/0039-scope-in-heading-and-unit-of-judgement.md:34` — 「リスク区分は変更ごと、安全重要度は案件ごとに判定する別の軸です」
- 今回の問いへの効き方: 判定記録の対象が「変更ごと」(G-6・区分の確定)か「案件・成果物ごと」(G-1〜G-4・G-7・G-8・SG)かで、PR に紐づくかどうかが分かれる。この区別の語彙は ADR-0039 にある

### ADR-0040 テンプレートの成果物様式を標準の様式の部分集合と定める(採用 2026-08-13)

- `src/content/docs/adr/0040-template-forms-as-subset-of-standard.md:34` — 「全文の一致を求めません。**必須欄の存在だけを求めます**。テンプレートは実行層の道具であり、記入の負荷を下げる簡略化に価値がある」
- `src/content/docs/adr/0040-template-forms-as-subset-of-standard.md:53` — 「欄を落とす場合は、`src/data/template-fields.yaml` の `omit` へ理由付きで登録します。**登録そのものが判断の記録になります**」
- `src/content/docs/adr/0040-template-forms-as-subset-of-standard.md:57` — 決定4「簡略化は**欄を落とすこと**に限ります。…標準と逆の指示を書く形は…逸脱として登録できる対象に含めません」
- 今回の問いへの効き方: 欄を承認イベントへ「移す」形は、欄を落とす(omit)とも、標準と逆の指示とも書かれていない。どちらに当たるかは決まっていない

### ADR-0058 規模の基準値の超過を、遮断でなく規模の確認と区分 R2 で扱う(採用 2026-10-11)

- `src/content/docs/adr/0058-size-over-is-confirmed-not-blocked.md:3` — 「同じ PR の中で人の確認を完結させる」
- `src/content/docs/adr/0058-size-over-is-confirmed-not-blocked.md:55` — 「新しい承認の仕組みは足しません。人の確認は、既存の区分の確定者と G-6 に任せます」
- `src/content/docs/adr/0058-size-over-is-confirmed-not-blocked.md:30` — 「1 名体制では、例外承認の承認者が作成者と別でなければならず、経路が閉じます」
- `src/content/docs/adr/0058-size-over-is-confirmed-not-blocked.md:110` — 却下案「日常の経路に例外承認(PR 2 本・承認 2 回)を残す | 1 名体制で閉じ、回避の動機を生む」
- `src/content/docs/adr/0058-size-over-is-confirmed-not-blocked.md:113` — 却下案「L1・L2 の宣言を自己申告のまま降ろす | 形骸化する。そのため宣言は記録とし…」
- 今回の問いへの効き方: 「別の PR を立てて記録を基底へ入れる」経路を、規模の超過については「PR 2 本・承認 2 回」として退けた先例である。人の確認の記録を本体の PR の中で完結させる形を採っている

### ADR-0067 承認者2名の目的を定め、2人目に目隠しを課さない(採用 2026-10-13)

- `src/content/docs/adr/0067-purpose-of-two-approvers.md:36` — 「承認者を2名とする目的は、1名の承認者の確認だけでは変更を取り込めない状態を作り、その記録を残すことです」
- `src/content/docs/adr/0067-purpose-of-two-approvers.md:50` — 「2人目に求める条件は、1人目と同じ4条件です(名簿の別の人、作成を指示した者でない、未達の体制では外部の確認者、本人の挙動要約)」
- `src/content/docs/adr/0067-purpose-of-two-approvers.md:52` — 「同一の変更で、先に数えた承認者の挙動要約と同一の文の挙動要約は、2件目に数えません。機械が見るのは文の同一だけです」
- `src/content/docs/adr/0067-purpose-of-two-approvers.md:58` — 「2件の承認は、2件の確認として数えます。合議の結論として1件に数えません」
- `src/content/docs/adr/0067-purpose-of-two-approvers.md:78` — 却下案「2人目の独立(目隠し)を要求事項にする | 見ていないことを、証跡で示せない」
- `src/content/docs/adr/0067-purpose-of-two-approvers.md:89` — 影響「G-5(`pr-rules`)と出荷の証跡の集約は、同一の文の挙動要約を2件目に数えない(IMPL-0112)」
- `src/content/docs/adr/0067-purpose-of-two-approvers.md:91` — 「テンプレ4 の行の題を『2人目の承認者』へ改めた。準拠テンプレートは、旧い題の判定記録も読む」
- 今回の問いへの効き方: G-6 の「承認」は PR レビューの承認と判定記録の両方で記録できる前提で書かれている。2件の承認を「記録」として残すことが目的に含まれる

### ADR-0054 結果責任を負う席と担い手を分ける(委任と承認の数え方)

- `src/content/docs/adr/0054-seat-accountable-performer.md:88` — 「ゲートの判定者は責任者(人)のままで、判定は記名の記録で成立します(ADR-0036)。AI の確認は検出の層です」
- `src/content/docs/adr/0054-seat-accountable-performer.md:177` — 「承認を独立した人の確認に数えるのは、次の4つをすべて満たす場合に限ります。条件は、第4章 G-6 の表と同じ」
- `src/content/docs/adr/0054-seat-accountable-performer.md:182` — 条件4「承認した者自身の書いた挙動要約を、承認に伴っている」
- `src/content/docs/adr/0054-seat-accountable-performer.md:188` — 「作成者本人による承認は、リポジトリのブランチ保護が止めます。ただし、変更の作成者が AI または bot である場合、ブランチ保護は、作成を指示した者の承認を止めません。止めるのは、出荷の証跡の集約です」
- `src/content/docs/adr/0054-seat-accountable-performer.md:45` — 「人の承認は、回数が増えるほど阻止率が下がる(FND-0010、E2。ベンダーの自己報告)」
- 今回の問いへの効き方: 「承認」の語が、承認イベント(PR レビュー)を指す文脈で使われている。強制層(ブランチ保護)が止められる範囲と止められない範囲が既に書かれている

### ADR-0057 組織として品質を保証する(補足の決定表を含む)

- `src/content/docs/adr/0057-organizational-quality-assurance.md:378` — S31「G-5 の PR 単位の検査は、PR のレビューを読めるとき同じ条件で承認者の数を出し…合否にはしない(レビューの前に走るため。合否は出荷の集約が担う)」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:391` — 却下案「G-5 で承認者の数を合否にする | `pr-rules` は push・本文の編集の時点で走り、承認はその後に付く。…レビューの事象で再実行する案は、同じ検査名の後の実行が先の実行(テストの失敗)を上書きし、必須チェックの意味を壊す」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:390` — 却下案「G-6 の2名を、出荷判定者が PR の承認者を突合する手順書だけで代える | 査察で『2名が確認した』ことを示すのは記録である」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:392` — 却下案「2人目の判定者を、別の判定記録でだけ記録させ…| 別の記録でも1人が2枚を書ける。1枚に置いても別の記録でも、機械が止められる範囲は同じ(記名と挙動要約の有無)…どちらの形も認め、1人目が2人目の欄を埋めることを禁じる」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:476` — S52「承認レビューの本文、判定記録の『挙動要約』の節、監査対応書式の『2人目の挙動要約』を同じ関数で読み…機械が見るのは形だけ」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:477` — S53「承認・判定記録と名簿の対応づけを、承認・判定の時点の名簿で行う。現在の名簿に無い承認者は、PR を取り込む前の構成(マージコミットの親)の名簿から…」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:489` — 却下案「独立した安全性の評価の記録を `docs/gates/` に置く | 判定記録として読まれ、様式の不一致(判定者・結果の欄)が記載の欠落になる」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:490` — 却下案「名簿に離脱の欄(`leftAt`)を足し…| 離脱の日付は人が書く値であり、承認の後に書き換えられる。git の履歴にある当時の構成は書き換えられない」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:491` — 「査察では PR のレビューと判定記録が実在するため、記録と機械の判定が食い違う」
- `src/content/docs/adr/0057-organizational-quality-assurance.md:509` — 却下案「層1 の改版にも PR を課す | D-0・構成書と同じく、記名者の改版は記録だけのコミットである。PR を課すと層1 の改版に別の承認者が要ることになり、記名の意味(本 ADR の決定)と二重になる」
- 今回の問いへの効き方: (1) 記録だけの変更に PR と別の承認者を課すと記名と二重になる、という判断を層1 について既に下している。(2) 人が書く値は事後に書き換えられ、ホスティング・git の履歴は書き換えにくい、という対比を既に使っている。(3) 一方で、承認イベントを G-5 の合否に使う案は、実行の時点の制約で退けている

### ADR-0056 品質保証の論証

- `src/content/docs/adr/0056-assurance-argument.md:142` — 「承認の件数や署名では示しません。検出能力の実測、統制が作動した記録…で示します」
- `src/content/docs/adr/0056-assurance-argument.md:165` — 却下案「承認ごとに『何を確かめたか』の署名様式を足す | 検出能力を示さない書類が1枚増える」
- `src/content/docs/adr/0056-assurance-argument.md:132` — 「リスク区分を確定した者を、判定記録へ記名する(第3章 3.8.1)」
- 今回の問いへの効き方: 承認ごとの書類を足す方向は退けている。帳票を増やさないことと、記録の信頼性を示す手段が別であることを既に書いている

### ADR-0059 承認の比率を AI自律レベルの引き下げの検知条件に置かない(採用)

- `src/content/docs/adr/0059-no-approval-ratio-trigger.md:30` — 「形の検査は、意味の無い8文字を挙動要約に数える…分子から外れる最短の経路が『8文字書く』になる」
- `src/content/docs/adr/0059-no-approval-ratio-trigger.md:52` — 「形骸化の検知は、欠陥注入による検出能力の測定(第5章 5.6.2)と承認権限の一時制限(第7章 7.9)…が担います」
- 今回の問いへの効き方: 挙動要約の形の検査は中身を保証しないことを、標準が自ら認めている。承認イベントの本文で挙動要約を読む場合も同じ限界が掛かる

### ADR-0060 起案の文脈と独立の2層

- `src/content/docs/adr/0060-drafting-context-and-two-layer-independence.md:21` — 規則データ `sep-self-approval`「起案した主体が判定すれば、判定は自己申告になる」
- `src/content/docs/adr/0060-drafting-context-and-two-layer-independence.md:58` — 「G-2、G-3、G-4、G-7 を、成果物の結果責任者が判定することは、禁じません。…別の人による確認ではありません」
- `src/content/docs/adr/0060-drafting-context-and-two-layer-independence.md:83` — 変更ごとの条件「変更を確認して承認した人が、その変更の作成を指示した者と別の自然人である | 出荷の時点。承認者と指示者の記録」
- 今回の問いへの効き方: G-2・G-3・G-4・G-7 は判定者が成果物の作成側に近い。PR の承認イベントに寄せると、作成者が自分の PR を承認できないブランチ保護の規則と、この「禁じない」がぶつかる可能性がある(判定者が仕様の PR の作成者である場合)

### ADR-0066 出荷判定者の独立と開発ライン

- `src/content/docs/adr/0066-shipping-approver-separation-and-development-line.md:53` — 「出荷判定(G-7)を記名した人が、範囲内の変更の作成を指示した者でも、G-6 の承認者でもないこと」
- `src/content/docs/adr/0066-shipping-approver-separation-and-development-line.md:106` — 「出荷判定を記名した人を、記録に現れた指示者と G-6 の承認者に照らす(IMPL-0113)。記録に現れない関与は確かめない」

### ADR-0050 強制層の水準を事業ステージで動かさない

- `src/content/docs/adr/0050-enforcement-layer-is-not-staged.md:20` — 事象3「承認前に証跡を要求するフックが、証跡の有効期限との組み合わせでマージを止め続けた」
- `src/content/docs/adr/0050-enforcement-layer-is-not-staged.md:30` — 「強制層は『違反を許容できない規則』の置き場です。第5章は『強制層に置けない項目は、遮断できたものとして扱いません』と定めます」
- `src/content/docs/adr/0050-enforcement-layer-is-not-staged.md:60` — 「強制層に置く規則の選び方の誤り — 許容できる違反を強制層へ置いている。規則を強制層から外す」
- 今回の問いへの効き方: 強制層が実務を止めた場合の扱い方(段階で緩めず、置く規則の選び方を直す)が既に決まっている。#321 の摩擦(承認の失効・ブランチ更新)は、この型で扱える候補である

### その他の関連 ADR

- `src/content/docs/adr/0023-review-package-cues-not-conclusions.md:32` — 「パス3(挙動要約)ではパッケージを閉じる。参照しながら書いた要約は、レビュア自身の理解の証明にならない」
- `src/content/docs/adr/0023-review-package-cues-not-conclusions.md:42` — 却下案「AI に変更の要約を生成させ、レビュアはそれを読んで確認する — …附属書C が禁じている『AI 転記による挙動要約』と実質的に同じ」
- `src/content/docs/adr/0029-shipping-approver-merge-exception.md:38` — 「G-7 の判定記録を必須とし、基準の各項目との突合を記録に残すこと」
- `src/content/docs/adr/0055-team-change-points.md:91` — 「成立済みの判定記録は書き換えません(ADR-0036)。変化点をまたぐ未完了の判定は、新しい体制の判定者が引き継ぎます」
- `src/content/docs/adr/0055-team-change-points.md:155` — 「宣言と実態のずれを機械で検出します。対象は、宣言した人数と直近の承認者の数…判定記録が参照する D-0 の版と構成の D-0 の版」
- `src/content/docs/adr/0063-normative-informative-and-verbal-forms.md:66` — 「受入基準の確定を、第4章 G-2 に書きます。確定は、人が版を特定して判定記録へ記名する行為です」
- `src/content/docs/adr/0069-handing-over-judgements-and-contractual-confirmation.md:18` — 「置き先、強制層の所有、受領する記録を、締結時に決めさせます」(受託で判定を別の組織に置く場合。承認イベントの持ち主がどちらの組織かに関わる)
- `src/content/docs/adr/0038-detection-handoff-of-control-weakening.md:46` — 統制の弱化の対象「遮断の解除・閾値の緩和・強制層の縮小」(ルールセットの承認数・失効の設定を変える場合に掛かる)

---

## 2. 標準本文

### 2.1 第4章 ゲートと判定基準(`gate-criteria.md`)

ゲート運用の共通ルール:

- `src/content/docs/phase4-process-design/gate-criteria.md:50` — 共通ルール1「単独判定: 判定者は1人。…承認者を2名とする独立レビュー(G-6)でも、判定会議は開かない。2件の承認は、2件の確認として数える」
- `src/content/docs/phase4-process-design/gate-criteria.md:51` — 共通ルール2「期限超過は『自動承認』にはせず、エスカレーション」
- `src/content/docs/phase4-process-design/gate-criteria.md:53` — 共通ルール4「記録をもって成立する: 判定結果・判定者・日時・差し戻し理由を判定記録へ書く。**記録の作成が判定の成立要件である**」

判定の成立:

- `src/content/docs/phase4-process-design/gate-criteria.md:57` — 「工程ゲートの判定は、**判定記録の作成をもって成立します**(第6章 テンプレ4)。記録の無い状態は、判定基準がすべて充足していても**未判定**です」
- `src/content/docs/phase4-process-design/gate-criteria.md:65` — 成立要件の行「判定記録の作成。判定者・判定日時・結果・確認した項目・差し戻し理由が埋まっていること」
- `src/content/docs/phase4-process-design/gate-criteria.md:66` — 事務の行「Issue のクローズ、PR のマージ、状態ラベルの遷移、関係者への通知」
- `src/content/docs/phase4-process-design/gate-criteria.md:68` — 「判定材料が揃い、レビューが済み、課題が閉じられた状態は、判定が行われた証拠になりません。判定の有無を後から確かめられる痕跡は記録だけです」
- `src/content/docs/phase4-process-design/gate-criteria.md:70` — 「事務を成立要件に置かない理由は、案件の課題管理ツールに依存するためです。ツールを変えると判定の成立要件が変わる構成にしてはなりません」
- `src/content/docs/phase4-process-design/gate-criteria.md:72` — 「記録を書かないまま次工程へ進んだ場合は…未判定のまま進んだものとして扱います。…出荷判定(G-7)における判定記録の完備確認で検出します」
- 注: 成立要件は「判定者・判定日時・結果・確認した項目・差し戻し理由が埋まっていること」であり、媒体・置き場は書かれていない。「PR のレビューの承認」は事務の列挙にも成立要件の列挙にも現れない

判定の語彙と範囲:

- `src/content/docs/phase4-process-design/gate-criteria.md:78` — 「工程ゲートの判定は、次の2値のいずれかです」(通過 / 差し戻し)
- `src/content/docs/phase4-process-design/gate-criteria.md:85` — 差し戻しで同時に確定させる事項「満たさない判定基準の項目番号、再提出の期限」
- `src/content/docs/phase4-process-design/gate-criteria.md:93` — 「『条件付き通過』を設けません」
- `src/content/docs/phase4-process-design/gate-criteria.md:97` — 「判定者が評価するのは、当該ゲートの判定基準と、全ゲート共通の通過条件だけです」
- 注: GitHub のレビューの状態は承認(APPROVED)・変更要求(CHANGES_REQUESTED)・コメントであり、変更要求は「満たさない項目番号・再提出の期限」を欄として持たない。2値の語彙との対応は、どこにも書かれていない

G-6 の挙動要約と承認者数:

- `src/content/docs/phase4-process-design/gate-criteria.md:454` — 基準2「レビュアが挙動を自分の言葉で説明できる | 承認コメントに1〜2文の挙動要約を必須記載」
- `src/content/docs/phase4-process-design/gate-criteria.md:456` — 基準4「作成者本人の承認は、ブランチ保護で機械強制。作成者が AI・bot の変更は、出荷の証跡の集約で確認」
- `src/content/docs/phase4-process-design/gate-criteria.md:459` — 「基準2の『挙動要約の必須記載』は、見ずに承認する状態の抑止装置です。要約が書けない承認は差し戻し扱いにします」
- `src/content/docs/phase4-process-design/gate-criteria.md:463` — 「**基準4 を、ブランチ保護だけでは強制できません**」
- `src/content/docs/phase4-process-design/gate-criteria.md:465` — 「承認を独立した人の確認に数えるのは、次の条件をすべて満たす場合に限ります。承認の操作があったことだけでは数えません」
- `src/content/docs/phase4-process-design/gate-criteria.md:472` — 条件4「承認した者自身の書いた挙動要約を、承認に伴っている(基準2)…作成側が書く検証の記載は、挙動要約に数えない」
- `src/content/docs/phase4-process-design/gate-criteria.md:474` — 「承認は、承認者ごとの最後の状態で数える。承認の後に同じ人が変更要求を出した場合、取り下げられた承認は数えない」
- `src/content/docs/phase4-process-design/gate-criteria.md:477` — 「AI と bot の名義による承認は数えない」
- `src/content/docs/phase4-process-design/gate-criteria.md:480` — 「2人目は、2件目の承認(自分の挙動要約つき)、2人目自身の判定記録、または判定記録の監査対応書式の『2人目の承認者』の行…で記録する。1人目が2人目の欄を埋めてはならない」
- `src/content/docs/phase4-process-design/gate-criteria.md:481` — 「承認者を2名とする目的は、1名の承認者の確認だけでは変更を取り込めない状態を作り、その記録を残すことである」
- `src/content/docs/phase4-process-design/gate-criteria.md:483` — 「先に数えた承認者の挙動要約と同一の文の挙動要約は、2件目に数えない。機械が見るのは文の同一だけであり、言い換えた写しは検出しない(内部監査の抜き取り)」
- `src/content/docs/phase4-process-design/gate-criteria.md:492` — 「条件4 の挙動要約として機械が数える最低限の形は、承認の語だけでないこと…と、見出し語を除いた本文が 8 文字以上あること」
- `src/content/docs/phase4-process-design/gate-criteria.md:493` — 「条件1 の対応づけは、承認・判定の時点の名簿で行う」
- 注: G-6 では「承認(承認レビュー)」が、判定記録と並ぶ記録の形として本文に既に書かれている(480 行)

G-7 の完備確認:

- `src/content/docs/phase4-process-design/gate-criteria.md:565` — 基準5「全ゲートの通過記録 | 欠落 0 件」
- `src/content/docs/phase4-process-design/gate-criteria.md:584` — 「G-6 を適用する体制の、上記以外の変更 | **記録の欠落として扱い、差し戻す**。…作成を指示した本人だけが承認した変更、名簿と対応づけられない者が承認した変更、挙動要約を伴わない承認だけの変更が当たる」
- `src/content/docs/phase4-process-design/gate-criteria.md:588` — 「差し戻された変更は、独立した人が確認し、G-6 の判定記録を残したうえで突合し直します。…正規の経路を置かないと、記録を偽る動機が生じるためです」
- `src/content/docs/phase4-process-design/gate-criteria.md:594` — 例外承認の対応づけ条件1「記録が、当該の変更を対象として明示している。PR の番号、またはコミットの識別子で示す」

帯域を理由に判定を省略しない:

- `src/content/docs/phase4-process-design/gate-criteria.md:1206` — 「レビュア側の帯域が不足していることは、**独立レビュー(G-6)を省略する理由になりません**」
- `src/content/docs/phase4-process-design/gate-criteria.md:1208` — 「**判定の時点を移す別の経路を新設しません**。同じ結果を導く手続を2つ持つと、条件の緩いほうだけが使われます」
- `src/content/docs/phase4-process-design/gate-criteria.md:1210`〜`1214` — 帯域の不足への手段「分割の総量を減らす / 判定に要する労力を下げる(レビューパッケージ)/ 判定できる人数を増やす」
- 注: 「判定に要する労力を下げる」は手段として既にある。記録の事務の労力を下げることは、ここに列挙されていない

### 2.2 第7章 例外・エスカレーション(`exception-escalation.md`)

- `src/content/docs/phase4-process-design/exception-escalation.md:32` — 7.3 要求事項1「例外承認の権限を持つ者が、記名により承認する」
- `src/content/docs/phase4-process-design/exception-escalation.md:40` — 「**本節が、条件を付して先へ進める手続です**」
- `src/content/docs/phase4-process-design/exception-escalation.md:44` — 「例外承認の記録は、技術負債台帳(第6章 テンプレ3)へ区分『例外』として置きます」
- `src/content/docs/phase4-process-design/exception-escalation.md:50` — 「承認した者 | 例外承認の権限を持つ者の記名。記録した者とは別の欄に書く」
- `src/content/docs/phase4-process-design/exception-escalation.md:57` — 「承認した者の欄を記録した者の欄と分けるのは、台帳へ書き込んだ者と、承認の権限を持つ者が別でありうるためである」
- `src/content/docs/phase4-process-design/exception-escalation.md:58` — 「規模の基準値の超過には、本節の例外承認を要さない」
- `src/content/docs/phase4-process-design/exception-escalation.md:414`〜`416` — 7.8「出荷判定において、全件の状態を突合できる形式で保持する / 回収済みの項目と未回収の項目を区別できる / 案件の完了後も、監査の求めに応じて提示できる期間にわたり保管する」(例外承認とエスカレーションの記録についての要求。ゲート判定記録一般の保管期間の規定ではない)
- `src/content/docs/phase4-process-design/exception-escalation.md:594` — 7.11 要求事項1「申し立てには記名を要する」
- `src/content/docs/phase4-process-design/exception-escalation.md:596` — 要求事項3「保留の解除は…記名と理由で行う。AI の名義の記名を受け付けない」
- `src/content/docs/phase4-process-design/exception-escalation.md:607` — 「マージ(変更) | 受信箱のラベルが、G-5 の必須チェックを失敗させる | 止まる。ラベルを外しただけでは解けない」
- `src/content/docs/phase4-process-design/exception-escalation.md:619` — 「申し立てた者と解除の権限者が同一人物である体制(1名体制など)では、その旨を記録する。解除の記名は省かない」
- 注: 「記録した者」と「承認した者」を分ける考え方(57 行)は、#321 の「属性(誰が承認したか)」と「書いた者」の分離と同じ構造を持つ

### 2.3 第5章 Label Mailbox「ゲート判定の成立とラベルの遷移」(`phase5-implementation/label-mailbox.md`)

- `src/content/docs/phase5-implementation/label-mailbox.md:217` — 「**ラベルの遷移は、ゲート判定の成立要件ではない。** 判定は判定記録の作成をもって成立する」
- `src/content/docs/phase5-implementation/label-mailbox.md:221` — 「順序を次のとおり固定する。**逆にしてはならない。**」
- `src/content/docs/phase5-implementation/label-mailbox.md:225` — 図「判定基準との突合 → 判定記録の作成<br>docs/gates/ → ラベルの遷移 → Issue / PR の事務」(置き場 `docs/gates/` が図の中に書かれている)
- `src/content/docs/phase5-implementation/label-mailbox.md:230` — 「記録が後追いになれば、判定者が実際に基準と突き合わせたかどうかを誰も確かめられない」
- `src/content/docs/phase5-implementation/label-mailbox.md:235` — 「ラベルが遷移しており、判定記録が無い | **未判定のまま次工程へ渡っている**」

### 2.4 第6章 テンプレ4(`deliverable-templates.md`)

- `src/content/docs/phase4-process-design/deliverable-templates.md:42` — 成果物一覧「ゲート判定記録 | テンプレ4 | QA・監査 | 全ゲートで作成、G-7 で完備確認」
- `src/content/docs/phase4-process-design/deliverable-templates.md:460` — 「対象は、成果物の ID、PR の番号、コミットの識別子のいずれかで書く。G-2・G-4 の判定記録は…確定した受入基準の版のコミットの識別子を書く」
- `src/content/docs/phase4-process-design/deliverable-templates.md:462` — 「判定者: <氏名> / 提出日時: ... / 判定日時: ...(滞留時間の計測に使用)」
- `src/content/docs/phase4-process-design/deliverable-templates.md:463` — 「参照した D-0 の版: <版>」
- `src/content/docs/phase4-process-design/deliverable-templates.md:465` — 「変更のリスク区分…(確定した者: <氏名…>)」
- `src/content/docs/phase4-process-design/deliverable-templates.md:467` — 「非同期コメント期間: <開始〜終了>(コメント数: N件)」
- `src/content/docs/phase4-process-design/deliverable-templates.md:470` — 判定結果「通過 / 差し戻し」
- `src/content/docs/phase4-process-design/deliverable-templates.md:476` — 確定の形態「人確定 / 協働 / 委任」
- `src/content/docs/phase4-process-design/deliverable-templates.md:493` — 挙動要約「<レビュアが自分の言葉で1〜2文>」
- `src/content/docs/phase4-process-design/deliverable-templates.md:503` — 「**規制業(第8章 軸C)では、PR の承認だけでは記録にならない**。変更ごとに G-6 の判定記録を残し、この表を埋める」
- `src/content/docs/phase4-process-design/deliverable-templates.md:511` — 決断の記録「確認していない事項 | <確認しなかった範囲。『なし』は不可>」
- `src/content/docs/phase4-process-design/deliverable-templates.md:564` — 「『確認していない事項』が空欄、または『なし』と記載された記録は無効です」
- `src/content/docs/phase4-process-design/deliverable-templates.md:572` — 「解除の記録は、保留した PR の中ではなく、既定ブランチへ先に入れます。ラベルを外しただけでは解除になりません」
- `src/content/docs/phase4-process-design/deliverable-templates.md:582` — 「PR を経ていないコミットで、…書き忘れた場合は、本様式の判定記録で確定してよいものとします。…成立済みのコミットを書き換えないための経路です」
- `src/content/docs/phase4-process-design/deliverable-templates.md:1486` — 「判定記録(テンプレ4)がそのまま監査証跡になり、出荷判定(G-7)の突合対象になる」
- 注: テンプレ4 の欄は「属性」(判定者・提出日時・判定日時・対象・結果・D-0 の版・区分の確定者)と「判断の中身」(確認した項目・差し戻し理由・挙動要約・決断の記録)が1枚に混在している。503 行の「規制業では PR の承認だけでは記録にならない」は、裏返すと規制業以外では PR の承認が G-6 の記録になりうることを前提にした文である

D-0 の記録の要求事項(承認イベントで属性を満たす先例):

- `src/content/docs/phase4-process-design/deliverable-templates.md:331` — 要求事項1「承認者を後から同定できる | 口頭の合意は監査証拠として扱えない」
- `src/content/docs/phase4-process-design/deliverable-templates.md:332` — 要求事項2「承認の日時が記録されている」
- `src/content/docs/phase4-process-design/deliverable-templates.md:334` — 要求事項4「変更の履歴が保持され、過去の版を隠蔽しない | 改ざんの有無を検証できる必要がある」
- `src/content/docs/phase4-process-design/deliverable-templates.md:338` — 「Git 上で管理する場合の具体的な構成では、要求事項1を所有者定義による承認、要求事項2をマージ日時、要求事項3を申請様式への明記、要求事項4を版管理で満たします」

### 2.5 第3章 実施体制(`roles-responsibilities.md`)

3.5 兼務:

- `src/content/docs/phase4-process-design/roles-responsibilities.md:307` — 「作成指示者 × 独立レビュア(同一成果物) | **禁止** | …ブランチ保護と、出荷の証跡の集約で強制する」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:346` — 「『作成指示者 × 独立レビュア』の禁止は、2つの層で強制します。**ブランチ保護だけでは止まらない経路があります**」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:350` — 「ブランチ保護 | 変更の作成者本人による承認 | 作成者が AI または bot である変更への、作成を指示した者の承認」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:353` — 「この形を止めるのは、マージの時点ではなく、出荷判定の時点です」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:556` — 3.5.4「独立(変更ごとの条件) | 確認した人 | 変更を確認して承認した人が、その変更の作成を指示した者と別の自然人である」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:560` — 「変更ごとの条件は、出荷の時点に、承認者と指示者の記録で確かめます」

3.8.1 区分の確定者:

- `src/content/docs/phase4-process-design/roles-responsibilities.md:757` — 「**区分を確定した者を、判定記録へ記名します**。誰が確定したかを、後から確かめられる状態にするためです」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:767` — 要求事項3「R1・R2 の区分は、作成を指示した者以外の自然人が確定し、記名する。指示した者だけの記名、または AI の名義の記名で確定した R1・R2 の区分は、確定していないものとして G-5 で失敗させる」
- `src/content/docs/phase4-process-design/roles-responsibilities.md:776` — IMPL-0062「R1・R2 の区分に、作成を指示した者以外の名簿の人による確定の記名(AI の名義でない)が無い PR を失敗させる」(確定の記名は PR 本文で行われている)
- `src/content/docs/phase4-process-design/roles-responsibilities.md:808` — 3.8.3「決定 | 判定を下し、記名する | **1名**」
- 注: 757 行は「判定記録へ記名」と書くが、実装(IMPL-0062、`ci-gates.md:415`)は PR 本文の「確定した者」でも数える。判定記録と PR 本文の両方を記名の置き場として既に扱っている

### 2.6 第8章 テーラリング(`tailoring-guide.md`)

- `src/content/docs/phase4-process-design/tailoring-guide.md:504` — 軸C「独立レビュー(G-6) | 1名 | コア機能は2名 | 2名+記録の監査対応書式」
- `src/content/docs/phase4-process-design/tailoring-guide.md:508` — 「規制業では『どこをAIが生成し、誰が承認したか』の追跡が監査要件になります。…**監査対応書式では、PR の承認だけでは記録になりません**。変更ごとに G-6 の判定記録を残し…」
- `src/content/docs/phase4-process-design/tailoring-guide.md:402`〜`408` — 指示資産の監査証跡「リポジトリへコミットし、変更履歴で追跡する / 版を特定できない実行の出力は、監査の入力に用いない」
- `src/content/docs/phase4-process-design/tailoring-guide.md:614` — 軸D「発注側がリポジトリと CI を所有し、受注側が作業する | 発注側の強制層で止める。ブランチ保護と出荷の証跡の集約の2つの層による | 判定の記録そのもの」
- `src/content/docs/phase4-process-design/tailoring-guide.md:716` — 「ブランチ保護が強制する承認の数は、この表の人数と一致させる(ADR-0067)」

### 2.7 第5章 人間とAIの役割境界(`human-ai-boundary.md`)

- `src/content/docs/phase4-process-design/human-ai-boundary.md:657` — 5.7.4 要求事項1「記述の実質性を機械的に判定して、承認の可否を自動的に決めてはならない」
- `src/content/docs/phase4-process-design/human-ai-boundary.md:625` — 「自由記述による『決断の理由を1行』という形式を採りません。…代わりに、記入すべき**構造**を規定します」

### 2.8 附属書・フェーズ5 の記録・監査証跡・強制層・ホスティングの設定

- `src/content/docs/phase4-process-design/review-guide.md:110` — 附属書C「悪い要約(AI 転記) | PR 本文や AI の説明のコピペ。自分の理解の証明にならない」
- `src/content/docs/phase4-process-design/assurance-case.md:212` — 附属書H C5 の証拠「承認記録(人・日時・確定の形態)、承認したアカウントと名簿の人の対応、作成を指示した者の記載、挙動要約、ブランチ保護の設定、成立しなかった変更の一覧」
- `src/content/docs/phase4-process-design/assurance-case.md:279` — 「ブランチ保護・必須チェック・合否条件に、AI の推定による判定が入っていないこと」
- `src/content/docs/phase4-process-design/adoption-guide.md:498` — 附属書I 要件⑦「ブランチ保護(ルールセット)が既定ブランチに効いていること(要求する承認の数、最後の push の後の承認、コードオーナー、必須チェック)」
- `src/content/docs/phase4-process-design/adoption-guide.md:575` — 「実環境の識別(査察で GitHub の画面と突合する鍵): <リポジトリの URL / ルールセット id / PR #N のレビュー id と最後の提出時刻 …>」
- `src/content/docs/phase5-implementation/agent-trace-control.md:52` — 「強制層に置けない項目は、遮断できたものとして扱いません」
- `src/content/docs/phase5-implementation/ci-gates.md:146` — 「基準値と、台帳の例外承認の行は、基底ブランチから読む。…判定の材料を、判定される側が同じ変更で用意できない形にする」
- `src/content/docs/phase5-implementation/ci-gates.md:155` — 停止の解除の記録「例外承認の行と同じく、**基底ブランチの記録だけを読む**。保留された側が、同じ変更で解除の材料を用意できない形にする」
- `src/content/docs/phase5-implementation/ci-gates.md:415` — 「区分を確定した者の記名は、判定記録(『変更のリスク区分』の確定者)と PR 本文(『リスク区分』の節の『確定した者』…)」の両方を数える
- `src/content/docs/phase5-implementation/ci-gates.md:609` — 記録の置き場「判定記録(`docs/gates/`)、証跡(`evidence/`)…D-0 体制図、層1…| 無条件」(これらだけを変えたコミットは、PR を経なくても製品の変更に数えない)
- `src/content/docs/phase5-implementation/qms-document-control.md:24` — 「適切性に対するレビューと承認 | ゲート判定と所有者定義に基づく承認 | ゲート判定記録、承認 PR」
- `src/content/docs/phase5-implementation/qms-document-control.md:33` — 「版管理の操作は、それ自体では承認になりません。**どの操作がどの承認へ相当するかを事前に定めた場合だけ、承認として成立します**」
- `src/content/docs/phase5-implementation/qms-document-control.md:37` — 「G-2 要件合意 | 価値責任者 | 仕様ファイルの PR 承認とマージ | 所有者定義で当該者が指定されている」
- `src/content/docs/phase5-implementation/qms-document-control.md:39` — 「G-6 独立レビュー | 独立レビュア | PR 承認 | 承認が、独立した人の確認の4条件…を満たす」
- `src/content/docs/phase5-implementation/qms-document-control.md:40` — 「G-7 出荷判定 | 出荷判定者 | 判定記録のマージ」
- `src/content/docs/phase5-implementation/qms-document-control.md:41` — 「G-8 リリース決裁 | 事業決裁者 | 実行環境の承認操作」
- `src/content/docs/phase5-implementation/qms-document-control.md:44` — 「アカウントと実在する人物の対応表は、リポジトリの外側で保守する。この表がない場合、承認者を同定できない」
- `src/content/docs/phase5-implementation/qms-document-control.md:45` — 「承認の**対象と意味**を PR の記述へ残す。『マージした』という事実だけでは、何に対する承認かを後から特定できない」
- `src/content/docs/phase5-implementation/qms-document-control.md:49` — 「署名済みコミットのみを許可する設定は…規制領域で要求される電子署名の要件を自動的に満たすものではありません」
- 注: QMS 文書管理の対応表(37〜41 行)は、G-2・G-4 を「PR 承認とマージ」、G-6 を「PR 承認」、G-8 を「実行環境の承認操作」へ対応づけている。第4章 66 行と ADR-0036 決定1 は「PR のマージ」を事務とする。両者が同じ事象を指しているか(承認の操作が成立要件か、記録の作成が成立要件か)は、本文の間で整理されていない。**食い違いの候補として会議体へ渡す**

---

## 3. 実装マーク

降ろし先の識別子と所在は `src/data/impl-targets.yaml` による。`gate-record-template` = `templates/04-gate-record.md`(84 行)、`gate-record-skill` = `.claude/skills/gate-record/SKILL.md`(98 行)、`gate-skill` = `.claude/skills/gate/SKILL.md`(105 行)、`gate-skill-g6` = `.claude/skills/gate/gates/G-6.md`(112 行)、`pr-checks` = `scripts/gate/check-pr.mjs`(119 行)、`evidence-aggregation` = `scripts/gate/aggregate-evidence.mjs`(138 行)、`next-role` = `scripts/gate/next.mjs`(78 行)。**ルールセット(`.github/rulesets/*`)を降ろし先にした登録は無い**(`impl-targets.yaml` に該当の `id` が無い)。

### 3.1 `gate-record-template`(テンプレ4)

| IMPL | 所在 | 状態 | 要点 |
| --- | --- | --- | --- |
| IMPL-0008 | `gate-criteria.md:59` | delivered | 判定記録の作成をもって判定が成立する |
| IMPL-0009 | `gate-criteria.md:80` | delivered | 工程ゲートの判定の語彙を通過と差し戻しの2値に限る |
| IMPL-0011 | `exception-escalation.md:42` | delivered | 条件を付して先へ進める場合は例外承認の5要求事項を満たす |
| IMPL-0016 | `human-ai-boundary.md:651` | delivered | 選択肢の比較を求める範囲を R1 と例外承認に限る |
| IMPL-0052 | `gate-criteria.md:837` | delivered | G-8 の決断の記録に、照らした層1 の版・上申・対象外の受容の3行 |
| IMPL-0068 | `deliverable-templates.md:576` | delivered | 節「AI の利用の評価」 |
| IMPL-0079 | `tailoring-guide.md:512` | delivered | 監査対応書式。「PR の承認だけでは記録にしない」 |
| IMPL-0080 | `tailoring-guide.md:731` | delivered | 安全性の評価者・評価の記録の所在 |
| IMPL-0107 | `gate-criteria.md:174` | delivered(check=manual) | G-2・G-4 の「対象」に機能 ID と受入基準の版の識別子。「機械は…版の識別子の有無と、確定の後の受入基準の変更を確かめない。内部監査で確かめる」 |

### 3.2 `gate-skill` / `gate-skill-g6`

| IMPL | 所在 | 状態 | 要点 |
| --- | --- | --- | --- |
| IMPL-0010 | `gate-criteria.md:99` | delivered | 判定は当該ゲートの判定基準のみで行う |
| IMPL-0027 | `gate-criteria.md:535` | delivered | G-6 を事後へ移した変更を G-6 の通過として記録しない |

`gate-record-skill` を降ろし先にしたマークは、本文に見当たらない(旧名の入口であり、中身は `/gate` への案内だけ。`impl-targets.yaml:100`)。

### 3.3 `pr-checks`(`check-pr.mjs`)

| IMPL | 所在 | 状態 | 要点 |
| --- | --- | --- | --- |
| IMPL-0049 | `gate-criteria.md:1019` | delivered | 規模の超過を失敗にせず size:over と区分の下限 R2 |
| IMPL-0059 | `exception-escalation.md:629` | delivered | 停止の申し立ての解除は「基底ブランチに入れた解除の記録(テンプレ4…)」 |
| IMPL-0062 | `roles-responsibilities.md:776` | delivered | R1・R2 の区分の確定者の記名が無い PR を失敗させる |
| IMPL-0078 | `gate-criteria.md:506` | delivered | PR のレビューを読めるとき承認者の数を出す。「合否にはしない(レビューの前に走るため)」 |
| IMPL-0092 | `tailoring-guide.md:517` | delivered | コア機能の承認者の数を警告(合否にしない) |
| IMPL-0099 | `gate-criteria.md:1052` | delivered | 規模の確認の節を検査する |
| IMPL-0102 | `gate-criteria.md:1055` | **undelivered** | L2 の採点の稼働の機械の検証 |
| IMPL-0112 | `gate-criteria.md:497` | delivered(check=machine) | 同一の文の挙動要約を2件目に数えない |

### 3.4 `next-role`(`next.mjs`)

| IMPL | 所在 | 状態 | 要点 |
| --- | --- | --- | --- |
| IMPL-0003 | `roles-responsibilities.md:547` | delivered | 実行主体が起動時に参照する内容 |
| IMPL-0005 | `label-mailbox.md:211` | delivered | エスカレーションの段階に対応するラベル |
| IMPL-0013 | `roles-responsibilities.md:478` | delivered | ロールとレーンの写像 |
| IMPL-0087 | `assurance-case.md:247` | delivered | 変化点の後に生じた状態の注記 |
| IMPL-0090 | `tailoring-guide.md:162` | delivered | 10名以上の規則の件数の注記 |

### 3.5 `evidence-aggregation`(承認・判定記録・挙動要約に関わるもの)

| IMPL | 所在 | 状態 | 要点 |
| --- | --- | --- | --- |
| IMPL-0032 | `assurance-case.md:398` | delivered | 承認は名簿の人へ対応づき作成を指示した者でない場合にだけ数える |
| IMPL-0039 | `gate-criteria.md:602` | delivered | G-6 を適用する体制で独立した人の確認を経ていない変更を記録の欠落に |
| IMPL-0077 | `gate-criteria.md:495` | delivered | 承認者の数「G-6 の承認者 N 名 / 要求 M 名」 |
| IMPL-0093 | `gate-criteria.md:498` | delivered | 挙動要約の最低限の形を、承認レビューの本文・判定記録の節・監査対応書式で同じ規則で読む |
| IMPL-0094 | `gate-criteria.md:499` | delivered | 承認・判定の時点の名簿への対応づけ |
| IMPL-0096 | `gate-criteria.md:514` | delivered | `docs/safety/**` を記録の置き場に加える |
| IMPL-0113 | `gate-criteria.md:735` | delivered(check=machine) | G-7 の記名者が指示者でも G-6 の承認者でもない |
| IMPL-0117 | `roles-responsibilities.md:129` | **undelivered** | 承認を数える人(席の責任者でない確認者)の力量の確認 |
| IMPL-0118 | `exception-escalation.md:453` | **undelivered** | 7.9.2 の2名必須の制限 |

---

## 4. テンプレート側の実装

### 4.1 `template/scripts/gate/check-pr.mjs`

PR のレビューから読むもの:

- `template/scripts/gate/check-pr.mjs:43`〜`49` — 検査8「PR のレビューを読めるとき(PR_REVIEWS の JSON、または --pr の reviews)…独立した人の承認者を数え、『G-6 の承認者 N 名 / 要求 M 名』を出す。満たなければ警告として出す。**合否にはしない**。pr-rules はレビューの前(push・本文の編集)に走り、承認はその後に付くため」
- `template/scripts/gate/check-pr.mjs:436`〜`439` — 「PR のレビュー(reviews: [{ author: { login, is_bot }, state, body }])から…数える。…**G-6 の判定記録(docs/gates/)は PR の時点では基底に無いことが多いため、ここでは読まない(集約が読む)**」
- `template/scripts/gate/check-pr.mjs:456` — 状態は `APPROVED` / `CHANGES_REQUESTED` / `DISMISSED` だけを読む(コメントだけのレビューは読まない)
- `template/scripts/gate/check-pr.mjs:459` — 承認の本文を `hasBehaviorSummary(r.body)` で読む(挙動要約の形の検査)
- `template/scripts/gate/check-pr.mjs:461` — 「本文の無い再承認は、直前の承認の文を引き継ぐ」
- `template/scripts/gate/check-pr.mjs:463` — 承認以外の状態(変更要求・取り下げ)で、その人の承認を取り消す(レビュアごとの最後の状態)
- `template/scripts/gate/check-pr.mjs:469`〜`470` — 「AI・bot のアカウント。検出の層」として数えない
- `template/scripts/gate/check-pr.mjs:473`〜`475` — 名簿との照合「名簿の人へ対応づかない」(`findPersonByAccount`、任命権者 `appointer` を除く)
- `template/scripts/gate/check-pr.mjs:478`〜`479` — 作成を指示した者の除外「(作成を指示した者)」
- `template/scripts/gate/check-pr.mjs:427`〜`433` — 作成を指示した者は PR 本文の節「作成を指示した者」から読み、未記入なら PR の作成者のアカウント
- `template/scripts/gate/check-pr.mjs:482`〜`483` — 挙動要約の無い承認「承認の本文に挙動要約が無い」
- `template/scripts/gate/check-pr.mjs:487`〜`491` — 2人目の同一文「挙動要約が、先に数えた承認者 ${same.name} と同一の文。自分の言葉で書く」
- `template/scripts/gate/check-pr.mjs:496` — 返り値 `enough: counted.length >= required`(警告の材料。合否には使わない)

基底ブランチだけを読む記録:

- `template/scripts/gate/check-pr.mjs:39`〜`41` — 検査6「基底ブランチに成立した解除の記録(テンプレ4 のゲート欄『停止の申し立ての解除』)が無い限り失敗させる」
- `template/scripts/gate/check-pr.mjs:349` — 「基底ブランチ(base の先端)の docs/gates/ だけを読む。保留した PR の中で足した記録は数えない(例外承認と同じ)」
- `template/scripts/gate/check-pr.mjs:368` — `git ls-tree --name-only base docs/gates/`
- `template/scripts/gate/check-pr.mjs:309`〜`316` — 例外承認は「基底ブランチの台帳から、この PR を対象とする有効な例外承認の行を探す」
- 注: #321 本文の「check-pr.mjs は基底ブランチの docs/gates/ だけを読むため、本体 PR の中で記録を足しても数えない」は、停止の解除の記録(349 行)と例外承認の台帳(309 行)についての事実である。**G-6 の承認者の数(検査8)は docs/gates/ を読まず、合否にもしていない**(438 行・47 行)

### 4.2 挙動要約の形の検査(`template/scripts/gate/config.mjs`)

- `template/scripts/gate/config.mjs:1089`〜`1092` — 「承認レビューの本文、または判定記録の『挙動要約』の節が…数えられる最低限の形。機械が確かめるのは形だけであり、中身…は確かめない」
- `template/scripts/gate/config.mjs:1093` — `SUMMARY_MIN_CHARS = 8`
- `template/scripts/gate/config.mjs:1094` — `SUMMARY_STOCK_PHRASES`(lgtm・ok・approve・承認・問題なし・確認しました など)
- `template/scripts/gate/config.mjs:1096`〜`1110` — `behaviorSummaryShortfall`(HTML コメントと見出し語を除き、空白・記号を除いた文字数で判定)
- `template/scripts/gate/config.mjs:1118`〜`1128` — `behaviorSummaryKey`(同一の文かを比べる形。言い換えは検出しない)

### 4.3 `template/scripts/gate/aggregate-evidence.mjs`

`docs/gates/` と PR の承認の突き合わせ:

- `template/scripts/gate/aggregate-evidence.mjs:5` — 「PR の記録は gh で引く」
- `template/scripts/gate/aggregate-evidence.mjs:431` — `PR_FIELDS = 'number,title,author,reviews,statusCheckRollup,body,mergeCommit,commits,labels,createdAt'`(出荷の時点に PR のレビューを API から取得する)
- `template/scripts/gate/aggregate-evidence.mjs:271` — `gateRecords = listDir('docs/gates')`
- `template/scripts/gate/aggregate-evidence.mjs:306`〜`358` — 判定記録の欄(対象・判定者・挙動要約・監査対応書式・リスク区分など)を読む
- `template/scripts/gate/aggregate-evidence.mjs:359`〜`361` — 「結果欄は『通過』『差し戻し』の語だけを完全一致で読む(next.mjs と同じ)」
- `template/scripts/gate/aggregate-evidence.mjs:366`〜`367` — `g6RecordsFor`: G-6 の判定記録のうち、対象が当該の変更、結果が通過、確定の形態が委任でないもの
- `template/scripts/gate/aggregate-evidence.mjs:507` — 条件4「承認した者自身の書いた挙動要約を伴う(承認レビューの本文、または当人が判定者の G-6 の判定記録の『挙動要約』の節)」
- `template/scripts/gate/aggregate-evidence.mjs:509` — 「**PR のレビューの承認のほかに、G-6 の判定記録(対象が当該の PR またはコミット、結果が通過)も承認として数える**」
- `template/scripts/gate/aggregate-evidence.mjs:711` — PR の承認レビューを候補に入れる(`source: 'review'`)
- `template/scripts/gate/aggregate-evidence.mjs:714`〜`726` — G-6 の判定記録の判定者と、監査対応書式の2人目を候補に入れる(`source: 'gate-record'`)
- `template/scripts/gate/aggregate-evidence.mjs:728`〜`736` — 「承認レビューの本文に要約が無くても、当人が判定者の G-6 の判定記録に要約があれば足る」
- `template/scripts/gate/aggregate-evidence.mjs:738` — 「同じ人が PR の承認と判定記録の両方に現れても1人として出す」
- `template/scripts/gate/aggregate-evidence.mjs:713` / `720` — 名簿の対応づけを、承認はマージの親(`at`)、判定記録は記録を足したコミット(`recordCommitOf`)の時点で引く
- `template/scripts/gate/aggregate-evidence.mjs:751`〜`760` — 同一の文の挙動要約を2件目に数えない
- 注: 準拠テンプレートの実装では、**標準の書式(`review.recordFormat` が `audit` でない体制)の G-6 は、PR の承認レビュー(本文に挙動要約)だけで独立した人の確認として数え、`docs/gates/` の G-6 の判定記録を必須にしていない**

判定記録を必須にしている箇所:

- `template/scripts/gate/aggregate-evidence.mjs:1282`〜`1283` — 「第8章 軸C の規制業は『レビュー記録は監査対応書式で残す』。PR の承認だけでは記録にならず、変更ごとに G-6 の判定記録…を要する」
- `template/scripts/gate/aggregate-evidence.mjs:1300`〜`1303` — 監査対応書式の体制で、変更ごとの G-6 の判定記録が無ければ欠落
- `template/scripts/gate/aggregate-evidence.mjs:1575`〜`1578` — 「トレーラ Spec で指す仕様に、機能仕様承認(G-4)の判定記録(結果が通過で、『対象』に仕様の識別子)がありません」を欠落にする
- `template/scripts/gate/aggregate-evidence.mjs:1586`〜`1591` — 「当該出荷の範囲で追加されたゲート判定記録(docs/gates/)が1件もありません。過去の出荷の記録は、今回の出荷の記録に数えません」
- `template/scripts/gate/aggregate-evidence.mjs:371`〜`375` — 出荷の範囲で追加された記録を `git log --diff-filter=A -- docs/gates` で特定する(記録をファイルとして足したコミットが、範囲の判定の鍵になっている)
- `template/scripts/gate/aggregate-evidence.mjs:2988`〜`2993` — G-7 基準5 は `machine: 'partial'`。「G-1〜G-3・G-7・G-8 の、出荷に対応する件数は機械で決められない」

記録の置き場:

- `template/scripts/gate/aggregate-evidence.mjs:973` — `RECORD_PATHS = ['docs/gates/**', 'evidence/**', …]`(ここだけを変えたコミットは、PR を経なくても製品の変更に数えない)
- `template/scripts/gate/aggregate-evidence.mjs:525` — 「PR を経ていない(独立した人の G-6 の判定記録が対応づかない)」

### 4.4 `template/scripts/gate/next.mjs` と `readGateRecords`

- `template/scripts/gate/config.mjs:1295`〜`1321` — `readGateRecords()` は `docs/gates/*.md` の表の行「ゲート・対象・結果・確定の形態・リスク区分を確定した者・参照した D-0 の版・判定日時」を読む。セルに ` / ` を含む値と `<` で始まる値は未記入として `null`
- `template/scripts/gate/next.mjs:56`〜`57` — `PASS = '通過'`、`REJECT = '差し戻し'`
- `template/scripts/gate/next.mjs:122`〜`125` — `passed()`: ゲートの接頭辞・結果が通過・対象の一致で通過を判定
- `template/scripts/gate/next.mjs:128`〜`131` — 「結果欄は『通過』『差し戻し』の語だけを完全一致で読む。注記を足した値・様式の文言のままの値は通過に数えない(安全側)。…AI の担い手は結果欄を書き換えない」
- `template/scripts/gate/next.mjs:139` — 「差し戻しの記録…判定者が新しい記録で判定する(成立した記録は書き換えない)」
- `template/scripts/gate/next.mjs:815` — 用語の注記「判定記録: ゲートの判定を docs/gates/ へ残したもの。記録を作った時点で判定が成立する」
- 注: `next.mjs` のゲートの進行は `docs/gates/` のファイルだけを見る。PR の承認イベントは、ゲートの通過の判定に使っていない

### 4.5 スキル `/gate`

- `template/.claude/skills/gate/SKILL.md:12` — 「**記録をもって判定が成立する**。…このテンプレートでは、判定記録をリポジトリへコミットして残す(**置き方はテンプレート独自**)。Issue・PR・ラベルの操作は事務であり、記録の無い期間は未判定」
- `template/.claude/skills/gate/SKILL.md:13` — 「判定は人が行う。…判定者・確定の形態・異議・受容の記名を AI が書かない」
- `template/.claude/skills/gate/SKILL.md:30` — 「G-5 自動検証(CI) | 機械(人の判定記録は作らない)」
- `template/.claude/skills/gate/SKILL.md:48`〜`50` — 「`cp templates/04-gate-record.md docs/gates/<ゲート>-<対象>-<日付>.md`」
- `template/.claude/skills/gate/SKILL.md:61` — 「判定者(人)が判定し、結果・差し戻し理由・記名を書きます」
- `template/.claude/skills/gate/SKILL.md:65` — 「順序は『判定基準との突合 → **記録の作成** → `state:*` ラベルの遷移 → Issue・PR の事務』です」
- `template/.claude/skills/gate/reference/recording.md:24` — 「判定者の発言を転記して記録を起こす場合も、結果欄の確定は判定者本人が行う」(AI の担い手が記録ファイルを起こし、人が結果欄を確定する運用を前提にしている)
- `template/.claude/skills/gate/reference/recording.md:61`〜`63` — 「判定記録は、出荷ごとに要る。…当該出荷の範囲で追加された判定記録だけを、今回の出荷の記録として数えます」
- `template/.claude/skills/gate/gates/G-6.md:17` — 「挙動要約は、レビュア自身が自分の言葉で1〜2文で書く(基準2)。**承認レビューの本文か、判定記録の『挙動要約』の節**(対象へ `PR #<番号>`)。AI に生成させない」
- `template/.claude/skills/gate/gates/G-6.md:25` — 「2人目は、PR の2件目の承認(自分の挙動要約つき)、2人目自身の判定記録、または監査対応書式…」
- `template/.claude/skills/gate/gates/G-6.md:33` — 「規制業(軸C)では、変更ごとに G-6 の判定記録を残す。PR の承認だけでは記録にならない」
- `template/.claude/skills/gate/gates/G-6.md:53` — 「ブランチ保護(ルールセット…): 作成者本人の承認と、最後の push の後の承認の欠落を止める。作成者が AI・bot の変更で、指示した者が承認する形は止めない(G-7 の集約で止める)」
- `template/.claude/skills/gate-record/SKILL.md`(11 行)— `/gate` の旧名。手順を持たない

### 4.6 テンプレ4(`template/templates/04-gate-record.md`)

- `template/templates/04-gate-record.md:3` — 「`docs/gates/<ゲート>-<対象>-<日付>.md` として置きます」
- `template/templates/04-gate-record.md:5` — 「**この記録の作成をもって、ゲートの判定が成立します**」
- `template/templates/04-gate-record.md:7`〜`18` — 冒頭の表(ゲート・対象・判定者・判定日時・結果・確定の形態・参照した D-0 の版・変更のリスク区分・リスク区分を確定した者・期限内か)
- `template/templates/04-gate-record.md:20` — 「変更を対象とする判定(G-6、PR を経ていないコミットの区分の確定など)は、PR の番号(`PR #12`)またはコミットの識別子…で書きます」
- `template/templates/04-gate-record.md:82` / `88` — 「前回の判定記録 | <リンク。**上書きしません**>」「前回の判定記録を上書きしません。当時なぜ通したかを失わないためです」
- `template/templates/04-gate-record.md:98` — 挙動要約「**AI に生成させてはなりません**。要約は理解の証拠であり、生成物は証拠になりません」
- `template/templates/04-gate-record.md:104` — 監査対応書式「PR の承認だけでは記録になりません」
- `template/templates/04-gate-record.md:113` — 「2人目の承認者は、PR の2件目の承認(各自の挙動要約つき)または2人目自身の判定記録でも代えられます」
- `template/templates/04-gate-record.md:157` — 「**解除の記録は、基底ブランチ(既定ブランチ)へ先に入れます**。G-5(`pr-rules`)は基底ブランチの記録だけを読みます」
- 注: 標準のテンプレ4 には「提出日時」と「非同期コメント期間(コメント数)」がある(`deliverable-templates.md:462`・`467`)。テンプレート側の冒頭の表には、この2つの欄が見当たらない(`template/templates/04-gate-record.md:7`〜`18`)。`src/data/template-fields.yaml` の `omit` に登録があるかは本メモでは確かめていない

### 4.7 ワークフロー

`template/.github/workflows/gate-g5.yml`:

- `template/.github/workflows/gate-g5.yml:12`〜`16` — 起動の事象は `pull_request` の `opened, synchronize, reopened, edited, labeled, unlabeled`。**`pull_request_review` を含まない**
- `template/.github/workflows/gate-g5.yml:20`〜`21` — 既定ブランチへの `push` でも走る
- `template/.github/workflows/gate-g5.yml:24`〜`28` — 権限 `contents: read`、`pull-requests: write`、`issues: read`(リポジトリへは書かない)
- `template/.github/workflows/gate-g5.yml:246`〜`249` — `gh api repos/${REPO}/pulls/${PR_NUMBER}/reviews` から `state, body, submitted_at, author` を取得して `PR_REVIEWS` へ渡す
- `template/.github/workflows/gate-g5.yml:261` — `check-pr.mjs --base origin/${BASE_REF} --report evidence/pr-checks.md --comment`(結果は PR へのコメントと成果物 `pr-checks` へ書く)
- 注: 承認はレビューの事象では再評価されない。承認後の push・本文の編集で走ったときに、その時点の承認を数える

`template/.github/workflows/ship-evidence.yml`:

- `template/.github/workflows/ship-evidence.yml:24`〜`27` — 起動はタグ `v*` の push と手動
- `template/.github/workflows/ship-evidence.yml:36`〜`39` — 権限 `contents: read`、`pull-requests: read`、`actions: read`
- `template/.github/workflows/ship-evidence.yml:61`〜`68` — gate-g5 の成功した実行から `license-scan` と `test-results` を取り込む
- `template/.github/workflows/ship-evidence.yml:90`〜`92` — `aggregate-evidence.mjs` を実行(PR のレビューは集約が `gh` で引く)
- `template/.github/workflows/ship-evidence.yml:94`〜`103` — 出力は Actions の成果物 `ship-evidence`(`evidence.json`・`quality-report.md`・`assurance-disclosure.external.md`)。リポジトリへはコミットしない
- `template/.github/workflows/ship-evidence.yml:19`〜`20` — 「このワークフローは、2026-10-01 時点で、実際の GitHub 上で実行して確かめていません」

### 4.8 ルールセットと README「ブランチ保護を適用する」

- `template/.github/rulesets/team.json:12`〜`16` — `required_approving_review_count: 1`、`dismiss_stale_reviews_on_push: true`、`require_last_push_approval: true`、`required_review_thread_resolution: true`
- `template/.github/rulesets/team.json:22` — `strict_required_status_checks_policy: true`
- `template/.github/rulesets/safety.json:12`〜`16`・`26` — 承認1、コードオーナー必須、署名必須
- `template/.github/rulesets/regulated.json:12`〜`16`・`26` — 承認2、コードオーナー必須、署名必須
- `template/.github/rulesets/checks-only.json:10`〜`13` — 必須チェック `gate-g5` だけ(`strict` は false)
- 4つのルールセットとも、`docs/gates/` などの記録の置き場を除外・迂回する設定を持たない(`conditions` は `~DEFAULT_BRANCH` だけ)
- `template/.github/rulesets/README.md:21` — 「未達の構成では、承認を強制するルールセットを置きません。作成者の自己承認を止める設定は、承認者が別に存在して初めて意味を持つためです」
- `template/.github/rulesets/README.md:23` — 「`checks-only.json` は既定ブランチへの直接の push も止めます…1名でも PR を経て取り込む運用になります」
- `template/.github/rulesets/README.md:41` — 「**強制層(ホスティングの設定)に置いた項目だけが、遮断できたものとして数えられます**」
- `template/.github/rulesets/README.md:43` — 「`require_last_push_approval: true` が要点です。これがないと、承認を得たあとに自分で push して内容を変えられます」
- `template/README.md:96`〜`103` — 「適用は人が行います(エージェントは実行しません)」。G-6 を適用する構成は「必須チェック gate-g5、承認、最後の push の後の承認」を強制
- `template/README.md:109`〜`112` — スカッシュのコミットのメッセージを PR の題名と本文にする(PR 本文のトレーラをコミットに残す)
- `template/README.md:115` — 「私有リポジトリでルールセット(ブランチ保護)を使えるかは、GitHub のプランに依ります(2026-10 時点で、無料のプランでは公開リポジトリに限られます)」
- 注: 集約は記録だけのコミットを PR なしでも受け付ける(`ci-gates.md:609`、`aggregate-evidence.mjs:973`)。一方、ルールセットは記録だけの変更にも PR と承認(G-6 適用の構成)または必須チェック(`checks-only`)を課す。**集約の側の「記録だけのコミット」の扱いと、強制層の側の扱いが揃っていない**。#321 の「記録 PR にも判定者以外の承認者が要る」は、この強制層の側の事実である

---

## 5. 根拠水準マーク

- `src/content/docs/adr/0036-gate-closure-by-record.md:113`〜`127` — **EV-0021**(E2、見直し 2027-02)。対象は決定3(条件付き通過を設けない)。差し替え条件「(a) 7.3 の例外承認の適用件数 (b) G-7 基準5 の完備確認で検出された、判定記録の欠落件数 (c) 期限を超過した未回収の例外承認の件数。**(b) が (a) を上回る案件が生じた場合、手続の重さが回避を招いていると判定する**」。注: 対象は決定3 であり、決定1(記録の作成をもって成立)にはマークが無い
- `src/content/docs/phase4-process-design/gate-criteria.md:501`〜`505` — **EV-0083**(E0、見直し 2027-04)。挙動要約の最低限の形(承認の語だけを数えない、8 文字以上)。差し替え条件「形を満たしても挙動を述べていない承認の件数と、形を満たさないのに挙動を述べている承認の件数を集める。…いずれの場合も、中身の判定を機械に移さない(第5章 5.6.4)」
- `src/content/docs/phase4-process-design/tailoring-guide.md:721`〜`727` — **EV-0102**(E0、見直し 2027-04)。CL3・規制業・コア機能の承認者2名の値。差し替え条件「承認者が1名の変更と2名の変更での…欠陥の件数の比較。および、DO-178C と ISO 26262-2 表1 の原文が確認者の人数を求めているかの確認」
- `src/content/docs/phase4-process-design/gate-criteria.md:549`〜`555` — **EV-0051**(E1、見直し 2027-03)。R1 の変更を G-6 未達のまま出荷する場合の 7.3 の例外承認。差し替え条件「取りやめが0件のまま、未達で出荷した R1 の変更から欠陥が1件でも見つかった場合…R1 の未達の出荷を認めない形へ改める」
- `src/content/docs/adr/0035-separation-by-execution-context.md:121`〜`127` — **EV-0020**(E2、見直し 2027-02)。分離の成立条件3項目(作業領域・セッション・認証情報)
- `src/content/docs/phase4-process-design/roles-responsibilities.md:329` — **EV-0103**(見直し 2027-04)。出荷判定者の独立の範囲と、G-7 の記名者が指示者でも G-6 の承認者でもないことを保証の主張の条件に置く判断
- 注: 「判定記録の作成をもって成立する」(ADR-0036 決定1、第4章 57 行)と「判定記録を `docs/gates/` のファイルで残す」には、根拠水準マークが付いていない。前者は自己申告を排する論理から導かれた決定として、後者はテンプレート独自の置き方として扱われている

---

## 6. 過去の調査・会議体のメモ

### 6.1 `research/phase4-standard/236b-conditional-gate-approval.md`(#236b、2026-08-13、ADR-0036 決定3 の再協議材料)

- 主題は条件付き承認であるが、記録の様式の重さについての外部の根拠を集めている
- `research/phase4-standard/236b-conditional-gate-approval.md:307`〜`308` — 「(c) 記録の様式を軽くしたら記録が増えた —— 最も直接的な証拠 / 16欄の既存様式に対し7欄の簡略様式…提出数が 24か月で 0.96 → 7.38 へ増加」
- `research/phase4-standard/236b-conditional-gate-approval.md:326` — 「様式を16欄から7欄へ軽くしただけで、報告が7.7倍になりました。『重い手続は使われない』ではなく『**重い手続は記録を消す**』ことの直接の証拠」
- `research/phase4-standard/236b-conditional-gate-approval.md:327` — 「判定値を2値にしても、**却下が一度も出ない承認体**が規制当局によって現に観測されています。判定語彙の設計だけでは、素通しは防げません」
- `research/phase4-standard/236b-conditional-gate-approval.md:328` — 「7.3 が『過大でない』ことと『回避されない』ことは別問題です」
- `research/phase4-standard/236b-conditional-gate-approval.md:442` — 「逆方向(重くしたら逸脱が減った)の定量的な実証は見つかりませんでした」
- 採否: 調査メモ自体は採否を書かない(5 行「標準への反映案は書きません」)。結果として ADR-0036 決定3 は維持され、EV-0021 の差し替え条件が 2026-08-14 に書き直された(`adr/0036-gate-closure-by-record.md:126`)

### 6.2 `research/phase4-standard/review-burden-01〜03`(2026-08-07、タスクの分割基準の改稿素材)

- 主題は PR の規模とレビューの負荷であり、判定記録の手間は扱っていない
- `research/phase4-standard/review-burden-01-evidence.md:176` — 「権威的に見えるシステムが承認シグナルを出すと、人間は自身の吟味を減らす」(自動化バイアス)
- `research/phase4-standard/review-burden-02-techniques.md:114` — 「レビュアー負荷を『読む』から『検証する』へ移す設計としての Meta RADAR」
- `research/phase4-standard/review-burden-02-techniques.md:213` — RADAR「no human review is required—not even deferred」
- `research/phase4-standard/review-burden-02-techniques.md:152` — Google の readability 承認と OWNERS 承認は「独立した 2 軸のゲート」
- `research/phase4-standard/review-burden-02-techniques.md:237` — 「GitHub の CODEOWNERS は…リスクベースというより所有権ベースのゲート」
- 採否: 標準は AI による事前審査を合否に挿入する手段を採らなかった(`gate-criteria.md:1216`)。自動承認の比率の検知条件は ADR-0059 で廃した

### 6.3 `research/phase4-standard/284-council-*`(#284・#285、体制が変わっても回るロール設計・品質保証の論証)

- `research/phase4-standard/284-council-03-qa-audit.md:19` — 「形骸化していないことは、書類では示せない。**統制が作動した記録**…と**検出能力の実測**で示す」
- `research/phase4-standard/284-council-03-qa-audit.md:173` — 「書類の完備は、形骸化していない証拠になりません。挙動要約は必要条件にとどまります」
- `research/phase4-standard/284-council-03-qa-audit.md:212` — 「形骸化の経路は、毎回同じ1枚が読まれなくなること(5.7.5)」
- `research/phase4-standard/284-council-03-qa-audit.md:296` — 「通知は新しい帳票にせず、**D-0 と構成の差分**として出荷記録の項目7 へ集約する」
- 採否: 「承認ごとに『何を確かめたか』の署名様式を足す」は却下された(ADR-0056 却下表 `adr/0056-assurance-argument.md:165`。トリアージの記録 `issue-triage-2026-10-08.md:681`)

### 6.4 `research/phase4-standard/288/`(#288、組織として品質を保証すると言える形)

- `research/phase4-standard/288/council-13-skeptic.md:9` — 「台帳・計画・見積り・後継計画を『人が書いて定期的に見直す文書』として足すと、5つとも形骸化する」
- `research/phase4-standard/288/council-13-skeptic.md:48` — 「**形骸化は『書かれていない』ことではなく、『古いまま正しく見える』ことで起きます**。古さが機械で見える限り、形骸化は隠れません」
- `research/phase4-standard/288/council-13-skeptic.md:334` — 「機械に判定させるのを**存在・経過・照合**(記録があるか、古いか、空席か)に限り」
- `research/phase4-standard/288/council-04-skeptic.md:47` — 確認の証拠に「G-5 の実行記録、G-6 の判定記録、検出能力の測定値」
- 採否: 採った案と採らなかった案は ADR-0057 の補足の決定表(S31・S37・S52・S53 と却下表)に記録された(本メモ 1 章を参照)

### 6.5 `research/phase4-standard/295/`(#295、固定の上限と人間の速度を前提にした定数)

- `research/phase4-standard/295/council-04-skeptic.md:88` — 「T-09 全 PR・全 push の承認失効: 『承認は、承認した内容に束縛される』は構造の不変条件(A)。B なのは粒度(全 push)のみで、ここを緩めて『承認が内容と切れる』方向へ倒すと、承認の形骸化に直結する。粒度の見直しは、束縛を保つ方法(差分が変わらない push では失効しない等)に限る」
- `research/phase4-standard/295/council-01-guard.md:89` — 「承認後の変更が**差分の実質に触れたとき**に失効(コメント・文言のみは失効させない)。機械判定できない場合は失効側に倒す」
- `research/phase4-standard/295/council-02-frontier.md:75` — 「承認の commit と現在の HEAD で**木または patch-id が同一**(リベースだけ)なら承認を維持。…要確認: PR の JSON に承認の commit oid が入るか」
- `research/phase4-standard/295/decision-spec.md:64` — D9「今回は直さず、後継 Issue に引き継ぐもの(採らないと決めたものではない)」に「T-09 全 PR・全 push の承認失効(`dismiss_stale_reviews_on_push`。G-6 の規範と ruleset の粒度)」
- 採否: 規模の超過を遮断から同じ PR の中の確認へ移す案は採用(ADR-0058)。承認の失効の粒度は**未決のまま #296 へ送られた**

### 6.6 `research/phase4-standard/issue-triage-2026-10-08.md`(#248〜#281 の突合)

- `research/phase4-standard/issue-triage-2026-10-08.md:30` — 「#271 | 一部 | 欄ごとの書き手・自動化範囲は規定済。PR 本文は AI レビュアへ渡さない。署名様式は却下。添付証跡の置き場は未対応」
- `research/phase4-standard/issue-triage-2026-10-08.md:674` — 「『機械が守れるのは真正性だけ』は、本標準の機械検査の線(fail は記録の欠落と基底の実体との不一致だけ…)と一致します」
- `research/phase4-standard/issue-triage-2026-10-08.md:677` — 「『例外理由は実体を要求する』は、例外承認を基底ブランチの台帳の有効な行に限り、同じ PR で足した行を数えない形で担保しています」
- `research/phase4-standard/issue-triage-2026-10-08.md:685` — 残る論点「人が見た証跡(スクリーンショット・DOM)の置き場と保全は未対応です」
- 採否: 署名様式は却下。証跡の置き場は未対応のまま後継へ

### 6.7 `research/300-book-intake/survey-B-hollowing-bandwidth.md`(#300、形骸化と帯域)

- `research/300-book-intake/survey-B-hollowing-bandwidth.md:95` — 附属書H H.7「承認の件数と署名では示しません。次の4つで示します」の引用
- `research/300-book-intake/survey-B-hollowing-bandwidth.md:250` — 「同じリポジトリの人の PR も 69.2% が記録上レビューなしかエージェントのみ」[SRC-0396]
- `research/300-book-intake/survey-B-hollowing-bandwidth.md:345` — 「2 名にする理由(軸C・軸E・7.9.2 のいずれにも理由の文と ADR の参照が無い…)」(この指摘は後に ADR-0067 で扱われた)
- 採否: 調査メモ自体は採否を書かない(5 行「採否は決めていない」)

### 6.8 `research/302-310-deliberation/`(#302〜#310)

- `research/302-310-deliberation/decision.md:77` — C-1「行を廃し、課さないと明記する。形骸化の検知は、7.9 と既存の指標が担う」(自動承認の比率。ADR-0059)
- 承認者2名の目的(A-8〜A-10)は ADR-0067 として採用(`adr/0067-purpose-of-two-approvers.md:14`)

### 6.9 該当しなかったもの

- 「記録 PR」「記録のための PR」の往復の手間そのものを主題にした過去の調査・会議体のメモは、`research/` の全体を検索した範囲で見つからなかった(並行して作られている `gate-record-01〜03` を除く)
- 近いのは、記録だけの PR にもリスク区分の記載を課す決定(`research/phase5-implementation/286-novice-walkthrough-fixes.md:58`「記録だけの PR と `Spec: setup` の PR も含む」)と、層1 の改版に PR を課さない決定(ADR-0057:509)の2つである

---

## 7. 過去の Issue

### `gh issue list --search "記録 承認 帳票 ゲート判定" --state all --limit 50`

| # | 題名 | 状態 |
| --- | --- | --- |
| 216 | ロール別セッション(PO/Dev/QM)の定義を D-0 体制図から導出する経路が標準にない | CLOSED |
| 213 | 実装が存在しない段階の PR に対する G-5 の扱いが規定されていない — 対象なしを証跡に残して通過させる | CLOSED |
| 211 | 部品単体の市場価値を検討させる場が無い — 欄ではなく体制(D-0・任命基準・予算区分)の欠落として扱う | CLOSED |

### `gh issue list --search "手間 ボトルネック" --state all --limit 50`

| # | 題名 | 状態 |
| --- | --- | --- |
| 172 | [Review/IPA] AI生成コード急増に伴う「独立レビュー（G-6）」の形骸化防止と、リスクベースのレビュー濃淡基準の追加 | CLOSED |
| 102 | [Process/Feature] 4大会議体（IT投資・SteerCo・DR・リリース判定）の役割と決裁権限マトリクスの策定 | CLOSED |
| 249 | 軸A(チーム規模)が、人数の減少を「兼務」でしか吸収していない — 1名体制では1人が7ロールを兼ね、5.6 の形骸化へ直行する | CLOSED |
| 95 | [Review] 生成AI協調プロセス（AIDLC/統合参照モデル）における品質保証・法的責任に関する5つの本質的課題と改善提言 | CLOSED |

### 補助の検索(`"挙動要約"`・`"判定記録"`)で出た、今回の論点に近いもの

| # | 題名 | 状態 |
| --- | --- | --- |
| 321 | ゲート判定記録の成立手続を見直す(帳票の手入力と記録 PR の往復がマージのボトルネックになる) | OPEN |
| 223 | 工程ゲートを実際に閉じる手順が規定されていない — 誰が何をもって「通過」を宣言し、どこへ記録するか | CLOSED(ADR-0036 の起点) |
| 228 | テンプレ4: 決断の記録と選択肢の比較の欄が実行層に存在しない | CLOSED |
| 305 | 承認者 2 名を課す目的を決める(目的の記録が無く、2 人目に求める条件が決まらない) | CLOSED(ADR-0067) |
| 303 | 「自動承認の比率」を定義する(分子・分母が無く、発火条件を自己申告で満たせる) | CLOSED(ADR-0059) |
| 302 | S0 での独立レビュー(G-6)の扱いを決める(省略の決定の記録が無く、確認者を置ける体制のほうが扱いが軽い) | CLOSED |
| 304 | 「開発ライン」を定義し、出荷判定者の独立の範囲を決める(本文と機械の検査が食い違う) | CLOSED(ADR-0066) |
| 308 | 規則と検査の食い違いを解く(起案者が自分の起案を判定しない規則が検査されていない。曖昧語の一覧が 3 か所で違う) | CLOSED |
| 268 | 独立レビュアの AI は 33 日で 42 回、ゲート役から「CI の代弁者」へ滑り落ちた — 指示の追加では直らず、物理遮断は丁寧なレビューを罰した | CLOSED |
| 270 | 品質ゲートを強化し続けたら、装置が製品コードの 0.76 倍、PR の 60% が装置修理、装置が顧客を止めた | CLOSED |
| 271 | AI が PR を書き AI がレビューする体制で、PR 本文は「人間組織の文化」と「AI 開発」のインターフェースになった — 機械が守れるのは真正性だけ、人が見た証跡と振り返りの単位をどこに置くか | CLOSED |
| 252 | 実装10行に対して文書 21,116行 — 標準が要求する成果物の量に上限も比率の観測も無い | CLOSED |
| 295 | AI 時代に適切でない固定の上限・人間の速度を前提にした定数の棚卸しと改訂 | CLOSED(ADR-0058) |
| 296 | AI 時代の固定定数の棚卸し(#295)の後継 — カバレッジ・承認失効・自己修復・手戻り率・監査の抽出率ほか | OPEN(承認失効 T-09 を含む) |
| 290 | 検査装置の総量 — 上限と減らす者、装置修理 PR 比率の定義、附属書B の escape clause | OPEN |
| 289 | 成果物の構造 — 立ち戻る先の成果物、G-3 の判定対象と証跡、ADR の索引と文書量の観測 | OPEN |
| 312 | 席の兼務の境界と既定の写像が、章の間で食い違う | OPEN |
| 317 | 委託(軸D)の残り: ゲートの置き先、指示資産の持ち主、規程を前提にした文 | OPEN |
| 318 | 独立の強さを人数ではなく距離で上げる案と、S0 の残り | OPEN |

---

## 8. まとめ — 今回の問いに対して、既存の決定が許していること・禁じていること・決めていないこと

### 8.1 許していること

- G-6 の変更ごとの確認を、PR の承認レビュー(承認した者自身の挙動要約を本文に持つもの)で記録すること。本文が2人目の記録の形として「2件目の承認」を明記している(`gate-criteria.md:480`)。準拠テンプレートの集約も PR の承認を数えている(`aggregate-evidence.mjs:509`)。規制業以外では、`docs/gates/` の G-6 の判定記録を必須にしていない(`deliverable-templates.md:503`、`tailoring-guide.md:508` は規制業に限って「PR の承認だけでは記録にならない」と書く)
- 挙動要約を、承認レビューの本文と判定記録の節のどちらに書いてもよいこと(`template/.claude/skills/gate/gates/G-6.md:17`、ADR-0057 S52)
- R1・R2 の区分の確定者の記名を PR 本文で行うこと(`roles-responsibilities.md:776` IMPL-0062、`ci-gates.md:415`)
- 規模の超過に対する人の確認を、別の PR を立てずに同じ PR の中で完結させること(ADR-0058 決定1。「PR 2 本・承認 2 回」は却下 `adr/0058-…:110`)
- 記録の属性(承認者の同定・日時・履歴)を、所有者定義による承認・マージ日時・版管理で満たすこと。ただし先例は D-0 の記録についてである(`deliverable-templates.md:338`)
- 版管理の操作を、事前に対応を定めた場合に限って承認として扱うこと。G-2・G-4 は「仕様ファイルの PR 承認とマージ」、G-6 は「PR 承認」、G-8 は「実行環境の承認操作」へ対応づけている(`qms-document-control.md:33`・`37`〜`41`)
- 記録だけのコミットを製品の変更に数えず、PR を経なくても集約が受け付けること(`ci-gates.md:609`、`aggregate-evidence.mjs:973`)。層1 の改版に PR を課さないと決めた先例がある(`adr/0057-…:509`)
- テンプレートの様式を標準の様式の部分集合にすること(ADR-0040 決定1)。判定記録の置き方をテンプレートが独自に決めること(`template/.claude/skills/gate/SKILL.md:12`)
- 判定記録の「対象」をコミットの識別子でなく PR の番号で書くこと(`deliverable-templates.md:460`、`template/templates/04-gate-record.md:20`)。G-2・G-4 だけは受入基準の版のコミットの識別子を要する
- 評価の記録をリポジトリの外(文書管理システム)に置き、所在だけを判定記録に書くこと。ただし先例は独立した安全性の評価の記録についてである(`gate-criteria.md:512`、ADR-0057 S52)

### 8.2 禁じていること

- 記録の無い判定を通過として扱うこと。記録の無い状態は未判定である(`gate-criteria.md:57`、ADR-0036 決定1)
- Issue のクローズ、PR のマージ、ラベルの遷移、通知を、判定の成立要件にすること(`gate-criteria.md:66`、ADR-0036:59)
- 案件の課題管理ツールを変えると判定の成立要件が変わる構成にすること(`gate-criteria.md:70`、ADR-0036:101 の却下理由)
- 記録より先にラベルを動かすこと(`label-mailbox.md:221`)
- 「条件付き通過」という判定値・欄・ラベルを設けること(`gate-criteria.md:93`、`deliverable-templates.md:555`、`label-mailbox.md:239`)
- AI・bot の名義の承認・判定・解除を数えること(`gate-criteria.md:477`、`exception-escalation.md:596`)。AI に挙動要約を生成させること(`template/templates/04-gate-record.md:98`、附属書C `review-guide.md:110`)
- 承認の操作があったことだけで、独立した人の確認に数えること(`gate-criteria.md:465`)
- 1人目が2人目の欄を埋めること(`gate-criteria.md:480`)
- 規制業の監査対応書式の体制で、PR の承認だけを G-6 の記録とすること(`deliverable-templates.md:503`、`tailoring-guide.md:508`)
- 記述の実質性を機械的に判定して承認の可否を決めること(`human-ai-boundary.md:657`、5.7.4)
- 成立済みの判定記録を書き換えること(`template/templates/04-gate-record.md:88`、ADR-0055:91)
- 判定の材料(例外承認の行・停止の解除の記録)を、判定される側が同じ変更の中で用意すること(`ci-gates.md:146`・`155`)
- 帯域の不足を理由に G-6 を省略すること、判定の時点を移す別の経路を新設すること(`gate-criteria.md:1206`・`1208`)
- 強制層を事業ステージで段階的に緩めること(ADR-0050 決定1)。強制層に置けない項目を遮断できたものとして扱うこと(`agent-trace-control.md:52`)

### 8.3 決めていないこと

- **判定記録の媒体と置き場**。標準本文は成立要件を「判定記録(テンプレ4)の作成」と「欄が埋まっていること」で書き(`gate-criteria.md:57`・`65`)、ファイルかホスティングの記録かを書いていない。`docs/gates/` は第5章 Label Mailbox の図(`label-mailbox.md:225`)とテンプレート(`SKILL.md:12`「置き方はテンプレート独自」)にだけ現れる
- **PR の承認イベントは「成立要件」と「事務」のどちらか**。第4章の事務の列挙(`gate-criteria.md:66`)に承認イベントは含まれない。一方で、事務を成立要件にしない理由(ツール依存、`gate-criteria.md:70`)は承認イベントにも同じ形で掛かる。G-6 では承認が記録の形として認められている(8.1)が、G-1〜G-4・G-7・G-8・SG について承認イベントを記録とみなす規定は無い
- **第4章・ADR-0036 と、QMS 文書管理の対応表の関係**。後者は G-2・G-4 を「PR 承認とマージ」、G-7 を「判定記録のマージ」に対応づける(`qms-document-control.md:37`〜`40`)。前者は PR のマージを事務とする。両者の整理は本文に無い(食い違いの候補)
- **属性と判断の中身を分けて記録する形の可否**。テンプレ4 は1枚に両方を持つ。属性を承認イベントへ移し、中身だけを人が書く形が、ADR-0040 の「欄を落とす(omit)」か「標準と逆の指示」か「どちらでもない」かは決まっていない
- **工程ゲートの2値と、ホスティングのレビュー状態(承認・変更要求・コメント)の対応**。差し戻しに要する「満たさない項目番号・再提出の期限」(`gate-criteria.md:85`)を、変更要求のどこに持たせるかは決まっていない
- **PR に紐づかないゲート(G-1・G-2・G-3・G-4・G-8・SG)の記録の受け皿**。G-8 は QMS 対応表で「実行環境の承認操作」に対応づくが、テンプレ4 の決断の記録(確認していない事項・異議・上申)の受け皿との関係は書かれていない
- **記録だけの変更に、強制層が PR と承認を課すかどうか**。集約は PR なしの記録だけのコミットを受け付ける(`ci-gates.md:609`)が、ルールセットは除外を持たない(`team.json` ほか)。層1 については PR を課さないと決めた(ADR-0057:509)が、`docs/gates/` については決めていない
- **承認の失効の粒度**(`dismiss_stale_reviews_on_push`・`require_last_push_approval` と、リベースだけの push)。#295 は「承認は承認した内容に束縛される」を不変条件としたうえで、粒度の見直しを #296 へ送った(`295/decision-spec.md:64`)
- **承認イベントの保全と保管期間**。標準は承認・判定の記録を git の履歴で読む前提を置く(ADR-0057 S53、`aggregate-evidence.mjs:713`・`720`)。ホスティング側のレビューの編集・削除、アカウントの消滅、プラン(私有リポジトリでルールセットを使えない場合 `template/README.md:115`)の影響は扱っていない。7.8 の保管の要求(`exception-escalation.md:416`)は例外承認とエスカレーションの記録についてであり、ゲート判定記録一般の保管期間は書かれていない。出荷の集約の出力は Actions の成果物であり、リポジトリにコミットしていない(`ship-evidence.yml:94`〜`103`)
- **出荷の範囲の記録の数え方を、ファイルの追加以外で行う方法**。集約は「範囲内に追加された `docs/gates/` のファイル」で今回の出荷の記録を数える(`aggregate-evidence.mjs:371`〜`375`・`1586`〜`1591`)。承認イベントへ移した場合の数え方は無い
- **判定者が成果物の作成者でもあるゲート(G-2・G-3・G-4・G-7)を、PR の承認で記録する場合の扱い**。ADR-0060 はこれらを結果責任者が判定することを禁じない(`adr/0060-…:58`)が、ブランチ保護は作成者本人の承認を止める。この組み合わせは検討されていない
- **ADR-0036 決定1 の根拠水準**。決定1 には根拠水準マークが無い(EV-0021 は決定3 だけを対象にする)。決定1 の差し替え条件は定められていない
