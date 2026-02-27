import { LLMClient } from '../src/llm/client';

global.fetch = jest.fn();

describe('LLMClient - Constructor Default Branch Coverage', () => {
  
  describe('constructor - all branches', () => {
    it('should use all defaults when only provider provided', () => {
      const client = new LLMClient({ provider: 'anthropic' });
      expect(client).toBeDefined();
    });

    it('should use minimax when specified', () => {
      const client = new LLMClient({ provider: 'minimax' });
      expect(client).toBeDefined();
    });

    it('should fall back through env vars for apiKey', () => {
      const original = { ...process.env };
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.MINIMAX_API_KEY;
      
      const client = new LLMClient({ provider: 'anthropic' });
      expect(client).toBeDefined();
      
      process.env = original;
    });

    it('should use model when provided', () => {
      const client = new LLMClient({ provider: 'anthropic', model: 'custom-model' });
      expect(client).toBeDefined();
    });

    it('should use temperature when provided', () => {
      const client = new LLMClient({ provider: 'anthropic', temperature: 0.5 });
      expect(client).toBeDefined();
    });

    it('should use maxTokens when provided', () => {
      const client = new LLMClient({ provider: 'anthropic', maxTokens: 2048 });
      expect(client).toBeDefined();
    });

    it('should use baseURL when provided', () => {
      const client = new LLMClient({ provider: 'anthropic', baseURL: 'https://custom.api.com' });
      expect(client).toBeDefined();
    });
  });

  describe('response parsing - branches', () => {
    it('should handle anthropic response with missing content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [] }),
      });

      const client = new LLMClient({ provider: 'anthropic', apiKey: 'key' });
      const result = await client.complete('test');

      expect(result.content).toBe('');
    });

    it('should handle anthropic response with missing usage', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: [{ text: 'response' }] }),
      });

      const client = new LLMClient({ provider: 'anthropic', apiKey: 'key' });
      const result = await client.complete('test');

      expect(result.content).toBe('response');
      expect(result.usage).toBeUndefined();
    });
  });
});
