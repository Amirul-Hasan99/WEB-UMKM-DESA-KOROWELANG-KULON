const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { z } = require("zod");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { Product, UMKM } = require("../db/models");

const createProductSchema = z.object({
  umkmId: z.string(),
  title: z.string().min(3),
  price: z.number().min(0),
  description: z.string().min(5),
  imageUrl: z.string(),
});

module.exports = function () {
  // POST /api/products (Admin Create Product)
  router.post("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
    try {
      const parsed = createProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      const { umkmId, title, price, description, imageUrl } = parsed.data;

      const umkmExists = await UMKM.findOne({ id: umkmId }).lean();
      if (!umkmExists) {
        return res.status(404).json({ error: "UMKM tidak ditemukan" });
      }

      const id = "prod-" + crypto.randomBytes(8).toString("hex");
      const newProduct = new Product({
        id,
        umkm_id: umkmId,
        title,
        price,
        description,
        image_url: imageUrl,
        created_at: new Date(),
      });

      await newProduct.save();

      return res.status(201).json({
        data: {
          id: newProduct.id,
          umkmId: newProduct.umkm_id,
          title: newProduct.title,
          price: newProduct.price,
          description: newProduct.description,
          imageUrl: newProduct.image_url,
          createdAt: newProduct.created_at,
        },
      });
    } catch (error) {
      console.error("[POST /api/products]", error);
      return res.status(500).json({ error: "Gagal menambahkan produk." });
    }
  });

  // DELETE /api/products/:id
  router.delete("/:id", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { id } = req.params;
      await Product.deleteOne({ id: id });
      return res.json({ success: true });
    } catch (error) {
      console.error("[DELETE /api/products/:id]", error);
      return res.status(500).json({ error: "Gagal menghapus produk." });
    }
  });

  return router;
};
