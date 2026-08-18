let argon2;
try {
  argon2 = require("argon2");
} catch (e) {
  argon2 = null;
}
const bcrypt = require("bcryptjs");

/**
 * Hashes a plaintext password using bcryptjs (100% serverless and cross-platform safe)
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  if (!password) {
    throw new Error("Password wajib diisi untuk melakukan hashing.");
  }
  return await bcrypt.hash(password, 10);
}

/**
 * Verifies a plaintext password against a hash (supports Argon2id and bcrypt hashes)
 * @param {string} hash 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
async function verifyPassword(hash, password) {
  if (!hash || !password) return false;
  
  if (hash.startsWith("$argon2")) {
    if (argon2) {
      try {
        return await argon2.verify(hash, password);
      } catch (err) {
        console.warn("Argon2 verify error:", err.message);
        return false;
      }
    }
    return false;
  }

  // Bcrypt hash verification ($2a$, $2b$, $2y$)
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.warn("bcrypt compare error:", err.message);
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
