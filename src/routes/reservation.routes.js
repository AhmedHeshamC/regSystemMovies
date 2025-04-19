const express = require('express');
const reservationController = require('../controllers/reservation.controller');
const { authenticateToken, isUser, isAdmin } = require('../middleware/auth.middleware'); // Import isAdmin

const router = express.Router();

// POST /api/v1/reservations - Create a new reservation
// Requires authentication and user role
router.post('/', authenticateToken, isUser, reservationController.create);

// GET /api/v1/reservations/:id - Get a specific reservation
// Requires authentication (user can get their own, admin can get any)
// Note: Authorization logic is handled within the service/controller based on req.user
router.get('/:id', authenticateToken, reservationController.getById);

// PUT /api/v1/reservations/:id/cancel - Cancel a specific reservation
// Requires authentication (user can cancel their own, admin can cancel any)
// Note: Authorization logic is handled within the service/controller based on req.user
router.put('/:id/cancel', authenticateToken, reservationController.cancel);

// DELETE /api/v1/reservations/:id - Delete a specific reservation
// Requires authentication and ADMIN role
router.delete('/:id', authenticateToken, isAdmin, reservationController.remove);

// GET /api/v1/reservations - Get all reservations
// Requires authentication and ADMIN role
router.get('/', authenticateToken, isAdmin, reservationController.getAll);

module.exports = router;
