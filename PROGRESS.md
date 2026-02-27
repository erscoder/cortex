# PROGRESS.md - Cortex

> Last updated: 2026-02-27 13:10 by Harvis

## Current Status
Project scaffold created. Basic structure in place with package.json, tsconfig, and index exports.

## What Was Done (This Session)
- Created project structure at `/projects/cortex/`
- Set up directories: orchestrator, memory, rag, reasoning, sandbox, hitl, mlops
- Created package.json with dependencies (langgraph, weaviate, pinecone, redis, pg)
- Created tsconfig.json with strict mode
- Created index.ts with exports for all modules

## What's Next (Priority Order)
1. [P0] Implement Orchestrator base (Agent class + types)
2. [P0] Implement Memory system (short-term with Redis, long-term with Postgres)
3. [P1] Implement RAG pipeline (embedding + vector store + reranker)
4. [P1] Implement Reasoner (chain-of-thought)
5. [P2] Implement Sandbox executor
6. [P2] Implement Human-in-the-loop
7. [P3] Implement MLOps (tracking, evaluation)

## Blocked / Needs Decision
- Which vector store to use first? Weaviate (self-hosted) or Pinecone (managed)?
- Do we use LangGraph for orchestration or build our own?
- Redis for short-term memory? (We have it in TOOLS.md)

## Key Files Modified
- `/projects/cortex/package.json`
- `/projects/cortex/tsconfig.json`
- `/projects/cortex/src/index.ts`

## Tech Stack
- **Language:** TypeScript (strict)
- **Orchestration:** LangGraph
- **Vector Store:** Weaviate / Pinecone (TBD)
- **Short-term Memory:** Redis
- **Long-term Memory:** PostgreSQL + Vector
- **Testing:** Jest

## Dependencies Notes
- LangGraph for multi-agent orchestration
- Weaviate-client or Pinecone for vector storage
- ioredis for Redis
- pg for PostgreSQL
- zod for validation
