# 束 B25 独立の突合 1巡目(全体)— 単位 C・S(2026-11-19)

対象: 単位 C(IMPL-0772・0651・0709・0900。template `6711635..c6d928e`、本体 `bc424f3f..cf61443e`)、単位 S(IMPL-0636・0640・0643・0980・1030。template `c6d928e..4f3faf8`、本体 `7aee6aa7..9f6e0f8c`)。実装の担当の記録(40-impl-C.md・40-impl-S.md)は最後に読んだ。ファイルは書き換えていない(本ファイルを除く)。

件数: **高 3 / 中 4 / 低 8**

## 実行したこと

- WSL の node 26.13.1。`git -C template archive 4f3faf8` を /tmp の写しへ展開(test-adoption は写しで `git init` と commit が要る。無いと事前点検の1件が環境で NG になる)
- 関係する試験(写し・4f3faf8): test-adoption 74 / test-init-g5 180 / test-check-pr 270 場面 / test-model-adoption 40 / test-recalibration 17 / test-roster-conditions 61 / test-roster-rules 216 / test-performer-account 71。すべて期待と一致
- 実装を外して落ちることの確認(写しごとに1つ外す):
  - 0772 `if (!declared)` → `if (false)`: test-adoption の ng 2件(simplified・omitted)が NG
  - 0709 `baselineShrinkProblems` を常に空: test-check-pr の ng 3件が NG
  - 0651 `profileMdProblems` を常に空: test-init-g5 の ng 4件(1名・3名 × 2)が NG
  - 0643 モデルの照合を飛ばす: test-model-adoption の 0643 の 5件が NG
  - 0640 `qualification.record` の照合を外す: 2件が NG
  - 0980 条件を「移す」だけに戻す: test-recalibration の 1件が NG
- 0636 の D-0 生成区間の変化: c6d928e と 4f3faf8 の `renderD0Section('competence', cfg)` を、4席の外に責任者のいる席を持つ構成で比べた → 一致しない(`same section: false`)
- 本体: `npm run -s lint:impl` → exit 0(実装マーク 1018 件、降りていない規定 112 件)。`npm run -s test:fields` → 11 件一致。`check-template-fields` → 13様式 / 327欄
- 一時ディレクトリは消した

## 所見

### 高

