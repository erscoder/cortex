import { LongTermMemory, Memory, MemorySearchOptions } from './types';
export interface PostgresLongTermMemoryConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    tableName?: string;
}
export declare class PostgresLongTermMemory implements LongTermMemory {
    private pool;
    private tableName;
    constructor(config?: PostgresLongTermMemoryConfig);
    private initTable;
    save(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory>;
    search(query: string, options?: MemorySearchOptions): Promise<Memory[]>;
    delete(id: string): Promise<void>;
    get(id: string): Promise<Memory | null>;
    cleanup(olderThanDays?: number): Promise<number>;
    close(): Promise<void>;
}
export default PostgresLongTermMemory;
//# sourceMappingURL=long-term.d.ts.map