# 束 B20 独立の突合 1巡目の所見への議長の裁定の案

- 日付: 2026-11-18。対象: 本体 `2614ec8b`、template `3ba7481`
- 入力: `research/355-deliberation/b20-review-round1.md`(F-01〜F-13、変異 12 件)、`research/448-deliberation/b20-review-round1.md`(R1-01〜R1-17、変異 17 件)、`b20-owner-answers.md`
- 探針はすべて一時の写しで行った。実装のファイルは変更していない

## 0. 結論

| 区分 | 件数 | ID |
| --- | --- | --- |
| 採る | 29 | F-01〜F-13(F-02・F-08 は 1 節にまとめる)、R1-01〜R1-09、R1-11〜R1-17 |
| 開示で閉じる | 1 | R1-10 |

採る所見のうち、次の部分は採らない: F-08 の案 A(種類を問わず止める)、R1-01 の禁止語、R1-02 の対象の照合(7 節)、R1-07 のトレーラの機械の検査、R1-12 の旧い D-0 の受け入れ。

- **IMPL-0738 は所有者の決定により案 B とする**。本裁定の 1 節は、`b20-decision-heavy.md` 2 節と ADR-0218 決定1・3 の「未達の種類を問わず」を置き換える
- **F-07 の原因を実行で確定した**。実装は #434 を壊していない。試験の入力を直す(2 節)
- **所有者へ上げる点は 1 つ**(7 節)。既定の動きを決めてあるので、回答を待たずに実装へ進める

## 1. IMPL-0738(F-02・F-08)案 B の実装

### 1.1 止める未達の範囲

| `gate` の値 | 未達の中身 | 扱い | 理由 |
| --- | --- | --- | --- |
| `g2` | 価値責任者を置かない委託(様式 08 の「置かない」。IMPL-0755) | **止める** | 要件を合意する人の確認が無い。所有者の回答が名指す |
| `g6` | 作成を指示した本人以外の確認者を置けない(`detectUnmet`) | **止める** | 人の確認の未達そのもの |
| `provisional-cosign` | 暫定任命の期間中の判定に、確認済みの者の併記が無い(IMPL-0638) | **止める**(下記) | 人の確認の未達である |
| `g3` | スタックが未確定で PoC でない | **開示だけ** | 体制に由来しない。所有者の回答が名指す |
| 上記以外の値 | 手書きの構成にだけ現れる | **止める** | 現行の動きを保つ。分類できないものを緩める側へ倒さない |

評価者の段の未達は、この表の外の既存の経路(`clJudgment.shipBlocking`)が既に欠落にする。実装の担当は、独立した安全性の評価の未達(`aggregate-evidence.mjs` 2984〜3060 行)も欠落に届くことを確かめる。届かないときは実装せず議長へ戻す。

### 1.2 IMPL-0638 の裁定: 止める側に入れる

- **人の確認の未達に当たる**。第3章 3.4.1 は「当該ロールの判定は単独で確定させない。確認済みの者による併記を求める」「併記を置けない場合は、その判定を未達として表示する」と定める。併記は、確認済みの人による確認そのものである
- **新しい義務ではない**。条文が既に「未達」と定め、F-08 も人の確認の未達は既存の条文の読みと認めた
- ADR-0217 決定11 の「止めない」は同じ束の決定で、未公開である(`origin/main` に ADR-0216〜0222 は無い)。本文を改める
- **止めるのは、出荷の範囲の中の判定に限る**。現行の `provisionalGaps` は全記録を見る。範囲を絞らないと、過去の出荷の判定で永久に止まる
- 期間が読めない行(`unconfirmed`)は、現行のとおり表示だけとする。未達と確定していない
- 解く道: 確認済みの者の併記を置いた判定記録を起こし直す

### 1.3 実装(`template/scripts/gate/config.mjs`)

範囲の列挙はこの定数 1 か所に置く。

```js
// IMPL-0738: 止める未達の範囲の唯一の所在(第8章 テーラリングの表。ADR-0218)
export const UNMET_SHIP_SCOPE = Object.freeze({
  g2: 'stop',                  // 価値責任者を置かない委託
  g6: 'stop',                  // 独立した人の確認者を置けない
  'provisional-cosign': 'stop', // 暫定任命の判定の併記が無い
  g3: 'disclose',              // 体制に由来しない。開示の表示にとどめる
});
export const unmetStopsShip = (u) => UNMET_SHIP_SCOPE[u?.gate] !== 'disclose';

/** 開示に出す未達。構成の unmet[] と、回答とスタックから導き直した G-3 の和。CL に依らない */
export function derivedUnmet(config) {
  const out = [...(config?.unmet ?? [])];
  if (g3UnmetCondition(config?.answers ?? {}, config?.adapters?.stack ?? 'none') && !out.some((u) => u.gate === 'g3')) out.push(g3UnmetEntry());
  return out;
}

export function unmetShipBlockers(config, { extra = [] } = {}) {
  const a = config?.answers ?? {};
  const applies = ['cl1', 'cl2', 'cl3'].includes(a['q-criticality']) || a['q-quality'] === 'quality-regulated';
  return applies ? [...derivedUnmet(config), ...extra].filter(unmetStopsShip) : [];
}
```

