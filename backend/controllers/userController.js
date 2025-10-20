import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    user.role = req.body.role; // "student" أو "admin"
    await user.save();
    res.json({ message: "تم تغيير الدور", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
