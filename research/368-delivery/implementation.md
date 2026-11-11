# #368 の実装の記録(判定記録の無い作業単位に着手しない。IMPL-0331)

実施日: 2026-11-06〜11。審議の重さは「軽」(準拠テンプレートへ降ろすだけで、新しい規定を足さない)。本体と template はどちらも `git pull` で最新を確かめてから着手した(本体 a551e16、template 92fafd0)。作業は 2026-11-06 に利用の上限で中断し、2026-11-11 に作業ツリーの状態を確かめてから再開した。

## 入力

- Issue #368 の本文
- 第3章 3.5.5 の要求事項5 と IMPL-0331 の印、同じ節のラベルの語彙と状態の遷移の表
- `research/316-deliberation/implementation.md` の 8.5
- 準拠テンプレートの `scripts/gate/next.mjs`(判定記録の 3 つの出所の読み方)、`.claude/skills/pit/`(SKILL.md・reference/handoff.md)、`.claude/skills/implement/SKILL.md`、判定記録の置き場(`docs/gates/`、記録用ブランチ `records` の `records/gates/` と `records/reviews/`)
- CLAUDE.md(本体と template)、`community/implementation-marking.md`

## 進捗

- [x] 着手の前に判定記録の有無を確かめる手順(next.mjs の `--intake` と受け手のスキル)
- [x] 違反と適合の対の試験(`IMPL-0331:ng`・`IMPL-0331:ok`)
- [x] 印を `state=delivered check=machine` へ。`issue=` は delivered の印に置かないため除いた
- [x] 台帳と知識ベースの再生成(impl:write・template:kb)
- [x] 検査(4 節)
- [x] コミット(本体はコミットまで。template は pit-in-template の main へ push し、submodule の参照を進めた)

## 0. 要求事項5 の文から導いたこと

要求事項5 は「ラベルが遷移していて判定記録が無い作業単位は、未判定のまま渡ったものとして扱う。受け取った席は着手せず、判定者へ差し戻す」です。「どの判定記録か」は文に書かれていません。同じ節のラベルの語彙(付ける席)と状態の遷移(遷移の契機)から、次のように導きました。

| ラベル | 付ける席と契機(3.5.5 の表) | 前提とした判定記録 | 導き方 |
| --- | --- | --- | --- |
| `state:needs-dev` | 価値責任者・技術判断者・事業決裁者が、判断の後に着手を渡す | 対象の機能の G-2・G-4 の通過(構成で有効なもの) | 着手は実装であり、実装の前の判定は G-2・G-4(第5章 5.8.5 の禁止事項1、`/implement` の前提)。次の一手(computeNext)が `/implement` を出す条件と同じにした |
| `state:ready-to-merge` | 独立レビュアが G-6 の判定記録を作成し、取り込みを待つ | 対象の PR の G-6 の通過 | 語彙の「状態」の欄に G-6 の判定記録の作成が書かれている |
| `state:qm-blocked` | 独立レビュアが G-6 で、または出荷判定者が記録の突合で、差し戻した | 対象の PR の G-6 の差し戻し | 前者だけが判定記録を持つ |
| `state:dev-done`・`state:needs-po`・`state:needs-tech`・`state:needs-owner`・`state:needs-audit`・`state:needs-platform` | 開発者・誰でも・価値責任者・AI維持管理者が、判定を経ずに付ける | 求めない | 遷移の契機が判定ではない |

導けなかった点(機械では「判定できない」を出し、着手させない):

- **出荷判定者の記録の突合による `state:qm-blocked`**。本標準もテンプレートも、この差し戻しの判定記録の様式を定めていない。G-6 の差し戻しの記録が無ければ「判定できない」とし、差し戻した席へ理由の所在を確かめさせる。G-6 が省略・未達の構成の `state:qm-blocked` も同じ
- **`state:needs-dev` が機能へ対応づかない作業単位**(Issue だけの修正など)。前提の判定記録を文から導けない。機能 ID(F-NNN)で指定できなければ「判定できない」
- **技術判断者の G-3 や事業決裁者の決裁の後の `state:needs-dev`**。G-3 は機能ごとの判定ではなく、決裁の記録の置き場は案件ごとに違う。機能の G-2・G-4 だけを前提とした。G-3 の記録の有無は着手の確認に含めていない
- **承認者の人数と判定者の本人性**。`--intake` は記録の有無までを見る。人数(構成の reviewerCount)と本人性は G-5(`check-pr`)と出荷の証跡の集約が見る

