import fs from "fs";
import path from "path";
import OpenAI from "openai";
import axios from "axios"; // لإحضار metadata من السيرفر

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sourcesPath = path.resolve("data/subjectsSources.json");

export const askAI = async (req, res) => {
  const { question, subject, department, stage } = req.body;

  // 1️⃣ التحقق من البيانات المرسلة
  if (!question || !subject || !department || !stage) {
    return res.status(400).json({
      message: "يرجى إرسال المادة والقسم والمرحلة والسؤال."
    });
  }

  // 2️⃣ التحقق من وجود مفتاح OpenAI
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OpenAI API Key غير موجود في السيرفر");
    return res.status(500).json({
      message: "❌ لم يتم تكوين OpenAI API Key على السيرفر. الرجاء الاتصال بالدعم."
    });
  }

  // 3️⃣ التأكد من وجود ملف المصادر، وإنشاؤه إذا لم يكن موجوداً
  if (!fs.existsSync(sourcesPath)) {
    fs.mkdirSync(path.dirname(sourcesPath), { recursive: true });
    fs.writeFileSync(sourcesPath, "{}");
  }

  // 4️⃣ محاولة قراءة مصادر المواد
  let data;
  try {
    const raw = fs.readFileSync(sourcesPath, "utf8").trim();
    data = raw ? JSON.parse(raw) : {};
  } catch (jsonErr) {
    console.error("❌ خطأ في قراءة أو تحليل subjectsSources.json:", jsonErr);
    return res.status(500).json({
      message: "❌ خطأ في تحميل مصادر المواد. تأكد من أن الملف موجود وصحيح."
    });
  }

  // 5️⃣ ملء الملف تلقائياً بالـ metadata إذا كان فارغاً
  try {
    const metadataRes = await axios.get("http://localhost:5000/api/source/metadata");
    const metadata = metadataRes.data || {};

    let updated = false;

    for (const dep of Object.keys(metadata)) {
      if (!data[dep]) { data[dep] = {}; updated = true; }
      for (const st of Object.keys(metadata[dep])) {
        if (!data[dep][st]) { data[dep][st] = {}; updated = true; }
        for (const sub of metadata[dep][st]) {
          if (!data[dep][st][sub]) { data[dep][st][sub] = []; updated = true; }
        }
      }
    }

    if (updated) fs.writeFileSync(sourcesPath, JSON.stringify(data, null, 2));

  } catch (metaErr) {
    console.error("❌ خطأ أثناء جلب metadata لتحديث sources:", metaErr);
  }

  // 6️⃣ الحصول على المصادر الخاصة بالمادة
  const subjectSources = data?.[department]?.[stage]?.[subject] || [];

  let contextText = `المادة: ${subject} (${stage} - ${department})\n`;
  if (subjectSources.length > 0) {
    contextText += `المصادر المتاحة:\n${subjectSources.join("\n")}\n`;
  } else {
    contextText += "⚠️ لا توجد مصادر مضافة لهذه المادة حالياً.\n";
  }

  // 7️⃣ تحضير الـ prompt للـ AI
  const prompt = `
أنت مساعد ذكي جامعي.
استخدم المعلومات التالية للإجابة على سؤال الطالب بناءً على المادة الدراسية.
${contextText}

السؤال: ${question}
  `;

  // 8️⃣ محاولة الاتصال بالذكاء الاصطناعي
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const answer = response?.choices?.[0]?.message?.content;

    if (!answer) {
      console.error("❌ OpenAI رجع استجابة فارغة:", response);
      return res.status(500).json({
        message: "❌ الذكاء الاصطناعي لم يتمكن من توليد إجابة. حاول لاحقاً."
      });
    }

    // ✅ النجاح
    res.json({ answer });

  } catch (err) {
    console.error("❌ AI error:", err);

    let userMessage = "❌ حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";

    if (err.message.includes("Invalid API Key")) {
      userMessage += " يبدو أن مفتاح OpenAI غير صالح.";
    } else if (err.message.includes("network") || err.code === "ENOTFOUND") {
      userMessage += " هناك مشكلة في الاتصال بالإنترنت أو السيرفر.";
    } else if (err.message.includes("429")) {
      userMessage += " تم الوصول إلى الحد الأقصى لطلبات OpenAI، حاول لاحقاً.";
    }

    res.status(500).json({ message: userMessage });
  }
};
