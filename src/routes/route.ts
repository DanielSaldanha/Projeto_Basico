import { Router } from "express"
import { generateChunks, findChunks, findDoc, searchBySimilarity, gererateLLM_Response, gererateLLM_StreamingResponse } from "../controllers/controller"
const router = Router();

router.post("/docs", generateChunks);
router.post("/search", searchBySimilarity);
router.get("/chunks/:id", findChunks);
router.get("/docs/:title", findDoc);
router.get("/chunks", searchBySimilarity)
router.post("/llm", gererateLLM_Response)
router.get("/llm/stream/:title", gererateLLM_StreamingResponse)
export default router;