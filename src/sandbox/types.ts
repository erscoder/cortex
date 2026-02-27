// Sandbox Types
import { z } from 'zod';

export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  logs: z.array(z.object({
    timestamp: z.date(),
    level: z.enum(['info', 'warn', 'error']),
    message: z.string(),
  })).optional(),
  durationMs: z.number(),
});

export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

export const SandboxConfigSchema = z.object({
  timeoutMs: z.number().positive().default(30000),
  memoryLimitMB: z.number().positive().default(512),
  allowedCommands: z.array(z.string()).default([
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
  blockedPatterns: z.array(z.string()).default([
    'rm -rf',
    'curl.*\\|.*sh',
    'wget.*\\|.*sh',
    'chmod 777',
    'DROP TABLE',
    'DELETE FROM',
    'sudo',
    'su ',
  ]),
  requireApprovalPatterns: z.array(z.string()).default([
    'rm ',
    'mv ',
    'cp ',
    'kill',
    'pkill',
    'DROP',
    'DELETE',
  ]),
});

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
  validate(action: AgentAction): { valid: boolean; reason?: string };
}
