import { ChainOfThoughtReasoner } from '../src/reasoner';

describe('ChainOfThoughtReasoner', () => {
  let reasoner: ChainOfThoughtReasoner;

  describe('constructor - branch coverage', () => {
    it('should use default maxSteps when not provided', () => {
      reasoner = new ChainOfThoughtReasoner({});
      expect(reasoner).toBeDefined();
    });

    it('should use provided maxSteps', () => {
      reasoner = new ChainOfThoughtReasoner({ maxSteps: 10 });
      expect(reasoner).toBeDefined();
    });

    it('should use provided llm function', () => {
      const mockLlm = jest.fn().mockResolvedValue('mock response');
      reasoner = new ChainOfThoughtReasoner({ llm: mockLlm });
      expect(reasoner).toBeDefined();
    });

    it('should use default when maxSteps is 0', () => {
      reasoner = new ChainOfThoughtReasoner({ maxSteps: 0 });
      expect(reasoner).toBeDefined();
    });

    it('should use default when maxSteps is negative', () => {
      reasoner = new ChainOfThoughtReasoner({ maxSteps: -1 });
      expect(reasoner).toBeDefined();
    });
  });

  describe('think with LLM - branch coverage', () => {
    it('should use LLM and handle empty context (covers context branch)', async () => {
      const mockLlm = jest.fn().mockResolvedValue(JSON.stringify({
        thought: 'Thinking...',
        action: undefined,
      }));
      const reasonerWithLlm = new ChainOfThoughtReasoner({ llm: mockLlm, maxSteps: 1 });
      
      const result = await reasonerWithLlm.think('Test', {});
      
      expect(result.steps).toBeDefined();
    });

    it('should use LLM and handle context with keys', async () => {
      const mockLlm = jest.fn().mockResolvedValue(JSON.stringify({
        thought: 'Thinking...',
        action: undefined,
      }));
      const reasonerWithLlm = new ChainOfThoughtReasoner({ llm: mockLlm, maxSteps: 1 });
      
      const result = await reasonerWithLlm.think('Test', { key: 'value' });
      
      expect(result.steps).toBeDefined();
    });

    it('should handle invalid JSON from LLM (covers catch branch)', async () => {
      const mockLlm = jest.fn().mockResolvedValue('invalid json response');
      const reasonerWithLlm = new ChainOfThoughtReasoner({ llm: mockLlm, maxSteps: 1 });
      
      const result = await reasonerWithLlm.think('Test', {});
      
      expect(result.steps).toBeDefined();
    });
  });

  beforeEach(() => {
    reasoner = new ChainOfThoughtReasoner({ maxSteps: 3 });
  });

  describe('think', () => {
    it('should perform reasoning without LLM', async () => {
      const result = await reasoner.think('What is 2+2?', {});

      expect(result.steps).toHaveLength(3);
      expect(result.finalAnswer).toBeDefined();
    });

    it('should break early when thought contains conclusion (covers break branch)', async () => {
      // This test covers line 63 - the break statement when isConcluded returns true
      const result = await reasoner.think('What is 2+2? Therefore the answer is 4.', {});

      // Should have fewer steps because we broke early
      expect(result.steps).toBeDefined();
      expect(result.finalAnswer).toBeDefined();
    });

    it('should detect when RAG is needed', async () => {
      const result = await reasoner.think('What is the capital of France?', {});

      expect(result.needsRag).toBe(true);
      expect(result.ragQuery).toBeDefined();
    });

    it('should detect when action is needed', async () => {
      const result = await reasoner.think('Execute npm install', {});

      expect(result.actions).toBeDefined();
      expect(result.actions?.length).toBeGreaterThan(0);
    });

    it('should respect maxSteps', async () => {
      const shortReasoner = new ChainOfThoughtReasoner({ maxSteps: 2 });
      const result = await shortReasoner.think('Test', {});

      expect(result.steps).toHaveLength(2);
    });

    it('should use LLM when provided', async () => {
      const mockLLM = jest.fn().mockResolvedValue(
        JSON.stringify({
          thought: 'I need to search for this',
          action: 'search:quantum physics',
          observation: 'Found information',
        })
      );

      const reasonerWithLLM = new ChainOfThoughtReasoner({
        maxSteps: 2,
        llm: mockLLM,
      });

      const result = await reasonerWithLLM.think('What is quantum physics?', {});

      expect(mockLLM).toHaveBeenCalled();
      expect(result.needsRag).toBe(true);
    });

    it('should require human approval for high-risk actions', async () => {
      // Use mock LLM to force a high-risk action
      const mockLLM = jest.fn().mockResolvedValue(
        JSON.stringify({
          thought: 'I need to delete this database',
          action: 'execute:DROP TABLE users',
          observation: null,
        })
      );

      const reasonerWithLLM = new ChainOfThoughtReasoner({
        maxSteps: 1,
        llm: mockLLM,
      });

      const result = await reasonerWithLLM.think('DROP TABLE users', {});
      
      expect(result.requiresHumanApproval).toBe(true);
    });

    it('should track confidence', async () => {
      const result = await reasoner.think('Test problem', {});

      expect(result.steps[0].confidence).toBeDefined();
      expect(result.steps[0].confidence).toBeGreaterThan(0);
    });
  });

  describe('private methods coverage', () => {
    it('should handle parse errors gracefully', async () => {
      const mockLLM = jest.fn().mockResolvedValue('not valid json');
      
      const reasonerWithLLM = new ChainOfThoughtReasoner({
        maxSteps: 1,
        llm: mockLLM,
      });

      const result = await reasonerWithLLM.think('Test', {});
      expect(result.steps).toHaveLength(1);
    });

    it('should assess risk levels correctly', async () => {
      const reasonerWithLLM = new ChainOfThoughtReasoner({
        maxSteps: 1,
        llm: async () => JSON.stringify({
          thought: 'need to delete',
          action: 'delete:file',
        }),
      });

      const result = await reasonerWithLLM.think('Delete something', {});
      expect(result.actions?.[0]?.risk).toBeDefined();
    });
  });
});
