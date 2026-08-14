---
title: 準拠テンプレートリポジトリ
description: ピットイン方式に沿って新規プロダクトを立ち上げるためのテンプレートリポジトリ。軸A〜E の対話からゲート構成を導出し、達成できないゲートを未達として表示し続ける設計
sidebar:
  order: 18
---

新規プロダクトの立ち上げ時に、本標準へそのまま乗るためのテンプレートリポジトリを提供します。

- リポジトリ: [Takenori-Kusaka/pit-in-template](https://github.com/Takenori-Kusaka/pit-in-template)
- 本サイトからは `template/` としてサブモジュール参照する

読者が各章を読んでワークフローと成果物置き場を自分で組み立てる負担をなくすことが目的です。**採用されない標準は、実証もされません**。

## 使い方

| # | 操作 |
| --- | --- |
| 1 | GitHub の Use this template から新しいリポジトリを作る |
| 2 | Claude Code で開き `/process-init` を実行する |
| 3 | 生成された `PROCESS-PROFILE.md` を読む |
| 4 | 作業スキル(`/spec-write` 以降)で開発を回す |

`/process-init` は[第8章](/process-compass/phase4-process-design/tailoring-guide/)の軸A〜E を対話で聞き、ゲート構成・成果物・ブランチ保護を導出します。設問の文言は[知識ベース](/process-compass/tool/knowledge-base-schema/)の `questions` をそのまま使い、専門用語で聞き直しません。

## 生成されるもの

| 生成物 | 役割 |
| --- | --- |
| `PROCESS-PROFILE.md` | 人が読む構成書。標準からの差分と、その理由 |
| `process.config.json` | 機械が読む構成。CI と作業スキルが参照する |
| `.github/workflows/` | 有効なゲートのワークフロー |
| `.github/rulesets/` | 規模に応じたブランチ保護 |
| `context/projects/<案件ID>.md` | 案件層コンテキストの初期ファイル |

## 判定ロジックを二重に持たない

テーラリングの判定は、本サイトの `src/lib/tailoring-engine.mjs` と `src/data/tailoring/` をテンプレートへ複製して行います。テンプレート側で規則を書き直しません。

複製元との乖離は `npm run check` の `test:template` が検出します。**正本は本サイト側**であり、複製を先に書き換えても検査は一致を求めます。

知識ベースを JSON へ変換して複製するのは、テンプレートのゲート実装を**依存パッケージなしで動かす**ためです。Python や Go のプロジェクトが、プロセスの都合で Node の依存関係を抱える構成を避けます。

## 言語に依存しない骨格

CI が固定するのは**ゲート契約**だけです。

| 固定するもの | 値 |
| --- | --- |
| 必須ステータスチェックの名前 | `gate-g5` |
| 出荷判定の証跡 | `evidence/evidence.json` のキー構造 |

実際に走るテスト・静的解析・ライセンス検査のコマンドは `adapters/<stack>.json` から差し込みます。同梱するアダプタは `node` / `python` / `go` / `none` です。

アダプタのコマンドが空のときの扱いは、検査ごとに異なります。

| 検査 | コマンドが空のとき |
| --- | --- |
| テストの実行 | **ジョブを失敗させる** |
| 静的解析・カバレッジ・依存監査・ライセンス検査・秘匿情報検査・依存の導入 | 未実施として証跡へ残し、通過させる |

**テストの実行だけが空を許されません**。[G-5 基準1](/process-compass/phase4-process-design/gate-criteria/)は、実施しなかった場合に代わりとなる証跡を持たないためです。他の検査は、実施の有無そのものが証跡に残るため、未実施のまま通しても記録が空白になりません。

未実施として通す構成は、検査の省略ではありません。**記録された未実施**です。この扱いは、知財の潔白性を保証ではなく証跡として扱う[ADR-0021](/process-compass/adr/0021-ip-clearance-evidence-not-guarantee/)、および未達と省略を区別する[ADR-0028](/process-compass/adr/0028-unmet-gate-distinct-from-omitted/)と同じ設計思想によります。

:::caution
上表は**アダプタのコマンドが空である場合**の扱いです。実装が存在するにもかかわらず検査を空のまま運用してよいという意味ではありません。検査対象が存在しない段階での通過については[第4章 G-5](/process-compass/phase4-process-design/gate-criteria/)によります。
:::

## 達成できないゲートの扱い

1人の開発者が AI エージェントへ実行を委ねる構成では、独立レビュー(G-6)だけが原理的に空席になります。テンプレートはこれを**省略ではなく未達**として扱います([ADR-0028](/process-compass/adr/0028-unmet-gate-distinct-from-omitted/))。

| 状態 | 意味 |
| --- | --- |
| `omitted` | 標準の規則により省略した。調整として成立している |
| `unmet` | **目的を達成する構成を示せていない** |

未達は構成書の冒頭と、出荷判定の品質レポートに必ず現れます。**隠す経路を持ちません**。消す操作も存在せず、外部のレビュアを確保するか、体制を変えるかのいずれかによります。

代償措置(CI 基準の厳格化、リリース後の抜き取り監査)は記録しますが、未達の解消としては扱いません。時点を動かす調整と、判定そのものの不在は別の問題です。

## AI レビューの位置づけ

テンプレートは AI レビューのワークフローを同梱しますが、G-6 の代替にはしません。

- PR へコメントするだけ。承認は行わない
- 必須ステータスチェックにしない。合否条件にすると自動化バイアスを招く
- 承認に必要な権限を、ワークフローへ与えない

`aiReview.canApprove` または `aiReview.requiredCheck` を有効にすると、契約検査が失敗します。**指示ではなく設定で担保します**。

## 強制層

書き込み・ネットワーク・コマンドの許可範囲を設定へ置きます([エージェントの操作の統制](/process-compass/phase5-implementation/agent-trace-control/))。

テンプレートが遮断する対象は2つです。

- **強制層そのもの**(設定・フック・ワークフロー・ルールセット・ゲートのスクリプト)。エージェントが自分を縛る設定を変えられる構成では、遮断が成立しない
- **自己修正ループ中のテスト**([附属書E E.7](/process-compass/phase4-process-design/developer-guide/))。渡された失敗をテスト側の変更で解消する経路を塞ぐ

拒否された操作は記録に残ります。ただし遮断が働くのは設定した範囲についてのみであり、**拒否が0件であることは想定外の操作がなかったことを意味しません**。

## 契約検査

`verify-gate-contract.mjs` が、構成と実際の設定の整合を検査します。テンプレートが「設定したつもり」で運用されることを防ぐためです。

| 検査 | 失敗させる条件 |
| --- | --- |
| ゲートの下限 | G-4 または G-5 が省略されている |
| 未達の記録 | `unmet` の状態と記録が食い違う |
| 不変条件 | 1〜2名で CL1 以上、または規制業 |
| ブランチ保護 | 承認数の不足、`require_last_push_approval` の欠落、`gate-g5` の未登録 |
| アダプタ | テストの実行コマンドが空 |
| AI レビュー | 承認または合否条件が有効 |

## 関連するページ

- [AIが実装する時代の開発プロセス — ピットイン方式](https://zenn.dev/takenori_kusaka/books/pit-in-process) — 要点をまとめた本(Zenn・無料)
- [第8章 テーラリング](/process-compass/phase4-process-design/tailoring-guide/) — 軸A〜E の規則
- [CI/CD ゲート構成リファレンス](/process-compass/phase5-implementation/ci-gates/) — ゲートの実装
- [恒久層コンテキスト](/process-compass/phase5-implementation/context-base/) — `context/` の構成
- [ADR-0027](/process-compass/adr/0027-process-name-pit-in/) — 名称の決定
- [ADR-0028](/process-compass/adr/0028-unmet-gate-distinct-from-omitted/) — 未達と省略の区別
