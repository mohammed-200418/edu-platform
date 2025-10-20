import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    department: { type: String, required: true },
    stage: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    textContent: { type: String, default: "" }, // ← إضافة هذا الحقل
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
