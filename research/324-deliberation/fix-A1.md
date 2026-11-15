# 束 A 独立の突合 1巡目の直し(Issue #324。2026-11-15)

裁定は `ruling-A1.md`、所見は `crosscheck-A1.md`。条文は変えていない。template/ は読むだけ。第5章の IMPL-0592〜0600 の実物の照合は、短命な担当(sonnet)1名に任せ、返った表を元に直した。実行はしていない(降ろし先の中の所在を開いて語・関数を見つけたところまで)。

## 1. 足した降ろし先(`src/data/impl-targets.yaml`)

| id | 種類 | 内容 |
| --- | --- | --- |
| handoff-reference | template-file | `.claude/skills/pit/reference/handoff.md`(所見 5) |
| assumption-ledger-template | template-file | `templates/10-assumption-ledger.md`(7.10) |
| assumption-ledger-guide | template-file | `.claude/skills/artifact/artifacts/10-assumption-ledger.md`(7.10。incident-artifact と同じ手引き) |
| review-queue-control | planned | 判定とレビューの滞留の検知・催促・通知・同時保有数(第4章の滞留の4節) |
| ip-allowlist-operation | planned | ライセンスの許可リストと暫定の許可の運用(許可リスト。採用者に委ねるかは決めていない) |

## 2. 所見ごと

