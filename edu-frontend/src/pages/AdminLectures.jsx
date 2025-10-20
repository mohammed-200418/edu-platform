// frontend/src/pages/AdminLectures.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLectures() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));

  const [stages, setStages] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [subjectsOptions, setSubjectsOptions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [lectures, setLectures] = useState([]);
  const [lectureForm, setLectureForm] = useState({
    title: "",
    subject: "",
    stage: "",
    file: null,
  });
  const [errors, setErrors] = useState({});

  const departmentsOptions = [...new Set(stages.map((s) => s.department))];

  // جلب المراحل مع حماية من التعديل بعد unmount
  useEffect(() => {
    let isMounted = true;
    const fetchStages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stages", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (isMounted) setStages(res.data);
      } catch (err) {
        console.error(err);
        if (isMounted) alert("حدث خطأ أثناء جلب المراحل");
      }
    };
    fetchStages();
    return () => { isMounted = false; };
  }, [user?.token]);

  // تحديث المواد عند اختيار المرحلة
  useEffect(() => {
    if (selectedStage && selectedDepartment) {
      const stageObj = stages.find(
        (s) => s.stage === selectedStage && s.department === selectedDepartment
      );
      setSubjectsOptions(stageObj ? stageObj.subjects : []);
      setSelectedSubject("");
      setLectureForm((lf) => ({ ...lf, stage: selectedStage, subject: "" }));
      setLectures([]);
      setErrors({});
    }
  }, [selectedStage, selectedDepartment, stages]);

  // جلب المحاضرات مع حماية من التعديل بعد unmount
  useEffect(() => {
    let isMounted = true;
    const fetchLectures = async () => {
      if (!selectedDepartment || !selectedStage || !selectedSubject) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/lectures/${encodeURIComponent(selectedDepartment)}/${encodeURIComponent(selectedStage)}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        if (isMounted) setLectures(res.data.filter((lec) => lec.subject === selectedSubject));
      } catch (err) {
        console.error(err);
        if (isMounted) alert("حدث خطأ أثناء جلب المحاضرات");
      }
    };
    fetchLectures();
    return () => { isMounted = false; };
  }, [selectedDepartment, selectedStage, selectedSubject, user.token]);

  // رفع المحاضرة
  const uploadLecture = async () => {
    const newErrors = {};
    if (!lectureForm.title.trim()) newErrors.title = "العنوان مطلوب";
    if (!selectedDepartment) newErrors.department = "القسم مطلوب";
    if (!selectedStage) newErrors.stage = "المرحلة مطلوبة";
    if (!selectedSubject) newErrors.subject = "المادة مطلوبة";
    if (!lectureForm.file) newErrors.file = "ملف PDF مطلوب";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", lectureForm.title);
      formData.append("subject", selectedSubject);
      formData.append("stage", selectedStage);
      formData.append("department", selectedDepartment);
      formData.append("file", lectureForm.file);
      formData.append("uploadedBy", user._id);

      await axios.post("http://localhost:5000/api/lectures/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${user.token}` },
      });

      setLectureForm({ ...lectureForm, title: "", file: null });
      // إعادة جلب المحاضرات بعد الرفع
      let isMounted = true;
      const res = await axios.get(
        `http://localhost:5000/api/lectures/${encodeURIComponent(selectedDepartment)}/${encodeURIComponent(selectedStage)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (isMounted) setLectures(res.data.filter((lec) => lec.subject === selectedSubject));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفع المحاضرة");
    }
  };

  const deleteLecture = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المحاضرة؟")) return;
    try {
      await axios.delete(`http://localhost:5000/api/lectures/delete/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLectures((prev) => prev.filter((lec) => lec._id !== id));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف المحاضرة");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 text-white">
      <button
        className="mb-6 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:bg-gray-200 transition"
        onClick={() => navigate("/admin-dashboard")}
      >
        الرجوع إلى الرئيسية
      </button>

      <h1 className="text-4xl font-bold mb-6">رفع محاضرة جديدة</h1>

      {/* نموذج رفع المحاضرة */}
      <div className="space-y-3">
        <div>
          <input
            className={`border p-2 w-full rounded text-gray-800 ${errors.title ? "border-red-500" : ""}`}
            placeholder="عنوان المحاضرة"
            value={lectureForm.title}
            onChange={(e) => setLectureForm((lf) => ({ ...lf, title: e.target.value }))}
          />
          {errors.title && <p className="text-red-300 mt-1">{errors.title}</p>}
        </div>

        <div>
          <select
            className={`border p-2 w-full rounded text-gray-800 ${errors.department ? "border-red-500" : ""}`}
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedStage("");
              setSelectedSubject("");
              setLectureForm((lf) => ({ ...lf, stage: "", subject: "" }));
              setSubjectsOptions([]);
              setLectures([]);
            }}
          >
            <option value="">اختر القسم</option>
            {departmentsOptions.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          {errors.department && <p className="text-red-300 mt-1">{errors.department}</p>}
        </div>

        {selectedDepartment && (
          <div>
            <select
              className={`border p-2 w-full rounded text-gray-800 ${errors.stage ? "border-red-500" : ""}`}
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
            >
              <option value="">اختر المرحلة</option>
              {stages.filter((s) => s.department === selectedDepartment).map((s) => (
                <option key={s.stage} value={s.stage}>{s.stage}</option>
              ))}
            </select>
            {errors.stage && <p className="text-red-300 mt-1">{errors.stage}</p>}
          </div>
        )}

        {selectedStage && subjectsOptions.length > 0 && (
          <div>
            <select
              className={`border p-2 w-full rounded text-gray-800 ${errors.subject ? "border-red-500" : ""}`}
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">اختر المادة</option>
              {subjectsOptions.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            {errors.subject && <p className="text-red-300 mt-1">{errors.subject}</p>}
          </div>
        )}

        <div>
          <input
            type="file"
            accept="application/pdf"
            className={`border p-2 w-full rounded text-gray-800 ${errors.file ? "border-red-500" : ""}`}
            onChange={(e) => setLectureForm((lf) => ({ ...lf, file: e.target.files[0] }))}
          />
          {errors.file && <p className="text-red-300 mt-1">{errors.file}</p>}
        </div>

        <button
          className="bg-blue-500 text-white p-2 rounded w-full hover:scale-105 transition-transform duration-300"
          onClick={uploadLecture}
        >
          رفع المحاضرة
        </button>
      </div>

      {/* عرض المحاضرات */}
      {selectedSubject && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">المحاضرات للمادة: {selectedSubject}</h2>
          {lectures.length === 0 ? (
            <p>لا توجد محاضرات لهذه المادة بعد.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {lectures.map((lec) => (
                <div
                  key={lec._id}
                  className="bg-white text-gray-800 rounded-xl shadow p-4 hover:scale-105 transition-transform duration-300"
                >
                  <h3 className="font-bold text-lg mb-2">{lec.title}</h3>
                  {lec.fileUrl && (
                    <a
                      href={`http://localhost:5000/${lec.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline mr-4"
                    >
                      تحميل
                    </a>
                  )}
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 mt-2"
                    onClick={() => deleteLecture(lec._id)}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
