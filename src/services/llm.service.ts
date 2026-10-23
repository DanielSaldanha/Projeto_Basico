import client from "../llm/llm"
import { getEmbeddingPipeline } from "../llm/embedding"
import { findChunksByEmbeddings } from "../repositories/repository";

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

export async function* streamLLM(query: string, limit: number = 10): AsyncGenerator<string> {
    const embedding = await createEmbedding(query)
    const chunks = await findChunksByEmbeddings(embedding, limit)
    const contents = chunks.map(m => m.content);
    const prompt = "contexto: " + contents + " pergunta do usuario: " + query
    const stream = await client.responses.create({
        model: process.env.OPENAI_MODEL, // hoje está hardcoded "gpt-5", diferente do resto
        input: prompt,
        stream: true
    });
    for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
            yield event.delta;//um return que não interrompe uma função
        }
    }
}