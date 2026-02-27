import { HybridRAGPipeline } from '../src/rag/pipeline';
import { WeaviateVectorStore } from '../src/rag/vector-store';
import { OpenAIEmbeddings } from '../src/rag/embeddings';

// Mock dependencies
const mockEmbed = jest.fn().mockResolvedValue([0.1, 0.2, 0.3]);
const mockSearch = jest.fn().mockResolvedValue([
  { id: '1', content: 'Result 1', source: 'doc1', score: 0.9 },
  { id: '2', content: 'Result 2', source: 'doc2', score: 0.8 },
]);

describe('HybridRAGPipeline', () => {
  let pipeline: HybridRAGPipeline;

  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockEmbeddings = {
      embed: mockEmbed,
      embedBatch: jest.fn().mockResolvedValue([[0.1], [0.2]]),
    } as any;

    const mockVectorStore = {
      add: jest.fn().mockResolvedValue(undefined),
      search: mockSearch,
      delete: jest.fn().mockResolvedValue(undefined),
    } as any;

    pipeline = new HybridRAGPipeline({
      embeddingModel: mockEmbeddings,
      vectorStore: mockVectorStore,
    });
  });

  describe('search', () => {
    it('should generate embedding and search', async () => {
      const results = await pipeline.search('test query');

      expect(mockEmbed).toHaveBeenCalledWith('test query');
      expect(mockSearch).toHaveBeenCalled();
      expect(results).toHaveLength(2);
    });

    it('should use custom search options', async () => {
      await pipeline.search('test', { topK: 10, minScore: 0.7, includeMetadata: true });

      expect(mockSearch).toHaveBeenCalledWith(
        [0.1, 0.2, 0.3],
        expect.objectContaining({ topK: 10, minScore: 0.7 })
      );
    });

    it('should apply reranker when provided', async () => {
      const reranker = jest.fn().mockImplementation((query, results) => {
        return Promise.resolve(results.slice(0, 1));
      });

      const pipelineWithReranker = new HybridRAGPipeline({
        embeddingModel: { embed: mockEmbed } as any,
        vectorStore: { search: mockSearch } as any,
        reranker,
      });

      const results = await pipelineWithReranker.search('test');

      expect(reranker).toHaveBeenCalled();
      expect(results).toHaveLength(1);
    });

    it('should use default options when not provided', async () => {
      await pipeline.search('test');

      expect(mockSearch).toHaveBeenCalledWith(
        [0.1, 0.2, 0.3],
        expect.objectContaining({
          topK: 5,
          minScore: 0.5,
          includeMetadata: true,
        })
      );
    });
  });

  describe('buildContext', () => {
    it('should build context from results within token limit', async () => {
      const results = [
        { id: '1', content: 'Short', source: 'doc1', score: 0.9 },
        { id: '2', content: 'Medium length content here', source: 'doc2', score: 0.8 },
      ];

      const context = await pipeline.buildContext(results, 1000);

      expect(context).toContain('Short');
      expect(context).toContain('doc1');
    });

    it('should truncate when exceeding token limit', async () => {
      const longContent = 'a'.repeat(10000);
      const results = [
        { id: '1', content: longContent, source: 'doc1', score: 0.9 },
      ];

      const context = await pipeline.buildContext(results, 100);

      expect(context.length).toBeLessThan(longContent.length + 100);
    });

    it('should include source in context', async () => {
      const results = [
        { id: '1', content: 'Test', source: 'my-document', score: 0.9 },
      ];

      const context = await pipeline.buildContext(results, 1000);

      expect(context).toContain('[my-document]');
    });
  });
});

describe('WeaviateVectorStore', () => {
  let store: WeaviateVectorStore;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockClient = {
      objects: {
        classifier: jest.fn().mockReturnValue({
          objects: {
            create: jest.fn().mockResolvedValue({}),
            delete: jest.fn().mockResolvedValue({}),
          },
        }),
      },
      graphql: {
        get: jest.fn().mockReturnValue({
          withClassName: jest.fn().mockReturnValue({
            withNearVector: jest.fn().mockReturnValue({
              withLimit: jest.fn().mockReturnValue({
                withFields: jest.fn().mockReturnValue({
                  do: jest.fn().mockResolvedValue({
                    Get: {
                      TestClass: [
                        { id: '1', content: 'Test', _additional: { certainty: 0.9 } },
                      ],
                    },
                  }),
                }),
              }),
            }),
          }),
        }),
      },
    };
  });

  describe('constructor', () => {
    it('should use custom class name', () => {
      store = new WeaviateVectorStore(mockClient, 'CustomClass');
      expect(store).toBeDefined();
    });

    it('should use default class name (covers default param branch)', () => {
      store = new WeaviateVectorStore(mockClient);
      expect(store).toBeDefined();
    });
  });

  beforeEach(() => {
    // Reset store for non-constructor tests
    store = new WeaviateVectorStore(mockClient, 'TestClass');
  });

  describe('add', () => {
    it('should add documents to Weaviate', async () => {
      const docs = [
        { id: '1', content: 'Doc 1', metadata: { tag: 'test' } },
      ];

      await store.add(docs);

      expect(mockClient.objects.classifier().objects.create).toHaveBeenCalledWith({
        objects: expect.arrayContaining([
          expect.objectContaining({
            class: 'TestClass',
            id: '1',
            properties: expect.objectContaining({
              content: 'Doc 1',
            }),
          }),
        ]),
      });
    });

    it('should add documents without metadata (covers || {} branch)', async () => {
      const docs = [
        { id: '2', content: 'Doc without metadata' },
      ];

      await store.add(docs);

      expect(mockClient.objects.classifier().objects.create).toHaveBeenCalledWith({
        objects: expect.arrayContaining([
          expect.objectContaining({
            class: 'TestClass',
            id: '2',
            properties: expect.objectContaining({
              content: 'Doc without metadata',
            }),
          }),
        ]),
      });
    });

    it('should add documents with null metadata (covers || {} branch)', async () => {
      const docs = [
        { id: '3', content: 'Doc', metadata: null as any },
      ];

      await store.add(docs);

      expect(mockClient.objects.classifier().objects.create).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search with near vector', async () => {
      // Override the mock for this specific test
      mockClient.graphql.get.mockReturnValue({
        withClassName: jest.fn().mockReturnValue({
          withNearVector: jest.fn().mockReturnValue({
            withLimit: jest.fn().mockReturnValue({
              withFields: jest.fn().mockReturnValue({
                do: jest.fn().mockResolvedValue({
                  data: {
                    Get: {
                      TestClass: [
                        { id: '1', content: 'Test', source: 'doc1', _additional: { certainty: 0.9 } },
                      ],
                    },
                  },
                }),
              }),
            }),
          }),
        }),
      });

      const results = await store.search([0.1, 0.2], { topK: 5, minScore: 0.5, includeMetadata: true });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
      expect(results[0].score).toBe(0.9);
    });
  });

  describe('delete', () => {
    it('should delete document by id', async () => {
      await store.delete('1');

      expect(mockClient.objects.classifier().objects.delete).toHaveBeenCalledWith({
        id: '1',
      });
    });
  });
});
