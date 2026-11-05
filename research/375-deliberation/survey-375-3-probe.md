# #375 実行による確認: 名簿へ足すのと同じ変化点で任命すると記名が拒否される

- 実行日: 2026-11-05
- 対象: 準拠テンプレート `template/` の作業ツリー(main の先端 `72a98bd`。WSL の /tmp/pc430 へ同期した写し)。知識ベースは複製済みのもの(`--kb keep`)
- 起点: `survey-375-1-internal.md` §6 の 1〜8
- 方針: リポジトリと template/ のファイルは書き換えていない。git の書き込みの操作もしていない。試験スクリプトと試作の複製は WSL の `/tmp/probe375/` に置いた(Windows 側の原本は scratchpad の `probe375/`)
- 表記: 「観測」は実行の出力そのもの。「推測」は観測からの解釈

## 実行環境とコマンド

```bash
# 同期(リポジトリ → /tmp/pc430、改行を LF へ)と、回帰スイートの scenarios だけの実行(基準)
wsl.exe -e bash -lc "bash /mnt/c/.../scratchpad/sync-wsl.sh && cd /tmp/pc430 && node scripts/regress/run.mjs --kb keep --only scenarios --out /tmp/probe375/out-scen"
# 試験スクリプト(場面のディレクトリ)を、版ごとに回帰スイートの実行役で流す
bash /mnt/c/.../scratchpad/probe375/run-probe.sh
#   中身: 試作の複製 tpl-a1・tpl-a2・tpl-a3 を作り(/tmp/pc430/template を cp -a して patch-a.cjs で改める)、
#   PROBE_TAG=<版> node scripts/regress/run.mjs --kb keep [--template <複製>] --suite /tmp/probe375/suite --out /tmp/probe375/out-probe-<版>
#   を current(試作前)・a1・a2・a3・p302 の5版で流す
# 場面ごとに版を並べる
node /mnt/c/.../scratchpad/probe375/cmp.mjs > /tmp/probe375/cmp.txt
```

- 試験スクリプト: `/tmp/probe375/suite/probe.mjs`。#376 の先例(`/tmp/probe376/suite/probe.mjs`)に倣い、回帰スイートの実行役 `run.mjs --suite` で流した。作業用の複製(`s`・`m2`)、止めた時計(2026-10-01T12:00:00Z)、偽の gh は回帰スイートと同じものを使う
- 基準点は scenarios.mjs の `base3` と同じ手順で作った(3名・MVP・CL0、名簿 山田・佐藤・鈴木と任命権者 `APPOINTER`、全席を記入、`git tag base3`)。違いは、Dupont と Gemini Sato にアカウント(`cdupont`・`gsato`)を持たせた点だけである
- 場面の一覧の宣言(`expected/scenes/probe.txt`)が無いため、run.mjs は最後に「失敗」と出す。場面はどの版でも完走した(21 場面、落ちた 0。場面の判定はすべて `check(label, true)` で、観測を `/tmp/probe375/result-<版>.json` へ書くことだけをしている)
- p302 の版は #376 の先例が作った読み取りの複製 `/tmp/probe376/tpl-p302`(テンプレート `ec8ecd6`)を使った。p302 は名簿の `accounts` を文字列で受け取るため、環境変数 `PROBE_STR_ACCOUNTS=1` で文字列へ切り替えた。p302 には `nameConfirmationProblems`・`nameOverrideDetails` の関数が無いため、比較の表の `NCP!` は「関数が無い」の印であり、問題の検出ではない

## 確認1: いまの版で、根の場面が理由1件だけで落ちること(§6-1)

### 回帰スイート(観測)

```bash
cd /tmp/pc430 && node scripts/regress/run.mjs --kb keep --only scenarios --out /tmp/probe375/out-scen
```

```text
  scenarios: exit 0 24s
  scenarios              場面  179 落ちた   0 印 3 (2026-10-01T12:00:00Z)
regress: すべて通った。結果: /tmp/probe375/out-scen
```

`scenarios.log` の該当行:

```text
ok   AI を示す語を含む氏名(人が確認した旨あり) → 反映  [落ちることを期待する印(#375、見直し 2026-12)]
ok   契約検査・構成書に上書きが表示される  [根に従属して落ちる(根: AI を示す語を含む氏名(人が確認した旨あり) → 反映、印 #375)]
ok   changeLog に上書きした氏名が残る  [根に従属して落ちる(根: AI を示す語を含む氏名(人が確認した旨あり) → 反映、印 #375)]
```

印の照合(`lib.mjs` の `reasonSetMismatch`)は、拒否の理由の件数が `match` の件数(1件)と同じで、その1件が `match` を含むときだけ通す。根が「落ちることを期待する印」で通ったことは、理由がちょうど1件であることを意味する。

### 試験スクリプトでの同じ入力(観測)

場面 R0(scenarios.mjs L395 と同じ入力。記名 山田 太郎)の、いまの版の拒否の全文:

```text
[エラー] この変化点は反映できません
  - 記名を受け付けられません: 技術判断者(Tech Lead) の責任者: "Claude Dupont" は モデル名または提供者名を含む。記名は自然人の氏名に限る。AI の名義を受け付けない(同じ語を含む実在の氏名の場合は、人が確認したうえで、名簿の該当者へ nameConfirmed: true を書く)
```

`reasons()` で取り出した理由は1件(上の [エラー] の1塊に、内訳の行が1行)。

**判定: 仮説は成り立った(観測)**。根の場面は `namingProblems` が出す1件だけで落ちる。ほかの拒否(任免の記名・氏名の確認の記名・本人の記名)は加わっていない。

