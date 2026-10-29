# 調査: 同種の不具合の昇格(class-lock)と、設定値が効いていることの検査 — Issue #289(#275 原則4・9 の未対応部分)

- 調査日: 2026-10-23
- 位置づけ: コアポリシー「取り込みの前に議論する」の**調査**段階。採否は決めていない。推しは書いていない。標準本文・ADR・テンプレートは編集していない
- 入力: `research/289-deliberation/issues-context.md`(#275 の節)、Issue #275 本文(REST で取得)、`research/phase4-standard/issue-triage-2026-10-08.md` L800-825(突合の結果)
- 外部の材料: `research/282-survey-2026-09/`(by-issue.md の #275、TH03・TH06・TH07、FND-0105・0235 ほか)と、今回の WebSearch/WebFetch(取得日はすべて 2026-10-23)

## 0. 要約(10 行)

1. **昇格に関わる記述は 1.1 の表で 15 か所にあり(うち o は別の現象)、件数・単位・強さが揃っていない**。件数は「3回」(CI/CD ゲート、テンプレートの観点表、運用カタログ、本プロジェクトの運営)、「2回以上」(3.11.4 要求2)、「2回」(コンテキスト基盤)、件数なし(7.5、5.6.2、G-5 の原則、インシデント対応)に分かれる。義務として書かれているのは 5.6.2「見逃された類型を…自動検査へ反映する」だけで、ほかは「目安」「検討」「候補」である
2. **規定の本文(第1〜8章)にある件数は 3.11.4 要求2 の「2回以上」だけである**。これは指示資産(誘導層)へ**追記してよい条件**(量の歯止め)であり、機械へ昇格させる起動条件ではない。「3回」はフェーズ5・6 と附属書の外にあり、ADR-0063 によりフェーズ5・6 は本文に従属する。CI/CD ゲートの「3回」には暫定マークが無い(同じ数の EV-0013 は本プロジェクトの運営にだけ掛かる。水準 E0)
3. 「3件目を機械で止める義務」と「装置へ広げない限定」は、本文にもテンプレートにも無い。CI/CD ゲートが候補の収集に使うと書くラベル `rule-candidate` と、メトリクスの「レビュー指摘由来」ラベルは、準拠テンプレートに実装が無い(検索の範囲)
4. 外部は**件数でなく影響・再発リスクで決める型**がそろう。ISO 9001:2015 10.2.1 は「不適合の影響に応じた」是正、類似の不適合の有無の確認、有効性のレビューを求め、件数を定めない(二次資料で確認)。Google SRE はユーザーに見えた事象に P0/P1 の対策を最低1つ必須とし、類型の件数は定めない(FND-0235)。トヨタの自働化は初回の異常で止める。件数の「3」は Fowler/Roberts の Rule of Three(リファクタリングの経験則)と実務事例(FND-0105、根拠なし)にとどまる
5. 昇格の条件を**検査の品質**で決める型もある。Google は静的解析をコンパイルエラーへ上げる条件を「実効的な偽陽性なし・修正可能・正しさに関わる」とし、レビュー時の解析は実効偽陽性 10% 超で無効にする(原典、CACM 2018)。本標準の ADR-0025 も「実効的な偽陽性」を落とす・落とさないの境界に使っている
6. 系統的故障(IEC の定義)は「設計等の変更でしか除けない」故障で、条件がそろえば必ず再発する。class として扱う発想の規格上の支えになるが、件数の閾値は伴わない
7. **原則9 の「shape と behaviour の区別」は、内部統制の監査で「設計の有効性」と「運用の有効性」として確立している**(PCAOB AS 2201 .42・.44、原典)。NIST は統制の評価を「正しく実装され、意図どおり動作し、望む結果を生んでいるか」と定義する。Google SRE は設定の検査を「本番で実際にどう設定されているかを調べ、ファイルとの差を報告する」と書き、プローブには「既知の悪い要求は失敗すべき」と書く
8. 本標準にも behaviour 側の部品は散在する: 5.6.2 欠陥注入(類型「統制の緩和」を含む)、附属書F・フェーズ5 の変異試験、G-5「対象なし」と「0件」の区別、ADR-0052(配布物そのものを検査)、ADR-0061(`check=machine` は実行して確かめた規定に限る)、附属書I I.11 要件⑤(止まるべきものが止まる場面集)・⑦(実環境の統制の確認)、テンプレートの `verify-gate-contract`(「設定したつもり」の防止)。ただし⑤⑦は**参考の附属書**で要求事項ではない。**統制の設定一般について「効いていることを確かめる」要求は本文に無い**
9. 実例は「検査や設定が値としては正しいのに効いていなかった」型がそろう: GitLab 2017(バックアップが黙って失敗、試験の責任者なし)、Facebook 2021(監査ツールの不具合でコマンドを止められず)、CrowdStrike 2024(検証器が 21 入力を前提に評価、試験はワイルドカードで欠陥を通らなかった)、ganbari-quest の装置 step(PR の CI で一度も走らず本番を止めた、FND-0230)。後ろ 2 件は**検査装置自体の不具合**であり、論点1の「装置へ広げない限定」と直接ぶつかる
10. 案は論点1で 7、論点2で 7 立てた(どちらも現状維持・課さないと明記を含む)。会議体への問いは 8。原則5・6 は #289 の受入条件に現れず、範囲の判断材料を 3 に短く置いた

## 1. 標準の現状(突合)

### 1.1 原則4 に関係する記述(逐語)

| # | 所在 | 記述 | 強さ(1.7.1 による読み) | 件数・単位 |
| --- | --- | --- | --- | --- |
| a | `phase4-process-design/roles-responsibilities.md` L1113(3.11.4 要求2) | 「\| 2 \| 追記は条件を満たした場合に限る \| 同種の誤りが2回以上発生した、またはレビューで指摘された \|」 | 要求(限る)。**追記を制限する条件**。初期値の列に置かれ、暫定マークは無い(同表の EV-0088 は要求1 の 200 行だけが対象) | 2回以上、または指摘1回。対象は指示資産(誘導層) |
| b | 同 L1100・L1105(3.11.3) | 「**遵守が必須の規則を誘導層に書いてはなりません**」「強制が必要な規則は強制層へ降ろします。」 | 禁止・要求 | 件数なし。「必須かどうか」で層を決める |
| c | `phase4-process-design/exception-escalation.md` L176(7.5) | 「C -->\|同一指摘の反復\| E["基準を機械判定へ移管"]」 | 図。判定期限を超過したときの原因別の措置としてだけ現れる | 件数なし |
| d | `phase4-process-design/gate-criteria.md` L309(G-5) | 「このゲートの原則は「**合意済みルールはすべて機械化して載せる**」です。人間のレビューで毎回指摘していることがあれば、それはこのゲートへ移す候補です。」 | 原則の説明と「候補」 | 「毎回」 |
| e | `phase4-process-design/human-ai-boundary.md` L573-574(5.6.2 結果の反映) | 「- 見逃された類型を、レビューの観点および自動検査へ反映する」「- 反映の経路を持たない注入を実施してはならない」 | **要求・禁止**。唯一の義務の形 | 件数なし。単位は「類型」 |
| f | `phase5-implementation/ci-gates.md` L242・L247-248 | 「R["独立レビューで同種の指摘が3回"] --> L["ルール化を検討"]」「- 目安は「同種の指摘が3回出たらルール化を検討」。レビューコメントのラベル付け(`rule-candidate`)で候補を収集する」「- 逆に、機械化できない指摘(設計の妥当性・仕様との一致)こそが人間のレビューの本務として残る」 | 目安・検討。フェーズ5(ADR-0063 で本文に従属) | 3回。単位は「独立レビューの指摘」。**暫定マーク無し** |
| g | `phase6-operation/operations-catalog.md` L33 | 「\| CI ゲートの見直し \| 技術判断者 \| ルール化候補(同種指摘3回)の吸い上げ、誤検知ルールの調整 \|」 | 運用の担当表 | 3回 |
| h | `phase6-operation/metrics.md` L191 | 「\| ルール化の進み \| 人の指摘→CI移管の件数 \| `ci:` 種別のコミットのうち「レビュー指摘由来」ラベル付き PR の件数 \| ゼロが続く(ゲートが成長していない) \|」 | 警戒サイン。**増えすぎ側の警戒は無い**(#270 → #290 の論点) | 件数を数える |
| i | `phase6-operation/improvement-cycle.md` L15・L26・L108 | 「S["小さな調整<br>(期限・委譲・ルール化)"]」「**内側ループ**は運用パラメータの調整(判定期限の見直し、委譲の追加、CIルールの追加)。担当ロールの裁量で回す」「\| 前回と同じ Problem の再掲率 \| 上昇が続く \|」 | 裁量 | 件数なし |
| j | `phase6-operation/incident-response.md` L97・L104 | 「「注意する」「周知する」は再発防止策として不可。仕組み(監視・CI・手順)の変更にする」「再発防止アクションのうち自動化できるもの(監視の追加・CI チェックの追加)を優先する。「人が気をつける」型の対策は数週間で消える」 | 禁止(様式の注記)と優先 | **件数なし。初回のインシデントから掛かる** |
| k | `phase5-implementation/context-base.md` L57 | 「「同じ質問が2回出たら文脈化する」を目安ルールにする(3回目を発生させない)」 | 目安 | 2回(質問)。原則4 と同じ「3回目を発生させない」の形だが、昇格先は機械ではなく文脈 |
| l | `phase5-implementation/test-effectiveness.md` L174 | 「\| 特定の類型の変異が繰り返し生存する \| テストの記述規約、およびテスト生成時の指示資産(…3.11.3) \|」 | 反映先の表 | 「繰り返し」 |
| m | `community/feedback-workflow.md` L43・L140(本プロジェクトの運営) | 「ただし、**同じ種類の誤りが3回以上出た場合**は、検査の追加を検討します。」「**対象**: …同種の誤りが3回でルール化を検討するという回数。」(EV-0013、E0) | 検討 | 3回以上。**唯一暫定マークが付いた件数** |
| n | `template/context/standards/review-checklist.md` L45 | 「同じ指摘を3回した項目は、ここへ追加するか、CI の検査へ移します。人が毎回言うことは、機械が言えることです。」 | テンプレートの地の文(平叙=要求に読める) | 3回。昇格先は観点表**または** CI |
| o | `template/.claude/skills/implement/SKILL.md` L57、`phase4-process-design/developer-guide.md` L130 | 「同じ失敗を3回繰り返す場合、原因は実装ではなく受入基準の不備であることが多い」 | 説明 | 3回。**別の現象**(自己修正ループ)。混同に注意 |

### 1.2 数え方の食い違い

| 軸 | 食い違い |
| --- | --- |
| 件数 | 2回以上(a)/2回(k)/3回(f・g・m・n)/件数なし(c・d・e・i・j・l)。2 と 3 の両方が「同種」に掛かる |
| 数える単位 | 「誤り」(a・m)、「指摘」(f・g・n)、「質問」(k)、「類型」(e・l)、「不具合」(#275)。指摘の数と不具合の数は一致しない(1件の不具合に複数の指摘、指摘されない不具合) |
| 何が起動するか | a は**追記を許す条件**(上限側)、f・m は**検討を始める条件**、n は移す行為、e は反映の**義務**。原則4 は「止める」義務。向きが逆のもの(a)が同じ語で並ぶ |
| 昇格先 | 指示資産(a・l)、観点表(n)、CI(f・n・m)、機械判定(c)、文脈(k)、監視・CI・手順(j)。3.11.3 は「遵守が必須」なら強制層、と層を必須性で決めており、件数で決めていない |
| 規定としての位置 | 本文に件数があるのは a だけ。f・g・h・i・j・k・l はフェーズ5・6(ADR-0063 決定1「本文に従属する」)。n はテンプレート(ADR-0040 で標準の部分集合)だが、本文に対応する件数が無い |
| 根拠水準の開示 | m だけ EV-0013(E0)。a・f・k・n の件数は暫定マークが無い。ADR-0026 の規定(実証に基づかない値はマークする)との関係が未整理 |
| 実装 | `rule-candidate` ラベル(f)と「レビュー指摘由来」ラベル(h)は、`template/` を grep して見つからない。h の指標は、ラベルが無ければ常に 0 になり、警戒サイン「ゼロが続く」が常時点く構成になる(読み。実行していない) |

### 1.3 「装置へ広げない限定」に関係する記述

- #275 本文: 「無い条項(4 の class-lock と、その適用範囲を装置に広げない限定、…)」。限定の中身は Issue 本文に書かれていない。出典として示された Zenn 本の該当章(第Ⅷ部-3)は WebFetch で本文を取得できなかった(5 章)
- ADR-0056 決定10(L152-154): 「論証のどの主張も支えない検査・記録は、改善サイクル(フェーズ6)で廃止の候補に挙げます。統制を外すときは理由を記録します。論証のために新しいゲートと検査を足しません。」
- ADR-0025 決定11: 「**新しい判定の場を設けない**。」(文脈の乖離について)
- Issue #290(open): 「装置(検査・ゲート・ルール)の総量の上限と、減らす判断を誰が行うか」「#270: 装置修理 PR の比率の定義、「ルール化の進み」の片側の警戒サイン」。**装置の総量は #290 の範囲**であり、本調査は関係だけを書く
- 関係の構造: class-lock を「同種の不具合が出たら機械の検査を足す」と書くと、検査装置自体の不具合(装置が誤って止める・止めない)も「同種の不具合」に数えられ、装置を直すための装置が足される。h の指標は増える側を警戒しない。ADR-0056 決定10 は減らす側の入口を持つが、件数による昇格とは接続されていない

### 1.4 原則9 に関係する記述(逐語)

| # | 所在 | 記述 | shape/behaviour のどちらか |
| --- | --- | --- | --- |
| p | `gate-criteria.md` L313(G-5「基準値と除外設定の変更」) | 「基準値と除外設定を、製品のコードと同じ変更で変えてはなりません。」 | **変更の経路**の統制。値が効いているかは見ない |
| q | `ci-gates.md` L138(PR 単位の検査) | 「\| 閾値・除外設定と製品のコードの同時変更(禁止事項6) \| 失敗させる \| …」 | 同上。同表の後段 L168「ブランチ保護(必須チェック)が適用されていなければ、失敗した PR もマージできる。」と、効いていない場合の帰結を自ら開示している |
| r | `template-repository.md` L171 | 「\| 禁止事項6 \| 閾値・重大度・除外設定を機能変更と同じ PR で変える \| G-5(`pr-rules`)。…依存と設定を兼ねるファイルの中は見ない \|」 | 禁止事項6 は**テンプレートの規則の番号**で、本文 5.8.5(L760)の禁止事項は 1〜5 まで。本文の根拠は p |
| s | `gate-criteria.md` L329・L350(検査対象が存在しない場合の扱い)、ADR-0033 | 「**通過の根拠は、検査の結果が0件であったことではなく、対象が存在しない事実を記録したことです**。0件の合格として残すと、実施していない検査を実施したという記録が残ります。」「実装の開始後に「対象なし」の記録が現れた場合、それは検査の不備を示します。」 | **behaviour の一部**(検査が対象に当たったか)。範囲は G-5 の 8 基準 |
| t | `human-ai-boundary.md` L502 以下(5.6.2)、L551 | 注入する欠陥の類型「\| 統制の緩和 \| 検査の除外設定、基準値の引き下げ \|」 | **behaviour**。ただし測るのは**レビュー(人・AI)が統制の緩和を見つけるか**であり、設定が効いているかではない |
| u | `test-effectiveness.md`、附属書F F.6(規定) | 変異試験「テストが実装の変更に反応するか」 | **behaviour**(テストについて)。設定は対象外 |
| v | `template-repository.md` L177 | 「G-5 はテストの実行コマンドが空の構成を失敗させる」 | 空の設定を止める(shape の歯止め) |
| w | ADR-0052 決定1・3 | 「**配布物の中身が正本と一致すること**を検査します。」「**運用は忘れられます。データは検査できます**。」 | 「配る仕組み」でなく到達点の検査。**behaviour 型の先例** |
| x | ADR-0061 決定2(L42) | 「`check=machine` と書くのは、機械が違反を検出することを実行して確かめた規定に限ります。」 | **検査の検査**。実装マークの表示に限る |
| y | `adoption-guide.md`(附属書I、**参考**、L8「要求事項ではありません」)I.11 要件⑤(L496)・⑦(L498) | 「止まるべきものが止まる失敗の場面を含める。下表の場面集のすべてを実行する」「実環境の統制を、採用者のリポジトリで確かめて記録する。ブランチ保護(ルールセット)が既定ブランチに効いていること…模擬の環境での結果を実環境の確認に代えない」 | **behaviour と実環境の shape**。導入前の 1 回。満たさない場合は「「実環境の統制 未確認」と表示し続ける(未達のゲートと同じ扱い)」 |
| z | `ci-gates.md` L267 | 「ブランチ保護(ルールセット)が実環境で効いていること、…は、採用の前に採用者が実環境で確かめます(附属書I I.11 要件⑦…)。確かめていない間は、保証の開示の項目4 に「実環境の統制 未確認」と出続けます。」 | y を出荷の開示へつなぐ。フェーズ5 |
| — | `template/scripts/gate/verify-gate-contract.mjs` 冒頭 | 「テンプレートが「設定したつもり」で運用されることを防ぐための検査です。構成ファイルに書いた要求が、実際の設定に現れていなければ失敗させます。」 | 宣言(構成)と設定(ワークフロー等)の**静的な一致**。挙動は見ない |
| — | `template/scripts/gate/test-*.mjs`(`test-check-pr.mjs` ほか 6 本)、`gate-g5.yml` の `contract` ジョブ | 一時のリポジトリで場面を作り、ゲートの検査が落ちる・通ることを毎回確かめる | **装置の自己試験**。テンプレートの装置に限る。採用者が足す検査に同じ要求は無い |
| — | `review-checklist.md` L33 | 「\| 検証を無効化する設定変更を含めた \| 差し戻す \|」 | 人の観点。無効化を**意図した**変更が対象 |

読み取れること。

- 本文が持つのは、統制の設定を**変える経路**(p)と、**人がそれを見つけるか**(t)である。設定が**いま効いているか**を確かめる要求は、附属書I(参考)の導入前の 1 回(y)だけである
- 「対象なし」と「0件」の区別(s)は、G-5 の 8 基準の中で「検査が対象に当たった」ことを記録に残す。除外設定で対象から外れた範囲が「0件」に見える経路(除外が広すぎる)は、s の範囲では扱っていない(読み)
- 製品の設定(feature flag、権限、閾値を持つ製品機能)の挙動は、受入基準とテストの範囲として読める。原則9 が言う「設定値一般」が、プロセスの統制の設定を指すのか、製品の設定も含むのかは、#275 本文から決められない

### 1.5 関係する ADR

| ADR | 本論点との関係 |
| --- | --- |
| 0025 | 「実効的な偽陽性」で落とす・落とさないを分けた。新しい判定の場を設けない |
| 0026 | 件数(2・3)を条項にするなら、根拠水準のマークが要る |
| 0028 | 未達を消さない。I.11 ⑦の「未確認」は未達と同じ扱い |
| 0033 | 「対象なし」と「0件」の区別。behaviour の一部 |
| 0038 | 統制の弱化(遮断の解除・閾値の緩和・強制層の縮小)を性質で定義。検知者は許容を判断しない |
| 0041 | 列挙は網羅でない。class の列挙に網羅を主張しない形の先例 |
| 0044 | 義務を「課さないと決める」先例(既存部品の探索) |
| 0050 | 強制層の水準をステージで動かさない |
| 0052 | 配布物そのものを検査する(到達点の検査) |
| 0056 決定10 | 論証を支えない検査は廃止の候補。論証のためにゲートと検査を足さない |
| 0059 | 比率による発火を課さないと決めた先例。件数による発火と同型の議論になりうる |
| 0061 | `check=machine` は実行して確かめた規定に限る(検査の検査) |
| 0063 | フェーズ5・6 は本文に従属。参考の附属書に要求を置かない。文末で強さを書き分ける(「目安」「検討」の強さ) |

## 2. 世の中がどうなっているか

既存の外部調査(282)の該当分を先に置き、今回補ったものを後に置く。取得日は今回分すべて 2026-10-23。

### 2.1 既存の外部調査(282)から

| 知見 | 水準 | 要旨 | 本論点との関係 |
| --- | --- | --- | --- |
| FND-0105 | E2(閾値の根拠は E0 相当) | 繰り返す失敗・指摘を検査や規則へ昇格させる運用は実務にあるが、**閾値は事例ごとに異なり根拠は示されない**。個人開発者は3回以上で昇格(4か月で30件超のうち15件)、食べログは静的解析・Hooks・Skip の順に判定し、規則の肥大を避けるため Skip を残した。出典 SRC-0275(zenn.dev/hinapupil、2026-06-26)、SRC-0260(tech-blog.tabelog.com、2026-07-29)、SRC-0424(JUSE SQiP 2026 講演紹介) | 件数 |
| FND-0235 | E1 | Google SRE は再発防止を課す条件を件数でなく影響と再発リスクで定める。ユーザーに見えた事象のポストモーテムには P0/P1 の対策を最低1つ必須、類似事象の見直しは勧めるが何件で類型とみなすかは定めない。出典 SRC-0546(Lunney ほか, ;login: 2017、原典 PDF、取得 2026-09-30)。原文「We recommend implementing automated fixes when possible」 | 影響 |
| FND-0097 | E2 | 形式の充足を機械で強制すると、中身を伴わない充足が起きた事例(hook のタグ、無意味なアサーション) | 機械で止めた後の迂回 |
| FND-0099 | E3 | 網羅性の指標はテストの有効性の代理として弱い(カバレッジ100%で変異スコア4%の例)。GitHub は評価モードで影響を見てから強制へ切り替える手順を出した | shape と behaviour の乖離 |
| FND-0095・0041 | E2 | 機械判定・決定的な層にも迂回と破れ方がある(hook のコマンド分割、Stop hook の上書き) | 装置が効かない経路 |
| FND-0198 | E1 | Antigravity は frontmatter の不備がある規則を**警告なく破棄**する(原典「silently discards the rule」) | 設定が値としては在るが効かない、の製品仕様 |
| FND-0230 | E2(当事者リポジトリの数え直し) | ganbari-quest で、日次バックアップの沈黙を防ぐために足した検査 step が self-hosted runner でしか走らず、**PR の CI では1度も実行されず**、セルフホスト本番を約 3.8〜4.0 時間止めた | 装置の不具合。論点1の限定と論点2の両方 |
| FND-0243 | E1 | INCOSE 要求記述ガイドは escape clause を「実装しない言い訳を与える」として避けさせる | 原則5 の材料 |
| FND-0120 | E1 | SDD は spec-first が多数で、仕様を保守し続ける型は一部 | 原則6 の材料 |

TH07 の結論(冒頭)は「再発を機械検査へ昇格させる閾値は事例ごとに異なり、#275 の 2 件に一致する外部例も、閾値を支える測定も束に無い」。TH06 は欠陥注入の検出力(文脈の切り離しでも再現率 27.1%、FND-0087)を扱い、設定の効きは扱わない。TH03 は「黙って落ちる」の機構を不遵守・量の上限・設定不備の 3 系統に分けた(FND-0198)。

### 2.2 再発防止・是正の規範(件数か影響か)

| 出典 | 原典/二次 | 要旨(逐語は英語のまま) | URL |
| --- | --- | --- | --- |
| ISO 9001:2015 10.2.1 | **二次**(原本は未入手。2 つの解説ページで一致を確認) | (b)「Evaluate the need for action to eliminate the cause(s) of the nonconformity, so that it does not recur or occur elsewhere」、その手段に「Determining if similar nonconformities exist, or could potentially occur」。(d)「Review the effectiveness of any corrective action taken」。「corrective actions shall be appropriate to the effects of the nonconformities encountered」。**件数の閾値は無い**。解説は「再発は是正が不十分だった強い証拠」とする | https://open-exam-prep.com/study-guides/cqi-irca-qms-lead-auditor/clauses-9-10/clause-10-improvement 、https://cdn.presencis.com/regulations/iso-9001/article-10.2/ |
| Google SRE 本 15 章 Postmortem Culture | 原典 | ポストモーテムの契機を事前に定める。契機の例「Data loss of any kind」「A monitoring failure (which usually implies manual incident discovery)」。「It is important to define postmortem criteria before an incident occurs」。非難しない運用は個人でなく系の欠落を探す | https://sre.google/sre-book/postmortem-culture/ |
| Lunney ほか(SRC-0546) | 原典 | 上記 FND-0235。「Review postmortems for similar incidents and their accompanying action items.」(反パターン「Missing Patterns」) | https://sre.google/static/pdf/login_spring17_09_lunney.pdf |
| トヨタ生産方式(自働化) | 原典(企業の公式説明) | 「the machine or equipment can detect the abnormality and stop automatically」「This eliminates the outflow of defective products.」、異常を明確に検知し再発を防ぐ。**初回の異常で止める**。ポカヨケ・なぜなぜの語は当該ページに無い | https://global.toyota/en/company/vision-and-philosophy/production-system/ |
| Reason, Human error: models and management(BMJ 2000) | 原典 | 防護層は「slices of Swiss cheese, having many holes」で穴は動く。潜在条件は「the inevitable 'resident pathogens' within the system」で長く休眠しうる。「the same set of circumstances can provoke similar errors, regardless of the people involved」 | https://pmc.ncbi.nlm.nih.gov/articles/PMC1117770/ |
| IEC 60050 395-07-133(IEC 61508 と同じ定義) | 原典(用語) | systematic failure:「failure, related in a deterministic way to a certain cause, which can only be eliminated by a modification of the design or of the manufacturing process, operational procedures, documentation or other relevant factors」 | https://electropedia.org/iev/iev.nsf/17127c61f2426ed8c1257cb5003c9bec/7f16a269b409ecbdc1257c1c005e26ea |
| NTNU の SIS 教科書 3 章 | 二次(教科書) | 「Systematic fault will always be repeated when triggering condition is available.」。危険側の未検出故障(DU)は「remains hidden until the next test」、proof test などで現れる | https://ntnu.edu/documents/624876/1277046207/SIS+book+-+chapter+03+-+failures+and+failure+classification/36f29566-bd55-4a91-b002-1e17a177c035 |
| Rule of Three(Roberts、Fowler『Refactoring』) | **二次**(Wikipedia) | 3 回目の重複でリファクタリングする経験則。**再発防止ではなく抽象化の時期**の規則 | https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming) |

### 2.3 昇格の条件を検査の品質で決める型

| 出典 | 原典/二次 | 要旨 | URL |
| --- | --- | --- | --- |
| Sadowski ほか, Lessons from Building Static Analysis Tools at Google(CACM 2018) | 原典 | コンパイラの検査(Error Prone)にする条件「easily understood」「actionable and easy to fix」「produce no effective false positives (the analysis should never stop the build for correct code)」「report issues affecting only correctness rather than style or best practices」。既存の違反を直してからエラーへ切り替える。レビュー時の解析(Tricorder)は「less than 10% effective false positives」を求め、「If the ratio for an analyzer goes above 10%, the Tricorder team disables the analyzer until the author(s) improve it.」 | https://cacm.acm.org/research/lessons-from-building-static-analysis-tools-at-google/ |
| GitHub Rulesets の Evaluate | 原典(製品文書) | 「your ruleset will not be enforced, but you will be able to monitor which actions would or would not violate rules」。強制の前に効き方を観測する段階 | https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository |

読み取れること: 昇格の**起動**を件数で決める規範は見つからなかった。昇格を**許す**条件(偽陽性、修正可能性、既存違反の解消)と、**外す**条件(偽陽性率の上限)を持つ先例はある。後者は装置の総量(#290)とつながる。

### 2.4 shape と behaviour(設計の有効性と運用の有効性)

| 出典 | 原典/二次 | 要旨 | URL |
| --- | --- | --- | --- |
| PCAOB AS 2201 .42・.44・.50 注 | 原典 | .42 設計の有効性: 統制が「operated as prescribed by persons possessing the necessary authority and competence」なら目的を満たし誤りを防止・発見できるか。.44 運用の有効性: 統制が「is operating as designed」か。「Inquiry alone does not provide sufficient evidence to support a conclusion about the effectiveness of a control.」 | https://www.pcaobus.org/standards/auditing/AS2201 |
| NIST の用語 security control assessment(SP 800-37 Rev.2 ほか、OMB A-130 由来) | 原典(用語集。抜粋が途中で切れ、後半は検索結果の見出しで確認) | 「…to determine the extent to which the controls are implemented correctly, operating as intended, and producing the desired outcome…」 | https://csrc.nist.gov/glossary/term/security_control_assessment |
| Google SRE 本 17 章 Testing for Reliability | 原典 | 設定の検査は「examines production to see how a particular binary is actually configured and reports discrepancies against that file」で、「inherently not hermetic」。道具も試験する「Automation tools are also software.」。プローブ「Known good requests should work, while known bad requests should error.」。カナリアは「isn't perfect and doesn't always catch newly introduced faults」 | https://sre.google/sre-book/testing-reliability/ |
| Principles of Chaos Engineering | 原典 | 「Build a Hypothesis around Steady State Behavior」「Run Experiments in Production」「Automate Experiments to Run Continuously」「Minimize Blast Radius」 | https://principlesofchaos.org/ |
| IEC 61508 の proof test(NTNU 教科書経由) | 二次 | 定期の試験で隠れた危険側故障を現す。**安全機能が「在る」ことでなく「作動する」ことを周期で確かめる**型 | 2.2 の NTNU |

### 2.5 policy-as-code・設定の試験(陰性の場面を書ける仕組み)

| 出典 | 原典/二次 | 要旨 | URL |
| --- | --- | --- | --- |
| OPA Policy Testing | 原典 | 「OPA also gives you a framework that you can use to write *tests* for your policies.」。`opa test` は coverage を出す。例は `not authz.allow with input as {...}` で、悪い入力で拒否されることを試験する | https://www.openpolicyagent.org/docs/policy-testing |
| Terraform test | 原典 | 「`expect_failures`」「The test passes if the checkable objects you specify report an issue.」。`command = plan` で資源を作らずに試せる | https://developer.hashicorp.com/terraform/language/tests |
| Prometheus `promtool test rules` | 原典 | 「You can use `promtool` to test your rules.」。`exp_alerts` で発火すべき警報を書き、空にすれば発火しないことを試す | https://prometheus.io/docs/prometheus/latest/configuration/unit_testing_rules/ |
| Kyverno CLI `kyverno test` | 原典(コマンド一覧のみ) | 「Run tests from a local filesystem or a remote git repository.」。期待結果(pass/fail/skip)の書式は今回読めなかった | https://kyverno.io/docs/kyverno-cli/usage/test |
| Petrović・Ivanković, State of Mutation Testing at Google(ICSE SEIP 2018) | 原典(要旨) | 「Mutation testing assesses test suite efficacy by inserting small faults into programs」。差分ベースでコードレビュー時に変異を出し、統計網羅のある差分の約30%を処理 | https://research.google/pubs/state-of-mutation-testing-at-google/ |

読み取れること: 道具の側は「止まるべきものが止まる」陰性の試験を書く手段を標準で持つ。**それを使うことを要求する規範**は、今回読んだ範囲には無い(監査規範 2.4 は統制一般について運用の有効性の確認を求める)。

### 2.6 実例: 値は正しい(在る)が効いていなかった

| 事例 | 原典/二次 | 何が在って、何が効いていなかったか | URL |
| --- | --- | --- | --- |
| GitLab.com 2017-01-31 | 原典(事後報告) | バックアップ手順は在った。「the backup procedure was using pg_dump 9.2, while our database is running PostgreSQL 9.6」で失敗し、通知は「DMARC was not enabled for the cronjob emails, resulting in them being rejected」、「we were never aware of the backups failing」。Azure のスナップショットは「not enabled for any of the database servers」で、「we assumed that our other backup procedures were sufficient enough」。「Because there was no ownership, as a result nobody was responsible for testing this procedure.」 | https://about.gitlab.com/blog/2017/02/10/postmortem-of-database-outage-of-january-31/ |
| Facebook 2021-10-04 | 原典 | 「Our systems are designed to audit commands like these to prevent mistakes like this」「a bug in that audit tool prevented it from properly stopping the command.」**検査装置自体の不具合** | https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/ |
| CrowdStrike Channel File 291(2024-07-19) | 原典(RCA) | 「The sensor expected 20 input fields, while the update provided 21 input fields.」検証器は「based its assessment on the expectation that the IPC Template Type would be provided with 21 inputs」。試験は「included a regex wildcard matching criterion in the 21st field for all Template Instances」で、潜在する範囲外読み出しを通らなかった。是正に「Validation for the number of input fields has been implemented」と段階配布 | https://crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf 、https://crowdstrike.com/wp-content/uploads/2024/08/Executive-Summary_Root-Cause-Analysis_Channel-File-291.pdf |
| ganbari-quest(FND-0230) | 当事者リポジトリの数え直し | 検査 step が PR の CI で一度も実行されず本番を止めた | 282 の SRC-0510〜0512 |

4 件のうち 3 件(Facebook、CrowdStrike、ganbari-quest)は、**検査・検証の装置そのもの**が失敗点である。SRE 本は「A monitoring failure」をポストモーテムの契機に挙げており、外部の実務は装置の失敗を再発防止の対象から外していない。外すかどうかではなく、対策の形(装置を足すか、直すか、減らすか)が残る。

### 2.7 外部と本標準の対応

| 外部の型 | 本標準の対応箇所 | 差 |
| --- | --- | --- |
| 影響に応じた是正・類似の確認・有効性のレビュー(ISO 9001 10.2、SRE) | インシデント対応(件数なし、仕組みへ)、改善サイクルの 3 区分、5.6.2 結果の反映 | 「類似が他にあるか」の確認と「是正が効いたか」のレビューを求める本文の要求は、検索の範囲で無い |
| 初回で止める(自働化) | G-5 の決定的な検査、強制層 | — |
| 検査の品質で昇格・撤去(Google) | ADR-0025「実効的な偽陽性」、運用カタログ「誤検知ルールの調整」 | 偽陽性率による撤去の条件は無い(#290 の範囲) |
| 設計の有効性と運用の有効性(PCAOB・NIST) | G-5 の基準・禁止事項6(設計側)、I.11 ⑦(参考) | 運用の有効性の確認は参考の附属書の 1 回だけ |
| 設定の検査・陰性のプローブ(SRE、OPA、Terraform、promtool) | テンプレートの `test-*.mjs`・`verify-gate-contract`、I.11 ⑤ | 採用者が足す検査・設定への要求は無い |
| proof test・Chaos(周期で作動を確かめる) | 5.6.2 欠陥注入(人・AI のレビュー層) | 機械の層の周期的な作動確認は無い |

## 3. 選択肢

推しは書かない。論点ごとに並べる。どの案も「数え方の食い違い(1.2)をどう片付けるか」を別に要する。

### 3.1 論点1: 同種の不具合の昇格(class-lock)

| 案 | 内容 | 良くなること | 壊れること・残ること | 既存 ADR との関係 |
| --- | --- | --- | --- | --- |
| 1-A. 現状維持 | 1.1 の 15 か所の記述をそのまま置く | 変更なし | 2 と 3 の併存、単位の不一致、マーク無しの件数、未実装のラベル、常時点きうる警戒サインが残る | ADR-0026(マークの無い値)との不整合が残る |
| 1-B. 課さないと明記する | 件数の閾値も昇格の義務も置かないと ADR に記録する。各所の「3回」「2回」を例示へ落とすか削る。根拠は FND-0105・0235 と 2.2 | 「書かれていない」と「課さないと決めた」が分かれる。根拠の無い件数が規範から消える | 原則4 の起票者の問題(同じ不具合が 3 件目まで来る)への手当ては 5.6.2・インシデント対応の既存分だけになる。テンプレートの観点表の文を直す必要 | ADR-0044・0059 と同じ形。ADR-0063(参考・従属の箇所の書き方) |
| 1-C. 数え方だけを統一する | 正本を 1 か所(例: 第3章 3.11 か第4章 G-5)に置き、単位(不具合/指摘/類型)と「検討」の意味を定義、他は参照へ。義務にはしない。件数を残すなら暫定マーク | 食い違いが消える。マークで E0 を開示できる | 義務でない以上、3 件目は止まらない。正本の置き場の議論が要る | ADR-0026、0048(正本は 1 つ)、0063 |
| 1-D. 影響による昇格の義務 | 件数でなく影響で起動する。例: 出荷後の欠陥・インシデント・見逃し(5.6.2)・統制の弱化の検知について、「同じ原因で再び起こりうるか」「類似が他にあるか」を判定し、再発防止を仕組み(機械を優先)で置くことを要求。是正の有効性の確認を併せる(ISO 9001 10.2 の (b)(d) の型) | 外部の規範と同じ形。件数に依らないので初回から掛かる。「類似の有無」を問う点で class の発想を保つ | 判定の手間が増える。「影響」の境界の定義が要る。機械を優先すると装置が増える(1.3)。有効性の確認の形が要る(論点2と重なる) | ADR-0025 決定11(新しい判定の場を設けない)と衝突しうる。改善サイクルの既存の場に載せれば回避の余地。ADR-0056 決定10(足さない) |
| 1-E. 件数による class-lock の義務 | #275 の文どおり「同種 2 件で class、3 件目を機械で止める」を要求にする。暫定マーク(E0〜E2) | 起票者の実証案件の運用をそのまま移せる。判定が単純 | 閾値の根拠が無い(FND-0105)。指摘の数と不具合の数が違う。機械で止められない類型(設計の妥当性。ci-gates L248)に義務が掛かる。止めたことの迂回(FND-0097)。装置の総量が単調に増える | ADR-0026(E0 の値を要求に置く)、ADR-0025、0056 決定10、#290 と緊張 |
| 1-F. 昇格を検査の品質で条件づける | 昇格の起動は 1-B〜1-E のいずれかで決め、**機械で止める形にしてよい条件**を「実効的な偽陽性が無い/修正可能/既存の違反を解消済み」に置く。満たさない類型は観点表(人)に残す。偽陽性で止めた検査は外す経路を持つ(撤去は #290) | 止める装置が誤って止める害を抑える。ADR-0025 の判断軸と揃う。Google の先例と同型 | 偽陽性の測り方が要る(母数)。単独の案ではなく、他の案に重ねる | ADR-0025(同じ軸)、0047・0058(遮断でなく確認の既定)と整合の余地 |
| 1-G. 判断の記録だけを義務にする | 同種の再発(定義は 1-C)を見たら、「機械へ移す/観点表へ置く/移さない」を理由つきで記録する。移さない判断も成果として残す | 装置を自動では増やさない。「採らないと決めた」を個別に残せる。#290 の総量の観測の材料になる | 記録が増える(#252 の論点と同じ向き)。記録の置き場が要る。記録しても 3 件目は止まらない | ADR-0036(記録で成立)の型。#252 と緊張 |

「装置へ広げない限定」の扱い(どの案にも重ねられる下位の選択)。

| 下位案 | 内容 | 帰結 |
| --- | --- | --- |
| L-1. 限定を置く | 検査装置自体の不具合は class-lock の対象外とする | 装置の肥大を防ぐ。ただし 2.6 の 3 件(装置の不具合が事故の原因)と SRE の「monitoring failure」の扱いと逆向きになる |
| L-2. 対象に含め、対策の形を限定する | 装置の不具合も同種の不具合として数えるが、対策は「検査を足す」に限らず「直す・外す・陰性の試験を足す」を等しく選べると書く | 装置の失敗を見逃さない。足すか減らすかの判断は #290 の上限・撤去と接続が要る |
| L-3. 書かない | 限定を論じない | #275 の要求の一部が「書かれていない」のまま残る |

### 3.2 論点2: 値が正しいことと効いていること

| 案 | 内容 | 良くなること | 壊れること・残ること | 既存 ADR との関係 |
| --- | --- | --- | --- | --- |
| 2-A. 現状維持 | 5.6.2・変異試験・「対象なし」・禁止事項6・I.11(参考)のまま | 変更なし | 統制の設定が効いているかを確かめる要求は本文に無いまま。I.11 ⑦は参考で、採用者が飛ばせる | — |
| 2-B. 課さないと明記する | 設定値一般の作動確認を要求しないと ADR に記録。理由と、既存の部品(5.6.2、F.6、ADR-0033・0052・0061)で何が覆われ、何が覆われないかを書く | 区別が「決めた」状態になる | 実例(2.6)の型への手当ては本文に置かれない | ADR-0044 型 |
| 2-C. 語の定義だけを置く | 第4章 G-5 か第1章の用語に「設定が在ること(shape)」と「設定が作動すること(behaviour)」を定義し、既存の規定がどちらを見ているかを表で示す。要求は足さない | 読み手が区別できる。既存規定の範囲の開示になる(1.4 の表の正本化) | 開示だけで作動の確認は起きない | ADR-0063(説明は注記へ) |
| 2-D. 統制の設定の変更時に陰性の確認を要求 | 閾値・除外設定・ルールセット・必須チェック・フック・権限の**変更**(禁止事項6 の PR、統制の弱化 ADR-0038 の対象)に、「変更後も止まるべきものが止まる」ことの記録(既知の違反を通した結果)を求める | 変更の時点で効きを確かめる。禁止事項6 の PR 単位の経路に載せられる。OPA・Terraform・promtool に手段がある | 陰性の場面を誰が用意するかが要る。AI が場面を用意すると共連れ(test-effectiveness の論点)が起きる。CrowdStrike のように場面そのものが欠陥を通らない形がありうる | ADR-0038(検知者は許容を判断しない)と分担の整理。ADR-0061 と同型 |
| 2-E. 周期的な作動確認(proof test 型) | 強制層の設定(ルールセット・必須チェック・フック)が実環境で効いていることを、周期または出荷ごとに確かめる。I.11 ⑦・⑤ の中身を本文(第4章 G-7 か第6章)へ移す案を含む | 時間とともに外れる設定(プラン変更、ルールセットの無効化、runner の差。FND-0230)を拾える。保証の開示 項目4 の「未確認」と接続済み | 周期・範囲の根拠が無い(E0)。実環境の API に依る(GitHub のプラン差。ci-gates L168)。装置が増える | ADR-0028(未確認=未達と同じ扱い)、0056 決定10(論証を支えるなら足せる)、0063(参考から本文へ移す手続き) |
| 2-F. 装置の自己試験を要求 | 採用者が足す検査(CI のステップ、フック、ポリシー)に、通る場面と落ちる場面の試験を伴わせることを要求する。テンプレートの `test-*.mjs` の型を一般化 | 「検査が一度も走っていない」「検査が誤って止める」を変更時に拾える(Facebook・ganbari-quest の型) | 試験の試験は無限後退。試験の量が装置の総量に加わる(#290)。どの検査まで要るかの境界が要る | ADR-0061(マークでは同じことを既に要求)、0056 決定10 |
| 2-G. 既存の欠陥注入へ吸収する | 5.6.2 の注入対象を、レビュー層だけでなく機械の層(G-5 の検査)にも広げ、類型「統制の緩和」を機械の層で測る | 新しい手続を作らない。測定の様式・周期を共有できる | 5.6.2 は人と AI の検出能力の手続で、目的の限定(個人評価に使わない等)が機械には不要。測る対象が混ざる | ADR-0025 決定11(新しい場を作らない)と整合しやすい |

原則9 の範囲に関わる下位の選択: 「設定値一般」を(i)プロセスの統制の設定に限る、(ii)製品の設定(feature flag、権限、閾値)も含める。(ii)なら、製品の設定は受入基準とテストの範囲(G-4・G-5)にすでにあり、追加の要求か、受入基準の書き方の指針(附属書E 等)かに分かれる。

## 4. 会議体への問い

1. **昇格を起動するのは、件数か、影響か、検査の品質か**。外部の規範(ISO 9001 10.2、SRE)は影響で、件数を定めない。#275 の「2 件で class」は実証案件 1 件の運用で、FND-0105 の事例も閾値がばらつく。件数を採るなら、どの数を、どの水準のマークで置くのか。採らないなら、本文の 3.11.4 要求2「2回以上」は何として残るのか(追記の歯止めであり昇格の起動ではない、と書き分けるのか)
2. **数える単位は「不具合」か「指摘」か「類型」か**。CI/CD ゲートと観点表は「指摘」、3.11.4 は「誤り」、5.6.2 は「類型」。不具合を数えるなら、指摘されなかった不具合(出荷後の欠陥)をどこで数えるのか
3. **「3 件目を機械で止める」を義務にした場合、機械で止められない類型(設計の妥当性、仕様との一致。ci-gates L248)はどう扱うのか**。義務の対象を「機械で判定できる類型」に限るなら、その判定は誰がするのか。限らないなら、止められないときは未達として表示するのか(ADR-0028)
4. **検査装置自体の不具合は class として数えるのか**。2.6 の 3 件は装置の不具合が事故の原因であり、SRE は monitoring failure を契機に入れる。数えるなら、対策の形を「足す」以外に開く(L-2)ことで #290 の総量の議論とどう接続するのか。数えないなら、装置の不具合の再発はどこで扱うのか
5. **ISO 9001 10.2.1 (b) の「類似の不適合が存在するか、起こりうるか」と (d) の「有効性のレビュー」に当たる要求を、本文に置くのか**。インシデント対応・改善サイクルはフェーズ6 で本文に従属する(ADR-0063)。是正が効いたかの確認は、論点2(効いていることの確認)と同じ問いになる
6. **原則9 の「設定値一般」は、プロセスの統制の設定に限るのか、製品の設定も含むのか**。製品の設定を含むなら、受入基準とテスト(G-4・G-5)の範囲との重なりをどう書くのか
7. **統制の設定の作動確認を、変更の時点(2-D)、周期(2-E)、装置の自己試験(2-F)、既存の欠陥注入(2-G)のどこで行うのか、あるいは行わないのか**。I.11 ⑦は参考の附属書にあり、ADR-0063 は参考の附属書に要求を置かないと決めている。導入前の 1 回で足りるという判断なのか、本文へ移すべき規範なのか
8. **#289 の受入条件(3 項目)は原則4・9 に触れていない**。原則4・9 の決定を #289 の中で ADR にするのか、#290(装置の総量)と合わせて別の会議体で決めるのか

### 原則5・6 が #289 の範囲に入るかの材料(短く)

- #289 本文は「#275 原則4・9 の未対応部分」とだけ書き、原則5・6 を挙げない。原則5・6 は 2026-10-08 の突合で「一部」と判定され、後継の題名案(issue-triage L825)にも入っていない
- 原則5(基準が言い訳に転用されるパターンまで書く): 個別の歯止めは本文にある(G-7「開示が免罪符になる」gate-criteria L816、プロセス内部監査 L80、附属書H、ADR-0056、git-strategy L39「緊急を口実に統制が崩れる」)。横断の要求は無い。外部は INCOSE の escape clause(FND-0243)が近い。#290 の論点「附属書B の escape clause」と語が重なる
- 原則6(設計書を単一の情報源に): 本標準の情報源は機能仕様(テンプレ1)の受入基準と実装計画(テンプレ7)で、「設計書」という成果物を持たない。#251・#253(立ち戻る先の成果物、ADR の置き場)は #289 の範囲で、成果物の構造の論点として隣接する。外部は FND-0120(仕様を保守し続ける型は一部)

## 5. 確認できなかったこと

内部。

- 「装置へ広げない限定」の中身。#275 本文に説明が無く、出典の Zenn 本(ganbari-quest-design 第Ⅷ部-3 principles)は WebFetch で目次しか取れなかった。ganbari-quest リポジトリは、このセッションの GitHub の権限の外で検索できなかった
- `rule-candidate`・「レビュー指摘由来」のラベルが無いことは、`template/` と本リポジトリの grep による。採用者向けの他のリポジトリ・ラベル定義ファイルは見ていない。メトリクス「ルール化の進み」が常に 0 になるかは実行していない
- テンプレートの `test-*.mjs` の場面が陰性(止まるべきものが止まる)をどこまで含むかは、ファイル名と ci-gates の記述による。中身は読んでいない
- `verify-gate-contract.mjs` は冒頭の注記だけを読んだ。何と何を突き合わせるかの全体は確かめていない
- 1.2 の「件数に暫定マークが無い」は、evidence-ledger.md の「3回」「2回」の grep による
- 第1章・附属書A〜H のうち、F 以外で「再発」「是正」を全文検索していない(grep は src/content/docs 全体だが、語の揺れ「同様の」「類似の」は未検索)

外部。

- ISO 9001:2015 の原本(10.2)は読んでいない。二次の 2 ページで一致を確認しただけ。JIS Q 9001 も同じ
- IEC 61508 の proof test の定義と、ISO 26262 の proven in use(8-14)の原文は読んでいない。systematic failure は IEC 60050 の用語で確認した
- ISO/IEC/IEEE 29119 は開いていない。テストの有効性(試験の試験)を規定する条項があるかは未確認
- NIST の定義の後半(operating as intended, and producing the desired outcome)は、用語集の抜粋が途中で切れ、検索結果の見出しで補った。SP 800-53A 本文は読んでいない
- Kyverno の試験の書式(期待結果の宣言)は読めなかった
- トヨタの公式説明に、ポカヨケ・なぜなぜの語は無かった。両者の原典(新郷、大野)は読んでいない
- Goodhart の法則は 282 の TH07 の扱いに依り、今回は原典を取っていない
- 件数の閾値(2・3)が再発の抑止に効くかを測った資料は見つからなかった。影響基準と件数基準を比べた測定も見つからなかった
- 設定の作動確認を要求事項として課し、その効果(事故の減少)を測った資料は見つからなかった。2.6 の実例はいずれも事後報告で、作動確認があれば防げたかは推定である
