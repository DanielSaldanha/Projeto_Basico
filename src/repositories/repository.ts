import { prisma } from "../configs/prisma/prisma"
import { Document, Chunk, Conversation, Message } from '@prisma/client';

//obs: você pode retirar o Partial dos parâmeteros dês de que você coloque interrogação (?) nos campos da interface
export interface Documents {
    title: string,
    content: string
}
export interface Chunks {
    documentId: string,
    content: string,
    sequence: number,
    embedding?: number[]

}

export interface ChunkSimilarity {
    id: string,
    documentId: string,
    content: string,
    sequence: number,
    distance: number
}

export interface Messages {
    role: "user" | "assistant",
    content: string,
    conversationId?: string
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

export async function findDocument(title: string): Promise<Document | null> {
    try {
        const res = await prisma.document.findFirst({
            where: {
                title: title,
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
        // Campo Unsupported("vector") não pode ser escrito pelo client tipado: UPDATE via raw SQL
        if (dados.embedding) {
            const vector = toPgVector(dados.embedding)
            await prisma.$executeRaw`
                UPDATE chunks SET embedding = ${vector}::vector WHERE id = ${res.id}
            `
        }
        return res;
    }
    catch (error) {
        throw new Error("Erro na criação de chunk: " + error);
    }
}

function toPgVector(embedding: number[]): string {
    return `[${embedding.join(",")}]`
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

export async function findChunksByEmbeddings(embedding: number[], limit: number = 10): Promise<ChunkSimilarity[]> {
    try {
        const vector = toPgVector(embedding)
        return await prisma.$queryRaw<ChunkSimilarity[]>`
            SELECT id, "documentId", content, sequence, embedding <=> ${vector}::vector AS distance
            FROM chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> ${vector}::vector
            LIMIT ${limit}
        `
    }
    catch (error) { throw new Error("Erro ao buscar chunks por similaridade: " + error) }
}

//CONVERSATION

export async function createConversation(title?: string): Promise<Conversation> {
    try {
        return await prisma.conversation.create({
            data: { title }
        });
    } catch (error) {
        throw new Error("Erro ao criar conversa: " + error);
    }
}

export async function createMessage(dados: Messages): Promise<Message> {
    try {
        let conversationId = dados.conversationId;
        if (!conversationId) {
            const newConversation = await prisma.conversation.create({
                data: {}
            });
            conversationId = newConversation.id;
        }

        const res = await prisma.message.create({
            data: {
                content: dados.content,
                role: dados.role,
                conversationId: conversationId
            }
        });
        return res;
    } catch (error) {
        throw new Error("erro ao criar mensagem " + error);
    }
}