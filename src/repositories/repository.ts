import { prisma } from "../prisma/prisma"
import { Document, Chunk } from '@prisma/client';

//obs: você pode retirar o Partial dos parâmeteros dês de que você coloque interrogação (?) nos campos da interface
export interface Documents {
    title: string,
    content: string
}
export interface Chunks {
    documentId: string,
    content: string,
    sequence: number

}
//DOCUMENTS
export async function createDocument(dados: Documents): Promise<Document> {
    try {
        const res = await prisma.document.create({
            data: {
                title: dados.title,
                content: dados.content
            },
        })
        return res;
    }
    catch (error) {
        throw new Error("Erro na criação de documento: " + error);
    }
}

export async function findDocuments(dados: Partial<Documents>): Promise<Document[]> {
    try {
        const res = await prisma.document.findMany({
            where: {
                title: dados.title,
            },
        })
        return res;
    }
    catch (error) { throw new Error("Erro ao tentar procurar documentos: " + error) }
}

export async function findDocument(dados: Partial<Documents>): Promise<Document | null> {
    try {
        const res = await prisma.document.findFirst({
            where: {
                title: dados.title,
            },
        })
        return res;
    }
    catch (error) { throw new Error("Erro ao tentar procurar documento: " + error) }
}

//CHUNKS
export async function createChunk(dados: Chunks): Promise<Chunk> {
    try {
        const res = await prisma.chunk.create({
            data: {
                documentId: dados.documentId,
                content: dados.content,
                sequence: dados.sequence
            },
        })
        return res;
    }
    catch (error) {
        throw new Error("Erro na criação de chunk: " + error);
    }
}

export async function findChunksByDocumentId(documentId: string): Promise<Chunk[]> {//futuramente por embedding
    try {
        const res = await prisma.chunk.findMany({
            where: {
                documentId: documentId,
            },
        })
        return res;
    }
    catch (error) { throw new Error("Erro ao tentar procurar chunks: " + error) }
}

export async function findChunk(dados: Partial<Chunks>): Promise<Chunk | null> {//futuramente por embedding
    try {
        const res = await prisma.chunk.findFirst({
            where: {
                documentId: dados.documentId,
            },
        })
        return res;
    }
    catch (error) { throw new Error("Erro ao tentar procurar chunk: " + error) }
}