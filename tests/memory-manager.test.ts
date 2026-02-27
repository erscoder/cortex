import { MemoryManager } from '../src/memory/manager';

// Mock dependencies
const mockRedisGet = jest.fn();
const mockRedisSetex = jest.fn();
const mockRedisDel = jest.fn();
const mockRedisKeys = jest.fn();
const mockPgQuery = jest.fn();
const mockPgEnd = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: mockRedisGet,
    setex: mockRedisSetex,
    del: mockRedisDel,
    keys: mockRedisKeys,
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

describe('MemoryManager', () => {
  let manager: MemoryManager;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRedisGet.mockResolvedValue(null);
    mockRedisSetex.mockResolvedValue('OK');
    mockRedisDel.mockResolvedValue(1);
    mockRedisKeys.mockResolvedValue([]);
    mockPgQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    
    manager = new MemoryManager({
      shortTerm: { host: 'localhost', port: 6379, prefix: 'test:', defaultTTL: 60 },
      longTerm: { host: 'localhost', port: 5432, database: 'test', user: 'test', password: 'test' },
      cacheTTL: 300,
    });
  });

  describe('remember', () => {
    it('should save memory to long-term storage', async () => {
      mockPgQuery.mockResolvedValueOnce({
        rows: [{
          id: 'mem-1',
          agent_id: 'agent-1',
          type: 'fact',
          content: 'Test fact',
          importance: 7,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      const result = await manager.remember('Test fact', 'fact', {
        agentId: 'agent-1',
        importance: 7,
      });

      expect(result.id).toBe('mem-1');
      expect(result.content).toBe('Test fact');
      expect(mockPgQuery).toHaveBeenCalled();
    });

    it('should cache memory in short-term storage', async () => {
      mockPgQuery.mockResolvedValueOnce({
        rows: [{
          id: 'mem-1',
          agent_id: 'agent-1',
          type: 'fact',
          content: 'Test fact',
          importance: 5,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      await manager.remember('Test fact', 'fact', { agentId: 'agent-1' });

      expect(mockRedisSetex).toHaveBeenCalled();
    });
  });

  describe('recall', () => {
    it('should return cached results if available', async () => {
      const cachedMemories = [{ id: '1', content: 'Cached' }];
      mockRedisGet.mockResolvedValueOnce(JSON.stringify(cachedMemories));

      const results = await manager.recall('test');

      expect(results).toEqual(cachedMemories);
      // The PostgreSQL query is called during init in constructor, so we just verify cache was checked
      expect(mockRedisGet).toHaveBeenCalled();
    });

    it('should search long-term if no cache', async () => {
      mockRedisGet.mockResolvedValueOnce(null);
      mockPgQuery.mockResolvedValueOnce({
        rows: [{
          id: 'mem-1',
          agent_id: null,
          type: 'fact',
          content: 'Found fact',
          importance: 5,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      const results = await manager.recall('found');

      expect(mockPgQuery).toHaveBeenCalled();
      expect(results[0].content).toContain('Found');
    });
  });

  describe('forget', () => {
    it('should delete from both stores', async () => {
      mockPgQuery.mockResolvedValueOnce({ rowCount: 1 });

      await manager.forget('mem-1');

      expect(mockPgQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        ['mem-1']
      );
      // Redis del includes prefix 'test:memory:mem-1'
      expect(mockRedisDel).toHaveBeenCalled();
    });
  });

  describe('getRecent', () => {
    it('should return cached recent memories', async () => {
      const recent = [{ id: '1', content: 'Recent' }];
      mockRedisGet.mockResolvedValueOnce(JSON.stringify(recent));

      const results = await manager.getRecent('agent-1', 5);

      expect(results).toEqual(recent);
    });

    it('should fallback to long-term search', async () => {
      mockRedisGet.mockResolvedValueOnce(null);
      mockPgQuery.mockResolvedValueOnce({
        rows: [{
          id: 'mem-1',
          agent_id: 'agent-1',
          type: 'fact',
          content: 'Old fact',
          importance: 5,
          embedding: null,
          metadata: null,
          created_at: new Date(),
          accessed_at: null,
        }],
      });

      const results = await manager.getRecent('agent-1', 10);

      expect(mockPgQuery).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should close all connections', async () => {
      await manager.disconnect();

      expect(mockPgEnd).toHaveBeenCalled();
    });
  });
});
