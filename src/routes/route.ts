import { Router } from "express"
import { generateChunks, findChunks } from "../controllers/controller"
const router = Router();

router.post("/docs", generateChunks);
router.get("/chunks/:id", findChunks);

export default router;