// Unified Memory Manager - Combines Short-Term and Long-Term Memory
import { RedisShortTermMemory } from './short-term';
import { PostgresLongTermMemory } from './long-term';
import { Memory, MemorySearchOptions } from './types';

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
  cacheTTL?: number;
}

export interface MemoryManagerInterface {
  remember(content: string, type: Memory['type'], options?: {
    agentId?: string;
    importance?: number;
    metadata?: Record<string, unknown>;
    embedding?: number[];
  }): Promise<Memory>;
  
  recall(query: string, options?: MemorySearchOptions): Promise<Memory[]>;
  forget(memoryId: string): Promise<void>;
  getRecent(agentId?: string, limit?: number): Promise<Memory[]>;
  disconnect(): Promise<void>;
}

export class MemoryManager implements MemoryManagerInterface {
  private shortTerm: RedisShortTermMemory;
  private longTerm: PostgresLongTermMemory;
  private cacheTTL: number;

  constructor(config: MemoryManagerConfig) {
    this.shortTerm = new RedisShortTermMemory(config.shortTerm);
    this.longTerm = new PostgresLongTermMemory(config.longTerm);
    this.cacheTTL = config.cacheTTL || 3600;
  }

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
    const memory = await this.longTerm.save({
      type,
      content,
      agentId: options?.agentId,
      importance: options?.importance || 5,
      metadata: options?.metadata,
      embedding: options?.embedding,
    });

    // Cache in short-term for fast retrieval
    const cacheKey = `memory:${memory.id}`;
    await this.shortTerm.save(cacheKey, memory, this.cacheTTL);

    // Also store in recent list
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
    // Check short-term cache first
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    const cached = await this.shortTerm.get<Memory[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Search long-term
    const results = await this.longTerm.search(query, options);

    // Cache results
    if (results.length > 0) {
      await this.shortTerm.save(cacheKey, results, 300);
    }

    return results;
  }

  /**
   * Forget - removes from both stores
   */
  async forget(memoryId: string): Promise<void> {
    await this.longTerm.delete(memoryId);
    await this.shortTerm.delete(`memory:${memoryId}`);
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
    const memories = await this.longTerm.search('', { agentId, limit });
    return memories;
  }

  async disconnect(): Promise<void> {
    await this.longTerm.close();
    await this.shortTerm.disconnect();
  }
}

export default MemoryManager;
