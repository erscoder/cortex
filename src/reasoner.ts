// Reasoner - Chain-of-thought implementation
import { Reasoner, ReasoningResult, ReasoningStrategy, ReasoningStep } from './reasoning/types';

export class ChainOfThoughtReasoner implements Reasoner {
  private maxSteps: number;
  private llm?: (prompt: string) => Promise<string>;
  
  constructor(config: { maxSteps?: number; llm?: (prompt: string) => Promise<string> } = {}) {
    this.maxSteps = config.maxSteps || 5;
    this.llm = config.llm;
  }
  
  async think(problem: string, context: Record<string, unknown>): Promise<ReasoningResult> {
    const steps: ReasoningStep[] = [];
    interface AgentAction {
  type: string;
  payload: unknown;
  risk: 'low' | 'medium' | 'high';
}

let currentProblem = problem;
    let needsRag = false;
    let ragQuery = '';
    const actions: AgentAction[] = [];
    
    for (let i = 0; i < this.maxSteps; i++) {
      // Generate thought using LLM if available, otherwise use simple heuristics
      let thought: string;
      let action: string | undefined;
      let observation: string | undefined;
      
      if (this.llm) {
        const prompt = this.buildPrompt(currentProblem, context, steps);
        const response = await this.llm(prompt);
        const parsed = this.parseResponse(response);
        thought = parsed.thought;
        action = parsed.action;
        observation = parsed.observation;
      } else {
        // Simple rule-based reasoning fallback
        thought = this.generateSimpleThought(currentProblem, i);
      }
      
      steps.push({
        step: i + 1,
        thought,
        action,
        observation,
        confidence: this.calculateConfidence(steps),
      });
      
      // Check if we need to search for information
      if (this.needsRag(thought)) {
        needsRag = true;
        ragQuery = this.extractRagQuery(thought);
      }
      
      // Check if we need to take action
      if (this.needsAction(thought)) {
        actions.push({
          type: this.extractActionType(thought),
          payload: this.extractActionPayload(thought),
          risk: this.assessRisk(thought),
        });
      }
      
      // Check if we've reached a conclusion
      if (this.isConcluded(thought)) {
        break;
      }
      
      // Update problem for next iteration
      currentProblem = this.updateProblem(currentProblem, thought, observation);
    }
    
    return {
      steps,
      needsRag,
      ragQuery,
      actions,
      requiresHumanApproval: actions.some(a => a.risk === 'high'),
      finalAnswer: steps[steps.length - 1]?.thought,
    };
  }
  
  private buildPrompt(problem: string, context: Record<string, unknown>, steps: ReasoningStep[]): string {
    const contextStr = Object.keys(context).length > 0 
      ? `\nContext: ${JSON.stringify(context)}` 
      : '';
    const stepsStr = steps.length > 0 
      ? `\nPrevious thoughts: ${steps.map(s => s.thought).join(' → ')}` 
      : '';
    
    return `Problem: ${problem}${contextStr}${stepsStr}

Think step by step. For each step:
1. Analyze the current state
2. Decide what to think about next
3. Determine if you need to search for information or take action
4. Provide your thought, and optionally an action and observation

Respond in JSON format:
{
  "thought": "your reasoning",
  "action": "search:query" or "execute:tool:args" or null,
  "observation": "result of action" or null
}`;
  }
  
  private parseResponse(response: string): { thought: string; action: string | undefined; observation: string | undefined } {
    try {
      const parsed = JSON.parse(response);
      return {
        thought: parsed.thought || response,
        action: parsed.action || undefined,
        observation: parsed.observation || undefined,
      };
    } catch {
      return { thought: response, action: undefined, observation: undefined };
    }
  }
  
  private generateSimpleThought(problem: string, step: number): string {
    const templates = [
      `Step ${step + 1}: Analyzing "${problem}"`,
      `Step ${step + 1}: Breaking down the problem`,
      `Step ${step + 1}: Looking for patterns`,
      `Step ${step + 1}: Considering options`,
      `Step ${step + 1}: Evaluating approaches`,
    ];
    return templates[step % templates.length];
  }
  
  private calculateConfidence(steps: ReasoningStep[]): number {
    if (steps.length === 0) return 0.5;
    // Confidence increases with more reasoning steps, capped at 0.9
    return Math.min(0.5 + steps.length * 0.1, 0.9);
  }
  
  private needsRag(thought: string): boolean {
    const ragIndicators = ['search', 'find', 'look up', 'retrieve', 'what is', 'how to', '?', 'information'];
    return ragIndicators.some(indicator => thought.toLowerCase().includes(indicator));
  }
  
  private extractRagQuery(thought: string): string {
    // Extract potential search query from thought
    const match = thought.match(/(?:search|find|look up)\s+(?:for\s+)?(.+)/i);
    return match ? match[1] : thought;
  }
  
  private needsAction(thought: string): boolean {
    const actionIndicators = ['execute', 'run', 'call', 'api', 'function', 'do', 'create', 'update', 'delete'];
    return actionIndicators.some(indicator => thought.toLowerCase().includes(indicator));
  }
  
  private extractActionType(thought: string): string {
    const types = ['execute', 'api', 'search', 'compute', 'format'];
    for (const type of types) {
      if (thought.toLowerCase().includes(type)) return type;
    }
    return 'unknown';
  }
  
  private extractActionPayload(thought: string): unknown {
    return { raw: thought };
  }
  
  private assessRisk(thought: string): 'low' | 'medium' | 'high' {
    const highRisk = ['delete', 'drop', 'remove', 'destroy', 'cancel', 'refund'];
    const mediumRisk = ['update', 'write', 'create', 'send', 'execute'];
    
    const lower = thought.toLowerCase();
    if (highRisk.some(r => lower.includes(r))) return 'high';
    if (mediumRisk.some(r => lower.includes(r))) return 'medium';
    return 'low';
  }
  
  private isConcluded(thought: string): boolean {
    const conclusionIndicators = ['therefore', 'conclusion', 'final', 'answer', 'solved', 'done'];
    return conclusionIndicators.some(indicator => thought.toLowerCase().includes(indicator));
  }
  
  private updateProblem(original: string, thought: string, observation: string | undefined): string {
    if (observation) {
      return `${original}\nObservation: ${observation}`;
    }
    return original;
  }
}
