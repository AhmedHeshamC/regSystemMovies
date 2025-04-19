const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtime.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware'); // Assuming auth middleware exists

// Define routes for showtime management (versioned as /v1)

// POST /api/v1/showtimes - Create a new showtime (Admin only)
router.post('/', [authenticateToken, isAdmin], showtimeController.create);

// GET /api/v1/showtimes - Get all showtimes (Public or Authenticated User)
// Optional query params: ?movieId=1&theaterId=2&date=YYYY-MM-DD
router.get('/', showtimeController.findAll);

// GET /api/v1/showtimes/:id - Get a single showtime by ID (Public or Authenticated User)
router.get('/:id', showtimeController.findOne);

// PUT /api/v1/showtimes/:id - Update a showtime by ID (Admin only)
router.put('/:id', [authenticateToken, isAdmin], showtimeController.update);

// DELETE /api/v1/showtimes/:id - Delete a showtime by ID (Admin only)
router.delete('/:id', [authenticateToken, isAdmin], showtimeController.delete);


module.exports = router;
