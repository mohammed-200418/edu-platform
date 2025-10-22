// src/pages/admin/AdminAccounts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminAccounts() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const [students, setStudents] = useState([]);

  // صلاحيات حسب الدور/التسميات
  const allowedRoles = ["admin"]; // فقط الأدمن
  const allowedDesignations = ["مدير الحسابات"]; // يمكنك تعديلها إذا تريد

  // فحص صلاحيات المستخدم
  const hasAccess =
    allowedRoles.includes(user?.role) ||
    (user?.designation && user.designation.some((d) => allowedDesignations.includes(d)));

  // 🔗 رابط السيرفر على Railway
  const BASE_URL = "https://edu-platform-production-7a03.up.railway.app";

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "حدث خطأ أثناء جلب المستخدمين");
    }
  };

  useEffect(() => {
    if (hasAccess) fetchStudents();
  }, [hasAccess]);

  const changeRole = async (id, newRole) => {
    try {
      await axios.put(
        `${BASE_URL}/api/users/change-role/${id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "حدث خطأ أثناء تغيير الدور");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "حدث خطأ أثناء حذف المستخدم");
    }
  };

  // إذا ما عنده صلاحية
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-red-100 text-red-700 p-6">
        <p className="text-xl font-semibold">
          ❌ صلاحياتك غير كافية. هذه الصفحة متاحة فقط للمديرين.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 text-white">
      {/* زر العودة */}
      <button
        className="mb-6 px-4 py-2 bg-white text-gray-800 rounded-lg shadow hover:bg-gray-200"
        onClick={() => navigate("/admin-dashboard")}
      >
        الرجوع إلى الرئيسية
      </button>

      <h1 className="text-4xl font-bold mb-6">إدارة الحسابات</h1>

      <div className="max-h-96 overflow-y-auto bg-white text-gray-800 p-6 rounded-xl shadow-lg">
        {students.length === 0 ? (
          <p className="text-center text-gray-500">لا يوجد مستخدمين حالياً.</p>
        ) : (
          students.map((s) => (
            <div
              key={s._id}
              className="mb-2 p-2 border rounded flex justify-between items-center"
            >
              <p>
                <strong>{s.name}</strong> - {s.email} - <span className="italic">{s.role}</span>
              </p>
              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-2 rounded hover:bg-blue-600"
                  onClick={() =>
                    changeRole(s._id, s.role === "student" ? "admin" : "student")
                  }
                >
                  تغيير الدور
                </button>
                <button
                  className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                  onClick={() => deleteUser(s._id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
