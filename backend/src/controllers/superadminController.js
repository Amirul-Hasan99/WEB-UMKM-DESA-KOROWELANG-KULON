const mockData = require('../data/store');

// --- ADMIN ACCOUNTS MANAGEMENT ---

const getAllAdmins = (req, res) => {
  try {
    const admins = mockData.users.map(({ password, ...u }) => u);
    return res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAdmin = (req, res) => {
  try {
    const { name, email, password, role, phone, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, Email, dan Password wajib diisi.'
      });
    }

    const existingUser = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }

    const newAdmin = {
      id: mockData.users.length > 0 ? Math.max(...mockData.users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password,
      role: role || 'admin',
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: bio || 'Staff Kelurahan Korowelang Kulon.'
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

const updateAdmin = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockData.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Akun Admin tidak ditemukan.' });
    }

    const { name, email, role, phone, bio, password } = req.body;

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
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAdmin = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.'
      });
    }

    const index = mockData.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Akun Admin tidak ditemukan.' });
    }

    mockData.users.splice(index, 1);

    return res.status(200).json({
      success: true,
      message: 'Akun Admin berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- DYNAMIC CONTENT MANAGEMENT ---

const updateDynamicContent = (req, res) => {
  try {
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
