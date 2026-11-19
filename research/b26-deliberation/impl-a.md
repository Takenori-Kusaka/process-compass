# 束 B26 — 実装の記録 担当A(2026-11-19)

裁定: `ruling-1.md` §2.3・2.4、`intake-1.md` §3.1・3.2・3.5・3.6。

## B26-1 IMPL-0614

- 変更: `src/content/docs/phase4-process-design/exception-escalation.md` の IMPL-0614 のマークを `state=delivered check=machine test=template/scripts/gate/test-next-records.mjs` へ。`plan=`・`review=` を外した。note の未確認の文を、確認の記録(2026-11-19、`check-0614.md`)に改めた。template は変えない
- 試験: `npm run lint:impl` 通過(IMPL-0614:ng/ok は test-next-records.mjs に実在)
- 本体のコミット: 86a0f69d

## B26-2 IMPL-0899・0979

- template: `.claude/skills/pit/reference/handoff.md` の節「エスカレーション」に2つの小節を足した。「期日に間に合わない見込みのとき」(ruling・intake §3.1: 見込みの時点で始める・順序・SC-B 先・SC-M に触れない・3つの例・確かめる者)と、「判定・決定の期限を過ぎたとき」(§3.6: PR を持たないゲートと会議体は機械が数えない・上程の Issue に日と期限・D-0 節6 へ記名・宛先の務めは指名)
- 本体: IMPL-0899(lifecycle.md)は `delivered check=manual`。IMPL-0979(exception-escalation.md)は `target=handoff-reference state=delivered check=manual`
- **裁定と違えた点(形)**: ruling §2.4 は「target に handoff.md を指す降ろし先を加える」とする。マークの `target` は1つしか書けず、同じ IMPL の識別子を2つ書くと検査が重複で落ちる(check-impl.mjs の識別子の重複)。そこで target を登録済みの `handoff-reference`(`src/data/impl-targets.yaml` に既存。新規登録は不要)へ替え、機械の側(review-queue-control・test-review-queue.mjs)は note に残した。台帳の降ろし先の欄は手引きの側だけを示す。両方を target に並べるには書式の拡張が要る(後段)
- 試験: template の test-context-refs・test-claude-md-resident 通過。本体の `lint:impl`・`lint:refs`・`test:fields` 通過
- template: 6015bdc(bundle `template-b26-01.bundle`)。本体: 43829b3c

## B26-4 IMPL-0145

- template: `scripts/gate/enforcement-inventory.mjs`(8・163・164・173 行の保持期間に触れる文)と `test-enforcement-inventory.mjs`(90・99 行)を改めた。注意を出す条件(最も古い実行が窓の始まりより後)は変えていない。試験は全通過
- 本体: SRC-0768 を登録(`research/sources/SRC-0768.yaml`。`lint:sources` 通過、`research-ledger.mjs index` でカタログと `research/282-survey-2026-09/` の生成物が更新された)。EV-0342(E2、見直し 2027-05)を roles-responsibilities.md の 3.11.4 の IMPL-0145 のマークの直後に置き、`evidence:write` を流した
- **裁定と違えた点(重要)**: GitHub の文書(SRC-0768、本文を curl と WebFetch で確認)は「実行の記録は残る」と書いていない。反対に「既定では、チェック・ワークフローの実行・コミットの状態と、成果物・ログは 90 日で自動削除される。2026-10-01 からは、この方針がチェック・ワークフローの実行・コミットの状態にも適用される(それまでは 400 日超保持)」と書く。2026-11-19 の観測(134〜142 日前の実行とジョブが読めた)は、この予告の時期か範囲と合わない(確かめていない)。ruling §2.3 自身が「文書か観測が、実行の記録も保持期間で消えると示したら undelivered へ戻す」と定めており、その条件に当たる。よって:
  - 注意の文は、ruling の文面(「実行とジョブの記録は残る」)ではなく、観測と文書の両方を書く形にした(「90 日はログと成果物の保持期間で、観測では古い記録も残っていたが、GitHub の文書は 2026-10-01 以降、実行の記録にも保持期間を適用すると書く。実行が無かったか、保持期間または手の削除かは区別できない」)
  - **マークは delivered へ上げず、undelivered・check=manual のまま置いた**。note に理由と上げる条件(2026-10-01 の後の文書か観測が、実行の記録が保持期間の後も読めると示す)を書いた。「delivered と書きながら文書は逆」の表示と実態の食い違いを避けるため
  - EV-0342 の差し替え条件に、この食い違いと、上げる条件・戻す条件を書いた
- 議長への判断依頼: (1) undelivered のまま置く扱いでよいか。(2) 上げるなら、2026-10-01 の後の実環境の観測(古い実行を読めるか。GitHub の changelog の確認を含む)が要る。changelog は読んでいない
- 試験: template の test-enforcement-inventory.mjs 全通過。本体の `lint:evidence`・`lint:impl`・`lint:sources`・`lint:refs`・`test:fields` 通過。textlint 通過
- template: 590aebc(bundle `template-b26-02.bundle`)。本体のコミットは下記

## 回帰の全量

`npm run check` は流していない(指示どおり)。
