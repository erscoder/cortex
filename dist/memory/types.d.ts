import { z } from 'zod';
export declare const MemorySchema: z.ZodObject<{
    id: z.ZodString;
    agentId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["fact", "preference", "learning", "conversation", "tool"]>;
    content: z.ZodString;
    importance: z.ZodDefault<z.ZodNumber>;
    embedding: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    accessedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "fact" | "preference" | "learning" | "conversation" | "tool";
    createdAt: Date;
    content: string;
    importance: number;
    agentId?: string | undefined;
    embedding?: number[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    accessedAt?: Date | undefined;
}, {
    id: string;
    type: "fact" | "preference" | "learning" | "conversation" | "tool";
    createdAt: Date;
    content: string;
    agentId?: string | undefined;
    importance?: number | undefined;
    embedding?: number[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    accessedAt?: Date | undefined;
}>;
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
//# sourceMappingURL=types.d.ts.map