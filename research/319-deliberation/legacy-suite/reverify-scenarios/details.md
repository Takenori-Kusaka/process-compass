# 場面の再検証 — 再現手順の詳細(主担当が受信メッセージから転記)

場所は `tmp/reverify-scenarios/`。`source lib.sh` で補助が入る: `fresh <名>`(base を `w/<名>` へ複製して git init)、`clone <元> <先>`、`d0 <名> <版>`(D-0 を置いて版を書く)、`gp <名> <引数>`(generate-profile)、`vc`(verify-gate-contract)、`cpr`(check-process-rules)、`cd0`(check-d0)、`ae`(aggregate-evidence)。土台の作業コピーは `w/` に残っている。

- `w/s1`(1人+AI): fresh → `gp s1 --answers in/a-solo.json --stack node` → `d0 s1 1.0` → `gp s1 --change in/s1-acc.json`
- `w/s2`(2名、相互の確認): s1 の複製 → `d0 1.1` → `--change in/s2c.json`
- `w/s4`(3〜9名、MVP、CL0。山田=事業決裁・価値、佐藤=技術・開発・AI維持管理、鈴木=独立レビュア・出荷判定): fresh → `--answers in/a-3.json --stack node` → `in/s4-acc3.json` → `s4-5.json` → `s4-15.json` → `s4-back5.json`(D-0 は 1.3)
- `w/s5`(s4 + 開発者の席を委任、規則 DR-001 = src/i18n/**): s4 の複製 → `d0 2.0` → `in/s5-3.json` → `in/s5-4d.json`

## 重大1(out/s14-bypass.txt)
- 再現A: `clone s4 s14` → `w/s14/process.config.json` を直接書き換える(seats の dev-verifier に `mode:"delegated"` と qualification 一式、`delegation.rules` に `{id:"DR-1",seat:"dev-verifier",changeType:"表示文言",paths:["src/**"],decidedBy:"佐藤 花子",reason:"x",approvedBy:"佐藤 花子"}`)→ `gp s14 --answers process.config.json` → `vc s14` → `cpr s14`。再生成 exit 0、契約検査「整合」、席は delegated、changeLog に緩める向きの記録なし
- 再現B: `clone s4 s14` → `answers["q-biz-phase"]` を `"poc"` へ → `gp s14 --answers process.config.json`。exit 0、G-6・G-7 が omitted、ruleset null。書き換えた直後(再生成の前)でも契約検査は通る
- 同じ経路: 1人体制で回答を reviewer-yes にし架空の外部の確認者を独立レビュアの席へ書く(未達が消える)。changeLog を先頭1件へ切り詰める(`clone s9 s14`)
- 原因: gp:1766-1772 は「変更前の構成」を作業ツリーの process.config.json から読み、`--answers process.config.json` も同じファイルから回答を読むため、gp:1924-1929 の比較は常に一致する。席・規則・名簿は gp:1848-1850 でそのまま引き継ぐ。契約検査は回答からゲート・ルールセット・未達を再導出せず、委任の席と規則を changeLog と対応づけず、changeLog の追記のみを検査しない(空の場合だけ落とす)
- 案内している箇所: gp:1446(構成書「個別の値だけを変える場合は process.config.json を編集し、CI の契約検査を通す」)、process-init/SKILL.md:134-137(スタックの変更で直接編集+`--answers process.config.json`)
- 検出される経路(壊さないこと): 別の回答ファイルでの再生成、席だけの委任、modeCeiling の書き換え、changeLog を空にする、shipBlocked の削除、生成区間の書き換え、D-0 だけの改訂

## 重大2(out/s11b-reviewer-merge.txt)
- 再現: `clone s4 s11b; d0 s11b 1.4; gp s11b --change in/s11-4.json`(`{"kind":"accountable","summary":"納期が厳しいので独立レビュアを開発者の佐藤が兼ねる","seats":{"independent-reviewer":{"accountable":"b"}}}`。decidedBy なし)
- 出力: exit 0。構成は `g6: required`、`unmet: 0`、`ruleset: team`、changeLog は `direction: none`、`decidedBy: null`。契約検査は警告1件で通る。構成書と CLAUDE.md の G-6 は「適用する」。`ae` の開示だけが「成立しない(責任者が同一)」
- 比較: 1〜2名の体制で同じ入力は未達になる(in/s3b.json)。3名体制で出荷判定者=開発者は「兼務禁止に抵触します」で拒否される
- 原因: gp:173 の `sameReviewer` が `small`(1〜2名)に限られる。gp:601 は same-work-product の組を `notIndependent` へ入れるだけ。diffConfig は `notIndependent` の増加を緩める向きに数えない

## 重大3(out/sx-extra.txt の X-1)
- 再現: `clone s2 sx1; d0 sx1 1.2; gp sx1 --change in/sx-1.json`(`{"kind":"accountable","summary":"納期が厳しいので相互レビューをやめる","answers":{"q-external-reviewer":"reviewer-no"}}`)
- 出力: G-6 未達・承認数 1→0・ブランチ保護なしが「未達の発生(記名を要求しない)」。changeLog は `direction: arising`、`decidedBy: null`。名簿は2名のまま
- 原因: gp:735 の `becameUnmet` と gp:759・767・777 は、G-6 が未達へ変わった事実だけを見る

## 中4(out/s05d-broad-apply.txt、out/s06b-ai-names-apply.txt)
- 再現: `clone s5 s5w; gp s5w --change in/s5-7a.json`(既存の DR-001 の paths を `["**"]` へ。seats なし)。初回登録は `clone s4 s5w3; d0 s5w3 2.0; gp s5w3 --change in/s5-7c.json`。AI の名義は `clone s5 s6a; gp s6a --change in/s6-5.json`
- 出力: exit 0 で書き込まれる。席は協働へ下がる。直後の `vc` で exit 1
- 比較: `"seats":{"dev-verifier":{"mode":"delegated"}}` を足した in/s5-7b.json は拒否される
- 原因: gp:1960-1967 の拒否は `change.seats[role].mode` が引き下げ前の形態と一致する場合に限られる

## 中5(out/s13-delegated-merge.txt)
- 再現: `clone s5 s13`、ブランチで `src/i18n/ja.json` を足し `node scripts/gate/verify-gate-contract.mjs --delegation --base main`。トレーラ `Delegated: DR-001` つきで main へ squash(件名に `(#12)`)し `ae s13`
- 出力: `--delegation` は「トレーラを書いてください」と「協働として扱い、人の承認を待ちます」を同時に出す。`ae` は「PR #12: 独立レビューの承認記録がありません(…G-6 を事後へ移せない…)」「PR #12: 検証方法と結果の記入がありません」
- 原因: aggregate-evidence.mjs:231 の `summaryPresent` の検査が委任の変更を除外していない
- 場面13 の補足: 委任しても人に残る作業は (1) PR の承認(rulesets/team.json、bypass なし。エージェントは `gh pr merge`・`gh pr review` を deny)(2)「検証方法と結果」の記入(PULL_REQUEST_TEMPLATE.md「この欄は人が書きます。AI に生成させないでください」と ae:231)(3) 独立レビューの承認記録(ae:221-230)(4) リスク区分の確定と記名。増える作業は適合性確認・規則の登録と2つの記名・事後の抜き取り。減る作業は無い
- 開発者の席だけの委任は、G-6 の承認を独立レビュアが行うので、現在のルールセットのままマージできる。このとき省けるはずのものは、開発者の席の責任者による変更ごとの検証(2)だが、:231 が除外しないため省けない。README:84・CLAUDE.md・process-change SKILL:228 の「委任の範囲の変更も協働として扱う」は、開発者の席だけの委任には広すぎる。トレーラは、人が承認した変更を「人の事前確認を経ていない」へ数える向きにずれる(コードの読解による)

## 中6(out/s02-one-to-two.txt の 2b)
- 再現: `clone s1 s2b; d0 s2b 1.1; gp s2b --change in/s2b.json`(名簿へ佐藤を足し、独立レビュアの席を佐藤へ。回答は変えない)
- 出力: exit 0。「同一人物のため独立が成立しない組 0 件」なのに G-6 は未達のまま。何を変えればよいかは出ない。`in/s2c.json`(回答 reviewer-yes を足す)なら成立
- 原因: gp:169-175 は回答 `reviewer-no` だけで未達にする。process-change/SKILL.md に `q-external-reviewer` の記述が無い。README.md:178 と howToResolve(gp:189-195)

## 中7(out/s04-headcount.txt、s04y-10plus.txt、s04x-boundaries.txt)
- 再現: `gp s4 --change in/s4-15.json` と `in/s4-back5.json`。分離必須は `clone s4 s4y; d0 s4y 1.4; gp s4y --change in/s4y.json`(15名、技術判断者の席を価値責任者と同じ山田へ)。名簿の検出は `in/s4x1.json`(回答 3〜9 のまま名簿15名)
- 出力: 5→15 の差分は回答と名簿だけ。構成は `g6.params.reviewMode: internal-separated → internal-plus-core-external`、`g7.params.approverMode: named-concurrent → dedicated-qa` に変わっている。s4y は exit 0。s4x1 も通る
- 原因: gp:755-786 は params とロールへの調整(KB の r-a-large の `mustSplitFrom`)を比べない。config.mjs:366-388 の人数の検査は3名の境界だけ

## 中8(out/s06b-ai-names-apply.txt の 6-6)
- 再現: `clone s4 s6b; d0 s6b 2.0; gp s6b --change in/s6-6.json`(qualification の `performedBy:"Claude (AI)"`、`approvedBy:"鈴木 一郎"`=独立レビュアの席の責任者)
- 出力: exit 0。席は delegated。契約検査も通る
- 原因: config.mjs:524-541、gp:383-385。performedBy は名義の検査にも掛からない

## 中9(out/s07-model-version.txt の 7-4、out/s07b-requalify-same-change.txt)
- 再現: `clone s5 s7b; d0 s7b 2.1; gp s7b --change in/s7-4.json`(performer.model を 5-1 → 5-2、同じ入力に新しい識別の qualification。decidedBy なし)。旧い記録の使い回しは `clone s5 s7d; d0 s7d 2.1; gp s7d --change in/s7-4b.json`(confirmedAt は 2026-01-01、cases と result は旧記録のまま、performer 欄だけ新しい識別)
- 出力: どちらも exit 0。席は delegated のまま。changeLog は `direction: none`、`decidedBy: null`、`expired: ["適合性確認の失効 … 再確認まで協働を上限とする"]`
- 問題: (1) 緩める向きの記名を経ずに新しい識別が委任で動き続ける(分けて出すと協働へ下がり、戻すのに記名が要る)(2) 記録が新しい識別について行われたものかを確かめていない(config.mjs:537)(3) changeLog に決定者が残らない (4) 表示と状態が食い違う
- 所在: gp:862-867、clampSeats(gp:364-410)

## 中10(out/s05b-approval.txt の 5-4a)
- 再現: `clone s4 t; d0 t 2.0; gp t --change in/s5-3.json`(席の責任者の記名つきで委任を宣言。`[承認待ち]` で協働のまま)→ `gp t --change in/s5-4a.json`(`{"kind":"mode","ruleApprovedBy":"佐藤 花子"}`)
- 出力: 席は collab のまま。その旨も、再宣言が要る旨も出ない。`ruleApproval.samePersonAsDecider: false`(規則の決定者も佐藤)
- 原因: `[承認待ち]` の時点で宣言が協働へ書き換わって保存される(clampSeats)。gp:2018-2023。gp:2054 は今回の入力の decidedBy と比べる

## 中11(out/sx-extra.txt の X-5)
- 再現: `clone s4 sx5; gp sx5 --change in/sx-5.json`(d0 を上げない)→ `cd0 sx5` → `vc sx5`
- 出力: 適用される。残作業に1行。check-d0 は「承認済み」、契約検査は整合。changeLog は `d0Before: 1.3`、`d0After: 1.3`
- 原因: gp:949-953 は注記だけ。check-d0 は節1・節12 と `seats[]` を照合しない

## 軽
- rulesets/README.md:9-11(2名で ruleset: team と食い違う)
- CLAUDE.md:60「仕様や優先度の判断が不十分な場合、または不可逆4操作(削除/本番デプロイ/課金書き込み/スキーマ変更)…自走を停止」。5.5.1 の3つの場合と ADR-0053(基準で定義、列挙は例示)に揃っていない
- sgRecord: `"sgRecord":"どこかにある"` で適用される(out/s10-stage.txt)。gp:2007
- 入力値: `{"kind":"axis","answers":{"q-team-size":"size-100"}}` と `{"kind":"mode","seats":{"dev-verifier":{"mode":"autonomous"}}}` が dry-run で exit 0(out/sx-extra.txt の X-4)。outage の開始日>終了日も通る。gp:1805-1809、gp:1790-1793
- 名義: 「クロード」「Сlaude」(キリル文字)「自動レビュー担当」、全角「Ａｇｅｎｔ」が通る(out/s06-ai-names.txt の 6-2)。config.mjs:104-117
- 空席: `clone s2 t; d0 t 1.2; gp t --change in/s3c.json` → G-6 required・承認1件のまま、未達なし。出口の案内なし
- 即時通知: 残作業に出るのは担い手の識別の変更だけ(in/s7-1.json)。人数の境界(in/s9-3.json)と運用形態の変更(in/s5-4d.json)では出ない。gp:879-883
- 適合性確認の差分: in/s7-2.json(再確認の記録だけ)が「構成の変更なし」と記録される。gp:845-874
- 継続中の outage(in/s8-2.json)を後から閉じる入力が無い。区分の上昇で出荷不可になった場合(in/s9-7.json)も理由は「体制が3名を割った」
- 既存の不具合: 初回の `--answers in/a-solo.json` で「[較正引き継ぎ] ci.coverageThreshold: 80% … 導出初期値: 90%」。gp:1832-1835
