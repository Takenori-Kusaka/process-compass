# 束 B15 準拠テンプレートへ降ろす項目の受付と議長の裁定の案

作成 2026-11-18。担当: 議長の裁定の案。template/ は d871f25 を読んだだけで、何も変えていない。

- 対象: #329・#328・#347・#351 の template の項目と、指揮役が範囲とした IMPL-0715・0718・0760・0839・0959・1004
- 入力: `research/329-deliberation/`(21・22・26)、`research/328|347|351-deliberation/`(04・05-issue-comment・10)、`research/445-450-deliberation/decision.md`・`decision.tsv`、ADR-0141・0147・0165、各 Issue のコメント(2026-11-17 まで)
- **審議の重さ: 軽**。条項は新設も改廃もしない。決めるのは、決定済みの規定の降ろし方と plan の付け替えだけである。採用者への新しい義務は無い(0303・0715・0718 の plan=adopter は、規定を課したまま template が運ばないと開示するもので、445-450 の ADR-0175 と同じ型)

## 0. 指揮役の前提との食い違い(先に記録する)

- 6つの IMPL は、どれも `target=claude-md-resident` ではない。降ろし先は profile-generator(0760・0839・0959)、evidence-aggregation(1004)、deprecation-inventory(0715)、control-rollout(0718)である
- 0760 の降ろし先の文は、CLAUDE.md の構成依存部分(`<!-- generated:process-rules start/end -->`、CLAUDE.md:18-26)に出る。claude-md-resident.json は目印の区間の**外**だけを照合する(`claude-md-resident.mjs` の冒頭の注記)。そのため、json の対は要らない
- 「template/CLAUDE.md の常駐の文と claude-md-resident.json の対」が実際に生じるのは、#328 の C-4(CR-053 の核)と C-14(新しい行)の2つである。B16 の push の後に置いたのは、この2つと #351 H-4 の検査である

## 1. 一覧と区分

