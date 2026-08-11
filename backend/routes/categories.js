const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { authMiddleware, requireRole } = require("../middleware/auth");

module.exports = function (sql) {
  // GET /api/categories
  router.get("/", async (req, res) => {
    try {
      const rows = await sql.query(
        `SELECT 
          c.id, c.name, c.slug, c.icon_name AS iconName,
          COUNT(u.id) AS umkm_count
        FROM categories c
        LEFT JOIN umkms u ON u.category_id = c.id
        GROUP BY c.id, c.name, c.slug, c.icon_name
        ORDER BY c.name ASC`
      );

      const data = (rows || []).map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        iconName: r.iconName,
        _count: { umkms: Number(r.umkm_count) || 0 }
      }));

      return res.json({ data });
    } catch (error) {
      console.error("[GET /api/categories]", error);
      return res.status(500).json({ error: "Gagal mengambil kategori." });
    }
  });

  // POST /api/categories
  router.post("/", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { name, slug, iconName } = req.body;
      if (!name || !slug || !iconName) {
        return res.status(400).json({ error: "Field name, slug, dan iconName wajib diisi." });
      }

      const id = "cat-" + crypto.randomBytes(6).toString("hex");
      await sql.query(
        "INSERT INTO categories (id, name, slug, icon_name) VALUES (?, ?, ?, ?)",
        [id, name, slug, iconName]
      );

      const inserted = await sql.query(
        "SELECT id, name, slug, icon_name AS iconName FROM categories WHERE id = ?",
        [id]
      );

      return res.status(201).json({ data: inserted[0] });
    } catch (error) {
      console.error("[POST /api/categories]", error);
      return res.status(500).json({ error: "Gagal membuat kategori baru." });
    }
  });

  return router;
};
