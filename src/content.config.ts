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
  jpRealities: z.string().array().optional(), // 建前と実運用の乖離
  plainSummary: z.string().optional(), // 平易な言い換え(ADR-0006 の原典対照用)
  references: z.object({ title: z.string(), url: z.string().optional() }).array(),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  processes: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/data/processes' }),
    schema: processSchema,
  }),
};
