# 束 B21 単位11・12 の独立の突合 1巡目

作成 2026-11-18。突合の担当(実装を見ていない別の文脈)。対象は template `898d7dd..b0a4da5`(99340a4・b0a4da5)と本体 `d6798053`。template は `git -C template archive b0a4da5` の写しで、本体は `git show d6798053:<path>`・`git archive d6798053` の写しで確かめた。裁定は `research/b18-deliberation/ruling-a1.md` §2.1・§2.2・§2.4・§2.7・§3.9・§5・§7。実装の担当の記録 `impl-unit11-12.md` は、所見をまとめた後に読んで食い違いを見た(末尾)。

作業物(リポジトリの外): `C:/Users/kokor/AppData/Local/Temp/claude/2a3e8336e025a939/2a6282ea-036e-48d4-b57e-c77a70fdd07e/scratchpad/review11-1/`(`probe.mjs`・`probe2.mjs` が反例。`tpl/` が template の写し、`main/` が本体の写し)。

## 件数

| 重大度 | 件数 |
| --- | --- |
| 高 | 3 |
| 中 | 6 |
| 低 | 7 |

## 高

### H1 月次の集計(IMPL-0216)が必ず止まる。月の正規表現の `\d` が `d` になっている

- 根拠: `template/scripts/gate/pre-review.mjs:443` の `if (!/^d{4}-(0[1-9]|1[0-2])$/.test(month))`。`\d` ではなく文字 `d` の4回を求めるため、`2026-11` は常に不一致になり、`--month は YYYY-MM で渡してください` を出して `process.exit(2)` する。既定の月(前の月)を求めた場合も同じ。workflow の `metrics` のジョブ(`.github/workflows/pre-review.yml:157-180`)は毎月失敗し、指標の Issue へ一度も書かない
- 再現: `node -e 'console.log(/^d{4}-(0[1-9]|1[0-2])$/.test("2026-11"))'` が `false`、`"dddd-11"` が `true`。`git -C template show b0a4da5:scripts/gate/pre-review.mjs` でも同じ文字列であり、写しの崩れではない(Git Bash のヒアドキュメントでバックスラッシュが落ちた形。記憶「Bash のヒアドキュメントの罠」)
- 表示と実態: IMPL-0216 の note(`roles-responsibilities.md:1389`)は「実装済み・結線待ち: pre-review.mjs の metrics が、月次で…指標の Issue …へコメントする」と書く。実態は書かない。試験 `test-pre-review.mjs` は純関数 `metricsFor` だけを見て `main` の引数の検査を通らないため、試験が全部通っても検出できない
- 直しの案: `/^\d{4}-(0[1-9]|1[0-2])$/` に改める(Write で書き、`node --check` と実行で確かめる)。`main` の月の検査を関数に切り出し、`IMPL-0216:ng`(`2026-13` を拒む)と `:ok`(`2026-11` を受ける)の場面を試験へ足す

### H2 手引き(IMPL-0218、delivered)の「新しい T で数え直す」が実態と違う。T を改めても通知は二度と出ない

- 根拠: `template/.claude/skills/gate/reference/sync-escalation.md:17` は保留のとき「判定予定日 T」の欄を改めよと書き、同 `:24` は「欄を改めた時点から、新しい T で数え直す」と書く。実装の通知の印は `notice:n2`・`notice:n1`・`measure` の固定の鍵で、締切の日を含まない(`pre-review.mjs:276-307`、`hasKey` は `:128`)。一度出た鍵があれば、新しい T の窓に入っても出さない。締切後の `measure` も旧い締切で出たまま残る。判定資料の Issue の本文の T(`draftBody`、`:182`)も旧い T のまま
- 再現: `probe.mjs` の場面「T edited later, n2 window again」。`notice:n2` を出した後に T を `2026-12-14` へ改め、新しい2営業日前(2026-12-08)に実行すると、actions は `create-issue`(資料が無い前提)と `ledger` だけで、`notice:n2` が出ない
- 表示と実態: delivered の手引きが、保留と再開の後も督促が続くと読ませる。3.10.11 の「督促を起案者の手作業にしません」が、保留の後に限って成り立たない
- 直しの案: (a) 通知の鍵に締切の日を含める(`notice:n2:<deadlineDay>` など)。T を改めると新しい締切で一度ずつ出る。冪等は保たれる。または (b) 手引きの `:24` を「T を改めても、出した通知は出し直さない。再開の後の督促は起案者が行う」へ改め、undelivered の部分として note に書く。信頼性の軸では (a)

