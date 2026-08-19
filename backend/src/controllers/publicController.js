const { db, schema } = require('../db');
const { eq, ilike, or, and, gte, lte, sql } = require('drizzle-orm');

// GET /api/public/umkm (With search, category, minPrice, maxPrice, page, limit)
const getUmkms = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { search, category, minPrice, maxPrice, page = 1, limit = 9 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const offset = (pageNum - 1) * limitNum;

    let result = [];
    let totalCount = 0;

    let conditions = [];
    if (category && category !== 'Semua') {
      conditions.push(eq(schema.umkms.category, category));
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(schema.umkms.name, q),
          ilike(schema.umkms.owner, q),
          ilike(schema.umkms.description, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    result = await db.select().from(schema.umkms).where(whereClause).limit(limitNum).offset(offset);
    const countRes = await db.select({ count: sql`count(*)` }).from(schema.umkms).where(whereClause);
    totalCount = parseInt(countRes[0]?.count || 0);

    const allProducts = await db.select().from(schema.products);
    result = result.map(u => ({
      ...u,
      products: allProducts.filter(p => p.umkmId === u.id)
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      data: result
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/umkm/:id
const getUmkmById = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);
    let umkm = null;
    let products = [];
    let reviewsList = [];

    const result = await db.select().from(schema.umkms).where(eq(schema.umkms.id, id));
    if (result.length > 0) {
      umkm = result[0];
      products = await db.select().from(schema.products).where(eq(schema.products.umkmId, id));
      reviewsList = await db.select().from(schema.reviews).where(eq(schema.reviews.umkmId, id));
    }

    if (!umkm) {
      return res.status(404).json({ success: false, message: 'UMKM tidak ditemukan.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...umkm,
        products,
        reviews: reviewsList
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/public/feedback
const submitFeedback = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { name, email, message } = req.body;

    const payload = {
      name: name || 'Anonim',
      email: email || '',
      message: message || '',
      createdAt: new Date(),
    };

    let inserted = [];
    try {
      inserted = await db.insert(schema.feedbacks).values(payload).returning();
    } catch (insertErr) {
      // Auto-sync sequence if duplicate key violation occurs (e.g. after manual seeding)
      if (insertErr.message && (insertErr.message.includes('unique constraint') || insertErr.message.includes('feedbacks_pkey'))) {
        try {
          await db.execute(sql.raw(`
            SELECT setval(
              COALESCE(pg_get_serial_sequence('feedbacks', 'id'), 'feedbacks_id_seq'),
              COALESCE((SELECT MAX(id) FROM feedbacks), 0) + 1,
              false
            );
          `));
          inserted = await db.insert(schema.feedbacks).values(payload).returning();
        } catch (retryErr) {
          throw insertErr;
        }
      } else {
        throw insertErr;
      }
    }

    if (inserted.length > 0) {
      return res.status(201).json({
        success: true,
        message: 'Feedback berhasil dikirim. Terima kasih atas masukan Anda!',
        data: inserted[0],
      });
    }

    return res.status(400).json({ success: false, message: 'Gagal mengirim feedback.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/public/konten
const getDynamicContent = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    let content = null;
    const result = await db.select().from(schema.dynamicContent);
    if (result.length > 0) content = { ...result[0] };

    if (!content) {
      return res.status(404).json({ success: false, message: 'Konten tidak ditemukan.' });
    }

    if (content.heroMedia && typeof content.heroMedia === 'string') {
      try {
        content.heroMedia = JSON.parse(content.heroMedia);
      } catch {
        content.heroMedia = [];
      }
    }

    return res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/public/umkm/:id/review (Public Ratings & Reviews)
const submitReview = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const umkmId = parseInt(req.params.id);
    const { name, rating, comment } = req.body;

    const reviewPayload = {
      umkmId,
      name,
      rating: parseInt(rating),
      comment,
      createdAt: new Date()
    };

    const inserted = await db.insert(schema.reviews).values(reviewPayload).returning();
    // Calculate new average rating
    const allReviews = await db.select().from(schema.reviews).where(eq(schema.reviews.umkmId, umkmId));
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await db.update(schema.umkms)
      .set({
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length
      })
      .where(eq(schema.umkms.id, umkmId));

    return res.status(201).json({
      success: true,
      message: 'Ulasan Anda telah berhasil dipublikasikan!',
      data: inserted[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUmkms,
  getUmkmById,
  submitFeedback,
  getDynamicContent,
  submitReview
};