| 所在 | 変更 |
| --- | --- |
| `config.mjs` の `unmetShipGaps(config, opts)` | `opts` を `unmetShipBlockers` へ渡す。文を「CL1 以上の案件と規制業の案件は、人の確認の未達を解くまで出荷しません」へ改める。3459 行の見出しの注釈も改める |
| `config.mjs` 288 行(適合の主張の導出) | `config.unmet` を `derivedUnmet(config)` へ替える |
| `aggregate-evidence.mjs` 3269 行 | `unmetShipGaps` の呼び出しを消す |
| `aggregate-evidence.mjs` 3787 行 | 開示の `unmet` の元を `derivedUnmet(config)` へ替え、写す欄に `howToResolve` を足す(欠落の文が解き方を読むため)。**手書きの `unmet: []` で G-3 が開示から消える穴を塞ぐ**。止めなくなる以上、開示が唯一の統制になるため必須である |
| `aggregate-evidence.mjs` 3797 行 | 注釈の「欠落には数えない」を「CL0 で規制業でない案件は表示だけ。CL1 以上と規制業は IMPL-0738 が欠落に数える」へ改める。G-2 の項目に `howToResolve` を足す |
| `aggregate-evidence.mjs` 4839 行 | `records` の各件に `inRange: !recordsInRange \|\| recordsInRange.has(r.file)` を足す |
| `aggregate-evidence.mjs` 4852 行の直後 | 下の呼び出しを置く。`gaps` を読む最初の行(5440 行)より前である |
| `judgement-records.mjs` の `provisionalGaps` | `unmet` の各件へ `inRange` を写す |
| `judgement-records.mjs` の `provisionalUnmetText` | 「(止めない)」を消し、「CL1 以上と規制業は範囲の中の未達で出荷を止める」を足す |

```js
const cosign = judgementRecords.provisionalUnmetItems.filter((u) => u.inRange).map((u) => ({
  gate: 'provisional-cosign',
  label: `暫定任命の判定の併記(${u.file})`,
  reason: `${u.role}: ${u.why}`,
  howToResolve: ['確認済みの者の併記を置いた判定記録を起こし直す(第3章 3.4.1)'],
}));
for (const g of unmetShipGaps(config, { extra: [...unmet.filter((u) => u.gate === 'g2'), ...cosign] })) gaps.push(g);
```

`judgementRecords` の戻り値に `provisionalUnmetItems: provisional.unmet` を足す。

### 1.4 対の試験(`test-aggregate-records.mjs` の IMPL-0738 の塊を書き換える)

| 目印 | 入力 | 期待 |
| --- | --- | --- |
| `IMPL-0738:ng` | CL1 × G-6 未達 | 欠落 1 件。文に未達の名と解き方の先頭 |
| `IMPL-0738:ng` | CL0 × 規制業 × G-6 未達 | 欠落 |
| `IMPL-0738:ng` | CL1 × 委託 × 「置かない」 / 規制業 × 委託 × 「置かない」 | どちらも欠落(軽の裁定 3 節の申し送り) |
| `IMPL-0738:ng` | CL1 × 範囲の中の判定に併記なし | 欠落 |
| `IMPL-0738:ng` | CL1 × 表に無い `gate` の値 | 欠落 |
| `IMPL-0738:ok` | **CL1 × G-3 未達** | **欠落 0 件。開示の未達に G-3 が出る** |
| `IMPL-0738:ok` | **CL0 × 規制業 × G-3 未達** | **欠落 0 件。開示に G-3 が出る** |
| `IMPL-0738:ok` | **CL1 × 手で `unmet: []`・`g3: omitted`・スタック未確定** | **欠落 0 件。`derivedUnmet` が G-3 を返し、開示に出る** |
| `IMPL-0738:ok` | CL0 × 標準 × G-2 未達 / 併記なし | 欠落なし。開示に表示 |
| `IMPL-0738:ok` | CL1 × 範囲の外の判定に併記なし | 欠落なし |
| `IMPL-0738:ok` | CL1 × 併記の期間が読めない | 欠落なし。「確認できない」と表示 |

### 1.5 標準と ADR の改訂(すべて未公開なので本文を直す)

**`tailoring-guide.md` の表(116〜119 行)**

| 未達のまま出荷する対象 | 扱う規定 |
| --- | --- |
| R1 の変更(次の行で出荷しない未達を除く) | 第7章 7.3 の例外承認を要する |
| CL1 以上の案件、および規制業の案件の、人の確認の未達(独立レビュー、価値責任者を置かない委託の要件合意、暫定任命の判定の併記、評価者の段) | 未達を解くまで出荷しない。例外承認は未達を解かない。体制の縮小による未達は、軸E「人員が足りない場合」の選択肢による |
| 上記以外(CL1 以上と規制業の、体制に由来しない未達を含む) | 未達を保証の開示へ表示し、リリース決裁(G-8)で受容を記名する |

R1 の行の「CL0 で規制業でない案件」の限定は外す。本束が足した限定で、案 B では G-3 未達の R1 の変更の扱いが CL で割れるためである。

**IMPL-0738 の note**

