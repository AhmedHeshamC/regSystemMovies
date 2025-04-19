const bcrypt = require('bcrypt');
const { User, Role } = require('../models'); // Use index.js
const { generateToken } = require('../utils/jwt.utils');
const createError = require('http-errors'); // Using http-errors for standard HTTP errors

class AuthService {
  /**
   * Registers a new user.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>} The created user object (without password hash).
   */
  async signup(username, password) {
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw createError(409, 'Username already exists');
    }

    // Find the default 'user' role
    const userRole = await Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
      // This should not happen if roles are seeded correctly
      throw createError(500, 'Default user role not found. Please seed the database.');
    }

    // Create the user (password hashing is handled by the model hook)
    const newUser = await User.create({
      username,
      password_hash: password, // Pass the plain password, hook will hash it
      role_id: userRole.id,
    });

    // Return user data without the password hash
    const { password_hash, ...userWithoutPassword } = newUser.toJSON();
    return { ...userWithoutPassword, role: userRole.name }; // Add role name
  }

  /**
   * Logs in a user.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<string>} JWT token.
   */
  async login(username, password) {
    const user = await User.findOne({
        where: { username },
        include: [{ model: Role, as: 'role' }] // Include role information
      });

    if (!user) {
      throw createError(401, 'Invalid username or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw createError(401, 'Invalid username or password');
    }

    // Generate JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role.name, // Get role name from the associated model
    };
    const token = generateToken(payload);

    return token;
  }

  /**
   * Creates a new admin user. Requires admin privileges.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>} The created admin user object (without password hash).
   */
  async createAdmin(username, password) {
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw createError(409, 'Username already exists');
    }

    // Find the 'admin' role
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      // This should not happen if roles are seeded correctly
      throw createError(500, 'Admin role not found. Please seed the database.');
    }

    // Create the admin user (password hashing is handled by the model hook)
    const newAdmin = await User.create({
      username,
      password_hash: password, // Pass the plain password, hook will hash it
      role_id: adminRole.id,
    });

    // Return user data without the password hash
    const { password_hash, ...userWithoutPassword } = newAdmin.toJSON();
    return { ...userWithoutPassword, role: adminRole.name }; // Add role name
  }
}

module.exports = new AuthService();