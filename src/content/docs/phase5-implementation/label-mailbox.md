---
title: 非割込型メッセージボックス（Label Mailbox）
description: 複数エージェント開発環境において、無限割込ループやコンテキストスイッチ, 中継コストを排除するためのGitHubラベルをメッセージバスとした非同期メールボックスの公式QMS標準
sidebar:
  order: 4
---

本章は、ロール間で物理的に分離されたディレクトリ（クローン）を稼働させる際に、エージェント間および人間との協働を非同期に繋ぐ **「非割込型メッセージボックス（Label Mailbox）」** の仕様を規定する。

---

## 4.1 設計背景: 割り込み崩壊（外部割込競合）の防止

ピットイン方式では、作成指示者（PO/Dev）と独立レビュア（QM/Audit）などの兼務禁止統制を徹底するため、ディレクトリ（クローン）を物理的に分割（[第3章 3.5.1](/process-compass/phase4-process-design/roles-responsibilities/)）して稼働させる。

このとき、ロール間で直接通信をしたり、相手のセッションに直接リクエストを割り込ませたりすると、次の重大なシステム不具合（**割り込み崩壊**）が構造的に発生する。

- **コンテキストの強制切り替えと未完了タスクの滞留**: 実行中のタスクが未完了のまま別の割り込みタスクが差し込まれると、AIエージェントのコンテキスト（短期記憶）が上書きされ、元のタスクがデッドロックするか破棄される（マイコンにおける外部割り込み競合によるメイン処理崩壊と同 class の不具合）。
- **やり取りの無限ループ**: 独立したエージェント同士が、人間や不揮発性ゲートの検証を経ずに直接エラーを指摘しあうと、修正と再指摘の無限後退（無限ループ）に陥り、APIトークンを浪費し続ける。
- **人間によるコピー＆ペースト中継コスト**: 連携が口頭やチャットに退化すると、人間がエージェントの発言を手動でコピーして仲介せざるを得なくなり、人間がボトルネックとなって自律性が崩壊する。

**解決策**: 新しい同期通信基盤を開発するのではなく、すでに開発プロセスの一部となっている **GitHub を「不揮発性メッセージバス（状態マシン）」** として扱い、**非同期・排他的なポーリング方式（polling-based）** で各自の仕事を拾いに行く「Label Mailbox」を規定する。

---

## 4.2 設計原則

1. **GitHub標準モデルを優先する**:
   approveの依頼などの「行為」はGitHub標準の **reviewer request** を使用する。ラベルは二重管理を避け、「状態（state）」を表すことに特化する。
2. **ラベルは状態であって結果（実測）の保証ではない**:
   `state:ready-to-merge` が付与されていても、判定者は必ず CI が実際に緑（全件パス）であるかなどの機械的実測を検証する。ラベルは環境の事実を代替しない。
3. **付与した側がその意味に責任を持つ**:
   自身のレーンから次のレーンへ成果物を引き渡す際、**引き渡す側が次のロール用のラベルを付与**する。自分のレーンに仕事を残したまま、相手を指すラベルを設定してはならない。
4. **不可逆4操作はオーナー（価値責任者）へエスカレーションする**:
   - 削除（検証ゲート、ガード, 重要テストの削除を含む）
   - 本番環境へのデプロイ
   - 課金（クラウドや外部API）が発生する書き込み
   - データベース・スキーマ変更
   これら「不可逆4操作」が発生する場合は自律実行を停止し、オーナー/POへのエスカレーションラベルを付与する。
5. **語彙を必要最小限に抑える**:
   伝達する経路（チャンネル）が明確である限りラベルを増やさない。ただし、伝える経路そのものが存在しない「伝達の欠落」がある場合は、速やかに公式語彙を追加する（4.6節参照）。

---

## 4.3 label 語彙（標準8種）

プロジェクトのリポジトリには、以下の8つの `state:*` ラベルを定義する。

