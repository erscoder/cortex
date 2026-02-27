// Jest setup file
// Runs before all tests

// Set test timeout
jest.setTimeout(30000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'cortex';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'cortex_test_password';
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'cortex_test';
process.env.WEAVIATE_URL = process.env.WEAVIATE_URL || 'http://localhost:8080';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless VERBOSE=true
  log: process.env.VERBOSE ? console.log : jest.fn(),
  debug: process.env.VERBOSE ? console.debug : jest.fn(),
  info: process.env.VERBOSE ? console.info : jest.fn(),
  // Keep warnings and errors
  warn: console.warn,
  error: console.error,
};
