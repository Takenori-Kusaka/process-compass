# 束 B26 後半 実装(担当A)U1・U2 の記録

- 差分の範囲: template は `31e783a..afa73bc`(b26。2コミット)、本体は `32a40205..<最後のコミット。本記録を含む>`(U1 は b3ea4ced、U2 は続く1件、本記録は最後の1件)
- 計画: `intake-2.md` §1.1・1.2・1.3・1.7・§2.1。push はしていない。
- 試験の結果: template の test-loosening-decider(通過)・test-safety-record(95件)・test-next-records(142件)・test-records(95件)・test-adoption(123件)。本体の lint:impl・lint:refs・test:fields・test:criteria(test-gate-criteria-yaml 9件)・impl:issues・textlint(触った md)は通過。npm run check の全量は流していない(指示どおり)。

## U1

### (a) gateCodeOf(IMPL-0954 の集約の側)
- `template/scripts/init/generate-profile.mjs` の `gateCodeOf`: G・SG に当たらないとき、ゲート欄の値(NFKC・前後の空白と `*`・`_` の強調を除く)を code とする。空なら null。
- 試験 `template/scripts/gate/test-loosening-decider.mjs`(決定で閉じた決定待ちの区間を持つ `we` の作業場の中):
  - ng: 決定待ちの間の「価値責任者の調整」の記録だけ → 欠落。
  - ok: 決定の後に同じゲート欄(`**価値責任者の調整**`)の記録 → 解ける。
  - ng: 決定の後の記録が別のゲート欄(価値責任者の判断)→ 解けない。
  - ok/ng(固定): G-4 は G-4 の記録で解け、G-5 では解けない。
  - 入口: 同じ内容を docs/gates の判定記録ファイルにして `verify-gate-contract.mjs`(契約検査)を通す ng/ok を足した(関数だけでなく入口でも確かめるため)。
- 既存の固定(590 行付近 IMPL-0482 の移行の固定)は保たれた(全件通過)。
- 壊して落ちる確認: `gateCodeOf` の戻りを `?? null` に戻す(旧い挙動)と、関数の ok と入口の ok の2件が落ちた。戻した。

### (b) D-0 節5
- `template/templates/00-d0-governance.md` の段落を §1.7 の文へ直した。profiles に複製は無かった(grep で template 内に1か所だけ)。

### (c) 本体
- `lifecycle.md` の IMPL-0954 を `state=delivered check=machine test=template/scripts/gate/test-next-records.mjs` へ。note の「降りていない部分」を、集約が調整の記録を未知のゲートとして欠落に数える処理を持たないこと(2026-11-20 に現物で確認)、決定待ちの記録は決定の後の同じゲート欄の記録で解く(test-loosening-decider.mjs を note で名指す)、調整の種別と当否は確かめない、に置き換えた。`plan=`・`issue=`・`review=` は外した。確かめる者は「価値責任者と出荷判定者」とした(自由記述。裁定に指定が無かった)。`npm run impl:write` 済み。
- コミット: template `796d15c`(bundle `template-b26b-01.bundle`)、本体 `b3ea4ced`。

## U2

### (a) IMPL-0761
- `template/scripts/gate/check-safety-record.mjs`: `safetyRecordApplies` に引数 `required`(既定 false)。`checkSafetyRecord` が `config.gates.g7.params.safetyVerificationRecord === 'required'` を渡す。適用の条件の和。適用外にするのは従来の条件に加え「required でない」ときだけ。
- 試験 `test-safety-record.mjs`: ng(値 required・Q1 いいえ・CL1・記録なし → 欠落)、純関数、ok(値なし・値 none → 適用外のまま、required で記入済み → 欠落なし)。実装の前に試験だけ入れて落ちることも確かめた。
- 壊して落ちる確認: `checkSafetyRecord` の呼び出しの `required` を `false` に固定する(結線を壊す)と ng・ok の2件が落ちた。戻した。

### (b) IMPL-0771 の template の側
- `template/scripts/gate/verify-gate-contract.mjs`: 構成の gates の各キーが知識ベースの gates のキーに在ることを検査し、無ければ問題に積む。
- 写像は新しく定義せず、`generate-profile.mjs` の既存の `GATE_BY_KEY` のキーを返す `knownGateKeys()` を1つ export して使った(裁定は「既存の写像を使う」。モジュール外から読むために export が必要だった。generate-profile.mjs は U1 の行に在るファイルで、U2 の行には無いが、読む手段がほかに無いため触った)。
- 試験 `test-adoption.mjs`: ng(`g-extra`・`g9`)、ok(知識ベースのゲートだけ)。
- 壊して落ちる確認: 検査の条件を `false &&` で無効にすると ng の2件が落ちた。戻した。

### (c) IMPL-0771 の本体の側
- `scripts/check-gate-criteria.mjs`: 配布する知識ベースの gates の id が `GATE_IDS` の値に無ければ、判定基準が空ならそれぞれ問題にする。
- 試験 `scripts/test-gate-criteria-yaml.mjs`(`npm run check` の `test:criteria` に入っていることを package.json で確かめた): 実物の知識ベースの写しを `--kb` で渡して起動する(入口を通す)。ok=実物は通る、ng=`g-extra` を足すと落ちる、ng=判定基準を空にすると落ちる。写しは ROOT の中の `tmp/`(git の対象外)に置く(検査が入力の所在を ROOT からの相対で確かめるため)。
- 壊して落ちる確認: GATE_IDS の検査の行・判定基準の空の検査の行を各1回無効にし、どちらも落ちた。戻した。
- `npm run template:kb`: 知識ベースの生成元(`src/data/tailoring/`)と KB のデータは変えていないため不要と判断した。

### (d) 本体のマーク
- IMPL-0761(`tailoring-guide.md`): `target=evidence-aggregation state=delivered check=machine test=template/scripts/gate/test-safety-record.mjs`。note に和の条件・「記録の在否と欄の空だけ。検証の中身は出荷判定者」・7.3 で受けない(ADR-0153 決定2)を書いた。
- IMPL-0771: `state=delivered check=machine test=template/scripts/gate/test-adoption.mjs`。note に本体の側の検査(check-gate-criteria.mjs と test-gate-criteria-yaml.mjs)を名指した。
- IMPL-1007 の note の末尾の「IMPL-0761 が追う」を、構成の値が required のときも適用として数える旨に改めた。
- **裁定に無いが直した点**: 次の2つの note に、いま事実と違う記述があったため文を最小限で直した。IMPL-0653(`roles-responsibilities.md`)の「IMPL-0771 は経路が無いため降りていないと表示し」と、IMPL-0933(`safety-verification.md`)の「G-7 が照らさないことは IMPL-0761 が追う」。
- コミット: template `afa73bc`(bundle `template-b26b-02.bundle`)、本体 U2 は U1 の次の1件。

## 裁定と違えた点
- 実質なし。上の `knownGateKeys` の export、IMPL-0653・0933 の note の直し、KB の写しを `tmp/` に置く試験の作りは、裁定の範囲を広げたのではなく実装の都合として記録する。
- 触らなかったもの: aggregate-evidence.mjs・config.mjs・check-pr.mjs・gate-g5.yml。新しい試験のファイルは作っていない。
- 残り: 入口を通す試験の足りない点は無い。U1 の IMPL-0954 の `test=` は /pit の側の試験(test-next-records.mjs)のままで、集約の側の試験(test-loosening-decider.mjs)は note で名指した(裁定どおり)。
