const seatService = require('../services/seat.service');
const createError = require('http-errors');

/**
 * Controller to get all seats for a specific theater.
 */
const getSeatsByTheater = async (req, res, next) => {
  try {
    const theaterId = parseInt(req.params.theaterId, 10);
    if (isNaN(theaterId)) {
        throw createError(400, 'Invalid theater ID');
    }
    const seats = await seatService.getSeatsByTheater(theaterId);
    res.status(200).json(seats);
  } catch (error) {
    next(error); // Pass errors to the error handling middleware
  }
};

/**
 * Controller to get a specific seat by ID.
 */
const getSeatById = async (req, res, next) => {
    try {
      const seatId = parseInt(req.params.seatId, 10);
      if (isNaN(seatId)) {
          throw createError(400, 'Invalid seat ID');
      }
      const seat = await seatService.getSeatById(seatId);
      res.status(200).json(seat);
    } catch (error) {
      next(error); // Pass errors to the error handling middleware
    }
  };

/**
 * Controller to create a new seat.
 */
const createSeat = async (req, res, next) => {
  try {
    // Basic validation (more robust validation can be added)
    const { theaterId, row, number, type } = req.body;
    if (!theaterId || !row || !number) {
      throw createError(400, 'Missing required fields: theaterId, row, number');
    }
    // Add validation for row format (e.g., single uppercase letter)
    // Add validation for number format (e.g., positive integer)
    // Add validation for type enum if applicable

    const newSeat = await seatService.createSeat({ theaterId, row, number, type });
    res.status(201).json(newSeat);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update an existing seat.
 */
const updateSeat = async (req, res, next) => {
  try {
    const seatId = parseInt(req.params.seatId, 10);
    if (isNaN(seatId)) {
      throw createError(400, 'Invalid seat ID');
    }
    const updateData = req.body;
    // Add validation for updateData fields (e.g., type enum)
    if (Object.keys(updateData).length === 0) {
        throw createError(400, 'No update data provided');
    }

    const updatedSeat = await seatService.updateSeat(seatId, updateData);
    res.status(200).json(updatedSeat);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a seat.
 */
const deleteSeat = async (req, res, next) => {
  try {
    const seatId = parseInt(req.params.seatId, 10);
    if (isNaN(seatId)) {
      throw createError(400, 'Invalid seat ID');
    }
    await seatService.deleteSeat(seatId);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    next(error);
  }
};

// Add controllers for other seat actions if needed

module.exports = {
  getSeatsByTheater,
  getSeatById,
  createSeat, // Export new controller
  updateSeat, // Export new controller
  deleteSeat, // Export new controller
};
