// seedStages.js
import mongoose from "mongoose";
import Stage from "./models/Stage.js"; // عدّل المسار إذا مختلف
import 'dotenv/config';

// رابط الاتصال بقاعدة البيانات
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/yourDB";

const stagesData = [
  { department: "التمريض", stage: "المرحلة الأولى" },
  { department: "التمريض", stage: "المرحلة الثانية" },
  { department: "التمريض", stage: "المرحلة الثالثة" },
  { department: "التمريض", stage: "المرحلة الرابعة" }
];

const seedStages = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // مسح المراحل القديمة للتمريض
    await Stage.deleteMany({ department: "التمريض" });
    console.log("🗑️ Old nursing stages cleared");

    // إدخال البيانات الجديدة
    await Stage.insertMany(stagesData);
    console.log("🌱 Nursing stages added successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding stages:", err);
    process.exit(1);
  }
};

seedStages();
