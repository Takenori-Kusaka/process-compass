# #428 の降ろし(IMPL-0415)の作業記録

層1・D-0 の決定の記名・前倒しで要る SG の判定記録の帰属を、効力を持つ前に記名者本人のアカウントの操作で確かめる(第4章「判定記録を基底ブランチへ入れる操作」、ADR-0106 決定5)。2026-11-05 時点の作業。

## 進め方

- 照合は既存の introducedBacking(記録の今の中身を入れた変更の作成者・承認者。記名者が作成者なら記名者以外の人の承認。PR を経ないコミットは署名の検証と author。1名の体制は自己申告。名義の共有は名義を共有していない人の承認)に寄せる。新しい照合の規則を作らない
- 共通の部品を template/scripts/gate/material-attribution.mjs に足し、check-pr(PR の時点)と aggregate-evidence(出荷の集約)が同じ関数を使う

## 実装した範囲

### 部品(material-attribution.mjs)

- `policyAttribution` / `withPolicyAttribution` / `policyUnattributedText`: 層1 を最後に変えたコミットの PR を introducedBacking で、層1 の記名者(冒頭の「記名」の欄。readPolicy の signer)に照合する。項目4 の各行の受容者は層1 の記名者の記名で一体として扱い、行ごとの帰属を求めない
- `decisionNeedsAttribution` / `rosterChangeOf`: 決定者の記名(decidedBy)の帰属を要する変化点。SIGNED_DIRECTIONS(loosen・appoint)と、名簿の変更(rosterEdits・accountConfirmations・nameConfirmations・diff の「人の名簿:」)。decidedBy の無い記録は対象外(緩める向きの記名の欠落は既存の configIntegrityProblems が出す)
- `signatureIndexOf`: 保持していた宣言を規則の承認で有効にした変化点(reason の末尾「(… の決定を、規則の承認により有効にした)」)は、宣言した時点の変化点(決定者と理由が同じ、より前の記録)で確かめる
- `commitOfChangeLogEntry`: changeLog[i] を今と同じ中身で持つ最も古いコミット(記録を足したコミット)
- `sgRecordPath`: sgRecord を docs/gates/ からの所在へ直す(絶対の所在も読む)。外を指せば null
- `pullInfoOf`: 検査する PR 自身を introducedBacking の info へ(先頭に対する承認だけ)。`ghHosting.pullCommitAuthors` / `fixedHosting(commits, pulls)` で PR のコミットの作成者を引く
- introducedBacking の修正: 組織上の任命権者(appointer)は承認者に数えないが、記名者本人が任命権者の場合(層1 の記名者・任命権者の記名による任免)は本人の承認として数える。従来は任命権者の承認を一律に落としていた

### 権限者の照合(org-assurance.mjs の checkAuthority)

- `policy.attribution.backed === false` の層1 は、項目4 を使わず fallbackSeat の席(渡されなければ事業決裁者)の責任者と照合し、注記を出す
- fallbackSeat を渡さない照合(D-0 節15 の組織継続の受容。continuityState)は、層1 が無い場合は照合しない(従来)。帰属を確かめられない層1 で同じく照合しない形にすると、層1 を置くだけで照合が外れ、層1 が有効なまま受容の記名を誰でも書ける。事業決裁者の席へ戻した(呼び手の指示「層1 が無い場合と同じ扱い」からの逸脱。下の「決めきれない点」)
- 委任の登録の錠(項目4「AI の利用の拡大」が「認めない」)は、厳しくする向きのため、帰属を確かめられない層1 でも外さない(delegationLock は authority から作る値で、checkAuthority を通らない)

### PR の時点の検査(check-pr.mjs)

- stopFindings: 基底ブランチの層1 に policyAttribution を掛ける。確かめられない層1 は事業決裁者の席で照合し、出力(stop.message)に「帰属を確かめられない層1(理由)」を出す。裏づけた層1 は「層1 の帰属: …」を出す。`stop.policyAttribution` に結果
- decisionRecordFindings(新設。検査 6b): PR が changeLog に足した記録(マージ基点の構成より後の添字)のうち、決定者の記名を要するものと sgRecord を持つものを照合し、失敗させる。失敗の文に「承認の後に gate-g5 の最後の実行を再実行する」
  - D-0: 記録が PR の中なら PR 自身(pullInfoOf)、保持していた宣言で宣言が基底にあれば、宣言を入れたコミットの PR(hosting)
  - SG: 記録を PR の中で変えた(差分にある、または既定ブランチに無い)なら PR 自身、基底にあれば記録を最後に変えたコミットの PR。判定者は様式の「判定者」(records.mjs の judgeOfForm)
  - 名簿は既定ブランチの構成(PR の中で足した人を記名者・確認者に数えない)。既定ブランチの名簿が空(初回の任免)なら PR の先頭の構成
  - PR のコミットの作成者は --pr の commitAuthors か、ホスティング(gh api pulls/<n>/commits)。読めなければ、記名者が作成者の経路は裏づけない(introducedBacking の既存の扱い)
  - `result.decisionRecords` に照合の一覧

