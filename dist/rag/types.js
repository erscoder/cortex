"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOptionsSchema = exports.RetrievalResultSchema = void 0;
// RAG Types
const zod_1 = require("zod");
exports.RetrievalResultSchema = zod_1.z.object({
    id: zod_1.z.string(),
    content: zod_1.z.string(),
    source: zod_1.z.string(),
    score: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.SearchOptionsSchema = zod_1.z.object({
    topK: zod_1.z.number().positive().default(5),
    minScore: zod_1.z.number().min(0).max(1).default(0.5),
    filters: zod_1.z.record(zod_1.z.unknown()).optional(),
    includeMetadata: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=types.js.map