const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { authMiddleware } = require("../middleware/auth");

const updateProfileSchema = z.object({
  name: z.string().min(3),
  profileImage: z.string().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
});

module.exports = function (sql) {
  // PUT /api/user/settings
  router.put("/settings", authMiddleware, async (req, res) => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const { name, profileImage, password } = parsed.data;

      // Build dynamic update
      const updates = ["name = ?"];
      const params = [name];

      if (profileImage && profileImage.trim() !== "") {
        updates.push("profile_image = ?");
        params.push(profileImage);
      }

      if (password && password.trim() !== "") {
        const newPasswordHash = await bcrypt.hash(password, 10);
        updates.push("password_hash = ?");
        params.push(newPasswordHash);
      }

      params.push(req.user.id);

      await sql.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        params
      );

      const updated = await sql.query(
        `SELECT id, name, email, profile_image AS profileImage, role FROM users WHERE id = ?`,
        [req.user.id]
      );

      if (!updated || updated.length === 0) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }

      return res.json({ success: true, user: updated[0] });
    } catch (error) {
      console.error("[PUT /api/user/settings]", error);
      return res.status(500).json({ error: "Gagal memperbarui profil." });
    }
  });

  return router;
};
