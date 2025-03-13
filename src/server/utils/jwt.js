import jwt from 'jsonwebtoken'

/**
 * @deprecated Use Supabase authentication directly instead of custom JWT handling
 * These utilities are kept for backward compatibility but should be phased out
 */

// Secret key for JWT signing - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'hyperfy-development-secret'

/**
 * Create a JWT token with the given payload
 * @deprecated Use Supabase authentication instead
 * @param {Object} payload - Data to include in the token
 * @param {Object} options - JWT options (optional)
 * @returns {Promise<string>} - JWT token
 */
export async function createJWT(payload, options = {}) {
  console.warn('Warning: createJWT is deprecated. Use Supabase authentication instead.')
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...options }, (err, token) => {
      if (err) return reject(err)
      resolve(token)
    })
  })
}

/**
 * Read and verify a JWT token
 * @deprecated Use Supabase authentication instead
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} - Decoded token payload
 */
export async function readJWT(token) {
  console.warn('Warning: readJWT is deprecated. Use Supabase authentication instead.')
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err)
      resolve(decoded)
    })
  })
}
