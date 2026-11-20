---
title: b28 回帰の落ち(2回目)の直しの独立の突合
---

## 範囲と方法

- 対象: template `e15221a..2290e55`(generate-profile.mjs・test-init-g5.mjs・process-init の SKILL.md・README 項21)、本体 `5ae253fa..658ef54f`(matrix-sweep.mjs・IMPL-0930 の note・台帳・template の参照)
- 直しの担当の記録(fix-regress-2.md)は、所見を書き終えてから読んだ
- 実行は LF の複製(`git -C template -c core.autocrlf=false archive 2290e55`)を scratchpad に展開して行った。node_modules のリンクは張っていない。`npm run check`・WSL の重い試験・`graphify update` は流していない
- 件数: 高 1・中 1・低 4

## 所見

### H-1(高): 閾値を変える種別 settings が「構成の変更なし」と出て、変化点の記録も no-change になる

- 所在: `template/scripts/init/generate-profile.mjs` の構成の差分(2409 行の「個別の値(種別 settings)」の節。`coverageThreshold`・`coverageScope`・`failOnSeverity`・`allowedLicenses` を比べるが、`mutationThreshold` を比べない)
- 根拠: CL3(3名)で初期化した作業の場所で実行した
  - `settings: { ci: { mutationThreshold: 60 } }` → exit 0。出力は「## 構成の差分 / - 構成の変更なし」。変化点の記録は `result: "no-change"`・`direction: "none"`・`diff: []`
  - 続けて `mutationThreshold: 5`(60 から下げる)→ exit 0。同じく「構成の変更なし」、「統制を緩める向きの変更」は「なし」、記録は `no-change`・`decidedBy: null`。構成の値は 5 になった
  - 対照: `coverageThreshold: 10`(90 から下げる)→ exit 1。差分に「カバレッジの下限: 90% → 10%」、緩める向きの節に出て、記名を求めて止まる
- 何が食い違うか: 構成の値が変わったのに、生成器の差分と、封をする変化点の記録(changeLog)が「変更なし」と出る。表示と実態の食い違いである。G-1 で定めた値をいつ入れたか・下げたかを、変化点の記録から辿れない。CL3 の契約検査が通るかどうかを決める値なので、適合の主張に響く
- 直しの向き: 差分の節に `mutationThreshold` の行(`なし → 60`、`60 → 5`)を足す。これは決定可能な値の比較なので、機械の検査で閉じられる。向きの扱い(下げるのを緩める向きとして記名を求めるか)は M-1 の裁定に従う。試験は test-init-g5 の「閾値の経路」に「差分に閾値の行が出て、記録が no-change でない」を足す
- 直しの担当の記録との関係: fix-regress-2.md の「議長へ返す点 1」は記名が無いことだけを挙げる。差分と記録が「変更なし」になることは書いていない

### M-1(中): settings.md の「下げるのは緩める向き」と、生成器の扱いが合わない

- 所在: `template/.claude/skills/process-change/kinds/settings.md` の表の `ci.mutationThreshold` の行(この差分の前からある行)。test-init-g5 の「0 は有効な値として残る」の検査
- 根拠
  - 表の同じ列の `ci.coverageThreshold`・`ci.failOnSeverity`・`ci.allowedLicenses` は、生成器が緩める向きとして検出して記名を求める(上の対照の実行)。`ci.mutationThreshold` は検出しない(H-1 の実行)
  - process-change の SKILL.md の手順5 は「緩める向きは、記名と理由を受け取るまで適用しない」と書く。機械はこれを閾値について止めない。守られるかはエージェントの手順に頼る
  - check-pr.mjs(1873 行)は `ci` の差分を「閾値・除外設定」として数えて、製品のコードとの同時変更を落とす。閾値だけの PR には注意「緩める向きの変更は /process-change と記名を要する」を出すだけで、向きと記名は見ない
  - test-init-g5 は 60 から 0 へ下げる settings を、記名なしで ok とする形で固めている
- 判断: 表の行は「機械が検出する」とは書いていないので、表示と実態の食い違いとまでは言えない。ただし同じ列の他の行は機械が止めるので、読み手は同じ扱いを期待する。手作業の統制だと開示していない点を中とした
- 直しの向き(新しい義務を課さない文の案): 表の向きの欄を次のように書き換える
  > **下げるのは緩める向き**(機能変更と同じ PR に入れない)。生成器はこの欄の向きを判定せず、記名を求めない(カバレッジの下限と違い、機械の外)。下げる決定は、閾値を定めたときと同じく G-1 の判定記録に記名と日付で残す。`pr-rules`(check-pr.mjs)が確かめるのは、閾値だけの PR かどうかまでで、向きと記名は見ない
  - 「G-1 の判定記録に記名と日付を残す」は、同じ行が既に求めている。新しい義務ではない
  - 別の案として、生成器が `coverageThreshold` と同じく下げる向きを `push(..., M)` で緩める向きに数える形もある。settings.md と SKILL.md が既に「緩める向き」と言っているので、規定を機械へ降ろすだけとも読める。ただし記名を機械で強いる形になるので、議長の裁定に委ねる。採るなら、test-init-g5 の「0 は有効な値として残る」の検査に記名を足す要がある

### L-1(低): 初期化の出力に閾値の未設定の警告が無い

