const express = require('express');
const seatController = require('../controllers/seat.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware'); // Assuming authentication is needed

const router = express.Router();

// Route to get all seats for a specific theater
// Accessible by authenticated users (adjust middleware as needed)
router.get('/theater/:theaterId', authenticateToken, seatController.getSeatsByTheater);

// Route to get a specific seat by ID
// Accessible by authenticated users (adjust middleware as needed)
router.get('/:seatId', authenticateToken, seatController.getSeatById);


// Add routes for creating, updating, deleting seats if necessary
// These might require admin privileges (e.g., isAdmin middleware)
router.post('/', authenticateToken, isAdmin, seatController.createSeat);
router.put('/:seatId', authenticateToken, isAdmin, seatController.updateSeat);
router.delete('/:seatId', authenticateToken, isAdmin, seatController.deleteSeat);


module.exports = router;
