# #428(IMPL-0415)の独立の突合

- 対象: 未コミットの変更(本体 `git diff`、`template/` の `git diff`、未追跡の `template/scripts/gate/test-material-records-more.mjs`)
- 照らした正本: 第4章「判定記録を基底ブランチへ入れる操作」(gate-criteria.md:116-138)、IMPL-0415 の note(gate-criteria.md:142)、ADR-0057・0106・0107・0108、附属書H 観点28(assurance-case.md:279)
- 入力の分離: `research/428-delivery/notes.md` は読んでいない。成果物とコードの実行の結果だけから判断した
- 実行したもの: Windows で template の `test-material-records-more` / `test-material-attribution` / `test-check-pr` / `test-performer-account` / `test-roster-ids`(すべて通過)。関数の直接の呼び出しによる探り(下記 H-1・H-2 の再現)。回帰の試験は Windows では走らない(gh の代役を呼べない)ため、WSL(Ubuntu 24.04、Node 22)へ LF で複製して走らせた(結果は末尾)

## 所見(重大度の高い順)

### H-1(高)保持していた宣言の「有効化」の記録は、理由の文の一致だけで過去の記録の裏づけを借りられる

- 所在: `template/scripts/gate/material-attribution.mjs:524-545`(`HELD_SUFFIX`・`signatureIndexOf`)、`template/scripts/gate/check-pr.mjs:659-668`、`template/scripts/gate/aggregate-evidence.mjs:3673-3680`
- 根拠: 新しく足した緩める向きの変化点の理由の末尾が「(…の決定を、規則の承認により有効にした)」で、決定者と残りの理由の文が過去の記録と一致すれば、帰属の照合は**過去の記録を入れた PR**で行われる。過去の記録の種別・向き・差分・委任の宣言(`intentApplied`)であったかは比べない。探り: `signatureIndexOf([{decidedBy:'鈴木 一郎',reason:'委任する',direction:'loosen'},{decidedBy:'鈴木 一郎',kind:'mode',direction:'loosen',reason:'委任する(2099-01-01 の決定を、規則の承認により有効にした)'}],1)` は 0 を返す。理由の文は PR の作成者が書ける(構成は `/process-change` が書くが、検査は文の形しか見ない)。決定者が過去に1回でも本人の操作で入れた記録があれば、以後その決定者の名で、任意の緩める向きの記録を、決定者の操作なしに PR の時点の検査(検査6b)と出荷の集約の両方で通せる。第4章の「名前の一致だけを裏づけに数えない」(gate-criteria.md:129)に対し、名前と文の一致だけで効力を持つ経路が残る
- note との関係: note は限界として「理由の文の一致で宣言の時点の記録を探す」と書くが、これが偽装に開いていることは書いていない

### H-2(高)#430 の数値の識別子を持たない名簿(既存の採用者)では、名簿の変更の帰属を誰も裏づけられず、識別子を足す移行の PR が検査6b で必ず落ちる

- 所在: `template/scripts/gate/check-pr.mjs:1591-1604`(rosterConfig に既定ブランチの名簿)、`template/scripts/gate/material-attribution.mjs:280-286`・`518-521`(名簿の変更を帰属の対象にする)、対比: `template/scripts/gate/test-roster-ids.mjs:180-187`(H-3 の決定)
- 根拠: 名簿の変更(`rosterEdits`・`accountConfirmations`)は決定者の帰属を要する(decisionNeedsAttribution)。照合に使う名簿は既定ブランチの名簿で、#430 の前の名簿はアカウントをログイン名だけで持つ。introducedBacking はログイン名だけの一致を数えない(ADR-0108)。探り: 名簿 `accounts:['yamada']` の1名の体制で、作成者 `{login:'yamada',id:1001}` の PR → `backed:false`(「名簿に数値の識別子が無い」)。2名の体制で決定者 `suzuki`(名簿はログイン名だけ)が承認しても `backed:false`。名簿の全員が識別子を持たない限り、識別子を足す変化点の決定者を裏づける者が名簿にいない。#430 の H-3 は「1名の体制では、決定者本人の記名で自分の行に識別子を足す変化点を受け付ける」と決めた(test-roster-ids.mjs:187)が、その変化点を入れる PR が検査6b で失敗する。出荷の集約も同じ理由で欠落に出す(aggregate-evidence.mjs:3676-3679、名簿は記録の前の構成から読む)。正当な運用(#430 が案内する移行)が通らない誤検出であり、1名の体制を含む既存の採用者に当たる。試験(test-material-records-more)の名簿はすべて識別子つきで、この場面を持たない

### H-3(高〜中)規則の承認(`ruleApprovedBy`)の記名は帰属を照合しない。保持していた宣言の有効化では、効力を生む記名が照合の外にある

