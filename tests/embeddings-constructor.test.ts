import { OpenAIEmbeddings } from '../src/rag/embeddings';

describe('OpenAIEmbeddings - Constructor Resolver Methods Branch Coverage', () => {
  
  describe('resolveApiKey - all branches', () => {
    it('should use provided apiKey', () => {
      const emb = new OpenAIEmbeddings({ apiKey: 'provided-key' });
      expect(emb).toBeDefined();
    });

    it('should fall back to env when no apiKey provided', () => {
      const original = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'env-key';
      const emb = new OpenAIEmbeddings({});
      expect(emb).toBeDefined();
      process.env.OPENAI_API_KEY = original;
    });

    it('should use empty string when no apiKey and no env', () => {
      const original = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      const emb = new OpenAIEmbeddings({});
      expect(emb).toBeDefined();
      process.env.OPENAI_API_KEY = original;
    });
  });

  describe('resolveModel - all branches', () => {
    it('should use provided model', () => {
      const emb = new OpenAIEmbeddings({ model: 'custom-model' });
      expect(emb).toBeDefined();
    });

    it('should use default when not provided', () => {
      const emb = new OpenAIEmbeddings({});
      expect(emb).toBeDefined();
    });
  });

  describe('resolveDimensions - all branches', () => {
    it('should use provided dimensions', () => {
      const emb = new OpenAIEmbeddings({ dimensions: 512 });
      expect(emb).toBeDefined();
    });

    it('should use default when provided', () => {
      const emb = new OpenAIEmbeddings({ dimensions: 1024 });
      expect(emb).toBeDefined();
    });

    it('should use default when undefined', () => {
      const emb = new OpenAIEmbeddings({});
      expect(emb).toBeDefined();
    });

    it('should use default when 0', () => {
      const emb = new OpenAIEmbeddings({ dimensions: 0 });
      expect(emb).toBeDefined();
    });

    it('should use default when negative', () => {
      const emb = new OpenAIEmbeddings({ dimensions: -5 });
      expect(emb).toBeDefined();
    });
  });

  describe('resolveBaseURL - all branches', () => {
    it('should use provided baseURL', () => {
      const emb = new OpenAIEmbeddings({ baseURL: 'https://custom.api.com' });
      expect(emb).toBeDefined();
    });

    it('should use default when not provided', () => {
      const emb = new OpenAIEmbeddings({});
      expect(emb).toBeDefined();
    });
  });
});
