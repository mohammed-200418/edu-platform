import mongoose from "mongoose";

const stageSchema = new mongoose.Schema({
  department: { type: String, required: true }, // القسم
  stage: { type: String, required: true },      // المرحلة
  subjects: [{ type: String }]                  // المواد
});

// تصدير الموديل كـ default
const Stage = mongoose.model("Stage", stageSchema);
export default Stage;
