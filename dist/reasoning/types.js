"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningResultSchema = exports.ReasoningStepSchema = void 0;
// Reasoning Types
const zod_1 = require("zod");
exports.ReasoningStepSchema = zod_1.z.object({
    step: zod_1.z.number(),
    thought: zod_1.z.string(),
    action: zod_1.z.string().optional(),
    observation: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0).max(1),
});
exports.ReasoningResultSchema = zod_1.z.object({
    steps: zod_1.z.array(exports.ReasoningStepSchema),
    needsRag: zod_1.z.boolean().default(false),
    ragQuery: zod_1.z.string().optional(),
    actions: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        payload: zod_1.z.unknown(),
        risk: zod_1.z.enum(['low', 'medium', 'high']).default('low'),
    })).optional(),
    requiresHumanApproval: zod_1.z.boolean().default(false),
    finalAnswer: zod_1.z.string().optional(),
});
//# sourceMappingURL=types.js.map