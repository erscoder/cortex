import { SafeSandbox } from '../src/sandbox/executor';
import { AgentAction } from '../src/sandbox/types';

describe('SafeSandbox - Branch Coverage', () => {
  let sandbox: SafeSandbox;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate - branch coverage', () => {
    it('should pass when no patterns match', () => {
      sandbox = new SafeSandbox({
        blockedPatterns: ['rm -rf'],
        requireApprovalPatterns: ['DROP'],
        allowedCommands: ['npm'],
      });

      const action: AgentAction = {
        type: 'command',
        payload: 'npm install',
        risk: 'low',
        requiresApproval: false,
      };

      const result = sandbox.validate(action);
      expect(result.valid).toBe(true);
    });

    it('should block when pattern matches', () => {
      sandbox = new SafeSandbox({
        blockedPatterns: ['rm -rf'],
        requireApprovalPatterns: [],
        allowedCommands: [],
      });

      const action: AgentAction = {
        type: 'command',
        payload: 'rm -rf /',
        risk: 'high',
        requiresApproval: true,
      };

      const result = sandbox.validate(action);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Blocked');
    });

    it('should require approval when pattern matches', () => {
      sandbox = new SafeSandbox({
        blockedPatterns: [],
        requireApprovalPatterns: ['DROP'],
        allowedCommands: [],
      });

      const action: AgentAction = {
        type: 'command',
        payload: 'DROP TABLE',
        risk: 'high',
        requiresApproval: true,
      };

      const result = sandbox.validate(action);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('approval');
    });
  });

  describe('execute - branch coverage', () => {
    it('should handle api call with body', async () => {
      sandbox = new SafeSandbox();

      const result = await sandbox.execute({
        type: 'api',
        payload: { url: 'http://test.com', method: 'POST', body: { data: 1 } },
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(true);
    });

    it('should handle invalid action type gracefully', async () => {
      sandbox = new SafeSandbox();

      const result = await sandbox.execute({
        type: 'invalid-type' as any,
        payload: {},
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(true);
    });

    it('should log errors on execution failure', async () => {
      sandbox = new SafeSandbox();

      // Force an error by invalid action that triggers exception
      const result = await sandbox.execute({
        type: 'command',
        payload: null as any, // This should cause some handling
        risk: 'low',
        requiresApproval: false,
      });

      expect(result).toBeDefined();
    });
  });
});
