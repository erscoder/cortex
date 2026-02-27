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
El build tiene errores de TypeScript. Necesita arreglar los tipos en reasoner.ts y completar el agente.

**Subtareas:**
- [ ] 1.1 Fix imports en reasoner.ts (`./types` → `./reasoning/types`)
- [ ] 1.2 Arreglar tipos de `steps` (implicit any)
- [ ] 1.3 Fix null vs undefined en parseResponse
- [ ] 1.4 Fix SearchOptions default en pipeline.ts
- [ ] 1.5 Agregar AgentAction type con `requiresApproval` obligatorio
- [ ] 1.6 Correr `npm run build` y verificar 0 errores
- [ ] 1.7 Commit: `fix: build errors resolved`

---

### 🎯 Tarea 2: Short-Term Memory (Redis)
**Owner:** Codex  
**Prioridad:** P0 - Critical  
**Estimación:** 3 horas

**Descripción:**  
Implementar memoria de corto plazo usando Redis para persistir contexto entre mensajes.

**Subtareas:**
- [ ] 2.1 Crear cliente Redis con ioredis
- [ ] 2.2 Implementar clase `RedisShortTermMemory` con TTL
- [ ] 2.3 Métodos: `save(key, value)`, `get(key)`, `delete(key)`, `clear(sessionId)`
- [ ] 2.4 Agregar tests unitarios (Jest)
- [ ] 2.5 Integrar en Agent con dependency injection
- [ ] 2.6 Commit: `feat: short-term memory with Redis`

---

### 🎯 Tarea 3: Long-Term Memory (PostgreSQL + Vector)
**Owner:** Codex  
**Prioridad:** P0 - Critical  
**Estimación:** 4 horas

**Descripción:**  
Implementar memoria de largo plazo con PostgreSQL y búsqueda vectorial.

**Subtareas:**
- [ ] 3.1 Crear script de migración SQL para tabla `cortex_memories`
- [ ] 3.2 Implementar `PostgresLongTermMemory` clase
- [ ] 3.3 Métodos: `save(memory)`, `search(query)`, `delete(id)`
- [ ] 3.4 Agregar campo `embedding` para búsqueda semántica
- [ ] 3.5 Agregar métodos de cleanup (memories > 30 días)
- [ ] 3.6 Tests: CRUD + búsqueda
- [ ] 3.7 Commit: `feat: long-term memory with PostgreSQL`

---

### 🎯 Tarea 4: Memory Interface Unificada
**Owner:** Codex  
**Prioridad:** P1 - High  
**Estimación:** 2 horas

**Descripción:**  
Crear clase unificada `MemoryManager` que combine short-term + long-term.

**Subtareas:**
- [ ] 4.1 Crear clase `MemoryManager` que envuelva ambos stores
- [ ] 4.2 Método `remember()` - guarda en ambos niveles
- [ ] 4.3 Método `recall()` - busca en long-term, cachea en short-term
- [ ] 4.4 Método `forget()` - elimina de ambos
- [ ] 4.5 Integrar en Agent orchestrator
- [ ] 4.6 Commit: `feat: unified memory manager`

---

### 🎯 Tarea 5: RAG Pipeline - Embedding + Vector Store
**Owner:** Codex  
**Prioridad:** P1 - High  
**Estimación:** 4 horas

**Descripción:**  
Implementar pipeline RAG funcional con embedding y búsqueda vectorial.

**Subtareas:**
- [ ] 5.1 Crear interface `EmbeddingModel` (OpenAI compatible 5.2)
- [ ] Implementar `OpenAIEmbeddings` clase
- [ ] 5.3 Implementar `WeaviateVectorStore` con el cliente correcto (v3)
- [ ] 5.4 Implementar `HybridRAGPipeline` con search + rerank
- [ ] 5.5 Método `buildContext()` - construye contexto desde resultados
- [ ] 5.6 Tests: embedding, vector search, pipeline completo
- [ ] 5.7 Commit: `feat: RAG pipeline with embeddings`

---

### 🎯 Tarea 6: Reasoner - Chain of Thought
**Owner:** Codex  
**Prioridad:** P1 - High  
**Estimación:** 3 horas

**Descripción:**  
Implementar razonamiento paso a paso integrado con LLM.

**Subtareas:**
- [ ] 6.1 Completar clase `ChainOfThoughtReasoner`
- [ ] 6.2 Integrar con LLM (Anthropic/minimax client). Usamos la subscripcion de antropic y de minimax tenemos la apikey, se puede coger de la configuracion de openclaw
- [ ] 6.3 Método `think()` que genera reasoning steps
- [ ] 6.4 Detectar cuándo necesita RAG (needsRag flag)
- [ ] 6.5 Detectar cuándo necesita acción (actions array)
- [ ] 6.6 Tests: reasoning con prompts de ejemplo
- [ ] 6.7 Commit: `feat: chain-of-thought reasoner`

