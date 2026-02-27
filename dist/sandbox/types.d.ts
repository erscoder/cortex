import { z } from 'zod';
export declare const ExecutionResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    output: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    logs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        timestamp: z.ZodDate;
        level: z.ZodEnum<["info", "warn", "error"]>;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        timestamp: Date;
        level: "error" | "info" | "warn";
    }, {
        message: string;
        timestamp: Date;
        level: "error" | "info" | "warn";
    }>, "many">>;
    durationMs: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    durationMs: number;
    output?: unknown;
    error?: string | undefined;
    logs?: {
        message: string;
        timestamp: Date;
        level: "error" | "info" | "warn";
    }[] | undefined;
}, {
    success: boolean;
    durationMs: number;
    output?: unknown;
    error?: string | undefined;
    logs?: {
        message: string;
        timestamp: Date;
        level: "error" | "info" | "warn";
    }[] | undefined;
}>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
export declare const SandboxConfigSchema: z.ZodObject<{
    timeoutMs: z.ZodDefault<z.ZodNumber>;
    memoryLimitMB: z.ZodDefault<z.ZodNumber>;
    allowedCommands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    blockedPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    requireApprovalPatterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    timeoutMs: number;
    memoryLimitMB: number;
    allowedCommands: string[];
    blockedPatterns: string[];
    requireApprovalPatterns: string[];
}, {
    timeoutMs?: number | undefined;
    memoryLimitMB?: number | undefined;
    allowedCommands?: string[] | undefined;
    blockedPatterns?: string[] | undefined;
    requireApprovalPatterns?: string[] | undefined;
}>;
export type SandboxConfig = z.infer<typeof SandboxConfigSchema>;
export interface AgentAction {
    id?: string;
    type: string;
    payload: unknown;
    risk: 'low' | 'medium' | 'high';
    requiresApproval: boolean;
}
export interface SandboxExecutor {
    execute(action: AgentAction): Promise<ExecutionResult>;
    validate(action: AgentAction): {
        valid: boolean;
        reason?: string;
    };
}
//# sourceMappingURL=types.d.ts.map