const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");
const { UMKM, User, Category } = require("../db/models");
const localDb = require("../db/local_db");

module.exports = function () {
  // POST /api/admin/verify
  router.post("/verify", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID UMKM dibutuhkan" });
      }

      const updated = await UMKM.findOneAndUpdate(
        { id: id },
        { is_verified: true, updated_at: new Date() },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ error: "UMKM tidak ditemukan" });
      }

      return res.json({ success: true, data: updated });
    } catch (error) {
      console.error("[POST /api/admin/verify]", error);
      return res.status(500).json({ error: "Gagal memverifikasi UMKM." });
    }
  });

  // DELETE /api/admin/delete
  router.delete("/delete", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const id = req.query.id || req.body.id;
      if (!id) {
        return res.status(400).json({ error: "ID UMKM dibutuhkan" });
      }

      await UMKM.deleteOne({ id: id });
      return res.json({ success: true });
    } catch (error) {
      console.error("[DELETE /api/admin/delete]", error);
      return res.status(500).json({ error: "Gagal menghapus UMKM." });
    }
  });

  // GET /api/admin/stats
  router.get("/stats", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      let totalUmkm = 0;
      let verifiedUmkm = 0;
      let pendingUmkm = 0;
      let totalUser = 0;
      let recentPendingDocs = [];

      try {
        totalUmkm = await UMKM.countDocuments();
        verifiedUmkm = await UMKM.countDocuments({ is_verified: true });
        pendingUmkm = await UMKM.countDocuments({ is_verified: false });
        totalUser = await User.countDocuments();
        recentPendingDocs = await UMKM.find({ is_verified: false }).sort({ created_at: -1 }).limit(5).lean();
      } catch (e) {
        const ld = localDb.loadData();
        totalUmkm = ld.umkms.length;
        verifiedUmkm = ld.umkms.filter((u) => u.is_verified).length;
        pendingUmkm = ld.umkms.filter((u) => !u.is_verified).length;
        totalUser = ld.users.length;
        recentPendingDocs = ld.umkms.filter((u) => !u.is_verified).slice(0, 5);
      }

      const allCategories = await Category.find().lean().catch(() => localDb.loadData().categories);
      const catMap = new Map(allCategories.map((c) => [c.id, c.name]));

      return res.json({
        stats: {
          totalUmkm,
          verifiedUmkm,
          pendingUmkm,
          totalUser,
        },
        recentPending: (recentPendingDocs || []).map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          ownerName: r.owner_name,
          dusun: r.dusun,
          createdAt: r.created_at,
          category: { name: catMap.get(r.category_id) || "Lainnya" },
        })),
      });
    } catch (error) {
      console.error("[GET /api/admin/stats]", error);
      return res.status(500).json({ error: "Gagal mengambil statistik admin." });
    }
  });

  return router;
};
