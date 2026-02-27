// Redis Short-Term Memory Implementation
import Redis from 'ioredis';
import { ShortTermMemory } from './types';

export interface RedisShortTermMemoryConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  prefix?: string;
  defaultTTL?: number; // seconds
}

export class RedisShortTermMemory implements ShortTermMemory {
  private client: Redis;
  private prefix: string;
  private defaultTTL: number;

  constructor(config: RedisShortTermMemoryConfig = {}) {
    this.client = new Redis({
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password,
      db: config.db || 0,
      lazyConnect: true,
    });
    this.prefix = config.prefix || 'cortex:memory:';
    this.defaultTTL = config.defaultTTL || 3600; // 1 hour default
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async save(key: string, value: unknown, ttl?: number): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    const serialized = JSON.stringify(value);
    const expireTime = ttl || this.defaultTTL;
    
    await this.client.setex(fullKey, expireTime, serialized);
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const fullKey = `${this.prefix}${key}`;
    const value = await this.client.get(fullKey);
    
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await this.client.del(fullKey);
  }

  async clear(sessionId: string): Promise<void> {
    // Clear all keys with the session prefix
    const pattern = `${this.prefix}${sessionId}:*`;
    const keys = await this.client.keys(pattern);
    
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = `${this.prefix}${key}`;
    const result = await this.client.exists(fullKey);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    const fullKey = `${this.prefix}${key}`;
    return this.client.ttl(fullKey);
  }

  async extendTTL(key: string, ttl: number): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    await this.client.expire(fullKey, ttl);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export default RedisShortTermMemory;
