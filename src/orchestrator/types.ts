// Orchestrator Types
import { z } from 'zod';

// Agent configuration
export const AgentConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(4096),
  
  // Features
  memory: z.boolean().default(true),
  reasoning: z.boolean().default(true),
  rag: z.boolean().default(false),
  sandbox: z.boolean().default(true),
  humanInTheLoop: z.boolean().default(false),
  
  // Limits
  maxRetries: z.number().nonnegative().default(3),
  timeoutMs: z.number().positive().default(30000),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Agent task/input
export const AgentInputSchema = z.object({
  id: z.string().optional(),
  input: z.string(),
  context: z.record(z.unknown()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Options
  stream: z.boolean().default(false),
  maxTokens: z.number().optional(),
});

export type AgentInput = z.infer<typeof AgentInputSchema>;

// Agent output/response
export const AgentOutputSchema = z.object({
  id: z.string(),
  input: z.string(),
  output: z.string(),
  
  // Metadata
  model: z.string(),
  tokensUsed: z.number().optional(),
  latencyMs: z.number(),
  
  // Reasoning trace
  reasoning: z.array(z.object({
    step: z.number(),
    thought: z.string(),
    action: z.string().optional(),
    observation: z.string().optional(),
    confidence: z.number().min(0).max(1),
  })).optional(),
  
  // Memory reference
  memoryUsed: z.array(z.string()).optional(),
  
  // Actions taken
  actions: z.array(z.object({
    type: z.string(),
    payload: z.unknown(),
    approved: z.boolean().optional(),
  })).optional(),
  
  // Errors
  error: z.string().optional(),
  needsApproval: z.boolean().optional(),
  
  createdAt: z.date(),
});

export type AgentOutput = z.infer<typeof AgentOutputSchema>;

// Execution status
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  SEARCHING = 'searching',
  EXECUTING = 'executing',
  WAITING_APPROVAL = 'waiting_approval',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// Agent state
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
