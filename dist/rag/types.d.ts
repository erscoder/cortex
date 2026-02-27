import { z } from 'zod';
export declare const RetrievalResultSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    source: z.ZodString;
    score: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    source: string;
    score: number;
    metadata?: Record<string, unknown> | undefined;
}, {
    id: string;
    content: string;
    source: string;
    score: number;
    metadata?: Record<string, unknown> | undefined;
}>;
export type RetrievalResult = z.infer<typeof RetrievalResultSchema>;
export declare const SearchOptionsSchema: z.ZodObject<{
    topK: z.ZodDefault<z.ZodNumber>;
    minScore: z.ZodDefault<z.ZodNumber>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    topK: number;
    minScore: number;
    includeMetadata: boolean;
    filters?: Record<string, unknown> | undefined;
}, {
    topK?: number | undefined;
    minScore?: number | undefined;
    filters?: Record<string, unknown> | undefined;
    includeMetadata?: boolean | undefined;
}>;
export type SearchOptions = z.infer<typeof SearchOptionsSchema>;
export interface RAGPipeline {
    search(query: string, options?: SearchOptions): Promise<RetrievalResult[]>;
    buildContext(results: RetrievalResult[], maxTokens: number): Promise<string>;
}
export interface VectorStore {
    add(documents: {
        id: string;
        content: string;
        metadata?: Record<string, unknown>;
    }[]): Promise<void>;
    search(queryEmbedding: number[], options: SearchOptions): Promise<RetrievalResult[]>;
    delete(id: string): Promise<void>;
}
export interface EmbeddingModel {
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
}
//# sourceMappingURL=types.d.ts.map