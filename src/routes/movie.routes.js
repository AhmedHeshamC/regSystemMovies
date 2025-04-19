const express = require('express');
const movieController = require('../controllers/movie.controller');
// Ensure the correct middleware functions are imported
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// --- Public Routes ---
// GET /api/v1/movies - List all movies (optionally filter by ?genreId=)
router.get('/', movieController.getAllMovies);
// GET /api/v1/movies/:id - Get a specific movie by ID
router.get('/:id', movieController.getMovieById);

// --- Protected Admin Routes ---
// Ensure authenticateToken, isAdmin, and movieController.createMovie are functions
router.post('/', authenticateToken, isAdmin, movieController.createMovie);
// Ensure authenticateToken, isAdmin, and movieController.updateMovie are functions
router.put('/:id', authenticateToken, isAdmin, movieController.updateMovie);
// Ensure authenticateToken, isAdmin, and movieController.deleteMovie are functions
router.delete('/:id', authenticateToken, isAdmin, movieController.deleteMovie);


module.exports = router;