## 1. 実装の段で決めたこと

| # | 判断 | 理由 |
| --- | --- | --- |
| J-1 | 受け手のスキルだけでなく、`next.mjs --intake <ラベル> <対象>` に確かめる手順を置いた | スキルの文だけでは判定記録の有無を担い手の読み取りに委ねる。3 つの出所の読み方(通過の語の完全一致、確定していない版、挙動要約、失効)は next.mjs にすでにあり、同じ読み方で確かめれば次の一手と食い違わない |
| J-2 | 出力は「着手してよい」(終了コード 0)・「着手しない」(3)・「判定できない」(4) | 次の一手の `command`・`human-wait`・`undetermined` と同じ考え方。導けない・読めないことを「記録が無い」と混ぜない。どちらも着手はさせない |
| J-3 | 開いている PR の判定は `gh api` で PR のレビューを読み、写しと同じ形にして `recordsFromCopy` で読む | 写しはマージの時点でしか置かれない。`state:ready-to-merge` の時点の G-6 の記録は、開いている PR の承認レビューである。`--offline` では読まず、手元の記録で見つからなければ「判定できない」 |
| J-4 | 「着手しない」に、判定者の席と受信箱のラベルを添える | 要求事項5 の「判定者へ差し戻す」。差し戻す先を担い手に選ばせない。判定記録は判定者本人が書き、AI の担い手は記録を作らない旨も出す |
| J-5 | CLAUDE.md の「ラベルによる引き渡し」の節に要求事項5 の行を足し、`claude-md-resident.json` を作り直した(追加だけ) | 受け手が着手の時点で読む常駐の索引に行が無ければ、`--intake` を実行する契機が無い |
| J-6 | 試験は新しいファイルを起こさず、`test-next-records.mjs` に足した。入口(`next.mjs --intake`)を一時の置き場で `--offline` で通す | 規約の「入口についての規定なら、入口を通す試験を名指す」。この試験はすでに gate-g5.yml から実行される(結線を足さずに済む) |
| J-7 | 降ろし先 `next-intake` を `impl-targets.yaml` に新設した。旧い降ろし先は `claude-md` | 降ろしたのは next.mjs の手順であり、`next-role`(ロールの詳細)とは別の事実 |
| J-8 | 機械が止めるのは確認の出力まで。着手そのものは指示文 | フックで着手(ブランチの作成・書き込み)を止める形は採らない。着手の契機は受信箱のラベルで、ラベルはローカルに無い。印の note と template-repository の表に「着手そのものは止めない」と書いた |

**採らない案**: スキルの文だけで済ませる案(J-1 の理由)。G-3 の記録を `state:needs-dev` の前提に足す案(G-3 は機能ごとの判定でなく、要求事項5 の文から導けない)。

## 2. 標準の本文(本体)

| ファイル | 変えたこと |
| --- | --- |
| `phase4-process-design/roles-responsibilities.md` | IMPL-0331 を `target=next-intake state=delivered check=machine test=template/scripts/gate/test-next-records.mjs` へ改め、note に実装・試験・機械で確かめない範囲を書いた。`issue=`・`plan=`・`review=` は delivered の印に置かないため除いた |
| `phase5-implementation/template-repository.md` | 規則と担保の対応の表に要求事項5 の行を足した |
| `src/data/impl-targets.yaml` | 降ろし先 `next-intake` を新設した |
| 台帳 | `impl:write`(implementation-ledger.md)・`template:kb`(tailoring-kb.json)で再生成した |

