# Sprint Plan - Cortex Agentic Platform

## Sprint 1: "Foundation & Memory" (1 semana)

### Objetivo
Construir la base del framework con memoria funcional (short-term + long-term) y el agente base integrando todo.

---

## Tareas del Sprint

### 🎯 Tarea 1: Fix Build Errors & Complete Agent Orchestrator
**Owner:** Codex  
**Prioridad:** P0 - Critical  
**Estimación:** 2 horas

**Descripción:**  
El proyecto actualmente tiene errores de TypeScript que bloquean el build. Necesitamos corregir todos los errores de tipos antes de continuar con el desarrollo.

**Subtareas:**
- [ ] **1.1 Fix import paths en reasoner.ts**
  - Cambiar `./types` → `./reasoning/types`
  - Verificar que el módulo existe en la ruta correcta
  - Verificar otros imports en el archivo

- [ ] **1.2 Arreglar tipos de `steps` array**
  - Problema: implicit any en el array de pasos
  - Solución: Definir type `ReasoningStep = { description: string; result: string }`
  - Aplicar el tipo a todos los arrays de steps

- [ ] **1.3 Fix null vs undefined en parseResponse**
  - Problema: Función puede retornar null o undefined
  - Solución: Decidir semántica (usar null para "sin respuesta", undefined para "error")
  - Actualizar tipos de retorno y consumers

- [ ] **1.4 Fix SearchOptions default en pipeline.ts**
  - Problema: Default object no cumple con interface completa
  - Solución: Agregar todos los campos requeridos al default
  - O hacer campos opcionales si tiene sentido

- [ ] **1.5 Agregar AgentAction type completo**
  - Crear interface `AgentAction` en `types.ts`
  - Campos: `type: string`, `payload: any`, `requiresApproval: boolean`
  - Usar el tipo en todo el código donde se manejan acciones

- [ ] **1.6 Verificar build completo**
  - Correr `npm run build`
  - Verificar 0 errores de TypeScript
  - Verificar 0 warnings críticos

- [ ] **1.7 Commit con mensaje convencional**
  - Formato: `fix: resolve TypeScript build errors`
  - Body: Listar los 5 errores arreglados

**Definition of Done:**
- ✅ Build pasa sin errores (`npm run build` exitoso)
- ✅ TypeScript en modo strict sin warnings
- ✅ Todos los tipos explícitos (no implicit any)
- ✅ Unit tests básicos para tipos nuevos (coverage ≥ 90%)
- ✅ Commit siguiendo Conventional Commits

---

### 🎯 Tarea 2: Short-Term Memory (Redis)
**Owner:** Codex  
**Prioridad:** P0 - Critical  
**Estimación:** 3 horas

**Descripción:**  
Implementar memoria de corto plazo usando Redis para persistir contexto de conversación entre mensajes. TTL de 1 hora por defecto.

**Prerequisitos:**
- Redis corriendo (Docker Compose o local)
- Verificar conexión con `redis-cli ping`

**Subtareas:**
- [ ] **2.1 Setup cliente Redis**
  - Instalar `ioredis` package
  - Crear `src/memory/redis-client.ts`
  - Config: host, port, password desde env vars
  - Método `connect()` con retry logic
  - Método `disconnect()` para cleanup

- [ ] **2.2 Implementar RedisShortTermMemory clase**
  - Path: `src/memory/short-term/redis.ts`
  - Interface `ShortTermMemory` con métodos base
  - Constructor recibe RedisClient
  - TTL configurable (default 3600s)

- [ ] **2.3 Método save(key, value)**
  - Serializar value a JSON
  - Usar `SETEX` con TTL
  - Prefijo de namespace: `cortex:stm:`
  - Error handling y logging
  - Retornar boolean (success/fail)

- [ ] **2.4 Método get(key)**
  - Usar `GET` con namespace
  - Deserializar JSON
  - Retornar null si no existe o expiró
  - Type safety con generics: `get<T>(key: string): Promise<T | null>`

- [ ] **2.5 Método delete(key)**
  - Usar `DEL` comando
  - Retornar boolean (key existed?)
  - Log deletion para audit

- [ ] **2.6 Método clear(sessionId)**
  - Usar `SCAN` para encontrar keys del session
  - Pattern: `cortex:stm:${sessionId}:*`
  - Batch delete con `DEL`
  - Retornar número de keys eliminadas

- [ ] **2.7 Unit tests con Jest**
  - Mock de ioredis con `ioredis-mock`
  - Test: save y get redondea correctamente
  - Test: TTL expira correctamente
  - Test: delete elimina
  - Test: clear elimina solo del session correcto
  - Test: error handling cuando Redis falla
  - **Coverage target: ≥ 90%**

- [ ] **2.8 Integration test (opcional)**
  - Test real contra Redis en Docker
  - Skip si Redis no disponible
  - Path: `tests/integration/redis-memory.test.ts`