| ラベル（label） | 意味 | 付与するロール | 次に動くロール |
|---|---|---|---|
| `state:needs-dev` | POまたはQMが、開発者（Dev）に着手を引き渡した状態 | PO / QM | **Dev**（開発者） |
| `state:dev-done` | 開発者が実装・単体テスト（CI緑）を完了し、Ready化した状態 | Dev | **QM**（出荷判定者） |
| `state:qm-blocked` | QMが検証で、BLOCK 3類型（実害/証跡の不真正/不可逆）を検出し、Devへ差し戻した状態 | QM | **Dev**（開発者） |
| `state:ready-to-merge`| QMが独立レビューを完了し、マージを承認した状態 | QM | **QM**（マージ実行担当） |
| `state:needs-audit` | 統合監査またはリリースカットの検証を監査チームに依頼した状態 | PO | **監査**（Auditor） |
| `state:needs-platform`| テスト装置・リント・CI/CD等の削減・自動生成・統合を依頼した状態 | PO / Dev / QM | **Platform**（AI維持管理） |
| `state:needs-po` | 不可逆4操作に当たらないが、仕様・優先度・語彙の改訂等のPO判断を要する状態 | 誰でも | **PO**（価値責任者） |
| `state:needs-owner` | 不可逆4操作に該当する判断・承認を要する状態 | 誰でも | **オーナー**（事業決裁者） |

- `state:needs-po` / `state:needs-owner` は、誰が気付いても付与してよい。Devの実装中に判断が必要になった場合もこれらを付与する。
- **相手を指すラベルがない口頭やメンションでの判断依頼を禁止する。** 伝達経路に現れないため、エージェントや人間の双方で見落とすこととなる。

---

## 4.3.1 状態遷移表（復路の完全定義）

ラベル運用における典型的な失敗モードは、「受領側が対応を終えた際、ラベルを元のままにするか、または外しただけにして次の担当の受信箱に現れず、作業が滞留する」現象を指す。受け取った側は、対応を終えたら必ず次の状態へ明示的に遷移させなければならない。

| 現在の状態（State） | 役割 | 遷移の条件・契機 | **遷移先の状態（Next State）** |
|---|---|---|---|
| `state:needs-dev` | Dev | 実装完了・単体テストCI全緑・PRのReady化 | **`state:dev-done`** |
| `state:needs-dev` | Dev | 実装中に仕様や技術のPO判断が必要と判明 | `state:needs-po` または `state:needs-owner` |
| `state:dev-done` | QM | レビューにおいてBLOCK 3類型を検出（差し戻し） | **`state:qm-blocked`** |
| `state:dev-done` | QM | 独立レビュー承認（Approve） | **`state:ready-to-merge`** |
| **`state:qm-blocked`**| **Dev** | **差し戻し対応が完了し、CIが全緑（復路）** | **`state:dev-done`** （※ここをDevに戻すのが極めて重要） |
| `state:ready-to-merge`| QM | マージを実行（Squash & Merge） | （PR close。ラベルは剥がさず残してよい） |
| `state:needs-po` | PO | 意思決定を下し、内容をコメントとして永続化 | **次の担当者の状態** （`needs-dev` や `dev-done` 等） |
| `state:needs-owner`| Owner | 決裁を下し、内容をコメントとして永続化 | 同上 |
| `state:needs-audit`| 監査 | リリースカット実施または却下の監査判定完了 | **`state:needs-po`**（理由を添えてPOへ結果を戻す） |
| `state:needs-platform`| Plat | ツールチェーンやテスト装置 of 修正・追加が完了 | **`state:dev-done`**（※自分のPRを自分で承認しない原則） |

**原則**: ラベルは常に「次に動く人」を指す。自分が作業を終えたら、古いラベルを剥がし、自ロールを指したままの状態にしてはならない。

---

## 4.4 孤児（orphan）検出の義務化

ラベル運用の最大の失敗モードは、**「どの受信箱にも入っていない、状態ラベルが未設定のまま浮いている Issues/PRs（孤児 = orphan）」** が発生する事態を指す。各セッションからは「自メールボックスは空」と報告されるため、実際には作業が完全にストップしているにもかかわらず、異常が検知されない。

