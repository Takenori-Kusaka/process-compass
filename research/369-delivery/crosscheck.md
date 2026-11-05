# #369 の独立の突合

- 突合の日: 2026-11-06
- 対象: 本体 `9064577`、準拠テンプレート `ab4cf21`
- 読んだもの: Issue #369 の本文と #371 からの申し送り、第5章 5.8.6 の要求事項7 と IMPL-0333・IMPL-0464 の印、ADR-0115(決定8 ほか)、附属書H H.4 の表(assurance-case.md 326・337 行)、実装マークの書式(implementation-marking.md)、2つの差分
- 読んでいないもの: `research/369-delivery/implementation.md` と実装した側の説明(入力の分離)
- 実行したもの: `node scripts/gate/test-base-judge-workflow.mjs`(テンプレート、50/50 が期待どおり)、独自の変異 26 件(下記 4)、ai-review.yml を消した写しでの試験の実行(下記 F-1)。本体の `npm run lint:impl` は手元に `yaml` の依存が無く動かせなかった(未確認)

## 結論の要約

申し送りの条件(read だけ・書き込みの分離・題名と本文の非展開・PR のコードを checkout しない・AI を承認にも合否にもしない)は、出荷された ai-review.yml の定義の上では満たしています。指示を既定ブランチの作業ツリーから読む形も成り立っています。CONTROL_FILES への追加は、附属書H H.4 条件3 が「保護の設定の変更に AI維持管理者の承認を要すること」を求めているため、要求事項から導かれる判断であり、妥当です。

一方で、次の3点は直してから delivered を確定させるべきです。

1. **採用者の gate-g5 が落ちる経路がある**(F-1、重大度: 高)
2. **静的な試験は否定のリストで、PR の先頭の指示・コードを読む別の書き方と、題名・本文を読む別の経路を検出しない**(F-2、重大度: 中)。check=machine の名乗りは出荷された定義の形を固定するまでで、規定の違反一般を捉えるものではありません
3. **フォークからの PR で、秘密情報に届くジョブがプロンプトの注入にさらされる状態が既定である**(F-3、重大度: 中〜高)。IMPL-0464 へ分けたのは確認の部分であり、既定の振る舞いの選択は残っています

## 指摘

### F-1 aiReview を無効にした採用者で gate-g5 が落ちる(重大度: 高)

- **所在**: テンプレート `scripts/gate/test-base-judge-workflow.mjs`(`const ar = read('.github/workflows/ai-review.yml')` と `.github/ai-review/instructions.md` の実在の check)、`.claude/skills/process-init/SKILL.md` 177 行(「`aiReview.enabled === false` → `.github/workflows/ai-review.yml` を削除する」)、`.github/workflows/gate-g5.yml` 103 行(この試験を合否に使うジョブから実行)
- **根拠**: テンプレートを一時の場所へ写し、ai-review.yml だけを消して試験を動かすと、`ENOENT` で終了コード 1 になりました。/process-init の手順どおりに AI レビューを無効にした案件では、gate-g5 が常に落ちます。gate-g5-base.yml・record-copy.yml の試験と違い、ai-review.yml は構成によって削除される前提のファイルです
- **直し方の向き**: 次のどちらかに揃える。(a) 構成の `aiReview.enabled` が false で ai-review.yml が無い場合は、IMPL-0333 の check を「対象外」として飛ばし、件数を表示する(飛ばした事実を出す)。(b) /process-init の後片付けを「削除しない(enabled を false にするだけ)」へ改める。どちらの場合も、無効の案件で試験が通ることを試験の場面として足す。`.github/ai-review/instructions.md` の扱い(無効のときに残すか消すか)も同時に決める

### F-2 静的な試験の検出の範囲が、変異の 18 件の形に寄っている(重大度: 中)

