const jwt = require('jsonwebtoken');

// Ensure JWT_SECRET and JWT_EXPIRES_IN are set in your environment variables (.env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key'; // Use environment variable
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Use environment variable

/**
 * Generates a JWT token.
 * @param {object} payload - The payload to include in the token (e.g., { id, username, role }).
 * @returns {string} The generated JWT token.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {object|null} The decoded payload if verification is successful, otherwise null.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};