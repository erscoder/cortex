import { SafeSandbox } from '../src/sandbox/executor';

describe('SafeSandbox - Error Branch Coverage', () => {
  let sandbox: SafeSandbox;

  beforeEach(() => {
    sandbox = new SafeSandbox({
      blockedPatterns: ['rm -rf'],
      requireApprovalPatterns: ['DROP'],
    });
  });

  describe('executeCommand - error branches (catch block)', () => {
    it('should catch error when command is empty', async () => {
      const result = await sandbox.execute({
        type: 'command',
        payload: '',
        risk: 'low',
        requiresApproval: false,
      });

      // Error is caught and returned in result
      expect(result.success).toBe(false);
      expect(result.error).toContain('non-empty');
      // This covers the catch block!
    });

    it('should catch error when command is null', async () => {
      const result = await sandbox.execute({
        type: 'command',
        payload: null as any,
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('non-empty');
    });

    it('should catch error when command exceeds max length', async () => {
      const longCommand = 'a'.repeat(10001);
      const result = await sandbox.execute({
        type: 'command',
        payload: longCommand,
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum length');
    });
  });

  describe('executeApiCall - error branches (catch block)', () => {
    it('should catch error when request is not an object', async () => {
      const result = await sandbox.execute({
        type: 'api',
        payload: 'not an object' as any,
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('object');
    });

    it('should catch error when URL is missing', async () => {
      const result = await sandbox.execute({
        type: 'api',
        payload: { method: 'GET' },
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('URL');
    });

    it('should catch error when URL is empty', async () => {
      const result = await sandbox.execute({
        type: 'api',
        payload: { url: '', method: 'GET' },
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('URL');
    });

    it('should catch error when method is missing', async () => {
      const result = await sandbox.execute({
        type: 'api',
        payload: { url: 'http://test.com' },
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('method');
    });
  });
});
