// Memory Types
import { z } from 'zod';

export const MemorySchema = z.object({
  id: z.string(),
  agentId: z.string().optional(),
  type: z.enum(['fact', 'preference', 'learning', 'conversation', 'tool']),
  content: z.string(),
  importance: z.number().min(0).max(10).default(5),
  embedding: z.array(z.number()).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  accessedAt: z.date().optional(),
});

export type Memory = z.infer<typeof MemorySchema>;

export interface MemorySearchOptions {
  agentId?: string;
  limit?: number;
  minImportance?: number;
  types?: Memory['type'][];
}

export interface MemorySystem {
  save(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory>;
  get(id: string): Promise<Memory | null>;
  search(query: string, options?: MemorySearchOptions): Promise<Memory[]>;
  delete(id: string): Promise<void>;
  clear(sessionId: string): Promise<void>;
}

export interface ShortTermMemory {
  save(key: string, value: unknown): Promise<void>;
  get(key: string): Promise<unknown | null>;
  delete(key: string): Promise<void>;
  clear(sessionId: string): Promise<void>;
}

export interface LongTermMemory {
  save(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory>;
  search(query: string, options?: MemorySearchOptions): Promise<Memory[]>;
  delete(id: string): Promise<void>;
}