本文の規定(要求事項・課さないと決めたこと)は変えていない。ADR は起こしていない。採用済みの ADR-0086 にある「IMPL-0331 は未達として表示し続ける」の記述は、ADR の本文を書き換えない規則により残す。

## 3. 準拠テンプレート

| ファイル | 変えたこと |
| --- | --- |
| `scripts/gate/next.mjs` | `INTAKE_RULES`・`INTAKE_NO_RECORD`・`parseIntakeTarget`・`intakeCheck`・`openPrRecords`・`renderIntake`・`INTAKE_EXIT` と、`--intake` の入口 |
| `scripts/gate/test-next-records.mjs` | `IMPL-0331:ng`(関数と入口)・`IMPL-0331:ok`(関数と入口)のほか、G-2 の欠け、挙動要約の無い承認、失効した承認、`--offline` で読めない場合、`qm-blocked`、判定を経ないラベル、語彙に無いラベル、G-6 の省略、出力と終了コード |
| `.claude/skills/pit/reference/handoff.md` | 節「拾った作業単位に着手する前に」(ラベルごとの前提の判定記録と、出力ごとにすること) |
| `.claude/skills/pit/SKILL.md`・`.claude/skills/implement/SKILL.md` | 着手の前に `--intake` を実行し、着手しない・判定できないなら着手しないこと |
| `CLAUDE.md`・`scripts/gate/claude-md-resident.json` | ラベルによる引き渡しの節に要求事項5 の行 |
| `scripts/vendor/tailoring-kb.json` | template:kb で再生成 |

開いている PR のレビューを gh api で読む部分(`openPrRecords`)は、試験でも実機でも確かめていない(印の note に開示した)。

## 4. 検査

| 検査 | 結果 |
| --- | --- |
| `test-next-records.mjs`(Windows) | 60 / 60 件。`intakeCheck` の「記録が無い」の判定を外した変異で、ng の4件が落ちることを確かめた |
| `check-process-rules.mjs`・`test-claude-md-resident.mjs`・`test-init-g5.mjs`(Windows) | 通過 |
| template の試験一式(WSL、`/tmp/pc368` へ `git clone` した LF の作業ツリー。test-results.mjs は引数が要るため除外) | 全件通過 |
| WSL の回帰スイート(通常の時刻) | すべて通った(25 本、v3b 30 場面を含む) |
| WSL の回帰スイート(`TZ=UTC`) | すべて通った |
| `npm run check` の各段(Windows で段ごとに実行) | `test:template-suite` と `test:regress` を除く 24 段が通過(lint:text・lint:provisions・lint:impl・test:impl・test:template を含む)。build も通過 |

作業の途中の誤り: 最初の WSL への同期で `graft` を除外の名に含めたため `.claude/skills/graft/` が写らず、`test-context-refs.mjs` が落ちた。`git init` で作った作業ツリーでは `test-adoption.mjs` が衝突で落ちた。どちらも同期の誤りであり、`git clone` で作り直した作業ツリーで全件通過した。同期は `scratchpad/sync-wsl368.sh`(sync-wsl.sh と同じ同期を `/tmp/pc368` へ行い、template は clone)と、`src`・`research`・`node_modules/yaml` の追加の写しで行った。

## 4b. 独立の突合(`crosscheck.md`)への対応(2026-11-11)

突合の対象は本体 9607d79・template b967ea1。指摘は中6件・低4件で、高は無い。議長の裁定に従って直した。対応の後の版は template 0549e4e。

