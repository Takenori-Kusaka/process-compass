# 束 B20 受付と裁定の案(#448 安全 10 件・#447 範囲の外 4 件・#444 実機の確認 7 件)

- 日付: 2026-11-18。作業ツリー: b20(本体 725e208b、template ef60cda)
- 位置づけ: **受付と裁定の案**。会議体は開いていない。委員の意見・独立の突合はこの後の段で行う
- 確かめ方の表記: 【実行】= この段で動かして確かめた / 【読】= ファイルを読んで確かめた / 【記録】= 過去の審議の記録による(この段で再現していない)

## 0. 結論

| 項目 | 結論 |
| --- | --- |
| 審議の段 | 重 7 件(U1・U2)、軽 14 件(U3〜U7) |
| 降ろし方(21 件) | 機械の検査 14(うち様式の欄を伴う 2)/ 手引きと人の確認 3 / 設定を置き採用者の環境で確かめる 2 / plan=adopter 1 / undelivered のまま 1 |
| 触るファイル | template 35(既存 29・新規 6)、本体 23(ほかに本審議の記録)。計 58 |
| B18 との衝突 | 避けられないもの 3 件(`scripts/vendor/tailoring-kb.json`・`.claude/skills/process-init/SKILL.md`・`README.md`)。いずれも IMPL-1015 の設問の追加に由来する。U3 を B18 の後へ回す |
| 所有者に上げる点 | 2 点(5 節): #444 の受け入れ条件の変更、IMPL-0200 の実測の材料 |
| ADR | 3 件の案(0220〜0222) |
| Issue の閉じ方の見込み | #448・#447 はマークが 0 件になり閉じられる。#444 は IMPL-0200 が残るので開けたまま |

### この段で見つけた、前提を変える事実

1. **IMPL-0919 の note は誤っている**。「降りていないのは CL2 の安全関連部だけ」とあるが、CL2 は上限 L2 で登録を拒否され、案件の全体が L1 である。【実行】`capRefusal` の結果は cl0・cl1 が登録可、cl2・cl3 が拒否。さらに `buildDelegation` が CL1 以上を `blockedBy` にする【読】。**実際の穴は CL0 × F.2 Q1「はい」だけ**である。`check-delegation.mjs`・`delegation.mjs` は Q1 を読まない【読】
2. **IMPL-0766 の前提が成り立たない**。B13 は「0594・0919 が足す範囲の上の分岐」として (a) に分類した。しかし CL3 の安全関連部の外に許されるのは L2 以上で、準拠テンプレートは L2 を支えない(`autonomy.mjs` 冒頭、IMPL-0289、ADR-0081 決定6)。CL1 以上は委任も適用しないので L3 も無い。**分岐を作っても開く先が無い**
3. **F.7 の様式は既に在る**(B16。`templates/09-safety-risk-assessment.md` 169〜202 行)。IMPL-0925・0927・0934・1007 の note の「F.7 の記録の様式が無い」は古い。ただし 09 の「適用した手法」は1つの升で、HR の不採用と理由を機械で読めない
4. **IMPL-0743 の note の形に、付ける先が無い**。「コミットを監査の抽出の入力から外す」とあるが、準拠テンプレートの抽出(`content-sampling.mjs`)の母集団は判定記録と承認レビューで、コミットではない【読】
5. **IMPL-0828 の待ち合わせは解けている**。待っていた IMPL-0826 は adopter になり(ADR-0175)、期間の源は `outage.md` の `switched` と `outagePeriods` に既に在る【読】
6. **ADR-0171 決定4 は「F.2 の写しが変えるのはゲートの状態だけ」と定める**。IMPL-0919 を初期化の回答の写しで実装すると、この決定に反する。正本の D-0 表10 から読む形にする

## 1. 審議の段

