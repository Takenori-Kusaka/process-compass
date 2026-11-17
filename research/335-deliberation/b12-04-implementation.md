# #335 実装の記録(束 B12。2026-11-17)

指示書: `b12-03-ruling-proposal.md`。

## template(コミット 2a32611、bundle template-b12-335-01)
- A: CLAUDE.md の(c)の例の列を「データの削除」、強制層の行の括弧を併記の2場合へ。claude-md-resident.json の CR-014 の核を手で同じにした(id 不変)
- B: README に取り込みの案内を足した。番号は末尾の次の「### 13」(末尾が既に ### 12 のため。指示書の想定は ### 12)
- C: handoff.md。例の「データの削除」、配備の統制の行の追加、L53 の判断の基準、参照 3 か所(3.5.5・3.5.5 の状態の遷移・3.5.3)。行番号は指示書より 2 ずれていたが、文言で一意に突合した
- D: generate-profile.mjs(注釈2・生成文1)、test-roster-rules.mjs(3か所)。`4.5.1` を scripts で grep: 残りなし
- E: 変えない

## 本流
- IMPL-0984 を delivered / check=presence にし、note を書き換えた。`impl:write` で台帳を再生成
- 参照(submodule)を 2a32611 へ進めた
- `template:kb` は source.commit だけを書き換えたため、stash(b12-335-kb)へ退避しコミットしない

## 試験
- check-process-rules、test-claude-md-resident(通過)、test-roster-rules(186件一致)
- lint:impl、lint:refs: 通過(終了コード0)
- `impl:issues -- --issue 335`: 「#335 を issue= に持つマークは 0 件です。閉じてよい」
- `npm run check` の全量は流していない(議長が push 前に1回)

## 指示書と違えた点
README の節番号が 13(上記)。それ以外なし。
