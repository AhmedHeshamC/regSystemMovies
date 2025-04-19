const { User, Role } = require('../models'); // Use index.js
const createError = require('http-errors');

/**
 * Get all users with their roles.
 * Excludes password hashes.
 * @returns {Promise<Array<User>>}
 */
const getAllUsers = async () => {
    return User.findAll({
        attributes: { exclude: ['password'] }, // Exclude password from the result
        include: [{ model: Role, as: 'role' }],
    });
};

/**
 * Promote a user to the 'admin' role.
 * @param {number} userId - The ID of the user to promote.
 * @returns {Promise<User>} The updated user object.
 * @throws {Error} If user not found or role update fails.
 */
const promoteUserToAdmin = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw createError(404, 'User not found');
    }

    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
        // This should ideally not happen if seed data is correct
        throw createError(500, 'Admin role not found');
    }

    if (user.role_id === adminRole.id) {
        // User is already an admin, no action needed, return the user
        // Re-fetch user with role to return consistent info, excluding password
        return User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [{ model: Role, as: 'role' }],
        });
    }

    user.role_id = adminRole.id;
    await user.save();

    // Re-fetch user with role to return updated info, excluding password
    return User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [{ model: Role, as: 'role' }],
    });
};


module.exports = {
    getAllUsers,
    promoteUserToAdmin,
};
