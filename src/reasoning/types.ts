// Reasoning Types
import { z } from 'zod';

export const ReasoningStepSchema = z.object({
  step: z.number(),
  thought: z.string(),
  action: z.string().optional(),
  observation: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type ReasoningStep = z.infer<typeof ReasoningStepSchema>;

export const ReasoningResultSchema = z.object({
  steps: z.array(ReasoningStepSchema),
  needsRag: z.boolean().default(false),
  ragQuery: z.string().optional(),
  actions: z.array(z.object({
    type: z.string(),
    payload: z.unknown(),
    risk: z.enum(['low', 'medium', 'high']).default('low'),
  })).optional(),
  requiresHumanApproval: z.boolean().default(false),
  finalAnswer: z.string().optional(),
});

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