### H3 IMPL-0218 の降ろし先が `pre-review-automation`(path = `scripts/gate/pre-review.mjs`)のまま。delivered にした実物は `/gate` の手引きにある

- 根拠: `roles-responsibilities.md:1450` のマークは `target=pre-review-automation state=delivered check=manual`。`src/data/impl-targets.yaml:351` 以下の `pre-review-automation` は path を `scripts/gate/pre-review.mjs` とし、説明に 0218 の手引きを含まない。`pre-review.mjs` は 0218 の何も運ばない(往復の検知を作らないと決めたため)。手引きの所在 `.claude/skills/gate/reference/sync-escalation.md` は `gate-skill`(`impl-targets.yaml:126`、path `.claude/skills/gate/SKILL.md`)の側にあり、SKILL.md:113 から辿れる
- 表示と実態: 台帳は 0218 を「pre-review.mjs に降りた」と表示する。note の文は正しい所在を書くが、降ろし先の属性が実在の所在と合わない。検査は降ろし先の path の実在までしか見ないため通る
- 直しの案: `target=gate-skill` に改める(先例: IMPL-0832・0220 が `/gate` の手引きを `gate-skill` で受ける)。または `gate-skill-g6` に倣い、`sync-escalation.md` を path とする降ろし先を `impl-targets.yaml` に足す。`npm run impl:write`

## 中

### M1 だれでも書ける印で、通知を止め、一覧の時刻を偽り、一覧の更新先を他人のコメントへ向けられる

- 根拠: `hasKey`(`pre-review.mjs:128`)はコメントの書き手を見ない。一覧の既存のコメントの探索(`:319`)と、通知の時刻の読み(`ledgerBody`、`:220-228`)も同じ。意見の除外(`OWN_MARK`、`:160`)も本文の文字列だけで決める
- 再現(`probe.mjs`):
  - 人のコメントに `<!-- pit-in:pre-review notice:n1 -->` を書くと、前営業日の通知が出ない(「spoof notice:n1 by human」)。`measure` も同じ(「spoof measure」)。未応答のレビュア本人が督促を止められる
  - 人のコメントに `<!-- pit-in:pre-review ledger -->` を書くと、一覧の更新が `update-comment` で**そのコメント(id 777)へ PATCH** する。GITHUB_TOKEN で他人のコメントを書き換えるか、権限で失敗して以後の操作がその実行で全部止まる
  - 人のコメントに `<!-- pit-in:pre-review notice:fake -->` と `通知先: @bob` を書くと、一覧の bob の「通知を受けた時刻」に偽の時刻(2026-11-01)が載る(0213 の記録の改ざん)
- 直しの案: 印を読む3か所を、`github-actions[bot]`(`c.bot && c.login === 'github-actions[bot]'`)のコメントに限る。`OWN_MARK` での除外も同じ条件にする(H 相当の改ざんの防止は機械で閉じないため、残る部分は note で開示する)。試験に「人が書いた印は無視する」の場面を足す

### M2 申告(b): R2・R3 の締切後の通知が、3.10.5 が求めない 3.9.3 の措置を宛先へ求める文になっている

- 根拠: `pre-review.mjs:300-307`。R2・R3 でも「3.9.3 の措置(D-0 表3 に記名した者への通知と、代理の指名)を、宛先の方はお願いします」と書く。標準 3.10.5(`roles-responsibilities.md:1334-1340`)は R3 を「異議なしとみなして判定へ進む」、R2 を「進む。不応答を記録する」とし、3.9.3 の措置を R1 に結ぶ。3.10.11 の表(`:1460`)は区分を限らず「締切: 未応答が残る場合、3.9.3 の措置を起動する」と書く。この表は 3.10.9(必須応答ロールを含む案件はリスク区分にかかわらず R1 と同じ扱い)の文脈にある
- 判定: 通知を R2・R3 にも出すこと自体は 3.10.11 の文面に合い、必須応答ロールの該当を機械が判定できない(IMPL-0217 は降りていない)以上、出す側に倒すのは妥当。ただし文が R2・R3 にも代理の指名を頼むため、宛先へ標準に無い行為を求める形になる(新しい義務に読める)
- 直しの案: R2・R3 の文を「R2・R3 は 3.10.5 により異議なしとして判定へ進めます(R2 は不応答を記録)。必須応答ロール(3.10.9)を含む案件は R1 と同じ扱いで、3.9.3 の措置を宛先の方が判断してください」へ改める。措置の要否の判断を宛先(人)に残し、機械の文が義務を作らない

