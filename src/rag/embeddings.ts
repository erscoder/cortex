// OpenAI Embeddings Implementation
import { EmbeddingModel } from './types';

export interface OpenAIEmbeddingsConfig {
  apiKey: string;  // Required - no fallback to env
  model?: string;
  dimensions?: number;
  baseURL?: string;
}

export class OpenAIEmbeddings implements EmbeddingModel {
  private apiKey: string;
  private model: string;
  private dimensions: number;
  private baseURL: string;

  constructor(config: OpenAIEmbeddingsConfig) {
    if (!config.apiKey) {
      throw new Error(`OpenAI API key is required. Pass it explicitly in the config:
        
new OpenAIEmbeddings({
  apiKey: 'your-openai-api-key-here'
})`);
    }

    this.apiKey = config.apiKey;
    this.model = this.resolveModel(config.model);
    this.dimensions = this.resolveDimensions(config.dimensions);
    this.baseURL = this.resolveBaseURL(config.baseURL);
  }

  private resolveModel(provided?: string): string {
    if (provided) return provided;
    return 'text-embedding-3-small';
  }

  private resolveDimensions(provided?: number): number {
    if (provided && provided > 0) return provided;
    return 1536;
  }

  private resolveBaseURL(provided?: string): string {
    if (provided) return provided;
    return 'https://api.openai.com/v1';
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
        dimensions: this.dimensions,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embeddings API error: ${error}`);
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[] }>;
    };

    // Return first embedding (embed returns single vector)
    return data.data[0]?.embedding || [];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        dimensions: this.dimensions,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embeddings API error: ${error}`);
    }

    const data = await response.json() as {
      data: Array<{ embedding: number[] }>;
    };

    // Return in order - handle potential null embeddings
    return data.data.map((item): number[] => item.embedding || []);
  }
}

export default OpenAIEmbeddings;
