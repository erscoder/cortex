import { OpenAIEmbeddings } from '../src/rag/embeddings';

global.fetch = jest.fn();

describe('OpenAIEmbeddings', () => {
  let embeddings: OpenAIEmbeddings;

  beforeEach(() => {
    jest.clearAllMocks();
    embeddings = new OpenAIEmbeddings({
      apiKey: 'test-key',
      model: 'text-embedding-3-small',
      dimensions: 1536,
    });
  });

  describe('embed', () => {
    it('should return embedding vector', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ embedding: mockEmbedding }],
        }),
      });

      const result = await embeddings.embed('Hello world');

      expect(result).toEqual(mockEmbedding);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/embeddings',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
          }),
        })
      );
    });

    it('should throw on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      await expect(embeddings.embed('test')).rejects.toThrow('OpenAI Embeddings API error');
    });
  });

  describe('embedBatch', () => {
    it('should return array of embeddings', async () => {
      const mockEmbeddings = [[0.1, 0.2], [0.3, 0.4]];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { embedding: mockEmbeddings[0] },
            { embedding: mockEmbeddings[1] },
          ],
        }),
      });

      const result = await embeddings.embedBatch(['Hello', 'World']);

      expect(result).toEqual(mockEmbeddings);
    });
  });
});
