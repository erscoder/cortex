"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentStatus = exports.AgentOutputSchema = exports.AgentInputSchema = exports.AgentConfigSchema = void 0;
// Orchestrator Types
const zod_1 = require("zod");
// Agent configuration
exports.AgentConfigSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    model: zod_1.z.string(),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
    maxTokens: zod_1.z.number().positive().default(4096),
    // Features
    memory: zod_1.z.boolean().default(true),
    reasoning: zod_1.z.boolean().default(true),
    rag: zod_1.z.boolean().default(false),
    sandbox: zod_1.z.boolean().default(true),
    humanInTheLoop: zod_1.z.boolean().default(false),
    // Limits
    maxRetries: zod_1.z.number().nonnegative().default(3),
    timeoutMs: zod_1.z.number().positive().default(30000),
});
// Agent task/input
exports.AgentInputSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    input: zod_1.z.string(),
    context: zod_1.z.record(zod_1.z.unknown()).optional(),
    userId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
    // Options
    stream: zod_1.z.boolean().default(false),
    maxTokens: zod_1.z.number().optional(),
});
// Agent output/response
exports.AgentOutputSchema = zod_1.z.object({
    id: zod_1.z.string(),
    input: zod_1.z.string(),
    output: zod_1.z.string(),
    // Metadata
    model: zod_1.z.string(),
    tokensUsed: zod_1.z.number().optional(),
    latencyMs: zod_1.z.number(),
    // Reasoning trace
    reasoning: zod_1.z.array(zod_1.z.object({
        step: zod_1.z.number(),
        thought: zod_1.z.string(),
        action: zod_1.z.string().optional(),
        observation: zod_1.z.string().optional(),
        confidence: zod_1.z.number().min(0).max(1),
    })).optional(),
    // Memory reference
    memoryUsed: zod_1.z.array(zod_1.z.string()).optional(),
    // Actions taken
    actions: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        payload: zod_1.z.unknown(),
        approved: zod_1.z.boolean().optional(),
    })).optional(),
    // Errors
    error: zod_1.z.string().optional(),
    needsApproval: zod_1.z.boolean().optional(),
    createdAt: zod_1.z.date(),
});
// Execution status
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["THINKING"] = "thinking";
    AgentStatus["SEARCHING"] = "searching";
    AgentStatus["EXECUTING"] = "executing";
    AgentStatus["WAITING_APPROVAL"] = "waiting_approval";
    AgentStatus["COMPLETED"] = "completed";
    AgentStatus["ERROR"] = "error";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
//# sourceMappingURL=types.js.map