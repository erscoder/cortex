import { MLflowTracker } from '../src/mlops/tracker';

describe('MLflowTracker - Extended Coverage', () => {
  let tracker: MLflowTracker;

  beforeEach(() => {
    tracker = new MLflowTracker();
  });

  describe('createExperiment', () => {
    it('should create experiment with all config fields', async () => {
      const experiment = await tracker.createExperiment({
        model: 'claude-3',
        prompt: 'Test prompt',
        temperature: 0.7,
        maxTokens: 1024,
        embeddingModel: 'text-embedding-3-small',
      });

      expect(experiment.status).toBe('running');
    });

    it('should throw when logging to non-existent experiment', async () => {
      await expect(
        tracker.logMetrics('fake-id', { latency: 100, tokenUsage: 50, successRate: 0.9, qualityScore: 8, safetyScore: 10 })
      ).rejects.toThrow('Experiment fake-id not found');
    });

    it('should throw when completing non-existent experiment', async () => {
      await expect(
        tracker.completeExperiment('fake-id', 'completed')
      ).rejects.toThrow('Experiment fake-id not found');
    });

    it('should throw when registering non-existent experiment', async () => {
      await expect(
        tracker.registerModel('fake-id')
      ).rejects.toThrow('Experiment fake-id not found');
    });
  });

  describe('completeExperiment', () => {
    it('should mark experiment as completed', async () => {
      const exp = await tracker.createExperiment({
        model: 'claude-3',
        prompt: 'Test',
        temperature: 0.7,
        maxTokens: 1024,
      });

      const completed = await tracker.completeExperiment(exp.id, 'completed');
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    it('should mark experiment as failed', async () => {
      const exp = await tracker.createExperiment({
        model: 'claude-3',
        prompt: 'Test',
        temperature: 0.7,
        maxTokens: 1024,
      });

      const failed = await tracker.completeExperiment(exp.id, 'failed');
      expect(failed.status).toBe('failed');
    });
  });

  describe('registerModel', () => {
    it('should register stable model for high quality', async () => {
      const exp = await tracker.createExperiment({
        model: 'claude-3',
        prompt: 'Test',
        temperature: 0.7,
        maxTokens: 1024,
      });

      await tracker.logMetrics(exp.id, {
        latency: 100,
        tokenUsage: 50,
        successRate: 0.95,
        qualityScore: 9,
        safetyScore: 10,
      });

      const model = await tracker.registerModel(exp.id);
      expect(model.status).toBe('stable');
    });

    it('should register beta model for medium quality', async () => {
      const exp = await tracker.createExperiment({
        model: 'claude-3',
        prompt: 'Test',
        temperature: 0.7,
        maxTokens: 1024,
      });

      await tracker.logMetrics(exp.id, {
        latency: 100,
        tokenUsage: 50,
        successRate: 0.7,
        qualityScore: 6,
        safetyScore: 7,
      });

      const model = await tracker.registerModel(exp.id);
      expect(model.status).toBe('beta');
    });
  });

  describe('getModel', () => {
    it('should return null for non-existent model', async () => {
      const result = await tracker.getModel('v-nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('logProductionMetrics', () => {
    it('should log production metrics', async () => {
      await tracker.logProductionMetrics({
        timestamp: new Date(),
        requests: 1000,
        errors: 10,
        latencyP50: 100,
        latencyP95: 500,
        latencyP99: 1000,
        tokenUsage: 50000,
        cost: 0.5,
      });

      const metrics = await tracker.getProductionMetrics(new Date(0));
      expect(metrics).toHaveLength(1);
    });

    it('should warn on high error rate', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await tracker.logProductionMetrics({
        timestamp: new Date(),
        requests: 100,
        errors: 10,
        latencyP50: 100,
        latencyP95: 500,
        latencyP99: 1000,
        tokenUsage: 1000,
        cost: 0.1,
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('High error rate')
      );
      warnSpy.mockRestore();
    });

    it('should warn on high latency', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await tracker.logProductionMetrics({
        timestamp: new Date(),
        requests: 100,
        errors: 1,
        latencyP50: 100,
        latencyP95: 3000,
        latencyP99: 5000,
        tokenUsage: 1000,
        cost: 0.1,
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('High latency')
      );
      warnSpy.mockRestore();
    });
  });

  describe('getProductionMetrics', () => {
    it('should filter metrics by date', async () => {
      await tracker.logProductionMetrics({
        timestamp: new Date(0),
        requests: 100,
        errors: 1,
        latencyP50: 100,
        latencyP95: 500,
        latencyP99: 1000,
        tokenUsage: 1000,
        cost: 0.1,
      });

      await tracker.logProductionMetrics({
        timestamp: new Date(),
        requests: 200,
        errors: 2,
        latencyP50: 150,
        latencyP95: 600,
        latencyP99: 1100,
        tokenUsage: 2000,
        cost: 0.2,
      });

      const recentMetrics = await tracker.getProductionMetrics(new Date());
      expect(recentMetrics).toHaveLength(1);
    });
  });
});
