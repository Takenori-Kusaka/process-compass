# Issue #440 実装の記録(軽の範囲。2026-11-15)

裁定は `decision.md`、文案は `draft.md`。本書は実装の段の記録である。

## 1. 変えたファイル

- 規定の文書: `phase4-process-design/` の overview・assurance-case・deliverable-templates・exception-escalation・gate-criteria・human-ai-boundary・lifecycle・roles-responsibilities・safety-verification・tailoring-guide
- 検査: `scripts/check-provisions.mjs`(検査12 の拡張・検査17・未決の登録の一致)、`scripts/lib/frame-checks.mjs`(新規。判定の本体)、`scripts/test-provisions.mjs`(試験の追加)
- 登録簿: `src/data/provision-forms.yaml`(`undecidedFrameSentences`・`declarationVerbs`)
- `src/content/docs/community/provision-forms.md`(検査12・17、機械が確かめないこと、登録簿のキー)
- `src/content/docs/adr/0131-frame-placement-rule-and-declaration-subject.md`(新規)
- 自動生成: `community/evidence-ledger.md`(EV-0261・EV-0262)。`scope:write`・`impl:write` は差分なし
- `src/data/impl-inventory.yaml`: 変更なし。`:602`・`:1795`・`:2291` の「設けない」は旧い文面の引用ではなく、分類も変えていない。`lint:impl` 合格

## 2. 直した文(25 件。義務を動かしていない)

| 区分 | 件 | 所在と直し |
| --- | --- | --- |
| 表明(M-1〜M-16) | 16 | draft 2.1 の文案どおり。対の文(M-6・M-7、M-9・M-10、M-11・M-12)は同時に直した。編集 `exception-escalation.md` の「新しいゲートを設けないのは」を「定めないのは」へ |
| 禁止(M-17〜M-20) | 4 | draft 2.2 の文案どおり(M-17 は「工程ゲートの判定に用いません」、M-19 は「足さない」、M-20 は「有効にしていかない」)。M-18 は「2値です」を「2値によります」へ |
| 枠の再掲(B-5・B-7) | 2 | 枠を残し、禁止の文末を外して説明と所在にした |
| 枠の決定済み(B-1・B-4) | 2 | B-1 は枠を外して本文の段落にし、因果の文を理由の形へ。B-4 は 2 文を一字も変えず、7.10.1 冒頭の段落(「…例外承認の特殊形として扱います。」)の末尾へ出し、元の位置に所在だけの `:::danger` を残した(R-5) |
| 編集 | 1 | 上の「設けないのは」の 1 件。件数は 24 + 1 |

- 実装の中で、B-4 を移したことによる `lint:scope` の新しい検出は出なかった。位置は draft どおり(段落の末尾)にした
- 義務が動くと判断して直さなかった文: なし
- M-5〜M-8 に掛かる第8章の「ゲート・経路を足す」定めの有無(draft 2.1 末尾)は、引用を足していない。本束では確かめていない(残り)

## 3. 触れなかった文

- 固有の 7 文(B-8・B-2 の枠の 2 文・B-3・B-6・M-21・M-22)の地位は変えていない。実物のそばに R-3 の 1 行だけを置いた
  - 枠 4 か所(附属書F 手法の分類、テンプレ「リスク低減の3ステップ」、「判定における対比」、2.10.4): 枠の直後の段落「前の枠の中の禁止は、枠の外へ出すかどうかを審議中です。決まるまで要求として読みます(第1章 1.7.2)。」
  - 文 2 か所(M-21・M-22): 同じ段落の、その文の直後に「前の文は、表明か禁止かを審議中です。決まるまで禁止として読みます(第1章 1.7.2)。」
- 1.7.2 のマークの表の所在は、実物で確かめて draft の「F.4」を「附属書F F.5『手法の分類』の枠」へ、「第2章」を 2.10.4、「第3章 3.10」を 3.10.11 へ直した
- 1.7.2 のメタの文の項の主語(「本章・本節・次の表・図」)は変えていない。表明の項だけを「本標準またはその部分(本章・本節・本附属書・本様式)」へ改めた。メタの項へ本附属書・本様式を足すかは、説明の類を広げる変更なので議長へ残す

