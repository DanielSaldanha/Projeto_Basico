import { Request, Response } from "express";
import { createDocsAndChunks, searchChunks, searchDoc, searchSimilarChunks, interactLLM } from "../services/service";
import { streamLLM } from "../services/llm.service";
import client from "../configs/llm/llm";

export async function generateChunks(req: Request, res: Response): Promise<Response | null> {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Campos 'title' e 'content' são obrigatórios" });
    const doc = await createDocsAndChunks({ title, content });
    return res.status(201).json({ message: "Documento e chunks criados com embeddings!", documentId: doc?.id });;
}

export async function searchBySimilarity(req: Request, res: Response): Promise<Response | null> {
    const { query, limit } = req.body;
    if (!query) return res.status(400).json({ message: "Campo 'query' é obrigatório" });
    const results = await searchSimilarChunks(String(query), Number(limit) || 10);
    return res.status(200).json({ results });
}

export async function gererateLLM_Response(req: Request, res: Response): Promise<Response | null> {
    const { query, limit } = req.body;
    if (!query) return res.status(400).json({ message: "Campo 'query' é obrigatório" });
    const results = await interactLLM(String(query), Number(limit) || 10);
    return res.status(200).json({ results });
}

export async function gererateLLM_StreamingResponse(req: Request, res: Response): Promise<void> {
    const { title } = req.params;
    if (!title) return void res.status(400).json({ message: "Campo 'title' é obrigatório" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const delta of streamLLM(String(title))) {
        res.write(`data: ${JSON.stringify(delta)}\n\n`);
    }
    res.end();
}

export async function findChunks(req: Request, res: Response): Promise<Response | null> {
    const chunks = await searchChunks(String(req.params.id))
    if (chunks === null) return res.status(404).send("chunks não encontrados")
    return res.status(200).json(chunks);
}


export async function findDoc(req: Request, res: Response): Promise<Response | null> {
    const doc = await searchDoc(String(req.params.title));
    return res.status(200).json(doc);
}