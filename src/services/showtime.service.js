const { Showtime, Movie, Theater, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Checks if a proposed showtime overlaps with existing showtimes in the same theater.
 * @param {number} theaterId - The ID of the theater.
 * @param {Date} startTime - The proposed start time.
 * @param {Date} endTime - The proposed end time.
 * @param {number} [excludeShowtimeId=null] - An optional showtime ID to exclude from the check (used for updates).
 * @returns {Promise<boolean>} - True if there is an overlap, false otherwise.
 */
const checkOverlap = async (theaterId, startTime, endTime, excludeShowtimeId = null) => {
    const whereClause = {
        theaterId: theaterId,
        [Op.or]: [
            { // Existing showtime starts during the new showtime
                startTime: {
                    [Op.lt]: endTime,
                    [Op.gt]: startTime
                }
            },
            { // Existing showtime ends during the new showtime
                endTime: {
                    [Op.lt]: endTime,
                    [Op.gt]: startTime
                }
            },
            { // Existing showtime completely contains the new showtime
                [Op.and]: [
                    { startTime: { [Op.lte]: startTime } },
                    { endTime: { [Op.gte]: endTime } }
                ]
            },
             { // New showtime completely contains the existing showtime (should be covered by the first two, but explicit for clarity)
                [Op.and]: [
                    { startTime: { [Op.gte]: startTime } },
                    { endTime: { [Op.lte]: endTime } }
                ]
            }
        ]
    };

    if (excludeShowtimeId) {
        whereClause.id = { [Op.ne]: excludeShowtimeId };
    }

    const overlappingShowtime = await Showtime.findOne({ where: whereClause });
    return !!overlappingShowtime; // Return true if an overlapping showtime is found
};


/**
 * Creates a new showtime after validating movie/theater existence and checking for overlaps.
 * @param {object} showtimeData - Data for the new showtime { movieId, theaterId, startTime, endTime }.
 * @returns {Promise<Showtime>} - The created showtime instance.
 * @throws {Error} - If movie/theater not found or if there's an overlap.
 */
const createShowtime = async (showtimeData) => {
    const { movieId, theaterId, startTime, endTime } = showtimeData;

    // Validate input times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        throw new Error('Invalid start or end time.');
    }

    // Check if Movie and Theater exist
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
        throw new Error('Movie not found.');
    }
    const theater = await Theater.findByPk(theaterId);
    if (!theater) {
        throw new Error('Theater not found.');
    }

    // Check for overlaps
    const hasOverlap = await checkOverlap(theaterId, start, end);
    if (hasOverlap) {
        throw new Error('Showtime overlaps with an existing showtime in this theater.');
    }

    // Create the showtime
    const newShowtime = await Showtime.create({
        movieId,
        theaterId,
        startTime: start,
        endTime: end,
    });

    return newShowtime;
};

/**
 * Finds all showtimes, optionally filtering by movie or theater.
 * Includes associated Movie and Theater data.
 * @param {object} filters - Optional filters { movieId, theaterId, date }.
 * @returns {Promise<Showtime[]>} - An array of showtime instances.
 */
const findAllShowtimes = async (filters = {}) => {
    const whereClause = {};
    if (filters.movieId) {
        whereClause.movieId = filters.movieId;
    }
    if (filters.theaterId) {
        whereClause.theaterId = filters.theaterId;
    }
     if (filters.date) {
        // Filter showtimes starting on a specific date
        const targetDate = new Date(filters.date);
        if (!isNaN(targetDate.getTime())) {
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
            whereClause.startTime = {
                [Op.gte]: startOfDay,
                [Op.lte]: endOfDay,
            };
        }
    }


    return Showtime.findAll({
        where: whereClause,
        include: [
            { model: Movie, as: 'movie', attributes: ['id', 'title', 'poster_image_url'] }, // Select specific attributes
            { model: Theater, as: 'theater', attributes: ['id', 'name', 'location'] } // Select specific attributes
        ],
        order: [['startTime', 'ASC']] // Order by start time
    });
};

/**
 * Finds a single showtime by its ID.
 * Includes associated Movie and Theater data.
 * @param {number} id - The ID of the showtime.
 * @returns {Promise<Showtime|null>} - The showtime instance or null if not found.
 */
const findShowtimeById = async (id) => {
    return Showtime.findByPk(id, {
        include: [
            { model: Movie, as: 'movie' },
            { model: Theater, as: 'theater' }
        ]
    });
};

/**
 * Updates an existing showtime.
 * Checks for overlaps before updating.
 * @param {number} id - The ID of the showtime to update.
 * @param {object} updateData - Data to update { movieId, theaterId, startTime, endTime }.
 * @returns {Promise<Showtime|null>} - The updated showtime instance or null if not found.
 * @throws {Error} - If movie/theater not found or if there's an overlap.
 */
const updateShowtime = async (id, updateData) => {
    const showtime = await Showtime.findByPk(id);
    if (!showtime) {
        return null; // Or throw an error
    }

    // Use existing values if not provided in updateData
    const newStartTime = updateData.startTime ? new Date(updateData.startTime) : showtime.startTime;
    const newEndTime = updateData.endTime ? new Date(updateData.endTime) : showtime.endTime;
    const newTheaterId = updateData.theaterId !== undefined ? updateData.theaterId : showtime.theaterId;
    const newMovieId = updateData.movieId !== undefined ? updateData.movieId : showtime.movieId;

    // Validate times
     if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime()) || newStartTime >= newEndTime) {
        throw new Error('Invalid start or end time.');
    }

    // Validate Movie and Theater if changed
    if (updateData.movieId !== undefined && updateData.movieId !== showtime.movieId) {
        const movie = await Movie.findByPk(newMovieId);
        if (!movie) throw new Error('Movie not found.');
    }
     if (updateData.theaterId !== undefined && updateData.theaterId !== showtime.theaterId) {
        const theater = await Theater.findByPk(newTheaterId);
        if (!theater) throw new Error('Theater not found.');
    }

    // Check for overlaps, excluding the current showtime being updated
    const hasOverlap = await checkOverlap(newTheaterId, newStartTime, newEndTime, id);
    if (hasOverlap) {
        throw new Error('Updated showtime overlaps with an existing showtime in this theater.');
    }

    // Perform the update
    await showtime.update({
        movieId: newMovieId,
        theaterId: newTheaterId,
        startTime: newStartTime,
        endTime: newEndTime,
    });

    // Re-fetch to include associations if needed, or return the updated instance
    return findShowtimeById(id); // Re-fetch to get updated associations if they changed
};


/**
 * Deletes a showtime by its ID.
 * @param {number} id - The ID of the showtime to delete.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 */
const deleteShowtime = async (id) => {
    const showtime = await Showtime.findByPk(id);
    if (!showtime) {
        return false;
    }
    await showtime.destroy();
    return true;
};


module.exports = {
    createShowtime,
    findAllShowtimes,
    findShowtimeById,
    updateShowtime,
    deleteShowtime,
    checkOverlap // Exporting for potential use elsewhere, e.g., validation layer
};
