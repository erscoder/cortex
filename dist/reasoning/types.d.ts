import { z } from 'zod';
export declare const ReasoningStepSchema: z.ZodObject<{
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
}>;
export type ReasoningStep = z.infer<typeof ReasoningStepSchema>;
export declare const ReasoningResultSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodObject<{
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
    }>, "many">;
    needsRag: z.ZodDefault<z.ZodBoolean>;
    ragQuery: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        payload: z.ZodUnknown;
        risk: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        risk: "low" | "medium" | "high";
        payload?: unknown;
    }, {
        type: string;
        payload?: unknown;
        risk?: "low" | "medium" | "high" | undefined;
    }>, "many">>;
    requiresHumanApproval: z.ZodDefault<z.ZodBoolean>;
    finalAnswer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    steps: {
        step: number;
        thought: string;
        confidence: number;
        action?: string | undefined;
        observation?: string | undefined;
    }[];
    needsRag: boolean;
    requiresHumanApproval: boolean;
    actions?: {
        type: string;
        risk: "low" | "medium" | "high";
        payload?: unknown;
    }[] | undefined;
    ragQuery?: string | undefined;
    finalAnswer?: string | undefined;
}, {
    steps: {
        step: number;
        thought: string;
        confidence: number;
        action?: string | undefined;
        observation?: string | undefined;
    }[];
    actions?: {
        type: string;
        payload?: unknown;
        risk?: "low" | "medium" | "high" | undefined;
    }[] | undefined;
    needsRag?: boolean | undefined;
    ragQuery?: string | undefined;
    requiresHumanApproval?: boolean | undefined;
    finalAnswer?: string | undefined;
}>;
export type ReasoningResult = z.infer<typeof ReasoningResultSchema>;
export interface Reasoner {
    think(problem: string, context: Record<string, unknown>): Promise<ReasoningResult>;
}
export type ReasoningStrategy = 'cot' | 'tot' | 'react';
export interface ReasonerConfig {
    strategy: ReasoningStrategy;
    maxSteps: number;
    temperature: number;
}
//# sourceMappingURL=types.d.ts.map