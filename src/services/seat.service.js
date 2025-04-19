const { Seat, Theater } = require('../models'); // Assuming models are exported from ../models/index.js
const createError = require('http-errors');

/**
 * Get all seats for a specific theater.
 * @param {number} theaterId - The ID of the theater.
 * @returns {Promise<Array<Seat>>} - A promise that resolves to an array of seats.
 */
const getSeatsByTheater = async (theaterId) => {
  const theater = await Theater.findByPk(theaterId);
  if (!theater) {
    throw createError(404, 'Theater not found');
  }
  const seats = await Seat.findAll({
    where: { theaterId },
    order: [['row', 'ASC'], ['number', 'ASC']], // Order seats logically
  });
  return seats;
};

/**
 * Get a specific seat by its ID.
 * @param {number} seatId - The ID of the seat.
 * @returns {Promise<Seat>} - A promise that resolves to the seat object.
 */
const getSeatById = async (seatId) => {
    const seat = await Seat.findByPk(seatId);
    if (!seat) {
      throw createError(404, 'Seat not found');
    }
    return seat;
  };

/**
 * Create a new seat.
 * Typically, seats might be created in bulk when a theater is created,
 * but this allows individual creation if needed.
 * @param {object} seatData - Data for the new seat (theaterId, row, number, type).
 * @returns {Promise<Seat>} - A promise that resolves to the newly created seat object.
 */
const createSeat = async (seatData) => {
  // Validate that the theater exists
  const theater = await Theater.findByPk(seatData.theaterId);
  if (!theater) {
    throw createError(404, 'Theater not found');
  }

  // Check for duplicate seat (row/number within the same theater)
  const existingSeat = await Seat.findOne({
    where: {
      theaterId: seatData.theaterId,
      row: seatData.row,
      number: seatData.number,
    },
  });
  if (existingSeat) {
    throw createError(409, 'Seat already exists at this location in the theater');
  }

  const newSeat = await Seat.create(seatData);
  return newSeat;
};

/**
 * Update an existing seat.
 * @param {number} seatId - The ID of the seat to update.
 * @param {object} updateData - The data to update the seat with.
 * @returns {Promise<Seat>} - A promise that resolves to the updated seat object.
 */
const updateSeat = async (seatId, updateData) => {
  const seat = await Seat.findByPk(seatId);
  if (!seat) {
    throw createError(404, 'Seat not found');
  }

  // Prevent changing theaterId, row, or number if needed, or add validation
  // For example, ensure the new location isn't already taken if row/number change
  if (updateData.theaterId && updateData.theaterId !== seat.theaterId) {
      throw createError(400, 'Cannot change the theater of a seat. Delete and recreate if necessary.');
  }
  if ((updateData.row && updateData.row !== seat.row) || (updateData.number && updateData.number !== seat.number)) {
      // Check if the new location is already taken
      const targetSeat = await Seat.findOne({
          where: {
              theaterId: seat.theaterId,
              row: updateData.row || seat.row,
              number: updateData.number || seat.number,
          }
      });
      if (targetSeat && targetSeat.id !== seatId) {
          throw createError(409, 'Another seat already exists at the target location.');
      }
  }


  // Update allowed fields (e.g., type)
  await seat.update(updateData);
  return seat.reload(); // Return the updated instance
};

/**
 * Delete a seat.
 * @param {number} seatId - The ID of the seat to delete.
 * @returns {Promise<void>} - A promise that resolves when the seat is deleted.
 */
const deleteSeat = async (seatId) => {
  const seat = await Seat.findByPk(seatId);
  if (!seat) {
    throw createError(404, 'Seat not found');
  }
  await seat.destroy();
};

module.exports = {
  getSeatsByTheater,
  getSeatById,
  createSeat, // Export new function
  updateSeat, // Export new function
  deleteSeat, // Export new function
};
