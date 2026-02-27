"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridRAGPipeline = void 0;
class HybridRAGPipeline {
    vectorStore;
    embeddingModel;
    reranker;
    constructor(config) {
        this.vectorStore = config.vectorStore;
        this.embeddingModel = config.embeddingModel;
        this.reranker = config.reranker;
    }
    async search(query, options = { topK: 5, minScore: 0.5, includeMetadata: true }) {
        // 1. Generate query embedding
        const queryEmbedding = await this.embeddingModel.embed(query);
        // 2. Vector search
        const vectorResults = await this.vectorStore.search(queryEmbedding, options);
        // 3. Rerank if available
        if (this.reranker) {
            return this.reranker(query, vectorResults);
        }
        return vectorResults;
    }
    async buildContext(results, maxTokens) {
        const chunks = [];
        let totalTokens = 0;
        const tokensPerChar = 0.25; // rough estimate
        for (const result of results) {
            if (!result.content)
                continue; // Skip if content is undefined/null
            const resultTokens = result.content.length * tokensPerChar;
            if (totalTokens + resultTokens > maxTokens)
                break;
            chunks.push(`[${result.source}]\n${result.content}`);
            totalTokens += resultTokens;
        }
        return chunks.join('\n\n---\n\n');
    }
}
exports.HybridRAGPipeline = HybridRAGPipeline;
//# sourceMappingURL=pipeline.js.map