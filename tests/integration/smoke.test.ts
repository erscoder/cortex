/**
 * Smoke Test - Integration
 * 
 * Verifies that all services are running and accessible.
 * This test should run AFTER services are started with docker-compose.
 * 
 * Skip if services are not available (CI environment without Docker)
 */

describe('Cortex Integration Smoke Test', () => {
  // Check if services are available
  const checkServices = async (): Promise<boolean> => {
    if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
      return false;
    }
    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });
      await redis.ping();
      await redis.quit();
      return true;
    } catch {
      return false;
    }
  };

  let servicesAvailable: boolean;

  beforeAll(async () => {
    servicesAvailable = await checkServices();
  });

  it('should connect to Redis', async () => {
    if (!servicesAvailable) {
      return;
    }
    
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      retryStrategy: () => null,
    });

    try {
      const pong = await redis.ping();
      expect(pong).toBe('PONG');
    } finally {
      await redis.quit();
    }
  });

  it('should connect to PostgreSQL', async () => {
    if (!servicesAvailable) {
      return;
    }
    
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'cortex',
      connectionTimeoutMillis: 5000,
    });

    try {
      await client.connect();
      const result = await client.query('SELECT version()');
      expect(result.rows).toBeDefined();
    } finally {
      await client.end();
    }
  });

  it('should verify pgvector extension is installed', async () => {
    if (!servicesAvailable) {
      return;
    }
    
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'cortex',
    });

    try {
      await client.connect();
      const result = await client.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      `);
      expect(result.rows.length).toBe(1);
    } finally {
      await client.end();
    }
  });

  it('should connect to Weaviate', async () => {
    if (!servicesAvailable) {
      return;
    }
    
    const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    const response = await fetch(`${weaviateUrl}/v1/.well-known/ready`);
    expect(response.ok).toBe(true);
  });

  it('should verify all services health', async () => {
    if (!servicesAvailable) {
      return;
    }
    
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
        maxRetriesPerRequest: 3,
        retryStrategy: () => null,
      });
      await redis.ping();
      services.redis = true;
      await redis.quit();
    } catch {}

    // PostgreSQL
    try {
      const { Client } = require('pg');
      const client = new Client({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'cortex',
      });
      await client.connect();
      await client.query('SELECT 1');
      services.postgres = true;
      
      // Check pgvector
      const result = await client.query(`
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      `);
      services.pgvector = result.rows.length === 1;
      
      await client.end();
    } catch {}

    // Weaviate
    try {
      const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
      const response = await fetch(`${weaviateUrl}/v1/.well-known/ready`);
      services.weaviate = response.ok;
    } catch {}

    // All should be healthy
    expect(services).toEqual({
      redis: true,
      postgres: true,
      pgvector: true,
      weaviate: true,
    });
  });
});
