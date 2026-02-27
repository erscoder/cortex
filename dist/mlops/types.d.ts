import { z } from 'zod';
export declare const ExperimentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    config: z.ZodObject<{
        model: z.ZodString;
        prompt: z.ZodString;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        embeddingModel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    }, {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    }>;
    metrics: z.ZodObject<{
        latency: z.ZodNumber;
        tokenUsage: z.ZodNumber;
        successRate: z.ZodNumber;
        qualityScore: z.ZodNumber;
        safetyScore: z.ZodNumber;
        custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    }, {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    }>;
    status: z.ZodEnum<["running", "completed", "failed"]>;
    createdAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    status: "completed" | "running" | "failed";
    createdAt: Date;
    config: {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    };
    metrics: {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    };
    completedAt?: Date | undefined;
}, {
    id: string;
    name: string;
    status: "completed" | "running" | "failed";
    createdAt: Date;
    config: {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    };
    metrics: {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    };
    completedAt?: Date | undefined;
}>;
export type Experiment = z.infer<typeof ExperimentSchema>;
export declare const ModelVersionSchema: z.ZodObject<{
    version: z.ZodString;
    experimentId: z.ZodString;
    config: z.ZodObject<{
        model: z.ZodString;
        prompt: z.ZodString;
        temperature: z.ZodNumber;
        maxTokens: z.ZodNumber;
        embeddingModel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    }, {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    }>;
    metrics: z.ZodObject<{
        latency: z.ZodNumber;
        tokenUsage: z.ZodNumber;
        successRate: z.ZodNumber;
        qualityScore: z.ZodNumber;
        safetyScore: z.ZodNumber;
        custom: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    }, {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    }>;
    status: z.ZodEnum<["dev", "beta", "stable", "deprecated"]>;
    registeredAt: z.ZodDate;
    deployedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status: "dev" | "beta" | "stable" | "deprecated";
    config: {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    };
    metrics: {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    };
    version: string;
    experimentId: string;
    registeredAt: Date;
    deployedAt?: Date | undefined;
}, {
    status: "dev" | "beta" | "stable" | "deprecated";
    config: {
        model: string;
        temperature: number;
        maxTokens: number;
        prompt: string;
        embeddingModel?: string | undefined;
    };
    metrics: {
        latency: number;
        tokenUsage: number;
        successRate: number;
        qualityScore: number;
        safetyScore: number;
        custom?: Record<string, number> | undefined;
    };
    version: string;
    experimentId: string;
    registeredAt: Date;
    deployedAt?: Date | undefined;
}>;
export type ModelVersion = z.infer<typeof ModelVersionSchema>;
export declare const ProductionMetricsSchema: z.ZodObject<{
    timestamp: z.ZodDate;
    requests: z.ZodNumber;
    errors: z.ZodNumber;
    latencyP50: z.ZodNumber;
    latencyP95: z.ZodNumber;
    latencyP99: z.ZodNumber;
    tokenUsage: z.ZodNumber;
    cost: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    timestamp: Date;
    tokenUsage: number;
    requests: number;
    errors: number;
    latencyP50: number;
    latencyP95: number;
    latencyP99: number;
    cost: number;
}, {
    timestamp: Date;
    tokenUsage: number;
    requests: number;
    errors: number;
    latencyP50: number;
    latencyP95: number;
    latencyP99: number;
    cost: number;
}>;
export type ProductionMetrics = z.infer<typeof ProductionMetricsSchema>;
export interface MLOpsTracker {
    createExperiment(config: Experiment['config']): Promise<Experiment>;
    logMetrics(experimentId: string, metrics: Experiment['metrics']): Promise<void>;
    completeExperiment(experimentId: string, status: 'completed' | 'failed'): Promise<Experiment>;
    registerModel(experimentId: string): Promise<ModelVersion>;
    getModel(version: string): Promise<ModelVersion | null>;
    listModels(status?: ModelVersion['status']): Promise<ModelVersion[]>;
    logProductionMetrics(metrics: ProductionMetrics): Promise<void>;
    getProductionMetrics(since: Date): Promise<ProductionMetrics[]>;
}
//# sourceMappingURL=types.d.ts.map