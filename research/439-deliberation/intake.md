# Issue #439 受付と実行での確認

- 対象: #439「閉じた #359 を issue= に持つ未達の実装マークが 7 行残る」
- 確認の日: 2026-11-15。作業ツリー `b3`(HEAD 23e250c、作業ツリーは変更なし)
- この段で書いたもの: `research/439-deliberation/` の下だけ。本文・データ・template は変えていない。コミットもしていない

## 1. 審議の重さ: 軽(議長の裁定の案)

| 判断の軸 | 当てはめ |
| --- | --- |
| 安全・法令 | 当たらない |
| 採用者への新しい義務 | 当たらない。実装マークと台帳は本リポジトリの追跡の道具で、準拠テンプレートと標準の条項は変えない |
| ADR の原則の変更 | **当たらないと読む**。ADR-0084 の決定(R-4)の1項「`issue=` が閉じた Issue を名指すことは、機械で検出しない」と、採らなかった案の表の1行を改める。ただしその理由である原則(検査はオフラインで実行し、同じ結果を出す。ADR-0084・ADR-0089 の `issues-snapshot.mjs`)は保つ案を推す。原則を保ち、帰結の1項だけを新しい ADR で置き換える |
| 編集の指摘か | 当たらない。検査(検出)の新設と、採らないと記録した案の見直しを含み、意味が変わる |

- 重へ上げる条件: `npm run check` の中で GitHub へ問い合わせる案(draft の案 A)を採るなら、オフラインの原則そのものを変えるので重へ上げる。draft は案 A を採らない
- 外部の調査: 行わない。新しい義務を課さず、規格の引用も要らない
- 会議体: 起案と反対の2委員。本担当が draft.md の中で節を分けて書いた

## 2. 実行での確認

### 2.1 方法

1. `gh issue list --state closed --limit 1000 --json number`(368 件)と `gh issue list --state open --limit 300 --json number,title,labels,milestone`(29 件)を取得
2. `src/content/docs/` の下の md・mdx から実装マーク(`<!-- impl IMPL-NNNN ... -->`)を全量読み、`issue=` の番号を 1 の一覧と突き合わせた。スクリプトは `research/439-deliberation/scan.cjs`(`node scan.cjs <closed.json と open.json を置いたディレクトリ>`)
3. 台帳(`implementation-ledger.md`)と書式の見本(`implementation-marking.md` のコードフェンスの中)は数えない

`npm run lint:impl` は、この作業ツリーに `node_modules` が無く実行できなかった(`ERR_MODULE_NOT_FOUND`)。件数は上のスクリプトで数えた。実装の担当は `npm ci` の後に本体の検査で数え直す。

### 2.2 結果: 該当は 7 件ではなく 14 件(閉じた Issue 4 件)

実装マークは 513 件(delivered 412、undelivered 101)。`issue=` を持つマークは 74 件で、すべて `state=undelivered plan=scheduled`。

| `issue=` | Issue の状態 | 件数 |
| --- | --- | --- |
| #359 | 閉(2026-11-11) | 7 |
| #358 | 閉(2026-11-12) | 5 |
| #289 | 閉(2026-10-29) | 1 |
| #290 | 閉(2026-10-29) | 1 |
| #325・#329・#330・#333・#339・#348・#349・#351・#354・#355・#356・#361 | 開 | 60 |

閉じた Issue を名指す 14 件(行番号は 2026-11-15 の作業ツリー):

| マーク | 所在 | 降ろし先 | `issue=` | `review=` |
| --- | --- | --- | --- | --- |
| IMPL-0377 | exception-escalation.md:424 | next-role | 359 | 2027-04 |
| IMPL-0497 | gate-criteria.md:831 | adoption-trial | 359 | 2027-05 |
| IMPL-0174 | human-ai-boundary.md:926 | gate-skill | 359 | 2027-05 |
| IMPL-0175 | human-ai-boundary.md:940 | gate-record-template | 359 | **2026-11** |
| IMPL-0374 | lifecycle.md:541 | next-role | 359 | 2027-04 |
| IMPL-0283 | lifecycle.md:572 | flow-observation | 359 | **2026-11** |
| IMPL-0500 | roles-responsibilities.md:769 | next-intake | 359 | 2027-05 |
| IMPL-0492 | assurance-case.md:400 | ai-review-workflow | 358 | 2027-05 |
| IMPL-0207 | human-ai-boundary.md:1001 | agent-run-record | 358 | 2027-02 |
| IMPL-0510 | human-ai-boundary.md:1152 | agent-settings | 358 | 2027-02 |
| IMPL-0200 | human-ai-boundary.md:1155 | guard-write-hook | 358 | 2027-02 |
| IMPL-0506 | human-ai-boundary.md:1156 | agent-settings | 358 | 2027-02 |
| IMPL-0132 | gate-criteria.md:578 | decisions-check | 289 | 2027-04 |
| IMPL-0145 | roles-responsibilities.md:1461 | evidence-aggregation | 290 | 2027-04 |

