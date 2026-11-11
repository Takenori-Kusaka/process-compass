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

## 5. AI維持管理者の承認待ち

強制層(`.claude/**` と `scripts/gate/**`)の変更である。AI維持管理者の承認を待つ。

| 項目 | 値 |
| --- | --- |
| 対象 | pit-in-template b967ea1(main へ push 済み) |
| 名簿の人 | |
| 承認者 | |
| 承認日 | |
