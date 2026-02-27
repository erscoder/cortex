// LLM Client - Anthropic & MiniMax support
import { ReasonerConfig } from '../reasoning/types';

export interface LLMConfig {
  provider: 'anthropic' | 'minimax';
  apiKey: string;  // Required - no fallback to env
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class LLMClient {
  private config: Required<LLMConfig>;
  private baseURL: string;

  constructor(config: LLMConfig) {
    if (!config.apiKey) {
      throw new Error(`API key is required. Pass it explicitly in the config:
        
new LLMClient({
  provider: '${config.provider}',
  apiKey: 'your-api-key-here'
})`);
    }

    this.config = {
      provider: config.provider || 'anthropic',
      apiKey: config.apiKey,
      model: config.model || 'claude-3-haiku-20240307',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1024,
      baseURL: config.baseURL || this.getDefaultBaseURL(config.provider || 'anthropic'),
    };
    this.baseURL = this.config.baseURL;
  }

  private getDefaultBaseURL(provider: string): string {
    switch (provider) {
      case 'anthropic':
        return 'https://api.anthropic.com';
      case 'minimax':
        return 'https://api.minimax.chat/v1';
      default:
        return 'https://api.anthropic.com';
    }
  }

  async complete(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.provider === 'anthropic') {
      headers['x-api-key'] = this.config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (this.config.provider === 'minimax') {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const body = this.buildRequestBody(prompt, systemPrompt);

    const response = await fetch(`${this.baseURL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    return this.parseResponse(await response.json());
  }

  private buildRequestBody(prompt: string, systemPrompt?: string): Record<string, unknown> {
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    if (this.config.provider === 'anthropic') {
      return {
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: messages.filter(m => m.role !== 'system'),
      };
    }

    return {
      model: this.config.model,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      messages,
    };
  }

  private parseResponse(data: unknown): LLMResponse {
    if (this.config.provider === 'anthropic') {
      const anthropicData = data as {
        content: Array<{ text: string }>;
        usage?: { input_tokens: number; output_tokens: number };
      };
      return {
        content: anthropicData.content[0]?.text || '',
        usage: anthropicData.usage ? {
          inputTokens: anthropicData.usage.input_tokens,
          outputTokens: anthropicData.usage.output_tokens,
        } : undefined,
      };
    }

    // MiniMax response format
    const minimaxData = data as {
      choices: Array<{ message: { content: string } }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };
    return {
      content: minimaxData.choices[0]?.message?.content || '',
      usage: minimaxData.usage ? {
        inputTokens: minimaxData.usage.prompt_tokens,
        outputTokens: minimaxData.usage.completion_tokens,
      } : undefined,
    };
  }

  // Factory method to create reasoner-ready function
  asReasonerFunction(): (prompt: string) => Promise<string> {
    return async (prompt: string): Promise<string> => {
      const response = await this.complete(prompt);
      return response.content;
    };
  }
}

export default LLMClient;
