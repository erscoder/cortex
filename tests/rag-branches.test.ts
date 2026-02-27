import { HybridRAGPipeline } from '../src/rag/pipeline';

// Mock
const mockEmbed = jest.fn().mockResolvedValue([0.1]);
const mockSearch = jest.fn().mockResolvedValue([]);

describe('HybridRAGPipeline - Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search - branch coverage', () => {
    it('should return results when reranker provided but returns empty', async () => {
      const pipeline = new HybridRAGPipeline({
        embeddingModel: { embed: mockEmbed } as any,
        vectorStore: { search: mockSearch } as any,
        reranker: async () => [], // Returns empty
      });

      const results = await pipeline.search('test');
      expect(results).toEqual([]);
    });

    it('should handle search with all options', async () => {
      mockSearch.mockResolvedValueOnce([
        { id: '1', content: 'test', source: 'src', score: 0.9, metadata: {} }
      ]);

      const pipeline = new HybridRAGPipeline({
        embeddingModel: { embed: mockEmbed } as any,
        vectorStore: { search: mockSearch } as any,
      });

      const results = await pipeline.search('test', { 
        topK: 5, 
        minScore: 0.5, 
        includeMetadata: true,
        filters: { type: 'fact' }
      });

      expect(results).toHaveLength(1);
    });
  });

  describe('buildContext - branch coverage', () => {
    it('should handle empty results', async () => {
      const pipeline = new HybridRAGPipeline({
        embeddingModel: { embed: mockEmbed } as any,
        vectorStore: { search: mockSearch } as any,
      });

      const context = await pipeline.buildContext([], 1000);
      expect(context).toBe('');
    });

    it('should include metadata when available', async () => {
      const pipeline = new HybridRAGPipeline({
        embeddingModel: { embed: mockEmbed } as any,
        vectorStore: { search: mockSearch } as any,
      });

      const results = [
        { id: '1', content: 'Test', source: 'doc', score: 0.9, metadata: { author: 'test' } }
      ];

      const context = await pipeline.buildContext(results, 1000);
      expect(context).toContain('Test');
    });
  });
});
