// src/routes/genre.routes.js
const express = require('express');
const genreController = require('../controllers/genre.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');
const { genreValidationRules, handleValidationErrors } = require('../validation.utils');

const router = express.Router();

// POST /genres - Create a new genre (Admin only)
router.post(
  '/',
  authenticateToken,
  isAdmin,
  genreValidationRules(),
  handleValidationErrors,
  genreController.createGenre
);

// GET /genres - List all genres (Public)
router.get('/', genreController.getAllGenres);

// GET /genres/:genreId - Get a specific genre (Public)
// Note: Added this based on common REST patterns, though not explicitly in the design doc's list.
// If not needed, it can be removed.
router.get('/:genreId', genreController.getGenreById);

// PUT /genres/:genreId - Update a genre (Admin only)
router.put(
  '/:genreId',
  authenticateToken,
  isAdmin,
  genreValidationRules(),
  handleValidationErrors,
  genreController.updateGenre
);

// DELETE /genres/:genreId - Delete a genre (Admin only)
router.delete(
  '/:genreId',
  authenticateToken,
  isAdmin,
  genreController.deleteGenre
);

module.exports = router;
