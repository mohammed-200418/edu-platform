// src/pages/admin/AdminDashboard.jsx
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const userRole = user?.role; // admin أو student أو أي دور آخر
  const userDesignations = user?.designation || []; // تسميات إضافية

  const cards = [
    { title: "إدارة الحسابات", path: "/accounts", color: "bg-blue-500", allowedDesignations: ["مدير الحسابات", "moderator"] },
    { title: "الرد على الأسئلة", path: "/questions", color: "bg-green-500", allowedDesignations: ["مسؤول الأسئلة", "moderator"] },
    { title: "رفع المحاضرات", path: "/lectures", color: "bg-purple-500", allowedDesignations: ["مسؤول رفع المحاضرات"] },
    { title: "تحديد المواد لكل مرحلة", path: "/stages", color: "bg-pink-500", allowedDesignations: ["مسؤول المواد"] },
    { title: "إدارة مصادر المواد", path: "/admin-manage-sources", color: "bg-yellow-500", allowedDesignations: ["مسؤول المصادر"] }
  ];

  // فلترة الأزرار حسب الدور أو التسميات
  const allowedCards = userRole === "admin"
    ? cards // الادمن يرى كل البطاقات
    : cards.filter(card => 
        card.allowedDesignations.some(d => userDesignations.includes(d))
      );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-6 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">لوحة تحكم مدير النظام</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allowedCards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className={`${card.color} cursor-pointer p-6 rounded-2xl shadow-lg text-center transform hover:scale-105 transition-transform duration-300`}
          >
            <h2 className="text-xl font-semibold">{card.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
