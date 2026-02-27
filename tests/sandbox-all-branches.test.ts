// Test that forces the catch block in sandbox executor
// We can't easily trigger the catch block without modifying the source
// But we can verify that the validation branch coverage is complete

import { SafeSandbox } from '../src/sandbox/executor';
import { AgentAction } from '../src/sandbox/types';

describe('SafeSandbox - All Branch Paths', () => {
  describe('validate - all branches', () => {
    it('should validate with empty patterns', () => {
      const sandbox = new SafeSandbox({
        blockedPatterns: [],
        requireApprovalPatterns: [],
        allowedCommands: [],
      });
      
      const action: AgentAction = {
        type: 'command',
        payload: 'anything',
        risk: 'low',
        requiresApproval: false,
      };
      
      const result = sandbox.validate(action);
      expect(result.valid).toBe(true);
    });

    it('should validate with blocked pattern matching', () => {
      const sandbox = new SafeSandbox({
        blockedPatterns: ['rm -rf', 'sudo'],
        requireApprovalPatterns: [],
        allowedCommands: [],
      });
      
      const action: AgentAction = {
        type: 'command',
        payload: 'sudo rm -rf',
        risk: 'high',
        requiresApproval: true,
      };
      
      const result = sandbox.validate(action);
      expect(result.valid).toBe(false);
    });

    it('should validate with require approval pattern matching', () => {
      const sandbox = new SafeSandbox({
        blockedPatterns: [],
        requireApprovalPatterns: ['DROP', 'DELETE'],
        allowedCommands: [],
      });
      
      const action: AgentAction = {
        type: 'command',
        payload: 'DROP DATABASE',
        risk: 'high',
        requiresApproval: true,
      };
      
      const result = sandbox.validate(action);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('approval');
    });

    it('should handle multiple pattern matches', () => {
      const sandbox = new SafeSandbox({
        blockedPatterns: ['rm', 'del'],
        requireApprovalPatterns: ['drop'],
        allowedCommands: [],
      });
      
      // Blocked pattern takes precedence
      const action: AgentAction = {
        type: 'command',
        payload: 'rm file',
        risk: 'high',
        requiresApproval: true,
      };
      
      const result = sandbox.validate(action);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Blocked');
    });
  });

  describe('execute - all paths', () => {
    it('should execute command type', async () => {
      const sandbox = new SafeSandbox();
      
      const result = await sandbox.execute({
        type: 'command',
        payload: 'ls -la',
        risk: 'low',
        requiresApproval: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should execute api type', async () => {
      const sandbox = new SafeSandbox();
      
      const result = await sandbox.execute({
        type: 'api',
        payload: { url: 'http://api.test', method: 'GET' },
        risk: 'low',
        requiresApproval: false,
      });
      
      expect(result.success).toBe(true);
    });

    it('should handle unknown type gracefully', async () => {
      const sandbox = new SafeSandbox();
      
      const result = await sandbox.execute({
        type: 'unknown-type' as any,
        payload: {},
        risk: 'low',
        requiresApproval: false,
      });
      
      expect(result.success).toBe(true);
    });
  });
});
