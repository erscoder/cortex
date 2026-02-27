import { LongTermMemory, Memory, MemorySearchOptions } from './types';
export declare class PostgresLongTermMemory implements LongTermMemory {
    private pool;
    constructor(pgPool: any);
    save(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory>;
    search(query: string, options?: MemorySearchOptions): Promise<Memory[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=long-term.d.ts.map