## 4. 足した検査と試験

- 検査12 の拡張(K-1): 注意の枠(札に「暫定」を持たない `:::caution`・`:::danger`・`:::tip`・`:::warning`)の中の `RE_SHALL`。登録簿 `undecidedFrameSentences`(U-2)に載せた 4 件の句は通す。登録の句が枠の中に無い(消えた登録)、実物のそばに表示の文が無い、1.7.2 のマークの表に所在が無い、のいずれでも失敗する
- 検査17: 規定の文書の文末「設けません/設けない」で、同じ文に主語(本標準・本章・本節・本附属書・本様式 + は・では・も)が無い文。動詞は `declarationVerbs`(今は「設ける」)。自己試験(hit・miss)つき。M-21・M-22 は登録(kind: declaration)で通す
- 結果: 既存の本文に対する検出は 0(`npm run lint:provisions`: 違反なし)。直す前の検出は draft のとおり(22 件。実装の途中で確認)。`npm run test:provisions` 55/55。`lint:evidence`(250 件)・`lint:impl`・`lint:scope`・`lint:refs`・`lint:text`・`lint:tone`・`lint:dekimasu`・`test:impl` は合格
- textlint は、変えた頁と ADR-0131 で違反なし
- `npm run check` の全量は流していない(議長が push の前に 1 回流す)

## 5. 仮の番号(push の前に付け直す可能性がある)

| 種別 | 仮の番号 | 所在 |
| --- | --- | --- |
| ADR | ADR-0131 | `adr/0131-frame-placement-rule-and-declaration-subject.md`。登録簿 `declarationVerbs` の `by`、`provision-forms.md` の 2 行、EV の本文が参照 |
| EV | EV-0261 | overview 1.7.2 のマーク(注意の枠の読み方と未決の表) |
| EV | EV-0262 | overview 1.7.4 のマーク(検査12 の拡張・検査17 の前提) |

付け直すときは、ADR のファイル名・title・`sidebar.order`、`provision-forms.yaml` の `by: ADR-0131`、`provision-forms.md` の ADR-0131 の 2 か所を揃え、EV は overview の 2 マークの後に `npm run evidence:write` を実行する。

## 6. template の直列の順へ入れる分(本束では触れない)

`npm run template:kb` を実行した。複製の差分はコミット済みの `tailoring-kb.json` の `commit` 欄(複製元のコミット)だけで、内容は変わらない。template にはコミットも変更も残していない。

| # | template の所在 | 文 | 標準側 |
| --- | --- | --- | --- |
| T-1 | `templates/04-gate-record.md:183` | 期間の開示のための様式を、別に設けません | M-4。「本標準は、…別に定めません」へそろえる |
| T-2 | `templates/04-gate-record.md:242` | 評価のための様式を別に設けません | M-3。同上 |
| T-3 | `.claude/skills/artifact/artifacts/10-assumption-ledger.md:16` | 新しいゲートは設けない | M-6・M-7 |
| T-4 | `templates/04-gate-record.md:124` | 再判定のために新しいゲートを設けません。会議体も設けません | 標準の対応する文が未確認。由来を直列の作業で確かめる |

検査は落ちない(`template-fields.yaml` に該当の語なし。検査17 は template を探さない)。

## 7. 残り

- #440 は閉じない。重-1〜重-9 と V-3(定める・課すの振り分け)を #440 に残す。Issue への反映のコメントは議長が書く
- 独立の突合の観点: draft 8.2 の末尾の 5 点に加え、R-3 の 1 行が安全の禁止を弱く読ませないか、検査17 の主語の定義(本章・本節・本附属書・本様式)と 1.7.2 の表明の項の一致
- `graphify update .` は流していない
