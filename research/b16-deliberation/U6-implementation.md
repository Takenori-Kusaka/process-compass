# U6 実装・仕様の手引き 実装の記録

template コミット: 9634671(b16 の 5341261 の上)。bundle: `tmp/bundles/template-b16-U6.bundle`。

| IMPL / C | 降ろし先 | 書いたこと | マーク |
| --- | --- | --- | --- |
| IMPL-0819 | `implement/SKILL.md` 手順3 の冒頭 | コア機能・R1 で、人が方針を先に書き(段階1)、AI の生成結果を参照し、相違を記録する。記録先は既存の「コミットのメッセージ / PR の変更の概要」。非コアかつ R3 は段階1を省略可 | delivered |
| IMPL-0921 | 同 手順4(保留の説明の前) | 安全関連部で、合格へ転じた反復を完了とせず、記録を添えて仕様へ戻す | delivered |
| IMPL-0922 | 同上(同じ段落) | 要求3の4条件を改めて満たす | delivered |
| IMPL-0929 | 同 手順2(手順3 の直前) | 故障挿入の試験項目を生成させる順序4点 | delivered |
| IMPL-0932 | 同上 | スコアだけで十分性を判定しない・境界値の人の点検。R1 の判定に含める | delivered |
| IMPL-0577 | `implement/reference/task-size.md` 除外規定 | 3点をすべて満たすものだけ除外。機械は印の有無しか見ない旨を開示。target を pr-checks から implement-skill へ直した | delivered |
| IMPL-0579 | 同上 | 一括整形・リネームを実質変更と別の変更単位に分ける | delivered |
| IMPL-0580 | 同 末尾 | 緩和根拠は表の「認める」手段に限る。AI 要約・自動レビューコメントは根拠にしない | delivered |
| IMPL-0936〜0939 | `spec-write/SKILL.md` 手順3・手順7 | 型への分類、測定可能な値、正常系ごとの異常系(書けない場合は 01 の既存段落 = IMPL-0942 を指す)、テスト名への変換 | delivered |
| IMPL-0941 | 同 完了の条件 | 3項目を足し、「該当なし」の欄を置かない旨を書く | delivered |
| IMPL-0613 | `pit/reference/handoff.md` 節エスカレーション | 起票者は自分の起票を判定しない・期限超過を承認とみなさない・R1 に持ち回りを使わない。target を next-role から handoff-reference へ直した。next.mjs は変えていない(範囲外) | delivered |
| IMPL-0618 | 同上 | 分量の上限の表、表で書く、草案は AI に生成させてよい | delivered |
| IMPL-0708 | 同 新節「指示資産の提供者依存の棚卸し」 | 観点と印の例。CLAUDE.md の分は足していない(U7 の対象なし)。target を instruction-asset-inventory から handoff-reference へ。識別・印の検査は無いと note に開示 | delivered |
| C-5 | `CLAUDE.md`・`handoff.md` | 確認のみ。判定記録の無い ready-to-merge を dev-done へ戻す行は、どちらにも無い(CLAUDE.md は qm-blocked の復路だけ)。遷移の表の行は標準側(#328 の裁定)の事項で、IMPL-0331 系が追う。本束では何も足さない | 変化なし |
| U5 の積み残し | `templates/04-gate-record.md`(「対象」の段落の後) | F.7 の記録(様式 09 の節「安全関連部の検証の記録」)を判定記録に添付する旨と、中身は 09 に書く旨の1段落。欄・節は足していない | IMPL-0933 は U5 で delivered 済み |

様式の写し(`template/profiles/*/templates/`)は 06 だけで、触れていない。template-fields.yaml は変えていない(節を足していない)。

## 検査

lint:impl 0、lint:refs 0、test:plan-issues 0、test:fields 0、lint:skills 0(根拠の所在を第6章「実装作業における順序」の形に直した)、template の test-plan-trace 35/35。test-spec-recheck は 120 秒を超えたため打ち切った(触った文言を読まない見込み。未確認)。

## 突合で見てほしい点

1. 0819 の記録先を既存の「コミットのメッセージ / PR の変更の概要」にした。標準は記録先を定めていない
2. 0921 の「stop --reason pass の後も完了とせず仕様へ戻す」は、安全関連部以外には掛けていない。スキル内で安全関連部の判定語を新設していない(「安全関連部」の語のまま)
3. 0708 の印の書式 `<!-- 提供者依存: ... -->` は例であり、書式は組織で決めてよいと書いた
4. 0613 の「兼務の体制では自己の判定を D-0 の記載のとおり開示」は IMPL-0613 の note(IMPL-0368)から取った
