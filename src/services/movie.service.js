const { Movie, Genre } = require('../models'); // Assuming index.js exports models
const { Op } = require('sequelize'); // Import Op for filtering

// Custom Error for Not Found
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Custom Error for Bad Request/Validation
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400;
    }
}


class MovieService {
  async getAllMovies(options = {}) {
    const queryOptions = {
        include: [{ model: Genre, as: 'genre', attributes: ['id', 'name'] }], // Select specific genre attributes
        where: {},
        // Add other defaults like limit, offset if needed
    };

    // Filtering by genreId
    if (options.genreId) {
        queryOptions.where.genreId = options.genreId;
    }

    // Add more filters here based on 'options' if necessary (e.g., title search)

    return Movie.findAll(queryOptions);
  }

  async getMovieById(id) {
    const movie = await Movie.findByPk(id, {
        include: [{ model: Genre, as: 'genre', attributes: ['id', 'name'] }]
    });
    if (!movie) {
      // Use custom error
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async #validateGenreExists(genreId) {
    if (genreId) {
        const genre = await Genre.findByPk(genreId);
        if (!genre) {
            // Use custom error
            throw new BadRequestError(`Genre with ID ${genreId} does not exist`);
        }
    } else {
        // Ensure genreId is provided if it's required by the model/schema
        throw new BadRequestError('Genre ID is required to create or update a movie.');
    }
  }

  async createMovie(movieData) {
    // Validate required fields (basic check, more robust validation can be added via middleware)
    if (!movieData.title || !movieData.description || !movieData.genreId) {
        throw new BadRequestError('Missing required fields: title, description, genreId');
    }
    // Check if genreId exists before creating
    await this.#validateGenreExists(movieData.genreId);
    return Movie.create(movieData);
  }

  async updateMovie(id, updateData) {
    const movie = await this.getMovieById(id); // Reuse getById to ensure movie exists and throw NotFoundError if not

    // If genreId is being updated, validate it exists
    if (updateData.genreId && updateData.genreId !== movie.genreId) {
        await this.#validateGenreExists(updateData.genreId);
    }

    // Prevent updating primary key or other restricted fields if necessary
    delete updateData.id;

    return movie.update(updateData);
  }

  async deleteMovie(id) {
    const movie = await this.getMovieById(id); // Reuse getById to ensure movie exists
    // The database schema (`schema.sql`) likely uses ON DELETE CASCADE for showtimes related to this movie.
    // If not, additional logic might be needed here to handle related entities.
    await movie.destroy();
    // No need to return a message here, controller will send 204 No Content
  }
}

module.exports = new MovieService();
// Export custom errors for the controller to catch
module.exports.NotFoundError = NotFoundError;
module.exports.BadRequestError = BadRequestError;
