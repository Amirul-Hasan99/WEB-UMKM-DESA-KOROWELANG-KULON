const argon2 = require('argon2');
const bcrypt = require('bcryptjs');

/**
 * Hash a plain text password using Argon2id (OWASP recommended parameters).
 * Fallback to bcrypt if Argon2 execution encounters an environment issue.
 */
const hashPassword = async (plainPassword) => {
  if (!plainPassword) {
    throw new Error('Password wajib diisi untuk melakukan hashing.');
  }

<<<<<<< HEAD
=======
/**
 * Verifies a plaintext password against a hash
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
    // If argon2 is not available and hash is argon2, cannot verify
    return false;
  }

  // bcrypt hash verification
>>>>>>> 6b68d9c5 (Migrasi backend ke MySQL Railway + Fix keamanan kritis + Deploy config)
  try {
    return await argon2.hash(plainPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB (OWASP recommended)
      timeCost: 3,         // 3 iterations
      parallelism: 1,      // 1 degree of parallelism
    });
  } catch (err) {
<<<<<<< HEAD
    console.warn('⚠️ Argon2 hashing failed, falling back to bcryptjs:', err.message);
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
=======
    console.warn("bcrypt compare error:", err.message);
    return false;
>>>>>>> 6b68d9c5 (Migrasi backend ke MySQL Railway + Fix keamanan kritis + Deploy config)
  }
};

/**
 * Verify a plain text password against a hash (supports Argon2id and bcrypt hashes).
 */
const verifyPassword = async (hash, plainPassword) => {
  if (!hash || !plainPassword) return false;

  // Argon2 hash detection ($argon2i$, $argon2d$, $argon2id$)
  if (hash.startsWith('$argon2')) {
    try {
      return await argon2.verify(hash, plainPassword);
    } catch (err) {
      console.error('❌ Argon2 verification error:', err.message);
      return false;
    }
  }

  // Bcrypt hash detection ($2a$, $2b$, $2y$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return await bcrypt.compare(plainPassword, hash);
    } catch (err) {
      console.error('❌ Bcrypt verification error:', err.message);
      return false;
    }
  }

  // Legacy plain text check (fallback during migration)
  return hash === plainPassword;
};

module.exports = {
  hashPassword,
  verifyPassword,
};

