import { prisma } from "../prisma/prisma"
import { Document, Chunk } from '@prisma/client';

interface Documents {
    title: string
    content: string
}

export async function postDocument(dados: Documents): Promise<Document | null> {
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
        throw new Error("Erro na cricação de documento: " + error);
    }
}