import { useState, useEffect } from "react";
import axios from "axios";

export default function AskAIChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [department, setDepartment] = useState("");
  const [stage, setStage] = useState("");
  const [subject, setSubject] = useState("");
  const [sources, setSources] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const token = user?.token;

  // جلب metadata والمصادر عند التحميل
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [metaRes, srcRes] = await Promise.all([
          axios.get("http://localhost:5000/api/source/metadata", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/source/subjects", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setMetadata(metaRes.data || {});
        setSources(srcRes.data || {});
      } catch (err) {
        console.error(err);
        alert("فشل جلب البيانات. تأكد من السيرفر والتوكن.");
      }
    };

    fetchData();
  }, [token]);

  // تحديث قائمة المصادر عند اختيار القسم/المرحلة/المادة
  const currentSources = department && stage && subject
    ? sources?.[department]?.[stage]?.[subject] || []
    : [];

  const handleAsk = async () => {
    if (!question || !department || !stage || !subject) return alert("اختر المادة واكتب السؤال");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/ask", 
        { question, department, stage, subject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswer(res.data.answer || "لم يتم الحصول على إجابة.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "حدث خطأ أثناء إرسال السؤال");
    } finally {
      setLoading(false);
    }
  };

  const departments = Object.keys(metadata);
  const stages = department ? Object.keys(metadata[department] || {}) : [];
  const subjects = department && stage ? metadata[department][stage] : [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">اسأل المساعد الذكي</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select value={department} onChange={e => { setDepartment(e.target.value); setStage(""); setSubject(""); }}>
          <option value="">اختر القسم</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={stage} onChange={e => { setStage(e.target.value); setSubject(""); }}>
          <option value="">اختر المرحلة</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">اختر المادة</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">المصادر المتاحة لهذه المادة</label>
        {currentSources.length === 0 ? (
          <p className="text-gray-600">لا توجد مصادر مضافة لهذه المادة.</p>
        ) : (
          <ul className="space-y-2">
            {currentSources.map((link, i) => (
              <li key={i}><a href={link} target="_blank" rel="noreferrer" className="text-blue-600 break-all">{link}</a></li>
            ))}
          </ul>
        )}
      </div>

      <textarea
        className="w-full border p-2 h-28 mb-2"
        placeholder="اكتب سؤالك هنا..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={handleAsk}
        disabled={loading}
      >
        {loading ? "جاري الإجابة..." : "اسأل"}
      </button>

      {answer && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">إجابة المساعد:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
