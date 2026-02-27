import { PostgresLongTermMemory } from '../src/memory/long-term';

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

describe('PostgresLongTermMemory - Branch Coverage', () => {
  let memory: PostgresLongTermMemory;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    memory = new PostgresLongTermMemory({ database: 'test' });
  });

  describe('search - branch coverage', () => {
    it('should search with agentId filter', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await memory.search('test', { agentId: 'agent-1' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('agent_id'),
        expect.any(Array)
      );
    });

    it('should search with types filter', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await memory.search('test', { types: ['fact', 'preference'] });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('type'),
        expect.any(Array)
      );
    });

    it('should search with minImportance', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await memory.search('test', { minImportance: 7 });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('importance'),
        expect.any(Array)
      );
    });

    it('should search without query', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await memory.search('');

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should apply limit', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await memory.search('test', { limit: 5 });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.any(Array)
      );
    });
  });

  describe('get - branch coverage', () => {
    it('should return null when not found', async () => {
      mockQuery
        .mockResolvedValueOnce({}) // update
        .mockResolvedValueOnce({ rows: [] }); // select

      const result = await memory.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return memory when found', async () => {
      const mockRow = {
        id: '1',
        agent_id: 'agent-1',
        type: 'fact',
        content: 'Test',
        importance: 5,
        embedding: null,
        metadata: null,
        created_at: new Date(),
        accessed_at: null,
      };

      mockQuery
        .mockResolvedValueOnce({}) // update
        .mockResolvedValueOnce({ rows: [mockRow] }); // select

      const result = await memory.get('1');
      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });
  });

  describe('cleanup - branch coverage', () => {
    it('should cleanup old memories', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 10 });

      const deleted = await memory.cleanup(30);
      expect(deleted).toBe(10);
    });

    it('should cleanup with custom days', async () => {
      // Clear mocks after constructor calls
      mockQuery.mockClear();
      mockQuery.mockResolvedValueOnce({ rowCount: 5 });

      await memory.cleanup(60);
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('delete - branch coverage', () => {
    it('should delete by id', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      await memory.delete('1');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['1']
      );
    });
  });
});
