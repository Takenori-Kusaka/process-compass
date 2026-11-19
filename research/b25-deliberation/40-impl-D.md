# 束 B25 単位 D(委任と自律レベル)と K-4 の template の側の実装の記録

template の先頭: `197f7b4`(ブランチ b25)。基点は 4f3faf8。bundle は `E:/Github/process-compass/tmp/bundles/template-b25-D-01.bundle` 〜 `-07.bundle`(最新は D-07)。push していない。`scripts/vendor/tailoring-kb.json` の M(CRLF の差)はコミットに入れていない。

コミット(template):

| 番号 | ハッシュ | 内容 |
| --- | --- | --- |
| D-01 | 97f9ee8 | R1・R2 の場面と L3 の種別の確認 |
| D-02 | 08b0269 | 登録の根拠の4点目 |
| D-03 | 6559a1c | R1・R2 のパターンと同一の範囲の拒否 |
| D-04 | f4854ff | IMPL-0597 条件6 の月ごとの件数 |
| D-05 | 75bb09f | IMPL-0840 依存の追加の行 |
| D-06 | 6af369c | 手引き(IMPL-0599・IMPL-1032) |
| D-07 | 197f7b4 | K-4 と README の取り込みの注意 |

## 0. 前提の食い違い(束 B23)

束 B23 の 0291・1006 は、この template の b25(4f3faf8)にも origin/main(6711635)にも入っていない(`git grep IMPL-0291 origin/main -- scripts` が空)。指示の「束 B23 が 0291・1006 で触った版の上に足す」は満たせなかった。今の先頭の上に足した。B23 が push されたとき、`autonomy.mjs` の `STOP_KIND`・停止の導出、`config.mjs` の `missingBasis`、`test-check-delegation.mjs` の末尾で衝突しうる。衝突の場所は、私が足した `enforcement` の停止(`autonomy.mjs` の `if (enfMissing.length) stop(...)`)と、B23 が足す停止の kind の並び。

## 1. IMPL-0594(場合分けは (イ))

実行での確認(WSL node 26)。

- `autonomy.mjs` の L3 の導出は `autonomyState` が種別の単位で行い、変更ごとのリスク区分を読まない。
- L3 の導出を読む箇所は、`grep -rn "autonomyState\|l3ScopeIds" scripts` で次の4つ。変更ごとに効くのは委任の判定だけ。
  - `delegation.mjs`(委任の判定。条件2 が `riskClassOf(pr.body) !== 'R3'` を求める)
  - `generate-profile.mjs`(D-0 の表。種別の単位の表示)
  - `aggregate-evidence.mjs`(保証の開示の表示と、AI を用いない実施の範囲)
  - `next.mjs`(次の一手の注記。表示)
- 試験の命令: `node scripts/gate/test-check-delegation.mjs`。足した場面の出力は、`ok 種別が L3 でも、リスク区分が R1 の変更は委任で進まない(条件2)`・同 R2・`リスク区分が R3 なら、同じ種別の変更が委任で進む`。
- 結論: (イ)。L3 の効果は委任の経路だけで、条件2 が R3 を求める。委任を経ない経路に、L3 の導出が効く出力・挙動は無い(表示の「L3」は種別の単位の表示で、変更の区分を主張しない)。(ア)(ウ)の検査は足さない。

足したもの: `test-check-delegation.mjs` に場面「リスク区分が R1」(条件2 が落ちる)と、確認の塊 `IMPL-0594`(R1・R2 で `judged.autonomy.level === 'L3'` かつ `!eligible` かつ条件2 の理由あり、R3 で eligible)。
外して落ちる確認: `delegation.mjs` の条件2 を `risk !== 'R3' && risk !== 'R1'` にすると、3件が落ちた(「リスク区分が R1」「入口: 該当しない入力で 1」「IMPL-0594 R1」)。戻した。
試験の結果: `委任の経路の試験: 69 場面と付随の確認が、期待と一致しました`(この時点)。

マークの新しい行(`human-ai-boundary.md` 122 行): `target=autonomy-derivation state=delivered check=machine test=template/scripts/gate/test-check-delegation.mjs`。note に、裁定の3句(IMPL-0919 は Q1 の答えの正しさが機械で閉じない・IMPL-0062 の下限と確定の記名と採用の手引きの開示・IMPL-0663 は manual)と、L3 の効果が委任の経路だけである範囲、safetyRelated の宣言の条件を採らない旨。

## 2. IMPL-0834

