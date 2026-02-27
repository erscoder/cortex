import { ShortTermMemory } from './types';
export interface RedisShortTermMemoryConfig {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    prefix?: string;
    defaultTTL?: number;
}
export declare class RedisShortTermMemory implements ShortTermMemory {
    private client;
    private prefix;
    private defaultTTL;
    constructor(config?: RedisShortTermMemoryConfig);
    connect(): Promise<void>;
    save(key: string, value: unknown, ttl?: number): Promise<void>;
    get<T = unknown>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    clear(sessionId: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
    extendTTL(key: string, ttl: number): Promise<void>;
    disconnect(): Promise<void>;
}
export default RedisShortTermMemory;
//# sourceMappingURL=short-term.d.ts.map