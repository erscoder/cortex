# Sprint 2: "Production Ready" (1 semana)

## Objetivo
Convertir el scaffold de Sprint 1 en un framework funcional y profesional, listo para publicar como paquete npm open-source.

## ⚠️ Reglas (igual que Sprint 1)
- Tests obligatorios — cobertura ≥ 90% (statements + branches + functions + lines)
- No se avanza sin tests de la tarea actual
- Conventional Commits
- Vector valida cada tarea
- Zero `any` implícitos

---

## Estado actual (post-Sprint 1)
- ✅ Memory: Redis (short-term) + PostgreSQL/pgvector (long-term) + MemoryManager
- ✅ RAG: Embeddings + Weaviate vector store + HybridRAGPipeline
- ✅ Reasoner: ChainOfThoughtReasoner (heurísticas, no LLM real)
- ✅ LLM Client: Anthropic + MiniMax (estructura correcta, endpoint de Anthropic incorrecto)
- ✅ Sandbox: SafeSandbox con allowlist/blocklist
- ✅ HITL: HITLManager con timeout y polling
- ✅ MLOps: MLflowTracker básico
- ✅ CI/CD: Docker Compose + GitHub Actions + 91% coverage

## Lo que falta para "profesional"
- ❌ LLM client usa endpoint incorrecto (`/text/chatcompletion_v2` para Anthropic — debería ser `/v1/messages`)
- ❌ Reasoner no usa LLM real en producción
- ❌ No hay tool system (el agente no puede hacer nada útil)
- ❌ No hay streaming
- ❌ Exports de npm no están limpios (no hay `exports` field en package.json)
- ❌ No hay TypeDoc generado
- ❌ README es básico
- ❌ No hay ejemplos que funcionen end-to-end sin modificación
- ❌ Deuda técnica: 4 archivos con branches <90%

---

## Tareas del Sprint

---

### COR-12: Fix LLM Client + Streaming (P0)
**Owner:** Codex | **Est:** 4h | **Depende:** Nada

El LLM client existe pero tiene bugs. Anthropic endpoint es `/v1/messages`, no `/text/chatcompletion_v2`. MiniMax endpoint también necesita verificación. Agregar streaming support.

**Subtareas:**

- [ ] **12.1** Fix Anthropic endpoint: `/v1/messages` con formato correcto
  - Request: `{ model, max_tokens, messages: [{role, content}], system?, stream? }`
  - Headers: `x-api-key`, `anthropic-version: 2023-06-01`, `content-type: application/json`
  - Response: `{ content: [{type: "text", text: "..."}], usage: {input_tokens, output_tokens} }`

- [ ] **12.2** Fix MiniMax endpoint: verificar API docs actuales
  - Si MiniMax usa OpenAI-compatible format, adaptar

- [ ] **12.3** Agregar OpenAI provider
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Headers: `Authorization: Bearer {key}`
  - Mismo interface `LLMClient`

- [ ] **12.4** Streaming support
  - `complete()` retorna `LLMResponse` (non-streaming, como ahora)
  - `stream()` retorna `AsyncIterable<string>` (SSE parsing)
  - Anthropic: `stream: true` en body, parse SSE events
  - OpenAI: `stream: true`, parse `data: {...}` chunks

- [ ] **12.5** Retry con exponential backoff
  - Rate limits (429): retry con backoff (1s, 2s, 4s, max 3 intentos)
  - Server errors (5xx): retry 1 vez
  - Client errors (4xx excepto 429): no retry, throw

- [ ] **12.6** Tests con fetch mock (NO llama APIs reales)
  - Anthropic: request format, response parsing, error handling
  - OpenAI: request format, response parsing
  - Streaming: SSE parsing, chunk accumulation
  - Retry: 429 → retry → success, 500 → retry → fail
  - **Cobertura ≥ 90%**

- [ ] **12.7** Commit: `fix(llm): correct API endpoints and add streaming (COR-12)`

---

### COR-13: Tool System (P0)
**Owner:** Codex | **Est:** 5h | **Depende:** COR-12

El agente necesita poder ejecutar acciones. Sin tools, es solo un chatbot. Crear sistema de tools con interface clara, registro dinámico, y validación con Zod.

**Subtareas:**

- [ ] **13.1** Crear `src/tools/types.ts`
  ```typescript
  interface Tool {
    name: string;
    description: string;
    parameters: ZodSchema;  // Zod schema para validación
    execute(params: unknown): Promise<ToolResult>;
  }

  interface ToolResult {
    success: boolean;
    output: unknown;
    error?: string;
  }

  interface ToolRegistry {
    register(tool: Tool): void;
    get(name: string): Tool | undefined;
    list(): Tool[];
    execute(name: string, params: unknown): Promise<ToolResult>;
  }
  ```

