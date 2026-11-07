import { Request, Response, NextFunction } from "express";
import { createDocsAndChunks, searchChunks, searchDoc, searchSimilarChunks, interactLLM, verifyAccount, createAccount } from "../services/service";
import { streamLLM } from "../services/llm.service";
import { generateToken, verifyToken } from "../services/auth.service";
import { credit } from "../services/redis.service";
import jwt from "jsonwebtoken";


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
    const authHeader = req.headers.authorization; // "Bearer eyJhbG..."
    if (!authHeader) return res.status(401).json({ error: "Token ausente" });

    const token = authHeader.split(" ")[1];
    const email = await verifyToken(token);
    if (await verifyAccount(email) === null) return res.status(400).send("usuário inexistente")

    const nowCredit = Number(await credit(email));
    if (nowCredit >= 10) {
        return res.status(400).send("limite alcançado")
    }

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

export async function authenticate(req: Request, res: Response): Promise<Response | null> {
    const parametros = req.body
    const user = await verifyAccount(parametros.email)
    if (user === null) {
        return res.status(400).send("Erro na criação de usuário")
    }
    const token = await generateToken(user.id, user.email)
    return res.status(200).json(token)
}

export async function creatingAccount(req: Request, res: Response): Promise<Response | null> {
    const parametros = req.body;
    if (await verifyAccount(parametros.email)) return res.status(400).send("Email já cadastrado")
    const user = await createAccount(parametros);
    if (user === null) {
        return res.status(400).send("Erro na criação de usuário")
    }
    const token = await generateToken(user.id, user.email)
    return res.status(201).json(token)
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization; // "Bearer eyJhbG..."
    if (!authHeader) return res.status(401).json({ error: "Token ausente" });

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string);//precisa do "as string"
        // opcional: anexar o payload à requisição
        (req as any).user = payload;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}