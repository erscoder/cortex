/**
 * Smoke Test - Integration
 * 
 * Verifies that all services are running and accessible.
 * This test should run AFTER services are started with docker-compose.
 */

describe('Cortex Integration Smoke Test', () => {
  it('should connect to Redis', async () => {
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      retryStrategy: () => null, // Don't retry, fail fast
    });

    try {
      const pong = await redis.ping();
      expect(pong).toBe('PONG');
    } finally {
      await redis.quit();
    }
  });

  it('should connect to PostgreSQL', async () => {
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'cortex',
      password: process.env.POSTGRES_PASSWORD || 'cortex_dev_password',
      database: process.env.POSTGRES_DB || 'cortex',
    });

    try {
      await client.connect();
      const result = await client.query('SELECT 1 as num');
      expect(result.rows[0].num).toBe(1);
    } finally {
      await client.end();
    }
  });

  it('should verify pgvector extension is installed', async () => {
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'cortex',
      password: process.env.POSTGRES_PASSWORD || 'cortex_dev_password',
      database: process.env.POSTGRES_DB || 'cortex',
    });

    try {
      await client.connect();
      const result = await client.query(
        "SELECT * FROM pg_extension WHERE extname = 'vector'"
      );
      expect(result.rows.length).toBeGreaterThan(0);
    } finally {
      await client.end();
    }
  });

  it('should connect to Weaviate', async () => {
    const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    const response = await fetch(`${weaviateUrl}/v1/.well-known/ready`);
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toBe(true);
  });

  it('should verify all services health', async () => {
    // This test combines all health checks
    const services = {
      redis: false,
      postgres: false,
      pgvector: false,
      weaviate: false,
    };

    // Redis
    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });
      const pong = await redis.ping();
      services.redis = pong === 'PONG';
      await redis.quit();
    } catch (e) {
      // Failed
    }

    // PostgreSQL + pgvector
    try {
      const { Client } = require('pg');
      const client = new Client({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        user: process.env.POSTGRES_USER || 'cortex',
        password: process.env.POSTGRES_PASSWORD || 'cortex_dev_password',
        database: process.env.POSTGRES_DB || 'cortex',
      });
      await client.connect();
      const result = await client.query('SELECT 1');
      services.postgres = result.rows.length > 0;

      const extResult = await client.query(
        "SELECT * FROM pg_extension WHERE extname = 'vector'"
      );
      services.pgvector = extResult.rows.length > 0;

      await client.end();
    } catch (e) {
      // Failed
    }

    // Weaviate
    try {
      const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
      const response = await fetch(`${weaviateUrl}/v1/.well-known/ready`);
      const data = await response.json();
      services.weaviate = response.ok && data === true;
    } catch (e) {
      // Failed
    }

    // All should be healthy
    expect(services).toEqual({
      redis: true,
      postgres: true,
      pgvector: true,
      weaviate: true,
    });
  });
});
