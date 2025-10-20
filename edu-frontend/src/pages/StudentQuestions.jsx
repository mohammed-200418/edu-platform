import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StudentQuestions() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchMyQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/questions/my", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setQuestions(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء تحميل الأسئلة");
    }
  };

  useEffect(() => {
    fetchMyQuestions();
  }, []);

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return alert("أدخل السؤال أولاً");
    try {
      await axios.post(
        "http://localhost:5000/api/questions",
        { text: newQuestion.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNewQuestion("");
      fetchMyQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إرسال السؤال");
    }
  };

  const replyToQuestion = async (questionId) => {
    if (!replyText.trim()) return alert("أدخل الرد أولاً");
    try {
      await axios.post(
        `http://localhost:5000/api/questions/${questionId}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReplyText("");
      setActiveQuestionId(null);
      fetchMyQuestions();
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
      fetchMyQuestions();
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
      fetchMyQuestions();
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 text-white">
      <button
        className="mb-6 bg-white text-purple-700 px-4 py-2 rounded shadow hover:bg-gray-100"
        onClick={() => navigate("/student-dashboard")}
      >
        العودة للصفحة الرئيسية
      </button>

      <h1 className="text-3xl font-bold mb-6">أسئلتي</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="اكتب سؤالك هنا..."
          className="flex-1 p-2 rounded text-gray-800"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button
          className="bg-green-500 px-4 py-2 rounded"
          onClick={submitQuestion}
        >
          إرسال سؤال جديد
        </button>
      </div>

      <button
        className="mb-6 bg-blue-500 px-4 py-2 rounded shadow hover:bg-blue-600"
        onClick={fetchMyQuestions}
      >
        تحديث المحادثات
      </button>

      {questions.length === 0 && <p>لم تقم بطرح أي سؤال بعد.</p>}

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
              <p className="font-bold">السؤال: {q.messages[0]?.text}</p>
              <button className="text-blue-600 underline">
                {isExpanded ? "إخفاء" : "عرض"}
              </button>
            </div>

            {isExpanded && (
              <>
                <div className="mb-2 max-h-64 overflow-y-auto p-2 bg-gray-100 rounded mt-2">
                  {q.messages.map((msg, idx) => (
                    <p
                      key={idx}
                      className={
                        msg.sender === "admin" ? "text-green-700" : "text-blue-700"
                      }
                    >
                      <strong>{msg.sender === "admin" ? "الأدمن" : "أنا"}:</strong>{" "}
                      {msg.text}
                    </p>
                  ))}
                </div>

                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 p-2 rounded border"
                    value={activeQuestionId === q._id ? replyText : ""}
                    onChange={(e) => {
                      setActiveQuestionId(q._id);
                      setReplyText(e.target.value);
                    }}
                  />
                  <button
                    className="bg-green-500 px-4 py-2 rounded"
                    onClick={() => replyToQuestion(q._id)}
                  >
                    إرسال
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
