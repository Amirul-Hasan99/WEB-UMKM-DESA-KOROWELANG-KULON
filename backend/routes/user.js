const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { authMiddleware } = require("../middleware/auth");
const { User } = require("../db/models");
const localDb = require("../db/local_db");

const updateProfileSchema = z.object({
  name: z.string().min(3),
  profileImage: z.string().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
});

module.exports = function () {
  // PUT /api/user/settings
  router.put("/settings", authMiddleware, async (req, res) => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const { name, profileImage, password } = parsed.data;

      const updateData = { name };
      if (profileImage && profileImage.trim() !== "") {
        updateData.profile_image = profileImage;
      }
      if (password && password.trim() !== "") {
        updateData.password_hash = await bcrypt.hash(password, 10);
      }

      let updatedUser = null;
      try {
        updatedUser = await User.findOneAndUpdate(
          { id: req.user.id },
          updateData,
          { new: true }
        ).lean();
      } catch (e) {
        const ld = localDb.loadData();
        const user = ld.users.find((u) => u.id === req.user.id);
        if (user) {
          user.name = name;
          if (profileImage) user.profile_image = profileImage;
          if (password) user.password_hash = bcrypt.hashSync(password, 10);
          localDb.saveData(ld);
          updatedUser = user;
        }
      }

      if (!updatedUser) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }

      return res.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedUser.profile_image,
          role: updatedUser.role,
        },
      });
    } catch (error) {
      console.error("[PUT /api/user/settings]", error);
      return res.status(500).json({ error: "Gagal memperbarui profil." });
    }
  });

  return router;
};