### 出荷の集約(aggregate-evidence.mjs)

- 層1: readPolicy の直後に policyAttribution(HEAD の履歴と materialHosting)。確かめられない層1 は continuityState・停止の解除・品質保証の対象外の受容の照合で事業決裁者へ戻る。品質レポートの「照らした層1 の版」の行と claim.policy.attribution に出す。自己申告は保証の開示の項目1 の自己申告の記録へ
- D-0・SG: 範囲の中の変化点(既存の inPeriod)について、記録を入れたコミット(commitOfChangeLogEntry)・SG の判定記録を最後に変えたコミット(lastCommitOfFile)の PR を照合し、裏づけの無いものを記載の欠落に出す。名簿は記録を入れる前の構成(コミットの親)、空なら記録を入れたコミットの構成、どちらも読めなければ今の構成。`assurance.generation.decisionAttribution` に一覧

## 試験

- 新設: template/scripts/gate/test-material-records-more.mjs(41 件)。`IMPL-0415:ng` / `IMPL-0415:ok` の目印を、層1(単体・PR の時点)、D-0(PR の時点・集約の通し)、SG(PR の時点)に置いた。gate-g5.yml の contract の試験の並び(test-material-attribution の後)に足した
- 集約の通しの裏づけのある場面(ok)は、模擬の gh を Windows で置けないため、テンプレートの試験では「厳しくする向きは照合しない」を ok に置いた。PR で裏づいた D-0 の記名と層1 は、回帰の試験 t288 に場面を2つ足して確かめる
- 回帰の試験の材料の修正(scripts/regress/suite/t288.mjs と expected/scenes/t288.txt): 層1 の記名者「社長 一郎」は名簿に無く、層1 を入れた PR に記名者の操作が無かった。名簿へ組織上の任命権者(external・appointer、acct-boss)として足し、層1 を変える PR(prCommit)の記録に記名者の承認を足した。停止の場面のホスティングの代役の承認者にも acct-boss を足した。試験の意図は変えていない

### 結果

- 手元: gate-g5.yml の試験の並び(test-g5-aggregate・test-results を除く)はすべて通過。`npm run test:template-suite` は test-g5-aggregate だけが落ちる(手元で必ず落ちるもの。WSL では 23 件通過)。`npm run lint:impl` は通過
- WSL の回帰: 変更前の基準はすべて通過。変更の直後は t288(10 場面)と trial(2 場面)が落ちた。材料の修正と checkAuthority の修正の後、全 22 本が通過(最終の実行 2026-11-05。t288 は場面 87、うち新しい場面 2)

## 既存の採用者への影響(出力の変化)

- 停止の解除(PR の時点・集約): 層1 を入れた PR に層1 の記名者本人の操作(作成者+他の人の承認、または承認)が無い層1 では、項目4 の受容者でなく事業決裁者の席の責任者が権限者になる。項目4 で事業決裁者以外を権限者にしていた採用者は、層1 を記名者本人が承認する PR で入れ直すまで、その権限者の解除が成立しない。出力に「帰属を確かめられない層1」が出る
- 層1 の記名者が名簿に無い採用者(トップマネジメントを名簿へ入れていない)は、常に帰属を確かめられない層1 になる。記名者を名簿へ(任命権者として)入れ、アカウントの数値の識別子を書く必要がある
- D-0 節15 の組織継続の受容: 帰属を確かめられない層1 では、受容した者を事業決裁者の席の責任者と照合する。それ以外の記名の受容は無効(受容として数えない)になる
- PR の時点(gate-g5 の pr-rules): process-change で緩める向き・任免・名簿の変更を記録した PR は、決定者がその PR の作成者か承認者でなければ失敗する。決定者が作成者なら他の人の承認が要る(1名の体制は自己申告で通る)。承認は後から付くため、承認の後に gate-g5 を再実行する。手元の実行(PR のレビューを渡さない)では、該当の PR は「読めない」で失敗する
- PR の時点: 事業ステージを前へ戻す PR は、sgRecord の SG の判定記録の判定者が、記録を入れた PR(同じ PR ならこの PR)の作成者か承認者でなければ失敗する
- 出荷の集約: 範囲の中の緩める向き・任免・名簿の変更の変化点で、記録を入れた PR に決定者の操作が無いもの、PR を経ずに署名の無いコミットで入ったもの(1名の体制を除く)、ホスティングを読めないもの(GITHUB_REPOSITORY・gh の無い手元の実行)は、記載の欠落になる(保証の主張の成立条件6 が不成立になる)。手元で gh なしに集約を流す採用者は、緩める向きの変化点がある範囲で欠落が出る
- 名前の一致だけで効力を持たせていた従来の挙動から変わる点は以上

