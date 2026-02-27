// RAG Pipeline - Hybrid search implementation
import { RAGPipeline, VectorStore, EmbeddingModel, SearchOptions, RetrievalResult } from './types';

export class HybridRAGPipeline implements RAGPipeline {
  private vectorStore: VectorStore;
  private embeddingModel: EmbeddingModel;
  private reranker?: (query: string, results: RetrievalResult[]) => Promise<RetrievalResult[]>;
  
  constructor(config: {
    vectorStore: VectorStore;
    embeddingModel: EmbeddingModel;
    reranker?: (query: string, results: RetrievalResult[]) => Promise<RetrievalResult[]>;
  }) {
    this.vectorStore = config.vectorStore;
    this.embeddingModel = config.embeddingModel;
    this.reranker = config.reranker;
  }
  
  async search(query: string, options: SearchOptions = { topK: 5, minScore: 0.5, includeMetadata: true }): Promise<RetrievalResult[]> {
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
  
  async buildContext(results: RetrievalResult[], maxTokens: number): Promise<string> {
    const chunks: string[] = [];
    let totalTokens = 0;
    const tokensPerChar = 0.25; // rough estimate
    
    for (const result of results) {
      const resultTokens = result.content.length * tokensPerChar;
      if (totalTokens + resultTokens > maxTokens) break;
      
      chunks.push(`[${result.source}]\n${result.content}`);
      totalTokens += resultTokens;
    }
    
    return chunks.join('\n\n---\n\n');
  }
}
