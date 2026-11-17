# 束 B15 独立の突合 2巡目

作成 2026-11-18。担当: 独立の突合(実装を見ていない別の文脈)。直した差分だけを見た。所見を書くだけで、何も直していない。

- 対象: 本体 `git diff 8bd47fb8..HEAD`(b35f939e まで。research/ の記録を除く)、template `git -C template diff 4da885e..main`(13c829f・fe93667)
- 照らした記録: `review-round1.md`、`fix-round1.md`、`intake.md`、`impl-02.md`、`research/447-deliberation/owner-answer-21.md`
- 流した試験: template test-init-g5(164 件一致。終わりまで流した。EXIT 0)、test-roster-rules(198 件一致)、test-aggregate-records(135 件一致)。本体 test-kb-ancestry(5件)、lint:impl、lint:evidence、lint:refs、lint:scope、check-gate-criteria、check-template-drift(いずれも通過)。実行で確かめるため、使い捨てのスクリプト(スクラッチ)で buildConfig を呼んだ(R2-1・R2-3)
- 件数: **高 1、中 3、低 2**

## 高

### R2-1 F-1 は閉じていない: D-1 を出さない構成でも、判定者の表示と席の注記が「代償措置つきの逸脱」と言い続ける

- 所在: `template/scripts/init/generate-profile.mjs:600-605`(buildRoles の notes)、`:915-917`(`gates.g7.approver`)、`:561-562`(detectDeviations)。試験 `template/scripts/gate/test-roster-rules.mjs:139-140`(ok の側)
- 事実: 判定者の表示と価値責任者の席の注記は、`approverMode === 'value-owner-merged'` だけで決まる。席の割り当ては見ない。新しい D-1 の条件は席の割り当てを見る。両者は同じ席で決まっていない
- 実行で確かめたこと: 試験の ok の入力と同じ構成(size-1-2、value-owner=b、dev-verifier=a、independent-reviewer=x(外部)、qa-gatekeeper=b)で buildConfig を呼んだ。結果は `approverMode: value-owner-merged`、`gates.g7.approver` が「価値責任者(出荷判定者を兼務。代償措置つきの逸脱)」、`deviations` に g7 の行は無かった。qa-gatekeeper を a(開発者と同じ)にした構成、未割当にした構成でも同じだった。value-owner の注記は「G-7 を兼務する(代償措置つきの逸脱。判定記録と抜き取り確認を要する)」、qa-gatekeeper の注記は「この構成では分離できていない」のままである
- 意味: 1巡目 F-1 の(1)「判定者の表示は逸脱と言い、逸脱の一覧は空」が、ok の入力でそのまま残っている。fix-round1 の「判定者の表示と D-1 は同じ席で決まり、食い違わない」は事実と違う。試験の ok の対は、この食い違いを正解として固定している(表示は確かめていない)
- 求めること: 表示と注記を D-1 の条件と同じ判定(`shippingSeparatedFromDevLine(…, 'value-owner')`)で切り替えるか、別の席に分かれた構成でも逸脱と扱うかを、裁定で決める。後者なら D-1 の条件の改めを戻すことになる。どちらでも、ok の対に判定者の表示の確かめを足す
- 重大度の理由: 表示と実態の食い違いである。巡の数に関わらず直す類

## 中

### R2-2 試験の ng の対が、条件の各分岐を見分けなくなった

- 所在: `template/scripts/gate/test-roster-rules.mjs:129-135`
- 事実: ng の入力の共通部 `base2` は value-owner=a で、ng の5件はどれも dev-verifier=a である。判定する席を value-owner に改めたため、5件はどれも「価値責任者 = 開発者」の1つの理由で D-1 を出す。見出しの「独立レビュアの席を兼ねる2名」「出荷判定者の席が未割当」「名簿が空」の分岐は、もう試していない。「出荷判定者の席が未割当」は qa-gatekeeper の未割当で、判定に使わない席である
- 意味: `qa !== rev` の比較や、判定する席(value-owner)の未割当・名簿に無い名義の分岐を消しても、試験は落ちない。delivered・machine の表示を支える違反の対が、表示した条件の一部しか固定していない
- 求めること: ng に「価値責任者 = 独立レビュア(dev とは別)」「価値責任者の席が未割当(他は別人)」「価値責任者が名簿に無い名義」を足し、見出しの「出荷判定者」を判定する席の語に揃える

