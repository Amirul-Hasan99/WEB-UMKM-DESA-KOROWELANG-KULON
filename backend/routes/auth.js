const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/auth");
const { verifyPassword } = require("../src/utils/password");
const validate = require("../src/middleware/validate");
const { loginSchema } = require("../src/validators/schemas");
const { User } = require("../db/models");

module.exports = function () {
  // POST /api/auth/login
  router.post("/login", validate(loginSchema), async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      if (!user) {
        return res.status(400).json({ error: "Email tidak terdaftar" });
      }

      const hashToVerify = user.password_hash || user.password;
      const isPasswordValid = await verifyPassword(hashToVerify, password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Kata sandi salah" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("FATAL: JWT_SECRET environment variable is not set!");
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
      const u = await User.findOne({ id: req.user.id }).lean();
      if (!u) {
        return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      }

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
