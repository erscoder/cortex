import { MLOpsTracker, Experiment, ModelVersion, ProductionMetrics } from './types';
export declare class MLflowTracker implements MLOpsTracker {
    private experiments;
    private models;
    private productionMetrics;
    createExperiment(config: Experiment['config']): Promise<Experiment>;
    logMetrics(experimentId: string, metrics: Experiment['metrics']): Promise<void>;
    completeExperiment(experimentId: string, status: 'completed' | 'failed'): Promise<Experiment>;
    registerModel(experimentId: string): Promise<ModelVersion>;
    getModel(version: string): Promise<ModelVersion | null>;
    listModels(status?: ModelVersion['status']): Promise<ModelVersion[]>;
    logProductionMetrics(metrics: ProductionMetrics): Promise<void>;
    getProductionMetrics(since: Date): Promise<ProductionMetrics[]>;
}
//# sourceMappingURL=tracker.d.ts.map