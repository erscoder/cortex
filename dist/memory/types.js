"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemorySchema = void 0;
// Memory Types
const zod_1 = require("zod");
exports.MemorySchema = zod_1.z.object({
    id: zod_1.z.string(),
    agentId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['fact', 'preference', 'learning', 'conversation', 'tool']),
    content: zod_1.z.string(),
    importance: zod_1.z.number().min(0).max(10).default(5),
    embedding: zod_1.z.array(zod_1.z.number()).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    createdAt: zod_1.z.date(),
    accessedAt: zod_1.z.date().optional(),
});
//# sourceMappingURL=types.js.map