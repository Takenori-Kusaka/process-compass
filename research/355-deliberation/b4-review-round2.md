# #355 束4 独立の突合 2巡目(直した差分だけ)(2026-11-15)

- 対象: 本体 `git diff ff17018..HEAD -- src`、template `5378c16..e934457`。直しの指示 `b4-fix-round1-ruling.md`、直しの記録 `b4-fix-round1.md`
- 立場: 実装も1巡目も見ていない別の文脈。何も直していない。コミットなし。最後の巡
- 実行: WSL・node v26.13.1。template を WSL のホームへ写し(e934457)、通しの試験の足場を写した探針(場面3つ)と破壊4点を流した。写し・探針・node_modules の junction は消した
- 件数: 高 1 / 中 2 / 低 4

## 0. 実行で確かめたこと

| 確かめたこと | 結果 |
| --- | --- |
| 対象の4試験(e934457) | 通過(approval-pace 全通過、assurance-period 37、size-observation 19、check-pr 217) |
| `node scripts/check-impl.mjs`(本体 HEAD の src と template e934457) | 終了コード 0。`check-evidence.mjs` は 260 件で通過 |
| `isProseDocument` を 48 のパスで直に呼ぶ | 真: 文書の置き場の `.md`・画像・データ(`.json`・`.yaml`・`.svg`・`.css`・`.zip`・`.lock`)、直下の `*.md`(`README.md`・`CLAUDE.md`・`AGENTS.md`・`PROCESS-PROFILE.md`)、`specs/F-001/spec.md`、`templates/*.md`、`context/decisions/*.md`、`docs/sub/CLAUDE.md`。偽: `.github/**`・`scripts/gate/**`・`.claude/**`・`process.config.json`・`.mcp.json`・`adapters/**`・`package-lock.json`・`package.json`・`LICENSE`・`CODEOWNERS`・`records/**`・`src/notes.md`・`docs/tool.js` |
| 探針 doc(PR 10 件。人の承認はすべて 3 分後) | `docOnly` 4 件(`CLAUDE.md` だけ / `docs/` の `.json` と `.svg` / `specs/F-001/spec.md` / `templates` と `context/decisions`)。`noDenominator` 4 件(`scripts/gate` の 300 行 / `package-lock.json` / `.claude/settings.json` / `docs` の md とワークフローの混在)。`docs/quality-assurance-policy.md` だけの PR は記録だけの PR(`recordPrs`)へ入り、観測のどこにも出ない |
| 探針 obs(squash・直接のコミット・壊れた応答) | `notObserved` は `[3, 50, 60]`。#3 は壊れた応答(正しい)。**#50 は Issue の番号を件名に持つ直接のコミット、#60 は gh で読めた PR(マージコミットが範囲に無い)**。`Revert "… (#2)"` と `(#1)` を持つ直接のコミットは、番号が範囲の PR と重なるので出ない。**件名に番号の無い squash で gh が壊れた #8 は出ない** |
| 探針 allfail(gh が全て失敗) | `total` 0、`notObserved` `[1, 2]`。0 件の表だけにはならない |
| 個人を特定する値 | 3 場面とも `assurance.sizeObservation` と外へ渡す開示に login・作成者なし。`notObserved` は番号だけ |
| 期待値の更新 3 つ | 足した場面と合う(#5・#6 で `total` 4→6、#7 は読めず入らない。`points` に #6。`noDenominator` は #5 の 1)。緩めではない |
| 自分の破壊 4点 | M1・M2 は落ちた。**M4・M7 は通った**(R2-04・R2-05) |

破壊の中身: M1「保留」を通過と同じに扱う(assurance-period が 1 件落ちた)/ M2 `notObserved` を常に `[]`(approval-pace が 1 件落ちた。純関数の試験は通る)/ M4 `isProseDocument` の直下の条件 `!f.includes('/')` を外す / M7 `seenPrNumbers` から `recordPrs` を外す。

## 1. 所見

### R2-01【高】「PR の記録を読めず」の行に、gh で読めた PR と、PR でない番号が出る

- 所在: template `scripts/gate/aggregate-evidence.mjs` L2387〜2388(`[...candidateNumbers].filter((n) => !seenPrNumbers.has(n))`)、`size-observation.mjs` L211、標準 `human-ai-boundary.md` の IMPL-0159 の note「読めなかった PR は番号で開示する」
- 事実(実行): 探針 obs で、品質レポートと**外へ渡す開示**に「PR の記録を読めず、観測に入らなかったもの 3 件(#3, #50, #60)」と出た。#60 は gh が記録を返している(同じレポートの欠落の文は「件名は PR #60 を指すが、PR #60 のマージコミットと一致しない」)。#50 は PR でない
- 何が食い違うか: 式は「件名に番号を持つが `prs`・`recordPrs` に入らなかった番号」で、「読めなかった」ではない。前の出荷で入った PR を取り消すコミット(`Revert "feat: x (#12)"`。集約の L1148 の注記が挙げる既定の件名)は、#12 が読めていても毎回ここへ出る。件名に Issue の番号を書く流儀の採用者では、件数が Issue の数だけ増える。向きは多く出す側だが、文は偽で、外へ渡す開示に載る。直しの担当が「1場面でしか見ていない」と申告した経路に当たる
- 直し方の案: 取得に失敗した番号だけに絞る。`notObserved: [...candidateNumbers].filter((n) => prFetchError.has(n) && !seenPrNumbers.has(n))`(`prFetchError` は L1383。#60 は外れる)。Issue の番号は gh の失敗と区別できないので、表示を「件名の番号で PR の記録を取得できず、観測に入らなかったもの N 件(#…。PR でない番号を件名に持つコミットを含みうる)」へ改める。通しの試験へ、読めたがマージコミットが一致しない番号が出ない場面を足す

### R2-02【中】読めなかった PR のうち、件名に番号の無いものは件数に出ない(偽の 0)

- 所在: 同上。`candidateNumbers` は件名の `(#N)`・`Merge pull request #N` だけから作る(L1156〜1159)
- 事実(実行): 件名を書き換えた squash(#8)で gh が壊れた応答を返すと、`notObserved` に出ず、行そのものが出ない場面もある。コミットは「PR を経ていないコミット」として別の節には出る
- 何が食い違うか: note「母数は gh で PR の記録を読めたものだけで、読めなかった PR は番号で開示する」は、番号を件名から拾えた場合に限って成り立つ
- 直し方の案: note を「読めなかった PR は、件名に番号を持つものに限り番号で開示する。件名に番号の無いものは、PR を経ていないコミットとして出る」へ改める。表示の末尾にも「件名に番号の無いコミットは、PR を経ていないコミットの節に出る」を足す

### R2-03【中】指示資産と PROCESS-PROFILE.md だけの変更が「散文の文書だけ」に数えられる

- 所在: template `check-pr.mjs` L361〜365、`size-observation.mjs` L208 の表示「強制層・構成は含まない」、標準 `gate-criteria.md` の IMPL-0136 の note
- 事実(実行): `CLAUDE.md` だけを変える PR(人の承認が 3 分後)が `docOnly: true` になり、「24 時間以内 4」に数えられた。`AGENTS.md`・`PROCESS-PROFILE.md`・`docs/sub/CLAUDE.md` も真(直に呼んだ)
- 事実(読み): `CLAUDE.md`・`AGENTS.md`・`**/CLAUDE.md` は `INSTRUCTION_ASSET_FILES`(L390)で、統制の設定と同じく AI維持管理者の承認の範囲に数える。`PROCESS-PROFILE.md` は `NON_PRODUCT` が構成として個別に挙げ、構成から生成される。標準の定義(L2001「文書の置き場…にある散文のファイル」と IMPL-0049 の note の「直下の *.md」)では算定から除く側で、定義とは合う。合わないのは表示の「構成は含まない」と、R1-01 が塞ごうとした「統制に当たる変更の短い承認が文書の観測に紛れる」経路の残り
- 直し方の案(どちらかを議長が決める): (a) `isProseDocument` の先頭で `matchAnyCI(INSTRUCTION_ASSET_FILES, f)` と `PROCESS-PROFILE.md` を偽にし、表示を「算定行数が 0(強制層・構成・指示資産・ロックファイルだけの変更を含む)」に改める。(b) 判定は変えず、表示と note を「文書の置き場と直下の *.md(指示資産 CLAUDE.md・AGENTS.md と PROCESS-PROFILE.md を含む)。強制層・構成のファイルは含まない」に改める。信頼性の軸では (a)

### R2-04【低】強制層の置き場の `*.md` が偽になることを、どの試験も固定していない

- 事実(実行): 破壊 M4 で approval-pace・check-pr が全て通過した。M4 の下では `.github/PULL_REQUEST_TEMPLATE.md`・`.claude/skills/**/SKILL.md`・`scripts/gate/README.md` が文書に数えられる
- 直し方の案: `test-check-pr.mjs` の偽の場面へ `!isProseDocument('.github/PULL_REQUEST_TEMPLATE.md') && !isProseDocument('.claude/skills/pit/SKILL.md')` を足す

### R2-05【低】記録だけの PR が「読めなかった」に出ないことを固定していない

- 事実(実行): 破壊 M7 で approval-pace が全て通過した。通しの試験に記録だけの PR が無い
- 直し方の案: 通しへ記録の置き場だけの PR を1件足し、`notObserved` に出ないことを確かめる

### R2-06【低】「散文」の語と、文書の置き場のデータ・画像・記録だけの PR

- 事実(実行): `docs/` の `.json` と `.svg` だけの PR が「散文の文書だけの変更」に数えられた。標準 L2035 が「文書の置き場の判定は、文書・データの拡張子の列挙による」と開示しており、算定の除外とは合う。記録だけの PR は `recordPrs` へ入り、文書の観測に出ない(既存の「記録だけの PR」の行には出る)
- 直し方の案: IMPL-0136 の note の「文書の置き場の散文と直下の *.md だけ」を「文書の置き場の文書・データの拡張子のファイルと直下の *.md だけ(記録だけの PR は数えない)」へ改める。表示の括弧も同じ語にする

### R2-07【低】表示の置き場と ADR-0137 の行の括弧

- 「観測に入らなかったもの」の行は「文書だけの変更」の見出しの下に出るが、「この節の母数」は比の節にも掛かる(読み)。「この2つの観測の母数」に改める
- ADR-0137 の IMPL-0268 の行の括弧は「AI 生成行の短期書き換え率の集計」だけを挙げる。IMPL-0268 の note の残りは「一発承認率・AI 生成行の短期書き換え率」。矛盾はしない(どちらも採用者が窓を備えると書く)。括弧を「一発承認率と AI 生成行の短期書き換え率の期間の集計」に揃える

## 2. 所見の無い観点

- 観点1 R1-01: 強制層・構成・ロックファイルだけの変更は `docOnly` に入らず `noDenominator` に出る。文書と強制層の混在も `noDenominator`(表示は「含む」)。`isProseDocument` は `isExcludedFromSize` の部分集合で、標準の文とコードの注記に合う。`specs/`・`templates/`・`context/decisions/` は標準が文書の置き場と定める側。残りは R2-03・R2-04・R2-06
- 観点3: 足した場面は違反で落ちる(M1・M2)。期待値の更新は足した場面の数と合う。通った破壊は R2-04・R2-05
- 観点4: EV-0271 の追記は指示どおり。IMPL-0100 の表示「最後の人の承認」と note は合う。ADR-0137 の IMPL-0268 の行は `gate-criteria.md` の note と矛盾しない(R2-07 の括弧だけ)。母数の併記は R2-01・R2-02
- 観点5 個人を特定する値: 見た。所見なし
- 観点6 `lint:impl`: 通る。所見なし
- 観点7: ADR の差分は 0137 の2行だけ。3.11.7 の規範の文と IMPL-0136 の規定の文は差分に無い(変わったのは note と EV-0271)。ADR-0137 の承認者・承認日は未記入のままで、AI の名義は無い。所見なし

## 3. 確かめていないこと

- 回帰の全量、`npm run check` の全体、textlint、`lint:scope`・`lint:refs`
- 実機の GitHub(gh の失敗の形、`is_bot`・login の形)。rebase の取り込みと、写し(記録用ブランチ)で対応づく PR が母数にどう入るか(「gh で読めた PR だけが母数」が写しの経路でも真か)
- `process.config.json` だけを変える PR の通し(直の呼び出しで偽を確かめただけ)
- 品質レポートの観測の2節に login が無いこと(既存の試験に任せた。探針は evidence.json と外へ渡す開示だけを見た)
- 直しの担当の破壊 5点の再現。破壊の戻しは、退避した写しの書き戻しと `git checkout`(写しの中。1回は hook が止めたので書き戻しへ替えた)で行い、`git status` で戻ったことを見た
