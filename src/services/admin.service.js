const { Showtime, Reservation, User, ReservedSeat, Seat, Movie, Theater, sequelize } = require('../models'); // Adjust path as needed
const { Op } = require('sequelize');

class AdminService {
    /**
     * Gets all reservations for a specific showtime, including user details.
     * @param {number} showtimeId - The ID of the showtime.
     * @returns {Promise<Array>} - A promise that resolves to an array of reservations.
     */
    async getReservationsByShowtime(showtimeId) {
        const showtimeExists = await Showtime.findByPk(showtimeId);
        if (!showtimeExists) {
            const error = new Error('Showtime not found');
            error.status = 404;
            throw error;
        }

        const reservations = await Reservation.findAll({
            where: { showtime_id: showtimeId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username'] // Only include necessary user fields
                },
                {
                    model: ReservedSeat,
                    as: 'ReservedSeats', // Corrected alias: Use uppercase 'S'
                    include: [{
                        model: Seat,
                        attributes: ['row', 'number'] // Corrected: Use 'row' and 'number' as defined in Seat model
                    }],
                    attributes: [] // Exclude attributes from the junction table itself if not needed directly
                }
            ],
            attributes: ['id', 'status', 'reserved_at'] // Corrected: Request reserved_at instead of created_at/updated_at
        });

        // Format the response to match the desired structure
        return reservations.map(reservation => {
            const plainReservation = reservation.get({ plain: true });
            return {
                id: plainReservation.id,
                user: plainReservation.User,
                // Use optional chaining and nullish coalescing for safety
                // If ReservedSeats is undefined/null, default to an empty array
                seats: plainReservation.ReservedSeats?.map(rs => rs.Seat) ?? [],
                status: plainReservation.status,
                reserved_at: plainReservation.reserved_at, // Corrected: Use reserved_at
                // removed created_at and updated_at as they don't exist
            };
        });
    }

    /**
     * Generates a report on seat capacity and occupancy per showtime/movie for a given date.
     * @param {string} date - The date in 'YYYY-MM-DD' format.
     * @returns {Promise<Array>} - A promise that resolves to an array of capacity report objects.
     */
    async getCapacityReport(date) {
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);

        // This query is complex and might need optimization depending on the DB load
        // It calculates total seats per theater and reserved seats per showtime
        const report = await Showtime.findAll({
            where: {
                start_time: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Movie,
                    as: 'movie', // Added alias
                    attributes: ['title']
                },
                {
                    model: Theater,
                    as: 'theater', // Added alias
                    attributes: ['name', 'capacity'] // Corrected: Use 'capacity' instead of 'total_seats'
                },
                {
                    model: Reservation,
                    as: 'Reservations', // Added alias (assuming this is the correct alias)
                    where: { status: 'confirmed' },
                    required: false,
                    include: [{
                        model: ReservedSeat,
                        as: 'ReservedSeats', // Corrected alias
                        attributes: []
                    }],
                    attributes: []
                }
            ],
            attributes: [
                'id',
                'start_time',
                // Ensure COUNT uses the correct aliases
                [sequelize.fn('COUNT', sequelize.col('Reservations.ReservedSeats.id')), 'reserved_seats_count']
            ],
            group: [
                'Showtime.id',
                'movie.id', // Use alias in group by
                'theater.id' // Use alias in group by
            ],
            order: [['start_time', 'ASC']]
        });

        // Format the results
        return report.map(showtime => {
            const plainShowtime = showtime.get({ plain: true });
            // Access properties using aliases
            const totalSeats = plainShowtime.theater?.capacity || 0; // Corrected: Use 'capacity'
            const reservedSeats = parseInt(plainShowtime.reserved_seats_count || 0, 10);
            const occupancy = totalSeats > 0 ? (reservedSeats / totalSeats) * 100 : 0;

            return {
                showtime_id: plainShowtime.id,
                movie_title: plainShowtime.movie?.title || 'N/A', // Use alias
                theater_name: plainShowtime.theater?.name || 'N/A', // Use alias
                start_time: plainShowtime.start_time,
                total_seats: totalSeats,
                reserved_seats: reservedSeats,
                occupancy_percent: parseFloat(occupancy.toFixed(2))
            };
        });
    }
}

module.exports = new AdminService();
