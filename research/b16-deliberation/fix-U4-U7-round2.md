# U4〜U7 突合2巡目の直し

| 所見 | 直し |
| --- | --- |
| N-1(中) | `template/templates/04-gate-record.md` の G-7 への F.7 記録の添付の段落を、G-6 に限る監査対応書式の節の外へ出し、新しい節「安全関連部の検証の記録の添付(適用: G-7。D-0 表10 の F.2 の回答が「はい」の案件、または安全重要度が CL2・CL3 の案件)」に置いた。CL0・CL1 を理由に基準7 を外さない読みになる |
| N-2(低) | 様式 09 の節の1文目を「G-7 の判定記録(テンプレ4。基準7)に添付します」へ揃えた |
| 登録 | `src/data/template-fields.yaml` の extra(kind: structure)へ新見出しを登録した。必須欄の増減は無い |
| M-4 の残り | N-1・N-2 で解消 |

検査: test:fields・lint:impl・lint:scope は通過。template の test-cl-judgment は 98 件一致。test-spec-recheck は長いため未確認(04・09 の文言を読むかは grep で該当に出たのみ)。
