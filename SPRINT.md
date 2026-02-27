# Sprint Plan - Cortex Agentic Platform

## Sprint 1: "Foundation & Memory" (1 semana)

### Objetivo
Construir la base del framework con memoria funcional (short-term + long-term) y el agente base integrando todo.

### ⚠️ Reglas del Sprint
- **Tests obligatorios en CADA tarea** — cobertura mínima **90%** (statements + lines)
- **No se avanza a la siguiente tarea sin tests de la actual**
- **Conventional Commits** en todos los commits
- **Vector valida** cada tarea antes de pasar a la siguiente
- **Zero `any` implícitos** — tipos explícitos en todo

---

## 🎯 Definition of Done (Global)

- [x] `npm run build` → 0 errores
- [x] `npm test` → todos pasan
- [x] Cobertura ≥ 90% (statements + lines + branches + functions) en archivos modificados
- [x] Sin `any` implícitos
- [x] JSDoc en clases y métodos públicos
- [x] Commit: `type(scope): description (COR-XX)`
- [x] Vector valida antes de avanzar

---

## COR-1: Fix Build Errors (P0 BLOCKER)
**Owner:** Codex | **Est:** 2h | **Depende:** Nada

El build tiene errores TS. Imports rotos, tipos `any` implícitos, null vs undefined.

**Subtareas:**

- [x] **1.1** Fix import `reasoner.ts`: `'./types'` → `'./reasoning/types'`
- [x] **1.2** Tipar `steps` como `ReasoningStep[]` en `buildPrompt()` y `calculateConfidence()`
- [x] **1.3** `parseResponse()`: cambiar `null` → `undefined` (match optional fields)
- [x] **1.4** `pipeline.ts`: usar `SearchOptionsSchema.parse(options)` para defaults
- [x] **1.5** Verificar `AgentAction.requiresApproval` en todos los call sites
- [x] **1.6** `npm run build` → 0 errores
- [x] **1.7** Tests: `reasoner.test.ts` + `pipeline.test.ts` — coverage ≥ 90%
- [x] **1.8** Commit: `fix(build): resolve TypeScript errors (COR-1)`

---

## COR-2: Short-Term Memory — Redis (P0)
**Owner:** Codex | **Est:** 3h | **Depende:** COR-1 | **Requiere:** Redis

Completar `src/memory/short-term.ts`. TTL configurable, SCAN en vez de KEYS, error handling.

**Subtareas:**

- [x] **2.1** Redis client factory `src/memory/redis-client.ts` (ioredis, retry, backoff)
- [x] **2.2** `RedisShortTermMemory` con TTL configurable (constructor: `{ redis, ttlSeconds?, prefix? }`)
- [x] **2.3** Métodos: `save(key,val,ttl?)`, `get(key)` (null si corrupto), `delete(key)`, `clear(sessionId)` (SCAN no KEYS), `exists(key)`, `ttl(key)`
- [x] **2.4** Tests con mock (NO Redis real): roundtrip, corrupto, clear por sesión, Redis caído
- [x] **2.5** Commit: `feat(memory): Redis short-term memory (COR-2)`

---

## COR-3: Long-Term Memory — PostgreSQL + pgvector (P0)
**Owner:** Codex | **Est:** 4h | **Depende:** COR-1 | **Requiere:** PostgreSQL + pgvector

Completar `src/memory/long-term.ts`. Migraciones, vector search, cleanup.

**Subtareas:**

- [x] **3.1** Migración SQL `src/memory/migrations/001_create_memories.sql`: tabla `cortex_memories` con `vector(1536)`, indexes (ivfflat cosine), constraints
- [x] **3.2** `PostgresLongTermMemory` constructor: `{ pool, embeddingModel? }`. Sin embedding → fallback ILIKE
- [x] **3.3** Métodos: `save(memory)` (con embedding), `get(id)`, `search(query,opts)` (cosine similarity o ILIKE), `delete(id)`, `cleanup(olderThanDays)` (solo borra importance < 3)
- [x] **3.4** Tests con pg mock: CRUD, vector search mock, filtros, cleanup no borra importantes
- [x] **3.5** Commit: `feat(memory): PostgreSQL long-term memory with pgvector (COR-3)`

