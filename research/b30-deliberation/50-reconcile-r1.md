# 束 B32 — 単位 Z1〜Z5 の独立の突合(1巡目。全体)(2026-11-26)

対象: template `b5f406f..HEAD`(7コミット)、本体 `origin/main..HEAD -- src scripts`。裁定は `research/b27-deliberation/30-ruling-356.md`・`30-ruling-348-441-450.md`、`research/b29-deliberation/51-chair-x-r1.md`・`55-chair-y12-r1.md`、`41-chair-z2z3.md`・`41-chair-z4.md`。実装の担当の記録(40-*.md)は、所見を立てた後に `40-impl-z5.md` だけを照合のために読んだ。

## 集計

| 重大度 | 件数 |
| --- | --- |
| 高 | 1 |
| 中 | 2 |
| 低 | 4 |
| 編集 | 2 |

## 実行で確かめたこと

- 関係する試験を流した(template、node 26)。すべて通過: `test-check-pr`(299 場面)・`test-roster-conditions`(74)・`test-check-delegation`(83)・`test-loosening-decider`・`test-edition-end`(95)・`test-model-adoption`(53)・`test-next-records`(157)・`test-seeded-error-scan`。回帰の全量は流していない
- 集約のトレーラの読みの移行: template の origin/main(489 コミット)で、旧い読み(`%(trailers:key=Spec)`)と新しい読み(`specLinesOf`)の F-NNN の集合が変わるコミットは 0 件(失う側 0・得る側 0)。`Spec:` で始まる行を持つコミットは 128 件で、127 行が `Spec: setup`、F-NNN を含む行は 0。README 節18 の「この履歴はトレーラ `Spec: F-NNN` を使っていません」は実測と合う。ただし集約の「末尾の段落の外の `Spec:` 行」の件数は、この履歴では 40 件と出る(所見 低-1)
- `normalizeRestriction` を直接呼び、入口が書く記録から `cause` が落ちることを再現した(所見 高-1)
- Node の `execFileSync` の既定の maxBuffer(1 MiB)を超える出力で ENOBUFS が投げられることを確かめた(所見 中-2)

## 所見

### 高-1 入口が制限の記録に `cause` を書かない。新しい発動がすべて「cause の無い旧い発動」に数えられる

- 所在: `template/scripts/gate/config.mjs:1867-1873`(`normalizeRestriction`)。呼び出し元は `template/scripts/init/generate-profile.mjs:6784`
- 事実: `restrictionInputProblems` は `cause` を必須にして入口で確かめる。しかし changeLog へ書くときの `normalizeRestriction` は `{ id, person, paths, basis, recordedBy }` だけを返し、`cause` を捨てる。再現の結果は次のとおり。`{cause:'7.9.1-1', …}` を渡すと `{"id":"p1","person":null,"paths":[…],…}` が返り、`restrictionState` は `cause: null`・`causeless: 1` を返す
- 帰結
  - `/process-change` の種別 notice で記録した新しい発動のすべてが、保証の開示で「根拠の区分(cause)の無い旧い発動 N 件」と出る(表示と実態の食い違い)
  - 7.9.6 が求める区分の記録が残らない。IMPL-1011 の note「根拠の区分 cause を必須にし」と、README 節17・notice.md の「発動の記録に cause が要ります」は、入口の検査としては正しいが、記録としては実態と食い違う。5.6.3 の照合の材料(書き分けの記録。裁定 §1 A の理由)が失われる
  - 7.9.1 の1 の記録に `person: null` の鍵が書かれる(害は小さい)