- [ ] **13.2** Implementar `ToolRegistry` en `src/tools/registry.ts`
  - `register(tool)`: valida que tiene name, description, parameters, execute
  - `get(name)`: lookup por nombre
  - `list()`: retorna todas las tools registradas
  - `execute(name, params)`: valida params con Zod schema, ejecuta, retorna resultado
  - Error handling: tool no encontrada, params inválidos, ejecución falla

- [ ] **13.3** Crear built-in tools en `src/tools/builtins/`
  - **`web-search.ts`**: `{ query: string, maxResults?: number }` → resultados de búsqueda (usa fetch)
  - **`calculator.ts`**: `{ expression: string }` → resultado numérico (eval seguro, no `eval()`)
  - **`file-read.ts`**: `{ path: string }` → contenido del archivo (con validación de path)
  - **`http-request.ts`**: `{ url, method, headers?, body? }` → response (con timeout y allowed domains)

- [ ] **13.4** Integrar tools en Agent
  - Agent tiene `withTools(registry: ToolRegistry)`
  - Reasoner detecta cuándo usar tool (via LLM function calling o keyword detection)
  - Agent ejecuta tool, pasa resultado de vuelta al reasoner
  - Loop: reason → tool → observe → reason (ReAct pattern)

- [ ] **13.5** Tool calling format para LLMs
  - Anthropic: usar `tools` parameter en API call
  - OpenAI: usar `functions` / `tools` parameter
  - Formato: `{ name, description, input_schema }` generado desde Zod schema

- [ ] **13.6** Tests
  - Registry: register, get, list, execute, error handling
  - Builtins: cada tool con inputs válidos/inválidos
  - Integration: Agent + tools + reasoner loop
  - **Cobertura ≥ 90%**

- [ ] **13.7** Commit: `feat(tools): tool system with registry and builtins (COR-13)`

---

### COR-14: Reasoner con LLM Real (P0)
**Owner:** Codex | **Est:** 3h | **Depende:** COR-12, COR-13

Conectar el ChainOfThoughtReasoner al LLM real. El reasoner actual usa heurísticas — reemplazar con LLM para reasoning real. Integrar tool calling.

**Subtareas:**

- [ ] **14.1** Conectar Reasoner a LLMClient
  - Constructor: `{ llm: LLMClient, maxSteps?, tools?: ToolRegistry }`
  - `think()` usa `llm.complete()` en vez de `generateSimpleThought()`
  - Mantener fallback a heurísticas si no hay LLM configurado

- [ ] **14.2** Mejorar prompt para ReAct pattern
  - System prompt: "You are a reasoning engine. Think step by step. Use tools when needed."
  - Format: Thought → Action → Observation → Thought (loop)
  - Tool calling: generar tool calls desde LLM response, ejecutar, pasar observation

- [ ] **14.3** Structured output con JSON
  - Pedir al LLM que responda en JSON: `{ thought, action?, toolCall?, observation?, finalAnswer? }`
  - Parser robusto: manejar JSON parcial, respuestas que no siguen formato

- [ ] **14.4** Token budget management
  - Configurar max tokens por step
  - Truncar contexto si excede ventana del modelo
  - Logging de tokens usados por step

- [ ] **14.5** Tests con LLM mock
  - ReAct loop completo: think → tool → observe → conclude
  - Fallback a heurísticas sin LLM
  - JSON parsing: válido, inválido, parcial
  - Token budget exceeded
  - **Cobertura ≥ 90%**

- [ ] **14.6** Commit: `feat(reasoning): connect reasoner to LLM with ReAct pattern (COR-14)`

---

### COR-15: npm Package Polish (P1)
**Owner:** Codex | **Est:** 3h | **Depende:** COR-12, COR-13

Preparar el paquete para publicación en npm. Exports limpios, tipos correctos, zero dependency issues.

**Subtareas:**

- [ ] **15.1** Actualizar `package.json`
  - `name`: `cortex-ai` o `@cortex-ai/core` (verificar disponibilidad en npm)
  - `version`: `0.2.0`
  - `exports`: field con subpath exports
    ```json
    "exports": {
      ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
      "./memory": { "import": "./dist/memory/index.js", "types": "./dist/memory/index.d.ts" },
      "./rag": { "import": "./dist/rag/index.js", "types": "./dist/rag/index.d.ts" },
      "./tools": { "import": "./dist/tools/index.js", "types": "./dist/tools/index.d.ts" }
    }
    ```
  - `files`: solo incluir `dist/`, `README.md`, `LICENSE`
  - `engines`: `{ "node": ">=18" }`
  - `keywords`: `["ai", "agent", "llm", "rag", "memory", "tools"]`

