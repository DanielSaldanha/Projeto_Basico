import { Document, Chunk } from "@prisma/client";
import { createDocument, createChunk, findChunksByDocumentId, Documents, Chunks, findDocument, findChunksByEmbeddings, ChunkSimilarity } from "../repositories/repository";
import { chunkText } from "./chunkService";
import { createEmbedding } from "./llm.service";

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

export async function searchChunks(id: string): Promise<Chunk[] | null> {
    const res = await findChunksByDocumentId(id.toString())
    if (res === null) return null

    return res

}

export async function searchDoc(title: string): Promise<Document | null> {
    const res = await findDocument(title);
    return res
}