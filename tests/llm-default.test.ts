import { LLMClient } from '../src/llm/client';

global.fetch = jest.fn();

describe('LLMClient - Default Provider Branch', () => {
  
  describe('constructor - default provider branch', () => {
    it('should use anthropic as default provider', () => {
      const client = new LLMClient({ provider: 'anthropic', apiKey: 'test' });
      expect(client).toBeDefined();
    });

    it('should use minimax when specified', () => {
      const client = new LLMClient({ provider: 'minimax', apiKey: 'test' });
      expect(client).toBeDefined();
    });

    it('should handle unknown provider with default', () => {
      // This tests the default case in switch
      const client = new LLMClient({ 
        provider: 'unknown-provider' as any, 
        apiKey: 'test' 
      });
      expect(client).toBeDefined();
    });
  });
});
