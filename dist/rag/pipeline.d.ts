import { RAGPipeline, VectorStore, EmbeddingModel, SearchOptions, RetrievalResult } from './types';
export declare class HybridRAGPipeline implements RAGPipeline {
    private vectorStore;
    private embeddingModel;
    private reranker?;
    constructor(config: {
        vectorStore: VectorStore;
        embeddingModel: EmbeddingModel;
        reranker?: (query: string, results: RetrievalResult[]) => Promise<RetrievalResult[]>;
    });
    search(query: string, options?: SearchOptions): Promise<RetrievalResult[]>;
    buildContext(results: RetrievalResult[], maxTokens: number): Promise<string>;
}
//# sourceMappingURL=pipeline.d.ts.map