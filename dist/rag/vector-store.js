"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaviateVectorStore = void 0;
class WeaviateVectorStore {
    client;
    className;
    constructor(client, className = 'CortexMemory') {
        this.client = client;
        this.className = className;
    }
    async add(documents) {
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
    async search(queryEmbedding, options) {
        const result = await this.client.graphql.get()
            .withClassName(this.className)
            .withNearVector({ vector: queryEmbedding })
            .withLimit(options.topK)
            .withFields('_additional { certainty score }')
            .do();
        return result.data.Get[this.className].map((item) => ({
            id: item.id,
            content: item.content,
            source: item.source || 'unknown',
            score: item._additional?.certainty || 0,
            metadata: item,
        }));
    }
    async delete(id) {
        await this.client.objects.classifier().objects.delete({ id });
    }
}
exports.WeaviateVectorStore = WeaviateVectorStore;
//# sourceMappingURL=vector-store.js.map