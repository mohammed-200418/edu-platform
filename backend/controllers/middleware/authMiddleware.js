import jwt from "jsonwebtoken";
import User from "../../models/User.js";

// ✅ التحقق من التوكن وصلاحيات المستخدم
export const protect = async (req, res, next) => {
  let token;

  // تحقق من وجود التوكن بالهيدر
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // فك التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // جلب المستخدم بدون الباسوورد
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "توكن غير صالح أو منتهي" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "غير مصرح، لا يوجد توكن" });
  }
};

// ✅ التحقق من كون المستخدم أدمن فقط
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "صلاحيات غير كافية (أدمن فقط)" });
  }
};
