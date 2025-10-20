// backend/controllers/sourceController.js
import Lecture from "../models/Lecture.js";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "subjectsSources.json");
const uploadsDir = path.join(process.cwd(), "uploads", "sources");

// التأكد من وجود الملفات/المجلدات
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8") || "{}");
  } catch (e) {
    console.error("readData error:", e);
    return {};
  }
};
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

// 1) جلب الأقسام/المراحل/المواد الموجودة فعلاً في الـ DB
export const getMetaData = async (req, res) => {
  try {
    const lectures = await Lecture.find({}, "department stage subject").lean();
    const data = {};
    lectures.forEach((lec) => {
      const dep = lec.department || "عام";
      const stg = lec.stage || "عام";
      const sub = lec.subject || "غير محدد";
      if (!data[dep]) data[dep] = {};
      if (!data[dep][stg]) data[dep][stg] = new Set();
      data[dep][stg].add(sub);
    });
    const result = {};
    for (const dep of Object.keys(data)) {
      result[dep] = {};
      for (const stg of Object.keys(data[dep])) {
        result[dep][stg] = Array.from(data[dep][stg]);
      }
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ عند جلب بيانات الميتا" });
  }
};

// 2) قراءة المصادر من JSON
export const getSubjectsSources = (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ عند قراءة المصادر" });
  }
};

// 3) تحديث (استبدال) قائمة المصادر لمادة
// body: { department, stage, subject, sources: [ ... ] }
export const updateSubjectSources = (req, res) => {
  try {
    const { department, stage, subject, sources } = req.body;
    if (!department || !stage || !subject || !Array.isArray(sources)) {
      return res.status(400).json({ message: "الحقول غير مكتملة أو صيغة sources خاطئة" });
    }
    const data = readData();
    if (!data[department]) data[department] = {};
    if (!data[department][stage]) data[department][stage] = {};
    data[department][stage][subject] = sources.map(s => s.trim()).filter(Boolean);
    writeData(data);
    res.json({ message: "تم تحديث المصادر بنجاح", data: data[department][stage][subject] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء التحديث" });
  }
};

// 4) إضافة رابط واحد كمصدر (push)
export const addSourceLink = (req, res) => {
  try {
    const { department, stage, subject, source } = req.body;
    if (!department || !stage || !subject || !source) return res.status(400).json({ message: "الحقول مطلوبة" });
    const data = readData();
    if (!data[department]) data[department] = {};
    if (!data[department][stage]) data[department][stage] = {};
    if (!data[department][stage][subject]) data[department][stage][subject] = [];
    data[department][stage][subject].push(source.trim());
    writeData(data);
    res.json({ message: "تمت إضافة المصدر", source });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء الإضافة" });
  }
};

// 5) حذف مصدر بواسطة index أو url
// body: { department, stage, subject, index } أو { department, stage, subject, url }
export const deleteSource = (req, res) => {
  try {
    const { department, stage, subject, index, url } = req.body;
    if (!department || !stage || !subject) return res.status(400).json({ message: "الحقول مطلوبة" });
    const data = readData();
    const list = data?.[department]?.[stage]?.[subject];
    if (!Array.isArray(list)) return res.status(404).json({ message: "المصادر غير موجودة لهذه المادة" });

    if (typeof index === "number") {
      if (index < 0 || index >= list.length) return res.status(400).json({ message: "Index خارج النطاق" });
      const removed = list.splice(index, 1)[0];
      writeData(data);
      return res.json({ message: "تم الحذف", removed });
    } else if (typeof url === "string") {
      const newList = list.filter((l) => l !== url);
      data[department][stage][subject] = newList;
      writeData(data);
      return res.json({ message: "تم الحذف بواسطة url" });
    } else {
      return res.status(400).json({ message: "أرسل index أو url للحذف" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء الحذف" });
  }
};

// 6) رفع ملف كمصدر (multer route سيستخدم هذا handler لاضافة الملف كمصدر تلقائياً)
export const handleUploadedFile = (req, res) => {
  try {
    const { department, stage, subject } = req.body;
    if (!req.file) return res.status(400).json({ message: "لا يوجد ملف مرفوع" });
    const filename = req.file.filename;
    const publicUrl = `/uploads/sources/${filename}`; // تأكد أن السيرفر يخدم مجلد /uploads
    // أضف للرابط في JSON مباشرة
    const data = readData();
    if (!data[department]) data[department] = {};
    if (!data[department][stage]) data[department][stage] = {};
    if (!data[department][stage][subject]) data[department][stage][subject] = [];
    data[department][stage][subject].push(publicUrl);
    writeData(data);
    res.json({ message: "تم رفع الملف وإضافته كمصدر", url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ أثناء رفع الملف" });
  }
};