| 所見 | 直し | マーク |
| --- | --- | --- |
| 1(高) 7.9.3 | `marked` へ。解除の条件に undelivered(seeded-error-drill・#356) | IMPL-0666(新)。location に 7.9.2 を残した |
| 2(高) 7.7.5 要求事項4 | 行を `marked`。上限を拒む検査に undelivered(evidence-aggregation) | IMPL-0667(新) |
| 3 G-5 知財潔白性 | 「AI の利用の有無で変えない」を、gate-g5.yml の if: がイベントと構成の有無だけを見ることを開いて確かめ、delivered。節は `marked`、location は G-7 | IMPL-0678(新) |
| 4 前提条件と判定基準の区別 | 理由の誤り(G-1 にも前提条件がある)を直した。G-1 前提条件1(D-0 の承認)に delivered を足し、前提条件2 は第8章 軸E の IMPL-0449。location に G-1 と軸E を足した | IMPL-0679(新)。G-1(kb)の ids に追加 |
| 5 IMPL-0616〜0618 | target を handoff-reference へ付け替え | 0616・0617 delivered のまま、0618 undelivered のまま |
| 6 IMPL-0555 | `exceptionReviewBacking`(material-attribution.mjs)と `ledgerRowUnbacked`・指示者の対応づけを読み、条件4 は降りていると確認。0555 を delivered へ(issue 等を外した)。0601 と表示が揃う | IMPL-0555 |
| 7 IMPL-0586 | ai-review.yml の冒頭の注記と team.json の必須チェック(gate-g5・gate-g5-base だけ)を確認。delivered へ | IMPL-0586 |
| 8 第5章 0592〜0600 | 下の3章 | IMPL-0688〜0693(新) |
| 9 7.9.6 | 理由を直し、location に 3.13.6 を足した(通知先・通知日は IMPL-0033)。四半期の確認だけを制度設計として残した | — |
| 10 5.9 | 4つ目の契機を `process-change-skill` で delivered(SKILL.md の種別 mode、最初のゲート判定より前に改める)。節は `marked`。残りの契機は制度設計と note に残した | IMPL-0684(新) |
| 11 T6 | 順 6 の問いに、成り立たないと答えた(template/ に2指標を計算・参照する箇所が無い。G-5 の構成・集約に合否条件の入口が無い)。`not-imposed` を外し `org-design` | — |
| 12 G-7 保証の開示 | 箇条と基準9 の表の仕分けを終え、節を `marked`・行1〜7 を区分 | IMPL-0685(delivered)・0686(delivered)・0687(undelivered)(新) |
| 13 IMPL-0562 | note を実物の語(技術品質を蒸し返さない)に合わせた | — |
| 14 IMPL-0613 | note の所在を next.mjs --role の見出しに直した | — |
| 15 7.9.5 要求事項5 / 7.4 制約5 | 件数を数える部分に undelivered(7.9.5 の行5 を `marked`)、報告のふるまいは note で制度設計。IMPL-0612 の note を測定までに絞り報告を制度設計と書いた | IMPL-0669(新) |
| 16 5.5.2 | 理由に IMPL-0025(席ごとの宣言)と IMPL-0552(G-6 の事前判定)を足し、location に G-6 の節を足した | — |
| 17 issue | IMPL-0554 は #355 のまま。IMPL-0584 は `issue=324` へ戻した(束の終わりに議長が寄せ先を決める)。「偏りの監視」の登録簿の issue も 324 | — |
| 18 IMPL-0585 | 帯域不足を理由に省略しない(降りていない・残す)と、判定の時点を移す別の経路を新設しない(delegation.mjs の classifyForSeat・REVIEWER_SEAT に一本化。delivered)へ分けた | IMPL-0585(残す)・0694(新) |
| 19 G-7 成立判定 | note に、定型の文は H.6 の IMPL-0050 から引けるが「中間の語を作らない」は見つけていないと書き、附属書H の束で決めると残した(開示で閉じる) | — |
| 20 7.11 要求事項8 | aggregate-evidence.mjs の stopReleases・renderContinuityGeneration が解除の記録を項目7 へ出すのを確認。IMPL-0073 の note と行の理由へ足した。undelivered は不要 | — |

## 3. 所見 8(第5章)の分け方

元の番号は、降りていない側に使った(再利用しない)。降りている側は新しい番号。

| 元 | 降りていない側(元の番号) | 降りている側(新) |
| --- | --- | --- |
| 0592 | 原則2(結果責任は成果物ごとに1名。席ごとの欄だけ) | 0688 原則3(detectUnmet・confirmerOnRoster・verify-gate-contract) |
| 0593 | 不変条件2の記名・不変条件3の外部との契約 | 0689 不変条件1・4・3の認証認可個人データ(CLAUDE.md・riskFloor) |
| 0594 | R1 は L1・R2 は L2 の変更ごとの照合、安全関連部の R1・L1 固定(実物が持たないと明記) | R3 外の L3 は IMPL-0289 が追う(新規なし) |
| 0595 | 外部指標のみを根拠にしない(該当する文が無い) | — |
| 0596 | — | 0596 自身を delivered へ(上限を下げる要因はすべて実物にある) |
| 0597 | 条件4・条件6(NOT_JUDGED。人の判断) | 0690 条件1・3・5・7と本人による抜き取りの表示 |
| 0598 | 判断3・4・6の一部、出荷判定者の停止権の範囲(見つからない) | 0691 4席を委任しない・判断2・判断5 |
| 0599 | 席ごとの表の列(委任できる範囲・協働で起案できるもの)の値の検査 | 0692 検証の記載を書く者とレディーにする者の区別 |
| 0600 | 安全重要度の上昇時の全件確認し直しの実施 | 0693 失効・切り替え・障害時の引き下げ・戻さない |

登録簿は行ごとの `rows` と節の `ids` を、上の対応に合わせて付け替えた(5.2・5.4.3・5.5.4・5.5.5・5.5.6・5.5.7・帯域の節)。

## 4. pending の節

| 節 | 直し |
| --- | --- |
| 7.10.1〜7.10.4 | 降ろし先を登録し `marked`。7.10.1 IMPL-0670、7.10.2 IMPL-0671、7.10.3 IMPL-0672(delivered)・0673(undelivered。閾値と定めた者を書く欄が台帳に無い)、7.10.4 IMPL-0674〜0676(行1〜3) |
| handoff.md(所見 5) | 上のとおり |
| 割り当て・滞留したときの措置・流入を絞る | review-queue-control(planned)へ undelivered。IMPL-0680・0681・0682(行 制御1・2) |
| 許可リストの運用 | ip-allowlist-operation(planned)へ undelivered。IMPL-0683(表の行 手続1〜3) |
| ポートフォリオ調整 | gate-record-template へ undelivered。IMPL-0668 |
| 5.4.7 | `pending` のまま note を書き直した。(1) 理解保持者数は 3.4.3 の IMPL-0061・0645、(2) 挙動要約は G-6 の IMPL-0093・0077・0112、(3) AI を用いない機会の頻度だけが残る(新しい義務になるため棚卸しで決めない) |
| 7.5 | `pending` のまま(裁定どおり)。review-queue-control は 7.5 の代理指名の求めを運ばないので当てていない。束の終わりに議長が既存の open の Issue へ寄せる |

## 5. 直さなかった・足りなかった点

- 第3章への作業: 所見 9 は 3.13.6 の節を location に挙げただけで、第3章のマークは触っていない。4章 ア〜ス の「第3章 3.9.3 を滞留の予定の降ろし先へ乗せる」は、第3章の別の担当の範囲として手を付けていない(review-queue-control が受け皿になる)。
- 所見 12 の「基準9 の表 13 行」は、行ごとの追跡を IMPL-0686(降りている行をまとめた1件)と IMPL-0687(出すかを確かめていない行)に分けた。0686 は列挙した行ごとの試験の有無までは見ていない。
- 所見 3 の delivered は、gate-g5.yml の if: が分岐しないという「無い」の確認に拠る。構造上の保証であり、機械の検査ではない(check=manual)。
- 所見 4 の G-1 前提条件1 は第2章 2.8(pending)にも関わる。第2章の束で、2.8 の節から IMPL-0679 を指すか確かめること。
- 所見 18 は、5.5.4 のマークで追う案ではなく、直接のマーク(IMPL-0694)にした。
- 条文の誤り・矛盾の候補(新規): なし。

## 6. 検査の結果(終了コード)

- `npm run impl:write`: 台帳を再生成した
- `npm run lint:impl`: 0(実装マーク 680 件、降りていない規定 194 件、第4章の未棚卸し 0、第5章 1 [5.4.7]、第7章 1 [7.5])
- `npm run test:impl`: 0(56 件合格)
- `npm run lint:refs`: 0
- textlint(exception-escalation.md・gate-criteria.md・human-ai-boundary.md): 0
- 回帰の全量・`npm run check` は流していない

## 7. 次の担当への注意

- IMPL の最大は 0694(0666〜0694 が本件)。他の束は 0695 以降から振る
- 2巡目で見る差分: 所見 1・2 の直し、所見 5・6・7 の state と降ろし先、足した降ろし先5件とマーク、所見 8 の分けた9組(特に 0689 の delivered と 0591・0019 の重なり、0691 の判断3・5の読み)、所見 12 の IMPL-0685〜0687
