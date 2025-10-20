import User from "../models/User.js";
import jwt from "jsonwebtoken";

// توليد Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// تسجيل مستخدم جديد
export const registerUser = async (req, res) => {
  const { name, email, password, department, stage } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "المستخدم موجود مسبقًا" });
    }

    const user = await User.create({ name, email, password, department, stage });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        stage: user.stage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "بيانات المستخدم غير صحيحة" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تسجيل الدخول
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        stage: user.stage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "البريد أو كلمة المرور غير صحيحة" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