- 試験が拾わない理由: `test-roster-conditions.mjs:252` の入口の試験は、記録の `paths` と `recordedBy` だけを確かめ、`cause` を確かめない。集約の試験(`test-roster-conditions.mjs` の 387 行以降の塊)は、入口を通さずに changeLog へ直接置くため、入口の欠けを通る。`test-aggregate-wiring.mjs:268` は入口を通すが、`causeless` を確かめない
- 直し方の案: `normalizeRestriction` の発動の分岐で `cause` を写す。7.9.1 の1 のときは `person` の鍵を持たせない(`...(r.person != null ? { person: nm(r.person) } : {})`)。`test-roster-conditions.mjs:252` の期待に `rec.restriction.cause === '7.9.1-2'` を足す。cause 1 の入口の場面(記録に `cause` が残り、`person` の鍵が無い。続けて集約し、`causeless` の行が出ない)を1つ足す。実装を外すと落ちることを確かめる

### 中-1 IMPL-0284 の note に、裁定 §2.5 の「欠陥の台帳の登録外の ID」の句が無い

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md:327`(IMPL-0284)
- 事実: 裁定 `30-ruling-348-441-450.md` §2.5 は IMPL-0284 の末尾へ「欠陥の台帳の『登録した変更種別』の列に登録の一覧に無い ID を書いた行(登録の ID と混ざる行を含む)も、空欄と同じ扱い…種別を取り下げると…区切りは読点・カンマ・スラッシュ(「・」では分けない)」を足すと定めた。現在の note には運用引き継ぎ文書の節2 の句しかなく、「取り下げ」「区切り」「欠陥の台帳の」のどれも含まない(node で確かめた)。本体の docs のどこにも「取り下げた種別」の語は無い。`40-impl-z5.md` は「IMPL-0284 の末尾の句は B29 の Y1 で既に入っていたため触らない」と書くが、実物と合わない
- 帰結: 止める向きの実装(Y1・Z4)は入っているのに、台帳は挙動と、取り下げの害(残りの種別をすべて止める)と戻し方を開示しない。README 節19 は「(IMPL-0284)」としてこの挙動を案内しており、引いた先のマークに書かれていない
- 直し方の案: §2.5 の句を IMPL-0284 の末尾へ足し、「保証の開示にも行の ID と登録外の ID を出す(組織の外へ渡す形は件数だけ)」を添える。`npm run impl:write`。`40-impl-z5.md` の記述を直す

### 中-2 集約の本文の読み出しが maxBuffer の既定(1 MiB)に掛かり、超えると G-4 の欠落が黙って消える

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1656`(`git(['log', '--format=%x01%H%x00%B', ...logRange])`)と、同じファイルの 1331〜1341 行の `git()`(maxBuffer を渡さない。失敗は `''` を返す)
- 事実: 新しい読み出しは本文の全体を読む。template の履歴では 1 コミットあたり約 600 バイト(489 コミットで 296 KB)。出荷の範囲に `from` が無いとき(最初の集約)は全履歴を読むため、およそ 1,700 コミットを超える履歴で 1 MiB を超える。超えると ENOBUFS が投げられ、`git()` は `''` を返し、`specOf` は空になり、すべてのコミットの `specs` が空になる。その結果、`specsWithoutG4`(3547 行。`gaps` へ入り G-7 を止める)が 0 件になり、注記も出ない。旧い `%(trailers)` の読みは 1 コミットあたりの出力が小さく、同じ失敗に掛かるのはこの数倍の履歴からだった。同じファイルの他の git の読み出し(2397・2677・4815 行)は `maxBuffer: 64 * 1024 * 1024` を渡している
- 帰結: 大きな範囲(既存のリポジトリへ導入した直後の最初の集約など)で、止める側の検査が出力なしに緩む。境界(古く長い履歴)で誤った出力になる
- 直し方の案: この呼び出しに `maxBuffer: 64 * 1024 * 1024` を渡す(`git()` に options を足すか、専用の読み出しにする)。読み出しの失敗を `''` と区別し、失敗なら G-4 の行に「本文を読めず、トレーラ Spec を数えていない」を出して `recordUnverifiable` に入れる(0 件と出さない)。試験は、`git()` の読み出しを失敗させた場合に G-4 の行が「0 件」と出ないことを1場面で確かめる

### 低-1 集約の「末尾の段落の外の `Spec:` 行」の件数が、仕様を指さない行も数える

