const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const slugify = require("slugify");
const { authMiddleware, requireRole } = require("../middleware/auth");
const validate = require("../src/middleware/validate");
const { umkmSchema, reviewSchema } = require("../src/validators/schemas");
const { UMKM, Category, Product, Review } = require("../db/models");

function formatUmkmItem(row, products = [], cat = null) {
  const categoryName = cat ? cat.name : "Kuliner";
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    owner: row.owner_name,
    ownerName: row.owner_name,
    category: categoryName,
    categoryDetails: cat ? {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconName: cat.icon_name,
    } : null,
    description: row.description || "",
    landingText: row.landing_text || row.description || "",
    address: row.address,
    dusun: row.dusun || "Desa Korowelang Kulon",
    operationalHours: row.operational_hours,
    phone: row.whatsapp_number || "",
    whatsapp: row.whatsapp_number || "",
    whatsappNumber: row.whatsapp_number || "",
    mapsUrl: row.maps_url || "",
    gmapsUrl: row.maps_url || "",
    gmapsEmbed: row.gmaps_embed || "",
    instagramUrl: row.instagram_url,
    imageUrl: row.image_url,
    profileImage: row.image_url,
    bannerImage: row.image_url,
    isVerified: Boolean(row.is_verified),
    certifications: row.certifications || [],
    latitude: row.latitude,
    longitude: row.longitude,
    rating: row.rating ? Number(row.rating) : 5.0,
    reviewCount: row.review_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    products: (products || []).map(p => ({
      id: p.id,
      umkmId: p.umkm_id,
      name: p.title,
      title: p.title,
      price: Number(p.price) || 0,
      unit: p.unit || "pcs",
      description: p.description || "",
      image: p.image_url,
      imageUrl: p.image_url,
      createdAt: p.created_at,
    })),
  };
}

