import { SafeSandbox } from '../src/sandbox/executor';
import { AgentAction } from '../src/sandbox/types';

describe('SafeSandbox', () => {
  let sandbox: SafeSandbox;

  beforeEach(() => {
    sandbox = new SafeSandbox({
      blockedPatterns: ['rm -rf', 'sudo', 'curl.*sh'],
      requireApprovalPatterns: ['DROP', 'DELETE', 'rm '],
      allowedCommands: ['npm', 'git', 'ls', 'cat'],
    });
  });

  const createAction = (payload: string, risk: 'low' | 'medium' | 'high' = 'low'): AgentAction => ({
    type: 'command',
    payload,
    risk,
    requiresApproval: risk !== 'low',
  });

  describe('validate', () => {
    it('should allow safe commands', () => {
      const result = sandbox.validate(createAction('npm install', 'low'));
      expect(result.valid).toBe(true);
    });

    it('should block dangerous patterns', () => {
      const result = sandbox.validate(createAction('rm -rf /', 'high'));
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Blocked');
    });

    it('should require approval for risky commands', () => {
      const result = sandbox.validate(createAction('rm file.txt', 'medium'));
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('requires human approval');
    });

    it('should block sudo', () => {
      const result = sandbox.validate(createAction('sudo apt-get install', 'high'));
      expect(result.valid).toBe(false);
    });
  });

  describe('execute', () => {
    it('should execute valid actions', async () => {
      const result = await sandbox.execute(createAction('npm test', 'low'));
      expect(result.success).toBe(true);
      expect(result.logs).toBeDefined();
    });

    it('should reject invalid actions', async () => {
      const result = await sandbox.execute(createAction('rm -rf /', 'high'));
      expect(result.success).toBe(false);
      expect(result.error).toContain('Blocked');
    });
  });
});
