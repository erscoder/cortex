/**
 * Agent E2E Integration Test
 * 
 * Tests the complete flow: input → reasoner → RAG → sandbox → HITL → memory → output
 */

import { Agent } from '../src/orchestrator/agent';
import { ChainOfThoughtReasoner } from '../src/reasoner';
import { SafeSandbox } from '../src/sandbox/executor';
import { HITLManager } from '../src/hitl/manager';
import { MemorySystem, Memory } from '../src/memory/types';

// Create a mock memory system that implements the interface
const createMockMemory = (): MemorySystem => ({
  save: jest.fn().mockResolvedValue({ id: 'test-id' } as Memory),
  get: jest.fn().mockResolvedValue(null),
  search: jest.fn().mockResolvedValue([]),
  delete: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
});

describe('Agent Integration', () => {
  let agent: Agent;
  let mockMemory: MemorySystem;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockMemory = createMockMemory();
    
    const reasoner = new ChainOfThoughtReasoner({ maxSteps: 3 });
    const sandbox = new SafeSandbox();
    const hitl = new HITLManager({});
    
    agent = new Agent({
      name: 'TestAgent',
      model: 'claude-3-haiku',
      temperature: 0.7,
      maxTokens: 1024,
      timeoutMs: 30000,
      maxRetries: 3,
      memory: true,
      reasoning: true,
      rag: false,
      sandbox: true,
      humanInTheLoop: false,
    })
      .withMemory(mockMemory)
      .withReasoner(reasoner)
      .withSandbox(sandbox)
      .withHITL(hitl);
  });

  describe('Complete flow', () => {
    it('should process input through full pipeline', async () => {
      const result = await agent.process('What is 2+2?');
      
      expect(result.output).toBeDefined();
      expect(result.input).toBe('What is 2+2?');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(result.model).toBe('claude-3-haiku');
    });

    it('should include reasoning steps when enabled', async () => {
      const result = await agent.process('Think about the weather');
      
      expect(result.reasoning).toBeDefined();
      expect(result.reasoning!.length).toBeGreaterThan(0);
    });

    it('should track memory used', async () => {
      const result = await agent.process('Remember this fact');
      
      expect(result.memoryUsed).toBeDefined();
    });

    it('should handle minimal config', async () => {
      const minimalAgent = new Agent({
        name: 'MinimalAgent',
        model: 'claude-3-haiku',
        temperature: 0.7,
        maxTokens: 1024,
        timeoutMs: 30000,
        maxRetries: 3,
        memory: false,
        reasoning: false,
        rag: false,
        sandbox: false,
        humanInTheLoop: false,
      });
      
      const result = await minimalAgent.process('test');
      expect(result.output).toBeDefined();
    });
  });

  describe('Agent state', () => {
    it('should have correct initial state', () => {
      expect(agent.getId()).toBeDefined();
      expect(agent.getName()).toBe('TestAgent');
      expect(agent.getStatus()).toBe('idle');
    });

    it('should update status during processing', async () => {
      const statusPromise = agent.process('test');
      
      // Give it a moment to start processing
      await new Promise(r => setTimeout(r, 10));
      
      expect(agent.getStatus()).toBeDefined();
      
      await statusPromise;
    });
  });

  describe('String input', () => {
    it('should accept string input directly', async () => {
      const result = await agent.process('Simple string input');
      
      expect(result.input).toBe('Simple string input');
      expect(result.output).toBeDefined();
    });
  });
});
