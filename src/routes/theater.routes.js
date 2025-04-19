const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theater.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

// POST /api/v1/theaters - Create a new theater (Admin only)
router.post('/', [authenticateToken, isAdmin], theaterController.create);

// GET /api/v1/theaters - Get all theaters (Public or Authenticated User)
router.get('/', theaterController.findAll);

// GET /api/v1/theaters/:id - Get a single theater by ID (Public or Authenticated User)
router.get('/:id', theaterController.findOne);

// PUT /api/v1/theaters/:id - Update a theater by ID (Admin only)
router.put('/:id', [authenticateToken, isAdmin], theaterController.update);

// DELETE /api/v1/theaters/:id - Delete a theater by ID (Admin only)
router.delete('/:id', [authenticateToken, isAdmin], theaterController.delete);

module.exports = router;
