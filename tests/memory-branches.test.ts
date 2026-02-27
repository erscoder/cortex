import { MemoryManager } from '../src/memory/manager';

// Mock
const mockRedisGet = jest.fn();
const mockRedisSetex = jest.fn();
const mockRedisDel = jest.fn();
const mockPgQuery = jest.fn();
const mockPgEnd = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockRedisGet,
    setex: mockRedisSetex,
    del: mockRedisDel,
    keys: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue('OK'),
  }));
});

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockPgQuery,
      end: mockPgEnd,
    })),
  };
});

describe('MemoryManager - Branch Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisGet.mockResolvedValue(null);
    mockRedisSetex.mockResolvedValue('OK');
    mockPgQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('remember - branch coverage', () => {
    it('should handle missing agentId (optional chaining)', async () => {
      const manager = new MemoryManager({
        shortTerm: { host: 'localhost' },
        longTerm: { database: 'test', user: 'test', password: 'test' },
      });

      mockPgQuery.mockResolvedValueOnce({
        rows: [{
          id: '1',
          agent_id: null,
          type: 'fact',
          content: 'test',
          importance: 5,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      // Call without agentId
      const result = await manager.remember('test', 'fact');
      expect(result).toBeDefined();
    });

    it('should handle with agentId provided', async () => {
      const manager = new MemoryManager({
        shortTerm: { host: 'localhost' },
        longTerm: { database: 'test', user: 'test', password: 'test' },
      });

      mockPgQuery.mockResolvedValueOnce({
        rows: [{
          id: '1',
          agent_id: 'agent-1',
          type: 'fact',
          content: 'test',
          importance: 5,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      const result = await manager.remember('test', 'fact', { agentId: 'agent-1' });
      expect(result).toBeDefined();
    });
  });

  describe('getRecent - branch coverage', () => {
    it('should handle with agentId (not default)', async () => {
      const manager = new MemoryManager({
        shortTerm: { host: 'localhost' },
        longTerm: { database: 'test', user: 'test', password: 'test' },
      });

      mockRedisGet.mockResolvedValueOnce(JSON.stringify([
        { id: '1', content: 'Recent' }
      ]));

      const results = await manager.getRecent('my-agent', 5);
      expect(results).toHaveLength(1);
    });

    it('should handle with undefined agentId (default case)', async () => {
      const manager = new MemoryManager({
        shortTerm: { host: 'localhost' },
        longTerm: { database: 'test', user: 'test', password: 'test' },
      });

      mockRedisGet.mockResolvedValueOnce(JSON.stringify([
        { id: '1', content: 'Recent' }
      ]));

      // Call without agentId - uses default
      const results = await manager.getRecent();
      expect(results).toHaveLength(1);
    });
  });
});
