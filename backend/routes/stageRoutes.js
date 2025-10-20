import express from "express";
import { getStages, addStage, updateSubjects } from "../controllers/stageController.js";
import { protect } from "../controllers/middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getStages);
router.post("/", protect, addStage); // إضافة مرحلة جديدة
router.put("/:stageName", protect, updateSubjects); // تحديث المواد لمرحلة

export default router;
