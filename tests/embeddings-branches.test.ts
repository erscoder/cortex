import { OpenAIEmbeddings } from '../src/rag/embeddings';

global.fetch = jest.fn();

describe('OpenAIEmbeddings - Branch Coverage', () => {
  let embeddings: OpenAIEmbeddings;

  beforeEach(() => {
    jest.clearAllMocks();
    embeddings = new OpenAIEmbeddings({ apiKey: 'test', model: 'text-embedding-3-small' });
  });

  describe('embed - error handling branches', () => {
    it('should handle non-ok response (branch coverage)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      await expect(embeddings.embed('test')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle ok response but empty data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const result = await embeddings.embed('test');
      expect(result).toEqual([]);
    });

    it('should handle response with missing embedding', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ embedding: null }] }),
      });

      const result = await embeddings.embed('test');
      // This covers the case where embedding might be null
      expect(result).toBeDefined();
    });
  });

  describe('embedBatch - branches', () => {
    it('should handle empty input array', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const result = await embeddings.embedBatch([]);
      expect(result).toEqual([]);
    });

    it('should handle API error in batch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      });

      await expect(embeddings.embedBatch(['a', 'b'])).rejects.toThrow();
    });
  });
});
