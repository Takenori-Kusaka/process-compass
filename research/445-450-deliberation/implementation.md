# #445〜#450 (d) の実装(段1)

- 日付: 2026-11-17。仕様は `decision.md` 4.2 節・7 節の段1。9 節の議長の修正を優先した

## 変えたファイル

- 新設 `src/content/docs/adr/0175-assign-445-450-undelivered-to-adopter-or-template.md`(ADR-0175。EV-0315 を付与)
- マーク書き換え 18 件(plan=adopter・decision=ADR-0175・issue=/review= 削除・note 置換。target・state・check は不変)
  - `phase4-process-design/roles-responsibilities.md` 12 件(0568 0665 0707 0712 0713 0715 0716 0718 0826 0827 0832 0833)
  - `exception-escalation.md` 0619、`deliverable-templates.md` 0878、`proposal-template.md` 0960 0961 0962、`assurance-case.md` 0964
- 再生成: `community/implementation-ledger.md`、`community/evidence-ledger.md`
- IMPL-0978 は 9 節の修正により issue=447 のまま(変更なし)。(a)〜(c) の行のマークも変更なし

## 検査

- lint:impl 通過(markAttrProblems・no-adopter に当たる件なし)、lint:evidence・lint:refs・lint:provisions・lint:scope・lint:tone・test:plan-issues 通過、ADR-0175 の textlint 違反 0
- `npm run impl:issues -- --issue 447`: 残りは (d) 以外のマーク(例 IMPL-0708)。0 件にならないのは想定どおり
- 全量の `npm run check` は流していない(指示)

## 未実装・理由

- Issue へのコメント(decision.md 7 節の手順 5)は本担当の範囲外。#447 には「0978 は重の審議へ送る」を書く(9 節)
- `decision=ADR-0175` の先の実在は機械で確かめられない(4.1)。独立の突合で人が確かめる
- decision.md の note 内の `ADR-0170` は `ADR-0175` へ読み替え。note の二重引用符は全角の閉じ引用符へ置換(マークの構文を壊さないため)。IMPL-0712 の note に ADR-0175 が残るのは決定.md のとおり
- ADR-0175 の表の「規定と採用者に委ねる理由」は note の本文から「確かめる者」以降を分けて写した。括弧内の ADR 参照は読みやすさのため一部削った
- EV 番号は 0314 を採った(最大 0313 の次)。別の担当が同時に EV を足していれば衝突の恐れがある