**H-1 0772 が、知識ベースの更新で強まった導出を「宣言の無い逸脱」として G-5 で止める。裁定の条件(導出の版)を変え、既存の決定「未適用の厳格化は適用まで表示する」と食い違う**
- 所在: `template/scripts/gate/verify-gate-contract.mjs:391-415`、`template/scripts/init/generate-profile.mjs:317-352`(`pendingTightenings`)、`template/README.md` 14 節、`src/content/docs/phase4-process-design/tailoring-guide.md:1417`
- 事実: B21 案 §3.3 は「導出の版は構成が記録した KB の版で行う(版が違う導出で偽の差を出さない)」としていた。実装は取り込んだ KB で導出する。条件 `rank(have) < rank(want)` は、既存の `pendingTightenings`(#318 突合 X-4 / ADR-0088 決定4 を引くコメント。「構成は書き換えない。適用されるまで表示し続ける」。止めるのは CL1 以上の G-6・G-7 が出荷の集約で欠落になる場合だけ)と、merged→omitted を除いて同じ条件になる。このため、取り込みで規則が厳しくなった採用者は、これまで表示だった差のせいで `gate-g5.yml` の契約検査が全 PR で落ちる。試験の g2 simplified の場面が、この状態と同じ形をしている。実行時の文言は「宣言がありません。標準から外した項目を宣言せずに運用できません(禁止事項6)… 回答を改めた結果なら /process-change」で、知識ベースの更新という原因を出さない(README 14 節には書いてある)。同じ構成に「未適用の厳格化」の注記(表示)と契約検査の失敗が同時に出る
- 実装の担当の記録(40-impl-C §裁定どおりに作れなかった点1)は開示している。ただし既存の X-4 の設計との突合が無く、議長の裁定も無い
- 直す案(議長の裁定が要る):
  - (a) 0772 の失敗を、構成が記録した知識ベースの識別と取り込んだ KB の `source.commit` が一致するときに限る。生成のときに `config.template.kbCommit` などへ KB の `source.commit` を道具が書く。一致しない、または記録の無い構成では、差を `pendingTightenings` の表示に任せる。決定可能な条件で、裁定の「偽の差を出さない」を満たす
  - (b) 止める向きを採る。この場合は X-4 の「表示し続ける」を置き換えることになる。ADR-0088 の扱いを突合し、ADR の原則の変更に当たるなら重へ上げる。実行時の文言に「取り込んだ知識ベースの更新で導出が強くなった場合も同じ(/process-change の種別 settings の空の入力で再導出)」を足す。`pendingTightenings` の注記も止まる旨に改める
  - 推す: (a)。note の「構成は知識ベースの版を記録しない」は、記録を足せば解ける

**H-2 標準の本文 1.10.2 の表が、IMPL-1030 を降りていないと書いたまま**
- 所在: `src/content/docs/phase4-process-design/overview.md:711`
- 事実: 行「別の自然人どうしが、同じ認証情報を使う構成」の本文が「D-0 節12 の表が受ける予定である。ただし…書き分けることは降りていない(IMPL-1030)」のまま。マークは同じ差分で `state=delivered` に上がった。本文の表示と実態が食い違う
- 直す案: 編集の指摘(ed)。「離脱の記録の場所は、準拠テンプレートの D-0 節12 の表である(禁止した組の席どうしと別の自然人どうしに書き分けてある。IMPL-1030)」に改める。ADR-0225 決定5 の同じ文は、採用済み ADR の本文なので書き換えない(L-8)

**H-3 IMPL-0976 の note が、0980 を undelivered と書いたまま**
- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md:2099`(IMPL-0976)
- 事実: note が「recalibration.mjs は『移す』に移した先の保証が無い行を無視して所見に出す。判断『外す』の行に移した先の保証を求めないことは IMPL-0980(undelivered)」のまま。実装は「外す」にも保証を求める(`recalibration.mjs:44`)。表示と実態が食い違う
- 直す案: ed。「『移す』と『外す』に移した先の保証が無い行を無視する(『外す』は IMPL-0980)」に改め、`npm run impl:write` を流す

### 中

**M-1 README 15 節の「止める検査は 0980 の1つだけで、ほかは表示です」が誤り。止まる変更が2つ抜けている**
- 所在: `template/README.md` 15 節の冒頭
- 事実: (1) 0636 で D-0 節9 の生成区間が変わる(実行で確かめた)。`check-d0.mjs:104-106` は、連鎖を始めた構成では生成区間の食い違いを失敗にする。README の 0636 の箇条は「check-d0 が食い違いを出す」と書くが、冒頭の文と矛盾する。(2) 1030 で `renderProfileMd` の注記の文(`generate-profile.mjs:3697` 付近。適用の表明より上の名の構成で出る)が変わる。同じ束の 0651 の照合によって `check-process-rules`(gate-entry)が再生成まで落ちる。15 節はこれを挙げていない(14 節の一般の文だけ)
- 直す案: 冒頭を「止める検査を足したのは 0980 だけ。ただし取り込むと、D-0 の生成区間(0636)と PROCESS-PROFILE.md の注記(1030)が変わり、check-d0 と check-process-rules(IMPL-0651)が再生成まで失敗する」に改める。対処の手順(`generate-profile.mjs --answers process.config.json` か /process-change)を1か所にまとめる

**M-2 0651 の照合は、旧い構成でも失敗にする。D-0 の生成区間の先例(旧い構成では注意)と扱いが違う**
- 所在: `template/scripts/gate/check-process-rules.mjs:76-91`、`template/scripts/gate/check-d0.mjs:104-106`
- 事実: check-d0 は `chainStarted(config)` でない構成の生成区間の食い違いを `warn` にとどめる(「旧い構成のため注意にとどめています。最初の /process-change の後は失敗します」)。0651 は構成書を手で書いていない採用者も含め、取り込みの直後から無条件に失敗させる。偽の失敗ではない(生成は構成だけから決まる。`renderProfileMd` は fs・日時・環境を読まないことを確かめた)。ただし、既存の採用者を止める範囲が先例より広く、それを裁定していない
- 直す案: check-d0 と同じく `chainStarted` でない構成は注意にとどめ、最初の /process-change の後に失敗させる。または、全件で止める理由を裁定に書いて note に残す

**M-3 D-0 節12 の (2) の書き分けが、ADR-0225 決定5 の除外を出していない**
- 所在: `template/templates/00-d0-governance.md:475`(箇条)・`483`(表の前文)
- 事実: (2) は「同じく列挙に無い離脱に数え、共有へ入る前の個別の認証の記録の所在…を採用者が確かめる」と書く。決定5 の内容は2つある。1つは、個別に認証され記録が残る場合は (2) に**当たらない**こと。もう1つは、名簿で1人に対応づけたホスティングのアカウントを別の人が使う構成は、記録があっても当たること。D-0 はどちらも書いていない。読み手は、記録があっても離脱として記録すべきか分からない。逆に、記録さえあれば名簿のアカウントの共有も外せると読む余地もある。決定1〜3(2つの行・禁止でない組の AI の担い手どうしを数えない・3.5.2 の例外は (1))と決定4(変えない)は合っている。欄は足していない。IMPL-1004 のマークは変わっていない
- 直す案: (2) に1文を足す。「共有へ入る前に使う自然人が個別に認証され、その記録(鍵の保管庫の記録など)が残る場合は、記録を要しない。ただし、名簿で1人に対応づけたホスティングのアカウントを別の自然人が使う構成は、記録があっても (2) として記録する(ADR-0225 決定5)」。試験は文の存在の固定を1つ足す

**M-4 0643 は「してはならない」の禁止を表示で受けているが、note は止めないことを開示していない**
- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md:255`、`template/scripts/gate/org-assurance.mjs`(`seatQualificationProblems`)
- 事実: 評価を通過していないモデルを席の確認の対象にした構成でも、適合性確認の記録は有効なままで、委任の可否は変わらない。出るのは `continuityState.problems` だけで、表示先は出荷の集約の「読めない記録」の行(`aggregate-evidence.mjs:6239`)。`/pit`(next.mjs)は `ct.problems` を出さない。README 15 節は「止めません」と書くが、note は「照らす…問題の一覧に出す」だけ。0640 の note は「失敗にしない」と書いており、並びが揃っていない。ruling-a1 §3.5 の置き場(problems)どおりで、裁定違反ではない
- 直す案: note に「表示だけで止めない。確認の記録の有効性と委任の可否は変えない(出荷の集約の読めない記録に出る)」を足す。止める向きにするかは議長が判断する(禁止の規範で、品質と適合の主張に響く)

### 低

- **L-1** 0772 の試験に、裁定 B21 の ok「導出 simplified・構成 required」(強い向き)の場面が無い。`test-adoption.mjs` の5場面目は「導出と同じ状態」で、強い向きを固定していない。場面を1つ足す
- **L-2** 0772 は merged-into-gN → omitted を同じ段に数え、確かめない(`rank` が両方 1)。note は向きを列挙して開示している。README 14 節は merged-into を書いておらず、note と食い違う。README を note に揃える
- **L-3** 0772 の文言の「宣言(unmet[] か deviations[] の記録)」: unmet[] は状態が unmet のときしか受け付けない(`verify-gate-contract.mjs:339-344`)。simplified・omitted のまま unmet[] へ書くと別の検査で落ちる。文言と README は「未達として記録する(state を unmet にし unmet[] に理由)」と書くのが正しい。担当の記録の「omitted は常に失敗」は、ADR-0028(未達と省略の区別)と合っている。正当な構成は止めない(導出より弱い省略は未達である)
- **L-4** 0709 はファイル名 `answers.json` で拾う(`check-pr.mjs` `baselineShrinkProblems`)。基準集合の外の answers.json(採用者のフィクスチャ)も対象になる。移動(rename)は旧い所在の全事例の削除に数え、承認を求める。安全側の誤検出で、文言から原因は分かる。note か README に一言書く
- **L-5** 0643 の照合の正規化(`org-assurance.mjs:593` `normKey` は空白と半角括弧を除く)と、導入の記録の側(`model-adoption.mjs:19` `norm` は空白だけ除く)が違う。`x(1)` と `x1` を同じモデルに数える。どちらかへ揃える
- **L-6** 0900 の降ろし先 `gate-skill-g7` の checker が `aggregate-evidence`(`impl-targets.yaml`)。G-6 の先例に倣った形だが、集約はこの手引きの確認を照らさない。台帳の「検査」の列が誤解を招く。manual の降ろし先の checker の慣例を確かめる(g6 と同じなら現状のままでよい)
- **L-7** `process-change/reference/input.md` の `competence` の行は、まだ「判断を担う席。標準 第3章 3.4.3」とだけ書く。4席の外は 3.4.1 の任命の確認として任意で書ける旨が無い。同じ欄を 3.4.1 と 3.4.3 の両方に使うのは B21 の裁定どおり
- **L-8** 0651 の note「D-0 の生成区間は check-d0.mjs(IMPL-0728)」: check-d0 は旧い構成では注意だけ(M-2)。限定を note に書く。ADR-0225 決定5 の「降りていない(IMPL-1030)」は採用済み ADR の本文で書き換えられない。台帳と本文(H-2)で現状を示せば足りる

## 見た・無かった観点

- 0709 の target=pr-checks、0900 の target=gate-skill-g7(`lint:impl` が実在を確かめて通過)。0772 の note の「確かめる者: プロセス内部監査」。0636 の check=manual(b24 の裁定どおり)。0640 の presence の単位の書き方(キー `seats[].qualification.record`)
- 0636: 様式の欄の新設に当たらない(節9 の表の既存の5列へ行を足すだけ。説明の段落は生成区間の外)。`template-fields.yaml` は変わっておらず、両方向の検査も通る。入力の検査(`generate-profile.mjs:4989-5003`)は席を限らず、本人の確認と AI の名義を拒む
- 0651: 非決定の値は無い(`renderProfileMd` は fs・Date・env を読まない。書き出しも `buildConfig` と同じ `evaluate(KB, answers)` の結果を使う)。偽の失敗は見つからなかった。止まるときの理由(手で編集した・テンプレートの更新)と再生成の手順は実行時の文言に出る
- 0643: 導入の記録のファイルが無いと「確かめられない」と出す。黙っては通らない(M-4 は開示の問題)
- 0980: 裁定どおり。calibration-register.md と settings.md の説明も広げてある
- 0900: G-7.md の項目は 3.5.2 要求事項1 と注記(3択・兼務を独立性として扱わない)に合う。様式 04 の節「支援と判定の兼務」は実在する(`templates/04*.md:289`)
- 1030: 禁止していない組の AI の担い手どうしを離脱に数えない(`sharedCredentialForbiddenPairs` の判定は変えていない。試験で固定)。人が書く表の欄は埋めていない。IMPL-1004 のマークは変えていない
- 過去の決定の固定: 名簿の試験(roster-rules 216・roster-conditions 61・performer-account 71)が通る。名簿の契約(別の人への同じ数値の識別子の拒否)は変えていない
- 裁定に無いことの追加: 見つからなかった(0636 の diffConfig の remaining の注意は、裁定の「/pit と D-0 の注意」の範囲内と読んだ)

## 見ていない点

- 実物の GitHub での動作(0709 の PR、gate-entry と gate-g5 の結線の実行)。回帰の全量・`npm run check`
- 実機の /process-change で4席の外の `competence` を書く入力と、旧い版で生成した採用者の構成を取り込む通し(D-0・構成書の再生成の手順の実行)
- 出荷の集約の全体での 1030 の注記の出力(試験は文の存在だけ)。CL1 で H-1 の差が出荷の欠落と G-5 の失敗の両方に出る様子
- `research/b25-deliberation/30-ruling.md` は 0636 の行だけ読んだ(単位 C・S は b24 の 30-ruling-draft を正とした)。単位 D とその他の単位は対象外
- template の作業ツリーの HEAD(197f7b4)と未コミットの `tailoring-kb.json` の差は見ていない(4f3faf8 の写しだけを見た)