---

## COR-4: Unified MemoryManager (P1)
**Owner:** Codex | **Est:** 2h | **Depende:** COR-2 + COR-3

Cache-through: Redis first, Postgres as source of truth. Implements `MemorySystem`.

**Subtareas:**

- [x] **4.1** `src/memory/manager.ts`: constructor `{ shortTerm, longTerm, cacheTtl? }`
- [x] **4.2** `save()` → ambos stores. `get()` → Redis first, miss → Postgres + cache
- [x] **4.3** `search()` → Postgres (tiene embeddings), cache results 300s
- [x] **4.4** `delete()` → ambos. `clear()` → solo Redis
- [x] **4.5** Graceful degradation: Redis fail → log + continue Postgres only
- [x] **4.6** Tests: cache hit, cache miss, Redis fail, delete ambos
- [x] **4.7** Commit: `feat(memory): unified MemoryManager (COR-4)`

---

## COR-5: RAG Pipeline (P1)
**Owner:** Codex | **Est:** 4h | **Depende:** COR-1 | **Requiere:** Weaviate

Crear embeddings, fix Weaviate client v3, mejorar pipeline.

**Subtareas:**

- [x] **5.1** `src/rag/embeddings.ts`: `OpenAIEmbeddings` implements `EmbeddingModel`. `embed()` → ada-002 (1536 dims), `embedBatch()` hasta 100, retry en rate limits
- [x] **5.2** Fix `WeaviateVectorStore`: API v3 correcta (`client.data.creator()`, `client.graphql.get()`, `client.data.deleter()`)
- [x] **5.3** `HybridRAGPipeline`: parse options con Zod defaults, agregar `ingest(docs)`, relevance score en `buildContext()`
- [x] **5.4** Tests con mocks: embeddings dims, batch, VectorStore CRUD, pipeline e2e
- [x] **5.5** Commit: `feat(rag): RAG pipeline with embeddings and Weaviate (COR-5)`

---

## COR-6: Reasoner — Chain of Thought (P1)
**Owner:** Codex | **Est:** 3h | **Depende:** COR-1 | **Paralizable con COR-5**

Integrar LLM real, mejorar prompts, detección inteligente de needsRag/needsAction.

**Subtareas:**

- [x] **6.1** `src/reasoning/llm-client.ts`: interface `LLMClient`, implementar `AnthropicClient` y `MiniMaxClient` (API keys de config openclaw)
- [x] **6.2** Mejorar `buildPrompt()`: system role, few-shot examples, JSON schema enforcement
- [x] **6.3** Mejorar `needsRag`/`needsAction`: pedir flags explícitos al LLM en response JSON (fallback a keyword scoring)
- [x] **6.4** Tipar todos los `any` restantes
- [x] **6.5** Tests: think() con LLM mock, sin LLM (fallback), parseResponse edge cases, risk assessment
- [x] **6.6** Commit: `feat(reasoning): chain-of-thought with LLM integration (COR-6)`

---

## COR-7: Sandbox Executor (P2)
**Owner:** Codex | **Est:** 3h | **Depende:** COR-1 | **Paralizable con COR-8**

Ejecutor real de comandos con `child_process.execFile`, allowlist, logging.

**Subtareas:**

- [x] **7.1** `executeCommand()` real: `execFile` (no `exec`), timeout configurable, maxBuffer 10MB
- [x] **7.2** `validate()` completo: allowlist check primero, blocked patterns, approval patterns retornan `needsApproval`
- [x] **7.3** `executeApiCall()`: fetch nativo, allowed domains, timeout
- [x] **7.4** Logging: timestamp + level + message en cada ejecución
- [x] **7.5** Tests: allowlist, blocked, injection attempts (`;`, `&&`, `|`), timeout
- [x] **7.6** Commit: `feat(sandbox): safe command execution (COR-7)`

---

## COR-8: HITL Manager (P2)
**Owner:** Codex | **Est:** 2h | **Depende:** COR-1 | **Paralizable con COR-7**

Timeout automático, wait mechanism, pending queue.

**Subtareas:**

