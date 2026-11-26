# #361・#452 独立の突合 1巡目(束 B34、2026-11-26)

実装を見ていない別の文脈で、変更の全体を突き合わせた。対象: 本体 `git diff origin/main..HEAD -- . ':!research'`(HEAD 15104885)、template `git -C template diff origin/main..b34`(616f039、7 コミット)。基準: `30-ruling.md` R-1〜R-11・§2・§4。`40-impl.md` は変更の所在を知るためだけに使った。

件数: **高 1・中 3・低 5**。

## 1. 実行での確認

| 確認 | 結果 |
| --- | --- |
| `npm run lint:refs`・`lint:impl`・`lint:evidence`・`lint:scope`・`test:fields`(Windows) | すべて rc=0 |
| `impl:write`・`evidence:write`・`scope:write` の再生成 | 台帳の差分なし(変更なし) |
| textlint(本文の変更 8 ファイル) | 違反なし |
| WSL ubuntu・node 26.13.1・`git archive b34` の LF の写し: test-template-copy・test-scaffold-todo・test-base-judge-workflow・test-env-check・test-ship-evidence-steps・test-edition-end・test-adapter・test-discouraged-evidence | すべて rc=0・NG=0 |
| 採用者を模した写し(go.mod・cmd/app/main.go・.secretlintrc.json を置き、`process.config.json` を configured: true・stack go): test-edition-end・test-adapter・test-license-scan・test-name-confirmation-timing・test-template-copy | すべて rc=0・NG=0(R-2 の合格条件の適合の側) |
| D-1 の違反の対: 写しの `scripts/gate/config.mjs` の `standardEdition` を書き換え | test-edition-end が rc=1・NG=6 で落ちた(検査装置の書き換えを引き続き検出する) |
| D-1 の違反の対: 写しの `check-pr.mjs` の `isNonProduct` を常に false へ | test-template-copy が rc=1(「検査の道具…は複製に入る」が NG) |
| D-2: やり直しが尽きたら失敗 | 静的な検査の変異(`return 1`→`return 0`、グループを固定名へ、素の `git push` を残す)を test-base-judge-workflow が検出する。シェルの関数そのものは実行していない(L-5) |
| 責任者・承認者の欄の AI の名義 | 本体・template の差分に、責任者・承認者の欄への AI の名義の記入は無い。template のコミットのトレーラ `Co-Authored-By: Claude Sonnet 5.5` は担い手の識別で、承認の欄ではない |
| 統制の設定の変更の承認者の欄 | `30-ruling.md` §4 の末尾に「承認者の欄は空けたままにし、所有者が書くよう案内を残す(AI の名義で書かない)」が残る。R-9 のとおり template 自身に check-pr の経路が無く、記入する具体の欄は差分の中に無い(所見にはしない) |

## 2. 所見

### H-1 [高] R-6 で削った D-7 の版の比較と D-9 の初期化の検査が実装され、実装の記録は「実装しない」と書く

- 所在:
  - `template/scripts/init/generate-profile.mjs:4793-4806(`if (out.kept.includes('package.json'))` の節)`(既存の `package.json` を読み、`scripts.coverage` が無ければ todo に出す。D-9 の初期化の検査)
  - `template/scripts/init/generate-profile.mjs:4831-4848`(`go.mod` の go 行と `adapters/go.json` の runtimeVersion を比べて告げる。D-7 の版の比較)
  - `template/scripts/gate/test-scaffold-todo.mjs:6-8・48-75`(上の2つを「固定する決定」として試験する)
  - `template/.github/workflows/gate-g5.yml:176`(コメント「go の版の食い違い・既存の package.json の coverage」)
  - `template/README.md:606`(「既にある `package.json` に `scripts.coverage` が無いと、初期化は…「作るもの」に挙げます」)
  - `research/361-deliberation/40-impl.md` §1 の D-7・D-9・R-6 の行
