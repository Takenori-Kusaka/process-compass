# 突合 1巡目の所見の修正(#341 #336)

- 高 R1-1: assurance-case.md H.10 の 912・913 行を EV-0257 に合わせた。「発行元が案内している」を「案内があるが確かめていない」へ改め、5.1.1・7.3 の番号と題を消した。2026 年版の番号と題は H.10 のどこにも書かない
- 中 R1-2: SRC-0491 に c4(附属書 A〜E、附属書E の題)・c5(序論の同じプロセスの目的と成果)・c6(目次の 4.2.1 と 5.6.2〜5.6.5)を足した。summary に目次を足し、検証の日付と注記を 2026-11-12 に改めた。引用は pdftotext で原文に一致を確かめた
- 低 R1-3: 追認。直さない
- 低 R1-4: gate-criteria.md 874 行の括弧書きから SARIF を外し、SARIF は理由を自由文の justification で持つ旨を理由の側に書いた
- 低 R1-5: overview.md 67 行の SRC の欄に SRC-0737 を足した
- 検査: lint:citations・test:citations・lint:sources・lint:refs・lint:evidence・textlint 通過。EV の文は変えていない