---

### 🎯 Tarea 7: Sandbox Executor - Safe Command Execution
**Owner:** Codex  
**Prioridad:** P2 - Medium  
**Estimación:** 3 horas

**Descripción:**  
Implementar ejecutor seguro de comandos con allowlist y validación.

**Subtareas:**
- [ ] 7.1 Completar clase `SafeSandbox`
- [ ] 7.2 Implementar `validate()` con blocked patterns
- [ ] 7.3 Implementar `execute()` con timeout y logging
- [ ] 7.4 Allowlist de comandos seguros (npm, git, ls, cat)
- [ ] 7.5 Block patterns (rm -rf, curl|wget|sh, sudo)
- [ ] 7.6 Require approval patterns (rm, DROP, DELETE)
- [ ] 7.7 Tests: validación y ejecución
- [ ] 7.8 Commit: `feat: safe sandbox executor`

---

### 🎯 Tarea 8: Human-in-the-Loop (HITL)
**Owner:** Codex  
**Prioridad:** P2 - Medium  
**Estimación:** 2 horas

**Descripción:**  
Sistema de aprobaciones humanas para acciones riesgosas.

**Subtareas:**
- [ ] 8.1 Completar clase `HITLManager`
- [ ] 8.2 Método `requestApproval()` con risk assessment
- [ ] 8.3 Auto-approve para low-risk
- [ ] 8.4 Pending queue para approval
- [ ] 8.5 Callback para notificaciones (Telegram/Slack)
- [ ] 8.6 Tests: approval flow
- [ ] 8.7 Commit: `feat: human-in-the-loop approvals`

---

### 🎯 Tarea 9: Integration - Agent con Todo Integrado
**Owner:** Harvis (coordinación)  
**Prioridad:** P0 - Critical  
**Estimación:** 2 horas

**Descripción:**  
Integrar todos los módulos en el Agent y crear ejemplo funcional.

**Subtareas:**
- [ ] 9.1 Integrar MemoryManager en Agent
- [ ] 9.2 Integrar RAG pipeline en Agent
- [ ] 9.3 Integrar Reasoner en Agent
- [ ] 9.4 Integrar Sandbox + HITL en Agent
- [ ] 9.5 Crear ejemplo `examples/basic-agent.ts`
- [ ] 9.6 Demo: agente que razona, busca, ejecuta
- [ ] 9.7 Commit: `feat: complete agent integration`

---

### 🎯 Tarea 10: MLOps - Tracking & Evaluation
**Owner:** Codex  
**Prioridad:** P3 - Low  
**Estimación:** 2 horas

**Descripción:**  
Sistema básico de tracking de experimentos y métricas.

**Subtareas:**
- [ ] 10.1 Completar `MLflowTracker` 
- [ ] 10.2 Métodos: createExperiment, logMetrics, registerModel
- [ ] 10.3 Production metrics logging
- [ ] 10.4 Tests básicos
- [ ] 10.5 Commit: `feat: MLOps tracking`

---

## 📊 Resumen del Sprint

| Tarea | Owner | Prio | Horas |
|-------|-------|------|-------|
| 1. Fix Build | Codex | P0 | 2h |
| 2. Short-term Memory | Codex | P0 | 3h |
| 3. Long-term Memory | Codex | P0 | 4h |
| 4. Memory Interface | Codex | P1 | 2h |
| 5. RAG Pipeline | Codex | P1 | 4h |
| 6. Reasoner | Codex | P1 | 3h |
| 7. Sandbox | Codex | P2 | 3h |
| 8. HITL | Codex | P2 | 2h |
| 9. Integration | Harvis | P0 | 2h |
| 10. MLOps | Codex | P3 | 2h |

**Total estimado:** 27 horas  
**Duración:** 1 semana  
**Dificultad:** Alta

---

## 🎯 Definition of Done

- [ ] Build pasa sin errores
- [ ] Todos los módulos tienen tests (cobertura > 80%)
- [ ] Ejemplo funcional corre
- [ ] Documentación actualizada
- [ ] Commits con Conventional Commits

---

## 📋 Asignación de Agentes

```
@Codex: Tareas 1-8, 10 (desarrollo)
@Harvis: Coordinación + Tarea 9 (integration)
```

---

## 🚀 Ready for Sprint

@Codex - ¿Empezamos por la Tarea 1 (fix build errors)?