## 規定と食い違う点・決めきれない点

1. 保証の主張の成立条件1(層1 がトップマネジメントの記名で有効): 当初は変えなかったが、呼び手の判断(2026-11-05)により、帰属を確かめられない層1 では成立条件1 を不成立にした。理由に「層1 の帰属を確かめられない(名前の一致だけでは数えない): <理由>」を出す。確認者を置けない体制で自己申告として受け付けた層1 は成立に数え、条件の表の判定欄に自己申告の旨を出す。試験は test-material-records-more.mjs の集約の通し(不成立の場面)と、回帰の t288(裏づけた層1 で成立する場面)。2〜4 は呼び手の判断で現状のまま
2. fallbackSeat の無い照合(D-0 節15 の受容): 「層1 が無い場合と同じ扱い」にすると照合しないことになり、帰属を確かめられない層1 を置くことで照合が外れる。事業決裁者の席へ戻した。指示からの逸脱
3. 名簿の変更(表5)の範囲: rosterEdits・accountConfirmations・nameConfirmations・diff の「人の名簿:」を数えた。名簿への追加・削除に decidedBy が無い記録は照合しない(記名が要るかは generate-profile 側の規則による)
4. 任免(appoint)を「緩める向き」と同列に数えた(決定者の記名を要する向き。SIGNED_DIRECTIONS)。規定の「D-0 の決定の記名」に任免を含むと読んだ
5. 保持していた宣言を有効にした変化点は、宣言した時点の変化点で確かめる。理由の文の一致で宣言を探すため、理由を書き換えた入力では見つからず失敗する
6. 名簿の読み方: PR の時点は既定ブランチの構成、集約は記録を入れる前の構成。初回の任免(前の名簿が空)だけ、記録を入れた構成の名簿を使う。初回の任免の PR では、PR の中で足した人が記名者・確認者になりうる(前の名簿が無いため)
7. 層1 の帰属の照合を next.mjs・autonomy.mjs・org-assurance.mjs の単体の実行・adoption-trial.mjs には降ろしていない(ホスティングを引かない手元の道具。判定・照合の効力は PR の時点と集約にある)。手元の道具は層1 の項目4 をそのまま読む
8. 非 squash のマージ(マージコミット)では、git log -- <file> が枝のコミットを返し、ホスティングの記録(merge_commit_sha)と対応しないため裏づかない。既存の台帳の行・解除の記録と同じ限界
9. 実装マーク IMPL-0415 の state は標準の側(src/content/docs/phase4-process-design/gate-criteria.md)にあり、変えていない。delivered にするなら check=machine test=template/scripts/gate/test-material-records-more.mjs と、上の限界(1・5〜8)の注記が要る

## 突合の後の訂正(crosscheck.md、2026-11-05)

