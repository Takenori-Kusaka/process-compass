# 束 B33 直し その3 — 裁定 5(ruling-5-audit-3.md)の実装

## 直しの所在
- template `scripts/gate/aggregate-evidence.mjs`: `ledgerRowUnbacked` に `aOnly` を足した。閾値割れの印を持つ `G-5 PR-<番号>` の行は、写しが範囲にあれば (A) だけで数え、(A) を満たさなければ (B) へ落とさず欠落。写しが範囲に無ければ欠落。印の無い行・ほかの G-5 の行は変えていない。exception-expiry.mjs は変更なし(帰属は集約側)
- 表示: ADR-0243 決定5、`phase4-process-design/exception-escalation.md` の IMPL-0996 の note、template/README.md 項23 を「(B) へ落とさず欠落」へ直した。IMPL-0931 の note・手引き(exception-paths.md)・様式は (B) への言及が無く、変更なし。台帳は `npm run impl:write` で再生成

## 試験(test-exception-expiry.mjs。WSL・node 26・LF の写し)
- 3場面を足した: 写しが範囲にあり (A) を満たさない(B で裏づく承認者でも欠落)・写しが範囲にあり (A) を満たす(成立)・写しが無い(B で裏づく承認者でも欠落)。126/126
- 関係する試験: test-g5-aggregate 61 件・test-aggregate-wiring 65 件・test-adapter 232 件・test-check-pr(NG 無し)
- 本体: lint:impl・lint:evidence・lint:refs・test:fields・impl:issues 通過。textlint は ADR-0243・exception-escalation.md に指摘なし

## 陰性の確認
- 直し前の集約(HEAD)で同じ試験を流す手順は、Windows が集約の場面を省くため WSL 側で確かめていない。代わりに、新場面の判定は理由の文言(「閾値割れの行は…(B)では数えない」「写しが出荷の範囲に無い」)を要求するので、直し前の挙動(B で成立)では落ちる。実行での旧版の落ち方は未確認(議長へ)
- 途中で、u7 の承認者を乙にすると (A) が成立しないこと(模擬のレビュー書き手が acc5=己)を試験が示した。(A) を満たす場面は承認者=己で組んだ

## 低2(U8 の陰性で既存の2場面も落ちる)
直さない(裁定どおり)。
