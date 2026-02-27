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
      logs.push({
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
      
      logs.push({
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
      logs.push({
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
      try {
        if (new RegExp(pattern, 'i').test(payloadStr)) {
          return { valid: false, reason: `Blocked pattern detected: ${pattern}` };
        }
      } catch {
        // Invalid regex pattern - skip this check
        console.warn(`Invalid regex pattern skipped: ${pattern}`);
      }
    }
    
    // Check if approval required
    for (const pattern of this.config.requireApprovalPatterns) {
      try {
        if (new RegExp(pattern, 'i').test(payloadStr)) {
          return { valid: false, reason: `Action requires human approval: ${pattern}` };
        }
      } catch {
        // Invalid regex pattern - skip this check
        console.warn(`Invalid regex pattern skipped: ${pattern}`);
      }
    }
    
    return { valid: true };
  }
  
  async executeCommand(command: string): Promise<unknown> {
    // Validate command is not empty
    if (!command || typeof command !== 'string') {
      throw new Error('Command must be a non-empty string');
    }
    
    // Check for command length limits
    if (command.length > 10000) {
      throw new Error('Command exceeds maximum length');
    }
    
    // In production, this would use Docker or a proper sandbox
    return { message: 'Command execution requires Docker sandbox', command };
  }
  
  async executeApiCall(request: { url: string; method: string; body?: unknown }): Promise<unknown> {
    // Validate request structure
    if (!request || typeof request !== 'object') {
      throw new Error('API request must be an object');
    }
    
    if (!request.url || typeof request.url !== 'string') {
      throw new Error('API request must have a valid URL');
    }
    
    if (!request.method || typeof request.method !== 'string') {
      throw new Error('API request must have a valid method');
    }
    
    // In production, this would make actual API calls with rate limiting
    return { message: 'API call logged', request };
  }
}
