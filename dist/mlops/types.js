"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionMetricsSchema = exports.ModelVersionSchema = exports.ExperimentSchema = void 0;
// MLOps Types
const zod_1 = require("zod");
exports.ExperimentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    config: zod_1.z.object({
        model: zod_1.z.string(),
        prompt: zod_1.z.string(),
        temperature: zod_1.z.number(),
        maxTokens: zod_1.z.number(),
        embeddingModel: zod_1.z.string().optional(),
    }),
    metrics: zod_1.z.object({
        latency: zod_1.z.number(), // ms
        tokenUsage: zod_1.z.number(),
        successRate: zod_1.z.number(), // 0-1
        qualityScore: zod_1.z.number().min(0).max(10),
        safetyScore: zod_1.z.number().min(0).max(10),
        custom: zod_1.z.record(zod_1.z.number()).optional(),
    }),
    status: zod_1.z.enum(['running', 'completed', 'failed']),
    createdAt: zod_1.z.date(),
    completedAt: zod_1.z.date().optional(),
});
exports.ModelVersionSchema = zod_1.z.object({
    version: zod_1.z.string(),
    experimentId: zod_1.z.string(),
    config: exports.ExperimentSchema.shape.config,
    metrics: exports.ExperimentSchema.shape.metrics,
    status: zod_1.z.enum(['dev', 'beta', 'stable', 'deprecated']),
    registeredAt: zod_1.z.date(),
    deployedAt: zod_1.z.date().optional(),
});
exports.ProductionMetricsSchema = zod_1.z.object({
    timestamp: zod_1.z.date(),
    requests: zod_1.z.number(),
    errors: zod_1.z.number(),
    latencyP50: zod_1.z.number(),
    latencyP95: zod_1.z.number(),
    latencyP99: zod_1.z.number(),
    tokenUsage: zod_1.z.number(),
    cost: zod_1.z.number(),
});
//# sourceMappingURL=types.js.map