### M3 起案者の欄に `@` が無いと、起案者が読めないまま黙って進む

- 根拠: `pre-review.mjs:154` は `loginsOf(...)[0] ?? null` で、読めなくても `problems` に足さない。起案者が null だと、`respondedIds`(`:132-142`)が応答を1件も結ばず、起案者自身の意見も意見に数える(`:163`)
- 再現: `probe.mjs` の「author w/o @」で `author: null`・`problems: []`。月次の集計では、起案者の応答があっても「応答が付いていない意見の比率」が 100% になる(3.10.8 の警戒サインを誤って立てる)
- 直しの案: 起案者を読めないときを `problems` に足し、注意に出す(指名レビュアと同じ扱い)。Issue の様式の `author` に `@` を求める旨は既にあるため、様式は変えない

### M4 ラベル `pre-review` が無いリポジトリでは、様式で起票しても何も起きない

- 根拠: `.github/ISSUE_TEMPLATE/pre-review.yml:4` の `labels: [pre-review]`。GitHub の Issue の様式は、リポジトリに無いラベルを付けない(作らない)と理解している(実物では未確認)。workflow はラベルを作らない(`.github/workflows/pre-review.yml`)。既存の `context-drift.yml:56`・`gate-entry.yml:58` は `gh label create ... || true` で先に作っている。実装の記録の「ラベル … は API が作る」は判定資料の起票(REST)の側の話で、様式の側には当たらない
- 影響: 採用者の上程が `fetchIssues` の `labels=pre-review` に載らず、起票も通知も黙って行われない。出力にも「対象 0 件」以上の手がかりが出ない
- 直しの案: notify のジョブの先頭で `gh label create pre-review ... || true` と `pre-review-material` を作る(既存の流儀に合わせる)。あわせて、対象の Issue が 0 件のときに「ラベル pre-review の Issue が無い」を出力する

### M5 触らない取り決めの `.claude/skills/gate/SKILL.md` に2行を足している。うち1行は議長が後回しにした単位9 の一文

- 根拠: `b0a4da5` の `.claude/skills/gate/SKILL.md:113-114`。突合の指示が「触ってはならないファイル」に挙げる。`research/b21-deliberation/ruling-unit9-10-fix1.md:26`(採らない案)は「H1 に対し、いま `/gate` の SKILL.md へ一文を足す案: 並行の束 B20 が触るファイルであり、B20 の push の後に行う」と裁定している。`:114` の差し戻しの一文はまさにその一文。実装の記録は「B20 の一覧に無いファイルのため置いた」と書き、議長の裁定と食い違う
- 影響: B20 の template の rebase で衝突しうる(準拠テンプレートの直列の規則)。単位9 の IMPL-0682 の note は「差し戻しは手引き(人)」のままで、手引きの一文が有ると無いのどちらの表示に合わせるかが未裁定
- 直しの案: `:114` は外して B20 の後の単位へ戻す(裁定どおり)。`:113`(0218 の所在)は、裁定 §4 の単位12 が `.claude/skills/gate/` を触る範囲に含めるので残す余地があるが、B20 との順序を議長が裁定する。残すなら H3 の降ろし先の改めと一緒に扱う

### M6 公開リポジトリでは、外部の者が様式で起票するだけで、機械が判定資料の Issue を作り、任意の利用者を記名で呼ぶ

- 根拠: `readProposal`(`pre-review.mjs:145-175`)は Issue の起票者の関係(`author_association`)も、指名レビュアが名簿に居るかも見ない。様式のラベルは起票者の権限に依らず付く。`fetchIssues` は `user`・`author_association` を読まない(`:387-397`)
- 影響: 外部の者が多数の `@login` を書くと、リポジトリのボットが毎営業日の窓で記名の通知を出す(迷惑の増幅)。判定資料の Issue も作られる
- 直しの案: 起票者の `author_association` が OWNER・MEMBER・COLLABORATOR のときだけ対象にし、外れたものは注意に出す(決定可能な条件)。名簿との照合までは求めない

## 低

