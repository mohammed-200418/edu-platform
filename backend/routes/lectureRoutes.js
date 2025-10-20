import express from "express";
import multer from "multer";
import {
  uploadLecture,
  getLecturesByDepartmentAndStage,
  getAllLectures,
  deleteLecture,
} from "../controllers/lectureController.js";

const router = express.Router();

// إعداد multer لتخزين ملفات PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // تأكد أن هذا المجلد موجود
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// رفع محاضرة جديدة
router.post("/upload", upload.single("file"), uploadLecture);

// عرض جميع المحاضرات
router.get("/all", getAllLectures);

// عرض المحاضرات حسب القسم والمرحلة
router.get("/:department/:stage", getLecturesByDepartmentAndStage);

// حذف محاضرة
router.delete("/delete/:id", deleteLecture);

export default router;
