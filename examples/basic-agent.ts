/**
 * Basic Agent Example
 * 
 * This example demonstrates how to set up and use the Cortex Agent
 * with all integrated modules.
 * 
 * IMPORTANT: You must provide API keys explicitly.
 * This is a library - we don't use environment variables.
 * 
 * Run: npx ts-node examples/basic-agent.ts
 */

import { Agent } from '../src/orchestrator/agent';
import { MemoryManager } from '../src/memory/manager';
import { PostgresLongTermMemory } from '../src/memory/long-term';
import { RedisShortTermMemory } from '../src/memory/short-term';
import { ChainOfThoughtReasoner } from '../src/reasoner';
import { SafeSandbox } from '../src/sandbox/executor';
import { HITLManager } from '../src/hitl/manager';
import { LLMClient } from '../src/llm/client';

// ⚠️ CONFIGURATION - Replace with your actual API keys
const CONFIG = {
  // Required: Your LLM provider API key
  llmApiKey: 'YOUR_ANTHROPIC_OR_MINIMAX_API_KEY_HERE',
  llmProvider: 'anthropic' as const,  // or 'minimax'
  
  // Optional: OpenAI API key (if using RAG/embeddings)
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  
  // Optional: Database config
  db: {
    host: 'localhost',
    database: 'cortex',
    user: 'cortex',
    password: 'cortex_dev_password',
  },
  
  // Optional: Redis config
  redis: {
    host: 'localhost',
    port: 6379,
  },
};

async function main() {
  console.log('🚀 Starting Cortex Agent...\n');

  // 0. Set up LLM client with your API key
  const llm = new LLMClient({
    provider: CONFIG.llmProvider,
    apiKey: CONFIG.llmApiKey,  // ⚠️ Required - pass your API key here
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
  });

  // 1. Set up memory (Redis + PostgreSQL)
  const memory = new MemoryManager({
    shortTerm: CONFIG.redis,
    longTerm: CONFIG.db,
  });

  // 2. Set up reasoner with LLM
  const reasoner = new ChainOfThoughtReasoner({ 
    maxSteps: 5,
    llm: llm.asReasonerFunction(), // Pass LLM function to reasoner
  });

  // 3. Set up sandbox
  const sandbox = new SafeSandbox();

  // 4. Set up HITL (optional - for high-risk actions)
  // Uncomment and configure if you want human approval for high-risk actions:
  // const hitl = new HITLManager({
  //   telegram: { botToken: 'YOUR_TELEGRAM_BOT_TOKEN' },
  //   slack: { botToken: 'YOUR_SLACK_BOT_TOKEN' },
  // });
  const hitl = new HITLManager({ autoApprove: true }); // Auto-approve for demo

  // 5. Create and configure agent
  const agent = new Agent({
    name: 'Cortex-Basic',
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    // Enable features
    memory: true,
    reasoning: true,
    rag: false,       // Set to true if you have RAG set up
    sandbox: true,
    humanInTheLoop: false, // Set to true to require approval for actions
  })
    .withMemory(memory)
    .withReasoner(reasoner)
    .withSandbox(sandbox)
    .withHITL(hitl);

  console.log(`✅ Agent initialized: ${agent.getName()} (ID: ${agent.getId()})`);
  console.log(`   Status: ${agent.getStatus()}\n`);

  // 6. Process some inputs
  const testInputs = [
    'What is 2 + 2? Think step by step.',
    'Remember that my favorite color is blue.',
    'What is my favorite color?',
  ];

  for (const input of testInputs) {
    console.log(`📝 Input: "${input}"`);
    
    const output = await agent.process(input);
    
    console.log(`   🤖 Output: ${output.output}`);
    console.log(`   ⏱️  Latency: ${output.latencyMs}ms`);
    console.log(`   📊 Status: ${output.error ? 'ERROR' : 'SUCCESS'}`);
    
    if (output.reasoning) {
      console.log(`   🧠 Reasoning steps: ${output.reasoning.length}`);
    }
    if (output.actions?.length) {
      console.log(`   ⚡ Actions executed: ${output.actions.length}`);
    }
    if (output.error) {
      console.log(`   ❌ Error: ${output.error}`);
    }
    
    console.log('');
  }

  console.log('✅ Example completed!');
}

// Run if executed directly
main().catch(console.error);
