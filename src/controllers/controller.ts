import { Request, Response } from "express";
import { createDocsAndChunks, searchChunks } from "../services/service"

export async function generateChunks(req: Request, res: Response) {
    const response = await createDocsAndChunks(req.body);
    return res.status(200).json({ message: "Processado com sucesso!", response });;
}

export async function findChunks(req: Request, res: Response) {
    const chunks = await searchChunks(Number(req.params.id))
    if (chunks === null) return res.status(404).send("chunks não encontrados")
    return res.status(200).json(chunks);
}