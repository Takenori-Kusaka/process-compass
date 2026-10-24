---
title: 非割込型メッセージボックス（Label Mailbox）
description: 席の間の引き渡しを、GitHub のラベルを状態として使う非同期の受信箱で行う実装の手引き。要求事項の正本は第3章 3.5.5
sidebar:
  order: 4
---

本ページは参考(手引き)です。受信箱のラベルによる引き渡しの要求事項の正本は、[第3章 3.5.5](/process-compass/phase4-process-design/roles-responsibilities/)「受信箱のラベルによる引き渡し」です。ラベルの語彙、状態の遷移、統制の弱化を検知したときの引き渡しも、同節にあります。エスカレーションの段階とラベルの対応は[第7章 7.6](/process-compass/phase4-process-design/exception-escalation/)、受信箱の確認を自分のロールに限ることは[第3章 3.5.3](/process-compass/phase4-process-design/roles-responsibilities/)によります。本ページは、GitHub の上での実装の形を示します。適合の条件には数えません([第1章 1.8](/process-compass/phase4-process-design/overview/))。

## 設計の背景: 割り込み崩壊の防止

ピットイン方式では、兼務禁止の統制のため、ロールごとに作業領域(クローン)を分けて稼働させます([第3章 3.5.1](/process-compass/phase4-process-design/roles-responsibilities/))。このとき、ロール間で直接通信したり、相手のセッションへ依頼を割り込ませたりすると、次の不具合(**割り込み崩壊**)が構造的に起きます。

- **文脈の強制切り替えと、未完了のタスクの滞留**: 実行中のタスクが未完了のまま別のタスクが差し込まれると、AIエージェントの文脈(短期記憶)が上書きされ、元のタスクが止まるか破棄される
- **やり取りの暴走**: 文脈を分けたエージェント同士が、人やゲートの検証を経ずに直接指摘しあうと、修正と再指摘の往復が続き、実行の費用を浪費する
- **人による転記の中継**: 連携が口頭やチャットに退化すると、人がエージェントの発言を転記して仲介することになり、人が律速になる

本ページの実装は、新しい同期の通信基盤を作らず、すでに開発の一部である **GitHub を状態の置き場**として扱い、各席が非同期のポーリングで自分の仕事を拾う形です。

## 実装の方針

- **GitHub の標準の機能を優先する**。承認の依頼などの行為は、GitHub の reviewer request を使う。ラベルは二重管理を避け、状態を表すことに特化する
- **ラベルは状態であって、結果の保証ではない**。判定者が事実を自ら確かめることは、第3章 3.5.5 の要求事項8 による
- **語彙を必要最小限に抑える**。伝える経路が明確である限り、ラベルを増やさない。伝える経路そのものが無いと分かった場合は、価値責任者へ渡して語彙の追加を検討する(第3章 3.5.5「統制の弱化を検知したときの引き渡し」の既定と同じ経路)
- 取り消せない操作の定義は、[第5章 5.5.1](/process-compass/phase4-process-design/human-ai-boundary/)による。一覧は例示であり、網羅ではない([ADR-0041](/process-compass/adr/0041-scope-is-not-exhaustive/))

## 孤児の検出

ラベル運用で最も見つけにくい失敗は、どの受信箱にも入っていない、状態ラベルの無い Issue・PR(孤児、orphan)です。各セッションからは「自分の受信箱は空」と報告されるため、作業が止まっていても異常が検知されません。孤児を検出して再配分するのは、価値責任者の務めです(第3章 3.5.5 の要求事項7)。セッションの起動時や定期のポーリングの時に、次のコマンドで検出する形を示します。

### 孤児の定義の例
`state:*` ラベルが1つも設定されていない `open` 状態の Issues/PRs のうち、以下のいずれでもないもの。
- 開発着手順待ちを明示的に示す `status:on-hold` ラベルが付与されている
- 着手単位ではない大元のまとまりを示す `epic` ラベルが付与されている
- 開発者自身が実装途中で、まだ引き渡していない `Draft` 状態のプルリクエスト

```bash
# orphan（孤児）となって浮いている Issues を検出する
gh issue list --state open --limit 100 --json number,title,labels \
  --jq '.[]|select([.labels[].name]|map(select(startswith("state:") or .=="status:on-hold" or .=="epic"))|length==0)|"ORPHAN ISSUE #\(.number) \(.title)"'

# orphan となって浮いている PRs を検出する
gh pr list --state open --limit 50 --json number,title,labels \
  --jq '.[]|select([.labels[].name]|map(select(startswith("state:") or .=="status:on-hold" or .=="epic"))|length==0)|"ORPHAN PR #\(.number) \(.title)"'
```

