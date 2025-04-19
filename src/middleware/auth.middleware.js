// src/middleware/auth.middleware.js
const { verifyToken } = require('../utils/jwt.utils');
const createError = require('http-errors');
const { User, Role } = require('../models'); // Now correctly requires from index.js

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return next(createError(401, 'Authentication required: No token provided')); // Unauthorized if no token
  }

  const userPayload = verifyToken(token);

  if (!userPayload) {
    return next(createError(403, 'Forbidden: Invalid or expired token')); // Forbidden if token is invalid
  }

  req.user = userPayload; // Attach user payload (id, username, role) to the request object
  next(); // Proceed to the next middleware or route handler
};

/**
 * Middleware to check if the authenticated user has the 'admin' role.
 * Assumes authenticateToken middleware has already run and attached user info to req.user.
 */
const authorizeAdmin = (req, res, next) => {
  // Check if user exists and has the 'admin' role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Requires admin privileges' });
  }
  next(); // User is admin, proceed to the next middleware/controller
};

/**
 * Middleware to verify if the authenticated user has the 'admin' role.
 * Must be used *after* authenticateToken middleware.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const isAdmin = async (req, res, next) => {
    // We need to fetch the user's role from the DB based on the token payload
    // because the token payload might be stale or not contain the full role object.
    if (!req.user || !req.user.id) {
        return next(createError(401, 'Authentication required'));
    }
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Role, as: 'role' }]
        });
        if (!user || !user.role || user.role.name !== 'admin') {
            return next(createError(403, 'Forbidden: Admins only')); // 403 Forbidden
        }
        // Optionally attach the full user object with role to req if needed downstream
        // req.dbUser = user;
        next(); // User is admin, proceed
    } catch (error) {
        next(createError(500, 'Error verifying admin status'));
    }
};

/**
 * Middleware to verify if the authenticated user has the 'user' role.
 * Must be used *after* authenticateToken middleware.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const isUser = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return next(createError(401, 'Authentication required'));
    }
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Role, as: 'role' }]
        });
        // Allow if user exists and has the 'user' role (or potentially 'admin' as admins can often do user actions)
        // Adjust the condition based on specific requirements (e.g., if admins should also pass this check)
        if (!user || !user.role || (user.role.name !== 'user' && user.role.name !== 'admin')) { 
            return next(createError(403, 'Forbidden: User role required')); // 403 Forbidden
        }
        next(); // User has the required role, proceed
    } catch (error) {
        next(createError(500, 'Error verifying user role'));
    }
};

module.exports = {
  authenticateToken,
  authorizeAdmin, // Note: authorizeAdmin might be redundant if isAdmin is used
  isAdmin,
  isUser, // Export the new middleware
};