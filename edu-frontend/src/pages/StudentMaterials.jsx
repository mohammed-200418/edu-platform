import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentMaterials() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [lectures, setLectures] = useState([]);

  // جلب بيانات المستخدم والمواد
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));

    if (!storedUser || storedUser.role !== "student") {
      navigate("/login");
      return;
    }
    setUser(storedUser);

    const fetchSubjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stages", {
          headers: { Authorization: `Bearer ${storedUser.token}` },
        });

        const stageObj = res.data.find(
          (s) => s.stage === storedUser.stage && s.department === storedUser.department
        );

        if (stageObj?.subjects?.length > 0) {
          setSubjects(stageObj.subjects);
          setSelectedSubject(stageObj.subjects[0]);
        }
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء جلب المواد");
      }
    };

    fetchSubjects();
  }, [navigate]);

  // دالة لجلب المحاضرات حسب المادة
  const fetchLectures = async () => {
    if (!user || !selectedSubject) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/lectures/${encodeURIComponent(user.department)}/${encodeURIComponent(user.stage)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const filteredLectures = res.data.filter((lec) => lec.subject === selectedSubject);

      const lecturesWithInfo = filteredLectures.map((lec) => {
        const fileName = lec.fileUrl ? lec.fileUrl.split("\\").pop() : "";
        return {
          ...lec,
          fileUrl: lec.fileUrl
            ? `http://localhost:5000/uploads/${fileName}`
            : null,
          fileName,
          fileSize: lec.fileSize || null,
        };
      });

      setLectures(lecturesWithInfo);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء جلب المحاضرات");
    }
  };

  // جلب المحاضرات عند تغيير المادة
  useEffect(() => {
    fetchLectures();

    // Polling: تحديث تلقائي كل 10 ثواني
    const interval = setInterval(fetchLectures, 10000); // 10000ms = 10s
    return () => clearInterval(interval);
  }, [selectedSubject, user]);

  const formatFileSize = (size) => {
    if (!size) return "";
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white">
      <button
        className="mb-6 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:bg-gray-200 transition"
        onClick={() => navigate("/student-dashboard")}
      >
        الرجوع إلى الرئيسية
      </button>

      <h1 className="text-3xl font-bold mb-6">المواد والمحاضرات</h1>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">اختر المادة</label>
        <select
          className="p-3 rounded-lg w-full text-gray-800 font-medium"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-bold mb-4">محاضرات المادة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lectures.length === 0 ? (
          <p className="col-span-full text-center text-white/80">
            لا توجد محاضرات لهذه المادة بعد.
          </p>
        ) : (
          lectures.map((lec) => (
            <div
              key={lec._id}
              className="bg-white text-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col justify-between"
            >
              <h3 className="font-bold text-xl mb-3 truncate">{lec.title}</h3>

              {lec.fileUrl && (
                <a
                  href={lec.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold mb-3"
                >
                  <span>📄</span>
                  <span className="truncate">{lec.fileName}</span>
                  {lec.fileSize && (
                    <span className="text-gray-500 text-sm">
                      ({formatFileSize(lec.fileSize)})
                    </span>
                  )}
                </a>
              )}

              <p className="text-gray-600 text-sm mt-auto">
                تم الرفع: {new Date(lec.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
