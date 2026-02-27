import { ChainOfThoughtReasoner } from '../src/reasoner';

describe('ChainOfThoughtReasoner', () => {
  let reasoner: ChainOfThoughtReasoner;

  beforeEach(() => {
    reasoner = new ChainOfThoughtReasoner({ maxSteps: 3 });
  });

  describe('think', () => {
    it('should perform reasoning without LLM', async () => {
      const result = await reasoner.think('What is 2+2?', {});

      expect(result.steps).toHaveLength(3);
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
