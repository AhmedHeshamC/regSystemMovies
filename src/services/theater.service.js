const { Theater, Showtime } = require('../models');
const { Op } = require('sequelize');

/**
 * Creates a new theater.
 * @param {object} theaterData - Data for the new theater { name, location, capacity }.
 * @returns {Promise<Theater>} - The created theater instance.
 * @throws {Error} - If validation fails or a database error occurs.
 */
const createTheater = async (theaterData) => {
    const { name, location, capacity } = theaterData;
    // Basic validation (more can be added)
    if (!name || !location || typeof capacity !== 'number' || capacity <= 0) {
        throw new Error('Invalid input data for creating theater.');
    }
    // Sequelize unique constraints will handle duplicate name/location if defined in the model
    return Theater.create({ name, location, capacity });
};

/**
 * Finds all theaters.
 * @returns {Promise<Theater[]>} - An array of theater instances.
 */
const findAllTheaters = async () => {
    return Theater.findAll({
        order: [['name', 'ASC']] // Order alphabetically by name
    });
};

/**
 * Finds a single theater by its ID.
 * Optionally includes associated showtimes.
 * @param {number} id - The ID of the theater.
 * @param {boolean} [includeShowtimes=false] - Whether to include associated showtimes.
 * @returns {Promise<Theater|null>} - The theater instance or null if not found.
 */
const findTheaterById = async (id, includeShowtimes = false) => {
    const options = {};
    if (includeShowtimes) {
        options.include = [{ model: Showtime, as: 'showtimes' }];
    }
    return Theater.findByPk(id, options);
};

/**
 * Updates an existing theater.
 * @param {number} id - The ID of the theater to update.
 * @param {object} updateData - Data to update { name, location, capacity }.
 * @returns {Promise<Theater|null>} - The updated theater instance or null if not found.
 * @throws {Error} - If validation fails or a database error occurs.
 */
const updateTheater = async (id, updateData) => {
    const theater = await Theater.findByPk(id);
    if (!theater) {
        return null; // Indicate theater not found
    }

    // Validate capacity if provided
    if (updateData.capacity !== undefined && (typeof updateData.capacity !== 'number' || updateData.capacity <= 0)) {
        throw new Error('Capacity must be a positive number.');
    }

    // Perform the update
    await theater.update(updateData);

    // Return the updated instance (re-fetching is not strictly necessary unless defaults changed)
    return theater;
    // Alternative: return findTheaterById(id); // If you need to re-fetch with associations
};

/**
 * Deletes a theater by its ID.
 * Note: Consider implications if the theater has associated showtimes (e.g., prevent deletion or cascade).
 * The current setup relies on foreign key constraints (e.g., ON DELETE RESTRICT or SET NULL).
 * @param {number} id - The ID of the theater to delete.
 * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
 * @throws {Error} - If deletion fails due to constraints or other errors.
 */
const deleteTheater = async (id) => {
    const theater = await Theater.findByPk(id);
    if (!theater) {
        return false; // Theater not found
    }
    try {
        await theater.destroy();
        return true;
    } catch (error) {
        // Handle potential foreign key constraint errors if showtimes exist
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            console.error(`Cannot delete theater ${id} as it has associated showtimes.`);
            throw new Error(`Cannot delete theater as it has associated showtimes. Please delete or reassign showtimes first.`);
        }
        console.error(`Error deleting theater with id=${id}:`, error);
        throw error; // Re-throw other errors
    }
};

module.exports = {
    createTheater,
    findAllTheaters,
    findTheaterById,
    updateTheater,
    deleteTheater,
};
