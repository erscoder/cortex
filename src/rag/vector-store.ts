// Vector Store - Weaviate implementation
import { VectorStore, RetrievalResult, SearchOptions } from './types';

export class WeaviateVectorStore implements VectorStore {
  private client: any;
  private className: string;
  
  constructor(client: any, className = 'CortexMemory') {
    this.client = client;
    this.className = className;
  }
  
  async add(documents: { id: string; content: string; metadata?: Record<string, unknown> }[]): Promise<void> {
    const objects = documents.map(doc => ({
      class: this.className,
      id: doc.id,
      properties: {
        content: doc.content,
        ...(doc.metadata || {}),
      },
    }));
    
    await this.client.objects.classifier().objects.create({ objects });
  }
  
  async search(queryEmbedding: number[], options: SearchOptions): Promise<RetrievalResult[]> {
    const result = await this.client.graphql.get()
      .withClassName(this.className)
      .withNearVector({ vector: queryEmbedding })
      .withLimit(options.topK)
      .withFields('_additional { certainty score }')
      .do();
    
    return result.data.Get[this.className].map((item: any) => ({
      id: item.id,
      content: item.content,
      source: item.source || 'unknown',
      score: item._additional?.certainty || 0,
      metadata: item,
    }));
  }
  
  async delete(id: string): Promise<void> {
    await this.client.objects.classifier().objects.delete({ id });
  }
}
