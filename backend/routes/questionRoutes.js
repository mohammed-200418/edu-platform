import express from "express";
import {
  askQuestion,
  getMyQuestions,
  getAllQuestions,
  replyToQuestion,
  hideQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";
import { protect } from "../controllers/middleware/authMiddleware.js";

const router = express.Router();

// 🧠 الطالب يرسل سؤال
router.post("/", protect, askQuestion);

// 🧠 الطالب يشوف أسئلته
router.get("/my", protect, getMyQuestions);

// 🧠 الأدمن يشوف كل الأسئلة
router.get("/", protect, getAllQuestions);

// 🧠 رد من أي طرف
router.post("/:id/reply", protect, replyToQuestion);

// 🧠 إخفاء محلي (يبقى محفوظ)
router.put("/:id/hide", protect, hideQuestion);

// 🧠 حذف فعلي (اختياري)
router.delete("/:id", protect, deleteQuestion);

export default router;
