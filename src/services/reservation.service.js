const { sequelize, Reservation, ReservedSeat, Seat, Showtime, User, Movie, Theater } = require('../models'); // Ensure User, Movie, Theater are imported
const { Op } = require('sequelize');
const createError = require('http-errors'); // Import createError

/**
 * Creates a new reservation, ensuring seat availability with locking.
 * @param {number} userId - The ID of the user making the reservation.
 * @param {number} showtimeId - The ID of the showtime.
 * @param {number[]} seatIds - An array of seat IDs to reserve.
 * @returns {Promise<object>} The created reservation with reserved seats.
 * @throws {Error} If seats are invalid, already reserved, or other issues occur.
 */
const createReservation = async (userId, showtimeId, seatIds) => {
  if (!seatIds || seatIds.length === 0) {
    throw new Error('At least one seat must be selected.');
  }

  const transaction = await sequelize.transaction(); // Start a transaction

  try {
    // 1. Verify Showtime exists
    const showtime = await Showtime.findByPk(showtimeId, { transaction });
    if (!showtime) {
      throw new Error('Showtime not found.');
    }

    // 2. Verify all requested seats exist for the showtime's theater and lock them
    // We need to lock the seats themselves to prevent double booking.
    const seats = await Seat.findAll({
      where: {
        id: {
          [Op.in]: seatIds,
        },
        theaterId: showtime.theaterId, // Ensure seats belong to the correct theater
      },
      lock: transaction.LOCK.UPDATE, // Lock the selected seat rows
      transaction,
    });

    if (seats.length !== seatIds.length) {
      throw new Error('One or more selected seats are invalid for this theater.');
    }

    // 3. Check if any of the selected seats are already reserved for this *specific* showtime
    // We need to check the ReservedSeats table.
    const existingReservations = await ReservedSeat.findAll({
      where: {
        seatId: {
          [Op.in]: seatIds,
        },
      },
      include: [{
        model: Reservation,
        where: {
          showtimeId: showtimeId,
          status: { [Op.ne]: 'cancelled' } // Only consider active reservations
        },
        required: true // INNER JOIN to only get ReservedSeats linked to this showtime
      }],
      transaction, // Include in the transaction to ensure consistency
      // No need to lock here again, as the relevant Seats are already locked.
    });

    if (existingReservations.length > 0) {
      const reservedSeatIds = existingReservations.map(rs => rs.seatId);
      throw new Error(`Seats with IDs [${reservedSeatIds.join(', ')}] are already reserved for this showtime.`);
    }

    // 4. Calculate Total Price (Example: fixed price per seat)
    const pricePerSeat = 10.00; // Replace with actual pricing logic if needed
    const totalPrice = seats.length * pricePerSeat;

    // 5. Create the Reservation record
    const reservation = await Reservation.create({
      userId,
      showtimeId,
      totalPrice,
      status: 'confirmed', // Or 'pending' if payment step is needed
    }, { transaction });

    // 6. Create ReservedSeat records linking seats to the reservation
    const reservedSeatEntries = seatIds.map(seatId => ({
      reservationId: reservation.id,
      seatId,
    }));
    await ReservedSeat.bulkCreate(reservedSeatEntries, { transaction });

    // 7. Commit the transaction
    await transaction.commit();

    // 8. Return the created reservation (optionally include associated data)
    const finalReservation = await Reservation.findByPk(reservation.id, {
      include: [
        { model: ReservedSeat, include: [Seat] },
        { model: User, attributes: ['id', 'username'] }, // Exclude sensitive info
        {
          model: Showtime,
          include: [
            { model: Movie, as: 'movie' }, // Add alias
            { model: Theater, as: 'theater' } // Add alias
          ]
        }
      ]
    });

    return finalReservation;

  } catch (error) {
    // 9. Rollback transaction *only if it hasn't finished*
    // Check if transaction exists and is not finished ('commit' or 'rollback')
    if (transaction && !transaction.finished) { 
        try {
            await transaction.rollback();
            console.log('Transaction rolled back due to error.');
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
            // Potentially log this secondary error but proceed with the original error
        }
    }
    console.error('Reservation failed:', error.message);
    // Re-throw the original error to be handled by the controller
    throw error; 
  }
};

