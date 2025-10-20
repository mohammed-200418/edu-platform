import Stage from "../models/Stage.js";

// جلب جميع المراحل
export const getStages = async (req, res) => {
  try {
    const stages = await Stage.find();
    res.json(stages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// إضافة مرحلة جديدة (مرة واحدة)
export const addStage = async (req, res) => {
  try {
    const { stage, department } = req.body;
    const exists = await Stage.findOne({ stage });
    if (exists) return res.status(400).json({ message: "المرحلة موجودة مسبقًا" });

    const newStage = new Stage({ stage, department });
    await newStage.save();
    res.json({ message: "تمت إضافة المرحلة بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// تحديث المواد لمرحلة معينة
export const updateSubjects = async (req, res) => {
  try {
    const { subjects } = req.body;
    const stageName = req.params.stageName;
    const stage = await Stage.findOne({ stage: stageName });

    if (!stage) return res.status(404).json({ message: "المرحلة غير موجودة" });

    stage.subjects = subjects;
    await stage.save();
    res.json({ message: "تم تحديث المواد بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
