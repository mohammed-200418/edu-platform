import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [stage, setStage] = useState("");
  const [departmentsOptions, setDepartmentsOptions] = useState([]);
  const [stagesOptions, setStagesOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const SERVER_URL = "https://edu-platform-production-7a03.up.railway.app"; // رابط السيرفر

  // جلب الأقسام عند التحميل
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/stages`);
        const uniqueDeps = [...new Set(res.data.map(s => s.department.trim()))];
        setDepartmentsOptions(uniqueDeps);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
  }, []);

  // جلب المراحل عند اختيار القسم
  useEffect(() => {
    if (!department) return setStagesOptions([]);
    const fetchStages = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/stages`);
        const filteredStages = res.data
          .filter(s => s.department?.trim() === department.trim())
          .map(s => s.stage);
        setStagesOptions(filteredStages);
        setStage(""); 
      } catch (err) {
        console.error(err);
      }
    };
    fetchStages();
  }, [department]);

  const handleRegister = async () => {
    if (!name || name.trim().split(" ").length < 3) {
      return alert("الرجاء كتابة الاسم الثلاثي");
    }
    if (!email || !password || !department || !stage) {
      return alert("الرجاء تعبئة جميع الحقول");
    }

    try {
      await axios.post(`${SERVER_URL}/api/auth/register`, {
        name, email, password, department, stage
      });
      alert("تم التسجيل بنجاح! يرجى تسجيل الدخول");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء التسجيل");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <div className="p-8 bg-white rounded-xl shadow-lg w-96 text-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">تسجيل حساب جديد</h2>

        <input
          type="text" placeholder="الاسم الثلاثي"
          className="w-full p-3 mb-4 border rounded-lg"
          value={name} onChange={e => setName(e.target.value)}
        />

        <input
          type="email" placeholder="البريد"
          className="w-full p-3 mb-4 border rounded-lg"
          value={email} onChange={e => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="كلمة المرور"
            className="w-full p-3 border rounded-lg"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "إخفاء" : "عرض"}
          </button>
        </div>

        <select
          className="w-full p-3 mb-4 border rounded-lg"
          value={department} onChange={e => setDepartment(e.target.value)}
        >
          <option value="">اختر القسم</option>
          {departmentsOptions.map(dep => <option key={dep} value={dep}>{dep}</option>)}
        </select>

        <select
          className="w-full p-3 mb-4 border rounded-lg"
          value={stage} onChange={e => setStage(e.target.value)}
        >
          <option value="">اختر المرحلة</option>
          {stagesOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button
          className="w-full bg-green-500 text-white p-3 rounded-lg mb-2"
          onClick={handleRegister}
        >
          تسجيل
        </button>
      </div>
    </div>
  );
}