> 未達のまま出荷する対象ごとの扱い。CL1 以上の案件と規制業の案件は、人の確認の未達(G-2 の価値責任者を置かない委託、G-6、暫定任命の判定の併記)を、出荷の証跡の集約の記載の欠落に数える。範囲の列挙は config.mjs の UNMET_SHIP_SCOPE の 1 か所に置く。G-3 など体制に由来しない未達は、CL1 以上でも止めず、保証の開示へ表示して G-8 で受容を記名する。開示の未達は構成の unmet[] と導き直した G-3 の和を取るので、手で unmet を空にしても表示は消えない。止まるのは出荷判定(集約の exit 1)で、マージは止めない(IMPL-0769 と同じ強さ)。確かめる者: 出荷判定者(集約の記載の欠落を読むとき)

**EV-0331**

> **対象**: CL1 以上と規制業で、人の確認の未達だけを止め、体制に由来しない未達(G-3)は開示にとどめる判断。
> **根拠の水準**: E0(なし)。
> **差し替え条件**: 止まった件数と解消に要した時間、G-3 未達のまま出荷した件数とその後の欠陥の観測。
>
> 実環境で止まった案件はありません。CL1 以上でも、G-3 が未達のまま G-8 の受容で出荷できる状態が残ります。

**ADR-0218**(ファイル名を `0218-b20-ship-block-on-human-confirmation-unmet-and-stacked-layer-approval.md` へ、題を「B20 CL1 以上と規制業は人の確認の未達で出荷を止め、層の合わさりの承認は数えない」へ改める。他のファイルからこの slug への参照は無い)

| 箇所 | 新しい文 |
| --- | --- |
| 決定1 | CL1 以上の案件と規制業の案件は、人の確認の未達を集約の記載の欠落に数える。解く道は未達の解消だけとする。G-3 など体制に由来しない未達は止めず、開示と G-8 の受容で出荷できる。CL0 で規制業でない案件は、現行のとおり開示と G-8 の受容で出荷できる |
| 決定2 | 止める未達の範囲は `config.mjs` の `UNMET_SHIP_SCOPE` の 1 か所で列挙する。開示の未達は、構成の `unmet[]` と、回答とスタックから導き直した G-3 の和とする(`derivedUnmet`)。構成の手書きで開示から消せない |
| 決定3 | 止まるのは出荷判定(集約の exit 1)で、マージは止めない(IMPL-0769 と同じ強さ)。人の確認の未達を止めることは第8章の表の既存の定めの実装であり、新しい義務を足さない。例外承認は未達を解かない(第7章 7.3) |
| 課さないと決めたこと(足す) | **CL1 以上と規制業でも、G-3 の未達では出荷を止めない。スタックが未確定のまま G-8 の受容で出荷できる状態が残る**。所有者の決定(2026-11-18)による |
| 検討した選択肢(足す) | 案 A「未達の種類を問わず止める」: 体制に由来しない未達まで止めることは既存の条文の読みを超え、新しい義務になる(独立の突合 F-08)。所有者が採らないと決めた |
| 検討した選択肢(消す) | 「未達を人員由来に限る(規格)」「条文が名指す未達だけを止める(弁護)」の行は、採らない理由が案 B と矛盾するので、「人の確認の未達に限る案を採った」旨へ改める |
| 影響 | 1 行目を「CL1 以上と規制業の採用者は、人の確認の未達が残ると出荷の証跡の集約が止まる。スタック未確定(G-3)では止まらず、開示に出る」へ改める。「確かめていない点」の契約検査の行は、「契約検査は手書きの構成を通す。開示は導き直した G-3 を出す」へ改める |

ほかに次を合わせて直す。

- `assurance-case.md` 910 行: 「CL1 以上の案件と規制業の案件の未達は」を「CL1 以上の案件と規制業の案件の、人の確認の未達は」へ
- ADR-0217 決定11: 「止めない」を「CL0 で規制業でない案件は止めない。CL1 以上と規制業は、出荷の範囲の中の未達を ADR-0218 により欠落に数える」へ
- IMPL-0638 の note の「(止めない)」、IMPL-0755 の note の「欠落には数えない」を同じ趣旨へ
- 台帳: `npm run evidence:write`・`npm run impl:write`

## 2. F-07 の原因の確定

