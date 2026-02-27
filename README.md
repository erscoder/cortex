# 🧠 Cortex - Agentic Platform

<p align="center">
  <a href="https://www.npmjs.com/package/@cortex/agentic-platform">
    <img src="https://img.shields.io/npm/v/@cortex/agentic-platform?style=flat&color=blue" alt="npm version">
  </a>
  <a href="https://github.com/erscoder/cortex/actions">
    <img src="https://github.com/erscoder/cortex/actions/workflows/test.yml/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/erscoder/cortex">
    <img src="https://img.shields.io/codecov/c/github/erscoder/cortex?token=xxxx" alt="Coverage">
  </a>
  <a href="https://github.com/erscoder/cortex/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@cortex/agentic-platform" alt="License">
  </a>
</p>

> Build autonomous AI agents with memory, reasoning, RAG, sandbox execution, and human-in-the-loop supervision.

Cortex is a production-ready framework for building intelligent AI agents that can **remember**, **think**, **search**, **execute safely**, and **ask for help** when needed.

## ✨ Features

- 🧠 **Multi-Agent Orchestration** — Coordinate multiple agents with LangGraph-style workflows
- 💾 **Persistent Memory** — Short-term (Redis) + Long-term (PostgreSQL + pgvector)
- 📚 **RAG Pipeline** — Hybrid search, embeddings, reranking
- 🧩 **Advanced Reasoning** — Chain-of-thought, Tree-of-thoughts
- 🔒 **Sandbox Execution** — Safe command/AI execution with allowlists
- 🛡️ **Human-in-the-Loop** — Approval workflows for critical actions
- 📊 **MLOps Ready** — Experiment tracking, metrics, model versioning

## 📦 Installation

```bash
npm install @cortex/agentic-platform
```

## 🚀 Quick Start

```typescript
import { Agent } from '@cortex/agentic-platform';
import { RedisShortTermMemory } from '@cortex/agentic-platform/memory';
import { HybridRAGPipeline } from '@cortex/agentic-platform/rag';
import { SafeSandbox } from '@cortex/agentic-platform/sandbox';

// Configure your agent
const agent = new Agent({
  name: 'trading-bot',
  model: 'claude-3-sonnet',
  temperature: 0.7,
  
  // Enable features
  memory: true,
  reasoning: true,
  rag: true,
  sandbox: true,
  humanInTheLoop: true,
})

// Inject dependencies
.withMemory(new RedisShortTermMemory({ host: 'localhost', port: 6379 }))
.withRAG(new HybridRAGPipeline({ vectorStore, embeddingModel }))
.withSandbox(new SafeSandbox())
.withHITL(new HITLManager({ autoApproveLowRisk: true }));

// Process a task
const response = await agent.process({
  input: 'Analyze BTC market and execute optimal trade',
  context: { userId: 'trader-1' },
});

console.log(response.output);
// "I'll analyze the BTC market..."
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Agent                             │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  Reasoner  │  │   Memory    │  │    RAG    │  │
│  │  (CoT/ToT) │  │  Short+Long │  │  Pipeline  │  │
│  └─────────────┘  └─────────────┘  └───────────┘  │
│  ┌─────────────┐  ┌─────────────┐                 │
│  │   Sandbox   │  │    HITL     │                 │
│  │  (Safe Exec)│  │ (Approvals) │                 │
│  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────┘
```

## 📚 Modules

| Module | Description |
|--------|-------------|
| [`orchestrator`](src/orchestrator/) | Agent core with workflow orchestration |
| [`memory`](src/memory/) | Redis (short-term) + PostgreSQL (long-term) |
| [`rag`](src/rag/) | Hybrid search, embeddings, reranking |
| [`reasoning`](src/reasoning/) | Chain-of-thought, Tree-of-thoughts |
| [`sandbox`](src/sandbox/) | Safe command/API execution |
| [`hitl`](src/hitl/) | Human approval workflows |
| [`mlops`](src/mlops/) | Experiment tracking, metrics |

## 🔧 Configuration

```typescript
// Agent Config
const config = {
  model: 'claude-3-sonnet',
  temperature: 0.7,
  maxTokens: 4096,
  
  // Features
  memory: true,        // Enable memory
  reasoning: true,     // Enable chain-of-thought
  rag: false,          // Enable RAG
  sandbox: true,       // Enable sandbox
  humanInTheLoop: true, // Enable approvals
  
  // Limits
  maxRetries: 3,
  timeoutMs: 30000,
};
```

## 📖 Examples

- [Basic Agent](./examples/basic-agent.ts) — Simple agent with all features
- [Trading Bot](./examples/trading-bot.ts) — Real-world trading example
- [RAG Chat](./examples/rag-chat.ts) — Chat with knowledge base

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run lint
npm run lint
```

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ by [Kike](https://github.com/erscoder)**

[Website](https://github.com/erscoder/cortex) · [Report Bug](https://github.com/erscoder/cortex/issues) · [Request Feature](https://github.com/erscoder/cortex/issues)

</div>