/**
 * Retrieves a specific reservation by its ID.
 * Ensures the user requesting is either the owner or an admin.
 * @param {number} reservationId - The ID of the reservation.
 * @param {number} requestingUserId - The ID of the user making the request.
 * @param {string} requestingUserRole - The role of the user making the request ('user' or 'admin').
 * @returns {Promise<object>} The reservation object with associated data.
 * @throws {Error} If reservation not found or user is not authorized.
 */
const getReservationById = async (reservationId, requestingUserId, requestingUserRole) => {
  const reservation = await Reservation.findByPk(reservationId, {
    include: [
      { model: ReservedSeat, include: [Seat] },
      { model: User, attributes: ['id', 'username'] },
      {
        model: Showtime,
        include: [
          { model: Movie, as: 'movie' }, // Add alias
          { model: Theater, as: 'theater' } // Add alias
        ]
      }
    ]
  });

  if (!reservation) {
    throw createError(404, 'Reservation not found.');
  }

  // Check authorization: User must be the owner or an admin
  // Make sure requestingUserRole is correctly passed and checked
  if (reservation.userId !== requestingUserId && requestingUserRole !== 'admin') {
    throw createError(403, 'Forbidden: You do not have permission to view this reservation.');
  }

  return reservation;
};

/**
 * Cancels a reservation by updating its status.
 * Ensures the user requesting is either the owner or an admin.
 * @param {number} reservationId - The ID of the reservation to cancel.
 * @param {number} requestingUserId - The ID of the user making the request.
 * @param {string} requestingUserRole - The role of the user making the request.
 * @returns {Promise<object>} The updated reservation object.
 * @throws {Error} If reservation not found, already cancelled, or user not authorized.
 */
const cancelReservation = async (reservationId, requestingUserId, requestingUserRole) => {
  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation) {
    throw createError(404, 'Reservation not found.');
  }

  // Check authorization
  if (reservation.userId !== requestingUserId && requestingUserRole !== 'admin') {
    throw createError(403, 'Forbidden: You do not have permission to cancel this reservation.');
  }

  if (reservation.status === 'cancelled') {
    throw createError(400, 'Reservation is already cancelled.');
  }

  // Update status to 'cancelled'
  reservation.status = 'cancelled';
  await reservation.save();

  // Optionally, re-fetch with associations to return full details
  // Ensure role is passed correctly if getReservationById relies on it for auth check on re-fetch
  return getReservationById(reservationId, requestingUserId, requestingUserRole);
};


/**
 * Deletes a reservation (Hard Delete).
 * Restricted to admin users.
 * @param {number} reservationId - The ID of the reservation to delete.
 * @returns {Promise<void>}
 * @throws {Error} If reservation not found.
 */
const deleteReservation = async (reservationId) => {
    const reservation = await Reservation.findByPk(reservationId);

    if (!reservation) {
        throw createError(404, 'Reservation not found.');
    }

    // Perform hard delete (will also delete associated ReservedSeats due to CASCADE if set up in DB)
    await reservation.destroy();
};

/**
 * Retrieves all reservations.
 * Restricted to admin users.
 * @returns {Promise<object[]>} An array of all reservation objects with associated data.
 * @throws {Error} If database query fails.
 */
const getAllReservations = async () => {
  // Fetch all reservations with the same includes as getReservationById for consistency
  const reservations = await Reservation.findAll({
    include: [
      { model: ReservedSeat, include: [Seat] },
      { model: User, attributes: ['id', 'username'] },
      {
        model: Showtime,
        include: [
          { model: Movie, as: 'movie' },
          { model: Theater, as: 'theater' }
        ]
      }
    ],
    order: [['reservedAt', 'DESC']] // Optional: Order by reservation time
  });

  return reservations;
};

module.exports = {
  createReservation,
  getReservationById,
  cancelReservation,
  deleteReservation,
  getAllReservations, // Add getAllReservations
};
