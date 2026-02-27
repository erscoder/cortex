# Cortex - Agentic Platform 🧠

> Framework para construir agentes IA autónomos con memoria, razonamiento y ejecución segura.

## Instalación

```bash
npm install @cortex/agentic-platform
```

## Uso Básico

```typescript
import { Agent } from '@cortex/agentic-platform';

const agent = new Agent({
  model: 'claude-3-sonnet',
  memory: true,
  sandbox: true,
  humanInTheLoop: true,
});

const response = await agent.process({
  input: 'Optimiza el trading de BTC',
  context: { userId: 'kike' },
});

console.log(response.output);
```

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **orchestrator** | Orquestación de agentes con LangGraph |
| **memory** | Memoria corto plazo (Redis) + largo plazo (Postgres) |
| **rag** | Pipeline RAG con embedding, vector search y reranking |
| **reasoning** | Chain-of-thought, Tree-of-thoughts |
| **sandbox** | Ejecución segura de código y comandos |
| **hitl** | Human-in-the-loop para aprobaciones |
| **mlops** | Tracking, evaluación y versionado de modelos |

## Documentación

- [Arquitectura](./docs/architecture.md)
- [API Reference](./docs/api/)
- [Ejemplos](./examples/)

## Licencia

MIT
