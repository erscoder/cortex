# 🧠 Cortex - Agentic Platform

<p align="center">
  <a href="https://github.com/erscoder/cortex/actions">
    <img src="https://github.com/erscoder/cortex/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="#tests">
    <img src="https://img.shields.io/badge/coverage-91.28%25-brightgreen" alt="Coverage">
  </a>
  <a href="https://github.com/erscoder/cortex/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript">
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
import { Agent, LLMClient } from '@cortex/agentic-platform';
import { MemoryManager } from '@cortex/agentic-platform/memory';
import { OpenAIEmbeddings } from '@cortex/agentic-platform/rag';
import { SafeSandbox } from '@cortex/agentic-platform/sandbox';

// ⚠️ IMPORTANT: Pass your API keys explicitly
// This is a library - we don't use environment variables

// 1. Set up LLM client with your API key
const llm = new LLMClient({
  provider: 'anthropic',  // or 'minimax'
  apiKey: 'your-anthropic-api-key-here',  // Required
  model: 'claude-3-haiku-20240307',
});

// 2. Set up embeddings (if using RAG)
const embeddings = new OpenAIEmbeddings({
  apiKey: 'your-openai-api-key-here',  // Required
  model: 'text-embedding-3-small',
});

// 3. Configure your agent
const agent = new Agent({
  name: 'trading-bot',
  llm: llm.asReasonerFunction(),  // Pass LLM function
  
  // Enable features
  memory: true,
  reasoning: true,
  rag: true,
  sandbox: true,
  humanInTheLoop: false,
})
.withMemory(new MemoryManager({
  shortTerm: { host: 'localhost', port: 6379 },
  longTerm: { database: 'cortex', user: 'cortex', password: 'password' },
}))
.withSandbox(new SafeSandbox());

// 4. Process a task
const response = await agent.process('Analyze BTC market and execute optimal trade');

console.log(response.output);
// "I'll analyze the BTC market..."
```

### Configuration

All API keys must be passed explicitly in your code:

```typescript
// ❌ WRONG - Don't rely on environment variables
const llm = new LLMClient({ provider: 'anthropic' });

// ✅ CORRECT - Pass API key explicitly
const llm = new LLMClient({
  provider: 'anthropic',
  apiKey: 'sk-ant-...',  // Your actual API key
});
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

## 🧪 Tests

Cortex has comprehensive test coverage with **263 tests** passing:

```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
```

**Coverage Stats:**
- Statements: 98.84%
- Branches: 91.28%
- Functions: 98.95%
- Lines: 98.78%

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
