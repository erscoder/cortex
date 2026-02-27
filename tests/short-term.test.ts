import { RedisShortTermMemory } from '../src/memory/short-term';

// Mock Redis client
const mockRedis = {
  connect: jest.fn().mockResolvedValue(undefined),
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
  keys: jest.fn().mockResolvedValue([]),
  exists: jest.fn(),
  ttl: jest.fn(),
  expire: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue('OK'),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedis);
});

describe('RedisShortTermMemory', () => {
  let memory: RedisShortTermMemory;

  beforeEach(() => {
    jest.clearAllMocks();
    memory = new RedisShortTermMemory({
      host: 'localhost',
      port: 6379,
      prefix: 'test:',
      defaultTTL: 60,
    });
  });

  describe('save', () => {
    it('should save a value with TTL', async () => {
      await memory.save('test-key', { foo: 'bar' });
      
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:test-key',
        60,
        JSON.stringify({ foo: 'bar' })
      );
    });

    it('should use custom TTL when provided', async () => {
      await memory.save('test-key', 'value', 120);
      
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:test-key',
        120,
        '"value"'
      );
    });
  });

  describe('get', () => {
    it('should return parsed value when exists', async () => {
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ foo: 'bar' }));
      
      const result = await memory.get('test-key');
      
      expect(result).toEqual({ foo: 'bar' });
      expect(mockRedis.get).toHaveBeenCalledWith('test:test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      
      const result = await memory.get('nonexistent');
      
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      await memory.delete('test-key');
      
      expect(mockRedis.del).toHaveBeenCalledWith('test:test-key');
    });
  });

  describe('clear', () => {
    it('should clear all keys with session prefix', async () => {
      mockRedis.keys.mockResolvedValueOnce(['test:session:1', 'test:session:2']);
      
      await memory.clear('session');
      
      expect(mockRedis.keys).toHaveBeenCalledWith('test:session:*');
      expect(mockRedis.del).toHaveBeenCalledWith('test:session:1', 'test:session:2');
    });

    it('should do nothing when no keys found', async () => {
      mockRedis.keys.mockResolvedValueOnce([]);
      
      await memory.clear('session');
      
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedis.exists.mockResolvedValueOnce(1);
      
      const result = await memory.exists('test-key');
      
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedis.exists.mockResolvedValueOnce(0);
      
      const result = await memory.exists('nonexistent');
      
      expect(result).toBe(false);
    });
  });
});
