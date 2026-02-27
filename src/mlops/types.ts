// MLOps Types
import { z } from 'zod';

export const ExperimentSchema = z.object({
  id: z.string(),
  name: z.string(),
  config: z.object({
    model: z.string(),
    prompt: z.string(),
    temperature: z.number(),
    maxTokens: z.number(),
    embeddingModel: z.string().optional(),
  }),
  metrics: z.object({
    latency: z.number(),           // ms
    tokenUsage: z.number(),
    successRate: z.number(),       // 0-1
    qualityScore: z.number().min(0).max(10),
    safetyScore: z.number().min(0).max(10),
    custom: z.record(z.number()).optional(),
  }),
  status: z.enum(['running', 'completed', 'failed']),
  createdAt: z.date(),
  completedAt: z.date().optional(),
});

export type Experiment = z.infer<typeof ExperimentSchema>;

export const ModelVersionSchema = z.object({
  version: z.string(),
  experimentId: z.string(),
  config: ExperimentSchema.shape.config,
  metrics: ExperimentSchema.shape.metrics,
  status: z.enum(['dev', 'beta', 'stable', 'deprecated']),
  registeredAt: z.date(),
  deployedAt: z.date().optional(),
});

export type ModelVersion = z.infer<typeof ModelVersionSchema>;

export const ProductionMetricsSchema = z.object({
  timestamp: z.date(),
  requests: z.number(),
  errors: z.number(),
  latencyP50: z.number(),
  latencyP95: z.number(),
  latencyP99: z.number(),
  tokenUsage: z.number(),
  cost: z.number(),
});

export type ProductionMetrics = z.infer<typeof ProductionMetricsSchema>;

export interface MLOpsTracker {
  // Experiments
  createExperiment(config: Experiment['config']): Promise<Experiment>;
  logMetrics(experimentId: string, metrics: Experiment['metrics']): Promise<void>;
  completeExperiment(experimentId: string, status: 'completed' | 'failed'): Promise<Experiment>;
  
  // Model versioning
  registerModel(experimentId: string): Promise<ModelVersion>;
  getModel(version: string): Promise<ModelVersion | null>;
  listModels(status?: ModelVersion['status']): Promise<ModelVersion[]>;
  
  // Production monitoring
  logProductionMetrics(metrics: ProductionMetrics): Promise<void>;
  getProductionMetrics(since: Date): Promise<ProductionMetrics[]>;
}
