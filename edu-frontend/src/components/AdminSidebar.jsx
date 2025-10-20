import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  const links = [
    { name: "إدارة الحسابات", path: "/admin/accounts" },
    { name: "الرد على الأسئلة", path: "/admin/questions" },
    { name: "رفع المحاضرات", path: "/admin/lectures" },
    { name: "تحديد المواد لكل مرحلة", path: "/admin/stages" }
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6">لوحة الأدمن</h2>
      {links.map(link => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `mb-2 p-2 rounded hover:bg-gray-700 ${isActive ? "bg-gray-600 font-bold" : ""}`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  );
}