**裁定: 試験の入力を直す。実装は既存の決定(#434)を壊していない。**

| 確かめたこと | 結果 |
| --- | --- |
| 改行を LF にした clone の現状 | NG 10 件、exit 1 |
| 失敗の文 | `標準変更カタログ: D-0 表10 の F.2 の Q1 を「いいえ」と読めない…変更種別の登録は L3 の適用であり、止める案件では登録しない`(`capRefusal`) |
| 試験の D-0 | 様式の写しのままで、Q1 が未記入である |
| 同じ写しで D-0 の Q1 を「いいえ」にした場合 | **42 件すべて通過、exit 0** |

- Q1 を読めないときに登録を止めるのは、重の裁定 5 節の決定どおりである。#434 の判定の論理は変えていない
- 同じコミットは `test-ai-free-practice.mjs` と `test-check-delegation.mjs` の入力を直したが、この試験を直し忘れた

**直し方**: `test-name-confirmation-timing.mjs` の D-0 を写す行の直後に次を足す。

```js
fs.writeFileSync(path.join(dir, 'docs/D-0-governance.md'), fs.readFileSync(path.join(dir, 'docs/D-0-governance.md'), 'utf8').replace(/(\| 附属書F F\.2 の回答 \|)[^\n]*/, '$1 いいえ。人身への危害は生じない |'));
```

**突合の未解決の点も閉じる**: `test-discouraged-evidence.mjs` と `test-g5-aggregate.mjs` の失敗は、Windows の CRLF の写しに起因する。`core.autocrlf=false` の clone ではどちらも全件通過した。B20 の欠陥ではない。回帰の全量は LF の clone で流す。

## 3. #355 の所見

| ID | 裁定 | 理由 | 直し方 | 対の試験 |
| --- | --- | --- | --- | --- |
| F-01 高 | 採る | 実物の様式で `verdict` が読めないことを再現した | `judgement-records.mjs` の `reachRecordOf`: 節「会議体の判定の記録」を切り出し(無ければ全文)、欄名の**完全一致**で読む。判定の語がちょうど 1 つで先頭にあるときだけ採る。**単なる完全一致では不足する**。様式の未記入の行 `継続 / 中止 / 保留 / 差し戻し` を「継続」と読むためである(提案の読み方を実物の様式で確かめた: 記入済みは読め、未記入は null) | `test-aggregate-records.mjs` `IMPL-0667:ng` 様式 04 の全文を埋めた乙の継続 4 件で欠落。`:ok` 様式のままの行は未確認に数え、継続に数えない |
| F-03 高 | 採る | 通常の置き場で誤って止める | `decision-recheck.mjs` に `decisionG3Passes({ forms, declarations })` を足す。読む先は (1) `gateRecordList`、(2) `recordSources.gates`(判定者が名簿の人で AI の名義でないもの)、(3) `reviewJudgements` の G-3・通過・`judgeOk`(版は `commitId`、対象はその PR で変えた判断記録)。`aggregate-evidence.mjs` の `g3Passes` をこの結果へ替える | `test-decisions.mjs` `IMPL-0523:ng` 記録用ブランチだけの通過で本文を書き換えると不一致。`:ok` 記録用ブランチの通過で置き換えが欠落にならない。宣言行のレビューの版で比べる |
| F-04 高 | 採る | 重の裁定 3 節の「有効な承認」と食い違う | `stackedLayerCheck` に必須の引数 `hasValidApproval(n, copy)` を足し、`approvalCountOfCopy(c) === 0` を置き換える。呼び出しを 1555 行から、`independentConfirmation` の依存が揃う PR の繰り返しの直前(2383 行の前)へ移す。述語は X の写しへ `independentConfirmation` を当てる。判定できないときは承認なしに倒す。`gaps` へ副作用を出さないこと | `test-aggregate-records.mjs` `IMPL-0498:ng` X の承認が bot・AI の名義・作成者本人・作成を指示した者だけなら Y を数えない。`:ok` 名簿の別の人の承認なら数える |
| F-05 高 | 採る | 語を 1 つ変えるだけで停止を外せる | `exception-expiry.mjs` の `lapsedSimilarRows` の `\|\| stateOf(r).startsWith('失効')` を消す | `test-exception-expiry.mjs` `IMPL-1008:ng` 状態「失効」で期限超過は 1 件。`:ok` 「返却済み」は 0 件 |
| F-06 高 | 採る | 表示と実態の食い違い | 下の 3 か所を改める | `lint:impl`・`lint:refs` |
| F-09 中 | 採る | 裁定が定めた条件を、裁定なしに外している | 延長の述語に照合を足す。行の対象が範囲の PR かコミットへ解決できるとき、`instructorsOf`/`commitInstructors` の指示者と承認者が同じなら延長に数えない。解決できないときは数え、件数を項目7 に「指示者と照合できない延長 N 件」と出す。ADR-0217 の 66 行を改める | `test-aggregate-wiring.mjs` `IMPL-1008:ng` 指示者本人の延長は欠落。`:ok` 別の人の延長。対象を解決できない延長は件数の表示 |
| F-10 中 | 採る | 分子と分母の範囲が違う | `fastTrackMetrics` に `inRange(row)` を渡し、発生率の分子を範囲の変更へ対応づく印の行に限る。`aggregate-evidence.mjs` 4521 行から `inRangeTarget(r.target)` を渡す。全体の件数と「範囲へ対応づかない行 N 件」を併記する | `test-exception-expiry.mjs` `IMPL-0612:ng` 印 5 件・範囲に対応 1 件・変更 2 件で 50%。`:ok` 全体 5 件の表示が残る |
| F-11 低 | 採る | 区分の変更で検出を外せる | `extendedDueRows` の `endById` を区分で絞らない(始点だけ絞る) | `test-exception-expiry.mjs` `IMPL-0787:ng` 区分を変えて延ばす。`:ok` 区分を変えて同じ期限 |
| F-12 低 | 採る | 1 文字の修正で閉じる | `fastTrackMarkOf` の除去を `/[*`_]/g` へ | `test-exception-expiry.mjs` `IMPL-0612:ng` `__ファストトラック(短縮: G-5)__` を拒否 |
| F-13 低 | 採る | 名簿の人は決定可能に引ける | `aggregate-evidence.mjs` 4495 行付近: 席が引けないとき `resolveSigner(config, seatName)?.name` を責任者とする | `test-exception-expiry.mjs` か通しの試験 `IMPL-0628:ok` 氏名の欄で引ける。`:ng` 別の人の氏名は決定者でない |

**F-06 の文**

| 所在 | 新しい文 |
| --- | --- |
| `gate-criteria.md` 364 行 | 「判断記録の機械の検出は降りていない」の文を「判定した版と先端の判断記録の一致は、出荷の証跡の集約が確かめ、不一致を欠落にする(IMPL-0523)」へ |
| `gate-criteria.md` 2403 行 | 「出荷の証跡の集約が層の合わさりを見ないことは IMPL-0498」を「出荷の証跡の集約の判定は IMPL-0498」へ |
| `template/.claude/skills/gate/gates/G-6.md` 46 行 | 「出荷の証跡の集約は、承認の無い下の層が先頭の祖先である PR を確認ありに数えない(IMPL-0498)。取り込みの後に rebase した変更は祖先でなくなり機械が見逃すので、判定者が確かめる」へ |

## 4. #448 の所見

| ID | 裁定 | 理由 | 直し方 | 対の試験 |
| --- | --- | --- | --- | --- |
| R1-01 高 | 採る(禁止語は採らない) | 表示と実態の食い違い。禁止語は重の裁定 9 節が退けた | `envProblem` の識別を `[^()]+` に限り、括弧の形は末尾で閉じること。コロンの形も括弧を含めない。`模擬環境: 本番と併用` は形としては通るので、IMPL-0925 の note の「併用は欠落に数える」を「形だけを検査し、識別の語の意味は見ない。`模擬環境: 本番と併用` のように識別の欄へ書かれた併用は機械では落ちない。確かめる者: 独立した評価者と G-7 の判定者」へ改め、ADR-0221 決定4 も合わせる | `test-safety-record.mjs` `IMPL-0925:ng` 括弧を 2 組持つ 2 形。`:ok` `模擬環境(HIL-2)` |
| R1-02 高 | 採る(承認者)。対象の照合は 7 節 | 様式 03 が既に必須とする欄の検査で、新しい義務ではない | `resultProblem` に引数 `isValidApprover` を足し、空欄・名簿の外・AI の名義を拒む。呼び出しは `resolveSigner` と `aiNameBlocked` で作る | `IMPL-0927:ng` 承認者が空・AI の名義。`:ok` 名簿の人の成立した行 |
| R1-03 高 | 採る | コミットの時点の状態を表していない | 5.1 のとおり | `test-agent-run-record.mjs` `IMPL-1019:ng` 途中で変えてコミットに含める → `dirty` と `start=`。未コミットで残す → `dirty`。`:ok` 変更なし → `clean` |
| R1-04 高 | 採る | 安全の停止の入口を固定する | 6 節の共通の土台で通す | 6 節 |
| R1-05 高 | 採る | 同上 | 同上 | 6 節 |
| R1-06 中 | 採る | `check` が落ちる。除外は使わない | `human-ai-boundary.md` 1159 行の文末を「下位の担当を親の実行と区別して引き当てる手段がありません」へ | `npm run lint:provisions` |
| R1-07 中 | 採る(パスは機械、トレーラは開示) | 5.2 のとおり | 5.2 のとおり | `test-check-pr.mjs` `IMPL-0207:ng` `.githooks/commit-msg` の変更が統制の設定に数えられる。生成の試験で deny に `Edit(./.githooks/**)` がある |
| R1-08 中 | 採る(裁定を記録) | 5.3 のとおり | 5.3 のとおり | なし |
| R1-09 中 | 採る | 公開の前なので本文を直す | 5.4 のとおり | `lint:refs` |
| R1-10 中 | **開示で閉じる** | 黒名簿は重の裁定 10 節が退けた。文の意味は機械で閉じない | 5.5 の文を note へ足す | なし |
| R1-11 中 | 採る | 裁定の「読めないときは止める」に反する | 5.6 のとおり | `test-cl-judgment.mjs` `IMPL-0919:ng` `いいえ(判定中。後日確定)`・`いいえ / はい`・注釈の中の値・値の違う 2 行は null。`:ok` `いいえ。人はいない`・`いいえ(制御を持たない)` は偽 |
| R1-12 中 | 採る(旧い D-0 の受け入れは採らない) | 表と停止の食い違いの検出を弱めない | 5.7 のとおり | `test-roster-rules.mjs` `IMPL-0759:ng` 食い違いの文に再生成の案内が入る |
| R1-13 中 | 採る | 裁定の例の固定 | 6 節 | 6 節 |
| R1-14 低 | 採る | 誤りの訂正 | ADR-0220・0222 のリンク 3 件を実在の slug へ | `lint:refs`、サイトのビルド |
| R1-15 低 | 採る | 表示の整合 | 品質レポートの基準7 の 3 列目を「内容の妥当性は機械では確かめていない」へ | 該当の試験の文字列 |
| R1-16 低 | 採る | `clean` と偽らない | `assetsDirty` は失敗時に `null` を返す。5.1 で `unknown(assets-unreadable)` にする | `IMPL-1019:ng` リポジトリの外で `unknown(` |
| R1-17 低 | 採る | 節の外を読まない | `componentClasses` の見出しの探索を、次の `## ` の手前までに限る | `test-cl-judgment.mjs` `IMPL-0759:ng` 後の節の同名の見出しを読まない |

## 5. 個別の直し方

### 5.1 R1-03・R1-16 `agent-run-record.mjs`

```js
/** コミットに入らない指示資産の変更(作業ツリーの未ステージと未追跡)。読めなければ null */
export function assetsUncommitted(cwd = ROOT) { /* status の XY の Y が空白でない行と ?? の行を、excluded を除いて見る */ }

export function assetsTrailerValue(id, cwd = ROOT) {
  // 既存の記録の検査のあとで
  const now = assetsDigest(cwd);
  const pending = assetsUncommitted(cwd);
  if (pending === null) return 'unknown(assets-unreadable)';
  const changed = now !== r.digest;
  const state = pending || changed ? 'dirty' : 'clean';
  return `sha256:${now}; base=${r.base}; assets=${state}; user-scope=unrecorded${changed ? `; start=sha256:${r.digest}` : ''}`;
}
```

- ステージ済みの変更は、そのコミットに入るので `pending` に数えない
- 語は増やさない。軽の裁定の対立 4 の `dirty` の定義へ「実行の途中で指示資産を変えた場合を含む」を足し、ADR-0222 と IMPL-1019 の note を改める
- `classifyAgentCommit` の正規表現は変更なしで読める
- **フックの動きが変わるので、WSL2 の T1〜T3 をやり直す**(8 節の段 2)

### 5.2 R1-07 統制の閉じ方

| 統制 | 閉じ方 | 理由 |
| --- | --- | --- |
| `.githooks/**` の変更の検出 | **機械** | パスの一致は決定可能である |
| トレーラの真正さ | **manual と開示** | コミットの本文は作成者が自由に書ける。要約値を基底の版から計算し直す検査は採らない。偽る者も同じ計算ができ、閉じないのに閉じた表示になる |

機械の変更は次のとおり。

- `check-pr.mjs` の `CONTROL_FILES` に `.githooks/**` を足す
- `config.mjs` の `ENFORCEMENT_DIGEST_GLOBS` に `.githooks/**` を足し、**`enforcementDigests` の走査の先頭の一覧 `['.claude', '.github', 'scripts', 'adapters']` にも `.githooks` を足す**(足さないと要約値に入らない)
- `generate-profile.mjs` の `standardCategoryC` に `Edit(./.githooks/**)` を足す
- ADR-0222「影響」の「権限設定の Edit の拒否には載せていない。申し送りとする」を「`CONTROL_FILES`・強制層の要約値・権限設定の拒否に載せた」へ改める

**開示の文**(IMPL-0207・1019・0743 の note、EV-0319、ADR-0222 決定13 の「見えないもの」へ足す)

> トレーラ `Agent-Run`・`Agent-Assets` は、作成者が本文に書けば偽れます。`--if-exists doNothing` により、書かれた値がそのまま残り、集約は `clean` に分類します。機械の検査は改ざんを防ぎません。監査人は、トレーラを実行の記録の自己申告として読み、抽出した変更については実行基盤の記録と突き合わせます。

### 5.3 R1-08 議長の裁定の記録

本節を裁定の記録とする。`research/444-verification/README.md` に本節への参照を足す。

| 条件 | 裁定 | 理由 |
| --- | --- | --- |
| T1〜T3 の「WSL2 と Windows で」 | **Windows を条件から外す**。WSL2 の実機の記録で受ける | 所有者の回答の問1 は WSL2 を実機の記録と定めた。ネイティブ Windows の T1〜T3 は未実施であり、EV-0319 の差し替え条件に「ネイティブの Windows」を足して開示する |
| T4 の期待「`unknown` と出る」 | **「`unknown` か、親の識別子と親の要約値」へ改める** | 実機では親の値が付いた。版は親の実行から引けるので、外す対象にしない。下位の担当を親と区別できない限界は EV-0319 が開示している |

条件は結果を見た後に改めた。その旨を README に書く。

### 5.4 R1-09 ADR-0222 と IMPL-0506

**決定17 の新しい文**

> 17. IMPL-0207・1019・0506・0510 の `delivered` への移行は、WSL2 の実機の確認の結果が揃ってからにする。確認を通すために設定を緩めない。IMPL-0506 の「自身の手順」の条件は、確認の結果を見た後に、議長の裁定(`research/444-verification/chair-ruling-0506.md`)により「隔離のもとの終了コードと出力が、隔離なしの対照と一致する」へ改めた

**「影響」の新しい文**(90 行を置き換える)

> 実機の確認は WSL2 で行い、IMPL-0207・1019・0506・0510 を `delivered` へ移した。macOS・ネイティブの Linux・ネイティブの Windows は確かめていない(EV-0318・EV-0319)

**IMPL-0506 の note へ足す文**(通信の経路の未確認の開示)

> 自身の手順を確かめた使い捨てのリポジトリには `origin` も PR も無いため、集約の `git fetch origin refs/pull/<N>/head` など通信を伴う経路は、隔離のもとで通っていない。隔離が手順を妨げないと確かめた範囲は、通信を伴わない経路までである。記録のそろった案件で集約が終了コード 0 になることも、隔離のもとでは確かめていない

### 5.5 R1-10 開示の文(IMPL-0927 の note へ足す)

> 結果の欄は先頭の語だけを見る。「一致」「不一致」に続く文の意味は見ないので、`一致(未実施)` のような記入は機械では落ちない。確かめる者: 独立した評価者と G-7 の判定者

### 5.6 R1-11 `cl-judgment.mjs`

```js
const UNDECIDED = /未定|判定中|検討中|後日|保留|TBD/i;
function f2Q1Of(value) {
  const s = /* 既存の正規化 */;
  if (/^(はい|いいえ)\s*\//.test(s)) return null;
  if (/^いいえ(?=$|[\s。、,.(:])/.test(s)) return UNDECIDED.test(s) ? null : false;
  if (/^はい(?=$|[\s。、,.(:])/.test(s)) return true;
  return null;
}
```

`parseClRecord` は、HTML の注釈とコードの囲みを除いてから表を読む。F.2 の行が複数あり値が違うときは `conflicts.f2 = true` を返し、`readF2Q1Text` は `null` を返す。理由の文に含まれる「はい」(例: 人はいない)で誤って読まないよう、語の全文検索はしない。

### 5.7 R1-12 移行の案内

- `kinds/intake.md` に節「B20 を取り込むとき」を足す: (1) D-0 節16 の F.2 の回答を「はい / いいえ」で始めて記入する (2) `node scripts/init/generate-profile.mjs --answers process.config.json` で生成区間を作り直す (3) 様式 09 の表の列を写し直す (4) 構成要素ごとの判定の表を記入する (5) Q1 の回答を改めたら、その都度 (2) を行う
- IMPL-0759 の note の「変更の記録に書いた」を「`kinds/intake.md` の節『B20 を取り込むとき』に書いた」へ改める
- `d0SectionProblems` の食い違いの文に「附属書F F.2 の回答を改めたときは、生成区間を作り直してください」を足す
- **旧い生成区間を一致として受け付ける形は採らない**。Q1 を読めない案件の表が L3 と書かれたまま通ると、委任の停止と表が食い違う

## 6. 変異の生存(29 件)を閉じる共通の土台

### 方針

単体の試験は判定の論理を守るが、結線を守らない。**実物の集約と実物の生成を、使い捨てのリポジトリで通す**試験を足す。

| ファイル | 内容 |
| --- | --- |
| `scripts/gate/e2e-fixture.mjs`(新規。`test-` で始めない) | `makeRepo({ answers, people, seats })`(ROOT を一時の置き場へ写し、`core.autocrlf=false` で `git init`、基点のタグを打つ)、`resetTo(tag)`、`setD0Q1(value)`、`writeGateRecord(obj)`、`writeLedger(rows)`、`commitAll(msg)`、`runAggregate()`(`{ status, gaps, report, evidence }` を返す)、`runChange(obj, { dryRun })`、`runCheckD0()` |
| `scripts/gate/test-aggregate-wiring.mjs`(新規) | 下の表の A の場面 |
| `scripts/gate/test-delegation-wiring.mjs`(新規) | 下の表の B の場面 |
| `.github/workflows/gate-g5.yml` | 2 ファイルの実行の行を足す |

場面ごとに複製しない。基点のタグへ戻して使い回す(`test-name-confirmation-timing.mjs` の `resetTo` と同じ形)。各場面は違反(`:ng`)と適合(`:ok`)を対にする。

### 場面の一覧

| 土台 | IMPL | 違反の場面 | 適合の場面 |
| --- | --- | --- | --- |
| A | 0738 | CL1 × G-6 未達 / 委託 × 置かない | CL1 × G-3 未達は欠落なしで開示に出る |
| A | 0498 | bot だけが承認した層の上の PR | 名簿の人が承認した層 |
| A | 0523(2 行) | 記録用ブランチの通過の後に本文を変更 / G-3 の無い置き換え | 状態の行だけの変更 |
| A | 0667 | 様式 04 で乙の継続 4 件 | 3 件 |
| A | 0638 | CL1 × 範囲の中の併記なし | 併記あり |
| A | 0628 | 制限に触れる変更を決定者でない者が例外承認 | 決定者の承認 |
| A | 0612 | 印の行の指標が項目7 に出ない | 指標の値が出る |
| A | 0622 | S1 で点検の記録なしの注意が出ない | 経過日数が出る |
| A | 0669 | ステージの累計の行が出ない | 枠と残りが出る |
| A | 0710 | 導入の記録を持つ案件の行が出ない | 行が出る |
| A | 0739 | G-6 未達の R2 の件数の行が出ない | 行が出る |
| A | 1007(R1-05) | Q1「はい」で記録なし → 基準7 の欠落、exit 1 | 記入済み → 基準7 の欠落なし |
| A | 0925・0927・0934 | `模擬環境(TBD)` / 区分「負債」の行の ID / 手法の欄の空欄 | 記入済み |
| A | 0683 | 暫定の許可が項目5 に出ない | 許可と期限が出る |
| A | 0743 | 導入前のコミットが外す対象に混ざる / `unknown` の分類の反転 / 導入の境の反転 | 導入前は別の件数 |
| A | 1019 | JSON として読めるが値が不正な記録 → `unknown(unreadable-run-record)` | 正しい記録 |
| B | 0919(R1-04 の 5 件) | D-0 が「はい」「未定」「なし」で、`readAutonomyRecords` → `autonomyState` が止める / `--change --dry-run` が拒否する / `applyD0Sections` の表が L1 / `d0SectionProblems` が L3 の表を検出する / 表に登録を適用しない理由が出る | 「いいえ」で止まらず、表が L3 |
| B | 0883 | G-1 通過済みの案件で注意の分岐に届き、`r.ok` が真 | G-1 の前は失敗する |

### 閉じ方の条件

- 実装の後に、29 件の変異を同じ一時の写しで流し直す。生き残りが残れば場面を足す
- 例外として開示で閉じるものは 2 件である
  - IMPL-1007「Q1 はいの行を消す」: 後続の行が同じ判定をするので等価の変異である
  - IMPL-1015 の `stage-table.mjs` の変異: `lint:stage-table` で落ちることを確かめ、マークの `test=` に足す。落ちなければ `test-tailoring-engine.mjs` に場面を足す

## 7. 所有者へ上げる点

| 点 | 内容 | 既定の動き |
| --- | --- | --- |
| R1-02 の対象の照合 | 例外承認の行の対象が「基準7 または安全関連部の検証の記録」を指すことを、機械の条件に足すか。別のゲートの別の対象の行で、故障挿入の全項目を省ける穴が残る。足すと、例外承認の行の書き方に新しい条件が掛かる(安全に関わる新しい義務) | **足さない**。承認者の検査だけを実装し、次の文を IMPL-0927 の note と EV-0334 へ足して開示する |

> 例外承認の行の対象が、基準7 や当該の試験項目を指すことは機械では確かめない。対象の妥当性を確かめる者は、独立した評価者と G-7 の判定者である。

次の点は新しい義務に当たらないと判断した。報告だけとする。

- IMPL-0638 を CL1 以上で止めること: 第3章 3.4.1 の「未達」と第8章の表の既存の定めの実装である。ADR-0217 決定11 を改めるので、所有者の回答の範囲の適用として明記する
- R1-01・R1-11: 既存の裁定の形に実装を揃える直しである
- `.githooks/**` の統制: 既存の統制の対象の列挙への追加である

## 8. 直しの段

template を直列で触る。段ごとに新しい担当を立て、コミットのたびに bundle へ退避する。

| 段 | 範囲 | 担当の目安 | 完了の条件 |
| --- | --- | --- | --- |
| **段 1 出荷の統制** | 1 節(0738 の実装・標準・ADR-0218・ADR-0217)、F-01・03・04・05・06・07・09〜13 | `sonnet`、約 120 回 | `test-aggregate-records`・`test-decisions`・`test-exception-expiry`・`test-name-confirmation-timing`・`lint:impl`・`lint:evidence` が通る |
| **段 2 安全と実行の記録** | R1-01・02・03・06・07・08・09・10・11・12・14・15・16・17、WSL2 の再確認 | `sonnet`、約 110 回。再確認だけ別の短命な担当(T1〜T3 と、`.githooks/**` を足した deny の S3) | `test-safety-record`・`test-agent-run-record`・`test-cl-judgment`・`test-check-pr`・`lint:provisions` が通り、`research/444-verification/` に再確認の記録がある |
| **段 3 結線の試験** | 6 節(共通の土台、A・B の場面、R1-04・05・13、29 件の変異の流し直し) | `sonnet`、約 130 回 | 新しい試験が通り、変異の生存が開示の 2 件だけになる。最後に LF の clone で回帰の全量と `npm run check` を 1 回流す |

段 3 は段 1・2 の後に行う。結線の場面は直した後の振る舞いを固定するためである。

## 9. 既存の決定との突合

| 決定 | 判断 |
| --- | --- |
| ADR-0028(未達と省略の区別) | 整合する。未達の表示を続け、手書きで消せなくする |
| ADR-0055・0088・0113(CL1 以上は未達のまま出荷しない) | 引用の文脈は人の確認の未達であり、案 B と整合する |
| ADR-0127 決定7(空欄を欠落にしない) | 整合する。止めるのは明示の値「置かない」だけである |
| ADR-0217 決定11 | 矛盾するので本文を改める(未公開) |
| ADR-0218 決定1〜3 | 所有者の決定により改める(未公開) |
| ADR-0222 決定13・17 | R1-07・R1-09 のとおり改める(未公開) |
| 重の裁定 9 節・10 節 | 禁止語と黒名簿は採らない決定を保つ |
| #434 / ADR-0120 | 判定の論理を変えない。試験の入力だけを直す |

## 10. 確かめていないこと

- 1.3 の実装の全体は動かしていない。実物の様式の読み方(F-01)と F-07 の入力の修正だけを、一時の写しで実行して確かめた
- 独立した安全性の評価の未達が欠落に届くか(1.1 の確認の指示)
- GitHub の実機での `refs/pull/N/head` の取得と、macOS・ネイティブの Linux・ネイティブの Windows での隔離と T1〜T3
