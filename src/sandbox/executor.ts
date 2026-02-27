// Sandbox Executor - Safe command execution
import { SandboxExecutor, AgentAction, ExecutionResult, SandboxConfig, SandboxConfigSchema } from './types';

export class SafeSandbox implements SandboxExecutor {
  private config: SandboxConfig;
  
  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = SandboxConfigSchema.parse(config);
  }
  
  async execute(action: AgentAction): Promise<ExecutionResult> {
    const startTime = Date.now();
    const logs: ExecutionResult['logs'] = [];
    
    try {
      // Validate action first
      const validation = this.validate(action);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason || 'Action validation failed',
          logs,
          durationMs: Date.now() - startTime,
        };
      }
      
      // Log execution
      logs?.push({
        timestamp: new Date(),
        level: 'info',
        message: `Executing action: ${action.type}`,
      });
      
      // Execute based on action type
      let output: unknown;
      switch (action.type) {
        case 'command':
          output = await this.executeCommand(action.payload as string);
          break;
        case 'api':
          output = await this.executeApiCall(action.payload as { url: string; method: string; body?: unknown });
          break;
        default:
          output = { message: 'Action type not implemented' };
      }
      
      logs?.push({
        timestamp: new Date(),
        level: 'info',
        message: `Action completed successfully`,
      });
      
      return {
        success: true,
        output,
        logs,
        durationMs: Date.now() - startTime,
      };
      
    } catch (error) {
      logs?.push({
        timestamp: new Date(),
        level: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs,
        durationMs: Date.now() - startTime,
      };
    }
  }
  
  validate(action: AgentAction): { valid: boolean; reason?: string } {
    const payloadStr = JSON.stringify(action.payload);
    
    // Check blocked patterns
    for (const pattern of this.config.blockedPatterns) {
      if (new RegExp(pattern, 'i').test(payloadStr)) {
        return { valid: false, reason: `Blocked pattern detected: ${pattern}` };
      }
    }
    
    // Check if approval required
    for (const pattern of this.config.requireApprovalPatterns) {
      if (new RegExp(pattern, 'i').test(payloadStr)) {
        return { valid: false, reason: `Action requires human approval: ${pattern}` };
      }
    }
    
    return { valid: true };
  }
  
  private async executeCommand(command: string): Promise<unknown> {
    // In production, this would use Docker or a proper sandbox
    // For now, return a placeholder
    return { message: 'Command execution requires Docker sandbox', command };
  }
  
  private async executeApiCall(request: { url: string; method: string; body?: unknown }): Promise<unknown> {
    // In production, this would make actual API calls with rate limiting
    return { message: 'API call logged', request };
  }
}
