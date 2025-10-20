import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["student", "admin"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ["pending", "answered"],
      default: "pending",
    },
    // 🔹 إخفاء محلي (حتى لو حذفها طرف واحد تبقى بالـDB)
    deletedFor: {
      type: [String], // ['student'] أو ['admin']
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
