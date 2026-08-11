const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const slugify = require("slugify");
const { authMiddleware, requireRole } = require("../middleware/auth");
const validate = require("../src/middleware/validate");
const { umkmSchema, reviewSchema } = require("../src/validators/schemas");

module.exports = function (sql) {
  // GET /api/umkm (Public Catalog with search, category, dusun, price filter, pagination)
  router.get("/", async (req, res) => {
    try {
      const search = (req.query.search || "").trim();
      const categorySlug = req.query.category || null;
      const dusun = req.query.dusun || null;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "6", 10)));
      const offset = (page - 1) * limit;

      // Build dynamic query
      let whereConditions = ["u.is_verified = 1"];
      const params = [];

      if (categorySlug) {
        whereConditions.push("c.slug = ?");
        params.push(categorySlug);
      }
      if (dusun) {
        whereConditions.push("u.dusun = ?");
        params.push(dusun);
      }
      if (search) {
        whereConditions.push("(u.name LIKE ? OR u.description LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

      const items = await sql.query(
        `SELECT 
          u.id, u.user_id AS userId, u.category_id AS categoryId,
          u.name, u.slug, u.owner_name AS ownerName, u.description,
          u.address, u.dusun, u.operational_hours AS operationalHours,
          u.whatsapp_number AS whatsappNumber, u.maps_url AS mapsUrl,
          u.instagram_url AS instagramUrl, u.image_url AS imageUrl,
          u.is_verified AS isVerified, u.certifications, u.latitude, u.longitude,
          u.rating, u.review_count AS reviewCount,
          u.created_at AS createdAt, u.updated_at AS updatedAt,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.icon_name AS cat_icon
        FROM umkms u
        LEFT JOIN categories c ON u.category_id = c.id
        ${whereClause}
        ORDER BY u.created_at DESC`,
        params
      );

      // Fetch products for each UMKM and format
      const formattedItems = await Promise.all(
        (items || []).map(async (row) => {
          const products = await sql.query(
            `SELECT id, title, price, description, image_url AS imageUrl, created_at AS createdAt
             FROM products WHERE umkm_id = ? ORDER BY created_at DESC`,
            [row.id]
          );

          // Parse certifications if it's a string
          let certs = row.certifications || [];
          if (typeof certs === "string") {
            try { certs = JSON.parse(certs); } catch (e) { certs = []; }
          }

          return {
            id: row.id,
            userId: row.userId,
            categoryId: row.categoryId,
            name: row.name,
            slug: row.slug,
            ownerName: row.ownerName,
            description: row.description,
            address: row.address,
            dusun: row.dusun,
            operationalHours: row.operationalHours,
            whatsappNumber: row.whatsappNumber,
            mapsUrl: row.mapsUrl,
            instagramUrl: row.instagramUrl,
            imageUrl: row.imageUrl,
            isVerified: Boolean(row.isVerified),
            certifications: certs,
            latitude: row.latitude,
            longitude: row.longitude,
            rating: row.rating || "0.00",
            reviewCount: row.reviewCount || 0,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            category: row.cat_id ? {
              id: row.cat_id,
              name: row.cat_name,
              slug: row.cat_slug,
              iconName: row.cat_icon
            } : null,
            products: products || []
          };
        })
      );

      // Price Filtering logic
      let filtered = formattedItems;
      if (minPrice !== null || maxPrice !== null) {
        filtered = formattedItems.filter((u) => {
          if (!u.products || u.products.length === 0) return true;
          return u.products.some((p) => {
            const price = parseFloat(p.price);
            if (minPrice !== null && price < minPrice) return false;
            if (maxPrice !== null && price > maxPrice) return false;
            return true;
          });
        });
      }

      const total = filtered.length;
      const paginatedItems = filtered.slice(offset, offset + limit);

      return res.json({
        data: paginatedItems,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        }
      });
    } catch (error) {
      console.error("[GET /api/umkm]", error);
      return res.status(500).json({ error: "Gagal mengambil data UMKM." });
    }
  });

  // GET /api/umkm/:slug (Detail UMKM)
  router.get("/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const rows = await sql.query(
        `SELECT 
          u.id, u.user_id AS userId, u.category_id AS categoryId,
          u.name, u.slug, u.owner_name AS ownerName, u.description,
          u.address, u.dusun, u.operational_hours AS operationalHours,
          u.whatsapp_number AS whatsappNumber, u.maps_url AS mapsUrl,
          u.instagram_url AS instagramUrl, u.image_url AS imageUrl,
          u.is_verified AS isVerified, u.certifications, u.latitude, u.longitude,
          u.rating, u.review_count AS reviewCount,
          u.created_at AS createdAt, u.updated_at AS updatedAt,
          c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug, c.icon_name AS cat_icon
        FROM umkms u
        LEFT JOIN categories c ON u.category_id = c.id
        WHERE u.slug = ? OR u.id = ?`,
        [slug, slug]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "UMKM tidak ditemukan." });
      }

      const row = rows[0];
      const products = await sql.query(
        `SELECT id, umkm_id AS umkmId, title, price, description, image_url AS imageUrl, created_at AS createdAt
         FROM products WHERE umkm_id = ? ORDER BY created_at DESC`,
        [row.id]
      );

      const reviewsList = await sql.query(
        `SELECT id, name, rating, comment, created_at AS createdAt
         FROM reviews WHERE umkm_id = ? ORDER BY created_at DESC`,
        [row.id]
      );

      // Parse certifications
      let certs = row.certifications || [];
      if (typeof certs === "string") {
        try { certs = JSON.parse(certs); } catch (e) { certs = []; }
      }

      const data = {
        id: row.id,
        userId: row.userId,
        categoryId: row.categoryId,
        name: row.name,
        slug: row.slug,
        ownerName: row.ownerName,
        description: row.description,
        address: row.address,
        dusun: row.dusun,
        operationalHours: row.operationalHours,
        whatsappNumber: row.whatsappNumber,
        mapsUrl: row.mapsUrl,
        instagramUrl: row.instagramUrl,
        imageUrl: row.imageUrl,
        isVerified: Boolean(row.isVerified),
        certifications: certs,
        latitude: row.latitude,
        longitude: row.longitude,
        rating: row.rating || "0.00",
        reviewCount: row.reviewCount || 0,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        category: row.cat_id ? {
          id: row.cat_id,
          name: row.cat_name,
          slug: row.cat_slug,
          iconName: row.cat_icon
        } : null,
        products: products || [],
        reviews: reviewsList || [],
      };

      return res.json({ data });
    } catch (error) {
      console.error("[GET /api/umkm/:slug]", error);
      return res.status(500).json({ error: "Gagal mengambil detail UMKM." });
    }
  });

  // POST /api/umkm (Admin Create UMKM)
  router.post("/", authMiddleware, requireRole("ADMIN"), validate(umkmSchema), async (req, res) => {
    try {
      const data = req.body;
      const baseSlug = slugify(data.name, { lower: true, strict: true }) || "umkm";

      let generatedSlug = baseSlug;
      let suffix = 1;
      while (true) {
        const existing = await sql.query("SELECT id FROM umkms WHERE slug = ?", [generatedSlug]);
        if (!existing || existing.length === 0) break;
        generatedSlug = `${baseSlug}-${suffix++}`;
      }

      const id = "umkm-" + crypto.randomBytes(8).toString("hex");
      let userId = req.user.id;
      const userCheck = await sql.query("SELECT id FROM users WHERE id = ?", [userId]);
      if (!userCheck || userCheck.length === 0) {
        const fallbackUser = await sql.query("SELECT id FROM users LIMIT 1");
        userId = fallbackUser && fallbackUser.length > 0 ? fallbackUser[0].id : null;
      }

      let categoryId = data.categoryId;
      const catCheck = await sql.query("SELECT id FROM categories WHERE id = ?", [categoryId]);
      if (!catCheck || catCheck.length === 0) {
        const fallbackCat = await sql.query("SELECT id FROM categories LIMIT 1");
        categoryId = fallbackCat && fallbackCat.length > 0 ? fallbackCat[0].id : null;
      }

      const certsJson = JSON.stringify(data.certifications || []);

      await sql.query(
        `INSERT INTO umkms (
          id, user_id, category_id, name, slug, owner_name, description, address, dusun,
          operational_hours, whatsapp_number, maps_url, instagram_url, image_url, is_verified,
          certifications, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [
          id, userId, categoryId, data.name, generatedSlug, data.ownerName,
          data.description || "", data.address, data.dusun, data.operationalHours || null,
          data.whatsappNumber || "", data.mapsUrl || null, data.instagramUrl || null,
          data.imageUrl || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
          certsJson, data.latitude || null, data.longitude || null
        ]
      );

      // Fetch the inserted row
      const inserted = await sql.query("SELECT * FROM umkms WHERE id = ?", [id]);
      return res.status(201).json({ data: inserted[0] });
    } catch (error) {
      console.error("[POST /api/umkm]", error);
      return res.status(500).json({ error: "Gagal membuat UMKM baru." });
    }
  });

  // PUT /api/umkm/:slug (Admin Edit UMKM)
  router.put("/:slug", authMiddleware, async (req, res) => {
    try {
      const { slug } = req.params;
      const existing = await sql.query("SELECT id FROM umkms WHERE slug = ? OR id = ?", [slug, slug]);
      if (!existing || existing.length === 0) {
        return res.status(404).json({ error: "UMKM tidak ditemukan." });
      }

      const umkmId = existing[0].id;
      const body = req.body;

      // Build dynamic SET clause
      const updates = [];
      const params = [];

      if (body.name !== undefined) { updates.push("name = ?"); params.push(body.name); }
      if (body.ownerName !== undefined) { updates.push("owner_name = ?"); params.push(body.ownerName); }
      if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
      if (body.address !== undefined) { updates.push("address = ?"); params.push(body.address); }
      if (body.dusun !== undefined) { updates.push("dusun = ?"); params.push(body.dusun); }
      if (body.operationalHours !== undefined) { updates.push("operational_hours = ?"); params.push(body.operationalHours || null); }
      if (body.whatsappNumber !== undefined) { updates.push("whatsapp_number = ?"); params.push(body.whatsappNumber); }
      if (body.mapsUrl !== undefined) { updates.push("maps_url = ?"); params.push(body.mapsUrl || null); }
      if (body.instagramUrl !== undefined) { updates.push("instagram_url = ?"); params.push(body.instagramUrl || null); }
      if (body.imageUrl !== undefined) { updates.push("image_url = ?"); params.push(body.imageUrl); }
      if (body.categoryId !== undefined) { updates.push("category_id = ?"); params.push(body.categoryId); }
      if (body.isVerified !== undefined) { updates.push("is_verified = ?"); params.push(body.isVerified ? 1 : 0); }
      if (body.certifications !== undefined) { updates.push("certifications = ?"); params.push(JSON.stringify(body.certifications)); }
      if (body.latitude !== undefined) { updates.push("latitude = ?"); params.push(body.latitude || null); }
      if (body.longitude !== undefined) { updates.push("longitude = ?"); params.push(body.longitude || null); }

      if (updates.length === 0) {
        return res.json({ data: existing[0] });
      }

      updates.push("updated_at = NOW()");
      params.push(umkmId);

      await sql.query(
        `UPDATE umkms SET ${updates.join(", ")} WHERE id = ?`,
        params
      );

      const updated = await sql.query("SELECT * FROM umkms WHERE id = ?", [umkmId]);
      return res.json({ data: updated[0] });
    } catch (error) {
      console.error("[PUT /api/umkm/:slug]", error);
      return res.status(500).json({ error: "Gagal memperbarui UMKM." });
    }
  });

  // DELETE /api/umkm/:slug
  router.delete("/:slug", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { slug } = req.params;
      await sql.query("DELETE FROM umkms WHERE slug = ? OR id = ?", [slug, slug]);
      return res.json({ data: { success: true } });
    } catch (error) {
      console.error("[DELETE /api/umkm/:slug]", error);
      return res.status(500).json({ error: "Gagal menghapus UMKM." });
    }
  });

  // POST /api/umkm/:id/review (Ulasan & Rating Publik)
  router.post("/:id/review", validate(reviewSchema), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, rating, comment } = req.body;

      const reviewId = "rev-" + crypto.randomBytes(6).toString("hex");
      await sql.query(
        "INSERT INTO reviews (id, umkm_id, name, rating, comment) VALUES (?, ?, ?, ?, ?)",
        [reviewId, id, name, rating, comment]
      );

      const inserted = await sql.query("SELECT * FROM reviews WHERE id = ?", [reviewId]);

      // Update aggregate rating on umkm
      const reviews = await sql.query("SELECT rating FROM reviews WHERE umkm_id = ?", [id]);
      const count = reviews.length;
      const sum = reviews.reduce((acc, cur) => acc + Number(cur.rating), 0);
      const avgRating = (sum / (count || 1)).toFixed(2);

      await sql.query(
        "UPDATE umkms SET rating = ?, review_count = ? WHERE id = ? OR slug = ?",
        [avgRating, count, id, id]
      );

      return res.status(201).json({
        success: true,
        message: "Ulasan berhasil dikirim. Terima kasih atas masukan Anda!",
        data: inserted[0],
      });
    } catch (error) {
      console.error("[POST /api/umkm/:id/review]", error);
      return res.status(500).json({ error: "Gagal mengirim ulasan." });
    }
  });

  // GET /api/umkm/:id/reviews
  router.get("/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await sql.query(
        `SELECT id, name, rating, comment, created_at AS createdAt
         FROM reviews WHERE umkm_id = ?
         ORDER BY created_at DESC`,
        [id]
      );
      return res.json({ data: reviews || [] });
    } catch (error) {
      console.error("[GET /api/umkm/:id/reviews]", error);
      return res.status(500).json({ error: "Gagal mengambil ulasan." });
    }
  });

  return router;
};
