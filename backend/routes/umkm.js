const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const slugify = require("slugify");
const { authMiddleware, requireRole } = require("../middleware/auth");
const validate = require("../src/middleware/validate");
const { umkmSchema, reviewSchema } = require("../src/validators/schemas");
const { UMKM, Category, Product, Review, User } = require("../db/models");
const localDb = require("../db/local_db");

module.exports = function () {
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

      let categoryIdFilter = null;
      if (categorySlug) {
        const catObj = await Category.findOne({ slug: categorySlug }).lean();
        if (catObj) categoryIdFilter = catObj.id;
      }

      // Build Mongoose filter
      const filter = { is_verified: true };
      if (categoryIdFilter) filter.category_id = categoryIdFilter;
      if (dusun) filter.dusun = dusun;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      let umkmDocs = [];
      try {
        umkmDocs = await UMKM.find(filter).sort({ created_at: -1 }).lean();
      } catch (e) {
        // Fallback to localDb
        umkmDocs = localDb.loadData().umkms.filter((u) => u.is_verified);
      }

      const allCategories = await Category.find().lean().catch(() => localDb.loadData().categories);
      const catMap = new Map(allCategories.map((c) => [c.id, c]));

      // Populate products & categories for each UMKM
      const formattedItems = await Promise.all(
        umkmDocs.map(async (row) => {
          let products = [];
          try {
            products = await Product.find({ umkm_id: row.id }).sort({ created_at: -1 }).lean();
          } catch (e) {
            products = (localDb.loadData().products || []).filter((p) => p.umkm_id === row.id);
          }

          const cat = catMap.get(row.category_id);

          return {
            id: row.id,
            userId: row.user_id,
            categoryId: row.category_id,
            name: row.name,
            slug: row.slug,
            ownerName: row.owner_name,
            description: row.description,
            address: row.address,
            dusun: row.dusun,
            operationalHours: row.operational_hours,
            whatsappNumber: row.whatsapp_number,
            mapsUrl: row.maps_url,
            instagramUrl: row.instagram_url,
            imageUrl: row.image_url,
            isVerified: Boolean(row.is_verified),
            certifications: row.certifications || [],
            latitude: row.latitude,
            longitude: row.longitude,
            rating: row.rating ? String(row.rating) : "0.00",
            reviewCount: row.review_count || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            category: cat ? {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              iconName: cat.icon_name,
            } : null,
            products: (products || []).map(p => ({
              id: p.id,
              title: p.title,
              price: p.price,
              description: p.description,
              imageUrl: p.image_url,
              createdAt: p.created_at,
            })),
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
        },
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
      let row = null;
      try {
        row = await UMKM.findOne({ $or: [{ slug: slug }, { id: slug }] }).lean();
      } catch (e) {
        const local = localDb.loadData().umkms;
        row = local.find((u) => u.slug === slug || u.id === slug) || null;
      }

      if (!row) {
        return res.status(404).json({ error: "UMKM tidak ditemukan." });
      }

      let products = [];
      let reviewsList = [];
      let cat = null;

      try {
        products = await Product.find({ umkm_id: row.id }).sort({ created_at: -1 }).lean();
        reviewsList = await Review.find({ umkm_id: row.id }).sort({ created_at: -1 }).lean();
        cat = await Category.findOne({ id: row.category_id }).lean();
      } catch (e) {
        const ld = localDb.loadData();
        products = (ld.products || []).filter((p) => p.umkm_id === row.id);
        reviewsList = (ld.reviews || []).filter((r) => r.umkm_id === row.id);
        cat = (ld.categories || []).find((c) => c.id === row.category_id) || null;
      }

      const data = {
        id: row.id,
        userId: row.user_id,
        categoryId: row.category_id,
        name: row.name,
        slug: row.slug,
        ownerName: row.owner_name,
        description: row.description,
        address: row.address,
        dusun: row.dusun,
        operationalHours: row.operational_hours,
        whatsappNumber: row.whatsapp_number,
        mapsUrl: row.maps_url,
        instagramUrl: row.instagram_url,
        imageUrl: row.image_url,
        isVerified: Boolean(row.is_verified),
        certifications: row.certifications || [],
        latitude: row.latitude,
        longitude: row.longitude,
        rating: row.rating ? String(row.rating) : "0.00",
        reviewCount: row.review_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        category: cat ? {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          iconName: cat.icon_name,
        } : null,
        products: (products || []).map(p => ({
          id: p.id,
          umkmId: p.umkm_id,
          title: p.title,
          price: p.price,
          description: p.description,
          imageUrl: p.image_url,
          createdAt: p.created_at,
        })),
        reviews: (reviewsList || []).map(r => ({
          id: r.id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at,
        })),
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
        const existing = await UMKM.findOne({ slug: generatedSlug }).lean();
        if (!existing) break;
        generatedSlug = `${baseSlug}-${suffix++}`;
      }

      const id = "umkm-" + crypto.randomBytes(8).toString("hex");
      let userId = req.user.id;

      const newUmkm = new UMKM({
        id,
        user_id: userId,
        category_id: data.categoryId,
        name: data.name,
        slug: generatedSlug,
        owner_name: data.ownerName,
        description: data.description || "",
        address: data.address,
        dusun: data.dusun,
        operational_hours: data.operationalHours || null,
        whatsapp_number: data.whatsappNumber || "",
        maps_url: data.mapsUrl || null,
        instagram_url: data.instagramUrl || null,
        image_url: data.imageUrl || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        is_verified: true,
        certifications: data.certifications || [],
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await newUmkm.save();
      return res.status(201).json({ data: newUmkm.toObject() });
    } catch (error) {
      console.error("[POST /api/umkm]", error);
      return res.status(500).json({ error: "Gagal membuat UMKM baru." });
    }
  });

  // PUT /api/umkm/:slug (Admin Edit UMKM)
  router.put("/:slug", authMiddleware, async (req, res) => {
    try {
      const { slug } = req.params;
      const body = req.body;

      const existing = await UMKM.findOne({ $or: [{ slug: slug }, { id: slug }] });
      if (!existing) {
        return res.status(404).json({ error: "UMKM tidak ditemukan." });
      }

      if (body.name !== undefined) existing.name = body.name;
      if (body.ownerName !== undefined) existing.owner_name = body.ownerName;
      if (body.description !== undefined) existing.description = body.description;
      if (body.address !== undefined) existing.address = body.address;
      if (body.dusun !== undefined) existing.dusun = body.dusun;
      if (body.operationalHours !== undefined) existing.operational_hours = body.operationalHours || null;
      if (body.whatsappNumber !== undefined) existing.whatsapp_number = body.whatsappNumber;
      if (body.mapsUrl !== undefined) existing.maps_url = body.mapsUrl || null;
      if (body.instagramUrl !== undefined) existing.instagram_url = body.instagramUrl || null;
      if (body.imageUrl !== undefined) existing.image_url = body.imageUrl;
      if (body.categoryId !== undefined) existing.category_id = body.categoryId;
      if (body.isVerified !== undefined) existing.is_verified = Boolean(body.isVerified);
      if (body.certifications !== undefined) existing.certifications = body.certifications;
      if (body.latitude !== undefined) existing.latitude = body.latitude || null;
      if (body.longitude !== undefined) existing.longitude = body.longitude || null;

      existing.updated_at = new Date();
      await existing.save();

      return res.json({ data: existing.toObject() });
    } catch (error) {
      console.error("[PUT /api/umkm/:slug]", error);
      return res.status(500).json({ error: "Gagal memperbarui UMKM." });
    }
  });

  // DELETE /api/umkm/:slug
  router.delete("/:slug", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { slug } = req.params;
      const target = await UMKM.findOne({ $or: [{ slug: slug }, { id: slug }] });
      if (target) {
        await Product.deleteMany({ umkm_id: target.id });
        await Review.deleteMany({ umkm_id: target.id });
        await UMKM.deleteOne({ _id: target._id });
      }
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
      const newReview = new Review({
        id: reviewId,
        umkm_id: id,
        name,
        rating: Number(rating),
        comment,
        created_at: new Date(),
      });
      await newReview.save();

      // Recalculate average rating
      const reviews = await Review.find({ umkm_id: id }).lean();
      const count = reviews.length;
      const sum = reviews.reduce((acc, cur) => acc + Number(cur.rating), 0);
      const avgRating = parseFloat((sum / (count || 1)).toFixed(2));

      await UMKM.updateOne(
        { $or: [{ id: id }, { slug: id }] },
        { rating: avgRating, review_count: count }
      );

      return res.status(201).json({
        success: true,
        message: "Ulasan berhasil dikirim. Terima kasih atas masukan Anda!",
        data: newReview.toObject(),
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
      const reviews = await Review.find({ umkm_id: id }).sort({ created_at: -1 }).lean();
      return res.json({
        data: (reviews || []).map(r => ({
          id: r.id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at,
        })),
      });
    } catch (error) {
      console.error("[GET /api/umkm/:id/reviews]", error);
      return res.status(500).json({ error: "Gagal mengambil ulasan." });
    }
  });

  return router;
};
