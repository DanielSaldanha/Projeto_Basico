import { Router } from "express"
import { generateChunks, findChunks, findDoc, searchBySimilarity } from "../controllers/controller"
const router = Router();

router.post("/docs", generateChunks);
router.post("/search", searchBySimilarity);
router.get("/chunks/:id", findChunks);
router.get("/docs/:title", findDoc);
router.get("/chunks", searchBySimilarity)

export default router;