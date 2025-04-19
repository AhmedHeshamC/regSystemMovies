const reservationService = require('../services/reservation.service');
const createError = require('http-errors'); // Import createError

// Controller to handle creating a new reservation
const create = async (req, res, next) => {
    // Assuming userId is available from authentication middleware (e.g., req.user.id)
    const userId = req.user.id; 
    const { showtimeId, seatIds } = req.body;

    if (!userId) {
        return res.status(401).json({ error: { status: 401, message: 'User not authenticated.' } });
    }

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: { status: 400, message: 'Missing or invalid required fields: showtimeId, seatIds (must be a non-empty array).' } });
    }

    try {
        const reservation = await reservationService.createReservation(userId, showtimeId, seatIds);
        res.status(201).json(reservation);
    } catch (error) {
        // Log the error internally
        console.error(`Reservation creation failed for user ${userId}, showtime ${showtimeId}:`, error);

        // Send appropriate error response to client
        if (error.message.includes('not found') || error.message.includes('invalid')) {
            return res.status(404).json({ error: { status: 404, message: error.message } });
        } 
        if (error.message.includes('already reserved')) {
            return res.status(409).json({ error: { status: 409, message: error.message } }); // 409 Conflict
        }
        // Pass other errors to the generic error handler
        next(error); 
    }
};

// Controller to get a reservation by ID
const getById = async (req, res, next) => {
    const reservationId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    // Fetch the user role from the database via middleware or re-fetch here if needed
    // For now, assume req.user.role is populated correctly by auth middleware
    const userRole = req.user.role; 

    if (isNaN(reservationId)) {
        return next(createError(400, 'Invalid reservation ID.'));
    }
    if (!userId || !userRole) {
        return next(createError(401, 'Authentication details missing.'));
    }

    try {
        const reservation = await reservationService.getReservationById(reservationId, userId, userRole);
        res.status(200).json(reservation);
    } catch (error) {
        // Handle specific errors or pass to generic handler
        if (error.status) { // Check if it's an http-errors error
             return res.status(error.status).json({ error: { status: error.status, message: error.message } });
        }
        next(error); // Pass other errors to the generic error handler
    }
};

// Controller to cancel a reservation
const cancel = async (req, res, next) => {
    const reservationId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role; // Assume role is attached

    if (isNaN(reservationId)) {
        return next(createError(400, 'Invalid reservation ID.'));
    }
    if (!userId || !userRole) {
        return next(createError(401, 'Authentication details missing.'));
    }

    try {
        const updatedReservation = await reservationService.cancelReservation(reservationId, userId, userRole);
        res.status(200).json(updatedReservation);
    } catch (error) {
         if (error.status) {
             return res.status(error.status).json({ error: { status: error.status, message: error.message } });
        }
        next(error); 
    }
};

// Controller to delete a reservation (Admin only)
const remove = async (req, res, next) => {
    const reservationId = parseInt(req.params.id, 10);

    if (isNaN(reservationId)) {
        return next(createError(400, 'Invalid reservation ID.'));
    }

    try {
        await reservationService.deleteReservation(reservationId);
        res.status(204).send(); // No Content on successful deletion
    } catch (error) {
         if (error.status) {
             return res.status(error.status).json({ error: { status: error.status, message: error.message } });
        }
        next(error); 
    }
};

// Controller to get all reservations (Admin only)
const getAll = async (req, res, next) => {
    try {
        const reservations = await reservationService.getAllReservations();
        res.status(200).json(reservations);
    } catch (error) {
         if (error.status) {
             return res.status(error.status).json({ error: { status: error.status, message: error.message } });
        }
        next(error); 
    }
};

module.exports = {
    create,
    getById,
    cancel,
    remove,
    getAll, // Add getAll controller
};
