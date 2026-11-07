import { Router } from "express";
import { generateChunks, findChunks, findDoc, searchBySimilarity, gererateLLM_Response, gererateLLM_StreamingResponse, authMiddleware, authenticate, creatingAccount } from "../controllers/controller";
const router = Router();

router.post("/docs", authMiddleware, generateChunks);
router.post("/search", authMiddleware, searchBySimilarity);
router.get("/chunks/:id", authMiddleware, findChunks);
router.get("/docs/:title", authMiddleware, findDoc);
router.get("/chunks", authMiddleware, searchBySimilarity);
router.post("/llm", gererateLLM_Response);// Possui interação própria com token e não proceisa de middleware por conta disso
router.get("/llm/stream/:title", authMiddleware, gererateLLM_StreamingResponse);
router.post("/singIn", authenticate);
router.post("/singUp", creatingAccount)
export default router;