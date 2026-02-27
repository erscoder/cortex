// Human-in-the-Loop Manager
import { v4 as uuidv4 } from 'uuid';
import { HumanInTheLoop, ApprovalRequest, ApprovalConfig, ApprovalRequestSchema, ApprovalConfigSchema } from './types';

export class HITLManager implements HumanInTheLoop {
  private config: ApprovalConfig;
  private pendingRequests: Map<string, ApprovalRequest> = new Map();
  private notificationCallback?: (request: ApprovalRequest) => Promise<void>;
  
  constructor(config: Partial<ApprovalConfig> = {}) {
    this.config = ApprovalConfigSchema.parse(config);
  }
  
  // Set callback for notifications (Telegram, Slack, etc.)
  setNotificationCallback(callback: (request: ApprovalRequest) => Promise<void>): void {
    this.notificationCallback = callback;
  }
  
  async requestApproval(
    action: { type: string; payload: unknown; risk: 'low' | 'medium' | 'high' },
    context?: Record<string, unknown>
  ): Promise<ApprovalRequest> {
    // Check if auto-approve
    if (action.risk === 'low' && this.config.autoApproveLowRisk) {
      return this.autoApprove(action, context);
    }
    
    if (action.risk === 'medium' && this.config.autoApproveMediumRisk) {
      return this.autoApprove(action, context);
    }
    
    if (action.risk === 'high' && !this.config.requireApprovalHighRisk) {
      return this.autoApprove(action, context);
    }
    
    // Create approval request
    const request: ApprovalRequest = {
      id: uuidv4(),
      agentId: 'unknown', // Would be set by orchestrator
      action,
      rationale: this.generateRationale(action, context),
      context,
      status: 'pending',
      requestedAt: new Date(),
    };
    
    // Store pending request
    this.pendingRequests.set(request.id, request);
    
    // Notify human
    if (this.notificationCallback) {
      await this.notificationCallback(request);
    }
    
    // TODO: Set up timeout to auto-reject
    
    return request;
  }
  
  async getApprovalStatus(requestId: string): Promise<ApprovalRequest | null> {
    return this.pendingRequests.get(requestId) || null;
  }
  
  // Wait for approval with timeout
  async waitForApproval(
    action: { type: string; payload: unknown; risk: 'low' | 'medium' | 'high' },
    context?: Record<string, unknown>,
    timeoutMs?: number
  ): Promise<ApprovalRequest> {
    const request = await this.requestApproval(action, context);
    
    // If already approved/rejected, return immediately
    if (request.status !== 'pending') {
      return request;
    }
    
    const timeout = timeoutMs || this.config.timeoutMs;
    const startTime = Date.now();
    
    // Poll for approval status
    while (Date.now() - startTime < timeout) {
      const currentRequest = this.pendingRequests.get(request.id);
      if (!currentRequest || currentRequest.status !== 'pending') {
        return currentRequest || request;
      }
      
      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Timeout - auto-reject
    const timedOutRequest = this.pendingRequests.get(request.id);
    if (timedOutRequest && timedOutRequest.status === 'pending') {
      timedOutRequest.status = 'rejected';
      timedOutRequest.response = 'Timeout: No response received';
      timedOutRequest.respondedAt = new Date();
    }
    
    return timedOutRequest || request;
  }
  
  async approve(requestId: string, response?: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }
    
    request.status = 'approved';
    request.respondedAt = new Date();
    request.response = response || 'Approved';
    request.respondedBy = 'human';
    
    this.pendingRequests.set(requestId, request);
  }
  
  async reject(requestId: string, reason: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }
    
    request.status = 'rejected';
    request.respondedAt = new Date();
    request.response = reason;
    request.respondedBy = 'human';
    
    this.pendingRequests.set(requestId, request);
  }
  
  private async autoApprove(
    action: { type: string; payload: unknown; risk: 'low' | 'medium' | 'high' },
    context?: Record<string, unknown>
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: uuidv4(),
      agentId: 'system',
      action,
      rationale: this.generateRationale(action, context),
      context,
      status: 'approved',
      requestedAt: new Date(),
      respondedAt: new Date(),
      response: 'Auto-approved (low risk)',
      respondedBy: 'system',
    };
    
    return request;
  }
  
  private generateRationale(action: { type: string; payload: unknown }, context?: Record<string, unknown>): string {
    return `Agent wants to execute ${action.type} action. ${context ? `Context: ${JSON.stringify(context)}` : ''}`;
  }
}