これを防ぐため、各ロール（特に価値責任者・PO）は、セッション起動時や定期ポーリング時に orphan 検出コマンドを実行する。浮いているタスクを検出し、適切な状態ラベルを付与して各受信箱に再配分しなければならない。

### orphan の定義
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

---

## 4.5 ロール別 polling コマンド

各セッションは、起動時および定期実行時に以下のコマンドを実行して自分のメールボックス（Mailbox）から仕事を拾う。

### ① 開発者（Dev）の Mailbox
```bash
# 1. 自分あての新規着手タスク
gh issue list --label "state:needs-dev" --state open
gh pr list --label "state:needs-dev" --state open

# 2. 差し戻しされたタスク（対応を優先）
gh pr list --label "state:qm-blocked" --state open

# 3. 独立レビュア（Fix Agent等）から自分へのレビュー依頼
gh pr list --search "review-requested:@me is:open"
```

### ② 出荷判定者（QM）の Mailbox
```bash
# 1. 開発者から実装完了で引き渡されたレビュー対象
gh pr list --label "state:dev-done" --state open

# 2. 独立レビュー完了、マージ可能な状態
gh pr list --label "state:ready-to-merge" --state open
```

### ③ 価値責任者（PO）の Mailbox
```bash
# 1. PO判断待ちの要件・仕様・優先順位変更
gh issue list --label "state:needs-po" --state open
gh pr list --label "state:needs-po" --state open

# 2. 不可逆4操作などのオーナー・決裁者承認待ち
gh issue list --label "state:needs-owner" --state open
gh pr list --label "state:needs-owner" --state open
```

### ④ 監査担当（Audit）の Mailbox
```bash
# 1. 統合監査、またはリリース承認依頼
gh issue list --label "state:needs-audit" --state open
gh pr list --label "state:needs-audit" --state open
gh pr list --base main --state open
```

### ⑤ AI維持管理（Platform）の Mailbox
```bash
# 1. 検査・テスト装置の改修、追加、削除の依頼
gh issue list --label "state:needs-platform" --state open
gh pr list --label "state:needs-platform" --state open
```

---

## 4.6 経路維持と「生存確認」ルール（POの義務）

メールボックスが空であることは、**「仕事がないこと」ではなく、「渡す経路が壊れている（ラベル貼り忘れなどによりタスクが orphan 化している）こと」** を示す異常信号であることの方が多い。

価値責任者（PO）は、全ロールで「メールボックス空」の報告が **3回連続** して記録された場合、次の **生存確認（システム監査）** を手動または自動で実行しなければならない。

1. **孤児（orphan）の再検出**:
   4.4節 workshops のコマンドを叩き、状態ラベルが付与されずに浮いてしまっているIssues/PRsがないかを徹底的に探す。もし発見された場合は、適切な `state:*` ラベルを付与してワークフローを再起動する。
2. **各ロールの受信箱の残件確認**:
   全ラベル（7種）を網羅的に確認し、本当にすべてのレーンで件数が「0」になっているかをカウントする（特定のレーンで滞留していないか）。
3. **アクティビティ履歴の確認**:
   直近数時間のコミット履歴や merged されたPRsを確認し、何らかの理由（APIトークンエラーやGitHub障害など）でエージェントがクラッシュしたまま停止していないかを確認する。

```bash
# 全受信箱の残件数を一括取得する
for l in needs-dev dev-done qm-blocked ready-to-merge needs-audit needs-po needs-owner; do
  printf "%s: " "$l"
  echo "issue=$(gh issue list --label "state:$l" --state open --json number --jq 'length') pr=$(gh pr list --label "state:$l" --state open --json number --jq 'length')"
done
```

本ルールを徹底することにより、AIと人間からなる分散開発チームは、「割り込み」というお互いのリソースを破壊しあう危険な通信を一切行うことなく、メッセージバスを介して自律的かつ極めて高速に同期・連携する。