- [ ] **2.9 Documentación**
  - Docstrings JSDoc en todos los métodos
  - README.md en `src/memory/` explicando uso
  - Ejemplo de uso en el README

- [ ] **2.10 Commit**
  - Formato: `feat(memory): implement Redis short-term memory`
  - Body: Explicar decisiones de diseño (TTL, namespace, etc)

**Definition of Done:**
- ✅ RedisShortTermMemory clase completa y funcional
- ✅ Unit tests con coverage ≥ 90%
- ✅ Integration test opcional (contra Docker)
- ✅ Documentación JSDoc completa
- ✅ README con ejemplos de uso
- ✅ TypeScript strict mode sin errores
- ✅ Error handling robusto
- ✅ Commit con Conventional Commits

---

### 🎯 Tarea 3: Long-Term Memory (PostgreSQL + Vector)
**Owner:** Codex  
**Prioridad:** P0 - Critical  
**Estimación:** 4 horas

**Descripción:**  
Implementar memoria de largo plazo con PostgreSQL y búsqueda vectorial usando pgvector. Stores permanente de memories con embeddings para búsqueda semántica.

**Prerequisitos:**
- PostgreSQL corriendo con pgvector extension
- Verificar: `SELECT * FROM pg_extension WHERE extname = 'vector';`

**Subtareas:**
- [ ] **3.1 Script de migración SQL**
  - Path: `migrations/001_create_memories_table.sql`
  - Tabla `cortex_memories`:
    ```sql
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002 dimensión
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NULL,
    INDEX idx_session (session_id),
    INDEX idx_created (created_at),
    INDEX idx_embedding (embedding vector_cosine_ops)
    ```
  - Script para crear extension: `CREATE EXTENSION IF NOT EXISTS vector;`
  - Script de rollback en `migrations/001_rollback.sql`

- [ ] **3.2 Implementar PostgresLongTermMemory clase**
  - Path: `src/memory/long-term/postgres.ts`
  - Interface `LongTermMemory` con métodos base
  - Constructor recibe Postgres pool
  - Connection pooling con `pg` package

- [ ] **3.3 Método save(memory)**
  - Input: `{ sessionId, content, embedding?, metadata?, expiresAt? }`
  - INSERT en tabla con RETURNING id
  - Auto-generar UUID si no viene
  - Validar embedding dimensión (1536)
  - Error handling y logging
  - Retornar Memory object completo

- [ ] **3.4 Método search(query, options)**
  - Input: `{ embedding, sessionId?, limit?, minScore? }`
  - Query con vector similarity:
    ```sql
    SELECT *, 1 - (embedding <=> $1) as score
    FROM cortex_memories
    WHERE session_id = $2 AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY embedding <=> $1
    LIMIT $3
    ```
  - Filtrar por minScore si viene
  - Retornar array de Memory + score

- [ ] **3.5 Método delete(id)**
  - DELETE por UUID
  - Retornar boolean (row deleted?)
  - Soft delete opcional (agregar deleted_at column)

- [ ] **3.6 Método cleanup()**
  - DELETE memories con expires_at < NOW()
  - Retornar número de rows eliminadas
  - Ejecutar periódicamente (cron job)

- [ ] **3.7 Unit tests con Jest**
  - Mock de pg pool
  - Test: save inserta correctamente
  - Test: search retorna por similaridad
  - Test: delete elimina
  - Test: cleanup elimina expirados
  - Test: error handling cuando DB falla
  - **Coverage target: ≥ 90%**

- [ ] **3.8 Integration test**
  - Test real contra Postgres en Docker
  - Setup: Correr migraciones
  - Test: Full CRUD flow
  - Test: Vector search con embeddings reales
  - Teardown: Limpiar tabla

- [ ] **3.9 Documentación**
  - Docstrings JSDoc en todos los métodos
  - README con setup de pgvector
  - Ejemplo de búsqueda semántica

- [ ] **3.10 Commit**
  - Formato: `feat(memory): implement PostgreSQL long-term memory with pgvector`

**Definition of Done:**
- ✅ PostgresLongTermMemory clase completa
- ✅ Migraciones SQL versionadas
- ✅ Unit tests con coverage ≥ 90%
- ✅ Integration test contra Postgres real
- ✅ Búsqueda vectorial funcionando
- ✅ Documentación completa
- ✅ Cleanup automático de expirados
- ✅ TypeScript strict mode
- ✅ Commit con Conventional Commits

---

### 🎯 Tarea 4: Memory Interface Unificada
**Owner:** Codex  
**Prioridad:** P1 - High  
**Estimación:** 2 horas

**Descripción:**  
Crear clase `MemoryManager` que unifique short-term y long-term memory con una API simple. Cache hit automático en Redis antes de PostgreSQL.

**Subtareas