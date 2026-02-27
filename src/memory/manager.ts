// Unified Memory Manager - Combines Short-Term and Long-Term Memory
import { RedisShortTermMemory } from './short-term';
import { PostgresLongTermMemory } from './long-term';
import { Memory, MemorySearchOptions, ShortTermMemory, LongTermMemory } from './types';

export interface MemoryManagerConfig {
  shortTerm: {
    host?: string;
    port?: number;
    prefix?: string;
    defaultTTL?: number;
  };
  longTerm: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  };
  cacheTTL?: number; // How long to cache long-term results in short-term
}

export class MemoryManager implements ShortTermMemory, LongTermMemory {
  private shortTerm: RedisShortTermMemory;
  private longTerm: PostgresLongTermMemory;
  private cacheTTL: number;

  constructor(config: MemoryManagerConfig) {
    this.shortTerm = new RedisShortTermMemory(config.shortTerm);
    this.longTerm = new PostgresLongTermMemory(config.longTerm);
    this.cacheTTL = config.cacheTTL || 3600;
  }

  // ========== Short-Term Memory Interface ==========
  
  async save(key: string, value: unknown, ttl?: number): Promise<void> {
    await this.shortTerm.save(key, value, ttl);
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    return this.shortTerm.get<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.shortTerm.delete(key);
  }

  async clear(sessionId: string): Promise<void> {
    await this.shortTerm.clear(sessionId);
  }

  // ========== Long-Term Memory Interface ==========

  async saveMemory(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory> {
    const saved = await this.longTerm.save(memory);
    
    // Also cache in short-term for fast retrieval
    const cacheKey = `memory:${saved.id}`;
    await this.shortTerm.save(cacheKey, saved, this.cacheTTL);
    
    return saved;
  }

  async searchMemories(query: string, options?: MemorySearchOptions): Promise<Memory[]> {
    // Check short-term cache first for recent searches
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    const cached = await this.shortTerm.get<Memory[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Search long-term
    const results = await this.longTerm.search(query, options);

    // Cache results
    if (results.length > 0) {
      await this.shortTerm.save(cacheKey, results, 300); // 5 min cache for searches
    }

    return results;
  }

  async deleteMemory(id: string): Promise<void> {
    // Delete from both stores
    await this.longTerm.delete(id);
    await this.shortTerm.delete(`memory:${id}`);
  }

  // ========== High-Level Methods ==========

  /**
   * Remember - stores in both short-term and long-term
   */
  async remember(
    content: string,
    type: Memory['type'],
    options?: {
      agentId?: string;
      importance?: number;
      metadata?: Record<string, unknown>;
      embedding?: number[];
    }
  ): Promise<Memory> {
    const memory = await this.saveMemory({
      type,
      content,
      agentId: options?.agentId,
      importance: options?.importance || 5,
      metadata: options?.metadata,
      embedding: options?.embedding,
    });

    // Also store in short-term for immediate access
    const sessionKey = `session:${options?.agentId || 'default'}:recent`;
    const recent = await this.shortTerm.get<Memory[]>(sessionKey) || [];
    recent.unshift(memory);
    await this.shortTerm.save(sessionKey, recent.slice(0, 10), this.cacheTTL);

    return memory;
  }

  /**
   * Recall - searches long-term and caches results
   */
  async recall(query: string, options?: MemorySearchOptions): Promise<Memory[]> {
    return this.searchMemories(query, options);
  }

  /**
   * Forget - removes from both stores
   */
  async forget(memoryId: string): Promise<void> {
    await this.deleteMemory(memoryId);
  }

  /**
   * Get recent memories for a session/agent
   */
  async getRecent(agentId?: string, limit: number = 10): Promise<Memory[]> {
    const sessionKey = `session:${agentId || 'default'}:recent`;
    const cached = await this.shortTerm.get<Memory[]>(sessionKey);
    
    if (cached) {
      return cached.slice(0, limit);
    }

    // Fallback to long-term search
    const memories = await this.longTerm.search('', {
      agentId,
      limit,
    });

    return memories;
  }

  async connect(): Promise<void> {
    // Initialize Redis connection if needed
  }

  async disconnect(): Promise<void> {
    await this.longTerm.close();
    await this.shortTerm.disconnect();
  }
}

export default MemoryManager;
