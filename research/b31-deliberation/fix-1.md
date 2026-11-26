# 束 B33 直し 1 — 独立の突合 1巡目(audit-1.md)への裁定(ruling-3)の実装

実装 2026-11-26。裁定の「直し」の列を全部行った。採らないと書いた案(基底の行で受ける新しい道・`persist-credentials: false`)は入れていない。

## 所見ごとの直し

| 所見 | 直し(template のパス:所在) |
| --- | --- |
| 高1 | `.claude/skills/gate/reference/exception-paths.md`(`@` の項)・`README.md`(項目23の「受けないもの」): 「例外承認を既定ブランチの台帳に先に入れる」を削り、「名簿の記載の名で書き直し、失敗したジョブを再実行する」だけを案内。基底の台帳に先に入れても `@` の指示者は退けられる旨を明記 |
| 高2 | 本体 ADR-0243 決定2 の4: 「状態が有効を指す値(未返却・未回収・有効)のどれかと完全一致する」 |
| 中1 | 本体 `phase4-process-design/exception-escalation.md` の IMPL-0996 の note を予定の形(U6c の後に常には欠落にしない行へ移す。前は常に欠落)へ。ADR-0243 決定2 の「同じ関数で読む」を「段が読む。集約は U6c で同じ関数へ寄せる」へ |
| 中2 | `scripts/gate/mutation-stage.mjs` の `breachExceptionOf`: `PIT_IN_BASE_CONFIG` が無い・読めない・オブジェクトでない、`PIT_IN_POLICY_BASE` が無い、基底の点を `rev-parse` で引けない、基底に台帳があるのに `git show` が失敗、のいずれでも受けない。基底に台帳が無い(`cat-file -e` が失敗)ときは全行を PR の中で足した行として読む(従来どおり (A) が要る) |
| 中3 | `.github/workflows/gate-g5.yml` のコメントと `README.md` を「環境変数としては渡さない。checkout が残す資格情報は段のコマンドからも読める」へ。本体 ADR-0243「課さないと決めたこと」に ADR-0115 決定1 との突合を1項足した(段の出力・受否の材料は PR の側のコードから偽れる。EV-0339 の manual と同水準。G-6・承認した者が読む) |
| 低1 | 本記録: LF の写しは `git -C template -c core.autocrlf=false archive HEAD` で作る。今回は作業途中の変更を含めるため、作業ツリーの追跡ファイルを `tr -d '\r'` で LF にして `tmp/fix1`・`tmp/fix2` へ写した |
| 低2 | `scripts/gate/exception-expiry.mjs:508`: 期限の文は `exceptionStanding(...) === 'overdue'` のときだけ |
| 低3 | `test-adapter.mjs`: `PIT_IN_EVENT=workflow_dispatch` と `route: 'workflow_dispatch'` の整った記録の組の ng |

## 試験(node 26.13.0、Windows、LF の写し)

- test-adapter 232/232(225 + 7)。足したもの: 基底の構成が無い・名簿の人を PR の側へ足して基底の構成が無い・名簿の人を PR の側へ足して基底の構成がある・`PIT_IN_POLICY_BASE` が無く基底の行の期限を書き換え・基底の点が引けない・workflow_dispatch・返却済みで期限切れの文を出さない
- test-exception-expiry 109/109(+1: 返却済みに期限切れの理由を出さない)
- test-push-trigger 27/27。test-init-g5 は終了。test-adoption は 1 件 NG(「事前点検が除く指示ファイルが git ls-files と一致する」)。写しが git の作業ツリーでないための差で、本直しの対象外(写しの作り方の限界。要確認)
- 本体: lint:impl・lint:evidence(328 件)・lint:refs・textlint(ADR-0243・exception-escalation)を通過。台帳は impl:write で再生成

## 陰性の確認(判定を外した写し `tmp/n_*`)

| 外した判定 | 結果 |
| --- | --- |
| 基底の構成が無いとき作業ツリーへ倒す | adapter 2件が落ちた |
| `PIT_IN_POLICY_BASE` の欠如を受けない | 1件が落ちた |
| 基底の点を引けないとき受けない | 1件が落ちた |
| 起動の経路(pull_request・push 以外)を受けない | 1件が落ちた(低3の ng) |
| 期限切れの文を overdue のときだけ出す | expiry 1件が落ちた |

## 議長へ返す点

- 基底に台帳が無いときの扱いは、`cat-file -e` の失敗を「無い」とみなす。基底の点自体が引けない場合は先に `rev-parse` で退けるので、この区別で足りるが、`cat-file` の失敗が一時的な読み出しの失敗でも起きうる点は実行で確かめていない(その場合は基底に台帳が無いものとして (A) を要求する側。受ける側へは倒れるが、PR の中の行にも (A) が要るので抜け道にはならない)
- test-adoption の 1 件 NG は写しの作り方(git 管理外)による。本体の `npm run check` の全量は流していない