## 確認2: 2つの変化点に分けた経路が、いまの版で通ること(§6-2)

場面 R1。基準点 `base3` から、次の2つの変化点を順に `generate-profile.mjs --change` へ渡した(各段で `--dry-run` の後に適用)。

```js
// (1) Dupont を確認つきで名簿へ足す。席は変えない
{ kind: 'accountable', summary: 'Dupont が加わった', people: [...PEOPLE3, { id: 'dupont', name: 'Claude Dupont', accounts: [cdupont], nameConfirmed: true }], decidedBy: '山田 太郎', reason: '氏名を確認した' }
// (2) 技術判断者へ任命
{ kind: 'accountable', summary: '技術判断者を任命', people: (同じ), seats: { 'tech-lead': { accountable: 'Claude Dupont' } }, decidedBy: '山田 太郎', reason: '技術判断者を任命' }
```

いまの版の観測:

| 段 | 結果 | 向き | 最後の記録の `nameConfirmations` | 最後の記録の `nameOverrides` | 出力の `[上書き]` 行 | 契約検査 | PROCESS-PROFILE.md の上書きの行 | `nameOverrideDetails` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (1) | 受け付け | `none` | `[{"id":"dupont"}]` | **`[]`** | **無し** | 通る。`::warning::名義の機械検査を人が上書きした: Claude Dupont` | あり | `[{"name":"Claude Dupont","how":"other"}]` |
| (2) | 受け付け | `appoint` | なし | `["Claude Dupont"]` | `[上書き] 名義の機械検査を人が上書きした: Claude Dupont` | 通る(同じ注意) | あり | 同上 |

- (2) の後の `namingProblems`・`nameConfirmationProblems`・`configIntegrityProblems`(記名・名義に関わる行)はどれも空
- 参考(R1b): (1) を記名なし(`decidedBy`・`reason` なし)で出すと、「氏名の確認(Claude Dupont)を含みます。決定した者の記名(decidedBy)と理由(reason)が要ります。…」の1件で拒否された

**判定: 仮説は成り立った(観測)**。案(b) の手順(前の変化点で確認してから任命する)は、いまの版で通る。契約検査・構成書・`changeLog` の `nameOverrides` も、任命の変化点では期待どおりに出る。

観測から加わった事実:

- **確認を記録する変化点そのものの記録は、`nameOverrides` が空で、出力に `[上書き]` の行が出ない**。同じ変化点の後の契約検査・構成書・`nameOverrideDetails` は上書きを表示する。つまり、確認の変化点の記録(`changeLog[].nameOverrides`)と、その時点の構成から導く表示とが食い違う。原因は根の場面と同じで、`generate-profile.mjs` の L5345(`[上書き]` の出力)と L5454(記録の `nameOverrides`)が、L5429 で足す記録より前の構成で `nameOverrides(config)` を評価するためである(コードを読んだ範囲。確認は 4 節の試作 a1 と a2 の差による)
- 推測: この食い違いは、案(a)・(b) のどちらを採っても残る。案(b) では確認の変化点が独立するため、むしろ常に現れる

## 確認3: 2つの変化点を同じ PR に入れたときの帰属の検査(§6-3)

`check-pr.mjs` の `decisionRecordFindings`(L631。ADR-0106 決定5 の PR の時点の検査)を、試験スクリプトから直接呼んだ。fixture は check-pr の試験のものではなく、場面 R1 の (1)(2) を適用した構成を PR の先頭(`headConfig`)、`base3` の構成を基底(`baseConfig`・`rosterConfig`)とした。ホスティングは渡さない(`hosting: null`。2件とも PR の中で足した記録なので、`current()` の PR の情報だけが使われる)。

```js
pr.decisionRecordFindings({ git: () => null, policyRef: 'main', pr: P, baseConfig: BASE3, headConfig: cfg(), rosterConfig: BASE3, hosting: null })
// P は次の3通り(number 7、head 'h1'、レビューは REST の形 { user: { login, id }, state, commit_id })
//   A: 作成 yamada-taro・承認 sato-hanako(先頭 h1)
//   B: 作成 yamada-taro・承認なし
//   C: 作成 suzuki-ichiro・承認 sato-hanako(山田のアカウントの操作なし)
```

観測(いまの版。試作 a1〜a3 でも同じ):

| PR | changeLog[2](名簿の変更。確認) | changeLog[3](任免) | errors |
| --- | --- | --- | --- |
| A | 帰属あり(`how: author`) | 帰属あり(`how: author`) | 0 |
| B | 帰属なし「PR #7 の作成者は記名者本人だが、記名者以外の人の承認(帰属の確認)が無い」 | 同じ | 2 |
| C | 帰属なし「決定の記名を入れた PR #7 の作成者(@suzuki-ichiro)・承認者(@sato-hanako)に、記名者 山田 太郎 のアカウントが無い」 | 同じ | 2 |

ラベルの全文(A): `D-0 の決定の記名 changeLog[2](accountable・—・名簿の変更、決定 山田 太郎)` と `D-0 の決定の記名 changeLog[3](accountable・任免の決定、決定 山田 太郎)`。

対照として、試作(a1〜a3)で根の場面 R0 を1つの変化点で受け付けた後に同じ呼び出しをすると、記録は changeLog[2] の1件で、A は帰属あり、B・C は errors 1 件だった。

