const express = require("express");
const router = express.Router();
const { authMiddleware, requireRole } = require("../middleware/auth");

module.exports = function (sql) {
  // POST /api/admin/verify
  router.post("/verify", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID UMKM dibutuhkan" });
      }

      await sql.query(
        "UPDATE umkms SET is_verified = 1, updated_at = NOW() WHERE id = ?",
        [id]
      );

      const updated = await sql.query("SELECT * FROM umkms WHERE id = ?", [id]);
      if (!updated || updated.length === 0) {
        return res.status(404).json({ error: "UMKM tidak ditemukan" });
      }

      return res.json({ success: true, data: updated[0] });
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

      await sql.query("DELETE FROM umkms WHERE id = ?", [id]);
      return res.json({ success: true });
    } catch (error) {
      console.error("[DELETE /api/admin/delete]", error);
      return res.status(500).json({ error: "Gagal menghapus UMKM." });
    }
  });

  // GET /api/admin/stats
  router.get("/stats", authMiddleware, requireRole("ADMIN", "SUPERADMIN"), async (req, res) => {
    try {
      const totalUmkmsRes = await sql.query("SELECT COUNT(*) AS count FROM umkms");
      const verifiedUmkmsRes = await sql.query("SELECT COUNT(*) AS count FROM umkms WHERE is_verified = 1");
      const pendingUmkmsRes = await sql.query("SELECT COUNT(*) AS count FROM umkms WHERE is_verified = 0");
      const totalUsersRes = await sql.query("SELECT COUNT(*) AS count FROM users");

      const recentPending = await sql.query(
        `SELECT 
          u.id, u.name, u.slug, u.owner_name AS ownerName, u.dusun, u.created_at AS createdAt,
          c.name AS category_name
        FROM umkms u
        LEFT JOIN categories c ON u.category_id = c.id
        WHERE u.is_verified = 0
        ORDER BY u.created_at DESC
        LIMIT 5`
      );

      return res.json({
        stats: {
          totalUmkm: totalUmkmsRes[0]?.count || 0,
          verifiedUmkm: verifiedUmkmsRes[0]?.count || 0,
          pendingUmkm: pendingUmkmsRes[0]?.count || 0,
          totalUser: totalUsersRes[0]?.count || 0,
        },
        recentPending: (recentPending || []).map(r => ({
          ...r,
          category: { name: r.category_name }
        }))
      });
    } catch (error) {
      console.error("[GET /api/admin/stats]", error);
      return res.status(500).json({ error: "Gagal mengambil statistik admin." });
    }
  });

  return router;
};
