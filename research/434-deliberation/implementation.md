# #434 の実装の記録

裁定 `decision.md`(経路1 は軽で 1-A'、経路2 は重で 2-D')のとおりに実装した。実施日: 2026-11-11。番号は main(`f1916de`)の最大の次から振った。別の作業のブランチ wip-363 が使う IMPL-0469・0470 と衝突しない番号として IMPL-0472・0473 を選んだ。ADR は ADR-0120、EV は EV-0236。

## 1. 準拠テンプレート template/

### 変えたファイル

| ファイル | 変えたこと |
| --- | --- |
| `scripts/gate/config.mjs` | `nameConfirmationCount(config, id, decidedBy)` を置いた。数え方の関数(`confirmedNames`・`nameConfirmationState`)そのものに、この変化点の記録1件だけを渡して照らし、`other`・`self`・null を返す。`accountConfirmationCounts` も同じ形で `confirmedAccounts` に渡す。照合の記録を読む `laterSignerChecks(config)` を置いた |
| `scripts/init/generate-profile.mjs`(経路1) | `pendingNameConfirmations(before, after, { decidedBy })` は候補ごとに `explicit`(前の名簿に同じ氏名の確認の旨が無い)を持つ。記名者があり、明示でない確認が数えられなければ載せない(`droppedNameConfirmations`)。差分(`diffConfig` の第3引数)と変化点の記録 `thisRecord` を、同じ関数と同じ記名者から作る。明示した氏名の確認とアカウント名の確認が数えられなければ拒否する(既存の個別の拒否が出ていない場合に一般の規則として出す)。拒否の文は `uncountableConfirmationText`。載せなかった確認は `[注意]` で出す |
| 同上(経路2) | 記名者の記名で `other` として数える確認から `laterConfirmation`(この変化点の日付と記名者)を作る。既存の変更種別の登録者の照合(`changeTypeProblems` の `existingConfig`)と、`clampSeats` の既存の規則の成立(`existingRuleIds`。この変化点で追加・変更・承認していない規則)を、その確認を数えた後の構成で照らす。照合で通した既存の記録を確認の差分の行に列挙し、変化点の記録 `laterSignerCheck`(確認の id と記録の一覧)へ自動で載せる。D-0 の変化点の履歴(2つの表)に、作られた時点の確認でないことを出す。確認の変化点の外の既存の変更種別の拒否の文に、原因と本人以外が確認すれば通ることを足した(登録者が名簿の確認の旨のある人の場合に限る) |
| `scripts/gate/aggregate-evidence.mjs` | 保証の開示の項目1(名義の上書きの後)に、照合した既存の記録を区別して出す。組織の外への開示は件数だけ |
| `scripts/gate/test-name-confirmation-timing.mjs` | #434 の 12 件を足した(IMPL-0472:ok/ng、IMPL-0473:ok/ng の目印を含む) |
| `scripts/vendor/tailoring-kb.json` | `npm run template:kb` で再生成した(出所のコミットだけが変わった) |

- 準拠テンプレートのコミット: af5e62e(pit-in-template の main へ push 済み)。別のセッションが template の作業ツリーで #435 の変更を index に置いていたため、HEAD の版から別の worktree を作って本件の差分だけをコミットした。push の後、共有の作業ツリーの HEAD を af5e62e へ進め、別のセッションの index(2ファイル)を同じ内容のまま置き直した(作業ツリーは変えていない)
- `.github/workflows/` は変えていない。新しい試験は既存の `test-name-confirmation-timing.mjs` に足したため、一覧の変更は要らない

### 判断したこと(裁定の範囲の中の作業上の選択)

1. **明示した確認の判定**: 前の名簿に、同じ id・同じ氏名で `nameConfirmed: true` が無い確認を明示とした。氏名を変えた行の確認は新しい確認として明示に数える。アカウント名の確認は、差分が足したものだけを記録するため、すべて明示である
2. **記名者の無い変化点**: 名簿に既にある確認の旨を載せない扱いは、記名者がある変化点に限った。記名者の無い変化点は従来どおり「記名が要ります」で拒否する。記名者が無いことは「記名者が数えられない」に当たらず、裁定は記名者の無い変化点の扱いを変えていない
3. **拒否の文の重ね**: 既存の個別の拒否(記名なし・この変化点で足した人・`nameProblems`・確認待ちの本人(AR-5)・2名以上の本人の記名)が出たときは、一般の規則の文を重ねない。AR-5 の文は特例として原因を名指しする
4. **照合の対象**: 経路2 の照合の構成は、`recordSignerContext` に確認の記録を足した構成とした。確認待ち(AR-2・AR-4)の扱いは変えない。規則は、この変化点で追加・変更・承認したものを除く(承認を含む規則は、承認者の資格を前の構成で照らす既存の検査に任せる)
5. **列挙の範囲**: 差分と記録に列挙するのは、確認の前の構成では記名者の照合が通らず、確認を数えた後に通った既存の記録(変更種別の登録、委任の規則の決定・承認)だけとした。もともと通っていた記録(AR-4 の本人の記名の記録など)は列挙しない。委任の席は規則の行に席の名を書いて示した
6. **欄の持ち方**: `laterSignerCheck` は確認の id と記録の一覧だけを持つ。照合の日付と記名者は、その記録の `date` と `decidedBy` から読む(採らなかった案「同じ事実を2か所に持つ」と同じ理由)

