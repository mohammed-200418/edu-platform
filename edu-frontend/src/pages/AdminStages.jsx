import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminStages() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const SERVER_URL = "https://edu-platform-production-7a03.up.railway.app";

  const [departments] = useState(["التمريض", "التحليلات", "الصيدلة"]); // الأقسام
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");

  // جلب المراحل حسب القسم
  const fetchStages = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/stages`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStages(res.data.filter(s => s.department === selectedDepartment));
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء تحميل المراحل");
    }
  };

  // جلب المواد الخاصة بالمرحلة المختارة
  useEffect(() => {
    if (selectedDepartment) fetchStages();
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedStage) {
      const stage = stages.find(s => s.stage === selectedStage);
      setSubjects(stage ? stage.subjects : []);
    }
  }, [selectedStage, stages]);

  const addSubject = async () => {
    if (!newSubject.trim()) return alert("أدخل اسم المادة أولاً");
    try {
      const updatedSubjects = [...subjects, newSubject.trim()];
      await axios.put(
        `${SERVER_URL}/api/stages/${selectedStage}`,
        { subjects: updatedSubjects },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSubjects(updatedSubjects);
      setNewSubject("");
      alert("✅ تمت إضافة المادة!");
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إضافة المادة");
    }
  };

  const removeSubject = async (subject) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${subject}"؟`)) return;
    try {
      const updatedSubjects = subjects.filter(s => s !== subject);
      await axios.put(
        `${SERVER_URL}/api/stages/${selectedStage}`,
        { subjects: updatedSubjects },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSubjects(updatedSubjects);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء حذف المادة");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 text-white">
      <button
        className="mb-6 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:bg-gray-200"
        onClick={() => navigate("/admin-dashboard")}
      >
        الرجوع إلى الرئيسية
      </button>

      <h1 className="text-4xl font-bold mb-6">تحديد المواد لكل مرحلة</h1>

      {/* اختيار القسم */}
      <select
        className="border p-2 mb-4 w-full rounded text-gray-800"
        value={selectedDepartment}
        onChange={e => {
          setSelectedDepartment(e.target.value);
          setSelectedStage("");
          setSubjects([]);
        }}
      >
        <option value="">اختر القسم</option>
        {departments.map(dep => (
          <option key={dep} value={dep}>{dep}</option>
        ))}
      </select>

      {/* اختيار المرحلة */}
      {selectedDepartment && (
        <select
          className="border p-2 mb-4 w-full rounded text-gray-800"
          value={selectedStage}
          onChange={e => setSelectedStage(e.target.value)}
        >
          <option value="">اختر المرحلة</option>
          {stages.map(s => (
            <option key={s.stage} value={s.stage}>{s.stage}</option>
          ))}
        </select>
      )}

      {/* عرض المواد */}
      {selectedStage && (
        <div className="bg-white text-gray-800 p-4 rounded-xl shadow">
          <h3 className="font-bold mb-3">مواد المرحلة: {selectedStage}</h3>

          {subjects.length > 0 ? (
            subjects.map(sub => (
              <div key={sub} className="flex justify-between items-center mb-2">
                <span>{sub}</span>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => removeSubject(sub)}
                >
                  حذف
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">لم تضاف مواد لهذه المرحلة بعد</p>
          )}

          {/* إضافة مادة جديدة */}
          <div className="mt-4 flex gap-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="أدخل اسم المادة الجديدة"
              value={newSubject}
              onChange={e => setNewSubject(e.target.value)}
            />
            <button
              className="bg-green-500 text-white px-4 rounded"
              onClick={addSubject}
            >
              إضافة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
