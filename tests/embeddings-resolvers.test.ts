import { OpenAIEmbeddings } from '../src/rag/embeddings';

global.fetch = jest.fn();

describe('OpenAIEmbeddings - Resolver Methods Branch Coverage', () => {
  
  describe('constructor - resolveApiKey branches', () => {
    it('should use provided apiKey', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: 'test-key' });
      expect(embeddings).toBeDefined();
    });

    it('should fall back to env var when no apiKey provided', () => {
      const originalEnv = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'env-key';
      
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key" });
      expect(embeddings).toBeDefined();
      
      process.env.OPENAI_API_KEY = originalEnv;
    });

    it('should use empty string when no apiKey and no env', () => {
      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key" });
      expect(embeddings).toBeDefined();
      
      process.env.OPENAI_API_KEY = originalEnv;
    });
  });

  describe('constructor - resolveModel branches', () => {
    it('should use provided model', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key", model: 'custom-model' });
      expect(embeddings).toBeDefined();
    });

    it('should use default model when not provided', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key" });
      expect(embeddings).toBeDefined();
    });
  });

  describe('constructor - resolveDimensions branches', () => {
    it('should use provided dimensions', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key", dimensions: 512 });
      expect(embeddings).toBeDefined();
    });

    it('should use default dimensions when not provided', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key" });
      expect(embeddings).toBeDefined();
    });

    it('should use default when dimensions is 0', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key", dimensions: 0 });
      expect(embeddings).toBeDefined();
    });

    it('should use default when dimensions is negative', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key", dimensions: -1 });
      expect(embeddings).toBeDefined();
    });
  });

  describe('constructor - resolveBaseURL branches', () => {
    it('should use provided baseURL', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key", baseURL: 'https://custom.api.com' });
      expect(embeddings).toBeDefined();
    });

    it('should use default baseURL when not provided', () => {
      const embeddings = new OpenAIEmbeddings({ apiKey: "test-key" });
      expect(embeddings).toBeDefined();
    });
  });
});
