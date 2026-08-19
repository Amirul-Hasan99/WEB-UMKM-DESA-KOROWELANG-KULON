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
      bio: bio || 'Staff Desa Korowelang Kulon.'
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

    const payload = { ...req.body, updatedAt: new Date() };

    // Function to perform upsert
    const performSave = async () => {
      const existing = await db.select().from(schema.dynamicContent);
      if (existing.length > 0) {
        return await db.update(schema.dynamicContent)
          .set(payload)
          .where(eq(schema.dynamicContent.id, existing[0].id))
          .returning();
      } else {
        return await db.insert(schema.dynamicContent).values(payload).returning();
      }
    };

    let result = [];
    try {
      result = await performSave();
    } catch (saveErr) {
      // If error is about missing hero_media column, auto-create column and retry
      if (saveErr.message && (saveErr.message.includes('hero_media') || saveErr.message.includes('column'))) {
        try {
          const { sql } = require('drizzle-orm');
          await db.execute(sql.raw(`ALTER TABLE "dynamic_content" ADD COLUMN IF NOT EXISTS "hero_media" jsonb DEFAULT '[]'::jsonb;`));
          result = await performSave();
        } catch (retryErr) {
          throw saveErr;
        }
      } else {
        throw saveErr;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Konten dinamis website berhasil diperbarui.',
      data: result[0] || payload
    });
  } catch (error) {
    console.error('updateDynamicContent error:', error);
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
