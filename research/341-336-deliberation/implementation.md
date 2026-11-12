# 実装の記録(Issue #341・#336)

2026-11-12。decision.md に従う。

## 変えたファイル

- overview.md(1.3 の12207行・ISO 9001行の追補・78/80 行の注記・EV-0106)
- assurance-case.md(H.10 の12207行、2026 年版の確認の扱いと EV-0257)
- gate-criteria.md(G-5 の末尾に却下の語彙の文と EV-0258。版の無い ISO 9001 の 3 か所に :2015)
- roles-responsibilities.md 1067 行・tailoring-guide.md 507 行(:2015)
- standard-editions.md(手順1 の記録欄と、対応表を持つ文書の項)
- research-framework.md(12207:2017 の記録と注記)
- edition.yaml(次の版の citationReview へ引き継ぐ旨。history の行はまだ無いため、コメントで残した)
- evidence-ledger.md(再生成)、research/sources/ SRC-0731〜0737 と catalog.md(調査の担当の未コミット分。内容を確認して含めた)

## 適用範囲の逐語

SRC-0491 の請求項 c3(locator: 1 Scope)の quote と照合し、機械の検証(quotes: found)も済んでいる。78 行へ原文のまま引用した。

## template の dismissed_reason

`template/` に dismissed_reason・dismissed・suppressions・justification を読む箇所は無い(grep で 0 件)。実装マークは付けない。template は直していない。

## 判断を要した点

- decision.md B は edition.yaml の citationReview に1行を入れるとする。history に発行した版の行がまだ無く、行を足すと発行の記録を偽るため、コメントで引き継ぎを残した。次の版の発行時に citationReview へ書くこと。
- 版の無い ISO 9001 の引用は、roles 1067 行・tailoring 507 行・gate-criteria 274/751/756 行の計5 か所(survey の4件は 751 と 756 を同じ EV として数えている)。
- ADR は書き換えていない。
- 新しい EV: EV-0257(H.10 の ISO 9001 の版。E1。見直し 2027-04)、EV-0258(道具の却下が検査を外す変更に当たるか。E0。見直し 2027-04)。

## 検査

lint:citations・test:citations・lint:sources・lint:refs・lint:provisions・lint:evidence・test:edition・textlint(変えた md)は通過。全量の回帰・npm run check は流していない。
