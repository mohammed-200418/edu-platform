import Lecture from "../models/Lecture.js";

export const getDepartmentsStagesSubjects = async (req, res) => {
  try {
    const lectures = await Lecture.find();

    const data = {};

    lectures.forEach((lec) => {
      const { department, stage, subject } = lec;
      if (!data[department]) data[department] = {};
      if (!data[department][stage]) data[department][stage] = new Set();
      data[department][stage].add(subject);
    });

    // نحول الـ Set إلى مصفوفة
    const result = {};
    for (const dep in data) {
      result[dep] = {};
      for (const stg in data[dep]) {
        result[dep][stg] = Array.from(data[dep][stg]);
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ عند جلب بيانات المواد" });
  }
};