- 所在: `template/scripts/gate/material-attribution.mjs:518-521`(照合の対象は `decidedBy` だけ)、`template/scripts/init/generate-profile.mjs:5130-5141`・`5420-5445`(規則の承認は名前で AI維持管理者の席の責任者と照らすだけ)
- 根拠: 委任の規則は AI維持管理者の `ruleApprovedBy` の記名で働き始める(generate-profile.mjs:1743・1853)。保持していた宣言の有効化の変化点では、緩める向きの効力を生むのはこの記名だが、実装は宣言した時点の `decidedBy` の帰属を借りて照合し(H-1)、`ruleApprovedBy` のアカウントを PR の作成者・承認者と照らさない。規則の承認は D-0 の決定の記名(緩める向き)に当たると読むのが自然で、名前の一致だけで委任を働かせる経路が残る。note はこの記名を対象にも限界にも書いていない

### M-1(中)D-0 の決定の記名を構成の changeLog に狭めたことが note・観点28 で開示されていない。D-0 の文書の中の記名(節15 の受容など)は名前の照合のまま効力を持つ

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:142`(note)、`src/content/docs/phase4-process-design/assurance-case.md:279`(観点28 の第4列)、`template/scripts/gate/org-assurance.mjs:913-928`(D-0 節15 の受容の照合)
- 根拠: ADR-0106 決定5 は「層1・D-0 は効力を持つ記録に数える」とし、D-0 を changeLog に限っていない。D-0 節15 の受容は、出荷の集約で単一障害点の記載の欠落を外す(aggregate-evidence.mjs:3236-3240)。実装は受容者の名前を層1 の項目4 の権限者と照らすだけで(帰属を確かめられない層1 なら事業決裁者と照らす)、節15 の行を入れた変更の作成者・承認者と照合しない。note は「D-0: 構成の changeLog の…」と書き、D-0 の文書の記名を外したことを「限界」に書いていない。観点28 は「D-0 の決定の記名…は…照合する(IMPL-0413・0414・0415)」と書き、監査が D-0 全体を機械が照合済みと読む

### M-2(中)SG の判定記録の通常の届け方(記録用ブランチ → 出荷の PR の複製)では、帰属が裏づかない。SG.md の案内と食い違う

- 所在: `template/scripts/gate/check-pr.mjs:676-692`、`template/scripts/gate/aggregate-evidence.mjs:3693-3695`、`template/.claude/skills/gate/gates/SG.md:26・34`、`template/templates/04-gate-record.md:3`
- 根拠: 照合は sgRecord の所在のファイルを最後に変えたコミットの PR の作成者・承認者を判定者と照らす。SG の様式は判定者が記録用ブランチ `records` へ直接 push し、出荷の PR が `docs/gates/` へ複製する(SG.md:26)。出荷の PR を開く者・承認する者(転記の確認)は判定者に限らないため、複製で入った SG の記録を指す変化点は検査6b で失敗し、集約で欠落になる。SG.md:34 は「出荷の PR の複製より前に戻す場合は、記録だけの PR で…先に入れる」とし、複製の後なら複製で足りると読める。規定(第4章)には合うが、テンプレートの案内が改められていない。判定者本人の `records` への push(本人の操作)は照合に使われない

### M-3(中)層1 の記名者が名簿にいない採用者は、成立条件1 が不成立に変わる。準拠テンプレートの案内に移行の手順が無い

- 所在: `template/scripts/gate/material-attribution.mjs:487-494`、`template/scripts/gate/aggregate-evidence.mjs:4019-4031`、`template/.claude/skills/artifact/artifacts/11-quality-assurance-policy.md`(変更なし)、`scripts/regress/suite/t288.mjs:20・165`
- 根拠: 層1 の記名者(トップマネジメント)が名簿に無い、または名簿にあってもアカウントが無い、または層1 を入れた PR に記名者の操作が無い場合、帰属を確かめられない層1 として成立条件1 を満たさず、範囲の全変更が不成立になる。既存の採用者は、記名者を名簿へ(多くは `external: true, appointer: true`)アカウントつきで足し、記名者本人が承認する PR で層1 を入れ直す必要がある。回帰の試験 t288 自身が、既存の場面を通すために記名者を名簿へ足し、層1 を変える PR に記名者の承認を足した(t288.mjs:20-21・164-165・223-225・479)。規定(ADR-0106 決定5)に合う帰結だが、テンプレートの文書(`/artifact 11`・`/gate`・recording.md「効力を持つ記録の届け方」は例外承認・停止の解除だけ)には、記名者を名簿へ置くこと、記名者本人の承認で入れること、GitHub のアカウントを持たないトップマネジメントの扱いが書かれていない。誤りとしてではなく、既存の採用者への影響として挙げる

### M-4(中)試験の ok 側が「裏づいた記録が通る」ことを集約で確かめていない

- 所在: `template/scripts/gate/test-material-records-more.mjs:313-320`
- 根拠: 集約の試験の `IMPL-0415:ok` の目印は「厳しくする向きの記録は照合しない」で、帰属を裏づけた D-0 の記録・層1 が集約で欠落にならず成立条件1 を満たす場面ではない。集約の SG の照合、集約での自己申告(確認者を置けない体制の層1 を成立に数え、その旨を出す。note が明言する挙動)の試験も無い。陽性の場面は回帰の試験 t288 の3名の場面だけにある。台帳の「機械が確かめる」は違反と適合の対を求めるが、適合側は照合の対象外の入力である

### L-1(低)組織保証の単体の実行は、成立条件1 に帰属を反映しない

- 所在: `template/scripts/gate/org-assurance.mjs:1491-1502`
- 根拠: 単体の実行は「読むのは出荷の集約と同じ関数」と書くが、成立条件1 を `policy.valid` だけで出す。帰属を確かめられない層1 でも「満たす」と出し、集約と食い違う。note の限界(next・autonomy・adoption-trial)にこの道具は挙がっていない

### L-2(低)手元の実行では、層1 の帰属が常に確かめられず、成立条件1 が不成立になる

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1636-1656`・`2526-2531`
- 根拠: 層1 を入れたコミットが出荷の範囲の外にあり、gh を使えない(`repo` が空)手元の集約では、`prOfCommit` が null を返し、層1 は帰属を確かめられないとされる。note の限界は「ホスティングを読めない集約では該当の変化点が欠落になる」とだけ書き、層1 の成立条件1 が不成立になることを書いていない(新しい試験 test-material-records-more.mjs:292-320 はこの状態をそのまま「帰属を確かめられない層1」の場面に使っている)

