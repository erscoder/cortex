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

describe('PostgresLongTermMemory - Init Table Catch Branch', () => {
  
  describe('constructor - catch branch in initTable', () => {
    it('should handle initTable error gracefully', async () => {
      // Mock query to throw on first call (initTable)
      mockQuery.mockRejectedValueOnce(new Error('Table creation failed'));
      mockQuery.mockResolvedValueOnce({ rows: [] });
      
      // Should not throw, should catch the error
      const memory = new PostgresLongTermMemory({ database: 'test' });
      expect(memory).toBeDefined();
    });
  });
});
