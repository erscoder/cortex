import { SandboxExecutor, AgentAction, ExecutionResult, SandboxConfig } from './types';
export declare class SafeSandbox implements SandboxExecutor {
    private config;
    constructor(config?: Partial<SandboxConfig>);
    execute(action: AgentAction): Promise<ExecutionResult>;
    validate(action: AgentAction): {
        valid: boolean;
        reason?: string;
    };
    private executeCommand;
    private executeApiCall;
}
//# sourceMappingURL=executor.d.ts.map