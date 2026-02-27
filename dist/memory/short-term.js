"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisShortTermMemory = void 0;
class RedisShortTermMemory {
    redis; // ioredis instance
    prefix = 'cortex:st:';
    constructor(redisClient) {
        this.redis = redisClient;
    }
    async save(key, value) {
        const fullKey = `${this.prefix}${key}`;
        await this.redis.set(fullKey, JSON.stringify(value), 'EX', 3600); // 1 hour TTL
    }
    async get(key) {
        const fullKey = `${this.prefix}${key}`;
        const value = await this.redis.get(fullKey);
        return value ? JSON.parse(value) : null;
    }
    async delete(key) {
        const fullKey = `${this.prefix}${key}`;
        await this.redis.del(fullKey);
    }
    async clear(sessionId) {
        // Clear all keys with session prefix
        const pattern = `${this.prefix}${sessionId}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}
exports.RedisShortTermMemory = RedisShortTermMemory;
//# sourceMappingURL=short-term.js.map