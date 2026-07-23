const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'korowelang_kulon_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '1d';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken
};
