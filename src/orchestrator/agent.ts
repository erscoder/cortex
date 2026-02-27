// Agent - Main orchestrator class
import { v4 as uuidv4 } from 'uuid';
import { 
  AgentConfig, 
  AgentInput, 
  AgentOutput, 
  AgentState,
  AgentStatus,
  AgentConfigSchema,
  AgentInputSchema,
  AgentOutputSchema 
} from './types';

import { MemorySystem } from '../memory/types';

export class Agent {
  private config: AgentConfig;
  private state: AgentState;
  
  // Dependencies (to be injected)
  private memory?: MemorySystem;
  private rag?: import('../rag/types').RAGPipeline;
  private reasoner?: import('../reasoning/types').Reasoner;
  private sandbox?: import('../sandbox/types').SandboxExecutor;
  private hitl?: import('../hitl/types').HumanInTheLoop;
  
  constructor(config: AgentConfig) {
    this.config = AgentConfigSchema.parse(config);
    this.state = {
      id: this.config.id || uuidv4(),
      name: this.config.name,
      status: AgentStatus.IDLE,
      currentTask: null,
      context: new Map(),
      memory: { shortTerm: [], longTerm: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  // Dependency injection
  withMemory(memory: import('../memory/types').MemorySystem): this {
    this.memory = memory;
    return this;
  }
  
  withRAG(rag: import('../rag/types').RAGPipeline): this {
    this.rag = rag;
    return this;
  }
  
  withReasoner(reasoner: import('../reasoning/types').Reasoner): this {
    this.reasoner = reasoner;
    return this;
  }
  
  withSandbox(sandbox: import('../sandbox/types').SandboxExecutor): this {
    this.sandbox = sandbox;
    return this;
  }
  
  withHITL(hitl: import('../hitl/types').HumanInTheLoop): this {
    this.hitl = hitl;
    return this;
  }
  
  // Main processing method
  async process(input: AgentInput | string): Promise<AgentOutput> {
    const validatedInput = typeof input === 'string' 
      ? AgentInputSchema.parse({ input })
      : AgentInputSchema.parse(input);
    
    const taskId = validatedInput.id || uuidv4();
    const startTime = Date.now();
    
    this.state.status = AgentStatus.THINKING;
    this.state.currentTask = validatedInput;
    
    try {
      // Step 1: Load context from memory if enabled
      const context = { ...validatedInput.context };
      
      if (this.config.memory && this.memory) {
        const relevantMemories = await this.memory.search(
          validatedInput.input,
          { limit: 5 }
        );
        context.relevantMemories = relevantMemories;
        this.state.memory.shortTerm = relevantMemories.map(m => m.id);
      }
      
      // Step 2: Reasoning if enabled
      let reasoningResult;
      if (this.config.reasoning && this.reasoner) {
        reasoningResult = await this.reasoner.think(validatedInput.input, context);
        
        // Step 3: RAG search if needed
        if (reasoningResult?.needsRag && this.rag) {
          this.state.status = AgentStatus.SEARCHING;
          const searchResults = await this.rag.search(reasoningResult.ragQuery!);
          context.searchResults = searchResults;
        }
      }
      
      // Step 4: Generate response (placeholder - needs LLM integration)
      // Pass reasoning context if available, otherwise use empty context
      const reasoningContext = reasoningResult 
        ? { ...context, reasoning: reasoningResult }
        : context;
      const output = await this.generateResponse(validatedInput.input, reasoningContext);
      
      // Step 5: Execute actions if any
      const actions = [];
      if (reasoningResult?.actions) {
        for (const action of reasoningResult.actions) {
          if (this.config.humanInTheLoop && this.hitl) {
            const approval = await this.hitl.requestApproval({
              type: action.type,
              payload: action.payload,
              risk: action.risk
            });
            if (approval.status !== 'approved') {
              actions.push({ ...action, approved: false, skipped: true });
              continue;
            }
          }
          
          if (this.config.sandbox && this.sandbox) {
            this.state.status = AgentStatus.EXECUTING;
            const result = await this.sandbox.execute({
              type: action.type,
              payload: action.payload,
              risk: action.risk,
              requiresApproval: action.risk === 'high'
            });
            actions.push({ ...action, result, approved: true });
          }
        }
      }
      
      // Step 6: Save to memory
      if (this.config.memory && this.memory) {
        await this.memory.save({
          type: 'conversation',
          content: `User: ${validatedInput.input}\nAgent: ${output}`,
          importance: 5,
          metadata: { taskId },
        });
      }
      
      this.state.status = AgentStatus.COMPLETED;
      
      return AgentOutputSchema.parse({
        id: taskId,
        input: validatedInput.input,
        output,
        model: this.config.model,
        tokensUsed: 0, // To implement with LLM
        latencyMs: Date.now() - startTime,
        reasoning: reasoningResult?.steps,
        memoryUsed: this.state.memory.shortTerm,
        actions,
        createdAt: new Date(),
      });
      
    } catch (error) {
      this.state.status = AgentStatus.ERROR;
      
      return AgentOutputSchema.parse({
        id: taskId,
        input: validatedInput.input,
        output: '',
        model: this.config.model,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });
    }
  }
  
  // Placeholder for LLM integration
  private async generateResponse(input: string, context: Record<string, unknown>): Promise<string> {
    // TODO: Integrate with actual LLM (Claude, OpenAI, etc.)
    return `Processing: ${input}`;
  }
  
  // State getters
  getId(): string {
    return this.state.id;
  }
  
  getName(): string {
    return this.state.name;
  }
  
  getStatus(): AgentStatus {
    return this.state.status;
  }
  
  getState(): AgentState {
    return { ...this.state };
  }
}