- **所在**: テンプレート `scripts/gate/base-judge.mjs` の `aiReviewWorkflowProblems`
- **根拠**: 独自の変異を入れて確かめた結果、次は検出しませんでした(`C:/Users/kokor/AppData/Local/Temp/claude/E--Github-process-compass/770ecf3d-4ce9-4896-b267-c7e0a80da58f/scratchpad/mut/m.mjs` で実行。リポジトリの外)

  | 変異 | 結果 | 規定との関係 |
  | --- | --- | --- |
  | `git show FETCH_HEAD:.github/ai-review/instructions.md` で PR の先頭の指示を読む | 見逃し | 要求事項7 の違反そのもの |
  | `F=.github/ai-review/instructions.md` の後に `git show refs/remotes/pr/head:$F` | 見逃し | 同上(1行の中で置き場と参照の両方を求める判定のため) |
  | `git show refs/remotes/pr/head:CLAUDE.md`(`.claude/` の外の指示) | 見逃し | 同上 |
  | `AI_REVIEW_INSTRUCTIONS: .github/ai-review/../../../tmp/x.md` | 見逃し | 置き場の前方一致だけを見ている |
  | `git -c ... checkout refs/remotes/pr/head`、`git read-tree -u --reset`、`git archive ... \| tar -x` | 見逃し | PR のコードを作業ツリーへ展開する。`git\s+(checkout\|...)` の形だけを見ている |
  | actions/checkout に `repository: ${{ github.event.pull_request.head.repo.full_name }}` を足す(ref は既定ブランチのまま) | 見逃し | フォークの既定ブランチ=変更の側の内容を checkout する。pull_request_target で最も典型的な誤り |
  | PR の先頭のスクリプトを `git show` で書き出して `node` で実行 | 見逃し | PR のコードの実行 |
  | `${{ toJSON(github.event.pull_request) }}`、`github.event.pull_request['title']` | 見逃し | 題名・本文を渡す |
  | `jq .pull_request.body "$GITHUB_EVENT_PATH"`、`gh pr view --json title,body` | 見逃し | 同上。AI の道具の多くは PR の本文を自ら API で読む |
  | `actions/download-artifact` で AI の出力を書き込みのジョブへ渡す | 見逃し | 書き込みのジョブへ PR の内容に依る入力を渡す |
  | `${{ toJSON(secrets) }}` を環境変数へ | 見逃し | 秘密情報の一括の受け渡し |

  検出した側の変異(`needs.*.outputs.findings`、書き込みのジョブの `contents: write`、`id-token: write`、名前の変更、permissions の削除など)は期待どおりでした。試験の 18 件は、出荷された定義から1か所を書き換えた形に限られており、上の書き方はどれも 18 件の外です
- **影響**: この試験は採用者の gate-g5 で採用者の ai-review.yml に掛かります(gate-g5.yml 103 行)。採用者が差し込み口へ足す手順は自由記述のため、検出の範囲の外の書き方で要求事項7 と申し送りの条件を破っても、IMPL-0333 の「機械が確かめる」は通ります。一方で `npm ci`・`uses: ./` は、作業ツリーが既定ブランチである以上 PR のコードの実行にならないのに拒みます(誤検出の側。採用者が AI の道具を npm で入れると落ちる)
- **直し方の向き**: 否定のリストを足し続けるより、AI レビューのジョブの手順を許可のリストで固定する形を検討する(既定の手順の4つ + 差し込みの手順1つ。差し込みの手順の `run:` の中で `refs/remotes/pr/head`・`FETCH_HEAD`・`GITHUB_EVENT_PATH`・`gh pr view`・`gh api`・`toJSON(` を拒む)。最低限、上の表の行を変異として足し、`checkout` の `repository:` を拒む。実装マークの note は「出荷した定義の形と、列挙した変異の書き方を検出する。別の書き方で指示を PR の先頭から読むことは検出しない」と範囲を明記する。`npm ci`・`uses: ./` の拒否は、作業ツリーが既定ブランチであることを根拠に外すか、外さない理由(採用者が後で checkout を替えた場合の保険など)を注記する

### F-3 フォークからの PR で、AI レビューのジョブが秘密情報に届く状態が既定である(重大度: 中〜高)

- **所在**: テンプレート `.github/workflows/ai-review.yml` の `on: pull_request_target` と `ai-review` ジョブの `if:`
- **根拠**: 変更の前は `pull_request` で、フォークからの PR では秘密情報が渡りませんでした。変更の後は、フォークからの PR でも既定ブランチの文脈で動き、差し込み口の手順の env から秘密情報(モデルの API の鍵)に届きます。注入への備えは「道具を与えない」「出力を実行しない」という注記に依っており、差し込む実装を機械は確かめません(F-2)。IMPL-0464 は「確かめていない」ことを記録しますが、確かめるまでの既定の振る舞いを選んでいません。#371 の申し送りは、pull_request_target の秘密情報への到達を危険として名指しています
- **直し方の向き**: IMPL-0464 が実機で確かめられるまで、既定では同じリポジトリからの PR に限る(`github.event.pull_request.head.repo.full_name == github.repository`)か、フォークからの PR では差し込み口の手順を飛ばして定型の文だけを書く。外部の貢献を受ける案件が外す場合の条件(ラベルによる保守者の承認など)を注記する。採らない場合は、採らない理由と残る経路を保証の開示か注記に明記する

