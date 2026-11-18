# 束 B18 (a) 機械の検査の棚卸し

作成 2026-11-18。読んだ範囲の棚卸しで、条項も template も変えていない。

## 0. 前提と凡例

- 入力: `src/content/docs` で `state=undelivered` かつ `issue=` が対象 13 件のマーク(117 件。B18 の作業ツリーの値。`npm run impl:issues` は実行せず grep で代えた)、ADR-0175、`research/445-450-deliberation/decision.tsv`、`research/b13-comments/`、`research/b16-deliberation/comments/`、`research/325-deliberation/05-issue-comment.md`(T1〜T11)、各 deliberation、template の現状
- 並行の B15 のブランチ(`../b15`、未 push)では、**IMPL-0278・0988(#351)、0959・0839(#446)、0760(#448)が undelivered でなくなっている**。「済み(B15)」として除く(残り 112 件)
- 区分: **D** = 決定可能(値の一致・存在・構文・日付の前後・件数)で (a) にできる。**D\*** = 決定可能な部分だけ (a) にし、残りは check=presence か manual で note に開示する。**M** = 意味を読む必要があり、様式の欄(b)か手引き(c)へ改める候補。**依存** = 先に降ろすものがある。**未決** = 重の審議か実測が先
- **【B15】** = B15 が触るファイル(template の `aggregate-evidence.mjs`、`config.mjs`、`verify-gate-contract.mjs`、`generate-profile.mjs`、`tailoring-kb.json`、`record-copy.yml`、`test-aggregate-records.mjs`、`claude-md-resident.json`、本体 `src/data/tailoring/`)に当たる
- 接頭辞 `T:` = `template/`、`M:` = 本体。「新規」と書いたもの以外は作業ツリーで実在を確かめた。`test-*.mjs` は、専用の試験が無いものを「新規」または「近い既存」と書く
- 所見の末尾の「軽」「重」は所有者の方針の適用。**重** = 破られて安全・取り消せない操作・適合の主張の信頼を失うため細かく書いてよい。**軽** = 結果と証跡までにとどめ、細かい定義を増やさない
- 区分「類似検知」の行・F.7 の記録の節は B16 で様式に入った。#448 の 0761・0927・0934・1007 と #355 の 1009 の note にある「置き場が無い」は古い(降ろす段で改める)

## 1. #445(18 件。B16 コメントの残り 18 件と一致)

| IMPL(target / 節 / 出所) | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0136(review-queue-control / gate-criteria / a) | 散文の変更にも判定 SLA と滞留の措置 | D。拡張子による散文の識別(isProseDocument)。担い手への指示文書を散文に数える当否は未決 | T:scripts/gate/check-pr.mjs、test-check-pr.mjs | 軽。境界は note で開示 |
| 0567(pr-checks / 7.4 / a) | G-4・G-5・認証・認可・データ保全を対象とする行を例外として受け付けない | D\*。区分・状態の値は D。行の「対象」が自由文なら M(対象の列挙値の欄が要る) | T:scripts/gate/exception-expiry.mjs、test-exception-expiry.mjs、T:templates/03-debt-ledger.md | 重(安全)。ADR-0153 決定2 の語に揃える |
| 0610(pr-checks / 7.4 制約1・3 / a) | 未回収のファストトラックが残る間は新規申請を拒む。事後レビューの期限切れの検出 | D。区分の行の存在・状態・期限の日付比較。権限の停止は人 | 同上(03 台帳に区分「ファストトラック」を足すのが先) | 重(取り消せない操作の乱用防止)。0567・0630・0612・0669・0830 と一式 |
| 0630(pr-checks / 7.9.5 要求事項2〜4 / a) | 枠の期中補充の禁止、使い切り後は例外を認めない、行使ごとの事後レビュー | D\*。枠の件数と行使の行の数は D。枠を書く欄が無い(**依存**)。補充の有無の判断は人 | 同上 | 重。0669(#355)と欄を1つで共有 |
| 0680(review-queue-control / a) | レビュー依頼を個人に指名しチーム宛てにしない | D。requested_reviewers と requested_teams の構文 | T:.github/workflows/review-queue-control.yml(新規)、T:scripts/gate/review-queue.mjs(新規) | 軽 |
| 0681(同 / a) | 滞留の措置(催促・2倍超過の通知・判定完了超過で代理指名の適用) | D\*。超過の検出と通知の起動は D。代理の指名の適用は人 | 同上 | 軽。自動承認にしない(IMPL-0535) |
| 0682(同 / a) | 同時保有数の上限(既定 1人3件)、上限到達者へ指名しない | D。件数。差し戻しは手引き | 同上 | 軽 |
| 0761(gate-skill / tailoring-guide / a) | CL2 以上の安全適合性の検証記録を G-7 の判定基準にする | D。F.7 の記録の存在・空欄(様式は B16 で降りた) | T:scripts/gate/aggregate-evidence.mjs、test-aggregate-records.mjs | **【B15】**。重(安全)。#448 の 1007・1016 と一緒に |
| 0763(g5-adapter / tailoring-guide / a) | CL3 の CI の必須チェックに故障挿入試験とミューテーション試験の段 | D\*。adapter.mjs の段の宣言の存在は D。試験の中身は採用者のコマンド | T:scripts/gate/adapter.mjs、test-adapter.mjs | 重(安全)。0930・0931 と同じ段 |
| 0771(gate-contract / tailoring-guide / a) | 差し戻し基準の表を持たないゲートを作らない(禁止事項3) | D。ゲート定義の表の存在(構文) | T:scripts/gate/verify-gate-contract.mjs(近い既存の試験: test-adoption.mjs) | **【B15】**。軽。構成にゲートを足す経路は無く、知識ベースの定義の検査で足りる |
| 0801(g1-check / 第6章 / a) | 禁止した一般語のみの欄、代替手段の欄に「ない」のみ | D\*。禁止語・「ない」の完全一致は D。「一般語のみ」の広い判定は M | T:scripts/gate/check-g1.mjs(近い既存の試験: test-brief-estimates.mjs) | 軽。意味の判定は課さない旨を note に残す |
| 0878(g1-check / 第6章 / a) | 企画書の記述が前案件と同一であることの検査 | D\*。前の企画書の所在を受けたときだけ文字列の一致を出す。与えなければ「未確認」。失敗にせず所見 | T:scripts/gate/check-g1.mjs | 軽。#355 の 0990 と型を揃える(0990 は重の審議待ち) |
| 0884(gate-entry-workflow / lifecycle / a) | 立ち上げの順序(登録→D-0→承認→安全重要度→安全リスク→企画書→G-1)を入れ替えない | D。先行記録の存在と日付の前後 | T:scripts/gate/check-g1.mjs、T:.github/workflows/gate-entry.yml | 重(安全重要度の判定の抜けにつながる)。日付が無い記録は「確認できない」と出す |
| 0930(g5-adapter / 附属書F / a) | AI に試験を書かせる工程で、網羅率でなくミューテーションスコアの閾値を通過条件にする | D。G-1 の閾値との数値比較、段の宣言 | T:scripts/gate/adapter.mjs、coverage-check.mjs | 重(安全) |
| 0931(g5-adapter / 附属書F / a) | ミューテーション試験を CI に組み込む(増分・閾値・生存一覧を根拠に残す) | D\*。段の存在・閾値の比較・一覧の存在は D。安全関連部・R1 の優先の妥当性は M | T:scripts/gate/adapter.mjs、T:.github/workflows/gate-g5.yml | 重(安全)。【B15】近接(B15 の #329 T-7 が gate-g5.yml の起動を限定する) |
| 0972(pr-checks / 2.6 要求事項4 / a) | 識別を持つ変更は取り込む前に、判断記録の G-3 の判定記録を要する | D。PR 本文の識別子から判断記録を引き、G-3 の判定記録の存在を突合 | T:scripts/gate/check-pr.mjs、test-check-pr.mjs | 軽。判断記録の実在は IMPL-0384 で済み |
| 0979(review-queue-control / 7.4 周辺 / a) | 判定期限の超過を検出し、代理を指名する者へ通知 | D\*。超過の検出と通知の起動は D。指名する務めは人(通知で終わらせない) | T:.github/workflows/review-queue-control.yml(新規) | 軽。0681 と同じ workflow |

## 2. #446(18 件のうち 0839・0959 は B15 で済み → 16 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0594(autonomy-derivation / 3.12 / a) | リスク区分ごとの最大レベル(R1=L1、R2=L2)の照合。安全関連部は R1・L1 固定 | D。値の比較。安全関連部の範囲は構成の宣言値 | T:scripts/gate/autonomy.mjs(近い既存の試験: test-check-delegation.mjs) | 重(安全)。0919・0766・0834・#348 の 0291・1006 と同じファイル。直列 |
| 0597(config-delegation / a) | 委任の条件4(単独で取り消せ実績がある)・条件6(事後の抜き取り) | D\*。記録の欄・件数の存在(presence)。取り消し実績の中身は M | T:scripts/gate/config.mjs(changeTypeProblems)、delegation.mjs | **【B15】**。重(取り消せない操作の委任) |
| 0599(config-delegation / a) | 席ごとの委任範囲・協働で AI が起案できるものの上限の表を値の検査として持つ | D。SEAT_CEILING の値の一致 | T:scripts/gate/config.mjs | **【B15】**。軽 |
| 0636(config-seats / 3.4.1 / presence) | 任命前の任命基準の充足の確認の記録 | D\*(presence)。seats[].competence の欄の存在。実質は M | T:scripts/gate/config.mjs | **【B15】**。軽。欄を増やさず存在までにとどめる |
| 0640(config-seats / 3.4.2 / presence) | 席の単位の適合性確認(過去判定の再現・欠陥注入)の記録の7項目 | D\*(presence)。seats[].qualification の欄の存在。7項目の中身は M | T:scripts/gate/config.mjs | **【B15】**。軽。7欄の新設は細かい定義が増えるため、記録の所在の確認までを推奨 |
| 0643(config-seats / 3.4.2 / a) | モデル適合性評価を通過していないモデルを席の確認の対象にしない | D。モデル識別子と評価の記録の照合 | T:scripts/gate/model-adoption.mjs、test-model-adoption.mjs | 軽 |
| 0651(process-profile / 3.5.3 / a) | 実行主体が参照する内容(自ロール・判定ゲート・担ってはならない工程・引き渡し先)が D-0 の改訂に追随 | D\*。席名・ゲート名の一致は D。追随の十分さは M | T:scripts/gate/verify-gate-contract.mjs | **【B15】**。軽 |
| 0664(config-delegation / 3.7.4 B-4 / a) | 標準変更カタログに登録できる種別は R3 だけ。削除・縮小は定例を待たず適用 | D\*。種別の属性の値は D。即時適用は手順のため M | T:scripts/gate/config.mjs | **【B15】**。軽 |
| 0709(config-change-log / 3.12.3 要求事項10 / a) | 評価用の基準集合の範囲を狭める変更を統制を緩める向きとして扱う | D\*。範囲を構造化値で持つなら包含比較は D。自由文なら M | T:scripts/init/generate-profile.mjs(差分の分類) | **【B15】**。重(統制の緩和)。範囲の持ち方が先 |
| 0767(process-change-skill / tailoring-guide / a) | 区分の引き下げの制約(受入基準の必須制約)を外す変更を再判定の対象にする | D。印の有無と文字列一致(ADR-0136) | T:scripts/gate/spec-recheck.mjs、test-spec-recheck.mjs、T:templates/01-feature-spec.md | 重(区分の引き下げ=安全) |
| 0772(config-deviations / 禁止事項6 / a) | 標準から外した項目を宣言せずに運用しない | D。規則導出との差と deviations の宣言の突合 | T:scripts/gate/verify-gate-contract.mjs | **【B15】**。重(適合の主張の信頼) |
| 0834(autonomy-derivation / 3.12.10 要求事項5 / a) | 登録の根拠の4点目(強制の手段の所在・該当なし)の記入を登録時に確かめる | D(presence)。記入の有無 | T:scripts/gate/autonomy.mjs、config.mjs(登録の検査) | **【B15】**(config.mjs)。#348 と共通。B16 は手引きまで |
| 0840(config-delegation / a) | 委任の対象にできる種別の属性3つの欄と値の列挙 | D\*(presence)。欄・値の列挙。真偽は申告のため M | T:scripts/gate/config.mjs、delegation.mjs | **【B15】**。重(委任) |
| 0900(config-roles / 3.5.2 / a) | 支援に関与した者を同一案件の G-7 の判定者にしない | D。名簿の席・人の ID の一致。兼務禁止の組を足す | M:src/data/tailoring/(組)→ `npm run template:kb` → T:scripts/vendor/tailoring-kb.json | **【B15】**。重(判定の独立)。ADR-0082 の兼務の境界と突合 |
| 0980(process-change-skill / 3.12.12 要求事項5 / presence) | 判断「外す」の再評価でも移した先の保証を示す | D(presence)。欄の空 | T:scripts/gate/recalibration.mjs、recalibration-registry.json、test-recalibration.mjs | 軽 |
| 1004(evidence-aggregation / overview / c) | 機械が数えない離脱を構成書の注記に「人が確かめる」と足す | M(c・manual)。出力文の追加。B16 は B15 の前提が未了として対象外にした | T:scripts/gate/aggregate-evidence.mjs(注記文) | **【B15】**。軽。1003(#356)と同じ型 |
| 0839 | 規制業のトレーサビリティ | **済み(B15)** | — | B15 のブランチで delivered。push 待ち |
| 0959 | 調整の宣言を PROCESS-PROFILE に出す | **済み(B15)** | — | 同上 |

## 3. #448(11 件のうち 0760 は B15 で済み → 10 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0759(d0-template / tailoring-guide / a) | 構成要素ごとの安全重要度の最も高い区分をシステム全体の区分にする | D。区分の順序づけと最大値の一致 | T:scripts/gate/check-d0.mjs、cl-judgment.mjs、test-cl-judgment.mjs | 重(安全)。リスク区分と CL を混ぜない(ADR-0039) |
| 0764(profile-generator / a) | 案件の安全重要度ごとのテスト生成の分離の段階(CL2=段2以上、CL3=段3以上) | D。CL と段の数値対応 | T:scripts/init/generate-profile.mjs、verify-gate-contract.mjs | **【B15】**。重(安全) |
| 0766(profile-generator / a) | CL3 で安全関連部の外に限り L2 以上を認める分岐 | D。範囲の宣言値による分岐 | T:scripts/gate/autonomy.mjs | 重(安全)。0594・0919 の範囲の概念に依存 |
| 0919(autonomy-derivation / 附属書F / a) | 安全関連部に AI の支援を用いるとき AI自律レベルを L1 に固定 | D。範囲の宣言と L1 の比較 | T:scripts/gate/autonomy.mjs | 重(安全)。autonomy.mjs 直列の先頭 |
| 0925(safety-verification-record / F.5 / a) | 運用中の安全関連システムへ故障を挿入しない | D\*。F.7 の「挿入した環境」欄(B16 で降りた)の値が試験台・模擬環境の列挙に一致。実際の環境は申告で、機械は閉じない | T:scripts/gate/check-safety-record.mjs(新規)、T:templates/09-safety-risk-assessment.md | 重(取り消せない操作)。申告にすぎない旨を note で開示 |
| 0927(safety-verification-record / a) | 最小限の試験項目のうち項目2 を省かない | D(presence)。7項目の記載の有無(新節は B16 で降りた) | T:scripts/gate/check-safety-record.mjs(新規) | 重(安全)。項目は標準のものを使い、列挙を新設しない |
| 0934(safety-verification-record / a) | 適用しなかった HR の項目に理由が無い記録を差し戻す | D(presence)。HR の理由欄の空。**依存**: 09 の新節に HR の欄が無い(B16 は未着手) | T:scripts/gate/check-safety-record.mjs、T:templates/09-safety-risk-assessment.md | 重。欄が先。差し戻しは判定者の務め |
| 1007(evidence-aggregation / gate-criteria / a) | G-7 基準7 の F.7 の項目の欠落(置き場が無い・空欄)を記載の欠落に数える | D。項目の存在と空欄 | T:scripts/gate/aggregate-evidence.mjs、test-aggregate-records.mjs | **【B15】**。重(適合の主張) |
| 1015(config-gates / tailoring-guide) | Q1 の写しを導出の入力に足し、S0 の G-7 の省略を取り消す(ADR-0171) | D。質問・規則・stage-table・エンジンの試験。正本は本体 | M:src/data/tailoring/(questions.yaml ほか)、M:src/lib/tailoring-engine.mjs → `template:kb` → T:scripts/vendor/tailoring-kb.json、T:scripts/init/generate-profile.mjs | **【B15】**(B15 は #447 の知識ベースの規則を扱う)。重。note の「暫定の文を外すことが無い」は降ろす段で確認 |
| 1016(evidence-aggregation / tailoring-guide) | Q1 の写しと D-0 の f2Q1Of の食い違いを記載の欠落に数える(写し「いいえ」・D-0「はい」の向き) | D。値の一致。check=machine に改め試験を名指す | T:scripts/gate/aggregate-evidence.mjs、cl-judgment.mjs、test-cl-judgment.mjs | **【B15】**。重 |
| 0760 | CL1 以上の AI 生成箇所の追跡 | **済み(B15)** | — | B15 のブランチで delivered |

## 4. #450(1 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0645(debt-ledger-template / 3.4.3 要求事項6・7 / a) | コア機能の理解の保持者が1名以下を列挙に無い離脱として扱い、是正の期限と責任者を台帳へ登録 | D\*。保持者数 ≤1 の件数は D。台帳への登録は手順(M)。D-0 節15 の受容(層1)は別 | T:scripts/gate/org-assurance.mjs(近い既存の試験: test-env-check.mjs)、T:templates/03-debt-ledger.md | 重(組織継続=適合の信頼)。B16 は対象外 |

## 5. #441・#443・#444

### #441(1 件 + マークのない作業 1 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0268(evidence-aggregation / gate-criteria / ADR-0172) | 一発承認率を差し戻し率と並べて集約に出す。最小標本数に満たない窓は「判断に用いない」 | D。差し戻しの判定記録が0件の承認の件数と窓の当てはめ。値が承認の質を表すとは主張しない | T:scripts/gate/aggregate-evidence.mjs、test-aggregate-records.mjs | **【B15】**。軽。単独で出さず合否・欠落に数えない |
| (マーク無し) | トレーラの読み方を末尾の段落に揃える共有関数(next.mjs の doneTasks、lastParagraph、aggregate の %(trailers) の3通り) | D。共有関数と対の試験。スカッシュ2通りで実メッセージを確認 | T:scripts/gate/next.mjs、aggregate-evidence.mjs、records.mjs | **【B15】**。軽。影響するコミット数を数えてから移行の注意を書く |

### #443(8 件。B13 の指定の順 1〜7)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0283(flow-observation / lifecycle) | 滞留期間の観測と、実測サイクルタイムの85パーセンタイル超過の通知 | D。算術と日付。値が無いときは通知せず「算定できない」。「着手した時点」は template の定義として開示 | T:.github/workflows/flow-observation.yml(新規)、T:scripts/gate/flow-observation.mjs(新規。近い既存: size-observation.mjs) | 軽。順 1 |
| 0374(next-role / lifecycle / EV-0317) | 実測スループットの集計。既定の完了の条件を決まった文で持ち完全一致を判定 | D。文の完全一致、closes と完了の理由。閉じたが完了でない個数も並べる | T:scripts/gate/next.mjs、brief-estimates.mjs、T:templates/06-project-brief.md | 軽。順 2。企画書だけを読む点は note で開示 |
| 0377(next-role / 7.7.2) | 必達基準2 の到達の見込みの算定(両端と区分) | D。個数と窓ごとの完了スループットの最小・最大。入力が無い組は「算定できない」 | T:scripts/gate/next.mjs(近い既存の試験: test-reach-forecast-record.mjs) | 重(区分が判定者を拘束する)。**依存**: 0374。順 3 |
| 0614(next-role / 7.6) | 発火条件の材料(個数・スループット・残る期間・SC-M の変動率)を見込みの報告の Issue へ出す | D。集計のみ。評価と発火の判断は価値責任者 | T:scripts/gate/next.mjs | 軽。**依存**: 0374。順 4 |
| 0954(flow-observation / 2.10.5) | 価値責任者の調整の記録(ゲート欄「価値責任者の調整」)を読む。集約が新ゲート欄を欠落に数えないことを実行で確認 | D。欄の読み取りと実行での確認 | T:scripts/gate/aggregate-evidence.mjs、T:templates/04-gate-record.md(注記に値) | **【B15】**。軽。順 5。2.10.5 と 3.10.1 の食い違いは #325 へ寄せ済み(重) |
| 0500(next-intake / roles-responsibilities) | --pickup が止めた件数を Issue の宣言行へ1行残し /pit が数える | D。宣言行の件数。合否に使わない。トークンの権限と二重に数えない | T:scripts/gate/next.mjs、T:.claude/skills/pit/SKILL.md | 軽。順 6 |
| 0175(gate-record-template / human-ai-boundary / EV) | 確認を求める項目の並びを周期的に変える(提示の層のみ) | D\*。種から並びを導く決定論と周期は D。確認の質が上がるかは未実証(EV で開示)。検証の順序は回さない | T:.claude/skills/gate/SKILL.md、T:scripts/gate/(種の関数。新規) | 軽(実証が無い)。順 7。判定記録の見出しと機械が読む欄は変えない |
| 0899(handoff-reference / 2.10.6) | 期日に間に合わない見込みの評価と手続の順序(範囲→期日→基準) | M。順序の違反を誰が確かめるかが未決(重の審議の候補。新しい席の義務になりうる) | T:.claude/skills/pit/reference/handoff.md | **未決・M**。(a) に降ろさない |

### #444(7 件。B13 の指定の順 1〜7)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0207(agent-run-record / human-ai-boundary / ADR-0126 決定5) | 実行の識別子を git のフックでコミットのトレーラへ足す | D。環境変数があるときだけ足す。足す・足さない・--resume の対の試験 | T:scripts/gate/(commit-msg 用スクリプト。新規)、T:.claude/settings.json | 軽。順 1。--no-verify の扱いを確かめる |
| 1019(agent-run-record / ADR-0126 決定5) | SessionStart フックで HEAD・指示資産の要約値・コミットに無い変更の有無を実行の識別子とともに記録 | D。値の記録。下位の担当でフックが走るかは未確認(開示) | T:.claude/settings.json、T:.claude/hooks/(新規) | 軽〜重(監査の入力)。順 2 |
| 0506(agent-settings / human-ai-boundary / manual) | sandbox の設定(enabled・allowUnsandboxedCommands:false・allowedDomains)を既定の拒否として置く | D\*(presence)。設定値の存在は D。効いたかは manual(AI維持管理者が S2 で確認) | T:.claude/settings.json | 重(隔離)。順 3。ネイティブ Windows は feature gate が off(W4) |
| 0510(agent-settings / 要求事項6) | シェルから強制層のファイルを書き換える操作の拒否 | D\*。0506 の設定のもとで deny の全パスへの書き込み拒否の対の試験(環境依存の実機試験) | T:.claude/settings.json、T:scripts/gate/(試験。新規) | 重。**依存**: 0506。順 4。macOS・ネイティブ Linux は未確認 |
| 0743(agent-run-record / tailoring-guide / manual) | 版を特定できない実行の出力を監査の入力から外す(件数と一覧は出す) | D\*。AI の印を持つのに版の記録へ結び付かないコミットの抽出は D。印の無いコミットの判別は M | T:scripts/gate/aggregate-evidence.mjs またはその隣 | **【B15】**。**依存**: 1019。順 5。fail-open にしない(採らない案を維持) |
| 0200(guard-write-hook / human-ai-boundary) | 計画外の置き場への書き込みの既定の拒否 | **未決**。計画の読み方と既定の一覧を決める実測が先(誤遮断で作業が止まる) | T:.claude/hooks/guard-write.mjs、T:.claude/guard.json | 重。順 6。履歴の事後の照合で実測してから |
| 0828(agent-run-record / 3.12.5 要求事項5) | 切り替え期間中に生成された変更を特定できる状態にする | **依存**: #447(IMPL-0826)の後 | 未定 | (a) の対象外。順 7。触らない |

## 6. #325・#326・#348・#351・#355・#356

### #325(15 件。B16 は template に触れていない。T1〜T11 は `research/325-deliberation/05-issue-comment.md`)

| IMPL(T) | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0225(T1) | 読み込んだファイルの記録(PostToolUse の Read を追記)。記録できない種別は一覧に出す | D\*。Read の追記は D。ログを「監査できる状態」の証拠にしない | T:.claude/settings.json、T:.claude/hooks/(新規) | 軽。提供者のフックの仕様が未確認 |
| 0214(T2・T3) | R2 は pre-review-closed、R1 は pre-review-all-responded を必須チェックに加える。AI の担い手を数えない | D。受付期間の終了、全意見への起案者の応答、R1 の指名者全員の記名応答の存在 | T:.github/workflows/pre-review.yml(新規)、T:scripts/gate/pre-review.mjs(新規)、T:.github/rulesets/*.json | 重。**採用者の既定の必須チェックにするかは重の審議(T 未決2)**。作ることと既定にすることを分ける |
| 0571(T2) | 事前レビュー期間の対象の選び方(B-1〜B-4 の全上程、工程ゲートは非同期のみ、標準変更を外す) | D。構成の宣言と PR ラベルの照合 | 同上 | 軽 |
| 0215(T4) | 意見の様式の欄の空欄を示し分割を促す(注意の喚起に限る) | D(presence)。欄の空(構文)。意味は機械が決めない | 同上 | 軽。未成立にしない |
| 0216(T5) | 形骸化の指標の月次の集計(AI を分子・分母に含めない) | D。比率の計算 | 同上 | 軽 |
| 0211(T6) | 所有者の無い領域を CI で失敗させる | D\*。`@OWNER` のままの検出と名簿(D-0)に載る個人かの照合は D。部署名の実質は M | T:.github/CODEOWNERS、T:scripts/gate/roster-ids.mjs、check-pr.mjs | 軽 |
| 0210・0213・0218・0219(T7) | 判定資料の自動起票、締切の通知と記録、往復3回超の検知、未応答への措置の起動 | D\*。起票・通知の起動・日付・往復の数は D。起案者の確定・同期の場の実施・措置は人。通知基盤に依る 0213・0218・0219 は adopter になりうる(T 未決) | T:.github/workflows/pre-review.yml、scripts/gate/pre-review.mjs | 軽。営業日は採用者の暦に依る。通知の起動までにとどめる |
| 0212(T8) | リスク区分の一次判定のラベル(risk/R1〜R3)の自動付与 | D。下限の規則の結果を付けるか宣言を写すかは降ろすときに決める。引き下げの妥当性は人 | T:scripts/gate/check-pr.mjs、test-check-pr.mjs | 重(区分の誤りは統制を落とす)。名簿の外の人を確定者にした場面の試験を足す(F6) |
| 0217(T10) | 必須応答ロールの該当を機械判定し記名応答が揃わなければ判定へ進めない | D\*。採用者が宣言した対応表(対象パス→ロール)の照合は D。依存関係・設定項目の種別は M(adopter か manual) | T:scripts/gate/pre-review.mjs、T:scripts/gate/config.mjs(対応表) | 【B15】近接。軽 |
| 0231(T9) | 起案者が応答に理由を添えて記録し、決定者が判定記録で確かめる | **M**。欄(b)。意見として扱わない判定は manual。標準の第6章に欄があるかの確認が先 | T:templates/04-gate-record.md | 軽。(b) へ改める |
| 0877(T9) | 提出者の応答の定め(反映の義務なし、採否と理由の応答、不採用に一言の理由) | **M**。応答の記録の欄(b) | T:templates/04-gate-record.md、M:phase4-process-design/deliverable-templates.md | 軽。(b) へ改める |
| 0830(T11) | 事前レビュー期間の短縮はファストトラックを適用した場合に限る | D。短縮日程と台帳のファストトラックの行の参照・日付比較。短縮の下限は未決(EV-0281) | T:scripts/gate/pre-review.mjs、exception-expiry.mjs | **依存**: #445 の 0610・0567。重(短縮は審査を薄くする) |

### #326(2 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0497(adoption-trial / gate-criteria) | 是正の記録の欠け(state:needs-platform の記録があるのに欠陥台帳の節「是正の記録」に行が無い)の検出 | D。ラベルの有無と台帳の行の存在 | T:scripts/gate/adoption-trial.mjs、test-adoption.mjs、T:templates/defect-ledger.md | 軽 |
| 0145(evidence-aggregation / roles-responsibilities) | 強制層の検査の棚卸しの入力(是正の記録、検査ごとの失敗の履歴)を一覧に出す | D。CI の実行の記録の集計。解釈は人 | T:scripts/gate/aggregate-evidence.mjs、T:.github/workflows/ship-evidence.yml | **【B15】**。軽。出力だけ |

### #348(2 件。0834 は #446 の行)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0291(autonomy-derivation / human-ai-boundary) | 第2区分の窓が判定不能、または基準値が未設定のとき登録した変更種別を止める | D。窓の判定可能性と基準値の有無。戻る条件は日付の前後 | T:scripts/gate/autonomy.mjs | 重(止めるのは安全側)。autonomy.mjs 直列に入れる |
| 1006(autonomy-derivation / gate-criteria) | 手戻り率の基準値の決め方を構成に持ち、次の一手と保証の開示に出す。値は書き換えて表示しない | D。値の存在と日付(先行する窓が無い「実測から」の検出) | T:scripts/gate/autonomy.mjs、config.mjs | **【B15】**(config.mjs)。重(AI自律レベルの引き上げの根拠) |

### #351(2 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0278 | 軸A の人数の食い違いの検出 | **済み(B15)** | — | B15 のブランチで delivered |
| 0988 | 1〜2名体制の D-1 の表示 | **済み(B15)** | — | 同上 |

### #355(29 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0963(assurance-case 附属書H H.8) | 対外の文書の保証表現(「独立検証済み」等)の禁止 | D\*。禁止語の完全一致を所見に出す。「範囲・根拠を伴わない」は M。組織が書く文書は集約の範囲外 | T:scripts/gate/aggregate-evidence.mjs(IMPL-0308 の語の拡張) | **【B15】**。重(適合の主張の信頼)。#445 の 0962(提案書は対象外)と揃える |
| 0787(第6章) | 返却目安の期限切れの未返却と失効を欠落に数える。延長は新しい行 | D。日付の前後と行の状態 | T:scripts/gate/aggregate-evidence.mjs、T:templates/03-debt-ledger.md | **【B15】**。重 |
| 0612(7.4 制約5) | ファストトラックの発生率・回収完了率・適用後の欠陥発生率の継続測定 | D\*。比率は D。**依存**: #445 の 0610(区分)。会議体への報告は制度設計 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽 |
| 0667(7.7.5 要求事項4) | 同一の必達基準の不合格を3回を超えて継続・保留と判定しない | D。必達基準の番号ごとの通算の回数(テンプレ4 の節「到達の見込み」) | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽 |
| 0622(7.7.6) | 案件に関与しない者の点検(年1回以上、実施者が列挙のいずれか、必達基準ごとの合否) | D\*。日付差と列挙値は D。実施者の実質は申告(M) | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽 |
| 0626(7.8) | エスカレーションの記録を出荷判定で全件突合できる形で保持 | D\*。起票と判定記録の ID の突合は D。保管期間は採用者 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽 |
| 0628(7.9.4) | 制限状態の例外決裁(要件1〜5) | D\*(presence)。欄の存在。期日要件の妥当性は M | T:scripts/gate/aggregate-evidence.mjs、T:templates/03-debt-ledger.md | **【B15】**。重(取り消せない例外) |
| 0669(7.9.5 要求事項5) | 枠の行使件数と残り件数を数えて出す | D。**依存**: #445 の 0630(枠の欄) | T:scripts/gate/aggregate-evidence.mjs、03-debt-ledger.md | **【B15】**。軽 |
| 0631(7.11 要求事項6) | 保証の開示の見解を G-8 の異議で扱い、停止の申し立てに数えない | D。異議欄の値とラベル state:stop-requested の区別 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(停止の権限) |
| 0523(gate-criteria) | G-3 で判定した版から書き換えられた判断記録の検出 | **未決**。ファイルの一致では状態欄の正当な更新が当たる。式を試作していない。試作して実行で確かめる | T:scripts/gate/check-decisions.mjs、aggregate-evidence.mjs | 【B15】近接。重。試作が先 |
| 0990(decisions-check) | 前の判断記録との記述の一致の検査 | **未決**。定義が標準に無く、全部を置き換える判断記録は正当に同じ影響を書く。失敗/所見/課さないは重の審議待ち。(a) に降ろさない | T:scripts/gate/check-decisions.mjs | 重の審議待ち |
| 1009(gate-criteria) | 類似の検知の実施記録の4事項(手段・範囲・実施日・結果) | D(presence)。B16 が 03 台帳に節を置いたので4欄の空を検出できる。手段の実質は M | T:scripts/gate/aggregate-evidence.mjs、license-scan-record.mjs | **【B15】**。重(IP の適合の主張) |
| 1008(gate-criteria G-7 基準8) | 区分「類似検知」の返却目安超過・未返却の行を欠落に数える(有効な区分「例外」の行を除く) | D。日付・状態・承認の存在 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。1009 と同時 |
| 0554(pr-checks / gate-criteria) | 停止の解除・例外承認の台帳の行と基準値を、判定記録の写しと同じ PR で変えない | D。PR の変更ファイルの集合(パス) | T:scripts/gate/check-pr.mjs、test-check-pr.mjs | 重(統制の緩和を同一 PR で通す抜け道)。B16 は `.github/` の B15 範囲としたが、実際は check-pr.mjs で足りる |
| 0687(gate-criteria 基準9) | 基準9 の欠落のうち、集約が欠落として出すかを確かめていないもの | **依存**: まず実行で確かめる。確かめた結果が D か不要かを決める | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(適合の主張)。調査が先 |
| 1010(review-queue-control) | AI が生成した大量の散文が読まれずに通ることの検知 | **M**。読んだかは機械で閉じない。分布の観測は 0136 の降りる部分。manual か様式の欄(b)で開示 | T:scripts/gate/check-pr.mjs(観測)、T:.github/workflows/review-queue-control.yml | 軽。機械で閉じない旨を根拠水準マークで開示 |
| 0498(gate-criteria) | 手動スタックの中間の層を取り込んだ差分への承認を、層ごとの G-6 の確認に数えない | D。PR の base/head の取り込み関係(git 構造) | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(独立確認の水増し) |
| 0584(gate-criteria) | レビュアあたりの依頼件数・応答時間の分布、差し戻し率の差 | D\*。集計は D。偏りの解釈と自動推薦の計測は M | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽。出力だけ |
| 0853(overview) | 手段に従ったことを適合の根拠に数えない扱いを出力に明示 | D(presence)。出力文の存在 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(適合の主張)。出力文の追加で足りる |
| 0638(roles-responsibilities) | 暫定任命の期間中は単独で確定させず確認済みの者の併記を求める | D\*。名簿の暫定の印と併記の存在。名簿に欄を足すと ADR-0147(名簿に欄を足さない)と衝突しうる | T:scripts/gate/aggregate-evidence.mjs、roster-ids.mjs | **【B15】**。軽〜重。印の置き場が先 |
| 0655(roles-responsibilities) | 委譲先を判定者として受理しない。結果責任は価値責任者に残る | D。席と人の ID の一致 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(結果責任の所在) |
| 0710(3.12.3 要求事項12) | 基準集合の正解の確定者と導入を承認した AI運用担当者の同一人物を依存先の一覧と開示に出し、期限つきで受容 | D。名簿 ID の照合と受容の日付 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重。同一人物の承認は記録つきで受ける線(suite の fixture と突合) |
| 0717(3.12.8 要求事項3) | 提供者との契約で入出力の学習利用の有無を確認し記録 | **M**。学習利用の欄が無い。依存先の data 欄(IMPL-0065)の(b)か手引き(c) | T:templates/00-d0-governance.md(依存先の節) | 軽。欄を1つ足すか手引きかを決める |
| 0719(3.12.11 要求事項5) | 依存先の一覧の再生成を四半期の棚卸し・ステージ移行・変化点で行う | **M**。契機は手順(c)。棚卸しの期日は採用者の暦 | T:.claude/skills/gate/gates/SG.md、T:.claude/skills/process-change/ | 軽。手引きの一文 |
| 0720(3.12.11 要求事項6) | 単一障害点の一覧を B-2 へ報告し、解消か受容を記名で決める | **M**。B-2 への報告は会議の議事(manual)。(d) の可能性(ADR-0175 決定2) | T:.claude/skills/pit/reference/handoff.md | 軽 |
| 0738(tailoring-guide) | 未達のまま出荷する対象ごとの扱い(R1=例外承認、CL1 以上・規制業=出荷しない、それ以外=G-8 で受容) | D。リスク区分・CL・業の値による分岐と記録の存在 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(安全・出荷の不可逆性)。CL を F.2 から導かない(ADR-0171) |
| 0739(tailoring-guide) | R2 の G-6 未達の変更の件数をリリースごとに開示 | D。件数 | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽 |
| 0837(tailoring-guide 軸C) | 規制当局向けエビデンスと AI 関与範囲の明記 | D\*(presence)。出力の存在。十分さは M | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。軽 |
| 0755(tailoring-guide) | 価値責任者を置かない委託で、要件合意(G-2)を受注側の判定で代えず、置けない判定を未達として表示 | D。席の空欄と様式 08 第9項の突合(IMPL-0462 の延長) | T:scripts/gate/aggregate-evidence.mjs | **【B15】**。重(適合の主張) |

### #356(3 件)

| IMPL | 項目 | 判定 | 触るファイル | 所見 |
| --- | --- | --- | --- | --- |
| 0191(pr-checks / human-ai-boundary 第2層) | 注入したコミットに識別子と期限の標識をつけ、本番ブランチへの取り込みを取り込み前に拒否 | D。標識のトレーラ構文、期限の日付、取り込み先のブランチ名 | T:scripts/gate/check-pr.mjs、seeded-error-scan.mjs、T:.github/workflows/gate-g5.yml | 重(取り消せない操作=誤りの本番混入)。標識が履歴の書き換えで失われないこと。seeded-error-scan は出荷経路に入っている(ADR-0139) |
| 1011(7.9.6) | 7.9.1 の1による発動の記録に対象の人を含めず、対象は 7.9.1 の2に限る。現状の notice は person を全発動で必須にしており標準と逆 | D。スキーマの必須項目の構文と発動の種別の値 | T:scripts/gate/aggregate-evidence.mjs、test-aggregate-records.mjs | **【B15】**。重(標準と逆の指示を残すと適合の主張を誤らせる。omit で登録できない)。ADR-0127 決定5 の置き換え要否を確認 |
| 1003(overview) | 欠陥注入の秘匿の不成立を述べられる名に数えない | **M**。構造の判断で、blind:false は1回の測定、理由は自由な文。機械の検査にしない(note で明記済み)。構成書の注記(c) | T:scripts/gate/aggregate-evidence.mjs(注記文) | **【B15】**。軽。1004 と同じ型 |

## 7. 触る予定のファイルの一覧(重複除去)

### template(T:)

- scripts/gate/(既存): `check-pr.mjs`、`test-check-pr.mjs`、`exception-expiry.mjs`、`test-exception-expiry.mjs`、`check-g1.mjs`、`adapter.mjs`、`test-adapter.mjs`、`coverage-check.mjs`、`verify-gate-contract.mjs`、`check-d0.mjs`、`cl-judgment.mjs`、`test-cl-judgment.mjs`、`aggregate-evidence.mjs`、`test-aggregate-records.mjs`、`autonomy.mjs`、`config.mjs`、`delegation.mjs`、`model-adoption.mjs`、`test-model-adoption.mjs`、`recalibration.mjs`、`recalibration-registry.json`、`test-recalibration.mjs`、`spec-recheck.mjs`、`test-spec-recheck.mjs`、`org-assurance.mjs`、`adoption-trial.mjs`、`test-adoption.mjs`、`check-decisions.mjs`、`license-scan-record.mjs`、`roster-ids.mjs`、`next.mjs`、`brief-estimates.mjs`、`records.mjs`、`size-observation.mjs`、`seeded-error-scan.mjs`
- scripts/gate/(新規): `review-queue.mjs`(0680〜0682・0979・1010)、`pre-review.mjs`(#325)、`flow-observation.mjs`(0283)、`check-safety-record.mjs`(0925・0927・0934)、commit-msg 用のトレーラ足し(0207)、種の関数(0175)、専用の対の試験(autonomy・check-g1・verify-gate-contract・org-assurance・review-queue・pre-review・flow-observation・check-safety-record は専用の試験が無い。近い既存の試験に足すか新規にするかを実装の段で決める)
- scripts/init/: `generate-profile.mjs`(0709・0764・1015)
- scripts/vendor/: `tailoring-kb.json`(`npm run template:kb` で更新。0900・1015)
- .github/workflows/(既存): `gate-entry.yml`、`gate-g5.yml`、`ship-evidence.yml`
- .github/workflows/(新規): `review-queue-control.yml`、`pre-review.yml`、`flow-observation.yml`
- .github/: `CODEOWNERS`(0211)、`rulesets/*.json`(0214 の必須チェック。既定にするかは重の審議)
- .claude/: `settings.json`(0506・0510・1019・0225)、`hooks/`(新規: session-start 記録、Read の記録)、`hooks/guard-write.mjs`・`guard.json`(0200。実測が先)、`skills/gate/SKILL.md`・`skills/pit/SKILL.md`・`skills/pit/reference/handoff.md`・`skills/gate/gates/SG.md`・`skills/process-change/`(0175・0500・0719・0720・0899)
- templates/: `03-debt-ledger.md`(区分「ファストトラック」・枠の欄)、`04-gate-record.md`(応答の欄・調整の注記)、`06-project-brief.md`(完了の条件の文)、`09-safety-risk-assessment.md`(HR の欄)、`01-feature-spec.md`(印)、`00-d0-governance.md`(0717 の依存先の節)、`defect-ledger.md`(0497)

### 本体(M:)

- `src/content/docs/` の impl マーク(約 112 件の state・check・note の更新。上記の古い note を含む)、`src/content/docs/community/implementation-ledger.md`(`npm run impl:write` で再生成。手で編集しない)、`src/content/docs/phase4-process-design/deliverable-templates.md`(0877)
- `src/data/tailoring/`(questions.yaml・規則・stage-table)と `src/lib/tailoring-engine.mjs`(1015。正本は本体)、`src/data/impl-targets.yaml`(新しい降ろし先の登録。実在検査の対象)、`src/data/template-fields.yaml`(新しい節を足す場合の extra)
- 新規 ADR は作らない見込み(軽。ADR-0175 の裁定の範囲)。ただし 0214 を既定の必須チェックにする案、0899、0990、0523 は重の審議に当たる

## 8. B15 と重なる候補

B15(`../b15`、未 push)は template の `record-copy.yml`、`aggregate-evidence.mjs`、`config.mjs`、`verify-gate-contract.mjs`、`generate-profile.mjs`、`tailoring-kb.json`、`test-aggregate-records.mjs`、`test-roster-rules.mjs` を変えている。範囲は #332、#447(5.4.7)、#329・#347 の検査・知識ベース・.github。

| ファイル | B18 で触る項目 | 扱い |
| --- | --- | --- |
| T:scripts/gate/aggregate-evidence.mjs | 0761・1007・1016・0268・0954・0743・0145・1011・1003・1004 と #355 の 27 件(約 40 件) | **最大の衝突**。B15 の push の後に着手し、1人の担当が直列で扱う。試験は `test-aggregate-records.mjs` に集まる |
| T:scripts/gate/config.mjs | 0597・0599・0636・0640・0664・0834・0840・1006・0217 | B15 の後 |
| T:scripts/gate/verify-gate-contract.mjs | 0771・0651・0772・0764・0900 | B15 の後 |
| T:scripts/init/generate-profile.mjs | 0709・0764・1015 | B15 の後。B15 が 0278・0988・0959・0839・0760 を同じファイルで降ろした |
| T:scripts/vendor/tailoring-kb.json、M:src/data/tailoring/ | 0900・1015 | B15 が再生成済み。B18 は rebase の後に `template:kb`(後から重ねる) |
| T:.github/workflows/gate-g5.yml | 0931・0191 | B15 の #329 T-7(G-5 の通過に数える起動の限定)と近接。B15 の後。0554 は check-pr.mjs で足りる |
| T:scripts/gate/claude-md-resident.json | 触らない見込み | 0175・0899 は手引きの文で足りる |
| M:src/content/docs の impl マークと台帳 | 全項目 | B15 の push で台帳が変わる。B18 は rebase の後に `npm run impl:write` |

### B15 と重ならずに先に進められるもの

- #445: 0136・0884・0972・0801・0878(`check-pr.mjs`・`check-g1.mjs`)、0680・0681・0682・0979(新規 workflow)、0763・0930(`adapter.mjs`)、0567・0610・0630(`exception-expiry.mjs` と 03 台帳)
- #446: 0594(`autonomy.mjs`)、0643(`model-adoption.mjs`)、0767(`spec-recheck.mjs`)、0980(`recalibration.mjs`)
- #448: 0759(`check-d0.mjs`)、0919・0766(`autonomy.mjs`)、0925・0927・0934(新規 `check-safety-record.mjs`)
- #450: 0645(`org-assurance.mjs`)、#326: 0497(`adoption-trial.mjs`)、#348: 0291(`autonomy.mjs`)
- #443: 0283・0374・0377・0614・0500(`next.mjs`・新規 flow-observation)、#444: 0207・1019・0506・0510(`.claude/`)
- #325: 0214・0571・0215・0216・0210 系(新規 pre-review)、0211(CODEOWNERS)、0212(`check-pr.mjs`)

### 直列にする順序の案(同じファイルを触る束)

1. `autonomy.mjs`: 0919 → 0594 → 0766 → 0834 → 0291 → 1006
2. `exception-expiry.mjs` と 03 台帳: 区分「ファストトラック」・枠の欄 → 0567・0610・0630 → 0830(#325)・0612・0669(#355)
3. F.7 の記録: `check-safety-record.mjs` → 0927・0925・0934 → 集約 0761・1007・1016(集約は B15 の後)
4. `next.mjs`: 0374 → 0377 → 0614、0500
5. `.claude/`: 0207 → 1019 → 0506 → 0510 → 0743(0200 は実測の後)

## 9. 集計

- 済み(B15 のブランチ): 5 件(0278・0988・0959・0839・0760)
- 今回降ろさない(未決・依存・手引きのみ): 0200・0523・0687・0828・0899・0990(重の審議か実測が先)。先行の項目に依って後に回すもの: 0377・0510・0612・0614・0630・0669・0743・0830・0934
- M として様式の欄(b)か手引き(c)へ改める候補: 0231・0877(#325 の T9)、0717、0719、0720、1003、1004、1010(合計 7。0899 は未決の M)
- D\* の中で意味の部分を切り捨てるもの(0801・0567・0963・0640・0636・0840・0709・0597 など)は、(a) を決定可能な部分に限り、残りを presence か manual として開示する
- (a) に降ろす見込みは約 75 件。うち B15 の後に着手するもの約 45 件(主に `aggregate-evidence.mjs`)、B15 と独立に進められるもの約 30 件
- 古い note の更新が必要: 0761・0927・0934・1007・1009(「置き場が無い」は B16 後の実態に合わせる)
