// Short-term memory implementation (Redis-based)
import { ShortTermMemory, Memory } from './types';

export class RedisShortTermMemory implements ShortTermMemory {
  private redis: any; // ioredis instance
  private prefix = 'cortex:st:';
  
  constructor(redisClient: any) {
    this.redis = redisClient;
  }
  
  async save(key: string, value: unknown): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await this.redis.set(fullKey, JSON.stringify(value), 'EX', 3600); // 1 hour TTL
  }
  
  async get(key: string): Promise<unknown | null> {
    const fullKey = `${this.prefix}${key}`;
    const value = await this.redis.get(fullKey);
    return value ? JSON.parse(value) : null;
  }
  
  async delete(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await this.redis.del(fullKey);
  }
  
  async clear(sessionId: string): Promise<void> {
    // Clear all keys with session prefix
    const pattern = `${this.prefix}${sessionId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
