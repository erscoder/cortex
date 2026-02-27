import { AgentConfig, AgentInput, AgentOutput, AgentState, AgentStatus } from './types';
export declare class Agent {
    private config;
    private state;
    private memory?;
    private rag?;
    private reasoner?;
    private sandbox?;
    private hitl?;
    constructor(config: AgentConfig);
    withMemory(memory: import('../memory/types').MemorySystem): this;
    withRAG(rag: import('../rag/types').RAGPipeline): this;
    withReasoner(reasoner: import('../reasoning/types').Reasoner): this;
    withSandbox(sandbox: import('../sandbox/types').SandboxExecutor): this;
    withHITL(hitl: import('../hitl/types').HumanInTheLoop): this;
    process(input: AgentInput | string): Promise<AgentOutput>;
    private generateResponse;
    getId(): string;
    getName(): string;
    getStatus(): AgentStatus;
    getState(): AgentState;
}
//# sourceMappingURL=agent.d.ts.map