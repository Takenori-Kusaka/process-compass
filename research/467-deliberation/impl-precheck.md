# #467 実装の前の確認(2026-11-27。担当: 確認。本文と template/ は変えていない)

- 入力: `ruling.md`(15 件)、`ruling-draft.md` §0・§3.2〜3.4。調べた template は `template/`(af15a3b)
- 実行したもの: M-5 の fixture(scratch の複製の上。`scripts/` を写し、一時の git リポジトリで `next.mjs --offline --json` を通した。時計に依らない。D-0 の検査と安全重要度の記録の読みだけを複製の中で差し替えた)。それ以外は所在の読みと grep
- 判定の記号: **実装** = 裁定どおり / **縮める** = この形に縮めて実装 / **戻す** = 移さない(裁定へ戻す) / **上げる** = 実装の前に所有者へ

## 1. 件ごとの表

| 件 | 判定 | 確かめた事実(所在・実行の要点) | 実装で触るファイル | 落ちる試験と直し方 |
| --- | --- | --- | --- | --- |
| Y-2 | **実装** | `approved_by` を読むコードは無い(template 全体で当たるのは様式 01 だけ)。標準の側(テンプレ1)に承認表も `approved_by` も無い。t1 の「承認」は `kind: structure`(`template-fields.yaml:313`) | `templates/01-feature-spec.md`(frontmatter 2 行と「## 承認」節)、`template-fields.yaml` t1 の extra 1 行 | `test:fields`(registry の extra が様式に無いと落ちる): t1 の「承認」の行を同時に消す。`status:` は残す。regress は様式 01 の表の行(`| 1 | イベント駆動 |`)を置換するだけで、承認節を固定していない |
| Y-2b | **実装** | 標準のテンプレ6 に承認の節は無い。t6 の「承認(G-1)」は `structure`(`template-fields.yaml:777`)。次の一手を出すコードも読まない | `templates/06-project-brief.md:203-209`、`template-fields.yaml` t6 の extra | 同上。regress(`lib-r3`・`lib288`・`t288`・`stages`・`verify-n`)は様式 06 を写すが、承認の節は固定していない |
| Y-3 | **実装** | 標準のテンプレ7 に「承認の記録の所在:」の 1 項目がある。t7 は `same-as-standard`(`standard: "- 起案: AI(...) / 承認の記録の所在:"`)。節見出し「承認(G-4)」は残す | `templates/07-implementation-plan.md` 末尾の表を 1 行にする。`template-fields.yaml` t7 の reason | 見出しを消すと `test:fields` の標準側からの検査が落ちる。見出しを残す限り落ちない。reason の文(「判定者・判定日」)だけ直す |
| Y-5 | **縮める** | 項目 1〜3 の観点は `human-verify/SKILL.md:30-32` の順 1〜3 と同文。標準は PR のチェックリスト項目を定めていない(grep で 0 件)。**開示の条件**: 「G-6 を経ない変更は人の確認を伴わない」とそのまま書いた文は無い。近いのは `generate-profile.mjs:4684`(G-6 省略・未達の構成の PROCESS-PROFILE の注記「PR に G-6 の省略・未達を開示したうえで扱う」)、`next.mjs:1309-1311`(G-6 の記録が無い=未判定)、集約の G-6 欠落。1 行足せば足りる | `.github/PULL_REQUEST_TEMPLATE.md:149-151`(消す)、`.claude/skills/implement/SKILL.md`(観点を手順へ)、`generate-profile.mjs:4684` の注記に 1 行(下の §3) | PR 様式の行を固定する試験は無い(template と本体の grep 済み。`test-check-pr.mjs:1680` は様式のパスだけ)。regress の期待値(`PROCESS-PROFILE` の文)は、注記を足すなら該当の scene を再生成する |
| Y-1 項目5 | **実装** | 項目 5(`:153`)は固定する試験が無い。機械の止まり方は `test-check-pr.mjs` の既存の場面が持つ(裁定の案が実行済み) | `.github/PULL_REQUEST_TEMPLATE.md:153` | なし |
| Y-4 | **縮める** | `ship-evidence.yml:328` は出荷 PR の本文へ「## AI 関与範囲 / 生成: なし / 人の確認: 出荷判定者」を**書く**だけ。読むコードは無い。標準側: `pr-workflow.md:70`(例の PR にも節がある)、`:104`(人間向けの要約)、`:115`(自動)。`impl-targets.yaml:306` の pr-template の description は節を列挙しているが「AI 関与範囲」は入っていない。導出の実装は無い | `PULL_REQUEST_TEMPLATE.md:24-27`(欄を「自動。導出の実装までは、トレーラ `Co-Authored-By`・`Agent-Run` が正本」の 1 行にする)、`ship-evidence.yml:328`(同じ形)、`pr-workflow.md:70・104・115`、`impl-targets.yaml:306`、実装マーク(undelivered)を `pr-workflow.md` の表に | `ship-evidence.yml` の本文を固定する試験: `test-ship-evidence-steps.mjs` を grep(**要確認**)。標準側は `lint:impl`・`impl:write`(台帳)。`pr-workflow.md:70` の例は節の残し方を決める必要がある(縮める案: 節見出しは残し、欄を 1 行にする。見出しを消すと標準の例が template と食い違う) |
| M-2 | **実装** | `G-1.md:17` は「出力をそのまま記録の『機械が確認した項目』へ写す」。裁定の案の記述どおり | `.claude/skills/gate/gates/G-1.md:17` | なし(文の改めだけ。スキルの文の検査が `lint:impl` の側にあれば、IMPL の note を合わせる) |
| M-3 | **縮める** | 台帳を起こすのは process-init ではなく、`next.mjs:1020-1030` が案内する `cp templates/10-assumption-ledger.md docs/assumptions.md` と `/artifact` の補助ファイル(`10-assumption-ledger.md:33・52` が「起案は AI の担い手。確定は人」)。台帳の欄を読む機械は無い(`next.mjs` は存在だけ)。「起案」は、様式への出所つきの初期値と手順の文で足りる | `templates/10-assumption-ledger.md`(「観測した事象」「最終観測日」の初期値の例)、`artifacts/10-assumption-ledger.md`、`next.mjs:1025` の文 | `lint:impl`・`test:fields`。「未観測」の値は作らない。裁定が書いた「`/process-init` が起こす」は所在の誤り。**直す先は様式と補助ファイル** |
| M-5 | **縮める**(§2 の実行結果) | 状態の列を読むのは `autonomy.mjs:514-530`(最後の升が「やり直し」)だけ。`planTasks`(`next.mjs:744`)は 5 升までで状態を読まない。他の plan.md の読み手(`verification-trace`・`check-pr`・`aggregate`)は状態の列を読まない。**導出は着手前・着手・完了の 3 つで人の記入と一致した**。一致しない所が 3 つある(§2) | `templates/07-implementation-plan.md`(状態の注記と初期値)、`next.mjs:1317`(前方一致の修正)、トレーラ無しの取り込みを「不明」と出す処理 | `test-plan-trace.mjs`・`test-next-records.mjs`・regress `stages.mjs:146`(様式 07 をそのまま写す)。状態の列を残す形なら落ちない。列を消すと `test-check-delegation`・`autonomy` の plan の読みの fixture が落ちる |
| M-6 | **実装** | `process-init/SKILL.md:76` は裁定の案の引用どおり。`gh api users/<login>` を呼ぶコードは template に無い(`config.mjs` は `identifyAccount`・`numericAccountId` だけ)。ADR-0108 は「現在のホスティングから一律に数値を引く(M4 の単独)」を採らず、決定 2 は写しの無い人にだけ現在の引き当てを認める。立ち上げは全員が写しの無い人なので整合する。人の確認を残す | `process-init/SKILL.md:76`(「人が書きます」→「スキルが引いて示し、人が確かめます」)。ログイン名が改名・乗っ取りを受けていないかを人が確かめる一文を添える | `test-roster-ids.mjs` は名簿の読みで、書き方の文は固定しない。`lint:impl` の IMPL-0415 との整合だけ確認 |
| M-7 | **縮める** | 集約が出す依存先の一覧(`org-assurance.mjs:940-985`、出力 `aggregate-evidence.mjs:6265`)は、**AI 組織継続の依存先**(モデル・指示資産・評価用基準集合・鍵となる個人・データ)。列は kind・name・提供者・使う席・代替・予行など。**SaaS・外部 API・パッケージの依存先は出さない**。「用途」にあたるのはモデルの「使う席」だけ。`SG.md:5` が引くのは、この一覧(組織継続側)で、様式 05 節 6 の依存先(外部の SaaS・契約)とは別物。集約の実行(`--from/--to`・gh が要る)は、この確認では通していない | `templates/05-handover.md:55-59`、`artifacts/05-handover.md` | 縮め方: 「AI の依存先(モデル・データ)は一覧から起こす。外部サービスは人が書く」と分ける。固定する試験は `test-handover-items.mjs`(**要確認**。節 6 の見出しと列は固定されている可能性) |
| M-10 | **縮める** | `process.config.json` の `standard.edition`(`config.mjs:109 standardEdition`)と、層1 の版(`org-assurance.mjs:405 readPolicy`。`docs/quality-assurance-policy.md` の「版」と記名日。`label`)は**機械が読める**。D-0 の生成区間は `d0Marks(key)` と `D0_SECTIONS`(seats・performers・history)と任意の区間(competence)。**裁定の案の誤り**: `next.mjs:1006-1014` は「空欄か無いか」だけを見ていて、`standard.edition` との値の一致は**見ていない**。層1 の一致の検査は集約が持つ(`aggregate-evidence.mjs:6260`、`bare` の部分一致)。ラベル行は集約が `/品質保証の方針と受容の基準\(テンプレ11\)の版[::]/` で読む(`org-assurance.mjs:738`) | `generate-profile.mjs`(新しい任意の生成区間。旧い D-0 は目印が無いので `D0_OPTIONAL_SECTIONS` へ)、`templates/00-d0-governance.md:25-26`、`next.mjs:1006`、`process-change/kinds/edition.md`、標準 `deliverable-templates.md:339` は文言を変えない(ラベルを保つ) | `test-edition-end.mjs:275-290`(欄が無い・空欄・記入の 3 場面。生成の形へ書き直す)、regress の `lib-r3.mjs:181`・`lib288.mjs:162`・`t288.mjs:176`(層1 の版の行を正規表現で置換。生成区間の中なら置換が検査と食い違う)。**層1 の版は /process-change を経ずに変わる**(署名の更新)ので、区間の更新契機は `generate-profile` の再実行と check-d0 の一致検査を足す |
| B-13 | **戻す** | エスカレーションの「起票と判定の記録」には機械が突き合わせる識別子の形が無い(`G-7.md:42`: 突合は出荷判定者。専用のラベルは足さない)。様式 04 の判定記録にエスカレーションの識別子の欄は無い。ADR-0216・ADR-0217(0626)が専用ラベルを採らず、手順(manual)で降ろした。機械が突合しているのは台帳の例外承認の行だけ | なし | なし。裁定の条件「記録の形を確かめてから」を満たせない。移すには、識別子の欄か規約を新設する必要があり、ADR-0216 が採らなかった形に近い |
| G-1 | **上げる**(縮める案あり) | spec-lint(`scripts/gate/spec-lint.mjs`)は前提を見ない。入力は `specs/F-NNN/spec.md` の「前提」の表で、検査を足す構造はある(`--gate` の材料出力の流儀)。足せない事情: ①案件層 `context/projects/<案件ID>.md` に**前提の ID の記法が定義されていない**(README は自由記述。`context/projects/README.md`)。実在の検査には記法の新設が要る。②仕様の「前提」列を消す案は、`template-fields.yaml:290` が `\| 前提 \| 案件層の ID \| 崩れたときの影響 \|` を標準と template の**両方向**で固定し、ADR-0075 決定 4 が 3 列の表を決めている | 縮める案: 列は残し、ID の実在の検査だけを足す。まとめる本体(列を消す)は所有者へ | 縮める案: `test-spec-lint.mjs`(5 検査)へ場面を足す。G-5 の新しい失敗条件になるので、既存の案件の仕様を落とさない経過措置(案件層の記録が無い・形が違うときは注意)を要する |
| G-6 | **実装** | 入力は `seats.<席>.accountable`(`accountable.md:21`)。検証は `generate-profile.mjs:4999-5001`、反映は `:5583`。`next.mjs:923-938` は構成の `seats[].accountable` を読むだけ。入力の別名(人ごとの席の列挙)を検証の前に席ごとの入力へ展開すれば、構成と D-0 の席の表の生成(`d0Marks('seats')`)は変わらない。兼務の開示・席ごとの `competence` は構成から生成されるので落ちない | `process-change/kinds/accountable.md`、`reference/input.md`、`generate-profile.mjs`(展開 1 か所) | `test-init-g5.mjs`・`test-roster-*.mjs`・regress の accountable の入力。席ごとの入力と人ごとの入力が同時に来て食い違うときは拒否する(新しい拒否の場面を試験へ足す) |

## 2. M-5 の実行(scratch の fixture。人の記入は「未着手 / 着手 / 完了」)

構成: 機能 F-001、Task-1、Task-2(依存 Task-1)。`next.mjs --offline --json` の `features[0]`。

| 場面 | 人の記入 | 導出(`/pit`) | 一致 |
| --- | --- | --- | --- |
| 1 着手前 | 未着手 / 未着手 | 実装前(Task-1) | 一致 |
| 2 着手(ブランチ `feature/F-001-task-1` のみ。PR なし) | 着手 / 未着手 | 実装中(Task-1)。「PR とレビューの状態は見ていない」 | 一致。ただし様式 07 は「Draft PR を作ったら着手」。導出は**ブランチがあれば着手**。ADR-0173(`flow-observation`)は「最初の PR が開かれた時点」で、**着手の定義が 3 つある** |
| 3 完了(トレーラ `Spec: F-001 / Task-1` を末尾の段落に持つコミットが既定ブランチに入った) | 完了 / 未着手 | 実装前(Task-2)。ブランチが残っていても消えていても同じ | 一致 |
| 5 トレーラ無しで取り込んだ(squash に `Spec:` なし) | 完了 / 完了 | 実装前(Task-2)のまま(Task-1 は済みだが Task-2 は未取り込み扱い) | **不一致**。「不明」は出ない。裁定の条件(「導出できないときは『不明』」)は未実装 |
| 4 やり直し(Task-1 が済みの後に `feature/F-001-task-1b` を作った) | やり直し | 済みの Task-1 は表示の対象外。ブランチは無視 | **導出できない**(裁定どおり人の記入に残す) |

- 追加で見つけた欠陥(読みで確認。実行はしていない): `next.mjs:1317` の `startsWith(\`feature/${f}-${t.id}\`)` は区切りが無く、`task-1` が `task-10` のブランチに当たる(10 タスク以上の計画で誤って「実装中」になる)
- 導出は機能ごとに先頭の 1 タスクだけを出す。計画の**表全体**の状態は出さない。「計画の表示」に使うなら、表示の新設が要る
- 結論: 「着手前・着手・完了」の導出は人の記入と一致する(トレーラがある限り)。縮めて実装する。縮め方: ①様式の状態の列を「やり直し」だけを人が書く列にする(列は残す。`autonomy.mjs` が最後の升を読む)、②トレーラ無しの取り込みを「不明」と出す処理を足す、③`next.mjs:1317` の区切りを直す、④様式 07 の「着手」の定義の文を、導出の定義(ブランチ)に合わせる
- 状態の列を読む他のコードは壊れない(`autonomy.mjs:514-530` は最後の升が「やり直し」のときだけ。「着手」「完了」の記入が無くなっても影響しない)

## 3. Y-5 の開示の所在と、足す 1 行

- 既存: ①`generate-profile.mjs:4684`(G-6 が省略・未達の構成の PROCESS-PROFILE の注記)、②`next.mjs:1309-1311`(G-6 の記録が無い=未判定を出す)、③集約が G-6 の欠落を出す。いずれも「G-6 の省略・未達」を開示するが、**「人の確認を伴わない」「チェックリストは確かめた証拠にならない」とは書いていない**
- 足す 1 行(案): `generate-profile.mjs:4684` の注記の末尾へ「G-6 を経ない変更には、独立した人の確認が無い。PR の自己チェックは、確かめた証拠に数えない」。新しい義務ではない(裁定の条件の開示)。PROCESS-PROFILE の生成文なので regress の期待値(該当の scene)と、`test-edition-end`・生成の試験を再生成する

## 4. 落ちる試験の一覧(様式を読む試験の grep の結果)

- PR 様式(`.github/PULL_REQUEST_TEMPLATE.md`)の行・チェックリストを固定する試験は**無い**。`check-pr.mjs` が節見出し(リスク区分・規模の確認・統制の設定の陰性の確認)を読む。「AI 関与範囲」と「チェックリスト」を読むコードは無い。`claude-md-resident.json:486` はパスだけを引く
- 様式 01・06・07 を写す regress: `stages.mjs`・`lib-r3.mjs`・`lib288.mjs`・`t288.mjs`・`verify-n.mjs`。置換の対象は表の行と層1 の版の行(M-10)で、承認節は固定していない。様式 07 の写しは `stages.mjs:146`
- 本体: `check-template-fields.mjs`・`test-template-fields.mjs`(`template-fields.yaml` の t1・t6 の extra、t7 の standard 文字列)。`check-template-drift.mjs`(様式の番号と標準の対応。承認節は対象でない)
- template: `test-edition-end.mjs`(M-10)、`test-spec-lint.mjs`(G-1 の縮める案)、`test-next-records.mjs`・`test-plan-trace.mjs`(M-5)、`test-handover-items.mjs`(M-7。**未確認**)、`test-ship-evidence-steps.mjs`(Y-4。**未確認**)

## 5. 別の ADR との突合(語で検索)

裁定の案が読んだ ADR(0018・0028・0040・0058・0070・0106・0159・0216・0243・0267)以外で、当たったもの。

| ADR | 決定の要点 | 当たる件 | 矛盾 |
| --- | --- | --- | --- |
| **0075 決定 4** | テンプレ1 の前提を表にする(前提・案件層の ID・崩れたときの影響の 3 列)。決定 3 は前提の欄を「すべて確かめていない」と読む | G-1(前提の列を消してまとめる) | **ある**(列を消すと標準の表と食い違い、`template-fields.yaml:290` の両方向の検査が落ちる)。→ §6 |
| 0108 決定 1・2、採らない M4 | 照合は数値 ID。現在のホスティングから一律に引く単独の案は採らない。写しの無い人にだけ現在の引き当てを認める | M-6 | なし(人が確かめる形で整合。立ち上げは全員が写しの無い人) |
| 0129 | 手戻り率の分子は、計画の履歴の版で「やり直し」だった状態を数える | M-5 | なし(「やり直し」を人の記入に残す。履歴の読みは変わらない) |
| 0173 | 着手の時点は「作業単位を指す最初の PR が開かれた時点」(flow-observation) | M-5 | 矛盾ではないが、「着手」の定義が様式 07(Draft PR)・導出(ブランチ)・ADR-0173(最初の PR)で 3 つ。M-5 で様式の定義を導出に合わせるときに、どれを正とするかを決める |
| 0060 | G-2・G-3・G-4・G-7 は結果責任者が判定してよい | Y-3(承認表) | なし(判定者の記録の所在を 1 行にしても、判定者の割り当ては変わらない) |
| 0216 決定 2 | 規制業の「AI 関与範囲の明記」(IMPL-0837)は採用者に委ね、構成の why と PROCESS-PROFILE の注記は変えない | Y-4 | なし(PR の欄の形は決めていない) |
| 0023 | 要約・結論を AI に生成させる案を採らない(附属書C の「AI 転記」) | Y-4 | なし。導出は事実(トレーラ)だけで、要約・結論を生まない |
| 0068 | 適用の表明・主張は従う本標準の版を名指す | M-10 | なし(値の出所を構成に一本化する方向) |
| 0070・0106 | 判定記録の欄の出所の指定。「転記」の語は附属書C と衝突するため避け、出荷 PR の承認だけを「転記の確認」と呼ぶ | Y-2・Y-2b・Y-3 | なし。本件の「転記欄」は 0106 の「転記の確認」とは別物(様式内の写し)。**本書・条項の語は「写し」とし、「転記」を使わない**ことを実装の担当に伝える |
| 0216・0217(IMPL-0626) | エスカレーションの専用ラベルを足さない。突合は手順(manual) | B-13 | **戻す理由**(§1)。ADR の決定と裁定は矛盾しないが、機械へ移す前提(識別子の形)が無い |

- 「approved_by」「承認表」「転記欄」「外部依存」で当たる ADR は 0 件。チェックリスト項目 1〜3・5 を課した ADR は無い(0023・0041・0087 の「チェックリスト」は別の対象)

## 6. 実装の前に所有者へ上げるもの

1. **G-1(前提を案件層に一本化し、仕様の「前提」列を消す)**: ADR-0075 決定 4 が 3 列の表を決め、標準のテンプレ1 も同じ 3 列で、`template-fields.yaml:290` が両方向で固定している。列を消すには標準のテンプレ1 の表と ADR-0075 の置き換えが要る。この束は新しい ADR を起こさないので、所有者の判断が要る。**議長が採れる代案**: 列は残し、spec-lint に「ID が案件層に実在する」検査だけを足す(記法の定義が先に要る。`context/projects/README.md` へ「前提の ID の書き方」を足す)。この代案なら所有者へ上げずに実装できるが、「まとめる」は果たさない。どちらを採るかを決めてから進める
2. 上のほかに、既存の ADR の決定と正面から矛盾する件は無い

## 7. 実装の順序の見立てと、各段で流す試験

0. 実装の担当へ渡す条件の訂正: M-3 の所在(様式と補助ファイル。process-init ではない)、M-10 の一致検査の現状(空欄だけ)、M-5 の「不明」と前方一致の欠陥、M-7 の範囲(AI の依存先に限る)、B-13 は移さない
1. **様式(template/templates と .github)**: 01(承認節・frontmatter)、06(承認節)、07(承認表→1 行。状態の注記)、PR 様式(項目 1〜3・5、AI 関与範囲)、05(M-7)、10(M-3)
   - 流す試験: `node scripts/gate/test-spec-lint.mjs`、`node scripts/gate/test-check-pr.mjs`、`node scripts/gate/test-plan-trace.mjs`(template の中)
2. **スキルと手引き**: `implement/SKILL.md`(観点)、`process-init/SKILL.md:76`(M-6)、`G-1.md:17`(M-2)、`artifacts/05・06・07・10`、`process-change/kinds/accountable.md`・`edition.md`
   - 流す試験: 本体の `npm run lint:impl`、`lint:scope`
3. **機械(scripts)**: `next.mjs`(M-5 の不明・前方一致、M-10 の一致)、`generate-profile.mjs`(M-10 の区間、G-6 の展開、Y-5 の注記)
   - 流す試験: `test-next-records.mjs`、`test-edition-end.mjs`、`test-init-g5.mjs`、`test-roster-*.mjs`(template の中)。regress の該当の scene
4. **本体**: `pr-workflow.md:70・104・115`(Y-4 の実装マーク。undelivered)、`template-fields.yaml`(t1・t6 の extra の行を消す。t7 の reason)、`impl-targets.yaml:306`(pr-template の description に「AI 関与範囲の導出」の降ろし先を足す)、台帳の再生成(`impl:write`・`evidence:write`・`scope:write`)、`npm run template:kb`(規則データは変えないので不要の見込み)
   - 流す試験: `npm run test:fields`・`test:template`・`lint:impl`・`lint:refs`
5. 回帰の全量は push の前に 1 回(`npm run check`。WSL では node 26)。template と本体は続けて push する
- 時計に依る試験: `tpl2 trial.mjs`(09:00 固定)、`r3 scen.mjs`(日付固定)は、深夜・翌日の実行で偽の FAIL になる。複製側で時刻を置き換える。`test-next-records` の入口は `--today` を与えられる

## 8. 確かめられなかったこと

- 集約(`aggregate-evidence.mjs`)の実行。`--from/--to` のタグと gh が要るため通していない。M-7 の「依存先の一覧」は、コードの読み(`org-assurance.mjs:940-985`)と出力の書式(`:6265`)だけから判定した。実行で列が出ることは未確認
- `test-handover-items.mjs`(様式 05 の節 6 の固定)、`test-ship-evidence-steps.mjs`(PR 本文の固定)の中身。grep の範囲では「AI 関与範囲」に当たらなかったが、様式 05 の列名への当たりは見ていない
- M-5 の場面 4(やり直し)は、Draft PR・取り込み・不採用の GitHub 上の状態を使っていない。ブランチとトレーラだけの fixture
- M-10 の生成区間の追加が、旧い D-0(目印の無い)を持つ採用者を落とさないこと(任意の区間にする設計は読みの上の見立て。実装で確かめる)
- 独立の突合(別の文脈)は未実施。本書は実装の前の確認で、突合の代わりにならない
