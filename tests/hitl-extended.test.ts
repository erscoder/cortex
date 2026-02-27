import { HITLManager } from '../src/hitl/manager';

describe('HITLManager - Extended Coverage', () => {
  let hitl: HITLManager;

  beforeEach(() => {
    hitl = new HITLManager({
      autoApproveLowRisk: true,
      autoApproveMediumRisk: true,
      requireApprovalHighRisk: true,
    });
  });

  describe('requestApproval - risk levels', () => {
    it('should auto-approve medium risk when configured', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'npm install',
        risk: 'medium',
      });

      expect(request.status).toBe('approved');
    });

    it('should auto-approve high risk when configured', async () => {
      const hitlNoRequireHigh = new HITLManager({
        autoApproveLowRisk: true,
        autoApproveMediumRisk: false,
        requireApprovalHighRisk: false,
      });

      const request = await hitlNoRequireHigh.requestApproval({
        type: 'command',
        payload: 'DROP TABLE',
        risk: 'high',
      });

      expect(request.status).toBe('approved');
    });

    it('should include context in rationale', async () => {
      const request = await hitl.requestApproval(
        { type: 'api', payload: {}, risk: 'high' },
        { userId: 'user-123', action: 'create' }
      );

      expect(request.rationale).toContain('userId');
      expect(request.rationale).toContain('user-123');
    });

    it('should generate rationale without context', async () => {
      const request = await hitl.requestApproval({
        type: 'api',
        payload: {},
        risk: 'high',
      });

      expect(request.rationale).toContain('api');
    });
  });

  describe('notification callback', () => {
    it('should call notification callback on approval request', async () => {
      const callback = jest.fn();
      hitl.setNotificationCallback(callback);

      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'rm file',
        risk: 'high',
      });

      expect(callback).toHaveBeenCalledWith(request);
    });

    it('should not call callback for auto-approved requests', async () => {
      const callback = jest.fn();
      hitl.setNotificationCallback(callback);

      await hitl.requestApproval({
        type: 'command',
        payload: 'ls',
        risk: 'low',
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getApprovalStatus', () => {
    it('should return null for non-existent request', async () => {
      const result = await hitl.getApprovalStatus('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('approve', () => {
    it('should throw for non-existent request', async () => {
      await expect(hitl.approve('fake-id')).rejects.toThrow('fake-id');
    });

    it('should set respondedBy to human', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'rm file',
        risk: 'high',
      });

      await hitl.approve(request.id, 'Approved');

      const updated = await hitl.getApprovalStatus(request.id);
      expect(updated?.respondedBy).toBe('human');
    });

    it('should use default response when not provided', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'rm file',
        risk: 'high',
      });

      await hitl.approve(request.id);

      const updated = await hitl.getApprovalStatus(request.id);
      expect(updated?.response).toBe('Approved');
    });
  });

  describe('reject', () => {
    it('should throw for non-existent request', async () => {
      await expect(hitl.reject('fake-id', 'reason')).rejects.toThrow('fake-id');
    });

    it('should set rejected status', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'rm file',
        risk: 'high',
      });

      await hitl.reject(request.id, 'Too dangerous');

      const updated = await hitl.getApprovalStatus(request.id);
      expect(updated?.status).toBe('rejected');
    });
  });
});
