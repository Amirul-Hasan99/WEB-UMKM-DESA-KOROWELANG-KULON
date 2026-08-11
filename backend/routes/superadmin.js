const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { hashPassword } = require("../src/utils/password");
const validate = require("../src/middleware/validate");
const { adminSchema } = require("../src/validators/schemas");

module.exports = function (sql) {
  // GET /api/superadmin/admins
  router.get("/admins", authMiddleware, requireRole("SUPERADMIN"), async (req, res) => {
    try {
      const admins = await sql.query(
        `SELECT id, name, email, role, created_at AS createdAt
         FROM users
         ORDER BY created_at DESC`
      );
      return res.json({ data: admins || [] });
    } catch (error) {
      console.error("[GET /api/superadmin/admins]", error);
      return res.status(500).json({ error: "Gagal mengambil data admin." });
    }
  });

  // POST /api/superadmin/admins with Argon2 hashing
  router.post("/admins", authMiddleware, requireRole("SUPERADMIN"), validate(adminSchema), async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const existing = await sql.query("SELECT id FROM users WHERE email = ?", [email]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }

      const passwordHash = await hashPassword(password || "admin123");
      const id = "usr-" + crypto.randomBytes(8).toString("hex");

      await sql.query(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        [id, name, email, passwordHash, role ? role.toUpperCase() : "ADMIN"]
      );

      const inserted = await sql.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [id]
      );

      return res.status(201).json({ data: inserted[0] });
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

      // Guard: prevent superadmin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({ error: "Anda tidak dapat menghapus akun Anda sendiri." });
      }

      await sql.query("DELETE FROM users WHERE id = ?", [id]);
      return res.json({ success: true });
    } catch (error) {
      console.error("[DELETE /api/superadmin/admins]", error);
      return res.status(500).json({ error: "Gagal menghapus admin." });
    }
  });

  // GET /api/superadmin/settings
  router.get("/settings", async (req, res) => {
    try {
      const settings = await sql.query("SELECT `key`, value FROM site_settings");
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
        // MySQL INSERT ... ON DUPLICATE KEY UPDATE
        await sql.query(
          "INSERT INTO site_settings (id, `key`, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?",
          [id, key, String(value), String(value)]
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
