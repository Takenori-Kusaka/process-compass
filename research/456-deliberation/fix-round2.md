# #456 独立の突合 2巡目の直し(2026-11-27)

議長の裁定: すべて所見の直し方のとおり。

- R2-1: ADR-0266 コンテキストから MITRE ATLAS の1文を削った。fix-round1 F3 の記述も実態に合わせた
- R2-2・ed1: ADR-0266「出典」を、OWASP の2件と NIST AI 600-1 に分け、「構成原理に持たない」へ揃えた
- R2-3: `check-failure-projection.mjs` の仮番号検査を、IMPL を含む語のうち `IMPL-NNNN` でないものを違反にする形へ締めた。`IMPL_RE` に `(?!\d)`、審議中の日付は実在を確かめる。試験に別の形5種と実在しない日付の対を足した
- R2-4: ファイルの選別を `markSources` に切り出し、規約と台帳が除かれることを直接確かめる試験へ替えた
- 台帳の再生成(evidence:write・impl:write)は不要(マーク・EV を触っていない)。assurance-case.md は触っていない
