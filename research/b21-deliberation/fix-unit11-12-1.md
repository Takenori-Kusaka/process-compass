# 束 B21 単位11・12 の突合 1巡目の直し

作成 2026-11-18。所見 `review-unit11-12-1.md`、裁定 `ruling-unit11-12-fix1.md`。template のコミット ed308c1(bundle `tmp/bundles/template-b21-09.bundle`)。6項目(0571・0210・0215・0213・0219・0216)は `state=undelivered` のまま。0218 は `delivered check=manual` のまま、降ろし先だけ `gate-skill` へ。

## 所見ごと

| 所見 | 直した内容 | 試験 |
| --- | --- | --- |
| H1 | 月の検査を関数 `isMonth`(`\d` を正す)に切り出し、既定の月は `previousMonth` に切り出した。Write/Edit で書き `node --check` と実行で確認 | 受ける(2026-11 ほか)・拒む(2026-13・`dddd-11`・桁不足)・年またぎの既定の月 |
| H2 | 案 (a)。通知の鍵に締切の日を含めた(`notice:n2:<日>`・`notice:n1:<日>`・`measure:<日>`)。手引きの記述を実態に合わせ、判定資料の本文の T は起案者が直す旨を足した | T 改めの後に新しい締切で出る・同じ締切では重ねない・measure も締切ごと |
| H3 | 0218 の降ろし先を `gate-skill`(先例 0832・0220)へ。note に T 改めの後の出し直しを足した | `lint:impl` |
| M1 | 印を読む箇所(`hasKey`・一覧の探索・通知の時刻の読み・意見の除外)を `github-actions[bot]` のコメントに限った(`isMachine`)。残る改ざんの余地は 0213 の note に開示 | 人の通知の印・一覧の印(id 777 を更新先にしない)・印の文字列つきの人の意見 |
| M2 | R1 は 3.9.3 の措置を依頼。R2・R3 は異議なしとして進む旨と、必須応答ロール(3.10.9)を含む案件は R1 と同じ扱いで宛先が判断する旨へ | R3・R2 に「お願いします」が無い・R1 に有る |
| M3 | 起案者を読めないとき `problems` に足し、注意に出して起票も通知もしない | 1件 |
| M4 | notify のジョブの先頭で `gh label create`(`|| true`)。notify の対象が 0 件のときは出力に書く | workflow の構文のみ(実機は未確認) |
| M5 | `SKILL.md` の単位9 の差し戻しの一文を外した。0218 の所在の1行は残した | 差分で確認 |
| M6 | `fetchIssues` が `author_association` を読み、OWNER・MEMBER・COLLABORATOR 以外は対象にせず注意に出す(月次の集計にも数えない) | 関係ごと・集計 |
| L1 | 資料の探索に題名の `判定資料: #N` を併用。草案の本文に「印を消さない」を足した | 印の無い本文でも起票しない |
| L2 | M1 で解けた | M1 の試験 |
| L3 | `review-queue.mjs` の `json`(`--paginate --slurp`)を使う。月次の既存コメントの読みも同じ | 本文の `[a] [b]` が壊れない・`--slurp` の引数の確認 |
| L4 | 工程ゲートの欄が G-1〜G-8 でなければ対象にせず注意。T が営業日でないときは注意に出す(通知は止めない) | 2件 |
| L5 | 一覧に締切後の措置の通知(measure)の時刻も載せた | 1件 |
| L6 | `loginsOf` の前が英数字等の `@`(電子メール)と、後ろが `/` に続く `@組織/チーム` を外した | 1件 |
| L7 | H1 の直しで解けた。workflow の冒頭に対象の関係と印の読み方を書いた | — |

## 直さなかったもの

- L5 の「前営業日の判定する者の行」: 裁定に委ねる項目で、裁定は指示していない。一覧は指名レビュアの行だけを持つ
- 印の改ざんの完全な防止: 同じ権限の者が機械の名義で書く、コメントを削除する、は機械で閉じない。0213 の note で開示し、決定者が判定当日に確かめる
- M4 の「ラベルを様式が作る」実物の確認: 実機は未確認(note と workflow に書いた)
- 採らない案(裁定どおり): H2 の (b)、M6 の名簿照合

## 試験の結果

`test-pre-review` 71 件(TZ=UTC・Asia/Tokyo とも通過)、`test-review-queue` 54、`test-flow-observation` 22、`test-adoption` 69、`test-context-refs`、`test-push-trigger` 27、`verify-gate-contract` 終了 0。本体は `lint:impl`・`impl:issues`・`test:fields` 通過。全量の check は流していない。

## 結線の担当への申し送り

- `gate-g5.yml` の gate-contract のジョブへ(`|| true`・`if:`・`continue-on-error` を付けない):
  - `      - run: node scripts/gate/test-pre-review.mjs`
- `/gate` の `SKILL.md` へ戻す一文(B20 の push の後。単位9・10 の記録と合わせる): 「レビューの指名先を確保できないとき: 新しい判定依頼を作らず、起案者へ差し戻す(同時保有の上限を超えた通知は `scripts/gate/review-queue.mjs`。標準 第4章「レビュー SLA と滞留の措置」)」。足した後、IMPL-0682 の note の「未記載」を改める
- 実物の GitHub で未確認: 機械のコメントの `user.login` が `github-actions[bot]` で `type` が `Bot` であること、`author_association` の値、ラベル作成、`--paginate --slurp` の応答の形
