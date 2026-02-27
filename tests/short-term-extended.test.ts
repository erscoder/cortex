import { RedisShortTermMemory } from '../src/memory/short-term';

// Mock Redis
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

describe('RedisShortTermMemory - Extended Coverage', () => {
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

  describe('save edge cases', () => {
    it('should save object values', async () => {
      await memory.save('key', { nested: { value: 123 } });
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should save array values', async () => {
      await memory.save('key', [1, 2, 3]);
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should save null values', async () => {
      await memory.save('key', null);
      expect(mockRedis.setex).toHaveBeenCalled();
    });
  });

  describe('get edge cases', () => {
    it('should return null for non-existent key', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      const result = await memory.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should handle invalid JSON', async () => {
      mockRedis.get.mockResolvedValueOnce('not json');
      const result = await memory.get('invalid');
      expect(result).toBeNull();
    });

    it('should parse valid JSON', async () => {
      mockRedis.get.mockResolvedValueOnce('{"key":"value"}');
      const result = await memory.get('valid');
      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('ttl operations', () => {
    it('should return TTL for key', async () => {
      mockRedis.ttl.mockResolvedValueOnce(60);
      const result = await memory.ttl('key');
      expect(result).toBe(60);
    });

    it('should extend TTL', async () => {
      await memory.extendTTL('key', 120);
      expect(mockRedis.expire).toHaveBeenCalledWith('test:key', 120);
    });
  });

  describe('clear edge cases', () => {
    it('should handle empty session', async () => {
      mockRedis.keys.mockResolvedValueOnce([]);
      await memory.clear('empty-session');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });
});
