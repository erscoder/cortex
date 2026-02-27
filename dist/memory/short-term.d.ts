import { ShortTermMemory } from './types';
export declare class RedisShortTermMemory implements ShortTermMemory {
    private redis;
    private prefix;
    constructor(redisClient: any);
    save(key: string, value: unknown): Promise<void>;
    get(key: string): Promise<unknown | null>;
    delete(key: string): Promise<void>;
    clear(sessionId: string): Promise<void>;
}
//# sourceMappingURL=short-term.d.ts.map