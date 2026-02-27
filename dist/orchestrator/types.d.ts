import { z } from 'zod';
export declare const AgentConfigSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    model: z.ZodString;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    memory: z.ZodDefault<z.ZodBoolean>;
    reasoning: z.ZodDefault<z.ZodBoolean>;
    rag: z.ZodDefault<z.ZodBoolean>;
    sandbox: z.ZodDefault<z.ZodBoolean>;
    humanInTheLoop: z.ZodDefault<z.ZodBoolean>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    model: string;
    temperature: number;
    maxTokens: number;
    memory: boolean;
    reasoning: boolean;
    rag: boolean;
    sandbox: boolean;
    humanInTheLoop: boolean;
    maxRetries: number;
    timeoutMs: number;
    id?: string | undefined;
}, {
    name: string;
    model: string;
    id?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    memory?: boolean | undefined;
    reasoning?: boolean | undefined;
    rag?: boolean | undefined;
    sandbox?: boolean | undefined;
    humanInTheLoop?: boolean | undefined;
    maxRetries?: number | undefined;
    timeoutMs?: number | undefined;
}>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export declare const AgentInputSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    input: z.ZodString;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    stream: z.ZodDefault<z.ZodBoolean>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    input: string;
    stream: boolean;
    id?: string | undefined;
    maxTokens?: number | undefined;
    context?: Record<string, unknown> | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
}, {
    input: string;
    id?: string | undefined;
    maxTokens?: number | undefined;
    context?: Record<string, unknown> | undefined;
    userId?: string | undefined;
    sessionId?: string | undefined;
    stream?: boolean | undefined;
}>;
export type AgentInput = z.infer<typeof AgentInputSchema>;
export declare const AgentOutputSchema: z.ZodObject<{
    id: z.ZodString;
    input: z.ZodString;
    output: z.ZodString;
    model: z.ZodString;
    tokensUsed: z.ZodOptional<z.ZodNumber>;
    latencyMs: z.ZodNumber;
    reasoning: z.ZodOptional<z.ZodArray<z.ZodObject<{
        step: z.ZodNumber;
        thought: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
        observation: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        step: number;
        thought: string;
        confidence: number;
        action?: string | undefined;
        observation?: string | undefined;
    }, {
        step: number;
        thought: string;
        confidence: number;
        action?: string | undefined;
        observation?: string | undefined;
    }>, "many">>;
    memoryUsed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        payload: z.ZodUnknown;
        approved: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        payload?: unknown;
        approved?: boolean | undefined;
    }, {
        type: string;
        payload?: unknown;
        approved?: boolean | undefined;
    }>, "many">>;
    error: z.ZodOptional<z.ZodString>;
    needsApproval: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    model: string;
    input: string;
    output: string;
    latencyMs: number;
    createdAt: Date;
    reasoning?: {
        step: number;
        thought: string;
        confidence: number;
        action?: string | undefined;
        observation?: string | undefined;
    }[] | undefined;
    tokensUsed?: number | undefined;
    memoryUsed?: string[] | undefined;
    actions?: {
        type: string;
        payload?: unknown;
        approved?: boolean | undefined;
    }[] | undefined;
    error?: string | undefined;
    needsApproval?: boolean | undefined;
}, {
    id: string;
    model: string;
    input: string;
    output: string;
    latencyMs: number;
    createdAt: Date;
    reasoning?: {
        step: number;
        thought: string;
        confidence: number;
        action?: string | undefined;
        observation?: string | undefined;
    }[] | undefined;
    tokensUsed?: number | undefined;
    memoryUsed?: string[] | undefined;
    actions?: {
        type: string;
        payload?: unknown;
        approved?: boolean | undefined;
    }[] | undefined;
    error?: string | undefined;
    needsApproval?: boolean | undefined;
}>;
export type AgentOutput = z.infer<typeof AgentOutputSchema>;
export declare enum AgentStatus {
    IDLE = "idle",
    THINKING = "thinking",
    SEARCHING = "searching",
    EXECUTING = "executing",
    WAITING_APPROVAL = "waiting_approval",
    COMPLETED = "completed",
    ERROR = "error"
}
export interface AgentState {
    id: string;
    name: string;
    status: AgentStatus;
    currentTask: AgentInput | null;
    context: Map<string, unknown>;
    memory: {
        shortTerm: string[];
        longTerm: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=types.d.ts.map