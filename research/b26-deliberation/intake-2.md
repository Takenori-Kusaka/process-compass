# 束 B26 後半 受付の更新・既存の裁定と現物の突合・実装の計画(その2)

作成 2026-11-20。担当は「受付の更新・突合・実装の計画」。実装はしていない。書いたのは本ファイルだけ。

- 範囲(指揮役の範囲の変更 2026-11-20 による): #443(IMPL-0954 の集約の側)、#445(IMPL-0630・0761・0771・0763・0836・0930・0931・1029 と D-0 節5 の編集の指摘)、#326(326-A・326-B と IMPL-0145 の計画の Issue の移し先)、結線(単位24)。#348・#450・#356・#441 は B27 へ移ったため調べていない(末尾 §5 に覚えだけを残す)
- 現物: 本体 `Takenori-Kusaka/b26`(e36c28c3)、template `b26` = main の 31e783a(B25 の push の後)。`npm run -s impl:issues` は「28件・9番号。計画の Issue はすべて open」
- 入力: `research/b21-deliberation/ruling-deferred-draft.md`(§2・§3.1・§3.3・§3.6・§4.1・§7.2)と `ruling-deferred.md`、`research/b22-deliberation/30-ruling.md`・`96-issue-comment-445.md` と ADR-0224、`research/326-deliberation/b26-ruling-6-9.md`・`b26-live-check.md`、`intake-1.md` §3.8・§5.2・§6、Issue #445 の最新のコメント3件、#361・#452 の本文
- 所有者の方針(2026-11-16)の3問は、項目ごとに (1) 結果と証跡 (2) 例外承認で受けられないか (3) 破られたとき誰が何を失うか、で書く

## 0. 受付(審議の重さ)

| 項目 | 判定 | 理由 |
| --- | --- | --- |
| 0954 集約の側 | 軽 | 裁定済み(draft §3.1)。現物で別の欠け(§1.1)が見つかったが、既存の規則の当てはめの直し |
| 0761 | 軽 | 裁定済み。IMPL-1007 が実質を既に降ろした。残りは構成の値の参照 |
| 0771 | 軽 | 裁定済み。現物と合う |
| 0630 | 軽(Q1=N で裁定済み) | 見分け方の裁定を ADR-0217 決定2 に合わせて改める(§1.4)。新しい義務なし |
| 0763・0836・0930・0931 | 重の審議は B22 で済み(ADR-0224) | 実装の単位に乗せるだけ。ただし項目8(7.3 の経路)は台帳の行の約束を足すため、ADR を1つ要する(軽。§1.5) |
| 1029 | **指揮役へ上げる** | 降ろし方が全採用者の R1 の PR の G-5 を新たに落とすかを決める。B21 の Q4・0214 と同じ型(§4 Q-B26-4) |
| D-0 節5 の引用 | 編集 | 意味を変えない。議長が直し、独立の突合を1回 |
| 326-A | 軽(裁定済み) | 現物と合う |
| 326-B | 軽(裁定済み。実機の確認は済み) | G-5 の段の集約(B22 の項目4)と同じ手順を触るため、1つの単位へまとめる(§1.6) |
| IMPL-0145 の移し先 | 編集 | `issue=` の付け替え |

## 1. 項目ごとの現状・突合・改め

### 1.1 IMPL-0954 の集約の側(#443)

- **現物**: マーク `lifecycle.md:669` は undelivered・manual・issue=443。/pit の側は B26 前半で降りた(template 097c3bb・e7a8650。`next.mjs` の `ADJUSTMENT_GATE`・`adjustmentRecordCount`、試験 `test-next-records.mjs` 429〜443 行)。note の「降りていない部分」は「集約が調整の記録を未知のゲートとして欠落に数えないこと」
- **現物の読み**: `aggregate-evidence.mjs` に「未知のゲート」を欠落に数える処理は**無い**。判定記録は `readGateRecords`(config.mjs 2763 行)が欄を読むだけで、ゲート欄の値で見分ける処理はどれも `G-n`・`ステージ移行|^SG`・`棚卸し`・`必達基準の判定` の正規表現で、「価値責任者の調整」に当たらない。帰属(`attributeBaseForm`)と D-0 の版の照合(3425 行)は全記録に掛かるが、調整の記録にも正当に掛かる(様式 04 で書くため)
- **見つけた欠け**: `pendingSeparationProblems`(`template/scripts/init/generate-profile.mjs` 1474 行)は、兼務の決定待ちの間に記録したゲート判定を欠落に数え、「決定の後に同じゲートを判定し直した記録」で解く。同じゲートかは `gateCodeOf`(1413 行。`^(G-\d+|SG(-\d+)?)`)で決めるため、ゲート欄が「価値責任者の調整」「価値責任者の判断」「事業決裁者の決裁」「必達基準の判定」の記録は code が null になり、**決定の後に記録し直しても欠落が解けない**(1487 行の `code && …` が偽 → 欠落のまま)。集約が調整の記録を「欠落に数え続ける」経路はこれだけである
- **既存の裁定との突合**: draft §3.1 の条件(集約が欠落に数えない)は、現物では大半が既に成り立つ。裁定の案を次のとおり改める
  - 改め: 「未知のゲートとして欠落に数えない」を、「決定待ちの間の記録の欠落を、決定の後の記録し直しで解けること」に置き換える。`gateCodeOf` が G・SG に当たらないとき、ゲート欄の値(NFKC・前後の空白と強調を除く)を code とする。対象の一致は求めない(G・SG の現行の扱いと揃える。現行も対象を照らさない)
  - 決定待ちの間の調整の記録を欠落に数えること自体は保つ。調整も価値責任者の席の判断であり、兼務の決定待ちの影響を受ける(3.5・3.13.3)
