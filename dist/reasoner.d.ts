import { Reasoner, ReasoningResult } from './reasoning/types';
export declare class ChainOfThoughtReasoner implements Reasoner {
    private maxSteps;
    private llm?;
    constructor(config?: {
        maxSteps?: number;
        llm?: (prompt: string) => Promise<string>;
    });
    think(problem: string, context: Record<string, unknown>): Promise<ReasoningResult>;
    private buildPrompt;
    private parseResponse;
    private generateSimpleThought;
    private calculateConfidence;
    private needsRag;
    private extractRagQuery;
    private needsAction;
    private extractActionType;
    private extractActionPayload;
    private assessRisk;
    private isConcluded;
    private updateProblem;
}
//# sourceMappingURL=reasoner.d.ts.map