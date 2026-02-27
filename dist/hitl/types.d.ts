import { z } from 'zod';
export declare const ApprovalRequestSchema: z.ZodObject<{
    id: z.ZodString;
    agentId: z.ZodString;
    action: z.ZodObject<{
        type: z.ZodString;
        payload: z.ZodUnknown;
        risk: z.ZodEnum<["low", "medium", "high"]>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        risk: "low" | "medium" | "high";
        payload?: unknown;
    }, {
        type: string;
        risk: "low" | "medium" | "high";
        payload?: unknown;
    }>;
    rationale: z.ZodString;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    status: z.ZodEnum<["pending", "approved", "rejected", "modified"]>;
    requestedAt: z.ZodDate;
    respondedAt: z.ZodOptional<z.ZodDate>;
    response: z.ZodOptional<z.ZodString>;
    respondedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "approved" | "pending" | "rejected" | "modified";
    action: {
        type: string;
        risk: "low" | "medium" | "high";
        payload?: unknown;
    };
    agentId: string;
    rationale: string;
    requestedAt: Date;
    context?: Record<string, unknown> | undefined;
    respondedAt?: Date | undefined;
    response?: string | undefined;
    respondedBy?: string | undefined;
}, {
    id: string;
    status: "approved" | "pending" | "rejected" | "modified";
    action: {
        type: string;
        risk: "low" | "medium" | "high";
        payload?: unknown;
    };
    agentId: string;
    rationale: string;
    requestedAt: Date;
    context?: Record<string, unknown> | undefined;
    respondedAt?: Date | undefined;
    response?: string | undefined;
    respondedBy?: string | undefined;
}>;
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export declare const ApprovalConfigSchema: z.ZodObject<{
    autoApproveLowRisk: z.ZodDefault<z.ZodBoolean>;
    autoApproveMediumRisk: z.ZodDefault<z.ZodBoolean>;
    requireApprovalHighRisk: z.ZodDefault<z.ZodBoolean>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
    notificationChannels: z.ZodDefault<z.ZodArray<z.ZodEnum<["telegram", "slack", "email"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    timeoutMs: number;
    autoApproveLowRisk: boolean;
    autoApproveMediumRisk: boolean;
    requireApprovalHighRisk: boolean;
    notificationChannels: ("telegram" | "slack" | "email")[];
}, {
    timeoutMs?: number | undefined;
    autoApproveLowRisk?: boolean | undefined;
    autoApproveMediumRisk?: boolean | undefined;
    requireApprovalHighRisk?: boolean | undefined;
    notificationChannels?: ("telegram" | "slack" | "email")[] | undefined;
}>;
export type ApprovalConfig = z.infer<typeof ApprovalConfigSchema>;
export interface HumanInTheLoop {
    requestApproval(action: {
        type: string;
        payload: unknown;
        risk: 'low' | 'medium' | 'high';
    }, context?: Record<string, unknown>): Promise<ApprovalRequest>;
    getApprovalStatus(requestId: string): Promise<ApprovalRequest | null>;
    approve(requestId: string, response?: string): Promise<void>;
    reject(requestId: string, reason: string): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map