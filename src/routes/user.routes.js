const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /users - List all users (Admin only)
router.get('/', authenticateToken, isAdmin, userController.listUsers);

// PUT /users/:userId/promote - Promote a user to admin (Admin only)
router.put('/:userId/promote', authenticateToken, isAdmin, userController.promoteUser);


module.exports = router;