**判定: 仮説は成り立った(観測)**。2つの変化点を1つの PR に入れると、2件の記録はそれぞれ照合されるが、照合に使うのは同じ PR(作成者・承認者)である。確認の記録が帰属を得る時点と、任命の記録が帰属を得る時点は同じになり、「前の変化点で確認した」ことは、確認が効力を持った後に使ったことを保証しない。1つの変化点にまとめても、帰属の要件(山田本人の操作と、山田以外の承認)は同じ1回の PR の操作で満たされ、弱まらない。

推測: 案(b) が「確認が効力を持った後に使う」ことを保証するには、確認の変化点を含む PR が基底ブランチへ入った後に任命の PR を出す、という手順を別に定める必要がある(内部調査 §5.3 の帰属の行のとおり)。この手順を機械が検査する箇所は、いまのテンプレートに無い(`decisionRecordFindings` は PR の中の記録の並びを問わない)。

## 案(a) の試作(§6-4〜7 の前提)

`/tmp/pc430/template` を `/tmp/probe375/tpl-a1`・`tpl-a2`・`tpl-a3` へ丸ごと複製し、`scratchpad/probe375/patch-a.cjs` で `scripts/init/generate-profile.mjs` だけを改めた(置換は各1件の一致を確かめてから行い、`node --check` を通した)。3段に分けたのは、仮の記録で照らす範囲(内部調査 §5.2 の範囲の論点、§5.4 の案(f))を段ごとに見るためである。

| 段 | 仮の記録つきの構成(`withThis()`)で照らす箇所 |
| --- | --- |
| a1 | L5058 の `namingProblems`(席の責任者・適合性確認の承認者・名簿)だけ |
| a2 | a1 + L5345 の出力 `[上書き]` と L5454 の記録の `nameOverrides` |
| a3 | a2 + L5069 の決定した者の記名と、L5224 の氏名の確認の記名の `nameProblems` |

仮の記録は、この変化点の入力の `decidedBy` と、`diffConfig` が作った `nameConfirmItems` の `id` だけを持つ(L5429 で実際に足す記録と同じ2つの値)。記名の正しさの検査(L5216〜5232 の本人の記名の拒否など)は改めていない。

a1 の差分(全文):

```diff
--- /tmp/pc430/template/scripts/init/generate-profile.mjs
+++ scripts/init/generate-profile.mjs
@@ -5055,7 +5055,9 @@
       }
     }
     // 記名の欄(名簿、席の責任者、適合性確認の承認者)。AI の名義と、名簿に無い名義を拒否する
-    for (const p of namingProblems(config)) refused.push(`記名を受け付けられません: ${p}`);
+    // probe375 案(a): この変化点で記名する氏名の確認(nameConfirmItems と decidedBy)を、仮の記録として載せた構成で照らす
+    const withThis = () => ({ ...config, changeLog: [...(config.changeLog ?? []), { decidedBy: change.decidedBy ?? null, nameConfirmations: (report.nameConfirmItems ?? []).map(({ id }) => ({ id })) }] });
+    for (const p of namingProblems(withThis())) refused.push(`記名を受け付けられません: ${p}`);
     // 離脱した人が責任者だった席。後任か、未記入かを、入力で示してもらう
     for (const s of config.seats) {
       if (s.accountable && !findPerson(config, s.accountable) && findPerson(prior, s.accountable)) {
```

a2 の差分は、a1 に次の2か所を足したもの(全文):

```diff
@@ -5342,7 +5344,7 @@
       console.log('[即時反映] 未達・逸脱・列挙に無い離脱の発生を含みます。決定ではないため、記名を待たずに反映します。未達のまま出荷するかどうかは、既存の規定によります(R1 の変更は標準 第7章 7.3 の例外承認。CL1 以上と規制業は不可)');
     }
     if (config.shipBlocked) console.log(`[出荷不可] ${config.shipBlocked.reason}`);
-    for (const n of nameOverrides(config)) console.log(`[上書き] 名義の機械検査を人が上書きした: ${n}`);
+    for (const n of nameOverrides(withThis())) console.log(`[上書き] 名義の機械検査を人が上書きした: ${n}`);
     for (const n of report.standby) console.log(`[協働のまま] ${n}`);
     for (const n of staleRules) console.log(`[要修正] 既存の${n}。この規則では委任は働きません。規則を改めるか、削除してください`);
     // 有効でない規則。席に有効な規則が残っていれば、席は委任のままで、その規則だけが働かない
@@ -5451,7 +5453,7 @@
         accountConfirmations: (report.accountConfirmItems ?? []).map(({ id, account }) => ({ id, account })),
         nameConfirmations: (report.nameConfirmItems ?? []).map(({ id }) => ({ id })),
         ruleApprovedBy: approvedNow.length ? change.ruleApprovedBy : null,
-        nameOverrides: nameOverrides(config),
+        nameOverrides: nameOverrides(withThis()),
         ruleApproval: approvedNow.length
           ? {
               approvedBy: change.ruleApprovedBy,
```

a3 の差分は、a2 に次の2か所を足したもの(全文):

