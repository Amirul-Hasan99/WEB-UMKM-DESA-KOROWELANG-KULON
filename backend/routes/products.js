const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { z } = require("zod");
const { authMiddleware, requireRole } = require("../middleware/auth");

const createProductSchema = z.object({
  umkmId: z.string(),
  title: z.string().min(3),
  price: z.number().min(0),
  description: z.string().min(5),
  imageUrl: z.string(),
});

module.exports = function (sql) {
  // POST /api/products (Admin Create Product)
  router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const { umkmId, title, price, description, imageUrl } = parsed.data;

      const umkms = await sql.query("SELECT id FROM umkms WHERE id = ?", [umkmId]);
      if (!umkms || umkms.length === 0) {
        return res.status(404).json({ error: "UMKM tidak ditemukan" });
      }

      const id = "prod-" + crypto.randomBytes(8).toString("hex");
      await sql.query(
        "INSERT INTO products (id, umkm_id, title, price, description, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [id, umkmId, title, price, description, imageUrl]
      );

      const inserted = await sql.query(
        `SELECT id, umkm_id AS umkmId, title, price, description, image_url AS imageUrl, created_at AS createdAt
         FROM products WHERE id = ?`,
        [id]
      );

      return res.status(201).json({ data: inserted[0] });
    } catch (error) {
      console.error("[POST /api/products]", error);
      return res.status(500).json({ error: "Gagal menambahkan produk." });
    }
  });

  // DELETE /api/products/:id
  router.delete("/:id", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { id } = req.params;
      const products = await sql.query("SELECT id FROM products WHERE id = ?", [id]);
      if (!products || products.length === 0) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      await sql.query("DELETE FROM products WHERE id = ?", [id]);
      return res.json({ success: true });
    } catch (error) {
      console.error("[DELETE /api/products/:id]", error);
      return res.status(500).json({ error: "Gagal menghapus produk." });
    }
  });

  return router;
};