module.exports = function () {
  // GET /api/umkm (Public & Admin Catalog)
  router.get("/", async (req, res) => {
    try {
      const search = (req.query.search || "").trim();
      const categoryParam = req.query.category || null;
      const dusun = req.query.dusun || null;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "50", 10)));
      const offset = (page - 1) * limit;

      const filter = {};
      if (req.query.all !== "true" && req.query.isAdmin !== "true") {
        filter.is_verified = true;
      }

      if (categoryParam && categoryParam !== "Semua") {
        const catObj = await Category.findOne({
          $or: [
            { slug: categoryParam },
            { name: new RegExp(`^${categoryParam}$`, "i") },
            { id: categoryParam }
          ]
        }).lean();
        if (catObj) filter.category_id = catObj.id;
      }

      if (dusun) filter.dusun = dusun;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { owner_name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const umkmDocs = await UMKM.find(filter).sort({ created_at: -1 }).lean();
      const allCategories = await Category.find().lean();
      const catMap = new Map(allCategories.map((c) => [c.id, c]));

      const formattedItems = await Promise.all(
        umkmDocs.map(async (row) => {
          const products = await Product.find({ umkm_id: row.id }).sort({ created_at: -1 }).lean();
          const cat = catMap.get(row.category_id);
          return formatUmkmItem(row, products, cat);
        })
      );

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
        success: true,
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
      const row = await UMKM.findOne({ $or: [{ slug: slug }, { id: slug }] }).lean();

      if (!row) {
        return res.status(404).json({ error: "UMKM tidak ditemukan." });
      }

      const products = await Product.find({ umkm_id: row.id }).sort({ created_at: -1 }).lean();
      const reviewsList = await Review.find({ umkm_id: row.id }).sort({ created_at: -1 }).lean();
      const cat = await Category.findOne({ id: row.category_id }).lean();

      const formattedData = formatUmkmItem(row, products, cat);
      formattedData.reviews = (reviewsList || []).map(r => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
      }));

      return res.json({ success: true, data: formattedData });
    } catch (error) {
      console.error("[GET /api/umkm/:slug]", error);
      return res.status(500).json({ error: "Gagal mengambil detail UMKM." });
    }
  });

  // POST /api/umkm (Admin Create UMKM)
  router.post("/", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), validate(umkmSchema), async (req, res) => {
    try {
      const data = req.body;
      const baseSlug = slugify(data.name || "umkm", { lower: true, strict: true }) || "umkm";

      let generatedSlug = baseSlug;
      let suffix = 1;
      while (true) {
        const existing = await UMKM.findOne({ slug: generatedSlug }).lean();
        if (!existing) break;
        generatedSlug = `${baseSlug}-${suffix++}`;
      }

      const categoryName = data.category || "Kuliner";
      let categoryId = data.categoryId;

      if (!categoryId && categoryName) {
        const existingCat = await Category.findOne({
          $or: [
            { name: new RegExp(`^${categoryName}$`, "i") },
            { slug: slugify(categoryName, { lower: true }) },
            { id: categoryName }
          ]
        }).lean();

        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const newCatId = "cat-" + crypto.randomBytes(4).toString("hex");
          const newCat = new Category({
            id: newCatId,
            name: categoryName,
            slug: slugify(categoryName, { lower: true }) || newCatId,
            icon_name: "Store",
          });
          await newCat.save();
          categoryId = newCatId;
        }
      }

      const id = "umkm-" + crypto.randomBytes(8).toString("hex");

      const newUmkm = new UMKM({
        id,
        user_id: req.user ? req.user.id : "admin",
        category_id: categoryId || "cat-1",
        name: data.name,
        slug: generatedSlug,
        owner_name: data.owner || data.ownerName || "Pemilik UMKM",
        description: data.description || "",
        landing_text: data.landingText || data.description || "",
        address: data.address,
        dusun: data.dusun || "Desa Korowelang Kulon",
        operational_hours: data.operationalHours || null,
        whatsapp_number: data.whatsapp || data.whatsappNumber || data.phone || "",
        maps_url: data.gmapsUrl || data.mapsUrl || null,
        gmaps_embed: data.gmapsEmbed || null,
        instagram_url: data.instagramUrl || null,
        image_url: data.profileImage || data.imageUrl || "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        is_verified: true,
        certifications: data.certifications || [],
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await newUmkm.save();
      const cat = await Category.findOne({ id: newUmkm.category_id }).lean();
      const formatted = formatUmkmItem(newUmkm.toObject(), [], cat);

      return res.status(201).json({ success: true, data: formatted });
    } catch (error) {
      console.error("[POST /api/umkm]", error);
      return res.status(500).json({ error: "Gagal membuat UMKM baru." });
    }
  });

  // PUT /api/umkm/:slug (Admin Edit UMKM)
  router.put("/:slug", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { slug } = req.params;
      const body = req.body;

      const existing = await UMKM.findOne({ $or: [{ slug: slug }, { id: slug }] });
      if (!existing) {
        return res.status(404).json({ error: "UMKM tidak ditemukan." });
      }

      if (body.name !== undefined) existing.name = body.name;
      if (body.owner !== undefined || body.ownerName !== undefined) {
        existing.owner_name = body.owner || body.ownerName;
      }
      if (body.description !== undefined) existing.description = body.description;
      if (body.landingText !== undefined) existing.landing_text = body.landingText;
      if (body.address !== undefined) existing.address = body.address;
      if (body.dusun !== undefined) existing.dusun = body.dusun;
      if (body.operationalHours !== undefined) existing.operational_hours = body.operationalHours || null;
      if (body.whatsapp !== undefined || body.whatsappNumber !== undefined || body.phone !== undefined) {
        existing.whatsapp_number = body.whatsapp || body.whatsappNumber || body.phone;
      }
      if (body.gmapsUrl !== undefined || body.mapsUrl !== undefined) {
        existing.maps_url = body.gmapsUrl || body.mapsUrl || null;
      }
      if (body.gmapsEmbed !== undefined) existing.gmaps_embed = body.gmapsEmbed || null;
      if (body.instagramUrl !== undefined) existing.instagram_url = body.instagramUrl || null;
      if (body.profileImage !== undefined || body.imageUrl !== undefined) {
        existing.image_url = body.profileImage || body.imageUrl;
      }

      if (body.category || body.categoryId) {
        const categoryName = body.category;
        let categoryId = body.categoryId;
        if (!categoryId && categoryName) {
          const existingCat = await Category.findOne({
            $or: [
              { name: new RegExp(`^${categoryName}$`, "i") },
              { slug: slugify(categoryName, { lower: true }) },
              { id: categoryName }
            ]
          }).lean();
          if (existingCat) categoryId = existingCat.id;
        }
        if (categoryId) existing.category_id = categoryId;
      }

      if (body.isVerified !== undefined) existing.is_verified = Boolean(body.isVerified);
      if (body.certifications !== undefined) existing.certifications = body.certifications;
      if (body.latitude !== undefined) existing.latitude = body.latitude || null;
      if (body.longitude !== undefined) existing.longitude = body.longitude || null;

      existing.updated_at = new Date();
      await existing.save();

      const products = await Product.find({ umkm_id: existing.id }).sort({ created_at: -1 }).lean();
      const cat = await Category.findOne({ id: existing.category_id }).lean();
      const formatted = formatUmkmItem(existing.toObject(), products, cat);

      return res.json({ success: true, data: formatted });
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
      return res.json({ success: true, data: { success: true } });
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
        success: true,
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