### F-4 指示の置き場が `.github/ai-review/` の1か所に限られ、自動で読み込まれる指示ファイルの2段の経路が残る(重大度: 中)

- **所在**: `check-pr.mjs` の CONTROL_FILES、`ai-review.yml` の差し込み口の注記、IMPL-0253 の note(「自動で読み込まれる指示ファイル」)
- **根拠**: Issue #369 の背景は「指示は `.claude/**` にある」としています。AI レビューの道具の多くは、作業ツリーの `CLAUDE.md`・`AGENTS.md`・`.claude/agents/**`・`.claude/skills/**` を自動で読み込みます。作業ツリーが既定ブランチであるため「その PR 自身のレビュー」は守られます。しかし、これらは CONTROL_FILES に入っていません(`.claude/settings.json`・`guard.json`・`hooks/**` だけ)。実装が CONTROL_FILES への追加の理由として挙げた「指示を弱める PR を先に取り込む2段の経路」が、これらのファイルについては残ります。附属書H H.4 条件3(337 行)は、検証側の指示の置き場の保護の設定とその変更の承認を求めています
- **直し方の向き**: 差し込み口の注記に「自動で読み込まれる指示ファイルを持つ道具は、その読み込みを止めるか、読み込むファイルを CONTROL_FILES へ足す」を置く。あるいは、テンプレートが同梱する道具の想定(Claude Code など)について、自動で読む範囲を CONTROL_FILES へ足すかを決め、足さない場合は採らない理由を書く

### F-5 採用者の移行の手順が無い(重大度: 中)

