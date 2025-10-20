// 🟢 تحميل متغيرات البيئة مباشرة
import 'dotenv/config'; // ← هذا يحل مشكلة OpenAI API Key

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import stageRoutes from "./routes/stageRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";
import sourceRoutes from "./routes/sourceRoutes.js";

const app = express();

// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// 🧩 Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🧩 اختبار قراءة المفتاح (اختياري للتأكد)
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "FOUND" : "NOT FOUND");

// 🧩 اتصال بقاعدة البيانات
connectDB();

// 🧩 راوت تجريبي
app.get("/api", (req, res) => {
  res.send("🚀 منصة التعليم الإلكتروني تعمل بنجاح - محمد ميثاق");
});

// 🧩 جميع الراوتات
app.use("/api/auth", authRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stages", stageRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/source", sourceRoutes);

// 🧱 إعداد المسارات الثابتة للـ Frontend بعد البناء
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// هذا المسار يخلي السيرفر يعرض ملفات React الجاهزة (build)
app.use(express.static(path.join(__dirname, "../edu-frontend/build")));

// أي طلب غير API يرجع index.html من واجهة React
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../edu-frontend/build", "index.html"));
});

// 🧩 تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