| 指摘 | 対応 |
| --- | --- |
| X-1(中) | 3.5.5 の状態の遷移の表から導ける範囲にそろえた。`state:needs-dev` は `--from <前のラベル>` を受ける。`--from state:needs-tech` なら G-3 の通過を求める(遷移の「技術判断者が G-3 の判定記録を作成し」)。どの経路でも G-2・G-4 の通過を求めるのは 3.5.5 からでなく第5章 5.8.5 の禁止事項1 と `/implement` の前提によると、コード・handoff.md・印の note で書き分けた。`--from` が無ければ、経路で前提が違うため「判定できない」とした。機能へ対応づけない作業単位は、裁定の選択肢のうち「止めずに判定できないを出す」を採った(正しく読む形は、作業単位の識別の語彙が標準にもテンプレートにも無く、導けないため)。導けない点は IMPL-0467 へ切り出した |
| X-2(中) | 前提の判定記録を最新の判定で読む形にした。next.mjs の `passed` を `latestPassIn` で置き換えた。通過の後(同時刻を含む)に、通過でない判定の記録(差し戻し・結果欄が2値でない様式・宣言行の無い変更要求)があれば、その通過は効いていない。承認レビューで通過に数えなかったもの(失効・挙動要約なし・名簿の外)は、判定のやり直しではないため打ち消しに含めない。`qm-blocked` は `latestRejectIn`。**既存の passed() を使う他の箇所への影響を確かめた**。次の一手の G-1・G-2・G-4 の段階と `g6Status` が同じ関数を使い、同じ欠陥を持っていた(通過の後に差し戻された機能を、G-4 通過として実装の段へ進める)。同じ置き換えで直り、試験で固定した(`test-next-records.mjs` の「最新の判定」の8件)。出荷の証跡の集約(`aggregate-evidence.mjs`)も、自前の `passed(g)` を `some` で使い、G-1・G-4(様式と写しの宣言行)・G-6・G-7・G-8 で同じ欠陥を持っていた。`supersededByLater`(様式)と `reviewSupersededByLater`(写しの宣言行)を足して各所に当て、関数を `test-aggregate-records.mjs` の6件で固定した。集約の本体の各所の結線は、試験が本体を動かさない設計のため関数の試験で代える(回帰スイートが本体を通す)。**様式と写しの間の前後は比べない**(判定日時の形が違う。様式の差し戻しの後の写しの通過など、出所をまたぐ打ち消しは残る) |
| X-3(中) | 構成の `gates` にキーが無い、または状態が語彙(required・simplified・omitted・unmet)に無いときは「判定できない」にした。`omitted`・`unmet` と明示したときだけ「有効でない」とする。試験に3場面を足した |
| X-4(中) | 本件では変えない(裁定)。#328 へのコメントの文案を 6 節に置いた |
| X-5(低) | `--pickup` の分岐で例外を捕まえ、「判定できない」(終了コード 4)で終える。handoff.md の出力の表に終了コードを足し、「終了コードが 0 でなければ、出力の形によらず着手しない」を書いた。CLAUDE.md・/pit・/implement も同じ。入口の試験に、記録の置き場を読めない場面を足した |
| X-6(低) | `next.mjs --role` の出力に `--pickup` の1行を足した。handoff.md の qm-blocked の箇条書きに着手の前の確認を足した。`/implement` の例を needs-dev(`--from` つき)と qm-blocked に広げた。出荷判定者の `/gate`(G-7)には足していない。`state:ready-to-merge` の受け取りは G-7 の判定ではなく取り込みの前の受け取りであり、`--role` の出力・/pit・CLAUDE.md の常駐の行が運ぶため |
| X-7(中) | 確かめていない範囲を undelivered の印に切り出した。IMPL-0467(`issue=359`。様式の無い記録: 出荷判定者の突合による差し戻し、needs-po・needs-owner を経た判断・決裁の記録、機能へ対応づけない作業単位。#359 は「判定の様式・スキル・次の一手に欄と注記が欠けている規定」であり合う)。IMPL-0468(`issue=361`。開いている PR のレビューを gh api で実環境から読む部分。#361 は実際の GitHub 上での検証であり合う)。どちらも `target=next-intake`・`check=manual`・`review=2027-05`。棚卸しの 3.5.5 の節と要求事項5 の行に足した |
| X-8(中) | 事実: template の b967ea1 は、所有者の作業の指示(依頼の「pit-in-template の main へ push し、submodule の参照を進める」)にもとづいて main へ直接入れた。#371 の C-11 と同じ扱いである。これはテンプレートの保守の経路であり、**採用者のリポジトリで強制層の変更に求める AI維持管理者の承認の手続とは別である**。その承認の記録はまだ無い(5 節の表は空のまま)。この旨を IMPL-0331 の note と template のコミットの本文に書いた。delivered のまま(裁定) |
| X-9(低) | オプション名を `--pickup` に改めた(関数名も pickupCheck などへ)。`/process-change` の種別 `intake`(準拠テンプレートの更新の取り込み)と別物である旨を handoff.md とコードの注記に書いた |
| X-10(低) | 判定記録を求めないラベルの理由を「開発者・AI維持管理者・誰でも付けられ、付ける契機を判定に限らない」へ書き改めた(コード・handoff.md)。`state:needs-po` へは監査の判定や G-3 の差し戻しの後にも遷移することを注記に書いた |

参考(指摘にしない)の2件(G-4 が未達の構成、判定者が委譲を受けた機能責任者の差し戻し先)は、本件で扱っていない。

### 対応の後の検査

| 検査 | 結果 |
| --- | --- |
| `test-next-records.mjs`(Windows) | 79 / 79 件 |
| `test-aggregate-records.mjs`(Windows) | 114 / 114 件 |
| `check-process-rules.mjs`・`test-claude-md-resident.mjs`・`test-roster-rules.mjs`(Windows) | 通過(常駐の規則の追加 0 件。行の核は変わらない) |
| template の試験一式(WSL、`/tmp/pc368` へ 0549e4e を clone) | 全件通過 |
| WSL の回帰スイート(通常の時刻 / `TZ=UTC`) | どちらもすべて通った |
| `npm run check` の各段(Windows) | `test:template-suite` と `test:regress` を除く 24 段と build が通過 |

## 5. AI維持管理者の承認待ち

強制層(`.claude/**` と `scripts/gate/**`)の変更である。AI維持管理者の承認を待つ。

| 項目 | 値 |
| --- | --- |
| 対象 | pit-in-template b967ea1・0549e4e(main へ push 済み) |
| 名簿の人 | |
| 承認者 | |
| 承認日 | |

対象には 0549e4e(突合への対応)も含む。どちらも所有者の作業の指示にもとづいて pit-in-template の main へ直接入れた(#371 の C-11 と同じ扱い)。上の表は、採用者のリポジトリでの強制層の変更の承認の手続とは別の、テンプレートの保守としての承認の記録の欄である。

## 6. #328 へのコメントの文案(突合 X-4)

> #368(IMPL-0331)の独立の突合(`research/368-delivery/crosscheck.md` の X-4)で、第3章 3.5.5 の中の食い違いが見つかりました。この Issue の「参照と語の食い違い」に足します。解決の案は前提にしません。
>
> - 要求事項5 は、ラベルが遷移していて判定記録が無い作業単位を「受け取った席は着手せず、判定者へ差し戻す」と定めます
> - `state:ready-to-merge` を受けるのは出荷判定者です。G-6 の判定記録が無いとき、判定者(独立レビュア)の受信箱は `state:dev-done` です
> - ところが、ラベルの語彙で `state:dev-done` を付ける席は開発者・AI維持管理者だけです。状態の遷移の表にも `state:ready-to-merge` → `state:dev-done` はありません(`ready-to-merge` から出るのは `qm-blocked` と完了だけ)
> - そのため、この場面では「判定者へ差し戻す」と語彙の「付ける席」が両立しません。準拠テンプレートの `next.mjs --pickup` は、いまは判定者の受信箱(`state:dev-done`)を差し戻す先として出しています。この選択を標準は定めていません
> - 決める必要があるのは、要求事項5 の差し戻しに使うラベルです(語彙の表へ例外の行を足すか、`state:needs-po` を経るか、など)。語の変更が規範の意味を変えるため、コアポリシーの審議を経て決めてください
> - `state:needs-dev` の差し戻し(開発者が `state:needs-po` へ替える)は、遷移の表の「実装中に価値・事業の判断が要ると分かった」に当たり、食い違いません
