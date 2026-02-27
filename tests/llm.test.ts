import { LLMClient } from '../src/llm/client';

global.fetch = jest.fn();

describe('LLMClient', () => {
  let client: LLMClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new LLMClient({
      provider: "minimax",
      apiKey: 'test-key',
      model: 'abab6.5s-chat',
    });
  });

  describe('complete', () => {
    it('should return completion content', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20 },
        }),
      });

      const result = await client.complete('Hello');

      expect(result.content).toBe('Test response');
      expect(result.usage?.inputTokens).toBe(10);
      expect(result.usage?.outputTokens).toBe(20);
    });

    it('should throw on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'API Error',
      });

      await expect(client.complete('test')).rejects.toThrow('LLM API error');
    });

    it('should use system prompt when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
        }),
      });

      await client.complete('Question?', 'You are a helpful assistant.');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.minimax.chat/v1/text/chatcompletion_v2',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('You are a helpful assistant'),
        })
      );
    });
  });

  describe('asReasonerFunction', () => {
    it('should return a function compatible with reasoner', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"thought": "test"}' } }],
        }),
      });

      const reasonerFn = client.asReasonerFunction();
      const result = await reasonerFn('Think about this');

      expect(result).toBe('{"thought": "test"}');
    });
  });
});
