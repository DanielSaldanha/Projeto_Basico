import { Document, Chunk, Message } from "@prisma/client";
import { createDocument, createChunk, findChunksByDocumentId, Documents, Chunks, findDocument, findChunksByEmbeddings, ChunkSimilarity, Messages, createMessage } from "../repositories/repository";
import { chunkText } from "./chunk.service";
import { createEmbedding, callLLM } from "./llm.service";
import redisClient from "../configs/redis/redis";

export async function createDocsAndChunks(dados: Documents): Promise<Document | null> {
    const res = await createDocument(dados);
    const textoSeparado = await chunkText(dados.content);
    let i = 0
    for (const value of textoSeparado) {
        const content = value.toString()
        const embedding = await createEmbedding(content)
        const chunks: Chunks = { documentId: res.id, content: content, sequence: i, embedding }// pode retirar o : content se quiser
        await createChunk(chunks);
        i++;
    }
    return res
}

export async function searchSimilarChunks(query: string, limit: number = 10): Promise<ChunkSimilarity[]> {
    const embedding = await createEmbedding(query)
    return findChunksByEmbeddings(embedding, limit)
}

export async function interactLLM(query: string, limit: number = 10): Promise<string | null> {
    const key = query.trim().toLowerCase();

    const userMessage: Messages = {
        role: "user",
        content: query
    };
    await generateMessage(userMessage);

    const cache = await redisClient.get(key);
    if (cache) return cache

    const embedding = await createEmbedding(query)
    const chunks = await findChunksByEmbeddings(embedding, limit)
    const contents = chunks.map(m => m.content);
    const prompt = "contexto: " + contents + " pergunta do usuario: " + query
    const LLMResponse = await callLLM(prompt)

    const assistantMessage: Messages = {
        role: "assistant",
        content: String(LLMResponse)
    };
    await generateMessage(assistantMessage);

    await redisClient.set(key, String(LLMResponse), { EX: 60 })

    return LLMResponse
}

export async function searchChunks(id: string): Promise<Chunk[] | null> {
    const res = await findChunksByDocumentId(id.toString())
    if (res === null) return null

    return res

}

export async function searchDoc(title: string): Promise<Document | null> {
    const res = await findDocument(title);
    return res
}

export async function generateMessage(dados: Messages): Promise<Message | null> {
    const res = await createMessage(dados);
    return res
}