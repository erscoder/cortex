"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisShortTermMemory = void 0;
// Redis Short-Term Memory Implementation
const ioredis_1 = __importDefault(require("ioredis"));
class RedisShortTermMemory {
    client;
    prefix;
    defaultTTL;
    constructor(config = {}) {
        this.client = new ioredis_1.default({
            host: config.host || 'localhost',
            port: config.port || 6379,
            password: config.password,
            db: config.db || 0,
            lazyConnect: true,
        });
        this.prefix = config.prefix || 'cortex:memory:';
        this.defaultTTL = config.defaultTTL || 3600; // 1 hour default
    }
    async connect() {
        await this.client.connect();
    }
    async save(key, value, ttl) {
        const fullKey = `${this.prefix}${key}`;
        const serialized = JSON.stringify(value);
        const expireTime = ttl || this.defaultTTL;
        await this.client.setex(fullKey, expireTime, serialized);
    }
    async get(key) {
        const fullKey = `${this.prefix}${key}`;
        const value = await this.client.get(fullKey);
        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    }
    async delete(key) {
        const fullKey = `${this.prefix}${key}`;
        await this.client.del(fullKey);
    }
    async clear(sessionId) {
        // Clear all keys with the session prefix
        const pattern = `${this.prefix}${sessionId}:*`;
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }
    async exists(key) {
        const fullKey = `${this.prefix}${key}`;
        const result = await this.client.exists(fullKey);
        return result === 1;
    }
    async ttl(key) {
        const fullKey = `${this.prefix}${key}`;
        return this.client.ttl(fullKey);
    }
    async extendTTL(key, ttl) {
        const fullKey = `${this.prefix}${key}`;
        await this.client.expire(fullKey, ttl);
    }
    async disconnect() {
        await this.client.quit();
    }
}
exports.RedisShortTermMemory = RedisShortTermMemory;
exports.default = RedisShortTermMemory;
//# sourceMappingURL=short-term.js.map