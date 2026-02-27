// RAG Types
import { z } from 'zod';

export const RetrievalResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  source: z.string(),
  score: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export type RetrievalResult = z.infer<typeof RetrievalResultSchema>;

export const SearchOptionsSchema = z.object({
  topK: z.number().positive().default(5),
  minScore: z.number().min(0).max(1).default(0.5),
  filters: z.record(z.unknown()).optional(),
  includeMetadata: z.boolean().default(true),
});

export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

export interface RAGPipeline {
  search(query: string, options?: SearchOptions): Promise<RetrievalResult[]>;
  buildContext(results: RetrievalResult[], maxTokens: number): Promise<string>;
}

export interface VectorStore {
  add(documents: { id: string; content: string; metadata?: Record<string, unknown> }[]): Promise<void>;
  search(queryEmbedding: number[], options: SearchOptions): Promise<RetrievalResult[]>;
  delete(id: string): Promise<void>;
}

export interface EmbeddingModel {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
