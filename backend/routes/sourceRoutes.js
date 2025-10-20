// backend/routes/sourceRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getMetaData,
  getSubjectsSources,
  updateSubjectSources,
  addSourceLink,
  deleteSource,
  handleUploadedFile,
} from "../controllers/sourceController.js";

const router = express.Router();

// multer إعداد
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "sources"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

// المسارات
router.get("/metadata", getMetaData);              // جلب الأقسام/المراحل/المواد من DB
router.get("/subjects", getSubjectsSources);       // جلب JSON المصادر
router.post("/subjects/update", updateSubjectSources); // استبدال مصادر المادة
router.post("/subjects/add", addSourceLink);       // إضافة رابط واحد
router.post("/subjects/upload-file", upload.single("file"), handleUploadedFile); // رفع ملف وإضافته كمصدر
router.delete("/subjects/delete", deleteSource);   // حذف مصدر

export default router;
