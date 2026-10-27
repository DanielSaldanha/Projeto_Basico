import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers"

// Modelo local (gratuito): all-MiniLM-L6-v2 gera vetores de 384 dimensões
// O modelo (~25MB) é baixado automaticamente na primeira execução
let extractor: FeatureExtractionPipeline | null = null

export async function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
    if (!extractor) {
        extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
    }
    return extractor
}
