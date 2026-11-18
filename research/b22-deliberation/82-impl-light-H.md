# 束 B22 — 附属書F F.4 の直し(#445。81-ruling-light-H.md の寅)

従ったもの: `81-ruling-light-H.md` §2。template/・`src/data/tailoring/` は触らず、`template:kb` も流していない。新しい EV・IMPL・SRC の番号は足していない。

## 直した箇所

- `safety-verification.md` F.4 の表のミューテーション試験の行: R2・R1 の欄を「[附属書H H.1](/process-compass/phase4-process-design/assurance-case/)による」にした。R3 の欄、安全関連部の列、F.4 の注は変えていない。表の直後に一文を足した: 「表のミューテーション試験の R2・R1 の欄は、変更ごとの実行を規定する附属書H H.1 の表(R1 は必須、R2 は週次で合否条件にしない)が正本なので、そちらを指します。」
- `safety-verification.md` F.6 の 7.3 を名指す文: 「裁定まで」の語は既に無く、「附属書H の R1 の変更ごとの変異試験には、7.3 の名指しを掛けていません。掛けるかは、準拠テンプレートへ降ろすときに #445 で決めます」を足した(textlint の文長のため括弧の外の別文)。
- `assurance-case.md` IMPL-1026 の note: 「F.4 と食い違う。未裁定」を「附属書F F.4 の R1・R2 の欄は附属書H H.1 を指す(2026-11-19 の裁定)。道具の無い言語の扱いは #445 に残る。」に替えた。`state=undelivered` を保つ。
- ADR-0224 決定13 を裁定に改め、「採らなかった案(決定13)」の節(経緯: 子を選び、前提の訂正で寅へ。子-a・子・丑ほか)を影響の節の前に足した。影響の IMPL-1026 の括弧の「未裁定」も改めた。
- `impl-inventory.yaml` の当該節の note: 「未裁定」を「F.4 の R1・R2 の欄は、この表を指す(2026-11-19 の裁定。#445)」に替えた。`marked` のまま。
- 台帳は `evidence:write`・`impl:write`・`scope:write` で再生成した。

## 検査

- lint:evidence・impl・scope・refs・provisions・tone・dekimasu・figures・citations・sources: 通過
- test:plan-issues・impl:issues: 通過
- textlint: 文長の違反1件を即直し、通過

## 置けなかった点

なし。附属書H へのリンクは、節の見出しの固定リンクを確かめず、ページ(assurance-case)までとした。
