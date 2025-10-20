import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/questions", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setQuestions(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء جلب الأسئلة");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const sendReply = async (id) => {
    const question = questions.find((q) => q._id === id);
    if (!question) return alert("السؤال غير موجود");
    if (!replyText.trim()) return alert("أدخل الرد أولاً");

    try {
      await axios.post(
        `http://localhost:5000/api/questions/${id}/reply`,
        { text: replyText.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReplyText("");
      setActiveQuestionId(null);
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إرسال الرد");
    }
  };

  const toggleExpand = (id) => {
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const hideQuestion = async (questionId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/questions/${questionId}/hide`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إخفاء السؤال");
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("هل تريد حذف السؤال نهائيًا؟")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/questions/${questionId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 text-white">
      {/* زر العودة للصفحة الرئيسية */}
      <button
        className="mb-6 bg-white text-purple-700 px-4 py-2 rounded shadow hover:bg-gray-100"
        onClick={() => navigate("/admin-dashboard")}
      >
        العودة للصفحة الرئيسية
      </button>

      <button
        className="mb-6 bg-yellow-400 text-gray-800 px-4 py-2 rounded shadow hover:bg-yellow-300"
        onClick={fetchQuestions}
      >
        تحديث المحادثات
      </button>

      <h1 className="text-3xl font-bold mb-6">الرد على أسئلة الطلاب</h1>

      {questions.length === 0 && <p>لا توجد أسئلة حالياً.</p>}

      {questions.map((q) => {
        const isExpanded = expandedQuestions.includes(q._id);
        return (
          <div
            key={q._id}
            className={`bg-white text-gray-800 rounded-xl mb-4 shadow transition-all ${
              isExpanded ? "p-4" : "p-2"
            }`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(q._id)}
            >
              <p className="font-bold">طالب: {q.studentId?.name || "غير معروف"}</p>
              <button className="text-blue-600 underline">
                {isExpanded ? "إخفاء" : "عرض"}
              </button>
            </div>

            {isExpanded && (
              <>
                <div className="mb-2 max-h-64 overflow-y-auto p-2 bg-gray-100 rounded mt-2 flex flex-col gap-2">
                  {q.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl max-w-[70%] ${
                        msg.sender === "admin"
                          ? "bg-green-200 self-end text-green-900"
                          : "bg-blue-200 self-start text-blue-900"
                      } shadow-md`}
                    >
                      <p className="text-xs font-semibold mb-1">
                        {msg.sender === "admin" ? "أنا" : "الطالب"} •{" "}
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="أدخل الرد هنا..."
                    className="border p-2 flex-1 rounded"
                    value={activeQuestionId === q._id ? replyText : ""}
                    onChange={(e) => {
                      setActiveQuestionId(q._id);
                      setReplyText(e.target.value);
                    }}
                  />
                  <button
                    className="bg-green-500 text-white p-2 rounded hover:scale-105 transition-transform"
                    onClick={() => sendReply(q._id)}
                  >
                    إرسال الرد
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => hideQuestion(q._id)}
                  >
                    إخفاء
                  </button>
                  <button
                    className="text-red-800 hover:underline"
                    onClick={() => deleteQuestion(q._id)}
                  >
                    حذف نهائي
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
