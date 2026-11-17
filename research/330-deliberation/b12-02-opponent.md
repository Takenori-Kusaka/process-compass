# #330 準拠テンプレート T-1〜T-8 への反対意見(束 B12 反対委員・軽)

日付: 2026-11-17。読んだもの: b12-01-drafter.md、tmp/b12/brief-common.md・brief-opponent.md・issue-330.txt、decision.md、ADR-0151、gate-criteria.md L1010-1060・L1533・L1541-1543・L1723、implementation-marking.md(machine の要件)、template/ の adapter.mjs(L1-20・L55-120)、config.mjs(ALWAYS_PHASES)、gate-g5.yml(L170-200・L325-365)、ship-evidence.yml(L117-143)、setup-stack/action.yml、aggregate-evidence.mjs(L1082・L1262-1266・L3436-3446・L3540-3580・L4120-4160・L4245-4268・L5338・L6148-6158・L6609)、g5-aggregate.mjs の machineCheckStatus、test-adapter.mjs・test-g5-aggregate.mjs・test-coverage-scope.mjs の構造、adapters/*.json。実行はしていない(読んで確かめた)。

## 起案の前提の実在の確認

| 起案の前提 | 結果 |
| --- | --- |
| gate-g5.yml の記録の段が無条件に `scanRun: true` を書く | 実在(L351-356) |
| 4か所(L3440・L4145・L5338・L6609)が scanRun を読む | 実在 |
| `unmeasuredStreak` は L4253 の閉包、`streakText` L4267 | 実在。`sameRelease`・`previous`・`releaseDay`・`dayOfRef`(git)を閉包で掴む |
| isMain は L1082 | 実在。その前に export 済みの関数がある(切り出しの置き場はある) |
| test-adapter.mjs の代役 PATH と FAKE_EXIT | 実在(L16-73)。終了コードの伝播は secretScan で既に試験がある(L87 `ng.code === 3`) |
| test-g5-aggregate・test-adapter が contract で走る | 実在(L179・L191) |
| T-6 の表のアダプタ | **不足**。同梱は7種(node・python・python-poetry・python-uv・go・none・undetermined)。起案の表は poetry・uv を落とす |

## 項目ごとの反対

### T-8(採る。ただし起案は2点を見落とす)

1. **対象なしの経路も `scanRun: true` になる**。licenses は ALWAYS_PHASES(secretScan だけ)に入らないため、製品のコードが無いと adapter.mjs L63 が通知して exit 0 し、記録の段は同じく `scanRun: true, result: success` を書く。起案は空のコマンドだけを直す。記録の側では「コマンドが空」と「対象なし」の両方を `adapter.mjs print licenses` の出力が空であることで捉えられる(どちらも print に達する前に exit 0 する)。理由は分けて書く
2. **記録の側だけでは閉じない**。古い版のワークフローが書いた `license-scan.json`、ワークフローを採用者が変えた場合、集約の時点の構成と G-5 の実行の時点の構成が違う場合が残る。集約の側でも `machineCheckStatus`(licenses / ip-clearance)を先に判定し、未実施ならば scanRun に依らず未実施とする(IMPL-0995 の note も「machineChecks の licenses を先に判定する」を挙げている)。両側で閉じる。4か所が同じ判定を使うよう、判定を1つの純関数に寄せる案には賛成
3. **L3440 の欠落を出す案に反対する(起案の確認点4)**。構成で選んだ未実施のライセンス検査を「知財潔白性の検査記録がありません」の記載の欠落にすると、none・undetermined の採用者は出荷のたびに G-7 で差し戻される。これは ADR-0151 決定3(継続の長さで差し戻さない)と緊張し、採用者に今は無い差し戻しを課す。一方で IMPL-0995 の note(標準の本文)は抑止を欠陥と書き、G-7 基準8(L1543)は「定めた検査を実施し記録したこと」を判定する。どちらが誤りかは、軽の2委員で決めてよい点ではない。新しい義務に当たる割れであり、所有者へ上げる。既定の実装は、表示を正す側(項目4・基準8 の行・「記録」の節を未実施と出す)に留め、欠落にするかは所有者の決定で切り替える
4. 新しいスクリプト(license-scan-record.mjs)は採ってよい。ワークフローの printf は条件を持てず、試験もできない

### T-1(採る。範囲を1点広げる)

- 起案は「値が `未実施` で始まるもの」に限る。カバレッジの未実施の値は `未測定(…)` で始まる(L3541 `UNMEASURED = '未測定'`、L4140)。none・undetermined はカバレッジを測らずに通る(IMPL-0495 の ok 側)。所有者のコメント(issue-330.txt の1件目)は、まさにこの「測らずに通す扱いを未実施の長期化と同じ観点で扱うか」を問う。前置きを `未実施` に限ると、所有者の問いに答えないまま閉じる。`未実施` と `未測定` の両方を継続の対象にする
- 前置きの文字列で判定するのは決定可能(値の一致)。可
- 期間の指定(`--period-*`)では loadPrevious が `--previous` の明示が無い限り null を返す(`if (period) return null`)。継続は常に「前回の出力なし」になる。項目6 と同じ挙動であり、試験で固定するに留める。起案の「範囲指定なしの --period-* にも効く」は事実と違う

### T-2(採る)

- 閾値で差し戻さないことの ng の固定に賛成(課さないと決めたことの固定)
- 純関数は `git` に依らせない(`dayOfRef` を引数の関数で受ける)。時計に依らない試験にするため

### T-3(採る。coverage は OPTIONAL に残す)

- 起案の確認点1への答え: **外さない**。decision の裁定4「カバレッジは任意の検査から外す」は標準の本文(template-repository.md の表)の編集で、adapter.mjs の挙動の指示ではない。外すと none・undetermined の空の coverage が adapter で exit 1 になり、IMPL-0495 の ok 側(通知して通す)を壊す。注釈だけを直す

### T-4(採る)

- IMPL-0992 を machine へ戻すには、試験に `IMPL-0992:ng` と `IMPL-0992:ok` を**別の行に**置く(check-impl.mjs の要件。#314 X-11)。起案はこれを書いていない
- 終了コードの伝播(lint・audit・licenses で FAKE_EXIT=1 → exit 1)は、T-7 ではなくここに入れる。同じ経路の試験である

### T-5(縮小案の後半に反対)

- 起案の推奨は「項目4 の行(検査名・理由)+ 集約の `generatedAt` で3項目に当たる」と読ませて delivered にする案。反対する。`generatedAt` は出荷の集約の時刻で、G-5 の判定の時刻ではない。標準は「判定の時刻」を求める(gate-criteria.md 「対象なし」の記録の3項目)。読み替えで delivered にすれば、機械が確かめていないのに確かめたと読める表示になる(本束の方針が最も避ける形)
- 書き込みの経路を新設する案(起案の (a))も、本束では採らない。各ジョブが記録を成果物として上げ、ship-evidence が取り込む結線が要り、変更が G-5 の全ジョブに及ぶ。実装の開始の後に続く対象なしは、T-1 の継続(起点の出荷と回数)で出荷ごとに見える。標準が対象なしを問題にする場面(実装の開始後に現れる)は、それで読める
- 結論: 項目4 が対象なしを検査ごとに理由つきで出すことを試験で固定し、IMPL-0239 は undelivered のまま、note に「基準と理由は項目4 が出す。判定の時刻は記録していない(集約の時刻は判定の時刻ではない)」と書く

### T-6(採る。表の写しに反対)

- コマンドの写しを README に置くと、adapters/*.json との二重の正本になる。起案自身が機械の一致の検査を採らないため、乖離は検出されない。表は「どのアダプタが lint・audit・licenses の既定を持つか」と「正は adapters/<id>.json の commands」に留め、コマンドの文字列を写さない
- rust・java の例は載せない(起案のとおり。未検証のコマンドは書かない)
- 7種すべてを挙げる

### T-7(起案の一部に反対)

- 「外部の道具が依存の欠落で失敗するか」を降ろさない判断に賛成。実害の筋は実在する: install は OPTIONAL で、空の install のまま lock ファイルだけがある構成では、node の license-checker は node_modules を読まずに一覧を空で返しうる。テンプレートが保証できない道具の挙動で、undelivered の表示を続ける価値がある
- 伝播の試験は T-4 へ寄せる。IMPL-0234 を分けて部分を delivered にする案(起案の確認点3)は採らない。伝播は IMPL-0234 の確かめていない点(入力の欠落で検査器が失敗で終わるか)と別の事柄で、分けても規定の中身は降りない。細かい定義を増やすだけになる
- setup-stack の install の段に continue-on-error が無いことの構文の検査は採ってよい(決定可能。依存の取得の失敗が黙って続く回帰を止める)。置き場は test-g5-aggregate.mjs(既にジョブの continue-on-error を見ている)

## 既存の規定との突合

| 対象 | 所見 |
| --- | --- |
| ADR-0151 決定3 と IMPL-0995 の note | T-8 の L3440 で衝突する。所有者へ上げる |
| ADR-0151 L65「準拠テンプレート: 変更なし」 | 本文は書き換えない。implementation.md に記録する(起案どおり) |
| EV-0293 の対象の文 | 「ライセンス検査の表示の欠陥(IMPL-0995)」を含む。T-8 が降りたら文を直す(根拠水準マークは ADR ではないので直せる) |
| IMPL-0046(L1533)の note | 「空のコマンドでも記録ありと数える(IMPL-0995)」を T-8 の後に直す |
| template-repository.md L864 の括弧 | T-8 の後に削る |
| implementation-marking.md | delivered machine には test= と別の行の ok/ng と contract からの実行が要る。T-1・T-4・T-8 の各試験に目印を置く |

## 議長への確認点への答え

1. coverage を OPTIONAL から外すか → 外さない(T-3)
2. T-5 の縮小案 → 前半(実行で確かめて undelivered のまま開示)を採り、後半(読み替えで delivered)は採らない
3. IMPL-0234・0239 の分割 → どちらも分けない
4. L3440 の欠落 → 既定は欠落にしない。所有者へ上げる(新しい義務に当たる割れ)