```diff
@@ -5066,7 +5068,7 @@
       }
     }
     if (change.decidedBy) {
-      for (const p of nameProblems(config, change.decidedBy)) refused.push(`決定した者の記名を受け付けられません: ${p}`);
+      for (const p of nameProblems(withThis(), change.decidedBy)) refused.push(`決定した者の記名を受け付けられません: ${p}`);
     }
     // この変化点で出された適合性確認。実施は AI維持管理者の席の責任者、承認は当該の席の責任者に限る(第3章 3.4.2)
     for (const s of config.seats) {
@@ -5221,7 +5223,7 @@
             '記名できるのは、確認される本人以外の、人の名簿の人です。AI が決めてはなりません'
         );
       } else {
-        for (const p of nameProblems(config, change.decidedBy, { requireRoster: true })) refused.push(`氏名の確認の記名を受け付けられません: ${p}`);
+        for (const p of nameProblems(withThis(), change.decidedBy, { requireRoster: true })) refused.push(`氏名の確認の記名を受け付けられません: ${p}`);
         const by = personKey(config, change.decidedBy);
         // 体制の内の人が1名の名簿では、本人の記名を受け付ける(自己申告の氏名として記録し、開示する)
         const single = insiderCount(config) === 1;
```

複製の差分の原本は `/tmp/probe375/diff-a1.patch`・`diff-a2.patch`・`diff-a3.patch`(WSL)。

### 根の場面と分けた経路(観測)

| 場面 | p302 | いま | a1 | a2 | a3 |
| --- | --- | --- | --- | --- | --- |
| R0 根(記名 山田) | 受け付け。`nameOverrides` ["Claude Dupont"]、`[上書き]` 行あり | 拒否1件(確認1) | 受け付け。**`nameOverrides` []、`[上書き]` 行なし**。契約検査は通り上書きを表示、PROCESS-PROFILE.md に上書きの行あり | 受け付け。`nameOverrides` ["Claude Dupont"]、`[上書き]` 行あり、契約検査が通り上書きを表示、PROCESS-PROFILE.md に上書きの行あり、向き `appoint` | a2 と同じ |
| R1 (1) 確認だけ | 受け付け。`nameOverrides` ["Claude Dupont"] | 受け付け。`nameOverrides` [] | いまと同じ | 受け付け。`nameOverrides` ["Claude Dupont"]、`[上書き]` 行あり | a2 と同じ |
| R1 (2) 任命 | 受け付け | 受け付け | 受け付け | 受け付け | 受け付け |
| R1b 記名なしの確認 | **受け付け** | 拒否(記名が要る) | 拒否 | 拒否 | 拒否 |

- a1 では、根の場面は受け付けられるが、回帰の試験の根の期待(出力に「名義の機械検査を人が上書きした: Claude Dupont」)と連鎖の場面「changeLog に上書きした氏名が残る」は満たさない(観測した出力と記録の値からの判定。回帰スイートは a1 では流していない)
- 推測: 案(a) として回帰の試験の3場面を満たす最小の範囲は a2(`namingProblems` に加え、`[上書き]` の出力と記録の `nameOverrides`)である

## 確認4: 案(a) の試作で、自己確認の経路が開かないこと(§6-4)

同じ入力を5つの版で流した。理由の件数と、各理由の内訳の行の先頭を示す(`/tmp/probe375/cmp.txt` の抜粋)。

| 場面 | 入力(基準点 `base3` から1つの変化点) | いま | a1・a2・a3 |
| --- | --- | --- | --- |
| S-self | Dupont を確認つきで足し技術判断者へ。記名 `Claude Dupont`(本人。体制の内 4名) | 拒否5件: 技術判断者の責任者の名義 / 決定した者の記名の名義 / 氏名の確認の記名の名義 / 「Claude Dupont の氏名の確認を、本人の記名では確定できません」/ 任免の決定者でない | **同じ5件**(3段とも) |
| S-ai | 同じ入力。記名 `Claude Fable 5.1`(名簿に無い AI の名義) | 拒否6件: 責任者の名義 / 決定した者の名義・名簿に無い / 氏名の確認の記名の名義・名簿に無い / 任免の決定者でない | **同じ6件** |
| S-nonroster | 同じ入力。記名 `高橋 次郎`(名簿に無い) | 拒否4件: 責任者の名義 / 決定した者が名簿に無い / 氏名の確認の記名が名簿に無い / 任免の決定者でない | **同じ4件** |
| S-nosign | 同じ入力。記名なし | 拒否2件: 責任者の名義 / 氏名の確認に記名が要る | **同じ2件** |
| S-mutual | Dupont と Gemini Sato を確認つきで同時に足し、Dupont を技術判断者へ。記名 `Gemini Sato` | 拒否5件: 責任者の名義 / 決定した者の名義 / 氏名の確認の記名の名義 / 「Gemini Sato の氏名の確認を、本人の記名では確定できません」/ 任免の決定者でない | **同じ5件** |
| S-mutual2 | S-mutual に加え Gemini を AI運用担当者へ。記名 `Gemini Sato` | 拒否7件(S-mutual の5件に、AI運用担当者の責任者の名義と、その任免の決定者でない、の2件) | **同じ7件** |
| S-mutual4 | (1) Gemini を確認つきで足す(記名 山田。受け付け)→ (2) Gemini の記名で Dupont を確認つきで足し技術判断者へ | (2) 拒否2件: 技術判断者の責任者の名義 / 任免の決定者でない | **同じ2件**。Gemini の確認は有効(記名 山田)だが、Gemini の名義が AI を示す語を含むため、Gemini の記名は Dupont の確認として数えない(`confirmedNames` の `aiNameReason(e.decidedBy)`) |
| S-mutual3 | Dupont と Gemini を確認つきで同時に足し、両方を任命。記名 山田 | 拒否2件: 2人の責任者の名義 | **a1〜a3 で受け付け**。a2・a3 の `nameOverrides` は ["Claude Dupont","Gemini Sato"]。契約検査が通る |

1名の名簿(作業用の複製 `m2`、回答は 1〜2名・MVP・CL0):

