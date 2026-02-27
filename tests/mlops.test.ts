import { MLflowTracker } from '../src/mlops/tracker';

describe('MLflowTracker', () => {
  let tracker: MLflowTracker;

  beforeEach(() => {
    tracker = new MLflowTracker();
  });

  const createExperiment = async () => {
    return tracker.createExperiment({
      model: 'claude-3',
      prompt: 'Test prompt',
      temperature: 0.7,
      maxTokens: 1024,
    });
  };

  describe('createExperiment', () => {
    it('should create an experiment', async () => {
      const experiment = await createExperiment();

      expect(experiment.id).toBeDefined();
      expect(experiment.status).toBe('running');
      expect(experiment.metrics).toBeDefined();
    });
  });

  describe('logMetrics', () => {
    it('should log metrics to an experiment', async () => {
      const experiment = await createExperiment();

      await tracker.logMetrics(experiment.id, {
        latency: 100,
        tokenUsage: 50,
        successRate: 0.95,
        qualityScore: 8,
        safetyScore: 10,
      });

      expect(experiment.metrics.latency).toBe(100);
    });
  });

  describe('registerModel', () => {
    it('should register a model from an experiment', async () => {
      const experiment = await createExperiment();

      await tracker.logMetrics(experiment.id, {
        latency: 100,
        tokenUsage: 50,
        successRate: 0.95,
        qualityScore: 8,
        safetyScore: 10,
      });

      const model = await tracker.registerModel(experiment.id);

      expect(model.version).toBeDefined();
      expect(model.status).toBe('stable');
    });

    it('should register beta model for low quality', async () => {
      const experiment = await createExperiment();

      await tracker.logMetrics(experiment.id, {
        latency: 100,
        tokenUsage: 50,
        successRate: 0.8,
        qualityScore: 5,
        safetyScore: 8,
      });

      const model = await tracker.registerModel(experiment.id);

      expect(model.status).toBe('beta');
    });
  });

  describe('listModels', () => {
    it('should list all models', async () => {
      const experiment = await createExperiment();
      await tracker.registerModel(experiment.id);

      const models = await tracker.listModels();
      expect(models.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const experiment = await createExperiment();
      await tracker.logMetrics(experiment.id, {
        latency: 100,
        tokenUsage: 50,
        successRate: 0.95,
        qualityScore: 8,
        safetyScore: 10,
      });
      await tracker.registerModel(experiment.id);

      const stableModels = await tracker.listModels('stable');
      expect(stableModels.every(m => m.status === 'stable')).toBe(true);
    });
  });
});
