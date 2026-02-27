"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
// Agent - Main orchestrator class
const uuid_1 = require("uuid");
const types_1 = require("./types");
class Agent {
    config;
    state;
    // Dependencies (to be injected)
    memory;
    rag;
    reasoner;
    sandbox;
    hitl;
    constructor(config) {
        this.config = types_1.AgentConfigSchema.parse(config);
        this.state = {
            id: this.config.id || (0, uuid_1.v4)(),
            name: this.config.name,
            status: types_1.AgentStatus.IDLE,
            currentTask: null,
            context: new Map(),
            memory: { shortTerm: [], longTerm: [] },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    // Dependency injection
    withMemory(memory) {
        this.memory = memory;
        return this;
    }
    withRAG(rag) {
        this.rag = rag;
        return this;
    }
    withReasoner(reasoner) {
        this.reasoner = reasoner;
        return this;
    }
    withSandbox(sandbox) {
        this.sandbox = sandbox;
        return this;
    }
    withHITL(hitl) {
        this.hitl = hitl;
        return this;
    }
    // Main processing method
    async process(input) {
        const validatedInput = typeof input === 'string'
            ? types_1.AgentInputSchema.parse({ input })
            : types_1.AgentInputSchema.parse(input);
        const taskId = validatedInput.id || (0, uuid_1.v4)();
        const startTime = Date.now();
        this.state.status = types_1.AgentStatus.THINKING;
        this.state.currentTask = validatedInput;
        try {
            // Step 1: Load context from memory if enabled
            let context = { ...validatedInput.context };
            if (this.config.memory && this.memory) {
                const relevantMemories = await this.memory.search(validatedInput.input, { limit: 5 });
                context.relevantMemories = relevantMemories;
                this.state.memory.shortTerm = relevantMemories.map(m => m.id);
            }
            // Step 2: Reasoning if enabled
            let reasoningResult;
            if (this.config.reasoning && this.reasoner) {
                reasoningResult = await this.reasoner.think(validatedInput.input, context);
                // Step 3: RAG search if needed
                if (reasoningResult?.needsRag && this.rag) {
                    this.state.status = types_1.AgentStatus.SEARCHING;
                    const searchResults = await this.rag.search(reasoningResult.ragQuery);
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
                        this.state.status = types_1.AgentStatus.EXECUTING;
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
            this.state.status = types_1.AgentStatus.COMPLETED;
            return types_1.AgentOutputSchema.parse({
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
        }
        catch (error) {
            this.state.status = types_1.AgentStatus.ERROR;
            return types_1.AgentOutputSchema.parse({
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
    async generateResponse(input, context) {
        // TODO: Integrate with actual LLM (Claude, OpenAI, etc.)
        return `Processing: ${input}`;
    }
    // State getters
    getId() {
        return this.state.id;
    }
    getName() {
        return this.state.name;
    }
    getStatus() {
        return this.state.status;
    }
    getState() {
        return { ...this.state };
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map