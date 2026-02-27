// Human-in-the-Loop Types
import { z } from 'zod';

export const ApprovalRequestSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  action: z.object({
    type: z.string(),
    payload: z.unknown(),
    risk: z.enum(['low', 'medium', 'high']),
  }),
  rationale: z.string(),
  context: z.record(z.unknown()).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'modified']),
  requestedAt: z.date(),
  respondedAt: z.date().optional(),
  response: z.string().optional(),
  respondedBy: z.string().optional(),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const ApprovalConfigSchema = z.object({
  autoApproveLowRisk: z.boolean().default(true),
  autoApproveMediumRisk: z.boolean().default(false),
  requireApprovalHighRisk: z.boolean().default(true),
  timeoutMs: z.number().positive().default(300000), // 5 minutes
  notificationChannels: z.array(z.enum(['telegram', 'slack', 'email'])).default(['telegram']),
});

export type ApprovalConfig = z.infer<typeof ApprovalConfigSchema>;

export interface HumanInTheLoop {
  requestApproval(action: { type: string; payload: unknown; risk: 'low' | 'medium' | 'high' }, context?: Record<string, unknown>): Promise<ApprovalRequest>;
  getApprovalStatus(requestId: string): Promise<ApprovalRequest | null>;
  approve(requestId: string, response?: string): Promise<void>;
  reject(requestId: string, reason: string): Promise<void>;
}
