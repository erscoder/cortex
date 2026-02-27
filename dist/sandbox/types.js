"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxConfigSchema = exports.ExecutionResultSchema = void 0;
// Sandbox Types
const zod_1 = require("zod");
exports.ExecutionResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    output: zod_1.z.unknown().optional(),
    error: zod_1.z.string().optional(),
    logs: zod_1.z.array(zod_1.z.object({
        timestamp: zod_1.z.date(),
        level: zod_1.z.enum(['info', 'warn', 'error']),
        message: zod_1.z.string(),
    })).optional(),
    durationMs: zod_1.z.number(),
});
exports.SandboxConfigSchema = zod_1.z.object({
    timeoutMs: zod_1.z.number().positive().default(30000),
    memoryLimitMB: zod_1.z.number().positive().default(512),
    allowedCommands: zod_1.z.array(zod_1.z.string()).default([
        'npm install',
        'npm run',
        'git status',
        'git log',
        'ls',
        'cat',
        'head',
        'tail',
        'grep',
    ]),
    blockedPatterns: zod_1.z.array(zod_1.z.string()).default([
        'rm -rf',
        'curl.*\\|.*sh',
        'wget.*\\|.*sh',
        'chmod 777',
        'DROP TABLE',
        'DELETE FROM',
        'sudo',
        'su ',
    ]),
    requireApprovalPatterns: zod_1.z.array(zod_1.z.string()).default([
        'rm ',
        'mv ',
        'cp ',
        'kill',
        'pkill',
        'DROP',
        'DELETE',
    ]),
});
//# sourceMappingURL=types.js.map