| 所見 | 扱い | 内容 |
| --- | --- | --- |
| H-1(高) | 直した | signatureIndexOf を、理由の文でなく記録の内容で照合する形へ改めた。intentApplied があり全件の決定者が記録の決定者と同じ、理由が「<宣言の理由>(<宣言の日> の決定を、規則の承認により有効にした)」と一致、記録を入れる前の構成の席が同じ宣言(seats[].intent の decidedBy・reason・at)を保持、より前の記録に決定者・理由・日付が一致する記録がある、のすべてを満たすときだけ宣言の記録を借りる。満たさなければ有効化の記録そのもの(PR の時点はこの PR、集約は記録を入れたコミットの PR)を照合する。規則の拡大(pendingChange)と規則だけの有効化は intentApplied を持たないため、有効化の記録を照合する。上の「決めきれない点」5 はこれで置き換わる |
| H-2(高) | 直した | idMigrationRoster を足した。変化点が rosterEdits(field: accounts)で書き換えた行のうち、ログイン名の集合が同じで既にある識別子を変えないものだけ、記録を入れる前の名簿の行を変化点が書く {login, id} へ置き換えて照合する。ホスティングの記録(login・id)が書く値と一致したときだけ対応づく。PR の時点(既定ブランチの名簿と PR の先頭の名簿)と集約(コミットの親と、そのコミットの構成)の両方。試験は1名(自己申告で通る/識別子が違えば通さない)と2名(決定者の承認で通る/承認者の識別子が違えば通さない) |
| H-3(高〜中) | 直した | 委任の規則の承認の記名(ruleApprovedBy)を、記録を入れる PR(集約は記録を入れたコミットの PR)で照合する。PR の時点は失敗、集約は欠落。試験は PR の時点の ng/ok |
| M-1(中) | 直した(降ろした) | D-0 節15 の組織継続の受容の記名の帰属を、continuityState の acceptanceBacking(呼び出し側が渡す)で照合する。出荷の集約は、期限内の受容の行を今の形で入れたコミット(git log -S <行>)の PR の作成者・承認者に、受容した者のアカウントがあるかを確かめ、無ければ受容を無効(受容として数えない)にする。節15 は生成区間の外(人が書く欄)で、/process-change の生成区間の再生成は節15 の行を変えないため、正当な運用は通る(回帰の t288 の期限内の受容の場面で確かめた)。期限を過ぎた受容は効力を持たない(欠落のまま)ため照合しない。next・org-assurance の単体の実行・check-d0・autonomy は名前で照合するまま |
| M-2(中) | 直した | SG.md(判定記録の書き方・構成へ反映する・機械の検査)、templates/04-gate-record.md の冒頭、recording.md の後退経路の前置きを改め、前倒しで要る SG の判定記録は記録用ブランチの経路でなく、判定者本人が作成者または承認者となる PR で入れる形にした |
| M-3(中) | 直した | /artifact 11 の手順書(作成の手順7)に、記名者を名簿へ置く(任命権者・{login, id})、層1 を変える PR を記名者本人が作成か承認する、既存の層1 の入れ直し、帰属を確かめられない層1 の扱い、アカウントを持たない記名者の扱いを書いた。recording.md「効力を持つ記録の届け方」に節「層1・D-0 の決定の記名・前倒しで要る SG」(表)を足した。next.mjs(/pit)は、記名者が名簿に無い・数値の識別子つきのアカウントを持たないとき、この手順を次の一手として注記に出す(手元ではホスティングを引かないため、層1 を入れた PR の照合は G-5 と集約) |
| M-4(中) | 直した | test-material-records-more.mjs に、模擬の gh(PATH の先頭。Windows では省き、CI の Linux で走る)による集約の通しを足した。D-0 の記録と SG が裏づいて欠落にならない ok、判定者の操作の無い SG の ng、1名の体制の層1 の自己申告(成立条件1 に帰属の理由が出ず、自己申告の旨が出る)の ok。IMPL-0415:ok の目印を置いた。56 件(WSL)。Windows では 51 件 |
| L-1(低) | 限界として残す | org-assurance.mjs の単体の実行は、層1 の帰属を照合せず、成立条件1 を層1 の有効性だけで出す(集約と食い違う)。手元の道具でホスティングを引かないため |
| L-2(低) | 限界として残す | gh を使えない手元の集約(GITHUB_REPOSITORY も gh も無い)では、層1 を入れたコミットが範囲の外にあると層1 は常に帰属を確かめられないとされ、成立条件1 が不成立になる。D-0・SG・節15 の受容も同じく裏づかない |
| L-3(低) | 限界として残す | PR の時点の検査6b は changeLog の追記だけを見る。既存の記録の書き換え・切り詰めは契約検査の連鎖の照合(config.mjs)が止めることを前提にする |
| L-4(低) | 直した | t288 に足した2場面の fixes に ADR-0106 決定3・決定5 を足した(check-fixes.mjs で実在を確かめた) |
| L-5(低) | 直さない | 呼び手が実装マークを分ける |

- 識別子の移行の照合は、identifyAccount が識別子の一致を優先するため、ホスティングのログイン名が書く値と違い識別子が一致する場合(改名)も対応づく。改名を経た移行は稀として残す
- 2名以上の移行で、決定者の行を書き換えない(決定者が識別子を持たないまま他の人の行だけに識別子を足す)変化点は、決定者を同定できず通らない。決定者の行にも識別子を足す
- src/content/docs/community/implementation-ledger.md を npm run impl:write で再生成した(自動生成の台帳。テンプレートのスキルの文に足した平叙の否定 8 行で、範囲の外の件数が 384 → 392)
- template/scripts/vendor/tailoring-kb.json の source.commit が書き換わっている(試験の実行が知識ベースを作り直したもの。本件の変更ではない)

### 結果(訂正の後)

- gate-g5.yml の試験(test-g5-aggregate・test-results を除く): 全件通過
- npm run test:template-suite: test-g5-aggregate だけが落ちる(手元の既知の失敗。WSL では 23 件通過)
- npm run lint:impl: 台帳の再生成の後に通過
- WSL の回帰(run.mjs --kb keep、22 本): すべて通過
