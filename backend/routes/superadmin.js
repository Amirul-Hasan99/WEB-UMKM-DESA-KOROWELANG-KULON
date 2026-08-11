const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { hashPassword } = require("../src/utils/password");
const validate = require("../src/middleware/validate");
const { adminSchema } = require("../src/validators/schemas");
const { User, SiteSetting } = require("../db/models");
const localDb = require("../db/local_db");

module.exports = function () {
  // GET /api/superadmin/admins
  router.get("/admins", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
    try {
      let admins = [];
      try {
        admins = await User.find().sort({ created_at: -1 }).lean();
      } catch (e) {
        admins = localDb.loadData().users;
      }

      return res.json({
        data: (admins || []).map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
        })),
      });
    } catch (error) {
      console.error("[GET /api/superadmin/admins]", error);
      return res.status(500).json({ error: "Gagal mengambil data admin." });
    }
  });

  // POST /api/superadmin/admins with Argon2 hashing
  router.post("/admins", authMiddleware, requireRole("SUPERADMIN"), validate(adminSchema), async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() }).lean();
      if (existing) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }

      const passwordHash = await hashPassword(password || "admin123");
      const id = "usr-" + crypto.randomBytes(8).toString("hex");

      const newUser = new User({
        id,
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: role ? role.toUpperCase() : "ADMIN",
        created_at: new Date(),
      });

      await newUser.save();

      return res.status(201).json({
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("[POST /api/superadmin/admins]", error);
      return res.status(500).json({ error: "Gagal membuat admin." });
    }
  });

  // DELETE /api/superadmin/admins (with self-delete guard)
  router.delete("/admins", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
    try {
      const id = req.query.id || req.body.id;
      if (!id) {
        return res.status(400).json({ error: "ID dibutuhkan" });
      }

      if (id === req.user.id) {
        return res.status(400).json({ error: "Anda tidak dapat menghapus akun Anda sendiri." });
      }

      await User.deleteOne({ id: id });
      return res.json({ success: true });
    } catch (error) {
      console.error("[DELETE /api/superadmin/admins]", error);
      return res.status(500).json({ error: "Gagal menghapus admin." });
    }
  });

  // GET /api/superadmin/settings
  router.get("/settings", async (req, res) => {
    try {
      let settings = [];
      try {
        settings = await SiteSetting.find().lean();
      } catch (e) {
        settings = localDb.loadData().site_settings;
      }

      const data = (settings || []).reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {});

      return res.json({ data });
    } catch (error) {
      console.error("[GET /api/superadmin/settings]", error);
      return res.status(500).json({ error: "Gagal mengambil pengaturan." });
    }
  });

  // PUT /api/superadmin/settings
  router.put("/settings", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
    try {
      const body = req.body;
      const entries = Object.entries(body);

      for (const [key, value] of entries) {
        const id = "st-" + crypto.randomBytes(6).toString("hex");
        await SiteSetting.findOneAndUpdate(
          { key: key },
          { id: id, key: key, value: String(value) },
          { upsert: true, new: true }
        );
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("[PUT /api/superadmin/settings]", error);
      return res.status(500).json({ error: "Gagal menyimpan pengaturan." });
    }
  });

  return router;
};