### R2-3 集約の G-7 の成立の表示が、判定に使わない qa-gatekeeper の席を見たままである

- 所在: `template/scripts/gate/aggregate-evidence.mjs:3711-3715`
- 事実: D-1 が無いときの G-7 の成立は、qa-gatekeeper の席の責任者で決める。直しの後は、value-owner が開発ラインと別の人なら D-1 を出さない。このとき qa-gatekeeper が未割当なら「成立を確認できない(出荷判定者の席の責任者が未記入)」、開発者と同じ人なら「成立しない(責任者が同一)」と出る。構成は逸脱を記録せず、契約検査(verify-gate-contract)も通る。構成の上の G-7 の判定者は価値責任者である(R2-1 の実行で、qa-gatekeeper=a・未割当のとき D-1 なしを確かめた)
- 意味: 構成・契約検査と集約の表示が、別の席で G-7 を語る。向きは「成立しない」側で、通過を偽らない。ただし、intake 順 2 の「呼び出し元と aggregate-evidence の D-1 の表示を合わせる」に照らすと、新しい食い違いである
- 求めること: value-owner-merged の構成で、集約の G-7 の成立に判定する席を使うかを、R2-1 の裁定とあわせて決める

### R2-4 F-4: 所有者の承認の一次の記録がリポジトリに無い

- 所在: `research/b15-template-items/fix-round1.md:37`、`src/content/docs/phase4-process-design/gate-criteria.md:863`(IMPL-0987 の note)
- 事実: 承認の出典は「所有者の回答 2026-11-18、triage §4 の 23・24」とあるが、リポジトリの中に該当の記録が無い。`research/447-deliberation/owner-answer-21.md` は triage §4 の 21・22 までで、23・24 は無い。これまでの所有者の回答は、ファイル(`owner-answer-21.md`、`research/355-deliberation/owner-answers-2026-11-17.md`)として残してきた
- AI の名義: 本体・template の差分に AI の名義は無い。IMPL-0987 の note は「AI の名義を書かず、所有者が記す」とする。この観点は合格
- 意味: 強制層の変更の承認が、AI が書いた二次の記述(fix-round1 と note)だけで支えられている。承認が実際に出たかを、リポジトリから確かめられない
- 求めること: push の前に、回答 23・24 の文を所有者の回答として research/ に残す(既存の owner-answer の形)

## 低

### R2-5 IMPL-1025 の計画の Issue が、原案を決めた #447 である

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md:163`(`plan=scheduled issue=447`)
- #447 は記録の置き場の欠け(#324 の残り)を扱い、登録の判定の記録の欄の欠けはその範囲に入る。ただし #447 を閉じるときに、IMPL-1025 が降りていなければ impl-plan-issues が落ちる(設計どおり)。IMPL-1024 も issue=447 である。#447 を B16 の後も開けておくか、別の計画の Issue へ移すかを、#447 を閉じる前に決める。F-3 の降ろしの表示は、この点を除き閉じた(棚卸しの行・台帳とも一致。lint:impl 通過)

### R2-6 知識ベースの source.commit は合格だが、HEAD の1つ前を指す

- `template/scripts/vendor/tailoring-kb.json` の source.commit は 8bd47fb8 で、本体の HEAD(b35f939e)の祖先である。`build-template-kb.mjs --print` の結果との差は source.commit だけで、中身は一致した。8bd47fb8 から HEAD までに `src/data/` で変わったのは impl-inventory.yaml だけで、知識ベースに入らない。check-gate-criteria と check-template-drift は通過した。rebase の後の再生成は 1巡目 F-11 のとおり

## 閉じたとした所見

- F-3: IMPL-1025(undelivered・manual)を置き、棚卸しに足し、台帳を再生成した。降りていない規定として lint:impl に出る(R2-5 を除く)
- F-4 の AI の名義: 無い(R2-4 は承認の一次の記録だけ)
- F-4 の順序の食い違い: fix-round1 に、§4 に従った理由とともに記録された
- F-5: EV-0325 と EV-0285 が互いを参照する。意味・見直しの月は変わっていない(lint:evidence 通過)
- F-8: 浅い clone の試験が通る(5件)
- F-1 の契約検査の側: verify-gate-contract と detectDeviations は同じ席(value-owner)を渡しており、両者の間の食い違いは無い(R2-1・R2-3 は表示と集約の側)