| 場面 | 入力 | p302 | いま | a1 | a2・a3 |
| --- | --- | --- | --- | --- | --- |
| O-1 | 名簿を Dupont(確認つき)だけにし、全席を Dupont へ。記名 Dupont(本人) | 受け付け | 受け付け。契約検査に「本人の記名による確認です(自己申告の氏名。1名の体制のため受け付けています)…」 | 同じ | 同じ |
| O-2 | (1) 名簿 [山田]・全席 山田(記名 山田)→ (2) 同じ変化点で Dupont を確認つきで足し技術判断者へ(記名 山田。体制の内が2名になる) | (2) 受け付け | (2) **拒否1件**(根と同じ理由) | (2) 受け付け。`nameOverrides` [] | (2) 受け付け。`nameOverrides` ["Claude Dupont"] |

**判定: 仮説は成り立った(観測)**。試作 a1〜a3 のどの段でも、本人の記名・AI の名義の記名・名簿に無い者の記名・記名なし・AI を示す語を含む名義どうしの確認は、いまの版と同じ理由・同じ件数で拒否された。案(a) が受け付けに変えたのは、本人以外で AI の名義でない名簿の人(山田)が記名した場面(R0・S-mutual3・O-2・X-qual-split の (1))だけである。

観測から加わった事実:

- 本人の記名は、いまの版でも試作でも「本人の記名では確定できません」(L5228)のほかに、決定した者・氏名の確認の記名の名義の検査(L5069・L5224)でも拒否される。内部調査 §5.2 の「二重に塞がる」は、実際には 3 か所で塞がる。a3 でこの2か所を仮の記録で照らしても、本人の記名は `confirmedNames` が `self` とし、2名以上では効かないため、拒否は変わらない
- O-2 は、1名の名簿から2人目を足す変化点が、根と同じ形で拒否されることを示す。p302 では受け付けた。1名の体制が2人目に AI を示す語を含む氏名の人を迎える場面でも、いまの版は変化点を分けることを求める
- S-mutual3 の受け付けは、新しい自己確認の経路ではない。確認の記名者は山田で、Dupont と Gemini のどちらとも別人である

p302 の版での同じ場面(観測。参考):

| 場面 | p302 の結果 |
| --- | --- |
| S-self(本人の記名) | 拒否1件: 任免の決定者でない。**名義の検査では拒否されない**(旗だけで通した) |
| S-mutual・S-mutual2 | 拒否は任免の決定者でない行だけ(1件・2件) |
| S-ai・S-nonroster | 拒否(決定した者の記名の名義・名簿、任免の決定者) |
| S-nosign | 拒否1件「席の責任者の任免(または D-0 表1 の決定者の変更)を含みます。…決定した者の記名(decidedBy)と理由(reason)が要ります」(当時の文言。`reasons()` は内訳の行を持たないため、比較の表の件数は 0 と出た) |
| X-decider(確認される Dupont 本人を決定した者に書き、任命なし。体制の内 4名) | **受け付け**。`nameOverrides` ["Claude Dupont"] |
| R1b(記名なしの確認) | **受け付け** |

