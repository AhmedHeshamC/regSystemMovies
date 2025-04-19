const express = require('express');
const adminController = require('../controllers/admin.controller'); // Adjust path as needed
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware'); // Adjust path for auth middleware

const router = express.Router();

// Apply authentication and admin role check to all routes in this file
router.use(authenticateToken);
router.use(isAdmin);

// --- Admin Reporting Routes ---

// GET /api/v1/admin/reservations?showtimeId={id}
router.get('/reservations', adminController.getReservationsByShowtime);

// GET /api/v1/admin/reports/capacity?date=YYYY-MM-DD
router.get('/reports/capacity', adminController.getCapacityReport);


module.exports = router;
