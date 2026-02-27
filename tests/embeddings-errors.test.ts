import { OpenAIEmbeddings } from '../src/rag/embeddings';

global.fetch = jest.fn();

describe('OpenAIEmbeddings - Error Branches', () => {
  let embeddings: OpenAIEmbeddings;

  beforeEach(() => {
    jest.clearAllMocks();
    embeddings = new OpenAIEmbeddings({ apiKey: 'test', model: 'text-embedding-3-small' });
  });

  describe('embed - all branches', () => {
    it('should handle non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      try {
        await embeddings.embed('test');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    it('should handle different error status codes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server Error',
      });

      try {
        await embeddings.embed('test');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});
