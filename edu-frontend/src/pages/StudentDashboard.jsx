import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaQuestionCircle, FaRobot } from "react-icons/fa"; // أيقونات لكل زر

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "student") {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  if (!user) return null;

  const buttons = [
    {
      label: "عرض المواد والمحاضرات",
      color: "blue",
      icon: <FaBook className="mr-2" />,
      path: "/student-materials",
    },
    {
      label: "سؤال وجواب",
      color: "green",
      icon: <FaQuestionCircle className="mr-2" />,
      path: "/student-questions",
    },
    {
      label: "اسأل AI",
      color: "purple",
      icon: <FaRobot className="mr-2" />,
      path: "/ai-chat",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 text-white p-6 flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">مرحباً، {user.name}</h1>
        <p className="text-xl opacity-90">
          قسمك: {user.department} | مرحلتك: {user.stage}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            className={`flex items-center justify-center w-72 md:w-80 p-4 rounded-xl font-semibold text-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl bg-${btn.color}-500 hover:bg-${btn.color}-600`}
            onClick={() => navigate(btn.path)}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