| 単位 | マーク | 段 | 理由 |
| --- | --- | --- | --- |
| U1 安全関連部の自律レベル | 0919・0766、CL2 の条文の食い違い | **重** | 安全。条文を改める。B13 の分類を改める |
| U2 安全の記録の検査 | 1007・0925・0927・0934・0759 | **重** | 安全。出荷と G-1 を止める検査の値域を新しく決める |
| U3 F.2 の写しと分離の段階 | 1015・1016・0764 | 軽 | 決定は ADR-0171(重)と軸E の表で済んでいる。実装だけ |
| U4 ライセンスの暫定の許可 | 0683 | 軽 | 条文の実装で、新しい義務を足さない。値の比較だけ。法務の判断の中身に踏み込むことになれば重へ上げる |
| U5 記録と手引き | 0883・0890・0827・0828 | 軽 | 破られて失うのは組織の知識と追跡で、安全・取り消せない操作に当たらない |
| U6 実行の記録 | 0207・1019・0743 | 軽 | 形は ADR-0126 決定5 で決まっている |
| U7 隔離と書き込みの拒否 | 0506・0510・0200 | 軽 | 形は ADR-0126 決定3・4 と B13 の裁定で決まっている。受け入れ条件は所有者へ諮る |

重の調査で問うこと(U1・U2 共通。内部と外部を並列): 機能安全の規格(IEC 61508-3・ISO 26262-6・ISO 13849-1)が、AI 生成物の扱い・故障挿入の環境・高く推奨する手法の不採用の記録をどこまで求めているか。**これらの逐語は未確認である(EV-0296・EV-0316 が開示)**。

## 2. マークごとの表

「3問」は所有者の方針(2026-11-16)の問い。Q1 = 結果と証跡まで書いているか、Q2 = 例外承認で受けられないか、Q3 = 破られたとき誰が何を失うか。

### U1 安全関連部の自律レベル(重)

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 0919 | 448 | 安全関連部は L1 に固定し、引き上げの対象にしない(F.3 要求1) | CL1 以上は全体が L1【実行・読】。**CL0 × Q1「はい」だけ登録できる** | **機械**。`autonomy.mjs` が D-0 表10 の Q1(`f2Q1Of`)を読み、「はい」なら登録した種別をすべて停止(`STOP_KIND` の上限の扱い)。案件の全体を止める | delivered / machine(`test-check-delegation.mjs`) | Q3: 人身への危害。範囲の宣言を足さず全体を止めるので、範囲を狭く書く抜け道が生まれない。Q2: CL0 で Q1「はい」は定義の上ほぼ矛盾する珍しい構成で、失うのは委任の効率だけ。Q1 の答えの正しさは manual(ADR-0171 決定5(b)) |
| 0766 | 448 | CL3 で適用範囲を安全関連部の外へ限定する | 全体が L1 で、許す側は無い | **採用者**。テンプレートは全体 L1 の厳しい側に留まる。外だけ L2 を使う採用者は、L2 の実装とともに自ら範囲を持つ | undelivered / manual / plan=adopter / decision=ADR-0220 | 前提の事実 2。先例は IMPL-1013(L2 を表せないので adopter)。Q3: 失うのは効率で、安全ではない。**第7章の例外承認で受ける案は B13 のとおり採らない** |