- 根拠: 裁定 R-6 は「起案のとおり削る(版の比較、初期化の検査を足さない)」、§2 は「D-7 の版の比較・D-9 の初期化の検査(R-6)」を採らないと決めた。起案 `20-member-drafter.md:14-15・66-67` の削る理由は「値の比較を足すと他のアダプタへ同じ要求が広がる」「初期化が既存の package.json の中身を読む義務は新しい」。実装は両方を入れ、試験で固定した。`40-impl.md` は R-6 を「実装しない(D-7 の版の比較は go 行と runtimeVersion の一致の告げだけ。「初期化の検査」は足していない)」と書き、D-9 を「実装(既存の package.json に scripts.coverage が無ければ todo に出す)」と書く。同じ表の中で矛盾し、記録の表示と実態が食い違う。採らない案が実装に入っている
- 直し方の案: D-7 は「既にある go.mod を挙げない(存在の検査)」と「道具の置き場と例」だけを残し、go 行と runtimeVersion の比較(4834-4847 行の else 節の比較と `out.next.push`)を外す。起案のとおり、todo の文に「既存の go.mod の版をアダプタの runtimeVersion に合わせる」の1文を足すのは可。D-9 は 4793-4806 行を外し、README の jest の例だけを残す。README 606 行の末尾の1文と gate-g5.yml 176 行のコメントを合わせて直す。test-scaffold-todo は go.mod の有無と置き場の検査だけにし、版の比較と coverage の todo の試験を外す(go.mod の有無の違反と適合の対は残す)。`40-impl.md` の R-6・D-7・D-9 の行を実態に合わせる

### M-1 [中] D-4 の失敗の文に、採用者への順序の指示に読める文が入っている

- 所在: `template/.github/workflows/ship-evidence.yml:380`(「採用者の既存の保護の必須チェックに従って取り込みます。取り込みの後の PR からは検査できます」)
- 根拠: R-5 は「先に取り込みます」など運用の義務に読める文を採らないとした。反対の委員 O-5(`21-member-opponent.md:45`)が順序の義務として挙げた文「採用者の既存の保護の必須チェックに従って取り込み」と同じ形が、CI の ::error:: の文として採用者に届く。本文 `template-repository.md:268` は「採用者に順序や手順を課す文ではありません」と書き、機械の出力と本文が食い違う
- 直し方の案: 事実だけにする。例: 「…検査できません(基底に道具が無いため)。基底に道具がある PR では、この手順は出ません」。取り込み方の指示の文は削る

