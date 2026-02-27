"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresLongTermMemory = void 0;
// PostgreSQL Long-Term Memory Implementation
const pg_1 = require("pg");
class PostgresLongTermMemory {
    pool;
    tableName;
    constructor(config = {}) {
        this.pool = new pg_1.Pool({
            host: config.host || 'localhost',
            port: config.port || 5432,
            database: config.database || 'cortex',
            user: config.user || 'postgres',
            password: config.password,
        });
        this.tableName = config.tableName || 'cortex_memories';
        this.initTable();
    }
    async initTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER DEFAULT 5 CHECK (importance >= 0 AND importance <= 10),
        embedding vector(1536),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        accessed_at TIMESTAMP WITH TIME ZONE,
        
        INDEX idx_agent_id ${this.tableName ? `IF EXISTS` : ''} (agent_id),
        INDEX idx_type ${this.tableName ? `IF EXISTS` : ''} (type),
        INDEX idx_created_at ${this.tableName ? `IF EXISTS` : ''} (created_at)
      );
      
      CREATE INDEX IF NOT EXISTS idx_embedding 
      ON ${this.tableName} 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `;
        try {
            await this.pool.query(query);
        }
        catch (error) {
            // Table might already exist or vector extension not available
            console.warn('Memory table init warning:', error);
        }
    }
    async save(memory) {
        const query = `
      INSERT INTO ${this.tableName} 
        (agent_id, type, content, importance, embedding, metadata, accessed_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, agent_id, type, content, importance, embedding, metadata, created_at, accessed_at;
    `;
        const values = [
            memory.agentId || null,
            memory.type,
            memory.content,
            memory.importance,
            memory.embedding || null,
            memory.metadata || null,
        ];
        const result = await this.pool.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            agentId: row.agent_id ?? undefined,
            type: row.type,
            content: row.content,
            importance: row.importance,
            embedding: row.embedding ?? undefined,
            metadata: row.metadata ?? undefined,
            createdAt: row.created_at,
            accessedAt: row.accessed_at ?? undefined,
        };
    }
    async search(query, options) {
        let sql = `
      SELECT id, agent_id, type, content, importance, embedding, metadata, created_at, accessed_at
      FROM ${this.tableName}
      WHERE 1=1
    `;
        const params = [];
        let paramIndex = 1;
        if (options?.agentId) {
            sql += ` AND agent_id = $${paramIndex}`;
            params.push(options.agentId);
            paramIndex++;
        }
        if (options?.types && options.types.length > 0) {
            sql += ` AND type = ANY($${paramIndex}::text[])`;
            params.push(options.types);
            paramIndex++;
        }
        if (options?.minImportance) {
            sql += ` AND importance >= $${paramIndex}`;
            params.push(options.minImportance);
            paramIndex++;
        }
        // Text search on content
        if (query) {
            sql += ` AND content ILIKE $${paramIndex}`;
            params.push(`%${query}%`);
            paramIndex++;
        }
        sql += ` ORDER BY importance DESC, created_at DESC`;
        if (options?.limit) {
            sql += ` LIMIT $${paramIndex}`;
            params.push(options.limit);
        }
        const result = await this.pool.query(sql, params);
        return result.rows.map((row) => ({
            id: row.id,
            agentId: row.agent_id ?? undefined,
            type: row.type,
            content: row.content,
            importance: row.importance,
            embedding: row.embedding ?? undefined,
            metadata: row.metadata ?? undefined,
            createdAt: row.created_at,
            accessedAt: row.accessed_at ?? undefined,
        }));
    }
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1;`;
        await this.pool.query(query, [id]);
    }
    async get(id) {
        // Update accessed_at
        await this.pool.query(`UPDATE ${this.tableName} SET accessed_at = NOW() WHERE id = $1;`, [id]);
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1;`;
        const result = await this.pool.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return {
            id: row.id,
            agentId: row.agent_id ?? undefined,
            type: row.type,
            content: row.content,
            importance: row.importance,
            embedding: row.embedding ?? undefined,
            metadata: row.metadata ?? undefined,
            createdAt: row.created_at,
            accessedAt: row.accessed_at ?? undefined,
        };
    }
    async cleanup(olderThanDays = 30) {
        const query = `
      DELETE FROM ${this.tableName}
      WHERE created_at < NOW() - INTERVAL '${olderThanDays} days'
      AND accessed_at IS NULL;
    `;
        const result = await this.pool.query(query);
        return result.rowCount || 0;
    }
    async close() {
        await this.pool.end();
    }
}
exports.PostgresLongTermMemory = PostgresLongTermMemory;
exports.default = PostgresLongTermMemory;
//# sourceMappingURL=long-term.js.map