- **L1 判定資料の Issue の印の行を起案者が消すと、資料をもう1件起票する**。`materialOf`(`:207`)は本文の HTML コメントで探す。消した後の実行で新しい草案が作られ、`publishedState` は新しい方(草案)を見て「未公開」とする(`probe.mjs`「material marker removed」)。直しの案: 本文の代わりに題名の `判定資料: #N` でも探すか、資料の Issue へ申請 Issue の番号のラベルではなく固定の題名の照合を併用する。本文の案内に「先頭の行を消さない」を書く
- **L2 意見の本文に `<!-- pit-in:pre-review` の文字列があると意見から外れる**(`:160`)。応答済みが未応答として督促される。M1 の直しで同時に解ける
- **L3 `--paginate` の連結で、本文の `] [` が `,` に化ける**(`:381-384`。`review-queue.mjs:232-236` と共通)。`probe2.mjs` で `案 [A] [B]` が `案 [A,B]` になった。直しの案: `gh api --paginate --slurp` を使うか、ページを1つずつ読む。単位9 の側と一緒に直す
- **L4 工程ゲートの欄を検査しない**。`G-99` でも対象になる(`probe.mjs`)。T が土日でも黙って受ける。直しの案: 種別が工程ゲートのとき `G-[1-8]` を求め、T が営業日でないときは注意に出す(決定可能)
- **L5 一覧(0213)が締切後の通知(`measure`)と、前営業日の判定する者への通知を載せない**(`ledgerBody` は `notice:` の印だけを読む。`:220`)。「誰がいつ通知を受けたか」の記録としては欠ける。直しの案: `measure` も読む。判定する者の行を足すかは裁定に委ねる
- **L6 `loginsOf` が電子メールのドメインやチームの組織名を login と読む**(`bob@example.com` → `example`、`@org/team` → `org`)。直しの案: 前が空白か行頭の `@` に限り、後ろに `/` が続くものを外す
- **L7 workflow の冒頭のコメントが「月次の集計」を有るものとして書く**(`.github/workflows/pre-review.yml:88-97`)。H1 を直せば解ける。H1 を直すまで、この行も実態と合わない

## 申告の3点の判定

| 申告 | 判定 | 理由 |
| --- | --- | --- |
| (a) 0213 と 0219 の通知を1コメントにまとめた | **妥当** | 3.10.11 の表は「未応答のレビュアへ通知」で、0213 の「記名」は一覧の行(指名レビュア全員の名、応答済みは `@` なし)で満たす。二重の通知を避けるだけで、新しい義務も欄も足していない。前営業日の判定する者への通知を同じコメントに載せるのも 3.10.11 の表の文面どおり |
| (b) 措置の通知を R2・R3 にも出す | **出すことは妥当、文は直す(M2)** | 3.10.11 は区分を限らず、必須応答ロール(3.10.9)の該当は機械が決められない。ただし文が R2・R3 にも代理の指名を頼み、3.10.5 に無い行為を宛先へ求める |
| (c) Issue の様式に「指名レビュア」を足した | **妥当。ADR-0040 に反しない** | ADR-0040 は `templates/*.md` を第6章の様式の部分集合と定める決定で、`.github/ISSUE_TEMPLATE/` は対象外(裁定 §3.9 の欄の一覧も第6章には無い)。欄の中身は 3.10.2 の表の「T−5営業日 … 意見を求めるレビュアを記名で指名する(起案者)」という既存の義務の書き場で、新しい義務を作らない。0213・0219 の宛先に欠かせない。起票の時点で必須にするのは 3.10.2 の T−5 より早いが、欄は後から改められ、採否の条件にもならないため細かい定義の追加に当たらない |

## 確かめて問題なし