- [ ] **15.2** Crear subpath index files
  - `src/memory/index.ts`: re-export público
  - `src/rag/index.ts`: re-export público
  - `src/tools/index.ts`: re-export público
  - Solo exportar lo que el usuario necesita (no internals)

- [ ] **15.3** Verificar tree-shaking
  - Build con `tsc` → verificar que outputs son importables individualmente
  - `import { Agent } from 'cortex-ai'` funciona
  - `import { MemoryManager } from 'cortex-ai/memory'` funciona

- [ ] **15.4** Peer dependencies
  - `ioredis`: ¿peer o dependency? → peer (usuario puede no usar Redis)
  - `pg`: peer (usuario puede no usar Postgres)
  - `weaviate-client`: peer (usuario puede no usar Weaviate)
  - Solo `zod` y `uuid` como direct dependencies

- [ ] **15.5** License + .npmignore
  - MIT License file
  - `.npmignore`: tests, coverage, docker-compose, scripts, .github

- [ ] **15.6** `npm pack --dry-run` para verificar qué se publica
  - Solo `dist/`, `README.md`, `LICENSE`, `package.json`
  - Tamaño < 500KB

- [ ] **15.7** Commit: `feat(npm): prepare package for npm publication (COR-15)`

---

### COR-16: README Profesional + Docs (P1)
**Owner:** Harvis (plan) + Codex (implementación) | **Est:** 4h | **Depende:** COR-12, COR-13, COR-14

README que venda el proyecto. API docs generados. Ejemplos que funcionan.

**Subtareas:**

- [ ] **16.1** README.md completo
  - Hero section: nombre + tagline + badges (build, coverage, npm version, license)
  - Features list con emojis
  - Quick Start (5 líneas para tener un agente corriendo)
  - Installation
  - Core Concepts: Memory, RAG, Reasoning, Tools, HITL
  - Configuration (todas las opciones documentadas)
  - Comparación con competidores (tabla)
  - Contributing link
  - License

- [ ] **16.2** Ejemplos funcionales en `examples/`
  - `basic-agent.ts`: agente mínimo (ya existe, actualizar)
  - `rag-chatbot.ts`: chatbot con RAG y memoria
  - `tool-agent.ts`: agente que usa tools (web search, calculator)
  - Cada ejemplo con comentarios, runnable con `npx ts-node examples/xxx.ts`

- [ ] **16.3** TypeDoc setup
  - Instalar `typedoc`
  - Config: `typedoc.json`
  - Script: `npm run docs` → genera `docs/` con API reference
  - Deploy to GitHub Pages (opcional)

- [ ] **16.4** Architecture docs
  - `docs/architecture.md`: diagrama de componentes (Mermaid)
  - `docs/memory.md`: cómo funciona el sistema de memoria
  - `docs/tools.md`: cómo crear tools custom
  - `docs/reasoning.md`: ReAct pattern explicado

- [ ] **16.5** Commit: `docs: professional README and API documentation (COR-16)`

---

### COR-17: Deuda Técnica Sprint 1 (P1)
**Owner:** Codex | **Est:** 2h | **Depende:** Nada (paralelo)

Subir branch coverage de 4 archivos que quedaron <90%.

**Subtareas:**

- [ ] **17.1** `rag/vector-store.ts`: 71.42% → ≥90%
  - Branches sin cubrir: lines 37-38 (`source || 'unknown'`, `certainty || 0`)
  - Tests: search results sin source, sin certainty

- [ ] **17.2** `memory/long-term.ts`: 86.2% → ≥90%
  - Branches: lines 30,34,56-58,187,198-206
  - Tests: constructor defaults, cleanup edge cases

- [ ] **17.3** `memory/short-term.ts`: 86.66% → ≥90%
  - Branch: line 32 (TTL default)
  - Test: constructor sin TTL explícito

- [ ] **17.4** `rag/embeddings.ts`: 86.66% → ≥90%
  - Branches: lines 17,97  - Tests: embeddings sin API key config edge cases, batch con empty array

- [ ] **17.5** Commit: `test: resolve Sprint 1 technical debt — all files ≥90% branches (COR-17)`

---

### COR-18: Error Handling + Logging (P2)
**Owner:** Codex | **Est:** 2h | **Depende:** COR-12

Errores claros para usuarios de la librería. Logging estructurado opcional.

**Subtareas:**

