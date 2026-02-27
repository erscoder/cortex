import { SafeSandbox } from '../src/sandbox/executor';

describe('SafeSandbox - Regex Validation Error Handling', () => {
  let sandbox: SafeSandbox;

  beforeEach(() => {
    sandbox = new SafeSandbox({
      blockedPatterns: ['valid pattern', '*/invalid/*'],
      requireApprovalPatterns: ['another valid', '[invalid'],
    });
  });

  describe('validate - invalid regex patterns', () => {
    it('should handle invalid regex in blockedPatterns gracefully', () => {
      const result = sandbox.validate({
        type: 'command',
        payload: { cmd: 'test' },
        risk: 'low',
        requiresApproval: false,
      });

      // Should still return valid: true because invalid patterns are skipped
      expect(result.valid).toBe(true);
    });

    it('should handle invalid regex in requireApprovalPatterns gracefully', () => {
      const sandbox2 = new SafeSandbox({
        blockedPatterns: [],
        requireApprovalPatterns: ['[invalid'],
      });

      const result = sandbox2.validate({
        type: 'command',
        payload: { cmd: 'test' },
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.valid).toBe(true);
    });

    it('should still block valid patterns', () => {
      const sandbox3 = new SafeSandbox({
        blockedPatterns: ['rm -rf'],
        requireApprovalPatterns: [],
      });

      const result = sandbox3.validate({
        type: 'command',
        payload: { cmd: 'rm -rf /' },
        risk: 'low',
        requiresApproval: false,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Blocked');
    });
  });
});
