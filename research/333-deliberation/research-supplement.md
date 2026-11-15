# #333 調査の補い(外部の事実と実行での確認。結論は出さない)

確認日 2026-11-15。template は 1e30869(変更していない。写しを scratch に作って実行した)。research.md の 5 節と 2 節の事象 2・3 を補う。

## 1. GitHub の公式ドキュメントでの確認

取得は WebFetch(要点は取得時の要約であり、原文の全文照合ではない)。

| 項目 | 確認結果 | 出典(確認日 2026-11-15) |
| --- | --- | --- |
| 成果物とログの既定の保持 | 確認。「90 days, and this retention period can be customized」。リポジトリ・組織・企業の各層で設定できる | https://docs.github.com/en/actions/how-tos/manage-workflow-runs/remove-workflow-artifacts |
| 保持の設定の範囲(公開・非公開) | 確認。公開「anywhere between 1 day or 90 days」、非公開「anywhere between 1 day or 400 days」 | https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization |
| 組織・企業の上限 | 確認。「the maximum retention period cannot exceed the limit set by the managing organization or enterprise」。リポジトリは組織・企業の上限までしか上げられない(下記 changelog も同旨) | 同上 |
| 設定の遡り | 確認。遡らない。「only applies to new checks, workflow runs, commit statuses, artifacts, and log files」。消えたものは戻らない | 同上、および下記 changelog |
| upload-artifact の retention-days の上限(個別指定) | 確かめられなかった(workflow-syntax のページの取得範囲に記述が無かった)。リポジトリの設定の上限を超えられない、という一般則は上の組織の設定のページからは言えるが、個別指定の上限そのものは未確認 | https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax(該当なし) |
| チェック・実行・ステータスの保持(2026-10-01 以降) | **主張は真**。「checks, workflow runs, and statuses are now governed by the same GitHub Actions retention setting」。Actions と第三者の App の両方のチェックとステータスを含む。UI の名称は「Check, workflow run, status, artifact and log retention」。2026-10-01 の changelog は「now」と書く。事前告知(2026-07-17 付、編集注記 9月15日)は「Starting October 1, 2026」「they will automatically be cleaned up once they pass the artifact and log retention period configured for your repository, organization, or enterprise」「Before: kept for 400+ days regardless of your retention configuration」「default of 90 days」「A repository can raise its retention only up to the cap configured at the organization and enterprise level」。公開リポジトリの最大は 90 日。非公開の最大は changelog に記述なし(組織の設定のページの 400 日が根拠) | https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses 、https://github.blog/changelog/2026-07-17-actions-retention-will-cover-checks-workflow-runs-and-statuses/ |
| 上の範囲(github.com 以外) | 確かめられなかった。第三者の記事に企業向けの適用日の記述があったが、公式で裏付けられていないため採らない。Enterprise Server への適用も未確認 | — |
| リリースの資産の期限 | リリースのページに、資産の期限・保持の記述は無い(期限があるとは書かれていない)。上限は「Up to 1000 release assets」「Each file ... under 2 GiB」「no limit on the total size」。管理できるのは書き込み権限者(「only people with write permissions to a repository can manage releases」) | https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases |
| 不変のリリース(immutable releases) | 確認。2025-10-28 に一般提供。「Once you publish a release as immutable, its assets can't be added, modified, or deleted」「Tags for new immutable releases are protected and can't be deleted or moved」。署名つきの release attestation(Sigstore bundle)が付く。リポジトリまたは組織の設定で有効にする。「immutability will only apply to future releases」(有効にする前のリリースには及ばない。第三者に「前のリリースも不変になった」との報告があるが、公式では確かめられなかったので採らない)。GitHub Enterprise Server では attestation が使えないとの記述は第三者のみで、公式では確かめられなかった | https://github.blog/changelog/2025-10-28-immutable-releases-are-now-generally-available/ 、https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/preventing-changes-to-your-releases(有効化の手順と「future releases」のみ) |
| artifact attestations の保管 | 公開リポジトリは Sigstore の公開インスタンス(透明性ログに残る)。非公開は GitHub の Sigstore インスタンスで、「does not have a transparency log and only federates with GitHub Actions」。bundle の写しは GitHub が保管する | https://docs.github.com/en/actions/concepts/security/artifact-attestations |
| attestation の保持期間 | **確かめられなかった**(公式のページに記述が無い。検索でも見つからない)。プランの条件も、取得したページには記述が無く確かめられなかった | 同上 |
| attestation の検証 | 確認。`gh attestation verify <成果物> -R <org/repo>`。オフライン: `gh attestation download` で bundle を取り、`gh attestation trusted-root > trusted_root.jsonl` で信頼の根を取り、`--bundle` と `--custom-trusted-root` を渡す。「The key material in trusted_root.jsonl does not have a built-in expiration date」。信頼の根は、新しい署名の材料を持ち込むたびに作り直すことを勧める(取り消しの把握は作った時点まで) | https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/verify-attestations-offline |
| ブランチ(ルールセット)による保管の性質 | 確認。Restrict deletions「only users with bypass permissions can delete branches or tags」(既定で選択)、Block force pushes(既定で有効)、Restrict updates「only users with bypass permissions can push」。ルールセットは「certain users to bypass the rules」を許す。つまり、削除・書き換えの禁止は、バイパスの権限者には効かない。コミットの保持に期限の規定は無い(コミットが消えるのは、ブランチの削除・書き換え・リポジトリの削除による) | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets(保持期限の無さは、記述が無いことからの読みで、公式の明言ではない) |

