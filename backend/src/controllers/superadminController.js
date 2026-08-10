const { db, schema } = require('../db');
const { eq } = require('drizzle-orm');
const { hashPassword } = require('../utils/password');
const mockData = require('../data/store');

// --- ADMIN ACCOUNTS MANAGEMENT ---

const getAllAdmins = async (req, res) => {
  try {
    let admins = [];

    if (db) {
      try {
        const users = await db.select().from(schema.users);
        admins = users.map(({ password, ...u }) => u);
      } catch (err) {}
    }

    if (!admins || admins.length === 0) {
      admins = mockData.users.map(({ password, ...u }) => u);
    }

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

    if (db) {
      try {
        const inserted = await db.insert(schema.users).values(payload).returning();
        if (inserted.length > 0) {
          const { password: pwd, ...createdAdmin } = inserted[0];
          return res.status(201).json({
            success: true,
            message: 'Akun Admin berhasil ditambahkan.',
            data: createdAdmin
          });
        }
      } catch (err) {}
    }

    // Fallback mockData
    const newAdmin = {
      id: mockData.users.length > 0 ? Math.max(...mockData.users.map(u => u.id)) + 1 : 1,
      ...payload
    };
    mockData.users.push(newAdmin);

    const { password: pwd, ...createdAdmin } = newAdmin;
    return res.status(201).json({
      success: true,
      message: 'Akun Admin berhasil ditambahkan.',
      data: createdAdmin
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, role, phone, bio, password } = req.body;

    const updatePayload = {};
    if (name) updatePayload.name = name;
    if (email) updatePayload.email = email.toLowerCase();
    if (role) updatePayload.role = role;
    if (phone) updatePayload.phone = phone;
    if (bio) updatePayload.bio = bio;
    if (password) updatePayload.password = await hashPassword(password);

    if (db) {
      try {
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
      } catch (err) {}
    }

    // Fallback mockData
    const index = mockData.users.findIndex(u => u.id === id);
    if (index !== -1) {
      if (name) mockData.users[index].name = name;
      if (email) mockData.users[index].email = email;
      if (role) mockData.users[index].role = role;
      if (phone) mockData.users[index].phone = phone;
      if (bio) mockData.users[index].bio = bio;
      if (password) mockData.users[index].password = password;

      const { password: pwd, ...updatedAdmin } = mockData.users[index];
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
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.'
      });
    }

    if (db) {
      try {
        await db.delete(schema.users).where(eq(schema.users.id, id));
        return res.status(200).json({
          success: true,
          message: 'Akun Admin berhasil dihapus.'
        });
      } catch (err) {}
    }

    // Fallback mockData
    const index = mockData.users.findIndex(u => u.id === id);
    if (index !== -1) {
      mockData.users.splice(index, 1);
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
    if (db) {
      try {
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
      } catch (err) {}
    }

    // Fallback mockData
    mockData.dynamicContent = {
      ...mockData.dynamicContent,
      ...req.body
    };

    return res.status(200).json({
      success: true,
      message: 'Konten dinamis website berhasil diperbarui.',
      data: mockData.dynamicContent
    });
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
