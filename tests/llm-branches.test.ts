import { LLMClient } from '../src/llm/client';

global.fetch = jest.fn();

describe('LLMClient - Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('complete - error handling', () => {
    it('should handle non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const client = new LLMClient({ provider: 'minimax', apiKey: 'test' });
      await expect(client.complete('test')).rejects.toThrow('500');
    });

    it('should handle empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      });

      const client = new LLMClient({ provider: 'minimax', apiKey: 'test' });
      const result = await client.complete('test');
      expect(result.content).toBe('');
    });

    it('should handle response with null message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: null }] }),
      });

      const client = new LLMClient({ provider: 'minimax', apiKey: 'test' });
      const result = await client.complete('test');
      expect(result.content).toBe('');
    });
  });

  describe('complete - different providers', () => {
    it('should use Anthropic headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          content: [{ text: 'test response' }],
          usage: { input_tokens: 10, output_tokens: 20 }
        }),
      });

      const client = new LLMClient({ provider: 'anthropic', apiKey: 'test-key' });
      await client.complete('test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
          }),
        })
      );
    });

    it('should use custom baseURL when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'test' } }] }),
      });

      const client = new LLMClient({ 
        provider: 'minimax', 
        apiKey: 'test', 
        baseURL: 'https://custom.api.com/v1' 
      });
      await client.complete('test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://custom.api.com/v1/text/chatcompletion_v2',
        expect.anything()
      );
    });
  });

  describe('asReasonerFunction', () => {
    it('should return function that calls complete', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'response' } }] }),
      });

      const client = new LLMClient({ provider: 'minimax', apiKey: 'test' });
      const fn = client.asReasonerFunction();
      const result = await fn('prompt');

      expect(result).toBe('response');
    });
  });
});