research.md 5 節・ci-gates.md L802〜(2026-10-23 時点)の記述との突き合わせ

- 「成果物とログの既定 90 日、公開 1〜90 日・非公開 1〜400 日、遡らない」は一致
- 「チェック・実行・ステータスは 2026-10-01 以降、設定の保持に従う」は一致。ci-gates.md の表の「2026-10-01 までは 400 日以上」も、事前告知の「400+ days regardless of your retention configuration」と一致
- ci-gates.md の記述の出典の URL は、ci-gates.md 側に明記が無い。上の 2 つの changelog を出典として足せる
- 追加で分かった点: 既定は 90 日なので、非公開でも設定を上げていなければ、チェックの履歴は 90 日で消える。上げた場合も組織・企業の上限が掛かる

research.md の候補案への影響(結論ではなく事実の整理)

- 案 B: immutable releases を有効にしたリリースは、資産の追加・変更・削除ができない。ただし有効化前のリリースには及ばない。採用者の設定が要る(adopter)
- 案 C: 上限は公開 90 日、非公開 400 日、かつ組織・企業の上限。個別指定の上限そのものは未確認
- 案 E: 来歴の署名は付くが、attestation 自体の保持期間は確かめられなかった。保管の根拠にする場合は、bundle を自前で保管する形(オフライン検証の手順がある)になる
- 案 A: 削除・書き換えの禁止はバイパス権限者に効かない。research.md の「書き込み権限者の追記は防げない」と整合する

## 2. 実行での確認

scratch(C:/Users/kokor/AppData/Local/Temp/claude/9c454912284b4ac9/4ed090b1-58dc-4976-b9da-81b77286cf15/scratchpad/333/)に template の写しを置き、git の履歴(v0 の後に PR #7 のマージコミット「Merge pull request #7 from o/feat」)を作った。集約 `scripts/gate/aggregate-evidence.mjs` の `gh` の呼び出しだけを、写しの側で偽の gh(`fakegh.mjs`)へ差し替えた。既存の試験(test-aggregate-records.mjs)は集約の本体を動かさず、gh の呼び出しの経路を持たないため使えなかった。そこで集約の本体をそのまま動かした。実行は node v26.13.0、`GITHUB_REPOSITORY=o/r node scripts/gate/aggregate-evidence.mjs --from v0 --to main`。

### (a) statusCheckRollup が空の PR の G-5

偽の gh は、PR の記録を `statusCheckRollup: []` で返し、`commits/<sha>/check-runs` は空で返す(保持切れの模擬)。

| 偽の gh の rollup | 集約の出力 |
| --- | --- |
| 空 | `PR #7: gate-g5 の結果の記録がありません(必須チェックを経ずにマージされた可能性。ブランチ保護の適用を確かめる。PR の head の check-runs にも gate-g5 が無い)`(1 件) |
| gate-g5 が SUCCESS | その行は 0 件 |

結果: 確認。保持切れを模した空の rollup は、「必須チェックを経ずにマージされた可能性」と同じ文で出る。保持切れの可能性を示す文言・分岐は無い(IMPL-0244 の記述どおり)。限界: 偽の gh による模擬であり、実機の保持切れ(2026 年 10 月以降の古い PR)ではない。なお、ブランチ保護を適用しない場合の「経ていない」ケースと機械的に同じ入力になるため、区別するには入力(マージ日と保持の設定)を足す必要がある。

### (b) coverage の結果の取り込み

| 条件 | quality-report.md の出力 |
| --- | --- |
| evidence/coverage-result.json が無い(ship-evidence.yml が取り込まない状態と同じ) | `カバレッジ | 未測定(集計ファイルがありません)`。保証の開示にも `- カバレッジ: 未測定(集計ファイルがありません)`。外へ渡す版にも同じ |
| coverage-result.json を置く(`{"measured":true,"pct":88,"threshold":80}`) | `実施(88% / 下限 80%。測った範囲と分母の記録なし)` |

結果: 確認。集約は coverage-result.json を読めば開示するが、無ければ未測定になる。ship-evidence.yml(.github/workflows/ship-evidence.yml)の取り込みの手順(L120〜146 を再度読んだ)は license-scan と test-results だけで、coverage-result を取らない(grep でも coverage の語は他に無い)。したがって、配線の欠けにより、実機の出荷では未測定になる、という読みを、集約側の動作の確認で補強した。限界: ship-evidence.yml 自体はワークフローのため実行していない。ワークフローが coverage-result を取り込まないことは、コードの読みのまま。

### 実行の後始末

template/ の作業ツリーは変更なし(git status が空)。scratch の写しは `scripts/gate/aggregate-evidence.mjs` の gh 呼び出しだけを差し替えている。