- [x] **8.1** Timeout auto-reject: `setTimeout` + cleanup cuando excede `config.timeoutMs`
- [x] **8.2** `waitForApproval(requestId, timeoutMs)`: Promise con EventEmitter (no polling)
- [x] **8.3** `getPendingRequests()`: array de requests pendientes
- [x] **8.4** `modifyAndApprove(requestId, modifications)`: aprobar con cambios
- [x] **8.5** Tests: auto-approve, approve flow, reject flow, timeout, wait resolves
- [x] **8.6** Commit: `feat(hitl): approval system with timeout (COR-8)`

---

## COR-9: Integration (P0)
**Owner:** Harvis (coord) + Codex (impl) | **Est:** 5h (buffer incluido) | **Depende:** COR-1 a COR-8

Integrar todos los módulos en Agent. Demo funcional.

**Subtareas:**

- [x] **9.1** Integrar MemoryManager, RAG, Reasoner, Sandbox, HITL en Agent
- [x] **9.2** Crear `examples/basic-agent.ts`: agente que razona, busca, ejecuta
- [x] **9.3** Integration test e2e con mocks
- [x] **9.4** `npm run test:integration`
- [x] **9.5** Commit: `feat(agent): complete integration (COR-9)`

---

## COR-10: MLOps Tracking (P3)
**Owner:** Codex | **Est:** 2h | **Depende:** COR-1

Tracking básico de experimentos y métricas.

**Subtareas:**

- [x] **10.1** Completar `MLflowTracker`: createExperiment, logMetrics, registerModel
- [x] **10.2** Production metrics logging
- [x] **10.3** Tests ≥ 90%
- [x] **10.4** Commit: `feat(mlops): experiment tracking (COR-10)`

---

## COR-11: CI/CD + Dev Setup (P1)
**Owner:** Vega | **Est:** 2h | **Depende:** Nada (paralelo)

Automatizar infra y validación continua.

**Subtareas:**

- [x] **11.1** `docker-compose.yml`: Redis + PostgreSQL (pgvector) + Weaviate + health checks
- [x] **11.2** `scripts/setup-dev.sh`: docker-compose up, wait health, run migrations
- [x] **11.3** GitHub Actions: build → typecheck → lint → test → coverage gate (fail < 90%)
- [x] **11.4** Pre-commit hooks (husky + lint-staged)
- [x] **11.5** Integration smoke test
- [x] **11.6** Commit: `feat(ci): CI/CD pipeline with coverage gates (COR-11)`

---

## 📊 Resumen

| Tarea | Owner | Prio | Horas | Paralizable |
|-------|-------|------|-------|-------------|
| COR-1 Fix Build | Codex | P0 | 2h | No (blocker) |
| COR-2 Redis | Codex | P0 | 3h | No |
| COR-3 Postgres | Codex | P0 | 4h | No |
| COR-4 MemoryMgr | Codex | P1 | 2h | No (dep 2+3) |
| COR-5 RAG | Codex | P1 | 4h | Sí (con 6) |
| COR-6 Reasoner | Codex | P1 | 3h | Sí (con 5) |
| COR-7 Sandbox | Codex | P2 | 3h | Sí (con 8) |
| COR-8 HITL | Codex | P2 | 2h | Sí (con 7) |
| COR-9 Integration | Harvis | P0 | 5h | No (dep all) |
| COR-10 MLOps | Codex | P3 | 2h | Sí |
| COR-11 CI/CD | Vega | P1 | 2h | Sí (paralelo) |

**Total: 32h** (27h original + 3h buffer integración + 2h CI/CD)

---

## 📋 Asignaciones

```
@Codex: COR-1 → COR-8, COR-10 (desarrollo)
@Harvis: Coordinación + COR-9 (integración)
@Vector: Validación de cada tarea antes de avanzar
@Vega: COR-11 (CI/CD + infra)
```

## 🚀 Orden de Ejecución

**Día 1 COR-1 → COR-2 → COR-3 (+ COR-11 en paralelo por Vega) COR-4 → COR-5 + COR-6 (paralelos) COR-7 + COR-8 (paralelos)  COR-9 (integración) + COR-10