区分: (A) 本束 = template の scripts/・知識ベース・.github/・claude-md-resident.json。(B) 範囲外 = templates/*.md・手引きの文書(B16)。(C) 降ろし済み、または template の作業が無い。

| # | 出所 | 項目 | 実物で確かめたこと(template d871f25) | 区分 |
| --- | --- | --- | --- | --- |
| 1 | #329 T-1 | 配備の資格情報の離脱を構成の欄で数える | ADR-0165 決定3 が欄の新設を採らないと決め、IMPL-0986 は plan=adopter。数えない旨は `config.mjs:221` の STATEMENT_FACTS_NOTE と `generate-profile.mjs:3656` に既にある | C |
| 2 | #329 T-2 | README の「未達」の語を ADR-0141 の語へそろえる | `README.md:677` が既に「列挙に無い離脱…例外承認の件数に数える(ADR-0141 決定4・5)」と書く。641-653 の旧い文は無い | C |
| 3 | #329 T-3 | `/gate G-8` の補助ファイルの3点(必須レビュアを成立に数えない・配備は判定記録の後・緊急の修正も G-8 を経る) | `.claude/skills/gate/gates/G-8.md`(62行)に「配備」の語が無い。降りていない | B |
| 4 | #329 T-4 | exception-paths.md に、G-8 の配備の統制だけが例外承認の対象であることと、台帳の行の対象の書き方を書く | 前半は `exception-paths.md:31` に既にある(IMPL-0603 は delivered)。台帳の行の対象の書き方(配備のワークフローの所在と配備先)が無い | B(後半だけ) |
| 5 | #329 T-5 / IMPL-0985 | 配備の実行記録と判定記録の突き合わせ | plan=adopter(ADR-0141)。template の作業は無い | C |
| 6 | #329 T-6 | env-check の狭める措置の欄 | #361 の範囲 | C(本束の外の Issue) |
| 7 | #329 T-7 / IMPL-0987 | G-5 の通過に数えるのを、PR を評価した起動(pull_request・pull_request_target)の結果に限る | `aggregate-evidence.mjs:2202` は rollup の名 `gate-g5` だけを見る。`:1539-1548` の後退経路(check-runs API)も起動の事象を見ない。`gate-g5.yml:36` に `workflow_dispatch:` がある。降りていない | A |
| 8 | #329 / IMPL-0303(issue=329) | 出荷を起動する取り込みの前の G-7 の判定記録 | 21-ruling にも 22-implementation の T 項目にも無い(#328 の裁定が「実装は #329」と送っただけ)。template に配備のワークフローは無い(ADR-0090 決定6)。note は既に「採用者は…社内で定める」と書く | C(plan の付け替えだけ。§3 の 0 番) |
| 9 | #328 C-4 | CLAUDE.md:132 の承認の範囲を 3.11.2 の「変更(追加・改修・統合・削除)」へそろえる | 機械(`check-pr.mjs` 3c、`:536`)は、指示資産の**すべての変更**を承認の範囲に数えている。狭いのは CLAUDE.md:132 の文だけである。その文の核は `claude-md-resident.json` の CR-053 と一致する | 文 = B / CR-053 の核 = A(B16 の後) |
| 10 | #328 C-14 | 出荷判定者が、判定記録の無い ready-to-merge を dev-done へ戻す行 | CLAUDE.md にも `handoff.md`(:10-31)にも無い。next.mjs は `returnTo` で既にそう出す(裁定のとおり、コードは変えない) | 文 = B / 新しい CR = A(B16 の後) |
| 11 | #347 | 「AIエージェント安全リスクアセスメント(適用: …L2 以上…)」の見出しへ「AI自律レベル」を足し、知識ベースを再生成する | 見出しは標準の `deliverable-templates.md:1858`。`tailoring-kb.json:1649-1652` の title・range・source(アンカー)と、`community/scope-ledger.md` がその見出しを写している。template の templates/09 は既に「AI 自律レベルが L2 以上」と書く | A |
| 12 | #351 H-1 | questions.yaml:9 の help の改めと template:kb | `src/data/tailoring/questions.yaml:9` は旧い文のまま | A |
| 13 | #351 H-2 / IMPL-0278 | 3名以上の回答で名簿の体制の内が空のとき、記載の欠落として検出する | `config.mjs` の headcountProblems が `rosterInsiders > 0` で空を除いている。`test-roster-rules.mjs:349` が「空なら出さない(降りていない差)」として固定している | A |
| 14 | #351 H-7 | D-0 の名簿の記入の手引きへ「受託は発注側の体制の内の人も載せる」 | templates/00-d0-governance.md | B |
| 15 | #351 H-4 | D-0 §2 のコメント(変更履歴の行を指してよい)と、参照先の行が実在するかの検査 | コメント = templates/00-d0 にあり、B。検査 = IMPL-0298(delivered、行の存在だけを見る)の拡張 | コメント = B / 検査 = A(B16 の後) |
| 16 | #351 H-5 / IMPL-0988 | detectDeviations を席の割り当てで分ける | `generate-profile.mjs:555-577` は `approverMode === 'value-owner-merged'` だけで D-1 を出す。席は見ていない | A |
| 17 | IMPL-0760 | CL1 以上の AI 生成箇所の追跡 | `generate-profile.mjs` に practice・traceability の語が0件。規則 r-e-cl1 は知識ベースに入っているが、使われていない | A |
| 18 | IMPL-0839 | 規制業の同じ必須 | 同上。規則は r-c-regulated | A |
| 19 | IMPL-0959 | 調整の宣言(外した項目・簡略化した項目と理由)を提案書へ写せる形で出す | PROCESS-PROFILE.md:31 に「標準からの差分(全ゲートの適用・簡略化・省略)」がある。ただし、提案書へ写す節としては出していない。practice・constraint の調整は出ていない | A |
| 20 | IMPL-1004 | 認証情報の離脱のうち機械が数えない部分を、述べられる名に数えない旨を出す | `generate-profile.mjs:3656` が既に「兼務を禁止した組でない席どうしの認証情報の共有、ホスティングのアカウントの外の認証情報…は数えません…数えない項目は人が確かめます」と出す。`config.mjs:252` も同じ。template の作業は無い | C(state の付け替えは #446 の後。§3 の注) |
| 21 | IMPL-0715 | 廃止予定の四半期の棚卸し・通知・着手の期限 | 依存先の欄(IMPL-0065)には通知の期間しか無い | C(plan=adopter へ。§2) |
| 22 | IMPL-0718 | 全社の統制を、警告→猶予→必須の順で CI へ反映する | template に「猶予」「先行導入」「昇格の予定」の仕組みは無い | B(受け手の側の手引き)+ 組織の側は adopter(§2) |

件数: **(A) 11**(7・9 の json・10 の json・11・12・13・15 の検査・16・17・18・19)、**(B) 7**(3・4 の後半・9 の文・10 の文・14・15 のコメント・22 の手引き)、**(C) 7**(1・2・5・6・8・20・21)。

## 2. (A) と境界の項目への3つの問い(所有者の方針 2026-11-16)

問い: (1) 条文に書くのは結果と証跡までとし、手順は手引きへ置く。(2) 珍しい構成は第7章の例外承認で受けられないか。(3) 破られたとき、誰が何を失うか。細かく定めるのは、安全・取り消せない操作・適合の主張の信頼に当たるものだけとする。

| 項目 | (1) 結果と証跡 | (2) 例外承認 | (3) 失うもの | 降ろし方 |
| --- | --- | --- | --- | --- |
| 7 IMPL-0987 | 結果 = G-5 の通過は PR を評価した起動の結果。証跡 = check run が属する workflow run の `event` | 珍しい構成ではなく、迂回の経路である。例外承認で受けない | 適合の主張の信頼(G-5 を経ない変更が通過に数えられる) | **機械**: 値の一致(event ∈ {pull_request, pull_request_target})。強制層の変更なので、AI維持管理者の承認を経る |
| 9・10 json | 結果 = 常駐の文が標準の範囲と一致する。証跡 = json の核 | 該当しない | 9: 改修を承認の外と読む担い手が出る(機械は止めるが、索引の文と矛盾する)。10: 未判定の作業が出荷判定者に滞留する | **機械**(既存の存在の照合 check-process-rules)。文は B16 |
| 11 #347 | 見出しの語と知識ベースの一致 | 該当しない | 1.4 の読み分け(ADR-0142 決定3)の破れが manual の残りとして残る。被害は語の誤読 | **知識ベースの再生成**(乖離の検査 test:template は既存) |
| 12 H-1 | 設問の help が標準の数え方と一致する | 該当しない | 回答を誤り、規模の規則が緩い側へ倒れうる(適合の主張) | **知識ベースの再生成** |
| 13 H-2 / 0278 | 結果 = 3名以上の回答で体制の内が空なら記載の欠落。証跡 = 構成の people | 名簿を書かない体制は例外承認の対象にしない(構成の条件。exception-paths.md:31) | 名簿が空だと、兼務の禁止・分離の検査が空振りする。独立性の主張の信頼を失う | **機械**: 存在・件数。ただし初期化の途中では止めない(下の §3 の条件) |
| 15 H-4 検査 | 結果 = 参照が実在する表8 の行を指す。証跡 = changeLog の日付 | 該当しない | 参照が無い行を指すと IMPL-0298 の存在の検査は通るが、理由が失われる。監査担当が理由の履歴を失い、表示と実態が食い違う | **機械**: 値の一致(参照した日付が changeLog に在る)。理由の中身は manual のまま。参照の書式が B16 のコメントで決まるため、その後に行う |
| 16 H-5 / 0988 | 結果 = D-1 は兼ねる構成だけに出し、確かめられないときも出す。証跡 = seats と people | 兼ねない2名の構成を例外承認で受ける案は採らない(逸脱の定義の外のものに、承認の手続きを課すことになる) | 過剰な表示: 採用者が述べられる名を不当に下げる。表示を落とす向きの誤り: 適合の主張の信頼を損なう。後者を避けるため、確かめられないときは出す | **機械**: 席の責任者の同一性(値の一致) |
| 17・18 0760・0839 | 結果 = 箇所の単位で辿れる状態。証跡は採用者の記録 | 該当しない | 規制業・CL1 以上の監査要件(適合の主張の信頼、後から再構成できない) | **手引き(生成文)**: PROCESS-PROFILE.md と CLAUDE.md の構成依存部分へ、規則の必須を文として出す。箇所の単位の追跡は自由な文と成果物の対応で、決定可能でないため manual |
| 19 0959 | 結果 = 宣言の中身が提案書へ写せる。証跡 = PROCESS-PROFILE の節 | 該当しない | 宣言せずに運用すること(禁止事項6)は IMPL-0772 が別に追う。ここでの欠けは写す手間の増加にとどまる | **様式の欄(生成する節)**: 既存の「標準からの差分」を元に、practice・constraint の調整を足した「提案書へ写す調整の宣言」の節を出す。c-tailoring を checkConstraints で検査する案は採らない(445-450 の裁定のとおり。0772 と重なる) |
| 21 0715 | 結果 = 棚卸し・通知・着手の期限が定められている。証跡は AI運用担当者の記録 | 該当しない | AI の開発支援が止まる(継続性)。安全・取り消せない操作・主張の信頼のどれにも当たらない | **template に降ろさない(plan=adopter)**。棚卸しと通知は AI 実行基盤の側の活動で、案件のリポジトリの外にある(IMPL-0408・ADR-0104 と同じ型) |
| 22 0718 | 結果 = 猶予を置いて昇格する。証跡 = 昇格の予定日の通知 | 該当しない | 開発組織が突然止まる(生産性)。3つのどれにも当たらない | **組織の側は plan=adopter**(統制の更新と予定日を決めるのは全社の側)。**受け手の側は手引き**: 新しい検査を警告として先に入れる書き方を README か handoff に書く(B16) |

採らない点:
- 0715 の着手の期限を、依存先の欄(IMPL-0065)へ日付の欄として足す案は採らない。445-450 の突合 1巡目が「拡張の余地」として scheduled に戻した点を、方針の問い3で裁定し直した。自己申告の欄を増やすことになり(ADR-0165 決定3 と同じ懸念)、破られたときの損失が3つの対象に当たらない
- 0718 で、昇格の予定日を構成に持たせ、gate-g5 の阻止を日付で切り替える仕組みは採らない(理由は同じ。機構が大きく、組織の側の決定を案件のリポジトリに写すだけになる)
- 0987 で、`gate-g5.yml` のジョブを手動の起動のときに飛ばす形は採らない(skipped の check run は必須チェックを満たす。21-ruling のとおり)
- 0987 で、`workflow_dispatch` を外すだけで閉じる案は採らない。予防として外すことは別に検討してよい(§4)。ただし、採用者が契機を足し戻せるため、集約での検出は外せない
- H-2 で、初期化の直後(名簿をまだ書いていない段)から拒否する案は採らない。初期化の手順を止めるためである
- H-5 で、2名の体制はいつも D-1 とする案は採らない(#351 の裁定の (B) と同じ)
- 1004 を、本束で delivered へ付け替える案は採らない。445-450 の裁定(decision.md:234)は、付け替えを 1.10.2 と 3.5.3 を揃えた後(#446)に置いた。template の文は既にある

## 3. (A) の実装の順

前提: #332(33e0b3ef)の後、配る側の検査は知識ベースの `source.commit` が HEAD の祖先であることを確かめる。そのため、**標準の変更をコミットしてから template:kb を流す**。準拠テンプレートを触る作業は直列で行う。template の push していないコミットは、コミットのたびに bundle へ退避する。

| 順 | 項目 | 標準の側(process-compass) | template の側 | 試験 |
| --- | --- | --- | --- | --- |
| 0 | 0303・0715・0718 の plan | 新しい ADR(445-450 の ADR-0175 の型)1件に、3件を plan=adopter とする決定と、§2 の採らない点を置く。マークを `plan=adopter decision=ADR-NNNN` へ改め(0718 は組織の側の文へ絞る)、受け手の側の手引きの新しい IMPL を target=handoff-reference(または README の登録)で undelivered として起こす。`npm run impl:write` | なし | lint:impl・test:impl・test:plan-issues |
| 1 | 11 #347・12 H-1 | `deliverable-templates.md:1858` の見出しを「…本番到達・AI自律レベル L2 以上のいずれか)」へ改める。アンカーを引く内部リンクは grep で0件と確かめた(scope-ledger だけ)。`questions.yaml:9` の help を 351 の 04-ruling:12 の文へ改める。`npm run scope:write`。**ここで標準をコミットする** | `npm run template:kb` で `scripts/vendor/tailoring-kb.json` を再生成する(title・range・source・q-team-size の help・source.commit)。template へコミットする | test:template(乖離)・lint:scope・lint:refs。template 側で test-init-g5 |
| 2 | 16 IMPL-0988 | IMPL-0988 を `state=delivered check=machine test=template/scripts/gate/<試験>` へ改め、note を実装に合わせる | `generate-profile.mjs` の detectDeviations に構成(seats・people)を渡す。value-owner-merged で、出荷判定者の席の責任者が開発者・独立レビュアの席の責任者と同一でないと確かめられたときだけ D-1 を出さない。未割当・名簿が空・識別できないときは出す。呼び出し元と aggregate-evidence の D-1 の表示を合わせる | 違反と適合の対: 兼ねる2名 → D-1、外部の確認者を独立レビュアに置いて兼ねない2名 → D-1 なし、未割当 → D-1、1名 → D-1。`// IMPL-0988:ng/ok` の印 |
| 3 | 13 H-2 / IMPL-0278 | IMPL-0278 を delivered・machine・test=test-roster-rules.mjs へ。IMPL-0300 の note から「空を検出しない」を外す | `config.mjs` の headcountProblems に「回答が3名以上、体制の内が0名、かつ D-0 を作成済み(`d0Version` を取得済み)」の条件を足す。条件は実装の担当が初期化の順を読んで確かめる。名簿を D-0 から取り込む時点より前に出ないこと、test-init-g5 の初期化の経路を止めないことを確かめる | `test-roster-rules.mjs:349` の固定を「出す」へ反転する(過去の決定の固定ではなく、降りていない差として印がある)。ok の側: d0Version が無い構成では出さない |
| 4 | 17・18 IMPL-0760・0839 | 2件を delivered・check=manual へ(生成文が届き、箇所の単位の照合は人)。note に「生成文の所在」と「照合は manual」を書く | `generate-profile.mjs` が、規則の調整のうち practice の set を読む。traceability が required なら、PROCESS-PROFILE.md と CLAUDE.md の構成依存部分へ、「AI 生成箇所を、どこを生成し誰が承認したかで辿れるようにする(規則 r-e-cl1 / r-c-regulated)」の文を出す。json の対は要らない(目印の区間の中) | test-init-g5: cl1 の回答 → 文が出る。規制業 → 出る。どちらでもない → 出ない |
| 5 | 19 IMPL-0959 | delivered・check=manual(写すのは提案書の起案者)へ | `renderProfileMd` に「提案書へ写す調整の宣言」の節を足す。既存の「標準からの差分」と、practice・constraint の調整、外した項目・簡略化した項目、理由を並べる。宣言が無い構成では「なし」と出す | test-init-g5: 省略・簡略化のある回答 → 項目と理由が出る。無い回答 → 「なし」 |
| 6 | 7 IMPL-0987 | §4 の実機の確認の後に、IMPL-0987 を delivered・machine・test へ。#329 は 0987 と 0303(順 0)が片付いてから閉じる | `aggregate-evidence.mjs`: gate-g5 の結果を、workflow run の `event`(check run の `check_suite.id` から `actions/runs?check_suite_id=`、または `actions/runs?head_sha=`)で確かめる。PR の経路では pull_request・pull_request_target の成功だけを通過に数える。事象を確かめられないものは通過に数えず、「未確認(起動の事象を読めない)」と出す。push の経路(IMPL-0238)は対象外。`record-copy.yml` の写しに gate-g5 の起動の事象を足す(`ship-evidence.yml` は `actions: read` を既に持つ)。実機で予防が要ると分かれば、`gate-g5.yml` から `workflow_dispatch` を外し、事前点検・契約検査(push-trigger.mjs の型)が戻されたことを検出する | test-g5-missing・test-aggregate-records に、workflow_dispatch の成功の run だけを持つ PR → 欠落、pull_request の成功 → 通過、事象を読めない → 未確認、の対を足す |
| 7 | 9・10 json(**B16 の push の後**) | IMPL の新設は無い。IMPL-0331 の note は既に C-14 を書いている | B16 の CLAUDE.md:132 の文に合わせて、CR-053 の核を手で改める(範囲を広げる向きなので、omit・needs-platform の対象ではない)。C-14 の新しい行は `check-process-rules.mjs --write-resident` で足す | test-init-g5(一覧と CLAUDE.md の一致)・test-claude-md-resident |
| 8 | 15 H-4 検査(**B16 の push の後**) | IMPL-0298 の note に「参照した表8 の行の実在も確かめる」と足す(delivered・machine のまま) | `aggregate-evidence.mjs` の非推奨の兼務の記録の照合(IMPL-0298)で、理由の欄が B16 の書式「表8 の YYYY-MM-DD の行」を書いたとき、その日付の changeLog の行が在るかを確かめる。無ければ記載の欠落とする | test-discouraged-evidence.mjs: 在る日付 → 通る、無い日付 → 欠落、理由を直に書いた行 → 従来どおり |

注:
- **順 7 は B16 と同じコミット列で行う**。B16 が CLAUDE.md:132 だけを先に push すると、CR-053 の核が CLAUDE.md の行に含まれなくなり、test-init-g5 が落ちる。CI も落ちる。指揮役は、B16 の CLAUDE.md の変更と本束の json の変更を、同じ template のコミット(または同じ push)に入れるよう段取る
- 回帰の全量(`npm run check`)は push の前に1回だけ流す。途中の段では、表に書いた関係する試験だけを流す
- 1004 は template の作業が無い。#446 が 1.10.2 と 3.5.3 の揃え方を決めた後に、target を文の実在する profile-generator へ移し、delivered・manual へ付け替える(同じ型の IMPL-1003 も同じ)

## 4. 所有者にしか決められない点

1. **IMPL-0987 の実機の確認と、強制層の変更の承認**。成功した手動の起動が、ルールセットの必須チェックを満たすかは未確認である。確かめるには、一時の GitHub リポジトリ(pit-in-trial は削除済み)を作り、ルールセットを設定し、PR と手動の起動を行う必要がある。外部への作成と、AI維持管理者としての承認(集約の判定の変更、場合によっては `gate-g5.yml` の契機の削除)は、所有者にしか出せない。確認できない場合の扱いも決めてほしい。この案は、実機の結果を待たずに集約の検出(順 6)を入れ、契機の削除だけを実機の結果の後に回す

ほかの項目は、決定済みの裁定と方針の3つの問いで閉じられる。所有者へ上げる点は無い。