- 根拠: CL3 の初期化の出力(生成器と next.mjs の次の一手)に「mutation」「変異」「閾値」の語は1つも無い。PROCESS-PROFILE.md にも出ない
- 見立て: 手引きで足りる。理由は2つある。process-init の SKILL.md 手順6 の項7 がエージェントに伝えさせる。契約検査の文が、未設定と入れ方(`/process-change` 種別 settings)を名指しする。欠けとは見ない
- ただし手引きの文は「初期化の直後」だけを書く。次の2つの場合も、同じく契約検査が落ちる(`mutation-stage.mjs` の `caseConditionOf` は D-0 の CL の判定と Q1 を読む)。どちらも出力に警告は出ない
  - 後から CL3 になる場合(D-0 の CL の判定、または種別の変化点)
  - 附属書F の Q1 を「はい」と D-0 に記録した場合
- また、Q1 の記録は D-0 にあるので、「附属書F の適用の案件も同じ(初期化の直後に落ちる)」は正確でない。直しの向き: 項7 の末尾を「附属書F の適用(D-0 で Q1 を「はい」と記録した案件)と、後から CL3 になった案件も、閾値を入れるまで落ちる」とする

### L-2(低): 「閾値を入れると契約検査が閾値の問題で落ちない」の検査が、出力に文が無いことしか見ない

- 所在: test-init-g5.mjs の追加の検査(`!/ci\.mutationThreshold/.test(r.out)`)
- 根拠: 契約検査が文を出さずに落ちても(例: 異常終了)、この検査は通る。手元で同じ状態(CL3・閾値 60.5)の契約検査を流すと exit 0 だったので、今の実装は正しい
- 直しの向き: `r.ok` も見る。D-0 が無いことなど別の理由で落ちる設計なら、落ちた理由が閾値以外であることを明示的に照らす

### L-3(低): 一度入れた閾値を外す(未設定へ戻す)経路が無い

- 根拠: `null` を拒否する(試験と実行で確かめた)。`coverageThreshold` の `"derived"`、`reworkBaseline` の `null` に当たる経路が無い
- 見立て: 厳しい側に倒れているので、安全には響かない。CL3 では外すと契約検査が落ちるので、外す意味も無い。R1 だけの構成では、外したい採用者の経路が無い。採らないなら、README 項21 か settings.md に「外す経路は置かない」と書いて、「書かれていない」と「置かないと決めた」を区別する
- fix-regress-2.md の「議長へ返す点 1」は「下げる・外す変更に記名を要しない」と書くが、外す変更はそもそも受け付けない

### L-4(低): PROCESS-PROFILE.md に閾値が出ない

- 根拠: カバレッジの下限は表に出る(229 行)が、段 mutation の閾値は値があっても出ない。この差分の前からある状態
- 直しの向き: 必須ではない。H-1 の差分の行が入れば、変化点の記録からは辿れる。表に足すかは任意である

## 陰性の確認(test-init-g5。LF の複製で、直した版は 200 件すべて通過)

| 外したもの | 結果 |
| --- | --- |
| (a) 保存の行(buildConfig の `mutationThreshold` の展開) | exit 1。NG 5 件(60 が残る・契約検査・別の settings・再生成・0) |
| (b) 範囲の検証(`if (false)` に置換) | exit 1。NG 4 件(文字列・101・-1・null) |
| (c) 再生成での保持(5812 行の `mutationThreshold: ciNow.mutationThreshold` を削除) | exit 1。NG 5 件。ただしこの行は保存の経路も兼ねるので、再生成だけを外した確認にはならない |
| (c2) 変化点を経ない再生成だけで落とす(`change ? ciNow.mutationThreshold : undefined`) | exit 1。NG 1 件(構成からの再生成) |
| (c3) 別の値の settings と再生成で落とす(`S.ci?.mutationThreshold`) | exit 1。NG 2 件(別の settings・再生成) |

足した試験は、常に通る形ではない。どれも生成器の経路(`--answers`・`--change`)だけを通しており、構成の JSON を直接書き換えていない。

## 確かめて問題の無かった点

- 検証が `mutation-stage.mjs` の `thresholdOf` と一致する(number・有限・0〜100。小数可)。実行の結果: 60.5 は受け付けた。`1e999`(JSON.parse で Infinity)・`true`・`"abc"`・`[]` は exit 1 で、構成の値を変えなかった。NaN は JSON では書けない。`coverageThreshold` の検証と同じ位置・同じ形で、isFinite を足した分だけ厳しい
- 値が無いときは書かない。CL3 の初期化の直後の構成に、`mutationThreshold` のキーが無い(試験と実行)。CL3 でない構成は `opts.mutationThreshold` が undefined のままで、出力は変わらない
- 他の種別の変化点でも保たれる。`ciNow = { ...kept.ci, ...S.ci }` で、S は種別 settings のときだけ値を持つ。sweep の「3名を割る」経路で、CL3 は閾値を入れた後に種別の変化点を当て、契約○で通っている(直しの担当の sweep-1 の結果)
- sweep の前提の変更は CL3 だけに効く(`mutationFor` は cl3 以外で `{ ok: true }` を返す)。期待値のファイルは差分に無い。値の 60 は、契約検査が見る存在と型にだけ効く。sweep は段 mutation を走らせないので、比較の合否には効かない。場面の観測の文にも閾値の値は出ない。場面の合否に `mut.ok` は入っていない。ただし CL3 で閾値が入らなければ契約×で落ちるので、見逃しにはならない
- IMPL-0930 の note と台帳の行が、実装(検証・保存・再生成・既定値なし)と合う
- README 項21 の文(0〜100 の数値、無いときは書かない、再生成でも保たれる、初期化の直後の CL3 は落ちる)は、実行の結果と合う。SKILL.md の項7 は L-1 の限定を除いて合う。契約検査は gate-g5.yml(84・92 行)で CI に結線されているので、「CI の check が落ちる」の書き方も合う

## 作業物

- リポジトリで変えたのはこのファイルだけ。git の状態は変えていない。scratchpad の複製(lf・neg-*・ws)は残してある。background の処理は無い
