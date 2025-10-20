import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full relative flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white">

      {/* الموجات المتحركة */}
      <div className="absolute bottom-0 w-full h-32">
        <svg viewBox="0 0 1440 320" className="w-full h-full">
          <path
            fill="rgba(255,255,255,0.3)"
            d="M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,101.3C840,107,960,149,1080,181.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
              M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,101.3C840,107,960,149,1080,181.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z;
              M0,160L60,170C120,180,240,200,360,192C480,184,600,144,720,144C840,144,960,192,1080,197.3C1200,203,1320,165,1380,149.3L1440,135L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z;
              M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,101.3C840,107,960,149,1080,181.3C1200,213,1320,235,1380,245.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z
              "
            />
          </path>
        </svg>
      </div>

      {/* محتوى الصفحة */}
      <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg text-center">Nurse Learn</h1>
      <p className="text-xl mb-12 text-center max-w-md drop-shadow-md">
        منصة التعلم والتطوير للممرضين، طور مهاراتك وكن جزء من مجتمعنا.
      </p>

      <div className="flex flex-col sm:flex-row gap-6 z-10">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center justify-center gap-3 bg-white text-blue-600 font-semibold px-10 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
        >
          <FaSignInAlt /> تسجيل الدخول
        </button>

        <button
          onClick={() => navigate("/register")}
          className="flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white font-semibold px-10 py-3 rounded-xl hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-300"
        >
          <FaUserPlus /> تسجيل
        </button>
      </div>

      <p className="absolute bottom-6 text-sm opacity-70 text-center w-full z-10">© محمد ميثاق</p>
    </div>
  );
}