### M-2 [中] IMPL-0200 の note が、文書の食い違いを「試行でも確かめた」と書き、R-8 と本文に食い違う

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md:1336`(IMPL-0200 の note「計画と実装を同じ PR に入れると、その計画は既定ブランチの計画の和に無い(文書の読みから導ける食い違いで、試行でも確かめた)」)。対比: `src/content/docs/phase5-implementation/agent-trace-control.md:81` 付近「これは文書の読みから導ける食い違いです(観測ではありません)」、EV-0350 の差し替え条件「上の文書の食い違いは観測でなく、この水準の根拠に数えません」
- 根拠: R-8 は所見 1・2 を「観測ではなく文書の食い違い」とし、E2 の根拠にしないとした。note の「試行でも確かめた」は、所見を観測に格上げして読ませる。同じ事実が note と本文で「確かめた」「観測ではない」に割れる。あわせて、文が「(…試行でも確かめた)、誤った遮断で」と続き、句点が欠けて読点でつながる
- 直し方の案: 「(文書の読みから導ける食い違いで、観測ではない)。誤った遮断で…」へ改める。試行の中で notInBase が出た事実を残すなら、R-8 の文「試行で差が出る場面を作れなかった(計画と実装が同じ PR に入ると計画の和が空になる)」の形に寄せ、根拠の水準に数えない旨を本文の EV-0350 と揃える

### M-3 [中] 「自己試験が落ちた件は直した」と書き、原因が未特定で直していない自己試験の失敗を本文で開示していない

- 所在: `src/content/docs/phase5-implementation/template-repository.md:275`(「初期化の後に gate-g5 の自己試験が落ちた件は、準拠テンプレートを直した」)、同 255 行 EV-0169 の追記(「初期化の後に自己試験が落ちること(準拠テンプレートを直しました)」)
- 根拠: R-1 は、構成と無関係に落ちる `test-discouraged-evidence` を D-1 から切り離し、原因が分からなければ「未特定」と開示するとした。`40-impl.md` §3 は、試行の node の CI の実機(ubuntu、初期化の PR)で同試験が落ち、原因は未特定で直していないと書く。§9 は `test-ship-evidence-steps` の負荷の下での rc=1 も未特定と書く。本文には、どちらも出てこない(`grep discouraged src/content/docs` は IMPL-0298 の既存の note と台帳だけ)。本文の読み手は、試行で落ちた自己試験がすべて直ったと読む。今回の WSL の写しでは両試験とも通ったが、試行の CI の失敗の再現と解消は確かめていない
- 直し方の案: 275 行に「ただし、試行の CI で落ちた `test-discouraged-evidence` は、構成と無関係で原因を特定しておらず、直していない(#361)」を足す。EV-0169 の追記の括弧も「(複製が前提を壊していた分は直しました。原因を特定していない失敗が1件残ります)」の形にする。#361 へ寄せる4件のコメント(R-11)に含める

### L-1 [低・編集] 改めた IMPL の note 6 件で「確かめる者:」の前の句点が欠ける

- 所在: `gate-criteria.md:1495`(IMPL-0354「…この対応で直るかも分からない確かめる者:」)、`human-ai-boundary.md:557`(IMPL-0026「…作れなかった)確かめる者:」)、`human-ai-boundary.md:558`(IMPL-0235「…確かめていない確かめる者:」)、`overview.md:642`(IMPL-0324「…重の審議を要する確かめる者:」)、`roles-responsibilities.md:821`(IMPL-0468「…承認の失効は未確認確かめる者:」)、`roles-responsibilities.md:1621`(IMPL-0145「…README に書いた)確かめる者:」)
- 根拠: 足した文の末尾に句点が無く、既存の「確かめる者:」と1語に連なる。台帳(`implementation-ledger.md`)へもそのまま写る。textlint は HTML コメントを読まないため検出しない
- 直し方の案: 6 か所の「確かめる者:」の直前に「。」を足し、`npm run impl:write` で台帳を再生成する

### L-2 [低] 事前点検の巡の数が R-7 と食い違う

- 所在: `template-repository.md:99`(「期待どおり止める項目か告げる項目に出ました(4巡)。python と python-public は同じ手順の別のリポジトリです」)
- 根拠: R-7 は「B-3a は独立の巡を3と数える(python と python-public は同じ言語の別リポだが同じ手順)」とした。本文は但し書きを置くが、数は4のまま
- 直し方の案: 「(4巡。python と python-public は同じ手順のため、独立の巡は3)」へ改める

### L-3 [低] プランの制約の判定が、観測していない文言(Team)まで広げており、R-4 の文書 URL の照合は実装していない

- 所在: `template/scripts/gate/adoption-trial.mjs:1388`(`/Upgrade to GitHub (?:Pro|Team)[^.]*or make this repository public/i`)
- 根拠: 観測した文は「Upgrade to GitHub Pro or make this repository public」だけ(IMPL-0316 の note と本文の記載)。`Team` は観測の外。R-4 は「状態コードと応答の文書 URL の両方を見る」とした。文書 URL を見ないことは IMPL-0316 の note と `40-impl.md` §5 に開示されているので、開示と実態は合う。倒れる向きは一致しなければ permission で、安全側
- 直し方の案: 観測した `Pro` に限るか、`Team` を残すなら IMPL-0316 の note に「Team の文言は観測していない」と書く。文書 URL の照合を採らないことを、裁定の記録の側(議長)で採らない案か未達として残す

### L-4 [低] README の手順1が、本文で「例」とした複製の元を、手順の指示として書く

- 所在: `template/README.md:43`(「複製の元は、作業ツリーでなく取り込むコミットの中身にする(例: `git -C template archive …`)」)。対比: `template-repository.md:274`(「`git archive` からの複製を、README の手順1に例として書いた」)
- 根拠: D-6 は手引きだけ(起案の案)。README の手順は手引きで、義務ではない。ただし本文は「例として書いた」、README は「にする」と書き、強さが食い違う。改行が原因の検査の失敗は特定していない(本文が開示)ので、指示の根拠は E2 の観測だけ
- 直し方の案: README を「複製の元を、作業ツリーでなく取り込むコミットの中身にする方法があります(例: …)」の形にするか、本文の「例として」を README の書き方に揃える。どちらにするかは議長が決める

### L-5 [低] D-2 のやり直しのシェルの関数は、どの試験でも実行されていない

- 所在: `template/.github/workflows/record-copy.yml:207-219`(`push_records`)、`:306-319`(createCommitOnBranch のやり直し)。試験 `template/scripts/gate/test-base-judge-workflow.mjs:91-98` は正規表現による構文の検査だけ
- 根拠: R-3 は実機での再現と解消を「未確認」と開示するとし、IMPL-0354 の note はそのとおり開示している(表示と実態は合う)。ただし「尽きたら run が失敗になる」は、構文の存在から読んでいるだけで、手元でも実行していない。`set -euo pipefail` の下で `git rebase` が衝突したときに即座に失敗する経路(やり直さずに止まる)も、構文の検査では見えない
- 直し方の案: 次の巡か #361 で、`stepBody` の形(test-ship-evidence-steps の方式)で `push_records` を取り出し、常に失敗する模擬の `git` で5回の後に rc≠0 と `::error::` が出ることを実行で確かめる試験を足す。この束で足さないなら、IMPL-0354 の note の「静的な検査で確かめた」に「シェルの関数を実行する試験は無い」を足す

## 3. 裁定の各項目の反映(要約)

| 項目 | 突合の結果 |
| --- | --- |
| R-1 | 切り分けは `40-impl.md` §2 にある。本文への未特定の開示が欠ける(M-3) |
| R-2 | 除外式・共通の関数 1 つ(`template-copy.mjs`)・未設定の既定の構成。許す一覧は入っていない。違反と適合の対は実行で確かめた(§1) |
| R-3 | PR ごとのグループ+やり直し+尽きたら失敗。「未確認」の開示あり。D-17 は切り分けて記録(IMPL-0354 の note)。実行の試験なし(L-5) |
| R-4 | 403 と文言の組。値 `plan`。文書 URL は未実装で開示あり(L-3) |
| R-5 | 本文は事実だけ。CI の文に順序の指示が残る(M-1) |
| R-6 | **反映されていない**(H-1) |
| R-7 | 判定の表は本文に載せない。巡の数が食い違う(L-2) |
| R-8 | IMPL-0200 は undelivered のまま。note の「試行でも確かめた」が食い違う(M-2) |
| R-9 | `40-impl.md` §4 に記録あり |
| R-10 | IMPL の state の変更は 0 件(改めた note は 0026・0145・0200・0235・0316・0324・0354・0468・0487・0492 の 10 件=起案の 9 件+R-8)。EV の差し替えなし。新しい EV-0349・EV-0350 は E2 で、E2 を超える言い過ぎは見当たらない(仮の番号。origin/main の最大は EV-0348) |
| R-11 | #361 は閉じていない。4件のコメントは議長の段 |
| §4 | 承認者の欄を空ける案内が残る。AI の名義の記入なし |
