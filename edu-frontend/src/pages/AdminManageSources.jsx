// frontend/src/pages/AdminManageSources.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminManageSources() {
  const [metadata, setMetadata] = useState({});
  const [sources, setSources] = useState({});
  const [department, setDepartment] = useState("");
  const [stage, setStage] = useState("");
  const [subject, setSubject] = useState("");
  const [sourcesText, setSourcesText] = useState("");
  const [newLink, setNewLink] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const token = user?.token;

  const SERVER_URL = "https://edu-platform-production-7a03.up.railway.app";

  // جلب البيانات الأساسية
  useEffect(() => {
    if (!token) {
      console.warn("❌ لا يوجد توكن. يرجى تسجيل الدخول.");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [metaRes, srcRes] = await Promise.all([
          axios.get(`${SERVER_URL}/api/source/metadata`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${SERVER_URL}/api/source/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setMetadata(metaRes.data || {});
        setSources(srcRes.data || {});
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err.response?.data || err.message);
        alert("❌ فشل جلب البيانات. تحقق من السيرفر والتوكن. انظر الكونسول لمزيد من التفاصيل.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const departments = Object.keys(metadata);
  const stages = department ? Object.keys(metadata[department] || {}) : [];
  const subjects = department && stage ? metadata[department][stage] : [];

  const loadCurrentSources = () => {
    const list = sources?.[department]?.[stage]?.[subject] || [];
    setSourcesText(list.join("\n"));
  };

  useEffect(() => {
    loadCurrentSources();
  }, [department, stage, subject, sources]);

  const handleUpdate = async () => {
    if (!department || !stage || !subject) return alert("اختر القسم والمرحلة والمادة");
    const arr = sourcesText.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      await axios.post(
        `${SERVER_URL}/api/source/subjects/update`,
        { department, stage, subject, sources: arr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ تم حفظ المصادر");
      loadCurrentSources();
    } catch (err) {
      console.error("خطأ أثناء الحفظ:", err.response?.data || err.message);
      alert("❌ خطأ أثناء الحفظ. انظر الكونسول لمزيد من التفاصيل.");
    }
  };

  const handleAddLink = async () => {
    if (!newLink || !department || !stage || !subject) return alert("املأ الحقول أولا");
    try {
      await axios.post(
        `${SERVER_URL}/api/source/subjects/add`,
        { department, stage, subject, source: newLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewLink("");
      loadCurrentSources();
    } catch (err) {
      console.error("خطأ أثناء الإضافة:", err.response?.data || err.message);
      alert("❌ خطأ أثناء الإضافة. انظر الكونسول لمزيد من التفاصيل.");
    }
  };

  const handleDelete = async (idx, url) => {
    if (!window.confirm("هل تريد حذف هذا المصدر؟")) return;
    try {
      await axios.delete(
        `${SERVER_URL}/api/source/subjects/delete`,
        { data: { department, stage, subject, index: idx, url }, headers: { Authorization: `Bearer ${token}` } }
      );
      loadCurrentSources();
    } catch (err) {
      console.error("خطأ أثناء الحذف:", err.response?.data || err.message);
      alert("❌ خطأ أثناء الحذف. انظر الكونسول لمزيد من التفاصيل.");
    }
  };

  const handleFileUpload = async () => {
    if (!file || !department || !stage || !subject) return alert("اختر ملفاً والحقول المطلوبة");
    const form = new FormData();
    form.append("file", file);
    form.append("department", department);
    form.append("stage", stage);
    form.append("subject", subject);
    try {
      await axios.post(`${SERVER_URL}/api/source/subjects/upload-file`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      loadCurrentSources();
      alert("✅ تم رفع الملف وإضافته كمصدر");
    } catch (err) {
      console.error("خطأ أثناء رفع الملف:", err.response?.data || err.message);
      alert("❌ خطأ أثناء رفع الملف. انظر الكونسول لمزيد من التفاصيل.");
    }
  };

  if (loading) return <p className="p-6">جاري التحميل...</p>;
  if (!token) return <p className="p-6 text-red-500">❌ يجب تسجيل الدخول للوصول لهذه الصفحة</p>;

  const currentList = sources?.[department]?.[stage]?.[subject] || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">إدارة مصادر المواد (ديناميكي)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select value={department} onChange={(e) => { setDepartment(e.target.value); setStage(""); setSubject(""); }}>
          <option value="">اختر القسم</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select value={stage} onChange={(e) => { setStage(e.target.value); setSubject(""); }}>
          <option value="">اختر المرحلة</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">اختر المادة</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">قائمة المصادر الحالية</label>
        {currentList.length === 0 ? (
          <p className="text-gray-600">لا توجد مصادر لهذه المادة.</p>
        ) : (
          <ul className="space-y-2">
            {currentList.map((link, i) => (
              <li key={i} className="flex items-start justify-between bg-white/90 rounded p-2">
                <a href={link} target="_blank" rel="noreferrer" className="text-blue-600 break-all">{link}</a>
                <div className="ml-4">
                  <button onClick={() => handleDelete(i, link)} className="bg-red-500 text-white px-3 py-1 rounded">حذف</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">إضافة رابط مصدر</label>
        <div className="flex gap-2">
          <input className="flex-1 border p-2" placeholder="https://..." value={newLink} onChange={(e) => setNewLink(e.target.value)} />
          <button onClick={handleAddLink} className="bg-green-600 text-white px-4 py-2 rounded">إضافة</button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">رفع ملف كمصدر (PDF)</label>
        <div className="flex gap-2 items-center">
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleFileUpload} className="bg-indigo-600 text-white px-4 py-2 rounded">رفع الملف</button>
        </div>
      </div>

      <div className="mb-8">
        <label className="block font-semibold mb-1">تعديل/استبدال قائمة المصادر بالكامل (كل رابط بسطر)</label>
        <textarea className="w-full border p-2 h-36" value={sourcesText} onChange={(e) => setSourcesText(e.target.value)} />
        <div className="mt-2 flex gap-2">
          <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded">حفظ التغييرات</button>
          <button onClick={loadCurrentSources} className="bg-gray-200 px-3 py-2 rounded">إعادة تحميل</button>
        </div>
      </div>
    </div>
  );
}
