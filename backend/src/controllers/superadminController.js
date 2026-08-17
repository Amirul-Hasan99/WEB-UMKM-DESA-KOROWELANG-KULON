const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');
const { hashPassword } = require('../utils/password');

// --- ADMIN ACCOUNTS MANAGEMENT ---

const getAllAdmins = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const users = await db.select().from(schema.users);
    const admins = users.map(({ password, ...u }) => u);

    return res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const { name, email, password, role, phone, bio } = req.body;

    const hashedPassword = await hashPassword(password);
    const payload = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'admin',
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: bio || 'Staff Kelurahan Kutoharjo.'
    };

    const inserted = await db.insert(schema.users).values(payload).returning();
    if (inserted.length > 0) {
      const { password: pwd, ...createdAdmin } = inserted[0];
      return res.status(201).json({
        success: true,
        message: 'Akun Admin berhasil ditambahkan.',
        data: createdAdmin
      });
    }

    return res.status(400).json({ success: false, message: 'Gagal menambahkan akun Admin.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);
    const { name, email, role, phone, bio, password } = req.body;

    const updatePayload = {};
    if (name) updatePayload.name = name;
    if (email) updatePayload.email = email.toLowerCase();
    if (role) updatePayload.role = role;
    if (phone) updatePayload.phone = phone;
    if (bio) updatePayload.bio = bio;
    if (password) updatePayload.password = await hashPassword(password);

    const updated = await db.update(schema.users)
      .set(updatePayload)
      .where(eq(schema.users.id, id))
      .returning();

    if (updated.length > 0) {
      const { password: pwd, ...updatedAdmin } = updated[0];
      return res.status(200).json({
        success: true,
        message: 'Akun Admin berhasil diperbarui.',
        data: updatedAdmin
      });
    }

    return res.status(404).json({ success: false, message: 'Akun Admin tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const id = parseInt(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.'
      });
    }

    const deleted = await db.delete(schema.users).where(eq(schema.users.id, id)).returning();
    if (deleted.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Akun Admin berhasil dihapus.'
      });
    }

    return res.status(404).json({ success: false, message: 'Akun Admin tidak ditemukan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- DYNAMIC CONTENT MANAGEMENT ---

const updateDynamicContent = async (req, res) => {
  try {
    if (!db) return res.status(500).json({ success: false, message: 'Database tidak terhubung.' });

    const existing = await db.select().from(schema.dynamicContent);
    if (existing.length > 0) {
      const updated = await db.update(schema.dynamicContent)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(schema.dynamicContent.id, existing[0].id))
        .returning();
      return res.status(200).json({
        success: true,
        message: 'Konten dinamis website berhasil diperbarui.',
        data: updated[0]
      });
    } else {
      const inserted = await db.insert(schema.dynamicContent).values(req.body).returning();
      return res.status(200).json({
        success: true,
        message: 'Konten dinamis website berhasil diperbarui.',
        data: inserted[0]
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateDynamicContent
};
