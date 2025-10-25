import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const SERVER_URL = "https://edu-platform-production-7a03.up.railway.app"; // رابط السيرفر

  // ===== إعادة التوجيه التلقائي إذا المستخدم مسجل دخول =====
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.role === "admin") navigate("/admin-dashboard");
      else navigate("/student-dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/login`, { email, password });
      const userData = res.data;

      // حفظ بيانات المستخدم كاملة في localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);

      // توجيه المستخدم حسب دوره
      if (userData.role === "admin") navigate("/admin-dashboard");
      else navigate("/student-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "البريد أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
      <div className="p-8 bg-white rounded-xl shadow-lg w-96 text-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h2>

        <input
          type="email"
          placeholder="البريد"
          className="w-full p-3 mb-4 border rounded-lg"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="كلمة المرور"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "إخفاء" : "عرض"}
          </button>
        </div>

        <button
          className="w-full bg-blue-500 text-white p-3 rounded-lg hover:scale-105 transition-transform duration-300 mb-2"
          onClick={handleLogin}
        >
          دخول
        </button>

        {/* زر الانتقال لصفحة التسجيل */}
        <p className="mt-4 text-center text-gray-600">
          ليس لديك حساب؟{" "}
          <button
            className="text-blue-500 underline hover:text-blue-700"
            onClick={() => navigate("/register")}
          >
            تسجيل جديد
          </button>
        </p>
      </div>
    </div>
  );
}