- **期限と営業日**: R2 で T=2026-12-07 のとき公開 11-30・締切 12-03・2営業日前 12-01・前営業日 12-02・応答の確定 12-04。R1 は公開 11-23・締切 11-30。祝日 12-02 を入れると公開 11-27・2営業日前 11-30・前営業日 12-01 に正しくずれる(3.10.2・3.10.11 の表どおり)
- **時刻の境界と TZ**: 2026-11-30T14:59Z(日本時間 23:59)では 2営業日前の通知を出さず、15:00Z(日本時間 0:00)で出す。`--offset-minutes 0` では UTC の暦で数える。`test-pre-review.mjs` は TZ 未指定・UTC・Asia/Tokyo・America/Los_Angeles のいずれでも全件通過
- **欄の欠け・空・不正**: 実在しない日(2026-02-30)・R4・指名レビュアの空・種別の空は、起票も通知もせず注意を出す。標準変更は対象外の理由を出す(0571)。全角の日付は NFKC で読む
- **冪等**: ボットが出した印があれば同じ通知を出さない。一覧は内容が同じなら更新しない。閉じた上程は通知しない(開き直すと続きから。印が残るので重ねない)
- **意見の欄の注意(0215)**: 賛否だけ・理由だけ・反対で代替案の空を、それぞれ注意する。意見を応答から外さない。論点の数を数えない
- **AI の担い手**: 名簿の外の `claude-bot` 等の AI の名義を指名レビュアから外し注意に出す。ボットの意見は集計の分子にも分母にも入らない。起案者以外の宣言行は応答に数えない
- **判定資料(0210)**: 3.10.3 の5項目の見出しを表の順で置き、中身は「(起案者が記入する)」だけ。人が書く欄を機械が埋めていない。項目5 を求める判断とした改めは標準の表(`roles-responsibilities.md:1296-1302`)に合う
- **workflow**: 契機は `schedule` と `workflow_dispatch` だけで、`pull_request*` を使わない(fork の PR で動かない。fork の schedule は既定で止まる)。`permissions` は `contents: read`・`issues: write` だけ。`${{ }}` は env 経由で、Issue の題名・本文は workflow に入らない。`inputs.month` は env 経由で渡り、スクリプトが検査する(H1 のため常に拒むが、注入の余地は無い)。`gh` は `execFileSync` で引数を配列で渡し、シェルを通さない。アクションの版は既存の 26 か所と同じ `@v4` の流儀。ジョブ名に `gate-g5` を使わない。必須チェックにしていない(ルールセットに触れていない)。schedule の実行は `inputs.dry-run` が空のため書き込む(意図どおり)
- **所有者の方針**: 0214(必須チェック)を降ろしていない。0218 の往復を機械で検知していない(手引きにも「機械は往復を数えません」)。責任者・承認者の欄に AI の名義は無い。合否を持たない
- **6項目のマーク**: `state=undelivered check=manual plan=scheduled issue=325` を保ち(裁定 §7: 結線まで delivered にしない)、note の先頭に「実装済み・結線待ち」と「実物の GitHub では確かめていない」を書く。旧い「準拠テンプレートに…無い」の文は残っていない(0216 の「実装済み」は H1 のため実態と合わない)。0218 の `check=manual` は「確かめる者: 決定者」と「所在を読んだ(実行して確かめていない)」を持つ(`implementation-marking.md:76` の要件)。降ろし先 `pre-review-automation` の path `scripts/gate/pre-review.mjs` は実在する(0218 を除く。H3)
- **触らないファイル**: 差分は `.claude/skills/gate/SKILL.md`(M5)を除き、gate-g5.yml・config.mjs・check-pr・check-g1・autonomy・aggregate-evidence・templates の 00/03/04/08/09・README・settings.json・verify-gate-contract に触れていない。`preflight.mjs` の変更は `TEMPLATE_WORKFLOWS` への1語の追加だけ(裁定 §2.2)
- **既存の検査**(写し。test-adoption は写しを git の作業ツリーにして実行): `test-pre-review` 全件、`test-adoption` 69 件、`test-context-refs`、`test-gate-node` 27 件、`test-push-trigger` 27 件、`test-review-queue` 39 件、`verify-gate-contract` 終了 0。本体の写し(template に b0a4da5 の写しを置く): `check-impl.mjs` 終了 0、`test:impl` 56 件、`test:fields` 11 件、`test:plan-issues` 22 件。全量の `npm run check` は流していない

## 実装の担当の記録との食い違い

- 記録は「`test-pre-review.mjs` 50 件 …期待と一致」とし、月次の集計を作ったものに数える。試験は `main` を通らず、H1 を検出していない
- 記録の「判断した点」は T を改めたときの通知の出し直しに触れていない。手引きの `:24` は出し直すと読ませる(H2)
- 記録は SKILL.md の2行を「B20 の一覧に無いファイルのため置いた」とする。議長の裁定 `ruling-unit9-10-fix1.md:26` は B20 が触るファイルとして後回しにしている(M5)
- 記録の「ラベル … は API が作る」は判定資料の起票の側だけに当たり、様式のラベルは作られない(M4。実物では未確認)
- 記録は 0218 の降ろし先を論じていない(H3)
- 申告の3点は記録の「判断した点」と一致する。(b) は記録自身が「過剰と読まれうる。突合で見てほしい」と書いており、M2 がその答え
