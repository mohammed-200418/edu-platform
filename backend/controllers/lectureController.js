import Lecture from "../models/Lecture.js";
import fs from "fs";
import path from "path";

// رفع محاضرة جديدة
export const uploadLecture = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "الرجاء رفع ملف PDF" });

    const { title, subject, stage, department, uploadedBy } = req.body;
    if (!title || !subject || !stage || !department || !uploadedBy) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    const fileUrl = `uploads/${file.filename}`;

    // حفظ المحاضرة في قاعدة البيانات بدون محاولة استخراج النص
    const lecture = await Lecture.create({
      title,
      subject,
      department,
      stage,
      fileUrl,
      uploadedBy,
      textContent: "" // تركه فارغ لأننا لم نستخرج النص
    });

    res.status(201).json({ message: "✅ تم رفع المحاضرة بنجاح", lecture });
  } catch (error) {
    console.error("❌ خطأ أثناء رفع المحاضرة:", error);
    res.status(500).json({ message: error.message });
  }
};

// جلب المحاضرات حسب القسم والمرحلة
export const getLecturesByDepartmentAndStage = async (req, res) => {
  const { department, stage } = req.params;
  try {
    const lectures = await Lecture.find({ department, stage }).sort({ createdAt: -1 });
    res.json(lectures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// جلب كل المحاضرات
export const getAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find().sort({ createdAt: -1 });
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف محاضرة + الملف
export const deleteLecture = async (req, res) => {
  const { id } = req.params;
  try {
    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ message: "المحاضرة غير موجودة" });

    // حذف الملف من السيرفر بدون crash
    try {
      const fullPath = path.resolve(lecture.fileUrl);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.warn("⚠️ لم يتم حذف الملف من النظام، لكن سيتم حذف السجل:", err.message);
    }

    await lecture.deleteOne();
    res.json({ message: "🗑️ تم حذف المحاضرة بنجاح" });
  } catch (error) {
    console.error("❌ خطأ أثناء حذف المحاضرة:", error.message);
    res.status(500).json({ message: "حدث خطأ أثناء حذف المحاضرة" });
  }
};