### L-3(低)PR の時点の検査は、changeLog の追記だけを見る

- 所在: `template/scripts/gate/check-pr.mjs:636`
- 根拠: `headLog.length <= baseLog.length` で照合を飛ばす。既存の記録の書き換え・切り詰めは、契約検査の連鎖の照合(config.mjs:2220-2237)が別に止めるため、単独では経路にならない。検査6b がその前提に依ることを書いていない

### L-4(低)回帰の試験の新しい場面が引く決定が、ADR-0106 でなく ADR-0057 である

- 所在: `scripts/regress/suite/t288.mjs:247`(節の fixes)・`255-259`
- 根拠: 足した2場面(層1 の帰属、D-0 の決定の記名の帰属)は ADR-0106 決定3・5 を固定する場面だが、節の宣言は `ADR-0057 決定8・9・10` のままである。既存の入力の書き換え(記名者を名簿へ足す、層1 を変える PR と停止の解除の場面のすべてのコミットへ `acct-boss` の承認を足す)は、期待の変更ではないため `changed` の記録は要らないが、既存の場面が新しい要求(層1 の帰属)を満たす入力へ変わったことは、場面の名前からは読めない。期待(expected/scenes/t288.txt)は2行の追加だけで、既存の場面の判定は変わっていない。既存の決定を黙って変えたものは見つからなかった

### L-5(低)実装マークの降ろし先が1つだけである

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md:142`
- 根拠: note は PR の時点の検査(検査6b・停止の解除の権限者)を含むが、`target=evidence-aggregation` だけを持つ。IMPL-0413/0414 は pr-checks と evidence-aggregation に分けている

## 確かめて、食い違いが無かったこと

- 停止の解除の権限者(PR の時点・集約)、D-0 節15 の受容の権限者、品質保証の対象外の出荷の受容者は、帰属を確かめられない層1 では項目4 を使わず事業決裁者と照らす(org-assurance.mjs:484-499、check-pr.mjs:566-571、aggregate-evidence.mjs:2559・3236・4104)。note のとおり
- 委任の登録の錠(項目4「認めない」)は、名前で読むまま外さない(generate-profile.mjs:5272)。厳しくする向きであり、note のとおり
- 任命権者の承認は、記名者本人が任命権者のときだけ本人の承認に数え、帰属の確認者には数えない(material-attribution.mjs:318-325)
- 名簿の変更の照合は、PR の時点では既定ブランチの名簿、集約では記録を入れる前の構成の名簿で行い、同じ変更で足した人を記名者・確認者に数えない。初回の任免(既定ブランチの名簿が空)だけ、PR の先頭の名簿を使う(作成者が書いた名簿で自己申告になり得るが、初期化の場面に限る)
- 承認は PR の先頭に対するものだけを数え(pullInfoOf)、レビューを読めない PR は失敗させる(閉じる向き)。CI の check-pr のジョブは `fetch-depth: 0` で、履歴を辿る照合に足りる
- 既存の記録の書き換えによる回避は、契約検査の連鎖(config.mjs:2220-2237)が止める

## CI(Linux)で落ちそうな点の確認

- WSL(Ubuntu 24.04、Node 22.23)へ、変更を LF で当てた複製を作って走らせた
- 回帰の試験 `node scripts/regress/run.mjs`: 22 本すべて通った(t288 は 87 場面、t288b は 82 場面、trial は 35 場面。落ちた 0)
- template の `scripts/gate/test-*.mjs`: `test-material-records-more` を含めて通った。落ちたのは `test-init-g5`(1名: テストが0件の段階で npm test が通る。`Could not find tests/**/*.test.*`)と `test-results`(引数を要する道具で、試験として呼んだことによる)。`test-init-g5` は変更を当てない版(template の HEAD)でも同じ1件が落ちるため、本件の変更によるものではない(WSL の環境に依ると見られる)
- Windows の作業ツリー(CRLF)の上では回帰の試験が走らない(gh の代役、引き継ぎ文書の置き換えの空振り)。CI には関係しない
- Linux に固有の失敗は見つからなかった
