const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { authMiddleware, requireRole } = require("../middleware/auth");
const { Category, UMKM } = require("../db/models");
const localDb = require("../db/local_db");

module.exports = function () {
  // GET /api/categories
  router.get("/", async (req, res) => {
    try {
      let categories = [];
      try {
        categories = await Category.find().sort({ name: 1 }).lean();
      } catch (e) {
        categories = localDb.loadData().categories;
      }

      const data = await Promise.all(
        (categories || []).map(async (c) => {
          let count = 0;
          try {
            count = await UMKM.countDocuments({ category_id: c.id, is_verified: true });
          } catch (e) {
            count = (localDb.loadData().umkms || []).filter((u) => u.category_id === c.id && u.is_verified).length;
          }

          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            iconName: c.icon_name,
            _count: { umkms: count },
          };
        })
      );

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
      const newCat = new Category({
        id,
        name,
        slug,
        icon_name: iconName,
      });

      await newCat.save();

      return res.status(201).json({
        data: {
          id: newCat.id,
          name: newCat.name,
          slug: newCat.slug,
          iconName: newCat.icon_name,
        },
      });
    } catch (error) {
      console.error("[POST /api/categories]", error);
      return res.status(500).json({ error: "Gagal membuat kategori baru." });
    }
  });

  return router;
};