## ロール別のポーリングのコマンド

各セッションは、起動時と定期実行時に、次のコマンドで自分の受信箱から仕事を拾います。対象は自分のロールを指すラベルに限ります([第3章 3.5.3](/process-compass/phase4-process-design/roles-responsibilities/))。技術判断者が開発者のレーンを共有する体制では、セッションを分けてポーリングします。

### 開発者（Dev）の受信箱
```bash
# 1. 自分あての新規着手タスク
gh issue list --label "state:needs-dev" --state open
gh pr list --label "state:needs-dev" --state open

# 2. 差し戻しされたタスク（対応を優先）
gh pr list --label "state:qm-blocked" --state open

# 3. 独立レビュア（Fix Agent等）から自分へのレビュー依頼
gh pr list --search "review-requested:@me is:open"
```

### 独立レビュア（Review）の受信箱
```bash
# 1. 開発者から実装完了で引き渡されたレビュー対象（G-6）
gh pr list --label "state:dev-done" --state open
```

### 出荷判定者（Ship）の受信箱
```bash
# 1. 独立レビュー（G-6）の判定記録が作成され、マージを待つ状態
gh pr list --label "state:ready-to-merge" --state open

# 2. G-6 が省略・未達の構成に限る: 開発者の実装が完了した状態（独立レビュアの受信箱が無いため）
gh pr list --label "state:dev-done" --state open
```

出荷判定（G-7）は、出荷の範囲ごとに行います。上のポーリングでは起動しません。2 は G-6 が有効な構成では実行しません（[第3章 3.5.5](/process-compass/phase4-process-design/roles-responsibilities/)）。

### 価値責任者（PO）の受信箱
```bash
# 1. PO判断待ちの要件・仕様・優先順位変更
gh issue list --label "state:needs-po" --state open
gh pr list --label "state:needs-po" --state open

```

### 事業決裁者（Owner）の受信箱
```bash
# 1. 取り消せない操作などの決裁・追認待ち
gh issue list --label "state:needs-owner" --state open
gh pr list --label "state:needs-owner" --state open
```

### 監査担当（Audit）の受信箱
```bash
# 1. 統合監査、またはリリース承認依頼
gh issue list --label "state:needs-audit" --state open
gh pr list --label "state:needs-audit" --state open
gh pr list --base main --state open
```

### AI維持管理（Platform）の受信箱
```bash
# 1. 検査・テスト装置の改修、追加、削除の依頼
gh issue list --label "state:needs-platform" --state open
gh pr list --label "state:needs-platform" --state open
```

### 技術判断者の受信箱
```bash
# 1. 技術設計判断（G-3）待ちの案件
gh issue list --label "state:needs-tech" --state open
gh pr list --label "state:needs-tech" --state open
```

## 経路の生存確認の例

受信箱が空であることは、「仕事が無いこと」ではなく、「渡す経路が壊れていること」(ラベルの貼り忘れによる孤児など)を示す場合があります。全ロールで「受信箱が空」の報告が続いたときに、価値責任者が次の生存確認を行う運用を勧めます。本標準は、生存確認の契機(回数)と手順を課しません。契機の回数を定める根拠が無いためです。

1. 孤児の再検出。上の「孤児の検出」のコマンドを実行し、見つかった Issue・PR に状態ラベルを付けて再配分する
2. 各ロールの受信箱の残件の確認。全ラベルを数え、特定の受信箱で滞留していないかを確かめる
3. 活動の履歴の確認。直近のコミットとマージした PR を見て、エージェントが異常終了したまま止まっていないかを確かめる

```bash
# 全受信箱の残件数を一括取得する
for l in needs-dev dev-done qm-blocked ready-to-merge needs-audit needs-platform needs-po needs-tech needs-owner; do
  printf "%s: " "$l"
  echo "issue=$(gh issue list --label "state:$l" --state open --json number --jq 'length') pr=$(gh pr list --label "state:$l" --state open --json number --jq 'length')"
done
```

## 関連するページ

- [第3章 3.5.5](/process-compass/phase4-process-design/roles-responsibilities/) — 受信箱のラベルによる引き渡し(要求事項の正本)
- [第7章 7.6](/process-compass/phase4-process-design/exception-escalation/) — エスカレーションの段階とラベルの対応
- [第4章 判定の成立](/process-compass/phase4-process-design/gate-criteria/) — 判定記録とラベルの遷移の順序
