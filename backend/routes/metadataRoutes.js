import express from "express";
import { getDepartmentsStagesSubjects } from "../controllers/metadataController.js";

const router = express.Router();
router.get("/", getDepartmentsStagesSubjects);

export default router;