- `config.mjs`: `CHANGE_TYPE_BASIS` に4点目 `enforcement` を足した。新しい `CHANGE_TYPE_ENFORCEMENT`(`selfCorrection`: 自己修正のループ、`aiReviewRound`: AI の確認側と作成側の往復)、`enforcementFilled`・`enforcementComplete`。`missingBasis` が単位ごとの未記入を返し、「3点」の文言を「4点」にした。標準 5.5.4 が「実行の単位ごと」と書くため、`detection` と同じ形(オブジェクト)にした。「該当なし(理由)」は括弧の理由があれば記入として通り、「該当なし」だけは通らない(`isFilledValue` の既存の定義)。
- `autonomy.mjs`: `STOP_KIND` に `enforcement`(適用の条件の欠落)。欠けた登録済みの種別を止める(戻るのは4点目を記録した時点)。`detectionBasisText` に4点目の「記入の有無だけ確かめた」を足した。
- `generate-profile.mjs`: D-0 節12 の表の手戻り率の欄に4点目(または「未記入のため委任は止まる」)を出す。
- 移行: fixture(`delegation-eligible.json`)、`test-delegation-wiring.mjs`・`test-name-confirmation-timing.mjs`・`test-ai-free-practice.mjs` の登録に4点目を足した。`templates/00-d0-governance.md`(節の文・3点→4点)、`mode.md` の入力例、README の欄の表。
- 試験(`test-check-delegation.mjs`): 場面5(4点目なし・単位が1つ欠ける・1つの文・「該当なし」だけ・「該当なし(理由)」)、確認の塊(登録済みで欠けた種別は止まる・単位の欠け・書いた種別は止まらない・記録すると戻る・登録の拒否・書いた登録は拒まない)。
- 外して落ちる確認: 停止の行を無効にし、`missingBasis` の単位の検査を空にすると、4件が落ちた。戻した。
- 結果: `74 場面と付随の確認が、期待と一致しました`、`test-delegation-wiring` 27 件通過、`test-name-confirmation-timing` すべて通過、`test-ai-free-practice` 67 件。
- マーク(`roles-responsibilities.md` 1993 行): `delivered check=machine test=...test-check-delegation.mjs`。
- 裁定どおりに作れなかった点: なし。ただし副作用として、構成全体の検査(`changeTypeProblems` を `only=null` で呼ぶ経路。構成の検証・契約検査)も、4点目の無い登録済みの種別を問題として返す(3点の検査と同じ扱いで揃えた)。登録済みで欠けた種別は止まるだけでなく、構成の検査の問題にもなる。README の取り込みの注意に書いた。

## 3. IMPL-0664

- 実装の置き場の読み替え: 裁定は「種別のパスのパターン」と書く。種別(`changeTypes[]`)はパスを持たず、パスは種別を指す委任の規則(`rules[].paths`)にある。そこで、`changeTypes[].id` を `rules[].changeType` で引き、規則の `paths` を、`riskFloor.rules[]` の `floor` が R1・R2 の規則の `paths` と NFKC・trim の上で文字列で同一か照らした。`riskFloorOverlapPatterns` を `config.mjs` に足し、`changeTypeProblems` が拒む。包含・重なりは判定しない。
- 試験: 場面3(R2 と同一・R1 と同一・重ならない)。外して落ちる確認: 検査を無効にすると2件が落ちた。戻した。結果 77 場面。
- マーク(`roles-responsibilities.md` 1075 行): `delivered check=machine`。

## 4. IMPL-0597

- `aggregate-evidence.mjs`: 純粋関数 `samplingMonthly`・`samplingMonthlyText`(輸出)。月は PR のマージの時刻(`localDay`)の月。k は、独立レビュアの席の責任者の名義(`personKey` が一致)の抜き取りの記録を持つ PR の数。事後の抜き取りの節の表の下に1文を出し、`evidence.json` に `samplingByMonth` を足した。合否・記載の欠落に数えない。`config.mjs` に `delegationSamplingProblems`(`delegation.sampling.perMonth` は1以上の整数)を足し、構成の検証・契約検査・登録の拒否の経路に結んだ。`delegation.mjs` の条件6 の文に「件数は集約が出す」を足した。
- 解釈した点(裁定が決めていない): perMonth が月の件数 n を上回る月は、n を上限にした(n 件しか無い月で perMonth 件は満たせない)。perMonth が無いときの既定は裁定のとおり min(n, 5)。マージの時刻を読めない変更は月ごとの表に含めず、件数を出す。
- 試験(`test-aggregate-records.mjs`): n=8・k=3 の月が不足(required 5)、n=3・k=3 は不足なし、perMonth の使用、n を上限、日付不明、表示の文、perMonth の構成の検査。外して落ちる確認: `short` を常に偽にすると3件が落ちた。戻した。結果 221 件。
- マーク(`human-ai-boundary.md` 560 行): `delivered check=machine test=...test-aggregate-records.mjs`。note に、条件4 の中身・選び方・確認の中身は確かめない(確かめる者: 内部監査)。
- 未確認: 実物の PR の履歴(マージの時刻・記録の judge)を通した集約の実行は、場面の合成のみ(`samplingMonthly` への入力は試験で直接渡している)。`aggregate-evidence.mjs` 本体の取り込み(`sampling.map` の `bySeat`・`month`)は `test-aggregate-wiring` の61件通過で壊れていないことまでしか確かめていない。

