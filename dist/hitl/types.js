"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalConfigSchema = exports.ApprovalRequestSchema = void 0;
// Human-in-the-Loop Types
const zod_1 = require("zod");
exports.ApprovalRequestSchema = zod_1.z.object({
    id: zod_1.z.string(),
    agentId: zod_1.z.string(),
    action: zod_1.z.object({
        type: zod_1.z.string(),
        payload: zod_1.z.unknown(),
        risk: zod_1.z.enum(['low', 'medium', 'high']),
    }),
    rationale: zod_1.z.string(),
    context: zod_1.z.record(zod_1.z.unknown()).optional(),
    status: zod_1.z.enum(['pending', 'approved', 'rejected', 'modified']),
    requestedAt: zod_1.z.date(),
    respondedAt: zod_1.z.date().optional(),
    response: zod_1.z.string().optional(),
    respondedBy: zod_1.z.string().optional(),
});
exports.ApprovalConfigSchema = zod_1.z.object({
    autoApproveLowRisk: zod_1.z.boolean().default(true),
    autoApproveMediumRisk: zod_1.z.boolean().default(false),
    requireApprovalHighRisk: zod_1.z.boolean().default(true),
    timeoutMs: zod_1.z.number().positive().default(300000), // 5 minutes
    notificationChannels: zod_1.z.array(zod_1.z.enum(['telegram', 'slack', 'email'])).default(['telegram']),
});
//# sourceMappingURL=types.js.map