**条文の食い違いの裁定の案**(#448 本文の候補、#324 D-F06)

- 軸E の表と `r-e-cl2` の注記は CL2 の安全関連部の上限を L2 とし、F.3 要求1 は L1 に固定する
- 案: **F.3 を正とする**。軸E の表の CL2 の升は「L2(案件の上限。安全関連部は附属書F F.3 により L1 固定)」、`r-e-cl2` の注記と `capReason` の文を同じ意味へ改める
- 採らない案: F.3 を CL2 だけ L2 へ緩める(安全の側を下げる根拠が無い)/ 軸E の表を残して注記だけで読み分ける(知識ベースの注記が逆のことを言い続ける)

### U2 安全の記録の検査(重)

新しい検査 `scripts/gate/check-safety-record.mjs` が `docs/safety-risk-assessment.md` の節「安全関連部の検証の記録」を読む。適用は D-0 表10 の Q1「はい」または CL2・CL3(ADR-0159)。結果は集約の基準7 の記載の欠落に数える。

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 1007 | 448 | F.7 の項目の置き場が無いものと空欄を記載の欠落に数える | 基準7 は `machine: 'not-checked'`(`aggregate-evidence.mjs` 5433 行付近)。様式は 09 に在る | **機械**。6項目の有無と空欄(様式の初期の文のままも空欄)を数える | delivered / machine(`test-safety-record.mjs`) | ADR-0159 の決定どおり。内容の妥当性は確かめない。no-adopter の節 |
| 0925 | 448 | 稼働中の安全関連システムへ故障を挿入しない | 09 に「挿入した環境」の列は在る。検査は無い | **機械**(値の一致まで)。列の値を「試験台の実機・模擬環境・専門部門の設備・実行前の挿入」で始まる語に限る。それ以外は欠落 | delivered / machine | Q3: 挿入が危険事象を起こしうる。**実際に本番でないことは機械で閉じない**。note と EV-0296 に開示する |
| 0927 | 448 | 項目2(監視タイマの早すぎる応答)を省かない | 09 の表に行は在る。検査は無い | **機械**。項目2 の結果が空欄か「省略・該当なし・未実施」で始まれば欠落 | delivered / machine | 値の一致で閉じる。試験の中身は確かめない |
| 0934 | 448 | 不採用の HR に理由が無い記録を差し戻す | 09 は1つの升で読めない | **機械+様式の欄**。09 に手法の表(手法・特定した規格での推奨度・適用・しない理由)を足し、HR で不適用かつ理由が空の行を欠落に数える | delivered / machine | F.4 の列は例で規格の表が正なので、**推奨度は記入者が書く**。HR の行を漏れなく書いたかは manual |
| 0759 | 448 | 構成要素ごとに判定し、最も高い区分を全体の区分とする | D-0 節16 の最悪の帰結は自由文で比べられない | **機械+様式の欄**。節16 に構成要素の表(構成要素・区分・最悪の帰結)を足し、最大の区分と「判定した区分」の一致を `cl-judgment.mjs` が確かめる。不一致は G-1 の前に失敗 | delivered / machine(`test-cl-judgment.mjs`) | Q3: 低く判定すると確認を逃れる。構成要素の列挙の十分さは manual。標準の表10 にも同じ表を足す |

### U3 F.2 の写しと分離の段階(軽)

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 1015 | 448 | S0・標準・CL0 でも Q1「はい」なら G-7 を適用する | 設問は 8 問で Q1 が無い【実行】 | **機械**。設問(軸E)と restore の規則、`stage-table.mjs`、エンジンの試験、`npm run template:kb` | delivered / machine(`scripts/test-tailoring-engine.mjs`) | ADR-0171 決定1・2 の実装。回答の無い既存の構成を「いいえ」と見なさない |
| 1016 | 448 | 写しと D-0 表10 の Q1 の食い違いを確かめる | `f2Q1Of` は在る。突合は無い | **機械**。写し「いいえ」× D-0「はい」は記載の欠落、逆は注意。G-1 の前は `check-d0` が失敗 | delivered / machine(`test-cl-judgment.mjs`) | ADR-0171 決定2 の実装。4 通りの対の試験 |
| 0764 | 448 | CL2 は最強(段2 以上)、CL3 は最強(段3 以上) | 規則は注記だけ。段の比較は IMPL-0184・0344 が既に機械で行う | **機械**。規則に `testSeparationFloor` を足し、構成と PROCESS-PROFILE へ出す | delivered / machine(`test-init-g5.mjs`) | 機械が確かめるのは導出の値まで。**変更ごとの段階の新しい検査は作らない**(IMPL-0183・0184 が持つ)。`verify-gate-contract.mjs` は触らない |

### U4 ライセンスの暫定の許可(軽)

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 0683 | 447 | 暫定の許可に必ず期限を付し、超過で失効して基準5 で再び止まる | `ci.allowedLicenses` だけ。期限の欄が無い | **機械**。`ci.provisionalLicenses[]`(license・expires・approvedBy・reason)を足す。期限内のものだけを `adapter.mjs` が許可の一覧へ加える。期限の無い行は構成の検査が拒否する | delivered / machine(`test-adapter.mjs`) | 失効すると一覧から外れ、既存の検査がそのまま止める。足すのは緩める向きとして記名を要する。法務の判断であることは manual。**`03-debt-ledger.md` には置かない**(B18 と衝突し、台帳は例外承認の置き場で意味も違う) |

### U5 記録と手引き(軽)

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 0883 | 447 | 案件を登録し、案件IDを付与し、記録を残す | `projectId`・D-0 の `project_id`(不一致は警告)・`context/projects/<案件ID>.md` が在る | **機械**。`check-g1.mjs` が企画書の `project_id` と構成の一致、`context/projects/<案件ID>.md` の実在を確かめる | delivered / machine(`test-project-id.mjs`)。target=g1-check | 新しい様式は作らない。**組織をまたぐ台帳と ID の一意性は確かめない**(単一のリポジトリの外。note に開示) |
| 0890 | 447 | 理解保持者が1名の機能を、交代の前に2名以上へ増やす | 数える処理と表示は `org-assurance.mjs` 964〜966 行、委任の停止は `autonomy.mjs` に在る | **手引き**。`accountable.md` に、交代の前に保持者数を確かめて増やす手順を足す | delivered / manual(確かめる者: H-1 の判定者)。target=process-change-skill | Q3: 失うのは組織の知識。**交代を機械で止める検査は足さない**(条文に無い新しい停止になる)。B13 の「(a) org-assurance」は、数える処理が既に在るので改める |
| 0827 | 447 | 切り替え後に品質監視の結果を確認し、下回れば作業を止める | `outage.md` に `switched` と `handling: stop` が在る | **手引き**。`outage.md` に、切り替えの記録のときに結果を確かめ、下回れば止めて `handling: stop` で記録する手順を足す | delivered / manual(確かめる者: AI運用担当者)。target=process-change-skill | 監視そのものは採用者の基盤(IMPL-0408・0712)。受け手の側だけを届ける |
| 0828 | 444 | 復旧後、切り替え期間中に生成された変更を特定できる | 期間は `outagePeriods` が持つ。変更の一覧は無い | **機械**。集約が `switched` の期間ごとに、期間内のコミットの一覧を保証の開示の項目7 に出す | delivered / machine(`test-aggregate-records.mjs`) | 前提の事実 5。日の単位で多めに拾う向き。コミットの日付の偽りは閉じない(note に開示) |

### U6 実行の記録(軽)

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 0207 | 444 | 実行の識別子を変更単位に自動で記録する | 実装は無い。`probe-444/commit-msg` に試作【記録】 | **機械**。`.githooks/commit-msg` が `CLAUDE_CODE_SESSION_ID` のあるときだけ `Agent-Run:` を足す。SessionStart が `core.hooksPath` を未設定のときだけ設定する | delivered / machine(`test-agent-run-record.mjs`) | 機械が確かめるのはフックの振る舞いまで。`--no-verify` と既存の hooksPath のある構成は漏れる(0743 の一覧で見える) |
| 1019 | 444 | 指示資産の版(コミットに無い変更の有無を含む)の自動の記録 | 実装は無い | **機械**。SessionStart が HEAD・指示資産の要約値・未コミットの有無を `.claude/agent-runs/<id>.json` へ記録し、commit-msg が `Agent-Assets:` のトレーラに写す。記録が無ければ `unknown` と書く | delivered / machine(同上) | 記録をコミットへ写すので、識別子との結び付きが構造で閉じる。下位の担当で SessionStart が走らなくても `unknown` と見える。利用者の範囲の指示は版を記録できない旨を値に含める |
| 0743 | 444 | 版を特定できない実行の出力を監査の入力に用いない | 外す処理は無い | **手引きと人の確認**。集約が、AI の印があり `Agent-Assets:` が無いか `unknown` のコミットの件数と一覧を項目7 に出す。監査人がそれを入力から外す | delivered / manual(確かめる者: 監査人) | 前提の事実 4。印の無いコミットは機械で判別できない |

### U7 隔離と書き込みの拒否(軽)

| IMPL | Issue | 規定の要旨 | 現状 | 降ろし方の案 | 変更後 | 理由 |
| --- | --- | --- | --- | --- | --- | --- |
| 0506 | 444 | シェルとネットワークを既定の拒否に置く | 設定に `sandbox` が無い【読】 | **設定+採用者の環境で確かめる**。`sandbox.enabled`・`allowUnsandboxedCommands:false`・`network.allowedDomains`(テンプレート自身の手順の宛先だけ)を生成する | delivered / manual(確かめる者: 採用者の AI維持管理者。S2) | B13 の裁定どおり manual。macOS・ネイティブ Linux の未確認は EV-0318 で開示を続ける |
| 0510 | 444 | シェルから強制層を書き換える操作を拒否する | 初期化の後は deny に在る。確かめたのは 2 パスだけ【記録】 | **設定+採用者の環境で確かめる**。生成した deny の全パスと隔離の設定の存在を `test-init-g5.mjs` で固定し、WSL2 の全パスで S3 を行って記録する | delivered / manual | 実際の拒否は Claude Code の実機が要り、CI の試験にできない。B13 の「対の試験」は**設定の値の対までに改める**。初期化の前と guard.enabled が偽の間は開いている(開示を続ける) |
| 0200 | 444 | 計画の対象のパスの外への書き込みを拒否する | 降ろしていない | **undelivered のまま**。note に、実測の材料が無いことを足す | undelivered / manual / plan=scheduled / issue=444 / review=2027-02 | 実測には採用者の取り込みの履歴が要る。`template/specs/` は README だけ【読】。合成の履歴は実測にならない。記録だけの動作の形と adopter は B13 のとおり採らない |

## 3. 実機の確認の判定(#444)

**この段では T1〜T3・S1〜S4 を実行していない**。確かめたのは道具の有無だけである。【実行】Windows: Claude Code 2.1.327。WSL2(Ubuntu-24.04、kernel 6.6.87.1): Claude Code 2.1.314、bubblewrap 0.9.0、socat あり。

| 確認 | この環境で | 扱い |
| --- | --- | --- |
| T1〜T3(識別子・トレーラ・再開) Windows | **できる**。2.1.326 の記録は在る【記録】。2.1.327 では未確認 | 実装の段で実行して記録する |
| T1〜T3 WSL2 | **できる**。未確認 | 同上。EV-0319 の差し替え条件の一部 |
| 下位の担当で SessionStart が走るか | **できる**。未確認 | 同上。走らなくても `unknown` で見える設計 |
| S1〜S4 WSL2(deny の全パス) | **できる**。確かめたのは 2 パスだけ【記録】 | 実装の段で全パスを実行して記録する |
| 隔離のもとでテンプレート自身の手順が動くか | **できる**。未確認 | 0506 を delivered にする前提条件。壊れるなら許可の一覧を直す |
| ネイティブ Windows の隔離 | **できる**(効かないことの観測)。2.1.326 の記録 | 2.1.327 で再度観測する |
| S1〜S4 macOS | **できない** | 未確認のまま EV-0318 で開示する |
| S1〜S4 ネイティブ Linux | **できない**。WSL2 とその上のコンテナはネイティブに数えない | 同上 |
| IMPL-0200 の実測 | **材料を確認できていない** | 所有者へ(5 節) |

手順は `phase5-implementation/agent-trace-control.md` の T1〜T3・S1〜S4 に既に在る。結果に合わせて更新する。

## 4. 実装の単位と順序

準拠テンプレートに触るので**直列**で行う。

| 順 | 単位 | 先に要るもの |
| --- | --- | --- |
| 0 | U1・U2 の重の審議、ADR-0220・0221 | なし |
| 1 | U2(様式 → 検査 → 集約) | 0 |
| 2 | U1(0919 → 0766 のマーク)。知識ベースの注記は U3 へ送る | 0 |
| 3 | U4 | なし |
| 4 | U5 | なし |
| 5 | U6(0207 → 1019 → 0743) | なし |
| 6 | U7(0506 → 0510。実機の確認。0200 の note) | U6(隔離のもとでフックが動くことも見る) |
| 7 | U3(1015 → 1016 → 0764)と U1 の注記 | **B18 が main へ入った後**。知識ベースは再生成で解く |

template と本体の push は対で続けて行う。回帰の全量は push の前に1回。

## 5. 所有者にしか決められない点

### 問1 #444 の受け入れ条件(macOS・Linux の確認の記録)

本文は「隔離が効く基盤(macOS・Linux・WSL2)ごとの確認の記録」を求める。この環境で作れるのは WSL2 の記録だけである。

| 案 | 内容 | 利点 | 欠点 |
| --- | --- | --- | --- |
| **A(推奨)** | 条件を改める。WSL2 は実機の記録を残し、macOS・ネイティブ Linux は手順(S1〜S4)と EV-0318 の開示で受け、採用者の AI維持管理者が自分の基盤で確かめる。0506・0510 は delivered / manual | B13 の裁定(manual で採用者が確かめる)と揃う。未確認を隠さない | 2 基盤は未確認のまま出荷する |
| B | 条件を変えない。0506・0510 を undelivered のまま残す | 条件に忠実 | 確かめた WSL2 の利用者にも設定が届かない。担い手が決まらず止まり続ける |
| C | macOS・Linux の実機を所有者が用意し、記録してから delivered にする | 条件を満たす | 実機と担い手が要る |

### 問2 IMPL-0200 の実測の材料

実測には、実装計画を使って取り込んだ既定ブランチの履歴が要る。

| 案 | 内容 |
| --- | --- |
| **A(推奨)** | undelivered のまま #444 を開けて残し、最初の採用事例か試行の履歴が得られたときに実測する。見直しは 2027-02 のまま |
| B | 所有者が手元の実案件の履歴を実測の材料として指定する(指定があれば本束で実測できる) |
| C | ADR-0126 決定3 を見直して規定を改める。重の審議が要る。**本束では勧めない** |

## 6. ADR の案

| 番号 | 題の案 | 決めること |
| --- | --- | --- |
| ADR-0220 | 安全関連部の AI自律レベルを CL に依らず L1 に固定し、準拠テンプレートは Q1「はい」の案件の委任を止める | F.3 を正とする条文の食い違いの解消 / D-0 表10 から読むこと(ADR-0171 決定4 との整合) / 0766 を adopter にして B13 の分類を改める / 範囲の宣言の欄を足さないこと |
| ADR-0221 | 安全関連部の検証の記録を機械で確かめる範囲 | 環境の値の語彙 / 項目2 の省略の語 / 手法の表と推奨度を記入者が書くこと / 構成要素の表と最大の区分の一致 / 機械で閉じない点の開示 |
| ADR-0222 | 実行の記録をトレーラで運び、隔離を既定で置く | `Agent-Run:`・`Agent-Assets:` の形(ADR-0126 決定5 の具体化) / `core.hooksPath` の扱い / 隔離の既定と宛先の決め方 / 未確認の基盤の扱い(問1 の回答による) / 0743 の形の改め |

根拠水準マークの案: 0919 の全体停止の判断(E0)を新設し、EV-0318・EV-0319 を実機の記録に合わせて更新する。番号は採番の時点で確かめる(現在の最大は EV-0325)。

## 7. 触る予定のファイル

### template 側(35)

**既存の変更(26)**

| ファイル | マーク |
| --- | --- |
| `templates/09-safety-risk-assessment.md` | 0925・0934 |
| `templates/00-d0-governance.md` | 0759 |
| `scripts/gate/aggregate-evidence.mjs` | 1007・1016・0828・0743 |
| `scripts/gate/cl-judgment.mjs` | 0759・1016 |
| `scripts/gate/check-d0.mjs` | 0759・1016 |
| `scripts/gate/autonomy.mjs` | 0919、CL2 の文 |
| `scripts/gate/check-delegation.mjs` | 0919 |
| `scripts/gate/config.mjs` | 0683、フックの登録(0207・1019) |
| `scripts/gate/adapter.mjs` | 0683 |
| `scripts/gate/ip-clearance-python.mjs` | 0683 |
| `scripts/gate/check-g1.mjs` | 0883 |
| `scripts/init/generate-profile.mjs` | 0683・0764・0207・1019・0506・0510 |
| `.claude/settings.json` | 0207・1019・0506 |
| `.gitignore` | 1019 |
| `.github/workflows/gate-g5.yml` | 新しい試験の結線 |
| `.claude/skills/process-change/kinds/settings.md` | 0683 |
| `.claude/skills/process-change/kinds/accountable.md` | 0890 |
| `.claude/skills/process-change/kinds/outage.md` | 0827 |
| `.claude/skills/artifact/artifacts/09-safety-risk-assessment.md` | 0934 |
| `.claude/skills/gate/gates/G-7.md` | 1007 |
| `PROCESS-PROFILE.md` | 1015 |
| `scripts/gate/test-init-g5.mjs` | 0764・0506・0510 |
| `scripts/gate/test-cl-judgment.mjs` | 0759・1016 |
| `scripts/gate/test-check-delegation.mjs` | 0919 |
| `scripts/gate/test-adapter.mjs` | 0683 |
| `scripts/gate/test-aggregate-records.mjs` | 0828・0743 |

**B18 と衝突する既存の変更(3。避けられない)**

| ファイル | マーク | 避けられない理由と解き方 |
| --- | --- | --- |
| `scripts/vendor/tailoring-kb.json` | 1015・0764、CL2 の注記 | 生成物。B18 の後に `npm run template:kb` で再生成する |
| `.claude/skills/process-init/SKILL.md` | 1015 | 設問の表と「8問」を改める |
| `README.md` | 1015 | 「8問」の記述を改める |

**新規(6)**: `scripts/gate/check-safety-record.mjs`、`scripts/gate/test-safety-record.mjs`、`scripts/gate/agent-run-record.mjs`、`scripts/gate/test-agent-run-record.mjs`、`scripts/gate/test-project-id.mjs`、`.githooks/commit-msg`

**触らずに済ませる B18 のファイル(9)**: `exception-paths.md`、`.github/CODEOWNERS`、`check-pr.mjs`、`preflight.mjs`、`roster-ids.mjs`、`test-check-pr.mjs`、`test-roster-ids.mjs`、`verify-gate-contract.mjs`、`03-debt-ledger.md`。B13 が 0764 の実装先に挙げた `verify-gate-contract.mjs` は、構成の値の導出で足りるので使わない(実装の段で試験で確かめる)。

### 本体側(23)

| ファイル | 内容 |
| --- | --- |
| `src/content/docs/phase4-process-design/safety-verification.md` | 0919・0925・0927・0934 のマーク |
| `src/content/docs/phase4-process-design/gate-criteria.md` | 1007・0683 のマーク |
| `src/content/docs/phase4-process-design/tailoring-guide.md` | 1015・1016・0759・0764・0766・0743 のマーク、軸E の CL2 の升、軸B の G-7 の升 |
| `src/content/docs/phase4-process-design/lifecycle.md` | 0883・0890 のマーク |
| `src/content/docs/phase4-process-design/roles-responsibilities.md` | 0827・0828 のマーク |
| `src/content/docs/phase4-process-design/human-ai-boundary.md` | 0207・1019・0510・0200・0506 のマーク、EV-0318・EV-0319 |
| `src/content/docs/phase4-process-design/deliverable-templates.md` | 表10 の構成要素の表 |
| `src/content/docs/phase5-implementation/agent-trace-control.md` | 実機の結果と手順 |
| `src/content/docs/community/implementation-marking.md` | 予定の置き場の列挙(277 行) |
| `src/content/docs/community/implementation-ledger.md` | 再生成 |
| `src/content/docs/community/evidence-ledger.md` | 再生成 |
| `src/content/docs/community/scope-ledger.md` | 再生成(見出しの適用範囲を足す場合) |
| `src/content/docs/adr/0220-*.md`・`0221-*.md`・`0222-*.md` | 新規(3) |
| `src/data/impl-targets.yaml` | 降ろし先の種別の更新、使われなくなる予定の置き場の削除 |
| `src/data/impl-inventory.yaml` | 降ろし先の参照の更新 |
| `src/data/template-fields.yaml` | 09・D-0 の表の登録 |
| `src/data/tailoring/questions.yaml` | 1015 |
| `src/data/tailoring/rules-criticality.yaml` | 1015・0764、CL2 の注記 |
| `src/data/tailoring/rules-business-phase.yaml` | 1015(r-b-poc の注記) |
| `scripts/lib/stage-table.mjs` | 1015 |
| `scripts/test-tailoring-engine.mjs` | 1015 |

## 8. 採らないと決めた点(案)

| 案 | 採らない理由 |
| --- | --- |
| 安全関連部の範囲を構成の欄で宣言する(B13 の前提) | 範囲を狭く書くと安全関連部で自律を許す。全体を止めれば欄が要らない |
| 0919 を初期化の回答の写しで実装する | ADR-0171 決定4 に反する |
| 0766 を第7章の例外承認で受ける | B13 の裁定のまま。許す向きを逸脱として記録すると、適合の主張の読み手を誤らせる |
| 0766 の分岐を作る | 開く先の L2 がテンプレートに無い |
| F.3 を CL2 だけ L2 へ緩める | 安全の側を下げる根拠が無い |
| F.4 の HR の一覧を機械の正本にする | F.4 の列は例で、特定した規格の表が正である |
| 故障挿入が本番でないことを機械で確かめたと表示する | 機械で閉じるのは語の一致まで |
| 変更ごとの分離の段階の検査を新設する | IMPL-0183・0184 が持つ |
| 交代を保持者数で機械が止める | 条文に無い停止になる。失うのは組織の知識 |
| 組織をまたぐ案件の台帳を準拠テンプレートに置く | 単一のリポジトリの外 |
| 暫定の許可を技術負債台帳に置く | 例外承認と意味が違い、B18 と衝突する |
| 0510 の実際の拒否を CI の試験にする | Claude Code の実機が要り、決定可能な検査にならない |
| 0200 を adopter にする・記録だけの動作の形を作る | B13 の裁定のまま |
| 確かめていない基盤を確認済みと書く | 根拠水準マークで開示を続ける |

## 9. 次の段へ渡す点

- 独立の突合で見てほしい点: (1) D-0 表10 から読む 0919 が ADR-0171 決定4 と矛盾しないか (2) 全体停止が F.3 の範囲を超えて新しい義務にならないか (3) 0766 を adopter にできるか(`impl-no-adopter.yaml` の節に当たらないことは読んで確かめたが、`lint:impl` は未実行) (4) `Agent-Assets:` の形が ADR-0126 決定5 の「観測の記録」に当たるか
- マークの note の表示の誤りは、降ろす段で直す: 0919(穴の所在)、0925・0927・0934・1007(様式が無いという記述)、0743(外す形)、0828(0826 待ち)
- 残る開示: Q1 の答えの正しさ(manual)、故障挿入の実際の環境(manual)、macOS・ネイティブ Linux の隔離(未確認)、`--no-verify` によるトレーラの欠落(0743 の一覧で見える)
