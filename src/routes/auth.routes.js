const express = require('express');
const authController = require('../controllers/auth.controller');
// Corrected function names from validation.utils.js
const { signupValidationRules, loginValidationRules, handleValidationErrors } = require('../validation.utils');
// Import both authentication and the correct admin authorization middleware
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /auth/signup - Register a new user
router.post(
    '/signup', // Changed route from /register to /signup to match controller/service
    signupValidationRules(), // Use correct function name
    handleValidationErrors,
    authController.signup
);

// POST /auth/login - Authenticate a user and get a token
router.post(
    '/login',
    loginValidationRules(), // Use correct function name
    handleValidationErrors,
    authController.login
);

// POST /auth/logout - "Logs out" a user (client discards token)
// Apply the authenticateToken middleware here
router.post('/logout', authenticateToken, authController.logout);

// POST /auth/admin/create - Create a new admin user (requires admin privileges)
router.post(
    '/admin/create',
    authenticateToken,      // First, ensure user is logged in
    isAdmin,                // Then, ensure user is an admin (using DB check)
    signupValidationRules(), // Reuse signup validation rules for username/password
    handleValidationErrors,
    authController.createAdmin // Use the new controller method
);

module.exports = router;