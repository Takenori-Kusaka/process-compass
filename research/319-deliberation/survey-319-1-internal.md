# 調査 319-1 内部: 回帰スイートの棚卸しと、いまのテンプレートでの実行

- 対象: Issue #319(決定を固定する回帰の fixture を、リポジトリの検査へ入れる)
- 調べた日: 2026-10-26〜27(UTC。実行は日付の境をまたいだ)
- 書いてよい範囲: 本書だけ。スイートは git の外のスクラッチ(`/tmp/claude-0/-home-claude/e43836ec-c999-5cc7-926b-e9d20f117969/scratchpad/319/`)で流した。`tmp/legacy/` は読んだだけで変えていない。標準・テンプレートの作業ツリーは変えていない(`git status` で確認)
- 本書は事実だけを書く。移す場面の採否は書かない

## 0. 方法

### 0.1 流した環境(4 つ)

| 名 | テンプレート | 知識ベース | スイート |
| --- | --- | --- | --- |
| p302 | `ec8ecd6`(#302〜#310 の反映の最後のコミット) | そのコミットに複製済みのもの | 組C・組A が直した版(下の 0.2) |
| pre311 | `869d160`(#311 の直前。#290 台の反映を含む) | 同上 | 同上 |
| cur | 作業ツリー(HEAD `c3fdc8f`、#318 の突合まで) | 標準の作業ツリーから作り直した(`scripts/build-template-kb.mjs --out`) | 同上 |
| adapt | cur と同じ | cur と同じ | 同上に、`fresh.sh` で #315 の事前点検への適応を 2 つ足したもの(下の 2.3) |

- 手順は `tpl2-setup.sh`・`runsuite.sh`・`runall2.sh` を写した(`setup.sh`・`extra.sh` をスクラッチに置いた)。偽の `gh`(`fakebin/gh`)を PATH の先頭に置き、PR の模擬は `mockgh-prs.mjs`(`--import`)による
- `fresh.sh` は、元の版ではなく組C の版(作業用の複製が最上位であることを確かめる版)を、どの環境でも使った。理由は 5.1
- `runall2.sh` に入っていないスクリプト(t288・t288b・ta・trial・trial-r7・s5-init-pr・verify-n・matrix-sweep・tok)は `extra.sh` で各スクリプトの冒頭の使い方どおりに流した
- Node v22.22.0、Linux、TZ 未設定(UTC)

### 0.2 「直した版」の中身(組A・組C の直しを重ねたもの)

| ファイル | 直し | 出どころ |
| --- | --- | --- |
| `lib.mjs` | `BASIS.detection` を検知条件ごとの 3 欄(`rejectionRate`・`duplicationRate`・`reworkRate`)へ | 組C(C-3 の決定) |
| `unit.mjs` | 読み込みを `file:///E:/.../tmp/impl288-tpl/tpl/...` から `../tpl/...` へ。fixture の `basis.detection` を 3 欄へ | 組C |
| `fresh.sh` | `git init` の後に最上位を確かめ、違えば中止 | 組C |
| `v3.mjs`・`new.mjs`・`tz.mjs` | 独立レビュアと出荷判定者を別の人へ(9 か所) | 組A(`fix-suite.py`。A-4 の決定) |

- `tmp/legacy/302-310/implA/suite-A/` には `new.mjs`・`tz.mjs` が無い(「差分のあるファイルだけ」の写しから漏れている)。`fix-suite.py` を元の `new.mjs`・`tz.mjs` へ当てて再現した。`v3.mjs` は再現の結果が `suite-A/v3.mjs` と一致した
- p302 の結果は、組A の記録(`implementation-A.md` 3 節の「最終の版」)と、全スクリプトの出力の行数まで一致した(v3 102・v3b 30・scenarios 182・new 137・tz 35・acquire 13・matrix 31・unit 77・stages 233)。再現は成り立っている

## 1. 棚卸し

### 1.1 スクリプトの一覧(`tmp/legacy/fix288-tpl2/suite/`、23 本)

場面数は p302 での実行時の `ok`・`FAIL` の行の数(unit は `eq` の数)。「固定する決定」はスクリプトの冒頭の題とコメントに書かれた番号である。K 番号は `research/phase4-standard/284-285-fix-spec*.md`(K1〜K75)の決定を指し、その多くは ADR-0054・ADR-0055・ADR-0056 へ畳まれている。スクリプトが ADR を名指すのは scenarios の ADR-0028 と、lib288・t288 の ADR-0001 だけである。

| スクリプト | 場面数 | 作業用の複製 | 固定する決定(コメントから) | 起源 |
| --- | --- | --- | --- | --- |
| v3 | 101 | v | K50・K51・K55・K60・K61・K62・K63・K64・K65。土台 s4・s5、任免の記名(重大1)、出荷判定者 × 事業決裁者、AI維持管理者の交代、引き継ぎ、範囲の拡大、日付、D-0 の版、品質保証部門の通知先、独立レビュアの席の委任 | 第3巡の検証(tmp/verify3-scenarios) |
| v3b | 29 | v2 | 1人・2名の体制(t1-solo-delegate・b3・b6・s14b)、K50 の 1〜2名、K51 の事象5・6、K60・K62 | 同上 |
| scenarios | 179 | s | K12・K13・K15・K43・K50・K51・K60・K61・K67、ADR-0028。AI の名義、委任の規則と上限、範囲の縮小・拡大、CL の上昇、AI が使えない期間(outage)、変化点を経ない再生成、3→2→1 名の離脱、ステージの後退、名簿と回答のずれ、CL1 以上で 3 名を割る、名義の上書き、アカウント、指示資産の版 | 第1巡(tmp/fix-f3)を第2巡の決定へ引き継いだもの |
| new | 136 | n | K15・K16・K33・K37〜K40・K42、第3巡の K60・K62・K65、第4巡の K70。1人+AI、1→2人、2名で reviewer-no、変化点を経ない書き換え(K37)、D-0 の生成区間(K42)、D-0 表1 の決定者(K33)、個別の値(settings)、3名以上の兼務禁止(K38)、適合性確認の承認の失効(K16) | 第2巡で足した場面 |
| replay | 51(静的な数。実行できず) | r | K55・K60・K62・K65・K70。再検証(tmp/reverify-scenarios)の入力 24 件をそのまま流す | 再検証 |
| tz | 34 | z | K60・K65。自動で書く日付は手元の時刻帯の日付(UTC+14・UTC−11・UTC+9 の 3 つで流す) | 第3巡 |
| acquire | 12 | a | K75。D-0 を作った直後の再生成(版の取得、生成区間) | 第5巡 |
| matrix | 30 | m | K60・K62・K65。人数 × ステージ × CL で、初期化 → 検査 → D-0 → 席の記入 → 検査 → 再生成 | — |
| matrix-sweep | 30 + `--sweep` 768 組合せ | m2 | matrix と同じ本文(作業用の複製の名だけ違う)。`--sweep` は回答の全組合せで初期化 → 契約検査 → CLAUDE.md の検査、3 名を割る変化点 320 件 | — |
| unit | 76(`eq`) | (なし) | K55・K62・K65。`config.mjs` の補助関数 22 個を直接呼ぶ | — |
| stages | 175 | st1・st5・st15 | #286 段1・段2。`next.mjs` の出力を段階ごとに(1・5・15 名)、「読む:」の所在の実在 | #286 |
| t288 | 60 | t3・t1 | #288。保証の主張の成立判定(6 条件)・組織継続・停止の申し立て。ADR-0001 | #288 |
| t288b | 66 | u3・u1・ua | #288 第2巡。採用判断シートの 1 回目の判定(E1〜E5)への修正 | #288 |
| ta | 13 で中断 | ua・ut | #288 第2巡。導入前の検証(adoption-trial.mjs) | #288。p302 でも途中で落ちる(trial・trial-r7 が後継) |
| trial / trial-r7 | 35 / 35 | ua2 | #288 第2巡。導入前の検証を採用者の小さなリポジトリで。2 本は本文が同一 | #288 |
| s5-init-pr | 7 | s5a・s5b | #286 N4。初期化のコミットを PR 経由で入れれば G-6 の欠落にならない | #286 |
| verify-n | 30 + 3 FAIL | vn1 | #286 2 回目の通しの検証の N6〜N9。K3 | #286 |
| tok | 0(計測だけ) | tok1・5・15 | CLAUDE.md の容量とトークンの推定値を出すだけ。合否なし | — |
| lib・lib288・mockgh-prs | — | — | 補助 | — |

- 合計(実行できたもの、p302): 約 1,180 場面 + sweep の 768 組合せ。replay の 51 と verify-n の 3 は入力が無く数えられない(3 節)
- `runsuite.sh`・`runall2.sh` が流すのは v3・v3b・scenarios・new・replay・tz・acquire・matrix・unit・stages と、テンプレートの試験 3 本(test-check-delegation・test-check-pr・test-init-g5)だけである。#288・#286 の 9 本は手で流す前提だった
- `fix288-tpl2/` の直下のほかのファイル: `patch-agg.cjs`(`aggregate-evidence.mjs` を書き換える試行のパッチ)、`patch-t288.cjs`(t288 の場面を第2巡の様式へ合わせる、期待値の変更の理由つき)、`probe-policy.mjs`(t288b が `../../../probe-policy.mjs` として本文を読む。スイートの外にあるため、写さないと t288b が落ちる)、`sync.sh`(テンプレートの写しと CRLF の除去と知識ベースの再生成)、ログ 3 本(t288 60・t288b 66・trial 35 件、すべて all ok)

### 1.2 既にリポジトリの試験に同じ主張があるか

テンプレートの試験(`template/scripts/gate/test-*.mjs`、20 本)と `scripts/test-tailoring-engine.mjs` を、スイートの主題の語・関数名で検索した。語の一致は主張の一致を意味しないため、「無い」側の結果だけが強い。

| スイートの主題 | 既存の試験での出現 |
| --- | --- |
| 任免の記名(K60)、発効日の未来・過去(K65)、時刻帯(tz)、即時通知(`noticeFor`、K15・K51)、変化点の要約値の連鎖(`prevHash`、K37)、発生の向き(`arising`、K39)、AI が使えない期間(`outage`)、`sep-shipping-business`(K50)、任命権者(`appointer`)、「書き換えられています」 | **どの試験にも無い** |
| 回答と名簿の矛盾(「reviewer-yes へ改め」、K62) | 無い |
| 登録の根拠 `basis`(K55) | test-check-delegation(4)・test-check-pr(5)。委任の経路の側の fixture として。構成の生成(`--change`)での拒否は無い |
| 氏名・アカウントの確認(`nameConfirmed`・`accountsConfirmed`) | test-roster-rules(関数の単位)・test-self-heal。**変化点 1 回で名簿へ足して任命する経路**は無い(2.4 の回帰の疑いが試験で見つからない理由) |
| 兼務禁止・確認者の導出・最小体制 3 名 | test-roster-rules、test-tailoring-engine(「最小体制は3名」「S0 の G-6」) |
| `next.mjs` の段階 | test-plan-trace(7)・test-edition-end(6)・test-adoption(4)。stages の 1・5・15 名の段階の通しは無い |
| 自己修正(`self-heal`) | test-self-heal(関数と CLI) |
| 契約検査・初期化 | test-init-g5・test-adoption・test-edition-end |
| D-0 の検査(`check-d0.mjs`) | **呼ぶ試験が無い** |
| `unit.mjs` の関数 22 個 | 既存の試験から直接呼ばれているのは `sealChangeLog`・`rosterProblems`・`answersRosterProblems`・`allowedDeciders`・`configDigest`・`aiNameReason` の 6 個。`chainProblems`・`baseChainProblems`・`classifyDelegation`・`changeTypeProblems`・`delegationRuleProblems`・`isRealDay`・`pendingNotices`・`outagePeriods`・`configIntegrityProblems`・`qualificationProblems`・`structureDeciderSeat`・`belowMinimumStaffing`・`findPersonByAccount`・`personKey`・`isAppointer`・`canonicalJson` の 16 個は直接の呼び出しが無い(CLI 経由で間接に通る可能性はある) |
| 保証の主張・組織継続(t288・t288b)、導入前の検証(trial) | test-discouraged-evidence・test-env-check・test-adoption に一部(未突合) |

- `npm run check` はテンプレートの試験を流さない。`test:template` は `scripts/check-template-drift.mjs`(複製の乖離の検査)である。テンプレートの試験はテンプレート側の `gate-g5.yml` の `contract` ジョブが流す(この結線はテンプレートのリポジトリと採用者のリポジトリで働く)

## 2. いまのテンプレートでの実行結果

### 2.1 runall2 の 13 本(件数は `ok`/`FAIL`。「中断」は例外で止まった)

| スクリプト | p302 | pre311 | cur(直した版のまま) | adapt(事前点検へ適応) |
| --- | --- | --- | --- | --- |
| v3 | 101/0 | 100/1 | 0/1 中断(初期化) | 100/1 |
| v3b | 29/0 | 29/0 | 0/3 中断 | 29/0 |
| scenarios | 178/1 | 175/4 | 1/1 中断 | 175/4 |
| new | 136/0 | 136/0 | 0/3 中断 | 135/1 |
| replay | 中断(入力なし) | 同 | 同 | 同 |
| tz | 34/0 | 34/0 | 1/1 中断 | 34/0 |
| acquire | 12/0 | 12/0 | 2/10 | 12/0 |
| matrix | 30/0 | 30/0 | 6/24 | 30/0(出力 3 行が変化。2.4) |
| unit | 76/0 | 76/0 | 76/0 | 76/0 |
| stages | 175/0 | 157/20 | 22/26 中断 | 157/20 |
| test-check-delegation | 39 場面 | 39 | 63 | 63 |
| test-check-pr | 81 場面 | 115 | 115 | 115 |
| test-init-g5 | 78 件 | 110 | 112 | 112 |

### 2.2 runall2 の外の 9 本

| スクリプト | p302 | cur(adapt) |
| --- | --- | --- |
| t288 | 60/0 | 51/9(pre311 では 54/6) |
| t288b | 66/0(`probe-policy.mjs` を写した後) | 39/1 中断 |
| ta | 13/0 中断 | 13/0 中断(同じ箇所) |
| trial・trial-r7 | 35/0・35/0 | 35/0・35/0 |
| s5-init-pr | 7/0 | 6/1(pre311 でも 6/1) |
| verify-n | 30/3 | 29/4 |
| matrix-sweep | 30/0 | 30/0 |
| matrix-sweep `--sweep` | 768 組合せ・失敗 0 | 失敗 68(4 節。時計) |
| tok | 計測のみ | 計測のみ |

### 2.3 cur で全面的に落ちる原因(1 つ。#315)

- 初期化(`generate-profile.mjs --answers answers.json`)が、事前点検(`scripts/gate/preflight.mjs`、#315・ADR-0085)で止まる。止める項目は 2 つ
  1. `.github/CODEOWNERS` に雛形の所有者 `@OWNER` が残っている
  2. 「既存の統制の資産を 1 件検出した」。資産は「既存の製品のコードと履歴」で、正体は場面が作業の場所へ書いた `answers.json`(`git ls-files --others --exclude-standard` で拾われ、`TEMPLATE_TOP` の外のファイルに数えられる)
- テンプレート自身の `test-init-g5.mjs` は同じ問題へ、`@OWNER` を置き換え、回答の JSON を作業の場所の外(`os.tmpdir()`)へ置くことで対応している(コメントに「作業の場所に置くと、事前点検が既存のファイルとして数える」)
- adapt の `fresh.sh` は、組C の版に 2 行を足した: `sed -i 's/@OWNER\b/@tester/g' .github/CODEOWNERS` と、`.git/info/exclude` へ `/answers.json`・`/change.json`。これで初期化は通り、下の 2.4 の残りが見えた
- 分類: **fixture が古い(決定が変わった)**。事前点検は ADR-0085 の新しい要求で、スイートが固定していた決定(K 番号)に当たるものは無い

### 2.4 adapt で残る失敗の分類

| 場面 | 落ち方 | いつから | 原因 | 分類 |
| --- | --- | --- | --- | --- |
| scenarios「過去の記録は変わらず、未記入の通知が無くなる」 | D-0 に `山田 太郎 / 2026-10-01` を探すが、通知日は実行日(`DAY`) | p302 以前から | 3 節 | fixture が古い(時計) |
| v3「K65 CLAUDE.md に『不可逆4操作』が残っていない」 | 後半の `取り消せない時間帯` が CLAUDE.md に無い。前半(「不可逆4操作」が無い)は成り立つ | pre311 から(テンプレート `60e3838`、#294) | 取り消せない操作の定義の文が「取り消せない効果を、他の者の操作を介さずに生じさせる操作」へ変わった(ADR-0078) | 決定が変わった(文言を固定していた) |
| scenarios「AI を示す語を含む氏名(人が確認した旨あり) → 反映」と、後続の 2 件(契約検査・構成書の表示、changeLog の記録) | 名簿へ `Claude Dupont`(`nameConfirmed: true`)を足し、同じ変化点で技術判断者へ任命し、山田が記名 → 「記名を受け付けられません: … AI の名義を受け付けない」で拒否 | pre311 から(`4af67c5`、#296 突合の付記) | `generate-profile.mjs` は `namingProblems(config)` を、この変化点が書く `nameConfirmations` の記録を足す前の構成で判定する。**2 回に分けると通る**(名簿へ足して確認 → 別の変化点で任命。スクラッチの `probe-name.mjs` で確認。上書きの表示も出る) | **回帰か決定の帰結か、記録からは決まらない**。#296 の付記は「本人以外の記名に限る」とだけ定め、同じ変化点での確認と任命の可否を書いていない。既存の試験はこの経路を持たない |
| new「カバレッジの下限を下げる(AI維持管理者の席の責任者の記名) → 反映」 | 差分の文が `90% → 85%` ではなく `80% → 85%` | #311 以後(`ad12ecb`、#318) | 1名 → 2名で未達が解けたとき、代償措置で上げた下限(90)が導出値(80)へ戻るようになった(ADR-0088。下限の由来 `ci.coverageOrigin` と未達の記録の `coverageFloor`)。記名を要することは変わらない | 決定が変わった(前の値を固定していた) |
| matrix の 2名 × poc・mvp・growth の 3 行 | 向き `appoint` → `loosen`、下限 90 → 80。**合否は ok のまま** | #311 以後(#318) | 同上 | 決定が変わった。matrix は向きと下限を出力するだけで期待値を持たないため、検出しなかった |
| stages 20 件(1・5・15 名の G-2・G-4 待ち、self-heal の保留、release の記名) | (a) G-2・G-4 待ちが「未確定事項が残る」(`/spec-write`)になる。(b) `iterate` の 1 回目で「テストが通ったため、ロックを終えました」となり、以後は「ロックがありません」 | pre311 から | (a) 様式から写した仕様に `[NEEDS CLARIFICATION]` が残り、#291 突合(`e12a82e`)で G-2・G-4 の前提条件になった。(b) #296(`7486c0c`、ADR-0079)で `iterate` がテストを実行し、通れば終わるようになった(アダプタ none ではテストを実施せず通過扱い) | 決定が変わった(2 つ) |
| t288 の 6 件・s5-init-pr の 1 件 | 「独立した人の確認を経ていません(人のアカウントによる承認がない)」 | pre311 から(#296) | 模擬の PR の承認(`lib288.mjs` の `reviewer`)に `commit.oid` が無く、承認した版を確かめられない承認(unbound)として数えない(ADR-0079「承認は承認した差分に対して数える」) | 決定が変わった(模擬の形が古い) |
| t288 の 3 件・t288b の中断 | 「コア理解の保持者が1名以下: コア機能」「docs/handover.md の節2 にコア機能の記載が無い」、t288b は `core.holders` が undefined | #311 以後(`1d82e3c`・`33ace03`、#311) | 引き継ぎ文書の読み方の変更。中身は分解していない | 未分解(決定の変更の可能性が高い) |
| verify-n の N6 の 1 件 | 補助ファイルに「6つの前提の内容…」が無い | #311 以後 | スキルの補助ファイルの文の変更。分解していない | 未分解 |
| verify-n の N7 の 3 件 | `tmp/eval286-novice2/harness/p/a-pr*.md` が無い | p302 でも | 入力の欠落 | 入力が無い |
| ta の中断 | `seeded.human` が undefined | p302 でも | trial・trial-r7 へ置き換わった古い版 | fixture が古い |

- **#311〜#318 の変更で新たに落ちた場面**(pre311 → adapt の差): new 1、t288 3、t288b(中断)、verify-n 1、matrix の出力 3 行(合否は不変)。これに全面的な停止(2.3、#315)が加わる
- **#302〜#310 の後・#311 の前(#291・#294・#296・#298)で既に落ちていた場面**: v3 1、scenarios 3、stages 20、t288 6、s5-init-pr 1。組A・組C の記録の後に、誰もスイートを流していない
- 分類の結果、「固定していた決定そのものが破られた」と言い切れる場面は見つからなかった。氏名の確認の 3 件だけが、決定の記録から回帰かどうかを決められない

## 3. 前から落ちている 16 件

### 3.1 scenarios の 1 件(原因を特定した)

- 場面(`scenarios.mjs` 274 行): `check('過去の記録は変わらず、未記入の通知が無くなる', !contract().out.includes('即時通知が未記録') && contract().ok && read('docs/D-0-governance.md').includes('山田 太郎 / 2026-10-01'), …)`
- 直前の場面(273 行)は通知を `notice: { to: '山田 太郎', at: DAY }`(`DAY = TODAY` = 実行日)で記録する。D-0 は `generate-profile.mjs` 2267 行で `${to} / ${n.at}` と書くため、D-0 には `山田 太郎 / <実行日>` が出る
- 期待値の `2026-10-01` は日付の文字列の直書きで、**2026-10-01 に流した場合にだけ通る**。p302・pre311・adapt の出力では、契約検査は「整合しています」(前の 2 条件は成り立つ)で、落ちたのは 3 つ目の条件だけである
- 分類: fixture が古い(時計)。場面が固定する決定(K15: 後から通知を記録し、過去の記録を書き換えない)は成り立っている

### 3.2 replay の 15 件(当初は入力が無く特定できなかった。3.2 追記で特定した)

- `replay.mjs` 10 行は入力を `const IN = 'E:/Github/process-compass/tmp/reverify-scenarios/in'` から読む。必要な入力は 24 件(`a-solo`・`a-3`・`s1-acc`・`s2b`・`s2c`・`s3b`・`s3c`・`s4-15`・`s4-5`・`s4-acc3`・`s4-back5`・`s4x1`・`s4y`・`s5-3`・`s5-4a`・`s5-7a`・`s5-7c`・`s6-6`・`s7-4`・`s7-4b`・`s11-4`・`s11-t`・`sx-1`・`sx-5` の JSON)
- **`tmp/legacy/` にも `/mnt/project-files/backup/legacy-suite-319/` にも `reverify-scenarios/` は無い**(両者は同一。`diff -rq` で差なし)。コンテナ内のファイルシステム全体を探しても無い。Linux では最初の `input('a-solo')` で ENOENT になり、場面に入る前に止まる
- 利用者の端末で「15 FAIL」と出ていたのは、入力が `E:\Github\process-compass\tmp\reverify-scenarios\in` に在ったことを示す。この入力は 319 の退避の対象に入っていない
- 原因の候補(検証していない): `clampDates` は実行日より**後**の日付だけを実行日へ寄せ、**前**の日付はそのまま渡す。一方、K65 は「最後の記録より前の発効日を受け付けない」。初期化の記録は実行日なので、入力に過去の日付が残っていれば拒否される。ただし reg10(10 月 13 日ごろ)と組A・組C の実行で件数が同じ 15 のままである点は、日付の進みに比例して増える形と合わない。決めるには入力が要る

### 3.2 追記: 入力を得て流した結果(2026-10-27。原因を特定した)

上の 4 項は入力を得る前の記述で、そのまま残す。議長が利用者の端末から入力を読み出し、`tmp/legacy/reverify-scenarios/` へ置いた(`in/` の JSON 78 件、`lib.sh`、`details.md`、`report.md`)。replay が読むのはこのうち 24 件である。`replay.mjs` の入力の置き場だけを、この場所へ読み替えて流した(スクラッチの `rp.sh`)。ほかの規則は 0 節と同じ。

**結論: 15 件の原因は時計である。** 入力の発効日(`date`)は 2026-10-01〜2026-12-20 の架空の日程で書かれている。`clampDates` は実行日より後の日付だけを実行日へ寄せ、前の日付はそのまま渡す。初期化の記録は実行日に作られ、K65(最後の記録より前の発効日を受け付けない)が、実行日より前の発効日を拒否する。2026-10-02 以後は、`2026-10-01`・`2026-10-10` の入力が拒否される。拒否で積み上がらなかった状態に、後続の場面が連鎖して落ちる。

確かめたこと:

| 実行 | 結果 |
| --- | --- |
| そのまま流す(実行日 2026-10-27)。p302・pre311・adapt、`ff13247`〜`1881350` の 7 版 | どれも 47 場面のうち 19〜20 件が落ちる。拒否の文は `date "2026-10-01" は、最後の変化点の記録の日付(2026-10-27)より前です` など。拒否された日付は 10-01・10-10・10-15・10-20・10-21・10-22 |
| 実行日を X とみなす(X 以後の `date` は実行日へ寄せ、X より前はそのまま。`rp3.sh`)。X = 10-08・10-12・10-13 | `aab3b7a`・`1881350`(組C の `BASIS` の直しあり)・`ec8ecd6`(p302)のどれも **ちょうど 15 件**。落ちる場面の並びは版によらず同一。記録に残る 15 件(reg10、組A・組C)が再現した |
| X = 2026-10-01(入力を書いた日)。`dfc2fef` | **0 件**(54 場面すべて ok) |
| X = 2026-10-02。`dfc2fef` | 15 件 |
| 過去の `date` も実行日へ寄せる(`rp2.sh`)。`dfc2fef`・`aab3b7a`・`47f7920`・`1881350`(`BASIS` の直しあり) | **0 件** |

- 件数が 10 月 2 日から 13 日まで 15 のまま動かなかったのは、拒否される日付(10-01・10-10)が連鎖の根に近く、10-10 の拒否で落ちる場面が 10-01 の拒否の連鎖に既に含まれているためである。10-15 以後は件数が増える。今日(10-27)は 19 件で、入力の日付は 12-20 まであるため、それまで増え続ける
- 落ちた場面の多く(`s1` の 3 件、`s2b`・`s2c`、`sx-1` の dry-run、`s3c`、`s3b` の 2 件、`s4-acc3` の 2 件、`s4y`、`s11-t` など)は、自分の入力の日付ではなく、前の場面の拒否で状態が欠けたために落ちる

**日付の影に隠れていた失敗(5 件)**: 過去の日付も寄せて流すと、`039527b`(#302・#304・#305・#307 の反映。決定 A-4: 出荷判定者は独立レビュアと兼ねない)以後の版(p302・pre311・adapt)で、5 件が残る。

- 根は 1 件: `s4: s4-acc3 の席(任命権者の記名) → 反映`。入力 `in/s4-acc3.json` が独立レビュアと出荷判定者を同じ人(鈴木 一郎)に置き、「兼務禁止に抵触します: 独立レビュア × 品質保証(出荷判定者)」で拒否される。組A が `fix-suite.py` で v3・new・tz の土台に施したのと同じ直しが、replay の入力には施されていない(組A・組C は replay を「前から落ちる」として調べていない)
- 残る 4 件(`s4y`・`s11-4`・`s11-t`・「変更種別の登録と、確約範囲・コア指定の宣言」)は、席が未記入のまま後続が進んだことによる連鎖である
- 日付による 15 件の中で `s4-acc3` は 10-01 の日付で先に拒否されるため、この失敗は 10 月 13 日の時点でも件数に現れなかった
- 分類: fixture(入力)が古い(決定 A-4 が変わった)。#311〜#318 の変更による差は replay には無い(pre311 と adapt の結果は同じ 5 件)

その他:

- `ff13247` では、日付を寄せても `14-9: CLAUDE.md の生成区間の書き換え(既存の検出)` の 1 件が落ちる。次の版 `dfc2fef` で通る。replay を書いた時点のテンプレートの状態であり、今回の 15 件とは関係しない
- `1881350` を元の `BASIS`(`detection` が 1 つの文)のまま流すと、日付を寄せても途中で落ちる(46/1 で止まる)。組C が記録した C-3 の影響と同じである
- `report.md` は 2026-09-30 の再検証の指摘の一覧、`lib.sh` は当時のシェルの補助(`RV=/e/Github/process-compass/tmp/reverify-scenarios`、`next_review: 2027-03-31` の直書きを含む)である。`in/` の 78 件のうち replay が読まない 54 件は、再検証の当時の入力である

### 3.3 `reg10` について

- Issue の本文が引く `tmp/fix288-tpl2/reg10/` は、退避された `tmp/legacy/fix288-tpl2/` に無い。件数の一致は記録の上でしか確かめられない

## 4. 時計に依存する箇所

### 4.1 所在

| 所在 | 形 | 落ち方 |
| --- | --- | --- |
| `lib.mjs` 93〜98 行 `TODAY` | `new Date()` の手元の時刻帯の日付。**モジュールの読み込み時に 1 回だけ**計算 | 実行が日付の境をまたぐと、子プロセス(`generate-profile.mjs`)が書く記録の日付は翌日、場面が渡す `date: TODAY` は前日になり、K65(最後の記録より前を受け付けない)で拒否される。**今回の adapt の `matrix-sweep --sweep`(634 秒、UTC 0 時をまたいだ)で実際に起きた**: 768 組合せのうち 68 件が失敗、出力に `date "2026-10-26" は、最後の変化点の記録の日付(2026-10-27)より前` が 30 回。p302 の同じ実行(470 秒、日付をまたがない)は失敗 0 |
| `scenarios.mjs` 274 行 | `'2026-10-01'` の直書き | 3.1。2026-10-01 以外の日は常に落ちる |
| `v3.mjs` 180 行 | `confirmedAt: '2026-12-01'` で「確認日が発効日より後 → 拒否」を確かめる | **2026-12-01 以後は、確認日が発効日より後でなくなり、場面が落ちる**(推定。コードから) |
| `lib.mjs` 50 行ほか(`lib288.mjs`・`stages.mjs`・`t288.mjs`・`s5-init-pr.mjs`・`verify-n.mjs`) | D-0 の `next_review: 2027-03-31` の直書き | `check-d0.mjs` 72 行は `next_review` が過ぎると失敗する。**2027-04-01 以後、`checkD0()` を確かめる場面がすべて落ちる**(推定。コードから) |
| `new.mjs` 243 行 | `reviewBy: '2026-12-31'`(記名なしで拒否されることを確かめる場面) | 拒否の理由が記名でなくなれば落ちうる(未確認) |
| `stages.mjs` 23〜25 行 | 判定日時を `getMinutes() + 1` で作る | 毎時 59 分に `HH:60` という実在しない時刻を書く。日付・時の繰り上げも無い |
| `verify-n.mjs` 143〜145 行 | 2 時間後の時刻。`sameDay` で日付の境を分岐 | 境を意識した唯一の箇所 |
| `t288b.mjs` 8〜11 行 | `daysAgo(n)` を `toISOString()`(UTC)で | 手元の時刻帯が UTC でない端末では、`TODAY`(手元)と 1 日ずれる時間帯がある |
| `tz.mjs` | `TZ` を子プロセスへ渡し、`Intl.DateTimeFormat` で 3 つの時刻帯の日付を比べる | 時刻を固定せず、25 時間離れた時刻帯で確かめる設計(コメントに明記)。ICU の時刻帯の情報に依る |
| `ta.mjs`・`trial*.mjs` | 採用者のコードの中の `Date.now()`、`2099-01-01` | 将来の日付は遠く、当面は落ちない |
| r3 の `setup.mjs`・`trial.mjs` | `TODAY`・`HHMM` を起動時に計算 | 同上の境の問題 |

- テンプレート側: `check-d0.mjs`(`Date.now()`)、`test-edition-end.mjs`・`test-results.mjs` が `Date.now`・`new Date` を使う。テンプレートの試験に時刻を固定する仕組みは無い。スクラッチの環境に `faketime` は無い
- 時刻を差し替える入口(環境変数・引数)は、`generate-profile.mjs` にも `check-d0.mjs` にも見当たらない(`TZ` だけが効く)

## 5. 移植上の問題

### 5.1 安全

- 元の `fresh.sh` は `git init -q -b main . 2>/dev/null` の失敗を黙って捨て、続けて `git add -A`・`git commit` を実行する。`w/<name>` が別のリポジトリの中にあり、`git init` が失敗すれば、**外側のリポジトリ(process-compass そのもの)へコミットする**。組A・組C が最上位の確認を足したのはこのためである。r3 の `setup.mjs` の `clone()` には同じ確認が無い
- 作業用の複製は `suite/w/` の下に作られ、process-compass の作業ツリーの中(`tmp/`)に入れ子のリポジトリができる

### 5.2 絶対パス・欠けた入力

| 所在 | 内容 |
| --- | --- |
| `replay.mjs` 10 行 | `E:/Github/process-compass/tmp/reverify-scenarios/in`(Windows の絶対パス。入力も退避されていない) |
| 元の `unit.mjs` 2 行 | `file:///E:/Github/process-compass/tmp/impl288-tpl/tpl/...`(組C が相対へ直した) |
| `verify-n.mjs` 10 行 | `path.resolve(HERE, '../../eval286-novice2')`(退避されていない) |
| `t288b.mjs` 21 行 | `W.DIR/../../../probe-policy.mjs`(スイートの外のファイル。`tpl2-setup.sh` は写さない) |
| r3 の各スクリプト | `../../template`(作業ツリーのテンプレートを直接読む)と `../fix288-tpl2/fakebin`(別のスイートの偽の gh) |
| r3 の `trial.mjs` | `adopter/src/inspection.js` を読むが、どのスクリプトも作らない(6 節) |

### 5.3 Windows 依存

- `lib288.mjs`・`t288.mjs`・`s5-init-pr.mjs`・`verify-n.mjs`: `new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')`。ドライブ文字を外す処理で、Linux でも動くが、パスに空白・日本語があると百分率符号化のまま残り、読めない(`fileURLToPath` を使う `lib.mjs` は影響を受けない)
- 組C の `fresh.sh` の `pwd -W`(Git for Windows の MSYS だけにある)
- `fakebin/gh` は bash のスクリプト。Node の `execFileSync('gh')` から Windows で呼べるかは確かめていない
- `mockgh-prs.mjs` は `cp.execFileSync` を差し替え、`syncBuiltinESMExports` で反映する。テンプレートが gh を `spawnSync` など別の関数で呼ぶようになると、**模擬が黙って効かなくなる**

### 5.4 CRLF

- `sync.sh`・`tpl2-setup.sh`・r3 の `clone()` は、拡張子で選んだテキストから `\r` を除く。Windows の端末で `template/` が CRLF で展開される前提の処置
- リポジトリの根の `.gitattributes` は `* text=auto eol=lf`。`template/` には `.gitattributes` が無い。このコンテナの作業ツリーには CR を含むファイルが 0 件。`tmp/legacy/` の中も 0 件

### 5.5 ネットワーク・外部コマンド

- ネットワークへの依存は見つからなかった(gh は偽、`git fetch` は無い)。`next.mjs` の既定ブランチの読み取りは origin の HEAD を読めず、手元の main を使う(出力に明記される)
- GNU に依る箇所: `sed -i`(BSD/macOS では引数が違う)、`timeout`(macOS の既定に無い)、`tar`
- 実行には git の利用者名・メールの設定を要する(fresh.sh が各複製に設定する)

## 6. r3 の `scen*.mjs`(`tmp/legacy/fix288-r3/`)

- 構成: `setup.mjs`(clone・init・seats の 3 段。採用者「東海精機工業」のリポジトリ `adopter/` を作る)→ `trial.mjs`(a〜g の段。出力を `out/` へ保存するだけで、判定 0 件)→ `scen.mjs`(判定 27)→ `scen2.mjs`(11)→ `scen3.mjs`(12)。**前の段の状態を引き継ぐ連鎖**で、単独では流せない
- **`BASIS` を使っていない**(`basis`・`changeTypes` の語も無い)。`detection` の語は保証の開示の `assurance.detection.human` を指す別物。組C の `BASIS` の直しは r3 に関係しない
- いまのテンプレートで流した結果
  1. そのまま: `setup.mjs` の初期化が事前点検(2.3 と同じ 2 項目)で止まり、以後すべて「プロセス構成が未設定」で落ちる
  2. `clone()` に 2.3 と同じ適応を足した場合: setup は通る。`trial.mjs` の b 段で、合否の基準に新しい必須の行「実環境の統制の確認(ルールセットの適用・PR のレビューの取得・ship-evidence の成果物の取得)」が未記入として拒否され(テンプレート `9c13c3e`、#315)、d 段で `adopter/src/inspection.js` が無いため例外で止まる。`scen.mjs` は 2 件落ちた後 `evidence/seeded-errors.json` が無く止まり、`scen2.mjs`・`scen3.mjs` は `docs/adoption-trial/undefined` を読もうとして止まる
- `src/inspection.js`(採用者の製品のコード)を作るスクリプトは退避物に無い。r3 は**退避物だけでは再現できない**

## 7. 廃した言い回しの登録簿

| 項目 | 現状 |
| --- | --- |
| 置き場 | `src/data/provision-forms.yaml` の `retiredPhrases`。検査は `scripts/check-provisions.mjs` の 6 番目(`npm run lint:provisions`、`npm run check` に含む) |
| 句の数 | **66 句**(当時 20 句。組A の検査の記録では 13 句)。登録日 2026-10-13 が 20、10-23 が 18、10-24 が 28 |
| 決定ごと | ADR-0086 23、ADR-0069 5(+#300 由来 2)、ADR-0071 5、ADR-0081 5、ADR-0082 5、ADR-0083 5、ADR-0059 3、ADR-0079 3、ADR-0062 2、ADR-0064(#300 N4)2、ADR-0066 2、ADR-0067 2、ADR-0063 1、ADR-0060 1 |
| 検査の内容 | 行に句が**部分文字列として含まれる**かだけ。行に `retired-ok: 理由` があれば除く。各句は `retired`(日)・`by`(決定)・`instead`(代わり)を持つ |
| 見る範囲 | `retiredScan.roots` = `src/content/docs`・`src/data`・`template`。拡張子 `.md`・`.mdx`・`.yaml`・`.yml`・`.mjs`・`.json`。除外は `src/content/docs/adr`、3 つの台帳、`community/provision-forms.md`、登録簿自身、`impl-inventory-baseline.yaml`、`template/evidence` |
| `template/` | 見る。置き場が無い・空(サブモジュールを初期化していない)なら失敗に数える(#293 J-3 / ADR-0077) |
| `zenn/` | **見ない**(roots に無い)。このコンテナでは zenn のサブモジュールは初期化されていない |
| `research/`・`scripts/` | 見ない |
| 回帰スイートとの関係 | 登録簿の句をスイートで探すと、`t288b.mjs` に「第三者による棚卸し」(ADR-0066)が 1 か所ある。スイートを `template/` の下へ置けば検査の対象になり、`scripts/` の下なら対象外になる |

- 登録簿が扱うのは「廃した言い回し」(語句)である。ADR の「課さないと決めたこと」「採らなかった案」の文そのものを `template/` で探す仕組みは、登録簿の外に無い。登録簿へ載るのは、決定のたびに担当が句を選んで足した分だけである

## 8. 実行時間の目安

計測はこのコンテナ(UTC、他の実行と並行した時間を含む)。CI の runner の速さは確かめていない。

| 対象 | 時間 |
| --- | --- |
| runall2(スイート 10 本 + テンプレートの試験 3 本)、p302 | 2 分 41 秒 |
| 同、pre311 | 3 分 11 秒 |
| 同、adapt | 3 分 25 秒 |
| 同、cur(初期化で止まるため短い) | 1 分 14 秒 |
| runall2 の外の 9 本(sweep を除く)、p302 / adapt | 約 2 分(t288b は写す前の 1 秒で数えた)/ 約 2 分 27 秒(t288 14〜16 秒、trial・trial-r7 各 27〜31 秒、matrix-sweep 40〜50 秒) |
| `matrix-sweep --sweep`(768 組合せ) | 470 秒(p302)/ 634 秒(adapt) |
| テンプレートの試験 20 本の合計(cur、並行実行中) | 約 58 秒(test-check-pr 17.9、test-init-g5 9.2、test-env-check 7.7、test-adoption 7.6、test-edition-end 7.6、ほかは 2 秒未満) |
| `scripts/test-tailoring-engine.mjs` | 0.2 秒 |

- 1 本あたりの所要の大半は、場面ごとの `node scripts/init/generate-profile.mjs` と `verify-gate-contract.mjs` の子プロセスの起動と、`fresh.sh` の tar と `git commit` である
- 置き場の制約: `npm run check` は `ci.yml` の `check` ジョブで流れ、テンプレートの作業ツリーはサブモジュールとして得る。テンプレートの試験は `npm run check` に入っておらず、テンプレート側の `gate-g5.yml` の `contract` ジョブ(PR と既定ブランチへの push)が流す。`gate-g5.yml` は採用者のリポジトリへも配られる
- `ci.yml`・`gate-g5.yml` に `timeout-minutes` の指定は無い(GitHub の既定 360 分)
- スイートを流すには、テンプレートの作業ツリーと、標準から作り直した知識ベース(`build-template-kb.mjs`)の両方が要る(adapt・cur の手順)。テンプレート単独の CI では、標準の作業ツリーが無いため後者を作れない

## 9. 退避物の状態(参考)

- 退避物(`tmp/legacy/`)は、スイートを流すのに必要なものが欠けている(`reverify-scenarios/` は 2026-10-27 に議長が補った。3.2 追記): `eval286-novice2`(verify-n)、`reg10/`(過去の結果)、r3 の採用者の製品のコード。`probe-policy.mjs` は在るが、手順に写す行が無い
- `tmp/legacy/` と `/mnt/project-files/backup/legacy-suite-319/` の中身は同一
- 調査で作ったもの(スクラッチ、git の外): `setup.sh`(環境の作成)、`extra.sh`(runall2 の外の 9 本)、`adapt/suite/fresh.sh`(事前点検への適応)、`adapt/suite/probe-name.mjs`(氏名の確認を 2 回に分ける経路の確認)、各環境の `out/`・`outx/` の出力
