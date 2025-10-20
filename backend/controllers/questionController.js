import Question from "../models/Question.js";

// ✅ إنشاء سؤال جديد من الطالب
export const askQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      studentId: req.user._id,
      messages: [{ sender: "student", text: req.body.text }],
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ جلب أسئلة الطالب الخاصة به (بدون المخفية)
export const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      studentId: req.user._id,
      deletedFor: { $ne: "student" },
    }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ جلب جميع الأسئلة (للأدمن فقط)
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      deletedFor: { $ne: "admin" },
    })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ إضافة رد من الطالب أو الإدمن
export const replyToQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "السؤال غير موجود" });

    const sender = req.user.role === "admin" ? "admin" : "student";
    question.messages.push({ sender, text: req.body.text });

    // تحديث الحالة
    if (sender === "admin") question.status = "answered";
    else if (sender === "student") question.status = "pending";

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ إخفاء محلي للسؤال (يبقى في قاعدة البيانات)
export const hideQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "السؤال غير موجود" });

    const userType = req.user.role === "admin" ? "admin" : "student";

    if (!question.deletedFor.includes(userType)) {
      question.deletedFor.push(userType);
      await question.save();
    }

    res.json({ message: "تم إخفاء السؤال من واجهتك فقط" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ (اختياري) حذف فعلي من قاعدة البيانات
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "السؤال غير موجود" });

    if (req.user.role !== "admin" && question.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "غير مصرح لك بحذف هذا السؤال" });
    }

    await question.deleteOne();
    res.json({ message: "تم حذف السؤال نهائيًا" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
