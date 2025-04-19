const movieService = require('../services/movie.service');
// Import custom errors from the service
const { NotFoundError, BadRequestError } = require('../services/movie.service');

class MovieController {
  async getAllMovies(req, res, next) {
    try {
      // Extract genreId from query parameters for filtering
      const { genreId } = req.query;
      const options = {};
      if (genreId) {
          // Basic validation: ensure genreId is a number if provided
          if (isNaN(parseInt(genreId))) {
              throw new BadRequestError('Invalid Genre ID format for filtering.');
          }
          options.genreId = parseInt(genreId);
      }

      const movies = await movieService.getAllMovies(options);
      res.json(movies);
    } catch (error) {
      next(error); // Pass error to the central error handler
    }
  }

  async getMovieById(req, res, next) {
    try {
      const movieId = parseInt(req.params.id);
      if (isNaN(movieId)) {
          throw new BadRequestError('Invalid Movie ID format.');
      }
      const movie = await movieService.getMovieById(movieId);
      res.json(movie);
    } catch (error) {
      // Let the central error handler manage specific error types
      next(error);
    }
  }

  async createMovie(req, res, next) {
    try {
      // Basic validation can remain here, or use a dedicated validation middleware (like Joi or express-validator)
      const { title, description, poster_image_url, genreId } = req.body;
      if (!title || !description || !genreId) {
          // Service layer also validates, but early exit is good
          throw new BadRequestError('Missing required fields: title, description, genreId');
      }
      if (isNaN(parseInt(genreId))) {
          throw new BadRequestError('Invalid Genre ID format.');
      }

      const newMovieData = { title, description, poster_image_url, genreId: parseInt(genreId) };
      const newMovie = await movieService.createMovie(newMovieData);
      res.status(201).json(newMovie);
    } catch (error) {
      // Let the central error handler manage specific error types
      next(error);
    }
  }

  async updateMovie(req, res, next) {
    try {
      const movieId = parseInt(req.params.id);
      if (isNaN(movieId)) {
          throw new BadRequestError('Invalid Movie ID format.');
      }

      const updateData = req.body;
      // Ensure genreId is parsed if present
      if (updateData.genreId && isNaN(parseInt(updateData.genreId))) {
          throw new BadRequestError('Invalid Genre ID format.');
      }
      if (updateData.genreId) {
          updateData.genreId = parseInt(updateData.genreId);
      }

      const updatedMovie = await movieService.updateMovie(movieId, updateData);
      res.json(updatedMovie);
    } catch (error) {
      // Let the central error handler manage specific error types
      next(error);
    }
  }

  async deleteMovie(req, res, next) {
    try {
      const movieId = parseInt(req.params.id);
      if (isNaN(movieId)) {
          throw new BadRequestError('Invalid Movie ID format.');
      }
      await movieService.deleteMovie(movieId);
      res.status(204).send(); // Send 204 No Content for successful deletion
    } catch (error) {
      // Let the central error handler manage specific error types
      next(error);
    }
  }
}

module.exports = new MovieController();
