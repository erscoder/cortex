import { PostgresLongTermMemory } from '../src/memory/long-term';

// Mock pg Pool
const mockQuery = jest.fn();
const mockEnd = jest.fn();

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery,
      end: mockEnd,
    })),
  };
});

describe('PostgresLongTermMemory', () => {
  let memory: PostgresLongTermMemory;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    memory = new PostgresLongTermMemory({
      host: 'localhost',
      database: 'test',
    });
  });

  describe('save', () => {
    it('should save a memory and return it with id', async () => {
      const mockMemory = {
        type: 'fact' as const,
        content: 'Test fact',
        importance: 7,
      };
      
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: '123',
          agent_id: null,
          type: 'fact',
          content: 'Test fact',
          importance: 7,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      const result = await memory.save(mockMemory);

      expect(result.id).toBe('123');
      expect(result.type).toBe('fact');
      expect(result.content).toBe('Test fact');
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search memories by query', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: '1',
            agent_id: null,
            type: 'fact',
            content: 'Paris is capital of France',
            importance: 5,
            embedding: null,
            metadata: null,
            created_at: new Date(),
            accessed_at: null,
          },
        ],
      });

      const results = await memory.search('Paris');

      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('Paris');
    });

    it('should apply options like agentId and limit', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await memory.search('', { agentId: 'agent-1', limit: 10 });

      const call = mockQuery.mock.calls[0];
      expect(call[0]).toContain('agent_id');
    });
  });

  describe('delete', () => {
    it('should delete a memory by id', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      await memory.delete('123');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['123']
      );
    });
  });

  describe('get', () => {
    it('should return null if memory not found', async () => {
      mockQuery
        .mockResolvedValueOnce({}) // update accessed_at
        .mockResolvedValueOnce({ rows: [] });

      const result = await memory.get('nonexistent');

      expect(result).toBeNull();
    });
  });
});