- [ ] **18.1** Custom error classes en `src/errors.ts`
  - `CortexError` (base)
  - `LLMError` (API failures, rate limits)
  - `MemoryError` (Redis/Postgres connection issues)
  - `ToolError` (tool execution failures)
  - `ValidationError` (invalid config, params)
  - Cada error con `code`, `message`, `cause` (para chaining)

- [ ] **18.2** Logging con nivel configurable
  - Interface `Logger { debug, info, warn, error }`
  - Default: `ConsoleLogger` (usa `console.*`)
  - Configurable: `agent.setLogger(myLogger)`
  - Structured: `{ timestamp, level, component, message, data? }`
  - Silent mode: `agent.setLogger(null)` — zero output

- [ ] **18.3** Reemplazar todos los `throw new Error(...)` con custom errors
  - Cada módulo usa su error class
  - Mensajes descriptivos con sugerencias de fix

- [ ] **18.4** Tests: cada error class, logger levels, silent mode
- [ ] **18.5** Commit: `feat(errors): custom error classes and structured logging (COR-18)`

---

### COR-19: Multi-Agent Orchestration (P2)
**Owner:** Codex | **Est:** 4h | **Depende:** COR-12, COR-13, COR-14

Permitir que múltiples agentes colaboren. Esto diferencia a Cortex de LangChain.

**Subtareas:**

- [ ] **19.1** Crear `src/orchestrator/multi-agent.ts`
  - `AgentTeam`: grupo de agentes con roles
  - Cada agente tiene: `name`, `role`, `tools`, `instructions`
  - Orquestador decide qué agente habla next (round-robin, LLM-directed, o task-based)

- [ ] **19.2** Communication entre agentes
  - Shared memory: todos acceden al mismo MemoryManager
  - Message passing: agente A puede enviar mensaje a agente B
  - Context sharing: resultados de un agente son input del siguiente

- [ ] **19.3** Orchestration strategies
  - `sequential`: A → B → C (pipeline)
  - `parallel`: A, B, C ejecutan simultáneamente, resultados se combinan
  - `debate`: A y B argumentan, C decide (para decisiones complejas)
  - `hierarchical`: manager asigna tasks a workers

- [ ] **19.4** Tests con mocks
  - Sequential pipeline funcional
  - Parallel execution
  - Shared memory entre agentes
  - **Cobertura ≥ 90%**

- [ ] **19.5** Commit: `feat(orchestrator): multi-agent collaboration (COR-19)`

---

## 📊 Resumen Sprint 2

| Tarea | Owner | Prio | Horas | Depende |
|-------|-------|------|-------|---------|
| COR-12 LLM Client Fix | Codex | P0 | 4h | — |
| COR-13 Tool System | Codex | P0 | 5h | COR-12 |
| COR-14 Reasoner + LLM | Codex | P0 | 3h | COR-12, 13 |
| COR-15 npm Polish | Codex | P1 | 3h | COR-12, 13 |
| COR-16 README + Docs | Harvis+Codex | P1 | 4h | COR-12, 13, 14 |
| COR-17 Deuda Técnica | Codex | P1 | 2h | — (paralelo) |
| COR-18 Errors + Logging | Codex | P2 | 2h | COR-12 |
| COR-19 Multi-Agent | Codex | P2 | 4h | COR-12, 13, 14 |

**Total: 27h**

## 📋 Asignaciones

```
@Codex: COR-12 → COR-19 (desarrollo)
@Harvis: Coordinación + COR-16 (docs planning)
@Vector: Validación de cada tarea
@Vega: Soporte infra si hace falta
```

## 🚀 Orden de Ejecución

**Día 1:** COR-12 (LLM fix) + COR-17 (deuda técnica, paralelo)
**Día 2:** COR-13 (Tools) + COR-18 (Errors, paralelo)
**Día 3:** COR-14 (Reasoner + LLM real)
**Día 4:** COR-15 (npm) + COR-16 (Docs)
**Día 5:** COR-19 (Multi-Agent) + polish final

## 🎯 Definition of Done — Sprint 2

- [ ] `npm run build` → 0 errores
- [ ] `npm test` → todos pasan, coverage ≥ 90%
- [ ] LLM client conecta a Anthropic/OpenAI reales (verificado con API key)
- [ ] Tool system funcional con ≥3 built-in tools
- [ ] Agent puede ejecutar tareas end-to-end (no solo scaffold)
- [ ] Ejemplos en `examples/` funcionan sin modificación
- [ ] README profesional con Quick Start funcional
- [ ] `npm pack` produce paquete limpio <500KB
- [ ] Multi-agent orchestration funcional
- [ ] Zero `any` implícitos