- **所在**: テンプレート `README.md`(「process-compass #NNN の更新を取り込むとき」の節に #369 が無い)
- **根拠**: 次の4点は、更新を取り込む採用者の作業か、黙って起きる振る舞いの変化です
  1. 差し込み口に「PR へコメントする」実装を置いていた案件は、ジョブの権限が read になるため、コメントが 403 で失敗します。手順は `continue-on-error` なので、**失敗が表に出ずに指摘が消えます**。新しい出し先(ジョブの要約)への移し替えと、PR へ指摘を出したい場合に申し送りの条件を守る形(例: AI の出力を書き込みのジョブへ渡さないまま出す方法が無いなら、出さないと決めること)の説明が要ります
  2. pull_request_target は既定ブランチの定義で動くため、更新を取り込む PR そのものには新しい定義が効きません。取り込みの PR は ai-review.yml と `.github/ai-review/**` を変える統制の設定の変更として、AI維持管理者の承認を要します
  3. 既定ブランチに `.github/ai-review/instructions.md` が無いあいだは、AI レビューを実行しません(notice だけ)。従来のプロンプトの置き場から移す作業が要ります
  4. F-1 の、AI レビューを無効にした案件での gate-g5 の失敗
- **直し方の向き**: README の更新の節に「process-compass #369 の更新を取り込むとき」を足し、上の4点を書く。1 については、AI の指摘を PR のコメントへ出さないと決めたことと理由(書き込みのジョブへ AI の出力を渡さない)を、採らなかった案として明記する

### F-6 IMPL-0464 の issue=361 の先に、フォークからの PR の確認が書かれていない(重大度: 低)

- **所在**: human-ai-boundary.md 1099 行の IMPL-0464、Issue #361 の本文とコメント
- **根拠**: #361 は「node・python・go への持ち込みの検証と G-8 の実環境の読み取り」で、本文にもコメントにも、フォークからの PR・IMPL-0464・IMPL-0460 の記載がありません。issue= は書式としては正しいものの、Issue の担当者が受け入れ条件として認識する経路がありません(IMPL-0460 も同じ状態)
- **直し方の向き**: #361 へコメントで、IMPL-0460・IMPL-0464 の確かめる事項(所有者と別のアカウントによるフォークからの PR)を受け入れ条件として足す。範囲が合わないなら専用の Issue を起こして issue= を改める

### F-7 IMPL-0333 の印の書式(重大度: 指摘なし。確認のみ)

- `state=delivered check=machine test=template/scripts/gate/test-base-judge-workflow.mjs` で、`plan`・`issue`・`review` を持たない。implementation-marking.md の表(52〜55 行)と `machine` の3要件(`:ok`・`:ng` が別の行、gate-g5 の run: から実行)に合っています
- Issue #369 の受け入れ条件「issue=316 をこの Issue の番号へ改める」は、この差分の前に既に 369 へ改められていました。delivered で issue= は外れるため、条件は満たされた扱いでよい
- target を `pr-checks` から `ai-review-workflow` へ移したのは、実装の所在に合っています。impl-inventory.yaml の要求事項7 の行へ IMPL-0464 を足したのも整合しています
- 注意: ADR-0101(63 行)は「IMPL-0333 は降りていない(#369)」と書いています。採用済みの ADR は書き換えない規約のため、そのままでよいものの、台帳と食い違う記述が残ることを認識しておく

### F-8 IMPL-0333 の check=machine の根拠の強さ(重大度: 低)

- **所在**: IMPL-0333 の note(「ai-review.yml そのものは実機で動かしていない」)
- **根拠**: 実機の振る舞いを gate-g5-base.yml の確認(F-1a・F-1b・E-15)から類推しています。開示されているため誤りではありません。ただし、ai-review.yml には gate-g5-base.yml に無い要素(2つのジョブと needs、ジョブの outputs、`gh pr comment` の書き込みのジョブ)があり、これらの実機の振る舞い(pull_request_target で書き込みのジョブの token が pull-requests: write を得るか)は類推の外です
- **直し方の向き**: 根拠水準のマーク(ADR-0026)で「ai-review.yml の2つのジョブの実機の振る舞いは未確認」と開示するか、IMPL-0464 の確かめる事項へ同じリポジトリの PR での書き込みのジョブの動作も足す

### F-9 構成の `aiReview.enabled` を切る変更の承認(重大度: 低。判断の材料)

- **所在**: `ai-review.yml` の「有効かどうかを確認する」、`controlTouchedOf` の process.config.json の鍵(ci・task・guard)
- **根拠**: CONTROL_FILES へ指示の置き場を足した理由(2段の経路)は、`aiReview.enabled` を false にする PR にも当てはまります。AI レビューの採否は採用者の選択であるため、承認を要しないことにも理由はあります
- **直し方の向き**: 承認を要するとするか、要しないと決めた旨を注記する(「書かれていない」と「課さないと決めた」を区別する)

### F-10 ジョブの要約へ書く AI の出力(重大度: 低)

- **所在**: 差し込み口の注記(「出力は … ジョブの要約(GITHUB_STEP_SUMMARY)へ書きます」)
- **根拠**: 差分の中の文に誘導された出力が、要約の Markdown として表示されます(偽の「承認」の表示、外部へのリンク)。書き込みの権限は要らないため申し送りの条件には反しませんが、人の読み手を誤らせる経路として残ります
- **直し方の向き**: 要約へ書く前にコードブロックへ入れる、などの扱いを注記に置く。採らないなら残る経路として書く

## 確かめた項目への答え

| # | 確かめること | 判断 |
| --- | --- | --- |
| 1 | 申し送りの条件 | 出荷された定義では満たす。read だけ(トップと ai-review ジョブ)、書き込みは `ai-review-notice` に分離し、入力は PR の番号(イベントから直接)と enabled(既定ブランチの構成)だけ。題名・本文は run: へ展開しない(BASE_REF・PR_NUMBER も env 経由)。PR のコードは checkout せず fetch と `git diff --no-ext-diff --no-textconv` だけ。承認・commit status を出さず、continue-on-error、ルールセットの必須に入れない。ただし採用者が差し込む手順について機械が守らせる範囲は狭い(F-2)、フォークの既定の扱い(F-3) |
| 2 | 指示を既定ブランチの版から読むか | 読む。checkout の ref が `github.event.repository.default_branch`、`AI_REVIEW_INSTRUCTIONS` は作業ツリーの相対パス。PR が既定ブランチ以外を基底とする場合も既定ブランチの指示を使う(基底ブランチより保護が強い側に寄せており、要求事項7 の「書き換えられない場所」に合う) |
| 3 | CONTROL_FILES の追加 | 妥当。附属書H H.4 条件3 の判定の中身(337 行)が保護の設定の変更に AI維持管理者の承認を求めており、要求事項から導かれる。試験も `controlTouchedOf` で確かめている。残る範囲は F-4・F-9 |
| 4 | 変異 18 件 | 18 件はすべて検出し、出荷された定義の適合も通る。ただし独自の 26 件のうち、規定の違反に当たる 15 件を見逃した(F-2) |
| 5 | 印の書式と issue= | 書式は適合(F-7)。IMPL-0464 の issue=361 は Issue 側に受け皿が無い(F-6) |
| 6 | 採用者への影響 | README の箇条は更新されたが、移行の節が無く、PR へコメントしていた実装が黙って失敗する(F-5)。無効の案件で gate-g5 が落ちる(F-1) |
| 7 | 文体と base パス | 差分の本文・README の箇条・instructions.md に、である調/ですます調の混在と base パスの誤りは見当たらない(差分の中に内部リンクは無い)。textlint は実行していない |
