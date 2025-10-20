import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    const fetchLectures = async () => {
      const res = await axios.get(`http://localhost:5000/api/lectures/${user.section}/${user.stage}`);
      setLectures(res.data);
    };
    fetchLectures();
  }, [user.section, user.stage]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">مرحبا {user.name}</h1>
      <h2 className="text-xl mb-4">محاضراتك:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lectures.map(lec => (
          <div key={lec._id} className="p-4 border rounded shadow">
            <h3 className="font-bold">{lec.title}</h3>
            <p>المادة: {lec.subject}</p>
            <a href={lec.fileUrl} target="_blank" rel="noopener noreferrer"
               className="text-blue-500 underline mt-2 inline-block">فتح المحاضرة</a>
          </div>
        ))}
      </div>
    </div>
  );
}
