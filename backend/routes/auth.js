const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/auth");
const { verifyPassword } = require("../src/utils/password");
const validate = require("../src/middleware/validate");
const { loginSchema } = require("../src/validators/schemas");

module.exports = function (sql) {
  // POST /api/auth/login with Zod validation and Argon2 verifyPassword
  router.post("/login", validate(loginSchema), async (req, res) => {
    try {
      const { email, password } = req.body;

      const users = await sql.query(
        "SELECT id, name, email, password_hash, profile_image, role FROM users WHERE email = ?",
        [email]
      );
      if (!users || users.length === 0) {
        return res.status(400).json({ error: "Email tidak terdaftar" });
      }

      const user = users[0];
      const hashToVerify = user.password_hash;
      const isPasswordValid = await verifyPassword(hashToVerify, password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Kata sandi salah" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("FATAL: JWT_SECRET is not set!");
        return res.status(500).json({ error: "Konfigurasi server error." });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        secret,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profile_image,
        },
      });
    } catch (error) {
      console.error("[POST /api/auth/login]", error);
      return res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
  });

  // GET /api/auth/me
  router.get("/me", authMiddleware, async (req, res) => {
    try {
      const users = await sql.query(
        "SELECT id, name, email, profile_image, role, created_at FROM users WHERE id = ?",
        [req.user.id]
      );
      if (!users || users.length === 0) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }

      const u = users[0];
      return res.json({
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          profileImage: u.profile_image,
          role: u.role,
          createdAt: u.created_at,
        },
      });
    } catch (error) {
      console.error("[GET /api/auth/me]", error);
      return res.status(500).json({ error: "Gagal mengambil data pengguna" });
    }
  });

  return router;
};
