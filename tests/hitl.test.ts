import { HITLManager } from '../src/hitl/manager';

describe('HITLManager', () => {
  let hitl: HITLManager;

  beforeEach(() => {
    hitl = new HITLManager({
      autoApproveLowRisk: true,
      autoApproveMediumRisk: false,
      requireApprovalHighRisk: true,
    });
  });

  describe('requestApproval', () => {
    it('should auto-approve low risk actions', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'ls',
        risk: 'low',
      });

      expect(request.status).toBe('approved');
      expect(request.respondedBy).toBe('system');
    });

    it('should require approval for medium risk actions', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'npm install',
        risk: 'medium',
      });

      expect(request.status).toBe('pending');
    });

    it('should require approval for high risk actions', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'DROP TABLE',
        risk: 'high',
      });

      expect(request.status).toBe('pending');
    });

    it('should store pending requests', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'rm file',
        risk: 'high',
      });

      const stored = await hitl.getApprovalStatus(request.id);
      expect(stored).toBeDefined();
      expect(stored?.id).toBe(request.id);
    });
  });

  describe('approve/reject', () => {
    it('should approve a request', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'npm install',
        risk: 'medium',
      });

      await hitl.approve(request.id, 'Approved by human');

      const updated = await hitl.getApprovalStatus(request.id);
      expect(updated?.status).toBe('approved');
      expect(updated?.response).toBe('Approved by human');
    });

    it('should reject a request', async () => {
      const request = await hitl.requestApproval({
        type: 'command',
        payload: 'rm file',
        risk: 'high',
      });

      await hitl.reject(request.id, 'Too dangerous');

      const updated = await hitl.getApprovalStatus(request.id);
      expect(updated?.status).toBe('rejected');
      expect(updated?.response).toBe('Too dangerous');
    });
  });
});