- p302 では、本人が自分の確認を自分の記名で通す経路(X-decider)と、記名なしの確認(R1b)が開いていた。#296 の付記(`4af67c5`)は、この2つを塞いだ(いまの版と試作 a1〜a3 はどちらも拒否する)。試作は、付記が塞いだ経路を開け直していない
- p302 の check-pr.mjs には `decisionRecordFindings` が無い(試験スクリプトの呼び出しは TypeError)。確認3 の帰属の検査は p302 の後(#428)に入ったものである

## 確認6: 決定した者・適合性確認の検査を、仮の記録で照らすかで結果が変わる入力(§6-6)

| 場面 | 入力 | p302 | いま | a1・a2 | a3 |
| --- | --- | --- | --- | --- | --- |
| X-decider | Dupont を確認つきで足し、決定した者を `Claude Dupont`(本人)にする。席は変えない | 受け付け | 拒否3件: 決定した者の記名の名義 / 氏名の確認の記名の名義 / 本人の記名では確定できない | 同じ3件 | **同じ3件** |
| X-qual-accountable | 同じ変化点で Dupont を確認つきで足し、開発者(検証者)の責任者にして委任・適合性確認(承認 Dupont)を出す(kind accountable、記名 山田) | 受け付け | 拒否4件: 委任にできない(責任者の記名) / 開発者(検証者)の責任者の名義 / 適合性確認の承認者の名義 / 適合性確認の記録(承認者の名義) | **拒否2件**: 委任にできない(責任者の記名) / 適合性確認の記録(承認者の名義) | a1・a2 と同じ2件 |
| X-qual-mode | 同じ入力を kind mode で | 受け付け | 4件(同上) | 2件(同上) | 2件(同上) |
| X-qual-split | (1) Dupont を確認つきで足し開発者(検証者)へ(記名 山田)→ (2) kind mode で委任・適合性確認(承認 Dupont) | (1)(2) 受け付け | (1) 拒否1件(根と同じ理由) | (1) 受け付け、(2) **拒否1件**: 委任にできない(責任者の記名) | a1・a2 と同じ |
| X-qual-3step | (1) Dupont を確認つきで足す(記名 山田)→ (2) 開発者(検証者)へ任命 → (3) kind mode で委任・適合性確認(承認 Dupont) | (1)〜(3) 受け付け | (1)(2) 受け付け、(3) **拒否1件** | いまと同じ | いまと同じ |
| X-qual-3step-ctrl(対照) | 開発者(検証者)は山田のまま、kind mode で委任・適合性確認(承認 山田) | 受け付け | 受け付け | 受け付け | 受け付け |

X-qual-3step の (3) の、いまの版の拒否の全文:

```text
[エラー] この変化点は反映できません
  - 開発者(検証者) を 委任 にできません: 責任者の記名を受け付けられない("Claude Dupont" は モデル名または提供者名を含む。記名は自然人の氏名に限る。AI の名義を受け付けない(同じ語を含む実在の氏名の場合は、人が確認したうえで、名簿の該当者へ nameConfirmed: true を書く))。協働までは宣言できます
```

- a2 と a3 の結果は、21 場面のすべてで同一だった(結果の JSON を場面ごとに比べて差 0)。L5069(決定した者)と L5224(氏名の確認の記名)を仮の記録で照らしても、結果が変わる入力は見つからなかった。理由は、仮の記録で効くのは本人以外の記名に限られ(`confirmedNames`)、本人を決定した者に書く入力は2名以上では `self` のまま効かないためである(1名の名簿では、いまも `unrecorded`・`self` が効く)
- 一方、**適合性確認の経路には、仮の記録が届かない検査が2つある**(観測とコードの読みの突き合わせ):
  1. `clampSeats`(generate-profile.mjs L697〜。L800 から呼ぶ)は、`const ctx = { seats, people, delegation, governance }`(L700)で `nameProblems` を呼ぶ(L714・L719・L721)。この `ctx` は `changeLog` を持たないため、`confirmedNames` は常に空になり、2名以上の名簿では AI を示す語を含む氏名の確認は `invalid` になる。**前の変化点で本人以外が確認した記録があっても、その人を責任者とする席を委任にできない**(X-qual-3step の (3)。p302 では受け付けた)
  2. この変化点で出された適合性確認の検査(L5071〜5076 の `qualificationAuthorityProblems(config, …)`)は、記録を足す前の `config` で照らす。同じ変化点で確認した人を承認者に書くと拒否される(X-qual-accountable の a1〜a3 に残る2件目)

**判定: 仮説の前段(決定した者の検査は仮の記録で照らしても結果が変わらない)は成り立った(観測)**。後段の「適合性確認の実施者・承認者」については、仮説が想定しなかった事実が出た。`clampSeats` の検査は、同じ変化点の確認だけでなく、前の変化点の確認も数えない。これは評価の時点の問題ではなく、検査に渡す構成が記録を持たない問題であり、案(a)・(b) のどちらを採っても残る。

推測:

- `clampSeats` の件は #296 の付記(`aiNameBlocked` を記録で判定するよう改めた変更)で生じた、根の場面とは別の回帰の候補である。p302 は旗だけで通したため、`ctx` が記録を持たなくても結果に響かなかった。根の場面と同じ構図(付記が判定を記録へ寄せたため、記録を持たない評価の位置が初めて結果を左右した)である
- 回帰の試験は、AI を示す語を含む氏名の人を委任の席の責任者にする場面を持たない(scenarios.mjs の「F. 名義の機械検査の上書き」は技術判断者の任命だけ)。そのためこの件は回帰の試験に現れていない
- 案(a) を採る場合でも、`clampSeats` へ渡す構成に記録を持たせる修正は別に要る。案(b) を採る場合は、「前の変化点で確認してから使う」手順が委任の席では成り立たない(手順を持たない)

## 確認7: 出荷の証跡の集約と契約検査が、同じ変化点で確認した記録を数えること(§6-7)

受け付けた各段の後に、試験スクリプトから次を実行した。

- 契約検査: `node scripts/gate/verify-gate-contract.mjs`(作業用の複製の中)
- 集約の検査: 複製の `scripts/gate/config.mjs` を import し、適用後の `process.config.json` に対して `configIntegrityProblems`(出荷の証跡の集約が呼ぶ。L1562。記名・名義・`nameConfirmed` を含む行だけを抜いた)・`namingProblems`・`nameConfirmationProblems`・`nameOverrideDetails` を呼ぶ
- 構成書: `PROCESS-PROFILE.md` に「名義の機械検査を人が上書きした: Claude Dupont」があるか

試作 a2 の観測(a1・a3 も、`nameOverrides` の値を除いて同じ):

| 場面・段 | 契約検査 | 注意の行 | `namingProblems` | `nameConfirmationProblems` | `configIntegrityProblems`(名義の行) | `nameOverrideDetails` | PROCESS-PROFILE.md |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R0(同じ変化点で確認し任命) | 通る | `::warning::名義の機械検査を人が上書きした: Claude Dupont` | [] | [] | [] | Claude Dupont / `other` | 上書きの行あり |
| R1 (1)・(2)(分けた経路) | 通る | 同上 | [] | [] | [] | 同上 | あり |
| S-mutual3(2名を同時に確認し任命、記名 山田) | 通る | Dupont と Gemini の2行 | [] | [] | [] | 2名とも `other` | あり |
| X-qual-split (1)・X-qual-3step (1)(2) | 通る | Dupont の行 | [] | [] | [] | Dupont / `other` | あり |

**判定: 仮説は成り立った(観測)**。契約検査(`nameConfirmationProblems` を含む)と集約側の検査は、記録が足された後の構成を読むため、同じ変化点で確認した記録を `other`(本人以外の記名)として数える。集約・契約検査の側には評価の時点の問題は無い。

補足(観測): 構成から導く表示(契約検査・構成書・`nameOverrideDetails`)は a1 でも正しく出る。a1 で欠けるのは、変化点の出力の `[上書き]` の行と、その変化点の記録の `nameOverrides` だけである(4 節の表)。記録の `nameOverrides` は、契約検査が過去の記録の記名を照らすときに使う(verify-gate-contract.mjs L636「人が上書きした名義は、その時点の記録(nameOverrides)か、現在の名簿で確かめる」)。

## 確認8: p302 と現行で、根の場面の出力の違いが評価の時点だけに由来すること(§6-8)

試験スクリプトで、根の場面 R0 の適用の出力の全文を版ごとに `/tmp/probe375/r0-out-<版>.txt` へ書き、行の集合で比べた(16 桁以上の16進と ISO の時刻を置き換えてから `sort -u` で比較)。

```bash
norm(){ sed -E 's/[0-9a-f]{16,}/<hash>/g; s/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.]+Z/<time>/g' $1 | sort -u; }
diff <(norm r0-out-p302.txt) <(norm r0-out-a2.txt)
diff <(norm r0-out-a2.txt) <(norm r0-out-current.txt)
```

### 試作 a2 → いまの版(観測)

いまの版にだけある行は、拒否の2行(`[エラー] この変化点は反映できません` と、根の理由の1行)だけだった。a2 にだけある行は、受け付けた後に出る行(次の一手の案内、`[上書き] 名義の機械検査を人が上書きした: Claude Dupont`、`wrote process.config.json / PROCESS-PROFILE.md` などの書き出し、構成の要約)だけだった。差分の報告(構成の差分・兼務・任免・注記)の行は、両版で同一である。

### p302 → 試作 a2(観測)

どちらも受け付ける。差は次の行だけだった。

| 差 | 由来(推測を含む) |
| --- | --- |
| a2 にだけ `- 人の名簿: Claude Dupont の氏名を実在の人の氏名として確認した(名義の機械検査の上書き)` | `diffConfig` の `nameConfirmItems`(`4af67c5` で新設。内部調査 §2.4)。観測した行の文言がその箇所の文と一致する |
| 見出し「未達の発生・逸脱の発生」→「…・列挙に無い離脱の発生」、集計の「逸脱として記録した兼務」→「記録した成立しない兼務禁止(逸脱の閉じた列挙に無い)」 | 兼務の扱いの改め(本件と関係しない文言の変更。推測) |
| a2 に「注記(兼務禁止ではない組…非推奨の兼務)」、注記の件数 9 → 11 | 非推奨の兼務の注記の追加(本件と関係しない。推測) |
| エージェント用ガードの案内の文言、判定記録・記録用ブランチの行 | ADR-0050 と記録用ブランチの変更(本件と関係しない。推測) |

`research/319-deliberation/port-results.md` L521〜559 の p302 との差(移した版のまま流した記録)も、同じ構成である。いまの版の側に、`nameConfirmItems` の行と拒否の2行と、兼務・注記の文言の差がある。拒否の理由は1件だけで、ほかの拒否の行は無い。

**判定: 仮説は成り立った(観測)**。いまの版の根の場面の拒否は、L5058 を仮の記録つきの構成で照らすだけ(a1・a2)で消え、差分の報告の行は1行も変わらない。p302 との差のうち受け付けの可否に関わるのは評価の時点だけで、残りは `nameConfirmItems` の行(付記が足した表示)と、本件と関係しない文言の変更である。#430 の数値の識別子は、出力の差に現れなかった(試験スクリプトは今の版では `{ login, id }`、p302 では文字列の `accounts` を渡している)。

## 確認5: 案(a) の試作で、既存の試験が通ること(§6-5)

```bash
bash /mnt/c/.../scratchpad/probe375/run-suite.sh
#   1) tpl-base(試作前の写し)・tpl-a2・tpl-a3 をそれぞれ写し(tt-<版>)、scripts/gate/test-*.mjs を1本ずつ node で流す(test-results.mjs を除く 37 本)
#   2) cd /tmp/pc430 && node scripts/regress/run.mjs --kb keep --template /tmp/probe375/tpl-a2(と tpl-a3) --out /tmp/probe375/out-regress-<版>
```

`npm run check` は流していない(リポジトリの外の試作の複製では、本体の検査の多くが対象を持たないため)。テンプレートの試験一式と回帰スイート全体で代えた。

### テンプレートの試験(観測)

| 版 | 落ちた試験 |
| --- | --- |
| 試作前(tpl-base) | `test-adoption.mjs`(`git merge -q --allow-unrelated-histories …` の失敗で例外)・`test-context-refs.mjs`(「参照切れの検査の試験: 1 件の失敗」。`.claude/skills/graft/SKILL.md` が無い) |
| a2 | 同じ2本 |
| a3 | 同じ2本 |

37 本の終了コードは、3版で同一だった(`diff` で差なし)。`test-roster-rules.mjs` は3版とも通った。

推測: 落ちた2本は試作と関係しない環境の要因である。同期の写し(sync-wsl.sh)は `.git` と `graft` を除いて複製するため、git の履歴を要する試験と、graft のスキルの所在を引く試験が落ちる。

### 回帰スイート全体(観測)

a2・a3 とも、22 本のうち落ちたのは scenarios の1場面だけだった。

```text
  scenarios              場面  179 落ちた   1 印 3 (2026-10-01T12:00:00Z)
regress: 失敗
  - scenarios: 終了コード 1(落ちた場面 1)
```

```text
FAIL AI を示す語を含む氏名(人が確認した旨あり) → 反映  [予期せず通った(落ちることを期待する印 #375)]
ok   契約検査・構成書に上書きが表示される
ok   changeLog に上書きした氏名が残る
```

ほかの 21 本(acquire・adjust・clock・matrix-sweep と sweep-1〜4・new・performer-account・replay・s5-init-pr・stages・t288・t288b・trial・tz・unit・v3・v3b・verify-n)は落ちた 0。matrix-sweep の #376 の印2件は、いまの版と同じく「落ちることを期待する印」で通った。

**判定: 仮説は成り立った(観測)**。評価の時点を変えても、氏名の確認以外の記名の検査(席の責任者・適合性確認の承認者・決定した者・任免)の結果は、既存の試験と回帰スイートの範囲で変わらない。落ちたのは根の場面の印だけで、これは案(a) を採ったときに印を外す(内部調査 §5.2「回帰の試験」)対象そのものである。連鎖の2場面は、根が通ったため条件どおりに判定され、通った。a1 は回帰スイートで流していないが、4 節の観測から、連鎖の「changeLog に上書きした氏名が残る」と根の期待の語(出力の上書きの行)を満たさない見込みである(推測)。

## まとめ: 内部調査 §6 の仮説の判定

| # | 内部調査の仮説 | 判定 | 根拠 |
| --- | --- | --- | --- |
| 1 | 根の場面は理由1件だけで落ちる | 成り立った(観測) | 回帰スイートの印の照合と、試験スクリプトの理由の全文 |
| 2 | 2つの変化点に分けた経路は、いまの版で通る | 成り立った(観測) | R1。ただし確認の変化点の記録の `nameOverrides` は空、`[上書き]` 行も出ない |
| 3 | 同じ PR に入れた2件の記録は、同じ PR で照合され、前後の保証を作らない | 成り立った(観測) | `decisionRecordFindings` が2件とも同じ PR の作成者・承認者で帰属を判定 |
| 4 | 案(a) は自己確認の経路を開かない | 成り立った(観測) | 本人・AI の名義・名簿外・記名なし・AI を示す語の名義どうしの確認は、試作でもいまと同じ理由・件数で拒否 |
| 5 | 案(a) は既存の試験を変えない | 成り立った(観測) | テンプレートの試験 37 本の結果が同一。回帰スイートは根の印の「予期せず通った」1件だけ |
| 6 | 決定した者・承認者の検査の範囲で、結果が変わる入力があるか | 前段は成り立った。後段で想定外の事実(観測) | a2 と a3 は全場面で同一。ただし `clampSeats`(L700 の `ctx` が `changeLog` を持たない)と L5073 の適合性確認の検査は仮の記録が届かず、`clampSeats` は前の変化点の確認も数えない(X-qual-3step) |
| 7 | 集約・契約検査には評価の時点の問題が無い | 成り立った(観測) | 適用後の構成で `other` と数え、契約検査が通る |
| 8 | p302 との出力の差は評価の時点だけに由来する | 成り立った(観測) | 差分の報告の行は a2 といまで同一。p302 との差は `nameConfirmItems` の行と無関係の文言 |

内部調査に無かった、実行で分かったこと(観測):

1. **確認の変化点の記録の `nameOverrides` と `[上書き]` の出力が、その変化点の確認を数えない**(L5345・L5454)。分けた経路(案(b))でも常に現れる。案(a) で回帰の試験の3場面を満たすには、L5058 に加えてこの2か所も仮の記録で照らす必要がある(a1 では足りず a2 で足りた)
2. **AI を示す語を含む氏名の人を、委任の席の責任者にできない**。`clampSeats` の `ctx`(generate-profile.mjs L700)が `changeLog` を持たないため、前の変化点で本人以外が確認した記録があっても `invalid` になる。p302 では受け付けた。根の場面と同じ構図の、別の回帰の候補である。案(a)・(b) のどちらでも残り、案(b) の手順は委任の席では成り立たない
3. 1名の名簿から、AI を示す語を含む氏名の2人目を同じ変化点で足して任命する場面(O-2)も、根と同じ理由で拒否される。p302 と試作は受け付けた
4. p302 では、本人を決定した者に書いて自分の確認を通す経路(X-decider)と、記名なしの確認(R1b)が開いていた。#296 の付記はこれを塞ぎ、試作はそれを開け直していない

試験していないこと:

- `npm run check` 全体(試作はリポジトリの外の複製のため)
- `clampSeats` に記録を持たせる修正の試作と、その回帰
- 出荷の証跡の集約のスクリプト(`aggregate-evidence.mjs`)そのものの実行(`configIntegrityProblems` を直接呼んで代えた)
- アカウント名の確認(`accountsConfirmed`)を同じ変化点で行う場面

成果物の所在(WSL): 試験スクリプト `/tmp/probe375/suite/probe.mjs`、試作の差分 `/tmp/probe375/diff-a1.patch`・`diff-a2.patch`・`diff-a3.patch`、試作の複製 `/tmp/probe375/tpl-a1`〜`tpl-a3`、結果 `/tmp/probe375/result-<版>.json`(版 = p302・current・a1・a2・a3)、場面ごとの比較 `/tmp/probe375/cmp.txt`、根の出力 `/tmp/probe375/r0-out-<版>.txt`、テンプレートの試験の結果 `/tmp/probe375/tests-<版>.txt`、回帰スイートの結果 `/tmp/probe375/out-regress-a2/`・`out-regress-a3/`。Windows 側の原本は scratchpad の `probe375/`(probe.mjs・patch-a.cjs・run-probe.sh・run-suite.sh・cmp.mjs・summ.mjs)。
