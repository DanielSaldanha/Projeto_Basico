import { Document, Chunk } from "@prisma/client";
import { createDocument, createChunk, findChunksByDocumentId, Documents, Chunks } from "../repositories/repository";
import { chunkText } from "./chunkService";

export async function createDocsAndChunks(dados: Documents): Promise<Document | null> {
    const maxChunks = dados.content.length / Number(process.env.MAX_CARACTERE);
    const res = await createDocument(dados);
    const textoSeparado = await chunkText(dados.content);
    let i = 0
    for (const value of textoSeparado) {
        let chunks: Chunks = { documentId: res.id, content: value.toString(), sequence: i }
        await createChunk(chunks);
        i++;
    }

    //for (let i = 0; i < maxChunks; i++) {}//O maxChunks pode acabar sendo float e um numero diferente de int quebra o for
    return null

}

export async function searchChunks(id: number): Promise<Chunk[] | null> {
    const res = await findChunksByDocumentId(id.toString())
    if (res === null) return null

    return res

}
