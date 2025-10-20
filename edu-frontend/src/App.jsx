import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import StudentMaterials from "./pages/StudentMaterials";
import StudentQuestions from "./pages/StudentQuestions";
import AdminDashboard from "./pages/AdminDashboard";
import AskAIChat from "./pages/AskAIChat"; // تم تعديل الاسم هنا
import AdminAccounts from "./pages/AdminAccounts";
import AdminQuestions from "./pages/AdminQuestions";
import AdminLectures from "./pages/AdminLectures";
import AdminStages from "./pages/AdminStages";
import AdminManageSources from "./pages/AdminManageSources";

// =================== Navbar ===================
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user"));
    setUser(storedUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) setShowNavbar(false);
      else setShowNavbar(true);
      setLastScrollY(window.scrollY);
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const hideNavbarPaths = ["/", "/login", "/register"];
  const shouldHide = hideNavbarPaths.includes(location.pathname);
  if (shouldHide) return null;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-lg backdrop-blur-md/80 flex flex-col justify-between transition-transform duration-500 ease-in-out ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="flex justify-between items-center px-6 py-3">
        <div className="text-2xl font-bold tracking-wide drop-shadow-md">Nurse Learn</div>
        <div className="text-sm hidden md:block opacity-90">© 2025 Nurse Learn — تصميم <span className="font-semibold">محمد ميثاق</span></div>
        {user ? (
          <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-1 rounded-xl transition-all shadow-sm backdrop-blur-sm">
            تسجيل خروج
          </button>
        ) : (<div className="w-28" />)}
      </div>
      <div className="h-1 w-full bg-white/20">
        <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
      </div>
    </nav>
  );
}

// =================== حماية الصفحات حسب الدور ===================
function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

// =================== التطبيق الرئيسي ===================
function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-20">
        <Routes>
          {/* صفحات عامة */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-chat" element={<AskAIChat />} /> {/* تم تعديل الاسم هنا */}
          <Route path="/accounts" element={<AdminAccounts />} />
          <Route path="/questions" element={<AdminQuestions />} />
          <Route path="/lectures" element={<AdminLectures />} />
          <Route path="/stages" element={<AdminStages />} />
          <Route path="/admin-manage-sources" element={<AdminManageSources />} />


          {/* صفحات الطالب */}
          <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student-materials" element={<ProtectedRoute role="student"><StudentMaterials /></ProtectedRoute>} />
          <Route path="/student-questions" element={<ProtectedRoute role="student"><StudentQuestions /></ProtectedRoute>} />

          {/* صفحات الادمن */}
          <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

          {/* أي مسار غير معروف */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