## 5. IMPL-0840 と新しい番号 IMPL-1032

- `introducesPaths` は足していない。
- (i) `delegation.mjs` の `dependencyAdditions` と、条件2 への理由の追加。依存の目印の一覧は `config.mjs` の `DEPENDENCY_MANIFESTS` へ移し、`dependency-diff.mjs` と共通にした(二重の定義を作らない)。判定: ファイル名(ディレクトリを除く)が一覧にあり、`patch` があるとき、追加の行を正規化(版の数字・ハッシュ・数字を置換)し、削除の行と対応しない追加の行があれば「依存の追加」とみなす。`patch` が無い(GitHub は大きな差分を省く)ときは、追加の行数が1以上で落とす。`check-delegation.mjs` の `gh api` の `--jq` に `patch` を足した。範囲は依存の追加の行に限る。
- 試験: 場面6(新しいキー・差し替え・patch なしの行数・版の更新・ロックファイルのハッシュ・削除のみ)。外して落ちる確認: ループを空にすると ng 3件が落ちた。戻した。結果 83 場面。
- マーク 0840(`tailoring-guide.md` 442 行): `delivered check=machine`。範囲は依存の追加の行に限ると note に書いた。
- (ii) 新しい番号 IMPL-1032(`tailoring-guide.md` の 0840 の次の行。`src/data/impl-inventory.yaml` の同じ箇所の `ids` に足した): `target=process-change-skill state=delivered check=manual`。note に、置き場に書いた分だけ委任から外れる・書いていない規則・所在の外は確かめない・確かめる者(登録する者と事後の抜き取り)。手引きは `template/.claude/skills/process-change/kinds/mode.md` の「導入の置き場を委任から外す」(a)(b)(c)。典型のパスは書かない。
- 未確認: 実物の GitHub の `pulls/N/files` が返す `patch` の形(改行・「\ No newline」行)で試験していない。patch の `+++`/`---` 行は除いている。「\ No newline」行は先頭が `\` のため数えない。

## 6. IMPL-0599

`mode.md` に「席ごとの上限の表に照らす」を足した(運用形態の上限は IMPL-0691、列の中身は決定者が読む、表の外の割当ては判断記録、確かめる者)。マーク(`human-ai-boundary.md` 689 行): `target=process-change-skill state=delivered check=manual`。

## 7. K-4

実行での確認の作り直し(`10-k4-research.md` 1.3):

- 場面 A〜F は、`test-check-delegation.mjs` に、登録した種別を2つ並べた構成として入れた。調査の写しは種別2 に差し戻し率の窓が無く L1 になっていたため、判定は「第1区分でコア機能の理由を持つ停止」の有無で行う。
- 実装前の挙動(場面 F: 登録外の ID の行は何も止めない)は、実装を外す確認で再現した(下)。
- 試験(`test-check-delegation.mjs`): 関わる種別だけが止まる・「なし」は止まらない・空欄は両方・保持者0名・登録外の ID は両方が止まる・理由に ID が出る・注記にどの機能のどの ID かが出る・登録の ID と登録外の ID が混ざる行は空欄と同じ・保持者2名なら止めないが注記は出る・登録の ID だけの行は注記を出さない。
- 実装: `autonomy.mjs`。`unregisteredIdsOf` で節2 の行の ID が登録の一覧に無いものを求め、その行は `applies` を通さず(空欄と同じ)、保持者1名以下で止める。理由の文に ID を出す。`state.coreUnregistered` を返し、`autonomyNoteLines` が「コア機能「X」の関わる登録した変更種別に、登録の一覧に無い ID「…」がある」を出す。
- 外して落ちる確認: `const unregistered = [];` に替えると3件が落ちた。戻した。
- マーク: 新しい番号は足していない。既存の IMPL-0284(理解保持者数による種別の停止)の note に1句(登録外の ID は空欄と同じ扱い・出力に出す・2種別の試験)を足した。
- 取り込みの注意: README 16 節に書いた。
- 未確認: 実物の `docs/handover.md`(節2 の表を `org-assurance.mjs` が読んで `changeTypes` を作る経路)を通した確認はしていない。試験は `records.core.rows[].changeTypes` を直接渡している。`org-assurance.mjs` の `typesOf` は、区切りを「、,，/／」で分けた文字列をそのまま ID にする(NFKC は掛かる)ため、登録の ID と綴りが違うだけでも登録外と判定される(意図した挙動)。

## 8. 回帰(関係する試験だけ。WSL node 26、/mnt の作業ツリー)

`test-aggregate-drift` 25 件、`test-aggregate-records` 221 件、`test-aggregate-wiring` 61 件通過、`test-check-delegation` 83 場面、`test-check-pr` 270 場面、`test-delegation-wiring` 27 件、`test-g5-missing`・`test-ship-evidence-steps`・`test-name-confirmation-timing` 通過、`test-next-records` 135 件、`test-roster-conditions`・`-ids`・`-rules` 61・64・216 件、`test-model-adoption` 40 件、`test-ai-free-practice` 67 件。
本体: `npm run -s impl:write` と `npm run -s lint:impl`(終了コード 0)、`npm run -s test:fields`(11 件)。

落ちたもの: `test-g5-aggregate` が /mnt の作業ツリーで4件落ちる(「needs にあるジョブを消すと…」ほか)。原因は私の変更ではない。同じ試験が、4f3faf8 の `git archive` の写しでは通り(出力なし=不一致なし)、197f7b4 の `git archive` の写しでは 30 件一致した。/mnt の作業ツリーは WSL の git から見ると全ファイルが M(CRLF の差)で、ワークフローの YAML の改行が試験の期待と食い違う環境の差とみられる。

## 9. test-aggregate-wiring の IMPL-1008(R2-02)

再現しなかった。

- 4f3faf8 の写し(`git archive` を WSL のホームへ展開): 61 件通過。
- 6711635 の写し: 61 件通過。
- 197f7b4(私の変更の後)の作業ツリー(WSL の /mnt): 61 件通過。
- 同じ作業ツリーを Windows の node 26.13 で実行: 61 件通過。

単位 S の担当が落ちたと報告した2場面(R2-02 の ng・ok)は、日付(`2026-11-01` の台帳の行)や、WSL の /mnt の改行・`git config user.name` に依る可能性があるが、特定していない。今の先頭では通る。本束の変更が原因ではない(`aggregate-evidence.mjs` を触った後も通っている)。未確認: S の実行環境(時刻・node の版・どの作業ツリー)。

## 10. 移行の注意(README 16 節に書いた)

- 0834: 4点目の無い登録済みの種別は、取り込んだ直後から止まる。構成の検査の問題にもなる。
- 0664: 範囲のパターンが R1・R2 の規則と同一の種別の登録は拒まれる(規則が有効でなくなり委任が止まる)。
- K-4: 登録外の ID を書いた行は、保持者が1名以下のとき、すべての種別を止める。1名の体制では取り込みで止まる。
- 0840: 依存の追加の行を持つ変更が、委任から協働へ戻る。
- 0597・0594・0599・1032: 止めない(表示・手引き・試験)。

## 11. 裁定どおりに作れなかった点・未確認

- B23 の版の上ではなく、今の先頭の上に足した(0 節)。
- 0664 の「種別のパターン」は、種別を指す規則のパターンとして実装した(3 節)。
- 0597 の perMonth が n を上回る月の扱い(n を上限)は私の解釈(4 節)。
- 0834 の4点目の形(単位ごとのオブジェクト)は、標準 5.5.4 の「実行の単位ごと」から起こした。キー名 `selfCorrection`・`aiReviewRound` は私が付けた(標準・ADR は名を定めていない)。
- 実物の GitHub 上の `patch`・実物の引き継ぎ文書を通した確認はしていない(5・7 節)。
- `npm run check` の全量、`template:kb`(規則データを変えていないため不要と判断)、独立の突合は流していない。
