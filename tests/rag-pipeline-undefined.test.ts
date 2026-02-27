import { HybridRAGPipeline } from '../src/rag/pipeline';

describe('HybridRAGPipeline - buildContext undefined coverage', () => {
  let pipeline: HybridRAGPipeline;

  beforeEach(() => {
    const mockVectorStore = {
      add: jest.fn(),
      search: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    };
    
    const mockEmbedding = {
      embed: jest.fn().mockResolvedValue([0.1, 0.2]),
    };
    
    pipeline = new HybridRAGPipeline({
      vectorStore: mockVectorStore as any,
      embeddingModel: mockEmbedding as any,
    });
  });

  describe('buildContext - undefined/null content branches', () => {
    it('should skip results with undefined content', async () => {
      const results = [
        { id: '1', content: undefined as any, source: 'test', score: 0.9, metadata: {} },
        { id: '2', content: 'valid content', source: 'test', score: 0.8, metadata: {} },
      ];

      const context = await pipeline.buildContext(results, 1000);
      
      // Should only include the valid content
      expect(context).toContain('valid content');
      expect(context).not.toContain('undefined');
    });

    it('should skip results with null content', async () => {
      const results = [
        { id: '1', content: null as any, source: 'test', score: 0.9, metadata: {} },
        { id: '2', content: 'valid', source: 'test', score: 0.8, metadata: {} },
      ];

      const context = await pipeline.buildContext(results, 1000);
      
      expect(context).toContain('valid');
      expect(context).not.toContain('null');
    });

    it('should handle empty string content', async () => {
      const results = [
        { id: '1', content: '', source: 'test', score: 0.9, metadata: {} },
        { id: '2', content: 'valid', source: 'test', score: 0.8, metadata: {} },
      ];

      const context = await pipeline.buildContext(results, 1000);
      
      // Empty string is falsy, should be skipped
      expect(context).toContain('valid');
    });

    it('should handle all results being undefined', async () => {
      const results = [
        { id: '1', content: undefined as any, source: 'test', score: 0.9, metadata: {} },
        { id: '2', content: undefined as any, source: 'test', score: 0.8, metadata: {} },
      ];

      const context = await pipeline.buildContext(results, 1000);
      
      // Should return empty string
      expect(context).toBe('');
    });

    it('should include results with valid content', async () => {
      const results = [
        { id: '1', content: 'Content 1', source: 'source1', score: 0.9, metadata: {} },
        { id: '2', content: 'Content 2', source: 'source2', score: 0.8, metadata: {} },
      ];

      const context = await pipeline.buildContext(results, 1000);
      
      expect(context).toContain('Content 1');
      expect(context).toContain('Content 2');
      expect(context).toContain('source1');
      expect(context).toContain('source2');
    });
  });
});
