"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresLongTermMemory = void 0;
// Long-term memory implementation (PostgreSQL + Vector)
const uuid_1 = require("uuid");
class PostgresLongTermMemory {
    pool; // pg pool
    constructor(pgPool) {
        this.pool = pgPool;
    }
    async save(memory) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        await this.pool.query(`INSERT INTO cortex_memories (id, type, content, importance, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`, [id, memory.type, memory.content, memory.importance, JSON.stringify(memory.metadata || {}), now]);
        return { ...memory, id, createdAt: now };
    }
    async search(query, options = {}) {
        // Simple text search - would use vector similarity in production
        const limit = options.limit || 10;
        const conditions = ['1=1'];
        const params = [];
        let paramIndex = 1;
        if (options.agentId) {
            conditions.push(`agent_id = $${paramIndex++}`);
            params.push(options.agentId);
        }
        if (options.types && options.types.length > 0) {
            conditions.push(`type = ANY($${paramIndex++})`);
            params.push(options.types);
        }
        if (options.minImportance) {
            conditions.push(`importance >= $${paramIndex++}`);
            params.push(options.minImportance);
        }
        params.push(limit);
        const result = await this.pool.query(`SELECT * FROM cortex_memories 
       WHERE ${conditions.join(' AND ')}
       ORDER BY importance DESC, created_at DESC
       LIMIT $${paramIndex}`, params);
        return result.rows.map((row) => ({
            id: row.id,
            agentId: row.agent_id,
            type: row.type,
            content: row.content,
            importance: row.importance,
            metadata: row.metadata,
            createdAt: row.created_at,
            accessedAt: row.accessed_at,
        }));
    }
    async delete(id) {
        await this.pool.query('DELETE FROM cortex_memories WHERE id = $1', [id]);
    }
}
exports.PostgresLongTermMemory = PostgresLongTermMemory;
//# sourceMappingURL=long-term.js.map