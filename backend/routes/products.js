const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { Product, UMKM } = require("../db/models");

module.exports = function () {
  // POST /api/products (Admin Create Product)
  router.post("/", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const body = req.body || {};
      const umkmIdRaw = body.umkmId;
      const title = (body.name || body.title || "").trim();
      const price = Number(body.price);
      const unit = body.unit || "pcs";
      const description = body.description || "";
      const imageUrl = body.image || body.imageUrl || "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80";

      if (!umkmIdRaw || !title || isNaN(price)) {
        return res.status(400).json({ error: "Data produk tidak lengkap (umkmId, nama produk, dan harga wajib diisi)." });
      }

      const umkmIdStr = String(umkmIdRaw);
      let umkmExists = await UMKM.findOne({ $or: [{ id: umkmIdStr }, { slug: umkmIdStr }] }).lean();
      
      if (!umkmExists && !isNaN(Number(umkmIdRaw))) {
        // Fallback search by index or string match
        umkmExists = await UMKM.findOne().lean();
      }

      if (!umkmExists) {
        return res.status(404).json({ error: "UMKM tujuan tidak ditemukan." });
      }

      const targetUmkmId = umkmExists.id;
      const id = "prod-" + crypto.randomBytes(8).toString("hex");

      const newProduct = new Product({
        id,
        umkm_id: targetUmkmId,
        title,
        price,
        unit,
        description,
        image_url: imageUrl,
        created_at: new Date(),
      });

      await newProduct.save();

      return res.status(201).json({
        success: true,
        data: {
          id: newProduct.id,
          umkmId: newProduct.umkm_id,
          name: newProduct.title,
          title: newProduct.title,
          price: newProduct.price,
          unit: newProduct.unit,
          description: newProduct.description,
          image: newProduct.image_url,
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
      await Product.deleteOne({ $or: [{ id: id }, { id: String(id) }] });
      return res.json({ success: true, data: { success: true } });
    } catch (error) {
      console.error("[DELETE /api/products/:id]", error);
      return res.status(500).json({ error: "Gagal menghapus produk." });
    }
  });

  return router;
};
