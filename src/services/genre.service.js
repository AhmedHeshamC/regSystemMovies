// src/services/genre.service.js
const { Genre } = require('../models');
const createError = require('http-errors');

/**
 * Creates a new genre.
 * @param {string} name - The name of the genre.
 * @returns {Promise<Genre>} The created genre object.
 * @throws {Error} If a genre with the same name already exists or on database error.
 */
const createGenre = async (name) => {
  try {
    const [genre, created] = await Genre.findOrCreate({
      where: { name },
      defaults: { name },
    });
    if (!created) {
      throw createError(409, 'Genre with this name already exists.');
    }
    return genre;
  } catch (error) {
    if (error.status === 409) throw error; // Re-throw conflict error
    console.error('Error creating genre:', error);
    throw createError(500, 'Failed to create genre.');
  }
};

/**
 * Retrieves all genres.
 * @returns {Promise<Genre[]>} A list of all genres.
 * @throws {Error} On database error.
 */
const getAllGenres = async () => {
  try {
    const genres = await Genre.findAll({
        order: [['name', 'ASC']] // Optional: order alphabetically
    });
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw createError(500, 'Failed to retrieve genres.');
  }
};

/**
 * Finds a genre by its ID.
 * @param {number} genreId - The ID of the genre.
 * @returns {Promise<Genre>} The found genre object.
 * @throws {Error} If the genre is not found or on database error.
 */
const getGenreById = async (genreId) => {
    try {
        const genre = await Genre.findByPk(genreId);
        if (!genre) {
            throw createError(404, 'Genre not found.');
        }
        return genre;
    } catch (error) {
        if (error.status === 404) throw error; // Re-throw not found error
        console.error(`Error fetching genre with ID ${genreId}:`, error);
        throw createError(500, 'Failed to retrieve genre.');
    }
};


/**
 * Updates an existing genre.
 * @param {number} genreId - The ID of the genre to update.
 * @param {string} name - The new name for the genre.
 * @returns {Promise<Genre>} The updated genre object.
 * @throws {Error} If the genre is not found, name conflict occurs, or on database error.
 */
const updateGenre = async (genreId, name) => {
  try {
    const genre = await getGenreById(genreId); // Reuse getById to check existence

    // Check if another genre already has the new name
    const existingGenre = await Genre.findOne({ where: { name } });
    if (existingGenre && existingGenre.id !== genreId) {
        throw createError(409, 'Another genre with this name already exists.');
    }

    genre.name = name;
    await genre.save();
    return genre;
  } catch (error) {
    if (error.status === 404 || error.status === 409) throw error; // Re-throw known errors
    console.error(`Error updating genre with ID ${genreId}:`, error);
    throw createError(500, 'Failed to update genre.');
  }
};

/**
 * Deletes a genre by its ID.
 * @param {number} genreId - The ID of the genre to delete.
 * @returns {Promise<void>}
 * @throws {Error} If the genre is not found or on database error.
 */
const deleteGenre = async (genreId) => {
  try {
    const genre = await getGenreById(genreId); // Reuse getById to check existence
    await genre.destroy();
  } catch (error) {
    if (error.status === 404) throw error; // Re-throw not found error
    console.error(`Error deleting genre with ID ${genreId}:`, error);
    // Note: Depending on DB constraints (ON DELETE RESTRICT/SET NULL on movies),
    // deletion might fail if movies reference this genre. Sequelize might throw a ForeignKeyConstraintError.
    // Handle specific constraint errors if needed.
    throw createError(500, 'Failed to delete genre.');
  }
};

module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
};