- **方針の3問**: (1) 結果(記録し直しで欠落が解ける)と証跡(判定記録) (2) 該当しない(欠落の解消の経路の直し) (3) 正しく記録し直した採用者の出荷が、解けない欠落で止まり続ける。失うのは出荷判定者の判断の材料の信頼。細かい定義は増えない(既存の欄の値を使う)
- **単位**: U1(§2)。試験 `test-loosening-decider.mjs`(`pendingSeparationProblems` の既存の試験が在る。gate-g5.yml 215 行で結線済み)に ng/ok を足す。ng: 決定待ちの間の「価値責任者の調整」の記録だけ → 欠落。ok: 決定の後に同じゲート欄の記録がある → 欠落なし。ok(固定): G-4 の既存の扱いは変わらない
- **マーク**: `state=delivered check=machine test=template/scripts/gate/test-next-records.mjs`(/pit の側の試験。件数を出す本体)。note に「集約は調整の記録をゲート欄の値で見分けず、未知のゲートとして欠落に数える処理を持たない(2026-11-20 に現物で確かめた)。決定待ちの間の記録は、決定の後の同じゲート欄の記録で解く(test-loosening-decider.mjs)。調整の種別と当否は確かめない」を書く。test= は1つしか書けないため、もう一方の試験は note に名指す
- **残る受け入れ条件(#443)**: マーク以外は審議で決まっている(intake-1 §6)。チェックボックスの記入だけ

### 1.2 IMPL-0761 CL2 以上の F.7 の記録を G-7 の判定基準にする(#445)

- **現物**: マーク `tailoring-guide.md:1216` は undelivered・target=gate-skill。IMPL-1007(`gate-criteria.md:1691`、delivered・machine・test-safety-record.mjs)が、`check-safety-record.mjs` の `safetyRecordApplies`(197 行)で、F.2 の Q1 が「はい」または CL2・CL3(**構成の回答 `q-criticality` と D-0 の記録の高いほう**)のときに F.7 の6項目の欠落を数え、集約(aggregate-evidence.mjs 3354 行)が記載の欠落へ載せている
- **突合**: draft §3.1 の条件(`safetyVerificationRecord` が required のとき節が無い・欄が空なら欠落)は、規則 r-e-cl2 の when(`q-criticality` が cl2・cl3)が 1007 の適用の条件の部分集合なので、**実質は既に降りている**。残るのは、構成のゲート g7 の `params.safetyVerificationRecord` の値そのものを読まないことだけ
- **改め**: 実装を「適用の条件に `config.gates.g7.params.safetyVerificationRecord === 'required'` を和として足す」に縮める。構成の回答と導出の値が食い違う構成(手での書き換え・再導出の漏れ)で、導出の値が要求しているのに適用外と出す経路を閉じる。集約(aggregate-evidence.mjs)は触らない。降ろし先を gate-skill から evidence-aggregation に改める(draft のとおり)
- **方針の3問**: (1) 結果(F.7 の記録の在否)と証跡(様式 09) (2) 受けない(7.3 の後段・附属書F。ADR-0153 決定2) (3) 安全適合性の検証記録の無い CL2・CL3 の出荷。安全
- **単位**: U2。`check-safety-record.mjs`(`safetyRecordApplies` に引数 `required`、`checkSafetyRecord` が構成から渡す)、`test-safety-record.mjs`(gate-g5.yml 227 行で結線済み)。ng: 構成の値が required・Q1 いいえ・CL1・記録なし → 欠落。ok: 値が無い・Q1 いいえ・CL1 → 適用外。ok(固定): 既存の CL2・CL3 の組は変わらない
- **マーク**: `target=evidence-aggregation state=delivered check=machine test=template/scripts/gate/test-safety-record.mjs`。note に「記録の在否と欄の空だけ。検証の中身は出荷判定者」。IMPL-1007 の note の末尾「構成の safetyVerificationRecord を G-7 の判定が照らすことは IMPL-0761 が追う」を改める

### 1.3 IMPL-0771 差し戻し基準を持たないゲートを作らない(#445)

- **現物**: マーク `tailoring-guide.md:1416`、undelivered・gate-contract。B25 は verify-gate-contract.mjs を大きく変えた(31e783a ほか)が、ゲートを足す経路は今も無い。`config.gates` のキーは状態の値(327 行)・g4 と g5 の省略の禁止(335 行)・unmet の整合しか見ず、**キーが KB の gates に在るかは見ていない**
- **本体の側**: `scripts/check-gate-criteria.mjs` は `GATE_IDS` の各ゲートに第4章の判定基準の表が無ければ失敗させる(96 行)。ただし **KB の gates の全てが `GATE_IDS` に在るか**は見ていない
- **突合**: draft §3.3 の (i)(ii) は現物と合う。(i) は「全ゲートの criteria が空でない」から「KB の gates の id がすべて `GATE_IDS` の値に在り、それぞれ判定基準を持つ」へ具体化する(`GATE_IDS` に無い KB のゲートは基準の表を照らされないため)
- **方針の3問**: (1) 構造(判定基準の表の存在)。(2) 該当しない (3) 基準の無いゲートで記名だけの判定が成立する。決定可能な条件(キーの存在・空でないこと)だけ
- **単位**: U2。template `verify-gate-contract.mjs` に (ii)(構成の gates のキーが KB の gates の写像の中に在る。写像は generate-profile.mjs が構成を作るときのものを使い、新しく定義しない)。試験は `test-adoption.mjs`(verify-gate-contract を呼ぶ既存の試験。結線済み)。ng: 構成に `g-extra` / `g9`。ok: KB のゲートだけ。本体 `scripts/check-gate-criteria.mjs` に (i)、試験 `scripts/test-gate-criteria-yaml.mjs`(本体の check に既に入っているかを実装で確かめる)
- **マーク**: `state=delivered check=machine test=template/scripts/gate/test-adoption.mjs`。note に本体の側の検査を名指す

### 1.4 IMPL-0630 7.9.5 の枠(#445。Q1=N)

- **現物**: マーク `exception-escalation.md:836` は undelivered・pr-checks・note は旧いまま。B20 で次が降りている
  - IMPL-0628(7.9.4 の行の見分け): `exception-expiry.mjs` の `restrictedStateExceptions`(248 行)。区分「例外」で、対象の変更が一時制限の範囲に触れ(`restrictionTouched`)、数えた承認が2名に満たない行。**印は求めない**(ADR-0217 決定2)
  - IMPL-0669(表示): `exceptionQuotaText`(280 行)と集約の項目7(aggregate-evidence.mjs 4597〜4618 行)が、直前のステージ移行ゲートの通過のコミットの台帳との差で行使を数え、枠・行使・残りを出す。超過は止めない(「拒否は IMPL-0630」)
  - `check-pr.mjs` の `exceptionFor`(747 行)は 7.4 の印と制約1 を見るが、7.9.4・7.9.5 は見ない。`restrictionHit` は config.mjs 1763 行
- **既存の裁定と合わない点**: draft §4.1 の要求事項3 は「7.9.4 の決裁の行を、ADR-0200 の印(`ファストトラック(短縮: G-6)`)を持ち、`restrictionHit` に当たる行として見分ける」とする。これは後の **ADR-0217 決定2(条件で見分け、印は求めない)と矛盾する**。ADR-0217 が「7.9.4 の行に印を求めること」を採らない案に記録している
- **改め(軽)**: 要求事項3 の見分け方を `restrictedStateExceptions` と同じ関数にする(集約の表示と拒否の数え方を1つの定義にする)。数える期間と累計の数え方も集約の項目7 と同じ(直前のステージ移行ゲートの通過のコミットの台帳との差)にし、関数を `exception-expiry.mjs` へ切り出して check-pr と集約の両方が呼ぶ。過去の行の `restrictionTouched` と承認の数は、行が名指す PR の変更ファイルとレビューから求める(check-pr は gh を既に使う)。求められない行があれば「枠の行使を確定できない」と注意に出し、拒まない(draft の「枠を読めなければ注意」と同じ扱い)。この PR の行が 7.9.4 に当たり(この PR の変更ファイルに `restrictionHit`、数えた承認が2名未満)、行使が枠以上なら G-5(pr-rules)を失敗させる
  - 要求事項2: draft のとおり。企画書の「例外の枠」の数値を増やす PR で、基底と先頭の間にステージ移行ゲートの通過の記録が無ければ失敗。数値が無い状態から初めて書く PR は補充に数えない(G-1 で定める行為)
  - 要求事項4: manual(draft のとおり。確かめる者は B-2 の決定者と内部監査)
  - 様式 06 の行の名の補い(draft の編集の指摘「例外の枠(7.9.4 の制限された状態での例外決裁。事業ステージあたり)」): `exceptionQuotaText` は行を `includes('例外の枠')` で探すため、名を補っても読める。様式 06 は profiles の3つの複製を持つので同じ単位で直す。必須欄の登録(`src/data/template-fields.yaml`)の欄の名と揃えるかを実装で確かめる
- **方針の3問**: (1) 結果(使い切った後に 7.9.4 の決裁を通さない)と証跡(台帳の行・企画書の件数) (2) 該当しない(枠そのものが例外の限定) (3) 検出能力の低下が測られた範囲で、確認の薄い変更が積もる。新しい印・欄は足さない
- **単位**: U5。`check-pr.mjs`(`exceptionFor` の後段)、`exception-expiry.mjs`(累計の関数の切り出し)、`aggregate-evidence.mjs`(切り出した関数を呼ぶ形へ。挙動は変えない)、`templates/06-project-brief.md` と profiles の3複製、`test-check-pr.mjs`・`test-exception-expiry.mjs`・`test-aggregate-records.mjs`(いずれも結線済み)。ng: 枠 1・行使 1 の段で 7.9.4 に当たる新しい行 → 失敗。ng: 枠を 2→3 に増やし、範囲にステージ移行ゲートの通過が無い → 失敗。ok: 枠 2・行使 1 → 通る。ok: 印の無い 7.9.4 の行も数える(ADR-0217 の固定)。ok: 過去の行の PR を読めない → 注意で通る
- **マーク**: 1つのまま `state=delivered check=machine test=template/scripts/gate/test-check-pr.mjs`。note に要求事項4 を manual、累計が下限の値であること(範囲の外で足された行)を書く

### 1.5 G-5 の段(IMPL-0763・0836・0930・0931。B22・ADR-0224)

- **現物**: 4件とも undelivered・g5-adapter。note は B22 で書き換え済み。template には段が無い: `adapter.mjs` の段は install〜secretScan、`ALWAYS_PHASES` は secretScan だけ(config.mjs 3146 行)、`gate-g5.yml` に段のジョブも `ci.mutationThreshold` も無い。様式 09 にミューテーションの語が無い(F.4 の注が降りていない)。`adapter.mjs` は phase の定義が無いと終了コード 2 で落ちる(47〜51 行)
- **既存の裁定(#445 の 2026-11-19 のコメントの項目1〜11)と現物の突合**
  - 項目1〜3・5・6・9・11: 現物と合う。B25 は adapter.mjs・cl-judgment.mjs に触れていない。`f2Q1Of`・`readF2Q1`(cl-judgment.mjs 136・169 行)が在る
  - 項目1 の補い: 既存の採用者のアダプタ(`adapters/*.json` の複製)は `mutation`・`regulatory` のキーを持たない。キーが無い場合を「定義が無い(終了コード 2)」にすると全採用者の G-5 が落ちる。**キーが無いことを空と同じに扱い、必須でなければ通し、必須なら失敗**にする。template の7つのアダプタには空の値を足す
  - 項目4 と 326-B は**同じ集約の手順**を書き換える。326-B の式(b26-live-check.md の候補。設定済みなら基準と規則のジョブが success でなければ失敗)に、段のジョブ `mutation`・`regulatory` を足せば、項目4(条件に当たる構成で段のジョブの success を確かめ、skipped を通さない)を別の条件式なしで満たす。段のジョブは設定済みなら常に走り(ジョブの `if:` は他の段と同じ `configured == 'true'` だけ)、必須でない構成では段の中で注意を出して success で終わるため。**改め**: 項目4 を 326-B と同じ単位で行い、段のジョブは `g5-aggregate.mjs` の `G5_RULE_JOBS` へ足す(ADR-0224 決定8「判定基準の8つに足さず、集約の合否に含める」)。項目5(契約検査が集約の needs に段のジョブを求める)は、verify-gate-contract.mjs 893 行が既に `aggregateFindings` を呼んでいるため、`G5_RULE_JOBS` へ足すだけで降りる
  - 項目7(check-pr の基準値と除外設定の変更に閾値・段のコマンド・規則集を入れる): 現物と合う。check-pr.mjs は B27 も触る可能性がある(§2 の表)
  - 項目8(閾値割れの 7.3 の経路): 降りている IMPL-0996(G-5 を対象とする例外の行を常に欠落にする。ADR-0153 決定2・ADR-0222 の「標準より厳しい」)と食い違う。ADR-0153 決定2 は「実施した判定・検証で個々の判定基準を満たさない場合に 7.3 を用いることは妨げない」とし、ADR-0224 決定7 が閾値割れを 7.3 の対象と定めたので、方向は決まっている。ただし段のジョブと集約が「閾値割れの例外の行」を見分けるには、台帳の行の書き方の約束が要る(ADR-0200 決定2 と同じ型。例: 区分「例外」・対象 `PR #<番号>`・内容の先頭 `ミューテーションの閾値割れ(スコア <値> / 閾値 <値>)`)。**採用者に書かせる記録の約束を足すため、ADR を1つ要する**(ADR-0243 を使う。新しい義務ではない。ADR-0224 決定7 の実装の約束)。印の無い行は見分けられない(ADR-0200 決定5(a) と同じく開示し、検出しない)
  - 項目10(IMPL-1029): 3つの残る点が未決。§4 Q-B26-4 へ上げる
- **ADR の要否**: 4件(0763・0836・0930・0931)は ADR-0224 で足りる。0931 の 7.3 の経路だけ ADR-0243(台帳の行の約束)を要する。1029 は §4 の回答による
- **方針の3問**: (1) 結果(段の実行と閾値との比較・一覧の所在)と証跡(段の出力) (2) 段が空・閾値未設定は受けない。閾値割れだけ受ける。規制要件の不合格は受けない(ADR-0224 決定7) (3) CL3・Q1「はい」の案件で試験の検出力が測られないまま出荷される(安全)。規制業で規制要件の検査が空のまま通る(法令)。機械にするのは、コマンドの空・閾値の型・一覧の所在・ジョブの結果だけ(決定9)
- **単位**: U4a(項目1〜3・6・9)、U4b(項目4・5 と 326-B)、U5 に項目7、U6 に項目8(§2)
- **マーク**: 0763・0930 は U4a・U4b の後に delivered・machine(test=test-adapter.mjs)。0836 は U5(項目7)の後。0931 は U6 の後(note の「7.3 の経路は成立しない」「集約が skipped を通す」を外す)。どれも note に「段の存在と閾値との比較まで。変異を作るか・閾値の較正・規則集の中身は確かめない(EV-0339)」

### 1.6 #326 の 326-A・326-B と IMPL-0145

- **326-A(項目6・7・8・9 e の説明文・5.8.2 のマーク)**: 現物と合う。`declarationDrift`(aggregate-evidence.mjs 1150 行)、トレーラの読み(1604〜1617 行。Agent-Run・Co-Authored-By を読む)、`test-aggregate-drift.mjs` 42〜49 行の固定は B25 の後も同じ形。改めは無い
  - 注意: B27 の #441(Spec のトレーラの読み方の統一)は同じ 1604〜1617 行のトレーラの読みを触る見込み。326-A の行A・行B は Agent-Run と Co-Authored-By を読む同じ配列を使うため、**B27 の #441 と 326-A は直列にする**(§2)
  - 新しい実装マーク2つ: 行A・行B の警告(evidence-aggregation・machine・test=test-aggregate-drift.mjs)と、5.8.2 の自動の記録の未達(undelivered)。番号は push の直前に付ける
- **326-B(項目9 b・c)**: 実機の確認は済み(b26-live-check.md。候補の式は正当な実行 1・5・6・7 を落とさず、skipped の基準 2・3 を落とした)。所有者の条件は「リポジトリを2度作らない」。**改め**: 実装は観測した候補の式の構造をそのまま使い、ジョブの対の一覧に `mutation`・`regulatory` を足すだけにする(§1.5)。段のジョブを足した式は観測していない。式の意味(`needs.*.result` の扱い)は観測した範囲と同じなので再観測はせず、note に「段のジョブを足した後の式は実機で観測していない」と開示する
  - 値の一致の後ろ盾: 手順の中の対の一覧(`contract:$R_CONTRACT` …)と `G5_CRITERION_JOBS`・`G5_RULE_JOBS` の和の一致を、`aggregateFindings` が確かめる(ジョブを足して式を直し忘れると契約検査の不備に出る)。決定可能な条件
  - 限界(note): 同じ PR が集約の定義も書き換えられる。守るのはうっかりで、悪意は `.github/workflows/**` の変更の承認(ADR-0115)が受ける
- **IMPL-0145 の移し先**: `roles-responsibilities.md:1621`(undelivered・manual・issue=326・review=2027-04)。上げる条件は「2026-10-01 の後に作られ 90 日を超えた実行が読めるかの観測(2027-01 以降)」で、実環境の GitHub の観測である。#361(実際の GitHub 上での持ち込みの検証と実環境の読み取り)が合う。#452 は IMPL-0200 の実測(実装計画の履歴)に限られ、合わない。**#361 へ移す**。5.8.2 の新しい未達のマーク(提供者の文書と実機の確認が要る)も #361 へ寄せる。#361 の本文の範囲に無いので、実装の段で指揮役が #361 へコメントを残す(外部の操作。本担当は行わない)
- **方針の3問(326-B)**: (1) 結果(基準のジョブの success)と証跡(gate-g5 の結果) (2) 該当しない(集約の式の誤りを防ぐ) (3) 基準のジョブが走らないまま G-5 が通る。失うのは G-5 の通過の意味

### 1.7 D-0 節5 の 3.9.1 の引用の範囲(#445 の 2026-11-18 のコメント。編集)

- **現物**: `template/templates/00-d0-governance.md` 238 行「判定期限は、定例の開催日ではなく、上程の受理日から起算します(標準 第3章 3.9.1)」が、会議体の規定 3.9.1 を G-1〜G-7 の表へ引いている。本体の第6章の様式には同じ段落が無い(template だけの文)。B25 はこの段落を変えていない
- **直し(議長)**: 「判定期限は、定例の開催日ではなく、上程の受理日から起算します。会議体の判定は標準 第3章 3.9.1 により、PR で判定するゲートは、判定の依頼(最初のレビュー依頼。無ければ ready の時点)を上程として扱います(標準 第4章「2つの時刻を分ける」)。」IMPL-0979 の note の読み(最初のレビュー依頼、無ければ ready)と同じ。IMPL-0704 の note(3.9.1 の起算点を節5 の段落が受ける)は変えない
- **単位**: U1。`src/data/template-fields.yaml` の必須欄に掛かるかを `npm run test:fields` で確かめる

### 1.8 結線(単位24)

- 本計画の単位は、どれも**既存の結線済みの試験**へ ng/ok を足す: test-loosening-decider(215 行)・test-safety-record(227)・test-adoption(233)・test-check-pr(101)・test-exception-expiry(166)・test-aggregate-records(111)・test-aggregate-drift(114)・test-adapter(193)・test-g5-aggregate(181)。新しい試験のファイルは作らない見込み
- 作る場合は、gate-g5.yml の contract のジョブの `run:` の行を**同じ単位**で足し、`test-aggregate-wiring.mjs`・本体の `impl-inventory.mjs` の `templateTestWired` が拾うことを確かめる
- U4b は gate-g5.yml に段のジョブ `mutation`・`regulatory` を足す。これは試験の結線ではなく、集約の needs と手順の対の一覧の両方へ同じ単位で足す

## 2. 実装の単位と直列の順

template を触る単位はすべて直列。コミットのたびに bundle へ退避する。本体のマークの更新と `npm run impl:write`(EV・ADR を足す単位は `evidence:write` と ADR の index)を同じ単位で行う。途中は関係する試験だけを流し、回帰の全量は push の前に1回。KB(`src/data/tailoring/`)を変える U4a は `npm run template:kb` を使い、template と本体を続けて push する。

### 2.1 単位ごとに触るファイル(確定の一覧)

★ = B27 が並行して触る可能性のあるファイル(aggregate-evidence.mjs・config.mjs・check-pr.mjs・gate-g5.yml)

| 単位 | 項目 | template のファイル | 本体のファイル | 試験(結線済み) | 新設 |
| --- | --- | --- | --- | --- | --- |
| U1 | 0954 集約の側・D-0 節5 の編集 | `scripts/init/generate-profile.mjs`(`gateCodeOf`)・`scripts/gate/test-loosening-decider.mjs`・`templates/00-d0-governance.md` | `phase4-process-design/lifecycle.md`(IMPL-0954)・台帳 | test-loosening-decider・test-next-records | なし |
| U2 | 0761・0771 | `scripts/gate/check-safety-record.mjs`・`test-safety-record.mjs`・`scripts/gate/verify-gate-contract.mjs`・`test-adoption.mjs` | `scripts/check-gate-criteria.mjs`・`scripts/test-gate-criteria-yaml.mjs`・`tailoring-guide.md`(IMPL-0761・0771)・`gate-criteria.md`(IMPL-1007 の note)・台帳 | test-safety-record・test-adoption・本体の check | なし |
| U3 | 326-A・IMPL-0145 の移し | ★`scripts/gate/aggregate-evidence.mjs`・`test-aggregate-drift.mjs`・`test-aggregate-records.mjs` | `roles-responsibilities.md`(3.13.5・IMPL-0023・0145)・`human-ai-boundary.md`(5.8.2・IMPL-0177)・台帳 | test-aggregate-drift・test-aggregate-records | IMPL 2件 |
| U4a | G-5 の段(項目1〜3・6・9) | `scripts/gate/adapter.mjs`・★`scripts/gate/config.mjs`(`ci.mutationThreshold` の読みと型の検査)・`adapters/*.json`(7つ)・`scripts/gate/test-adapter.mjs`・`.claude/skills/process-change/`(閾値を書く補助ファイル)・`templates/09-safety-risk-assessment.md`・`scripts/vendor/tailoring-kb.json`(生成) | `src/data/tailoring/rules-criticality.yaml`(r-e-cl3 の note)・`src/data/template-fields.yaml`・`tailoring-guide.md`(IMPL-0763 の第1文)・`safety-verification.md`(0930)・台帳 | test-adapter・本体 test:fields | なし |
| U4b | 集約(項目4・5)と 326-B | ★`.github/workflows/gate-g5.yml`(段のジョブ2つ・集約の手順)・`scripts/gate/g5-aggregate.mjs`(`G5_RULE_JOBS`・対の一覧の一致)・`scripts/gate/test-g5-aggregate.mjs` | `tailoring-guide.md`(0763・0836)・`safety-verification.md`(0930・0931 の note)・326-B の本文の note(IMPL-0142・0147 ほか集約の条項)・台帳 | test-g5-aggregate・test-adoption(契約) | なし |
| U5 | 0630・項目7 | ★`scripts/gate/check-pr.mjs`・`scripts/gate/exception-expiry.mjs`・★`scripts/gate/aggregate-evidence.mjs`(累計の関数の呼び替え)・`templates/06-project-brief.md`・`profiles/{internal,oss,revenue}/templates/06-project-brief.md`・`test-check-pr.mjs`・`test-exception-expiry.mjs`・`test-aggregate-records.mjs` | `exception-escalation.md`(IMPL-0630)・`gate-criteria.md`(IMPL-0202 の note)・`tailoring-guide.md`(IMPL-0836)・台帳 | test-check-pr・test-exception-expiry・test-aggregate-records | なし |
| U6 | 項目8(閾値割れの 7.3) | `scripts/gate/adapter.mjs`(段が台帳の行を読む)・`scripts/gate/exception-expiry.mjs`(IMPL-0996 の改め)・`test-exception-expiry.mjs`・`test-adapter.mjs` | `src/content/docs/adr/0243-*.md`・`adr/index.md`・`exception-escalation.md`(IMPL-0996 の note)・`safety-verification.md`(IMPL-0931・F.6 の手引きの所在)・台帳 | test-exception-expiry・test-adapter | ADR-0243 |

- U1 は B27 のファイルに触れない。U2 も触れない(0761 は集約を触らず check-safety-record.mjs で受ける)
- U3・U4a・U4b・U5 は ★ のファイルを触る。B27 の同じファイルの単位と**交互にしない**。指揮役が B27 と B26 の ★ の単位の順を1本に並べる
- 326-A(U3)は B27 の #441(トレーラの読み)の後にする(§1.6)

### 2.2 担当の分け方(5担当。直列)

| 順 | 担当 | 単位 | 見込み | 依存 |
| --- | --- | --- | --- | --- |
| 1 | 担当A | U1 → U2 | 小〜中(約100回) | なし。B27 と並行できる |
| 2 | 担当B | U3 | 中 | B27 の aggregate-evidence.mjs の単位(#441 を含む)の後 |
| 3 | 担当C | U4a | 大(KB と template の対の push を含む) | B27 の config.mjs の単位の後 |
| 4 | 担当D | U4b → U5 | 中〜大 | U4a の後(段のジョブが adapter の段を呼ぶ)。B27 の gate-g5.yml・check-pr.mjs の単位の後 |
| 5 | 担当E | U6 | 中 | U4a・U5 の後。§4 の回答には依らない |

- IMPL-1029 は §4 Q-B26-4 の回答の後に、担当C か担当E の範囲へ足す(案件ごとの段と同じ段で拾う回答なら adapter.mjs の段の必須の条件に R1 の変更を足す)
- 各単位の後に独立の突合を1回(2巡まで)。U4b・U6 は全 PR の必須チェックと安全の経路を変えるため、突合で陰性の確認(段を空・skipped にした PR で集約が落ちること)を見てもらう

## 3. 既存の ADR・条項・suite の fixture との突合で注意が要る点

- **ADR-0217 決定2 と draft §4.1**: 7.9.4 の行は条件で見分け、印を求めない。draft §4.1 の「ADR-0200 の印を持つ行」は採らない(§1.4 で改めた)。ADR-0217 の影響の節「止めるのは 7.9.4 の行の欠落だけ」は、IMPL-0630 の拒否(G-5)が足されると事実でなくなる。ADR-0217 は採用済みで書き換えない。決定3 が「拒否は IMPL-0630」と予告しているので矛盾ではないが、U5 の note と CHANGELOG(移行の注意)に「枠を超える 7.9.4 の決裁は G-5 で止まる」と書く
- **ADR-0153 決定2・ADR-0222・IMPL-0996**: 「G-5 の行は常に欠落」は template が標準より厳しくした選択。U6 はこれを、ミューテーションの閾値割れの行(約束の印つき)に限って緩める。それ以外の G-5 の行は欠落のまま。IMPL-0996 の note の「標準より厳しい」の範囲を書き直す
- **ADR-0151 決定1・3**: 必須の段は test・secretScan に限っていた。ADR-0224 が条件つきの必須の段を一部置き換えた。`ALWAYS_PHASES`(対象なしを認めない段)に `mutation`・`regulatory` を入れるかは決めていない。議長の案: 入れない(製品のコードが無ければ変異も規則集の照らしも対象が無い。対象なしの扱いは既存の段と同じ)。ただし「目印が下の階層にあれば失敗」(nestedTargetProblem)は効く
- **アダプタの複製**: 採用者のアダプタに `mutation`・`regulatory` のキーが無い場合を空として扱う(§1.5)。phase の定義が無いと終了コード 2 になる現行の扱いを、この2段にだけ掛けない。test-adapter.mjs に「キーが無い・必須でない → 通る」「キーが無い・必須 → 失敗」の組を置く
- **suite の fixture**
  - test-loosening-decider.mjs 590 行は旧い構成の移行(`migrated`)で決定待ちの欠落が0件であることを固定している。U1 の `gateCodeOf` の変更は、G・SG の記録の扱いを変えないので、この固定は保たれる見込み。必達基準の判定・棚卸しの記録にも同じ変更が及ぶ(記録し直しで解けるようになる)。ゲート欄の値でしか同じゲートを決めないことを note に書く
  - test-aggregate-records.mjs 646〜672 行と test-aggregate-wiring.mjs 262〜291 行は、`exceptionQuotaText` の文(「止めない」)を固定している。U5 で集約の表示は変えない(止めるのは G-5)。文の「止めない」は集約の表示としては正しいままだが、「拒否は IMPL-0630」の旨を足すなら固定の期待も改める
  - test-g5-aggregate.mjs は現行の集約の手順の本文を読む。U4b で手順を書き換えると、手順の本文の期待が変わる。過去の判断の固定(skipped を通す)ではなく欠陥の固定なので改める(b26-live-check の A の 2・3)
  - test-adoption.mjs の構成の fixture に KB に無いゲートのキーが無いことを U2 で確かめる
- **IMPL-0142・0147 の note**: 326-B の後、集約が skipped を通すという開示(9 b・c)を外し、9 a(手順の continue-on-error)と 9 d・e の限界は残す
- **5.8.2 の新しい未達のマーク**: issue=361 で付ける。#361 の範囲に無いので、指揮役がコメントで範囲を足す(後継は既存の Issue へ寄せる。新規起票はしない)
- **template と本体の push は対で**: U4a は KB の複製(`tailoring-kb.json`)を変える。template を先に push すると並行の束の test:fields・check が落ちるので、続けて push する

## 4. 指揮役へ上げる問い

- **Q-B26-4(所有者。IMPL-1029 の降ろし方)**: 附属書H H.1 は R1 の変更で変異試験を「必須。当該範囲を変更するたびに実行」とする(ADR-0224 決定13 で保つと決めた既存の規定)。降ろすと、CL や Q1 に依らず、R1 の変更を含む全採用者の PR で、変異試験の段が空なら G-5 が新たに落ちる。B21 の Q4・0214 と同じ「採用者の G-5 が新たに失敗する」型の判断なので、所有者に方向を問う
  - 案 甲: R1 の変更(区分の下限の規則が R1 を導く変更)で、案件ごとの段 `mutation` を必須にし、空なら G-5 を失敗にする(H.1 のとおり)。全採用者に段のコマンドの設定を求めることになる
  - 案 乙: R1 の変更で段が空なら G-5 は注意に出すだけにし、G-7 の集約に「R1 の変更で変異試験を実行していない件数」を出す。H.1 の「必須」と機械の強さが食い違うことを undelivered の一部として開示し続ける
  - 案 丙: 案件ごとの段の条件(CL3・Q1「はい」)の案件では甲、それ以外は乙
  - 残る2点(道具の無い言語は項目3 の記録を照らすコマンドで受けるか、7.3 の名指し(F.6)を R1 の規定に掛けるか)は、方向が決まった後に軽の審議で決める。議長の見込み: 甲か丙なら、道具の無い言語は外部の記録を照らすコマンドで受け(F.6 と同じ)、閾値割れは F.6 の名指しに揃える
- ほかに所有者にしか決められない点は無い。326-B の再観測はしない(§1.6。所有者の条件「2度作らない」に従う)

## 5. B27 へ渡す覚え(範囲の変更の前に読んだ分だけ)

- #441 の Spec のトレーラの読み方の統一は、`aggregate-evidence.mjs` 1604〜1617 行のトレーラの読みを触る。326-A(U3)が同じ配列を使うので、B27 の #441 を先に行い、U3 をその後にしたい
- `config.mjs` は U4a(`ci.mutationThreshold`)、`check-pr.mjs` は U5、`gate-g5.yml` は U4b が触る。B27 の同じファイルの単位との順を指揮役が1本に並べる
- intake-1 §5.2 の後段の表のうち、#348(0291・1006)・#450(0645)・#356(1011・1003・0191)・#441(0268)は、本書では現物と突き合わせていない