## 2. 標準の本文

| ファイル | 変えたこと |
| --- | --- |
| `src/content/docs/phase4-process-design/gate-criteria.md` | G-6 のアカウント名の確認と氏名の確認の規定に「本人以外の確認が済んでいても、AI を示す語を含む氏名の人の記名は、AI の名義の記名に当たる。」を書いた。既存の記録の照合の箇条に、記録の無い確認を照合に使わないこと、本人以外の確認の変化点の照合(日付の照合、書き換えない、列挙と区別した開示、同じ変化点の記録と確認する人の資格には使わない)を足した。後で数えられない確認の箇条を新設し、AR-5 をその一例とした。IMPL-0266・IMPL-0446 の注記を改め、IMPL-0472・IMPL-0473 と EV-0236(見直し 2027-05)を付けた |
| `src/content/docs/adr/0120-uncountable-confirmations-and-later-signer-check.md` | 新設。決定1(経路1)、決定2(経路2)、決定3(根拠水準)、採らなかった案、影響。ADR-0111 決定6 との読みの関係をステータスの表に書いた |
| `src/content/docs/adr/0111-name-confirmation-in-same-change-point.md` | ステータスの節に、決定6 を ADR-0120 が補った旨を足した(決定の本文は変えていない) |
| `src/data/impl-inventory.yaml` | G-6 の登録に IMPL-0472・IMPL-0473 を足した |
| 台帳 | `evidence:write`・`impl:write` を実行した。`template:kb` を実行した |

## 3. 回帰の試験 scripts/regress/

| ファイル | 変えたこと |
| --- | --- |
| `suite/name-confirmation.mjs` | 経路1(1a・1g とその対照、1d)と経路2(2b・2f、否定の場面: 記名なしの変化点の拒否と案内、同じ変化点で追加した規則と変更種別の拒否)の 26 場面を足した(計 52 場面)。`fixes` は ADR-0120 決定1・決定2、ADR-0079 決定7、ADR-0111 決定6。#434 は Issue の写しに無いため `fixes` に入れていない |
| `expected/scenes/name-confirmation.txt` | `--write-scenes` で書き出した |

## 4. 確かめたこと

### 4.1 台本(`scratchpad/p434/probe-434.mjs`)

- 直した後(`out-new.txt`): 1a・1g は拒否(構成を書き換えない)、1f・1h は受け付け。2b・2f は確認の変化点で受け付け、規則・種別・委任の席を保つ。2g は拒否のまま。2a・2c・2d・2e は直す前と同じ
- 台本の 1c・1d は前提の変化点(確認の旨なしで AI を示す語の氏名を足す)が直す前から拒否されるため、1d は試験で別に組んだ(記録の無い旧い確認を模した Gemini)。台本の 2i は、2f の確認が通るようになったため手で足した記録が連鎖を壊す形になり、台本の作りの上で拒否になる(直す前の 2i と同じ到達点は試験の 2b・2f が確かめる)

### 4.2 直す前のコードで落ちること

- 試験: template の HEAD(`7d795e3`)の作業ツリーに新しい試験だけを置いて流した。#434 の 12 件のうち 8 件が NG(2b の3件、2b の記名なしの拒否と案内、2f、1a、1g、1d)。否定と対照の4件(同じ変化点で追加した規則・変更種別の拒否、1a の対照、1d の対照)は直す前も ok であり、拒否が残ることを固定している
- 回帰: WSL で HEAD の LF の clone を対象に name-confirmation を流し、#434 の 9 場面が落ちた(落ちた場面 9 / 52)

## 5. 採らなかった案・持ち越し

- 1-E(確認済みの AI を示す語の氏名の人の確認を数える)は、裁定のとおり扱っていない
- `/process-change` の accountable の手引き(`kinds/accountable.md`)は変えていない。ツールの拒否の文と注意が案内するため、裁定が求めていない
- survey 3.3 の「確認した人が名簿から外れると、その人の確認が数えられなくなる」は範囲の外のまま。既存の Issue へ寄せる候補

## 6. 試験の結果

