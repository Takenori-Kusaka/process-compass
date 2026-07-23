import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// プロセスデータスキーマ v0(ADR-0007)
// 語彙は SPEM 2.0 簡約 + 調査フレームワークの 6+2 要素(ADR-0004)と同型
const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const activitySchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  roles: z.string().array().optional(), // Role の id 参照
  inputs: z.string().array().optional(), // WorkProduct の id 参照
  outputs: z.string().array().optional(),
  tasks: taskSchema.array().default([]),
});

const phaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  vCounterpart: z.string().optional(), // V字モデルでの対応工程
  activities: activitySchema.array(),
  gatesAfter: z.string().array().default([]), // Gate の id 参照(このフェーズの出口ゲート。複数可)
});

const processSchema = z.object({
  schemaVersion: z.literal(0),
  name: z.string(),
  summary: z.string(),
  // プロセスの粒度・性格(調査フレームワークが指摘する「粒度の差」をデータ化)
  // lifecycle=開発ライフサイクル全体 / practice=実務プラクティス / design-method=設計手法
  // umbrella=価値観・原則の傘 / hybrid=日本企業のハイブリッド開発の実態(アンチパターン含む)
  // proposal=本プロジェクトが提案する統合プロセス(フェーズ4の成果)
  category: z
    .enum(['lifecycle', 'practice', 'design-method', 'umbrella', 'hybrid', 'proposal'])
    .default('lifecycle'),
  // アンチパターンカタログ(建前 vs 実態)。ハイブリッド実態の記述に使う
  antiPatterns: z
    .object({
      name: z.string(),
      ideal: z.string(), // 建前(あるべき姿)
      reality: z.string(), // 実態
      why: z.string(), // なぜ起きるか(日本的背景)
      harm: z.string().optional(), // 弊害
    })
    .array()
    .optional(),
  purpose: z.string(),
  outcomes: z.string().array(),
  origin: z.string().optional(), // 原典・提唱者
  iso12207Groups: z.string().array().optional(), // 厚くカバーする 12207 プロセス群
  roles: z
    .object({
      id: z.string(),
      name: z.string(),
      responsibility: z.string(),
      jpNote: z.string().optional(), // 日本の現場での兼務実態など
    })
    .array(),
  workProducts: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      producedBy: z.string().optional(), // Role の id 参照
    })
    .array(),
  gates: z
    .object({
      id: z.string(),
      name: z.string(),
      // decision = Go/Kill 型の決裁ゲート / inspection = 検査と適応(スクラム等、承認を伴わない)
      kind: z.enum(['decision', 'inspection']).default('decision'),
      // 契約上の区切り(検収・多段階契約の節目)を兼ねるか(日本の受発注構造の分析用)
      contractual: z.boolean().default(false),
      deliverables: z.string().array(),
      criteria: z.string().array(),
      approver: z.string(),
      decisions: z.string().array(),
      jpNote: z.string().optional(),
    })
    .array(),
  phases: phaseSchema.array(),
  // 理想像が暗黙に仮定している前提条件(これが崩れると成立しない)。特に To 側プロセス(AIDLC 等)で重要。フェーズ3のギャップ分析の入力になる
  assumptions: z.string().array().optional(),
  jpRealities: z.string().array().optional(), // 建前と実運用の乖離
  plainSummary: z.string().optional(), // 平易な言い換え(ADR-0006 の原典対照用)
  references: z.object({ title: z.string(), url: z.string().optional() }).array(),
});

// テーラリング知識ベーススキーマ v0(ADR-0008)
// プロセス提案ツール(M7)の入力・規則・制約を宣言的データとして管理する。
// 規則の適用順序・競合解決の詳細は提案ロジック設計(#60)が定義する

// 入力モデル: 画面に出す質問。回答(option の id)が規則の条件になる
const questionSchema = z.object({
  id: z.string(),
  // A=チーム規模 / B=事業フェーズ / C=期待品質・規制 / D=開発形態 / supplement=補助質問
  axis: z.enum(['A', 'B', 'C', 'D', 'supplement']),
  text: z.string(), // 画面上の質問文(専門用語で聞かない)
  help: z.string().optional(),
  // 条件付き表示: 指定した質問が指定の回答のときだけ表示する(例: 1〜2名のときだけ外部レビュア質問)
  appliesWhen: z.record(z.string(), z.string().array()).optional(),
  options: z
    .object({ id: z.string(), label: z.string(), note: z.string().optional() })
    .array()
    .min(2),
});

// 調整操作: 参照モデル(integrated.yaml)への差分。note は必須 —
// すべての調整は人に説明できなければならない(要件定義の「調整の根拠」に直結)
const adjustmentSchema = z.object({
  target: z.object({
    // gate/role/activity/phase は integrated.yaml の id を参照する。
    // practice はプロセス構造に載らない横断的な運用項目(practices.yaml で定義)
    type: z.enum(['process', 'phase', 'gate', 'role', 'activity', 'practice']),
    id: z.string().optional(), // type=process のときのみ省略可
  }),
  // omit=省略 / simplify=簡略化 / strengthen=厳格化 / merge-into=統合(value に統合先 id)
  // set=パラメータ設定(param+value) / note=注記のみ(構造は変えない)
  action: z.enum(['omit', 'simplify', 'strengthen', 'merge-into', 'set', 'note']),
  param: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  note: z.string(), // 画面にそのまま出す人向けの説明(必須)
});

// テーラリング規則: 「入力 → 調整」の対応 1 件。参照モデルからの逸脱だけを規則化する
// (標準どおりの組み合わせに規則は書かない)
const ruleSchema = z.object({
  id: z.string(),
  // 条件: 質問 id → 回答 id の配列。同一質問内は OR、質問間は AND
  when: z.record(z.string(), z.string().array()),
  adjustments: adjustmentSchema.array().min(1),
  reason: z.string(), // なぜこの調整か(出力の「調整の根拠」に表示)
  source: z.string(), // 根拠となる本サイト内ページのパス
  priority: z.number().int().default(10), // 競合時の適用順の初期値(大きいほど後勝ち)
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  processes: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/data/processes' }),
    schema: processSchema,
  }),
  tailoringQuestions: defineCollection({
    loader: glob({ pattern: 'questions.yaml', base: './src/data/tailoring' }),
    schema: z.object({ schemaVersion: z.literal(0), questions: questionSchema.array() }),
  }),
  tailoringPractices: defineCollection({
    loader: glob({ pattern: 'practices.yaml', base: './src/data/tailoring' }),
    schema: z.object({
      schemaVersion: z.literal(0),
      practices: z
        .object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          source: z.string(), // 解説ページのパス
        })
        .array(),
    }),
  }),
  tailoringConstraints: defineCollection({
    loader: glob({ pattern: 'constraints.yaml', base: './src/data/tailoring' }),
    schema: z.object({
      schemaVersion: z.literal(0),
      // テーラリングの禁止事項。ユーザーの上書きがこれに触れたら警告し、提案書に逸脱として記録する
      constraints: z
        .object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          rationale: z.string(),
          source: z.string(),
        })
        .array(),
    }),
  }),
  tailoringRules: defineCollection({
    loader: glob({ pattern: 'rules-*.yaml', base: './src/data/tailoring' }),
    schema: z.object({
      schemaVersion: z.literal(0),
      name: z.string(), // 規則群の表示名(例: 軸A チーム規模)
      rules: ruleSchema.array().min(1),
    }),
  }),
};
