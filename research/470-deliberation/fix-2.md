# #470 独立の突合 2 巡目の直し(2026-11-28)

template(枝 d5-470)のコミット 2ff1d0a。本体(枝 Takenori-Kusaka/d5)のコミット 488874e7。push していない。bundle は `E:/Github/process-compass/tmp/470/template-d5-470.bundle` へ退避済み。

## 所見ごとの結果

| 所見 | 結果 | 所在・試験 |
| --- | --- | --- |
| N-1 | 直した | `scripts/gate/aggregate-evidence.mjs` の `choiceReviewOf` と `scripts/gate/check-pr.mjs` の知らせの節。変更の一覧に `process.config.json`(名前の変更の元を含む)が 1 つでもあれば、その変更の全体に規則を当てない(`touchesConfig`)。試験を足した: `test-check-pr.mjs`「プロセス構成のファイルと規則のパスのファイルを同時に変える変更は、全体に規則を当てない」、`test-direct-commit-rules.mjs`「構成と規則のパスのファイルを同時に変えた変更は外した件数に数えない」「規則(**)の理由を構成とプロファイルで同時に直した変更は外した件数に数えない」 |
| N-2 | 直した(root コミットの 1 点を除く) | `choiceReviewOf` から HEAD の構成(`cl1Of(config)`・`regulated(config)`)を外し、変更の親の版の構成だけで当てる・当てないを決める。集約の開示(`noApply` と行の文)は変更ごとの数えへ変更: 行に「外した N 件 / 出荷の範囲の変更 T 件(うち R1 のため当てなかった r 件) / 変更の親の版が安全重要度 CL1 以上・規制業のため当てなかった M 件」を出す(M が 0 なら省く)。「当てていない」と全体を表示するのは、規則のある変更のすべてを当てなかったときだけ。書き換えた試験の場面: 前の直しで足した「変更の親の版が安全重要度 CL1 以上なら、HEAD が CL0 でも当てていない旨を出す」(外した 1・当てなかった 1・状態は「当てていない」でない)。足した場面: CL0 から CL1 へ上げた構成(上げる前が外した件数、上げた後が当てなかった件数) |
| N-3 | 開示して閉じた | 本体の IMPL-1081 の note と ADR の影響に 1 文 |
| N-4・N-5 | 直した | template `.claude/skills/implement/SKILL.md` の括弧(R1 の変更では案に推しを付けず理由は人が書く、方針を人が先に書く変更ではその後に案を出す)。`.claude/skills/task-breakdown/SKILL.md` の 1 文(R1 になるタスクの範囲を、区分の下限の規則が出すものと機能仕様で R1 とされた変更に当たるものへ広げた)。N-5 の scope-ledger の分類は裁定どおり開示で閉じた(触れていない) |
| N-7 | 直した | ADR-0276 のコンテキスト。「所有者の原文」の下は回答 2 の説明だけにし、引用(回答 2)だけが原文と明記。回答 1 と考え方は「指揮役の記録による回答 1(原文の引用は手元に無く、要約)」の節へ移した。確かめた原文: owner-answers-02(回答 2 の引用あり)。owner-answers-01 と issue-snapshot には回答 1 の原文の引用が無い |

### 直せなかった部分

- 親の版が無い最初のコミット(root)は、既存の `configBefore` が HEAD の構成を返すため、HEAD の安全重要度で読む。途中で CL を上げた構成では、root コミットが「当てなかった」に入る(試験で 2 件の内訳として固定し、本体の条文の note に「既存の扱いのまま」と書いた)。実運用の出荷の範囲に root コミットが入ることはまれ。undelivered の表示はしていない(限定を note と試験の注記で開示)

## 直した後のコードの挙動

- PR の検査: 基底の構成に規則があるとき、変更のどれかが `process.config.json` に触れていれば、規則を当てず、「当たる」の知らせを出さない(R1・CL1・規制業の「当てていない」の知らせは従来どおり)
- 集約: 変更ごとに、親の版の規則・親の版の安全重要度・規制業・区分で決める。構成に触れる変更は外した件数にも当てなかった件数にも入らない(CL1 の親の版なら当てなかった件数に入る)。範囲の変更の件数は変えない
- 開示(内側・外側): 行に当てなかった件数が加わる。外側の形は id と件数だけ(従来どおり)
- PR の検査の知らせの件数と集約の件数は、基底の構成を同じ線で読むので、同じ変更で食い違わない(PR の基底と取り込みの親の版が同じ場合)

## 試験と検査

- 判定を一時的に無効にした確認(WSL の写しの上のみ。すべて落ちた): 集約を旧の「構成のファイルだけ除く」へ戻す 2 件の NG / 集約が HEAD の構成も見る 1 件の NG / PR の検査を旧へ戻す 1 件の NG。復元済み
- node 26.13.1(WSL): test-direct-commit-rules 31 件一致 / test-check-pr 349 場面一致 / test-loosening-decider 通過 / test-claude-md-resident 通過 / check-process-rules 規則 123 件 / test-aggregate-wiring 65 件 / test-assurance-period 37 件 / test-tailoring-declaration 39 件 / test-init-g5 208 件 / test-roster-rules 237 件 / test-trial-checklist 28 件 / test-aggregate-drift 46 件 / test-aggregate-records 226 件
- 変えた .mjs 4 本は `node --check` 通過、NUL なし
- 本体: lint:refs・lint:evidence・lint:impl(終了 0。降りていない IMPL-1075・1077 は既存の adopter)・lint:scope・test:impl 56 件・test:fields 11 件・textlint(変えた 2 本)が通過。`impl:write`・`scope:write`・`evidence:write` を流した(台帳は impl だけ差分)
- 全量の回帰は流していない

## 本体の変更

- `human-ai-boundary.md` 5.5.1: 「触れる変更」の箇条を「1 つでも触れる変更は全体に当てない」へ。「多く見せない側に倒す」の文を「件数は、変更ごとに、その変更の基底の構成で数える」へ置換。IMPL-1081 の note に積み重ねた PR の開示 1 文と挙動の修正。IMPL-1082 の note を変更ごとの数えへ
- ADR-0276 の影響の同じ行も置換(議長の裁定にない追加)

## 議長へ

- 本体の submodule の参照(template)は進めていない(push の段)。template の 2ff1d0a は 5dba90b・ffc1b7d の上
- 回答 1 の原文が手元に無い点は、所有者へ原文の確認を求める余地がある
