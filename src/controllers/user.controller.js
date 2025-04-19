const userService = require('../services/user.service');
const createError = require('http-errors');

/**
 * Controller to handle fetching all users.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const listUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error); // Pass errors to the error handler
    }
};

/**
 * Controller to handle promoting a user to admin.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const promoteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            throw createError(400, 'Invalid user ID');
        }

        const updatedUser = await userService.promoteUserToAdmin(userId);
        res.status(200).json({ message: 'User promoted to admin successfully', user: updatedUser });
    } catch (error) {
        next(error); // Pass errors to the error handler
    }
};

module.exports = {
    listUsers,
    promoteUser,
};

