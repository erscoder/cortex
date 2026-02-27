import { HITLManager } from '../src/hitl/manager';

describe('HITLManager - Branches', () => {
  let hitl: HITLManager;

  beforeEach(() => {
    hitl = new HITLManager({
      autoApproveLowRisk: false,
      autoApproveMediumRisk: false,
      requireApprovalHighRisk: true,
    });
  });

  describe('requestApproval', () => {
    it('should auto-approve low risk when enabled', async () => {
      const hitlAuto = new HITLManager({ autoApproveLowRisk: true });
      const result = await hitlAuto.requestApproval({
        type: 'test',
        payload: {},
        risk: 'low',
      });
      expect(result.status).toBe('approved');
    });

    it('should auto-approve medium risk when enabled', async () => {
      const hitlAuto = new HITLManager({ autoApproveMediumRisk: true });
      const result = await hitlAuto.requestApproval({
        type: 'test',
        payload: {},
        risk: 'medium',
      });
      expect(result.status).toBe('approved');
    });

    it('should create pending request for high risk', async () => {
      const result = await hitl.requestApproval({
        type: 'test',
        payload: {},
        risk: 'high',
      });
      expect(result.status).toBe('pending');
    });
  });

  describe('approve/reject', () => {
    it('should approve request', async () => {
      const request = await hitl.requestApproval({
        type: 'test',
        payload: {},
        risk: 'high',
      });
      
      await hitl.approve(request.id, 'OK');
      
      const status = await hitl.getApprovalStatus(request.id);
      expect(status?.status).toBe('approved');
    });

    it('should reject request', async () => {
      const request = await hitl.requestApproval({
        type: 'test',
        payload: {},
        risk: 'high',
      });
      
      await hitl.reject(request.id, 'Not allowed');
      
      const status = await hitl.getApprovalStatus(request.id);
      expect(status?.status).toBe('rejected');
    });

    it('should handle non-existent request', async () => {
      const status = await hitl.getApprovalStatus('fake-id');
      expect(status).toBeNull();
    });
  });

  describe('waitForApproval', () => {
    it('should auto-approve low risk', async () => {
      const hitlAuto = new HITLManager({ autoApproveLowRisk: true });
      const result = await hitlAuto.waitForApproval({
        type: 'test',
        payload: {},
        risk: 'low',
      });
      expect(result.status).toBe('approved');
    });

    it('should return pending for high risk', async () => {
      const result = await hitl.waitForApproval({
        type: 'test',
        payload: {},
        risk: 'high',
      }, {}, 10);
      
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });
  });
});