- 所在: `template/scripts/gate/aggregate-evidence.mjs:1662-1663`
- 事実: `all` は `Spec:` で始まる行をすべて数える。`Spec: setup` のように F-NNN を含まない行は、旧い読みでも新しい読みでも仕様に数えない。それでも「数えていない」の件数に入る。template の履歴では 40 件と出る。次の一手の側は `51-chair-x-r1.md` #348 R1-1 で「済みに数えるはずだった形」の行だけを数えるよう直した。集約の側は §1.7 の文言(「`Spec:` 行」)のとおりで裁定とは食い違わないが、§1.7 の目的(数えられたはずの行を見せる)から見ると雑音になる
- 直し方の案: 集約の述語(F-NNN を含む行)に揃え、`all` を `l.trim().startsWith('Spec:') && /F-\d+/.test(l)` にする。または現状を保ち、README 節18 に「仕様を指さない行(`Spec: setup` など)も件数に入る」と1句書く。議長の裁定に委ねる

### 低-2 コア機能の「関わる登録した変更種別」の登録外の ID(coreUnregistered)の害の向き(41-chair-z4 項3 の判断材料)

- 所在: `template/scripts/gate/autonomy.mjs:282`・`358-368`・`1137-1139`、`template/README.md` 節19 の末尾
- 判断: §1.6 と同じ向きの害は**無い**
  - 止める向き: 登録外の ID の行は、既に空欄と同じ扱い(すべての種別に当てる。`applies` を問わない。360〜361 行)で、止める側にある。§1.6 の害(書き誤りで止めるべきものを止めない)は、ここでは起きない
  - 黙るか: 保持者が1名以下で止めているときは、停止の理由(`stopsText`)に「登録の一覧に無い ID『…』があるため、空欄と同じ扱い」が付き、内部の保証の開示の項目3 に出る。保持者が2名以上で停止が無いときは、効いていない書き誤りで、次の一手の注記(`autonomyNoteLines`)だけが出す。黙るのは、効果の無い間だけである
  - 残る小さな食い違い: 回復の後の登録の判定を待つ分岐(`c.lowUntil`。366〜368 行)では、理由の文に登録外の ID の句が付かない。関わらない種別が止まった理由を、保証の開示を読む者は読めない(次の一手は注記で読める)
- 重大度: 低。裁定 41-chair-z4 項3 の「保証の開示へ別の行を足さない」で足りる
- 直し方の案: `lowUntil` の分岐の理由の文にも `unregisteredText` を付ける(表示だけ。新しい義務でない)。README 節19 の末尾「保証の開示へ出す表示は入れていません」を「別の行は出しません(止めているときは停止の理由に ID が出ます)」へ改める(編集-2 と同じ箇所)

### 低-3 reference/input.md の基準値の向きが、裁定 §1.9 と逆のまま残っている

- 所在: `template/.claude/skills/process-change/reference/input.md:45`(Z2 で書き換えた行)、`template/scripts/gate/test-loosening-decider.mjs:181`(コメント)
- 事実: 「上げる・外すのは緩める向き」とある。§1.9 の後は、外すのは強める向き、新しく置くのは緩める向きである(`settings.md` と `generate-profile.mjs` の `rank` はそのとおり)。記名と理由は向きを問わず要るため、拒否と受け付けは変わらない。案内の文だけが逆である
- 直し方の案: 「上げる・新しく置くのは緩める向き、下げる・外すのは強める向き」へ。試験のコメントも同じ

### 低-4 試験の所在が裁定の指示と違い、IMPL-0645 の test= が集約の側を押さえない

- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md`(IMPL-0645 の `test=template/scripts/gate/test-model-adoption.mjs`)
- 事実: 裁定(#356 §3.2 項6、#348 §3.2 項5・6)は集約の側の試験を `test-aggregate-records.mjs` に置くと指示したが、差分は触っていない。代わりに `test-roster-conditions.mjs`(制限の人・causeless・IMPL-1003)と `test-edition-end.mjs`(IMPL-0645 の1行・トレーラ Spec)へ置いた。どちらも `gate-g5.yml` で結線されている(131・173 行)ので、検査が抜けたわけではない。ただし IMPL-0645 の note は「次の一手と保証の開示に機能の名前を出す」と書くのに、test= の `test-model-adoption.mjs` は純粋な関数と次の一手しか確かめない
- 直し方の案: IMPL-0645 の note に「集約の側の試験は test-edition-end.mjs」を1句足す(IMPL-1006 の「試験は test-loosening-decider.mjs」と同じ形)。実装の記録の「指示書から外れた点」に置き場の違いを書く

### 編集-1 IMPL-0517 の note の「件数を注記に出す」

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md`(IMPL-0517)
- 事実: 集約は件数を「注記」でなく、保証の開示の項目5(全ゲートの通過記録)の G-4 の行に出す
- 直し方の案: 「件数を次の一手の注記と、保証の開示の G-4 の行に出す」へ

### 編集-2 README 節19 の coreUnregistered の文

- 所在: `template/README.md` 節19 の最後の箇条(「運用引き継ぎ文書の節2 の…保証の開示へ出す表示は入れていません(次の一手の側だけ)」)
- 事実: 止めているときは停止の理由に ID が出る(低-2)。「表示は入れていません」は、別の行を足していない意味では正しいが、出ないと読める
- 直し方の案: 低-2 の文へ

## 確かめて所見にしなかった点

- 裁定を超える義務・表示: 見つからない。値を外す記録に `method` を付けると拒否する点は、41-chair-z2z3 項2 のとおりで、README 節20 に開示がある。保証の開示の欠陥の台帳の行を外へ渡す形で件数だけにしたのは、既存の外へ渡す形の作法(停止の原因を区分だけで出す)に合い、新しい義務でない
- check-pr の標識の検査: 名で比べる・`--policy-base` なしは notice・短い SHA だけ・例外承認を案内しない・マージで取り込んだ既定ブランチの古い標識に当たらない、を試験(ng1〜ng5・ok1〜ok6)と実装で確かめた。`mergeBase` を解決できないときは前段で失敗して返るので、`markerCommitsInRange` に空の範囲は渡らない
- 一発承認率: 分母は承認の写しのある PR に限る。PR 番号の無い変更は入らない。記録用ブランチを読めないときは null で「読めない」。30 件未満は値を出さない。差し戻しは cited を問わず、窓で切らず、判定の日以前。L・停止に効かない。裁定 §3.2 項4 の場面はすべて試験にある
- 決め方(method): `reworkBaselineInfo` は値が null の記録で method を null にする。`priorWindowExists` は月初の評価の日ごとに、その日に効いた窓で数え、記録した日より後の記録を数えない(試験で固定)。決め方だけの変化は向きなし(試験あり)
- 0645 の集約の1行: 名と同じ終点の引き継ぎ文書と台帳を読む(`recordAt`)。欠落に数えない(試験あり)
- IMPL-1003 の行は内部と外へ渡す形の両方に出る(試験あり)。IMPL-1004 の行の直前に置かれ、裁定 F の文と一致する
- 本体のマーク: IMPL-1011・0191・1003・0118・0190・1006・0268・0287・0288・0291・0517・0645 の state・check・test= は裁定 §2 のとおり。test= の各ファイルに、そのマークの違反と適合の目印がある(0645 は低-4)
- commit メッセージ: 本体・template とも、close・fix・resolve の語は無い
- 既存の ADR との矛盾: ADR-0161 決定5・ADR-0172 決定2・3・ADR-0158・ADR-0250 と食い違う記述は見つからない(採用済み ADR は書き換えていない)

## 申し送り

- 高-1 は表示と実態の食い違いで、巡の数に関わらず直す対象である。直した後、入口を通した発動を集約し、`causeless` の行が出ないことを実行で確かめる
- 2巡目は、直した差分だけを見る
