import { VectorStore, RetrievalResult, SearchOptions } from './types';
export declare class WeaviateVectorStore implements VectorStore {
    private client;
    private className;
    constructor(client: any, className?: string);
    add(documents: {
        id: string;
        content: string;
        metadata?: Record<string, unknown>;
    }[]): Promise<void>;
    search(queryEmbedding: number[], options: SearchOptions): Promise<RetrievalResult[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=vector-store.d.ts.map