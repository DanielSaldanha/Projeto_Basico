import client from "../llm/llm"
import { getEmbeddingPipeline } from "../llm/embedding"

export async function callLLM(prompt: string): Promise<String | null> {
    const model = process.env.OPENAI_MODEL
    const res = await client.responses.create({ model, input: prompt, instructions: "Você responde formalmente" })
    return res.output_text
}

export async function createEmbedding(text: string): Promise<number[]> {
    // Modelo local gratuito: all-MiniLM-L6-v2 (384 dimensões, compatível com vector(384) do schema)
    const extractor = await getEmbeddingPipeline()
    const output = await extractor(text, { pooling: "mean", normalize: true })
    return Array.from(output.data as Float32Array)
}