- Issue 本文の 7 行(#359 の分)は、行番号・識別子とも現在の作業ツリーと一致した。IMPL-0283 の降ろし先は #345 で `flow-observation` へ改められている
- **Issue 本文に無い 7 件**(#358 の 5 件、#289・#290 の各 1 件)が同じ欠陥を持つ。#342・#345 の審議の時点(2026-11-12)では #359 の分だけを数えていた
- 閉じた #360・#314・#315・#316 を名指すマークは 0 件(付け替えの手順が守られた例)

### 2.3 閉じ方が規約に反した経緯

- `implementation-marking.md` 136 行と ADR-0084 の決定(R-4)は、Issue を閉じる者が「その Issue を `issue=` に持つマークが 0 件であること」を確かめてから閉じる、とする
- #359 の裁定(`research/359-deliberation/decision.md` 2 章・3 章)は「`plan=scheduled` のまま #359 に残す」「この5件のマークは、`plan=scheduled issue=359` のまま表示し続ける」とした。その Issue を閉じたので、裁定が指した担い手が無くなった
- #358 の裁定(`research/358-deliberation/decision.md`)も「実機の確認まで `undelivered plan=scheduled`」とし、閉じた
- 人の手順だけの統制は、ADR-0084(2026-10-24)の後に少なくとも 4 件の Issue で破れた。守られた例は #314・#315・#316・#360 の 4 件

### 2.4 見直しの年月

- `review=2026-11` のマークは 28 件。うち本件の 14 件に入るのは IMPL-0175・IMPL-0283 の 2 件
- 残る 26 件は open の #355(11 件)・#356(15 件)を名指す。本件の範囲の外。検査の「過ぎた」の条件は `review < 実行の月` なので、2026-12-01 から台帳の冒頭の件数に 26 件が出る(合否には使わない)。#355・#356 へコメントで知らせる案を draft の 7 章に置いた
- 見直しの年月を過ぎたマークは、2026-11-15 の時点で 0 件

### 2.5 調査で見つけた関係する事実

1. **Issue の一覧の写しが既にある**。`src/data/issue-index.tsv`(`npm run issues:snapshot`、ADR-0089、#319)。番号・種別・題だけを持ち、**状態は書かない**(`scripts/issues-snapshot.mjs` の冒頭:「閉じた Issue も決定の経緯として引けるため。状態の変化で写しの差分を出さないため」)。写しは #438 までで、#439〜#441 は載っていない
2. `check-impl.mjs` は `issue=` を数字の形だけで確かめる(`lib/impl-inventory.mjs` 443 行)。写しとの突合(実在・種別)はしていない
3. 検査の外で GitHub の状態を定期に読む先例がある。`.github/workflows/evidence-review.yml`(毎月1日、期限を過ぎた根拠水準マークの Issue を起票または追記。「`npm run check` は期限では失敗させない」)
4. `implementation-marking.md` 43 行の見本は `issue=123` で、46 行は「見本の Issue の番号(`123`)は架空の番号です」と書く。**#123 は実在する(2026-08-05 に閉)**。検出を作るときは、コードフェンスの中の見本を数えない(`marksInFences` が既にある)。文は編集の指摘として直す
5. template の側: `template/.github/workflows/record-copy.yml` は実在する(IMPL-0492 は実装済みで実機の確認が残る)。`flow-observation.yml` は無い(IMPL-0283 の予定の置き場)

## 3. 既存の決定との関係(突合の入口)

| 決定 | 中身 | 本件との関係 |
| --- | --- | --- |
| ADR-0084 決定 R-4 の1項・採らなかった案の表の1行 | 閉じた Issue の名指しを機械で検出しない。理由はオフライン | 本件が見直す対象。新しい ADR で置き換える(採用済みの ADR は書き換えない) |
| ADR-0084 同節 | 期日を過ぎた件数で検査を落とさない(暦で CI が落ちる) | 保つ。本件は `review=` を合否に使わない |
| ADR-0089・`issues-snapshot.mjs` | 検査は GitHub へ問い合わせない。写しに状態を書かない | 保つ案を推す |
| ADR-0076 決定5 | 件数を目標にしない(マークしない誘因) | 検出が「`issue=` を書かない」誘因にならないかを draft 3 章で検討 |
| ADR-0073(G-5 の3条件) | 検査を足すときは、偽陽性が無い・修正できる・既存の違反を先に解消 | 14 件を先に付け替えてから検出を有効にする |
| #359 の裁定 2・3 章、#358 の裁定 | マークを当該 Issue に残す | 担い手の付け替えで引き継ぐ |
