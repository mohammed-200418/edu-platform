// backend/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../controllers/middleware/authMiddleware.js";

const router = express.Router();

// 🟢 جلب كل المستخدمين - محمي للأدمن فقط
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // بدون الباسوورد
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 تغيير الدور - محمي للأدمن فقط
router.put("/change-role/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const { role } = req.body;
    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ message: "الدور غير صالح" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "تم تغيير الدور بنجاح", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 حذف مستخدم - محمي للأدمن فقط
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    await user.remove();
    res.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