- **test-name-confirmation-timing.mjs**: 40 件すべて通過(Windows、WSL の通常・TZ=UTC)。直す前のコードでは #434 の 8 件が NG(§4.2)
- **template の試験一式**(WSL。`/tmp/pc434/repo` に template の HEAD `7d795e3` を LF で clone し、本件の変更だけを当て、gate-g5.yml の `node scripts/gate/*.mjs` の手順 46 本を実行): 46 本すべて通過。Windows の `npm run test:template-suite` は `test-g5-aggregate.mjs` だけが CRLF で落ちる(既知。#376・#435 の記録と同じ)
- **WSL の回帰スイート**(`--kb keep`、`--template /tmp/pc434/repo`、作業の場所 `/tmp/pc434`): 通常と TZ=UTC の両方で全 25 本が通過(落ちた場面 0)。name-confirmation は 52 場面。直す前の template(HEAD の clone)では name-confirmation の #434 の 9 場面が落ちる(§4.2)
- **本体の `npm run check` の各段**(Windows で個別に実行。test:template-suite と test:regress は上のとおり): lint:refs が `fixes` の `#434`(Issue の写しに無い)を拒否したため、`fixes` から外して通過を確かめた。ほかの段はすべて通過
- **lint:text・lint:provisions・build**: 通過(build は 351 ページ)
- 作業の時点で、本体と template の作業ツリーに別のセッション(#435 の突合への対応)の未コミットの変更があった(`aggregate-evidence.mjs`・`test-tailoring-declaration.mjs`・`gate-criteria.md` の IMPL-0470・0471 の箇所・`tailoring-guide.md`・`research/435-deliberation/`)。試験は本件の変更だけを当てた clone で行い、コミットには本件の差分だけを入れた

## 7. 強制層の変更の承認

- 準拠テンプレートの `scripts/gate/**` と `scripts/init/**`(CI の検査と構成の経路)を変えたため、AI維持管理者の承認を要する(テンプレートの CLAUDE.md「受信箱とラベル」)。承認待ちとして記録する
- 承認者: (空欄。AI維持管理者が記名する)
- 承認日: (空欄)
- `.github/workflows/` は変えていない

## 8. 独立の突合への対応

入力: `crosscheck.md`(F-1〜F-8。高は無し)。本体は 48492a8 と、その上の #435 のコミット 00bd726 の上に積んだ。template は 1ba707e(#435)の上に積んだ。

| 指摘 | 対応 | 変えたファイル |
| --- | --- | --- |
| F-1(中) | 「記録の無い確認は、既存の記録の照合に使わない」を、決定2 の照合の根拠に範囲を限る文へ改めた。1名の名簿と確認待ちでの記録の無い確認の扱いは変えない旨を同じ文に書いた | `gate-criteria.md` G-6、ADR-0120 決定2 |
| F-2 | G-6 の「照らし直さないことの例外として」を、ADR-0120 の読み(照らし直しの禁止は効力を落とす向きを止める規定で、決定2 の照合を妨げない)へ揃えた。ADR-0120 のステータスの表にも「例外ではなく範囲の外」と書き、G-6 も同じ読みであると書いた | `gate-criteria.md`、ADR-0120 |
| F-3 | 2g(確認と同じ変化点で、確認する人が変更種別を登録し直す)と、確認の外で旧い確認の本人が記名する無関係の変化点(X3)を、否定の場面として試験と回帰に足した | `test-name-confirmation-timing.mjs`、`suite/name-confirmation.mjs`、`expected/scenes/name-confirmation.txt` |
| F-4 | 変更種別の拒否の文だけに付けていた案内をやめ、確認の変化点の外で、氏名の確認に本人以外の記録の無い人が拒否の原因に含まれるとき、拒否の末尾に1回まとめて案内を出す形にした(`unconfirmedSignerHint`)。既存の規則の成立が同じ原因で落ちる場合(席の引き下げ)も `[案内]` で出す | `generate-profile.mjs`、IMPL-0473 の注記 |
| F-5 | 注意の文に「この変化点は、X の氏名の確認として記録されません(確認するつもりで記名した場合も同じ)」と、確認待ちが残り欠落として扱い続けることを足した。G-6 と ADR-0120 決定1 に、確認するつもりの記名でも記録されない境界を書いた。確認の対象を明示する入力は、入力の形を変える決定で裁定の範囲の外のため、ADR の採らなかった案に「後の審議に残す」として記録し、見直しの契機に挙げた | `generate-profile.mjs`、`gate-criteria.md`、ADR-0120、IMPL-0472 の注記 |
| F-6 | ADR-0120 に「見直しの契機」の節を足した(EV-0236 の差し替え条件、F-5 の事象、期限) | ADR-0120 |
| F-7 | ADR-0111 のステータスの追記に「補足(2026-11-11):」を前置きした | ADR-0111 |
| F-8 | ADR-0120 のステータスに、強制層の変更が AI維持管理者の承認待ちであること、承認の記録の置き場(本書 §7)を書いた | ADR-0120 |

- 台帳は `impl:write`・`evidence:write` で再生成した
- 準拠テンプレートのコミット: 8591464(pit-in-template の main へ push 済み)。submodule の参照を進めた
- 試験の結果: test-name-confirmation-timing.mjs は 42 件すべて通過(Windows、WSL の通常・TZ=UTC)。template の試験一式(WSL、HEAD 1ba707e の LF の clone に本件の差分を当てて 46 本)はすべて通過。Windows の test:template-suite は test-g5-aggregate.mjs だけが CRLF で落ちる(既知)。WSL の回帰スイートは通常と TZ=UTC の両方で全本が通過し、name-confirmation は 54 場面。本体の npm run check の各段(test:template-suite・test:regress を除き Windows で個別に実行)、lint:text・lint:provisions・build はすべて通過
