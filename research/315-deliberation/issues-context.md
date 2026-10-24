# Issue の文脈(#315)

- #315「既存のリポジトリへ準拠テンプレートを持ち込む手順の全体」(起票 2026-10-12、#302〜#310 の審議の積み残し。labels: task, phase-5, template)
  - 見つかったこと: `template-repository.md`「既存のリポジトリへ持ち込む」は事実 6 件・定め 3 件だけ(EV-0107)。実 GitHub での通しの検証なし(ルールセット・必須チェック・併合した履歴)/ python・go で未試行 / 初期化が既存のコードと coverage の欠落を告げない / 目印の無い既存の CLAUDE.md で止まらない / 証跡の集約が併合した履歴をテンプレート由来と識別しない / CODEOWNERS と .gitignore の行を確かめない / 旧い版で生成した構成は契約検査が落ちる場合がある(A-3 の帰結)
  - 決めること: 実 GitHub での検証の計画 / 手順の全体を標準に置くかテンプレートの文書に置くか / 旧い版の構成の移行
  - 出どころ: research/302-310-deliberation/decision.md「先送りにしたもの」、survey-306.md、implementation-B.md 5.1 の 6〜8
- 関連: #313 で版(第N版)・適用の開始(configured: true の最初のコミット)・changeLog の edition を定めた(ADR-0083)。#314 で常駐の規則の照合(CLAUDE.md の目印)と逆向きの追跡を定めた(ADR-0084)。#311 自律度(ADR-0081)。#293 配布(dist/standard、ADR-0077)
